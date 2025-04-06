import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../services/cartService';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchCount, setFetchCount] = useState(0);
  const { authenticated, authChecked } = useContext(AuthContext);

  // Only fetch when authentication changes - with strict rate limiting
  useEffect(() => {
    // Only fetch when authenticated and auth check completed
    if (authenticated && authChecked && fetchCount < 2) {
      // Set loading state directly for better UX
      setLoading(true);
      
      // Use a timeout to prevent rapid sequential requests
      const timer = setTimeout(() => {
        // Simple fetch with basic error handling
        const fetchSingleCart = async () => {
          try {
            const response = await getCart();
            setCart(response);
          } catch (err) {
            console.error("Cart fetch error:", err);
          } finally {
            setLoading(false);
            setFetchCount(prev => prev + 1);
          }
        };
        
        fetchSingleCart();
      }, 300);
      
      return () => clearTimeout(timer);
    } else if (!authenticated && authChecked) {
      // Clear cart state if not authenticated
      setCart(null);
      setFetchCount(0);
    }
  }, [authenticated, authChecked]);

  // Simplified cart operations
  const addItemToCart = async (productId, quantity, size, color) => {
    if (!authenticated) return false;
    
    try {
      setLoading(true);
      const updatedCart = await addToCart(productId, quantity, size, color);
      setCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Failed to add item to cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (productId, quantity) => {
    if (!authenticated) return false;
    
    try {
      setLoading(true);
      const updatedCart = await updateCartItem(productId, quantity);
      setCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast.error('Failed to update cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    if (!authenticated) return false;
    
    try {
      setLoading(true);
      const updatedCart = await removeFromCart(productId);
      setCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const emptyCart = async () => {
    if (!authenticated) return false;
    
    try {
      setLoading(true);
      await clearCart();
      setCart(null);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Force a fresh cart fetch - with rate limiting
  const refreshCart = () => {
    if (fetchCount < 3) {
      setFetchCount(prev => prev + 1);
      setLoading(true);
      
      getCart()
        .then(response => {
          setCart(response);
        })
        .catch(err => {
          console.error("Refresh cart error:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const value = {
    cart,
    loading,
    addItemToCart,
    updateItem,
    removeItem,
    emptyCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};