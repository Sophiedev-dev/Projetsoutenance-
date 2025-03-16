import React, { useState, useEffect } from 'react';
import SimilarityReportModal from './SimilarityReportModal';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  AlertTriangle,
  Eye,
  Download
} from 'lucide-react';
import { toast } from 'react-toastify';

// Add type definition for better type safety
interface SimilarityStatus {
  level: 'danger' | 'warning' | 'success';
  message: string;
  color: string;
  percentage: number;
  similarity_warning_threshold: number;
  similarity_danger_threshold: number;
}

interface SimilarityDataType {
  results: Array<{
    id_memoire: number;
    name: string;
    similarity: number;
    author: string;
    email: string;
    submissionDate: string;
  }>;
  status: SimilarityStatus;
}

const MemoireDetailView = ({ memoire, onBack, onValidate, onReject }) => {
    const [similarityData, setSimilarityData] = useState<SimilarityDataType | null>(null);  const [isLoading, setIsLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSimilarityReport, setShowSimilarityReport] = useState(false);
  const [detailedSimilarityData, setDetailedSimilarityData] = useState(null);

  useEffect(() => {
    if (memoire?.id_memoire) {
      fetchSimilarityData(memoire.id_memoire);
    }
  }, [memoire]);

const fetchSimilarityData = async (memoireId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/memoire/${memoireId}/similarity`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données de similarité');
      }
  
      const data = await response.json();
      
      if (data.success) {
        // Calculate the highest similarity percentage from results
        const highestSimilarity = data.results.length > 0 
          ? Math.max(...data.results.map(item => item.similarity))
          : 0;
  
        setSimilarityData({
          results: data.results.map(item => ({
            id_memoire: item.id_memoire,
            name: item.libelle || 'Document sans titre',
            similarity: parseFloat(item.similarity) || 0, // Ensure it's a number
            author: item.author || 'Auteur inconnu',
            email: item.email || 'Email non disponible',
            submissionDate: item.date_soumission || 'Date inconnue'
          })),
          status: {
            level: highestSimilarity >= 70 ? 'danger' : 
                   highestSimilarity >= 50 ? 'warning' : 
                   'success',
            message: data.status.message,
            color: data.status.color,
            percentage: highestSimilarity, // Use the highest similarity as overall percentage
            similarity_warning_threshold: 50,
            similarity_danger_threshold: 70
          }
        });
      } else {
        throw new Error(data.message || 'Erreur lors de la récupération des données');
      }
    } catch (error) {
      console.error('Error fetching similarity data:', error);
      toast.error(error.message || 'Erreur lors de la récupération des données de similarité');
    } finally {
      setIsLoading(false);
    }
  };


// Add function to fetch detailed similarity data
const fetchDetailedSimilarityData = async (itemId, similarItem) => {
  try {
    setIsLoading(true);
    // Fix the API endpoint path to match the backend route
    const response = await fetch(`http://localhost:5000/api/memoire/${memoire.id_memoire}/similarity/${itemId}/details`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la récupération des détails');
    }

    const data = await response.json();
    console.log("Detailed similarity data:", data); // Debug log
    
    if (data.success) {
      // Transform the data to include matched text passages
      const formattedData = {
        sourceText: data.details.sourceText,
        targetText: data.details.targetText,
        similarity: similarItem.similarity,
        sourceMemoireTitle: memoire.libelle,
        targetMemoireTitle: similarItem.name || similarItem.libelle,
        matches: data.details.matches.map(match => ({
          sourceText: match.sourceText,
          targetText: match.targetText,
          similarity: parseFloat(match.similarity.toFixed(2)),
          sourcePage: match.sourcePage,
          targetPage: match.targetPage,
          commonPhrases: match.commonPhrases || [] // Add common phrases if available
        }))
      };
      
      setDetailedSimilarityData(formattedData);
      setShowSimilarityReport(true);
    } else {
      throw new Error(data.message || 'Erreur lors de la récupération des détails');
    }
  } catch (error) {
    console.error('Error fetching detailed similarity data:', error);
    toast.error('Erreur lors de la récupération des détails de similarité');
  } finally {
    setIsLoading(false);
  }
};
  
  const handleReject = () => {
    if (!rejectionReason) {
      toast.error('Veuillez fournir une raison du rejet');
      return;
    }
    
    onReject(memoire.id_memoire, rejectionReason);
    setShowRejectModal(false);
    setRejectionReason('');
  };

  const getStatusBadge = (status) => {
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
          <div className="flex space-x-3 mb-8">
            <a
              href={`http://localhost:5000/${memoire.file_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Eye size={18} className="mr-2" />
              Visualiser le PDF
            </a>
            <a
              href={`http://localhost:5000/${memoire.file_path}`}
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
      similarityData?.status?.level === 'danger' ? 'text-red-600' : 
      similarityData?.status?.level === 'warning' ? 'text-orange-600' : 
      'text-green-600'
    }`}>
      {similarityData?.status?.percentage !== undefined ? 
        similarityData.status.percentage.toFixed(1) : '0'}%
    </span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div 
      className={`h-2.5 rounded-full ${
        similarityData?.status?.level === 'danger' ? 'bg-red-500' : 
        similarityData?.status?.level === 'warning' ? 'bg-orange-500' : 
        'bg-green-500'
      }`} 
      style={{ width: `${similarityData?.status?.percentage ?? 0}%` }}
    ></div>
  </div>
</div>


{similarityData?.results?.length > 0 && (
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
                  item.similarity >= (similarityData.status?.similarity_danger_threshold || 0) ? 'bg-red-500' : 
                  item.similarity >= (similarityData.status?.similarity_warning_threshold || 0) ? 'bg-orange-500' : 
                  'bg-green-500'
                }`}></span>
                <span className="text-sm">{item.similarity?.toFixed(1)}%</span>
              </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600">
            <button 
    onClick={() => item.id_memoire ? 
      fetchDetailedSimilarityData(item.id_memoire, item) : 
      toast.error('ID du mémoire non disponible')}
    className="hover:underline"
  >
    Voir le rapport
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
            <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
              Aucune donnée de similarité disponible pour ce mémoire
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {/* {memoire.status === 'pending' && (
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={() => setShowRejectModal(true)}
            className="px-6 py-3 bg-white border border-red-500 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
          >
            Rejeter
          </button>
          <button
            onClick={() => onValidate(memoire.id_memoire)}
            className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
          >
            Valider
          </button>
        </div>
      )} */}

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Rejeter le mémoire</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Raison du rejet..."
              className="w-full h-32 p-2 border rounded-lg mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Rejeter
              </button>
            </div>
          </div>
        </div>
      )}

        {showSimilarityReport && detailedSimilarityData && (
        <SimilarityReportModal
            isOpen={showSimilarityReport}
            onClose={() => setShowSimilarityReport(false)}
            similarityData={detailedSimilarityData}
            documentTitle={memoire.libelle}
        />
        )}

    </div>
  );
};

export default MemoireDetailView;