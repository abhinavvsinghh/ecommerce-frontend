import api from './api';

const emptyCart = { items: [], itemCount: 0, subtotal: 0, totalPrice: 0 };

export const getCart = async () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    console.warn('No auth token available when fetching cart');
    return emptyCart;
  }

  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    
    // Handle auth errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('Authentication error when fetching cart');
      // Clear invalid tokens
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
    }
    
    return emptyCart;
  }
};

// Add product to cart
export const addToCart = async (productId, quantity, size, color) => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    console.warn('No auth token available when adding to cart');
    return emptyCart;
  }

  try {
    const response = await api.post('/cart/add', {
      productId,
      quantity,
      size,
      color
    });
    return response.data;
  } catch (error) {
    console.error('Error adding product to cart:', error);
    throw error;
  }
};

// Update cart item quantity
export const updateCartItem = async (productId, quantity) => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    console.warn('No auth token available when updating cart');
    return emptyCart;
  }

  try {
    const response = await api.put(`/cart/update/${productId}?quantity=${quantity}`);
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (productId) => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    console.warn('No auth token available when removing from cart');
    return emptyCart;
  }

  try {
    const response = await api.delete(`/cart/remove/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
};

// Clear cart
export const clearCart = async () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    console.warn('No auth token available when clearing cart');
    return emptyCart;
  }

  try {
    const response = await api.delete('/cart/clear');
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Apply coupon
export const applyCoupon = async (code) => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    console.warn('No auth token available when applying coupon');
    return emptyCart;
  }

  try {
    const response = await api.post(`/cart/coupon?code=${encodeURIComponent(code)}`);
    return response.data;
  } catch (error) {
    console.error('Error applying coupon:', error);
    throw error;
  }
};

// Remove coupon
export const removeCoupon = async () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    console.warn('No auth token available when removing coupon');
    return emptyCart;
  }

  try {
    const response = await api.delete('/cart/coupon');
    return response.data;
  } catch (error) {
    console.error('Error removing coupon:', error);
    throw error;
  }
};