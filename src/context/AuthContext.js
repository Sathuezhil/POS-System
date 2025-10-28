import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  role: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        role: action.payload.role,
        loading: false
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        role: null,
        loading: false
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Verify token with backend
          const response = await authAPI.getCurrentUser();
          const user = response.data.user;
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user,
              role: user.role
            }
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });
      const { token, user } = response.data;
      
      // Save token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Clear any existing cart/sales data
      localStorage.removeItem('pos_cart');
      localStorage.removeItem('pos_sales');
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, role: user.role }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear all localStorage items
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear any other potential cached data
      localStorage.removeItem('pos_cart');
      localStorage.removeItem('pos_sales');
      
      // Reset to initial state
      dispatch({ type: 'LOGOUT' });
      
      // Force a page reload to ensure clean state
      window.location.reload();
    }
  };

  const hasPermission = (permission) => {
    if (!state.role) return false;
    
    const permissions = {
      admin: ['view_dashboard', 'manage_products', 'view_reports', 'manage_settings'],
      cashier: ['process_sales', 'view_sales']
    };
    
    return permissions[state.role]?.includes(permission) || false;
  };

  const value = {
    ...state,
    login,
    logout,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
