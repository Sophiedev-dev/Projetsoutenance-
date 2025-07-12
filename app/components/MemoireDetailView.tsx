import React, { useState, useEffect } from 'react';
import SimilarityReportModal from './SimilarityReportModal';
import { 
  ArrowLeft,
  Eye,
  Download,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getApiUrl } from '../utils/config';

interface SimilarityStatus {
  level: 'danger' | 'warning' | 'success';
  message: string;
  color: string;
  percentage: number;
  similarity_warning_threshold: number;
  similarity_danger_threshold: number;
}

interface SimilarityResult {
  id_memoire: number;
  name: string;
  similarity: number;
  author: string;
  email: string;
  submissionDate: string;
}

interface SimilarityDataType {
  results: SimilarityResult[];
  status: SimilarityStatus;
}

interface Memoire {
  id_memoire: number;
  libelle: string;
  etudiant_nom: string;
  date_soumission: string;
  status: 'validated' | 'rejected' | 'pending';
  cycle: string;
  speciality: string;
  university: string;
  description: string;
  file_path: string;
}

interface MemoireDetailViewProps {
  memoire: Memoire | null;
  onBack: () => void;
  onReject: (id: number, reason: string) => void;
  onValidate: (id: number) => void;
}

interface DetailedSimilarityMatch {
  sourceText: string;
  targetText: string;
  similarity: number;
  sourcePage: number;
  targetPage: number;
  commonPhrases: string[];
}

interface DetailedSimilarityData {
  sourceText: string;
  targetText: string;
  similarity: number;
  sourceMemoireTitle: string;
  targetMemoireTitle: string;
  matches: DetailedSimilarityMatch[];
}



import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

const MemoireDetailView: React.FC<MemoireDetailViewProps> = ({ 
  memoire, 
  onBack, 
  onReject, 
  onValidate 
}) => {
  const [similarityData, setSimilarityData] = useState<SimilarityDataType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSimilarityReport, setShowSimilarityReport] = useState(false);
  const [detailedSimilarityData, setDetailedSimilarityData] = useState<DetailedSimilarityData | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string>("");

  useEffect(() => {
    if (memoire?.id_memoire) {
      fetchSimilarityData(memoire.id_memoire);
    }
  }, [memoire]);

  const fetchSimilarityData = async (memoireId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(getApiUrl(`/api/memoire/${memoireId}/similarity`));
      
      const rawData = await response.json();
      console.log('Raw similarity response:', rawData); // Debug log
      
      if (!response.ok) {
        throw new Error(rawData.message || `Erreur serveur: ${response.status}`);
      }
  
      // Handle both possible response structures
      const results = rawData.data?.results || rawData.results || [];
      const status = rawData.data?.status || rawData.status || {};
  
      // Ensure results is an array
      if (!Array.isArray(results)) {
        console.error('Invalid results format:', results);
        throw new Error('Format de données invalide: résultats non trouvés');
      }
  
      // Transform and validate each result
      const transformedResults = results.map(item => ({
        id_memoire: Number(item.id_memoire || item.memoireId || 0),
        name: String(item.libelle || item.name || item.titre || 'Document sans titre'),
        similarity: Number(item.similarity || item.similarite || 0),
        author: String(item.etudiant_nom || item.author || item.auteur || 'Auteur inconnu'),
        email: String(item.etudiant_email || item.email || 'Email non disponible'),
        submissionDate: String(item.date_soumission || item.submissionDate || new Date().toISOString())
      }));
  
      // Calculate similarity percentage
      const highestSimilarity = transformedResults.length > 0
        ? Math.max(...transformedResults.map(r => r.similarity))
        : 0;
  
      setSimilarityData({
        results: transformedResults,
        status: {
          level: highestSimilarity >= 70 ? 'danger' :
                 highestSimilarity >= 50 ? 'warning' :
                 'success',
          message: status.message || 'Analyse terminée',
          color: status.color || (
            highestSimilarity >= 70 ? 'red' :
            highestSimilarity >= 50 ? 'orange' :
            'green'
          ),
          percentage: highestSimilarity,
          similarity_warning_threshold: Number(status.similarity_warning_threshold || 50),
          similarity_danger_threshold: Number(status.similarity_danger_threshold || 70)
        }
      });
  
    } catch (error) {
      console.error('Error fetching similarity data:', error);
      toast.error(
        error instanceof Error 
          ? `Erreur: ${error.message}`
          : 'Erreur lors de la récupération des données de similarité'
      );
      setSimilarityData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetailedSimilarityData = async (itemId: number, similarItem: SimilarityResult) => {
    if (!memoire) return;

    try {
      setIsLoading(true);
      const response = await fetch(getApiUrl(`/api/memoire/${memoire.id_memoire}/similarity/${itemId}/details`));
      let data: { success?: boolean; message?: string; data?: DetailedSimilarityData; details?: DetailedSimilarityData } | null = null;    
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.error('Réponse non JSON ou malformée:', jsonErr);
      }
      console.debug('Réponse API detailed similarity:', response.status, data);
      if (!response.ok) {
        throw new Error(data && data.message ? data.message : `Erreur serveur: ${response.status}`);
      }
      if (data && data.success && data.details) {
        setDetailedSimilarityData({
          ...data.details,
          sourceMemoireTitle: memoire.libelle,
          targetMemoireTitle: similarItem.name
        });
        setShowSimilarityReport(true);
      } else {
        throw new Error(data && data.message ? data.message : 'Erreur lors de la récupération des détails');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching detailed similarity data:', error);
        toast.error(error.message ? error.message : 'Erreur lors de la récupération des détails de similarité');
      } else {
        console.error('Unknown error fetching detailed similarity data:', error);
        toast.error('Erreur lors de la récupération des détails de similarité');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReject = () => {
    if (!rejectionReason) {
      toast.error('Veuillez fournir une raison du rejet');
      return;
    }
    
    if (memoire) {
      onReject(memoire.id_memoire, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
    }
  };

  // We're removing this unused function to fix the linting error
  // const handleValidate = () => {
  //   if (memoire) {
  //     onValidate(memoire.id_memoire);
  //   }
  // };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
            Validé
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
            Rejeté
          </span>
        );
      default:
        return (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
            En attente de validation
          </span>
        );
    }
  };

  if (!memoire) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header with back button */}
      <div className="mb-6 flex items-center">
        <button 
          onClick={onBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Détails du mémoire</h2>
      </div>

      {/* Main content */}
      <div className="space-y-8">
        {/* Memoire information */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{memoire.libelle}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
            <p>Par: <span className="font-medium">{memoire.etudiant_nom}</span></p>
            <p>Soumis le: <span className="font-medium">{new Date(memoire.date_soumission).toLocaleDateString()}</span></p>
            {getStatusBadge(memoire.status)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Cycle</p>
              <p className="font-medium">{memoire.cycle}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Spécialité</p>
              <p className="font-medium">{memoire.speciality}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Université</p>
              <p className="font-medium">{memoire.university}</p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <p className="text-sm text-gray-500 mb-1">Description</p>
            <p>{memoire.description}</p>
          </div>

          {/* PDF Viewer Modal */}
        {showPdfViewer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl w-full relative">
              <button
                className="absolute top-2 right-2 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                onClick={() => { setShowPdfViewer(false); setPdfUrl(""); setPdfError(""); }}
                aria-label="Fermer"
              >
                <span aria-hidden>×</span>
              </button>
              {pdfLoading ? (
                <div className="flex items-center justify-center h-[60vh]">
                  <span className="text-gray-500">Chargement du PDF...</span>
                </div>
              ) : pdfError ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-red-600">
                  <span>{pdfError}</span>
                </div>
              ) : pdfUrl ? (
                <>
                  {console.debug('[PDF] URL utilisée pour Viewer:', pdfUrl)}
                  <div className="mb-4 h-[70vh] overflow-y-auto border rounded-lg">
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                      <Viewer fileUrl={pdfUrl} />
                    </Worker>
                  </div>
                  <a
                    href={pdfUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mt-2"
                  >
                    <Download className="mr-2" /> Télécharger le PDF
                  </a>
                </>
              ) : (
                <div className="flex items-center justify-center h-[60vh]">
                  <span className="text-gray-500">Aucun PDF à afficher.</span>
                </div>
              )}
            </div>
          </div>
        )}
          <div className="flex space-x-3 mb-8">
            <button
              type="button"
              onClick={async () => {
                setPdfError("");
                setPdfLoading(true);
                setShowPdfViewer(true);
                try {
                  if (!memoire) throw new Error("Mémoire non défini");
                  const response = await fetch(getApiUrl(`/api/memoire/${memoire.id_memoire}/download`));
                  if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
                  const data = await response.json();
                  if (!data.success || !data.url) throw new Error('URL de téléchargement non disponible');
                  setPdfUrl(data.url); // Utilisation brute, aucune modification
                  console.debug('[PDF] URL utilisée pour Viewer:', data.url);
                } catch (e: unknown) {
                  if (e && typeof e === 'object' && 'message' in e) {
                    setPdfError((e as { message?: string }).message || 'Erreur lors du chargement du PDF');
                  } else {
                    setPdfError('Erreur lors du chargement du PDF');
                  }
                  setPdfUrl("");
                } finally {
                  setPdfLoading(false);
                }
              }}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Eye size={18} className="mr-2" />
              Visualiser le PDF
            </button>
            <a
  href={pdfUrl}
  download
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download size={18} className="mr-2" />
              Télécharger
            </a>
          </div>
        </div>

        {/* Similarity analysis section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Analyse de similarité</h3>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : similarityData ? (
            <div className="space-y-6">
              {/* Similarity gauge */}
              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Taux de similarité</span>
                  <span className={`text-sm font-medium ${
                    similarityData.status.level === 'danger' ? 'text-red-600' : 
                    similarityData.status.level === 'warning' ? 'text-orange-600' : 
                    'text-green-600'
                  }`}>
                    {similarityData.status.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      similarityData.status.level === 'danger' ? 'bg-red-500' : 
                      similarityData.status.level === 'warning' ? 'bg-orange-500' : 
                      'bg-green-500'
                    }`} 
                    style={{ width: `${similarityData.status.percentage}%` }}
                  ></div>
                </div>
              </div>

              {similarityData.results.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mémoire
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Similarité
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {similarityData.results.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                item.similarity >= similarityData.status.similarity_danger_threshold ? 'bg-red-500' : 
                                item.similarity >= similarityData.status.similarity_warning_threshold ? 'bg-orange-500' : 
                                'bg-green-500'
                              }`}></span>
                              <span className="font-medium">
                                {item.similarity.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <button
                              onClick={() => fetchDetailedSimilarityData(item.id_memoire, item)}
                              className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                            >
                              Voir les détails
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Aucune donnée de similarité disponible</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowRejectModal(true)}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Rejeter
          </button>
          
          <button
            onClick={() => onValidate(memoire.id_memoire)}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          >
            Valider
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Rejeter le mémoire</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raison du rejet
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 h-32"
                placeholder="Veuillez expliquer pourquoi ce mémoire est rejeté..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Similarity Report Modal */}
      {showSimilarityReport && detailedSimilarityData && (
        <SimilarityReportModal
          data={detailedSimilarityData}
          onClose={() => setShowSimilarityReport(false)}
          similarityScoreToDisplay={
            // Si detailedSimilarityData.similarity === similarityData?.status.percentage, on affiche le score général
            similarityData?.status?.percentage ?? detailedSimilarityData.similarity
          }
        />
      )}
    </div>
  );
};

export default MemoireDetailView;