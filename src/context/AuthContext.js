import React, { createContext, useContext, useReducer, useEffect } from 'react';

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
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('pos_user');
        const savedRole = localStorage.getItem('pos_role');
        
        if (savedUser && savedRole) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: JSON.parse(savedUser),
              role: savedRole
            }
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = (username, password, role) => {
    // Mock authentication - in real app, this would be an API call
    const validCredentials = {
      admin: { username: 'admin', password: 'admin123' },
      cashier: { username: 'cashier', password: 'cashier123' }
    };

    if (validCredentials[role] && 
        validCredentials[role].username === username && 
        validCredentials[role].password === password) {
      
      // Clear any existing data first
      localStorage.removeItem('pos_user');
      localStorage.removeItem('pos_role');
      localStorage.removeItem('pos_cart');
      localStorage.removeItem('pos_sales');
      
      const user = { username, role };
      
      // Save to localStorage
      localStorage.setItem('pos_user', JSON.stringify(user));
      localStorage.setItem('pos_role', role);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, role }
      });
      
      return { success: true };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
  };

  const logout = () => {
    // Clear all localStorage items
    localStorage.removeItem('pos_user');
    localStorage.removeItem('pos_role');
    
    // Clear any other potential cached data
    localStorage.removeItem('pos_cart');
    localStorage.removeItem('pos_sales');
    
    // Reset to initial state
    dispatch({ type: 'LOGOUT' });
    
    // Force a page reload to ensure clean state
    window.location.reload();
  };

  const hasPermission = (permission) => {
    if (!state.role) return false;
    
    const permissions = {
      admin: ['view_dashboard', 'manage_products', 'view_sales', 'view_reports', 'manage_settings', 'process_sales'],
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
