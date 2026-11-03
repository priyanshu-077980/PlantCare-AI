import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, ShieldCheck, AlertTriangle, Layers, FileText, Trash2, Bot } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function HistoryModal({ item, onClose, onDelete }) {
  const navigate = useNavigate();
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <div>
            <span className="text-[11px] font-bold text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200 uppercase tracking-wider">
              Prediction Details
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              {item.plant} - {item.condition}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Thumbnail */}
            <div className="w-full sm:w-48 aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
              {item.imageThumbnail ? (
                <img 
                  src={item.imageThumbnail} 
                  alt={item.plant} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                  No Preview
                </div>
              )}
            </div>

            {/* Specimen Key Metrics */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex items-center gap-2">
                <StatusBadge isHealthy={item.isHealthy} size="md" />
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {item.displayDate}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400">Class Identifier</p>
                <p className="font-mono text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 break-all">
                  {item.predicted_class}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Confidence Score</span>
                  <span className="font-extrabold text-slate-900">{item.confidence}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${item.confidence >= 80 ? 'bg-forest-600' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, item.confidence)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top predictions list */}
          {item.top_predictions && item.top_predictions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-forest-700" />
                Top Model Predictions
              </h4>
              <div className="space-y-1.5">
                {item.top_predictions.map((top, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate mr-2">
                      {top.class_name}
                    </span>
                    <span className="font-bold text-slate-900 shrink-0">
                      {top.confidence}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advisory Treatments */}
          {item.advisory && (
            <div className="p-4 rounded-2xl bg-forest-50/50 border border-forest-100 space-y-2">
              <h4 className="text-xs font-bold text-forest-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-forest-700" />
                Treatment & Care Advisory
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.advisory.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Delete this prediction from local history?')) {
                  onDelete(item.id);
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Record</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigate('/chat', {
                  state: {
                    diagnosis: {
                      plant: item.plant,
                      condition: item.condition,
                      confidence: item.confidence,
                      rawClass: item.predicted_class,
                      isHealthy: item.isHealthy
                    },
                    autoPrompt: `I previously recorded a diagnosis of ${item.plant} with ${item.condition} (${item.confidence}%). What are the long-term management and organic recovery recommendations?`
                  }
                });
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-800 text-xs font-bold border border-forest-200 transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-forest-700" />
              <span>Consult AI Agronomist</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

