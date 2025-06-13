import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Typography,
    Card,
    CardContent,
    CardMedia,
    IconButton,
    useTheme,
    Tooltip,
    Snackbar,
    Alert,
    useMediaQuery
} from '@mui/material';
import ProductRatingBadge from '../rating/ProductRatingBadge';
import { AddShoppingCart as AddToCartIcon, Remove as RemoveIcon, Add as AddIcon } from '@mui/icons-material';
import { config } from '../../services/config';

const DEFAULT_IMAGE = 'https://via.placeholder.com/400x600/f5f5f5/666666?text=No+Image';

// Common image dimensions
const IMAGE_HEIGHT = 400;
const IMAGE_ASPECT_RATIO = 3/4; // 4:3 aspect ratio

const getImageUrl = (image) => {
    if (!image || !image.data || !image.contentType) {
        return DEFAULT_IMAGE;
    }
    return `data:${image.contentType};base64,${image.data}`;
};

const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [currentQuantity, setCurrentQuantity] = useState(1);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const { cartItems, addToCart, updateQuantity } = useCart();

    // Check if product is in cart and get its quantity
    useEffect(() => {
        const cartItem = cartItems.find(item => item._id === product._id);
        if (cartItem) {
            setCurrentQuantity(cartItem.quantity);
        } else {
            setCurrentQuantity(1);
        }
    }, [cartItems, product._id]);

    const handleAddToCart = (e) => {
        e.stopPropagation();
        
        if (product.stock <= 0) {
            setSnackbarMessage('This product is out of stock');
            setSnackbarSeverity('error');
            setShowSnackbar(true);
            return;
        }

        const existingItem = cartItems.find(item => item._id === product._id);
        
        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                setSnackbarMessage('Maximum available quantity reached');
                setSnackbarSeverity('warning');
                setShowSnackbar(true);
                return;
            }
            updateQuantity(product._id, existingItem.quantity + 1);
        } else {
            addToCart({ ...product, quantity: 1 });
        }
        
        setSnackbarMessage('Product added to cart');
        setSnackbarSeverity('success');
        setShowSnackbar(true);
    };

    const handleQuantityChange = (e, newQuantity) => {
        e.stopPropagation();
        
        if (newQuantity < 1) return;
        if (newQuantity > product.stock) {
            setSnackbarMessage(`Only ${product.stock} items available`);
            setSnackbarSeverity('warning');
            setShowSnackbar(true);
            return;
        }
        
        updateQuantity(product._id, newQuantity);
    };

    return (
        <Card 
            sx={{ 
                cursor: 'pointer',
                position: 'relative',
                backgroundColor: 'transparent',
                transition: 'all 0.3s ease',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => navigate(`/product/${product._id}`)}
        >
            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                <CardMedia
                    component="img"
                    image={getImageUrl(product.image)}
                    alt={product.image?.alt || product.name}
                    sx={{
                        transition: 'all 0.3s ease',
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        height: IMAGE_HEIGHT,
                        aspectRatio: IMAGE_ASPECT_RATIO,
                        objectFit: 'cover',
                        objectPosition: 'center',
                        backgroundColor: '#f5f5f5',
                        filter: isHovered ? 'brightness(0.9)' : 'brightness(1)'
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isHovered ? 1 : 0,
                        transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
                        transition: 'all 0.3s ease',
                    }}
                >
                    <Button
                        variant="text"
                        color="primary"
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        fullWidth
                        sx={{
                            letterSpacing: '0.1em',
                            fontSize: '0.75rem',
                            py: 0.5,
                            '&:hover': {
                                backgroundColor: 'transparent',
                                opacity: 0.7,
                            },
                        }}
                    >
                        {product.stock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
                    </Button>
                </Box>
            </Box>
            <CardContent sx={{ pt: 2, pb: 1, px: 0 }}>
                <Typography 
                    variant="subtitle1" 
                    sx={{ 
                        fontWeight: 300,
                        letterSpacing: '0.05em',
                        mb: 1
                    }}
                >
                    {product.name}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Typography variant="body2" color="text.secondary" noWrap flex={1}>
                        {product.category}
                    </Typography>
                    {product.rating > 0 && (
                        <ProductRatingBadge 
                            rating={product.rating} 
                            ratingCount={product.ratingCount} 
                            size="small" 
                        />
                    )}
                </Box>
                <Typography 
                    variant="body2" 
                    sx={{ 
                        color: 'text.secondary',
                        fontWeight: 300
                    }}
                >
                    ${product.price}
                </Typography>
            </CardContent>
            <Snackbar
                open={showSnackbar}
                autoHideDuration={3000}
                onClose={() => setShowSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setShowSnackbar(false)} 
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Card>
    );
};

export default ProductCard;
