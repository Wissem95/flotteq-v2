// Clients/src/pages/RegisterSuccess.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const RegisterSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Inscription réussie !</h1>
        <p className="mb-6">Votre compte a bien été créé. Vous pouvez maintenant vous connecter.</p>
        <Button onClick={() => navigate("/")}>Aller à la page de connexion</Button>
      </div>
    </div>
  );
};

export default RegisterSuccess;

