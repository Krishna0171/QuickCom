
import React, { useState } from 'react';
import { ShoppingCart, User, Package, LogOut, LayoutDashboard, UserCircle, ShoppingBag, ChevronDown, History, Heart } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  currentPage: string;
  cartCount: number;
  user: UserType | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  onShopClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentPage, 
  cartCount, 
  user, 
  onLogout, 
  onNavigate, 
  onShopClick 
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Shop', id: 'shop' },
    { name: 'FAQ', id: 'faq' },
    { name: 'Support', id: 'contact' },
    { name: 'Favorites', id: 'favorites' },
  ];

  const handleLinkClick = (id: string) => {
    if (id === 'shop') {
      if (onShopClick) {
        onShopClick();
      } else {
        onNavigate('home');
      }
    } else {
      onNavigate(id);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer group flex-shrink-0"
            onClick={() => {
              onNavigate('home');
              setShowUserMenu(false);
            }}
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg mr-2 group-hover:scale-110 transition-transform">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Quick<span className="text-indigo-600">Store</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8 ml-10">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`text-sm font-semibold transition-all hover:text-indigo-600 relative py-1 ${
                  currentPage === link.id || (link.id === 'shop' && currentPage === 'home')
                    ? 'text-indigo-600'
                    : 'text-slate-600'
                }`}
              >
                <span className="flex items-center">
                  {link.id === 'favorites' && <Heart className={`h-4 w-4 mr-1 ${currentPage === 'favorites' ? 'fill-indigo-600' : ''}`} />}
                  {link.name}
                </span>
                {(currentPage === link.id) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full animate-in fade-in slide-in-from-bottom-1" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1"></div>

          {/* Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user?.role === 'admin' && (
              <button 
                onClick={() => onNavigate('admin-dashboard')}
                className={`p-2 rounded-full transition-colors flex items-center space-x-1 ${
                  currentPage === 'admin-dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
                title="Admin Dashboard"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="hidden sm:inline text-sm font-bold">Admin</span>
              </button>
            )}
            
            <button 
              onClick={() => onNavigate('cart')}
              className={`relative p-2 rounded-full transition-colors ${
                currentPage === 'cart' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-indigo-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1 pl-2 hover:bg-slate-50 rounded-full border border-transparent hover:border-slate-200 transition-all"
                >
                  <div className="h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-20 animate-in zoom-in-95 fade-in duration-200 origin-top-right">
                      <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium tracking-wide truncate">{user.mobile}</p>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            onNavigate('profile');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 p-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        >
                          <UserCircle className="h-5 w-5" />
                          <span>My Profile</span>
                        </button>
                        <button 
                          onClick={() => {
                            onNavigate('favorites');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 p-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        >
                          <Heart className="h-5 w-5" />
                          <span>My Wishlist</span>
                        </button>
                        <button 
                          onClick={() => {
                            onNavigate('my-orders');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 p-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        >
                          <ShoppingBag className="h-5 w-5" />
                          <span>My Orders</span>
                        </button>
                        <button 
                          onClick={() => {
                            onNavigate('my-tickets');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 p-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        >
                          <History className="h-5 w-5" />
                          <span>My Tickets</span>
                        </button>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button 
                          onClick={() => {
                            onLogout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 p-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('login')}
                className={`px-4 py-2 text-sm font-bold rounded-full transition-all border ${
                  currentPage === 'login' 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                  : 'text-indigo-600 border-indigo-100 hover:bg-indigo-50'
                }`}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
