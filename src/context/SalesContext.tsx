import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from './CartContext';

export type SaleStatus = 'recibido' | 'preparacion' | 'en_camino' | 'entregado';
export type DeliveryMethod = 'pickup' | 'delivery';

export interface Sale {
  id: string;
  date: string;
  sellerId: string;
  sellerName: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  deliveryMethod: DeliveryMethod;
  shippingCost: number;
  status: SaleStatus;
  items: CartItem[];
  total: number;
}

interface SalesContextType {
  sales: Sale[];
  recordSale: (sale: Sale) => void;
  updateSaleStatus: (id: string, status: SaleStatus) => void;
  clearSales: () => void;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('app-sales');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('app-sales', JSON.stringify(sales));
  }, [sales]);

  const recordSale = (sale: Sale) => {
    setSales((prev) => [sale, ...prev]);
  };

  const updateSaleStatus = (id: string, status: SaleStatus) => {
    setSales((prev) => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const clearSales = () => {
    setSales([]);
  };

  return (
    <SalesContext.Provider value={{ sales, recordSale, updateSaleStatus, clearSales }}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
}
