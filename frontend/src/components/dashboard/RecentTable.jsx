import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';
import { ArrowRight, Eye, Image as ImageIcon, Calendar } from 'lucide-react';

export default function RecentTable({ recentPredictions = [], onSelectPrediction }) {
  const hasItems = recentPredictions && recentPredictions.length > 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recent Diagnostics</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest crop leaf evaluations processed by the CNN model
          </p>
        </div>

        {hasItems && (
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-forest-900 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {!hasItems ? (
        <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-xl">
          <p className="text-sm font-medium text-slate-600">No recent evaluations recorded</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            New crop analysis results will be recorded here automatically.
          </p>
          <Link
            to="/detect"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-50 text-forest-800 text-xs font-semibold hover:bg-forest-100 transition-all border border-forest-200"
          >
            Start First Scan
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-1">Leaf Image</th>
                <th className="pb-3">Crop / Plant</th>
                <th className="pb-3">Diagnosis</th>
                <th className="pb-3">Confidence</th>
                <th className="pb-3">Health Status</th>
                <th className="pb-3 text-right pr-1">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPredictions.slice(0, 5).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Thumbnail */}
                  <td className="py-3 pl-1">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      {item.imageThumbnail ? (
                        <img 
                          src={item.imageThumbnail} 
                          alt={item.plant} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </td>

                  {/* Crop Name */}
                  <td className="py-3 font-semibold text-slate-800">
                    {item.plant}
                    <div className="text-[11px] font-normal text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {item.displayDate}
                    </div>
                  </td>

                  {/* Diagnosis */}
                  <td className="py-3 font-medium text-slate-700">
                    {item.condition}
                  </td>

                  {/* Confidence */}
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.confidence >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, item.confidence)}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-800">{item.confidence}%</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3">
                    <StatusBadge isHealthy={item.isHealthy} size="sm" />
                  </td>

                  {/* Action */}
                  <td className="py-3 text-right pr-1">
                    <button
                      onClick={() => onSelectPrediction && onSelectPrediction(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-forest-800 hover:bg-forest-50 transition-colors inline-flex items-center gap-1 font-medium text-xs"
                      title="Inspect Prediction"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

