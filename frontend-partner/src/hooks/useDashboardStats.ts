import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import { API_CONFIG } from '../config/api';
import { useAuthStore } from '../stores/authStore';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

interface DashboardStats {
  bookingsThisWeek: number;
  revenueThisMonth: number;
  pendingPayments: number;
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
      const acceptedCount = allBookings.filter((b: any) =>
        b.status === 'confirmed' || b.status === 'completed'
      ).length;
      const acceptanceRate = allBookings.length > 0
        ? Math.round((acceptedCount / allBookings.length) * 100)
        : 0;

      // Fetch bookings for this month to calculate PARTNER revenue
      const bookingsMonthRes = await axiosInstance.get(API_CONFIG.ENDPOINTS.BOOKINGS, {
        params: {
          partnerId,
          startDate: monthStart,
          endDate: monthEnd,
        },
      });

      const bookingsMonth = bookingsMonthRes.data.bookings || [];

      // Calculate PARTNER REVENUE = price - commission_amount
      const revenueThisMonth = bookingsMonth.reduce((sum: number, b: any) => {
        const price = parseFloat(b.price || 0);
        const commission = parseFloat(b.commissionAmount || 0);
        const partnerRevenue = price - commission;  // 90% of price (or based on commission rate)

        if (b.paymentStatus === 'paid' || b.status === 'completed') {
          return sum + partnerRevenue;
        }
        return sum;
      }, 0);

      // PENDING PAYMENTS = Confirmed bookings not yet paid to partner
      const pendingPayments = bookingsMonth.reduce((sum: number, b: any) => {
        const price = parseFloat(b.price || 0);
        const commission = parseFloat(b.commissionAmount || 0);
        const partnerRevenue = price - commission;

        if (b.status === 'confirmed' && b.paymentStatus !== 'paid') {
          return sum + partnerRevenue;
        }
        return sum;
      }, 0);

      return {
        bookingsThisWeek,
        revenueThisMonth,
        pendingPayments,
        acceptanceRate,
      };
    },
    enabled: !!partnerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
