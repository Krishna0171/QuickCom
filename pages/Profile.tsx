
import React, { useState, useEffect } from 'react';
import { User, Address } from '../types';
import { api } from '../services/api';
import { Loader } from '../components/Loader';
import { User as UserIcon, Mail, Smartphone, MapPin, Save, ShieldCheck } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdate, showNotification }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email || '',
    address: user.address || {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.updateUserProfile(formData);
      onUpdate(updated);
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      showNotification('Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = (field: keyof Address, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl font-bold border border-white/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-indigo-100 flex items-center text-sm">
                <Smartphone className="h-3 w-3 mr-1" /> {user.mobile}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Email Address (Optional)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">Saved Address</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => updateAddress('street', e.target.value)}
                    placeholder="House No, Street, Locality"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">City</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => updateAddress('city', e.target.value)}
                      placeholder="City"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">State</label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => updateAddress('state', e.target.value)}
                      placeholder="State"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.address.pincode}
                    onChange={(e) => updateAddress('pincode', e.target.value.replace(/\D/g, ''))}
                    placeholder="110001"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" /> Save Profile
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center space-x-2 text-slate-400 text-xs py-4 bg-slate-50 rounded-xl">
            <ShieldCheck className="h-4 w-4" />
            <span>Your data is stored securely on your device.</span>
          </div>
        </form>
      </div>
    </div>
  );
};
