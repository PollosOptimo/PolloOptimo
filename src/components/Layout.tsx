import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, ShoppingCart, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';

export function Layout() {
  const { theme } = useTheme();
  const { totalItems } = useCart();

  return (
    <div 
      className="min-h-screen flex flex-col pb-16 md:pb-0 md:pl-64 transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Desktop Sidebar */}
      <aside 
        className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50"
      >
        <div className="p-6 flex flex-col items-center border-b border-gray-100 relative">
          <NavLink to="/login" className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors">
            <Settings className="w-4 h-4" />
          </NavLink>
          <img 
            src={theme.logoUrl} 
            alt={theme.companyName} 
            className="w-24 h-24 object-contain rounded-xl shadow-sm mb-4"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-lg font-bold text-center text-gray-900">{theme.companyName}</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem to="/" icon={<Home className="w-5 h-5" />} label="Catálogo" />
          <NavItem 
            to="/cart" 
            icon={<ShoppingCart className="w-5 h-5" />} 
            label="Carrito" 
            badge={totalItems} 
          />
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img 
            src={theme.logoUrl} 
            alt="Logo" 
            className="w-10 h-10 object-contain rounded-lg shadow-sm"
            referrerPolicy="no-referrer"
          />
          <h1 className="font-bold text-gray-900 truncate max-w-[200px]">{theme.companyName}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex items-center justify-around pb-safe z-50">
        <MobileNavItem to="/" icon={<Home className="w-6 h-6" />} label="Inicio" />
        <MobileNavItem 
          to="/cart" 
          icon={<ShoppingCart className="w-6 h-6" />} 
          label="Carrito" 
          badge={totalItems} 
        />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label, badge }: { to: string; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-medium",
          isActive 
            ? "bg-opacity-10 text-primary" 
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )
      }
      style={({ isActive }) => isActive ? { backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' } : {}}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span 
          className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function MobileNavItem({ to, icon, label, badge }: { to: string; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "relative flex flex-col items-center justify-center w-full py-3 transition-colors",
          isActive ? "text-primary" : "text-gray-500 hover:text-gray-900"
        )
      }
      style={({ isActive }) => isActive ? { color: 'var(--color-primary)' } : {}}
    >
      <div className="relative">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span 
            className="absolute -top-1 -right-2 flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full text-[10px] font-bold text-white border-2 border-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium mt-1">{label}</span>
    </NavLink>
  );
}
