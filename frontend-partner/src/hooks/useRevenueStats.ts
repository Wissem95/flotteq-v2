import { useQuery } from '@tanstack/react-query';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import axiosInstance from '../lib/axios';
import { API_CONFIG } from '../config/api';
import { useAuthStore } from '../stores/authStore';

interface RevenueStats {
  total: number;
  count: number;
  status: 'paid' | 'pending';
}

// Hook générique pour calculer revenus partenaire sur une période
const usePartnerRevenue = (startDate: string, endDate: string) => {
  const user = useAuthStore((state) => state.user);
  const partnerId = user?.partnerId;

  return useQuery({
    queryKey: ['partner-revenue', partnerId, startDate, endDate],
    queryFn: async (): Promise<RevenueStats[]> => {
      if (!partnerId) throw new Error('Partner ID not found');

      // Fetch bookings dans la période
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.BOOKINGS, {
        params: { partnerId, startDate, endDate },
      });

      const bookings = response.data.bookings || [];

      // Grouper par status (paid, pending)
      const stats: Record<string, RevenueStats> = {
        paid: { total: 0, count: 0, status: 'paid' as const },
        pending: { total: 0, count: 0, status: 'pending' as const },
      };

      bookings.forEach((b: any) => {
        const price = parseFloat(b.price || 0);
        const commission = parseFloat(b.commissionAmount || 0);
        const partnerRevenue = price - commission; // Revenu partenaire = prix - commission FlotteQ

        if (b.paymentStatus === 'paid' || b.status === 'completed') {
          stats.paid.total += partnerRevenue;
          stats.paid.count += 1;
        } else if (b.status === 'confirmed' && b.paymentStatus !== 'paid') {
          stats.pending.total += partnerRevenue;
          stats.pending.count += 1;
        }
      });

      return Object.values(stats);
    },
    enabled: !!partnerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Daily Revenue (Revenus du jour)
export const useDailyRevenue = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return usePartnerRevenue(today, today);
};

// Weekly Revenue (Revenus de la semaine)
export const useWeeklyRevenue = () => {
  const startDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const endDate = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  return usePartnerRevenue(startDate, endDate);
};

// Monthly Revenue (Revenus du mois)
export const useMonthlyRevenue = () => {
  const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');
  return usePartnerRevenue(startDate, endDate);
};

// Custom Period Revenue (pour le tableau avec filtres de dates)
export const useRevenueByPeriod = (startDate: string, endDate: string, enabled = true) => {
  const user = useAuthStore((state) => state.user);
  const partnerId = user?.partnerId;

  return useQuery({
    queryKey: ['partner-revenue-period', partnerId, startDate, endDate],
    queryFn: async () => {
      if (!partnerId) throw new Error('Partner ID not found');

      // Fetch bookings dans la période
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.BOOKINGS, {
        params: { partnerId, startDate, endDate },
      });

      const bookings = response.data.bookings || [];

      // Enrichir chaque booking avec le revenu partenaire
      const enrichedBookings = bookings.map((b: any) => ({
        ...b,
        partnerRevenue: parseFloat(b.price || 0) - parseFloat(b.commissionAmount || 0),
      }));

      const total = bookings.length;

      return {
        data: enrichedBookings,
        total,
        totalPages: 1, // Pagination côté frontend si nécessaire
      };
    },
    enabled: enabled && !!partnerId,
    staleTime: 1000 * 60 * 5,
  });
};

// Monthly Revenue for Chart (12 derniers mois)
interface MonthlyRevenueChart {
  month: string;
  monthLabel: string;
  amount: number;
  count: number;
}

export const useMonthlyRevenueChart = () => {
  const user = useAuthStore((state) => state.user);
  const partnerId = user?.partnerId;

  return useQuery({
    queryKey: ['monthly-revenue-chart', partnerId],
    queryFn: async (): Promise<MonthlyRevenueChart[]> => {
      if (!partnerId) throw new Error('Partner ID not found');

      const now = new Date();
      const results: MonthlyRevenueChart[] = [];

      // Fetch last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(date), 'yyyy-MM-dd');

        const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.BOOKINGS, {
          params: { partnerId, startDate, endDate },
        });

        const bookings = response.data.bookings || [];

        // Calculer revenus partenaire pour le mois
        const monthTotal = bookings.reduce((sum: number, b: any) => {
          const price = parseFloat(b.price || 0);
          const commission = parseFloat(b.commissionAmount || 0);
          const partnerRevenue = price - commission;

          if (b.paymentStatus === 'paid' || b.status === 'completed') {
            return sum + partnerRevenue;
          }
          return sum;
        }, 0);

        results.push({
          month: startDate,
          monthLabel: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          amount: monthTotal,
          count: bookings.filter((b: any) => b.paymentStatus === 'paid' || b.status === 'completed').length,
        });
      }

      return results;
    },
    enabled: !!partnerId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
