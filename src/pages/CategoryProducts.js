import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Pagination,
} from '@mui/material';
import { getProductsByCategory } from '../services/productService';
import { getAllCategories, getCategoryById } from '../services/categoryService';
import ProductCard from '../components/product/ProductCard';

const CategoryProducts = () => {
  const { id } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const gender = searchParams.get('category');
  
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 12;
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (id) {
          // Fetch products for specific category
          const [productsData, categoryData] = await Promise.all([
            getProductsByCategory(id),
            getCategoryById(id)
          ]);
          
          setProducts(productsData);
          setCategoryName(categoryData.name);
        } else if (gender) {
          // For Men/Women top-level categories, we need to find their category ID first
          const topLevelCategories = await getAllCategories();
          const genderCategory = topLevelCategories.find(cat => 
            cat.name.toLowerCase() === gender.toLowerCase() || 
            cat.gender === gender.toLowerCase()
          );
          
          if (genderCategory) {
            const productsData = await getProductsByCategory(genderCategory.id);
            setProducts(productsData);
            setCategoryName(genderCategory.name + "'s Collection");
          } else {
            setError('Category not found');
          }
        } else {
          setError('Category not specified');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, gender]);
  
  // Calculate pagination
  useEffect(() => {
    setTotalPages(Math.ceil(products.length / productsPerPage));
  }, [products]);
  
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  // Get current page products
  const indexOfLastProduct = page * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {categoryName}
      </Typography>
      
      <Divider sx={{ mb: 4 }} />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : products.length === 0 ? (
        <Box sx={{ py: 4 }}>
          <Alert severity="info">
            No products found in this category
          </Alert>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1">
              {products.length} product{products.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {currentProducts.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page}
                onChange={handlePageChange}
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default CategoryProducts;