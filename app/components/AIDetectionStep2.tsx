import React, { useState } from "react";
import { AIDetector, AIAnalysisProgress, AIDetectionResult, extractTextFromPDF } from "../utils/aiDetection";
import AIDetectionProgress from "./AIDetectionProgress";

interface Props {
  file: File;
  onAIResult: (result: AIDetectionResult) => void;
  onBack: () => void;
}

const AIDetectionStep: React.FC<Props> = ({ file, onAIResult, onBack }) => {
  const [progress, setProgress] = useState<AIAnalysisProgress>();
  const [result, setResult] = useState<AIDetectionResult>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const text = await extractTextFromPDF(file);
    const detector = new AIDetector((p) => setProgress(p));
    const res = await detector.analyzeText(text);
    setResult(res);
    setIsAnalyzing(false);
    onAIResult(res);
  };

  React.useEffect(() => {
    handleAnalyze();
    // eslint-disable-next-line
  }, [file]);

  return (
    <div>
      <p className="text-center text-gray-500 mb-4">Étape 2 : Vérification du pourcentage IA</p>
      <AIDetectionProgress progress={progress} result={result} isAnalyzing={isAnalyzing} />
      <div className="flex justify-between mt-6">
        <button
          type="button"
          className="px-4 py-2 rounded bg-gray-200 text-gray-700"
          onClick={onBack}
        >
          Retour
        </button>
        {/* Le bouton "Suivant" est géré dans la page principale */}
      </div>
    </div>
  );
};

export default AIDetectionStep;