"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Form = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility

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
    <StyledWrapper>
      <form className="form" onSubmit={handleSubmit}>
        <p className="title">Sign Up</p>
        <p className="message">Signup now and get full access to our app.</p>
        <div className="flex">
          <label>
            <input
              required
              placeholder="First name"
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            <input
              required
              placeholder="Last name"
              type="text"
              className="input"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
          </label>
        </div>
        <label>
          <input
            required
            placeholder="Email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          <input
            required
            placeholder="Password"
            type={passwordVisible ? "text" : "password"} // Toggle password visibility
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordToggle onClick={() => setPasswordVisible(!passwordVisible)}>
            {passwordVisible ? <FiEyeOff /> : <FiEye />} {/* Affiche l'icône de l'œil */}
          </PasswordToggle>
        </label>
        <label>
          <input
            required
            placeholder="Confirm password"
            type={passwordVisible ? "text" : "password"} // Toggle password visibility
            className="input"
            value={confPassword}
            onChange={(e) => setConfPassword(e.target.value)}
          />
          <PasswordToggle onClick={() => setPasswordVisible(!passwordVisible)}>
            {passwordVisible ? <FiEyeOff /> : <FiEye />} {/* Affiche l'icône de l'œil */}
          </PasswordToggle>
        </label>
        <button className="submit" type="submit">
          Submit
        </button>
        <p className="signin">
          Already have an account? <a href="./Sign">Sign in</a>
        </p>
      </form>
    </StyledWrapper>
  );
};

const PasswordToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 10px;
  color: #888;
`;

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5; /* Une couleur de fond agréable */
  
  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 350px;
    background-color: #fff;
    padding: 20px;
    border-radius: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .title {
    font-size: 28px;
    color: royalblue;
    font-weight: 600;
    letter-spacing: -1px;
    position: relative;
    display: flex;
    align-items: center;
    padding-left: 30px;
  }

  .title::before, .title::after {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    border-radius: 50%;
    left: 0px;
    background-color: royalblue;
  }

  .title::after {
    animation: pulse 1s linear infinite;
  }

  .message, .signin {
    color: rgba(88, 87, 87, 0.822);
    font-size: 14px;
    text-align: center;
  }

  .signin a {
    color: royalblue;
    text-decoration: none;
  }

  .signin a:hover {
    text-decoration: underline;
  }

  .flex {
    display: flex;
    width: 100%;
    gap: 6px;
  }

  .form label {
    position: relative;
  }

  .form label .input {
    width: 100%;
    padding: 10px 10px 20px 10px;
    outline: 0;
    border: 1px solid rgba(105, 105, 105, 0.397);
    border-radius: 10px;
  }

  .form label .input:placeholder-shown + span {
    top: 15px;
    font-size: 0.9em;
  }

  .form label .input:focus + span, .form label .input:valid + span {
    top: 30px;
    font-size: 0.7em;
    font-weight: 600;
  }

  .form label .input:valid + span {
    color: green;
  }

  .submit {
    border: none;
    outline: none;
    background-color: royalblue;
    padding: 10px;
    border-radius: 10px;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .submit:hover {
    background-color: rgb(56, 90, 194);
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

export default Form;