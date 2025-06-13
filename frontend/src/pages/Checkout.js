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
} from '@mui/material';
import { useCart } from '../contexts/CartContext';
import { orderService } from '../services/orderService';
import { useNavigate } from 'react-router-dom';

const DELIVERY_CHARGE = 10;

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
    });

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [transactionId, setTransactionId] = useState('');
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress((prev) => ({ ...prev, [name]: value }));
    };

    const subtotal = getCartTotal();
    const discount = paymentMethod === 'upi' ? 0.05 * subtotal : 0;
    const total = subtotal - discount + DELIVERY_CHARGE;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        // Basic validation
        if (Object.values(address).some((v) => !v.trim())) {
            setError('Please fill in all address fields');
            return;
        }
        if (paymentMethod === 'upi' && !transactionId.trim()) {
            setError('Please enter your UPI transaction ID');
            return;
        }

        try {
            // Prepare items array
            const items = cartItems.map((item) => ({
                productId: item._id,
                quantity: item.quantity,
            }));

            await orderService.createOrder(items, address, paymentMethod, transactionId);
            clearCart();

            const msg = paymentMethod === 'upi'
                ? `Order placed! You received a 5% discount. Please wait up to 5 minutes while we confirm your payment. Total charged (incl. $${DELIVERY_CHARGE} delivery): $${total.toFixed(2)}`
                : `Order confirmed! Please pay $${total.toFixed(2)} (incl. $${DELIVERY_CHARGE} delivery) upon delivery.`;

            navigate('/orders', { state: { success: msg } });
        } catch (err) {
            console.error(err);
            setError('Failed to place order');
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
                        Shipping Address
                    </Typography>
                    {['street', 'city', 'state', 'zipCode', 'country'].map((field) => (
                        <TextField
                            key={field}
                            name={field}
                            label={field.charAt(0).toUpperCase() + field.slice(1)}
                            fullWidth
                            margin="normal"
                            value={address[field]}
                            onChange={handleAddressChange}
                        />
                    ))}

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Payment Method
                    </Typography>
                    <RadioGroup
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        row
                    >
                        <FormControlLabel
                            value="upi"
                            control={<Radio />}
                            label="UPI"
                        />
                        <FormControlLabel
                            value="cod"
                            control={<Radio />}
                            label="Cash on Delivery"
                        />
                    </RadioGroup>

                    {paymentMethod === 'upi' && (
                        <TextField
                            label="UPI Transaction ID"
                            fullWidth
                            margin="normal"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                        />
                    )}

                    <Box sx={{ mt: 3 }}>
                        <Typography>Subtotal: ${subtotal.toFixed(2)}</Typography>
                        <Typography>Delivery: ${DELIVERY_CHARGE.toFixed(2)}</Typography>
                        {paymentMethod === 'upi' && (
                            <Typography>Discount (5%): -${discount.toFixed(2)}</Typography>
                        )}
                        <Typography variant="h6">Total: ${total.toFixed(2)}</Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {successMsg && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            {successMsg}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 3, py: 1.5 }}
                    >
                        Place Order
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default Checkout;
