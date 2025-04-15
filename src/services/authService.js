import {
  signIn,
  signOut,
  getCurrentUser,
  confirmResetPassword,
  fetchAuthSession,
} from "@aws-amplify/auth";
import api from "./api";

// Sign in user
export const login = async (email, password, rememberMe) => {
  try {
    // First check if a user is already signed in
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        // If attempting to login with the same email, consider it a success
        if (currentUser.username.toLowerCase() === email.toLowerCase()) {
          const session = await fetchAuthSession();
          const token = session.tokens.idToken.toString();

          // Update token in localStorage
          localStorage.setItem("authToken", token);
          localStorage.setItem("userEmail", email);

          if (rememberMe) {
            localStorage.setItem("email", email);
          } else {
            localStorage.removeItem("email");
          }

          return currentUser;
        } else {
          // If trying to login with a different email, sign out first
          await signOut({ global: true });
        }
      }
    } catch (err) {
      // No user is currently signed in, continue with login process
      console.log("No user currently signed in");
    }

    const signInResponse = await signIn({
      username: email,
      password,
    });

    // Get token from response
    const session = await fetchAuthSession();
    const token = session.tokens.idToken.toString();

    // Store token in localStorage for API authentication
    localStorage.setItem("authToken", token);
    localStorage.setItem("userEmail", email);

    // Store user info in local storage if remember me is checked
    if (rememberMe) {
      localStorage.setItem("email", email);
    } else {
      localStorage.removeItem("email");
    }

    // Fetch user details from the backend
    const userResponse = await api.get("/auth/current-user");
    return userResponse.data;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

// Sign up user
export const register = async (userData) => {
  try {
    // Register with our backend
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

// Sign out user
export const logout = async () => {
  try {
    await signOut({ global: true });
    // Clear auth token and user info
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Get current authenticated user
export const getCurrentAuthUser = async () => {
  try {
    // First check if we have a token
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Get user details from our backend
    const response = await api.get("/auth/current-user");
    return response.data;
  } catch (error) {
    console.error("Error getting current user:", error);
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    // Check for token in localStorage first
    const token = localStorage.getItem("authToken");
    if (!token) {
      return false;
    }

    // Verify with Cognito if token exists
    try {
      await getCurrentUser();

      // Also validate with our backend
      await api.get("/auth/current-user");

      return true;
    } catch (error) {
      // Clear invalid token
      localStorage.removeItem("authToken");
      localStorage.removeItem("userEmail");
      return false;
    }
  } catch (error) {
    console.error("Error checking authentication:", error);
    // Clear invalid token
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    return false;
  }
};

// Password reset
export const forgotPassword = async (email) => {
  try {
    // Call backend API to initiate password reset
    const response = await api.post("/auth/forgot-password", null, {
      params: { email },
    });
    return response.data;
  } catch (error) {
    console.error("Error requesting password reset:", error);
    throw error;
  }
};

// Complete password reset
export const resetPassword = async (email, code, newPassword) => {
  try {
    // Call backend API to complete password reset
    const response = await api.post("/auth/reset-password", null, {
      params: { email, code, newPassword },
    });
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

// Complete password reset
export const confirmPasswordReset = async (email, code, newPassword) => {
  try {
    await confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword,
    });
    return true;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

// Google sign in
export const googleSignIn = async (idToken) => {
  try {
    const response = await api.post('/auth/social-login', null, {
      params: { idToken, provider: 'google' }
    });
    
    if (response.data && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      
      if (response.data.email) {
        localStorage.setItem('userEmail', response.data.email);
      }
    } else {
      console.warn('No token found in response data, checking alternative locations');
      
      if (response.data?.id) {
        try {
          const userResponse = await api.get('/auth/current-user');
          if (userResponse.data && userResponse.data.token) {
            localStorage.setItem('authToken', userResponse.data.token);
            
            return {...response.data, ...userResponse.data};
          }
        } catch (innerError) {
          console.error('Error fetching user details after Google login:', innerError);
        }
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error with Google sign in:', error);
    throw error;
  }
};
