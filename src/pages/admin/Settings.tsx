import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function Settings() {
  const { theme, updateTheme } = useTheme();

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTheme({ primaryColor: e.target.value });
  };

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTheme({ backgroundColor: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración de la Empresa</h2>
        <p className="text-gray-500 text-sm mt-1">Personaliza la apariencia del portal para tu marca.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        
        {/* Company Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Datos Generales</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
            <input 
              type="text" 
              value={theme.companyName}
              onChange={(e) => updateTheme({ companyName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de WhatsApp (con código de país)</label>
            <input 
              type="text" 
              value={theme.whatsappNumber}
              onChange={(e) => updateTheme({ whatsappNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
              placeholder="Ej. 5491123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL del Logo</label>
            <input 
              type="text" 
              value={theme.logoUrl}
              onChange={(e) => updateTheme({ logoUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
            />
            {theme.logoUrl && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 inline-block">
                <img src={theme.logoUrl} alt="Preview" className="h-12 object-contain" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Configuración de Envíos</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Costo de Envío a Domicilio Fijo (ARS)</label>
            <input 
              type="number" 
              value={theme.shippingCost || 0}
              onChange={(e) => updateTheme({ shippingCost: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
              placeholder="Ej. 2500"
            />
            <p className="text-xs text-gray-500 mt-1">Este valor se sumará automáticamente al total cuando el cliente elija envío a domicilio.</p>
          </div>
        </div>

        {/* Currents Accounts Settings */}
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Cuentas Corrientes</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje de Recargo por Demora (%)</label>
            <input 
              type="number" 
              value={theme.lateFeePercentage || 10}
              onChange={(e) => updateTheme({ lateFeePercentage: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
              placeholder="Ej. 10"
            />
            <p className="text-xs text-gray-500 mt-1">Porcentaje que se aplica para el recargo de deudas con más de 30 días de antigüedad.</p>
          </div>
        </div>

        {/* Appearance */}
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Apariencia</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color Principal</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={theme.primaryColor}
                  onChange={handleColorChange}
                  className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-sm text-gray-500 font-mono">{theme.primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color de Fondo</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={theme.backgroundColor}
                  onChange={handleBgChange}
                  className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-sm text-gray-500 font-mono">{theme.backgroundColor}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
