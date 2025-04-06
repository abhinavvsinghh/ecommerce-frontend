import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { GuestCartProvider } from "./context/GuestCartContext";

// Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProductDetails from './pages/ProductDetails';
import SearchResults from './pages/SearchResults';
import CategoryProducts from './pages/CategoryProducts';
import Cart from './pages/Cart';
import NotFound from './pages/NotFound';

// Utils
import { configureAmplify } from "./utils/awsConfig";

// Configure AWS Amplify
configureAmplify();

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#f50057",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
});

function App() {
  return (
    <GoogleOAuthProvider clientId="801274668963-uefqmitf38i6lbqrgjgjvrret84l9kmo.apps.googleusercontent.com">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <GuestCartProvider>
                <div className="app">
                  <Header />
                  <main style={{ minHeight: 'calc(100vh - 170px)' }}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/products/:id" element={<ProductDetails />} />
                      <Route path="/search" element={<SearchResults />} />
                      <Route path="/products/category/:id" element={<CategoryProducts />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
                <ToastContainer position="bottom-right" />
              </GuestCartProvider>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;