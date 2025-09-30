export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL,
    TIMEOUT: 10000,
};

export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        ME: '/auth/me',
    },
    VEHICLES: '/vehicles',
    MAINTENANCE: '/maintenances',
    FACTURES: '/factures',
}; 