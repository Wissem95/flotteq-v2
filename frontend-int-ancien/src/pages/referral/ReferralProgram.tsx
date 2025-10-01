import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Trophy, Gift, TrendingUp, Star, UserPlus, DollarSign, Target } from 'lucide-react';

interface ReferralStats {
  total_referrals: number;
  active_referrers: number;
  conversion_rate: number;
  total_rewards_paid: number;
  pending_rewards: number;
  this_month_referrals: number;
}

interface ReferralUser {
  id: number;
  name: string;
  email: string;
  referrals_count: number;
  successful_referrals: number;
  total_earned: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  joined_date: string;
  last_referral: string;
}

interface ReferralReward {
  id: number;
  type: 'cash' | 'credit' | 'discount' | 'premium';
  amount: number;
  description: string;
  conditions: string;
  status: 'active' | 'inactive';
}

const ReferralProgram: React.FC = () => {
  // Referral program not yet implemented - showing empty state
  const stats: ReferralStats = {
    total_referrals: 0,
    active_referrers: 0,
    conversion_rate: 0,
    total_rewards_paid: 0,
    pending_rewards: 0,
    this_month_referrals: 0
  };

  const topReferrers: ReferralUser[] = [];
  const rewardTiers: ReferralReward[] = [];

  const getLevelBadge = (level: string) => {
    const variants = {
      bronze: { variant: 'outline' as const, icon: Trophy, color: 'text-orange-600' },
      silver: { variant: 'secondary' as const, icon: Trophy, color: 'text-gray-600' },
      gold: { variant: 'default' as const, icon: Trophy, color: 'text-yellow-600' },
      platinum: { variant: 'default' as const, icon: Star, color: 'text-purple-600' }
    };
    
    const config = variants[level as keyof typeof variants];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  const getRewardTypeIcon = (type: string) => {
    switch (type) {
      case 'cash': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'credit': return <Gift className="h-4 w-4 text-blue-600" />;
      case 'discount': return <Target className="h-4 w-4 text-orange-600" />;
      case 'premium': return <Star className="h-4 w-4 text-purple-600" />;
      default: return <Gift className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programme de Parrainage</h1>
          <p className="text-gray-600">Gestion des parrainages et système de récompenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Configurer Récompenses
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Campagne de Parrainage
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parrainages Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_referrals}</div>
            <p className="text-xs text-muted-foreground">+{stats.this_month_referrals} ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parrains Actifs</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_referrers}</div>
            <p className="text-xs text-muted-foreground">Utilisateurs engagés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.conversion_rate}%</div>
            <p className="text-xs text-green-600">+5.2% vs mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Récompenses Versées</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreference" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_rewards_paid.toLocaleString('fr-FR')} €</div>
            <p className="text-xs text-muted-foreground">{stats.pending_rewards} € en attente</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Referrers */}
        <Card>
          <CardHeader>
            <CardTitle>Meilleurs Parrains</CardTitle>
            <CardDescription>
              Classement des utilisateurs les plus actifs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topReferrers.map((user, index) => (
                <div key={user.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{user.name}</h4>
                      {getLevelBadge(user.level)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{user.successful_referrals}/{user.referrals_count} réussis</span>
                      <span>{user.total_earned}€ gagnés</span>
                      <span>Dernier: {new Date(user.last_referral).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Button size="sm" variant="outline">
                      Détails
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reward Tiers */}
        <Card>
          <CardHeader>
            <CardTitle>Système de Récompenses</CardTitle>
            <CardDescription>
              Configuration des paliers et récompenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rewardTiers.map((reward) => (
                <div key={reward.id} className="flex items-start gap-4 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getRewardTypeIcon(reward.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{reward.description}</h4>
                      <Badge variant={reward.status === 'active' ? 'default' : 'secondary'}>
                        {reward.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Valeur: {reward.amount}{reward.type === 'cash' ? '€' : reward.type === 'discount' ? '%' : ' points'}
                    </p>
                    <p className="text-xs text-gray-500">{reward.conditions}</p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Button size="sm" variant="outline">
                      Modifier
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres du Programme</CardTitle>
          <CardDescription>
            Configuration générale du système de parrainage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Règles Générales</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Programme activé</span>
                  <Badge variant="default">Oui</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Limite par utilisateur</span>
                  <Badge variant="outline">Illimitée</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Période de validité</span>
                  <Badge variant="outline">30 jours</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Auto-paiement</span>
                  <Badge variant="default">Activé</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Analytics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tracking avancé</span>
                  <Badge variant="default">Activé</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Notifications email</span>
                  <Badge variant="default">Activé</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Rapports automatiques</span>
                  <Badge variant="secondary">Hebdomadaires</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fraude detection</span>
                  <Badge variant="default">Activé</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <div className="flex gap-2">
              <Button variant="outline">
                Exporter Données
              </Button>
              <Button variant="outline">
                Générer Rapport
              </Button>
              <Button>
                Sauvegarder Modifications
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralProgram;