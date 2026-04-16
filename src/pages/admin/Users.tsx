import React, { useState } from 'react';
import { Plus, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { useAuth, User } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export function Users() {
  const { users, addUser, removeUser, user: currentUser } = useAuth();
  const { theme } = useTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({ role: 'seller' });

  const handleSave = () => {
    if (!formData.username || !formData.name || !formData.password) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    if (users.some(u => u.username === formData.username)) {
      alert('El nombre de usuario ya existe');
      return;
    }

    addUser({
      id: Date.now().toString(),
      username: formData.username,
      name: formData.name,
      role: formData.role as 'admin' | 'seller',
      password: formData.password
    });
    
    setIsAdding(false);
    setFormData({ role: 'seller' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-gray-500 text-sm mt-1">Administra los accesos al sistema.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium shadow-sm transition-transform active:scale-95"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => (
          <div key={u.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                  {u.role === 'admin' ? <Shield className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{u.name}</h3>
                  <p className="text-xs text-gray-500">@{u.username}</p>
                </div>
              </div>
              {u.id !== currentUser?.id && (
                <button 
                  onClick={() => { if(confirm('¿Eliminar usuario?')) removeUser(u.id) }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                {u.role === 'admin' ? 'Administrador' : 'Vendedor'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nuevo Usuario</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario (Login)</label>
                <input 
                  type="text" 
                  value={formData.username || ''} 
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input 
                  type="password" 
                  value={formData.password || ''} 
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select 
                  value={formData.role || 'seller'} 
                  onChange={e => setFormData({...formData, role: e.target.value as 'admin' | 'seller'})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                >
                  <option value="seller">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">
                Cancelar
              </button>
              <button onClick={handleSave} className="px-4 py-2 text-white rounded-xl font-medium" style={{ backgroundColor: theme.primaryColor }}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
