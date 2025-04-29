"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Form = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');
  const router = useRouter(); // Initialisation du hook
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
      console.log("Envoi des données:", formData); // Pour déboguer

      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      // Vérifier le type de contenu de la réponse
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("La réponse n'est pas au format JSON!");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      alert('Inscription réussie !');
      setName('');
      setSurname('');
      setEmail('');
      setPassword('');
      setConfPassword('');
      router.push(`/verification?email=${encodeURIComponent(email)}`);

    } catch (error) {
      console.error("Erreur:", error);
      alert(error.message || "Erreur de connexion au serveur");
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
          <form onSubmit={handleSubmit} className="backdrop-blur-lg bg-white/80 p-6 md:p-8 rounded-2xl shadow-xl space-y-4 md:space-y-6 border border-gray-100">
            <div className="text-center space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Create Account
              </h1>
              <p className="text-sm md:text-base text-gray-500">Sign up and get full access to our app</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 rounded-xl bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-sm md:text-base"
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
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2.5 md:py-3 rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-sm md:text-base"
            >
              Create Account
            </button>

            <div className="text-center text-xs md:text-sm text-gray-600">
              Already have an account?{' '}
              <a href="./Sign" className="font-medium text-blue-600 hover:text-purple-600 transition-colors">
                Sign in
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block w-1/2 relative">
        <div 
          className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg')] bg-cover bg-center"
        >
          <div className="absolute inset-0 bg-blue-900/80 flex items-center justify-center p-12">
            <div className="text-center text-white space-y-6">
              <h2 className="text-4xl font-bold">Rejoignez notre communauté académique</h2>
              <p className="text-lg">
                Créez votre compte pour accéder à notre plateforme de gestion et de vérification des mémoires académiques.
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

export default Form;