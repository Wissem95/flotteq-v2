// 📁 clients/src/pages/Login.tsx

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import axios from "@/lib/api";

// Utilitaires sécurisés
import { safeArray, safeLength, safeFind, safeFilter, safeMap } from '@/utils/safeData';

const backgroundImages = [
  "/backgrounds/fleet1.jpg",
  "/backgrounds/fleet2.jpg",
  "/backgrounds/fleet3.jpg",
];

const Login = () => {
  const [bgImage, setBgImage] = useState("");
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [changeUser, setChangeUser] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [identifiant, setIdentifiant] = useState(""); // email ou pseudo
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const bg = backgroundImages[Math.floor(Math.random() * safeLength(backgroundImages))];
    setBgImage(bg);
    const localUsers = JSON.parse(localStorage.getItem("localUsers") || "[]");
    setUsers(localUsers);
    if (safeLength(localUsers) > 0) {
      const lastUser = localUsers[safeLength(localUsers) - 1];
      setCurrentUser(lastUser);
      setIdentifiant(lastUser?.email || lastUser?.username || "");
    }
  }, []);

  // ✅ Redirection si déjà connecté
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLoginSuccess = () => {
    navigate("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // L'API interne attend email et password en JSON
      const response = await axios.post("/auth/login", {
        email: identifiant,
        password: password,
      });

      const { user, token } = response.data;

      localStorage.setItem("token", token);
      const updatedUsers = [...safeFilter(users, (u) => u.email !== user.email), user];
      localStorage.setItem("localUsers", JSON.stringify(updatedUsers));

      handleLoginSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de la connexion.");
    }
  };

  const handleUserSelect = (email: string) => {
    const selected = safeFind(users, (u) => u.email === email);
    setCurrentUser(selected);
    setIdentifiant(selected?.email || selected?.username || "");
    setChangeUser(false);
  };

  const handleRemoveUser = (email: string) => {
    const updated = safeFilter(users, (u) => u.email !== email);
    localStorage.setItem("localUsers", JSON.stringify(updated));
    setUsers(updated);
    setCurrentUser(null);
    setIdentifiant("");
    setChangeUser(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center transition-all duration-500"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded shadow-md w-full max-w-sm space-y-6 backdrop-blur-sm text-center">
        <h1 className="text-2xl font-bold text-gray-800">Connexion</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <Label>Email ou Nom d'utilisateur</Label>
            <Input
              type="text"
              required
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
            />
          </div>
          <div>
            <Label>Mot de passe</Label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Se connecter
          </Button>
        </form>

        {/* Google SSO */}
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`}
        >
          Se connecter avec Google
        </Button>

        {currentUser && !changeUser && (
          <div className="flex justify-between text-sm">
            <button
              onClick={() => setChangeUser(true)}
              className="text-blue-500 underline"
            >
              Changer d'utilisateur
            </button>
            <button
              onClick={() => handleRemoveUser(currentUser.email)}
              className="text-red-500 underline"
            >
              Supprimer
            </button>
          </div>
        )}

        {changeUser && safeLength(users) > 0 && (
          <div className="mt-4 text-left space-y-2">
            <p className="text-sm text-slate-600">Choisir un utilisateur :</p>
            {safeMap(users, (u) => (
              <div
                key={u.email}
                className="flex justify-between items-center text-sm bg-slate-100 rounded p-2"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={u.avatar || "/avatars/default.png"}
                    className="w-6 h-6 rounded-full"
                    alt="avatar"
                  />
                  <span>{u.username}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUserSelect(u.email)}
                >
                  Choisir
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between text-sm text-blue-600 mt-4">
          <Link to="/forgot-password">Mot de passe oublié ?</Link>
          <Link to="/register">S’inscrire</Link>
        </div>

        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => (window.location.href = "https://flotteq.fr")}
        >
          Retour au site principal
        </Button>
      </div>
    </div>
  );
};

export default Login;

