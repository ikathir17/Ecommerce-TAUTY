import axios from 'axios';
import { config } from './config';

export const productService = {
    async getAllProducts(query = '') {
        const response = await axios.get(config.endpoints.products.all(query));
        return response.data;
    },

    async getProductsByCategory(category) {
        const response = await axios.get(config.endpoints.products.byCategory(category));
        return response.data;
    },

    async getProduct(id) {
        const response = await axios.get(config.endpoints.products.single(id));
        return response.data;
    },

    // Admin functions
    async createProduct(productData) {
        const response = await axios.post(
            config.endpoints.products.all,
            productData,
            {
                headers: {
                    ...config.getAuthHeader(),
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    },

    async updateProduct(id, productData) {
        const response = await axios.put(
            config.endpoints.products.single(id),
            productData,
            {
                headers: {
                    ...config.getAuthHeader(),
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    },

    async deleteProduct(id) {
        const response = await axios.delete(
            config.endpoints.products.single(id),
            {
                headers: config.getAuthHeader(),
            }
        );
        return response.data;
    },
};
