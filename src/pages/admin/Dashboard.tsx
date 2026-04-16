import React, { useMemo } from 'react';
import { useSales } from '../../context/SalesContext';
import { useInventory } from '../../context/InventoryContext';
import { TrendingUp, Package, DollarSign, ShoppingBag } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function Dashboard() {
  const { sales } = useSales();
  const { products } = useInventory();
  const { theme } = useTheme();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalSales = sales.length;
    const itemsSold = sales.reduce((sum, sale) => 
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
    , 0);
    const lowStockItems = products.filter(p => p.stock < 10).length;

    return { totalRevenue, totalSales, itemsSold, lowStockItems };
  }, [sales, products]);

  const topProducts = useMemo(() => {
    const productCounts: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productCounts[item.id]) {
          productCounts[item.id] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productCounts[item.id].quantity += item.quantity;
        productCounts[item.id].revenue += (item.price * item.quantity);
      });
    });

    return Object.values(productCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [sales]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Resumen general de tu negocio.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Ingresos Totales" 
          value={formatPrice(stats.totalRevenue)} 
          icon={<DollarSign className="w-6 h-6 text-green-600" />} 
          color="bg-green-100"
        />
        <StatCard 
          title="Ventas Realizadas" 
          value={stats.totalSales.toString()} 
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />} 
          color="bg-blue-100"
        />
        <StatCard 
          title="Artículos Vendidos" 
          value={stats.itemsSold.toString()} 
          icon={<ShoppingBag className="w-6 h-6 text-purple-600" />} 
          color="bg-purple-100"
        />
        <StatCard 
          title="Alerta de Stock" 
          value={stats.lowStockItems.toString()} 
          icon={<Package className="w-6 h-6 text-orange-600" />} 
          color="bg-orange-100"
          subtitle="Productos con menos de 10 unidades"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Productos Más Vendidos</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantity} unidades vendidas</p>
                  </div>
                  <div className="font-bold text-gray-900">
                    {formatPrice(product.revenue)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aún no hay datos de ventas.</p>
          )}
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Últimas Ventas</h3>
          {sales.length > 0 ? (
            <div className="space-y-4">
              {sales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-semibold text-gray-900">{sale.customerName || 'Cliente Local'}</p>
                    <p className="text-xs text-gray-500">{new Date(sale.date).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatPrice(sale.total)}</p>
                    <p className="text-xs text-gray-500">Vendedor: {sale.sellerName}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aún no hay ventas registradas.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, subtitle }: { title: string, value: string, icon: React.ReactNode, color: string, subtitle?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      </div>
      <div className="text-3xl font-black text-gray-900">{value}</div>
      {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );
}
