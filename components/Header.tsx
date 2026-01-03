
import React from 'react';
import { Cloud, User } from 'lucide-react';
import { ViewType } from '../types';

interface HeaderProps {
  view: ViewType;
  setView: (view: ViewType) => void;
}

export const Header: React.FC<HeaderProps> = ({ view, setView }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setView('customer')}
          >
            <div className="bg-blue-600 p-2 rounded-xl text-white group-hover:rotate-12 transition-transform">
              <Cloud size={24} fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Bouncy Cloud <span className="text-blue-600">Rentals</span></span>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => setView('customer')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                view === 'customer' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User size={18} />
              Book Now
            </button>
            {/* Admin button removed from public view as per request */}
          </nav>
        </div>
      </div>
    </header>
  );
};
