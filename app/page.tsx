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

const Homepage = () => {
  const router = useRouter();
  const [thumbnails, setThumbnails] = useState({});
  const [memoires, setMemoires] = useState([]);
  const [selectedMemoire, setSelectedMemoire] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState('');
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
      setStats(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques :", error.message);
    }
  };

  const fetchMemoires = async (status = "validated", cycle = "", search = "", sortBy = "libelle", sortOrder = "asc") => {
    search = search || "";
    try {
      let url = `http://localhost:5000/api/memoire?status=${status}`;
      if (cycle) url += `&cycle=${cycle}`;
      if (typeof search === "string" && search.trim() !== "") {
        url += `&search=${encodeURIComponent(search.toLowerCase())}`;
      }
      if (sortBy) url += `&sortBy=${sortBy}&sortOrder=${sortOrder}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data.memoire)) {
        let filteredMemoires = data.memoire.filter(memoire =>
          Object.values(memoire).some(value =>
            value && value.toString().toLowerCase().includes(search.toLowerCase())
          )
        );

        filteredMemoires.sort((a, b) => {
          let valueA = a[sortBy];
          let valueB = b[sortBy];

          if (typeof valueA === "number" && typeof valueB === "number") {
            return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
          } else {
            return sortOrder === "asc"
              ? valueA?.toString().localeCompare(valueB?.toString())
              : valueB?.toString().localeCompare(valueA?.toString());
          }
        });

        setMemoires(filteredMemoires);
      } else {
        console.error("Format inattendu des données reçues :", data);
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

  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/memoire/suggestions?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status}`);
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des suggestions :", error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchSuggestions(value);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
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
              </div>
            </div>
          </div>

          <nav className="flex justify-between py-4">
            <motion.div
              className="flex space-x-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {[
                { name: 'Accueil', icon: BookOpen },
                { name: 'Mémoires', icon: GraduationCap },
                { name: 'Collections', icon: Award }
              ].map((item) => (
                <motion.a
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors duration-300"
                  href="#"
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </motion.a>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <motion.a
                whileHover={{ scale: 1.05 }}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                href="./Sign"
              >
                <UserCheck size={20} />
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

      <div className="max-w-7xl mx-auto px-4 py-16">
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

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 id="current-resumes" className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Bibliothèque Numérique
          </h2>
          <p className="text-gray-600 text-lg">
            Explorez notre collection de travaux académiques de qualité
          </p>
        </div>

        {['Bachelor', 'Master', 'PhD'].map((cycle) => (
          <div key={cycle} className="mb-16">
            <div className="flex items-center space-x-4 mb-8">
              <h3 className="text-2xl font-semibold text-gray-800">{cycle}</h3>
              <div className="flex-grow h-px bg-gradient-to-r from-blue-200 to-purple-200"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {memoires.filter(memoire => memoire.cycle === cycle).map((memoire) => (
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
