import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Divider,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

const LoginDialog = ({ open, onClose, onContinueAsGuest, product }) => {
  const handleLogin = () => {
    onClose();
    if (onContinueAsGuest) {
      onContinueAsGuest('login');
    }
  };

  const handleContinueAsGuest = () => {
    onClose();
    if (onContinueAsGuest) {
      onContinueAsGuest('guest');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="login-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="login-dialog-title" sx={{ pb: 1, display: 'flex', alignItems: 'center' }}>
        <ShoppingCartIcon sx={{ mr: 1, color: 'primary.main' }} />
        Sign in to continue
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
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