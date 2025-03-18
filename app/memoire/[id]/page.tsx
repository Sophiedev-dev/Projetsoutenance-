'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Worker, Viewer, Button } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import {
  ChevronLeft,
  Star,
  Download,
  Share2,
  BookOpen,
  User,
  Calendar,
  GraduationCap
} from 'lucide-react';
// import StarRating from '@/app/components/StarRating';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { MentionStars } from '@/app/components/MentionStars';
import ValidationBadge from '@/app/components/ValidationBadge';

const MemoirePage = () => {
  const router = useRouter();
  const params = useParams();
  const [memoire, setMemoire] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    fetchMemoireDetails();
  }, [params.id]);

// Dans votre composant principal
const fetchMemoireDetails = async () => {
  try {
    const response = await fetch(`http://localhost:5000/api/memoire/${params.id}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('Memoire data:', data.memoire); // Debug log
      setMemoire({
        ...data.memoire,
        validated_by_name: data.memoire.admin_name,
        validation_date: data.memoire.validation_date
      });
      setLoading(false);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du mémoire:', error);
    setLoading(false);
  }
};
  
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
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadWithVerification = async () => {
    try {
      console.log('Downloading memoire:', memoire.id_memoire);
      const response = await fetch(`http://localhost:5000/api/memoire/${memoire.id_memoire}/download`);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const data = await response.blob();
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${memoire.libelle}_signed.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Document téléchargé avec succès. Vérifiez la dernière page pour les informations d\'authentification.');
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
                <Button
                  onClick={handleDownloadWithVerification}
                  className="flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger avec signature</span>
                </Button>
              )}
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* En-tête du mémoire */}
      <div className="pt-20 pb-8 bg-white shadow-sm">
      {memoire.status === 'validated' && memoire.validated_by_name && (
    <ValidationBadge 
      adminName={memoire.validated_by_name}
      validationDate={memoire.validation_date ? new Date(memoire.validation_date).toLocaleDateString('fr-FR') : undefined}
    />
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
                <MentionStars mention={memoire.mention} size="lg" />
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
      <div className="flex-1 bg-gray-900 h-[calc(100vh-13rem)]">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          <Viewer
            fileUrl={`http://localhost:5000/${memoire.file_path.split('/').pop()}`}
            // plugins={[defaultLayoutPluginInstance]}
            defaultScale={1.2}
          />
        </Worker>
      </div>
    </div>
  );
};

export default MemoirePage;