'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Library, User, Eye, Palette, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const MyMemoires = () => {
  const [selectedMemoire, setSelectedMemoire] = useState(null);
  const [memoires, setMemoires] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState('grid');
  const [themeSettings, setThemeSettings] = useState({ show: false, memoireId: null });

  useEffect(() => {
    const fetchMemoires = async () => {
      setIsLoading(true);
      setError(null);
  
      try {
        const response = await fetch('http://localhost:5000/api/memoire');
        if (!response.ok) {
          throw new Error(`Erreur serveur : ${response.status} - ${response.statusText}`);
        }
  
        const data = await response.json();
  
        if (Array.isArray(data)) {
          setMemoires(data);
        } else if (Array.isArray(data.memoire)) {
          setMemoires(data.memoire);
        } else {
          throw new Error('Format inattendu des données reçues.');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des mémoires :', err.message);
        setError(err.message || 'Une erreur est survenue.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchMemoires();
  }, []);

  const addNote = (memoireId) => {
    if (newNote.trim()) {
      setMemoires(memoires.map((memoire) => {
        if (memoire.id_memoire === memoireId) {
          return {
            ...memoire,
            notes: [...(memoire.notes || []), { id: Date.now(), content: newNote }]
          };
        }
        return memoire;
      }));
      setNewNote('');
      setShowNoteForm(false);
    }
  };

  const getMemoirePreview = (content) => {
    // Fonction pour obtenir un extrait de contenu
    if (!content || content.length === 0) return '';  // Si content est vide ou undefined
    const previewLength = 150; // Limiter la taille de l'aperçu
    if (content.length > previewLength) {
      return content.substring(0, previewLength) + '...'; // Ajouter '...' si le contenu est trop long
    }
    return content;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-600">📚 BANK-MEMO</h1>
          </div>

          <Link href="./Profile">profile</Link>

          <nav className="flex-1 px-4 space-y-2">
            {[ 
              { name: 'Dashboard', path: './login', icon: <BookOpen className="mr-3" /> },
              { name: 'My Memoires', path: './mymemoire', icon: <Library className="mr-3" /> },
              { name: 'Collections', path: '/collections', icon: <Library className="mr-3" /> },
              { name: 'Profile', path: './profile', icon: <User className="mr-3" /> }
            ].map((item, index) => (
              <Link key={index} href={item.path} className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4">
            <Link href="/" className="flex items-center text-gray-600 hover:text-blue-600">
              <ArrowLeft className="mr-2" size={20} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Memoires</h2>
            <p className="text-gray-600">Manage and organize your memoires</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Grid View
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              List View
            </button>
          </div>
        </div>

        {/* Error or Loading State */}
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : (
          <div className={`grid ${activeTab === 'grid' ? 'grid-cols-3' : 'grid-cols-1'} gap-6`}>
            {memoires.map((memoire) => (
              <motion.div
                key={memoire.id_memoire}
                layout
                className={`bg-white rounded-lg shadow-md p-6 ${memoire.theme?.color === 'blue' ? 'border-blue-500' : memoire.theme?.color === 'green' ? 'border-green-500' : ''} border-t-4`}
                style={{
                  fontFamily: memoire.theme?.font === 'serif' ? 'serif' : 'sans-serif'
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{memoire.libelle}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedMemoire(memoire)}
                      className="p-2 text-gray-500 hover:text-blue-600"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => setThemeSettings({ show: true, memoireId: memoire.id_memoire })}
                      className="p-2 text-gray-500 hover:text-blue-600"
                    >
                      <Palette size={20} />
                    </button>
                    <button
                      onClick={() => setShowNoteForm(memoire.id_memoire)}
                      className="p-2 text-gray-500 hover:text-blue-600"
                    >
                      <MessageSquare size={20} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{memoire.speciality} - {memoire.annee}</p>

                {/* Preview */}
                <p className="text-gray-600 text-sm">{getMemoirePreview(memoire.content)}</p>

                {/* Note Form */}
                {showNoteForm === memoire.id_memoire && (
                  <div className="mt-4">
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      rows="3"
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                    <button
                      onClick={() => addNote(memoire.id_memoire)}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      Add Note
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMemoires;
