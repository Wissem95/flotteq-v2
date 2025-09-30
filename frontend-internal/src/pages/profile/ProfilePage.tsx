import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  MapPin, 
  Phone, 
  Building, 
  Key, 
  Bell, 
  Settings,
  Camera,
  Edit,
  Save,
  Lock
} from 'lucide-react';

interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  role_interne: string;
  avatar: string | null;
  phone: string | null;
  department: string;
  position: string;
  hire_date: string;
  last_login: string;
  two_factor_enabled: boolean;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    digest: 'daily' | 'weekly' | 'monthly';
  };
  security_level: 'basic' | 'elevated' | 'admin';
  permissions: string[];
}

interface ActivityLog {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
}

const ProfilePage: React.FC = () => {
  // Mock data - replace with real API calls
  const profile: UserProfile = {
    id: 1,
    first_name: 'Admin',
    last_name: 'FlotteQ',
    email: 'admin@flotteq.com',
    username: 'admin',
    role_interne: 'super_admin',
    avatar: null,
    phone: '+33 1 23 45 67 89',
    department: 'Administration',
    position: 'Administrateur Système',
    hire_date: '2025-01-15',
    last_login: '2025-07-31T16:30:00Z',
    two_factor_enabled: true,
    notification_preferences: {
      email: true,
      sms: false,
      push: true,
      digest: 'weekly'
    },
    security_level: 'admin',
    permissions: [
      'users.manage',
      'tenants.manage', 
      'analytics.view',
      'settings.manage',
      'system.admin'
    ]
  };

  const recentActivity: ActivityLog[] = [
    {
      id: 1,
      action: 'LOGIN',
      description: 'Connexion à l\'interface d\'administration',
      timestamp: '2025-07-31T16:30:00Z',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Chrome/127.0)'
    },
    {
      id: 2,
      action: 'UPDATE_USER',
      description: 'Modification du profil utilisateur ID: 45',
      timestamp: '2025-07-31T15:45:00Z',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Chrome/127.0)'
    },
    {
      id: 3,
      action: 'CREATE_TENANT',
      description: 'Création d\'un nouveau tenant: Logistics Pro',
      timestamp: '2025-07-31T14:20:00Z',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Chrome/127.0)'
    },
    {
      id: 4,
      action: 'VIEW_ANALYTICS',
      description: 'Consultation des analytics globales',
      timestamp: '2025-07-31T11:30:00Z',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Chrome/127.0)'
    },
    {
      id: 5,
      action: 'SETTINGS_UPDATE',
      description: 'Mise à jour de la configuration système',
      timestamp: '2025-07-30T17:15:00Z',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Chrome/127.0)'
    }
  ];

  const getRoleBadge = (role: string) => {
    const variants = {
      super_admin: { variant: 'destructive' as const, text: 'Super Admin' },
      admin: { variant: 'default' as const, text: 'Administrateur' },
      support: { variant: 'secondary' as const, text: 'Support' },
      analyst: { variant: 'outline' as const, text: 'Analyste' }
    };
    
    const config = variants[role as keyof typeof variants] || variants.admin;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getSecurityLevelBadge = (level: string) => {
    const variants = {
      basic: { variant: 'secondary' as const, text: 'Basique', color: 'text-gray-600' },
      elevated: { variant: 'default' as const, text: 'Élevé', color: 'text-blue-600' },
      admin: { variant: 'destructive' as const, text: 'Maximum', color: 'text-red-600' }
    };
    
    const config = variants[level as keyof typeof variants];
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Shield className={`h-3 w-3 ${config.color}`} />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600">Informations personnelles et paramètres du compte</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Lock className="h-4 w-4 mr-2" />
            Changer le mot de passe
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations Personnelles</CardTitle>
              <CardDescription>
                Vos données personnelles et informations de contact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-blue-600" />
                    )}
                  </div>
                  <Button size="sm" variant="outline" className="mt-2 w-full">
                    <Camera className="h-3 w-3 mr-1" />
                    Changer
                  </Button>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Prénom</label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-900">{profile.first_name}</span>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nom</label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-900">{profile.last_name}</span>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{profile.email}</span>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Téléphone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{profile.phone || 'Non renseigné'}</span>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Professionnelles</CardTitle>
              <CardDescription>
                Votre rôle et permissions au sein de FlotteQ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Rôle</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield className="h-4 w-4 text-gray-400" />
                      {getRoleBadge(profile.role_interne)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Département</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{profile.department}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Poste</label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{profile.position}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date d'embauche</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">
                        {new Date(profile.hire_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Dernière connexion</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">
                        {new Date(profile.last_login).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Niveau de sécurité</label>
                    <div className="flex items-center gap-2 mt-1">
                      {getSecurityLevelBadge(profile.security_level)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
              <CardDescription>
                Historique de vos dernières actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {activity.action}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{activity.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>IP: {activity.ip_address}</span>
                        <span title={activity.user_agent}>
                          {activity.user_agent.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
              <CardDescription>
                Paramètres de sécurité de votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">Authentification 2FA</div>
                    <div className="text-xs text-gray-500">Protection renforcée</div>
                  </div>
                  <Badge variant={profile.two_factor_enabled ? 'default' : 'secondary'}>
                    {profile.two_factor_enabled ? 'Activé' : 'Désactivé'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">Sessions actives</div>
                    <div className="text-xs text-gray-500">1 session en cours</div>
                  </div>
                  <Button size="sm" variant="outline">
                    Gérer
                  </Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">Clés API</div>
                    <div className="text-xs text-gray-500">2 clés actives</div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Key className="h-3 w-3 mr-1" />
                    Voir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Préférences de notification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Notifications email</span>
                  <Badge variant={profile.notification_preferences.email ? 'default' : 'secondary'}>
                    {profile.notification_preferences.email ? 'Activé' : 'Désactivé'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Notifications SMS</span>
                  <Badge variant={profile.notification_preferences.sms ? 'default' : 'secondary'}>
                    {profile.notification_preferences.sms ? 'Activé' : 'Désactivé'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Push notifications</span>
                  <Badge variant={profile.notification_preferences.push ? 'default' : 'secondary'}>
                    {profile.notification_preferences.push ? 'Activé' : 'Désactivé'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Digest</span>
                  <Badge variant="outline">
                    {profile.notification_preferences.digest === 'daily' ? 'Quotidien' :
                     profile.notification_preferences.digest === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}
                  </Badge>
                </div>
                
                <Button size="sm" variant="outline" className="w-full">
                  <Bell className="h-3 w-3 mr-1" />
                  Modifier
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Vos droits d'accès
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profile.permissions.map((permission, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-xs font-mono">{permission}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;