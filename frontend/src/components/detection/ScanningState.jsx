import React, { useState, useEffect } from 'react';
import { Cpu, Sparkles } from 'lucide-react';

const scanSteps = [
  "Uploading leaf specimen...",
  "Standardizing RGB tensor (128 × 128 × 3)...",
  "Normalizing pixel values (1/255)...",
  "Executing CNN convolutional feature extractors...",
  "Computing softmax probability distribution...",
  "Extracting top confidence predictions..."
];

export default function ScanningState({ previewUrl }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => (prev + 1) % scanSteps.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto rounded-2xl overflow-hidden border-2 border-forest-600 shadow-2xl bg-slate-950">
      {/* Background leaf preview */}
      <div className="relative aspect-square w-full">
        <img 
          src={previewUrl} 
          alt="Scanning specimen" 
          className="w-full h-full object-cover opacity-60 filter contrast-125"
        />

        {/* Matrix grid overlay */}
        <div 
          className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px] opacity-30" 
        />

        {/* Moving Laser Scan Line */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scanline z-10" />

        {/* Corner HUD targets */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400" />

        {/* Center processing pill */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="w-16 h-16 rounded-2xl bg-forest-900/90 border border-emerald-500/40 backdrop-blur-md flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-950/60 animate-pulse">
            <Cpu className="w-8 h-8" />
          </div>

          <div className="px-4 py-2 rounded-full bg-slate-900/80 border border-emerald-500/30 backdrop-blur-md mb-2">
            <span className="text-xs font-semibold text-emerald-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              AI Neural Inference in Progress
            </span>
          </div>

          <p className="text-sm font-medium text-white tracking-wide transition-all duration-300">
            {scanSteps[currentStepIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}

