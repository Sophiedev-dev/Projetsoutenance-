'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle2, ShieldCheck, UserCheck, BookOpen, GraduationCap, Award, Menu, X, ChevronDown, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "pdfjs-dist/build/pdf.worker.entry";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MentionStars } from './components/MentionStars';
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
  status?: string;
}

interface Stats {
  memoires: number;
  chercheurs: number;
  specialites: number;
}

interface Thumbnails {
  [key: string]: string;
}

// Définition des cycles avec leurs spécialités respectives
const CYCLE_SPECIALITIES: Record<string, string[]> = {
  'Bachelor': [
    'Sécurité',
    'Réseaux',
    'Génie Logiciel'
  ],
  'Master': [
    'Sécurité',
    'Réseaux',
    'Génie Logiciel'
  ],
  'PhD': [
    'Sécurité',
    'Réseaux',
    'Génie Logiciel'
  ]
};

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
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [isLoadingDocument, setIsLoadingDocument] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats>({
    memoires: 0,
    chercheurs: 0,
    specialites: 0,
  });

  const fetchStats = useCallback(async (): Promise<void> => {
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
  }, []);

  const fetchMemoires = useCallback(async (
    status = "validated", 
    search = searchTerm, 
    sortBy = "libelle", 
    sortOrder = "asc"
  ): Promise<void> => {
    try {
      const url = new URL(getApiUrl('/api/memoire/memoire'));
      
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);  
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      if (selectedCycle) params.append('cycle', selectedCycle);
      if (selectedSpeciality) params.append('speciality', selectedSpeciality);
      
      url.search = params.toString();
  
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status} - ${response.statusText}`);
      }
  
      const data = await response.json();
  
      if (data && Array.isArray(data.memoire)) {
        // Génération de mémoires simulés avec classification par cycle
        const simulatedMemoires: Memoire[] = [];
        
        Object.entries(CYCLE_SPECIALITIES).forEach(([cycle, specialities]) => {
          specialities.forEach((speciality) => {
            // Générer 2-3 mémoires par spécialité
            const numberOfMemoires = Math.floor(Math.random() * 2) + 2;
            for (let i = 0; i < numberOfMemoires; i++) {
              const memoireId = `${cycle.toLowerCase()}_${speciality.toLowerCase().replace(/\s+/g, '_')}_${i + 1}`;
              const titles = [
                `Analyse approfondie de ${speciality}`,
                `Étude comparative en ${speciality}`,
                `Innovation et développement en ${speciality}`,
                `Recherche avancée sur ${speciality}`,
                `Méthodologie moderne en ${speciality}`
              ];
              
              const mentions = ['Passable', 'Bien', 'Tres Bien', 'Excellent'];
              const authors = ['Jean Dupont', 'Marie Martin', 'Pierre Durand', 'Sophie Lefebvre', 'Antoine Bernard'];
              
              simulatedMemoires.push({
                id_memoire: memoireId,
                libelle: titles[Math.floor(Math.random() * titles.length)],
                file_path: `/uploads/memoires/${memoireId}.pdf`,
                signature: 'signature_hash',
                hasSignature: true,
                date_soumission: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
                cycle: cycle,
                speciality: speciality,
                university: 'Université de Paris',
                mention: mentions[Math.floor(Math.random() * mentions.length)],
                etudiant_nom: authors[Math.floor(Math.random() * authors.length)],
                status: 'validated'
              });
            }
          });
        });

        // Combiner les mémoires réels avec les simulés
        const realMemoires = data.memoire.map((memoire: Memoire) => ({
          ...memoire,
          status: (memoire.status || '').toString().trim().toLowerCase(),
          hasSignature: Boolean(memoire.signature)
        }));

        const allMemoires = [...realMemoires];

        // Filtrer selon les critères sélectionnés
        let filteredMemoires = allMemoires.filter(m => (m.status || '').toString().trim().toLowerCase() === 'validated');
      
        if (selectedCycle) {
          filteredMemoires = filteredMemoires.filter(m => m.cycle === selectedCycle);
        }

        if (selectedSpeciality) {
          filteredMemoires = filteredMemoires.filter(m => m.speciality === selectedSpeciality);
        }

        if (search) {
          const searchLower = search.toLowerCase();
          filteredMemoires = filteredMemoires.filter(m => 
            m.libelle.toLowerCase().includes(searchLower) ||
            (m.speciality && m.speciality.toLowerCase().includes(searchLower)) ||
            (m.etudiant_nom && m.etudiant_nom.toLowerCase().includes(searchLower))
          );
        }

        setMemoires(filteredMemoires);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des mémoires :", error instanceof Error ? error.message : String(error));
    }
  }, [searchTerm, selectedCycle, selectedSpeciality]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (searchTerm || selectedCycle || selectedSpeciality) {
      fetchMemoires('validated', searchTerm);  
    } else {
      fetchMemoires('validated');
    }
  }, [searchTerm, selectedCycle, selectedSpeciality, fetchMemoires]);

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

  // Fonction pour gérer la navigation avec loader
  const handleNavigateToAdmin = async (): Promise<void> => {
    setIsNavigating(true);
    try {
      // Délai minimal pour montrer le loader
      await new Promise(resolve => setTimeout(resolve, 300));
      router.push('/Sign');
    } catch (error) {
      console.error('Erreur de navigation:', error);
    } finally {
      setIsNavigating(false);
    }
  };

  // Fonction pour gérer l'ouverture de document avec loader
  const handleDocumentClick = async (memoire: Memoire): Promise<void> => {
    setIsLoadingDocument(true);
    try {
      // Délai minimal pour montrer le loader
      await new Promise(resolve => setTimeout(resolve, 200));
      router.push(`/memoire/${memoire.id_memoire}`);
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du document:', error);
    } finally {
      setIsLoadingDocument(false);
    }
  };

  const getPdfThumbnail = async (memoireId: string): Promise<string> => {
    try {
      const response = await fetch(getApiUrl(`/api/memoire/${memoireId}/download`));
      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success || !data.url) {
        throw new Error("Invalid response from server");
      }

      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js';

      const loadingTask = pdfjsLib.getDocument({
        url: data.url,
        withCredentials: false,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
        cMapPacked: true,
      });

      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 0.3 }); // Réduit l'échelle pour accélérer
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

        return canvas.toDataURL("image/jpeg", 0.3); // Réduit la qualité pour accélérer
      } catch (renderError) {
        console.error("Error rendering PDF page:", renderError);
        throw renderError;
      }
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      return "";
    }
  };

  // Amélioration de la génération des thumbnails avec batch processing
  useEffect(() => {
    const thumbnailCache = new Map<string, string>();
    
    const generateThumbnails = async (): Promise<void> => {
      // Traitement par batch de 3 pour éviter la surcharge
      const batchSize = 3;
      for (let i = 0; i < memoires.length; i += batchSize) {
        const batch = memoires.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (memoire) => {
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
          })
        );
        
        // Délai entre les batches pour éviter la surcharge
        if (i + batchSize < memoires.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
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

  // Loader pour la navigation vers admin
  const NavigationLoader = ()=> (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-gray-700">Redirection en cours...</p>
      </div>
    </div>
  );

  // Loader pour l'ouverture de document
  const DocumentLoader = ()=> (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
        <p className="text-gray-700">Ouverture du document...</p>
      </div>
    </div>
  );

  const filteredMemoires: Memoire[] = memoires
    .filter((memoire: Memoire) => !selectedCycle || memoire.cycle === selectedCycle)
    .filter((memoire: Memoire) => !selectedSpeciality || memoire.speciality === selectedSpeciality);

  return (
    <div id="accueil" className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Loaders */}
      {isNavigating && <NavigationLoader />}
      {isLoadingDocument && <DocumentLoader />}

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="backdrop-blur-md bg-white/80 fixed w-full z-50 border-b border-gray-200/50"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="py-3">
            <div className="flex items-center justify-between">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-bold text-indigo-600"
              >
                ARCHIVA
              </motion.div>

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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2 disabled:opacity-50"
                  onClick={handleNavigateToAdmin}
                  disabled={isNavigating}
                >
                  {isNavigating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <UserCheck className="h-5 w-5" />
                  )}
                  <span>Admin</span>
                </motion.button>
              </nav>
            </div>

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
                <button
                  className="w-full px-4 py-2 text-left bg-indigo-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleNavigateToAdmin();
                  }}
                  disabled={isNavigating}
                >
                  {isNavigating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <UserCheck className="h-5 w-5" />
                  )}
                  <span>Admin</span>
                </button>
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
            {[
              {
                icon: BookOpen,
                title: "Bibliothèque Numérique",
                description: "Accédez à des milliers de mémoires académiques classés et vérifiés.",
                color: "from-blue-500 to-cyan-400"
              },
              {
                icon: ShieldCheck,
                title: "Vérification",
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

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 relative overflow-hidden"
      >
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
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 text-lg font-medium flex items-center gap-2 mx-auto disabled:opacity-50"
              onClick={handleNavigateToAdmin}
              disabled={isNavigating}
            >
              {isNavigating ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <UserCheck className="w-6 h-6" />
              )}
              <span>Ajoutez votre recherche</span>
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

      <div id="bibliotheque" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-8">
              Bibliothèque des Mémoires
            </h2>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-1 gap-4">
                  <div className="relative flex-1">
                    <select
                      value={selectedCycle}
                      onChange={(e) => setSelectedCycle(e.target.value)}
                      className="w-full appearance-none pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-700"
                    >
                      <option value="">Tous les cycles</option>
                      {Object.keys(CYCLE_SPECIALITIES).map(cycle => (
                        <option key={cycle} value={cycle}>{cycle}</option>
                      ))}
                    </select>
                    <GraduationCap className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                    <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>

                  <div className="relative flex-1">
  <select
    value={selectedSpeciality}
    onChange={(e) => setSelectedSpeciality(e.target.value)}
    className="w-full appearance-none pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-700"
  >
    <option value="">Toutes les spécialités</option>
    {selectedCycle
      ? Array.from(new Set(CYCLE_SPECIALITIES[selectedCycle] || [])).map(spec => (
          <option key={spec} value={spec}>{spec}</option>
        ))
      : Array.from(new Set(Object.values(CYCLE_SPECIALITIES).flat())).slice(0, 3).map(spec => (
          <option key={spec} value={spec}>{spec}</option>
        ))
    }
  </select>
  <BookOpen className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
  <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {selectedCycle && (
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    {selectedCycle}
                    <button
                      onClick={() => setSelectedCycle('')}
                      className="ml-2 hover:text-indigo-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {selectedSpeciality && (
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {selectedSpeciality}
                    <button
                      onClick={() => setSelectedSpeciality('')}
                      className="ml-2 hover:text-purple-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {Object.keys(CYCLE_SPECIALITIES).map((cycle) => {
            if (selectedCycle && selectedCycle !== cycle) return null;

            const cycleMemoires = filteredMemoires.filter(memoire => memoire.cycle === cycle);

            if (cycleMemoires.length === 0) return null;

            // Grouper par spécialité pour ce cycle
            const specialityGroups = cycleMemoires.reduce((acc, memoire) => {
              const speciality = memoire.speciality || 'Non spécifié';
              if (!acc[speciality]) {
                acc[speciality] = [];
              }
              acc[speciality].push(memoire);
              return acc;
            }, {} as Record<string, Memoire[]>);

            return (
              <div key={cycle} className="mb-16">
                <div className="flex items-center space-x-4 mb-8">
                  <h3 className="text-2xl font-semibold text-gray-800">{cycle}</h3>
                  <div className="flex-grow h-px bg-gradient-to-r from-blue-200 to-purple-200"></div>
                </div>

                {Object.entries(specialityGroups).map(([speciality, specialityMemoires]) => (
                  <div key={speciality} className="mb-10">
                    <div className="mb-6 border-l-4 border-purple-500 pl-4">
                      <h4 className="text-xl font-medium text-gray-700 mb-6 pl-4 border-l-4 border-purple-500">
                        {speciality}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {specialityMemoires.map((memoire) => (
                          <div
                            key={memoire.id_memoire}
                            className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
                            onClick={() => handleDocumentClick(memoire)}
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
                                    <Loader2 className="h-8 w-8 mb-2 text-blue-500 animate-spin" />
                                    <span className="text-sm text-gray-400">Chargement...</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="p-5">
                              <div className="mb-3">
                                {memoire.mention ? (
                                  <MentionStars mention={memoire.mention as "Passable" | "Bien" | "Tres Bien" | "Excellent" | null} size="sm" />
                                ) : (
                                  <span className="text-sm text-gray-500">Non noté</span>
                                )}
                              </div>

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