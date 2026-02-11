
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Cart } from './pages/Cart';
import { ProductDetails } from './pages/ProductDetails';
import { AdminDashboard } from './pages/AdminDashboard';
import { Profile } from './pages/Profile';
import { MyOrders } from './pages/MyOrders';
import { OrderDetails } from './pages/OrderDetails';
import { FAQ } from './pages/FAQ';
import { ContactSupport } from './pages/ContactSupport';
import { MyTickets } from './pages/MyTickets';
import { Favorites } from './pages/Favorites';
import { Loader } from './components/Loader';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ChatBot } from './components/ChatBot';
import { DatabaseSetup } from './components/DatabaseSetup';
import { Product, CartItem, User, Order, Address, PaymentMethod } from './types';
import { api } from './services/api';
import { automation } from './services/automation';
import { CheckCircle, X, AlertTriangle, Package, Smartphone, Lock, Mail, Database, Terminal, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isGlobalLoading, setIsGlobalLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing QuickStore...');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState({ ready: false, needsSetup: false });
  const [configMissing, setConfigMissing] = useState<null | ReturnType<typeof api.getConfigStatus>>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [checkoutAddress, setCheckoutAddress] = useState<Address>({ street: '', city: '', state: '', pincode: '' });
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      // Step 1: Check if environment variables are even present
      const config = api.getConfigStatus();
      if (!config.api_key || !config.supabase_url || !config.supabase_anon_key) {
        setConfigMissing(config);
        setIsGlobalLoading(false);
        return;
      }

      // Step 2: Initialize DB structure
      const result = await api.initializeDatabase();
      setDbStatus({ ready: result.success, needsSetup: api.needsSetup });
      
      const currentUser = api.getCurrentUser();
      setUser(currentUser);
      if (currentUser?.address) setCheckoutAddress(currentUser.address);
      
      const savedCart = localStorage.getItem('qs_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
      
      if (result.success) {
        const favs = await api.getFavorites();
        setFavorites(favs);
      }
      setIsGlobalLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    localStorage.setItem('qs_cart', JSON.stringify(cart));
  }, [cart]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    setSelectedProductId(null);
    setSelectedOrderId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDetails = (id: string) => {
    setSelectedProductId(id);
    setCurrentPage('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToOrderDetails = (id: string) => {
    setSelectedOrderId(id);
    setCurrentPage('order-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showNotification(`Only ${product.stock} items in stock.`, 'error');
          return prev;
        }
        showNotification(`Updated quantity in cart!`);
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      showNotification('Added to cart!');
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const toggleFavorite = async (productId: string) => {
    const updated = await api.toggleFavorite(productId);
    setFavorites([...updated]);
    const isNowFav = updated.includes(productId);
    showNotification(isNowFav ? 'Added to Wishlist' : 'Removed from Wishlist');
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.min(item.stock, Math.max(1, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    showNotification('Removed from cart');
  };

  const handleCheckout = (shippingAddress: Address, paymentMethod: PaymentMethod) => {
    setCheckoutAddress(shippingAddress);
    if (!user) {
      setRedirectAfterLogin('cart');
      setCurrentPage('login');
      showNotification('Please login to complete your order', 'error');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Your Order',
      message: `Place order for $${(cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + (cart.reduce((sum, item) => sum + item.price * item.quantity, 0) > 100 ? 0 : 9.99)).toFixed(2)}?`,
      confirmText: 'Place Order',
      type: 'info',
      onConfirm: () => executeOrder(shippingAddress, paymentMethod),
    });
  };

  const executeOrder = async (shippingAddress: Address, paymentMethod: PaymentMethod) => {
    setIsGlobalLoading(true);
    setLoadingMessage('Processing your order...');
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = subtotal + shipping;
    try {
      await api.updateUserProfile({ address: shippingAddress });
      setUser(api.getCurrentUser());
      const order = await api.createOrder({
        userId: user!.id,
        customerName: user!.name,
        customerMobile: user!.mobile,
        customerEmail: user!.email,
        items: cart,
        total,
        paymentMethod,
        shippingAddress
      });
      const emailContent = await automation.generateConfirmationEmail(order);
      if (order.customerEmail) await automation.sendMockNotification('email', order.customerEmail, emailContent);
      await automation.sendMockNotification('whatsapp', order.customerMobile, `Order confirmed: ${order.id}`);
      setCart([]);
      setIsGlobalLoading(false);
      showNotification('Order placed successfully!');
      navigateToOrderDetails(order.id);
    } catch (err) {
      setIsGlobalLoading(false);
      showNotification('Checkout failed.', 'error');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const mobile = formData.get('mobile') as string;
    const password = formData.get('password') as string;
    const email = formData.get('email') as string;
    
    setIsGlobalLoading(true);
    setLoadingMessage('Authenticating...');
    try {
      const loggedInUser = await api.login(mobile, password, email);
      setUser(loggedInUser);
      if (loggedInUser.address && !checkoutAddress.street) setCheckoutAddress(loggedInUser.address);
      setIsGlobalLoading(false);
      showNotification(`Welcome, ${loggedInUser.name}!`);
      if (redirectAfterLogin) { setCurrentPage(redirectAfterLogin); setRedirectAfterLogin(null); }
      else navigateToHome();
    } catch (error: any) {
      setIsGlobalLoading(false);
      showNotification(error.message || 'Login failed', 'error');
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setCheckoutAddress({ street: '', city: '', state: '', pincode: '' });
    showNotification('Logged out');
    navigateToHome();
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page !== 'details') setSelectedProductId(null);
    if (page !== 'order-details') setSelectedOrderId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (configMissing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-10 animate-in zoom-in duration-300">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-50 rounded-3xl">
              <Terminal className="h-10 w-10 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 text-center mb-2">Configuration Required</h1>
          <p className="text-slate-500 text-center text-sm mb-8">QuickStore needs environment variables to connect to your database and AI services.</p>
          
          <div className="space-y-4 mb-8">
            {[
              { key: 'API_KEY', status: configMissing.api_key, label: 'Gemini AI Key' },
              { key: 'SUPABASE_URL', status: configMissing.supabase_url, label: 'Supabase Project URL' },
              { key: 'SUPABASE_ANON_KEY', status: configMissing.supabase_anon_key, label: 'Supabase Anon Key' }
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{item.key}</p>
                  <p className="text-sm font-bold text-slate-700">{item.label}</p>
                </div>
                {item.status ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
              </div>
            ))}
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-8 flex items-start space-x-3">
            <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Ensure you have a <b>.env</b> file in your project root or set these variables in your hosting provider's dashboard.
            </p>
          </div>

          <button onClick={() => window.location.reload()} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
            Refresh App
          </button>
        </div>
      </div>
    );
  }

  if (dbStatus.needsSetup) {
    return <DatabaseSetup onComplete={() => setDbStatus({ ready: true, needsSetup: false })} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {isGlobalLoading && <Loader fullPage message={loadingMessage} />}
      
      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
      />
      
      <Navbar 
        currentPage={currentPage}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
        user={user} 
        onLogout={() => setConfirmModal({
          isOpen: true,
          title: 'Sign Out',
          message: 'Are you sure?',
          onConfirm: handleLogout,
          confirmText: 'Logout',
          type: 'danger'
        })}
        onNavigate={handleNavigate}
        onShopClick={() => {
          if (currentPage !== 'home') handleNavigate('home');
          setTimeout(() => document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' }), 100);
        }}
      />

      {notification && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-10">
          <div className={`flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl border ${
            notification.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-red-600 border-red-500 text-white'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            <p className="font-bold text-sm">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="ml-2 hover:bg-white/20 p-1 rounded transition-colors"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      <main className="flex-1">
        {currentPage === 'home' && <Home onAddToCart={addToCart} onViewProduct={navigateToDetails} onNavigate={handleNavigate} favorites={favorites} onToggleFavorite={toggleFavorite} onOpenChat={() => setIsChatOpen(true)} />}
        {currentPage === 'details' && selectedProductId && <ProductDetails productId={selectedProductId} onBack={navigateToHome} onAddToCart={addToCart} onViewProduct={navigateToDetails} favorites={favorites} onToggleFavorite={toggleFavorite} />}
        {currentPage === 'cart' && <Cart items={cart} user={user} initialAddress={checkoutAddress} onUpdateQuantity={updateCartQuantity} onRemove={removeFromCart} onCheckout={handleCheckout} onBackToShop={navigateToHome} />}
        {currentPage === 'favorites' && <Favorites onAddToCart={addToCart} onViewProduct={navigateToDetails} favorites={favorites} onToggleFavorite={toggleFavorite} />}
        {currentPage === 'profile' && user && <Profile user={user} onUpdate={setUser} showNotification={showNotification} />}
        {currentPage === 'my-orders' && user && <MyOrders userId={user.id} onNavigateToHome={navigateToHome} onSelectOrder={navigateToOrderDetails} />}
        {currentPage === 'order-details' && selectedOrderId && <OrderDetails orderId={selectedOrderId} onBack={() => setCurrentPage('my-orders')} />}
        {currentPage === 'faq' && <FAQ />}
        {currentPage === 'contact' && <ContactSupport onNavigate={handleNavigate} onOpenChat={() => setIsChatOpen(true)} />}
        {currentPage === 'my-tickets' && <MyTickets />}
        {currentPage === 'login' && (
          <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-3xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 text-center">Join QuickStore</h2>
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700">Mobile</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input name="mobile" type="tel" required maxLength={10} className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input name="password" type="password" required className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl outline-none" />
                </div>
              </div>
              <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Login</button>
            </form>
          </div>
        )}
        {currentPage === 'admin-dashboard' && user?.role === 'admin' && <AdminDashboard />}
      </main>

      <ChatBot isOpen={isChatOpen} setIsOpen={setIsChatOpen} onNavigate={handleNavigate} />

      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-xs">
          &copy; {new Date().getFullYear()} QuickStore.
        </div>
      </footer>
    </div>
  );
};

export default App;
