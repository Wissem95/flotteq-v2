import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "@/lib/api";

const backgroundImages = [
  "/backgrounds/fleet1.jpg",
  "/backgrounds/fleet2.jpg",
  "/backgrounds/fleet3.jpg",
];

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [bgImage, setBgImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Formulaire
  const [formData, setFormData] = useState({
    contact: searchParams.get('email') || '',
    code: '',
    new_password: '',
    new_password_confirmation: ''
  });

  useEffect(() => {
    const bg = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    setBgImage(bg);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation côté client
    if (formData.new_password !== formData.new_password_confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    if (formData.new_password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      setLoading(false);
      return;
    }

    try {
              await axios.post("/api/auth/password/verify-code", {
        contact: formData.contact,
        code: formData.code,
        new_password: formData.new_password,
        new_password_confirmation: formData.new_password_confirmation
      });
      
      setSuccess(true);
      
      // Redirection vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 
        "Erreur lors de la réinitialisation du mot de passe."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center transition-all duration-500"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="bg-white bg-opacity-90 p-8 rounded shadow-md w-full max-w-sm space-y-6 backdrop-blur-sm">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">✅ Succès !</h1>
            <p className="text-green-600 text-sm mb-4">
              Votre mot de passe a été réinitialisé avec succès.
            </p>
            <p className="text-gray-600 text-sm">
              Redirection vers la page de connexion...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center transition-all duration-500"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded shadow-md w-full max-w-md space-y-6 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Réinitialiser le mot de passe
        </h1>
        
        <p className="text-center text-sm text-gray-600">
          Entrez le code de vérification reçu et votre nouveau mot de passe
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              name="contact"
              placeholder="Votre email"
              value={formData.contact}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code de vérification
            </label>
            <Input
              type="text"
              name="code"
              placeholder="Code à 6 chiffres (ex: 149871)"
              value={formData.code}
              onChange={handleChange}
              maxLength={6}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <Input
              type="password"
              name="new_password"
              placeholder="Nouveau mot de passe (min. 8 caractères)"
              value={formData.new_password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <Input
              type="password"
              name="new_password_confirmation"
              placeholder="Confirmez le nouveau mot de passe"
              value={formData.new_password_confirmation}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
          </Button>
        </form>

        <p className="text-center text-sm mt-4">
          <Link to="/login" className="text-blue-600 underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword; 