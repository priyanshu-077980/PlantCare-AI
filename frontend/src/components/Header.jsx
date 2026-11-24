import React from 'react';
import { GraduationCap, Sparkles, ArrowLeftRight } from 'lucide-react';

export default function Header({ 
  activeProgramme, 
  onChangeProgramme 
}) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3 transition-all shrink-0">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-campus-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-campus-500/20 ring-1 ring-white/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                COLLEGEWALA AI
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-campus-500/10 text-campus-400 border border-campus-500/20">
                Assistant
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-normal">
              Academic & Fee Intelligence Portal
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Current Programme Badge with Switch trigger */}
          {activeProgramme && (
            <button
              onClick={onChangeProgramme}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-campus-950/70 hover:bg-campus-900/80 border border-campus-500/40 text-campus-300 text-xs font-semibold transition-all group shadow-sm active:scale-95"
              title="Click to switch your degree programme"
            >
              <Sparkles className="w-3.5 h-3.5 text-campus-400" />
              <span>Enrolled: {activeProgramme}</span>
              <ArrowLeftRight className="w-3 h-3 text-campus-400 opacity-70 group-hover:opacity-100 transition-opacity ml-1" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
