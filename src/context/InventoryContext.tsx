import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, mockProducts } from '../data/mockProducts';

interface InventoryContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  reduceStock: (items: { id: string; quantity: number }[]) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('app-inventory');
    return saved ? JSON.parse(saved) : mockProducts;
  });

  useEffect(() => {
    localStorage.setItem('app-inventory', JSON.stringify(products));
  }, [products]);

  const addProduct = (product: Product) => {
    setProducts((prev) => [...prev, product]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const reduceStock = (items: { id: string; quantity: number }[]) => {
    setProducts((prev) =>
      prev.map((p) => {
        const item = items.find((i) => i.id === p.id);
        if (item) {
          return { ...p, stock: Math.max(0, p.stock - item.quantity) };
        }
        return p;
      })
    );
  };

  return (
    <InventoryContext.Provider
      value={{ products, addProduct, updateProduct, deleteProduct, reduceStock }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
