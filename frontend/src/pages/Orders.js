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
    Grid,
} from '@mui/material';
import { orderService } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Link } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useSnackbar } from 'notistack';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PIE_COLORS = ['#4285F4', '#EA4335', '#9C27B0', '#34A853', '#FBBC05'];
const BAR_COLORS = ['#A8E6CF', '#9C27B0', '#6A1B9A', '#D32F2F'];

// Order statistics component
const OrderStats = ({ orders }) => {
    // Count orders by status
    const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {});

    // Prepare data for the pie chart
    const pieData = Object.entries(statusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    }));

    // Prepare data for the bar chart
    const barData = Object.entries(statusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        orders: value
    }));

    // Sort data for consistent display
    pieData.sort((a, b) => b.value - a.value);
    barData.sort((a, b) => b.orders - a.orders);

    // Calculate container height based on content
    const chartHeight = Math.max(400, 100 + (barData.length * 50));
    const pieOuterRadius = 150;

    return (
        <Box sx={{ 
            width: '100%',
            p: { xs: 2, sm: 3 },
            mb: 4,
            overflow: 'visible',
            minHeight: 'calc(100vh - 200px)'
        }}>
            <Typography variant="h5" gutterBottom sx={{ 
                textAlign: 'center',
                mb: 4,
                fontWeight: 500,
                color: 'text.primary'
            }}>
                Order Statistics
            </Typography>
            
            <Grid container spacing={3} justifyContent="center" sx={{ width: '100%', m: 0, maxWidth: '100%' }}>
                {/* Pie Chart */}
                <Grid item xs={12} md={6} sx={{ minHeight: '500px' }}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: { xs: 1, sm: 2 },
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Typography variant="h6" align="center" gutterBottom sx={{ 
                            fontWeight: 500,
                            color: 'text.primary',
                            mb: 3,
                            px: 1
                        }}>
                            Order Status Distribution
                        </Typography>
                        <Box sx={{ 
                            width: '100%', 
                            height: chartHeight,
                            minHeight: '400px',
                            position: 'relative'
                        }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={pieOuterRadius}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => 
                                            `${name}: ${(percent * 100).toFixed(0)}%`
                                        }
                                        paddingAngle={2}
                                        minAngle={5}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={PIE_COLORS[index % PIE_COLORS.length]} 
                                                stroke="#fff"
                                                strokeWidth={1}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value) => [`${value} orders`, 'Count']}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                                        }}
                                    />
                                    <Legend 
                                        layout="horizontal"
                                        verticalAlign="bottom"
                                        height={36}
                                        wrapperStyle={{
                                            paddingTop: '20px',
                                            position: 'relative',
                                            bottom: '10px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Bar Chart */}
                <Grid item xs={12} md={6} sx={{ minHeight: '500px' }}>
                    <Paper 
                        elevation={2}
                        sx={{
                            p: { xs: 1, sm: 2 },
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Typography variant="h6" align="center" gutterBottom sx={{
                            fontWeight: 500,
                            color: 'text.primary',
                            mb: 3
                        }}>
                            Orders by Status
                        </Typography>
                        <Box sx={{ 
                            width: '100%', 
                            height: chartHeight,
                            minHeight: '400px',
                            position: 'relative'
                        }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={barData}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 50,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis 
                                    dataKey="name" 
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    tick={{ fontSize: 12, fill: 'text.secondary' }}
                                    interval={0}
                                    minTickGap={-10}
                                    tickMargin={10}
                                />
                                    <YAxis 
                                        tick={{ fontSize: 12 }}
                                        width={40}
                                    />
                                    <Tooltip 
                                        formatter={(value) => [value, 'Number of Orders']}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                                        }}
                                    />
                                    <Legend 
                                        wrapperStyle={{
                                            paddingTop: '20px'
                                        }}
                                    />
                                    <Bar 
                                        dataKey="orders" 
                                        name="Orders"
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {barData.map((entry, index) => (
                                            <Cell 
                                                key={`bar-cell-${index}`} 
                                                fill={BAR_COLORS[index % BAR_COLORS.length]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Orders = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState({});
    const [cancellingOrder, setCancellingOrder] = useState(null);
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
            setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
            await orderService.updateStatus(orderId, newStatus);
            await fetchOrders();
            enqueueSnackbar('Order status updated successfully', { variant: 'success' });
        } catch (err) {
            console.error('Error updating status:', err);
            enqueueSnackbar(
                err.response?.data?.message || 'Failed to update order status',
                { variant: 'error' }
            );
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }
        try {
            setCancellingOrder(orderId);
            await orderService.cancelOrder(orderId);
            await fetchOrders();
            enqueueSnackbar('Order cancelled successfully', { variant: 'success' });
        } catch (err) {
            console.error('Error cancelling order:', err);
            enqueueSnackbar(
                err.response?.data?.message || 'Failed to cancel order',
                { variant: 'error' }
            );
        } finally {
            setCancellingOrder(null);
        }
    };

    const handleDownloadCsv = () => {
        const headers = [
            'Order ID',
            'Customer Name',
            'Customer Email',
            'Order Date',
            'Total Amount',
            'Status',
            'Payment Method',
            'Transaction ID',
            'Payment Status',
            'Shipping Full Name',
            'Shipping Phone',
            'Shipping Alt Phone',
            'Shipping Address Line 1',
            'Shipping Address Line 2',
            'Shipping Landmark',
            'Shipping City',
            'Shipping State',
            'Shipping Postal Code',
            'Shipping Country',
            'Shipping Address Type',
            'Shipping Delivery Instructions',
            'Products'
        ];

        const rows = orders.map(order => {
            const productsString = order.items.map(item => 
                `${item.product.name} (x${item.quantity})`
            ).join('; ');

            return [
                `"${order._id}"`,
                `"${order.shippingAddress.fullName || 'N/A'}"`,
                `"${order.user?.email || 'N/A'}"`,
                `"${new Date(order.createdAt).toLocaleString()}"`,
                `"${order.totalAmount.toFixed(2)}"`,
                `"${order.status}"`,
                `"${order.paymentMethod.toUpperCase()}"`,
                `"${order.transactionId || 'N/A'}"`,
                `"${order.paymentStatus || 'N/A'}"`,
                `"${order.shippingAddress.fullName || 'N/A'}"`,
                `"${order.shippingAddress.phone || 'N/A'}"`,
                `"${order.shippingAddress.altPhone || 'N/A'}"`,
                `"${order.shippingAddress.addressLine1 || 'N/A'}"`,
                `"${order.shippingAddress.addressLine2 || ''}"`,
                `"${order.shippingAddress.landmark || ''}"`,
                `"${order.shippingAddress.city || 'N/A'}"`,
                `"${order.shippingAddress.state || 'N/A'}"`,
                `"${order.shippingAddress.postalCode || 'N/A'}"`,
                `"${order.shippingAddress.country || 'N/A'}"`,
                `"${order.shippingAddress.addressType ? (order.shippingAddress.addressType.charAt(0).toUpperCase() + order.shippingAddress.addressType.slice(1)) : 'N/A'}"`,
                `"${order.shippingAddress.deliveryInstructions || ''}"`,
                `"${productsString}"`
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'orders.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        enqueueSnackbar('Orders data downloaded as CSV', { variant: 'success' });
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
        <Container maxWidth={false} sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                {user.isAdmin ? 'All Orders' : 'My Orders'}
            </Typography>

            {/* Order Statistics for Admin */}
            {user.isAdmin && !loading && orders.length > 0 && (
                <OrderStats orders={orders} />
            )}

            {user.isAdmin && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 200 }} size="small">
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
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleDownloadCsv}
                        sx={{ mt: { xs: 2, sm: 0 } }} 
                    >
                        Download CSV
                    </Button>
                </Box>
            )}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Total Amount</TableCell>
                            <TableCell>Status</TableCell>
                            {user.isAdmin && <TableCell>Customer</TableCell>}
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
                                <TableCell sx={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {order._id}
                                </TableCell>
                                <TableCell>
                                    {new Date(order.createdAt).toLocaleString()}
                                </TableCell>
                                <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                                <TableCell>
                                    {user.isAdmin ? (
                                        <Select
                                            value={order.status}
                                            onChange={(e) =>
                                                handleStatusChange(order._id, e.target.value)
                                            }
                                            disabled={
                                                (order.paymentMethod === 'upi' && order.paymentStatus === 'pending') ||
                                                updatingStatus[order._id]
                                            }
                                            size="small"
                                        >
                                            {statusOptions.map((status) => (
                                                <MenuItem key={status} value={status}>
                                                    {status}
                                                </MenuItem>
                                            ))}
                                            {updatingStatus[order._id] && (
                                                <MenuItem disabled>
                                                    <CircularProgress size={20} />
                                                </MenuItem>
                                            )}
                                        </Select>
                                    ) : (
                                        order.paymentMethod === 'upi' && order.paymentStatus === 'pending'
                                            ? 'Awaiting Payment Confirmation'
                                            : order.status
                                    )}
                                </TableCell>
                                {user.isAdmin && (
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {order.shippingAddress.fullName || 'N/A'}
                                        </Typography>
                                        {order.user?.name && order.user.name !== order.shippingAddress.fullName && (
                                            <Typography variant="caption" color="textSecondary">
                                                ({order.user.name})
                                            </Typography>
                                        )}
                                        <Typography variant="caption" color="textSecondary">
                                            {order.user?.email || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                )}
                                {user.isAdmin && (
                                    <TableCell>
                                        {order.paymentMethod.toUpperCase()} {order.paymentMethod === 'upi' && `- ${order.transactionId || 'N/A'}`}
                                    </TableCell>
                                )}
                                {user.isAdmin && (
                                    <TableCell sx={{ maxWidth: '300px' }}>
                                        <div><strong>{order.shippingAddress.fullName}</strong></div>
                                        <div>{order.shippingAddress.addressLine1}</div>
                                        {order.shippingAddress.addressLine2 && (
                                            <div>{order.shippingAddress.addressLine2}</div>
                                        )}
                                        <div>
                                            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                                        </div>
                                        <div>{order.shippingAddress.country}</div>
                                        {order.shippingAddress.landmark && (
                                            <div><em>Landmark: {order.shippingAddress.landmark}</em></div>
                                        )}
                                        <div>Phone: {order.shippingAddress.phone}</div>
                                        {order.shippingAddress.altPhone && (
                                            <div>Alt. Phone: {order.shippingAddress.altPhone}</div>
                                        )}
                                        {order.shippingAddress.addressType && (
                                            <div>Address Type: {order.shippingAddress.addressType.charAt(0).toUpperCase() + order.shippingAddress.addressType.slice(1)}</div>
                                        )}
                                        {order.shippingAddress.deliveryInstructions && (
                                            <div style={{ marginTop: '8px' }}>
                                                <strong>Instructions:</strong> {order.shippingAddress.deliveryInstructions}
                                            </div>
                                        )}
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
                                                onClick={() => handleCancelOrder(order._id)}
                                                disabled={cancellingOrder === order._id}
                                                startIcon={cancellingOrder === order._id ? <CircularProgress size={20} /> : null}
                                            >
                                                {cancellingOrder === order._id ? 'Cancelling...' : 'Cancel'}
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
            <Snackbar 
                open={openSnack} 
                autoHideDuration={6000} 
                onClose={handleSnackClose} 
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <MuiAlert 
                    onClose={handleSnackClose} 
                    severity="success" 
                    sx={{ width: '100%' }} 
                    elevation={6} 
                    variant="filled"
                >
                    {successMessage}
                </MuiAlert>
            </Snackbar>
        </Container>
    );
};

export default Orders;
