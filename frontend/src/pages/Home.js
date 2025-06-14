import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Slider, 
    FormGroup, 
    FormControlLabel, 
    Checkbox,
    Button,
    Divider,
    Popover,
    Paper,
    Stack,
    Container,
    useTheme,
    useMediaQuery
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import TuneIcon from '@mui/icons-material/Tune';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ProductList from '../components/product/ProductList';
import { productService } from '../services/productService';
import { useSearchParams } from 'react-router-dom';

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const Home = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    
    // Filter states
    const [selectedCategories, setSelectedCategories] = useState({
        men: false,
        women: false,
    });
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [tempPriceRange, setTempPriceRange] = useState([0, 1000]);
    const [tempSelectedCategories, setTempSelectedCategories] = useState({
        men: false,
        women: false,
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const q = searchParams.get('search') || '';
                const data = await productService.getAllProducts(q);
                // Find max price for slider
                const max = Math.max(...data.map(p => p.price), 1000);
                setMaxPrice(Math.ceil(max / 100) * 100);
                setPriceRange([0, Math.ceil(max / 100) * 100]);
                const shuffled = shuffleArray(data);
                setProducts(shuffled);
                setFilteredProducts(shuffled);
            } catch (err) {
                setError('Failed to load products');
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchParams]);

    // Apply filters when they change
    useEffect(() => {
        let result = [...products];
        
        // Apply category filter
        const activeCategories = Object.entries(selectedCategories)
            .filter(([_, isSelected]) => isSelected)
            .map(([category]) => category);
            
        if (activeCategories.length > 0) {
            result = result.filter(product => 
                activeCategories.includes(product.category)
            );
        }

        // Apply price range filter
        result = result.filter(product => 
            product.price >= priceRange[0] && product.price <= priceRange[1]
        );

        setFilteredProducts(result);
    }, [selectedCategories, priceRange, products]);

    const handleCategoryChange = (event) => {
        setTempSelectedCategories({
            ...tempSelectedCategories,
            [event.target.name]: event.target.checked,
        });
    };

    const handlePriceChange = (event, newValue) => {
        setTempPriceRange(newValue);
    };

    const applyFilters = () => {
        setSelectedCategories({...tempSelectedCategories});
        setPriceRange([...tempPriceRange]);
    };

    const resetFilters = () => {
        setTempSelectedCategories({
            men: false,
            women: false,
        });
        setTempPriceRange([0, maxPrice]);
        setSelectedCategories({
            men: false,
            women: false,
        });
        setPriceRange([0, maxPrice]);
    }; 
    
    const handleFilterClick = (event) => {
        setAnchorEl(event.currentTarget);
        // Reset temp filters to current applied filters when opening
        setTempSelectedCategories({...selectedCategories});
        setTempPriceRange([...priceRange]);
    };

    const handleFilterClose = () => {
        setAnchorEl(null);
    }; 

    const filterContent = (
        <Paper sx={{ p: 2, width: 300, maxHeight: '80vh', overflowY: 'auto' }}>
            <Typography variant="h6" gutterBottom>Filters</Typography>
            
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Categories
                </Typography>
                <FormGroup>
                    <FormControlLabel 
                        control={
                            <Checkbox 
                                size="small"
                                checked={tempSelectedCategories.men}
                                onChange={handleCategoryChange}
                                name="men"
                            />
                        } 
                        label="Men" 
                    />
                    <FormControlLabel 
                        control={
                            <Checkbox 
                                size="small"
                                checked={tempSelectedCategories.women}
                                onChange={handleCategoryChange}
                                name="women"
                            />
                        } 
                        label="Women" 
                    />
                </FormGroup>
            </Box>
            
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Price Range
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    ${tempPriceRange[0]} - ${tempPriceRange[1]}
                </Typography>
                <Slider
                    value={tempPriceRange}
                    onChange={handlePriceChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={maxPrice}
                    step={10}
                    size="small"
                    valueLabelFormat={(value) => `$${value}`}
                />
            </Box>

            <Stack direction="row" spacing={1} sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button 
                    variant="outlined" 
                    onClick={() => {
                        resetFilters();
                        handleFilterClose();
                    }}
                    size="small"
                    fullWidth
                >
                    Reset
                </Button>
                <Button 
                    variant="contained" 
                    onClick={() => {
                        applyFilters();
                        handleFilterClose();
                    }}
                    size="small"
                    fullWidth
                >
                    Apply
                </Button>
            </Stack>
        </Paper>
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <Typography>Loading products...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* Hero Section */}
            <Box 
                sx={{
                    position: 'relative',
                    height: isMobile ? '70vh' : '90vh',
                    backgroundImage: 'url(/images/cover.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    textAlign: 'center',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    },
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography 
                        variant={isMobile ? 'h3' : 'h1'} 
                        component="h1" 
                        sx={{
                            fontWeight: 300,
                            letterSpacing: '0.1em',
                            mb: 3,
                            textTransform: 'uppercase',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                        }}
                    >
                        TAUTY FASHION
                    </Typography>
                    <Typography 
                        variant={isMobile ? 'h6' : 'h5'} 
                        sx={{
                            maxWidth: '800px',
                            mx: 'auto',
                            mb: 4,
                            fontWeight: 300,
                            letterSpacing: '0.05em',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                        }}
                    >
                        Discover the latest trends in fashion. Elevate your style with our premium collection.
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            color: 'text.primary',
                            px: 4,
                            py: 1.5,
                            borderRadius: 0,
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 1)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            },
                            transition: 'all 0.3s ease',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            fontSize: '0.9rem',
                        }}
                        onClick={() => {
                            const productsSection = document.getElementById('products-section');
                            if (productsSection) {
                                productsSection.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    >
                        Shop Now
                    </Button>
                </Container>
            </Box>

            {/* Products Section */}
            <Container id="products-section" maxWidth="xl" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 300, letterSpacing: '0.1em' }}>
                        {searchParams.get('search') 
                            ? `Search Results for "${searchParams.get('search')}"` 
                            : 'Featured Collections'}
                    </Typography>
                    <Button 
                        variant="outlined" 
                        startIcon={<TuneIcon />}
                        onClick={handleFilterClick}
                        sx={{ ml: 'auto' }}
                    >
                        Filters
                    </Button>
                </Box>

                <Popover
                    id="filter-popover"
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleFilterClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    {filterContent}
                </Popover>

                {error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <ProductList products={filteredProducts} loading={loading} />
                )}
            </Container>
        </Box>
    );
};

export default Home;
