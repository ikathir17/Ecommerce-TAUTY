import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Typography, CircularProgress } from '@mui/material';
import ProductList from '../components/product/ProductList';
import { productService } from '../services/productService';

const CategoryPage = () => {
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await productService.getProductsByCategory(category);
                setProducts(data);
            } catch (err) {
                setError('Failed to load products');
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category]);

    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

    if (loading) {
        return (
            <Container>
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Box>
            {/* Category Header */}
            <Box
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: 6,
                    mb: 4,
                    textAlign: 'center',
                }}
            >
                <Container>
                    <Typography variant="h2" component="h1" gutterBottom>
                        {categoryTitle}'s Collection
                    </Typography>
                    <Typography variant="h5">
                        Discover our latest {category.toLowerCase()} fashion trends
                    </Typography>
                </Container>
            </Box>

            {/* Products */}
            <ProductList products={products} />
        </Box>
    );
};

export default CategoryPage;
