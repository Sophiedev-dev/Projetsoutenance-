'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Upload, X, CheckCircle, AlertCircle, Clock, Trash, Download, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import MySideBar from './ui/sideBar';
import PreUploadChecker from '../components/PreUploadChecker';
import SimilarityReportModal from '../components/SimilarityReportModal';
import { getApiUrl } from '../utils/config';

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

// Interface pour les résultats de similarité
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

// Interface pour les données détaillées de similarité
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

function App() {
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

  // Fonction appelée lorsque le fichier a été vérifié avec succès
  const handleFileVerified = (fileHash: string) => {
    setVerifiedFileHash(fileHash);
    setIsFileVerified(true);
    toast.success("Document vérifié avec succès");
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

  // Fonction pour afficher le rapport détaillé de similarité
  const handleViewSimilarityReport = async (memoire: Memoire) => {
    try {
      setSelectedMemoire(memoire);
      const response = await fetch(getApiUrl(`/api/memoire/${memoire.id_memoire}/similarity`));
      
      if (!response.ok) {
        throw new Error(`Erreur serveur (${response.status})`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Transformation des données pour correspondre à l'interface DetailedSimilarityData
        const processedData: DetailedSimilarityData = {
          similarity: data.similarity || data.percentage || 0,
          matches: Array.isArray(data.matches) ? data.matches.map((match: any) => ({
            sourceText: match.sourceText || '',
            targetText: match.targetText || '',
            similarity: match.similarity || 0,
            sourcePage: match.sourcePage,
            targetPage: match.targetPage,
            matchingPhrases: match.matchingPhrases?.map((phrase: any) => ({
              text: typeof phrase === 'string' ? phrase : phrase.text || '',
              sourceIndex: typeof phrase === 'string' ? 0 : phrase.sourceIndex || 0,
              targetIndex: typeof phrase === 'string' ? 0 : phrase.targetIndex || 0
            }))
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

  // Gestion du changement de fichier dans le formulaire
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Veuillez télécharger un fichier PDF');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('La taille du fichier doit être inférieure à 10 Mo');
        return;
      }
      
      // Réinitialiser les états de vérification
      setIsFileVerified(false);
      setVerifiedFileHash(null);
      setSimilarityData(null);
      
      setNewMemoire(prev => ({ ...prev, file }));
      setFilePreview(URL.createObjectURL(file));
      
      toast.info('⚠️ Veuillez vérifier votre document en utilisant le vérificateur ci-dessus', {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  // Gestion des résultats de similarité
  const handleSimilarityResult = (data: SimilarityResult) => {
    setSimilarityData(data);
    
    // Afficher un toast selon le niveau de similarité
    if (data.status.level === 'danger') {
      toast.error(`Similarité élevée détectée: ${data.status.percentage.toFixed(1)}%`);
    } else if (data.status.level === 'warning') {
      toast.warning(`Similarité modérée détectée: ${data.status.percentage.toFixed(1)}%`);
    } else {
      toast.success(`Similarité faible détectée: ${data.status.percentage.toFixed(1)}%`);
    }
  };

  // Réinitialisation du formulaire
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
  
  // Fonction pour calculer le hash d'un fichier
  const calculateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // Vérifier si le fichier a été vérifié
    if (!isFileVerified) {
      toast.error('Veuillez vérifier votre document avant de le soumettre');
      return;
    }
  
    // Bloquer la soumission si le taux de similarité est trop élevé
    if (similarityData?.status?.level === 'danger') {
      toast.error(`Soumission impossible : Le taux de similarité (${similarityData.status.percentage.toFixed(1)}%) dépasse le seuil autorisé (${similarityData.status.similarity_danger_threshold}%)`);
      return;
    }
    
    // Vérifier si un fichier est sélectionné
    if (!newMemoire.file) {
      toast.error('Veuillez sélectionner un fichier PDF');
      return;
    }

    // Vérifier que le fichier soumis est bien celui qui a été vérifié
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
      
      // Add file_name field
      formData.append('file_name', newMemoire.file.name);
      
      // Add other fields
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
      
      // Rafraîchir la liste des mémoires
      if (userData.user && userData.user.id_etudiant) {
        fetchMemoires(userData.user.id_etudiant);
      } else {
        console.error('ID étudiant manquant');
        toast.error('Erreur lors du rafraîchissement des données');
      }
      
    } catch (error) {
      console.error('Erreur de soumission:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur inattendue est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Suppression d'un mémoire
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

  // Récupération de l'icône de statut
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

  // Récupération du texte de statut
  const getStatusText = (status: string) => {
    switch (status) {
      case 'validated':
        return 'Validé';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'En attente';
    }
  };

  const filteredMemoires = memoires.filter(memoire => 
    memoire.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memoire.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memoire.speciality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <MySideBar />
      
      <div className="p-4 sm:ml-64">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Mémoires</h1>
          <p className="text-gray-600">Soumettez et gérez vos mémoires</p>
        </div>
        
        <div className="mb-4 flex justify-between">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un mémoire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FileText className="absolute left-3 top-3 text-gray-400" size={16} />
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            {showForm ? <X className="mr-2" size={16} /> : <Upload className="mr-2" size={16} />}
            {showForm ? 'Annuler' : 'Soumettre un mémoire'}
          </button>
        </div>
        
        {showForm && (
          <div className="mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Soumettre un nouveau mémoire</h2>
            
            {/* PreUploadChecker */}
            <PreUploadChecker 
              onSimilarityResult={handleSimilarityResult}
              onFileVerified={handleFileVerified}
            />
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre du mémoire
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemoire.libelle}
                    onChange={(e) => setNewMemoire(prev => ({ ...prev, libelle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Année
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemoire.annee}
                    onChange={(e) => setNewMemoire(prev => ({ ...prev, annee: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cycle
                  </label>
                  <select
                    required
                    value={newMemoire.cycle}
                    onChange={(e) => setNewMemoire(prev => ({ ...prev, cycle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Bachelor">Bachelor</option>
                    <option value="Master">Master</option>
                    <option value="Doctorat">Doctorat</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spécialité
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemoire.speciality}
                    onChange={(e) => setNewMemoire(prev => ({ ...prev, speciality: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Université
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemoire.university}
                    onChange={(e) => setNewMemoire(prev => ({ ...prev, university: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mention
                  </label>
                  <select
                    required
                    value={newMemoire.mention}
                    onChange={(e) => setNewMemoire(prev => ({ ...prev, mention: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez une mention</option>
                    <option value="Passable">Passable</option>
                    <option value="Assez bien">Assez bien</option>
                    <option value="Bien">Bien</option>
                    <option value="Très bien">Très bien</option>
                    <option value="Excellent">Excellent</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newMemoire.description}
                  onChange={(e) => setNewMemoire(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fichier PDF
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-600
                    hover:file:bg-blue-100"
                />
              </div>
              
              {filePreview && (
                <div className="mb-4 p-4 border border-gray-200 rounded-lg">
                  <a href={filePreview} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                    <FileText className="mr-2" size={16} />
                    Aperçu du document
                  </a>
                </div>
              )}
              
              {similarityData?.status?.level === 'danger' && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <div className="flex items-start">
                    <AlertCircle className="mt-0.5 mr-2 text-red-600" size={18} />
                    <div>
                      <p className="font-medium">Soumission bloquée</p>
                      <p className="text-sm mt-1">
                        Votre document présente un taux de similarité trop élevé ({similarityData.status.percentage.toFixed(1)}%) 
                        qui dépasse le seuil autorisé ({similarityData.status.similarity_danger_threshold}%).
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetFormStates();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting || 
                    !isFileVerified || 
                    !newMemoire.file || 
                    similarityData?.status?.level === 'danger'
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full inline-block"></span>
                      Soumission...
                    </>
                  ) : 'Soumettre'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Mes mémoires</h2>
          
          {filteredMemoires.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto mb-2 text-gray-400" size={40} />
              <p>Aucun mémoire trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Titre</th>
                    <th className="px-4 py-3">Date de soumission</th>
                    <th className="px-4 py-3">Spécialité</th>
                    <th className="px-4 py-3">Université</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredMemoires.map((memoire) => (
                    <tr key={memoire.id_memoire} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{memoire.libelle}</td>
                      <td className="px-4 py-3">{memoire.date_soumission}</td>
                      <td className="px-4 py-3">{memoire.speciality}</td>
                      <td className="px-4 py-3">{memoire.university}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {getStatusIcon(memoire.status)}
                          <span className="ml-1.5 text-sm">{getStatusText(memoire.status)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewSimilarityReport(memoire)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Voir le rapport de similarité"
                          >
                            <AlertTriangle size={18} />
                          </button>
                          <a
                            href={`${getApiUrl('/api/download/')}${memoire.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                            title="Télécharger"
                          >
                            <Download size={18} />
                          </a>
                          {memoire.status === 'pending' && (
                            <button
                              onClick={() => handleDeleteMemoire(memoire.id_memoire)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Supprimer"
                            >
                              <Trash size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {showSimilarityReport && detailedData && (
        <SimilarityReportModal
          data={detailedData}
          onClose={() => setShowSimilarityReport(false)}
        />
      )}
    </div>
  );
}

export default App;