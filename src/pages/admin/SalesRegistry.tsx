import React, { useState } from 'react';
import { Search, Calendar, MessageCircle, Truck, Store, Download, Trash2 } from 'lucide-react';
import { useSales, SaleStatus, Sale } from '../../context/SalesContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export function SalesRegistry() {
  const { sales, updateSaleStatus, clearSales } = useSales();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredSales = sales.filter(sale => 
    sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.id.includes(searchQuery)
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: SaleStatus) => {
    switch (status) {
      case 'recibido': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Recibido</span>;
      case 'preparacion': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">En Preparación</span>;
      case 'en_camino': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">En Camino</span>;
      case 'entregado': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Entregado</span>;
      default: return null;
    }
  };

  const handleNotify = (sale: Sale) => {
    if (!sale.customerPhone) {
      alert('Esta venta no tiene un número de teléfono asociado.');
      return;
    }

    let statusMsg = '';
    switch (sale.status) {
      case 'recibido': statusMsg = 'hemos recibido tu pedido y pronto comenzaremos a prepararlo.'; break;
      case 'preparacion': statusMsg = 'tu pedido ya está en preparación.'; break;
      case 'en_camino': statusMsg = 'tu pedido ya está en camino hacia tu domicilio 🚚.'; break;
      case 'entregado': statusMsg = 'tu pedido ha sido entregado. ¡Gracias por tu compra! 🎉'; break;
    }

    const message = `Hola ${sale.customerName}, te escribimos de *${theme.companyName}*.\n\nTe informamos que el estado de tu pedido (#${sale.id.slice(-6)}) ha sido actualizado: *${statusMsg}*`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${sale.customerPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleExportCSV = () => {
    if (sales.length === 0) return;
    
    // Create headers
    const headers = ['Fecha', 'Hora', 'ID', 'Cliente', 'Telefono', 'Direccion', 'Vendedor', 'Metodo', 'Estado', 'Subtotal', 'Costo_Envio', 'Total', 'Articulos'];
    
    // Create rows
    const rows = sales.map(sale => {
      const dateObj = new Date(sale.date);
      const dateFormatted = dateObj.toLocaleDateString('es-AR');
      const timeFormatted = dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      
      const itemsStr = sale.items.map(i => `${i.quantity}x ${i.name}`).join(' | ');
      
      return [
        `"${dateFormatted}"`,
        `"${timeFormatted}"`,
        `"${sale.id}"`,
        `"${sale.customerName}"`,
        `"${sale.customerPhone || ''}"`,
        `"${sale.customerAddress || ''}"`,
        `"${sale.sellerName}"`,
        `"${sale.deliveryMethod}"`,
        `"${sale.status}"`,
        sale.total - sale.shippingCost,
        sale.shippingCost,
        sale.total,
        `"${itemsStr}"`
      ].join(',');
    });
    
    // Inject BOM for proper UTF-8 decoding in Excel
    const csvContent = headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ventas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Mensaje de confirmación modal para borrar historial */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Borrar Historial</h3>
            <p className="text-gray-500 mb-6 font-medium text-sm">
              ¿Estás seguro de que deseas eliminar todas las ventas del registro? 
              <strong> Esta acción no se puede deshacer.</strong> Te recomendamos descargar la planilla CSV antes de continuar.
            </p>
            <div className="flex justify-end gap-3">
               <button 
                 onClick={() => setShowClearConfirm(false)} 
                 className="px-4 py-2 font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
               >
                 Cancelar
               </button>
               <button 
                 onClick={() => { clearSales(); setShowClearConfirm(false); }} 
                 className="px-4 py-2 font-bold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
               >
                 Sí, borrar todo
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registro de Ventas</h2>
          <p className="text-gray-500 text-sm mt-1">Historial completo de transacciones y envíos.</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleExportCSV}
            disabled={sales.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Descargar CSV
          </button>
          
          {user?.role === 'admin' && (
            <button 
              onClick={() => setShowClearConfirm(true)}
              disabled={sales.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar Datos
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por cliente, vendedor o ID..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Fecha / ID</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Artículos</th>
                <th className="px-6 py-3">Envío / Estado</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(sale => (
                <tr key={sale.id} className="bg-white border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(sale.date)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 font-mono">#{sale.id.slice(-6)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{sale.customerName}</div>
                    {sale.customerPhone && <div className="text-xs text-gray-500">{sale.customerPhone}</div>}
                    <div className="text-xs text-gray-400 mt-1">Vend: {sale.sellerName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {sale.items.map(item => (
                        <span key={item.id} className="text-xs">
                          {item.quantity}x {item.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2 items-start">
                      <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
                        {sale.deliveryMethod === 'delivery' ? (
                          <><Truck className="w-3 h-3" /> Envío a domicilio</>
                        ) : (
                          <><Store className="w-3 h-3" /> Retiro en local</>
                        )}
                      </div>
                      <select
                        value={sale.status}
                        onChange={(e) => updateSaleStatus(sale.id, e.target.value as SaleStatus)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1"
                        style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                      >
                        <option value="recibido">Recibido</option>
                        <option value="preparacion">En Preparación</option>
                        <option value="en_camino">En Camino</option>
                        <option value="entregado">Entregado</option>
                      </select>
                      {getStatusBadge(sale.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-bold text-gray-900">{formatPrice(sale.total)}</div>
                    {sale.deliveryMethod === 'delivery' && (
                      <div className="text-[10px] text-gray-500">Inc. envío: {formatPrice(sale.shippingCost)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleNotify(sale)}
                      disabled={!sale.customerPhone}
                      className="p-2 rounded-full text-green-600 hover:bg-green-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Notificar por WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron ventas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
