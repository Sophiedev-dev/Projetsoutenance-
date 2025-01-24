"use client";

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Form = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    const formData = {
      name,
      surname,
      email,
      password,
    };

    try {
      const response = await fetch('http://localhost:5000/api/etudiant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Étudiant ajouté avec succès !');
        setName('');
        setSurname('');
        setEmail('');
        setPassword('');
        setConfPassword('');
      } else {
        const errorData = await response.json();
        alert(`Erreur : ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
      alert("Erreur de connexion au serveur.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="backdrop-blur-lg bg-white/80 p-8 rounded-2xl shadow-xl space-y-6 border border-gray-100">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Create Account
            </h1>
            <p className="text-gray-500">Sign up and get full access to our app</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <input
                required
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
              placeholder="john.doe@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                required
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                required
                type={passwordVisible ? "text" : "password"}
                value={confPassword}
                onChange={(e) => setConfPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          >
            Create Account
          </button>

          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="./Sign" className="font-medium text-blue-600 hover:text-purple-600 transition-colors">
              Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;