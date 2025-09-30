import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Car, MapPin, Phone, Mail, Shield, Edit3, Save, Camera, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

// Interface pour le profil utilisateur
interface UserProfile {
  id?: string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  birthdate?: string;
  gender?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  avatar?: string;
  fleet_role?: string;
  company?: string;
  license_number?: string;
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile>({});
  const [initialUser, setInitialUser] = useState<UserProfile>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  // --- SUPPRESSION DES MOCKS ---
  // const mockApiCall = () => {
  //   return new Promise<any>((resolve) => {
  //     setTimeout(() => {
  //       // Données simulées - remplace par ton vrai appel API
  //       resolve({
  //         data: {
  //           user: {
  //             id: "1",
  //             email: "john.doe@example.com",
  //             username: "johndoe",
  //             first_name: "John",
  //             last_name: "Doe",
  //             phone: "+33 6 12 34 56 78",
  //             birthdate: "1990-05-15",
  //             gender: "male",
  //             address: "123 Rue de la Paix",
  //             postalCode: "75001",
  //             city: "Paris",
  //             country: "France",
  //             fleet_role: "Conducteur principal",
  //             company: "Transport Express",
  //             license_number: "123456789"
  //           }
  //         }
  //       });
  //     }, 1000);
  //   });
  // };

  // const mockApiUpdate = (data: UserProfile) => {
  //   return new Promise<any>((resolve) => {
  //     setTimeout(() => {
  //       resolve({
  //         data: {
  //           user: data,
  //           message: "Profil mis à jour avec succès"
  //         }
  //       });
  //     }, 1500);
  //   });
  // };

  useEffect(() => {
    setLoading(true);
    setError("");
    api.get("/profile/me")
      .then(res => {
        const userData = res.data.user || res.data;
        const processedData = prepareDataForFrontend(userData);
        setUser(processedData);
        setInitialUser(processedData);
      })
      .catch(err => {
        setError("Erreur lors du chargement du profil");
        console.error("❌ Profile: Erreur lors de la récupération:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fonction pour gérer les changements d'input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Fonction pour gérer les changements de select
  const handleSelectChange = (value: string, name: string) => {
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fonction pour mapper les valeurs du frontend vers le backend
  const prepareDataForBackend = (userData: UserProfile) => {
    // Liste des champs attendus par le backend
    const allowedFields = [
      'email',
      'username',
      'first_name',
      'last_name',
      'phone',
      'birthdate',
      'gender',
      'address',
      'postalCode',
      'city',
      'country',
      'company',
      'fleet_role',
      'license_number',
    ];
    const backendData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (userData[key as keyof UserProfile] !== undefined) {
        backendData[key] = userData[key as keyof UserProfile];
      }
    }
    // Conversion des valeurs du genre pour correspondre au backend
    if (backendData.gender) {
      switch (backendData.gender) {
        case 'homme':
          backendData.gender = 'male';
          break;
        case 'femme':
          backendData.gender = 'female';
          break;
        case 'autre':
          backendData.gender = 'other';
          break;
      }
    }
    return backendData;
  };

  // Fonction pour mapper les valeurs du backend vers le frontend
  const prepareDataForFrontend = (userData: UserProfile) => {
    const frontendData = { ...userData };
    
    // Conversion des valeurs du genre pour l'affichage
    if (frontendData.gender) {
      switch (frontendData.gender) {
        case 'male':
          frontendData.gender = 'homme';
          break;
        case 'female':
          frontendData.gender = 'femme';
          break;
        case 'other':
          frontendData.gender = 'autre';
          break;
      }
    }
    
    return frontendData;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const backendData = prepareDataForBackend(user);
      const response = await api.put("/profile/me", backendData);
      if (response.data.user) {
        const frontendData = prepareDataForFrontend(response.data.user);
        setUser(frontendData);
        setInitialUser(frontendData);
        // Mettre à jour le localStorage pour synchroniser l'état global
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Erreur lors de la sauvegarde du profil");
      console.error("❌ Profile: Erreur lors de la sauvegarde:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUser(initialUser);
    setIsEditing(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Message de succès global */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center z-50">
          <CheckCircle className="w-5 h-5 mr-2" />
          Profil mis à jour avec succès !
        </div>
      )}

      {/* Message d'erreur global */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}

      {/* Header avec avatar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-12 h-12 text-white" />
              </div>
              <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-md border hover:bg-gray-50 transition-colors">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {user.first_name && user.last_name ? 
                  `${user.first_name} ${user.last_name}` : 
                  "Nom non renseigné"
                }
              </h1>
              <p className="text-lg text-gray-600">{user.fleet_role || "Rôle non défini"}</p>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <Car className="w-4 h-4 mr-1" />
                {user.company || "Entreprise non renseignée"}
              </p>
            </div>
            {!isEditing && (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar avec infos rapides */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Informations rapides
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.email || "Non renseigné"}</p>
                    <p className="text-xs text-gray-500">Email principal</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.phone || "Non renseigné"}</p>
                    <p className="text-xs text-gray-500">Téléphone</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.city || user.country ? `${user.city || "Ville"}, ${user.country || "Pays"}` : "Non renseigné"}
                    </p>
                    <p className="text-xs text-gray-500">Localisation</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Car className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">{user.license_number || "Non renseigné"}</p>
                    <p className="text-xs text-blue-600">N° Permis de conduire</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Informations du profil</h2>
                <p className="text-sm text-gray-600 mt-1">Gérez vos informations personnelles et professionnelles</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Informations personnelles */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-600" />
                    Informations personnelles
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Prénom</Label>
                      <Input 
                        name="first_name" 
                        value={user.first_name || ""} 
                        onChange={handleChange} 
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="Entrez votre prénom"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Nom</Label>
                      <Input 
                        name="last_name" 
                        value={user.last_name || ""} 
                        onChange={handleChange} 
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="Entrez votre nom"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Nom d'utilisateur</Label>
                      <Input 
                        name="username" 
                        value={user.username || ""} 
                        onChange={handleChange} 
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="Nom d'utilisateur"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Date de naissance</Label>
                      <Input 
                        type="date" 
                        name="birthdate" 
                        value={user.birthdate || ""} 
                        onChange={handleChange} 
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-700">Sexe</Label>
                    <Select 
                      onValueChange={(val) => handleSelectChange(val, "gender")} 
                      value={user.gender || ""}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner votre sexe..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="homme">Homme</SelectItem>
                        <SelectItem value="femme">Femme</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-gray-600" />
                    Contact
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email</Label>
                      <Input 
                        type="email" 
                        name="email" 
                        value={user.email || ""} 
                        onChange={handleChange} 
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="votre.email@exemple.com"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Téléphone</Label>
                      <Input 
                        name="phone" 
                        value={user.phone || ""} 
                        onChange={handleChange} 
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                  </div>
                </div>

                {/* Adresse */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-gray-600" />
                    Adresse
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Adresse</Label>
                      <Input 
                        name="address" 
                        value={user.address || ""} 
                        onChange={handleChange} 
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="123 Rue de la Paix"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Code postal</Label>
                        <Input 
                          name="postalCode" 
                          value={user.postalCode || ""} 
                          onChange={handleChange} 
                          disabled={!isEditing}
                          className="mt-1"
                          placeholder="75001"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Ville</Label>
                        <Input 
                          name="city" 
                          value={user.city || ""} 
                          onChange={handleChange} 
                          disabled={!isEditing}
                          className="mt-1"
                          placeholder="Paris"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Pays</Label>
                        <Input 
                          name="country" 
                          value={user.country || ""} 
                          onChange={handleChange} 
                          disabled={!isEditing}
                          className="mt-1"
                          placeholder="France"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations professionnelles */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Car className="w-5 h-5 mr-2 text-gray-600" />
                    Informations professionnelles
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Entreprise</Label>
                      <Input 
                        name="company" 
                        value={user.company || ""} 
                        onChange={handleChange} 
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="Nom de votre entreprise"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Rôle dans la flotte</Label>
                      <Input 
                        name="fleet_role" 
                        value={user.fleet_role || ""} 
                        onChange={handleChange} 
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="Conducteur, Gestionnaire..."
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-700">N° Permis de conduire</Label>
                    <Input 
                      name="license_number" 
                      value={user.license_number || ""} 
                      onChange={handleChange} 
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="123456789"
                    />
                  </div>
                </div>

                {/* Boutons d'action */}
                {isEditing && (
                  <div className="flex items-center space-x-4 pt-6 border-t">
                    <Button 
                      onClick={handleSubmit}
                      className="bg-blue-600 hover:bg-blue-700 flex items-center" 
                      disabled={loading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Sauvegarde..." : "Sauvegarder"}
                    </Button>
                    
                    <Button 
                      onClick={handleCancel}
                      variant="outline"
                      className="flex items-center"
                      disabled={loading}
                    >
                      Annuler
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;