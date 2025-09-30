import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

import '/backgrounds/Background_road.svg'

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [bgImage, setBgImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // useEffect(() => {
  //   // Génère les particules une seule fois
  //   const generated = Array.from({ length: 20 }).map(() => ({
  //     left: `${Math.random() * 100}%`,
  //     top: `${Math.random() * 100}%`,
  //     duration: 3 + Math.random() * 10,
  //     delay: Math.random() * 1,
  //   }))
  //   setParticles(generated)
  // }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/password/send-code", {
        contact: email,
        method: "email"
      });
      setSent(true);
      
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
      
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 
        "Erreur lors de l'envoi du code."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center transition-all duration-500"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded shadow-md w-full max-w-sm space-y-6 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-center text-gray-800">Mot de passe oublié</h1>
        {sent ? (
          <div className="text-center">
            <p className="text-green-600 text-sm mb-4">
              Un code de réinitialisation vous a été envoyé par email.
            </p>
            <p className="text-gray-600 text-sm">
              Redirection vers la page de vérification...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <div>
              <Input
                type="email"
                placeholder="Votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Envoi en cours..." : "Envoyer le code"}
            </Button>
          </form>
        )}
        <p className="text-center text-sm mt-2">
          Vous vous souvenez de votre mot de passe ?{" "}
          <Link to="/login" className="text-blue-600 underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword;
