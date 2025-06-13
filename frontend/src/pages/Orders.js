import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Select,
    MenuItem,
    Button,
    FormControl,
    InputLabel,
} from '@mui/material';
import { orderService } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useLocation } from 'react-router-dom';

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const Orders = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [openSnack, setOpenSnack] = useState(Boolean(location.state?.success));
    const successMessage = location.state?.success || '';

    const fetchOrders = async () => {
        try {
            setLoading(true);
            let data = user.isAdmin
                ? await orderService.getAllOrders()
                : await orderService.getMyOrders();
            if (user.isAdmin) {
                data = data.filter((o) => o.status !== 'cancelled');
                if (paymentFilter !== 'all') {
                    data = data.filter((o) => o.paymentMethod === paymentFilter);
                }
            }
            setOrders(data);
        } catch (err) {
            setError('Failed to load orders');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentFilter]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await orderService.updateStatus(orderId, newStatus);
            fetchOrders();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const handleSnackClose = () => {
        setOpenSnack(false);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography color="error" mt={4}>
                    {error}
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                {user.isAdmin ? 'All Orders' : 'My Orders'}
            </Typography>
            {user.isAdmin && (
                <FormControl sx={{ mb: 2, minWidth: 200 }} size="small">
                    <InputLabel id="payment-filter-label">Payment Method</InputLabel>
                    <Select
                        labelId="payment-filter-label"
                        value={paymentFilter}
                        label="Payment Method"
                        onChange={(e) => setPaymentFilter(e.target.value)}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="upi">UPI</MenuItem>
                        <MenuItem value="cod">Cash on Delivery</MenuItem>
                    </Select>
                </FormControl>
            )}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Total Amount</TableCell>
                            <TableCell>Status</TableCell>
                            {user.isAdmin && <TableCell>Payment</TableCell>}
                            {user.isAdmin && <TableCell>Address</TableCell>}
                            <TableCell>Items</TableCell>
                            {!user.isAdmin && <TableCell />}
                            {user.isAdmin && <TableCell />}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order._id}>
                                <TableCell>{order._id}</TableCell>
                                <TableCell>
                                    {new Date(order.createdAt).toLocaleString()}
                                </TableCell>
                                <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                                <TableCell>
                                    {user.isAdmin ? (
                                        <Select
                                            value={order.status}
                                            onChange={(e) =>
                                                handleStatusChange(order._id, e.target.value)
                                            }
                                            disabled={order.paymentMethod === 'upi' && order.paymentStatus === 'pending'}
                                        >
                                            {statusOptions.map((status) => (
                                                <MenuItem key={status} value={status}>
                                                    {status}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    ) : (
                                        order.paymentMethod === 'upi' && order.paymentStatus === 'pending'
                                            ? 'Awaiting Payment Confirmation'
                                            : order.status
                                    )}
                                </TableCell>
                                {user.isAdmin && (
                                    <TableCell>
                                        {order.paymentMethod.toUpperCase()} {order.paymentMethod === 'upi' && `- ${order.transactionId || 'N/A'}`}
                                    </TableCell>
                                )}
                                {user.isAdmin && (
                                    <TableCell>
                                        {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                                    </TableCell>
                                )}
                                <TableCell>
                                    {order.items.map((item, idx) => (
                                        <span key={item.product._id}>
                                            <Link component={RouterLink} to={`/product/${item.product._id}`} underline="hover">
                                                {item.product.name}
                                            </Link>
                                            &nbsp;x{item.quantity}
                                            {idx < order.items.length - 1 && ', '}
                                        </span>
                                    ))}
                                </TableCell>
                                {!user.isAdmin && (
                                    <TableCell>
                                        {['pending', 'processing'].includes(order.status) && (
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => orderService.cancelOrder(order._id).then(fetchOrders)}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </TableCell>
                                )}
                                {user.isAdmin && (
                                    <TableCell>
                                        {order.paymentMethod === 'upi' && order.paymentStatus === 'pending' && (
                                            <Button size="small" onClick={() => orderService.confirmPayment(order._id).then(fetchOrders)}>Confirm Payment</Button>
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleSnackClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <MuiAlert onClose={handleSnackClose} severity="success" sx={{ width: '100%' }} elevation={6} variant="filled">
                    {successMessage}
                </MuiAlert>
            </Snackbar>
        </Container>
    );
};

export default Orders;
