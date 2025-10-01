import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "@/lib/api";
import { gsap } from "gsap";
import { useGSAP } from '@gsap/react';
import { signInWithGoogle } from "@/services/firebaseAuthService";
import { login as authLogin, handleLoginSuccess, register } from "@/services/authService";

import '/backgrounds/Background_road.svg'


const Login = () => {
  const [bgImage, setBgImage] = useState("");
  const [currentUser, setCurrentUser] = useState<unknown | null>(null);
  const [changeUser, setChangeUser] = useState(false);
  const [users, setUsers] = useState<unknown[]>([]);
  const [identifiant, setIdentifiant] = useState("");
  const [password, setPassword] = useState("");
  const [domaine, setDomaine] = useState("");
  const [error, setError] = useState("");
  const [currentCard, setCurrentCard] = useState(0);
  const [particles, setParticles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Info pour le register

  const [email, setEmail] = useState("");
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [username, setUsername] = useState("");
  const [company_name, setCompany_name] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [isCreatingCompany, setIsCreatingCompany] = useState(true); // Toggle entre "Créer entreprise" et "Se connecter"


  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError("");
      // Utiliser Firebase Auth au lieu de la redirection OAuth classique
      await signInWithGoogle();
    } catch (error) {
      console.error("Erreur Firebase Google Auth:", error);
      setError("Erreur lors de la connexion Google. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const connexionCard = useRef(null);
  const inscriptionCard = useRef(null);
  const backgroundRef = useRef(null);


  // ✅ Redirection si déjà connecté
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ✅ Validation des mots de passe
    if (confirmedPassword !== registerPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      // ✅ Formatage correct des données pour Laravel
      const registrationData = {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: registerPassword,
        password_confirmation: confirmedPassword,
        company_name: (company_name || `${first_name} ${last_name} Entreprise`).trim(),
      };

      let response;
      
      if (isCreatingCompany) {
        // ✅ Mode "Créer mon entreprise" - Crée un nouveau tenant avec l'utilisateur comme admin
        response = await register(registrationData);
      } else {
        // ❌ Mode "Se connecter" - Inscription désactivée pour l'instant
        setError("L'inscription pour rejoindre un tenant existant n'est pas disponible. Contactez l'administrateur de votre entreprise.");
        setLoading(false);
        return;
      }
    
      const { token, user } = response;
      
      // ✅ Utiliser handleLoginSuccess pour gérer la redirection correctement
      handleLoginSuccess(user, token);
    
    } catch (err: unknown) {
      // ✅ Gestion d'erreur améliorée
      const axiosError = err as { response?: { status?: number; data?: { errors?: Record<string, string[]>; message?: string } } };
      if (axiosError.response?.status === 422 && axiosError.response?.data?.errors) {
        const validationErrors = axiosError.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        setError(errorMessages.join(", "));
      } else if (axiosError.response?.data?.message) {
        setError(axiosError.response.data.message);
      } else {
        setError("Erreur lors de l'inscription.");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authLogin(identifiant, password);
      const { user, token } = response;
      
      // Utiliser la fonction handleLoginSuccess pour gérer la redirection
      handleLoginSuccess(user, token);
      
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string, message?: string, errors?: any } } };
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        setError(errorMessages.join(", "));
      } else {
        setError(error.response?.data?.error || error.response?.data?.message || "Erreur lors de la connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  // const handleUserSelect = (email: string) => {
  //   const selected = users.find((u) => u.email === email);
  //   setCurrentUser(selected);
  //   setIdentifiant(selected?.email || selected?.username || "");
  //   setChangeUser(false);
  // };

  // const handleRemoveUser = (email: string) => {
  //   const updated = users.filter((u) => u.email !== email);
  //   localStorage.setItem("localUsers", JSON.stringify(updated));
  //   setUsers(updated);
  //   setCurrentUser(null);
  //   setIdentifiant("");
  //   setChangeUser(false);
  // };

  // Synchronisation GSAP <-> état React
  useGSAP(() => {
    if (backgroundRef.current) {
      gsap.set(backgroundRef.current, { x: "0vw" });
    }
  }, []);

  const LeftCardChange = () => {
    setCurrentCard(1);
    if (backgroundRef.current) {
      gsap.to(backgroundRef.current, {
        x: "-100vw",
        duration: 1,
        ease: "power2.inOut",
      });
    }
  };

  const RightCardChange = () => {
    setCurrentCard(0);
    if (backgroundRef.current) {
      gsap.to(backgroundRef.current, {
        x: "0vw",
        duration: 1,
        ease: "power2.inOut",
      });
    }
  };

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

  return (
    <div ref={backgroundRef} className="absolute inset-0 overflow-hidden min-h-screen w-[200%] bg-gradient-to-tr from-[#0D2F4A] to-[#188994] flex items-center justify-center">
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
      <img className="absolute w-full" src="/backgrounds/Background_road.svg" />
      <div className="relative w-full overflow-hidden">
        <div className="flex transition-transform duration-500 ease-in-out">
          
          {/* Première carte - Inscription */}
          <div className="flex justify-center items-center w-screen h-screen px-0">
            <div ref={inscriptionCard} className="w-[500px] m-3">
              <div className="flex flex-col w-full bg-white/10 backdrop-blur-lg border border-white/75 rounded-3xl p-4 py-5 text-white shadow-lg">
                <button className="text-base font-extralight text-white opacity-75 mb-6 flex items-center gap-2 hover:underline">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF" opacity={0.7}><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>
                  Retour au site principal
                </button>

                <h2 className="text-2xl font-extralight text-center mb-6">Bienvenue sur Flotteq</h2>

                {/* Toggle Mode d'inscription */}
                <div className="flex justify-center mb-6 px-10">
                  <div className="bg-white/20 rounded-xl p-1 flex">
                    <button
                      type="button"
                      onClick={() => setIsCreatingCompany(true)}
                      className={`px-4 py-2 rounded-lg text-sm font-extralight transition-all ${
                        isCreatingCompany 
                          ? 'bg-white text-blue-900 shadow-md' 
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      Créer mon entreprise
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCompany(false)}
                      className={`px-4 py-2 rounded-lg text-sm font-extralight transition-all ${
                        !isCreatingCompany 
                          ? 'bg-white text-blue-900 shadow-md' 
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      Se connecter
                    </button>
                  </div>
                </div>

                {isCreatingCompany ? (
                  <>
                    <form className="space-y-4 px-10" onSubmit={handleRegister}>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="email"
                          placeholder="Email"
                          className="col-span-2 px-4 py-3 rounded-xl bg-white/20 placeholder-white text-white font-thin focus:outline-none focus:ring-2 focus:ring-cyan-300"
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Prénom"
                          className="px-4 py-3 rounded-xl bg-white/20 placeholder-white text-white font-thin focus:outline-none focus:ring-2 focus:ring-cyan-300"
                          onChange={(e) => setFirst_name(e.target.value)}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Nom"
                          className="px-4 py-3 rounded-xl bg-white/20 placeholder-white text-white font-thin focus:outline-none focus:ring-2 focus:ring-cyan-300"
                          onChange={(e) => setLast_name(e.target.value)}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Nom de l'entreprise"
                          className="col-span-2 px-4 py-3 rounded-xl bg-white/20 placeholder-white text-white font-thin focus:outline-none focus:ring-2 focus:ring-cyan-300"
                          onChange={(e) => setCompany_name(e.target.value)}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Nom d'utilisateur"
                          className="px-4 py-3 rounded-xl bg-white/20 placeholder-white text-white font-thin focus:outline-none focus:ring-2 focus:ring-cyan-300"
                          required
                          onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                          type="password"
                          placeholder="Mot de passe"
                          className="px-4 py-3 rounded-xl bg-white/20 placeholder-white text-white font-thin focus:outline-none focus:ring-2 focus:ring-cyan-300"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          required
                        />
                        <input
                          type="password"
                          placeholder="Confirmation"
                          className="px-4 py-3 rounded-xl bg-white/20 placeholder-white text-white font-thin focus:outline-none focus:ring-2 focus:ring-cyan-300"
                          value={confirmedPassword}
                          onChange={(e) => setConfirmedPassword(e.target.value)}
                          required
                        />
                      </div>

                      {error && (
                        <div className="text-red-300 text-sm text-center bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                          {error}
                        </div>
                      )}

                      <div className="flex justify-center w-full">
                        <div className="relative bg-gradient-to-br from-[#FFFFFF] to-[#6AB1B0] p-[1px] rounded-full w-min">
                          <button 
                            type="submit" 
                            disabled={loading}
                            className="flex justify-center w-min self-center relative px-12 py-3 rounded-full bg-[#18A8A5] overflow-hidden disabled:opacity-50"
                          >
                            <span className="text-white text-sm font-extralight">
                              {loading ? 'Création...' : 'Créer mon entreprise'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </form>

                    <div className="my-3 flex items-center justify-center">
                      <hr className="w-1/4 border-white/30" />
                        <span className="mx-2 text-sm text-white/70">ou</span>
                      <hr className="w-1/4 border-white/30" />
                    </div>

                    <div className="flex justify-center w-full">
                      <div className="relative bg-gradient-to-br from-[#FFFFFF] to-[#6AB1B0] p-[1px] rounded-full w-auto">
                        <button 
                          onClick={handleGoogleAuth} 
                          disabled={loading}
                          className="flex justify-center items-center gap-2 w-full self-center relative px-8 py-3 rounded-full bg-[#18A8A5] overflow-hidden disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="text-white text-sm font-extralight">Connexion...</span>
                            </>
                          ) : (
                            <>
                              <svg className="h-4 w-4" viewBox="0 0 24 24">
                                <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                              </svg>
                              <span className="text-white text-sm font-extralight">Créer avec <span className="font-semibold">Google</span></span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="px-10">
                    <div className="bg-white/10 border border-white/30 rounded-xl p-6 text-center">
                      <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-light mb-3">Rejoindre une entreprise existante</h3>
                      <p className="text-white/70 text-sm mb-4">
                        Pour rejoindre une entreprise déjà inscrite sur Flotteq, vous devez être invité par l'administrateur de cette entreprise.
                      </p>
                      <p className="text-white/80 text-sm">
                        Contactez votre administrateur pour recevoir une invitation ou utilisez le lien d'invitation qu'il vous a fourni.
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-base text-white/80 mt-8 text-center">
                  Vous avez déjà un compte ?{" "}
                  <button onClick={LeftCardChange} className="text-cyan-300 hover:underline">Se connecter</button>
                </p>
              </div>
            </div>
          </div>
          {/* Deuxième carte - Connexion */}
          <div className="flex justify-center items-center w-screen min-h-screen px-4">
            <div ref={connexionCard} className="flex-shrink-0 w-full max-w-[500px]">
              <div className="flex flex-col w-full bg-white/10 backdrop-blur-lg border border-white/75 rounded-3xl p-4 sm:p-8 text-white shadow-lg">
                <button className="text-base font-extralight text-white opacity-75 mb-6 sm:mb-10 flex items-center gap-2 hover:underline">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF" opacity={0.7}><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>
                  Retour au site principal
                </button>

                <h2 className="text-xl sm:text-2xl font-extralight text-center mb-6 sm:mb-10">Bienvenue sur Flotteq</h2>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 px-2 sm:px-10">
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Email"
                      value={identifiant}
                      onChange={(e) => setIdentifiant(e.target.value)}
                      className="w-full px-4 py-2 sm:py-3 rounded-xl bg-white/20 placeholder-white text-white font-thin opacity focus:outline-none focus:ring-2 focus:ring-cyan-300"
                    />
                    <input
                      type="password"
                      placeholder="Mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 sm:py-3 rounded-xl bg-white/20 placeholder-white text-white font-thin focus:outline-none focus:ring-2 focus:ring-cyan-300"
                    />
                  </div>

                  {error && (
                    <div className="text-red-300 text-sm text-center">{error}</div>
                  )}

                  <div className="flex justify-center w-full">
                    <div className="relative bg-gradient-to-br from-[#FFFFFF] to-[#6AB1B0] p-[1px] rounded-full w-full">
                      <button type="submit" className="flex justify-center w-full self-center relative px-6 py-2 sm:py-3 rounded-full bg-[#18A8A5] overflow-hidden">
                        <span className="text-white text-sm font-extralight">Connexion</span>
                      </button>
                    </div>
                  </div>
                </form>

                <div className="my-4 sm:my-6 flex items-center justify-center">
                  <hr className="w-1/4 border-white/30" />
                    <span className="mx-2 text-sm text-white/70">ou</span>
                  <hr className="w-1/4 border-white/30" />
                </div>

                <div className="flex justify-center w-full">
                  <div className="relative bg-gradient-to-br from-[#FFFFFF] to-[#6AB1B0] p-[1px] rounded-full w-full">
                    <button 
                      onClick={handleGoogleAuth} 
                      disabled={loading}
                      className="flex justify-center items-center gap-2 w-full self-center relative px-6 py-2 rounded-full bg-[#18A8A5] overflow-hidden disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-white text-sm font-extralight">Connexion...</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          <span className="text-white text-sm font-extralight">Connexion via <span className="font-semibold">Google</span></span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-sm text-white/80 mt-6 text-center">
                  Vous n'avez pas de compte ?{" "}
                  <button onClick={RightCardChange} className="text-cyan-300 hover:underline">S'inscrire</button>
                </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Login;