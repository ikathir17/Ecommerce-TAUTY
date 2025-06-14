import React from 'react';
import { Box, Container, Typography, Link, Stack, Divider } from '@mui/material';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <Box component="footer" sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', mt: 8, py: 4 }}>
            <Container maxWidth="lg">
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} justifyContent="space-between">
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            TAUTY eCommerce
                        </Typography>
                        <Typography variant="body2">
                            Your one-stop shop for the best products online.
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="subtitle1" gutterBottom>
                            Quick Links
                        </Typography>
                        <Stack spacing={1}>
                            <Link href="/" color="inherit" underline="hover">
                                Home
                            </Link>
                            <Link href="/cart" color="inherit" underline="hover">
                                Cart
                            </Link>
                            <Link href="/orders" color="inherit" underline="hover">
                                Orders
                            </Link>
                        </Stack>
                    </Box>

                    <Box>
                        <Typography variant="subtitle1" gutterBottom>
                            Contact Us
                        </Typography>
                        <Typography variant="body2" component="a" href="mailto:kathiresanp80152@gmail.com" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            Email: kathiresanp80152@gmail.com
                        </Typography>
                        <Typography variant="body2" component="a" href="tel:+918754780152" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, display: 'block', mt: 1 }}>
                            Phone: +91 87547 80152
                        </Typography>
                    </Box>
                </Stack>

                <Divider sx={{ my: 3, borderColor: 'primary.contrastText', opacity: 0.2 }} />

                <Typography variant="body2" align="center">
                    © {year} TAUTY eCommerce. All rights reserved.
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
