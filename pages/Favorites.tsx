
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Heart, Search, ShoppingBag } from 'lucide-react';
import { Loader } from '../components/Loader';

interface FavoritesProps {
  onAddToCart: (p: Product) => void;
  onViewProduct: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const Favorites: React.FC<FavoritesProps> = ({ 
  onAddToCart, 
  onViewProduct, 
  favorites,
  onToggleFavorite 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      const allProducts = await api.getProducts();
      const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));
      setProducts(favoriteProducts);
      setLoading(false);
    };
    load();
  }, [favorites]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loader message="Loading your favorites..." />;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center">
            <Heart className="h-8 w-8 text-red-500 mr-3 fill-red-500" />
            My Wishlist
          </h1>
          <p className="text-slate-500 mt-1">Products you've saved for later.</p>
        </div>
        
        {products.length > 0 && (
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search in wishlist..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 text-slate-300">
            <Heart className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your wishlist is empty</h2>
          <p className="text-slate-500 max-w-sm mb-10 leading-relaxed">
            Found something you like? Click the heart icon to save it here for later.
          </p>
          <button 
            onClick={() => window.location.href = '#'} // This would effectively go to Shop
            className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center"
          >
            <ShoppingBag className="h-5 w-5 mr-2" /> Start Shopping
          </button>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              isFavorite={true}
              onAddToCart={onAddToCart} 
              onViewDetails={onViewProduct}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
          <p className="text-slate-400">No products match your search in wishlist.</p>
          <button onClick={() => setSearchQuery('')} className="mt-4 text-indigo-600 font-bold hover:underline">Clear Search</button>
        </div>
      )}
    </div>
  );
};
