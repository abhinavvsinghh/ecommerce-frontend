import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  IconButton,
  TextField,
  Card,
  CardContent,
  CardMedia,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import { useCart } from "../hooks/useCart";
import LoginDialog from "../components/cart/LoginDialog";

const Cart = () => {
  const {
    cart,
    loading,
    updateCartItem,
    removeCartItem,
    clearCart,
    loginDialogOpen,
    closeLoginDialog,
    continueAsGuest,
    isAuthenticated,
  } = useCart();

  // No useEffect here to avoid triggering unnecessary fetches

  const handleQuantityChange = (productId, currentQuantity, change) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    updateCartItem(productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    removeCartItem(productId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <ShoppingCartIcon
            sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Looks like you haven't added any products to your cart yet.
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            color="primary"
          >
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Cart
        {!isAuthenticated && (
          <Chip
            icon={<PersonIcon />}
            label="Guest"
            variant="outlined"
            size="small"
            color="primary"
            sx={{ ml: 2, verticalAlign: "middle" }}
          />
        )}
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Cart Items */}
          <Paper sx={{ mb: { xs: 3, md: 0 } }}>
            {cart.items.map((item) => (
              <Box
                key={item.productId}
                sx={{ p: 2, borderBottom: "1px solid #eee" }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={3} sm={2}>
                    <CardMedia
                      component="img"
                      image={
                        item.image ||
                        "https://via.placeholder.com/100x100?text=No+Image"
                      }
                      alt={item.productName}
                      sx={{
                        borderRadius: 1,
                        width: "100%",
                        maxHeight: 100,
                        objectFit: "contain",
                      }}
                    />
                  </Grid>

                  <Grid item xs={9} sm={4}>
                    <Typography
                      component={RouterLink}
                      to={`/products/${item.productId}`}
                      variant="subtitle1"
                      sx={{
                        textDecoration: "none",
                        color: "inherit",
                        fontWeight: "bold",
                      }}
                    >
                      {item.productName}
                    </Typography>

                    {item.size && (
                      <Typography variant="body2" color="text.secondary">
                        Size: {item.size}
                      </Typography>
                    )}

                    {item.color && (
                      <Typography variant="body2" color="text.secondary">
                        Color: {item.color}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            item.quantity,
                            -1
                          )
                        }
                      >
                        <RemoveIcon />
                      </IconButton>

                      {/* This TextField needs to be fixed */}
                      <TextField
                        size="small"
                        type="number"
                        value={item.quantity || 1}
                        inputProps={{
                          readOnly: true,
                          style: { textAlign: "center", minWidth: "30px" },
                        }}
                        sx={{
                          width: "60px",
                          mx: 1,
                          "& .MuiOutlinedInput-input": {
                            textAlign: "center",
                            p: "6px 8px",
                          },
                        }}
                      />

                      <IconButton
                        size="small"
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            item.quantity || 1,
                            1
                          )
                        }
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </Grid>

                  <Grid item xs={4} sm={2} sx={{ textAlign: "right" }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      $
                      {typeof item.subtotal === "number"
                        ? item.subtotal.toFixed(2)
                        : item.subtotal}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      $
                      {typeof item.price === "number"
                        ? item.price.toFixed(2)
                        : item.price}{" "}
                      each
                    </Typography>
                  </Grid>

                  <Grid item xs={2} sm={1} sx={{ textAlign: "right" }}>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveItem(item.productId)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleClearCart}
                startIcon={<DeleteIcon />}
              >
                Clear Cart
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Order Summary */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body1">
                  Subtotal ({cart.items.length} items)
                </Typography>
                <Typography variant="body1">
                  $
                  {typeof cart.subtotal === "number"
                    ? cart.subtotal.toFixed(2)
                    : cart.subtotal || "0.00"}
                </Typography>
              </Box>

              {cart.discountAmount > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1" color="error">
                    Discount {cart.couponCode && `(${cart.couponCode})`}
                  </Typography>
                  <Typography variant="body1" color="error">
                    -$
                    {typeof cart.discountAmount === "number"
                      ? cart.discountAmount.toFixed(2)
                      : cart.discountAmount}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
              >
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">
                  $
                  {typeof cart.totalPrice === "number"
                    ? cart.totalPrice.toFixed(2)
                    : cart.totalPrice || cart.subtotal || "0.00"}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                component={RouterLink}
                to={isAuthenticated ? "/checkout" : "/login"}
                state={{ redirectTo: "/checkout" }}
                sx={{ mb: 2 }}
              >
                {isAuthenticated ? "Proceed to Checkout" : "Login to Checkout"}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to="/"
              >
                Continue Shopping
              </Button>

              {!isAuthenticated && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  Sign in to save your cart and access exclusive deals
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Login Dialog */}
      <LoginDialog
        open={loginDialogOpen}
        onClose={closeLoginDialog}
        onContinueAsGuest={continueAsGuest}
      />
    </Container>
  );
};

export default Cart;
