"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
};

type CartState = { items: CartItem[] };

type CartAction =
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; productId: string; size: string; color: string }
  | { type: "UPDATE_QTY"; productId: string; size: string; color: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

const CartContext = createContext<{
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQty: (productId: string, size: string, color: string, quantity: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
} | null>(null);

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items };
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) =>
          i.productId === action.item.productId &&
          i.size === action.item.size &&
          i.color === action.item.color
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i === existing
              ? { ...i, quantity: Math.min(i.quantity + action.item.quantity, 10) }
              : i
          ),
        };
      }
      return { items: [...state.items, action.item] };
    }
    case "REMOVE_ITEM":
      return {
        items: state.items.filter(
          (i) =>
            !(
              i.productId === action.productId &&
              i.size === action.size &&
              i.color === action.color
            )
        ),
      };
    case "UPDATE_QTY":
      return {
        items: state.items.map((i) =>
          i.productId === action.productId && i.size === action.size && i.color === action.color
            ? { ...i, quantity: Math.max(0, Math.min(action.quantity, 10)) }
            : i
        ).filter((i) => i.quantity > 0),
      };
    case "CLEAR":
      return { items: [] };
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fb-cart");
      if (raw) dispatch({ type: "HYDRATE", items: JSON.parse(raw) });
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("fb-cart", JSON.stringify(state.items));
  }, [state.items]);

  const count = state.items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = state.items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem: (item) => dispatch({ type: "ADD_ITEM", item }),
        removeItem: (productId, size, color) =>
          dispatch({ type: "REMOVE_ITEM", productId, size, color }),
        updateQty: (productId, size, color, quantity) =>
          dispatch({ type: "UPDATE_QTY", productId, size, color, quantity }),
        clear: () => dispatch({ type: "CLEAR" }),
        count,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans CartProvider");
  return ctx;
}
