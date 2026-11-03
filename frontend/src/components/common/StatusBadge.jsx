import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';

export default function StatusBadge({ isHealthy, size = 'md', className = '' }) {
  if (isHealthy) {
    const sizeClasses = size === 'sm' 
      ? 'px-2 py-0.5 text-xs gap-1' 
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm gap-2'
      : 'px-2.5 py-1 text-xs font-semibold gap-1.5';

    return (
      <span className={`inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs ${sizeClasses} ${className}`}>
        <ShieldCheck className={size === 'sm' ? 'w-3 h-3 text-emerald-600' : 'w-4 h-4 text-emerald-600'} />
        <span>Healthy</span>
      </span>
    );
  }

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs gap-1' 
    : size === 'lg'
    ? 'px-3.5 py-1.5 text-sm gap-2'
    : 'px-2.5 py-1 text-xs font-semibold gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs ${sizeClasses} ${className}`}>
      <AlertTriangle className={size === 'sm' ? 'w-3 h-3 text-rose-600' : 'w-4 h-4 text-rose-600'} />
      <span>Disease Detected</span>
    </span>
  );
}

