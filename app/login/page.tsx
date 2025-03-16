'use client';

import React, { useState, useEffect } from 'react';
import { Bell, FileText, Upload, X, CheckCircle, AlertCircle, Clock, Trash, Download, Star, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import MySideBar from './ui/sideBar';
import PreUploadChecker from '../components/PreUploadChecker';
import SimilarityReport from '../components/SimilarityReport';
import SimilarityReportModal from '../components/SimilarityReportModal';

function App() {
  const [user, setUser] = useState<any>(null);
  const [memoires, setMemoires] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [similarityData, setSimilarityData] = useState(null);
  const [selectedMemoire, setSelectedMemoire] = useState(null);
  const [showSimilarityReport, setShowSimilarityReport] = useState(false);
  const [newMemoire, setNewMemoire] = useState({
    libelle: '',
    annee: new Date().getFullYear().toString(),
    cycle: 'Bachelor',
    speciality: '',
    university: '',
    description: '',
    mention: '',
    file: null as File | null,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchMemoires(userData.user.id_etudiant);
    }
  }, []);

  const fetchMemoires = async (userId: string) => {
    try {
      if (!userId) {
        console.error("ID étudiant manquant");
        return;
      }
  
      const response = await fetch(`http://localhost:5000/api/memoire/etudiant/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur serveur (${response.status})`);
      }
  
      const data = await response.json();
      
      // Handle both response formats (array or object with memoire property)
      if (Array.isArray(data)) {
        setMemoires(data);
      } else if (data && data.success && Array.isArray(data.memoire)) {
        setMemoires(data.memoire);
      } else {
        console.error('Format de données inattendu:', data);
        setMemoires([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des mémoires:', error);
      setMemoires([]);
    }
  };

  const fetchSimilarityReport = async (memoireId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/memoire/${memoireId}/similarity`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.info("No similarity report available for this thesis");
          return null;
        }
        throw new Error(`Server error (${response.status})`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching similarity report:', error);
      toast.error('Failed to load similarity report');
      return null;
    }
  };

  // Add this with the other state declarations at the top of the component
  const [detailedData, setDetailedData] = useState(null);
  
  const handleViewSimilarityReport = async (memoire) => {
    try {
      setSelectedMemoire(memoire);
      const response = await fetch(`http://localhost:5000/api/memoire/${memoire.id_memoire}/similarity`);
      
      if (!response.ok) {
        throw new Error(`Server error (${response.status})`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Utiliser le bon pourcentage de similarité depuis la réponse
        const processedData = {
          similarity: data.similarity || data.percentage || 0, // Prendre la valeur correcte
          matches: data.results.map(result => ({
            sourceText: result.sourceText || '',
            targetText: result.targetText || '',
            similarity: result.similarity || 0,
            sourcePage: result.sourcePage,
            targetPage: result.targetPage,
            matchingPhrases: result.matchingPhrases || []
          })),
          targetMemoireTitle: data.targetMemoireTitle || 'Document de référence',
          sourceMemoireTitle: memoire.libelle
        };
  
        console.log('Similarity Data:', data); // Pour déboguer
        setDetailedData(processedData);
        setShowSimilarityReport(true);
      } else {
        toast.info(`Aucun rapport disponible pour "${memoire.libelle}"`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement du rapport');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setNewMemoire(prev => ({ ...prev, file }));
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleSimilarityResult = (data) => {
    setSimilarityData(data);
    
    // Show toast based on similarity level
    if (data.status.level === 'danger') {
      toast.error(`High similarity detected: ${data.status.percentage.toFixed(1)}%`);
    } else if (data.status.level === 'warning') {
      toast.warning(`Moderate similarity detected: ${data.status.percentage.toFixed(1)}%`);
    } else {
      toast.success(`Low similarity detected: ${data.status.percentage.toFixed(1)}%`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

      // Check if similarity data exists and exceeds danger threshold
    if (similarityData?.status?.level === 'danger') {
      toast.error(`Soumission impossible : Le taux de similarité (${similarityData.status.percentage}%) dépasse le seuil autorisé (${similarityData.status.similarity_danger_threshold}%)`);
      return;
    }
    
    if (!newMemoire.file) {
      toast.error('Veuillez sélectionner un fichier PDF');
      return;
    }
  
    setIsSubmitting(true);
    
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        toast.error('Session expirée, veuillez vous reconnecter');
        return;
      }
  
      const userData = JSON.parse(storedUser);
      const formData = new FormData();
      formData.append('libelle', newMemoire.libelle);
      formData.append('annee', newMemoire.annee);
      formData.append('cycle', newMemoire.cycle);
      formData.append('speciality', newMemoire.speciality);
      formData.append('university', newMemoire.university);
      formData.append('description', newMemoire.description);
      formData.append('mention', newMemoire.mention);
      formData.append('file', newMemoire.file);
      formData.append('id_etudiant', userData.user.id_etudiant);
      formData.append('status', 'pending');
  
      const response = await fetch('http://localhost:5000/api/memoire/memoire', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Erreur lors de la soumission'
        }));
        throw new Error(errorData.message || 'Erreur lors de la soumission');
      }
  
      const data = await response.json().catch(() => ({
        success: true,
        message: 'Mémoire soumis avec succès'
      }));
  
      toast.success(data.message || 'Mémoire soumis avec succès!');
      setShowForm(false);
      
      if (userData.user && userData.user.id_etudiant) {
        fetchMemoires(userData.user.id_etudiant);
      } else {
        console.error('ID étudiant manquant');
        toast.error('Erreur lors du rafraîchissement des données');
      }
      
      setNewMemoire({
        libelle: '',
        annee: new Date().getFullYear().toString(),
        cycle: 'Bachelor',
        speciality: '',
        university: '',
        description: '',
        mention: '',
        file: null,
      });
      setFilePreview(null);
      setSimilarityData(null);
  
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur inattendue est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMemoire = async (memoireId: string) => {
    try {
      const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer ce mémoire ?');
      if (!confirmed) return;
  
      const response = await fetch(`http://localhost:5000/api/memoire/${memoireId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la suppression');
      }
  
      if (data.success) {
        toast.success('Mémoire supprimé avec succès');
        // Refresh the memoires list
        if (user?.user?.id_etudiant) {
          await fetchMemoires(user.user.id_etudiant);
        }
      } else {
        throw new Error(data.message || 'Erreur lors de la suppression');
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression du mémoire');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="text-green-500" />;
      case 'rejected':
        return <X className="text-red-500" />;
      default:
        return <Clock className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredMemoires = memoires.filter(memoire => 
    memoire.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memoire.speciality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <MySideBar />
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Welcome {user?.user?.name || 'Student'}!
            </h2>
            <p className="text-gray-600 mt-2">Manage your academic works and publications</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          >
            <Upload className="mr-2" size={20} />
            Submit New Thesis
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Submit New Thesis</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Add Pre-upload similarity checker */}
              <PreUploadChecker onSimilarityResult={handleSimilarityResult} />

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="libelle"
                      value={newMemoire.libelle}
                      onChange={(e) => setNewMemoire(prev => ({ ...prev, libelle: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      type="number"
                      name="annee"
                      value={newMemoire.annee}
                      onChange={(e) => setNewMemoire(prev => ({ ...prev, annee: e.target.value }))}
                      min={2000}
                      max={2100}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cycle
                    </label>
                    <select
                      name="cycle"
                      value={newMemoire.cycle}
                      onChange={(e) => setNewMemoire(prev => ({ ...prev, cycle: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    >
                      <option value="Bachelor">Bachelor</option>
                      <option value="Master">Master</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Speciality
                      </label>
                      <select
                        name="speciality"
                        value={newMemoire.speciality}
                        onChange={(e) => setNewMemoire(prev => ({ ...prev, speciality: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        required
                      >
                        <option value="">Sélectionnez une spécialité</option>
                        <option value="Genie Logiciel">Génie Logiciel</option>
                        <option value="Reseaux">Réseaux</option>
                        <option value="Securiter">Sécurité</option>
                        
                      </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      University
                    </label>
                    <input
                      type="text"
                      name="university"
                      value={newMemoire.university}
                      onChange={(e) => setNewMemoire(prev => ({ ...prev, university: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newMemoire.description}
                      onChange={(e) => setNewMemoire(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                       Mention
                    </label>
                    <select
                          name="mention"
                          value={newMemoire.mention}
                          onChange={(e) => setNewMemoire(prev => ({ ...prev, mention: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          required
                        >
                          <option value="">Sélectionnez une mention</option>
                          <option value="Passable">Passable</option>
                          <option value="Bien">Bien</option>
                          <option value="Tres Bien">Tres Bien</option>
                          <option value="Excellent">Excellent</option>
                    </select>
                  </div>
                 </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PDF File
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
                    <div className="space-y-1 text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            name="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="sr-only"
                            required
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF up to 10MB
                        <br />
                        <span className="text-blue-500">Your thesis will be automatically analyzed for similarity</span>
                      </p>
                    </div>
                  </div>
                  {filePreview && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Selected file: {newMemoire.file?.name}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || (similarityData && similarityData.status.level === 'danger')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Thesis'}
                  </button>
                </div>
                
                {similarityData && similarityData.status.level === 'danger' && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      <span>High similarity detected - Please revise your thesis before submission</span>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
        
        {/* Show similarity report modal */}
        {showSimilarityReport && selectedMemoire && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Rapport de similarité: {selectedMemoire.libelle}
                </h3>
                <button
                  onClick={() => setShowSimilarityReport(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <SimilarityReportModal
                isOpen={showSimilarityReport}
                onClose={() => setShowSimilarityReport(false)}
                similarityData={detailedData}
                documentTitle={selectedMemoire.libelle}
              />
            </div>
          </div>
        )}

        <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-xl border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search theses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Year</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Cycle</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Speciality</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">University</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Mention</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMemoires.map((memoire) => (
                  <tr key={memoire.id_memoire} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        {memoire.libelle}
                      </div>
                    </td>
                    <td className="px-6 py-4">{new Date(memoire.date_soumission).getFullYear()}</td>
                    <td className="px-6 py-4">{memoire.cycle}</td>
                    <td className="px-6 py-4">{memoire.speciality}</td>
                    <td className="px-6 py-4">{memoire.university}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(memoire.status)}`}>
                        {getStatusIcon(memoire.status)}
                        <span className="ml-2 capitalize">{memoire.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {memoire.mention || 'Non noté'}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <a
                          href={`http://localhost:5000/${memoire.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download size={20} />
                        </a>
                        <button
                          onClick={() => handleViewSimilarityReport(memoire)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Similarity Report"
                        >
                          <AlertCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteMemoire(memoire.id_memoire)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
