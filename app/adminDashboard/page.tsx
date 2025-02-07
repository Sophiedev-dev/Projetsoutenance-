'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Users, FileText, Settings, ChevronDown, Book,Trash } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [memoires, setMemoires] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedMemoire, setSelectedMemoire] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    validated: 0,
    rejected: 0,
    pending: 0,
  });
  const [filter, setFilter] = useState('all');

  const handleRejection = async (memoireId, p0: string) => {
    const rejectionReason = prompt("Veuillez entrer la raison du rejet :");
    if (!rejectionReason) return;
  
    try {
      const response = await fetch(`http://localhost:5000/api/memoire/reject/${memoireId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejection_reason: rejectionReason }), // Envoi de la raison du rejet
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du rejet du mémoire.');
      }
  
      toast.success('Le mémoire a été rejeté avec succès.');
      fetchMemoires();
    } catch (error) {
      console.error("Erreur lors du rejet du mémoire :", error);
      toast.error(error.message || 'Erreur lors du rejet du mémoire.');
    }
  };
  

  const renderRejectionModal = () => {
    if (!selectedMemoire) return null;

    return (
      <div className="modal">
        <div className="modal-content">
          <h2>Raison du rejet</h2>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Entrez la raison du rejet ici..."
            rows="4"
            className="textarea"
          />
          {/* <button
            onClick={() => handleRejection(selectedMemoire.id_memoire)}
            className="btn btn-danger"
          >
            Rejeter
          </button> */}
          <button
            onClick={() => setSelectedMemoire(null)}
            className="btn btn-secondary"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  };


  const handleDeleteMemoire = async (memoireId) => {
    try {
        // Confirmer la suppression
        const confirmation = window.confirm('Êtes-vous sûr de vouloir supprimer ce mémoire ?');
        if (!confirmation) return;

        const response = await fetch(`http://localhost:5000/api/memoire/${memoireId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression du mémoire.');
        }

        toast.success('Le mémoire a été supprimé avec succès.');
        fetchMemoires(); // Rafraîchir la liste des mémoires
    } catch (error) {
        console.error('Erreur lors de la suppression du mémoire:', error);
        toast.error('Erreur lors de la suppression du mémoire.');
    }
};



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
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (action === 'signed') {
        
        const signer = "Le Prof"+" "+user.user.name; 
        const response = await fetch(`http://localhost:5000/api/sign/${memoireId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signer }),
        });
        
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Erreur de signature');
        }

        toast.success(result.message || 'Document signé avec succès !');
      } else{

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
      }else if (action === 'signed') {
        toast.error('Le mémoire a été signé !');
      }
    }
      fetchMemoires();
    } catch (error) {
      console.error("Erreur lors de l'action sur le mémoire :", error.message);
      toast.error("Une erreur est survenue, veuillez réessayer.");
    }
  };

  const filteredMemoires = filter === 'all' 
  ? memoires 
  : memoires.filter(memoire => memoire.status === filter);


  const renderMemoires = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-lg bg-white/90"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Mémoires soumis
          </h2>
          <select
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-gray-700 font-medium shadow-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="validated">Validés</option>
            <option value="rejected">Rejetés</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Etudiant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Libellé</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Université</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Cycle</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Spécialité</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Visualiser</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Actions</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Surpprimer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMemoires.map((memoire, index) => (
                <motion.tr
                  key={memoire.id || `${memoire.libelle}-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50/80 transition-colors duration-200"
                >
                  <td className="px-6 py-4 text-sm text-gray-700">
                     {memoire.etudiant_nom || 'Non disponible'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{memoire.libelle}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{memoire.university}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{memoire.description}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                      {memoire.cycle}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
                      {memoire.speciality}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                      <button
                        onClick={() => window.open(`http://localhost:5000/${memoire.file_path}`, '_blank')}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                      >
                        Visualiser
                      </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMemoireAction(memoire.id_memoire, 'validated')}
                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:shadow-lg hover:translate-y-[-1px] transition-all duration-200"
                      >
                        Valider
                      </button>
                      <button
                        onClick={() => handleMemoireAction(memoire.id_memoire, 'signed')}
                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-red-500 rounded-lg hover:shadow-lg hover:translate-y-[-1px] transition-all duration-200"
                      >
                        Signer
                      </button>
                      <button
                        onClick={() => handleRejection(memoire.id_memoire, 'rejected')}
                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg hover:shadow-lg hover:translate-y-[-1px] transition-all duration-200"
                      >
                        Rejeter
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                      <button
                         onClick={() => handleDeleteMemoire(memoire.id_memoire)}
                         className="px-3 py-1.5 text-sm text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                         >
                         <Trash size={16} />
                      </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {renderRejectionModal()}
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