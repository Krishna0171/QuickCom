
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User, Package, ChevronRight, Navigation } from 'lucide-react';
import { automation } from '../services/automation';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatBotProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onNavigate: (page: string) => void;
}

// Utility to render basic markdown-like formatting (bold, lists, links)
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  // Split by line to handle lists and paragraphs
  const lines = text.split('\n');
  
  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const trimmedLine = line.trim();
        
        // Handle horizontal rules
        if (trimmedLine === '---') return <hr key={idx} className="my-2 border-slate-100" />;
        
        // Handle Bullet Points
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          const content = trimmedLine.substring(2);
          return (
            <div key={idx} className="flex items-start space-x-2 ml-1">
              <span className="text-indigo-400 mt-1.5">•</span>
              <span className="flex-1">{parseInlineStyles(content)}</span>
            </div>
          );
        }

        // Default paragraph
        if (trimmedLine.length === 0) return <div key={idx} className="h-1" />;
        
        return (
          <p key={idx} className="leading-relaxed">
            {parseInlineStyles(line)}
          </p>
        );
      })}
    </div>
  );
};

// Helper to parse bold (**text**)
const parseInlineStyles = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

export const ChatBot: React.FC<ChatBotProps> = ({ isOpen, setIsOpen, onNavigate }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: "Hi! I'm your **QuickStore Assistant**. \n\nHow can I help you today? You can ask me to:\n- Find specific products\n- Check your cart status\n- Navigate the store for you!" 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const response = await automation.processChat(userMessage, messages.slice(-5));
      
      // Handle Function Calling
      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const fc of response.functionCalls) {
          if (fc.name === 'navigateToPage') {
            const page = (fc.args as any).page;
            onNavigate(page);
            setMessages(prev => [...prev, { role: 'model', text: `Certainly! I'm taking you to the **${page}** page right now.` }]);
          }
        }
      } else if (response.text) {
        setMessages(prev => [...prev, { role: 'model', text: response.text! }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I'm having a bit of trouble connecting right now. Please try again in a moment!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 sm:bottom-8 sm:left-auto sm:right-8 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-3rem)] sm:w-96 h-[550px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-indigo-600 p-6 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold">QuickStore Assistant</h3>
                <div className="flex items-center">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse mr-2"></span>
                  <p className="text-[10px] text-indigo-100 uppercase tracking-widest font-bold">Online & Ready</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 scrollbar-hide"
          >
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`max-w-[90%] p-4 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-100/50' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
                }`}>
                  <div className={`flex items-center mb-1.5 opacity-60 ${m.role === 'user' ? 'justify-end' : ''}`}>
                    {m.role === 'user' ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider flex items-center">You <User className="h-2.5 w-2.5 ml-1" /></span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase tracking-wider flex items-center"><Sparkles className="h-2.5 w-2.5 mr-1" /> Assistant</span>
                    )}
                  </div>
                  <FormattedText text={m.text} />
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex flex-col items-start animate-pulse">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
                  <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                  <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {!isTyping && messages.length < 5 && (
            <div className="px-6 pb-2 flex flex-wrap gap-2 bg-slate-50/10">
              {['Show Cart', 'My Orders', 'FAQ', 'Contact Support'].map(action => (
                <button 
                  key={action}
                  onClick={() => {
                    setInput(action);
                    setTimeout(() => handleSend(), 100);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center hover:bg-indigo-50/30"
                >
                  <Navigation className="h-2.5 w-2.5 mr-1 rotate-45" /> {action}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[9px] text-center text-slate-400 mt-2 uppercase tracking-tighter font-medium">QuickStore AI Helper</p>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group ${
          isOpen ? 'bg-slate-900 text-white rotate-90' : 'bg-indigo-600 text-white'
        }`}
      >
        {isOpen ? (
          <X className="h-7 w-7" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-7 w-7" />
            <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-emerald-500 border-2 border-indigo-600 rounded-full animate-pulse shadow-sm"></div>
          </div>
        )}
      </button>
    </div>
  );
};
