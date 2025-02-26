'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Worker, Viewer } from '@react-pdf-viewer/core';
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

const MemoirePage = () => {
  const router = useRouter();
  const params = useParams();
  const [memoire, setMemoire] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    fetchMemoireDetails();
  }, [params.id]);

  const fetchMemoireDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/memoire/${params.id}`);
  
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération du mémoire');
      }
  
      setMemoire(data.memoire);
    } catch (error) {
      console.error('Erreur lors de la récupération du mémoire:', error);
      setMemoire(null);
    } finally {
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barre de navigation supérieure */}
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
            <button
            onClick={() => window.open(`http://localhost:5000/${memoire.file_path}`, '_blank')}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Visualiser"
            >
                 <Download size={20} />
            </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* En-tête du mémoire */}
      <div className="pt-20 pb-8 bg-white shadow-sm">
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