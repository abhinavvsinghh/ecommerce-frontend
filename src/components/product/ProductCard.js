import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Button, Box, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  '& img': {
    transition: 'transform 0.3s ease',
  },
  '&:hover img': {
    transform: 'scale(1.05)',
  },
}));

const ProductCard = memo(({ product }) => {
  const navigate = useNavigate();
  
  const { id, name, price, images, inStock, onSale, finalPrice, discountPercentage } = product;
  
  const handleViewDetails = () => {
    navigate(`/products/${id}`);
  };
  
  const displayImage = images && images.length > 0
    ? images[0]
    : 'https://via.placeholder.com/300x200?text=No+Image+Available';
  
  const formattedPrice = typeof price === 'number' ? price.toFixed(2) : price;
  const formattedFinalPrice = typeof finalPrice === 'number' ? finalPrice.toFixed(2) : finalPrice;
  
  return (
    <StyledCard>
      <ImageContainer>
        <CardMedia
          component="img"
          height="200"
          image={displayImage}
          alt={name}
          loading="lazy"
        />
        {onSale && (
          <Chip
            label={`${discountPercentage}% OFF`}
            color="error"
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              fontWeight: 'bold',
            }}
          />
        )}
        {!inStock && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
            <Typography variant="h6" color="white" fontWeight="bold">
              Out of Stock
            </Typography>
          </Box>
        )}
      </ImageContainer>
      
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          gutterBottom 
          variant="h6" 
          component="div" 
          noWrap 
          title={name}
          sx={{ fontWeight: 500 }}
        >
          {name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {onSale ? (
            <>
              <Typography variant="h6" color="text.primary" fontWeight="bold">
                ${formattedFinalPrice}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'line-through', ml: 1 }}
              >
                ${formattedPrice}
              </Typography>
            </>
          ) : (
            <Typography variant="h6" color="text.primary" fontWeight="bold">
              ${formattedPrice}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleViewDetails}
            color="primary"
            disabled={!inStock}
          >
            {inStock ? 'View Details' : 'Out of Stock'}
          </Button>
        </Box>
      </CardContent>
    </StyledCard>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;