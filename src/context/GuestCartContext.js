import React, { createContext, useState, useEffect } from 'react';

export const GuestCartContext = createContext();

export const GuestCartProvider = ({ children }) => {
  const [guestCart, setGuestCart] = useState({
    items: [],
    itemCount: 0,
    subtotal: 0,
    totalPrice: 0,
    discountAmount: 0,
    couponCode: null
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('guestCart');
    if (storedCart) {
      try {
        setGuestCart(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error parsing guest cart from localStorage:', error);
        localStorage.removeItem('guestCart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('guestCart', JSON.stringify(guestCart));
  }, [guestCart]);

  const addToGuestCart = (product, quantity = 1, size = null, color = null) => {
    setGuestCart(prevCart => {
      // Check if product already exists in cart
      const existingItemIndex = prevCart.items.findIndex(item => 
        item.productId === product.id && 
        item.size === size && 
        item.color === color
      );

      let newItems = [...prevCart.items];
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
          subtotal: calculateItemSubtotal(product, newItems[existingItemIndex].quantity + quantity)
        };
      } else {
        // Add new item
        newItems.push({
          productId: product.id,
          productName: product.name,
          image: product.images && product.images.length > 0 ? product.images[0] : null,
          price: product.onSale && product.finalPrice ? product.finalPrice : product.price,
          quantity,
          size,
          color,
          subtotal: calculateItemSubtotal(product, quantity)
        });
      }

      // Calculate totals
      const { subtotal, itemCount } = calculateCartTotals(newItems);
      
      return {
        ...prevCart,
        items: newItems,
        subtotal,
        totalPrice: subtotal - (prevCart.discountAmount || 0),
        itemCount
      };
    });
  };

  const updateGuestCartItem = (productId, quantity) => {
    setGuestCart(prevCart => {
      // Find the item to update
      const itemIndex = prevCart.items.findIndex(item => item.productId === productId);
      
      if (itemIndex === -1) return prevCart;
      
      let newItems = [...prevCart.items];
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        newItems = newItems.filter(item => item.productId !== productId);
      } else {
        // Update item quantity
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          quantity,
          subtotal: newItems[itemIndex].price * quantity
        };
      }

      // Calculate totals
      const { subtotal, itemCount } = calculateCartTotals(newItems);
      
      return {
        ...prevCart,
        items: newItems,
        subtotal,
        totalPrice: subtotal - (prevCart.discountAmount || 0),
        itemCount
      };
    });
  };

  const removeGuestCartItem = (productId) => {
    setGuestCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.productId !== productId);
      
      // Calculate totals
      const { subtotal, itemCount } = calculateCartTotals(newItems);
      
      return {
        ...prevCart,
        items: newItems,
        subtotal,
        totalPrice: subtotal - (prevCart.discountAmount || 0),
        itemCount
      };
    });
  };

  const clearGuestCart = () => {
    setGuestCart({
      items: [],
      itemCount: 0,
      subtotal: 0,
      totalPrice: 0,
      discountAmount: 0,
      couponCode: null
    });
    localStorage.removeItem('guestCart');
  };

  // Helper function to calculate item subtotal
  const calculateItemSubtotal = (product, quantity) => {
    const price = product.onSale && product.finalPrice ? product.finalPrice : product.price;
    return price * quantity;
  };

  // Helper function to calculate cart totals
  const calculateCartTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    
    return { subtotal, itemCount };
  };

  return (
    <GuestCartContext.Provider
      value={{
        guestCart,
        addToGuestCart,
        updateGuestCartItem,
        removeGuestCartItem,
        clearGuestCart
      }}
    >
      {children}
    </GuestCartContext.Provider>
  );
};