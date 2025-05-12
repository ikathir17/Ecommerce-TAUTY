import React from 'react';
import { Grid, Container, Typography } from '@mui/material';
import ProductCard from './ProductCard';

const ProductList = ({ title, products }) => {
    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {title && (
                <Typography variant="h4" component="h1" gutterBottom>
                    {title}
                </Typography>
            )}
            <Grid 
                container 
                spacing={2} 
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(4, 1fr)'
                    },
                    gap: 2
                }}
            >
                {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </Grid>
        </Container>
    );
};

export default ProductList;
