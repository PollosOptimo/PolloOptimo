import React, { useState } from 'react';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Truck, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

export function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const { theme } = useTheme();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const finalTotal = totalPrice + (deliveryMethod === 'delivery' ? (theme.shippingCost || 0) : 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) return;

    let message = `*NUEVO PEDIDO* 🛒\n\n`;
    message += `*Cliente:* ${customerName}\n`;
    if (customerPhone) message += `*Teléfono:* ${customerPhone}\n`;
    
    if (deliveryMethod === 'delivery') {
      message += `*Método:* Envío a domicilio 🚚\n`;
      message += `*Dirección:* ${customerAddress}\n`;
    } else {
      message += `*Método:* Retiro en local 🏪\n`;
    }
    
    if (notes) message += `*Notas:* ${notes}\n\n`;
    
    message += `*Detalle del pedido:*\n`;
    items.forEach(item => {
      message += `- ${item.quantity}x ${item.name} (${formatPrice(item.price)})\n`;
    });
    
    if (deliveryMethod === 'delivery') {
      message += `\n*Subtotal:* ${formatPrice(totalPrice)}\n`;
      message += `*Costo de envío:* ${formatPrice(theme.shippingCost || 0)}\n`;
    }
    
    message += `\n*Total a pagar:* ${formatPrice(finalTotal)}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${theme.whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    // Optional: clearCart() after successful redirect
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Parece que aún no has agregado ningún producto a tu pedido. Explora nuestro catálogo y encuentra lo que necesitas.
        </p>
        <Link 
          to="/"
          className="px-6 py-3 rounded-xl text-white font-medium shadow-sm transition-transform active:scale-95"
          style={{ backgroundColor: theme.primaryColor }}
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Cart Items */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Tu Pedido</h2>
          <button 
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Vaciar
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="p-4 flex gap-4">
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-20 h-20 object-cover rounded-xl bg-gray-50"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{item.name}</h3>
                  <p className="text-sm text-gray-500">{formatPrice(item.price)} c/u</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center bg-gray-100 rounded-full p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-sm active:scale-95 transition-transform"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full text-white shadow-sm active:scale-95 transition-transform"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="font-bold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Form */}
      <div className="w-full lg:w-96">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen de compra</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            {deliveryMethod === 'delivery' && (
              <div className="flex justify-between items-center text-gray-600">
                <span>Costo de envío</span>
                <span>{formatPrice(theme.shippingCost || 0)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-gray-900 font-medium">Total a pagar</span>
              <span className="text-2xl font-black text-gray-900">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-colors ${deliveryMethod === 'pickup' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                style={deliveryMethod === 'pickup' ? { borderColor: theme.primaryColor, color: theme.primaryColor, backgroundColor: `${theme.primaryColor}10` } : {}}
              >
                <Store className="w-6 h-6" />
                <span className="text-xs font-medium">Retiro en local</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod('delivery')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-colors ${deliveryMethod === 'delivery' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                style={deliveryMethod === 'delivery' ? { borderColor: theme.primaryColor, color: theme.primaryColor, backgroundColor: `${theme.primaryColor}10` } : {}}
              >
                <Truck className="w-6 h-6" />
                <span className="text-xs font-medium">Envío a domicilio</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
              <input 
                type="text" 
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
                style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (WhatsApp) *</label>
              <input 
                type="tel" 
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
                style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                placeholder="Ej. 1123456789"
              />
            </div>
            
            {deliveryMethod === 'delivery' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de entrega *</label>
                <input 
                  type="text" 
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
                  style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                  placeholder="Ej. Calle Falsa 123"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-shadow resize-none h-20"
                style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                placeholder="Instrucciones de entrega, etc."
              />
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95 mt-6"
              style={{ backgroundColor: theme.primaryColor }}
            >
              Confirmar por WhatsApp
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-xs text-center text-gray-500 mt-3">
              Serás redirigido a WhatsApp para finalizar la compra con un asesor.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
