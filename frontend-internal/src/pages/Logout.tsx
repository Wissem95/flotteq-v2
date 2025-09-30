// Clients/src/pages/Logout.tsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Suppression du token + redirection
    localStorage.removeItem("token");

    const timeout = setTimeout(() => {
      navigate("/login");
    }, 2000); // redirection après 2 secondes

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100">
      <div className="bg-white p-8 rounded shadow-md text-center max-w-md w-full">
        <h1 className="text-xl font-semibold text-gray-800">Déconnexion en cours...</h1>
        <p className="text-sm text-gray-600 mt-2">Vous allez être redirigé vers la page de connexion.</p>
      </div>
    </div>
  );
};

export default Logout;

