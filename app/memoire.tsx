"use client";

import React, { useState } from 'react';


const MemoirePage: React.FC = () => {
  // État pour les champs du formulaire
  const [formData, setFormData] = useState({
    libelle: '',
    annee: '',
    cycle: '',
    specialiter: '',
    universite: '',
    idMemoire: '',
    idEtudiant: '',
    nomFichier: '',
  });

  // État pour le fichier
  const [cheminFichier, setCheminFichier] = useState<File | null>(null);

  // Gestion des changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Gestion du changement pour le fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setCheminFichier(file);
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const formDataToSubmit = {
      ...formData,
      cheminFichier: cheminFichier ? cheminFichier.name : '',
    };
  
    try {
      const response = await fetch('http://localhost:3001/api/memoires', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataToSubmit),
      });
  
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
      } else {
        alert('Erreur lors de la soumission');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur réseau');
    }
  };
  

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-4 text-lg font-bold">Menu</div>
        <nav className="mt-4">
          <ul>
            <li className="p-3 hover:bg-gray-700">
            <a href="#" className="block">Accueil</a>
            </li>
            <li className="p-3 hover:bg-gray-700">
              <a href="#" className="block">Mémoires</a>
            </li>
            <li className="p-3 hover:bg-gray-700">
              <a href="#" className="block">Historique</a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 bg-gray-100 p-8">
        <h1 className="text-2xl font-bold mb-6">Ajouter un Mémoire</h1>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-2 gap-4">
            {/* Champs du formulaire */}
            <div>
              <label htmlFor="libelle" className="block text-gray-700 font-medium">Libellé</label>
              <input
                type="text"
                id="libelle"
                name="libelle"
                value={formData.libelle}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="annee" className="block text-gray-700 font-medium">Année</label>
              <input
                type="date"
                id="annee"
                name="annee"
                value={formData.annee}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            {/* Autres champs inchangés */}
            <div>
              <label htmlFor="cycle" className="block text-gray-700 font-medium">Cycle</label>
              <input
                type="text"
                id="cycle"
                name="cycle"
                value={formData.cycle}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="specialiter" className="block text-gray-700 font-medium">Spécialité</label>
              <input
                type="text"
                id="specialiter"
                name="specialiter"
                value={formData.specialiter}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="universite" className="block text-gray-700 font-medium">Université</label>
              <input
                type="text"
                id="universite"
                name="universite"
                value={formData.universite}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="idMemoire" className="block text-gray-700 font-medium">ID Mémoire</label>
              <input
                type="number"
                id="idMemoire"
                name="idMemoire"
                value={formData.idMemoire}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="idEtudiant" className="block text-gray-700 font-medium">ID Étudiant</label>
              <input
                type="number"
                id="idEtudiant"
                name="idEtudiant"
                value={formData.idEtudiant}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="nomFichier" className="block text-gray-700 font-medium">Nom du Fichier</label>
              <input
                type="text"
                id="nomFichier"
                name="nomFichier"
                value={formData.nomFichier}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="cheminFichier" className="block text-gray-700 font-medium">Téléverser le fichier</label>
              <input
                type="file"
                id="cheminFichier"
                name="cheminFichier"
                onChange={handleFileChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Enregistrer le Mémoire
          </button>
        </form>
      </main>
    </div>
  );
};

export default MemoirePage;