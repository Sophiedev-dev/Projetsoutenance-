'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ArchivaHeader from '../components/ArchivaHeader';
import DocumentVerifier from '../components/DocumentVerifier';
import { Key } from 'lucide-react';
import { getApiUrl } from '../utils/config';

const Verif = () => {

  const handleDownloadPublicKey = async () => {
    try {
      const response = await fetch(getApiUrl('/api/admin/public-key'));
      if (!response.ok) {
        throw new Error('Failed to fetch public key');
      }
      const data = await response.json();
      
      const blob = new Blob([data.publicKey], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cle_publique_admin.txt';
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la récupération de la clé publique');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-900">
      <ArchivaHeader />
      
      <main className="container mx-auto px-4 pt-20 pb-16">

      <div className="flex justify-end mb-4">
      <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadPublicKey}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Key size={20} />
              <span>Télécharger la Clé Publique</span>
      </motion.button>
      </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h1 className="text-4xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
         
          Vérification de Document

         </h1>

          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            Téléchargez votre document signé et fournissez la clé publique de l&apos;administrateur 
            pour vérifier son authenticité et son intégrité.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <DocumentVerifier documentPath="" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl mx-auto mt-16 text-center"
        >
         <h3 className="text-lg font-semibold text-gray-700 mb-2">
           Comment ça fonctionne?
         </h3>
          <p className="text-gray-600 text-sm md:text-base">
          Notre système utilise des algorithmes de hachage cryptographique pour vérifier l&apos;intégrité 
            et l&apos;authenticité des documents. Chaque document signé contient une empreinte numérique unique 
            qui peut être vérifiée avec la clé publique de l&apos;émetteur.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Verif;
