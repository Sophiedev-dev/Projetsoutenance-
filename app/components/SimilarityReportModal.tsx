import React from 'react';
import { X, AlertCircle, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Update the interface to include commonPhrases
interface SimilarityMatch {
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
}

interface SimilarityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  similarityData: {
    similarity: number;
    matches: Array<SimilarityMatch>;
    targetMemoireTitle: string;
    sourceMemoireTitle: string;
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
  // Update the PDF generation to include page numbers
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
      doc.text(
        `Extrait ${index + 1} (${match.similarity.toFixed(1)}% de similarité)` +
        `${match.sourcePage ? ` - Source: Page ${match.sourcePage}` : ''}` +
        `${match.targetPage ? ` - Cible: Page ${match.targetPage}` : ''}`,
        20, 
        yPosition
      );
      
      doc.setFontSize(10);
      const sourceLines = doc.splitTextToSize(`Source: ${match.sourceText}`, 170);
      doc.text(sourceLines, 30, yPosition + 10);
      
      const targetLines = doc.splitTextToSize(`Cible: ${match.targetText}`, 170);
      doc.text(targetLines, 30, yPosition + 10 + (sourceLines.length * 5));
      
      yPosition += 20 + ((sourceLines.length + targetLines.length) * 5);
    });
    
    doc.save('rapport-similarite.pdf');
  };

       // Add this highlight function at the top of your component
       const highlightSimilarText = (text: string, matchingPhrases?: Array<{text: string, sourceIndex: number, targetIndex: number}>, type?: 'source' | 'target') => {
        if (!matchingPhrases || matchingPhrases.length === 0) return text;
        
        let result = [];
        let lastIndex = 0;
        
        matchingPhrases.forEach(phrase => {
          const index = type === 'source' ? phrase.sourceIndex : phrase.targetIndex;
          const length = phrase.text.length;
          
          if (index > lastIndex) {
            result.push(<span key={`normal-${lastIndex}`}>{text.substring(lastIndex, index)}</span>);
          }
          
          result.push(
            <span 
              key={`highlight-${index}`} 
              className="bg-yellow-200 text-red-800 font-semibold px-1 mx-0.5 rounded border-b-2 border-red-500 hover:bg-yellow-300 transition-colors"
              title="Texte similaire détecté"
            >
              {text.substring(index, index + length)}
            </span>
          );
          
          lastIndex = index + length;
        });
        
        if (lastIndex < text.length) {
          result.push(<span key={`normal-end`}>{text.substring(lastIndex)}</span>);
        }
        
        return result;
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
            <div className="space-y-6 mt-6">
              <h3 className="text-lg font-semibold mb-3">Tous les extraits similaires</h3>
              {similarityData.matches && Array.isArray(similarityData.matches) && similarityData.matches.length > 0 ? (
                similarityData.matches.map((match, index) => (
                  <div key={index} className="mb-6 border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Extrait {index + 1}</span>
                        <span className="text-gray-600">
                          Similarité: {match.similarity.toFixed(1)}%
                          {match.sourcePage && ` | Page source: ${match.sourcePage}`}
                          {match.targetPage && ` | Page cible: ${match.targetPage}`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 divide-x">
                      <div className="p-4">
                        <h5 className="text-xs uppercase text-gray-500 mb-2">
                          Texte source: {similarityData.sourceMemoireTitle}
                        </h5>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {highlightSimilarText(match.sourceText, match.matchingPhrases, 'source')}
                          </p>
                        </div>
                      </div>
                      <div className="p-4">
                        <h5 className="text-xs uppercase text-gray-500 mb-2">
                          Texte cible: {similarityData.targetMemoireTitle}
                        </h5>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 shadow-sm">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {highlightSimilarText(match.targetText, match.matchingPhrases, 'target')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced matching phrases section */}
                    {match.matchingPhrases && match.matchingPhrases.length > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-t">
                        <h6 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          Passages identiques détectés
                        </h6>
                        <ul className="space-y-2">
                          {match.matchingPhrases.map((phrase, i) => (
                            <li 
                              key={i} 
                              className="text-sm bg-white p-3 rounded-lg border-l-4 border-red-400 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="font-medium text-red-800 mb-1">Passage {i + 1}</div>
                              <div className="text-gray-700">"{phrase.text}"</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    {!similarityData.matches ? 
                      "Erreur: Données de similarité manquantes" : 
                      "Aucun extrait similaire trouvé"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Score de similarité global: {similarityData.similarity.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarityReportModal;