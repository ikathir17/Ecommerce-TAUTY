import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    Paper,
    Alert,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from '@mui/material';
import { useCart } from '../contexts/CartContext';
import { orderService } from '../services/orderService';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const DELIVERY_CHARGE = 10.00; // Example delivery charge

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        altPhone: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        addressType: 'home',
        deliveryInstructions: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [transactionId, setTransactionId] = useState('');
    const [error, setError] = useState(null);

    const total = getCartTotal() + DELIVERY_CHARGE;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePaymentMethodChange = (event) => {
        setPaymentMethod(event.target.value);
        setTransactionId(''); // Clear transaction ID if method changes
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Basic form validation
        if (!formData.fullName || !formData.email || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.postalCode || !formData.country) {
            enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
            return;
        }

        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.email)) {
            enqueueSnackbar('Please enter a valid email address', { variant: 'error' });
            return;
        }

        // Phone number validation (basic 10 digit check)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phone)) {
            enqueueSnackbar('Please enter a valid 10-digit phone number', { variant: 'error' });
            return;
        }
        if (paymentMethod === 'upi' && !transactionId.trim()) {
            enqueueSnackbar('Please enter your UPI transaction ID', { variant: 'error' });
            return;
        }

        try {
            // Prepare items array
            const items = cartItems.map((item) => ({
                productId: item._id,
                quantity: item.quantity,
            }));

            // Prepare address object for the order
            const shippingAddress = {
                fullName: formData.fullName,
                phone: formData.phone,
                altPhone: formData.altPhone,
                addressLine1: formData.addressLine1,
                addressLine2: formData.addressLine2,
                landmark: formData.landmark,
                city: formData.city,
                state: formData.state,
                postalCode: formData.postalCode,
                country: formData.country,
                addressType: formData.addressType,
                deliveryInstructions: formData.deliveryInstructions
            };
            
            await orderService.createOrder(items, shippingAddress, paymentMethod, transactionId);
            clearCart();

            const msg = paymentMethod === 'upi'
                ? `Order placed! You received a 5% discount. Please wait up to 5 minutes while we confirm your payment. Total charged (incl. ₹${DELIVERY_CHARGE.toFixed(2)} delivery): ₹${total.toFixed(2)}`
                : `Order confirmed! Please pay ₹${total.toFixed(2)} (incl. ₹${DELIVERY_CHARGE.toFixed(2)} delivery) upon delivery.`;

            enqueueSnackbar(msg, { variant: 'success' });
            navigate('/orders');
        } catch (err) {
            console.error(err);
            enqueueSnackbar(err.response?.data?.message || 'Failed to place order', { variant: 'error' });
        }
    };

    if (!cartItems.length) {
        return (
            <Container sx={{ py: 8 }}>
                <Typography>Your cart is empty.</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Typography variant="h4" gutterBottom>
                Checkout
            </Typography>
            <Paper sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                    <Typography variant="h6" gutterBottom>
                        Personal Information
                    </Typography>
                    
                    <TextField
                        name="fullName"
                        label="Full Name"
                        fullWidth
                        required
                        margin="normal"
                        value={formData.fullName}
                        onChange={handleChange}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            name="email"
                            label="Email"
                            type="email"
                            fullWidth
                            required
                            margin="normal"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <TextField
                            name="phone"
                            label="Phone Number"
                            type="tel"
                            fullWidth
                            required
                            margin="normal"
                            value={formData.phone}
                            onChange={handleChange}
                            inputProps={{ maxLength: 10 }}
                        />
                    </Box>
                    
                    <TextField
                        name="altPhone"
                        label="Alternative Phone (Optional)"
                        type="tel"
                        fullWidth
                        margin="normal"
                        value={formData.altPhone}
                        onChange={handleChange}
                        inputProps={{ maxLength: 10 }}
                    />
                    
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Delivery Address
                    </Typography>
                    
                    <TextField
                        name="addressLine1"
                        label="Address Line 1"
                        fullWidth
                        required
                        margin="normal"
                        value={formData.addressLine1}
                        onChange={handleChange}
                    />
                    
                    <TextField
                        name="addressLine2"
                        label="Address Line 2 (Optional)"
                        fullWidth
                        margin="normal"
                        value={formData.addressLine2}
                        onChange={handleChange}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            name="city"
                            label="City"
                            fullWidth
                            required
                            margin="normal"
                            value={formData.city}
                            onChange={handleChange}
                        />
                        <TextField
                            name="state"
                            label="State"
                            fullWidth
                            required
                            margin="normal"
                            value={formData.state}
                            onChange={handleChange}
                        />
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            name="postalCode"
                            label="Postal Code"
                            fullWidth
                            required
                            margin="normal"
                            value={formData.postalCode}
                            onChange={handleChange}
                        />
                        <TextField
                            name="country"
                            label="Country"
                            fullWidth
                            required
                            margin="normal"
                            value={formData.country}
                            onChange={handleChange}
                        />
                    </Box>
                    
                    <TextField
                        name="landmark"
                        label="Landmark (Optional)"
                        fullWidth
                        margin="normal"
                        value={formData.landmark}
                        onChange={handleChange}
                        helperText="E.g., Near Central Park, Opposite to Bank"
                    />
                    
                    <Box sx={{ mt: 2, mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Address Type
                        </Typography>
                        <RadioGroup
                            row
                            name="addressType"
                            value={formData.addressType}
                            onChange={handleChange}
                        >
                            <FormControlLabel value="home" control={<Radio />} label="Home" />
                            <FormControlLabel value="office" control={<Radio />} label="Office" />
                            <FormControlLabel value="other" control={<Radio />} label="Other" />
                        </RadioGroup>
                    </Box>

                    <TextField
                        name="deliveryInstructions"
                        label="Delivery Instructions (Optional)"
                        fullWidth
                        multiline
                        rows={3}
                        margin="normal"
                        value={formData.deliveryInstructions}
                        onChange={handleChange}
                    />

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Payment Method
                    </Typography>

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="payment-method-label">Payment Method</InputLabel>
                        <Select
                            labelId="payment-method-label"
                            value={paymentMethod}
                            label="Payment Method"
                            onChange={handlePaymentMethodChange}
                        >
                            <MenuItem value="cod">Cash on Delivery (COD)</MenuItem>
                            <MenuItem value="upi">UPI</MenuItem>
                        </Select>
                    </FormControl>

                    {paymentMethod === 'upi' && (
                        <TextField
                            label="UPI Transaction ID"
                            fullWidth
                            required
                            margin="normal"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                        />
                    )}

                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                    )}

                    <Box sx={{ mt: 4, textAlign: 'right' }}>
                        <Typography variant="h6" gutterBottom>
                            Total (incl. ₹{DELIVERY_CHARGE.toFixed(2)} delivery): ₹{total.toFixed(2)}
                        </Typography>
                        <Button type="submit" variant="contained" color="primary" size="large">
                            Place Order
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default Checkout;
