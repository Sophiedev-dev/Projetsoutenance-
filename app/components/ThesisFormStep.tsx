import React, { useState } from "react";
import { toast } from "react-toastify";
import { getApiUrl } from "../utils/config";
import { AlertTriangle } from "lucide-react";
import type { SimilarityResult } from "./PreUploadChecker";
import type { AIDetectionResult } from "../utils/aiDetection";

interface ThesisFormStepProps {
  file: File;
  similarityResult: SimilarityResult;
  aiResult: AIDetectionResult;
  onBack: () => void;
}

const ThesisFormStep: React.FC<ThesisFormStepProps> = ({
  similarityResult,
  aiResult,
  onBack,
}) => {
  const [form, setForm] = useState({
    libelle: "",
    annee: new Date().getFullYear().toString(),
    cycle: "Bachelor",
    speciality: "",
    university: "",
    description: "",
    mention: "",
    file: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLInputElement && e.target.type === "file") {
      setForm({ ...form, [name]: e.target.files ? e.target.files[0] : null });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (similarityResult.status.level === "danger") {
      toast.error(`Soumission impossible : Le taux de similarité (${similarityResult.status.percentage}%) dépasse le seuil autorisé (${similarityResult.status.similarity_danger_threshold}%)`);
      return;
    }
    if (!form.file) {
      toast.error('Veuillez sélectionner un fichier PDF');
      return;
    }

    setIsSubmitting(true);

    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        toast.error('Session expirée, veuillez vous reconnecter');
        return;
      }

      const userData = JSON.parse(storedUser) as { user: { id_etudiant: string } };
      const formData = new FormData();
      formData.append('libelle', form.libelle);
      formData.append('annee', form.annee);
      formData.append('cycle', form.cycle);
      formData.append('speciality', form.speciality);
      formData.append('university', form.university);
      formData.append('description', form.description);
      formData.append('mention', form.mention);
      formData.append('file', form.file);
      formData.append('id_etudiant', userData.user.id_etudiant);
      formData.append('status', 'pending');

      const response = await fetch(getApiUrl('/api/memoire/memoire'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Erreur lors de la soumission'
        }));
        throw new Error(errorData.message || 'Erreur lors de la soumission');
      }

      const data = await response.json();
      toast.success(data.message || 'Mémoire soumis avec succès!');
      // Tu peux ajouter ici une redirection ou un reset du formulaire si besoin

    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur inattendue est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const similarityDanger = similarityResult.status.level === "danger";
  const aiDanger = aiResult.aiPercentage >= 70; // adapte le seuil si besoin

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-center text-gray-500 mb-4">Étape 3 : Remplir les informations du mémoire</p>
      <div className="grid grid-cols-1 gap-4">
        <input name="libelle" placeholder="Titre" value={form.libelle} onChange={handleChange} required className="border rounded p-2" />
        <input name="annee" placeholder="Année" value={form.annee} onChange={handleChange} required className="border rounded p-2" />
        <input name="speciality" placeholder="Spécialité" value={form.speciality} onChange={handleChange} required className="border rounded p-2" />
        <input name="university" placeholder="Université" value={form.university} onChange={handleChange} required className="border rounded p-2" />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required className="border rounded p-2" />
        <select name="mention" value={form.mention} onChange={handleChange} required className="border rounded p-2">
          <option value="">Mention</option>
          <option value="Passable">Passable</option>
          <option value="Bien">Bien</option>
          <option value="Très Bien">Très Bien</option>
          <option value="Excellent">Excellent</option>
        </select>
        <input
          type="file"
          name="file"
          accept=".pdf"
          onChange={handleChange}
          required
          className="border rounded p-2 w-full"
        />
      </div>
      {(similarityDanger || aiDanger) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>
            {similarityDanger && "Le taux de similarité est trop élevé. "}
            {aiDanger && "Le pourcentage IA est trop élevé."}
          </span>
        </div>
      )}
      <div className="flex justify-between mt-6">
        <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={onBack}>
          Retour
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-purple-500 text-white"
          disabled={isSubmitting || similarityDanger || aiDanger}
        >
          {isSubmitting ? "Soumission en cours..." : "Soumettre"}
        </button>
      </div>
    </form>
  );
};

export default ThesisFormStep;