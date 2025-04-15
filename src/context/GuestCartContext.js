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

  useEffect(() => {
    localStorage.setItem('guestCart', JSON.stringify(guestCart));
  }, [guestCart]);

  const addToGuestCart = (product, quantity = 1, size = null, color = null) => {
    setGuestCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(item => 
        item.productId === product.id && 
        item.size === size && 
        item.color === color
      );

      let newItems = [...prevCart.items];
      
      if (existingItemIndex >= 0) {
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
          subtotal: calculateItemSubtotal(product, newItems[existingItemIndex].quantity + quantity)
        };
      } else {
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
      const itemIndex = prevCart.items.findIndex(item => item.productId === productId);
      
      if (itemIndex === -1) return prevCart;
      
      let newItems = [...prevCart.items];
      
      if (quantity <= 0) {
        newItems = newItems.filter(item => item.productId !== productId);
      } else {
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          quantity,
          subtotal: newItems[itemIndex].price * quantity
        };
      }

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

  const calculateItemSubtotal = (product, quantity) => {
    const price = product.onSale && product.finalPrice ? product.finalPrice : product.price;
    return price * quantity;
  };

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