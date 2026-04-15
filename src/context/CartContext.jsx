import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const initialState = {
  items: [],
  total: 0
};

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
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((acc, i) => acc + (i.price * i.qty), 0)
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
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((acc, i) => acc + (i.price * i.qty), 0)
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
