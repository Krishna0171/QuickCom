
import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Phone, Send, CheckCircle2, AlertCircle, Sparkles, User, FileText, HelpCircle, History } from 'lucide-react';
import { automation } from '../services/automation';
import { api } from '../services/api';

interface ContactSupportProps {
  onNavigate: (page: string) => void;
  onOpenChat?: () => void;
}

export const ContactSupport: React.FC<ContactSupportProps> = ({ onNavigate, onOpenChat }) => {
  const currentUser = api.getCurrentUser();
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    subject: 'General Inquiry',
    orderId: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

  // AI Suggestion debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.message.length > 15) {
        const suggestion = await automation.analyzeSupportQuery(formData.message);
        setAiSuggestion(suggestion);
      } else {
        setAiSuggestion('');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await api.createTicket({
        userId: currentUser?.id,
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        orderId: formData.orderId,
        message: formData.message
      });
      
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1000);
    } catch (err) {
      setIsSubmitting(false);
      alert("Failed to submit ticket. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-50">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Message Received!</h1>
        <p className="text-slate-500 text-lg mb-10 leading-relaxed">
          Thank you for reaching out. Our support team has been notified and we'll get back to you at <strong>{formData.email}</strong> within 2-4 business hours.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => onNavigate('my-tickets')}
            className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center"
          >
            <History className="h-5 w-5 mr-2" /> Track My Ticket
          </button>
          <button 
            onClick={() => setIsSuccess(false)}
            className="px-10 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
          >
            Back to Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="text-center mb-16 relative">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">How can we help?</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Whether you have a question about a product, need help with an order, or just want to give feedback, we're here for you.
        </p>
        
        {currentUser && (
          <button 
            onClick={() => onNavigate('my-tickets')}
            className="mt-8 inline-flex items-center px-6 py-3 bg-indigo-50 text-indigo-600 rounded-full font-bold hover:bg-indigo-100 transition-colors border border-indigo-100"
          >
            <History className="h-4 w-4 mr-2" /> Track Your Previous Tickets
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Live Chat</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">Available Mon-Fri from 9am to 6pm for instant assistance.</p>
            <button 
              onClick={onOpenChat}
              className="text-indigo-600 font-bold text-sm flex items-center hover:translate-x-1 transition-transform"
            >
              Start a conversation <Send className="h-4 w-4 ml-2" />
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Email Us</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">Send us a detailed message and we'll reply within 24 hours.</p>
            <a href="mailto:support@quickstore.com" className="text-emerald-600 font-bold text-sm flex items-center hover:translate-x-1 transition-transform">
              support@quickstore.com
            </a>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Call Support</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">Prefer to speak? Our agents are standing by for urgent issues.</p>
            <p className="text-amber-600 font-bold text-sm">+1 (800) QUICK-STORE</p>
          </div>
        </div>

        {/* Main Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Sparkles className="h-6 w-6 text-indigo-100" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
              <FileText className="h-6 w-6 mr-3 text-indigo-600" />
              Send us a ticket
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      placeholder="john@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                  <select 
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-all"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  >
                    <option>General Inquiry</option>
                    <option>Order Tracking</option>
                    <option>Refund Request</option>
                    <option>Product Feedback</option>
                    <option>Technical Issue</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Order ID (Optional)</label>
                  <div className="relative">
                    <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="ORD-XXXXXX"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={formData.orderId}
                      onChange={(e) => setFormData({...formData, orderId: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Your Message</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="How can we help you today?"
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>

              {/* AI Suggestion Display */}
              {aiSuggestion && (
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start space-x-3 animate-in fade-in slide-in-from-top-2">
                  <Sparkles className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-indigo-900/80 italic leading-snug">
                    <span className="font-bold mr-1">Smart Tip:</span> {aiSuggestion}
                  </p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Submit Support Ticket</span>
                    <Send className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
