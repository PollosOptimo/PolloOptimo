import React from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Product } from '../data/mockProducts';

interface ProductCardProps {
  product: Product;
  key?: React.Key;
}

export function ProductCard({ product }: ProductCardProps) {
  const { items, addToCart, removeFromCart, updateQuantity } = useCart();
  const { theme } = useTheme();

  const cartItem = items.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-gray-700 shadow-sm">
            {product.category}
          </span>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 leading-tight mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
        
        <div className="flex items-end justify-between mt-auto">
          <div className="font-black text-lg text-gray-900">
            {formatPrice(product.price)}
          </div>
          
          {quantity === 0 ? (
            <button
              onClick={() => addToCart(product)}
              className="flex items-center justify-center w-10 h-10 rounded-full text-white shadow-sm transition-transform active:scale-95"
              style={{ backgroundColor: theme.primaryColor }}
              aria-label="Agregar al carrito"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center bg-gray-100 rounded-full p-1">
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-sm active:scale-95 transition-transform"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold text-sm text-gray-900">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-white shadow-sm active:scale-95 transition-transform"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
