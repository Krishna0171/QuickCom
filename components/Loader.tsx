
import React from 'react';
import { Package } from 'lucide-react';

interface LoaderProps {
  fullPage?: boolean;
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ fullPage = false, message = "Loading..." }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
      <div className="relative">
        <div className="h-16 w-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="h-6 w-6 text-indigo-600 animate-pulse" />
        </div>
      </div>
      {message && (
        <p className="text-slate-500 font-medium text-sm animate-pulse tracking-wide uppercase">
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-md flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="p-12 flex items-center justify-center w-full">{content}</div>;
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-slate-200 animate-pulse rounded ${className}`}></div>
);
