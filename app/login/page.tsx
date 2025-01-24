'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MySideBar from './ui/sideBar';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [memoires, setMemoires] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newMemoire, setNewMemoire] = useState({
    libelle: '',
    annee: '',
    cycle: 'Bachelor',
    specialite: '',
    universite: '',
    file: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fonction pour récupérer les mémoires depuis l'API
  const fetchMemoires = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;


      if (!user.user || !user.user.id_etudiant) {
        console.error("Aucun utilisateur trouvé ou ID étudiant manquant.");
        return;
      }
  
      const response = await fetch(`http://localhost:5000/api/memoireEtudiant?id_etudiant=${user.user.id_etudiant}`);
      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status} - ${response.statusText}`);
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
  
  useEffect(() => {
    fetchMemoires();
  }, []);
  

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
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Dashboard</h2>
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

        {showForm && (
          <div className="backdrop-blur-lg bg-white/80 p-8 rounded-2xl shadow-xl mb-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Add New Book</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              {['libelle', 'annee', 'specialite', 'universite'].map((field) => (
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
                  {['Title', 'Year', 'Cycle', 'Speciality', 'University', 'File'].map((header) => (
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
                    <td className="px-6 py-4">
                      <a
                        href={`/${memoire.file_path}`}
                        download
                        className="text-blue-600 hover:text-purple-600 transition-colors duration-200"
                      >
                        {memoire.file_name}
                      </a>
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
