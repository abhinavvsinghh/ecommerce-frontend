import api from './api';

// Get all products
export const getAllProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get product by ID
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
};

// Get products by category (including all subcategories)
export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    throw error;
  }
};

// Basic search products - used for search suggestions
export const searchProducts = async (keyword) => {
  try {
    const response = await api.get(`/products/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  } catch (error) {
    console.error(`Error searching products with keyword ${keyword}:`, error);
    throw error;
  }
};

// Advanced search with optimized performance
export const advancedSearch = async (criteria) => {
  try {
    // Use POST for more complex search criteria
    const response = await api.post('/products/search/advanced', criteria);
    return response.data;
  } catch (error) {
    console.error('Error performing advanced search:', error);
    throw error;
  }
};

// Advanced search with GET - useful for simple URL-based searches
export const advancedSearchGet = async (params) => {
  try {
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    const response = await api.get(`/products/search/advanced?${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Error performing GET advanced search:', error);
    throw error;
  }
};

// Get products on sale - with optimized caching
let cachedSaleProducts = null;
let lastSaleFetch = 0;
const CACHE_TTL = 60000; // 1 minute cache

export const getProductsOnSale = async () => {
  try {
    const now = Date.now();
    if (cachedSaleProducts && now - lastSaleFetch < CACHE_TTL) {
      return cachedSaleProducts;
    }
    
    const response = await api.get('/products/sale');
    cachedSaleProducts = response.data;
    lastSaleFetch = now;
    return response.data;
  } catch (error) {
    console.error('Error fetching products on sale:', error);
    throw error;
  }
};

// Get products by brand
export const getProductsByBrand = async (brand) => {
  try {
    const response = await api.get(`/products/brand/${encodeURIComponent(brand)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for brand ${brand}:`, error);
    throw error;
  }
};

// Get products by color
export const getProductsByColor = async (color) => {
  try {
    const response = await api.get(`/products/color/${encodeURIComponent(color)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for color ${color}:`, error);
    throw error;
  }
};

// Add review to a product
export const addReview = async (productId, reviewData) => {
  try {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};