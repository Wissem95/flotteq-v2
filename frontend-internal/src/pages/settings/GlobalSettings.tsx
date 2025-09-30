// GlobalSettings.tsx - Paramètres globaux de la plateforme FlotteQ

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, RefreshCw, Globe, Shield, Bell, Mail, Database, Cloud, Key, Users, Building2, } from "lucide-react";

interface PlatformSettings {
  // Général
  platform_name: string;
  platform_description: string;
  support_email: string;
  company_address: string;
  timezone: string;
  default_language: string;
  
  // Sécurité
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_lowercase: boolean;
  password_require_numbers: boolean;
  password_require_symbols: boolean;
  session_timeout_minutes: number;
  max_login_attempts: number;
  two_factor_required: boolean;
  
  // Email
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
  email_from_address: string;
  email_from_name: string;
  
  // Notifications
  enable_email_notifications: boolean;
  enable_sms_notifications: boolean;
  enable_push_notifications: boolean;
  notification_retention_days: number;
  
  // API & Intégrations
  api_rate_limit_per_minute: number;
  api_rate_limit_per_hour: number;
  webhook_timeout_seconds: number;
  enable_api_analytics: boolean;
  
  // Stockage
  max_file_size_mb: number;
  allowed_file_types: string[];
  storage_cleanup_days: number;
  enable_file_compression: boolean;
  
  // Maintenance
  maintenance_mode: boolean;
  maintenance_message: string;
  backup_frequency_hours: number;
  log_retention_days: number;
}

const GlobalSettings: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Settings feature not yet implemented - showing empty state

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Settings feature not yet implemented - show empty state
      setSettings(null);
    } catch (error) {
      console.error("Erreur lors du chargement des paramètres:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      // Settings save API not yet implemented
      setHasChanges(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof PlatformSettings, value: any) => {
    if (!settings) return;
    
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return <div>Erreur lors du chargement des paramètres</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres Globaux</h1>
          <p className="text-gray-600">Configuration de la plateforme FlotteQ</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSettings} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
          <Button 
            onClick={saveSettings} 
            disabled={!hasChanges || saving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </div>

      {/* Alerte maintenance */}
      {settings.maintenance_mode && (
        <Card className="border-orange-500 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Mode Maintenance Activé
            </CardTitle>
            <CardDescription className="text-orange-700">
              La plateforme est actuellement en mode maintenance. Les utilisateurs voient le message configuré.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Onglets de configuration */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        {/* Général */}
        <TabsContent value="general">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Informations Plateforme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="platform_name">Nom de la plateforme</Label>
                  <Input
                    id="platform_name"
                    value={settings.platform_name}
                    onChange={(e) => updateSetting('platform_name', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="platform_description">Description</Label>
                  <Textarea
                    id="platform_description"
                    value={settings.platform_description}
                    onChange={(e) => updateSetting('platform_description', e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="support_email">Email de support</Label>
                  <Input
                    id="support_email"
                    type="email"
                    value={settings.support_email}
                    onChange={(e) => updateSetting('support_email', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="company_address">Adresse de l'entreprise</Label>
                  <Textarea
                    id="company_address"
                    value={settings.company_address}
                    onChange={(e) => updateSetting('company_address', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Localisation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select 
                    value={settings.timezone} 
                    onValueChange={(value) => updateSetting('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Paris">Europe/Paris (GMT+1)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="default_language">Langue par défaut</Label>
                  <Select 
                    value={settings.default_language} 
                    onValueChange={(value) => updateSetting('default_language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sécurité */}
        <TabsContent value="security">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Politique de mots de passe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="password_min_length">Longueur minimale</Label>
                  <Input
                    id="password_min_length"
                    type="number"
                    min="6"
                    max="32"
                    value={settings.password_min_length}
                    onChange={(e) => updateSetting('password_min_length', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="require_uppercase">Majuscules requises</Label>
                    <Switch
                      id="require_uppercase"
                      checked={settings.password_require_uppercase}
                      onCheckedChange={(checked) => updateSetting('password_require_uppercase', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="require_lowercase">Minuscules requises</Label>
                    <Switch
                      id="require_lowercase"
                      checked={settings.password_require_lowercase}
                      onCheckedChange={(checked) => updateSetting('password_require_lowercase', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="require_numbers">Chiffres requis</Label>
                    <Switch
                      id="require_numbers"
                      checked={settings.password_require_numbers}
                      onCheckedChange={(checked) => updateSetting('password_require_numbers', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="require_symbols">Symboles requis</Label>
                    <Switch
                      id="require_symbols"
                      checked={settings.password_require_symbols}
                      onCheckedChange={(checked) => updateSetting('password_require_symbols', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Sécurité des sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="session_timeout">Timeout de session (minutes)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    min="5"
                    max="1440"
                    value={settings.session_timeout_minutes}
                    onChange={(e) => updateSetting('session_timeout_minutes', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="max_login_attempts">Tentatives de connexion max</Label>
                  <Input
                    id="max_login_attempts"
                    type="number"
                    min="3"
                    max="10"
                    value={settings.max_login_attempts}
                    onChange={(e) => updateSetting('max_login_attempts', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="two_factor_required">2FA obligatoire</Label>
                  <Switch
                    id="two_factor_required"
                    checked={settings.two_factor_required}
                    onCheckedChange={(checked) => updateSetting('two_factor_required', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Configuration SMTP
              </CardTitle>
              <CardDescription>
                Paramètres de serveur de messagerie pour l'envoi d'emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="smtp_host">Serveur SMTP</Label>
                  <Input
                    id="smtp_host"
                    value={settings.smtp_host}
                    onChange={(e) => updateSetting('smtp_host', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="smtp_port">Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={settings.smtp_port}
                    onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="smtp_username">Nom d'utilisateur</Label>
                  <Input
                    id="smtp_username"
                    value={settings.smtp_username}
                    onChange={(e) => updateSetting('smtp_username', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="smtp_password">Mot de passe</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={settings.smtp_password}
                    onChange={(e) => updateSetting('smtp_password', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="smtp_encryption">Chiffrement</Label>
                  <Select 
                    value={settings.smtp_encryption} 
                    onValueChange={(value) => updateSetting('smtp_encryption', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="tls">TLS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email_from_address">Adresse expéditeur</Label>
                  <Input
                    id="email_from_address"
                    type="email"
                    value={settings.email_from_address}
                    onChange={(e) => updateSetting('email_from_address', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email_from_name">Nom expéditeur</Label>
                  <Input
                    id="email_from_name"
                    value={settings.email_from_name}
                    onChange={(e) => updateSetting('email_from_name', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline">Tester la configuration</Button>
                <Button variant="outline">Envoyer email de test</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Paramètres de notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications par email</Label>
                    <p className="text-sm text-gray-500">Autoriser l'envoi de notifications par email</p>
                  </div>
                  <Switch
                    checked={settings.enable_email_notifications}
                    onCheckedChange={(checked) => updateSetting('enable_email_notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications SMS</Label>
                    <p className="text-sm text-gray-500">Autoriser l'envoi de notifications par SMS</p>
                  </div>
                  <Switch
                    checked={settings.enable_sms_notifications}
                    onCheckedChange={(checked) => updateSetting('enable_sms_notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications push</Label>
                    <p className="text-sm text-gray-500">Autoriser les notifications push navigateur</p>
                  </div>
                  <Switch
                    checked={settings.enable_push_notifications}
                    onCheckedChange={(checked) => updateSetting('enable_push_notifications', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label htmlFor="notification_retention">Rétention des notifications (jours)</Label>
                <Input
                  id="notification_retention"
                  type="number"
                  min="1"
                  max="365"
                  value={settings.notification_retention_days}
                  onChange={(e) => updateSetting('notification_retention_days', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Les notifications seront automatiquement supprimées après ce délai
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Configuration API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="rate_limit_minute">Limite par minute</Label>
                  <Input
                    id="rate_limit_minute"
                    type="number"
                    min="1"
                    max="1000"
                    value={settings.api_rate_limit_per_minute}
                    onChange={(e) => updateSetting('api_rate_limit_per_minute', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="rate_limit_hour">Limite par heure</Label>
                  <Input
                    id="rate_limit_hour"
                    type="number"
                    min="100"
                    max="100000"
                    value={settings.api_rate_limit_per_hour}
                    onChange={(e) => updateSetting('api_rate_limit_per_hour', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="webhook_timeout">Timeout webhook (secondes)</Label>
                  <Input
                    id="webhook_timeout"
                    type="number"
                    min="5"
                    max="300"
                    value={settings.webhook_timeout_seconds}
                    onChange={(e) => updateSetting('webhook_timeout_seconds', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="max_file_size">Taille max fichier (MB)</Label>
                  <Input
                    id="max_file_size"
                    type="number"
                    min="1"
                    max="100"
                    value={settings.max_file_size_mb}
                    onChange={(e) => updateSetting('max_file_size_mb', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Analytics API</Label>
                  <p className="text-sm text-gray-500">Collecter les statistiques d'utilisation API</p>
                </div>
                <Switch
                  checked={settings.enable_api_analytics}
                  onCheckedChange={(checked) => updateSetting('enable_api_analytics', checked)}
                />
              </div>
              
              <div>
                <Label>Types de fichiers autorisés</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {settings.allowed_file_types.map((type) => (
                    <Badge key={type} variant="secondary">{type}</Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Extensions de fichiers autorisées pour l'upload
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Maintenance et sauvegarde
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Mode maintenance</Label>
                  <p className="text-sm text-gray-500">
                    Activer le mode maintenance pour bloquer l'accès utilisateurs
                  </p>
                </div>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                />
              </div>
              
              {settings.maintenance_mode && (
                <div>
                  <Label htmlFor="maintenance_message">Message de maintenance</Label>
                  <Textarea
                    id="maintenance_message"
                    value={settings.maintenance_message}
                    onChange={(e) => updateSetting('maintenance_message', e.target.value)}
                    rows={3}
                  />
                </div>
              )}
              
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="backup_frequency">Fréquence sauvegarde (heures)</Label>
                  <Input
                    id="backup_frequency"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.backup_frequency_hours}
                    onChange={(e) => updateSetting('backup_frequency_hours', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="log_retention">Rétention logs (jours)</Label>
                  <Input
                    id="log_retention"
                    type="number"
                    min="7"
                    max="365"
                    value={settings.log_retention_days}
                    onChange={(e) => updateSetting('log_retention_days', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="storage_cleanup">Nettoyage stockage (jours)</Label>
                  <Input
                    id="storage_cleanup"
                    type="number"
                    min="30"
                    max="365"
                    value={settings.storage_cleanup_days}
                    onChange={(e) => updateSetting('storage_cleanup_days', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline">Forcer sauvegarde</Button>
                <Button variant="outline">Nettoyer logs</Button>
                <Button variant="outline">Optimiser base</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alerte modifications */}
      {hasChanges && (
        <Card className="border-blue-500 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-blue-800">Vous avez des modifications non sauvegardées</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadSettings}>Annuler</Button>
                <Button onClick={saveSettings} disabled={saving}>
                  {saving ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GlobalSettings; 