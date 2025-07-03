'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle, FileText, ShieldCheck, FileCheck2, Upload } from "lucide-react";
import { toast } from "react-toastify";
import type { SimilarityResult } from "../components/PreUploadChecker";
import type { AIDetectionResult } from "../utils/aiDetection";
import { getApiUrl } from "../utils/config";
import { AIDetector, extractTextFromPDF } from "../utils/aiDetection";
import { motion } from "framer-motion";
import AIDetectionProgress from "../components/AIDetectionProgress";
import PreUploadChecker from "../components/PreUploadChecker";

const steps = [
  {
    id: 1,
    label: "Analyse IA",
    icon: <ShieldCheck size={24} />,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    description: "Vérification du contenu par intelligence artificielle"
  },
  {
    id: 2,
    label: "Similarité",
    icon: <FileCheck2 size={24} />,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    description: "Analyse des similitudes avec la base de données"
  },
  {
    id: 3,
    label: "Soumission",
    icon: <FileText size={24} />,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50",
    description: "Finalisation et envoi de votre document"
  },
];

type StepIndicatorProps = {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
};

const StepIndicator: React.FC<StepIndicatorProps> = ({ step, setStep }) => (
  <div className="relative flex justify-between items-center w-full max-w-4xl mx-auto mb-16">
    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"
        initial={{ width: "0%" }}
        animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    </div>
    {steps.map((s) => {
      const isActive = step === s.id;
      const isCompleted = step > s.id;
      return (
        <motion.div
          key={s.id}
          className="relative flex flex-col items-center group cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => setStep(s.id)}
        >
          <motion.div
            className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 z-10 transition-all duration-500
              ${isCompleted 
                ? "bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-500 text-white" 
                : isActive 
                  ? `bg-gradient-to-br ${s.color} border-white text-white shadow-2xl` 
                  : "bg-white border-gray-300 text-gray-400"
              }`}
            whileHover={{ 
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              y: -2
            }}
            animate={{
              scale: isActive ? 1.1 : 1,
              boxShadow: isActive ? "0 15px 35px rgba(0,0,0,0.2)" : "0 5px 15px rgba(0,0,0,0.1)"
            }}
          >
            {isCompleted ? (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <CheckCircle size={28} />
              </motion.div>
            ) : (
              <motion.div
                animate={{ rotate: isActive ? 360 : 0 }}
                transition={{ duration: 2, repeat: isActive ? Infinity : 0, ease: "linear" }}
              >
                {s.icon}
              </motion.div>
            )}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </motion.div>
          <motion.div
            className="mt-4 text-center max-w-32"
            animate={{ 
              scale: isActive ? 1.05 : 1,
              color: isActive ? "#1f2937" : isCompleted ? "#059669" : "#9ca3af"
            }}
          >
            <p className={`font-bold text-sm mb-1 ${isActive ? "text-gray-800" : isCompleted ? "text-emerald-600" : "text-gray-500"}`}>
              {s.label}
            </p>
            <p className={`text-xs leading-tight ${isActive ? "text-gray-600" : "text-gray-400"}`}>
              {s.description}
            </p>
          </motion.div>
        </motion.div>
      );
    })}
  </div>
);

const SubmitThesisPage: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<AIDetectionResult | null>(null);
  const [similarityResult, setSimilarityResult] = useState<SimilarityResult | null>(null);
  const [form, setForm] = useState<{
    libelle: string;
    annee: string;
    cycle: string;
    speciality: string;
    university: string;
    description: string;
    mention: string;
  }>({
    libelle: "",
    annee: new Date().getFullYear().toString(),
    cycle: "Bachelor",
    speciality: "",
    university: "",
    description: "",
    mention: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [enableLocalAIDetection, setEnableLocalAIDetection] = useState<boolean>(true);

  const handleAIDetect = async (file: File) => {
    setAiResult(null);
    setIsAnalyzing(true);
    try {
      const text = await extractTextFromPDF(file);
      const detector = new AIDetector();
      const result = await detector.analyzeText(text);
      setAiResult(result);
    } catch {
      toast.error("Erreur lors de la détection IA");
      setAiResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderStep1 = () => (
    <div className="w-full max-w-xl mx-auto bg-green-50 rounded-3xl p-8 shadow-xl flex flex-col items-center">
      {/* Icône et titre */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-3">
          <ShieldCheck className="text-white w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Analyse IA</h2>
        <p className="text-gray-600 text-center mb-2">
          Vérification du contenu par intelligence artificielle
        </p>
      </div>
      {/* Switch d'activation */}
      <div className="w-full flex items-center mb-6">
        <input
          type="checkbox"
          id="local-ai-detect"
          checked={enableLocalAIDetection}
          onChange={() => setEnableLocalAIDetection(v => !v)}
          className="mr-2 accent-green-600"
        />
        <label htmlFor="local-ai-detect" className="font-medium text-gray-700">
          Activer la détection d&apos;IA locale <span className="text-xs text-gray-500">(recommandé)</span>
          <div className="text-xs text-gray-400 font-normal">
            Analyse le document localement sans appels réseau pour détecter le contenu généré par IA
          </div>
        </label>
      </div>
      {/* Drag & drop + sélection fichier */}
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
            setFile(f);
            setAiResult(null);
            setSimilarityResult(null);
            if (f && enableLocalAIDetection) handleAIDetect(f);
          }}
        />
      </label>
      {file && (
        <div className="w-full bg-white border border-green-200 rounded-lg px-4 py-2 mb-4 text-gray-700">
          <span className="font-semibold">Fichier sélectionné :</span> {file.name}
        </div>
      )}
      {/* Résultat IA et détails */}
      {enableLocalAIDetection && aiResult && (
        <div className="w-full">
          {/* Résumé score */}
          <div className={`w-full rounded-xl p-4 mb-4 flex flex-col items-center
            ${aiResult.aiPercentage < 70 ? "bg-green-100 border border-green-300" : "bg-red-100 border border-red-300"}`}>
            <div className="flex items-center mb-2">
              {aiResult.aiPercentage < 70 ? (
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              )}
              <span className="font-bold text-lg">
                Score IA : {aiResult.aiPercentage}%
              </span>
            </div>
            <span className={aiResult.aiPercentage < 70 ? "text-green-700" : "text-red-700"}>
              {aiResult.aiPercentage < 70
                ? "Probabilité modérée de contenu IA"
                : "Forte probabilité de contenu IA"}
            </span>
          </div>
          {/* Détails IA */}
          <AIDetectionProgress result={aiResult} isAnalyzing={isAnalyzing} />
        </div>
      )}
      <div className="flex w-full mt-6 justify-between">
        <button
          type="button"
          className="flex items-center px-6 py-3 rounded-xl bg-white text-gray-700 font-semibold border border-gray-300 hover:bg-gray-100 transition"
          onClick={() => router.push("/login")}
        >
          &#8592; Précédent
        </button>
        <button
          className={`px-8 py-3 rounded-xl text-white font-semibold text-lg transition-all duration-200 ${
            aiResult && aiResult.aiPercentage < 70 && file
              ? "bg-gradient-to-r from-green-500 to-green-700 hover:scale-105"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          disabled={!aiResult || aiResult.aiPercentage >= 70 || !file}
          onClick={() => setStep(2)}
          type="button"
        >
          Suivant &rarr;
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col items-center w-full h-full">
      <h2 className="text-2xl font-bold mb-6 text-purple-700">Étape 2 : Vérification de la similarité</h2>
      <PreUploadChecker
        onSimilarityResult={(result: SimilarityResult) => setSimilarityResult(result)}
        onFileVerified={() => {}}
      />
      {similarityResult && (
        <div className={`flex items-center gap-2 p-4 rounded-lg mt-4 w-full max-w-md
          ${similarityResult.status.level === "danger" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {similarityResult.status.level === "danger" ? <AlertTriangle /> : <CheckCircle />}
          <span>
            Taux de similarité : <b>{similarityResult.status.percentage}%</b>
          </span>
        </div>
      )}
      <div className="flex gap-4 mt-8">
        <button
          className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold"
          onClick={() => setStep(1)}
          type="button"
        >
          Retour à l&apos;étape IA
        </button>
        <button
          className={`px-8 py-3 rounded-xl text-white font-semibold text-lg transition-all duration-200 ${
            similarityResult && similarityResult.status.level !== "danger"
              ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          disabled={!similarityResult || similarityResult.status.level === "danger"}
          onClick={() => setStep(3)}
        >
          Suivant
        </button>
      </div>
    </div>
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast.error("Veuillez sélectionner un fichier PDF");
      return;
    }
    setIsSubmitting(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        toast.error("Session expirée, veuillez vous reconnecter");
        return;
      }
      const userData = JSON.parse(storedUser) as { user: { id_etudiant: string } };
      const formData = new FormData();
      formData.append("libelle", form.libelle);
      formData.append("annee", form.annee);
      formData.append("cycle", form.cycle);
      formData.append("speciality", form.speciality);
      formData.append("university", form.university);
      formData.append("description", form.description);
      formData.append("mention", form.mention);
      formData.append("file", file);
      formData.append("id_etudiant", userData.user.id_etudiant);
      formData.append("status", "pending");
      const response = await fetch(getApiUrl("/api/memoire/memoire"), {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Erreur lors de la soumission",
        }));
        throw new Error(errorData.message || "Erreur lors de la soumission");
      }
      const data = await response.json();
      toast.success(data.message || "Mémoire soumis avec succès!");
      setTimeout(() => router.push("/login"), 1500);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error instanceof Error ? error.message : "Une erreur inattendue est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep3 = () => (
    <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-lg mx-auto bg-pink-50 rounded-3xl p-8 shadow-xl space-y-4">
      {/* Icône et titre */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3">
          <FileText className="text-white w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Soumission</h2>
        <p className="text-gray-600 text-center mb-2">
          Finalisation et envoi de votre document
        </p>
      </div>
      {/* Détails du mémoire */}
      <input name="libelle" placeholder="Titre" value={form.libelle} onChange={handleChange} required className="border rounded p-2 w-full" />
      <input name="annee" placeholder="Année" value={form.annee} onChange={handleChange} required className="border rounded p-2 w-full" />
      <input name="speciality" placeholder="Spécialité" value={form.speciality} onChange={handleChange} required className="border rounded p-2 w-full" />
      <input name="university" placeholder="Université" value={form.university} onChange={handleChange} required className="border rounded p-2 w-full" />
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required className="border rounded p-2 w-full" />
      <select name="mention" value={form.mention} onChange={handleChange} required className="border rounded p-2 w-full">
        <option value="">Mention</option>
        <option value="Passable">Passable</option>
        <option value="Bien">Bien</option>
        <option value="Très Bien">Très Bien</option>
        <option value="Excellent">Excellent</option>
      </select>
      {/* Navigation */}
      <div className="flex justify-between w-full mt-6">
        <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={() => setStep(2)}>
          Retour
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-gradient-to-r from-pink-500 to-purple-500 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Soumission en cours..." : "Soumettre"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-3xl -z-10" />
          <motion.h1
            className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
            animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            Soumission de Mémoire
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Processus intelligent de validation et soumission de votre travail académique
          </p>
        </motion.div>
        <StepIndicator step={step} setStep={setStep} />
        <div className="w-full flex-1 flex flex-col justify-center items-center">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
};

export default SubmitThesisPage;