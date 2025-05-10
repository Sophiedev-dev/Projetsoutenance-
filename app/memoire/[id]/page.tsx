'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import {
  ChevronLeft,
  Download,
  Share2,
  User,
  Calendar,
  GraduationCap,
  CheckCircle2
} from 'lucide-react';
// import StarRating from '@/app/components/StarRating';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { MentionStars } from '@/app/components/MentionStars';
// import ValidationBadge from '@/app/components/ValidationBadge';
import { motion } from 'framer-motion';
import { getApiUrl } from '@/app/utils/config';

interface Memoire {
  id_memoire: string;
  libelle: string;
  etudiant_nom: string;
  annee: string;
  cycle: string;
  speciality: string;
  mention?: number;
  status: string;
  admin_name?: string;
  validation_date?: string;
  file_path: string;
  validated_by_name?: string;
}

const getMentionLabel = (mention: number | undefined): "Passable" | "Bien" | "Tres Bien" | "Excellent" | null => {
  switch (mention) {
    case 1:
      return "Passable";
    case 2:
      return "Bien";
    case 3:
      return "Tres Bien";
    case 4:
      return "Excellent";
    default:
      return null;
  }
};


const MemoirePage = () => {
  const router = useRouter();
  const params = useParams();
  const [memoire, setMemoire] = useState<Memoire | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>('');

  useEffect(() => {
    const fetchMemoireDetails = async () => {
      try {
        const response = await fetch(getApiUrl(`/api/memoire/${params.id}`));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.success) {
          setMemoire({
            ...data.memoire,
            validated_by_name: data.memoire.admin_name,
            validation_date: data.memoire.validation_date
          });
          
          // Récupérer l'URL signée
          const downloadResponse = await fetch(getApiUrl(`/api/memoire/${params.id}/download`));
          if (!downloadResponse.ok) {
            throw new Error(`HTTP error! status: ${downloadResponse.status}`);
          }
          
          const downloadData = await downloadResponse.json();
          if (downloadData.success && downloadData.url) {
            setPdfUrl(downloadData.url);
          } else {
            throw new Error('URL de téléchargement non disponible');
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des détails du mémoire:', error);
        setLoading(false);
        // Afficher un message d'erreur à l'utilisateur
        alert('Erreur lors du chargement du document. Veuillez réessayer plus tard.');
      }
    };
  
    fetchMemoireDetails();
  }, [params.id]);

  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!memoire) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Mémoire non trouvé</h2>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadWithVerification = async () => {
    try {
      console.log('Downloading memoire:', memoire.id_memoire);
      const response = await fetch(getApiUrl(`/api/memoire/${memoire.id_memoire}/download`));
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.url) {
        throw new Error('URL de téléchargement non disponible');
      }

      // Correction de l'URL S3
      const correctedUrl = data.url.replace('ue-north-1', 'eu-north-1');
      
      // Télécharger le fichier à partir de l'URL signée corrigée
      const pdfResponse = await fetch(correctedUrl);
      if (!pdfResponse.ok) {
        throw new Error('Erreur lors du téléchargement du PDF');
      }

      const pdfBlob = await pdfResponse.blob();
      const pdfBlobWithType = new Blob([pdfBlob], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlobWithType);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${memoire.libelle}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Document téléchargé avec succès');
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Erreur lors du téléchargement. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="flex items-center text-gray-600 hover:text-blue-600"
              >
                <ChevronLeft className="h-6 w-6" />
                <span className="ml-2">Retour</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {memoire.status === 'validated' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadWithVerification}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Download className="w-5 h-5" />
                  <span className="font-medium">Télécharger</span>
                </motion.button>
              )}
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* En-tête du mémoire */}
      <div className="pt-20 pb-8 bg-white shadow-sm relative">
        {memoire.status === 'validated' && (
          <div className="absolute top-4 right-8 flex items-center bg-green-50 border-2 border-green-200 px-6 py-3 rounded-full shadow-lg transform translate-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium whitespace-nowrap">Document Authentifié</span>
            </div>
          </div>
        )}
        
        {memoire.status === 'validated' && memoire.validated_by_name && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 rounded-lg p-4 shadow-sm ml-auto max-w-lg">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Document Signé Electroniquement</h3>
                  <p className="text-green-600">
                  Signé par {memoire.validated_by_name} le&nbsp
                    {memoire.validation_date ? new Date(memoire.validation_date).toLocaleDateString('fr-FR') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{memoire.libelle}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <User className="h-5 w-5 mr-2" />
                <span>Etudiant: {memoire.etudiant_nom}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Année: {memoire.annee}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <GraduationCap className="h-5 w-5 mr-2" />
                <span>Cycle: {memoire.cycle}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <GraduationCap className="h-5 w-5 mr-2" />
                <span>Spécialité: {memoire.speciality}</span>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Mention</h3>
                {memoire.mention ? (
                  <MentionStars mention={getMentionLabel(memoire.mention)} size="lg" />
                ) : (
                <span className="text-gray-500">Non noté</span>
                )}
             </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              {/* <StarRating id_memoire={memoire.id_memoire} /> */}
            </div>
          </div>
        </div>
      </div>

      {/* Visionneuse PDF */}
{/* Visionneuse PDF */}
<div className="flex-1 bg-gray-900 h-[calc(100vh-13rem)]">
  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
    {pdfUrl ? (
      <Viewer
        fileUrl={pdfUrl
          .replace('ue-north-1', 'eu-north-1')
          .replace(/\\/g, '/')}
        defaultScale={1.2}
      />
    ) : (
      <div className="flex items-center justify-center h-full">
        <p className="text-white">Chargement du PDF...</p>
      </div>
    )}
  </Worker>
</div>
    </div>
  );
};

export default MemoirePage;