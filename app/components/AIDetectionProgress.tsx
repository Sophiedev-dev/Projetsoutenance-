import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { AIDetectionResult, AIAnalysisProgress } from '../utils/aiDetection';

interface AIDetectionProgressProps {
  progress?: AIAnalysisProgress;
  result?: AIDetectionResult;
  isAnalyzing: boolean;
}

const AIDetectionProgress: React.FC<AIDetectionProgressProps> = ({
  progress,
  result,
  isAnalyzing
}) => {
  const getAITypeColor = (aiType: string) => {
    switch (aiType.toLowerCase()) {
      case 'chatgpt':
        return 'bg-blue-500';
      case 'gemini':
        return 'bg-purple-500';
      case 'claude':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 70) return 'text-red-600';
    if (percentage >= 50) return 'text-orange-600';
    if (percentage >= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 70) return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (percentage >= 50) return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getStatusMessage = (percentage: number) => {
    if (percentage >= 80) return 'Très forte probabilité de contenu IA';
    if (percentage >= 60) return 'Forte probabilité de contenu IA';
    if (percentage >= 40) return 'Probabilité modérée de contenu IA';
    if (percentage >= 20) return 'Faible probabilité de contenu IA';
    return 'Très faible probabilité de contenu IA';
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-white shadow-sm">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
        <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
        Détection IA Locale
      </h4>

      {isAnalyzing && progress && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{progress.step}</span>
            <span>{progress.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress.progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{progress.currentAnalysis}</p>
        </div>
      )}

      {result && !isAnalyzing && (
        <div className="space-y-4">
          {/* Résultat principal */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(result.aiPercentage)}
              <div>
                <p className="font-medium text-gray-900">
                  Score IA : <span className={getPercentageColor(result.aiPercentage)}>
                    {result.aiPercentage}%
                  </span>
                </p>
                <p className="text-sm text-gray-600">{getStatusMessage(result.aiPercentage)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Type détecté</p>
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${getAITypeColor(result.aiType)}`}></span>
                <span className="text-sm text-gray-700">{result.aiType}</span>
              </div>
            </div>
          </div>

          {/* Barre de progression par type d'analyse */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700">Détails de lanalyse :</h5>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Patterns répétitifs</span>
                <span className="text-sm font-medium">{result.patterns.repetitivePatterns}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-red-500 h-1.5 rounded-full"
                  style={{ width: `${result.patterns.repetitivePatterns}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Structure des phrases</span>
                <span className="text-sm font-medium">{result.patterns.sentenceStructure}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-orange-500 h-1.5 rounded-full"
                  style={{ width: `${result.patterns.sentenceStructure}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Diversité vocabulaire</span>
                <span className="text-sm font-medium">{result.patterns.vocabulary}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-yellow-500 h-1.5 rounded-full"
                  style={{ width: `${result.patterns.vocabulary}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mots de transition</span>
                <span className="text-sm font-medium">{result.patterns.transitions}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: `${result.patterns.transitions}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Indicateurs détectés */}
          {result.indicators.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Indicateurs détectés :</h5>
              <div className="space-y-1">
                {result.indicators.map((indicator: string, index: number) => (
  <div key={index} className="flex items-center space-x-2 text-sm">
    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
    <span className="text-gray-600">{indicator}</span>
  </div>
))}
              </div>
            </div>
          )}

          {/* Niveau de confiance */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Niveau de confiance :</span>
            <span className={`font-medium ${
              result.confidence === 'high' ? 'text-green-600' :
              result.confidence === 'medium' ? 'text-orange-600' : 'text-red-600'
            }`}>
              {result.confidence === 'high' ? 'Élevé' :
               result.confidence === 'medium' ? 'Moyen' : 'Faible'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDetectionProgress;