import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useGSAP } from '@gsap/react';


const VerifyAccount = () => {
  const [error, setError] = useState("");
  const [particles, setParticles] = useState([]);
  const backgroundRef = useRef(null);
  const navigate = useNavigate();
  const [inputType, setInputType] = useState<'email' | 'phone'>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const emailRef = useRef(null)
  const phoneRef = useRef(null)
  const [prevInputType, setPrevInputType] = useState<'email' | 'phone'>(inputType)

  useEffect(() => {
    // Génère les particules une seule fois
    const generated = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 3 + Math.random() * 10,
      delay: Math.random() * 1,
    }));
    setParticles(generated);
  }, []);

  useGSAP(() => {
    if (backgroundRef.current) {
      gsap.set(backgroundRef.current, { x: "0vw" });
    }
  }, []);

  useEffect(() => {
    // Initialisation : email visible, phone caché
    gsap.set(emailRef.current, { y: 0, opacity: 1, pointerEvents: 'auto' })
    gsap.set(phoneRef.current, { y: -60, opacity: 0, pointerEvents: 'none' })
  }, [])

  useEffect(() => {
    if (inputType !== prevInputType) {
      if (inputType === 'email') {
        // On passe de phone à email : phone part vers le haut, email arrive du bas
        gsap.to(phoneRef.current, { y: -60, opacity: 0, duration: 0.4, pointerEvents: 'none' })
        gsap.fromTo(emailRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, pointerEvents: 'auto' })
      } else {
        // On passe de email à phone : email part vers le bas, phone arrive du haut
        gsap.to(emailRef.current, { y: 60, opacity: 0, duration: 0.4, pointerEvents: 'none' })
        gsap.fromTo(phoneRef.current, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, pointerEvents: 'auto' })
      }
      setPrevInputType(inputType)
    }
  }, [inputType, prevInputType])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?\d{7,15}$/;
    if (inputType === "email") {
      if (!emailRegex.test(email)) {
        setError("Veuillez entrer un email valide.");
        return;
      }
    } else {
      if (!phoneRegex.test(phone)) {
        setError("Veuillez entrer un numéro de téléphone valide.");
        return;
      }
    }
    navigate("/verify-code");
  };

  return (
    <div ref={backgroundRef} className="absolute inset-0 overflow-hidden min-h-screen w-full bg-gradient-to-tr from-[#0D2F4A] to-[#188994] flex items-center justify-center px-4">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full opacity-30"
          style={{
            left: p.left,
            top: p.top,
            animation: `float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
      <div className="relative w-full flex justify-center items-center">
        <div className="flex-shrink-0 w-full max-w-md mx-4">
          <div className="flex flex-col w-full bg-white/10 backdrop-blur-md border border-white/75 rounded-3xl p-4 sm:p-8 text-white shadow-lg">
            <h2 className="text-xl sm:text-2xl font-extralight text-center mb-2 sm:mb-4">Vérification de compte</h2>
            <h3 className="text-xs sm:text-sm font-thin text-center mb-6 sm:mb-10">Veuillez entrez votre numéro de téléphone ou votre email pour vérifier votre compte</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full">
              <div className="flex flex-col space-y-4">
                {/* Boutons de sélection */}
                <div className="grid grid-cols-2 gap-3 p-1">
                  <button
                    type="button"
                    onClick={() => setInputType('email')}
                    className={`px-6 py-3 rounded-xl text-sm font-light transition-all duration-300 ${
                      inputType === 'email'
                        ? 'bg-white/20 shadow-lg shadow-white/10 border border-white/50'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputType('phone')}
                    className={`px-6 py-3 rounded-xl text-sm font-light transition-all duration-300 ${
                      inputType === 'phone'
                        ? 'bg-white/20 shadow-lg shadow-white/10 border border-white/50'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    Téléphone
                  </button>
                </div>

                {/* Container pour les inputs */}
                <div className="relative w-full" style={{ height: 48 }}>
                  <div ref={emailRef} style={{ position: 'absolute', width: '100%' }}>
                    <input
                      type="email"
                      placeholder="Entrez votre email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/20 placeholder-white text-white font-thin focus:outline-none focus:ring-2 focus:ring-cyan-300"
                      tabIndex={inputType === 'email' ? 0 : -1}
                    />
                  </div>
                  <div ref={phoneRef} style={{ position: 'absolute', width: '100%' }}>
                    <input
                      type="tel"
                      placeholder="Entrez votre numéro"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/20 placeholder-white text-white font-thin focus:outline-none focus:ring-2 focus:ring-cyan-300"
                      tabIndex={inputType === 'phone' ? 0 : -1}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-red-300 text-xs sm:text-sm text-center">{error}</div>
              )}

              <div className="flex justify-center w-full">
                <div className="relative bg-gradient-to-br from-[#FFFFFF] to-[#6AB1B0] p-[1px] rounded-full w-full max-w-xs">
                  <button type="submit" className="flex self-center relative w-full px-0 sm:px-[50px] py-3 rounded-full bg-[#18A8A5] overflow-hidden">
                    <span className="text-white text-xs sm:text-sm font-extralight w-full text-center">Vérifier</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount; 