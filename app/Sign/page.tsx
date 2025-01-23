'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // Import des icônes d'œil

const Form = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); // État pour contrôler la visibilité du mot de passe
  const router = useRouter();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
  
        // Stocker l'objet utilisateur complet dans localStorage
        localStorage.setItem('user', JSON.stringify(data));
  
        // Rediriger en fonction du rôle de l'utilisateur
        if (data.role === 'admin') {
          router.push('/adminDashboard'); // Rediriger vers le tableau de bord admin
        } else if (data.role === 'etudiant') {
          router.push('/login'); // Rediriger vers le tableau de bord utilisateur
          
        }
      } else {
        const data = await response.json();
        setError(data.message || 'Erreur de connexion.');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    }
  };
  

  return (
    <StyledWrapper>
      <form className="form" onSubmit={handleSubmit}>
        <p className="form-title">Sign in</p>
        <div className="input-container">
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <span></span>
        </div>
        <div className="input-container">
          <input
            type={passwordVisible ? 'text' : 'password'} // Affiche le mot de passe ou le masque
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordToggle onClick={() => setPasswordVisible(!passwordVisible)}>
            {passwordVisible ? <FiEyeOff /> : <FiEye />} {/* Affiche l'icône de l'œil */}
          </PasswordToggle>
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit">
          Sign in
        </button>
        <p className="signup-link">
          No account?
          <Link href='./register'>
            Sign up
          </Link>
        </p>
      </form>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f3f4f6;
  
  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 350px;
    background-color: #fff;
    padding: 20px;
    border-radius: 20px;
    position: relative;
  }

  .form-title {
    font-size: 28px;
    color: royalblue;
    font-weight: 600;
    letter-spacing: -1px;
    position: relative;
    display: flex;
    align-items: center;
    padding-left: 30px;
  }

  .form-title::before, .form-title::after {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    border-radius: 50%;
    left: 0px;
    background-color: royalblue;
  }

  .form-title::after {
    animation: pulse 1s linear infinite; /* Animation de pulsation */
  }

  .input-container {
    position: relative;
  }

  .input-container input, .form button {
    outline: none;
    border: 1px solid #e5e7eb;
    margin: 8px 0;
  }

  .input-container input {
    background-color: #fff;
    padding: 1rem;
    padding-right: 3rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    width: 300px;
    border-radius: 0.5rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .submit {
    display: block;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    padding-left: 1.25rem;
    padding-right: 1.25rem;
    background-color: #4F46E5;
    color: #ffffff;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 500;
    width: 100%;
    border-radius: 0.5rem;
    text-transform: uppercase;
  }

  .signup-link {
    color: #6B7280;
    font-size: 0.875rem;
    line-height: 1.25rem;
    text-align: center;
  }

  .signup-link a {
    text-decoration: underline;
    color: #6B7280;
    transition: color 0.3s ease;
  }

  .signup-link a:hover {
    color: #1E40AF;
  }

  @keyframes pulse {
    from {
      transform: scale(0.9);
      opacity: 1;
    }
    to {
      transform: scale(1.8);
      opacity: 0;
    }
  }
`;

const PasswordToggle = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
`;

export default Form;
