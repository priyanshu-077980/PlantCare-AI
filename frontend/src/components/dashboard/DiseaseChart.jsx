import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import Card from '../common/Card';
import { BarChart3, PieChart as PieIcon, Activity } from 'lucide-react';

const COLORS = [
  '#166534', // forest-800
  '#059669', // emerald-600
  '#0d9488', // teal-600
  '#d97706', // amber-600
  '#e11d48', // rose-600
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#0284c7', // sky-600
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-lg border border-slate-700">
        <p className="font-semibold text-emerald-400 mb-1">{payload[0].payload.name}</p>
        <p className="flex items-center justify-between gap-4">
          <span className="text-slate-300">Detections:</span>
          <span className="font-bold text-white">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function DiseaseChart({ diseaseDistribution = [], plantDistribution = [] }) {
  const [chartType, setChartType] = useState('conditions'); // 'conditions' | 'crops'

  const activeData = chartType === 'conditions' ? diseaseDistribution : plantDistribution;
  const hasData = activeData && activeData.length > 0;

  return (
    <Card className="p-6 flex flex-col justify-between">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-forest-700" />
            Disease & Crop Distribution
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnostic frequency based on your analysis history
          </p>
        </div>

        {hasData && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setChartType('conditions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartType === 'conditions'
                  ? 'bg-white text-forest-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Conditions</span>
            </button>
            <button
              onClick={() => setChartType('crops')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartType === 'crops'
                  ? 'bg-white text-forest-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Crops</span>
            </button>
          </div>
        )}
      </div>

      {/* Chart Canvas or Empty State */}
      <div className="h-72 w-full flex items-center justify-center">
        {!hasData ? (
          <div className="text-center p-6 text-slate-400">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-600">No Distribution Data</p>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Analyze your first leaf image to generate real-time pathogen distribution insights.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeData.slice(0, 6)}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            >
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748b' }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {activeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer stats if available */}
      {hasData && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>Top variant: <strong className="text-slate-800">{activeData[0]?.name}</strong> ({activeData[0]?.count} cases)</span>
          <span className="text-forest-700 font-medium">Real-time local data</span>
        </div>
      )}
    </Card>
  );
}

