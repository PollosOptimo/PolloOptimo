/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { SalesProvider } from './context/SalesContext';
import { CustomersProvider } from './context/CustomersContext';

import { Layout } from './components/Layout';
import { Catalog } from './pages/Catalog';
import { Cart } from './pages/Cart';

import { AdminLayout } from './components/AdminLayout';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { POS } from './pages/admin/POS';
import { Inventory } from './pages/admin/Inventory';
import { SalesRegistry } from './pages/admin/SalesRegistry';
import { Users } from './pages/admin/Users';
import { Settings } from './pages/admin/Settings';
import { Customers } from './pages/admin/Customers';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CustomersProvider>
          <InventoryProvider>
            <SalesProvider>
              <CartProvider>
                <BrowserRouter>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Catalog />} />
                      <Route path="cart" element={<Cart />} />
                    </Route>

                    {/* Admin Auth */}
                    <Route path="/login" element={<Login />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="pos" element={<POS />} />
                      <Route path="inventory" element={<Inventory />} />
                      <Route path="sales" element={<SalesRegistry />} />
                      <Route path="users" element={<Users />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="customers" element={<Customers />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </CartProvider>
            </SalesProvider>
          </InventoryProvider>
        </CustomersProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
