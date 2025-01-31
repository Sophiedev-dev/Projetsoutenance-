'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search, ShoppingCart, User } from 'lucide-react';
import Image from 'next/image';
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
// Ne pas importer pdfjs au début pour éviter l'erreur `window is not defined`
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker.entry";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const Homepage = () => {
  const [memoires, setMemoires] = useState([]);
  const [selectedMemoire, setSelectedMemoire] = useState(null);
  const [isClient, setIsClient] = useState(false); // Etat pour gérer l'exécution côté client
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    setIsClient(true); // Quand le composant est monté côté client
  }, []);

  const fetchMemoires = async (status = 'validated') => {
    try {
      const response = await fetch(`http://localhost:5000/api/memoire?status=${status}`);
      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status} - ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("Données reçues :", data);
  
      if (data && Array.isArray(data.memoire)) {
        setMemoires(data.memoire);
      } else {
        console.error('Format inattendu des données reçues :', data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des mémoires :', error.message);
    }
  };

  useEffect(() => {
    fetchMemoires('validated');
  }, []);

  const getPdfThumbnail = async (pdfUrl) => {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1); // Récupère la première page
  
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
  
    canvas.width = viewport.width;
    canvas.height = viewport.height;
  
    await page.render({ canvasContext: context, viewport }).promise;
  
    return canvas.toDataURL("image/png"); // Convertit en image
  };

  const [thumbnails, setThumbnails] = useState<{ [key: number]: string }>({});

useEffect(() => {
  memoires.forEach(async (memoire) => {
    const thumbnail = await getPdfThumbnail(`http://localhost:5000/${memoire.file_path}`);
    setThumbnails((prev) => ({ ...prev, [memoire.id_memoire]: thumbnail }));
  });
}, [memoires]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header avec effet de verre */}
      <header className="backdrop-blur-md bg-white/70 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              BANK-MEMO
            </div>
            
            {/* Barre de recherche modernisée */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Rechercher un mémoire..."
                  className="w-full px-6 py-3 border-none rounded-full bg-gray-100/80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 group-hover:bg-white"
                />
                <Search className="absolute right-4 top-3 text-gray-400 group-hover:text-blue-500 transition-colors" size={20} />
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ShoppingCart className="text-gray-600 hover:text-blue-500 transition-colors" size={24} />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <User className="text-gray-600 hover:text-blue-500 transition-colors" size={24} />
              </button>
            </div>
          </div>

          {/* Navigation avec effet de survol animé */}
          <nav className="flex space-x-8 py-4">
            {['Home', 'Books', 'Magazines', 'Textbooks', 'Audiobooks', 'Recommended', 'Sale'].map((item) => (
              <a
                key={item}
                href="#"
                className="relative text-gray-600 hover:text-blue-500 transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-500 hover:after:w-full after:transition-all"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Section héro avec overlay amélioré */}
      <div>
        <div className="relative bg-[url('../images/imag.jpg')] bg-cover bg-center h-screen">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 py-16 h-full flex items-center">
            <div className="w-1/2 relative z-10">
              <h2 className="text-6xl font-black mb-6 text-white leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  ARCHIVA
                </span>
                <br />
                <span className="text-4xl">Université de Yaoundé I</span>
              </h2>
              <p className="text-xl text-gray-200 mb-8 font-light">
                Building Tomorrow's Leaders Through Academic Excellence
              </p>
              <Link href="./Sign">
                <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-10 py-4 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 text-lg font-medium">
                  ADD RESUME
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Section des mémoires avec effet de carte moderne */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-gray-800">Current Resumes</h2>
          <a href="#" className="text-blue-500 hover:text-blue-700 transition-colors text-lg">
            View All → 
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Liste des mémoires */}
          {memoires.map((memoire) => (
           <div
               key={memoire.id_memoire}
               className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
               onClick={() => setSelectedMemoire(memoire)}
            >
             {/* Conteneur de l'image avec effet de profondeur */}
           <div className="relative w-full h-64 overflow-hidden">
               {thumbnails[memoire.id_memoire] ? (
                <div className="relative w-full h-full">
                  <Image
                     src={thumbnails[memoire.id_memoire]}
                     alt="PDF Cover"
                     width={300}
                     height={400}
                     className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
               </div>
               ) : (
               <div className="w-full h-full flex items-center justify-center bg-gray-100">
                 <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-8 mb-2 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-sm text-gray-400">Chargement...</span>
               </div>
              </div>
            )}
       </div>

    {/* Informations du mémoire */}
    <div className="p-4 space-y-2">
      <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
        {memoire.libelle}
      </h3>
      
      <div className="flex flex-wrap gap-2">
        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
          {memoire.cycle}
        </span>
        <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded-full">
          {memoire.speciality}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-sm font-medium text-gray-500">
          {memoire.annee}
        </span>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700">
          Voir plus
        </button>
      </div>
    </div>
  </div>
))}
        </div>

        {/* Prévisualisation du PDF */}
        {selectedMemoire && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-11/12 lg:w-2/3 xl:w-1/2 h-[90vh] rounded-lg overflow-hidden shadow-xl">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="font-bold text-lg">{selectedMemoire.libelle}</h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedMemoire(null)}
                >
                  ✕
                </button>
              </div>
              <div className="w-full h-full">
                <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                  <Viewer fileUrl={`http://localhost:5000/${selectedMemoire.file_path}`} plugins={[defaultLayoutPluginInstance]} />
                </Worker>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
