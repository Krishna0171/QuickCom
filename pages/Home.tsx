
import React, { useState, useEffect, useRef } from 'react';
import { Product, Category, Review } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Skeleton } from '../components/Loader';
import { ArrowRight, Zap, ShieldCheck, Truck, Search, MessageCircle, Mail, Phone, ExternalLink, Filter, ArrowUpDown, Star, Quote } from 'lucide-react';

interface HomeProps {
  onAddToCart: (p: Product) => void;
  onViewProduct: (id: string) => void;
  onNavigate: (page: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onOpenChat?: () => void;
}

const CATEGORIES: Category[] = ['Home & Kitchen', 'Toys', 'Electronics', 'Lifestyle', 'Utility'];

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name-az' | 'name-za';

export const Home: React.FC<HomeProps> = ({ 
  onAddToCart, 
  onViewProduct, 
  onNavigate, 
  favorites,
  onToggleFavorite,
  onOpenChat
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [loading, setLoading] = useState(true);
  const productsSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const load = async () => {
      const [pData, rData] = await Promise.all([
        api.getProducts(),
        api.getReviews(),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      setProducts(pData.filter(p => p.isActive));
      // Only keep high rated reviews for home page showcase
      setReviews(rData.filter(r => r.rating >= 4).slice(0, 3));
      setLoading(false);
    };
    load();
  }, []);

  const scrollToProducts = () => {
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredAndSortedProducts = products
    .filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'name-az': return a.name.localeCompare(b.name);
        case 'name-za': return b.name.localeCompare(a.name);
        case 'newest': 
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Default reviews if none exist
  const sampleReviews = [
    { userName: "Elena M.", comment: "QuickStore has the best curated items for my kitchen. The precision scale is a game changer for my weekend baking.", rating: 5 },
    { userName: "Jason D.", comment: "Excellent range of toys. My kids love the wooden building blocks. Safe, natural and very high quality!", rating: 5 },
    { userName: "Rishi K.", comment: "Beautiful home decor items at competitive prices. Highly recommend the lifestyle collection for unique gifts.", rating: 4 }
  ];

  const reviewsToShow = reviews.length > 0 ? reviews : sampleReviews;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative h-[400px] sm:h-[550px] overflow-hidden bg-slate-900 flex items-center">
        <div className="absolute inset-0 z-0 opacity-50">
          <img 
            src="https://images.unsplash.com/photo-1616489953149-8e7926868847?auto=format&fit=crop&q=80&w=2000" 
            alt="Warm Modern Home Interior" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-white max-w-4xl">
          <div className="inline-block px-3 py-1 mb-6 bg-indigo-500/20 backdrop-blur-md rounded-full border border-indigo-400/30 text-indigo-100 text-sm font-semibold">
            🏠 Curated for Home & Family
          </div>
          <h1 className="text-3xl sm:text-6xl font-extrabold mb-6 leading-tight">
            Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400">Home & Living Space.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-200 mb-8 max-w-2xl leading-relaxed">
            Discover a handpicked collection of premium kitchen essentials, imaginative toys, and modern lifestyle products designed to bring comfort and joy to your home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={scrollToProducts}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center group"
            >
              Explore Collection <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <div className="container mx-auto px-4 sm:px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: <Zap className="text-indigo-500" />, title: 'Next-Day Delivery', desc: 'Orders over $50 ship fast.' },
            { icon: <ShieldCheck className="text-emerald-500" />, title: 'Quality Guaranteed', desc: 'Handpicked and tested items.' },
            { icon: <Truck className="text-amber-500" />, title: 'Free Returns', desc: 'Easy 30-day return policy.' }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-100 flex items-center space-x-4">
              <div className="p-3 bg-slate-50 rounded-xl shrink-0">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">{feature.title}</h4>
                <p className="text-xs sm:text-sm text-slate-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Feed */}
      <section id="featured-products" ref={productsSectionRef} className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 scroll-mt-20">
        <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="w-full lg:w-1/3">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Our Favorites</h2>
              <p className="text-slate-500 text-sm">Essentials for the contemporary home.</p>
            </div>
            
            <div className="w-full lg:w-2/3 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
                />
              </div>
              <div className="relative w-full sm:min-w-[200px] sm:w-auto">
                <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full pl-11 pr-4 py-3 sm:py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-bold text-sm text-slate-600 transition-all cursor-pointer shadow-sm"
                >
                  <option value="newest">Recently Added</option>
                  <option value="price-low">Price: Lowest first</option>
                  <option value="price-high">Price: Highest first</option>
                  <option value="name-az">A-Z Name</option>
                  <option value="name-za">Z-A Name</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center text-slate-400 mb-3 ml-1">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Shop by Category</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setActiveCategory('All')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                  activeCategory === 'All' 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Collections
              </button>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                    activeCategory === cat 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-slate-100 space-y-4">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {filteredAndSortedProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isFavorite={favorites.includes(product.id)}
                onAddToCart={onAddToCart} 
                onViewDetails={onViewProduct}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 sm:p-20 rounded-[1.5rem] sm:rounded-[3rem] text-center border-2 border-dashed border-slate-200">
            <Search className="h-12 sm:h-16 w-12 sm:w-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-700">No matching items found</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">Try adjusting your category or keywords.</p>
            <button 
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
                setSortBy('newest');
              }}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What Our Community Says</h2>
            <div className="flex justify-center items-center space-x-1 text-amber-500">
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <span className="ml-3 text-sm font-bold text-slate-600">Loved by 1,000+ happy homes</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviewsToShow.map((rev, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 relative group hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
                <Quote className="absolute top-6 right-8 h-8 w-8 text-indigo-100 group-hover:text-indigo-600 transition-colors" />
                <div className="flex items-center space-x-1 text-amber-500 mb-4">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`h-3 w-3 ${s <= (rev as any).rating ? 'fill-current' : 'text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-slate-600 italic leading-relaxed mb-6">"{rev.comment}"</p>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    {rev.userName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{rev.userName}</h4>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Verified Resident</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Home Support Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 md:py-24 border-t border-slate-100">
        <div className="bg-slate-900 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

          <div className="relative z-10 max-w-xl text-center lg:text-left">
            <h2 className="text-2xl sm:text-5xl font-extrabold text-white mb-6">Need help with your home essentials?</h2>
            <p className="text-slate-400 text-base sm:text-lg mb-10 leading-relaxed">
              Our support team is passionate about home & lifestyle. We are available 24/7 to help you with your choice, order, or shipping queries.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => onNavigate('contact')}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center shadow-xl shadow-black/20"
              >
                Get Support <ExternalLink className="ml-2 h-4 w-4" />
              </button>
              <button 
                onClick={() => onNavigate('faq')}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-all"
              >
                Read FAQs
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full lg:w-auto relative z-10">
            {[
              { icon: <MessageCircle className="h-6 w-6 text-indigo-400" />, label: 'Home Chat', desc: 'Instant reply', onClick: onOpenChat },
              { icon: <Mail className="h-6 w-6 text-emerald-400" />, label: 'Email Desk', desc: 'Expert help' },
              { icon: <Phone className="h-6 w-6 text-amber-400" />, label: 'Call Us', desc: 'Talk to us' },
              { icon: <Zap className="h-6 w-6 text-indigo-400" />, label: 'AI Support', desc: 'Quick fixes', onClick: onOpenChat }
            ].map((s, idx) => (
              <div 
                key={idx} 
                onClick={s.onClick}
                className={`bg-white/5 backdrop-blur-sm p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 hover:bg-white/10 transition-colors ${s.onClick ? 'cursor-pointer hover:border-indigo-400/50' : ''}`}
              >
                <div className="mb-4">{s.icon}</div>
                <h4 className="text-white font-bold text-sm sm:text-base mb-1">{s.label}</h4>
                <p className="text-slate-500 text-[10px] sm:text-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
