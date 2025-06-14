const BASE_URL = 'https://ecommerce-tauty-backend.onrender.com';
const API_URL = `${BASE_URL}/api`;

export const config = {
    baseUrl: BASE_URL,
    apiUrl: API_URL,
    imageUrl: (path) => {
        if (!path?.url) return null;
        return path.url;
    },
    endpoints: {
        auth: {
            register: `${API_URL}/auth/register`,
            login: `${API_URL}/auth/login`,
        },
        products: {
            all: (query) => `${API_URL}/products${query ? `?q=${encodeURIComponent(query)}` : ''}`,
            byCategory: (category) => `${API_URL}/products/category/${category}`,
            single: (id) => `${API_URL}/products/${id}`,
        },
        cart: {
            validate: `${API_URL}/cart/validate`,
        },
        orders: {
            create: `${API_URL}/orders`,
            myOrders: `${API_URL}/orders/my-orders`,
            all: `${API_URL}/orders`,
            updateStatus: (id) => `${API_URL}/orders/${id}/status`,
            cancel: (id) => `${API_URL}/orders/${id}/cancel`,
            confirmPayment: (id) => `${API_URL}/orders/${id}/confirm-payment`,
        },
    },
    getAuthHeader: () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    },
};
