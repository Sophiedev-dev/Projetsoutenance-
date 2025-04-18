'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'; 

const Form = () => {
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
    
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 relative">
      {/* Add back button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-300"
      >
        <ArrowLeft size={20} className="w-5 h-5 md:w-6 md:h-6" />
        <span className="hidden md:inline text-sm md:text-base">Back to Home</span>
      </button>

      <div className="w-full max-w-md px-4 sm:px-0">
        <form 
          onSubmit={handleSubmit}
          className="backdrop-blur-lg bg-white/80 p-6 md:p-8 rounded-2xl shadow-xl space-y-4 md:space-y-6 border border-gray-100"
        >
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Welcome Back
            </h1>
            <p className="text-sm md:text-base text-gray-500">Sign in to your account</p>
          </div>

          <div className="space-y-3 md:space-y-4">
            <div className="space-y-1 md:space-y-2">
              <label className="text-xs md:text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-sm md:text-base"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-1 md:space-y-2">
              <label className="text-xs md:text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-sm md:text-base"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {passwordVisible ? <EyeOff size={18} className="w-4 h-4 md:w-5 md:h-5" /> : <Eye size={18} className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 px-3 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-sm md:text-base"
            onClick={(e) => {
              console.log('Bouton cliqué'); // Debug
            }}
          >
            Sign in
          </button>

          <div className="relative py-2 md:py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs md:text-sm">
              <span className="px-2 bg-white/80 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="text-center text-xs md:text-sm text-gray-600">
            Don't have an account?{' '}
            <Link 
              href="./register"
              className="font-medium text-blue-600 hover:text-purple-600 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Form;