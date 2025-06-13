import React, { useState, useEffect } from 'react';
import { Container, Box, Typography } from '@mui/material';
import ProductList from '../components/product/ProductList';
import { productService } from '../services/productService';
import { useSearchParams } from 'react-router-dom';

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const q = searchParams.get('search') || '';
                const data = await productService.getAllProducts(q);
                setProducts(shuffleArray(data));
            } catch (err) {
                setError('Failed to load products');
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchParams]);

    if (loading) {
        return (
            <Container>
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography>Loading...</Typography>
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
            {/* Hero Section */}
            <Box
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: 8,
                    mb: 4,
                    textAlign: 'center',
                }}
            >
                <Container>
                    <Typography variant="h2" component="h1" gutterBottom>
                        Welcome to TAUTY
                    </Typography>
                    <Typography variant="h5">
                        Discover the latest fashion trends
                    </Typography>
                </Container>
            </Box>

            {/* Featured Products */}
            <ProductList title="Our Products" products={products} />
        </Box>
    );
};

export default Home;
