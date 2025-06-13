import React, { useState, useEffect } from 'react';
import { 
    Container,
    Box,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Card,
    CardContent,
    CardMedia,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    Divider,
    useTheme,
    useMediaQuery,
    Tabs,
    Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CircularProgress } from '@mui/material';
import { config } from '../services/config';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { Link as RouterLink } from 'react-router-dom';

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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

    return (
        <Box sx={{ 
            mt: 4, 
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
        }}>
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>Order Statistics</Typography>
            <Grid container spacing={3} justifyContent="center">
                {/* Pie Chart */}
                <Grid item xs={12} md={6} sx={{ maxWidth: 600 }}>
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            p: 2, 
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                        <Typography variant="h6" align="center" gutterBottom>
                            Order Status Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => 
                                        `${name}: ${(percent * 100).toFixed(0)}%`
                                    }
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Bar Chart */}
                <Grid item xs={12} md={6} sx={{ maxWidth: 600 }}>
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            p: 2, 
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                        <Typography variant="h6" align="center" gutterBottom>
                            Orders by Status
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [value, 'Number of Orders']} />
                                <Legend />
                                <Bar dataKey="orders" fill="#8884d8" name="Orders" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

const DEFAULT_IMAGE = 'https://via.placeholder.com/400x600/f5f5f5/666666?text=No+Image';

// Common image dimensions
const ADMIN_IMAGE_HEIGHT = 300;
const IMAGE_ASPECT_RATIO = 3/4; // 4:3 aspect ratio

const Admin = () => {
    const [orders, setOrders] = useState([]);
    const [carts, setCarts] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingCarts, setLoadingCarts] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        keywords: '',
        image: null
    });

    const fetchProducts = async () => {
        try {
            const data = await productService.getAllProducts();
            setProducts(data);
        } catch (err) {
            setError('Failed to load products');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const data = await orderService.getAllOrders();
            setOrders(data);
        } catch (err) {
            setError('Failed to fetch orders');
            console.error('Error fetching orders:', err);
        } finally {
            setLoadingOrders(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const optimizeImage = (file) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Maximum dimensions
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to JPEG with 0.8 quality
                const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(optimizedDataUrl);
            };
            img.onerror = reject;

            const reader = new FileReader();
            reader.onload = (e) => img.src = e.target.result;
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Check file type
                if (!file.type.startsWith('image/')) {
                    setError('Please select an image file');
                    return;
                }

                // Check file size (limit to 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    setError('Image size should be less than 5MB');
                    return;
                }

                // Optimize image
                const optimizedDataUrl = await optimizeImage(file);
                const base64Data = optimizedDataUrl.split(',')[1];

                setFormData(prev => ({
                    ...prev,
                    image: {
                        data: base64Data,
                        contentType: 'image/jpeg', // We're converting all images to JPEG
                        alt: prev.name || ''
                    }
                }));
                setError(null);
            } catch (error) {
                setError('Error processing the image');
                console.error('Image processing error:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.name || !formData.description || !formData.price || !formData.category) {
            setError('Please fill in all required fields');
            return;
        }

        if (!editingProduct && !formData.image?.data) {
            setError('Please select an image');
            return;
        }

        try {
            const baseData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price) || 0,
                category: formData.category,
                stock: parseInt(formData.stock, 10) || 0,
            };

            const keywordsArray = formData.keywords
                .split(',')
                .map((k) => k.trim())
                .filter(Boolean);

            const baseWithKeywords = { ...baseData, keywords: keywordsArray };

            const dataToSend = formData.image?.data
                ? {
                      ...baseWithKeywords,
                      image: {
                          data: formData.image.data,
                          contentType: formData.image.contentType,
                          alt: formData.name,
                      },
                  }
                : baseWithKeywords;

            // Validate data before sending
            if (isNaN(dataToSend.price) || dataToSend.price <= 0) {
                setError('Please enter a valid price');
                return;
            }

            if (isNaN(dataToSend.stock) || dataToSend.stock < 0) {
                setError('Please enter a valid stock quantity');
                return;
            }

            if (editingProduct) {
                await productService.updateProduct(editingProduct._id, dataToSend);
            } else {
                await productService.createProduct(dataToSend);
            }

            setFormData({
                name: '',
                description: '',
                price: '',
                category: 'men',
                stock: '0',
                keywords: '',
                image: null
            });
            setError(null);
            setEditingProduct(null);
            setOpenDialog(false);
            fetchProducts();
        } catch (err) {
            setError('Failed to save product');
            console.error('Error saving product:', err);
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productService.deleteProduct(productId);
                fetchProducts();
            } catch (err) {
                setError('Failed to delete product');
                console.error('Error deleting product:', err);
            }
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            keywords: product.keywords?.join(', '),
            image: null
        });
        setOpenDialog(true);
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 8 }}>
                {loadingOrders && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography>Loading order statistics...</Typography>
                    </Box>
                )}
                {error && (
                    <Typography color="error" sx={{ textAlign: 'center', py: 2 }}>
                        {error}
                    </Typography>
                )}
                
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: 4, 
                    mb: 8,
                    mt: 4
                }}>
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        sx={{ 
                            textAlign: 'center',
                            fontWeight: 300,
                            letterSpacing: '0.1em'
                        }}
                    >
                        ADMIN DASHBOARD
                    </Typography>
                    
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 2,
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                    }}>
                        <Button
                            variant="contained"
                            component={RouterLink}
                            to="/orders"
                            sx={{
                                minWidth: '200px',
                                py: 2,
                                letterSpacing: '0.1em',
                                fontSize: '0.9rem',
                                fontWeight: 400
                            }}
                        >
                            Manage Orders
                        </Button>
                        
                        <Button
                            variant="contained"
                            onClick={() => setOpenDialog(true)}
                            sx={{
                                minWidth: '200px',
                                py: 2,
                                letterSpacing: '0.1em',
                                fontSize: '0.9rem',
                                fontWeight: 400
                            }}
                        >
                            + Add New Product
                        </Button>
                    </Box>
                </Box>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                <Grid container spacing={4}>
                    {products.map((product) => (
                        <Grid item xs={12} sm={6} md={4} key={product._id}>
                            <Card sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                bgcolor: 'transparent',
                                transition: 'all 0.3s ease'
                            }}>
                                <Box sx={{ position: 'relative' }}>
                                    <CardMedia
                                        component="img"
                                        image={product.image?.data ? `data:${product.image.contentType};base64,${product.image.data}` : DEFAULT_IMAGE}
                                        alt={product.image?.alt || product.name}
                                        sx={{
                                            height: ADMIN_IMAGE_HEIGHT,
                                            aspectRatio: IMAGE_ASPECT_RATIO,
                                            objectFit: 'cover',
                                            objectPosition: 'center',
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: 1
                                        }}
                                    />
                                    <Box sx={{ 
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        p: 1
                                    }}>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(product._id);
                                            }}
                                            sx={{
                                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                                '&:hover': {
                                                    bgcolor: 'rgba(255, 255, 255, 1)'
                                                }
                                            }}
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <CardContent sx={{ pt: 2, pb: 1, px: 0 }}>
                                    <Box 
                                        onClick={() => handleEdit(product)}
                                        sx={{ 
                                            cursor: 'pointer',
                                            '&:hover': { opacity: 0.7 }
                                        }}
                                    >
                                        <Typography 
                                            variant="subtitle1" 
                                            sx={{ 
                                                fontWeight: 300,
                                                letterSpacing: '0.05em',
                                                mb: 1
                                            }}
                                        >
                                            {product.name}
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                color: 'text.secondary',
                                                mb: 1
                                            }}
                                        >
                                            {product.category.toUpperCase()}
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                fontWeight: 300
                                            }}
                                        >
                                            ${product.price} · {product.stock} in stock
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                fontWeight: 300
                                            }}
                                        >
                                            Keywords: {product.keywords?.join(', ') || ''}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Dialog 
                    open={openDialog} 
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 0
                        }
                    }}
                    onClose={() => {
                    setOpenDialog(false);
                    setEditingProduct(null);
                    setFormData({
                        name: '',
                        description: '',
                        price: '',
                        category: '',
                        stock: '',
                        keywords: '',
                        image: null
                    });
                }}>
                    <form onSubmit={handleSubmit}>
                        <DialogTitle sx={{ 
                            pb: 1,
                            '& .MuiTypography-root': {
                                fontWeight: 300,
                                letterSpacing: '0.1em'
                            }
                        }}>
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </DialogTitle>
                        <DialogContent sx={{ py: 4 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    name="name"
                                    label="Product Name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    fullWidth
                                />
                                <TextField
                                    name="description"
                                    label="Description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    fullWidth
                                    multiline
                                    rows={3}
                                />
                                <TextField
                                    name="price"
                                    label="Price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    fullWidth
                                />
                                <FormControl fullWidth required>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        label="Category"
                                    >
                                        <MenuItem value="men">Men</MenuItem>
                                        <MenuItem value="women">Women</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    name="stock"
                                    label="Stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    required
                                    fullWidth
                                />
                                <TextField
                                    name="keywords"
                                    label="Keywords (comma separated)"
                                    value={formData.keywords}
                                    onChange={handleInputChange}
                                    fullWidth
                                />
                                <input
                                    accept="image/*"
                                    type="file"
                                    onChange={handleImageChange}
                                    style={{ marginTop: '1rem' }}
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, py: 3 }}>
                            <Button 
                                onClick={() => {
                                setOpenDialog(false);
                                setEditingProduct(null);
                                setFormData({
                                    name: '',
                                    description: '',
                                    price: '',
                                    category: '',
                                    stock: '',
                                    keywords: '',
                                    image: null
                                });
                            }}>
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="contained"
                                sx={{
                                    px: 4,
                                    py: 1,
                                    letterSpacing: '0.1em'
                                }}
                            >
                                {editingProduct ? 'Update' : 'Add'} Product
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </Box>
        </Container>
    );
};

export default Admin;
