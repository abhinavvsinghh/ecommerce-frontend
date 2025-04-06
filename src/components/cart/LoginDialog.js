import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Divider,
  Typography,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

const LoginDialog = ({ open, onClose, onContinueAsGuest, product }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    onClose();
    navigate('/login', { 
      state: { 
        redirectTo: product ? `/products/${product.id}` : location.pathname,
        fromCart: true,
        fromProductDetails: !!product
      } 
    });
  };

  const handleContinueAsGuest = () => {
    onClose();
    if (onContinueAsGuest) {
      onContinueAsGuest();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="login-dialog-title"
      aria-describedby="login-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="login-dialog-title" sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ShoppingCartIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Sign in to continue</Typography>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <DialogContentText id="login-dialog-description" sx={{ mb: 2 }}>
          {product ? (
            <>
              To add <strong>{product.name}</strong> to your cart, please sign in to your account or continue as a guest.
            </>
          ) : (
            <>
              To access your shopping cart, please sign in to your account or continue as a guest.
            </>
          )}
        </DialogContentText>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, my: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AccountCircleIcon />}
            onClick={handleLogin}
            sx={{ minWidth: 200 }}
          >
            Sign In
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PersonOutlineIcon />}
            onClick={handleContinueAsGuest}
            sx={{ minWidth: 200 }}
          >
            Continue as Guest
          </Button>
        </Box>
        <DialogContentText variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
          Sign in to save your cart and access exclusive deals.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" size="small">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginDialog;