import { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useGuestCart } from './useGuestCart';

export const useCart = () => {
  const { cart, loading, addItemToCart, updateItem, removeItem, emptyCart, refreshCart } = useContext(CartContext);
  const { authenticated, authChecked } = useContext(AuthContext);
  const { 
    guestCart, 
    addToGuestCart: addItemToGuestCart, 
    updateGuestCartItem, 
    removeGuestCartItem, 
    clearGuestCart 
  } = useGuestCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for login dialog
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [pendingSize, setPendingSize] = useState(null);
  const [pendingColor, setPendingColor] = useState(null);
  const [returnTo, setReturnTo] = useState(null);
  
  // Used to track if cart migration already happened
  const [migratedCart, setMigratedCart] = useState(false);

  // Merge guest cart with user cart when user logs in - with safeguards
  useEffect(() => {
    if (authenticated && authChecked && !migratedCart && guestCart && guestCart.items && guestCart.items.length > 0) {
      const migrateGuestCart = async () => {
        setMigratedCart(true); // Set to true before migration to prevent multiple attempts
        
        try {
          let successCount = 0;
          // For each item in guest cart, add to user cart
          for (const item of guestCart.items) {
            try {
              await addItemToCart(item.productId, item.quantity, item.size, item.color);
              successCount++;
            } catch (itemError) {
              console.error(`Failed to migrate item ${item.productId}:`, itemError);
            }
          }
          
          // Clear guest cart after migration
          clearGuestCart();
          
          if (successCount > 0) {
            toast.success(`${successCount} items from your guest cart have been added to your account`);
          }
        } catch (error) {
          console.error('Error migrating guest cart:', error);
          toast.error('Failed to migrate your guest cart to your account');
        }
      };
      
      migrateGuestCart();
    }
  }, [authenticated, authChecked, guestCart, migratedCart]);

  const addToCart = async (productId, quantity = 1, size, color, product) => {
    // Store current path for later redirect
    setReturnTo(location.pathname);
    
    // Check stock quantity
    if (product && product.stockQuantity < quantity) {
      toast.error(`Sorry, only ${product.stockQuantity} items available in stock`);
      return false;
    }
    
    if (authenticated) {
      try {
        const result = await addItemToCart(productId, quantity, size, color);
        if (result) {
          toast.success('Product added to cart!');
        }
        return result;
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('Failed to add item to cart');
        return false;
      }
    } else {
      // Show login dialog
      setPendingProduct(product);
      setPendingQuantity(quantity);
      setPendingSize(size);
      setPendingColor(color);
      setLoginDialogOpen(true);
      return false;
    }
  };

  const continueAsGuest = () => {
    if (pendingProduct) {
      // Check stock again
      if (pendingProduct.stockQuantity < pendingQuantity) {
        toast.error(`Sorry, only ${pendingProduct.stockQuantity} items available in stock`);
        closeLoginDialog();
        return;
      }
      
      addItemToGuestCart(pendingProduct, pendingQuantity, pendingSize, pendingColor);
      toast.success('Product added to guest cart');
      
      // Reset pending state
      setPendingProduct(null);
      setPendingQuantity(1);
      setPendingSize(null);
      setPendingColor(null);
    }
    
    closeLoginDialog();
  };

  const closeLoginDialog = () => {
    setLoginDialogOpen(false);
  };

  const updateCartItem = async (productId, quantity) => {
    const activeCart = authenticated ? cart : guestCart;
    
    // Find item to check stock
    const item = activeCart?.items?.find(item => item.productId === productId);
    if (item && item.stockQuantity && item.stockQuantity < quantity) {
      toast.error(`Sorry, only ${item.stockQuantity} items available in stock`);
      return false;
    }
    
    if (authenticated) {
      try {
        return await updateItem(productId, quantity);
      } catch (error) {
        console.error('Error updating cart:', error);
        toast.error('Failed to update cart');
        return false;
      }
    } else {
      updateGuestCartItem(productId, quantity);
      return true;
    }
  };

  const removeCartItem = async (productId) => {
    if (authenticated) {
      try {
        const result = await removeItem(productId);
        if (result) {
          toast.success('Item removed from cart');
        }
        return result;
      } catch (error) {
        console.error('Error removing item:', error);
        toast.error('Failed to remove item');
        return false;
      }
    } else {
      removeGuestCartItem(productId);
      toast.success('Item removed from cart');
      return true;
    }
  };

  const clearUserCart = async () => {
    if (authenticated) {
      try {
        const result = await emptyCart();
        if (result) {
          toast.success('Cart cleared successfully');
        }
        return result;
      } catch (error) {
        console.error('Error clearing cart:', error);
        toast.error('Failed to clear cart');
        return false;
      }
    } else {
      clearGuestCart();
      toast.success('Cart cleared successfully');
      return true;
    }
  };

  // Get the active cart based on authentication status
  const activeCart = authenticated ? cart : guestCart;

  // Calculate item count (unique items)
  const uniqueItemCount = activeCart?.items?.length || 0;

  return {
    cart: activeCart,
    loading,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart: clearUserCart,
    refreshCart,
    loginDialogOpen,
    closeLoginDialog,
    continueAsGuest,
    pendingProduct,
    isAuthenticated: authenticated,
    uniqueItemCount,
    returnTo
  };
};