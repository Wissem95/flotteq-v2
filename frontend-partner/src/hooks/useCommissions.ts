import { useQuery } from '@tanstack/react-query';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import axiosInstance from '../lib/axios';
import { API_CONFIG } from '../config/api';
import { useAuthStore } from '../stores/authStore';
import type { Commission, CommissionTotalDto } from '../types/partner';

interface CommissionsFilters {
  status?: 'pending' | 'paid' | 'cancelled';
  startDate?: string;
  endDate?: string;
}

export const useCommissions = (filters?: CommissionsFilters) => {
  const user = useAuthStore((state) => state.user);
  const partnerId = user?.partnerId;

  return useQuery({
    queryKey: ['commissions', partnerId, filters],
    queryFn: async (): Promise<Commission[]> => {
      if (!partnerId) throw new Error('Partner ID not found');

      // Backend extrait partnerId du JWT automatiquement
      // Ne pas envoyer partnerId en query param
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.COMMISSIONS, {
        params: filters,
      });

      return response.data.commissions || [];
    },
    enabled: !!partnerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

interface WeeklyRevenue {
  week: string;
  weekLabel: string;
  amount: number;
  count: number;
}

export const useWeeklyRevenue = () => {
  const user = useAuthStore((state) => state.user);
  const partnerId = user?.partnerId;

  return useQuery({
    queryKey: ['weekly-revenue', partnerId],
    queryFn: async (): Promise<WeeklyRevenue[]> => {
      if (!partnerId) throw new Error('Partner ID not found');

      // Fetch commissions for last 4 weeks
      // Backend extrait partnerId du JWT
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.COMMISSIONS, {
        params: {
          status: 'paid', // Only count paid commissions
        },
      });

      const commissions: Commission[] = response.data.commissions || [];

      // Group by week
      const weeklyData = new Map<string, { amount: number; count: number }>();

      commissions.forEach((commission) => {
        const date = new Date(commission.createdAt);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + 1); // Start on Monday
        const weekKey = weekStart.toISOString().split('T')[0];

        const existing = weeklyData.get(weekKey) || { amount: 0, count: 0 };
        weeklyData.set(weekKey, {
          amount: existing.amount + Number(commission.amount),
          count: existing.count + 1,
        });
      });

      // Convert to array and sort by date
      return Array.from(weeklyData.entries())
        .map(([week, data]) => ({
          week,
          weekLabel: `Semaine du ${new Date(week).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`,
          amount: data.amount,
          count: data.count,
        }))
        .sort((a, b) => a.week.localeCompare(b.week))
        .slice(-4); // Last 4 weeks
    },
    enabled: !!partnerId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Commission Totals Hook
export const useCommissionTotals = (
  partnerId?: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['commission-totals', partnerId, startDate, endDate],
    queryFn: async (): Promise<CommissionTotalDto[]> => {
      if (!partnerId) throw new Error('Partner ID not found');

      const response = await axiosInstance.get(
        API_CONFIG.ENDPOINTS.COMMISSIONS_TOTALS(partnerId),
        {
          params: {
            startDate,
            endDate,
          },
        }
      );

      return response.data.totals || [];
    },
    enabled: !!partnerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Daily Stats Hook
export const useDailyStats = () => {
  const user = useAuthStore((state) => state.user);
  const partnerId = user?.partnerId;
  const today = format(new Date(), 'yyyy-MM-dd');

  return useCommissionTotals(partnerId, today, today);
};

// Weekly Stats Hook
export const useWeeklyStats = () => {
  const user = useAuthStore((state) => state.user);
  const partnerId = user?.partnerId;
  const startDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const endDate = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  return useCommissionTotals(partnerId, startDate, endDate);
};

// Monthly Stats Hook
export const useMonthlyStats = () => {
  const user = useAuthStore((state) => state.user);
  const partnerId = user?.partnerId;
  const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

  return useCommissionTotals(partnerId, startDate, endDate);
};

// Monthly Revenue for Chart (12 months)
interface MonthlyRevenue {
  month: string;
  monthLabel: string;
  amount: number;
  count: number;
}

export const useMonthlyRevenue = () => {
  const user = useAuthStore((state) => state.user);
  const partnerId = user?.partnerId;

  return useQuery({
    queryKey: ['monthly-revenue', partnerId],
    queryFn: async (): Promise<MonthlyRevenue[]> => {
      if (!partnerId) throw new Error('Partner ID not found');

      // Fetch all paid commissions
      // Backend extrait partnerId du JWT
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.COMMISSIONS, {
        params: {
          status: 'paid',
        },
      });

      const commissions: Commission[] = response.data.commissions || [];

      // Group by month
      const monthlyData = new Map<string, { amount: number; count: number }>();

      commissions.forEach((commission) => {
        const month = format(new Date(commission.createdAt), 'yyyy-MM');
        const existing = monthlyData.get(month) || { amount: 0, count: 0 };
        monthlyData.set(month, {
          amount: existing.amount + Number(commission.amount),
          count: existing.count + 1,
        });
      });

      // Convert to array and sort by date
      return Array.from(monthlyData.entries())
        .map(([month, data]) => ({
          month,
          monthLabel: format(new Date(month), 'MMM yyyy', { locale: fr }),
          amount: data.amount,
          count: data.count,
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12); // Last 12 months
    },
    enabled: !!partnerId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
