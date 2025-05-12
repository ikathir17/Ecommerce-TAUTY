import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
    Container, 
    Box, 
    Typography, 
    Button, 
    Grid, 
    Skeleton,
    Paper,
    Chip,
    Divider,
    Rating
} from '@mui/material';
import { 
    AddShoppingCart as AddToCartIcon,
    LocalShipping as ShippingIcon,
    Loop as ReturnIcon,
    Verified as AuthenticIcon
} from '@mui/icons-material';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';

const DEFAULT_IMAGE = 'https://via.placeholder.com/500x600/f5f5f5/666666?text=No+Image';

// Common image dimensions
const DETAIL_IMAGE_HEIGHT = 450;
const IMAGE_ASPECT_RATIO = 4/5; // Product image ratio

const getImageUrl = (image) => {
    if (!image || !image.data || !image.contentType) {
        return DEFAULT_IMAGE;
    }
    return `data:${image.contentType};base64,${image.data}`;
};

const ProductDetail = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await productService.getProduct(id);
                setProduct(data);
            } catch (err) {
                setError('Failed to load product details');
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <Container>
                <Box sx={{ py: 4 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Skeleton variant="rectangular" height={400} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Skeleton variant="text" height={60} />
                            <Skeleton variant="text" height={30} sx={{ mt: 2 }} />
                            <Skeleton variant="text" height={100} sx={{ mt: 2 }} />
                            <Skeleton variant="rectangular" height={50} sx={{ mt: 4 }} width={200} />
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="error" variant="h6">
                        {error}
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (!product) {
        return (
            <Container>
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="h6">
                        Product not found
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={0} sx={{ 
                p: { xs: 2, md: 4 }, 
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center'
            }}>
                <Grid container spacing={4}>
                    {/* Image Section */}
                    <Grid item xs={12} md={5}>
                        <Box
                            sx={{
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                bgcolor: '#f5f5f5'
                            }}
                        >
                            <Box
                                component="img"
                                src={getImageUrl(product.image)}
                                alt={product.image?.alt || product.name}
                                sx={{
                                    width: '100%',
                                    height: DETAIL_IMAGE_HEIGHT,
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                    borderRadius: 1,
                                    boxShadow: 1
                                }}
                            />
                        </Box>
                    </Grid>

                    {/* Product Info Section */}
                    <Grid item xs={12} md={7}>
                        <Box sx={{ p: { xs: 2, md: 4 } }}>
                            {/* Category Tag */}
                            <Chip 
                                label={product.category}
                                color="primary"
                                size="small"
                                sx={{ mb: 2 }}
                            />

                            {/* Product Title and Price */}
                            <Typography 
                                variant="h4" 
                                component="h1" 
                                gutterBottom
                                sx={{ 
                                    fontWeight: 600,
                                    letterSpacing: '-0.5px',
                                    lineHeight: 1.2,
                                    fontSize: { xs: '1.75rem', md: '2rem' }
                                }}
                            >
                                {product.name}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Typography 
                                    variant="h5" 
                                    color="primary" 
                                    sx={{ 
                                        fontWeight: 600,
                                        mr: 2
                                    }}
                                >
                                    ${product.price.toFixed(2)}
                                </Typography>
                                <Rating value={4.5} readOnly precision={0.5} size="small" />
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* Product Description */}
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    color: 'text.secondary',
                                    lineHeight: 1.8,
                                    mb: 4 
                                }}
                            >
                                {product.description}
                            </Typography>

                            {/* Stock Status */}
                            <Box sx={{ mb: 3 }}>
                                <Typography 
                                    variant="subtitle1" 
                                    sx={{ 
                                        color: product.stock > 0 ? 'success.main' : 'error.main',
                                        fontWeight: 500 
                                    }}
                                >
                                    {product.stock > 0 
                                        ? `In Stock (${product.stock} units)` 
                                        : 'Out of Stock'}
                                </Typography>
                            </Box>

                            {/* Add to Cart Button */}
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                startIcon={<AddToCartIcon />}
                                onClick={() => addToCart(product)}
                                disabled={product.stock <= 0}
                                sx={{ 
                                    py: 2,
                                    mb: 3,
                                    fontSize: '1.1rem'
                                }}
                            >
                                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </Button>

                            {/* Features */}
                            <Grid container spacing={2} sx={{ mt: 3 }}>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                        textAlign: 'center',
                                        p: 2
                                    }}>
                                        <ShippingIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                        <Typography variant="subtitle2">
                                            Free Shipping
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                        textAlign: 'center',
                                        p: 2
                                    }}>
                                        <ReturnIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                        <Typography variant="subtitle2">
                                            30 Days Return
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                        textAlign: 'center',
                                        p: 2
                                    }}>
                                        <AuthenticIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                        <Typography variant="subtitle2">
                                            Authentic Product
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default ProductDetail;
