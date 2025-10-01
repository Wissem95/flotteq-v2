// LoginPage.tsx - Page de connexion pour l'interface d'administration FlotteQ

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useInternalAuth } from "@/hooks/useInternalAuth";
import { internalAuthService } from "@/services/internalAuthService";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useInternalAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [dbStatus, setDbStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Vérifier la santé de l'API au chargement
  React.useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const isOnline = await internalAuthService.checkDatabaseConnection();
        setDbStatus(isOnline ? 'online' : 'offline');
      } catch {
        setDbStatus('offline');
      }
    };
    checkApiHealth();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Effacer l'erreur quand l'utilisateur tape
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard/overview");
    } catch (err: any) {
      setError(err.message || "Erreur de connexion. Vérifiez vos identifiants.");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">FlotteQ Admin</h1>
          <p className="text-gray-600 mt-2">Interface d'administration</p>
        </div>

        {/* Formulaire de connexion */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Connexion</CardTitle>
            <CardDescription>
              Connectez-vous à l'interface d'administration FlotteQ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@flotteq.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Connexion...
                  </div>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

          </CardContent>
        </Card>

        {/* Informations supplémentaires */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Interface réservée aux administrateurs FlotteQ</p>
          <p className="mt-1">
            Besoin d'aide ? Contactez l'équipe technique
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 