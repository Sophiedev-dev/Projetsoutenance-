'use client';

import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, ShieldCheck, UserCheck, BookOpen, GraduationCap, Award, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { Worker, Viewer } from "@react-pdf-viewer/core";
// import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker.entry";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MentionStars } from './components/MentionStars';
// import DocumentVerifier from './components/DocumentVerifier';
import { getApiUrl } from './utils/config';


// Définition des interfaces
interface Memoire {
  id_memoire: string;
  libelle: string;
  file_path: string;
  signature?: string;
  hasSignature?: boolean;
  date_soumission?: string;
  cycle?: string;
  speciality?: string;
  university?: string;
  mention?: string;
  etudiant_nom?: string;
}

interface Stats {
  memoires: number;
  chercheurs: number;
  specialites: number;
}

interface Thumbnails {
  [key: string]: string;
}

const Homepage: React.FC = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [thumbnails, setThumbnails] = useState<Thumbnails>({});
  const [memoires, setMemoires] = useState<Memoire[]>([]);
  const [selectedMemoire, setSelectedMemoire] = useState<Memoire | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<string>('');
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>('');
  const [stats, setStats] = useState<Stats>({
    memoires: 0,
    chercheurs: 0,
    specialites: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (): Promise<void> => {
    try {
      const response = await fetch(getApiUrl('/api/stats'));
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
      console.error("Erreur lors de la récupération des statistiques :", error instanceof Error ? error.message : String(error));
    }
  };

  const fetchMemoires = async (
    status = "validated", 
    cycle = "", 
    search = "", 
    sortBy = "libelle", 
    sortOrder = "asc"
  ): Promise<void> => {
    try {
      const url = new URL(getApiUrl('/api/memoire/memoire'));
      
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
        const memoiresWithSignatures = data.memoire.map((memoire: Memoire) => ({
          ...memoire,
          hasSignature: Boolean(memoire.signature)
        }));
        setMemoires(memoiresWithSignatures);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des mémoires :", error instanceof Error ? error.message : String(error));
    }
  };

  useEffect(() => {
    if (searchTerm) {
      fetchMemoires('validated', '', searchTerm);
    } else {
      fetchMemoires('validated');
    }
  }, [searchTerm]);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const value = e.target.value;
    setSearchTerm(value);
  
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
  
    try {
      const response = await fetch(getApiUrl(`/api/memoire/memoire/suggestions?q=${encodeURIComponent(value)}`));
      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status}`);
      }
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des suggestions :", error instanceof Error ? error.message : String(error));
      setSuggestions([]);
    }
  };


const getPdfThumbnail = async (memoireId: string): Promise<string> => {
  try {
    // Récupérer l'URL signée pour le PDF
    const response = await fetch(getApiUrl(`/api/memoire/${memoireId}/download`));
    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success || !data.url) {
      throw new Error("Invalid response from server");
    }

    // Configurer le worker PDF.js avec le CDN approprié
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js';

    // Charger le PDF avec les options appropriées
    const loadingTask = pdfjsLib.getDocument({
      url: data.url,
      withCredentials: false,
      cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
      cMapPacked: true,
    });

    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not create canvas context");
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    try {
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      return canvas.toDataURL("image/jpeg", 0.5);
    } catch (renderError) {
      console.error("Error rendering PDF page:", renderError);
      throw renderError;
    }
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return "";
  }
};

// Modify the useEffect to handle errors better and prevent multiple simultaneous requests
useEffect(() => {
  const thumbnailCache = new Map<string, string>();
  
  const generateThumbnails = async () => {
    for (const memoire of memoires) {
      if (!thumbnailCache.has(memoire.id_memoire)) {
        try {
          const thumbnail = await getPdfThumbnail(memoire.id_memoire);
          if (thumbnail) {
            thumbnailCache.set(memoire.id_memoire, thumbnail);
            setThumbnails(prev => ({ ...prev, [memoire.id_memoire]: thumbnail }));
          }
        } catch (error) {
          console.error(`Error generating thumbnail for ${memoire.id_memoire}:`, error);
        }
      }
    }
  };

  generateThumbnails();
}, [memoires]);



  const scrollToSection = (id: string): void => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div id="accueil" className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="backdrop-blur-md bg-white/80 fixed w-full z-50 border-b border-gray-200/50"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-bold text-indigo-600"
              >
                ARCHIVA
              </motion.div>

              {/* Desktop Search Bar */}
              <div className="hidden md:flex flex-1 mx-8">
                <div className="relative w-full max-w-2xl">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-indigo-500"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  
                  {/* Suggestions dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg z-50">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
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

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-600" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600" />
                )}
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-4">
                {[
                  { name: "Mémoires", icon: BookOpen, id: "bibliotheque" },
                  { name: "Collections", icon: Award, id: "collections" },
                ].map((item) => (
                  <button
                    key={item.name}
                    className="px-4 py-2 text-gray-600 hover:text-indigo-600 flex items-center gap-2"
                    onClick={() => scrollToSection(item.id)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                ))}
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2"
                  href="/Verif"
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span>Vérification</span>
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2"
                  href="./Sign"
                >
                  <UserCheck className="h-5 w-5" />
                  <span>Admin</span>
                </motion.a>
              </nav>
            </div>

            {/* Mobile Search - Always visible on mobile */}
            <div className="mt-3 md:hidden">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-indigo-500"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden border-t border-gray-200"
            >
              <div className="px-4 py-3 space-y-3">
                {[
                  { name: "Mémoires", icon: BookOpen, id: "bibliotheque" },
                  { name: "Collections", icon: Award, id: "collections" },
                ].map((item) => (
                  <button
                    key={item.name}
                    className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                    onClick={() => scrollToSection(item.id)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                ))}
                <a
                  href="/Verif"
                  className="w-full px-4 py-2 text-left bg-emerald-500 text-white rounded-lg flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span>Vérification</span>
                </a>
                <a
                  href="./Sign"
                  className="w-full px-4 py-2 text-left bg-indigo-500 text-white rounded-lg flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserCheck className="h-5 w-5" />
                  <span>Admin</span>
                </a>
              </div>
            </motion.div>
          )}
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
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full md:w-3/5 lg:w-1/2 text-white z-10"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              La bibliothèque numérique des mémoires
            </h1>
            <p className="text-lg md:text-xl opacity-80 mb-8">
              Explorez, recherchez et consultez des milliers de mémoires académiques dans notre base de données sécurisée.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-2xl font-bold">{stats.memoires}</span>
                  <p className="text-sm opacity-70">Mémoires</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-2xl font-bold">{stats.chercheurs}</span>
                  <p className="text-sm opacity-70">Chercheurs</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-2xl font-bold">{stats.specialites}</span>
                  <p className="text-sm opacity-70">Spécialités</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button 
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2"
                onClick={() => scrollToSection("bibliotheque")}
              >
                <BookOpen className="w-5 h-5" />
                Explorer les mémoires
              </button>
              <a 
                href="/Verif" 
                className="px-6 py-3 bg-white hover:bg-gray-200 text-indigo-900 rounded-lg font-medium flex items-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                Vérifier un document
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Deuxième section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative py-12 sm:py-16 lg:py-20 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-6"
            >
              Trouvez la connaissance académique dont vous avez besoin
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Notre plateforme centralise les mémoires académiques et propose des outils de vérification anti-plagiat.
            </motion.p>
          </div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
          >
            {/* Feature Cards */}
            {[
              {
                icon: BookOpen,
                title: "Bibliothèque Numérique",
                description: "Accédez à des milliers de mémoires académiques classés et vérifiés.",
                color: "from-blue-500 to-cyan-400"
              },
              {
                icon: ShieldCheck,
                title: "Vérification Anti-Plagiat",
                description: "Vérifiez l'originalité de vos documents grâce à notre technologie avancée.",
                color: "from-emerald-500 to-teal-400"
              },
              {
                icon: GraduationCap,
                title: "Classification par Disciplines",
                description: "Trouvez facilement des travaux dans votre domaine d'études ou de recherche.",
                color: "from-orange-500 to-amber-400"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 border border-gray-100 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Ajoutez votre recherche - Section CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 relative overflow-hidden"
      >
        {/* Cercles decoratifs */}
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-indigo-500 opacity-20" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-500 opacity-20" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Contribuez à notre base de connaissances
            </h2>
            <p className="text-lg lg:text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Déposez votre mémoire ou thèse académique et faites profiter la communauté de vos recherches.
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
                <div className="flex flex-wrap gap-2">
                  {["Bachelor", "Master", "Doctorat"].map((cycle) => (
                    <button
                      key={cycle}
                      onClick={() => {
                        setSelectedCycle(selectedCycle === cycle ? '' : cycle);
                        fetchMemoires('validated', selectedCycle === cycle ? '' : cycle, searchTerm);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCycle === cycle
                          ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      {cycle}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specialities filter */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                  Filtrer par spécialité
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["Informatique", "Marketing", "Finance", "Droit", "Médecine"].map((spec) => (
                    <button
                      key={spec}
                      onClick={() => setSelectedSpeciality(selectedSpeciality === spec ? '' : spec)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedSpeciality === spec
                          ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Group by Cycle then by Speciality */}
          {["Bachelor", "Master", "Doctorat"].map((cycle) => {
            // Filter memoires by current cycle
            const cycleMemoires = memoires.filter(
              (memoire) => !selectedCycle || memoire.cycle === cycle
            );

            // Skip if no memoires in this cycle or if a different cycle is selected
            if (cycleMemoires.length === 0 || (selectedCycle && selectedCycle !== cycle)) {
              return null;
            }

            // Get all unique specialities in this cycle
            const specialities = Array.from(
              new Set(cycleMemoires.map((memoire) => memoire.speciality || "Non spécifié"))
            );

            return (
              <div key={cycle} className="mb-16">
                <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                  <GraduationCap className="w-6 h-6 mr-2 text-indigo-600" />
                  {cycle}
                </h3>

                {specialities.map((speciality) => (
                  <div key={speciality} className="mb-10">
                    <div className="mb-6 border-l-4 border-purple-500 pl-4">
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
                                <MentionStars mention={memoire.mention as "Passable" | "Bien" | "Tres Bien" | "Excellent" | null} size="sm" />
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
                                    {memoire.speciality || "Non spécifié"}
                                  </span>
                                  {memoire.hasSignature && (
                                    <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full flex items-center">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Certifié
                                    </span>
                                  )}
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500">
                                    {memoire.date_soumission && format(new Date(memoire.date_soumission), "dd MMM yyyy", { locale: fr })}
                                  </span>
                                  <span className="text-xs font-medium text-gray-700">
                                    {memoire.etudiant_nom || "Auteur inconnu"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de prévisualisation */}
      {selectedMemoire && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-6xl rounded-xl shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                <h3 className="text-xl font-bold text-gray-800">{selectedMemoire.libelle}</h3>
                <button 
                  onClick={() => setSelectedMemoire(null)}
                  className="p-1 hover:bg-gray-200 rounded-full"
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
                    fileUrl={getApiUrl(`/${selectedMemoire.file_path}`)}
                  />
                </Worker>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
