import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "@/lib/api";
import { useNavigate, Link } from "react-router-dom";

import Modal from "@/components/Modal";

import CGUPopup from "./CGUPopup";

const Register = () => {
  const navigate = useNavigate();
  const [bgImage, setBgImage] = useState("");
  const [showCGU, setShowCGU] = useState(false);
 const [formData, setFormData] = useState({
  prenom: "",
  nom: "",
  username: "",
  email: "",
  confirmEmail: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
});
  const [error, setError] = useState("");

  useEffect(() => {
    const bg = [
      "/backgrounds/fleet1.jpg",
      "/backgrounds/fleet2.jpg",
      "/backgrounds/fleet3.jpg",
    ][Math.floor(Math.random() * 3)];
    setBgImage(bg);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAcceptCGU = () => {
    setFormData((prev) => ({ ...prev, acceptTerms: true }));
    setShowCGU(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      setError("Vous devez accepter les CGU.");
      return;
    }
    if (formData.email !== formData.confirmEmail) {
      setError("Les emails ne correspondent pas.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      // Formatage des données selon ce que le backend Laravel attend
      const registrationData = {
        first_name: formData.prenom,
        last_name: formData.nom,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword, // ✅ Requis par Laravel
        company_name: `${formData.prenom} ${formData.nom} Entreprise`, // ✅ Génération automatique
      };

      await axios.post("/auth/register", registrationData);
      navigate("/register-success");
    } catch (err: unknown) {
      // ✅ Gestion améliorée des erreurs de validation Laravel  
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
    }
  };

  return (
    <>
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="bg-white bg-opacity-90 p-8 rounded shadow-md w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold text-center">Créer un compte</h1>
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">



{/* Prénom */}
<div>
  <Label>Prénom</Label>
  <Input
    name="prenom"
    required
    value={formData.prenom}
    onChange={handleChange}
  />
</div>

{/* Nom */}
<div>
  <Label>Nom</Label>
  <Input
    name="nom"
    required
    value={formData.nom}
    onChange={handleChange}
  />
</div>



            <div>
              <Label>Nom d'utilisateur</Label>
              <Input
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Confirmer l'email</Label>
              <Input
                type="email"
                name="confirmEmail"
                required
                value={formData.confirmEmail}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Mot de passe</Label>
              <Input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Confirmer le mot de passe</Label>
              <Input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
              />
              <span className="text-sm">
                J'accepte les{" "}
                <button
                  type="button"
                  className="underline text-blue-600"
                  onClick={() => setShowCGU(true)}
                >
                  Conditions Générales
                </button>
              </span>
            </div>

            <Button type="submit" className="w-full">
              Créer un compte
            </Button>
          </form>

          <p className="text-center text-sm">
            Vous avez déjà un compte ?{" "}
            <Link to="/login" className="text-blue-600 underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>

{/* ——— POPUP CGU ——— */}
<Modal isOpen={showCGU} onClose={() => setShowCGU(false)}>
  <CGUPopup />
  <div className="mt-4 flex justify-end">
    <Button onClick={handleAcceptCGU}>Accepter et fermer</Button>
  </div>
</Modal>
    </>
  );
};

export default Register;

