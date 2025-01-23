'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Library, User, Eye, Palette, MessageSquare, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Document, Page } from 'react-pdf'; // Import de la bibliothèque react-pdf
import { pdfjs } from 'react-pdf';

const MyMemoires = () => {
  const [selectedMemoire, setSelectedMemoire] = useState(null);
  const [memoires, setMemoires] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState('grid');
  const [pdfFile, setPdfFile] = useState(null); // État pour gérer le fichier PDF
  const [numPages, setNumPages] = useState(null); // Nombre total de pages du PDF

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

  const handleDownload = (filePath) => {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filePath.split('/').pop();
    link.click();
  };

  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const getMemoirePreview = (content) => {
    if (!content || content.length === 0) return '';  
    const previewLength = 150; 
    if (content.length > previewLength) {
      return content.substring(0, previewLength) + '...';
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
          <nav className="flex-1 px-4 space-y-2">
            <Link href="./Profile">Profile</Link>
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
          <h2 className="text-2xl font-bold text-gray-800">My Memoires</h2>
          <p className="text-gray-600">Manage and organize your memoires</p>
        </div>

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
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{memoire.libelle}</h3>
                  <div className="flex space-x-2">
                    <button onClick={() => setSelectedMemoire(memoire)} className="p-2 text-gray-500 hover:text-blue-600">
                      <Eye size={20} />
                    </button>
                    <button onClick={() => setShowNoteForm(memoire.id_memoire)} className="p-2 text-gray-500 hover:text-blue-600">
                      <MessageSquare size={20} />
                    </button>
                    <button onClick={() => handleDownload(memoire.file_path)} className="p-2 text-gray-500 hover:text-blue-600">
                      <Download size={20} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{memoire.speciality} - {memoire.annee}</p>

                {/* Preview */}
                <p className="text-gray-600 text-sm">{getMemoirePreview(memoire.content)}</p>

                {/* Visualisation du PDF */}
                {selectedMemoire?.id_memoire === memoire.id_memoire && (
                  <div className="mt-4">
                    <Document file={`http://localhost:5000/${memoire.file_path}`} onLoadSuccess={onLoadSuccess}>
                      <Page pageNumber={1} />
                    </Document>
                    {numPages && (
                      <div className="text-gray-600 text-sm mt-2">
                        Page 1 of {numPages}
                      </div>
                    )}
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
