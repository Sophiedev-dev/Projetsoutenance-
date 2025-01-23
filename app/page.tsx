'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search, ShoppingCart, User } from 'lucide-react';
import Image from 'next/image';

// Dans votre code
<Image src="/images/imag.jpg" alt="Description de l'image" layout="fill" objectFit="cover" />

const Homepage = () => {
  const [memoires, setMemoires] = useState([]);

  // Fonction pour récupérer les mémoires validés
  const fetchMemoires = async (status = 'validated') => {
    try {
      const response = await fetch(`http://localhost:5000/api/memoire?status=${status}`);
      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      if (Array.isArray(data.memoire)) {
        setMemoires(data.memoire);  // Mettre à jour l'état avec les mémoires récupérées
      } else {
        console.error('Format inattendu des données reçues :', data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des mémoires :', error.message);
    }
  };

  useEffect(() => {
    fetchMemoires('validated'); // Charger uniquement les mémoires validés
  }, []);
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="text-2xl font-bold text-gray-800">📚 BANK-MEMO</div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search over 30 million book titles"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ShoppingCart className="text-gray-600" size={24} />
              <User className="text-gray-600" size={24} />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-8 py-4">
            {['Home', 'Books', 'Magazines', 'Textbooks', 'Audiobooks', 'Recommended', 'Sale'].map((item) => (
              <a key={item} href="#" className="text-gray-600 hover:text-blue-500">
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <div>
        <div className="bg-black bg-opacity-50 bg-[url('../images/imag.jpg')] bg-cover bg-center h-screen">
          {/* Overlay for better text readability */}
          <div className="max-w-7xl mx-auto px-4 py-16 h-full flex items-center justify-end">
            <div className="w-1/2 text-right">
              <h2 className="text-5xl font-bold mb-4 text-white">
                <span className="text-blue-400">ARCHIVA</span>
                <br />
                <span>Université de Yaoundé I</span>
              </h2>
              <p className="text-xl text-gray-200 mb-8">
                Building Tomorrow's Leaders Through Academic Excellence
              </p>
              <Link href="./Sign">
                <button className="bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-600 transition-colors text-lg">
                  ADD RESUME
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bestsellers */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Current Resumes</h2>
          <a href="#" className="text-blue-500 hover:underline">View All</a>
        </div>

        <div className="relative">
          <div className="flex space-x-6 overflow-x-auto pb-4">
            {memoires.map((memoire) => (
              <div key={memoire.id_memoire} className="flex-none w-48">
                <img
                  src={memoire.file_path}  // Remplacer par le chemin du fichier
                  alt={memoire.libelle}
                  className="w-full h-64 object-cover rounded-lg shadow-md mb-4"
                />
                <h3 className="font-semibold">{memoire.libelle}</h3>
                <p className="text-sm text-gray-500">{memoire.etudiant_nom}</p>
                <p className="text-blue-500 font-semibold mt-2">Validated</p> {/* Affichage du statut */}
              </div>
            ))}
          </div>
          <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
            <ChevronLeft size={24} />
          </button>
          <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
