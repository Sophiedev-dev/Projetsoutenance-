'use client';

import styled from 'styled-components';
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const Form = () => {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [message, setMessage] = useState<string>("");
  const router = useRouter(); 

  useEffect(() => {
    const emailFromParams = searchParams.get("email");
    setEmail(emailFromParams);
    console.log("Email récupéré dans la vérification:", emailFromParams);
  }, [searchParams]);
  

  const handleChange = (index: number, value: string) => {
    // Si tu veux autoriser aussi bien des chiffres que des lettres, tu peux enlever la condition de test.
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  
    // Affiche l'OTP complet après modification (brut, pas de vérification)
    console.log("OTP complet jusqu'à présent:", newOtp.join(""));
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("OTP saisi:", otp);

    // Filtrer les valeurs vides pour s'assurer d'avoir un code correct
    const code = otp.filter(char => char.trim() !== "").join("");

    if (code.length !== 6) {
      setMessage("Veuillez entrer un code OTP valide.");
      return;
    }

    if (email) {
      console.log("Code:", code, "Email:", email);
      try {
        const response = await fetch("http://localhost:5000/api/etudiant/activate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code }),
        });

        const data = await response.json();
        setMessage(data.message);

        router.push("/Sign");
      } catch (error) {
        setMessage("Erreur lors de la vérification. Veuillez réessayer.");
      }
    } else {
      setMessage("Email introuvable.");
    }
};


  return (
    <StyledWrapper>
      <form className="otp-Form" onSubmit={handleSubmit}>
        <span className="mainHeading">Enter OTP</span>
        <p className="otpSubheading">We have sent a verification code to:</p>
        <p className="font-medium text-blue-600">{email || "No email found"}</p>
        <div className="inputContainer">
          <input required="required" maxLength={1} type="text" className="otp-input" id="otp-input1" onChange={(e) => handleChange(0, e.target.value)} />
          <input required="required" maxLength={1} type="text" className="otp-input" id="otp-input2" onChange={(e) => handleChange(1, e.target.value)} />
          <input required="required" maxLength={1} type="text" className="otp-input" id="otp-input3" onChange={(e) => handleChange(2, e.target.value)} />
          <input required="required" maxLength={1} type="text" className="otp-input" id="otp-input4" onChange={(e) => handleChange(3, e.target.value)} />
          <input required="required" maxLength={1} type="text" className="otp-input" id="otp-input5" onChange={(e) => handleChange(4, e.target.value)} />
          <input required="required" maxLength={1} type="text" className="otp-input" id="otp-input6" onChange={(e) => handleChange(5, e.target.value)} />
        </div>
        <button className="verifyButton" type="submit">Verify</button>
        <p className="message">{message}</p>
        <button className="exitBtn">×</button>
        <p className="resendNote">Didn't receive the code? <button className="resendBtn">Resend Code</button></p>
      </form>
    </StyledWrapper>
  );
};

// export default Form;
const StyledWrapper = styled.div`
  .otp-Form {
    width: 230px;
    height: 300px;
    background-color: rgb(255, 255, 255);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 30px;
    gap: 20px;
    position: relative;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.082);
    border-radius: 15px;
  }

  .mainHeading {
    font-size: 1.1em;
    color: rgb(15, 15, 15);
    font-weight: 700;
  }

  .otpSubheading {
    font-size: 0.7em;
    color: black;
    line-height: 17px;
    text-align: center;
  }

  .inputContainer {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    justify-content: center;
  }

  .otp-input {
    background-color: rgb(228, 228, 228);
    width: 30px;
    height: 30px;
    text-align: center;
    border: none;
    border-radius: 7px;
    caret-color: rgb(127, 129, 255);
    color: rgb(44, 44, 44);
    outline: none;
    font-weight: 600;
  }

  .otp-input:focus,
  .otp-input:valid {
    background-color: rgba(127, 129, 255, 0.199);
    transition-duration: .3s;
  }

  .verifyButton {
    width: 100%;
    height: 30px;
    border: none;
    background-color: rgb(127, 129, 255);
    color: white;
    font-weight: 600;
    cursor: pointer;
    border-radius: 10px;
    transition-duration: .2s;
  }

  .verifyButton:hover {
    background-color: rgb(144, 145, 255);
    transition-duration: .2s;
  }

  .exitBtn {
    position: absolute;
    top: 5px;
    right: 5px;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.171);
    background-color: rgb(255, 255, 255);
    border-radius: 50%;
    width: 25px;
    height: 25px;
    border: none;
    color: black;
    font-size: 1.1em;
    cursor: pointer;
  }

  .resendNote {
    font-size: 0.7em;
    color: black;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }

  .resendBtn {
    background-color: transparent;
    border: none;
    color: rgb(127, 129, 255);
    cursor: pointer;
    font-size: 1.1em;
    font-weight: 700;
  }`;

export default Form;
