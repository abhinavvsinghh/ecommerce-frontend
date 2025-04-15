import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Slider,
  Button,
  Pagination,
} from '@mui/material';
import { advancedSearch } from '../services/productService';
import ProductCard from '../components/product/ProductCard';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  
  const [searchResults, setSearchResults] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Advanced search parameters
  const [searchCriteria, setSearchCriteria] = useState({
    keyword: keyword,
    categoryId: categoryParam,
    minPrice: null,
    maxPrice: null,
    page: 0,
    size: 24,
    fuzzySearch: true
  });
  
  useEffect(() => {
    setSearchCriteria(prev => ({
      ...prev,
      keyword: keyword,
      categoryId: categoryParam,
      page: 0
    }));
  }, [keyword, categoryParam]);
  
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchCriteria.keyword.trim() && 
          !searchCriteria.categoryId &&
          !searchCriteria.minPrice && 
          !searchCriteria.maxPrice) {
        setSearchResults([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Use advanced search
        const results = await advancedSearch(searchCriteria);
        setSearchResults(results.products);
        setTotalItems(results.totalItems);
        setTotalPages(results.totalPages);
        setCurrentPage(results.currentPage);
        setError(null);
      } catch (error) {
        console.error('Error searching products:', error);
        setError('Failed to search products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [searchCriteria]);
  
  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };
  
  const handlePriceRangeChangeCommitted = (event, newValue) => {
    setSearchCriteria(prev => ({
      ...prev,
      minPrice: newValue[0] > 0 ? newValue[0] : null,
      maxPrice: newValue[1] < 1000 ? newValue[1] : null,
      page: 0
    }));
  };
  
  const handlePageChange = (event, value) => {
    setSearchCriteria(prev => ({
      ...prev,
      page: value - 1
    }));
    window.scrollTo(0, 0);
  };
  
  const resetFilters = () => {
    setPriceRange([0, 1000]);
    setSearchCriteria(prev => ({
      ...prev,
      minPrice: null,
      maxPrice: null,
      page: 0
    }));
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {searchCriteria.keyword ? `Results for "${searchCriteria.keyword}"` : categoryParam === 'men' ? "Men's Collection" : categoryParam === 'women' ? "Women's Collection" : 'All Products'}
      </Typography>
      
      <Divider sx={{ mb: 4 }} />
      
      <Grid container spacing={4}>
        {/* Price filter sidebar */}
        <Grid item xs={12} md={3}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>Price Range</Typography>
            <Slider
              value={priceRange}
              onChange={handlePriceRangeChange}
              onChangeCommitted={handlePriceRangeChangeCommitted}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
              sx={{ mt: 2, width: '90%', mx: 'auto' }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2">${priceRange[0]}</Typography>
              <Typography variant="body2">${priceRange[1]}</Typography>
            </Box>
          </Box>
          
          <Button 
            variant="outlined" 
            color="secondary" 
            fullWidth 
            onClick={resetFilters}
            sx={{ mt: 2 }}
          >
            Reset Price Filter
          </Button>
        </Grid>
        
        {/* Product results */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 4 }}>
              {error}
            </Alert>
          ) : searchResults.length === 0 ? (
            <Box sx={{ py: 4 }}>
              <Alert severity="info">
                {searchCriteria.keyword.trim() || 
                 searchCriteria.categoryId ||
                 searchCriteria.minPrice || searchCriteria.maxPrice
                  ? 'No products found matching your search criteria'
                  : 'Please enter a search term or set a price range to find products'
                }
              </Alert>
            </Box>
          ) : (
            <>
              <Grid container spacing={2}>
                {searchResults.map((product) => (
                  <Grid item key={product.id} xs={12} sm={6} md={4}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination 
                    count={totalPages} 
                    page={currentPage + 1}
                    onChange={handlePageChange}
                    color="primary" 
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default SearchResults;