'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, ShoppingCart, User, CheckCircle2, ShieldCheck, UserCheck, BookOpen, GraduationCap, Award } from 'lucide-react';
import Image from 'next/image';
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker.entry";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MentionStars } from './components/MentionStars';
import DocumentVerifier from './components/DocumentVerifier';

const Homepage = () => {
  const router = useRouter();
  const [thumbnails, setThumbnails] = useState({});
  const [memoires, setMemoires] = useState([]);
  const [selectedMemoire, setSelectedMemoire] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState('');
  const [activeTab, setActiveTab] = useState('accueil');
  const [selectedSpeciality, setSelectedSpeciality] = useState('');
  const [stats, setStats] = useState({
    memoires: 0,
    chercheurs: 0,
    specialites: 0,
  });
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    setIsClient(true);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stats');
      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      setStats({
        memoires: data.memoires || 0,
        chercheurs: data.chercheurs || 0,
        specialites: data.specialites || 0,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques :", error.message);
    }
  };

  
  //   if (!query.trim()) {
  //     setSuggestions([]);
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`http://localhost:5000/api/memoire/suggestions?q=${encodeURIComponent(query)}`);
  //     if (!response.ok) {
  //       throw new Error(`Erreur serveur : ${response.status}`);
  //     }

  //     const data = await response.json();
  //     setSuggestions(data.suggestions || []);
  //   } catch (error) {
  //     console.error("Erreur lors de la récupération des suggestions :", error);
  //   }
  // };

  const fetchMemoires = async (status = "validated", cycle = "", search = "", sortBy = "libelle", sortOrder = "asc") => {
    try {
      let url = new URL('http://localhost:5000/api/memoire/memoire');
      
      // Add query parameters
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (cycle) params.append('cycle', cycle);
      if (search) params.append('search', search.toLowerCase());
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      
      url.search = params.toString();
  
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status} - ${response.statusText}`);
      }
  
      const data = await response.json();
  
      // Map the data to include signature information
      if (data && Array.isArray(data.memoire)) {
        const memoiresWithSignatures = data.memoire.map(memoire => ({
          ...memoire,
          hasSignature: Boolean(memoire.signature)
        }));
        setMemoires(memoiresWithSignatures);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des mémoires :", error.message);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      fetchMemoires('validated', '', searchTerm);
    } else {
      fetchMemoires('validated');
    }
  }, [searchTerm]);

  //   fetchSuggestions(value);

  // };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:5000/api/memoire/memoire/suggestions?q=${encodeURIComponent(value)}`);
      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status}`);
      }
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des suggestions :", error);
      setSuggestions([]);
    }
  };

  const getPdfThumbnail = async (pdfUrl) => {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    return canvas.toDataURL("image/png");
  };

  useEffect(() => {
    memoires.forEach(async (memoire) => {
      const thumbnail = await getPdfThumbnail(`http://localhost:5000/${memoire.file_path}`);
      setThumbnails((prev) => ({ ...prev, [memoire.id_memoire]: thumbnail }));
    });
  }, [memoires]);

  return (
    <div id ="accueil" className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="backdrop-blur-md bg-white/80 fixed w-full z-50 border-b border-gray-200/50"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600"
            >
              ARCHIVA
            </motion.div>

            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  className="flex items-center bg-white/70 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <Search className="absolute left-4 text-indigo-500" size={20} />
                  <input
                    type="text"
                    placeholder="Rechercher par titre, auteur ou mot-clé..."
                    className="w-full pl-12 pr-6 py-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-full text-gray-700"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
              </motion.div>

              {suggestions.length > 0 && (
                  <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg z-50">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSearchTerm(suggestion);
                          setSuggestions([]);
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
               )}
              </div>
            </div>
          </div>

          <nav className="flex flex-col md:flex-row justify-between py-4 space-y-4 md:space-y-0">
            <motion.div
              className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {[
                { name: 'Accueil', icon: BookOpen, id: "accueil"},
                { name: 'Mémoires', icon: GraduationCap, id: "bibliotheque"  },
                { name: 'Collections', icon: Award, id: "collections"},
              ].map((item) => (
                <motion.a
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors duration-300 cursor-pointer px-3 py-2"
                  onClick={() => {
                    if (item.href) {
                      router.push(item.href);
                    } else {
                      setActiveTab(item.id);
                      document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  <item.icon size={18} />
                  <span className="text-sm md:text-base">{item.name}</span>
                </motion.a>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-wrap justify-center md:justify-end items-center gap-3 md:gap-4"
            >
              <motion.a
                whileHover={{ scale: 1.05 }}
                className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 text-sm md:text-base"
                href="/Verif"
              >
                <ShieldCheck size={18} className="hidden sm:block" />
                <span>Vérification</span>
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 text-sm md:text-base"
                href="./Sign"
              >
                <UserCheck size={18} className="hidden sm:block" />
                <span>Espace Admin</span>
              </motion.a>
            </motion.div>
          </nav>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-[url('../images/image.jpg')] bg-cover bg-fixed bg-center h-screen"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            className="w-full md:w-2/3 lg:w-1/2 relative z-10"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 text-white leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Bibliothèque
              </span>
              <br />
              <span className="text-3xl md:text-4xl">Université de Yaoundé I</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 font-light max-w-xl">
              Découvrez notre collection de travaux académiques et contribuez à l'excellence universitaire.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 text-lg font-medium"
              onClick={() => router.push('/Sign')}
            >
              Ajoutez votre recherche
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      <div id="collections" className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { number: stats.memoires, label: "Mémoires disponibles" },
            { number: stats.chercheurs, label: "Chercheurs actifs" },
            { number: stats.specialites, label: "Spécialités" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {stat.number}
              </h3>
              <p className="text-gray-600 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div id="bibliotheque" className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Bibliothèque Numérique
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Explorez notre collection de travaux académiques de qualité
          </p>

          {/* Enhanced Filter Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-12 border border-gray-100">
            <div className="flex flex-col space-y-6">
              {/* Cycles filter */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" />
                  Filtrer par cycle
                </h3>
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedCycle('');
                      setSelectedSpeciality('');
                    }}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      selectedCycle === '' 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    Tous les cycles
                  </motion.button>
                  {['Bachelor', 'Master', 'PhD'].map((cycle) => (
                    <motion.button
                      key={cycle}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedCycle(cycle);
                        setSelectedSpeciality('');
                      }}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        selectedCycle === cycle 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {cycle}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Specialities filter - Animated appearance */}
              {selectedCycle && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                    Spécialités en {selectedCycle}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {[...new Set(memoires
                      .filter(m => m.cycle === selectedCycle)
                      .map(m => m.speciality))]
                      .map((speciality) => (
                        <motion.button
                          key={speciality}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedSpeciality(speciality)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                            selectedSpeciality === speciality 
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          {speciality}
                        </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Keep your existing memoires display code */}
        {['Bachelor', 'Master', 'PhD'].map((cycle) => {
          if (selectedCycle && selectedCycle !== cycle) return null;

          const cycleMemoires = memoires.filter(memoire => {
            const matchesCycle = selectedCycle ? memoire.cycle === cycle : true;
            const matchesSpeciality = selectedSpeciality ? memoire.speciality === selectedSpeciality : true;
            return matchesCycle && matchesSpeciality;
          });

          if (cycleMemoires.length === 0) return null;

          const specialities = [...new Set(cycleMemoires.map(memoire => memoire.speciality))];

          return (
            <div key={cycle} className="mb-16">
              <div className="flex items-center space-x-4 mb-8">
                <h3 className="text-2xl font-semibold text-gray-800">{cycle}</h3>
                <div className="flex-grow h-px bg-gradient-to-r from-blue-200 to-purple-200"></div>
              </div>

              {/* Keep your existing specialities and memoires rendering code */}
              {specialities.map(speciality => (
                <div key={`${cycle}-${speciality}`} className="mb-12">
                  <h4 className="text-xl font-medium text-gray-700 mb-6 pl-4 border-l-4 border-purple-500">
                    {speciality}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {cycleMemoires
                      .filter(memoire => memoire.speciality === speciality)
                      .map((memoire) => (
                        // Your existing memoire card component with all its functionality
                        <div
                          key={memoire.id_memoire}
                          className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                          onClick={() => router.push(`/memoire/${memoire.id_memoire}`)}
                        >
                          <div className="relative w-full h-56 overflow-hidden bg-gray-50">
                            {thumbnails[memoire.id_memoire] ? (
                              <div className="relative w-full h-full">
                                <Image
                                  src={thumbnails[memoire.id_memoire]}
                                  alt="PDF Cover"
                                  width={300}
                                  height={300}
                                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="animate-pulse flex flex-col items-center">
                                  <div className="h-8 w-8 mb-2 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                                  <span className="text-sm text-gray-400">Chargement...</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mb-3">
                            {memoire.mention ? (
                            <MentionStars mention={memoire.mention} size="sm" />
                            ) : (
                           <span className="text-sm text-gray-500">Non noté</span>
                           )}
                         </div>

                          <div className="p-5">
                            <h4 className="text-lg font-medium text-gray-800 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                              {memoire.libelle}
                            </h4>

                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                                {memoire.cycle}
                              </span>
                              <span className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded-full">
                                {memoire.speciality}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <span className="text-sm font-medium text-gray-500">
                                {memoire.annee}
                              </span>
                              <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-full hover:shadow-lg transform hover:scale-105 transition-all">
                                Consulter
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {selectedMemoire && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-11/12 lg:w-2/3 xl:w-1/2 h-[90vh] rounded-lg overflow-hidden shadow-xl">
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex flex-col">
                  <h2 className="font-bold text-lg">{selectedMemoire.libelle}</h2>
                  <div className="mt-2 text-sm">
                    <div className="flex items-center text-green-600">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      <span>Document signé et validé</span>
                    </div>
                    <div className="text-gray-600">
                      Signé par {selectedMemoire.details?.signedBy} le {' '}
                      {selectedMemoire.details?.signedAt ?
                        format(new Date(selectedMemoire.details.signedAt), 'dd MMMM yyyy', { locale: fr })
                        : 'Date non disponible'
                      }
                    </div>
                  </div>
                </div>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedMemoire(null)}
                >
                  ✕
                </button>
              </div>
              <div className="w-full h-full relative">
                <div className="absolute top-20 right-20 z-10 bg-green-50 p-4 rounded-lg shadow-lg border border-green-200 rotate-[-15deg]">
                  <div className="text-green-700 font-medium text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle2 className="w-6 h-6 mr-2" />
                      Document Validé
                    </div>
                    <div className="text-gray-600">
                      Approuvé et Signé
                    </div>
                  </div>
                </div>

                <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                  <Viewer
                    fileUrl={`http://localhost:5000/${selectedMemoire.file_path}`}
                  />
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
