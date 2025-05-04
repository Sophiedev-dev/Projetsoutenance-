import React from "react";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface SimilarityResultItem {
  id_memoire: number;
  name: string;
  similarity: number;
  author: string;
  submissionDate: string;
}

interface SimilarityStatus {
  similarity_warning_threshold: number;
  similarity_danger_threshold: number;
  level: "danger" | "warning" | "success";
  percentage: number;
  color: string;
  message: string;
}

interface SimilarityReportProps {
  similarityData: {
    results: SimilarityResultItem[];
    status: SimilarityStatus;
  } | null;
  onSimilarityValidation?: (isValid: boolean) => void;
}

const SimilarityReport: React.FC<SimilarityReportProps> = ({
  similarityData,
  onSimilarityValidation,
}) => {
  // Déclencher onSimilarityValidation quand les données changent
  React.useEffect(() => {
    if (similarityData?.results && similarityData?.status && onSimilarityValidation) {
      const hasDangerousSimilarity = similarityData.results.some(
        (item) => item.similarity >= similarityData.status.similarity_danger_threshold
      );
      onSimilarityValidation(!hasDangerousSimilarity);
    }
  }, [similarityData, onSimilarityValidation]);

  if (!similarityData || !similarityData.results || !similarityData.status) {
    return null;
  }

  const { results, status } = similarityData;

  const getStatusIcon = () => {
    switch (status.level) {
      case "danger":
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return null;
    }
  };

  const getProgressBarColor = () => {
    switch (status.level) {
      case "danger":
        return "bg-red-500";
      case "warning":
        return "bg-orange-500";
      case "success":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusTextColor = () => {
    switch (status.level) {
      case "danger":
        return "text-red-600";
      case "warning":
        return "text-orange-600";
      case "success":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center space-x-3 mb-4">
        {getStatusIcon()}
        <h3 className="text-lg font-semibold">Analyse de similarité</h3>
      </div>

      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Niveau de similarité</span>
          <span className="text-sm font-medium">
            {status.percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${getProgressBarColor()}`}
            style={{ width: `${status.percentage}%` }}
          ></div>
        </div>
        <p className={`mt-2 text-sm ${getStatusTextColor()}`}>
          {status.message}
        </p>
      </div>

      {results.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-2">
            Documents similaires trouvés:
          </h4>
          <div className="space-y-4">
            {results.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium">{item.name}</h5>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        item.similarity >= status.similarity_danger_threshold
                          ? "bg-red-600 text-white"
                          : item.similarity >= status.similarity_warning_threshold
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {item.similarity.toFixed(1)}% similaire
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Auteur: {item.author} | Soumis le: {item.submissionDate}
                  </div>
                  {item.similarity >= status.similarity_danger_threshold && (
                    <div className="mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        <div>
                          <p className="text-red-800 font-medium">
                            Soumission bloquée - Similarité excessive
                          </p>
                          <p className="text-red-600 text-sm mt-1">
                            Le taux de similarité ({item.similarity.toFixed(1)}
                            %) dépasse le seuil autorisé ({
                              status.similarity_danger_threshold
                            }
                            %).
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {results.some(
            (item) => item.similarity >= status.similarity_danger_threshold
          ) && (
            <div className="mt-6 p-4 bg-red-100 rounded-lg border border-red-300">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
                <div className="ml-3">
                  <h3 className="text-red-800 font-semibold">
                    Impossible de soumettre le mémoire
                  </h3>
                  <p className="text-red-700 mt-2">
                    Votre document présente un taux de similarité trop élevé
                    avec des documents existants. Pour pouvoir soumettre votre
                    mémoire, vous devez :
                  </p>
                  <ul className="list-disc list-inside text-red-700 mt-2 space-y-1">
                    <li>Réviser le contenu de votre document</li>
                    <li>
                      Réduire les similarités en dessous de{" "}
                      {status.similarity_danger_threshold}%
                    </li>
                    <li>Vérifier à nouveau la similarité</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimilarityReport;