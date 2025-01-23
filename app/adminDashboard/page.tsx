'use client';

import React, { useState, useEffect } from 'react';
import { BarChart } from 'lucide-react';

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

  // Fonction pour récupérer les mémoires depuis le serveur
  const fetchMemoires = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/memoire');
      const data = await response.json();
  
      // Vérifie si 'data.memoire' existe et est un tableau
      if (Array.isArray(data.memoire)) {
        setMemoires(data.memoire);
      } else {
        console.error('La réponse n\'est pas un tableau dans data.memoire:', data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des mémoires', error);
    }
  };

  useEffect(() => {
    fetchMemoires();
  }, []);

  // Gérer la validation ou le rejet d'une mémoire
  const handleMemoireAction = async (memoireId, action) => {
    try {
      const response = await fetch(`http://localhost:5000/api/memoire/${memoireId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        fetchMemoires(); // Rafraîchir la liste des mémoires
      }
    } catch (error) {
      console.error("Erreur lors de l'action sur la mémoire", error);
    }
  };

  // Rendu de la liste des mémoires
  const renderMemoires = () => {
    return(
    <div>
      <h2 className="text-2xl font-bold mb-4">Mémoires soumis</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Libellé</th>
            <th className="border border-gray-300 p-2">Université</th>
            <th className="border border-gray-300 p-2">Cycle</th>
            <th className="border border-gray-300 p-2">speciality</th>
            <th className="border border-gray-300 p-2">file</th>

            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {memoires.map((memoire, index) => (
            <tr key={memoire.id || `${memoire.libelle}-${memoire.university}-${memoire.speciality}-${index}`} className="hover:bg-gray-100">
              <td className="border border-gray-300 p-2">{memoire.libelle}</td>
              <td className="border border-gray-300 p-2">{memoire.university}</td>
              <td className="border border-gray-300 p-2">{memoire.cycle}</td>
              <td className="border border-gray-300 p-2">{memoire.speciality}</td>
               <td className="px-6 py-4">
                      <a
                        href={`/${memoire.file_path}`}
                        download
                        className="text-blue-600 hover:underline"
                      >
                        {memoire.file_name}
                      </a>
                </td>
                <td className="px-6 py-4">
                <button
                  onClick={() => handleMemoireAction(memoire.id, 'validate')}
                  className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                >
                  Valider
                </button>
                <button
                  onClick={() => handleMemoireAction(memoire.id, 'reject')}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Rejeter
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

  // Rendu des différentes sections
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
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white p-4">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
        <nav className="space-y-4">
          {[{ name: 'dashboard', icon: <BarChart />, label: 'Tableau de Bord' }].map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`flex items-center w-full p-2 rounded ${
                activeTab === item.name ? 'bg-blue-700' : 'hover:bg-blue-600'
              }`}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 p-8">{renderContent()}</div>
    </div>
  );
};

export default AdminDashboard;
