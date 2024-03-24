// ContextReducer.js
import React, { createContext, useContext, useReducer } from 'react';

const CartStateContext = createContext();
const CartDispatchContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingCartItemIndex = state.findIndex(item => (
        item.name === action.payload.name && item.option === action.payload.option
      ));

      if (existingCartItemIndex !== -1) {
        // If the same item with the same option is already in the cart, update its quantity
        return state.map((item, index) =>
          index === existingCartItemIndex ? { ...item, quantity: item.quantity + action.payload.quantity } : item
        );
      } else {
        // If it's a new item or a new option, add it to the cart
        return [...state, action.payload];
      }

    case 'UPDATE_QUANTITY':
      return state.map((item, index) =>
        index === action.payload.index ? { ...item, quantity: action.payload.quantity } : item
      );
    case 'REMOVE_FROM_CART':
      return state.filter((_, index) => index !== action.payload);
    case 'CLEAR_CART':
      return [];
    case 'UPDATE_CART':
      return action.payload;
    case 'SET_USER':
      // Simply return the state without modifying it as the user context handles user data
      return state;
    default:
      return state;
  }
};


export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, []);
  return (
    <CartDispatchContext.Provider value={dispatch}>
      <CartStateContext.Provider value={state}>
        {children}
      </CartStateContext.Provider>
    </CartDispatchContext.Provider>
  );
};

export const useCart = () => useContext(CartStateContext);
export const useDispatchCart = () => useContext(CartDispatchContext);
export default reducer;
