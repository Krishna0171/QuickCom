
import React from 'react';
import { X, AlertTriangle, LogOut, Trash2, HelpCircle } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen, onClose, onConfirm, title, message,
  confirmText = 'Confirm', cancelText = 'Cancel', type = 'info'
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: 'bg-red-600 hover:bg-red-700 shadow-red-100',
    warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-100',
    info: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
  };

  const icons = {
    danger: <Trash2 className="h-6 w-6 text-red-600" />,
    warning: <AlertTriangle className="h-6 w-6 text-amber-500" />,
    info: <HelpCircle className="h-6 w-6 text-indigo-600" />
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm relative z-10 animate-in zoom-in duration-200">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-3xl ${
              type === 'danger' ? 'bg-red-50' : type === 'warning' ? 'bg-amber-50' : 'bg-indigo-50'
            }`}>
              {icons[type]}
            </div>
          </div>
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
          </div>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={`w-full py-4 text-white font-bold rounded-2xl shadow-lg transition-all ${colors[type]}`}
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 text-slate-500 font-bold rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
