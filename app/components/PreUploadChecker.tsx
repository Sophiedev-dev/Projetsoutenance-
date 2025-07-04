import React, { useState, useEffect } from "react";
import { Upload, AlertCircle, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import SimilarityReport from "./SimilarityReport";
import AIDetectionProgress from "./AIDetectionProgress";
import { Progress } from "./ui/progress";
import { getApiUrl } from "../utils/config";
import { AIDetector, AIDetectionResult, AIAnalysisProgress, extractTextFromPDF } from "../utils/aiDetection";

// Interface pour les éléments de résultat de similarité
interface SimilarityResultItem {
  id_memoire: number;
  name: string;
  similarity: number;
  author: string;
  submissionDate: string;
}

// Interface pour le statut de similarité
interface SimilarityStatus {
  level: "danger" | "warning" | "success";
  message: string;
  color: string;
  percentage: number;
  similarity_warning_threshold: number;
  similarity_danger_threshold: number;
}

// Interface complète pour le résultat de similarité
export interface SimilarityResult {
  status: SimilarityStatus;
  results: SimilarityResultItem[];
}

// Interface pour les données de réponse API
interface ApiResponseData {
  id_memoire: number;
  libelle: string;
  name?: string;
  similarity: number;
  author: string;
  email?: string;
  submissionDate?: string;
}

// Interface pour les seuils de similarité provenant du serveur
interface ThresholdData {
  warningThreshold: number;
  dangerThreshold: number;
}

// Props du composant
interface PreUploadCheckerProps {
  onSimilarityResult?: (result: SimilarityResult) => void;
  onFileVerified?: (fileHash: string) => void;
  onFileSelected?: (file: File | null) => void; // Ajoute cette ligne
}

const PreUploadChecker: React.FC<PreUploadCheckerProps> = ({
  onSimilarityResult,
  onFileVerified,
  onFileSelected,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SimilarityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [thresholds, setThresholds] = useState<ThresholdData>({
    warningThreshold: 40,
    dangerThreshold: 70,
  });

  // États pour la détection d'IA locale
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [aiProgress, setAiProgress] = useState<AIAnalysisProgress | undefined>(undefined);
  const [aiResult, setAiResult] = useState<AIDetectionResult | undefined>(undefined);
  const [enableLocalAI, setEnableLocalAI] = useState<boolean>(true);

  // Charger les seuils de similarité au chargement du composant
  useEffect(() => {
    fetchThresholds();
  }, []);

  // Récupérer les seuils de similarité depuis le serveur
  const fetchThresholds = async (): Promise<void> => {
    try {
      const response = await fetch(getApiUrl("/api/admin/similarity-threshold"));
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setThresholds({
            warningThreshold: data.warningThreshold,
            dangerThreshold: data.dangerThreshold
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des seuils:", error);
    }
  };

  const calculateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (onFileSelected) {
      onFileSelected(selectedFile);
    }
    // if (selectedFile) {
    //   if (selectedFile.type !== "application/pdf") {
    //     setError("Please upload a PDF file");
    //     return;
    //   }
    //   if (selectedFile.size > 10 * 1024 * 1024) {
    //     setError("File size must be less than 10MB");
    //     return;
    //   }
    //   setFile(selectedFile);
    //   setError(null);
      
    //   // Réinitialiser les résultats précédents
    //   setResult(null);
    //   setAiResult(undefined);
    //   setAiProgress(undefined);
    // }
  };

  // Fonction pour analyser le contenu IA localement
  const analyzeAIContent = async (file: File): Promise<void> => {
    if (!enableLocalAI) return;
    
    setAiAnalyzing(true);
    setAiProgress(undefined);
    setAiResult(undefined);

    try {
      // Extraire le texte réel du PDF
      const text = await extractTextFromPDF(file);

      // Créer le détecteur d'IA avec callback de progression
      const detector = new AIDetector((progress: AIAnalysisProgress) => {
        setAiProgress(progress);
      });

      // Analyser le texte
      const result = await detector.analyzeText(text);
      setAiResult(result);

    } catch (error) {
      console.error('Erreur lors de l\'analyse IA:', error);
      setError('Erreur lors de l\'analyse de détection d\'IA');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const checkSimilarity = async (): Promise<void> => {
    if (!file) {
      setError("Veuillez sélectionner un fichier");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Démarrer l'analyse IA en parallèle si activée
      if (enableLocalAI) {
        analyzeAIContent(file);
      }

      const formData = new FormData();
      formData.append("file", file);
      
      // Récupérer les thresholds actuels pour les envoyer avec la requête
      formData.append("warning_threshold", thresholds.warningThreshold.toString());
      formData.append("danger_threshold", thresholds.dangerThreshold.toString());

      const response = await fetch(getApiUrl("/api/memoire/check-similarity"), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Échec de la vérification");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Échec de la vérification");
      }

      // Trouver la similarité la plus élevée
      const maxSimilarity = Array.isArray(data.results) 
        ? Math.max(...data.results.map((r: ApiResponseData) => r.similarity), 0)
        : 0;

      // Déterminer le niveau de similarité
      let level: "success" | "warning" | "danger" = "success";
      let message = "Similarité acceptable, vous pouvez soumettre votre document";
      let color = "green";

      if (maxSimilarity >= thresholds.dangerThreshold) {
        level = "danger";
        message = "Similarité élevée détectée! Soumission bloquée.";
        color = "red";
      } else if (maxSimilarity >= thresholds.warningThreshold) {
        level = "warning";
        message = "Niveau de similarité modéré détecté. Vérification recommandée.";
        color = "orange";
      }

      const resultData: SimilarityResult = {
        status: {
          level: level,
          message: message,
          color: color,
          percentage: maxSimilarity,
          similarity_warning_threshold: thresholds.warningThreshold,
          similarity_danger_threshold: thresholds.dangerThreshold,
        },
        results: Array.isArray(data.results) ? data.results.map((r: ApiResponseData) => ({
          id_memoire: r.id_memoire,
          name: r.name || r.libelle || "Document sans titre",
          similarity: r.similarity,
          author: r.author || "",
          submissionDate: r.submissionDate || "",
        })) : [],
      };

      setResult(resultData);

      if (onSimilarityResult) {
        onSimilarityResult(resultData);
      }

      if (maxSimilarity >= thresholds.dangerThreshold) {
        setFile(null);
        const input = document.querySelector("input[type='file']") as HTMLInputElement;
        if (input) input.value = "";
      }

      if (onFileVerified && maxSimilarity < thresholds.dangerThreshold) {
        const hash = await calculateFileHash(file);
        onFileVerified(hash);
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur de connexion. Utilisation de la détection IA locale uniquement.");
      
      // En cas d'erreur réseau, continuer avec l'analyse IA locale seulement
      if (!aiAnalyzing && enableLocalAI && file) {
        analyzeAIContent(file);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (): string => {
    if (!result) return "";

    switch (result.status.level) {
      case "danger":
        return "border-red-500 bg-red-50";
      case "warning":
        return "border-orange-500 bg-orange-50";
      case "success":
        return "border-green-500 bg-green-50";
      default:
        return "";
    }
  };

  return (
    <div className="mb-6">
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="font-medium mb-2">Vérification Pré-soumission Avancée</h3>
        <p className="text-sm text-gray-600 mb-4">
          Vérifiez la similarité et détectez automatiquement le contenu IA avant de soumettre votre mémoire.
        </p>

        {/* Option pour activer/désactiver la détection IA locale */}
        <div className="mb-4 p-3 bg-white rounded-lg border">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={enableLocalAI}
              onChange={(e) => setEnableLocalAI(e.target.checked)}
              className="form-checkbox h-4 w-4 text-purple-600"
            />
            <span className="text-sm font-medium text-gray-700">
              Activer la détection dIA locale (recommandé)
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Analyse le document localement sans appels réseau pour détecter le contenu généré par IA
          </p>
        </div>

        <div className="flex space-x-3 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sélectionner votre mémoire PDF
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
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          <div className="flex items-end">
            <button
              onClick={checkSimilarity}
              disabled={loading || !file || aiAnalyzing}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Vérifier
                </>
              )}
            </button>
          </div>
        </div>

        {/* Barre de progression de la similarité */}
        {loading && (
          <div className="py-3">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-blue-600 animate-pulse"></div>
            </div>
            <p className="text-sm text-center mt-1 text-gray-600">
              Analyse de similarité en cours...
            </p>
          </div>
        )}

        {/* Barre de progression globale de l'IA */}
        {aiResult && !aiAnalyzing && (
          <div className="py-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Détection IA</span>
              <span className={`text-sm font-medium ${
                aiResult.aiPercentage >= 70 ? 'text-red-600' :
                aiResult.aiPercentage >= 50 ? 'text-orange-600' :
                aiResult.aiPercentage >= 30 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {aiResult.aiPercentage}%
              </span>
            </div>
            <Progress 
              value={aiResult.aiPercentage} 
              className="w-full h-3"
            />
            <p className="text-xs text-center mt-1 text-gray-500">
              {aiResult.aiPercentage >= 70 ? 'Très forte probabilité de contenu IA' :
               aiResult.aiPercentage >= 50 ? 'Forte probabilité de contenu IA' :
               aiResult.aiPercentage >= 30 ? 'Probabilité modérée de contenu IA' : 'Faible probabilité de contenu IA'}
            </p>
          </div>
        )}

        {/* Composant de détection IA */}
        {enableLocalAI && (aiAnalyzing || aiResult) && (
          <AIDetectionProgress
            progress={aiProgress}
            result={aiResult}
            isAnalyzing={aiAnalyzing}
          />
        )}

        {/* Résultats de similarité */}
        {result && !loading && (
          <>
            <div
              className={`p-3 border rounded-md mb-4 flex items-center ${getStatusColor()}`}
            >
              {result.status.level === "danger" && (
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              )}
              {result.status.level === "warning" && (
                <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              )}
              {result.status.level === "success" && (
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              )}
              <span className="text-sm">{result.status.message}</span>
            </div>
            
            <SimilarityReport 
              similarityData={result} 
              onSimilarityValidation={(isValid) => {
                if (onFileVerified && file && isValid) {
                  calculateFileHash(file).then(hash => {
                    onFileVerified(hash);
                  });
                }
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default PreUploadChecker;