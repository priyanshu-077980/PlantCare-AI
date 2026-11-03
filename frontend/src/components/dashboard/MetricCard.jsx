import React from 'react';
import Card from '../common/Card';

export default function MetricCard({ 
  title, 
  value, 
  unit = '', 
  icon: Icon, 
  colorClass = 'text-forest-700 bg-forest-50 border-forest-100',
  description,
  trend
}) {
  return (
    <Card className="p-5 relative overflow-hidden" hover>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </h3>
            {unit && <span className="text-base font-semibold text-slate-500">{unit}</span>}
          </div>
        </div>

        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-xs ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(description || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{description}</span>
          {trend && (
            <span className="font-semibold text-forest-700 bg-forest-50 px-2 py-0.5 rounded-full border border-forest-200">
              {trend}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

