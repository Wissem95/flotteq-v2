export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  ENDPOINTS: {
    // Auth
    PARTNER_REGISTER: '/api/partners/auth/register',
    PARTNER_LOGIN: '/api/partners/auth/login',
    PARTNER_PROFILE: '/api/partners/auth/profile',
    // Partner management
    PARTNER_ME: '/api/partners/me',
    PARTNER_SERVICES: '/api/partners/me/services',
    // Bookings
    BOOKINGS: '/api/bookings',
    BOOKINGS_UPCOMING: '/api/bookings/upcoming',
    BOOKING_BY_ID: (id: string) => `/api/bookings/${id}`,
    BOOKING_CONFIRM: (id: string) => `/api/bookings/${id}/confirm`,
    BOOKING_REJECT: (id: string) => `/api/bookings/${id}/reject`,
    BOOKING_START: (id: string) => `/api/bookings/${id}/start`,
    BOOKING_COMPLETE: (id: string) => `/api/bookings/${id}/complete`,
    BOOKING_CANCEL: (id: string) => `/api/bookings/${id}/cancel`,
    BOOKING_RESCHEDULE: (id: string) => `/api/bookings/${id}/reschedule`,
    // Availabilities
    AVAILABILITIES: '/api/availabilities',
    AVAILABILITIES_ME: '/api/availabilities/me',
    AVAILABILITIES_BULK: '/api/availabilities/bulk',
    UNAVAILABILITIES: '/api/availabilities/unavailability',
    UNAVAILABILITIES_LIST: '/api/availabilities/unavailability/list',
    // Commissions
    COMMISSIONS: '/api/commissions',
    COMMISSIONS_STATS: '/api/commissions/stats',
    COMMISSIONS_TOTALS: (partnerId: string) => `/api/commissions/totals/${partnerId}`,
  }
};
