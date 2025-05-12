import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Tabs,
    Tab,
    Box,
    TextField,
    Button,
    Typography,
    Alert,
} from '@mui/material';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const Auth = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });

    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setError('');
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const { token, role } = await authService.login(
                loginData.email,
                loginData.password
            );
            login(token);
            navigate(role === 'admin' ? '/admin' : '/');
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (registerData.password !== registerData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const { token } = await authService.register(
                registerData.name,
                registerData.email,
                registerData.password
            );
            login(token);
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                >
                    <Tab label="Login" />
                    <Tab label="Sign Up" />
                </Tabs>

                {error && (
                    <Box sx={{ p: 2 }}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                )}

                <Box sx={{ p: 3 }}>
                    {activeTab === 0 ? (
                        <form onSubmit={handleLoginSubmit}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                margin="normal"
                                value={loginData.email}
                                onChange={(e) =>
                                    setLoginData({
                                        ...loginData,
                                        email: e.target.value,
                                    })
                                }
                                required
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                margin="normal"
                                value={loginData.password}
                                onChange={(e) =>
                                    setLoginData({
                                        ...loginData,
                                        password: e.target.value,
                                    })
                                }
                                required
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{ mt: 2 }}
                            >
                                Login
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegisterSubmit}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                margin="normal"
                                value={registerData.name}
                                onChange={(e) =>
                                    setRegisterData({
                                        ...registerData,
                                        name: e.target.value,
                                    })
                                }
                                required
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                margin="normal"
                                value={registerData.email}
                                onChange={(e) =>
                                    setRegisterData({
                                        ...registerData,
                                        email: e.target.value,
                                    })
                                }
                                required
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                margin="normal"
                                value={registerData.password}
                                onChange={(e) =>
                                    setRegisterData({
                                        ...registerData,
                                        password: e.target.value,
                                    })
                                }
                                required
                            />
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                type="password"
                                margin="normal"
                                value={registerData.confirmPassword}
                                onChange={(e) =>
                                    setRegisterData({
                                        ...registerData,
                                        confirmPassword: e.target.value,
                                    })
                                }
                                required
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{ mt: 2 }}
                            >
                                Sign Up
                            </Button>
                        </form>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default Auth;
