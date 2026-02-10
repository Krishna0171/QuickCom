
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Package, Truck, ShieldCheck, CreditCard, ShoppingBag } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'General' | 'Shipping' | 'Payments' | 'Orders';
}

const FAQ_DATA: FAQItem[] = [
  {
    category: 'General',
    question: "What is QuickStore?",
    answer: "QuickStore is a market validation platform designed for entrepreneurs to test product-market fit. While the store functions as a real e-commerce experience, it helps creators gather data on which products resonate most with customers."
  },
  {
    category: 'General',
    question: "Are these products real and available?",
    answer: "Yes, all products listed on QuickStore are either currently in stock or available through our validation partners. If a product is for testing purposes only, it will be clearly marked."
  },
  {
    category: 'Shipping',
    question: "How long does shipping take?",
    answer: "Standard shipping typically takes 3-5 business days. Express options are available at checkout for 1-2 day delivery in most major cities."
  },
  {
    category: 'Shipping',
    question: "Do you ship internationally?",
    answer: "Currently, we only ship within the domestic region. International shipping is part of our future roadmap as we scale validated products."
  },
  {
    category: 'Payments',
    question: "What payment methods do you accept?",
    answer: "We accept all major Credit/Debit cards, UPI payments, and Cash on Delivery (COD) for selected regions."
  },
  {
    category: 'Payments',
    question: "Is my payment information secure?",
    answer: "Absolutely. We use industry-standard encryption and secure payment gateways. QuickStore does not store your full card details on our servers."
  },
  {
    category: 'Orders',
    question: "How can I track my order?",
    answer: "Once your order is shipped, you'll receive an email and WhatsApp notification with a tracking ID. You can also track your status directly in the 'My Orders' section of your profile."
  },
  {
    category: 'Orders',
    question: "Can I cancel my order?",
    answer: "Orders can be cancelled within 2 hours of placement via the 'Order Details' page, provided they haven't entered the 'Shipped' status."
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Shipping': return <Truck className="h-5 w-5" />;
      case 'Payments': return <CreditCard className="h-5 w-5" />;
      case 'Orders': return <ShoppingBag className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl text-indigo-600 mb-4">
          <HelpCircle className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Everything you need to know about shopping on QuickStore and how we help validate great ideas.
        </p>
      </div>

      <div className="space-y-4">
        {FAQ_DATA.map((item, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-2xl border transition-all duration-300 ${
              openIndex === index ? 'border-indigo-200 shadow-lg shadow-indigo-50/50' : 'border-slate-100 shadow-sm hover:border-slate-200'
            }`}
          >
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-xl transition-colors ${
                  openIndex === index ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'
                }`}>
                  {getCategoryIcon(item.category)}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 block mb-1">
                    {item.category}
                  </span>
                  <h3 className={`text-lg font-bold transition-colors ${
                    openIndex === index ? 'text-indigo-900' : 'text-slate-800'
                  }`}>
                    {item.question}
                  </h3>
                </div>
              </div>
              <div className={`transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`}>
                <ChevronDown className="h-5 w-5" />
              </div>
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 pb-6 pl-16 text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-slate-900 rounded-[2.5rem] p-10 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Can't find the answer you're looking for? Please chat to our friendly team.
          </p>
          <button className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-lg">
            Contact Support
          </button>
        </div>
      </div>
      
      <div className="mt-12 flex items-center justify-center space-x-8 text-slate-400">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-xs font-medium">Safe & Secure</span>
        </div>
        <div className="flex items-center space-x-2">
          <Truck className="h-4 w-4" />
          <span className="text-xs font-medium">Fast Shipping</span>
        </div>
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4" />
          <span className="text-xs font-medium">Easy Returns</span>
        </div>
      </div>
    </div>
  );
};
