import React, { useState, useEffect } from 'react';
import { NAVBAR_HEIGHT } from '../../styles/constants';
import { Link as RouterLink } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Badge,
    Box,
    Container,
} from '@mui/material';
import {
    ShoppingCart as CartIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();

    return (
        <AppBar 
            position="fixed" 
            sx={{
            backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 1)',
            color: 'black',
            boxShadow: isScrolled ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
        }}
        elevation={0}
    >
            <Toolbar sx={{ height: NAVBAR_HEIGHT, minHeight: NAVBAR_HEIGHT }}>
                <Container maxWidth="xl" sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '100%'
                }}>
                    <Typography
                        variant="h4"
                        component={RouterLink}
                        to="/"
                        sx={{
                            textDecoration: 'none',
                            color: 'inherit',
                            fontWeight: 700,
                            letterSpacing: '0.2em',
                            '&:hover': {
                                opacity: 0.8
                            }
                        }}
                    >
                        TAUTY
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/"
                        >
                            Home
                        </Button>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/men"
                        >
                            Men
                        </Button>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/women"
                        >
                            Women
                        </Button>

                        {user && user.role === 'admin' && (
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/admin"
                            >
                                Admin
                            </Button>
                        )}

                        <IconButton
                            color="inherit"
                            component={RouterLink}
                            to="/cart"
                        >
                            <Badge badgeContent={getCartCount()} color="error">
                                <CartIcon />
                            </Badge>
                        </IconButton>

                        {user ? (
                            <Button
                                color="inherit"
                                onClick={logout}
                            >
                                Logout
                            </Button>
                        ) : (
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/auth"
                                sx={{
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    fontWeight: 400,
                                    fontSize: '0.875rem',
                                    '&:hover': {
                                        backgroundColor: 'transparent',
                                        opacity: 0.7
                                    }
                                }}
                            >
                                <PersonIcon />
                            </Button>
                        )}
                    </Box>
                </Container>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
