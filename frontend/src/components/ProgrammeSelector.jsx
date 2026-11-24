import React from 'react';
import { Terminal, Briefcase, TrendingUp, CheckCircle2 } from 'lucide-react';

const icons = {
  BCA: Terminal,
  BBA: Briefcase,
  'B.Com (H)': TrendingUp,
};

export default function ProgrammeSelector({ programmes = [], activeProgramme, onSelect }) {
  return (
    <div className="bg-slate-900/40 border-b border-slate-800/80 px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Active Curriculum:</span>
          <span className="hidden md:inline text-slate-500">
            (Regulations, credit requirements, and fee schedules automatically aligned)
          </span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {programmes.map((prog) => {
            const isSelected = activeProgramme === prog.id;
            const Icon = icons[prog.id] || Terminal;

            return (
              <button
                key={prog.id}
                onClick={() => onSelect(prog.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-campus-600 text-white shadow-md shadow-campus-600/25 ring-1 ring-campus-400'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{prog.id}</span>
                {isSelected && <CheckCircle2 className="w-3 h-3 text-campus-200" />}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
