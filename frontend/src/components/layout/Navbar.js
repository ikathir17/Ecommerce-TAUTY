import React, { useState, useEffect, useRef } from 'react';
import { NAVBAR_HEIGHT } from '../../styles/constants';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import SearchBar from '../SearchBar';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Badge,
    Box,
    Container,
    Menu,
    MenuItem,
    ListItemIcon,
    Divider,
    Avatar,
} from '@mui/material';
import {
    ShoppingCart as CartIcon,
    Person as PersonIcon,
    AccountCircle as AccountCircleIcon,
    ExitToApp as LogoutIcon,
    PersonOutline as ProfileIcon,
    AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const menuRef = useRef(null);
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const open = Boolean(anchorEl);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfileClick = () => {
        handleMenuClose();
        navigate('/profile');
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    const handleAdminClick = () => {
        handleMenuClose();
        navigate('/admin');
    };

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

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, justifyContent: 'flex-end' }}>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/"
                            sx={{ minWidth: 'auto', px: 2 }}
                        >
                            Home
                        </Button>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/men"
                            sx={{ minWidth: 'auto', px: 2 }}
                        >
                            Men
                        </Button>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/women"
                            sx={{ minWidth: 'auto', px: 2 }}
                        >
                            Women
                        </Button>
                        
                        {user && user.role !== 'admin' && (
                            <Button
                                component={RouterLink}
                                to="/orders"
                                color="inherit"
                                sx={{ minWidth: 'auto', px: 2 }}
                            >
                                Orders
                            </Button>
                        )}
                        
                        <IconButton
                            color="inherit"
                            component={RouterLink}
                            to="/cart"
                            sx={{ minWidth: '48px', height: '48px' }}
                        >
                            <Badge badgeContent={getCartCount()} color="error">
                                <CartIcon />
                            </Badge>
                        </IconButton>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                            <SearchBar onSearch={(q) => navigate(q ? `/?search=${encodeURIComponent(q)}` : '/')} />
                        </Box>
                        
                        {user?.role === 'admin' && (
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/admin"
                                sx={{ minWidth: 'auto', px: 2 }}
                            >
                                Admin
                            </Button>
                        )}
                        
                        {user ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton
                                    onClick={handleMenuOpen}
                                    size="small"
                                    sx={{ ml: 1 }}
                                    aria-controls={open ? 'account-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={open ? 'true' : undefined}
                                >
                                    <Avatar 
                                        sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                                        alt={user.name || 'User'}
                                        src=""
                                    >
                                        {user.name ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
                                    </Avatar>
                                </IconButton>
                                
                                <Menu
                                    anchorEl={anchorEl}
                                    id="account-menu"
                                    open={open}
                                    onClose={handleMenuClose}
                                    onClick={handleMenuClose}
                                    PaperProps={{
                                        elevation: 0,
                                        sx: {
                                            overflow: 'visible',
                                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                                            mt: 1.5,
                                            '& .MuiAvatar-root': {
                                                width: 32,
                                                height: 32,
                                                ml: -0.5,
                                                mr: 1,
                                            },
                                            '&:before': {
                                                content: '""',
                                                display: 'block',
                                                position: 'absolute',
                                                top: 0,
                                                right: 14,
                                                width: 10,
                                                height: 10,
                                                bgcolor: 'background.paper',
                                                transform: 'translateY(-50%) rotate(45deg)',
                                                zIndex: 0,
                                            },
                                        },
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <MenuItem onClick={handleProfileClick}>
                                        <ListItemIcon>
                                            <ProfileIcon fontSize="small" />
                                        </ListItemIcon>
                                        My Profile
                                    </MenuItem>
                                    
                                    {user.role === 'admin' && (
                                        <MenuItem onClick={handleAdminClick}>
                                            <ListItemIcon>
                                                <AdminIcon fontSize="small" />
                                            </ListItemIcon>
                                            Admin Dashboard
                                        </MenuItem>
                                    )}
                                    
                                    <Divider />
                                    
                                    <MenuItem onClick={handleLogout}>
                                        <ListItemIcon>
                                            <LogoutIcon fontSize="small" />
                                        </ListItemIcon>
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </Box>
                        ) : (
                            <Button 
                                color="inherit" 
                                component={RouterLink} 
                                to="/auth"
                                sx={{ textTransform: 'none', fontWeight: 400 }}
                                startIcon={<PersonIcon />}
                            >
                                Login / Register
                            </Button>
                        )}
                    </Box>
                </Container>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
