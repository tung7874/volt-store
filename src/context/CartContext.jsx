import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('volt_cart');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return { items: [], total: 0, itemsTotal: 0, shippingFee: 0 };
};

const initialState = loadCartFromStorage();

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id);
      let newItems;
      if (existing) {
        newItems = state.items.map(i => 
          i.id === action.payload.id ? { ...i, qty: i.qty + 1 } : i
        );
      } else {
        newItems = [...state.items, { ...action.payload, qty: 1 }];
      }
      const itemsTotal = newItems.reduce((acc, i) => acc + (i.price * i.qty), 0);
      const shippingFee = (itemsTotal > 0 && itemsTotal < 1000) ? 60 : 0;
      return {
        ...state,
        items: newItems,
        itemsTotal,
        shippingFee,
        total: itemsTotal + shippingFee
      };
    }
    case 'REMOVE_ITEM': {
      const existing = state.items.find(i => i.id === action.payload);
      let newItems;
      if (existing.qty > 1) {
        newItems = state.items.map(i => 
          i.id === action.payload ? { ...i, qty: i.qty - 1 } : i
        );
      } else {
        newItems = state.items.filter(i => i.id !== action.payload);
      }
      const itemsTotal = newItems.reduce((acc, i) => acc + (i.price * i.qty), 0);
      const shippingFee = (itemsTotal > 0 && itemsTotal < 1000) ? 60 : 0;
      return {
        ...state,
        items: newItems,
        itemsTotal,
        shippingFee,
        total: itemsTotal + shippingFee
      };
    }
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  React.useEffect(() => {
    localStorage.setItem('volt_cart', JSON.stringify(state));
  }, [state]);

  const addItem = (product) => dispatch({ type: 'ADD_ITEM', payload: product });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider value={{ cart: state, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
