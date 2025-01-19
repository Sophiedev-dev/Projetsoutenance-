'use client';

import React, { useState } from 'react';
import { ArrowLeft, Book, BookOpen, Library, Plus, Search, User } from 'lucide-react';
import Link from 'next/link';



const Dashboard = () => {
  const [memoires, setMemoires] = useState([
    {
      id: 1,
      libelle: "Machine Learning Applications",
      annee: "2024-01-15",
      cycle: "Master",
      specialite: "Computer Science",
      universite: "MIT",
      nom_fichier: "ml_thesis.pdf"
    },
    {
      id: 2,
      libelle: "Renewable Energy Systems",
      annee: "2023-12-01",
      cycle: "PhD",
      specialite: "Engineering",
      universite: "Stanford",
      nom_fichier: "energy_thesis.pdf"
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newMemoire, setNewMemoire] = useState({
    libelle: "",
    annee: "",
    cycle: "",
    specialite: "",
    universite: "",
    nom_fichier: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setNewMemoire((prev) => ({
      ...prev,
      [name]: files ? files[0].name : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMemoires((prev) => [...prev, { ...newMemoire, id: prev.length + 1 }]);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-600">📚 BANK-MEMO</h1>
          </div>

          <Link href="./Mybook">
            Book
          </Link>
          

                   <nav className="flex-1 px-4 space-y-2">
                      {[
                        { name: "Dashboard", path: "./login", icon: <BookOpen className="mr-3" /> },
                        { name: "My Books", path: "./Mybook", icon: <Book className="mr-3" /> },
                        { name: "Collections", path: "/collections", icon: <Library className="mr-3" /> },
                        { name: "Profile", path: "./Profile", icon: <User className="mr-3" /> }
                      ].map((item, index) => (
                        <a
                          key={index}
                          href={item.path}
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
                        >
                          {item.icon}
                          {item.name}
                        </a>
                      ))}
                    </nav>

          <div className="p-4">
            <a href="/" className="flex items-center text-gray-600 hover:text-blue-600">
              <ArrowLeft className="mr-2" size={20} />
              Back to Home
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
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
              {["libelle", "annee", "specialite", "universite"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field}
                  </label>
                  <input
                    type={field === "annee" ? "date" : "text"}
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
                  name="nom_fichier"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Book
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Books List */}
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
                  {["Title", "Year", "Cycle", "Speciality", "University", "File"].map((header) => (
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
                {memoires.map((memoire) => (
                  <tr key={memoire.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{memoire.libelle}</td>
                    <td className="px-6 py-4">{new Date(memoire.annee).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{memoire.cycle}</td>
                    <td className="px-6 py-4">{memoire.specialite}</td>
                    <td className="px-6 py-4">{memoire.universite}</td>
                    <td className="px-6 py-4">
                      <a
                        href={`/${memoire.nom_fichier}`}
                        download
                        className="text-blue-600 hover:underline"
                      >
                        {memoire.nom_fichier}
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
