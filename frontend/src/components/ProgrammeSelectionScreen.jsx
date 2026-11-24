import React, { useState } from 'react';
import { 
  GraduationCap, 
  Terminal, 
  Briefcase, 
  TrendingUp, 
  ArrowRight, 
  Check, 
  Sparkles
} from 'lucide-react';

const programmes = [
  {
    id: 'BCA',
    name: 'Bachelor of Computer Applications',
    faculty: 'Computer Science & IT',
    duration: '3 Years • 6 Semesters',
    icon: Terminal,
    accent: 'from-blue-500 to-cyan-500',
    ringColor: 'ring-blue-500/40 border-blue-500',
    tagBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  },
  {
    id: 'BBA',
    name: 'Bachelor of Business Administration',
    faculty: 'Management & Strategy',
    duration: '3 Years • 6 Semesters',
    icon: Briefcase,
    accent: 'from-amber-500 to-orange-500',
    ringColor: 'ring-amber-500/40 border-amber-500',
    tagBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  },
  {
    id: 'B.Com (H)',
    name: 'Bachelor of Commerce (Honours)',
    faculty: 'Accounting & Finance',
    duration: '3 Years • 6 Semesters',
    icon: TrendingUp,
    accent: 'from-emerald-500 to-teal-500',
    ringColor: 'ring-emerald-500/40 border-emerald-500',
    tagBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  }
];

export default function ProgrammeSelectionScreen({ onSelectProgramme }) {
  const [selectedId, setSelectedId] = useState('BCA');

  const handleProceed = () => {
    if (selectedId) {
      onSelectProgramme(selectedId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-campus-500/30 selection:text-white relative overflow-x-hidden font-sans">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] lg:w-[900px] h-[300px] bg-gradient-to-b from-campus-600/15 via-indigo-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Brand Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-4 sm:px-6 py-3 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-campus-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-campus-500/20 ring-1 ring-white/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">COLLEGEWALA AI</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-campus-500/10 text-campus-400 border border-campus-500/20">
                  Assistant
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Academic & Student Affairs Portal</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container - Optimized for Laptop Viewports */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10 flex-1 flex flex-col justify-center w-full">
        
        {/* Clean Hero Header */}
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8 lg:mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs font-medium mb-2.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-campus-400" />
            <span>Select Your Enrolled Degree</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Choose Your Programme
          </h1>
          <p className="mt-2 text-xs sm:text-sm lg:text-base text-slate-400 max-w-md mx-auto">
            Select your course to access personalized regulations, fee schedules, and academic assistance.
          </p>
        </div>

        {/* 3 Clean Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {programmes.map((prog) => {
            const isSelected = selectedId === prog.id;
            const Icon = prog.icon;

            return (
              <div
                key={prog.id}
                onClick={() => setSelectedId(prog.id)}
                className={`relative flex flex-col justify-between p-5 lg:p-6 rounded-2xl cursor-pointer transition-all duration-200 select-none ${
                  isSelected
                    ? `bg-slate-900/90 border-2 ${prog.ringColor} shadow-xl shadow-campus-500/10 -translate-y-1`
                    : 'bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700/80'
                }`}
              >
                {/* Header Icon & Selection Indicator */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-br ${prog.accent} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-campus-500 text-white shadow-md scale-100'
                        : 'border border-slate-700 bg-slate-950/60 scale-95 opacity-60'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                {/* Degree Information */}
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-white tracking-tight mb-1">
                    {prog.id}
                  </h3>
                  
                  <p className="text-xs text-slate-300 font-medium mb-3">
                    {prog.name}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] lg:text-[11px] font-semibold border ${prog.tagBg}`}>
                      {prog.faculty}
                    </span>
                    <span className="text-[10px] lg:text-[11px] text-slate-400 font-medium">
                      {prog.duration}
                    </span>
                  </div>
                </div>

                {/* Selection State Indicator */}
                <div className="mt-4 lg:mt-5">
                  <div
                    className={`w-full py-2 rounded-xl text-xs font-semibold text-center transition-colors ${
                      isSelected
                        ? 'bg-campus-600 text-white'
                        : 'bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    {isSelected ? 'Active Selection' : 'Select'}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-6 sm:mt-8 flex flex-col items-center">
          <button
            onClick={handleProceed}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-campus-600 hover:bg-campus-500 text-white font-semibold text-sm shadow-lg shadow-campus-600/30 transition-all flex items-center justify-center space-x-2 active:scale-95 group"
          >
            <span>Continue with {selectedId} Assistant</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            You can change your programme at any time from within the chat.
          </p>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-3 px-6 text-center text-xs text-slate-500 shrink-0">
        COLLEGEWALA AI Assistant • Official Student Support System
      </footer>

    </div>
  );
}
