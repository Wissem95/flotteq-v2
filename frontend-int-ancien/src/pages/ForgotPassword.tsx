import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom"; // Import Link

const backgroundImages = [
  "/backgrounds/fleet1.jpg",
  "/backgrounds/fleet2.jpg",
  "/backgrounds/fleet3.jpg",
];

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [bgImage, setBgImage] = useState("");

  useEffect(() => {
    const bg = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    setBgImage(bg);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO : envoyer la demande à l’API
    setSent(true);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center transition-all duration-500"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded shadow-md w-full max-w-sm space-y-6 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-center text-gray-800">Mot de passe oublié</h1>
        {sent ? (
          <p className="text-green-600 text-center text-sm">Un lien vous a été envoyé par email.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button className="w-full" type="submit">
              Envoyer
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
  );
};

export default ForgotPassword;

