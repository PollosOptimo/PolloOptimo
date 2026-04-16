import React from 'react';
import { NavLink, Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Package, Receipt, Users, Settings, LogOut, UserSquare2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Operator Restriction
  if (user.role === 'seller') {
    const allowedPaths = ['/admin/pos', '/admin/sales', '/admin/customers'];
    if (!allowedPaths.includes(location.pathname) && location.pathname !== '/admin') {
      // They went to a forbidden path. Redirect them safely.
      return <Navigate to="/admin/pos" replace />;
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 text-white flex flex-col md:fixed md:inset-y-0 md:left-0 z-50">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Panel Admin</h1>
          <p className="text-sm text-gray-400 mt-1">
            {user.name} <span className="text-xs px-1.5 py-0.5 bg-gray-800 rounded ml-1">{user.role === 'admin' ? 'Admin' : 'Operador'}</span>
          </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {user.role === 'admin' && (
            <AdminNavItem to="/admin" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" end />
          )}
          <AdminNavItem to="/admin/pos" icon={<Store className="w-5 h-5" />} label="Punto de Venta" />
          <AdminNavItem to="/admin/sales" icon={<Receipt className="w-5 h-5" />} label="Ventas" />
          <AdminNavItem to="/admin/customers" icon={<UserSquare2 className="w-5 h-5" />} label="Clientes" />
          
          {user.role === 'admin' && (
            <>
              <AdminNavItem to="/admin/inventory" icon={<Package className="w-5 h-5" />} label="Inventario" />
              <AdminNavItem to="/admin/users" icon={<Users className="w-5 h-5" />} label="Usuarios" />
              <AdminNavItem to="/admin/settings" icon={<Settings className="w-5 h-5" />} label="Configuración" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 md:ml-64 max-w-7xl mx-auto w-full">
        {user.role === 'seller' && location.pathname === '/admin' ? (
           <Navigate to="/admin/pos" replace />
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

function AdminNavItem({ to, icon, label, end }: { to: string; icon: React.ReactNode; label: string; end?: boolean }) {
  const { theme } = useTheme();
  
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium",
          isActive 
            ? "bg-white/10 text-white" 
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        )
      }
      style={({ isActive }) => isActive ? { backgroundColor: theme.primaryColor } : {}}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
