'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Upload, X, CheckCircle, AlertCircle, Clock, Trash, Download, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import MySideBar from './ui/sideBar';
import PreUploadChecker from '../components/PreUploadChecker';
import SimilarityReportModal from '../components/SimilarityReportModal';
import { getApiUrl } from '../utils/config';
import { useRouter } from 'next/navigation';

interface Memoire {
  id_memoire: string;
  libelle: string;
  date_soumission: string;
  cycle: string;
  speciality: string;
  university: string;
  status: string;
  mention: string;
  file_path: string;
}

interface User {
  user: {
    id_etudiant: string;
    name: string;
  };
}

interface NewMemoire {
  libelle: string;
  annee: string;
  cycle: string;
  speciality: string;
  university: string;
  description: string;
  mention: string;
  file: File | null;
}

// Mise à jour pour correspondre avec PreUploadChecker
interface SimilarityResultItem {
  id_memoire: number;
  name: string;
  similarity: number;
  author: string;
  submissionDate: string;
}

interface SimilarityStatus {
  level: 'danger' | 'warning' | 'success';
  message: string;
  color: string;
  percentage: number;
  similarity_warning_threshold: number;
  similarity_danger_threshold: number;
}

interface SimilarityResult {
  status: SimilarityStatus;
  results: SimilarityResultItem[];
}


// Interface pour les résultats de similarité détaillés
interface SimilarityMatchResult {
  sourceText?: string;
  targetText?: string;
  similarity: number;
  sourcePage?: number;
  targetPage?: number;
  matchingPhrases?: string[];
}

function App() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [memoires, setMemoires] = useState<Memoire[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [similarityData, setSimilarityData] = useState<SimilarityResult | null>(null);
  const [selectedMemoire, setSelectedMemoire] = useState<Memoire | null>(null);
  const [verifiedFileHash, setVerifiedFileHash] = useState<string | null>(null);
  const [isFileVerified, setIsFileVerified] = useState(false);
  const [showSimilarityReport, setShowSimilarityReport] = useState(false);
  const [detailedData, setDetailedData] = useState<DetailedSimilarityData | null>(null);
  
  const [newMemoire, setNewMemoire] = useState<NewMemoire>({
    libelle: '',
    annee: new Date().getFullYear().toString(),
    cycle: 'Bachelor',
    speciality: '',
    university: '',
    description: '',
    mention: '',
    file: null,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser) as User;
        setUser(userData);
        fetchMemoires(userData.user.id_etudiant);
      } catch (error) {
        console.error("Erreur lors du parsing des données utilisateur:", error);
        toast.error("Session invalide. Veuillez vous reconnecter.");
      }
    }
  }, []);

  const handleFileVerified = (fileHash: string) => {
    setVerifiedFileHash(fileHash);
    setIsFileVerified(true);
  };

  const fetchMemoires = async (userId: string) => {
    try {
      if (!userId) {
        console.error("ID étudiant manquant");
        return;
      }
  
      const response = await fetch(getApiUrl(`/api/memoire/etudiant/${userId}`));
      
      if (!response.ok) {
        throw new Error(`Erreur serveur (${response.status})`);
      }
  
      const data = await response.json();
      
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

  // Update the DetailedSimilarityData interface
  interface DetailedSimilarityData {
    sourceText?: string;
    targetText?: string;
    similarity: number;
    sourceMemoireTitle: string;
    targetMemoireTitle: string;
    matches: Array<{
      sourceText: string;
      targetText: string;
      similarity: number;
      sourcePage?: number;
      targetPage?: number;
      matchingPhrases?: Array<{
        text: string;
        sourceIndex: number;
        targetIndex: number;
      }>;
    }>;
  }
  
  // Update the handleViewSimilarityReport function to match the new type
  const handleViewSimilarityReport = async (memoire: Memoire) => {
    try {
      setSelectedMemoire(memoire);
      const response = await fetch(getApiUrl(`/api/memoire/${memoire.id_memoire}/similarity`));
      
      if (!response.ok) {
        throw new Error(`Server error (${response.status})`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const processedData: DetailedSimilarityData = {
          similarity: data.similarity || data.percentage || 0,
          matches: Array.isArray(data.results) ? data.results.map((result: SimilarityMatchResult) => ({
            sourceText: result.sourceText || '',
            targetText: result.targetText || '',
            similarity: result.similarity || 0,
            sourcePage: result.sourcePage || 0,
            targetPage: result.targetPage || 0,
            matchingPhrases: result.matchingPhrases?.map(phrase => ({
              text: phrase,
              sourceIndex: 0,
              targetIndex: 0
            })) || []
          })) : [],
          targetMemoireTitle: data.targetMemoireTitle || 'Document de référence',
          sourceMemoireTitle: memoire.libelle
        };
  
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
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setIsFileVerified(false);
      setVerifiedFileHash(null);
      setSimilarityData(null);
      
      setNewMemoire(prev => ({ ...prev, file }));
      setFilePreview(URL.createObjectURL(file));
      
      toast.info('⚠️ Please verify your document using the checker above', {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  // Corrigé pour accepter SimilarityResult au lieu de SimilarityData
  const handleSimilarityResult = (data: SimilarityResult) => {
    setSimilarityData(data);
    
    if (data.status.level === 'danger') {
      toast.error(`High similarity detected: ${data.status.percentage.toFixed(1)}%`);
    } else if (data.status.level === 'warning') {
      toast.warning(`Moderate similarity detected: ${data.status.percentage.toFixed(1)}%`);
    } else {
      toast.success(`Low similarity detected: ${data.status.percentage.toFixed(1)}%`);
    }
  };

  const resetFormStates = () => {
    setNewMemoire({
      libelle: '',
      annee: new Date().getFullYear().toString(),
      cycle: 'Bachelor',
      speciality: '',
      university: '',
      description: '',
      mention: '',
      file: null
    });
    setFilePreview(null);
    setIsFileVerified(false);
    setVerifiedFileHash(null);
    setSimilarityData(null);
    setIsSubmitting(false);
  };
  
  const calculateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!isFileVerified) {
      toast.error('Veuillez vérifier votre document avant de le soumettre');
      return;
    }
  
    if (similarityData?.status?.level === 'danger') {
      toast.error(`Soumission impossible : Le taux de similarité (${similarityData.status.percentage}%) dépasse le seuil autorisé (${similarityData.status.similarity_danger_threshold}%)`);
      return;
    }
    
    if (!newMemoire.file) {
      toast.error('Veuillez sélectionner un fichier PDF');
      return;
    }

    const currentFileHash = await calculateFileHash(newMemoire.file);
    if (currentFileHash !== verifiedFileHash) {
      toast.error('Le document soumis est différent de celui vérifié. Veuillez revérifier votre document.');
      return;
    }
  
    setIsSubmitting(true);
    
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        toast.error('Session expirée, veuillez vous reconnecter');
        return;
      }
  
      const userData = JSON.parse(storedUser) as User;
      const formData = new FormData();
      formData.append('libelle', newMemoire.libelle);
      formData.append('annee', newMemoire.annee);
      formData.append('cycle', newMemoire.cycle);
      formData.append('speciality', newMemoire.speciality);
      formData.append('university', newMemoire.university);
      formData.append('description', newMemoire.description);
      formData.append('mention', newMemoire.mention);
      if (newMemoire.file) {
        formData.append('file', newMemoire.file);
      }
      formData.append('id_etudiant', userData.user.id_etudiant);
      formData.append('status', 'pending');
  
      const response = await fetch(getApiUrl('/api/memoire/memoire'), {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Erreur lors de la soumission'
        }));
        throw new Error(errorData.message || 'Erreur lors de la soumission');
      }
  
      const data = await response.json();
  
      toast.success(data.message || 'Mémoire soumis avec succès!');
      setShowForm(false);
      resetFormStates();
      
      if (userData.user && userData.user.id_etudiant) {
        fetchMemoires(userData.user.id_etudiant);
      } else {
        console.error('ID étudiant manquant');
        toast.error('Erreur lors du rafraîchissement des données');
      }
      
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
  
      const response = await fetch(getApiUrl(`/api/memoire/${memoireId}`), {
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
        if (user?.user?.id_etudiant) {
          await fetchMemoires(user.user.id_etudiant);
        }
      } else {
        throw new Error(data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression du mémoire');
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
      <div className="lg:ml-64 p-4 md:p-8 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Welcome {user?.user?.name || 'Student'}!
            </h2>
            <p className="text-gray-600 mt-2">Manage your academic works and publications</p>
          </div>
          <button
            onClick={() => router.push('/submit-thesis')}
            className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
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

              <PreUploadChecker 
                onSimilarityResult={handleSimilarityResult} 
                onFileVerified={handleFileVerified}
              />

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
                      <option value="Securité">Sécurité</option>
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
                    className={`px-6 py-3 text-white rounded-xl hover:shadow-lg transition-all duration-200 ${
                      !isFileVerified 
                        ? 'bg-yellow-500 hover:bg-yellow-600' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-[1.02]'
                    } disabled:opacity-50`}
                    onClick={(e) => {
                      if (!isFileVerified) {
                        e.preventDefault();
                        toast.warning('⚠️ Veuillez d\'abord vérifier votre document avec le vérificateur ci-dessus', {
                          position: "top-center",
                          autoClose: 5000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                        });
                        return;
                      }
                      if (similarityData?.status?.level === 'danger') {
                        e.preventDefault();
                        toast.error('❌ Le taux de similarité est trop élevé pour soumettre ce document');
                        return;
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting 
                      ? 'Soumission en cours...' 
                      : !isFileVerified 
                        ? '⚠️ Vérifier le document' 
                        : similarityData?.status?.level === 'danger'
                          ? '❌ Similarité trop élevée'
                          : 'Soumettre le mémoire'
                    }
                  </button>
                </div>

                {!isFileVerified && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-600">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      <span>Please verify your document using the checker above before submitting</span>
                    </div>
                  </div>
                )}
                
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
                data={detailedData as DetailedSimilarityData}
                onClose={() => setShowSimilarityReport(false)}
              />
            </div>
          </div>
        )}

        <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-xl border border-gray-100">
          <div className="p-4 md:p-6 border-b border-gray-100">
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
                  <th className="px-3 md:px-6 py-4 text-left text-sm font-semibold text-gray-600">Title</th>
                  <th className="hidden md:table-cell px-6 py-4 text-left text-sm font-semibold text-gray-600">Year</th>
                  <th className="hidden md:table-cell px-6 py-4 text-left text-sm font-semibold text-gray-600">Cycle</th>
                  <th className="hidden lg:table-cell px-6 py-4 text-left text-sm font-semibold text-gray-600">Speciality</th>
                  <th className="hidden lg:table-cell px-6 py-4 text-left text-sm font-semibold text-gray-600">University</th>
                  <th className="px-3 md:px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="hidden md:table-cell px-6 py-4 text-left text-sm font-semibold text-gray-600">Mention</th>
                  <th className="px-3 md:px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMemoires.map((memoire) => (
                  <tr key={memoire.id_memoire} className="hover:bg-gray-50/50">
                    <td className="px-3 md:px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="truncate max-w-[150px] md:max-w-none">
                          {memoire.libelle}
                        </span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4">{new Date(memoire.date_soumission).getFullYear()}</td>
                    <td className="hidden md:table-cell px-6 py-4">{memoire.cycle}</td>
                    <td className="hidden lg:table-cell px-6 py-4">{memoire.speciality}</td>
                    <td className="hidden lg:table-cell px-6 py-4">{memoire.university}</td>
                    <td className="px-3 md:px-6 py-4">
                      <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(memoire.status)}`}>
                        {getStatusIcon(memoire.status)}
                        <span className="ml-1 md:ml-2 capitalize">{memoire.status}</span>
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {memoire.mention || 'Non noté'}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-4">
                      <div className="flex space-x-1 md:space-x-2">
                        <a
                          href={getApiUrl(`/${memoire.file_path}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download size={18} />
                        </a>
                        <button
                          onClick={() => handleViewSimilarityReport(memoire)}
                          className="p-1 md:p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Similarity Report"
                        >
                          <AlertCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteMemoire(memoire.id_memoire)}
                          className="p-1 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash size={18} />
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