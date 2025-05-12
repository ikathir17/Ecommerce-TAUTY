const BASE_URL = 'http://localhost:5003';
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
            all: `${API_URL}/products`,
            byCategory: (category) => `${API_URL}/products/category/${category}`,
            single: (id) => `${API_URL}/products/${id}`,
        },
        cart: {
            validate: `${API_URL}/cart/validate`,
        },
        orders: {
            create: `${API_URL}/orders`,
            myOrders: `${API_URL}/orders/my-orders`,
        },
    },
    getAuthHeader: () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    },
};
