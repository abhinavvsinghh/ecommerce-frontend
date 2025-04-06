import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { login, register, logout, googleSignIn } from '../services/authService';

export const useAuth = () => {
  const { user, setUser, authenticated, setAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (email, password, rememberMe) => {
    try {
      const userData = await login(email, password, rememberMe);
      setUser(userData);
      setAuthenticated(true);
      
      // Success but don't navigate here - let the component handle that
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
      return false;
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await register(userData);
      // No longer setting user/authenticated here since we removed auto-login
      // Removed success toast to avoid duplicate with Register component toast
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
      return false;
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      // Extract the id_token from the Google response
      const { credential } = credentialResponse;
      const userData = await googleSignIn(credential);
      
      setUser(userData);
      setAuthenticated(true);
      
      // Success but don't navigate here - let the component handle that
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Google login failed. Please try again.');
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAuthenticated(false);
      toast.success('Logged out successfully');
      
      // Clear cart state
      sessionStorage.removeItem('guestCart');
      
      // Redirect after a short delay to ensure state updates
      setTimeout(() => {
        navigate('/');
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
      return false;
    }
  };

  return {
    user,
    authenticated,
    login: handleLogin,
    register: handleRegister,
    googleLogin: handleGoogleLogin,
    logout: handleLogout
  };
};