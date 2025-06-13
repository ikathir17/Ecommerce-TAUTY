import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Rating as MuiRating,
    Tabs,
    Tab,
    useTheme,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { 
    AddShoppingCart as AddToCartIcon,
    LocalShipping as LocalShippingIcon,
    Loop as LoopIcon,
    Verified as VerifiedIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Close as CloseIcon,
    FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { config } from '../services/config';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProductRatingBadge from '../components/rating/ProductRatingBadge';
import RatingSummary from '../components/rating/RatingSummary';
import ProductRatings from '../components/rating/ProductRatings';

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
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    
    const [product, setProduct] = useState({ ratings: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [userOrders, setUserOrders] = useState([]);
    
    // Fetch product details
    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            const data = await productService.getProduct(id);
            setProduct(data);
            setError(null);
            return data;
        } catch (err) {
            console.error('Error fetching product:', err);
            const errorMessage = err.response?.data?.message || 'Failed to load product details';
            setError(errorMessage);
            enqueueSnackbar(errorMessage, { variant: 'error' });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [id, enqueueSnackbar]);
    
    // Fetch user's orders that contain this product
    const fetchUserOrders = useCallback(async () => {
        if (!user) return [];
        try {
            const { data } = await axios.get(`${config.apiUrl}/orders/my-orders`, {
                headers: config.getAuthHeader()
            });
            // Filter orders that contain this product and are delivered
            const relevantOrders = data.filter(order => 
                order.status === 'delivered' && 
                order.items.some(item => item.product?._id === id)
            );
            setUserOrders(relevantOrders);
            return relevantOrders;
        } catch (error) {
            console.error('Error fetching user orders:', error);
            enqueueSnackbar('Failed to load order history', { variant: 'error' });
            return [];
        }
    }, [user, id, enqueueSnackbar]);
    
    // Check if user has purchased this product
    const checkPurchaseStatus = useCallback(async () => {
        if (!user) return false;
        try {
            const { data } = await axios.get(
                `${config.apiUrl}/orders/check-purchase/${id}`,
                { headers: config.getAuthHeader() }
            );
            setHasPurchased(data.hasPurchased);
            return data.hasPurchased;
        } catch (error) {
            console.error('Error checking purchase status:', error);
            // Don't show error for 404 as it's expected for non-purchased products
            if (error.response?.status !== 404) {
                enqueueSnackbar('Error checking purchase status', { variant: 'error' });
            }
            return false;
        }
    }, [user, id, enqueueSnackbar]);
    
    // Initial data fetch
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                await fetchProduct();
                if (user) {
                    await Promise.all([
                        fetchUserOrders(),
                        checkPurchaseStatus()
                    ]);
                }
            } catch (error) {
                console.error('Error loading product data:', error);
            }
        };

        if (isMounted) {
            loadData();
        }

        return () => {
            isMounted = false;
        };
    }, [id, user, fetchProduct, fetchUserOrders, checkPurchaseStatus]);
    
    // Formik for rating form
    const formik = useFormik({
        initialValues: {
            rating: 0,
            review: '',
            orderId: ''
        },
        validationSchema: Yup.object({
            rating: Yup.number()
                .required('Rating is required')
                .min(1, 'Please rate the product')
                .max(5, 'Rating cannot be more than 5'),
            review: Yup.string()
                .max(500, 'Review must be at most 500 characters')
                .notRequired(),
            orderId: Yup.string().required('Please select an order')
        }),
        onSubmit: async (values) => {
            try {
                await axios.post(
                    `${config.apiUrl}/ratings`,
                    {
                        productId: id,
                        orderId: values.orderId,
                        rating: values.rating,
                        review: values.review
                    },
                    { headers: config.getAuthHeader() }
                );
                
                enqueueSnackbar('Thank you for your review!', { variant: 'success' });
                setShowRatingForm(false);
                // Refresh product data to show updated ratings
                fetchProduct();
            } catch (error) {
                console.error('Error submitting review:', error);
                enqueueSnackbar(
                    error.response?.data?.message || 'Failed to submit review',
                    { variant: 'error' }
                );
            }
        }
    });
    
    // Render loading state
    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Skeleton variant="rectangular" height={500} animation="wave" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Skeleton variant="text" width="80%" height={60} animation="wave" />
                        <Skeleton variant="text" width="60%" height={40} animation="wave" />
                        <Skeleton variant="text" width="40%" height={30} animation="wave" sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" height={100} animation="wave" sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" width={200} height={50} animation="wave" />
                    </Grid>
                </Grid>
            </Container>
        );
    }
    
    // Render error state
    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="error" gutterBottom>
                    {error}
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={fetchProduct}
                    sx={{ mt: 2 }}
                >
                    Retry
                </Button>
            </Container>
        );
    }
    
    // Handle case when product is not found
    if (!product) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                    Product not found
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate('/')}
                    sx={{ mt: 2 }}
                >
                    Continue Shopping
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={0} sx={{ 
                p: { xs: 2, md: 4 }, 
                bgcolor: 'background.default',
                borderRadius: 2
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
                                bgcolor: '#f5f5f5',
                                borderRadius: 2,
                                overflow: 'hidden'
                            }}
                        >
                            <Box
                                component="img"
                                src={getImageUrl(product.images?.[0] || product.image)}
                                alt={product.name}
                                sx={{
                                    width: '100%',
                                    height: DETAIL_IMAGE_HEIGHT,
                                    objectFit: 'contain',
                                    objectPosition: 'center',
                                    transition: 'transform 0.3s ease-in-out',
                                    '&:hover': {
                                        transform: 'scale(1.03)'
                                    }
                                }}
                            />
                        </Box>
                    </Grid>

                    {/* Product Info Section */}
                    <Grid item xs={12} md={7}>
                        <Box sx={{ p: { xs: 2, md: 0 } }}>
                            {/* Category Tag */}
                            <Chip 
                                label={product.category}
                                color="primary"
                                size="small"
                                sx={{ mb: 2 }}
                            />

                            {/* Product Title */}
                            <Typography 
                                variant="h4" 
                                component="h1" 
                                gutterBottom
                                sx={{ 
                                    fontWeight: 700,
                                    letterSpacing: '-0.5px',
                                    lineHeight: 1.2,
                                    fontSize: { xs: '1.75rem', md: '2.25rem' }
                                }}
                            >
                                {product.name}
                            </Typography>
                            
                            {/* Price and Rating */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                                <Typography 
                                    variant="h4" 
                                    color="primary" 
                                    sx={{ 
                                        fontWeight: 700,
                                    }}
                                >
                                    ${product.price.toFixed(2)}
                                </Typography>
                                
                                <Box display="flex" alignItems="center">
                                    <ProductRatingBadge 
                                        rating={product.rating} 
                                        ratingCount={product.ratingCount}
                                        size="medium"
                                    />
                                    {product.ratingCount > 0 && (
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                            ({product.ratingCount} {product.ratingCount === 1 ? 'review' : 'reviews'})
                                        </Typography>
                                    )}
                                </Box>
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
                                <Chip 
                                    label={product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                                    color={product.stock > 0 ? 'success' : 'error'}
                                    variant="outlined"
                                    size="small"
                                />
                            </Box>

                            {/* Add to Cart Button */}
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                startIcon={<AddToCartIcon />}
                                onClick={async () => {
                                    try {
                                        await addToCart({
                                            ...product,
                                            quantity: 1
                                        });
                                        enqueueSnackbar(`${product.name} added to cart`, { variant: 'success' });
                                    } catch (error) {
                                        console.error('Error adding to cart:', error);
                                        enqueueSnackbar(
                                            error.response?.data?.message || 'Failed to add to cart', 
                                            { variant: 'error' }
                                        );
                                    }
                                }}
                                disabled={product.stock <= 0}
                                sx={{ 
                                    py: 1.5,
                                    mb: 3,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    borderRadius: 2
                                }}
                            >
                                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </Button>

                            {/* Product Features */}
                            <Grid container spacing={2} sx={{ mt: 3, mb: 4 }}>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={featureBoxStyle}>
                                        <LocalShippingIcon sx={featureIconStyle} />
                                        <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                            Free shipping on orders over $50
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={featureBoxStyle}>
                                        <LoopIcon sx={featureIconStyle} />
                                        <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                            Easy 30-day returns
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={featureBoxStyle}>
                                        <VerifiedIcon sx={featureIconStyle} />
                                        <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                            Authentic products guaranteed
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Product Tabs */}
                            <Box sx={{ width: '100%', mt: 4 }}>
                                <Tabs 
                                    value={tabValue} 
                                    onChange={(e, newValue) => setTabValue(newValue)}
                                    aria-label="product details tabs"
                                    variant="fullWidth"
                                    sx={{
                                        '& .MuiTabs-indicator': {
                                            height: 3,
                                            backgroundColor: 'primary.main',
                                        },
                                        mb: 3
                                    }}
                                >
                                    <Tab label="Description" />
                                    <Tab label={`Reviews (${product.ratings?.length || 0})`} />
                                </Tabs>

                                <Box sx={{ py: 2 }}>
                                    {tabValue === 0 && (
                                        <Typography variant="body1" color="text.secondary">
                                            {product.fullDescription || product.description || 'No description available.'}
                                        </Typography>
                                    )}

                                    {tabValue === 1 && (
                                        <Box>
                                            <Box sx={{ mb: 4 }}>
                                                <RatingSummary 
                                                    product={product} 
                                                    onRateClick={() => {
                                                        if (!user) {
                                                            enqueueSnackbar('Please sign in to leave a review', { variant: 'info' });
                                                            return;
                                                        }
                                                        if (!hasPurchased) {
                                                            enqueueSnackbar('You need to purchase this product first', { variant: 'info' });
                                                            return;
                                                        }
                                                        setShowRatingForm(true);
                                                    }}
                                                />
                                            </Box>

                                            <ProductRatings productId={product._id} ratings={product.ratings} />

                                            {hasPurchased && (
                                                <Box sx={{ mt: 4, textAlign: 'center' }}>
                                                    <Button 
                                                        variant="outlined" 
                                                        color="primary"
                                                        onClick={() => setShowRatingForm(true)}
                                                        startIcon={<StarIcon />}
                                                    >
                                                        Write a Review
                                                    </Button>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Rating Form Dialog */}
            <Dialog 
                open={showRatingForm} 
                onClose={() => setShowRatingForm(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Write a Review</Typography>
                        <IconButton 
                            onClick={() => setShowRatingForm(false)}
                            edge="end"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <form onSubmit={formik.handleSubmit}>
                    <DialogContent>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Select Order</InputLabel>
                            <Select
                                name="orderId"
                                value={formik.values.orderId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.orderId && Boolean(formik.errors.orderId)}
                                label="Select Order"
                            >
                                {userOrders.map((order) => (
                                    <MenuItem key={order._id} value={order._id}>
                                        Order #{order.orderNumber} - {new Date(order.createdAt).toLocaleDateString()}
                                    </MenuItem>
                                ))}
                            </Select>
                            {formik.touched.orderId && formik.errors.orderId && (
                                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                    {formik.errors.orderId}
                                </Typography>
                            )}
                        </FormControl>

                        <Box sx={{ my: 3 }}>
                            <Typography gutterBottom>Your Rating</Typography>
                            <Box display="flex" alignItems="center">
                                <MuiRating
                                    name="rating"
                                    value={formik.values.rating}
                                    onChange={(event, value) => formik.setFieldValue('rating', value)}
                                    precision={0.5}
                                    icon={<StarIcon fontSize="large" color="primary" />}
                                    emptyIcon={<StarBorderIcon fontSize="large" />}
                                    sx={{ mr: 2 }}
                                />
                                <Typography variant="body1">
                                    {formik.values.rating ? `${formik.values.rating} stars` : 'Rate this product'}
                                </Typography>
                            </Box>
                            {formik.touched.rating && formik.errors.rating && (
                                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                    {formik.errors.rating}
                                </Typography>
                            )}
                        </Box>

                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            name="review"
                            label="Your Review (Optional)"
                            value={formik.values.review}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.review && Boolean(formik.errors.review)}
                            helperText={formik.touched.review && formik.errors.review}
                            margin="normal"
                            placeholder="Share your experience with this product..."
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button 
                            onClick={() => setShowRatingForm(false)}
                            color="inherit"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            disabled={formik.isSubmitting}
                            sx={{ minWidth: 120 }}
                        >
                            {formik.isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

// Styles
const featureBoxStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    p: 2,
    height: '100%',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: 'primary.main',
        boxShadow: 1
    }
};

const featureIconStyle = {
    fontSize: 32,
    color: 'primary.main',
    mb: 1
};

export default ProductDetail;
