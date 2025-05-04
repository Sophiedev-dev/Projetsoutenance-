'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Trash2, RefreshCw, Search } from 'lucide-react';
import { getApiUrl } from '../utils/config';

interface DeletedUser {
  id_etudiant: number;
  name: string;
  surname: string;
  email: string;
  deleted_at: string;
  university?: string;
  faculty?: string;
  speciality?: string;
  is_active: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  users?: T[];
}

const TrashContent: React.FC = () => {
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeletedUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(getApiUrl('/api/users/trash'));
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }
      
      const data: ApiResponse<DeletedUser> = await response.json();
      
      if (data.success && Array.isArray(data.users)) {
        setDeletedUsers(data.users);
      } else {
        throw new Error('Format de données invalide');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la récupération des utilisateurs supprimés');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  const handleRestore = async (userId: number) => {
    try {
      const response = await fetch(getApiUrl(`/api/users/${userId}/restore`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la restauration');
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Utilisateur restauré avec succès');
        fetchDeletedUsers();
      } else {
        toast.error(data.message || 'Erreur lors de la restauration');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la restauration');
    }
  };

  const filteredUsers = deletedUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Trash2 className="mr-2 text-gray-600" />
          Corbeille
        </h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
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
                <th className="px-6 py-3 text-left">Date de suppression</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id_etudiant} className="border-b">
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.surname}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      {user.deleted_at ? new Date(user.deleted_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRestore(user.id_etudiant)}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <RefreshCw size={16} className="mr-1" />
                        Restaurer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    {deletedUsers.length === 0 ? 'La corbeille est vide' : 'Aucun résultat trouvé'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default TrashContent;