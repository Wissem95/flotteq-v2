import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Zap, 
  Brain, 
  Shield, 
  Rocket, 
  Beaker, 
  Settings, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  BarChart3
} from 'lucide-react';

interface BetaFeature {
  id: number;
  name: string;
  description: string;
  category: 'ai' | 'analytics' | 'automation' | 'security' | 'ui' | 'integration';
  status: 'beta' | 'experimental' | 'coming_soon' | 'deprecated';
  enabled: boolean;
  usage_count: number;
  user_feedback: number;
  launch_date: string;
  estimated_release: string;
}

interface FeatureFlag {
  id: number;
  flag_name: string;
  description: string;
  enabled_for: 'all' | 'internal' | 'beta_users' | 'specific_tenants';
  enabled_count: number;
  rollout_percentage: number;
  created_date: string;
}

const FeaturesBonus: React.FC = () => {
  // Mock data - replace with real API calls
  const betaFeatures: BetaFeature[] = [
    {
      id: 1,
      name: 'Assistant IA de Maintenance',
      description: 'Intelligence artificielle pour prédire les besoins de maintenance des véhicules',
      category: 'ai',
      status: 'beta',
      enabled: true,
      usage_count: 127,
      user_feedback: 4.2,
      launch_date: '2025-06-15',
      estimated_release: '2025-09-01'
    },
    {
      id: 2,
      name: 'Analytics Prédictifs',
      description: 'Tableaux de bord avec prédictions de consommation et coûts',
      category: 'analytics',
      status: 'beta',
      enabled: true,
      usage_count: 89,
      user_feedback: 4.5,
      launch_date: '2025-07-01',
      estimated_release: '2025-10-15'
    },
    {
      id: 3,
      name: 'Automation des Rappels',
      description: 'Système automatisé de rappels personnalisés par SMS/Email',
      category: 'automation',
      status: 'experimental',
      enabled: false,
      usage_count: 23,
      user_feedback: 3.8,
      launch_date: '2025-07-20',
      estimated_release: '2025-11-30'
    },
    {
      id: 4,
      name: 'Sécurité Biométrique',
      description: 'Authentification par empreinte digitale et reconnaissance faciale',
      category: 'security',
      status: 'coming_soon',
      enabled: false,
      usage_count: 0,
      user_feedback: 0,
      launch_date: '',
      estimated_release: '2026-02-01'
    },
    {
      id: 5,
      name: 'Interface Mobile Redesign',
      description: 'Nouvelle interface mobile avec Material Design 3',
      category: 'ui',
      status: 'beta',
      enabled: true,
      usage_count: 234,
      user_feedback: 4.7,
      launch_date: '2025-05-10',
      estimated_release: '2025-08-15'
    },
    {
      id: 6,
      name: 'API Partenaires Avancée',
      description: 'SDK et API enrichis pour intégrations tierces',
      category: 'integration',
      status: 'experimental',
      enabled: true,
      usage_count: 45,
      user_feedback: 4.0,
      launch_date: '2025-07-10',
      estimated_release: '2025-12-01'
    }
  ];

  const featureFlags: FeatureFlag[] = [
    {
      id: 1,
      flag_name: 'enable_dark_mode',
      description: 'Active le mode sombre sur toute la plateforme',
      enabled_for: 'beta_users',
      enabled_count: 45,
      rollout_percentage: 15,
      created_date: '2025-07-01'
    },
    {
      id: 2,
      flag_name: 'new_dashboard_layout',
      description: 'Nouveau layout du tableau de bord principal',
      enabled_for: 'internal',
      enabled_count: 12,
      rollout_percentage: 100,
      created_date: '2025-07-15'
    },
    {
      id: 3,
      flag_name: 'advanced_reporting',
      description: 'Module de reporting avancé avec exports personnalisés',
      enabled_for: 'specific_tenants',
      enabled_count: 8,
      rollout_percentage: 5,
      created_date: '2025-07-20'
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ai': return <Brain className="h-5 w-5 text-purple-600" />;
      case 'analytics': return <BarChart3 className="h-5 w-5 text-blue-600" />;
      case 'automation': return <Zap className="h-5 w-5 text-yellow-600" />;
      case 'security': return <Shield className="h-5 w-5 text-red-600" />;
      case 'ui': return <Sparkles className="h-5 w-5 text-pink-600" />;
      case 'integration': return <Rocket className="h-5 w-5 text-green-600" />;
      default: return <Beaker className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      beta: { variant: 'default' as const, icon: Beaker, text: 'Bêta', color: 'text-blue-600' },
      experimental: { variant: 'secondary' as const, icon: AlertTriangle, text: 'Expérimental', color: 'text-orange-600' },
      coming_soon: { variant: 'outline' as const, icon: Clock, text: 'Prochainement', color: 'text-gray-600' },
      deprecated: { variant: 'destructive' as const, icon: AlertTriangle, text: 'Déprécié', color: 'text-red-600' }
    };
    
    const config = variants[status as keyof typeof variants];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.text}
      </Badge>
    );
  };

  const getEnabledForBadge = (enabledFor: string) => {
    const variants = {
      all: { variant: 'default' as const, text: 'Tous' },
      internal: { variant: 'secondary' as const, text: 'Interne' },
      beta_users: { variant: 'outline' as const, text: 'Bêta testeurs' },
      specific_tenants: { variant: 'outline' as const, text: 'Tenants spécifiques' }
    };
    
    const config = variants[enabledFor as keyof typeof variants];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const totalBetaFeatures = betaFeatures.length;
  const activeBetaFeatures = betaFeatures.filter(f => f.enabled).length;
  const totalUsage = betaFeatures.reduce((sum, f) => sum + f.usage_count, 0);
  const avgFeedback = betaFeatures.filter(f => f.user_feedback > 0)
    .reduce((sum, f, _, arr) => sum + f.user_feedback / arr.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fonctionnalités Bonus</h1>
          <p className="text-gray-600">Features expérimentales, bêta et configuration avancée</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Feature Flags
          </Button>
          <Button>
            <Beaker className="h-4 w-4 mr-2" />
            Nouvelle Feature
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Features Bêta</CardTitle>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBetaFeatures}</div>
            <p className="text-xs text-muted-foreground">{activeBetaFeatures} actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisation Totale</CardTitle>
            <Users className="h-4 w-4 text-muted-foreference" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <p className="text-xs text-muted-foreground">Sessions de test</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Moyen</CardTitle>
            <Sparkles className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{avgFeedback.toFixed(1)}/5</div>
            <p className="text-xs text-yellow-600">Notes utilisateurs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prochaines Releases</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Dans les 90 jours</p>
          </CardContent>
        </Card>
      </div>

      {/* Beta Features List */}
      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités Bêta</CardTitle>
          <CardDescription>
            Features en cours de développement et de test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {betaFeatures.map((feature) => (
              <div key={feature.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-shrink-0 mt-1">
                  {getCategoryIcon(feature.category)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{feature.name}</h3>
                    {getStatusBadge(feature.status)}
                    <Badge variant={feature.enabled ? 'default' : 'secondary'}>
                      {feature.enabled ? 'Activée' : 'Désactivée'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                  
                  <div className="flex items-center gap-6 text-xs text-gray-500">
                    <span>Utilisation: {feature.usage_count} sessions</span>
                    {feature.user_feedback > 0 && (
                      <span>Note: {feature.user_feedback}/5 ⭐</span>
                    )}
                    {feature.launch_date && (
                      <span>Lancée: {new Date(feature.launch_date).toLocaleDateString('fr-FR')}</span>
                    )}
                    <span>Release prévue: {new Date(feature.estimated_release).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      {feature.enabled ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button size="sm" variant="outline">
                      Analytics
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>
            Contrôle granulaire d'activation des fonctionnalités
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featureFlags.map((flag) => (
              <div key={flag.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 font-mono text-sm">{flag.flag_name}</h3>
                    {getEnabledForBadge(flag.enabled_for)}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{flag.description}</p>
                  
                  <div className="flex items-center gap-6 text-xs text-gray-500">
                    <span>Utilisateurs: {flag.enabled_count}</span>
                    <span>Rollout: {flag.rollout_percentage}%</span>
                    <span>Créé: {new Date(flag.created_date).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Modifier
                    </Button>
                    <Button size="sm" variant="outline">
                      Stats
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lab Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres Laboratoire</CardTitle>
            <CardDescription>Configuration de l'environnement de test</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Mode développeur</span>
                <Badge variant="default">Activé</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Logs détaillés</span>
                <Badge variant="default">Activé</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">A/B Testing</span>
                <Badge variant="secondary">Désactivé</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Feedback automatique</span>
                <Badge variant="default">Activé</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Crash reporting</span>
                <Badge variant="default">Activé</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics Avancées</CardTitle>
            <CardDescription>Métriques de performance des features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Usage tracking</span>
                <Badge variant="default">Temps réel</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Performance monitoring</span>
                <Badge variant="default">Activé</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">User satisfaction</span>
                <Badge variant="outline">4.3/5</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Conversion rate</span>
                <Badge variant="outline">73%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Abandonment rate</span>
                <Badge variant="outline">12%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeaturesBonus;