import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CustomerTransaction {
  id: string;
  date: string;
  description: string;
  amount: number; // positive for charges (deuda), negative for payments (pago)
}

export interface Customer {
  id: string;
  name: string;
  dni: string;
  email?: string;
  phone: string;
  address: string;
  balance: number; // Current debt
  history: CustomerTransaction[];
  lateFeeEnabled?: boolean;
}

interface CustomersContextType {
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addTransaction: (customerId: string, transaction: Omit<CustomerTransaction, 'id' | 'date'>) => void;
}

const CustomersContext = createContext<CustomersContextType | undefined>(undefined);

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('app-customers');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('app-customers', JSON.stringify(customers));
  }, [customers]);

  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [...prev, customer]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const addTransaction = (customerId: string, transaction: Omit<CustomerTransaction, 'id' | 'date'>) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const newTransaction: CustomerTransaction = {
          ...transaction,
          id: Date.now().toString(),
          date: new Date().toISOString()
        };
        return {
          ...c,
          balance: c.balance + transaction.amount,
          history: [newTransaction, ...c.history]
        };
      }
      return c;
    }));
  };

  return (
    <CustomersContext.Provider value={{ customers, addCustomer, updateCustomer, deleteCustomer, addTransaction }}>
      {children}
    </CustomersContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomersContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomersProvider');
  }
  return context;
}
