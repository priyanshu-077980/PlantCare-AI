import React from 'react';
import { Menu, ScanLine, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

const routeTitles = {
  '/': 'Dashboard Overview',
  '/detect': 'Disease Detection',
  '/chat': 'AI Agronomist Chat',
  '/history': 'Prediction History'
};

export default function Navbar({ onOpenSidebar }) {
  const location = useLocation();
  const currentTitle = routeTitles[location.pathname] || 'PlantCare AI';
  const { backendStatus, verifyBackend } = useSettings();

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Menu Trigger + Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-none"
          aria-label="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
            {currentTitle}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            FastAPI + TensorFlow CNN Neural Classifier
          </p>
        </div>
      </div>

      {/* Right: Status Pill & CTA */}
      <div className="flex items-center gap-3">
        {/* System live badge */}
        <div 
          onClick={verifyBackend}
          title="Click to re-check API connection"
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border bg-slate-50 hover:bg-slate-100 border-slate-200"
        >
          <span className={`w-2 h-2 rounded-full ${backendStatus.online ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span className="text-slate-700">
            {backendStatus.checking ? 'Connecting...' : backendStatus.online ? 'System Connected' : 'System Offline'}
          </span>
          <RefreshCw className={`w-3 h-3 text-slate-400 ${backendStatus.checking ? 'animate-spin' : ''}`} />
        </div>

        {/* Quick action button */}
        {location.pathname !== '/detect' && (
          <Link
            to="/detect"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-800 text-white font-medium text-xs sm:text-sm hover:bg-forest-900 transition-all shadow-xs hover:shadow active:scale-98"
          >
            <ScanLine className="w-4 h-4 text-emerald-300" />
            <span className="hidden xs:inline">Analyze Leaf</span>
          </Link>
        )}
      </div>
    </header>
  );
}

