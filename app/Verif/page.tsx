'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ArchivaHeader from '../components/ArchivaHeader';
import DocumentVerifier from '../components/DocumentVerifier';
const Verif = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-12">
      <ArchivaHeader />
      
      <div className="pt-24 pb-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-archiva-indigo via-archiva-blue to-archiva-purple bg-clip-text text-transparent">
            Vérification d'authenticité
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Vérifiez l'authenticité d'un document signé en téléchargeant le fichier et en fournissant 
            la clé publique de l'admin.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8"
        >
          <DocumentVerifier />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="max-w-3xl mx-auto mt-12 text-center"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Comment ça fonctionne?</h3>
          <p className="text-gray-600 text-sm md:text-base">
            Notre système utilise des algorithmes de hachage cryptographique pour vérifier l'intégrité 
            et l'authenticité des documents. Chaque document signé contient une empreinte numérique unique 
            qui peut être vérifiée avec la clé publique de l'émetteur.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Verif;
