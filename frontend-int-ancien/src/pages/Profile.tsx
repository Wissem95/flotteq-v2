import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pencil, User, Mail, Phone, Calendar, MapPin, Globe, Landmark, UserCircle2 } from "lucide-react";
import axios from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

// Types pour l'utilisateur
interface UserProfile {
  id?: string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  prenom?: string;
  nom?: string;
  phone?: string;
  birthdate?: string;
  gender?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  avatar?: string;
  profile_incomplete?: boolean;
  missing_fields?: Record<string, string>;
}

const getInitials = (user: UserProfile | null) => {
  if (!user) return "?";
  const first = user.prenom || user.first_name || "";
  const last = user.nom || user.last_name || "";
  return (first[0] || "").toUpperCase() + (last[0] || "").toUpperCase();
};

const fieldIcons: Record<string, React.ReactNode> = {
  prenom: <User className="text-flotteq-blue" size={18} />, // Prénom
  nom: <User className="text-flotteq-blue" size={18} />, // Nom
  username: <UserCircle2 className="text-flotteq-blue" size={18} />, // Username
  email: <Mail className="text-flotteq-blue" size={18} />, // Email
  phone: <Phone className="text-flotteq-blue" size={18} />, // Téléphone
  birthdate: <Calendar className="text-flotteq-blue" size={18} />, // Date de naissance
  gender: <User className="text-flotteq-blue" size={18} />, // Sexe
  address: <MapPin className="text-flotteq-blue" size={18} />, // Adresse
  postalCode: <Landmark className="text-flotteq-blue" size={18} />, // Code postal
  city: <MapPin className="text-flotteq-blue" size={18} />, // Ville
  country: <Globe className="text-flotteq-blue" size={18} />, // Pays
};

// Composant inline edit
const InlineEditField = ({
  label,
  name,
  value,
  type = "text",
  selectOptions,
  onSave,
}: {
  label: string;
  name: string;
  value: string;
  type?: string;
  selectOptions?: { value: string; label: string }[];
  onSave: (name: string, value: string) => Promise<void>;
}) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleSave = async () => {
    if (inputValue === value) {
      setEditing(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSave(name, inputValue);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1200);
      setEditing(false);
    } catch (e: unknown) {
      setError("Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setEditing(false);
  };

  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex-shrink-0">{fieldIcons[name]}</span>
      <div className="flex-1">
        <Label className="block mb-1 text-xs font-semibold text-flotteq-navy">{label}</Label>
        {editing ? (
          <div className="flex items-center gap-2">
            {selectOptions ? (
              <select
                className="flotteq-input"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onBlur={handleSave}
                autoFocus
              >
                {selectOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <Input
                type={type}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                autoFocus
                className="flotteq-input"
              />
            )}
            {loading && <span className="text-xs text-gray-400">...</span>}
            {success && <span className="text-green-600 text-xs">✔️</span>}
            {error && <span className="text-red-600 text-xs">{error}</span>}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-base text-gray-800">{value || <span className="text-gray-400">(vide)</span>}</span>
            <button
              type="button"
              className="p-1 hover:bg-flotteq-blue/10 rounded"
              onClick={() => setEditing(true)}
              aria-label={`Modifier ${label}`}
            >
              <Pencil size={16} className="text-flotteq-blue" />
            </button>
            {success && <span className="text-green-600 text-xs">✔️</span>}
          </div>
        )}
      </div>
    </div>
  );
};

const Profile = () => {
  const [user, setUser] = useState<UserProfile>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    
    // Debug: Vérifier la configuration
    
    axios
      .get("/api/profile/me")
      .then(res => {
        
        const userData = res.data.user || res.data;
        setUser(userData);
        
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          username: userData.username,
          birthdate: userData.birthdate,
          gender: userData.gender
        });
      })
      .catch(err => {
        console.error("❌ Profile: Erreur lors de la récupération:", err);
        console.error("❌ Profile: Détails de l'erreur:", err.response?.data);
        console.error("❌ Profile: Status de l'erreur:", err.response?.status);
        console.error("❌ Profile: URL de l'erreur:", err.config?.url);
      });
  }, []);

  const handleFieldSave = async (name: string, value: string) => {
    setLoading(true);
    try {
      // Mapping des noms de champs pour correspondre au backend
      const fieldMapping: { [key: string]: string } = {
        'prenom': 'first_name',
        'nom': 'last_name',
        // Les autres champs restent inchangés
      };
      
      const backendFieldName = fieldMapping[name] || name;
      const updated = { ...user, [name]: value };
      
      
      const response = await axios.put("/api/profile/me", { [backendFieldName]: value });
      
      // Mettre à jour l'état local avec les données du backend
      if (response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(updated);
      }
    } catch (error) {
      console.error("❌ Profile: Erreur lors de la sauvegarde:", error);
      console.error("❌ Profile: Détails de l'erreur:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Debug: Log de l'état utilisateur au moment du rendu
    "Prénom (first_name)": user.first_name || user.prenom || "",
    "Nom (last_name)": user.last_name || user.nom || "",
    "Email": user.email || "",
    "Username": user.username || "",
    "Birthdate": user.birthdate || "",
    "Gender": user.gender || ""
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-flotteq-light py-8">
      <div className="w-full max-w-2xl flotteq-card relative overflow-hidden">
        {/* Header visuel avec image flotte et overlay bleu */}
        <div className="relative h-40 md:h-48 w-full flotteq-gradient flex items-end justify-start">
          <img
            src="/backgrounds/fleet1.jpg"
            alt="Flotte de véhicules"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            draggable={false}
          />
          <div className="absolute inset-0 bg-flotteq-navy opacity-60" />
          <div className="relative z-10 flex items-center h-full pl-8 pb-4">
            <div className="w-28 h-28 rounded-full bg-white shadow-lg flex items-center justify-center text-4xl font-bold text-flotteq-blue border-4 border-flotteq-blue -mb-16">
              {getInitials(user)}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-white flotteq-gradient-text drop-shadow">Mon Profil</h2>
              <p className="text-white/80 text-sm">Bienvenue sur votre espace personnel</p>
            </div>
          </div>
        </div>
        <CardContent className="pt-20 pb-8 px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InlineEditField label="Prénom" name="prenom" value={user.first_name || user.prenom || ""} onSave={handleFieldSave} />
            <InlineEditField label="Nom" name="nom" value={user.last_name || user.nom || ""} onSave={handleFieldSave} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <InlineEditField label="Nom d'utilisateur" name="username" value={user.username || ""} onSave={handleFieldSave} />
            <InlineEditField label="Email" name="email" value={user.email || ""} type="email" onSave={handleFieldSave} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <InlineEditField label="Téléphone" name="phone" value={user.phone || ""} onSave={handleFieldSave} />
            <InlineEditField label="Date de naissance" name="birthdate" value={user.birthdate || ""} type="date" onSave={handleFieldSave} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <InlineEditField
              label="Sexe"
              name="gender"
              value={user.gender || ""}
              selectOptions={[
                { value: "male", label: "Homme" },
                { value: "female", label: "Femme" },
                { value: "other", label: "Autre" },
              ]}
              onSave={handleFieldSave}
            />
            <InlineEditField label="Adresse" name="address" value={user.address || ""} onSave={handleFieldSave} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <InlineEditField label="Code postal" name="postalCode" value={user.postalCode || ""} onSave={handleFieldSave} />
            <InlineEditField label="Ville" name="city" value={user.city || ""} onSave={handleFieldSave} />
          </div>
          <div className="mt-2">
            <InlineEditField label="Pays" name="country" value={user.country || ""} onSave={handleFieldSave} />
          </div>
        </CardContent>
      </div>
    </div>
  );
};

export default Profile;

