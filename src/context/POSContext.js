import React, { createContext, useContext, useReducer, useEffect } from 'react';

const POSContext = createContext();

const initialState = {
  products: [],
  cart: [],
  sales: [],
  customers: [],
  currentSale: null,
  loading: false,
  error: null
};

const posReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, loading: false };
    
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }]
      };
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };
    
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    
    case 'ADD_SALE':
      return {
        ...state,
        sales: [action.payload, ...state.sales],
        cart: []
      };
    
    case 'SET_CURRENT_SALE':
      return { ...state, currentSale: action.payload };
    
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload]
      };
    
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product => 
          product.id === action.payload.id 
            ? { ...product, ...action.payload }
            : product
        )
      };
    
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload)
      };
    
    default:
      return state;
  }
};

export const POSProvider = ({ children }) => {
  const [state, dispatch] = useReducer(posReducer, initialState);

  // Load products on app start
  useEffect(() => {
    const loadProducts = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        if (window.electronAPI) {
          const products = await window.electronAPI.getProducts();
          dispatch({ type: 'SET_PRODUCTS', payload: products });
        } else {
          // Bakery products for development
          const mockProducts = [
            { id: 1, name: 'Fresh Bread', price: 3.50, category: 'Bread', stock: 50, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop&crop=center' },
            { id: 2, name: 'Croissant', price: 2.99, category: 'Pastries', stock: 30, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=200&fit=crop&crop=center' },
            { id: 3, name: 'Chocolate Cake', price: 8.99, category: 'Cakes', stock: 15, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop&crop=center' },
            { id: 4, name: 'Donut', price: 1.99, category: 'Donuts', stock: 40, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop&crop=center' },
            { id: 5, name: 'Muffin', price: 2.50, category: 'Muffins', stock: 25, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop&crop=center' },
            { id: 6, name: 'Cookies', price: 4.99, category: 'Cookies', stock: 60, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200&h=200&fit=crop&crop=center' },
            { id: 7, name: 'Bagel', price: 2.25, category: 'Bread', stock: 35, image: 'https://images.unsplash.com/photo-1515443961218-a5136788e4bd?w=200&h=200&fit=crop&crop=center' },
            { id: 8, name: 'Cupcake', price: 3.25, category: 'Cakes', stock: 20, image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=200&h=200&fit=crop&crop=center' },
            { id: 9, name: 'Danish', price: 3.75, category: 'Pastries', stock: 18, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=200&fit=crop&crop=center' },
            { id: 10, name: 'Coffee', price: 2.50, category: 'Beverages', stock: 100, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop&crop=center' },
            { id: 11, name: 'Tea', price: 2.00, category: 'Beverages', stock: 75, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop&crop=center' },
            { id: 12, name: 'Smoothie', price: 4.50, category: 'Beverages', stock: 30, image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=200&h=200&fit=crop&crop=center' }
          ];
          dispatch({ type: 'SET_PRODUCTS', payload: mockProducts });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    };

    loadProducts();
  }, []);

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id: productId, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const processSale = async (saleData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const sale = {
        id: Date.now(),
        items: state.cart,
        total: state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        timestamp: new Date().toISOString(),
        ...saleData
      };

      if (window.electronAPI) {
        await window.electronAPI.saveSale(sale);
      }

      dispatch({ type: 'ADD_SALE', payload: sale });
      dispatch({ type: 'CLEAR_CART' });
      
      return { success: true, sale };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const getCartTotal = () => {
    return state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return state.cart.reduce((count, item) => count + item.quantity, 0);
  };

  const addProduct = (productData) => {
    const newProduct = {
      id: Date.now(),
      ...productData
    };
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
  };

  const updateProduct = (productId, productData) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { id: productId, ...productData } });
  };

  const deleteProduct = (productId) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: productId });
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    processSale,
    getCartTotal,
    getCartItemCount,
    addProduct,
    updateProduct,
    deleteProduct
  };

  return (
    <POSContext.Provider value={value}>
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
