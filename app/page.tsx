'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search, ShoppingCart, User } from 'lucide-react';
import Image from 'next/image';
import { Worker, Viewer  } from "@react-pdf-viewer/core";
import {  defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { pdfjs } from 'react-pdf';

// Styles pour react-pdf-viewer

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`;

const Homepage = () => {
  const [memoires, setMemoires] = useState([]);
  const [selectedMemoire, setSelectedMemoire] = useState(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

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

        <div className="relative">
        <div className="flex space-x-8 overflow-x-auto pb-8 scrollbar-hide">
            {/* Liste des mémoires */}
            <div className="flex space-x-8 overflow-x-auto">
                {memoires.map((memoire) => (
                    <div
                        key={memoire.id_memoire}
                        className="flex-none w-64 transform hover:scale-105 transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedMemoire(memoire)}
                    >
                       <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <img
                  src={`http://localhost:5000/${memoire.file_path}`}
                  alt={memoire.libelle}
                  className="w-full h-80 object-cover"
                />
                <div className="w-full h-80">
                  {/* Affichage de la première page du PDF */}
                  <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                    <Viewer fileUrl={`http://localhost:5000/${memoire.file_path}`} plugins={[defaultLayoutPluginInstance]} />
                  </Worker>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2">{memoire.libelle}</h3>
                  <p className="text-gray-600">{memoire.etudiant_nom}</p>
                  <span className="inline-block mt-4 px-4 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                    Validated
                  </span>
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
              <div className="h-full">
                <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                  <Viewer fileUrl={`http://localhost:5000/${selectedMemoire.file_path}`} plugins={[defaultLayoutPluginInstance]} />
                </Worker>
              </div>
            </div>
          </div>
        )}
        </div>
          <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Homepage;