import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (productId: string, variantId: string, quantity?: number) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  clearCart: () => void;
  itemCount: number;
}

const CART_STORAGE_KEY = 'estchay_lux_cart_v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // STRICT COMPLIANCE: Store only product IDs, variant IDs and quantities in browser storage
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item) => item && typeof item.productId === 'string' && typeof item.variantId === 'string' && typeof item.quantity === 'number'
          );
        }
      }
    } catch {
      // LocalStorage access fail safe
    }
    return [];
  });

  useEffect(() => {
    try {
      // Strip any extra non-essential data before storing
      const sanitized = items.map(({ productId, variantId, quantity }) => ({
        productId,
        variantId,
        quantity: Math.max(1, quantity),
      }));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(sanitized));
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [items]);

  const addItem = (productId: string, variantId: string, quantity: number = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === productId && i.variantId === variantId
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { productId, variantId, quantity: Math.max(1, quantity) }];
    });
  };

  const updateQuantity = (productId: string, variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i
      )
    );
  };

  const removeItem = (productId: string, variantId: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
