import { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useGuestCart } from './useGuestCart';

// Create session-level variables to prevent multiple migrations and toasts
// These will persist during the browser session but reset on page refresh
if (typeof window !== 'undefined') {
  if (!window.__CART_MIGRATION_COMPLETED) {
    window.__CART_MIGRATION_COMPLETED = false;
  }
  if (!window.__CART_MIGRATION_TOAST_SHOWN) {
    window.__CART_MIGRATION_TOAST_SHOWN = false;
  }
  if (!window.__CART_MIGRATION_TOAST_ID) {
    window.__CART_MIGRATION_TOAST_ID = 'cart-migration-toast-' + Date.now();
  }
}

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
  
  // Prevent multiple migration attempts using refs
  const migrationAttemptedRef = useRef(false);
  const migrationCompletedRef = useRef(window.__CART_MIGRATION_COMPLETED || false);
  
  // For remembering guest mode choice - use localStorage with useRef to avoid state updates
  const guestModeChosenRef = useRef(localStorage.getItem('guestModeChosen') === 'true');
  const [guestModeChosen, setGuestModeChosen] = useState(guestModeChosenRef.current);
  
  // Storage for pending product after login - stored in sessionStorage for persistence
  const getPendingProduct = useCallback(() => {
    const pendingData = sessionStorage.getItem('pendingProductAfterLogin');
    if (pendingData) {
      try {
        return JSON.parse(pendingData);
      } catch (e) {
        return null;
      }
    }
    return null;
  }, []);
  
  const savePendingProduct = useCallback((product, quantity, size, color) => {
    if (product) {
      const pendingData = {
        product: {
          id: product.id,
          name: product.name,
          images: product.images,
          stockQuantity: product.stockQuantity
        },
        quantity,
        size,
        color,
        timestamp: Date.now()
      };
      sessionStorage.setItem('pendingProductAfterLogin', JSON.stringify(pendingData));
    }
  }, []);
  
  const clearPendingProduct = useCallback(() => {
    sessionStorage.removeItem('pendingProductAfterLogin');
  }, []);

  // Merge guest cart with user cart when user logs in - with improved safeguards
  // Add a component cleanup effect to prevent lingering state
  useEffect(() => {
    return () => {
      // Cleanup function when component unmounts
      // This helps prevent issues if the component is unmounted during migration
      migrationAttemptedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Only run this effect if:
    // 1. User is authenticated
    // 2. Auth check is completed
    // 3. We haven't attempted migration yet in this component instance
    // 4. Migration hasn't been completed in this browser session
    // 5. Guest cart has items
    if (authenticated && 
        authChecked && 
        !migrationAttemptedRef.current && 
        !migrationCompletedRef.current &&
        guestCart?.items?.length > 0) {
      
      // Mark migration as attempted for this component instance
      migrationAttemptedRef.current = true;
      
      const migrateGuestCart = async () => {
        try {
          // Mark as completed to prevent multiple migrations across components
          window.__CART_MIGRATION_COMPLETED = true;
          migrationCompletedRef.current = true;
          
          console.log("Starting cart migration...");
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
          
          // Show notification only ONCE if items were migrated successfully
          if (successCount > 0 && !window.__CART_MIGRATION_TOAST_SHOWN) {
            // Set the flag before showing toast to prevent race conditions
            window.__CART_MIGRATION_TOAST_SHOWN = true;
            
            // Use a unique toast ID to prevent duplicates
            const toastId = window.__CART_MIGRATION_TOAST_ID;
            
            // Show toast with the unique ID
            toast.success(
              `${successCount} items from your guest cart have been added to your account`, 
              {
                toastId, // Use consistent ID to prevent duplicates
                onClose: () => {
                  // After toast is closed, allow future toasts (for future logins)
                  setTimeout(() => {
                    window.__CART_MIGRATION_TOAST_SHOWN = false;
                    window.__CART_MIGRATION_TOAST_ID = 'cart-migration-toast-' + Date.now();
                  }, 5000);
                }
              }
            );
          }
          
          // Reset guest mode choice after successful login
          localStorage.removeItem('guestModeChosen');
          guestModeChosenRef.current = false;
          setGuestModeChosen(false);
        } catch (error) {
          console.error('Error migrating guest cart:', error);
        }
      };
      
      migrateGuestCart();
    }
  }, [authenticated, authChecked, guestCart]);
  
  // Handle pending product after login
  useEffect(() => {
    if (authenticated && authChecked) {
      const pendingData = getPendingProduct();
      
      if (pendingData && pendingData.product) {
        // Clear pending data right away to prevent duplicate processing
        clearPendingProduct();
        
        // Add the product to cart
        addItemToCart(
          pendingData.product.id, 
          pendingData.quantity || 1, 
          pendingData.size, 
          pendingData.color
        )
        .then(success => {
          if (success) {
            toast.success('Product added to cart!');
          }
        })
        .catch(err => console.error('Error adding pending product after login:', err));
      }
    }
  }, [authenticated, authChecked, getPendingProduct, clearPendingProduct, addItemToCart]);

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
    } else if (guestModeChosenRef.current) {
      // User has previously chosen guest mode, add directly to guest cart
      addItemToGuestCart(product, quantity, size, color);
      toast.success('Product added to guest cart');
      return true;
    } else {
      // Show login dialog only if guest mode wasn't chosen before
      setPendingProduct(product);
      setPendingQuantity(quantity);
      setPendingSize(size);
      setPendingColor(color);
      setLoginDialogOpen(true);
      return false;
    }
  };

  const continueAsGuest = (action = 'guest') => {
    if (action === 'login') {
      // Save pending product data to sessionStorage for retrieval after login
      if (pendingProduct) {
        savePendingProduct(pendingProduct, pendingQuantity, pendingSize, pendingColor);
      }
      
      // Navigate to login page
      navigate('/login', { 
        state: { 
          redirectTo: pendingProduct ? `/products/${pendingProduct.id}` : location.pathname,
          fromCart: true,
          fromProductDetails: !!pendingProduct
        } 
      });
    } else if (action === 'guest') {
      // User chose to continue as guest - store this preference
      localStorage.setItem('guestModeChosen', 'true');
      guestModeChosenRef.current = true;
      setGuestModeChosen(true);
      
      if (pendingProduct) {
        // Check stock again
        if (pendingProduct.stockQuantity < pendingQuantity) {
          toast.error(`Sorry, only ${pendingProduct.stockQuantity} items available in stock`);
          closeLoginDialog();
          return;
        }
        
        addItemToGuestCart(pendingProduct, pendingQuantity, pendingSize, pendingColor);
        toast.success('Product added to guest cart');
      }
    }
    
    closeLoginDialog();
  };

  const closeLoginDialog = () => {
    setLoginDialogOpen(false);
    
    // Clear pending state
    setPendingProduct(null);
    setPendingQuantity(1);
    setPendingSize(null);
    setPendingColor(null);
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

  // Reset all flags when user logs out
  useEffect(() => {
    if (!authenticated && authChecked) {
      // Reset all migration and toast flags when user logs out
      window.__CART_MIGRATION_COMPLETED = false;
      window.__CART_MIGRATION_TOAST_SHOWN = false;
      window.__CART_MIGRATION_TOAST_ID = 'cart-migration-toast-' + Date.now();
      migrationCompletedRef.current = false;
      migrationAttemptedRef.current = false;
    }
  }, [authenticated, authChecked]);

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
    returnTo,
    guestModeChosen
  };
};