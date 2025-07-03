import React from "react";
import { Upload, CheckCircle, AlertTriangle } from "lucide-react";
import type { AIDetectionResult } from "../utils/aiDetection";
import AIDetectionProgress from "./AIDetectionProgress";

interface AIStepCardProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  aiResult: AIDetectionResult | null;
  isAnalyzing: boolean;
  onAnalyze: (file: File) => void;
  onNext: () => void;
}

const AIStepCard: React.FC<AIStepCardProps> = ({
  file,
  onFileChange,
  aiResult,
  isAnalyzing,
  onAnalyze,
  onNext,
}) => (
  <div className="w-full max-w-xl mx-auto bg-green-50 rounded-3xl p-8 shadow-xl flex flex-col items-center">
    <div className="flex flex-col items-center mb-6">
      <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center mb-3">
        <Upload className="text-white w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-green-900 mb-1">Analyse IA</h2>
      <p className="text-gray-600 text-center mb-2">
        Vérification du contenu par intelligence artificielle
      </p>
    </div>
    <label
      htmlFor="file-upload"
      className="w-full flex flex-col items-center justify-center h-40 border-2 border-dashed border-green-300 rounded-xl bg-white cursor-pointer hover:bg-green-100 transition mb-4"
    >
      <Upload className="w-10 h-10 text-green-300 mb-2" />
      <span className="text-green-700 font-medium">Glissez votre fichier PDF ici</span>
      <span className="text-sm text-gray-400">ou cliquez pour parcourir</span>
      <input
        id="file-upload"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0] || null;
          onFileChange(f);
          if (f) onAnalyze(f);
        }}
      />
    </label>
    {file && (
      <div className="w-full bg-white border border-green-200 rounded-lg px-4 py-2 mb-4 text-gray-700">
        <span className="font-semibold">Fichier sélectionné :</span> {file.name}
      </div>
    )}
    {aiResult && !isAnalyzing && (
      <div className={`w-full rounded-xl p-4 mb-4 flex flex-col items-center
        ${aiResult.aiPercentage < 70 ? "bg-green-100 border border-green-300" : "bg-red-100 border border-red-300"}`}>
        <div className="flex items-center mb-2">
          {aiResult.aiPercentage < 70 ? (
            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
          )}
          <span className="font-bold text-lg">
            Résultat: {aiResult.aiPercentage}% IA détectée
          </span>
        </div>
        <span className={aiResult.aiPercentage < 70 ? "text-green-700" : "text-red-700"}>
          {aiResult.aiPercentage < 70
            ? "Document conforme aux standards"
            : "Taux IA trop élevé"}
        </span>
      </div>
    )}
    {/* Détails IA */}
    {aiResult && (
      <div className="w-full">
        <AIDetectionProgress result={aiResult} isAnalyzing={isAnalyzing} />
      </div>
    )}
    <div className="flex w-full mt-6">
      <button
        className={`ml-auto px-8 py-3 rounded-xl text-white font-semibold text-lg transition-all duration-200 ${
          aiResult && aiResult.aiPercentage < 70 && file
            ? "bg-gradient-to-r from-green-500 to-green-700 hover:scale-105"
            : "bg-gray-300 cursor-not-allowed"
        }`}
        disabled={!aiResult || aiResult.aiPercentage >= 70 || !file}
        onClick={onNext}
        type="button"
      >
        Suivant
      </button>
    </div>
  </div>
);

export default AIStepCard;