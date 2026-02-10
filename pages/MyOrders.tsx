
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { Loader } from '../components/Loader';
import { ShoppingBag, Package, Truck, CheckCircle, Clock, ChevronRight, Search, Filter } from 'lucide-react';

interface MyOrdersProps {
  userId: string;
  onNavigateToHome: () => void;
  onSelectOrder: (orderId: string) => void;
}

export const MyOrders: React.FC<MyOrdersProps> = ({ userId, onNavigateToHome, onSelectOrder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      const allOrders = await api.getOrders();
      const userOrders = allOrders.filter(o => o.userId === userId);
      await new Promise(resolve => setTimeout(resolve, 600));
      setOrders(userOrders);
      setLoading(false);
    };
    loadOrders();
  }, [userId]);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'Shipped': return <Truck className="h-4 w-4 text-indigo-500" />;
      case 'Processing': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusBg = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Shipped': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Processing': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  if (loading) return <Loader message="Fetching your order history..." />;

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No orders yet</h2>
        <p className="text-slate-500 mb-8">When you place an order, it will appear here for you to track.</p>
        <button
          onClick={onNavigateToHome}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Your Orders</h1>
        <p className="text-slate-500 text-sm">Track and manage your recent purchases.</p>
      </div>

      <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm mb-8">
        <div className="flex flex-col gap-5">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Item..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <div className="flex items-center text-slate-400 mb-2 ml-1">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Filter Status</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', 'Processing', 'Shipped', 'Delivered'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s as any)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                    statusFilter === s 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                    <Package className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</p>
                    <p className="text-sm font-bold text-slate-900">{order.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                    <p className="text-sm font-bold text-indigo-600">${order.total.toFixed(2)}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 text-[10px] font-bold uppercase ${getStatusBg(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span>{order.status}</span>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img src={item.image} className="w-10 h-10 rounded-lg object-cover border border-slate-100" alt="" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-slate-500">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-[10px] text-slate-500 flex items-start">
                    <Truck className="h-3 w-3 mr-1.5 mt-0.5 shrink-0" />
                    <span className="leading-tight">
                      Shipping to: <span className="font-medium text-slate-700">
                        {order.shippingAddress.street}, {order.shippingAddress.city}
                      </span>
                    </span>
                  </div>
                  <button 
                    onClick={() => onSelectOrder(order.id)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-center px-4 py-2 bg-indigo-50/50 rounded-xl transition-colors w-full sm:w-auto"
                  >
                    View Details <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-400 text-sm">No orders match your current filters.</p>
          <button 
            onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
            className="mt-4 text-xs font-bold text-indigo-600 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
