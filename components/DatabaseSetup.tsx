
import React, { useState } from 'react';
import { api } from '../services/api';
import { Database, Copy, CheckCircle, Terminal, AlertTriangle, ExternalLink } from 'lucide-react';

interface DatabaseSetupProps {
  onComplete: () => void;
}

export const DatabaseSetup: React.FC<DatabaseSetupProps> = ({ onComplete }) => {
  const [copied, setCopied] = useState<'schema' | 'rpc' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = (text: string, type: 'schema' | 'rpc') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleAutoSetup = async () => {
    setLoading(true);
    setError(null);
    const success = await api.runAutoSetup();
    if (success) {
      onComplete();
    } else {
      setError("Auto-setup failed. Please follow the manual steps below.");
    }
    setLoading(false);
  };

  const schemaSQL = api.getSchemaSQL();
  const rpcSQL = api.getRPCSetupSQL();

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-3xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col my-8 animate-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Database className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold mb-2">Initialize Your Database</h1>
            <p className="text-indigo-100 opacity-90">QuickStore detected an empty Supabase project. Let's build your structure.</p>
          </div>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] scrollbar-hide">
          {/* Method 1: Automatic */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">1</span>
              <h2 className="text-lg font-bold text-slate-900">Try Automatic Setup</h2>
            </div>
            <p className="text-sm text-slate-500">If you've already added the <b>exec_sql</b> RPC to your project, we can build everything for you right now.</p>
            <button 
              onClick={handleAutoSetup}
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Build Structure Now"}
            </button>
            {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center"><AlertTriangle className="h-4 w-4 mr-2" />{error}</div>}
          </section>

          <div className="h-px bg-slate-100"></div>

          {/* Method 2: Manual */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">2</span>
              <h2 className="text-lg font-bold text-slate-900">Manual Initialization</h2>
            </div>
            <p className="text-sm text-slate-500">Go to your <a href="https://supabase.com/dashboard" target="_blank" className="text-indigo-600 font-bold hover:underline inline-flex items-center">Supabase Dashboard <ExternalLink className="h-3 w-3 ml-1" /></a>, open the <b>SQL Editor</b>, and run this script:</p>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center"><Terminal className="h-3 w-3 mr-1" /> Schema Script</span>
                  <button 
                    onClick={() => handleCopy(schemaSQL, 'schema')}
                    className="text-indigo-600 text-xs font-bold flex items-center hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                  >
                    {copied === 'schema' ? <><CheckCircle className="h-3 w-3 mr-1" /> Copied</> : <><Copy className="h-3 w-3 mr-1" /> Copy SQL</>}
                  </button>
                </div>
                <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-[10px] text-emerald-400 font-mono leading-relaxed whitespace-pre max-h-40 overflow-y-auto scrollbar-hide">
                    {schemaSQL}
                  </pre>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <b>Pro Tip:</b> To enable automatic structure updates in the future, also run the <b>RPC Setup</b> script in your SQL Editor. This allows the app to manage its own tables.
                </p>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center"><Terminal className="h-3 w-3 mr-1" /> Optional: RPC Setup</span>
                  <button 
                    onClick={() => handleCopy(rpcSQL, 'rpc')}
                    className="text-indigo-600 text-xs font-bold flex items-center hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                  >
                    {copied === 'rpc' ? <><CheckCircle className="h-3 w-3 mr-1" /> Copied</> : <><Copy className="h-3 w-3 mr-1" /> Copy RPC</>}
                  </button>
                </div>
                <div className="bg-slate-900 rounded-xl p-4">
                  <pre className="text-[10px] text-indigo-400 font-mono leading-relaxed whitespace-pre">
                    {rpcSQL}
                  </pre>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">Structure ready? Click refresh below.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 shadow-sm transition-all"
          >
            Refresh App
          </button>
        </div>
      </div>
    </div>
  );
};
