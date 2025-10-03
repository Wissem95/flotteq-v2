import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/endpoints/dashboard';

export const useDashboard = () => {
  const stats = useQuery({
    queryKey: ['dashboard', 'internal', 'stats'],
    queryFn: async () => {
      const response = await dashboardApi.getInternalStats();
      return response.data;
    },
    refetchInterval: 60000, // Rafraîchir toutes les minutes
    staleTime: 30000, // Considérer les données fraîches pendant 30s
  });

  const revenue = useQuery({
    queryKey: ['dashboard', 'internal', 'revenue'],
    queryFn: async () => {
      const response = await dashboardApi.getInternalRevenue();
      return response.data;
    },
    staleTime: 60000,
  });

  const subscriptions = useQuery({
    queryKey: ['dashboard', 'internal', 'subscriptions'],
    queryFn: async () => {
      const response = await dashboardApi.getInternalSubscriptions();
      return response.data;
    },
    staleTime: 60000,
  });

  const activity = useQuery({
    queryKey: ['dashboard', 'internal', 'activity'],
    queryFn: async () => {
      const response = await dashboardApi.getInternalActivity();
      return response.data;
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  const recentTenants = useQuery({
    queryKey: ['dashboard', 'internal', 'recent-tenants'],
    queryFn: async () => {
      const response = await dashboardApi.getRecentTenants(5);
      return response.data;
    },
    staleTime: 60000,
  });

  return {
    stats,
    revenue,
    subscriptions,
    activity,
    recentTenants,
  };
};
