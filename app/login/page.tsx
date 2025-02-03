'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MySideBar from './ui/sideBar';
import { Card, CardContent, Button } from "@mui/material";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [memoires, setMemoires] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const notifiedMemoires = useRef(new Set());
  const [notifications, setNotifications] = useState([
    {
      id_notification: 1,
      id_etudiant: 101,
      message: 'New assignment available.',
      date_creation: '2025-02-03T12:00:00Z',
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newMemoire, setNewMemoire] = useState({
    
    libelle: '',
    annee: '',
    cycle: 'Bachelor',
    specialite: '',
    universite: '',
    description:'',
    file: null,
  });
  // const [showNotifications, setShowNotifications] = useState(false);
  // const notifications = [
  //   "Nouvelle mise à jour disponible!",
  //   "Un nouvel utilisateur a rejoint votre groupe.",
  //   "Votre demande a été approuvée."
  // ];
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Fonction pour récupérer les mémoires depuis l'API
  const fetchMemoires = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const userId = parsedUser?.user?.id_etudiant;
      
      if (!userId) {
        console.error("Aucun utilisateur trouvé ou ID étudiant manquant.");
        return;
      }
  
      const response = await fetch(`http://localhost:5000/api/memoireEtudiant?id_etudiant=${userId}`);
        if (!response.ok) {
        throw new Error(`Erreur serveur (${response.status}) : ${await response.text()}`);
      }
  
      const data = await response.json();
  
      // Déboguer la réponse pour vérifier sa structure
      console.log('Données reçues depuis l\'API:', data);
  
      // Adapter le traitement selon la structure reçue
      if (Array.isArray(data.memoire)) {
        setMemoires(data.memoire);
      } else {
        console.error('Format inattendu des données reçues :', data);
      }
    } catch (error) {
      if (error.name === 'TypeError') {
        console.error('Erreur réseau ou problème de connexion :', error);
      } else {
        console.error('Erreur lors de la récupération des mémoires :', error.message);
      }
    }
  };

   // Récupérer l'utilisateur depuis le localStorage
   useEffect(() => {
      fetchMemoires();
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }, []); 


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

  const fetchNotifications = async () => {
    try {
      if (!user) return;
      const userId = user?.user?.id_etudiant;
      if (!userId) return;

      const response = await fetch(`http://localhost:5000/api/notifications/${userId}`);
      if (!response.ok) {
        throw new Error(`Erreur serveur (${response.status}) : ${await response.text()}`);
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications :", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Afficher les notifications des mémoires rejetés
  useEffect(() => {
    memoires.forEach((memoire) => {
      if (memoire.status === "rejected" && !notifiedMemoires.current.has(memoire.libelle)) {
        notifiedMemoires.current.add(memoire.libelle);
        toast.error(`Votre mémoire "${memoire.libelle}" a été rejeté. Motif : ${memoire.rejection_reason}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    });
  }, [memoires]);
  
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setNewMemoire((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    const formData = new FormData();
    formData.append('libelle', newMemoire.libelle);
    formData.append('annee', newMemoire.annee);
    formData.append('cycle', newMemoire.cycle);
    formData.append('speciality', newMemoire.specialite);
    formData.append('university', newMemoire.universite);
    formData.append('description', newMemoire.description);
    formData.append('file', newMemoire.file);
    formData.append('id_etudiant', user.user.id_etudiant);

    console.log("formData");
    console.log(formData);

    try {
      const response = await fetch('http://localhost:5000/api/memoire', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Mémoire soumis avec succès ! L’administrateur sera notifié.');
        setShowForm(false);
        fetchMemoires(); // Rafraîchit la liste des mémoires
      } else {
        toast.error('Erreur lors de la soumission.');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission :', error);
      toast.error('Erreur réseau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <MySideBar />
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Welcome {user?.user?.surname || 'Étudiant'} !</h2>
            <p className="text-gray-600 mt-2">Manage your academic works and publications</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          >
            <Plus className="mr-2" size={20} />
            Add New Book
          </button>
        </div>
        <div className="fixed top-4 right-4 z-50">
      <button
        className="relative p-2 rounded-full bg-gray-200 hover:bg-gray-300"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {showNotifications && (
        <Card className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Notifications</h4>
            {notifications.length > 0 ? (
              <ul className="space-y-2">
                {notifications.map((notification) => (
                  <li key={notification.id_notification} className="text-sm text-gray-700">
                    <p>{notification.message}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.date_creation).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Aucune notification</p>
            )}
          </CardContent>
        </Card>
      )}
        </div>

        {showForm && (
          <div className="backdrop-blur-lg bg-white/80 p-8 rounded-2xl shadow-xl mb-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Add New Book</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              {['libelle', 'annee', 'specialite', 'universite', 'description'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {field}
                  </label>
                  <input
                    type={field === 'annee' ? 'date' : 'text'}
                    name={field}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                    required
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cycle</label>
                <select
                  name="cycle"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                  required
                >
                  <option>Bachelor</option>
                  <option>Master</option>
                  <option>PhD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                <input
                  type="file"
                  name="file"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                  required
                />
              </div>
              <div className="col-span-2 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                >
                  {isSubmitting ? 'Submitting...' : 'Save Book'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-xl border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search books..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  {['Title', 'Year', 'Cycle', 'Speciality', 'University','description','File'].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-600"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
              {memoires.map((memoire, index) => (
  <tr key={index} className="hover:bg-gray-50/50 transition-colors duration-150">
    <td className="px-6 py-4">{memoire.libelle}</td>
    <td className="px-6 py-4">{new Date(memoire.annee).toLocaleDateString()}</td>
    <td className="px-6 py-4">{memoire.cycle}</td>
    <td className="px-6 py-4">{memoire.speciality}</td>
    <td className="px-6 py-4">{memoire.university}</td>
    <td className="px-6 py-4">{memoire.description}</td>
    <td className="px-6 py-4">
      <a
        href={`http://localhost:5000/${memoire.file_path}`}
        download
        className="text-blue-600 hover:text-purple-600 transition-colors duration-200"
      >
        Télécharger
      </a>
    </td>
    <td className="px-6 py-4">
      <button
        onClick={() => window.open(`http://localhost:5000/${memoire.file_path}`, '_blank')}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
      >
        Visualiser
      </button>
      <button
        onClick={() => handleDeleteMemoire(memoire.id_memoire)}
        className="px-3 py-1.5 text-sm text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
      >
        Supprimer
      </button>
    </td>
    <td className="px-6 py-4">
      {memoire.status === "rejected" && (
         <span className="text-red-500 font-bold flex items-center">
            ❌ Rejeté - {memoire.rejection_reason}
         </span>
      )}
    </td>
  </tr>
))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
