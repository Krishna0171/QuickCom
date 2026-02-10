
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { Loader } from '../components/Loader';
import { 
  Package, 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Clock, 
  Truck, 
  CheckCircle, 
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Banknote
} from 'lucide-react';

interface OrderDetailsProps {
  orderId: string;
  onBack: () => void;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId, onBack }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      const orders = await api.getOrders();
      const found = orders.find(o => o.id === orderId);
      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));
      setOrder(found || null);
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case 'Processing': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      case 'Cancelled': return 0;
      default: return 1;
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'UPI': return <Smartphone className="h-4 w-4" />;
      case 'Card': return <CreditCard className="h-4 w-4" />;
      case 'COD': return <Banknote className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const currentStep = order ? getStatusStep(order.status) : 0;

  if (loading) return <Loader message="Loading order details..." />;

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
          <HelpCircle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Not Found</h2>
        <p className="text-slate-500 mb-8">We couldn't find the order details you're looking for.</p>
        <button
          onClick={onBack}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl"
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = order.total - subtotal;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to My Orders
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Order Details</h1>
          <p className="text-slate-500 flex items-center">
            ID: <span className="font-mono ml-2 text-indigo-600 font-bold">{order.id}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status:</span>
          <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
            order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
            order.status === 'Shipped' ? 'bg-indigo-50 text-indigo-700' :
            order.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items & Progress */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Tracker */}
          {order.status !== 'Cancelled' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center relative mb-2">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-1000"
                  style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                ></div>
                
                {[
                  { icon: Clock, label: 'Processing' },
                  { icon: Truck, label: 'Shipped' },
                  { icon: CheckCircle, label: 'Delivered' }
                ].map((step, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${
                      i + 1 <= currentStep ? 'bg-indigo-600 border-indigo-100 text-white' : 'bg-white border-slate-100 text-slate-300'
                    }`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${
                      i + 1 <= currentStep ? 'text-indigo-600' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center space-x-2">
              <Package className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900">Order Items</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 flex items-center space-x-6 hover:bg-slate-50/50 transition-colors">
                  <img src={item.image} className="w-16 h-16 rounded-xl object-cover border border-slate-100 shadow-sm" alt="" />
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{item.quantity} x ${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Address & Summary */}
        <div className="space-y-8">
          {/* Shipping Info */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-4 text-slate-900">
              <MapPin className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold">Shipping To</h3>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-1">
              <p className="font-bold text-slate-900">{order.customerName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p className="font-medium text-slate-900">{order.shippingAddress.pincode}</p>
              <div className="h-px bg-slate-100 my-4"></div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Contact Details</p>
              <p>{order.customerMobile}</p>
              {order.customerEmail && <p>{order.customerEmail}</p>}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm bg-indigo-50/20">
            <div className="flex items-center space-x-2 mb-6 text-slate-900">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold">Payment Summary</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-white rounded-xl border border-indigo-50 text-[10px] uppercase font-bold text-slate-400 mt-2">
                <div className="flex items-center space-x-1">
                   {getPaymentIcon(order.paymentMethod)}
                   <span>{order.paymentMethod}</span>
                </div>
                <span className="text-emerald-500">Confirmed</span>
              </div>
              <div className="h-px bg-slate-200 my-4"></div>
              <div className="flex justify-between text-lg font-bold text-slate-900">
                <span>Total Paid</span>
                <span className="text-indigo-600">${order.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white rounded-2xl border border-indigo-100 flex items-center space-x-3">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase leading-tight">
                Verified Secure <br/> Transaction
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
