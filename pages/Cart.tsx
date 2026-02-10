
import React, { useState, useEffect } from 'react';
import { CartItem, Product, User, Address, PaymentMethod } from '../types';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, MapPin, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface CartProps {
  items: CartItem[];
  user: User | null;
  initialAddress?: Address;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: (address: Address, paymentMethod: PaymentMethod) => void;
  onBackToShop: () => void;
}

export const Cart: React.FC<CartProps> = ({ items, user, initialAddress, onUpdateQuantity, onRemove, onCheckout, onBackToShop }) => {
  const [address, setAddress] = useState<Address>(initialAddress || user?.address || {
    street: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Address | 'payment', string>>>({});
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  useEffect(() => {
    if (initialAddress && initialAddress.street) {
      setAddress(initialAddress);
    } else if (user?.address) {
      setAddress(user.address);
    }
  }, [user, initialAddress]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Address | 'payment', string>> = {};
    if (!address.street.trim()) newErrors.street = 'Street address is required';
    if (!address.city.trim()) newErrors.city = 'City is required';
    if (!address.state.trim()) newErrors.state = 'State is required';
    if (!address.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(address.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }
    if (!paymentMethod) {
      newErrors.payment = 'Please select a payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckoutClick = () => {
    if (validate() && paymentMethod) {
      onCheckout(address, paymentMethod);
    }
  };

  const updateAddress = (field: keyof Address, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof Address]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 max-w-xs mb-8">Looks like you haven't added anything to your cart yet. Let's change that!</p>
        <button 
          onClick={onBackToShop}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          Explore Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <ConfirmationModal 
        isOpen={itemToRemove !== null}
        title="Remove Item?"
        message="Are you sure you want to remove this item from your cart?"
        confirmText="Remove"
        type="danger"
        onConfirm={() => {
          if (itemToRemove) onRemove(itemToRemove);
          setItemToRemove(null);
        }}
        onClose={() => setItemToRemove(null)}
      />

      <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart ({items.length})</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex space-x-6">
              <img src={item.image} className="w-24 h-24 rounded-xl object-cover border border-slate-100" alt="" />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                    <button 
                      onClick={() => setItemToRemove(item.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-slate-500 text-sm">{item.category}</p>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="flex items-center space-x-4 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <button 
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="p-1 text-slate-500 hover:text-indigo-600 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="p-1 text-slate-500 hover:text-indigo-600 transition-colors"
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-lg font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-6">
              <MapPin className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Shipping Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="House No, Building, Street"
                  value={address.street}
                  onChange={(e) => updateAddress('street', e.target.value)}
                  className={`w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.street ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.street && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.street}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">City</label>
                <input
                  type="text"
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => updateAddress('city', e.target.value)}
                  className={`w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.city ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.city && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">State</label>
                <input
                  type="text"
                  placeholder="State"
                  value={address.state}
                  onChange={(e) => updateAddress('state', e.target.value)}
                  className={`w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.state ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.state && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.state}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pincode (6 Digits)</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="110001"
                  value={address.pincode}
                  onChange={(e) => updateAddress('pincode', e.target.value.replace(/\D/g, ''))}
                  className={`w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.pincode ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.pincode && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.pincode}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-6">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Payment Method</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'UPI', label: 'UPI Payment', icon: <Smartphone className="h-5 w-5" /> },
                { id: 'Card', label: 'Credit/Debit Card', icon: <CreditCard className="h-5 w-5" /> },
                { id: 'COD', label: 'Cash on Delivery', icon: <Banknote className="h-5 w-5" /> }
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => {
                    setPaymentMethod(method.id as PaymentMethod);
                    setErrors(prev => ({ ...prev, payment: undefined }));
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === method.id 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <div className={`mb-2 ${paymentMethod === method.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {method.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">{method.label}</span>
                </button>
              ))}
            </div>
            {errors.payment && <p className="text-red-500 text-[10px] mt-2 font-bold">{errors.payment}</p>}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-24">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-[10px] text-indigo-600 font-medium bg-indigo-50 p-2 rounded">
                  Add ${(100 - subtotal).toFixed(2)} more to qualify for Free Shipping!
                </p>
              )}
              <div className="h-px bg-slate-100 w-full" />
              <div className="flex justify-between text-xl font-bold text-slate-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckoutClick}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center"
            >
              Confirm & Pay <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            
            <div className="mt-6 flex items-center justify-center space-x-2 text-slate-400 text-xs">
              <ShieldCheck className="h-4 w-4" />
              <span>Payments are secure and encrypted.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
