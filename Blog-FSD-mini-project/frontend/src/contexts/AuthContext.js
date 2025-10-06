import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check if user is authenticated
  const { data: userData, isLoading: isCheckingAuth } = useQuery(
    ['auth', 'me'],
    () => authAPI.getMe(),
    {
      enabled: !!token,
      retry: false,
      onSuccess: (data) => {
        setUser(data.user);
        setIsLoading(false);
      },
      onError: () => {
        // Token is invalid, clear it
        logout();
        setIsLoading(false);
      }
    }
  );

  // Login mutation
  const loginMutation = useMutation(
    (credentials) => authAPI.login(credentials),
    {
      onSuccess: (data) => {
        const { token: newToken, user: newUser } = data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        toast.success('Login successful!');
        queryClient.invalidateQueries(['auth']);
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Login failed';
        toast.error(message);
      }
    }
  );

  // Signup mutation
  const signupMutation = useMutation(
    (userData) => authAPI.signup(userData),
    {
      onSuccess: (data) => {
        const { token: newToken, user: newUser } = data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        toast.success('Account created successfully!');
        queryClient.invalidateQueries(['auth']);
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Signup failed';
        toast.error(message);
      }
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (profileData) => authAPI.updateProfile(profileData),
    {
      onSuccess: (data) => {
        setUser(data.user);
        toast.success('Profile updated successfully!');
        queryClient.invalidateQueries(['auth']);
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Profile update failed';
        toast.error(message);
      }
    }
  );

  // Change password mutation
  const changePasswordMutation = useMutation(
    (passwordData) => authAPI.changePassword(passwordData),
    {
      onSuccess: () => {
        toast.success('Password changed successfully!');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Password change failed';
        toast.error(message);
      }
    }
  );

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    queryClient.clear();
    toast.success('Logged out successfully');
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      await updateProfileMutation.mutateAsync({ preferences });
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => hasRole('admin');

  // Check if user is moderator
  const isModerator = () => hasRole('moderator') || hasRole('admin');

  // Get user's reading preferences
  const getUserPreferences = () => {
    return user?.preferences || {
      theme: 'light',
      mood: 'happy',
      notifications: {
        email: true,
        push: true
      }
    };
  };

  // Update user's mood
  const updateUserMood = async (newMood) => {
    try {
      await updatePreferences({ mood: newMood });
    } catch (error) {
      console.error('Failed to update mood:', error);
    }
  };

  // Update user's theme preference
  const updateUserTheme = async (newTheme) => {
    try {
      await updatePreferences({ theme: newTheme });
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  // Get auth headers for API requests
  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Public API wrappers to ensure correct payload shape
  const login = (email, password) => loginMutation.mutateAsync({ email, password });
  const signup = (username, email, password) => signupMutation.mutateAsync({ username, email, password });

  const value = {
    // State
    user,
    token,
    isLoading: isLoading || isCheckingAuth,
    isAuthenticated,
    
    // Actions
    login,
    signup,
    logout,
    updateProfile: updateProfileMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    updatePreferences,
    updateUserMood,
    updateUserTheme,
    
    // Mutations state
    isLoggingIn: loginMutation.isLoading,
    isSigningUp: signupMutation.isLoading,
    isUpdatingProfile: updateProfileMutation.isLoading,
    isChangingPassword: changePasswordMutation.isLoading,
    
    // Utility functions
    hasRole,
    isAdmin,
    isModerator,
    getUserPreferences,
    getAuthHeaders
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
