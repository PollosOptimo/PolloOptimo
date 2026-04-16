import React, { useState, useMemo } from 'react';
import { Search, Plus, CreditCard, UserPlus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { useCustomers, Customer, CustomerTransaction } from '../../context/CustomersContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

// Helper: Calculate debt older than 30 days based on FIFO strategy
function calculateLateAmountBase(history: CustomerTransaction[]): number {
  const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let paymentsPool = 0;
  // accumulate all payments
  sorted.forEach(tx => {
    if (tx.amount < 0) {
      paymentsPool += Math.abs(tx.amount);
    }
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let lateBase = 0;

  sorted.forEach(tx => {
    if (tx.amount > 0) {
      // It's a charge
      if (paymentsPool >= tx.amount) {
        paymentsPool -= tx.amount;
      } else {
        const unpaidPortion = tx.amount - paymentsPool;
        paymentsPool = 0; // pool exhausted

        // if this charge is older than 30 days, add to lateBase
        if (new Date(tx.date) < thirtyDaysAgo) {
          lateBase += unpaidPortion;
        }
      }
    }
  });

  return lateBase;
}

export function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, addTransaction } = useCustomers();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);

  // New Customer Form
  const [formData, setFormData] = useState({ name: '', dni: '', email: '', phone: '', address: '' });

  // New Transaction Form
  const [txData, setTxData] = useState({ description: '', amount: '' });
  const [txType, setTxType] = useState<'charge' | 'payment'>('payment');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone.includes(searchQuery) ||
      (c.dni && c.dni.includes(searchQuery))
    );
  }, [searchQuery, customers]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dni) return;

    addCustomer({
      id: Date.now().toString(),
      name: formData.name,
      dni: formData.dni,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      balance: 0,
      history: [],
      lateFeeEnabled: false
    });

    setFormData({ name: '', dni: '', email: '', phone: '', address: '' });
    setIsAdding(false);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !txData.amount || !txData.description) return;

    const amount = Number(txData.amount) * (txType === 'charge' ? 1 : -1);

    addTransaction(selectedCustomer.id, {
      description: txData.description,
      amount
    });

    setTxData({ description: '', amount: '' });
    setIsAddingTransaction(false);
  };

  const handleCalculateLateFee = () => {
    if (!selectedCustomer) return;
    const base = calculateLateAmountBase(selectedCustomer.history);
    if (base <= 0) {
      alert('El cliente no tiene deuda pendiente mayor a 30 días.');
      return;
    }
    const surchargeAmount = base * ((theme.lateFeePercentage || 10) / 100);
    setTxType('charge');
    setTxData({
      description: 'Recargo por mora (+30 días)',
      amount: surchargeAmount.toFixed(2)
    });
    setIsAddingTransaction(true);
  };

  // Keep selectedCustomer in sync when customers update (hacky but works for UI refresh)
  React.useEffect(() => {
    if (selectedCustomer) {
      setSelectedCustomer(customers.find(c => c.id === selectedCustomer.id) || null);
    }
  }, [customers]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clientes & Cuentas Corrientes</h2>
          <p className="text-gray-500 text-sm mt-1">Gestiona saldos, entregas parciales y recargos.</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setSelectedCustomer(null); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <UserPlus className="w-5 h-5" />
          <span className="hidden sm:inline">Nuevo Cliente</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[500px]">
        {/* Customer List */}
        <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, DNI..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:bg-white transition-all outline-none"
                style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay clientes registrados.
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {filteredCustomers.map(customer => (
                  <li 
                    key={customer.id}
                    onClick={() => { setSelectedCustomer(customer); setIsAdding(false); setIsAddingTransaction(false); }}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center ${selectedCustomer?.id === customer.id ? 'bg-blue-50/50' : ''}`}
                  >
                    <div>
                      <p className="font-bold text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-500">DNI: {customer.dni || 'No registrado'}</p>
                    </div>
                    <div className={`font-bold ${customer.balance > 0 ? 'text-red-500' : customer.balance < 0 ? 'text-green-500' : 'text-gray-900'}`}>
                      {formatPrice(Math.abs(customer.balance))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Info Area */}
        <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full overflow-hidden">
          {isAdding ? (
            <div className="max-w-md overflow-y-auto pr-2">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Crear Nuevo Cliente</h3>
              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
                    <input
                      required
                      type="text"
                      value={formData.dni}
                      onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico (Opcional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-6 py-2 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          ) : selectedCustomer ? (
            <div className="flex flex-col h-full min-h-0">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                  <div className="text-sm text-gray-500 mt-2 grid grid-cols-2 gap-x-6 gap-y-1">
                    <span><strong>DNI:</strong> {selectedCustomer.dni || 'No registrado'}</span>
                    <span><strong>Tel:</strong> {selectedCustomer.phone || '-'}</span>
                    <span className="col-span-2"><strong>Email:</strong> {selectedCustomer.email || '-'}</span>
                    <span className="col-span-2"><strong>Dir:</strong> {selectedCustomer.address || '-'}</span>
                  </div>
                  <div className="mt-4 flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        checked={selectedCustomer.lateFeeEnabled || false}
                        onChange={(e) => updateCustomer(selectedCustomer.id, { lateFeeEnabled: e.target.checked })}
                        disabled={user?.role !== 'admin'}
                      />
                      <span className={`text-sm font-medium ${selectedCustomer.lateFeeEnabled ? 'text-red-600' : 'text-gray-500'}`}>
                        Sujeto a recargos corporativos (+30 días)
                      </span>
                    </label>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500 mb-1">Saldo Actual</p>
                  <p className={`text-3xl font-black ${selectedCustomer.balance > 0 ? 'text-red-500' : selectedCustomer.balance < 0 ? 'text-green-500' : 'text-gray-900'}`}>
                    {formatPrice(Math.abs(selectedCustomer.balance))}
                  </p>
                  <div className="text-xs font-bold text-gray-400 mt-1 uppercase">
                    {selectedCustomer.balance > 0 ? 'Adeuda a empresa' : selectedCustomer.balance < 0 ? 'A favor cliente' : 'Al día'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-6">
                <button
                  onClick={() => { setIsAddingTransaction(true); setTxType('payment'); setTxData({description: 'Entrega parcial / Pago a cuenta', amount: ''})}}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" /> Pago / Entrega Parcial
                </button>
                <button
                  onClick={() => { setIsAddingTransaction(true); setTxType('charge'); setTxData({description: 'Venta manual / Cargo', amount: ''})}}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium transition-colors text-sm"
                >
                  <CreditCard className="w-4 h-4" /> Registrar Deuda / Cargo
                </button>
                
                {selectedCustomer.lateFeeEnabled && selectedCustomer.balance > 0 && (
                  <button
                    onClick={handleCalculateLateFee}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 font-medium transition-colors text-sm"
                  >
                    <AlertCircle className="w-4 h-4" /> Calcular Recargo
                  </button>
                )}

                {user?.role === 'admin' && (
                  <button
                    onClick={() => deleteCustomer(selectedCustomer.id)}
                    className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 font-medium transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </button>
                )}
              </div>

              {isAddingTransaction && (
                <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    {txType === 'payment' ? <span className="text-green-600">Nuevo Pago / Entrega</span> : <span className="text-red-600">Nuevo Cargo a la Cuenta</span>}
                  </h4>
                  <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Monto (ARS) *</label>
                      <input
                        required
                        type="number"
                        min="1"
                        step="0.01"
                        value={txData.amount}
                        onChange={(e) => setTxData({ ...txData, amount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Concepto *</label>
                      <input
                        required
                        type="text"
                        value={txData.description}
                        onChange={(e) => setTxData({ ...txData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                      />
                    </div>
                    <div className="md:col-span-1 flex gap-2">
                      <button type="submit" className={`flex-1 py-2 px-4 rounded-lg text-white font-medium ${txType === 'payment' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                        Guardar
                      </button>
                      <button type="button" onClick={() => setIsAddingTransaction(false)} className="py-2 px-4 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                <h4 className="font-bold text-gray-900 mb-4 sticky top-0 bg-white py-2">Historial de Movimientos</h4>
                {selectedCustomer.history.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay movimientos registrados para este cliente.</p>
                ) : (
                  <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                    {selectedCustomer.history.map(tx => (
                      <div key={tx.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{tx.description}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(tx.date)}
                          </p>
                        </div>
                        <div className={`font-bold ${tx.amount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {tx.amount > 0 ? '+' : ''}{formatPrice(tx.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <UserPlus className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-gray-500 text-center px-4">Selecciona un cliente para ver su cuenta corriente<br/>o crea uno nuevo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
