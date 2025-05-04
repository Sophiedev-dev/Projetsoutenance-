'use client';

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiUrl } from "../utils/config";

const FormContent = () => {
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
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    console.log("OTP complet jusqu'à présent:", newOtp.join(""));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        const response = await fetch(getApiUrl("/api/auth/verify-email"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code }),
        });

        const data = await response.json();
        setMessage(data.message);

        router.push("/Sign");
      } catch (_error) {
        console.error("Erreur de vérification :", _error);
        setMessage("Erreur lors de la vérification. Veuillez réessayer.");
      }
    } else {
      setMessage("Email introuvable.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md px-4 sm:px-0">
        <form 
          onSubmit={handleSubmit}
          className="backdrop-blur-lg bg-white/80 p-6 md:p-8 rounded-2xl shadow-xl space-y-4 md:space-y-6 border border-gray-100 relative"
        >
          {/* Le reste de votre JSX reste inchangé */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Enter OTP
            </h1>
            <p className="text-sm md:text-base text-gray-500">We have sent a verification code to:</p>
            <p className="text-sm md:text-base font-medium text-blue-600">{email || "No email found"}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {otp.map((value, index) => (
              <input
                key={index}
                required
                maxLength={1}
                type="text"
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
                className="w-10 h-10 md:w-12 md:h-12 text-center rounded-lg md:rounded-xl bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-base md:text-lg font-semibold"
              />
            ))}
          </div>

          {message && (
            <div className="bg-red-50 text-red-500 px-3 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2.5 md:py-3 rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-sm md:text-base"
          >
            Verify
          </button>

          <div className="text-center text-xs md:text-sm text-gray-600">
            Didn&apos;t receive the code?{' '}
            <button 
              type="button"
              className="font-medium text-blue-600 hover:text-purple-600 transition-colors"
            >
              Resend Code
            </button>
          </div>

          <button 
            type="button"
            className="absolute top-2 md:top-4 right-2 md:right-4 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-sm md:text-base"
          >
            ×
          </button>
        </form>
      </div>
    </div>
  );
};

const Form = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FormContent />
    </Suspense>
  );
};

export default Form;