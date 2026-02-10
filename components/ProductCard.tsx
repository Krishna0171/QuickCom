
import React from 'react';
import { Product } from '../types';
import { ShoppingCart, Heart, Plus, Minus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onAddToCart: (p: Product) => void;
  onViewDetails: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isFavorite,
  onAddToCart, 
  onViewDetails, 
  onToggleFavorite 
}) => {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl sm:hover:-translate-y-1">
      <div 
        className="relative aspect-square overflow-hidden cursor-pointer"
        onClick={() => onViewDetails(product.id)}
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 sm:group-hover:scale-110"
        />
        <div className="absolute top-2 sm:top-3 right-2 sm:top-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
            className={`p-1.5 sm:p-2 backdrop-blur-sm rounded-full shadow-sm transition-all hover:scale-110 active:scale-90 ${
              isFavorite 
                ? 'bg-red-50 text-red-500 fill-red-500' 
                : 'bg-white/90 text-slate-600 hover:text-red-500'
            }`}
          >
            <Heart className="h-3.5 sm:h-4 w-3.5 sm:h-4" />
          </button>
        </div>
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] sm:text-[10px] font-bold rounded uppercase">
            Only {product.stock} left
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-2 py-1 bg-slate-800 text-white text-[8px] sm:text-xs font-bold rounded uppercase">OUT OF STOCK</span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <div className="mb-0.5 sm:mb-1 text-[9px] sm:text-xs font-semibold text-indigo-600 uppercase tracking-wider">
          {product.category}
        </div>
        <h3 
          className="text-sm sm:text-base font-bold text-slate-800 mb-1 line-clamp-1 cursor-pointer hover:text-indigo-600 transition-colors"
          onClick={() => onViewDetails(product.id)}
        >
          {product.name}
        </h3>
        <p className="text-slate-500 text-[10px] sm:text-sm line-clamp-2 h-7 sm:h-10 mb-2 sm:mb-4 leading-snug">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm sm:text-lg font-bold text-slate-900">
            ${product.price.toFixed(2)}
          </span>
          <button 
            disabled={product.stock === 0}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className={`flex items-center space-x-1 sm:space-x-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all ${
              product.stock === 0 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
            }`}
          >
            <Plus className="h-3 sm:h-4 w-3 sm:h-4" />
            <span className="text-[10px] sm:text-sm">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
