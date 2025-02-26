'use client';

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const Form = () => {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(null);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const emailFromParams = searchParams.get("email");
    setEmail(emailFromParams);
    console.log("Email récupéré dans la vérification:", emailFromParams);
  }, [searchParams]);

  const handleChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    console.log("OTP complet jusqu'à présent:", newOtp.join(""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("OTP saisi:", otp);

    const code = otp.filter(char => char.trim() !== "").join("");

    if (code.length !== 6) {
      setMessage("Veuillez entrer un code OTP valide.");
      return;
    }

    if (email) {
      console.log("Code:", code, "Email:", email);
      try {
        const response = await fetch("http://localhost:5000/api/auth/verify-email", {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <form 
          onSubmit={handleSubmit}
          className="backdrop-blur-lg bg-white/80 p-8 rounded-2xl shadow-xl space-y-6 border border-gray-100 relative"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Enter OTP
            </h1>
            <p className="text-gray-500">We have sent a verification code to:</p>
            <p className="font-medium text-blue-600">{email || "No email found"}</p>
          </div>

          <div className="flex justify-center gap-4">
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                required
                maxLength={1}
                type="text"
                className="w-12 h-12 text-center rounded-xl bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-lg font-semibold"
                onChange={(e) => handleChange(index, e.target.value)}
              />
            ))}
          </div>

          {message && (
            <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          >
            Verify
          </button>

          <div className="text-center text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button 
              type="button"
              className="font-medium text-blue-600 hover:text-purple-600 transition-colors"
            >
              Resend Code
            </button>
          </div>

          <button 
            type="button"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            ×
          </button>
        </form>
      </div>
    </div>
  );
};

export default Form;