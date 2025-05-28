'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  tipoUso?: '1d' | '7d' | '30d' | 'lifetime';
}

interface CartContextType {
  cart: CartProduct[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider');
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartProduct[]>([]);

  // Carregar do localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cybershop_cart');
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem('cybershop_cart', JSON.stringify(cart));
  }, [cart]);

  function addToCart(product: CartProduct) {
    setCart(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + product.quantity } : p);
      }
      return [...prev, product];
    });
  }

  function removeFromCart(id: number) {
    setCart(prev => prev.filter(p => p.id !== id));
  }

  function updateQuantity(id: number, qty: number) {
    setCart(prev => prev.map(p => p.id === id ? { ...p, quantity: Math.max(1, qty) } : p));
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
} 