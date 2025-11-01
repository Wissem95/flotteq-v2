import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Users, Camera, Trash2, Save, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/config/api';
import { toast } from 'sonner';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  birthDate?: string;
  profilePhotoUrl?: string | null;
  profilePhotoThumbnail?: string | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    birthDate: '',
    profilePhotoUrl: null,
    profilePhotoThumbnail: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Charger le profil au montage
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/driver/profile');
      setProfile({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        city: response.data.city || '',
        postalCode: response.data.postalCode || '',
        emergencyContact: response.data.emergencyContact || '',
        emergencyPhone: response.data.emergencyPhone || '',
        birthDate: response.data.birthDate ? new Date(response.data.birthDate).toISOString().split('T')[0] : '',
        profilePhotoUrl: response.data.profilePhotoUrl || null,
        profilePhotoThumbnail: response.data.profilePhotoThumbnail || null,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.patch('/driver/profile', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        postalCode: profile.postalCode,
        emergencyContact: profile.emergencyContact,
        emergencyPhone: profile.emergencyPhone,
        birthDate: profile.birthDate,
      });
      toast.success('Profil mis à jour avec succès');
      loadProfile();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La photo ne doit pas dépasser 5 MB');
      return;
    }

    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('photo', file);

      const response = await api.post('/driver/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProfile(prev => ({
        ...prev,
        profilePhotoUrl: response.data.photoUrl,
        profilePhotoThumbnail: response.data.thumbUrl,
      }));

      toast.success('Photo de profil mise à jour');
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) return;

    try {
      setUploading(true);
      await api.delete('/driver/profile/photo');
      setProfile(prev => ({
        ...prev,
        profilePhotoUrl: null,
        profilePhotoThumbnail: null,
      }));
      toast.success('Photo de profil supprimée');
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flotteq-blue"></div>
      </div>
    );
  }

  const photoUrl = profile.profilePhotoUrl
    ? `${import.meta.env.VITE_API_URL}${profile.profilePhotoUrl}`
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600 mt-1">Gérez vos informations personnelles</p>
      </div>

      {/* Photo de profil */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Photo de Profil</h2>

        <div className="flex items-center gap-6">
          <div className="relative">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Photo de profil"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-flotteq-blue text-white flex items-center justify-center text-4xl font-bold border-4 border-gray-200">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-3 bg-flotteq-blue text-white rounded-lg hover:bg-flotteq-navy transition-colors disabled:opacity-50 font-medium min-h-[48px]"
            >
              <Camera className="w-5 h-5" />
              {photoUrl ? 'Changer la Photo' : 'Ajouter une Photo'}
            </button>
            {photoUrl && (
              <button
                onClick={handleDeletePhoto}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 font-medium min-h-[48px]"
              >
                <Trash2 className="w-5 h-5" />
                Supprimer
              </button>
            )}
            <p className="text-sm text-gray-500">JPG, PNG ou GIF • Max 5 MB</p>
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations Personnelles</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Prénom *
            </label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-flotteq-blue text-base min-h-[48px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Nom *
            </label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-flotteq-blue text-base min-h-[48px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 text-base min-h-[48px]"
            />
            <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Téléphone *
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-flotteq-blue text-base min-h-[48px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date de Naissance
            </label>
            <input
              type="date"
              value={profile.birthDate}
              onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-flotteq-blue text-base min-h-[48px]"
            />
          </div>
        </div>
      </div>

      {/* Adresse */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Adresse</h2>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Adresse Complète
            </label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="123 Rue de la Paix"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-flotteq-blue text-base min-h-[48px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="Paris"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-flotteq-blue text-base min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Code Postal</label>
              <input
                type="text"
                value={profile.postalCode}
                onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                placeholder="75001"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-flotteq-blue text-base min-h-[48px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact d'urgence */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact d'Urgence</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Nom du Contact
            </label>
            <input
              type="text"
              value={profile.emergencyContact}
              onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
              placeholder="Marie Dupont"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-flotteq-blue text-base min-h-[48px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Téléphone d'Urgence
            </label>
            <input
              type="tel"
              value={profile.emergencyPhone}
              onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })}
              placeholder="+33612345678"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flotteq-blue focus:border-flotteq-blue text-base min-h-[48px]"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-flotteq-blue text-white rounded-lg hover:bg-flotteq-navy transition-colors disabled:opacity-50 font-medium text-lg min-h-[48px] shadow-sm"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Enregistrer les Modifications
            </>
          )}
        </button>
      </div>
    </div>
  );
}
