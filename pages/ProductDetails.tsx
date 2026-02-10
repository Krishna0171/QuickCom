
import React, { useState, useEffect } from 'react';
import { Product, Review } from '../types';
import { api } from '../services/api';
import { automation } from '../services/automation';
import { Skeleton } from '../components/Loader';
import { ProductCard } from '../components/ProductCard';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, Sparkles, Share2, Twitter, Facebook, Link as LinkIcon, Star, User, MessageCircle } from 'lucide-react';

interface ProductDetailsProps {
  productId: string;
  onBack: () => void;
  onAddToCart: (p: Product) => void;
  onViewProduct: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ 
  productId, 
  onBack, 
  onAddToCart,
  onViewProduct,
  favorites,
  onToggleFavorite
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  
  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const currentUser = api.getCurrentUser();

  const loadReviews = async () => {
    const revs = await api.getReviews(productId);
    setReviews(revs);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const allProducts = await api.getProducts();
      const p = allProducts.find(item => item.id === productId);
      if (p) {
        setProduct(p);
        
        const related = allProducts
          .filter(item => item.category === p.category && item.id !== p.id && item.isActive)
          .slice(0, 4);
        setRelatedProducts(related);
        
        await loadReviews();
        
        if (currentUser) {
          const eligible = await api.canUserReviewProduct(currentUser.id, productId);
          setCanReview(eligible);
        }

        setLoading(false);
        
        const aiInsights = await automation.generateProductInsights(p);
        setInsights(aiInsights);
        setInsightsLoading(false);
      }
    };
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !comment.trim()) return;
    
    setIsSubmittingReview(true);
    await api.addReview({
      productId,
      userId: currentUser.id,
      userName: currentUser.name,
      rating,
      comment,
      isVerifiedPurchase: canReview
    });
    
    await loadReviews();
    setComment('');
    setShowReviewForm(false);
    setIsSubmittingReview(false);
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'native' | 'copy') => {
    if (!product) return;
    const url = window.location.href;
    const text = `Check out this ${product.name} on QuickStore!`;
    switch (platform) {
      case 'twitter': window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank'); break;
      case 'facebook': window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank'); break;
      case 'copy': navigator.clipboard.writeText(url); alert('Link copied to clipboard!'); break;
      case 'native': if (navigator.share) { navigator.share({ title: product.name, text: text, url: url }).catch(console.error); } break;
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Skeleton className="h-6 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-500">
      <button onClick={onBack} className="flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors group">
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to shopping
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-2 text-sm font-bold text-indigo-600 uppercase tracking-widest">{product.category}</div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{product.name}</h1>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center text-amber-500">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`h-4 w-4 ${avgRating && s <= Number(avgRating) ? 'fill-current' : 'text-slate-200'}`} />
              ))}
              <span className="ml-2 text-sm font-bold text-slate-600">{avgRating ? `${avgRating} (${reviews.length} reviews)` : 'No reviews yet'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-8">
            <span className="text-3xl font-bold text-slate-900">${product.price.toFixed(2)}</span>
            {product.stock > 0 ? (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100 uppercase">In Stock</span>
            ) : (
              <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-100 uppercase">Out of Stock</span>
            )}
          </div>

          <p className="text-slate-600 text-lg leading-relaxed mb-8">{product.description}</p>

          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 relative overflow-hidden">
            <div className="flex items-center space-x-2 mb-4 text-indigo-700">
              <Sparkles className="h-5 w-5 fill-indigo-200" />
              <h3 className="font-bold">Why you'll love this (AI generated)</h3>
            </div>
            {insightsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <ul className="space-y-3">
                {insights.map((insight, i) => (
                  <li key={i} className="flex items-start text-indigo-900/80 text-sm leading-snug">
                    <span className="mr-2 text-indigo-400 font-bold">•</span>{insight}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-auto space-y-6">
            <button 
              disabled={product.stock === 0}
              onClick={() => onAddToCart(product)}
              className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center transition-all shadow-xl ${
                product.stock === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              <ShoppingCart className="h-5 w-5 mr-3" /> Add to Cart
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-slate-500 text-sm"><Truck className="h-4 w-4" /><span>Fast shipping</span></div>
                <div className="flex items-center space-x-2 text-slate-500 text-sm"><ShieldCheck className="h-4 w-4" /><span>2-year warranty</span></div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Share:</span>
                <button onClick={() => handleShare('twitter')} className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-500 rounded-full transition-all"><Twitter className="h-4 w-4" /></button>
                <button onClick={() => handleShare('facebook')} className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-full transition-all"><Facebook className="h-4 w-4" /></button>
                <button onClick={() => handleShare('copy')} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-all"><LinkIcon className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="border-t border-slate-100 pt-16 mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Related Products</h2>
            <div className="h-1 flex-1 mx-8 bg-slate-50 rounded-full hidden md:block"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {relatedProducts.map(item => (
              <ProductCard key={item.id} product={item} isFavorite={favorites.includes(item.id)} onAddToCart={onAddToCart} onViewDetails={onViewProduct} onToggleFavorite={onToggleFavorite} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="border-t border-slate-100 pt-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Customer Reviews</h2>
            <p className="text-slate-500 text-sm">Real feedback from our community.</p>
          </div>
          {currentUser && (
            <button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center"
            >
              <MessageCircle className="h-4 w-4 mr-2" /> {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="mb-12 bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-50/50 animate-in slide-in-from-top-4">
            <h3 className="text-lg font-bold text-slate-900 mb-6">How was your experience?</h3>
            {!canReview && (
              <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start space-x-3">
                <ShieldCheck className="h-5 w-5 text-amber-500 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  Note: You haven't purchased this item yet. You can still leave a review, but it won't have a "Verified Purchase" badge.
                </p>
              </div>
            )}
            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button" onClick={() => setRating(s)} className="focus:outline-none transition-transform active:scale-90">
                      <Star className={`h-8 w-8 ${s <= rating ? 'text-amber-400 fill-current' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Review Content</label>
                <textarea 
                  required 
                  rows={4} 
                  placeholder="What did you like or dislike? How's the quality?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>
              <button 
                disabled={isSubmittingReview}
                className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {isSubmittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.length > 0 ? reviews.map(review => (
            <div key={review.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400 uppercase">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{review.userName}</h4>
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-current' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                {review.isVerifiedPurchase && (
                  <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                  </span>
                )}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 italic">"{review.comment}"</p>
              <p className="text-[10px] text-slate-400 font-medium">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          )) : (
            <div className="col-span-2 py-16 bg-white rounded-3xl border border-dashed border-slate-200 text-center flex flex-col items-center">
              <MessageCircle className="h-12 w-12 text-slate-200 mb-4" />
              <h3 className="text-slate-800 font-bold mb-1">No reviews yet</h3>
              <p className="text-slate-400 text-sm">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
