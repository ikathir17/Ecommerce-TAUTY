import axios from 'axios';
import { config } from './config';

export const orderService = {
    async createOrder(items, shippingAddress, paymentMethod, transactionId) {
        const response = await axios.post(
            config.endpoints.orders.create,
            { items, shippingAddress, paymentMethod, transactionId },
            { headers: config.getAuthHeader() }
        );
        return response.data;
    },

    async getMyOrders() {
        const response = await axios.get(config.endpoints.orders.myOrders, {
            headers: config.getAuthHeader(),
        });
        return response.data;
    },

    // Admin only
    async getAllOrders() {
        const response = await axios.get(config.endpoints.orders.all, {
            headers: config.getAuthHeader(),
        });
        return response.data;
    },

    // Admin only
    async updateStatus(id, status) {
        const response = await axios.patch(
            config.endpoints.orders.updateStatus(id),
            { status },
            { headers: config.getAuthHeader() }
        );
        return response.data;
    },

    async cancelOrder(id) {
        const response = await axios.patch(
            config.endpoints.orders.cancel(id),
            {},
            { headers: config.getAuthHeader() }
        );
        return response.data;
    },

    async confirmPayment(id) {
        const response = await axios.patch(
            config.endpoints.orders.confirmPayment(id),
            {},
            { headers: config.getAuthHeader() }
        );
        return response.data;
    },
};
