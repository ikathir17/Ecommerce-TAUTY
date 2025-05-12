import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Box,
} from '@mui/material';
import { AddShoppingCart as AddToCartIcon } from '@mui/icons-material';
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
    const navigate = useNavigate();

    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product);
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
                        transition: 'transform 0.6s ease',
                        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                        height: IMAGE_HEIGHT,
                        aspectRatio: IMAGE_ASPECT_RATIO,
                        objectFit: 'cover',
                        objectPosition: 'center',
                        backgroundColor: '#f5f5f5'
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        transform: `translateY(${isHovered ? '0' : '100%'})`,
                        transition: 'transform 0.3s ease',
                        p: 2,
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Button
                        variant="text"
                        color="primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                        }}
                        sx={{
                            letterSpacing: '0.1em',
                            '&:hover': {
                                backgroundColor: 'transparent',
                                opacity: 0.7,
                            },
                        }}
                    >
                        ADD TO CART
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
        </Card>
    );
};

export default ProductCard;
