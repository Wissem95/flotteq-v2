import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { handleGoogleCallback } from "@/services/googleAuthService";
import { handleLoginSuccess } from "@/services/authService";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Vérifier si on a déjà traité ce callback
        const callbackProcessed = sessionStorage.getItem('google_callback_processed');
        if (callbackProcessed) {
          navigate("/dashboard", { replace: true });
          return;
        }

        // Traiter les données passées directement par le backend
        const data = searchParams.get('data');
        if (data) {
          try {
            const authData = JSON.parse(atob(data));
            
            // Marquer le callback comme traité
            sessionStorage.setItem('google_callback_processed', 'true');
            
            // Utiliser la fonction handleLoginSuccess pour gérer la redirection
            handleLoginSuccess(authData.user, authData.token);
            return;
          } catch (parseError) {
            console.error("Erreur parsing des données:", parseError);
            setError("Erreur lors du traitement des données d'authentification");
            setLoading(false);
            return;
          }
        }

        // Méthode de fallback avec code et state
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Vérifier s'il y a une erreur de Google
        if (error) {
          setError(`Erreur Google: ${error}`);
          setLoading(false);
          return;
        }

        // Vérifier que nous avons les paramètres nécessaires
        if (!code || !state) {
          setTimeout(() => navigate("/login", { replace: true }), 1000);
          return;
        }

        // Traiter le callback avec l'ancienne méthode
        const response = await handleGoogleCallback(code, state);
        
        // Marquer le callback comme traité
        sessionStorage.setItem('google_callback_processed', 'true');
        
        // Utiliser la fonction handleLoginSuccess pour gérer la redirection
        handleLoginSuccess(response.user, response.token);
        
      } catch (err: unknown) {
        console.error("💥 Erreur callback Google:", err);
        const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
        setError(`Erreur d'authentification: ${errorMessage}`);
        setLoading(false);
        
        // Rediriger vers login après 3 secondes en cas d'erreur
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Connexion en cours...
          </h2>
          <p className="text-gray-600">
            Finalisation de votre authentification Google
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Erreur d'authentification
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleCallback; 