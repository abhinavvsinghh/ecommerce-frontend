import { useContext } from 'react';
import { GuestCartContext } from '../context/GuestCartContext';

export const useGuestCart = () => {
  const {
    guestCart,
    addToGuestCart,
    updateGuestCartItem,
    removeGuestCartItem,
    clearGuestCart
  } = useContext(GuestCartContext);

  return {
    guestCart,
    addToGuestCart,
    updateGuestCartItem,
    removeGuestCartItem,
    clearGuestCart
  };
};