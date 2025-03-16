'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Users, FileText, Settings, ChevronDown, Book, Trash,
  Filter, Download, Search, AlertTriangle, CheckCircle, XCircle,
  PieChart, TrendingUp, UserCheck, Clock,
  Trash2,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';
import UserModal from './userModal';
import TrashContent from './TrashContent';
import SignatureVerification from '../components/SignatureVerification';
import MemoireDetailView from '../components/MemoireDetailView';
import SimilarityThresholdConfig from '../components/SimilarityThresholdConfig';


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [memoires, setMemoires] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedMemoire, setSelectedMemoire] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [filterCycle, setFilterCycle] = useState('all');
  const [filterSpeciality, setFilterSpeciality] = useState('all');
  const [showMemoireDetail, setShowMemoireDetail] = useState(false);
  const [selectedMemoireDetail, setSelectedMemoireDetail] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    validated: 0,
    rejected: 0,
    pending: 0,
    totalUsers: 0,
    activeUsers: 0
  });

  // Nouvelles statistiques pour le tableau de bord
  const [dashboardStats, setDashboardStats] = useState({
    recentSubmissions: [],
    topSpecialities: [],
    monthlySubmissions: []
  });

  useEffect(() => {
    fetchMemoires();
    fetchStats();
    fetchDashboardStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin');
      const data = await response.json();
      setStats({
        total: data.total,
        validated: data.validated,
        rejected: data.rejected,
        pending: data.pending,
        totalUsers: data.totalUsers,
        activeUsers: data.activeUsers
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      toast.error('Erreur lors de la récupération des statistiques');
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard');
      const data = await response.json();
      console.log("API Response:", data);
      setDashboardStats({
        recentSubmissions: data.recentSubmissions || [],
        topSpecialities: data.topSpecialities || [],
        monthlySubmissions: data.monthlySubmissions || []
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques du tableau de bord:', error);
      toast.error('Erreur lors de la récupération des statistiques du tableau de bord');
    }
  };

  const fetchMemoires = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/memoire/memoires-with-students', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      const data = await response.json();
      
      // Check if data has the memoire property
      if (data.success && data.memoire) {
        const memoiresWithStudents = data.memoire.map(memoire => ({
          ...memoire,
          etudiant_nom: memoire.etudiant_nom || 'N/A'
        }));
        setMemoires(memoiresWithStudents);
      } else {
        console.error('Format de réponse invalide:', data);
        setMemoires([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des mémoires', error);
      toast.error('Erreur lors de la récupération des mémoires');
      setMemoires([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();

      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        console.error('Erreur lors de la récupération des utilisateurs:', data.message);
        toast.error('Erreur lors de la récupération des utilisateurs');
        setUsers([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      toast.error('Erreur lors de la récupération des utilisateurs');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Erreur lors de la création');
      toast.success('Utilisateur créé avec succès');
      fetchUsers();
      setIsUserModalOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateUser = async (id, userData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      toast.success('Utilisateur mis à jour avec succès');
      fetchUsers();
      setIsUserModalOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir déplacer cet utilisateur vers la corbeille ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/soft-delete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Utilisateur déplacé vers la corbeille');
        fetchUsers();
      } else {
        toast.error(data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur détaillée:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const renderUsers = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gestion des Utilisateurs</h2>
        <button
          onClick={() => {
            setSelectedUser(null);
            setIsUserModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Ajouter un utilisateur
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left">Nom</th>
                <th className="px-6 py-3 text-left">Prénom</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Université</th>
                <th className="px-6 py-3 text-left">Faculté</th>
                <th className="px-6 py-3 text-left">Spécialité</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id_etudiant} className="border-b">
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.surname}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.university || '-'}</td>
                    <td className="px-6 py-4">{user.faculty || '-'}</td>
                    <td className="px-6 py-4">{user.speciality || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsUserModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id_etudiant)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isUserModalOpen && (
        <UserModal
          user={selectedUser}
          onClose={() => setIsUserModalOpen(false)}
          onSubmit={(userData) => {
            if (selectedUser) {
              handleUpdateUser(selectedUser.id_etudiant, userData);
            } else {
              handleCreateUser(userData);
            }
          }}
        />
      )}
    </motion.div>
  );

  const handleRejection = async (memoireId) => {
    if (!rejectionReason) {
      toast.error('Veuillez fournir une raison du rejet');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/memoire/reject/${memoireId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du rejet du mémoire');
      }

      toast.success('Mémoire rejeté avec succès');
      setShowMemoireDetail(false);
      setSelectedMemoireDetail(null);
      setRejectionReason('');
      setSelectedMemoire(null);
      fetchMemoires();
      fetchStats();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message);
    }
  };

  const handleDeleteMemoire = async (memoireId: string) => {
    try {
      // Prevent event propagation to avoid triggering detail view
      event.stopPropagation();
      
      const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer ce mémoire ?');
      if (!confirmed) return;
  
      const response = await fetch(`http://localhost:5000/api/memoire/${memoireId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la suppression');
      }
  
      if (data.success) {
        // Reset all related states
        setSelectedMemoireDetail(null);
        setShowMemoireDetail(false);
        setSelectedMemoire(null);
        
        // Remove the deleted memoire from the local state
        setMemoires(prevMemoires => prevMemoires.filter(m => m.id_memoire !== memoireId));
        
        // Update stats
        await Promise.all([
          fetchStats(),
          fetchDashboardStats()
        ]);
        
        toast.success('Mémoire supprimé avec succès');
      } else {
        throw new Error(data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression du mémoire');
    }
  };

  const handleValidateMemoire = async (memoireId) => {
    try {
      const adminId = 1; // Get this from your auth context or state
      const response = await fetch(`http://localhost:5000/api/memoire/${memoireId}/valider`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminId })
      });
  
      const data = await response.json();
      
      if (data.success) {
        toast.success('Mémoire validé et signé avec succès');
        setShowMemoireDetail(false);
        setSelectedMemoireDetail(null);
        fetchMemoires(); // Refresh the list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error validating memoire:', error);
      toast.error('Erreur lors de la validation du mémoire');
    }
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Cartes de statistiques */}
      {[
      { id: "total-memoires", title: "Total Mémoires", value: stats.total, icon: <FileText className="h-8 w-8 text-blue-500" /> },
      { id: "valides", title: "Validés", value: stats.validated, icon: <CheckCircle className="h-8 w-8 text-green-500" /> },
      { id: "en-attente", title: "En attente", value: stats.pending, icon: <Clock className="h-8 w-8 text-yellow-500" /> },
      { id: "rejetes", title: "Rejetés", value: stats.rejected, icon: <XCircle className="h-8 w-8 text-red-500" /> },
      { id: "utilisateurs", title: "Utilisateurs", value: stats.totalUsers, icon: <Users className="h-8 w-8 text-purple-500" /> }
    ].map((stat) => (
      <div key={stat.id} className="bg-white shadow-md rounded-lg p-4 flex items-center">
        {stat.icon}
        <div className="ml-4">
          <p className="text-lg font-semibold">{stat.title}</p>
          <p className="text-xl">{stat.value}</p>
        </div>
      </div>
    ))}

      {/* Tableau des soumissions récentes */}
      <div className="col-span-full lg:col-span-2 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Soumissions récentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Titre</th>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardStats.recentSubmissions && Array.isArray(dashboardStats.recentSubmissions) &&
                dashboardStats.recentSubmissions.map((memoire) => (
                  <tr key={memoire.id_memoire} className="border-b">
                    <td className="py-2">{memoire.libelle}</td>
                    <td className="py-2">{new Date(memoire.date_soumission).toLocaleDateString()}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${memoire.status === 'validated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {memoire.status === 'validated' ? 'Validé' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Graphiques des spécialités les plus actives */}
      <div className="col-span-full lg:col-span-2 bg-white rounded-xl shadow-md p-6">
  <h3 className="text-lg font-semibold mb-4">Graphiques des spécialités les plus actives</h3>
  <div className="space-y-4">
    {dashboardStats.topSpecialities && dashboardStats.topSpecialities.length > 0 ? (
      dashboardStats.topSpecialities.map((speciality, index) => (
        <div key={`${speciality.speciality}-${index}`} className="flex items-center justify-between">
          <span>{speciality.speciality}</span>
          <div className="flex items-center">
            <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
              <div
                className="bg-blue-500 rounded-full h-2"
                style={{ width: `${(speciality.count / Math.max(...dashboardStats.topSpecialities.map(s => s.count))) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">{speciality.count}</span>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center text-gray-500">
        Aucune spécialité disponible
      </div>
    )}
  </div>
</div>
</div>
  );

  // Le StatCard reste inchangé
  const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );

  const renderSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Paramètres du système</h2>
      <SimilarityThresholdConfig />
    </motion.div>
  );

  const renderMemoires = () => {

        // If a mémoire is selected for detailed view, show the detail component
        if (showMemoireDetail && selectedMemoireDetail) {
          return (
            <MemoireDetailView 
              memoire={selectedMemoireDetail}
              onBack={() => {
                setShowMemoireDetail(false);
                setSelectedMemoireDetail(null);
              }}
              onValidate={handleValidateMemoire}
              onReject={handleRejection}
            />
          );
        }

    const filteredMemoires = memoires.filter(memoire => {
      const matchesSearch = memoire.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          memoire.etudiant_nom?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCycle = filterCycle === 'all' || memoire.cycle === filterCycle;
      const matchesSpeciality = filterSpeciality === 'all' || memoire.speciality === filterSpeciality;
      return matchesSearch && matchesCycle && matchesSpeciality;
    });

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        {/* Filtres et recherche */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterCycle}
            onChange={(e) => setFilterCycle(e.target.value)}
            className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">Tous les cycles</option>
            <option value="Bachelor">Licence</option>
            <option value="Master">Master</option>
            <option value="Phd">Doctorat</option>
          </select>
          <select
            value={filterSpeciality}
            onChange={(e) => setFilterSpeciality(e.target.value)}
            className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">Toutes les spécialités</option>
            <option value="Securiter">Securiter</option>
            <option value="GL">Génie Logiciel</option>
            <option value="Réseaux">Réseaux</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCycle('all');
              setFilterSpeciality('all');
            }}
            className="flex items-center justify-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter size={20} className="mr-2" />
            Réinitialiser les filtres
          </button>
        </div>

        {/* Tableau des mémoires */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Étudiant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Titre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Cycle</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Spécialité</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMemoires.map((memoire) => (
                <tr key={memoire.id_memoire}
                 className="hover:bg-gray-50"
                 onClick={() => {
                  setSelectedMemoireDetail(memoire);
                  setShowMemoireDetail(true);
                }}
                 >
                  <td className="px-6 py-4">{memoire.etudiant_nom}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="font-medium">{memoire.libelle}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {memoire.cycle}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                      {memoire.speciality}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                        {memoire.mention || 'Non noté'}
                      </span>
                    </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={memoire.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(`http://localhost:5000/${memoire.file_path}`, '_blank')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Visualiser"
                      >
                        <Download size={20} />
                      </button>
                      {memoire.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleValidateMemoire(memoire.id_memoire)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Valider"
                          >
                            <CheckCircle size={20} style={{ border: '1px solid red' }} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMemoire(memoire);
                              setRejectionReason('');
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Rejeter"
                          >
                            <XCircle size={20} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMemoire(memoire.id_memoire);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal de rejet */}
        {selectedMemoire && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Rejeter le mémoire</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Raison du rejet..."
                className="w-full h-32 p-2 border rounded-lg mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedMemoire(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleRejection(selectedMemoire.id_memoire)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Rejeter
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: 'yellow', text: 'En attente' },
      validated: { color: 'green', text: 'Validé' },
      rejected: { color: 'red', text: 'Rejeté' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-50 text-${config.color}-700`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-white shadow-lg"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">
            Administration
          </h1>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart size={20} className="mr-3" />
              Tableau de bord
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'users'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users size={20} className="mr-3" />
              Utilisateurs
            </button>
            <button
              onClick={() => setActiveTab('memoires')}
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'memoires'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText size={20} className="mr-3" />
              Mémoires
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Settings size={20} className="mr-3" />
              Paramètres
            </button>
            <button
              onClick={() => setActiveTab('trash')}
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                activeTab === 'trash'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Trash2 size={20} className="mr-3" />
              Corbeille
            </button>
          </nav>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'memoires' && renderMemoires()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'trash' && <TrashContent />}

        </motion.div>
      </div>
      <div className="p-6 border-t border-gray-100">
          <a
            href="/"
            className="flex items-center w-full p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
              <LogOut size={20} className="mr-3" />
              Déconnexion
          </a>
        </div>
      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;
