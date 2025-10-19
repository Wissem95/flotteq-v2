import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import { API_CONFIG } from '../config/api';
import { useAuthStore } from '../stores/authStore';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

interface DashboardStats {
  bookingsThisWeek: number;
  revenueThisMonth: number;
  pendingCommissions: number;
  acceptanceRate: number;
}

export const useDashboardStats = () => {
  const user = useAuthStore((state) => state.user);
  const partnerId = user?.partnerId;

  return useQuery({
    queryKey: ['dashboard-stats', partnerId],
    queryFn: async (): Promise<DashboardStats> => {
      if (!partnerId) throw new Error('Partner ID not found');

      const now = new Date();

      // Date ranges
      const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

      // Fetch bookings this week
      const bookingsWeekRes = await axiosInstance.get(API_CONFIG.ENDPOINTS.BOOKINGS, {
        params: {
          partnerId,
          startDate: weekStart,
          endDate: weekEnd,
        },
      });
      const bookingsThisWeek = bookingsWeekRes.data.bookings?.length || 0;

      // Fetch all bookings to calculate acceptance rate
      const allBookingsRes = await axiosInstance.get(API_CONFIG.ENDPOINTS.BOOKINGS, {
        params: {
          partnerId,
        },
      });
      const allBookings = allBookingsRes.data.bookings || [];
      const confirmedCount = allBookings.filter((b: any) => b.status === 'confirmed').length;
      const acceptanceRate = allBookings.length > 0
        ? Math.round((confirmedCount / allBookings.length) * 100)
        : 0;

      // Fetch commission totals for this month
      const commissionsRes = await axiosInstance.get(
        `/api/commissions/totals/${partnerId}`,
        {
          params: {
            startDate: monthStart,
            endDate: monthEnd,
          },
        }
      );

      const totals = commissionsRes.data.totals || [];
      const revenueThisMonth = totals.reduce((sum: number, t: any) => {
        if (t.status === 'pending' || t.status === 'paid') {
          return sum + parseFloat(t.total || 0);
        }
        return sum;
      }, 0);

      const pendingCommissions = totals.find((t: any) => t.status === 'pending')?.total || 0;

      return {
        bookingsThisWeek,
        revenueThisMonth,
        pendingCommissions: parseFloat(pendingCommissions),
        acceptanceRate,
      };
    },
    enabled: !!partnerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
