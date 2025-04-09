import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { GoogleLogin } from '@react-oauth/google';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Paper,
  Grid,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { login, authenticated, googleLogin } = useAuth();
  const { returnTo } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  
  // Check for redirect path in state or query params
  const redirectTo = location.state?.redirectTo || 
                     returnTo || 
                     new URLSearchParams(location.search).get('redirectTo') || 
                     '/';
  
  // Note: We no longer need to extract pendingProduct from state
  // It will be handled automatically by the useCart hook via sessionStorage

  useEffect(() => {
    // If already authenticated, redirect to intended destination
    if (authenticated) {
      navigate(redirectTo, { replace: true });
    }
    
    // Check if there's a saved email in localStorage
    const savedEmail = localStorage.getItem('email');
    if (savedEmail) {
      formik.setFieldValue('email', savedEmail);
      setRememberMe(true);
    }
  }, [authenticated, redirectTo]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setProcessing(true);
        setError('');
        const success = await login(values.email, values.password, rememberMe);
        if (!success) {
          setError('Login failed. Please check your credentials.');
        } else {
          // On successful login - just one toast notification
          toast.success('Login successful!');
          
          // Redirect back to where the user was - useCart hook will handle the pending product
          navigate(redirectTo, { replace: true });
        }
      } catch (err) {
        setError(err.message || 'Login failed. Please try again.');
      } finally {
        setSubmitting(false);
        setProcessing(false);
      }
    },
  });

  const handleGoogleSignIn = (credentialResponse) => {
    setProcessing(true);
    setError('');
    googleLogin(credentialResponse)
      .then(() => {
        toast.success('Login successful with Google!');
        // Redirect - useCart hook will handle the pending product
        navigate(redirectTo, { replace: true });
      })
      .catch(error => {
        setError('Google sign-in failed. Please try again.');
        console.error('Google login error:', error);
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {location.state?.fromCart && (
            <Alert severity="info" sx={{ width: '100%', mt: 2 }}>
              Please sign in to continue with your purchase
            </Alert>
          )}
          
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={processing}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              disabled={processing}
            />
            
            <Grid container sx={{ mt: 2 }}>
              <Grid item xs>
                <FormControlLabel
                  control={
                    <Checkbox
                      value="remember"
                      color="primary"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={processing}
                    />
                  }
                  label="Remember me"
                />
              </Grid>
              
              <Grid item>
                <Link component={RouterLink} to="/forgot-password" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={formik.isSubmitting || processing}
            >
              {processing ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>
            
            <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSignIn}
                onError={() => {
                  toast.error('Google Sign In Failed');
                  setError('Google sign-in failed. Please try again.');
                }}
                useOneTap
                disabled={processing}
              />
            </Box>
            
            <Grid container justifyContent="center">
              <Grid item>
                <Typography variant="body2">
                  Don't have an account?{' '}
                  <Link component={RouterLink} to="/register" variant="body2">
                    Sign Up
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;