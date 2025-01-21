'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import MySideBar from './ui/sideBar';

const Dashboard = () => {
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
      const response = await fetch('http://localhost:5000/api/memoires');
      if (response.ok) {
        const data = await response.json();
        setMemoires(data.memoires);
      } else {
        console.error('Erreur lors de la récupération des mémoires.');
      }
    } catch (error) {
      console.error('Erreur réseau lors de la récupération des mémoires :', error);
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

    const formData = new FormData();
    formData.append('libelle', newMemoire.libelle);
    formData.append('annee', newMemoire.annee);
    formData.append('cycle', newMemoire.cycle);
    formData.append('speciality', newMemoire.specialite);
    formData.append('university', newMemoire.universite);
    formData.append('file', newMemoire.file);
    formData.append('id_etudiant', 1);

    try {
      const response = await fetch('http://localhost:5000/api/memoires', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Mémoire ajouté avec succès !');
        setShowForm(false);
        fetchMemoires(); // Rafraîchit la liste des mémoires
      } else {
        alert('Une erreur est survenue lors de l\'ajout.');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission :', error);
      alert('Impossible de soumettre le formulaire.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MySideBar />
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Books Dashboard</h2>
            <p className="text-gray-600">Manage your academic works and publications</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="mr-2" size={20} />
            Add New Book
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4">Add New Book</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {['libelle', 'annee', 'specialite', 'universite'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field}
                  </label>
                  <input
                    type={field === 'annee' ? 'date' : 'text'}
                    name={field}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cycle</label>
                <select
                  name="cycle"
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option>Bachelor</option>
                  <option>Master</option>
                  <option>PhD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                <input
                  type="file"
                  name="file"
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="col-span-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Save Book'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search books..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Title', 'Year', 'Cycle', 'Speciality', 'University', 'File'].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {memoires.map((memoire, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{memoire.libelle}</td>
                    <td className="px-6 py-4">{new Date(memoire.annee).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{memoire.cycle}</td>
                    <td className="px-6 py-4">{memoire.speciality}</td>
                    <td className="px-6 py-4">{memoire.university}</td>
                    <td className="px-6 py-4">
                      <a
                        href={`/${memoire.file_path}`}
                        download
                        className="text-blue-600 hover:underline"
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
