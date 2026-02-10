
import React, { useState, useEffect } from 'react';
import { SupportTicket, TicketStatus } from '../types';
import { api } from '../services/api';
import { Loader } from '../components/Loader';
import { History, MessageSquare, Clock, CheckCircle, XCircle, ChevronRight, Send, ArrowLeft, User, ShieldCheck } from 'lucide-react';

export const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const currentUser = api.getCurrentUser();

  const loadTickets = async () => {
    if (!currentUser) return;
    setLoading(true);
    const allTickets = await api.getTickets();
    const userTickets = allTickets.filter(t => t.userId === currentUser.id);
    setTickets(userTickets);
    setLoading(false);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSendReply = async () => {
    if (!selectedTicket || !reply.trim() || isSending) return;
    setIsSending(true);
    try {
      const updated = await api.addTicketReply(selectedTicket.id, 'User', reply);
      setSelectedTicket(updated);
      setReply('');
      loadTickets();
    } catch (err) {
      alert("Failed to send reply.");
    } finally {
      setIsSending(false);
    }
  };

  const getStatusStyle = (status: TicketStatus) => {
    switch (status) {
      case 'Open': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Resolved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Closed': return 'bg-slate-50 text-slate-500 border-slate-100';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  if (loading) return <Loader message="Loading your tickets..." />;

  if (selectedTicket) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setSelectedTicket(null)}
          className="flex items-center text-slate-500 hover:text-indigo-600 mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to all tickets
        </button>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
                <span className="text-xs font-mono text-slate-400">{selectedTicket.id}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{selectedTicket.subject}</h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Started On</p>
              <p className="text-sm font-medium text-slate-600">{new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex-1 p-8 overflow-y-auto max-h-[400px] space-y-6">
            {/* Initial Message */}
            <div className="flex flex-col items-start max-w-[85%]">
              <div className="bg-slate-100 text-slate-800 p-4 rounded-2xl rounded-tl-none text-sm">
                <p className="font-bold mb-1 flex items-center">
                  <User className="h-3 w-3 mr-1" /> You
                </p>
                {selectedTicket.message}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 ml-1">{new Date(selectedTicket.createdAt).toLocaleTimeString()}</span>
            </div>

            {/* Replies */}
            {selectedTicket.replies.map((reply) => (
              <div 
                key={reply.id} 
                className={`flex flex-col max-w-[85%] ${reply.sender === 'Admin' ? 'items-end ml-auto' : 'items-start'}`}
              >
                <div className={`p-4 rounded-2xl text-sm ${
                  reply.sender === 'Admin' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  <p className="font-bold mb-1 flex items-center">
                    {reply.sender === 'Admin' ? <ShieldCheck className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                    {reply.sender === 'Admin' ? 'QuickStore Support' : 'You'}
                  </p>
                  {reply.message}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {new Date(reply.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>

          {selectedTicket.status !== 'Closed' && (
            <div className="p-6 border-t border-slate-50 bg-white">
              <div className="relative">
                <textarea
                  placeholder="Type your reply here..."
                  className="w-full pl-4 pr-16 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                  rows={2}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                ></textarea>
                <button 
                  onClick={handleSendReply}
                  disabled={!reply.trim() || isSending}
                  className="absolute right-3 bottom-3 p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  {isSending ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">My Support Tickets</h1>
          <p className="text-slate-500">Manage and track your conversations with our team.</p>
        </div>
        <div className="p-4 bg-indigo-50 rounded-2xl">
          <History className="h-6 w-6 text-indigo-600" />
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <MessageSquare className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No tickets found</h2>
          <p className="text-slate-500 max-w-xs mx-auto mb-8">You haven't raised any support requests yet.</p>
          <button 
            onClick={() => window.location.href = '#'} // This would navigate to support
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl"
          >
            Contact Support
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {tickets.map((ticket) => (
            <div 
              key={ticket.id} 
              onClick={() => setSelectedTicket(ticket)}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(ticket.status)}`}>
                  {ticket.status}
                </span>
                <span className="text-xs font-mono text-slate-400">{ticket.id}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{ticket.subject}</h3>
              <p className="text-slate-500 text-sm line-clamp-1 mb-6">{ticket.message}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center text-xs text-slate-400 font-medium">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center text-xs font-bold text-indigo-600">
                  {ticket.replies.length} {ticket.replies.length === 1 ? 'Reply' : 'Replies'}
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
