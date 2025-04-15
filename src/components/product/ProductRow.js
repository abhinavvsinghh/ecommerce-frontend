import React, { useState, useRef, useEffect, memo } from 'react';
import { Box, Typography, IconButton, styled } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ProductCard from './ProductCard';

const ScrollContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  overflow: 'hidden',
  position: 'relative',
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    display: 'none'
  }
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 10,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  boxShadow: theme.shadows[2]
}));

const ProductRow = memo(({ title, products, maxDisplayItems = 4 }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftNav, setShowLeftNav] = useState(false);
  const [showRightNav, setShowRightNav] = useState(false);

  useEffect(() => {
    const checkNavVisibility = () => {
      if (!scrollContainerRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftNav(scrollLeft > 0);
      setShowRightNav(scrollLeft < scrollWidth - clientWidth - 5);
    };

    const container = scrollContainerRef.current;
    if (container) {
      checkNavVisibility();
      
      container.addEventListener('scroll', checkNavVisibility);
      
      setShowRightNav(container.scrollWidth > container.clientWidth);
      
      const resizeObserver = new ResizeObserver(() => {
        checkNavVisibility();
      });
      
      resizeObserver.observe(container);
      
      return () => {
        if (container) {
          container.removeEventListener('scroll', checkNavVisibility);
          resizeObserver.disconnect();
        }
      };
    }
  }, [products]);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const cardWidth = container.clientWidth / maxDisplayItems;
      container.scrollBy({
        left: -cardWidth * Math.min(maxDisplayItems, 2),
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const cardWidth = container.clientWidth / maxDisplayItems;
      container.scrollBy({
        left: cardWidth * Math.min(maxDisplayItems, 2),
        behavior: 'smooth'
      });
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', px: 2 }}>
        {title}
      </Typography>
      
      <Box sx={{ position: 'relative' }}>
        {showLeftNav && (
          <NavigationButton 
            onClick={scrollLeft}
            aria-label="scroll left"
            sx={{ left: 5 }}
            size="large"
          >
            <ChevronLeftIcon />
          </NavigationButton>
        )}
        
        <ScrollContainer ref={scrollContainerRef} sx={{ px: 2 }}>
          {products.map((product) => (
            <Box 
              key={product.id} 
              sx={{ 
                minWidth: { xs: '80%', sm: '45%', md: `${100 / maxDisplayItems}%` },
                maxWidth: { xs: '80%', sm: '45%', md: `${100 / maxDisplayItems}%` },
                pr: 2,
                pb: 2
              }}
            >
              <ProductCard product={product} />
            </Box>
          ))}
        </ScrollContainer>
        
        {showRightNav && (
          <NavigationButton 
            onClick={scrollRight}
            aria-label="scroll right"
            sx={{ right: 5 }}
            size="large"
          >
            <ChevronRightIcon />
          </NavigationButton>
        )}
      </Box>
    </Box>
  );
});

ProductRow.displayName = 'ProductRow';

export default ProductRow;