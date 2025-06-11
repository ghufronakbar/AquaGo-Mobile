import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrderItemDTO } from '@/models/Dto';

const CART_KEY = 'CART_ITEMS';

interface CartContextType {
  cart: OrderItemDTO[];
  addToCart: (item: OrderItemDTO) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<OrderItemDTO[]>([]);

  useEffect(() => {
    getCart();
  }, []);

  const getCart = async () => {
    try {
      const stored = await AsyncStorage.getItem(CART_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      setCart([]);
    }
  };

  const saveCart = async (items: OrderItemDTO[]) => {
    setCart(items);
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
  };

  const addToCart = (item: OrderItemDTO) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.productId === item.productId);
      let updated;
      if (exists) {
        updated = prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        updated = [...prev, item];
      }
      saveCart(updated);
      return updated;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.productId !== productId);
      saveCart(updated);
      return updated;
    });
  };

  const clearCart = () => {
    saveCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 