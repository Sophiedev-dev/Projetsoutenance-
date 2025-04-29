'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'; 

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Tentative de connexion avec:', { email, password }); // Debug
  
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Ajout pour les cookies
      });
  
      console.log('Réponse du serveur:', response.status); // Debug
  
      const data = await response.json();
      console.log('Données reçues:', data); // Debug
  
      if (!response.ok) {
        setError(data.message || 'Erreur de connexion');
        return;
      }
  
      if (data.success) {
        if (data.user.role === 'admin') {
          const adminData = {
            user: {
              id_admin: data.user.id,
              name: data.user.name,
              email: data.user.email
            },
            role: 'admin'
          };
          localStorage.setItem('user', JSON.stringify(adminData));
          console.log('Redirection admin...'); // Debug
          router.push('/adminDashboard');
        } else {
          const userData = {
            user: {
              id_etudiant: data.user.id,
              name: data.user.name,
              email: data.user.email
            },
            role: 'etudiant'
          };
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('Redirection étudiant...'); // Debug
          router.push(`/login?id=${data.user.id}`);
        }
      } else {
        setError(data.message || 'Erreur de connexion');
      }
    } catch (err) {
      console.error('Erreur complète:', err);
      setError('Erreur de connexion au serveur');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative">
        <button
          onClick={() => router.push('/')}
          className="absolute top-4 left-4 flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-300"
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>
  
        <div className="w-full max-w-md">
          <form 
            onSubmit={handleSubmit}
            className="space-y-6 p-8"
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-blue-600">
                Memo Guardian
              </h1>
              <p className="text-gray-600">Protégez l'intégrité académique et valorisez l'excellence</p>
            </div>
  
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Adresse email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
                  placeholder="admin@test.com"
                />
              </div>
  
              <div>
                <label className="text-sm font-medium text-gray-700">Mot de passe</label>
                <div className="relative">
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
  
            {error && (
              <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
  
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Se connecter
            </button>
  
            <div className="text-center text-sm text-gray-600">
              Vous n'avez pas de compte?{' '}
              <Link 
                href="./register"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                S'inscrire
              </Link>
            </div>
          </form>
        </div>
      </div>
  
      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-blue-600">
        <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1457369804613-52c61a468e7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1050&q=80')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-blue-900/70 flex items-center justify-center">
            <div className="text-center text-white p-8 max-w-lg">
            <h2 className="text-4xl font-bold">Assurez l'authenticité académique</h2>
            <p className="text-lg">
              Notre système assure l'intégrité de vos mémoires académiques grâce à une vérification avancée de plagiat et une certification numérique sécurisée.
            </p>
            <div className="flex justify-center space-x-12 mt-8">
              <div className="text-center">
                <div className="text-4xl font-bold">100%</div>
                <div className="text-sm opacity-80">Sécurisé</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">99.9%</div>
                <div className="text-sm opacity-80">Précision</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">24/7</div>
                <div className="text-sm opacity-80">Disponible</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
);
};

export default SignInPage;