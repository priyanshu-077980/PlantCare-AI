import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Sprout, 
  LayoutDashboard, 
  ScanLine, 
  History, 
  X,
  Bot
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Disease Detection', path: '/detect', icon: ScanLine },
  { name: 'AI Agronomist Chat', path: '/chat', icon: Bot, isGenAI: true },
  { name: 'Prediction History', path: '/history', icon: History },
];

export default function Sidebar({ isOpen, onClose }) {

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div>
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100">
            <NavLink to="/" className="flex items-center gap-3 group" onClick={onClose}>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-forest-900 via-forest-800 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-forest-900/20 group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1">
                  PlantCare <span className="text-forest-700 font-extrabold text-xs px-1.5 py-0.5 bg-forest-50 border border-forest-200 rounded-md">AI</span>
                </span>
                <p className="text-[11px] font-medium text-slate-400">Crop Health Diagnostics</p>
              </div>
            </NavLink>

            {/* Mobile close button */}
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Main Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150
                    ${isActive 
                      ? 'bg-forest-900 text-white shadow-sm shadow-forest-900/15' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                      {item.isGenAI && (
                        <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                          isActive 
                            ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          GenAI
                        </span>
                      )}
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-300" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="text-center text-[11px] text-slate-400">
            PlantCare AI &copy; 2026 Production Ready
          </div>
        </div>
      </aside>
    </>
  );
}

