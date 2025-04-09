import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  CircularProgress,
  Chip,
  Divider,
  TextField,
  MenuItem,
  Alert,
  Card,
  CardMedia,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { getProductById } from '../services/productService';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import LoginDialog from '../components/cart/LoginDialog';

const ThumbnailImage = styled(CardMedia)(({ theme, selected }) => ({
  height: 80,
  cursor: 'pointer',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  borderRadius: theme.shape.borderRadius,
  margin: '0 8px 8px 0',
  transition: 'all 0.3s ease',
}));

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticated } = useAuth();
  const { 
    addToCart, 
    loginDialogOpen, 
    closeLoginDialog, 
    continueAsGuest,
    pendingProduct,
    guestModeChosen
  } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProductById(id);
        setProduct(productData);
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  const handleSizeChange = (event) => {
    setSelectedSize(event.target.value);
  };
  
  const handleQuantityChange = (event) => {
    setQuantity(Math.max(1, parseInt(event.target.value) || 1));
  };
  
  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      
      // Add to cart with product, quantity, size, color
      const result = await addToCart(
        product.id, 
        quantity, 
        selectedSize, 
        product.color,
        product
      );
      
      // Navigate to cart if product was successfully added
      // This happens if user is authenticated or has chosen guest mode before
      if (result && (authenticated || guestModeChosen)) {
        setTimeout(() => {
          navigate('/cart');
        }, 300);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };
  
  const handleDialogAction = (action) => {
    continueAsGuest(action);
    
    // If user chose guest mode, navigate to cart after adding product
    if (action === 'guest') {
      setTimeout(() => navigate('/cart'), 300);
    }
    // If user chose login, they'll be redirected to login page automatically
  };
  
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  if (!product) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="info">Product not found</Alert>
      </Container>
    );
  }
  
  const {
    name,
    description,
    price,
    brand,
    color,
    sizes,
    images,
    inStock,
    onSale,
    finalPrice,
    discountPercentage,
    categoryName,
  } = product;
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Box>
            <Card sx={{ mb: 2 }}>
              <CardMedia
                component="img"
                image={images && images.length > selectedImage ? images[selectedImage] : 'https://via.placeholder.com/500x500?text=No+Image'}
                alt={name}
                sx={{ height: 500, objectFit: 'contain' }}
              />
            </Card>
            
            {/* Thumbnails */}
            {images && images.length > 1 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {images.map((image, index) => (
                  <ThumbnailImage
                    key={index}
                    component="img"
                    image={image}
                    alt={`${name} - ${index + 1}`}
                    selected={selectedImage === index}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Grid>
        
        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {onSale ? (
                <>
                  <Typography variant="h5" color="text.primary" fontWeight="bold">
                    ${finalPrice}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ textDecoration: 'line-through', ml: 2 }}
                  >
                    ${price}
                  </Typography>
                  <Chip
                    label={`${discountPercentage}% OFF`}
                    color="error"
                    size="small"
                    sx={{ ml: 2, fontWeight: 'bold' }}
                  />
                </>
              ) : (
                <Typography variant="h5" color="text.primary" fontWeight="bold">
                  ${price}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Chip
                label={inStock ? 'In Stock' : 'Out of Stock'}
                color={inStock ? 'success' : 'error'}
                sx={{ mr: 1 }}
              />
              {categoryName && (
                <Chip
                  label={categoryName}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1" paragraph>
              {description}
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Brand:
                </Typography>
                <Typography variant="body1">{brand}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Color:
                </Typography>
                <Typography variant="body1">{color}</Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Size Selection */}
            {sizes && sizes.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Select Size:
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={selectedSize}
                  onChange={handleSizeChange}
                  disabled={!inStock}
                >
                  {sizes.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            )}
            
            {/* Quantity Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Quantity:
              </Typography>
              <TextField
                type="number"
                InputProps={{ inputProps: { min: 1 } }}
                value={quantity}
                onChange={handleQuantityChange}
                disabled={!inStock}
                sx={{ width: 100 }}
              />
            </Box>
            
            {/* Add to Cart Button */}
            <Button
              variant="contained"
              size="large"
              startIcon={<AddShoppingCartIcon />}
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
              fullWidth
              sx={{ py: 1.5 }}
            >
              {addingToCart ? <CircularProgress size={24} color="inherit" /> : 'Add to Cart'}
            </Button>
            
            {!inStock && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This product is currently out of stock.
              </Alert>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Login Dialog */}
      <LoginDialog
        open={loginDialogOpen}
        onClose={closeLoginDialog}
        onContinueAsGuest={handleDialogAction}
        product={pendingProduct}
      />
    </Container>
  );
};

export default ProductDetails;