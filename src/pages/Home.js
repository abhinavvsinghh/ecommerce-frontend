import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, CircularProgress, Skeleton } from '@mui/material';
import { getProductsOnSale, getProductsByCategory } from '../services/productService';
import { getAllCategories } from '../services/categoryService';
import ProductRow from '../components/product/ProductRow';

const Home = () => {
  const [saleProducts, setSaleProducts] = useState([]);
  const [womenProducts, setWomenProducts] = useState([]);
  const [menProducts, setMenProducts] = useState([]);
  const [loading, setLoading] = useState({
    sale: true,
    women: true,
    men: true
  });
  const [error, setError] = useState(null);

  const fetchSaleProducts = useCallback(async () => {
    try {
      const saleProductsData = await getProductsOnSale();
      setSaleProducts(saleProductsData);
      setLoading(prev => ({ ...prev, sale: false }));
    } catch (error) {
      console.error('Error fetching sale products:', error);
      setError('Failed to load products on sale.');
      setLoading(prev => ({ ...prev, sale: false }));
    }
  }, []);

  const fetchCategoryProducts = useCallback(async (categoryId, gender) => {
    try {
      const productsData = await getProductsByCategory(categoryId);
      const limitedProducts = productsData.slice(0, 10);
      
      if (gender === 'women') {
        setWomenProducts(limitedProducts);
        setLoading(prev => ({ ...prev, women: false }));
      } else if (gender === 'men') {
        setMenProducts(limitedProducts);
        setLoading(prev => ({ ...prev, men: false }));
      }
    } catch (error) {
      console.error(`Error fetching ${gender} products:`, error);
      setError(`Failed to load ${gender}'s products.`);
      setLoading(prev => ({ ...prev, [gender]: false }));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {

        fetchSaleProducts();

        const categoriesData = await getAllCategories();

        const womenCategory = categoriesData.find(cat => cat.name === 'Women');
        const menCategory = categoriesData.find(cat => cat.name === 'Men');
        
        if (womenCategory) {
          fetchCategoryProducts(womenCategory.id, 'women');
        } else {
          setLoading(prev => ({ ...prev, women: false }));
        }
        
        if (menCategory) {
          fetchCategoryProducts(menCategory.id, 'men');
        } else {
          setLoading(prev => ({ ...prev, men: false }));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories.');
        setLoading({ sale: false, women: false, men: false });
      }
    };

    fetchData();
  }, [fetchSaleProducts, fetchCategoryProducts]);

  const renderProductRow = (title, products, isLoading) => {
    if (isLoading) {
      return (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', px: 2 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', overflow: 'hidden' }}>
            {[1, 2, 3, 4].map((item) => (
              <Box 
                key={item} 
                sx={{ 
                  minWidth: { xs: '80%', sm: '45%', md: '25%' },
                  pr: 2,
                  pb: 2
                }}
              >
                <Skeleton variant="rectangular" height={200} />
                <Skeleton variant="text" height={30} sx={{ mt: 1 }} />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="rectangular" height={40} sx={{ mt: 1 }} />
              </Box>
            ))}
          </Box>
        </Box>
      );
    }
    
    return products && products.length > 0 ? (
      <ProductRow title={title} products={products} />
    ) : null;
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="xl">
        {error && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="error">{error}</Typography>
          </Box>
        )}
        
        <Box>
          {renderProductRow("On Sale", saleProducts, loading.sale)}
          {renderProductRow("Women's Collection", womenProducts, loading.women)}
          {renderProductRow("Men's Collection", menProducts, loading.men)}
        </Box>
      </Container>
    </Box>
  );
};

export default Home;