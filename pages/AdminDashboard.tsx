
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Product, Order, DashboardStats, OrderStatus, Category, SupportTicket, TicketStatus, Review } from '../types';
import { Loader } from '../components/Loader';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  ShoppingBag, Users, DollarSign, AlertCircle, Plus, 
  Search, Filter, ExternalLink, CheckCircle, Package, Truck, Trash2, X, MessageSquare, Send, User, ShieldCheck, Clock, Pencil, ArrowUpDown, ChevronRight, Star
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'tickets' | 'reviews'>('overview');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<Category | 'All'>('All');
  const [productSortBy, setProductSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'stock-low' | 'name-az'>('newest');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [orderSortBy, setOrderSortBy] = useState<'newest' | 'oldest' | 'amount-high' | 'amount-low'>('newest');

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminReply, setAdminReply] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketFilter, setTicketFilter] = useState<TicketStatus | 'All'>('All');

  const [reviewSearch, setReviewSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [s, o, p, t, r] = await Promise.all([
      api.getDashboardStats(),
      api.getOrders(),
      api.getProducts(),
      api.getTickets(),
      api.getReviews(),
      new Promise(resolve => setTimeout(resolve, 600))
    ]);
    setStats(s);
    setOrders(o);
    setProducts(p);
    setTickets(t);
    setReviews(r);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    setLoading(true);
    await api.updateOrderStatus(orderId, status);
    loadData();
  };

  const handleSendTicketReply = async () => {
    if (!selectedTicket || !adminReply.trim()) return;
    setLoading(true);
    const updated = await api.addTicketReply(selectedTicket.id, 'Admin', adminReply);
    setSelectedTicket(updated);
    setAdminReply('');
    loadData();
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    setLoading(true);
    const updated = await api.updateTicketStatus(ticketId, status);
    if (selectedTicket?.id === ticketId) setSelectedTicket(updated);
    loadData();
  };

  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      setLoading(true);
      await api.deleteProduct(productToDelete);
      setProductToDelete(null);
      await loadData();
    }
  };

  const confirmDeleteReview = async () => {
    if (reviewToDelete) {
      setLoading(true);
      await api.deleteReview(reviewToDelete);
      setReviewToDelete(null);
      await loadData();
    }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as Category,
      image: editingProduct?.image || `https://picsum.photos/seed/${Math.random()}/600/400`,
      stock: parseInt(formData.get('stock') as string),
      isActive: true,
    };

    if (editingProduct) {
      await api.updateProduct(editingProduct.id, productData);
    } else {
      await api.addProduct(productData);
    }
    
    setEditingProduct(null);
    setShowAddModal(false);
    await loadData();
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-100 text-emerald-700';
      case 'Processing': return 'bg-blue-100 text-blue-700';
      case 'Shipped': return 'bg-indigo-100 text-indigo-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getTicketStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700';
      case 'Closed': return 'bg-slate-200 text-slate-600';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = ticketFilter === 'All' || t.status === ticketFilter;
    const matchesSearch = t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                          t.email.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                          t.id.toLowerCase().includes(ticketSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredOrders = orders
    .filter(o => {
      const matchesFilter = orderStatusFilter === 'All' || o.status === orderStatusFilter;
      const searchLower = orderSearch.toLowerCase();
      const matchesSearch = o.id.toLowerCase().includes(searchLower) || 
                            o.customerName.toLowerCase().includes(searchLower) ||
                            o.customerEmail?.toLowerCase().includes(searchLower);
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      switch (orderSortBy) {
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount-high': return b.total - a.total;
        case 'amount-low': return a.total - b.total;
        case 'newest':
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const filteredProducts = products
    .filter(p => {
      const matchesCategory = productCategoryFilter === 'All' || p.category === productCategoryFilter;
      const searchLower = productSearch.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(searchLower) || 
                            p.description.toLowerCase().includes(searchLower);
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (productSortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'stock-low': return a.stock - b.stock;
        case 'name-az': return a.name.localeCompare(b.name);
        case 'newest':
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const filteredReviews = reviews.filter(r => 
    r.comment.toLowerCase().includes(reviewSearch.toLowerCase()) ||
    r.userName.toLowerCase().includes(reviewSearch.toLowerCase())
  );

  if (loading && !stats) return <Loader fullPage message="Accessing secure database..." />;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50 relative">
      {loading && stats && <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-[2px] rounded-3xl" />}
      
      <ConfirmationModal 
        isOpen={productToDelete !== null}
        title="Delete Product"
        message="Are you sure you want to permanently delete this product? This action cannot be undone."
        confirmText="Delete Product"
        type="danger"
        onConfirm={confirmDeleteProduct}
        onClose={() => setProductToDelete(null)}
      />

      <ConfirmationModal 
        isOpen={reviewToDelete !== null}
        title="Delete Review"
        message="Are you sure you want to permanently remove this customer review? It will no longer appear on product pages."
        confirmText="Remove Review"
        type="danger"
        onConfirm={confirmDeleteReview}
        onClose={() => setReviewToDelete(null)}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">Monitor your store performance and manage logistics.</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button 
            onClick={() => { setEditingProduct(null); setShowAddModal(true); }}
            className="flex-1 sm:flex-none justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-lg shadow-indigo-100"
          >
            <Plus className="h-4 w-4 mr-2" /> New Product
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 border-b border-slate-200 mb-8 overflow-x-auto scrollbar-hide">
        {['overview', 'orders', 'products', 'tickets', 'reviews'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 px-1 text-sm font-semibold transition-all capitalize whitespace-nowrap ${
              activeTab === tab 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'tickets' && stats?.openTicketsCount ? (
              <span className="flex items-center">
                {tab} <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] rounded-full">{stats.openTicketsCount}</span>
              </span>
            ) : tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && stats && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div onClick={() => setActiveTab('orders')} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded">+12.5%</span>
              </div>
              <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Revenue</h3>
              <p className="text-2xl font-bold text-slate-900">${stats.totalRevenue.toFixed(2)}</p>
            </div>

            <div onClick={() => setActiveTab('orders')} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Orders</h3>
              <p className="text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
            </div>

            <div onClick={() => setActiveTab('tickets')} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">Open Tickets</h3>
              <p className="text-2xl font-bold text-slate-900">{stats.openTicketsCount}</p>
            </div>

            <div onClick={() => setActiveTab('reviews')} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Star className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Reviews</h3>
              <p className="text-2xl font-bold text-slate-900">{stats.totalReviews}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Trend</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={orders.slice(0, 10).reverse().map(o => ({ date: new Date(o.createdAt).toLocaleDateString(), value: o.total }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="#6366f1" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-mono">{order.id}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-900">${order.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search orders..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">{order.id}</p>
                        <p className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${getStatusColor(order.status)}`}>{order.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {order.status === 'Processing' && <button onClick={() => handleUpdateStatus(order.id, 'Shipped')} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Truck className="h-4 w-4" /></button>}
                          {order.status === 'Shipped' && <button onClick={() => handleUpdateStatus(order.id, 'Delivered')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><CheckCircle className="h-4 w-4" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search reviews..." 
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.length > 0 ? filteredReviews.map(review => (
              <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm uppercase">
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
                  <button 
                    onClick={() => setReviewToDelete(review.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete Review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4 italic line-clamp-3">"{review.comment}"</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-auto pt-4 border-t border-slate-50">
                   <span>Product: {products.find(p => p.id === review.productId)?.name || 'Unknown'}</span>
                   <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 italic">
                No customer reviews found matching your search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Existing Tabs Logic for Products & Tickets... (omitted for brevity but kept functional) */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                  <img src={product.image} className="w-full sm:w-20 h-32 sm:h-20 rounded-xl object-cover" alt="" />
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{product.name}</h4>
                    <span className="text-[9px] sm:text-[10px] font-medium text-indigo-600 px-1.5 py-0.5 bg-indigo-50 rounded">{product.category}</span>
                    <p className="font-bold text-indigo-600 mt-2 text-sm sm:text-base">${product.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-50 mt-auto">
                  <button onClick={() => { setEditingProduct(product); setShowAddModal(true); }} className="flex-1 py-2 text-[10px] sm:text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center"><Pencil className="h-3 w-3 mr-1" /> Edit</button>
                  <button onClick={() => setProductToDelete(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Search tickets..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs" value={ticketSearch} onChange={(e) => setTicketSearch(e.target.value)} />
              </div>
            </div>
            <div className="space-y-3 overflow-y-auto pr-2">
              {filteredTickets.map(ticket => (
                <div key={ticket.id} onClick={() => setSelectedTicket(ticket)} className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedTicket?.id === ticket.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{ticket.subject}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mb-2">{ticket.email}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[600px]">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900">{selectedTicket.subject}</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl text-sm">{selectedTicket.message}</div>
                  {selectedTicket.replies.map(reply => (
                    <div key={reply.id} className={`p-4 rounded-2xl text-sm ${reply.sender === 'Admin' ? 'bg-indigo-600 text-white ml-auto' : 'bg-white border border-slate-100'}`}>{reply.message}</div>
                  ))}
                </div>
                <div className="p-4 border-t border-slate-50 flex gap-2">
                  <textarea placeholder="Reply..." className="flex-1 p-3 bg-slate-50 border rounded-xl text-sm outline-none" rows={1} value={adminReply} onChange={(e) => setAdminReply(e.target.value)}></textarea>
                  <button onClick={handleSendTicketReply} disabled={!adminReply.trim()} className="p-3 bg-indigo-600 text-white rounded-xl"><Send className="h-4 w-4" /></button>
                </div>
              </div>
            ) : (
              <div className="h-full bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center text-slate-400"><MessageSquare className="h-12 w-12 mb-4 opacity-20" /><h3 className="text-lg font-bold">Select a ticket</h3></div>
            )}
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setEditingProduct(null); }}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 animate-in zoom-in duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-100"><h2 className="text-xl font-bold text-slate-900">{editingProduct ? 'Edit Product' : 'Add Product'}</h2><button onClick={() => { setShowAddModal(false); setEditingProduct(null); }} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><X className="h-5 w-5" /></button></div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <input name="name" required placeholder="Name" defaultValue={editingProduct?.name} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input name="price" type="number" step="0.01" required placeholder="Price" defaultValue={editingProduct?.price} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                <input name="stock" type="number" required placeholder="Stock" defaultValue={editingProduct?.stock} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <select name="category" defaultValue={editingProduct?.category} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                {['Home & Kitchen', 'Electronics', 'Toys', 'Lifestyle', 'Utility'].map(c => <option key={c}>{c}</option>)}
              </select>
              <textarea name="description" rows={3} required placeholder="Description" defaultValue={editingProduct?.description} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"></textarea>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100">{editingProduct ? 'Update Product' : 'Create Product'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
