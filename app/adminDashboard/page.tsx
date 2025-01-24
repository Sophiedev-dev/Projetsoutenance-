'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Users, FileText, Settings, ChevronDown, Book } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [memoires, setMemoires] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    validated: 0,
    rejected: 0,
    pending: 0,
  });
  const [filter, setFilter] = useState('all');

  const fetchMemoires = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/memoire');
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data.memoire)) {
        setMemoires(data.memoire);
      } else {
        console.error('La réponse n\'est pas un tableau dans data.memoire:', data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des mémoires', error);
      toast.error('Erreur lors de la récupération des mémoires. Veuillez réessayer plus tard.');
    }
  };

  useEffect(() => {
    fetchMemoires();
  }, []);

  const handleMemoireAction = async (memoireId, action) => {
    try {
      const response = await fetch(`http://localhost:5000/api/memoire/${memoireId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du mémoire.');
      }

      const responseData = await response.json();

      if (action === 'validated') {
        toast.success('Le mémoire a été validé avec succès !');
      } else if (action === 'rejected') {
        toast.error('Le mémoire a été rejeté !');
      }

      fetchMemoires();
    } catch (error) {
      console.error("Erreur lors de l'action sur le mémoire :", error.message);
      toast.error("Une erreur est survenue, veuillez réessayer.");
    }
  };

  const renderMemoires = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-lg bg-white/90"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Mémoires soumis
          </h2>
          <div className="flex gap-4">
            <select
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="validated">Validés</option>
              <option value="rejected">Rejetés</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Libellé</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Université</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Cycle</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Spécialité</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Fichier</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Étudiant</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {memoires.map((memoire, index) => (
                <motion.tr
                  key={memoire.id || `${memoire.libelle}-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50/50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 text-sm text-gray-700">{memoire.libelle}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{memoire.university}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{memoire.cycle}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{memoire.speciality}</td>
                  <td className="px-6 py-4 text-sm">
                    <a
                      href={`/${memoire.file_path}`}
                      download
                      className="text-blue-600 hover:text-purple-600 transition-colors flex items-center gap-2"
                    >
                      <FileText size={16} />
                      {memoire.file_name}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {memoire.etudiant_nom || 'Non disponible'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMemoireAction(memoire.id_memoire, 'validated')}
                        className="px-3 py-1.5 text-sm text-white bg-gradient-to-r from-green-400 to-green-500 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        Valider
                      </button>
                      <button
                        onClick={() => handleMemoireAction(memoire.id_memoire, 'rejected')}
                        className="px-3 py-1.5 text-sm text-white bg-gradient-to-r from-red-400 to-red-500 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        Rejeter
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderMemoires();
      case 'add':
        return <p>Formulaire d'ajout de mémoires ici.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-white shadow-lg"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
            Admin Panel
          </h1>
          <nav className="space-y-2">
            {[
              { name: 'dashboard', icon: <BarChart size={20} />, label: 'Tableau de Bord' },
              { name: 'users', icon: <Book size={20} />, label: 'Utilisateurs', path: '/login',  },
              { name: 'settings', icon: <Settings size={20} />, label: 'Paramètres' },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.name
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span className="ml-3 font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </motion.div>

      <div className="flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;