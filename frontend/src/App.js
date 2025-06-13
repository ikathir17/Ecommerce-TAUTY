import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NAVBAR_HEIGHT } from './styles/constants';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import ProtectedRoute from './components/ProtectedRoute';
import { SnackbarProvider } from 'notistack';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
      light: '#333333',
      dark: '#000000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#757575',
      light: '#9E9E9E',
      dark: '#616161',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#757575',
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#D32F2F',
    },
    warning: {
      main: '#FFC107',
    },
    info: {
      main: '#2196F3',
    },
  },
  typography: {
    fontFamily: '"Neue Helvetica", "Helvetica Neue", Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 300,
      letterSpacing: '0.05em',
    },
    h2: {
      fontWeight: 300,
      letterSpacing: '0.05em',
    },
    h3: {
      fontWeight: 300,
      letterSpacing: '0.05em',
    },
    h4: {
      fontWeight: 300,
      letterSpacing: '0.05em',
    },
    h5: {
      fontWeight: 300,
      letterSpacing: '0.05em',
    },
    h6: {
      fontWeight: 300,
      letterSpacing: '0.05em',
    },
    button: {
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      fontWeight: 400,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '12px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderWidth: '1px',
          '&:hover': {
            borderWidth: '1px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          border: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Router>
              <Navbar />
              <Box sx={{ mt: `${NAVBAR_HEIGHT}px` }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin" element={
                    <ProtectedRoute adminOnly>
                      <Admin />
                    </ProtectedRoute>
                  } />
                  <Route path="/:category" element={<CategoryPage />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  {/* Add more routes as we create the components */}
                </Routes>
              </Box>
            </Router>
          </SnackbarProvider>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
