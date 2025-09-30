// client/src/services/authService.ts
import axios from "@/lib/api";

export const login = async (email: string, password: string) => {
  // L'API interne attend email et password en JSON
  const response = await axios.post("/auth/login", {
    email: email,
    password: password,
  });
  return response.data;
};

// Fonction pour rafraîchir les tokens
export const refreshTokens = async (refreshToken: string) => {
  try {
    const response = await axios.post("/auth/refresh", { refreshToken }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors du refresh des tokens:", error);
    throw error;
  }
};

// Fonction pour gérer la connexion réussie
export const handleLoginSuccess = (userData: unknown, accessToken: string, refreshToken?: string) => {
  try {
    // Stocker les données utilisateur et les tokens
    localStorage.setItem("token", accessToken);
    localStorage.setItem("access_token", accessToken);
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
    localStorage.setItem("user", JSON.stringify(userData));

    return true;
  } catch (error) {
    console.error("Erreur lors du stockage des tokens:", error);
    return false;
  }
};




