import React from 'react';
import { useCart } from '../contexts/CartContext';
import {
    Container,
    Box,
    Typography,
    Button,
    Grid,
    IconButton,
    Divider,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { config } from '../services/config';

const DEFAULT_IMAGE = 'https://via.placeholder.com/400x600/f5f5f5/666666?text=No+Image';

// Common image dimensions
const CART_IMAGE_HEIGHT = 200;
const IMAGE_ASPECT_RATIO = 3/4; // 4:3 aspect ratio

const getImageUrl = (image) => {
    if (!image || !image.data || !image.contentType) {
        return DEFAULT_IMAGE;
    }
    return `data:${image.contentType};base64,${image.data}`;
};

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    const navigate = useNavigate();

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    if (!cartItems.length) {
        return (
            <Container maxWidth="xl">
                <Box sx={{ 
                    minHeight: 'calc(100vh - 200px)', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 8
                }}>
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            mb: 3,
                            fontWeight: 300,
                            letterSpacing: '0.1em'
                        }}
                    >
                        YOUR SHOPPING CART IS EMPTY
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/')}
                        sx={{
                            py: 2,
                            px: 4,
                            letterSpacing: '0.1em'
                        }}
                    >
                        CONTINUE SHOPPING
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 8 }}>
                <Typography 
                    variant="h4" 
                    sx={{ 
                        mb: 6,
                        fontWeight: 300,
                        letterSpacing: '0.1em',
                        textAlign: 'center'
                    }}
                >
                    SHOPPING CART
                </Typography>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        {cartItems.map((item) => (
                            <Box key={item._id} sx={{ mb: 4 }}>
                                <Grid container spacing={4} alignItems="center">
                                    <Grid item xs={12} sm={3}>
                                        <img
                                            src={getImageUrl(item.image)}
                                            alt={item.image?.alt || item.name}
                                            style={{
                                                width: 'auto',
                                                height: CART_IMAGE_HEIGHT,
                                                aspectRatio: IMAGE_ASPECT_RATIO,
                                                objectFit: 'cover',
                                                objectPosition: 'center',
                                                borderRadius: '8px',
                                                backgroundColor: '#f5f5f5',
                                                display: 'block',
                                                margin: '0 auto'
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={9}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start'
                                        }}>
                                            <Box>
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        fontWeight: 300,
                                                        letterSpacing: '0.05em',
                                                        mb: 1
                                                    }}
                                                >
                                                    {item.name}
                                                </Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    color="text.secondary"
                                                    sx={{ mb: 2 }}
                                                >
                                                    {item.category}
                                                </Typography>
                                                <Box sx={{ 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2
                                                }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <RemoveIcon />
                                                    </IconButton>
                                                    <Typography>{item.quantity}</Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                        disabled={item.quantity >= item.stock}
                                                    >
                                                        <AddIcon />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                            <Box sx={{ 
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-end',
                                                gap: 2
                                            }}>
                                                <Typography 
                                                    variant="h6"
                                                    sx={{ fontWeight: 300 }}
                                                >
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </Typography>
                                                <IconButton
                                                    onClick={() => removeFromCart(item._id)}
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Divider sx={{ mt: 4 }} />
                            </Box>
                        ))}
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ 
                            position: 'sticky',
                            top: 100,
                            bgcolor: 'background.paper',
                            p: 4,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    mb: 3,
                                    fontWeight: 300,
                                    letterSpacing: '0.05em'
                                }}
                            >
                                ORDER SUMMARY
                            </Typography>
                            <Box sx={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                mb: 2
                            }}>
                                <Typography>Subtotal</Typography>
                                <Typography>${calculateTotal().toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                mb: 3
                            }}>
                                <Typography>Shipping</Typography>
                                <Typography>Free</Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            <Box sx={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                mb: 4
                            }}>
                                <Typography variant="h6">Total</Typography>
                                <Typography variant="h6">${calculateTotal().toFixed(2)}</Typography>
                            </Box>
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                sx={{
                                    py: 2,
                                    letterSpacing: '0.1em'
                                }}
                            >
                                PROCEED TO CHECKOUT
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default Cart;
