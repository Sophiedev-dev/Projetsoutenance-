import React from 'react';
import { X, AlertCircle, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface SimilarityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  similarityData: {
    sourceText: string;
    targetText: string;
    similarity: number;
    matches: Array<{
      sourceText: string;
      targetText: string;
      similarity: number;
    }>;
  };
  documentTitle: string;
}

const SimilarityReportModal = ({ isOpen, onClose, similarityData, documentTitle }) => {
  if (!isOpen) return null;

  const getStatusColor = (similarity: number) => {
    if (similarity >= 70) return 'text-red-600';
    if (similarity >= 50) return 'text-orange-600';
    return 'text-green-600';
  };

  const getStatusIcon = (similarity: number) => {
    if (similarity >= 70) return <AlertCircle className="w-6 h-6 text-red-500" />;
    if (similarity >= 50) return <AlertTriangle className="w-6 h-6 text-orange-500" />;
    return <CheckCircle className="w-6 h-6 text-green-500" />;
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Rapport de Similarité', 20, 20);
    
    // Score de similarité
    doc.setFontSize(16);
    doc.text(`Score de similarité: ${similarityData.similarity.toFixed(1)}%`, 20, 40);
    
    // Documents comparés
    doc.setFontSize(14);
    doc.text('Documents comparés:', 20, 60);
    doc.setFontSize(12);
    doc.text(`Document source: ${documentTitle}`, 30, 70);
    doc.text(`Document cible: ${similarityData.targetMemoireTitle}`, 30, 80);
    
    // Extraits similaires
    doc.setFontSize(14);
    doc.text('Extraits similaires:', 20, 100);
    
    let yPosition = 110;
    similarityData.matches.forEach((match, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`Extrait ${index + 1} (${match.similarity.toFixed(1)}% de similarité)`, 20, yPosition);
      
      doc.setFontSize(10);
      const sourceLines = doc.splitTextToSize(`Source: ${match.sourceText}`, 170);
      doc.text(sourceLines, 30, yPosition + 10);
      
      const targetLines = doc.splitTextToSize(`Cible: ${match.targetText}`, 170);
      doc.text(targetLines, 30, yPosition + 10 + (sourceLines.length * 5));
      
      yPosition += 20 + ((sourceLines.length + targetLines.length) * 5);
    });
    
    doc.save('rapport-similarite.pdf');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Rapport de similarité</h2>
            <div className="flex items-center gap-2">
            <button 
                onClick={downloadReport}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-600 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                <span>Télécharger</span>
              </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Score de similarité */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Score de similarité</h3>
                <span className={`text-2xl font-bold ${getStatusColor(similarityData.similarity)}`}>
                  {similarityData.similarity.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(similarityData.similarity)}
                <span className={`${getStatusColor(similarityData.similarity)}`}>
                  {similarityData.similarity >= 70 ? 'Similarité élevée' : 
                   similarityData.similarity >= 50 ? 'Similarité modérée' : 
                   'Similarité acceptable'}
                </span>
              </div>
            </div>

            {/* Documents comparés */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Documents comparés</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Document source</h4>
                  <p className="text-sm text-gray-600">{documentTitle}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Document cible</h4>
                  <p className="text-sm text-gray-600">Document de référence</p>
                </div>
              </div>
            </div>

            {/* Extraits similaires */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Extraits similaires</h3>
              {similarityData.matches.map((match, index) => (
                <div key={index} className="mb-4 border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Extrait {index + 1}</span>
                      <span className={`${getStatusColor(match.similarity)}`}>
                        {match.similarity.toFixed(1)}% de similarité
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x">
                    <div className="p-4">
                      <p className="text-sm text-gray-600 italic">{match.sourceText}</p>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-600 italic">{match.targetText}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarityReportModal;