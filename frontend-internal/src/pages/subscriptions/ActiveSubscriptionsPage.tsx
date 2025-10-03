import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../../api/endpoints/subscriptions';
import { Link } from 'react-router-dom';
import { ChangePlanDialog } from './components/ChangePlanDialog';
import type { Subscription } from '../../api/types/subscription.types';

export const ActiveSubscriptionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['allSubscriptions'],
    queryFn: subscriptionsApi.getAllSubscriptions,
  });

  // Calculate stats from subscriptions data
  const stats = useMemo(() => {
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const trialingSubscriptions = subscriptions.filter(s => s.status === 'trialing');

    const totalRevenue = activeSubscriptions.reduce((sum, sub) => {
      const price = sub.plan?.price ? Number(sub.plan.price) : 0;
      return sum + price;
    }, 0);

    const mrr = totalRevenue; // MRR = Monthly Recurring Revenue
    const arpu = activeSubscriptions.length > 0 ? mrr / activeSubscriptions.length : 0;

    return {
      totalActive: activeSubscriptions.length,
      totalTrialing: trialingSubscriptions.length,
      totalRevenue: Number(totalRevenue) || 0,
      mrr: Number(mrr) || 0,
      arpu: Number(arpu) || 0,
    };
  }, [subscriptions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Abonnements actifs</h1>
        <p className="mt-1 text-sm text-gray-600">
          Vue d'ensemble des abonnements de tous les tenants
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* MRR */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">MRR</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.mrr.toFixed(0)}€
              </p>
              <p className="mt-1 text-xs text-gray-500">Revenu mensuel récurrent</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Abonnements actifs</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.totalActive}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                +{stats.totalTrialing} en essai
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ARPU */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ARPU</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.arpu.toFixed(0)}€
              </p>
              <p className="mt-1 text-xs text-gray-500">Revenu moyen par utilisateur</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenu total</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.totalRevenue.toFixed(0)}€
              </p>
              <p className="mt-1 text-xs text-gray-500">Ce mois-ci</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Début
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fin période
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {subscription.tenant?.name || `Tenant #${subscription.tenantId}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {subscription.plan?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subscription.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : subscription.status === 'trialing'
                          ? 'bg-blue-100 text-blue-800'
                          : subscription.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {subscription.status === 'active' && 'Actif'}
                      {subscription.status === 'trialing' && 'Essai'}
                      {subscription.status === 'cancelled' && 'Annulé'}
                      {subscription.status === 'expired' && 'Expiré'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subscription.currentPeriodStart
                      ? new Date(subscription.currentPeriodStart).toLocaleDateString('fr-FR')
                      : subscription.startDate
                      ? new Date(subscription.startDate).toLocaleDateString('fr-FR')
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subscription.currentPeriodEnd
                      ? new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR')
                      : subscription.endDate
                      ? new Date(subscription.endDate).toLocaleDateString('fr-FR')
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {subscription.plan?.price || 0}€/mois
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Link
                      to={`/tenants/${subscription.tenantId}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Voir tenant
                    </Link>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => setSelectedSubscription(subscription)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Changer de plan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {subscriptions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun abonnement actif</p>
          </div>
        )}
      </div>

      {/* Change Plan Dialog */}
      {selectedSubscription && (
        <ChangePlanDialog
          subscription={selectedSubscription}
          isOpen={!!selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
          onSuccess={() => {
            setSelectedSubscription(null);
            queryClient.invalidateQueries({ queryKey: ['allSubscriptions'] });
          }}
        />
      )}
    </div>
  );
};
