import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, ShoppingCart, Trash2, Truck, Store, User, CreditCard } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useSales, Sale, DeliveryMethod } from '../../context/SalesContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CartItem } from '../../context/CartContext';
import { useCustomers, Customer } from '../../context/CustomersContext';

export function POS() {
  const { products, reduceStock } = useInventory();
  const { recordSale } = useSales();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { customers, addTransaction } = useCustomers();

  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'cuenta_corriente'>('efectivo');

  // Customer Selection State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Custom Customer Data if no registered customer is selected
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [customCustomerPhone, setCustomCustomerPhone] = useState('');
  const [customCustomerAddress, setCustomCustomerAddress] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, products]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const addToCart = (product: any) => {
    if (product.stock <= 0) {
      alert('Producto sin stock');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('No hay suficiente stock');
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
      return;
    }
    const product = products.find(p => p.id === id);
    if (product && quantity > product.stock) {
      alert('No hay suficiente stock');
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = deliveryMethod === 'delivery' ? (theme.shippingCost || 0) : 0;
  const total = subtotal + shippingCost;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'cuenta_corriente' && !selectedCustomer) {
      alert('Debes seleccionar un cliente registrado para cobrar a cuenta corriente');
      return;
    }

    const finalCustomerName = selectedCustomer ? selectedCustomer.name : (customCustomerName || 'Consumidor Final');
    const finalCustomerPhone = selectedCustomer ? selectedCustomer.phone : customCustomerPhone;
    const finalCustomerAddress = selectedCustomer ? selectedCustomer.address : customCustomerAddress;

    const sale: Sale = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      sellerId: user?.id || 'unknown',
      sellerName: user?.name || 'Desconocido',
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      customerAddress: finalCustomerAddress,
      deliveryMethod,
      shippingCost,
      status: deliveryMethod === 'pickup' ? 'entregado' : 'recibido',
      items: cart,
      total
    };

    recordSale(sale);
    reduceStock(cart.map(item => ({ id: item.id, quantity: item.quantity })));
    
    // Register charge in current account if selected
    if (paymentMethod === 'cuenta_corriente' && selectedCustomer) {
      addTransaction(selectedCustomer.id, {
        description: `Compra (Venta #${sale.id.slice(-6)})`,
        amount: total
      });
    }

    setCart([]);
    setSelectedCustomer(null);
    setCustomCustomerName('');
    setCustomCustomerPhone('');
    setCustomCustomerAddress('');
    setDeliveryMethod('pickup');
    setPaymentMethod('efectivo');
    alert('Venta registrada con éxito');
  };

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-6">
      {/* Product Selection */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Punto de Venta</h2>
          <div className="relative mt-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar productos..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => addToCart(product)}
                className={`bg-white rounded-xl border p-3 cursor-pointer transition-all hover:shadow-md ${product.stock <= 0 ? 'opacity-50 grayscale' : 'border-gray-100'}`}
              >
                <div className="aspect-square rounded-lg bg-gray-50 mb-3 overflow-hidden">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight mb-1">{product.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-black text-gray-900">{formatPrice(product.price)}</span>
                  <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart / Checkout */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Venta Actual
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
              <p>No hay productos</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900 leading-tight">{item.name}</p>
                  <p className="text-xs text-gray-500">{formatPrice(item.price)} c/u</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</span>
                  <div className="flex items-center bg-gray-100 rounded-full p-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-sm">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-semibold text-xs text-gray-900">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center rounded-full text-white shadow-sm" style={{ backgroundColor: theme.primaryColor }}>
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-100 space-y-3">
          
          {/* Formulario Cliente / Método */}
          <div className="space-y-3 pb-3 border-b border-gray-100">
            {/* Selección de Cliente Registrado */}
            <div>
               <label className="block text-xs font-medium text-gray-700 mb-1">Cliente Registrado (Opcional)</label>
               <select
                 className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                 style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                 value={selectedCustomer ? selectedCustomer.id : ''}
                 onChange={(e) => {
                   const c = customers.find(c => c.id === e.target.value);
                   setSelectedCustomer(c || null);
                 }}
               >
                 <option value="">-- Cliente Casual --</option>
                 {customers.map(c => (
                   <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
               </select>
            </div>

            {/* Datos manuales si no hay cliente registrado */}
            {!selectedCustomer && (
              <div className="space-y-2">
                <input 
                  type="text" 
                  value={customCustomerName}
                  onChange={(e) => setCustomCustomerName(e.target.value)}
                  placeholder="Nombre Cliente Casual"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                className={`flex items-center justify-center gap-1 p-2 rounded-lg border transition-colors ${deliveryMethod === 'pickup' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                style={deliveryMethod === 'pickup' ? { borderColor: theme.primaryColor, color: theme.primaryColor, backgroundColor: `${theme.primaryColor}10` } : {}}
              >
                <Store className="w-4 h-4" />
                <span className="text-xs font-medium">Local</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod('delivery')}
                className={`flex items-center justify-center gap-1 p-2 rounded-lg border transition-colors ${deliveryMethod === 'delivery' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                style={deliveryMethod === 'delivery' ? { borderColor: theme.primaryColor, color: theme.primaryColor, backgroundColor: `${theme.primaryColor}10` } : {}}
              >
                <Truck className="w-4 h-4" />
                <span className="text-xs font-medium">Envío</span>
              </button>
            </div>

            {/* Dirección / Tel para el envío */}
            {deliveryMethod === 'delivery' && (
              <div className="space-y-2">
                 <input 
                  type="tel" 
                  value={selectedCustomer ? selectedCustomer.phone : customCustomerPhone}
                  onChange={(e) => !selectedCustomer && setCustomCustomerPhone(e.target.value)}
                  disabled={!!selectedCustomer}
                  placeholder="Teléfono (WhatsApp)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                />
                <input 
                  type="text" 
                  value={selectedCustomer ? selectedCustomer.address : customCustomerAddress}
                  onChange={(e) => !selectedCustomer && setCustomCustomerAddress(e.target.value)}
                  disabled={!!selectedCustomer}
                  placeholder="Dirección de entrega"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                />
              </div>
            )}
          </div>

          <div className="space-y-1 py-1">
            {deliveryMethod === 'delivery' && (
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            )}
            {deliveryMethod === 'delivery' && (
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Envío</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1">
              <span className="font-medium text-gray-500">Total a Cobrar</span>
              <span className="text-xl font-black text-gray-900">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Formas de Pago */}
          <div className="flex gap-2">
             <button
                type="button"
                onClick={() => setPaymentMethod('efectivo')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${paymentMethod === 'efectivo' ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                Pago Inmediato
              </button>
             <button
                type="button"
                onClick={() => {
                  if(!selectedCustomer) {
                    alert('Debes seleccionar un Cliente Registrado para usar Cuenta Corriente.');
                    return;
                  }
                  setPaymentMethod('cuenta_corriente');
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${paymentMethod === 'cuenta_corriente' ? 'bg-red-50 border-red-200 text-red-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <CreditCard className="w-3 h-3" />
                Cta. Corriente
              </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              onClick={() => { setCart([]); setSelectedCustomer(null); setCustomCustomerName(''); setCustomCustomerPhone(''); setCustomCustomerAddress(''); }}
              className="px-4 py-3 rounded-xl text-red-500 bg-red-50 font-bold hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="flex-1 py-3 px-4 rounded-xl text-white font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: theme.primaryColor }}
            >
              Confirmar Venta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
