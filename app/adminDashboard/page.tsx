'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Users, FileText, Settings, Trash,
  Filter, Download, Search, CheckCircle, XCircle, Clock,
  Trash2,
  LogOut,
  X,
  Menu,
} from 'lucide-react';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';
import UserModal from './userModal';
import TrashContent from './TrashContent';
import MemoireDetailView from '../components/MemoireDetailView';
import SimilarityThresholdConfig from '../components/SimilarityThresholdConfig';
import { getApiUrl } from '../utils/config';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [memoires, setMemoires] = useState<MemoireData[]>([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedMemoire, setSelectedMemoire] = useState<MemoireData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);  // Etat pour gérer l'utilisateur sélectionné
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [filterCycle, setFilterCycle] = useState('all');
  const [filterSpeciality, setFilterSpeciality] = useState('all');
  const [showMemoireDetail, setShowMemoireDetail] = useState(false);
  const [selectedMemoireDetail, setSelectedMemoireDetail] = useState<MemoireData | null>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    validated: 0,
    rejected: 0,
    pending: 0,
    totalUsers: 0,
    activeUsers: 0
  });

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    recentSubmissions: [],
    topSpecialities: [],
    monthlySubmissions: []
  });

  const fetchStats = async () => {
    try {
      const response = await fetch(getApiUrl('/api/admin'));
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
      const response = await fetch(getApiUrl('/api/dashboard'));
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

  interface MemoireData {
    id_memoire: number;
    libelle: string;
    etudiant_nom: string;
    cycle: string;
    speciality: string;
    status: 'pending' | 'validated' | 'rejected'; 
    mention?: number;
    file_path: string;
    date_soumission: string;  // Remove the optional '?' modifier
    university: string;
    description: string;

  }

  interface MonthlySubmission {
    month: string;
    count: number;
  }

  interface DashboardStats {
    recentSubmissions: MemoireData[];
    topSpecialities: { speciality: string; count: number }[];
    monthlySubmissions: MonthlySubmission[]; 
  }
  
  interface Stats {
    total: number;
    validated: number;
    rejected: number;
    pending: number;
    totalUsers: number;
    activeUsers: number;
  }

   // Add for user data
   interface UserData {
    name: string;
    surname: string;
    email: string;
    university?: string;
    faculty?: string;
    speciality?: string;
    password?: string;
    is_active: boolean;
  }

  interface User extends UserData {
    id_etudiant: number;
  }


  const fetchMemoires = React.useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/memoire/memoires-with-students'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      const data = await response.json();
      
      if (data.success && data.memoire) {
        const memoiresWithStudents = data.memoire.map((memoire: MemoireData) => ({
          ...memoire,
          id_memoire: Number(memoire.id_memoire),
          etudiant_nom: memoire.etudiant_nom || 'N/A',
          date_soumission: memoire.date_soumission || new Date().toISOString()  // Provide default value
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
  }, []);

  useEffect(() => {
    fetchMemoires();
    fetchStats();
    fetchDashboardStats();
  }, [fetchMemoires]);


  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(getApiUrl('/api/users'));
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

 
  
  // Update the handleCreateUser function
  const handleCreateUser = async (userData: UserData) => {
    try {
      const response = await fetch(getApiUrl('/api/users'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
  
      if (!response.ok) throw new Error('Erreur lors de la création');
  
      toast.success('Utilisateur créé avec succès');
      fetchUsers();
      setIsUserModalOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Une erreur inconnue est survenue');
      }
    }
  };
  

  const handleUpdateUser = async (id: number, userData: UserData) => {
    try {
      const response = await fetch(getApiUrl(`/api/users/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
  
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
  
      toast.success('Utilisateur mis à jour avec succès');
      fetchUsers();
      setIsUserModalOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Une erreur inconnue est survenue');
      }
    }
  };
  

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir déplacer cet utilisateur vers la corbeille ?')) {
      return;
    }
  
    try {
      const response = await fetch(getApiUrl(`/api/users/${userId}/soft-delete`), {
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
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Une erreur inconnue est survenue');
      }
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
            setSelectedUser(null);  // Réinitialise la sélection d'utilisateur
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
                            setSelectedUser(user);  // Sélectionne l'utilisateur
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
    user={selectedUser ? selectedUser : null}  // Vérification si selectedUser n'est pas null
    onClose={() => setIsUserModalOpen(false)}
    onSubmit={(userData) => {
      if (selectedUser) {
        handleUpdateUser(selectedUser.id_etudiant, userData);  // Mise à jour de l'utilisateur existant
      } else {
        handleCreateUser(userData);  // Création d'un nouvel utilisateur
      }
    }}
  />
)}

    </motion.div>
  );
  

  const handleRejection = async (memoireId: number) => {
    if (!rejectionReason) {
      toast.error('Veuillez fournir une raison du rejet');
      return;
    }
  
    try {
      const response = await fetch(getApiUrl(`/api/memoire/reject/${memoireId}`), {
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
    } catch (error: unknown) {
      console.error('Erreur:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Une erreur inconnue est survenue');
      }
    }
  };
  

  const handleDeleteMemoire = async (memoireId: number, e?: React.MouseEvent) => {
    try {
      if (e) e.stopPropagation();
      
      const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer ce mémoire ?');
      if (!confirmed) return;
  
      const response = await fetch(getApiUrl(`/api/memoire/${memoireId}`), {
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
        setSelectedMemoireDetail(null);
        setShowMemoireDetail(false);
        setSelectedMemoire(null);
        setMemoires(prevMemoires => prevMemoires.filter(m => m.id_memoire !== memoireId));
        await Promise.all([fetchStats(), fetchDashboardStats()]);
        toast.success('Mémoire supprimé avec succès');
      } else {
        throw new Error(data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression du mémoire');
    }
  };

  const handleValidateMemoire = async (memoireId: number) => {
    try {
      const adminId = 1; // Get this from your auth context or state
      const response = await fetch(getApiUrl(`/api/memoire/${memoireId}/valider`), {
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
{dashboardStats.recentSubmissions.map((memoire: MemoireData) => (
  <tr key={memoire.id_memoire} className="border-b">
    <td className="py-2">{memoire.libelle}</td>
    <td className="py-2">
      {memoire.date_soumission ? new Date(memoire.date_soumission).toLocaleDateString() : 'N/A'}
    </td>
    <td className="py-2">
      <StatusBadge status={memoire.status} /> {/* Utiliser le composant StatusBadge */}
    </td>
  </tr>
))}
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

  // Remove unused StatCard component
  // Delete or comment out the StatCard component since it's not being used
  // const StatCard = ({ title, value, icon, color }) => (
  //   <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 border-${color}-500`}>
  //     <div className="flex items-center justify-between">
  //       <div>
  //         <p className="text-sm text-gray-600">{title}</p>
  //         <p className="text-2xl font-bold mt-1">{value}</p>
  //       </div>
  //       {icon}
  //     </div>
  //   </div>
  // );

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
            <option value="PhD">Doctorat</option>
          </select>
          <select
            value={filterSpeciality}
            onChange={(e) => setFilterSpeciality(e.target.value)}
            className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">Toutes les spécialités</option>
            <option value="Sécurité">Sécurité</option>
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
                        onClick={() => window.open(getApiUrl(`/${memoire.file_path}`), '_blank')}
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
    handleDeleteMemoire(memoire.id_memoire, e);
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
          onClick={() => selectedMemoire && handleRejection(selectedMemoire.id_memoire)}
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

  interface StatusBadgeProps {
    status: 'pending' | 'validated' | 'rejected';
  }
  
  const StatusBadge = ({ status }: StatusBadgeProps) => {
    const statusClasses = {
      pending: 'bg-yellow-50 text-yellow-700',
      validated: 'bg-green-50 text-green-700',
      rejected: 'bg-red-50 text-red-700'
    };
  
    const statusText = {
      pending: 'En attente',
      validated: 'Validé',
      rejected: 'Rejeté'
    };
  
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {statusText[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header Mobile remains the same */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white z-50 shadow-md">
        <div className="flex justify-between items-center p-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">Administration</h1>
          <div className="w-8" /> {/* Spacer for balance */}
        </div>
      </div>

      {/* Enhanced Sidebar */}
      <aside
        className={`
          h-screen flex-shrink-0
          fixed lg:sticky top-0
          bg-white shadow-lg
          w-72 lg:w-64
          transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 z-50
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Administration
              </h1>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="space-y-2">
              {[
                { icon: BarChart, label: 'Tableau de bord', tab: 'dashboard' },
                { icon: Users, label: 'Utilisateurs', tab: 'users' },
                { icon: FileText, label: 'Mémoires', tab: 'memoires' },
                { icon: Settings, label: 'Paramètres', tab: 'settings' },
                { icon: Trash2, label: 'Corbeille', tab: 'trash' }
              ].map(({ icon: Icon, label, tab }) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    flex items-center w-full p-4 rounded-xl transition-all
                    ${activeTab === tab 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${activeTab === tab ? 'text-white' : 'text-gray-400'} mr-3`} />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-6 border-t">
            <Link
              href="/"
              className="flex items-center w-full p-4 text-gray-600 hover:bg-red-50 rounded-xl transition-colors group"
            >
              <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-500 mr-3" />
              <span className="font-medium group-hover:text-red-500">Déconnexion</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-80 p-4 lg:p-8 pt-20 lg:pt-8 min-h-screen">
        <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'memoires' && renderMemoires()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'trash' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-5xl">
                <TrashContent />
              </div>
            </div>
          )}
        </div>
      </main>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default AdminDashboard;
