import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';
import { formatClassName } from '../../utils/diseaseFormatter';
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  FileText,
  Info,
  Calendar,
  ExternalLink,
  Bot,
  MessageSquare
} from 'lucide-react';

export default function ResultView({ 
  prediction, 
  previewUrl, 
  onReset 
}) {
  const navigate = useNavigate();
  if (!prediction) return null;

  const parsed = formatClassName(prediction.predicted_class);
  const confidence = Number(prediction.confidence) || 0;
  const isHealthy = parsed.isHealthy;
  const topPredictions = prediction.top_predictions || [];

  const handleConsultAI = (customPrompt) => {
    const defaultPrompt = `I diagnosed ${parsed.plant} with ${parsed.condition} (${confidence.toFixed(1)}% confidence). What are the immediate recovery steps, organic treatments, and prevention methods you recommend?`;

    navigate('/chat', {
      state: {
        diagnosis: {
          plant: parsed.plant,
          condition: parsed.condition,
          confidence: confidence.toFixed(1),
          rawClass: prediction.predicted_class,
          isHealthy,
          treatments: parsed.advisory.treatments
        },
        autoPrompt: customPrompt || defaultPrompt
      }
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Banner Card */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-white via-white to-forest-50/40 border-forest-100 overflow-hidden relative">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Uploaded Image Specimen */}
          <div className="w-full md:w-64 shrink-0 flex flex-col items-center">
            <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-slate-200/90 shadow-md relative group">
              <img 
                src={previewUrl} 
                alt="Analyzed leaf specimen" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-3 left-3">
                <StatusBadge isHealthy={isHealthy} size="sm" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Evaluated Specimen at 128×128
            </p>
          </div>

          {/* Diagnostic Core Information */}
          <div className="flex-1 w-full space-y-5">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-1 rounded-md border border-forest-200">
                  {parsed.plant}
                </span>
                <span className="text-xs text-slate-400">&bull;</span>
                <span className="text-xs font-medium text-slate-500">
                  Diagnostic Status: <strong className="text-slate-800">{prediction.status || 'success'}</strong>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {parsed.condition}
              </h2>

              <p className="text-xs font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 inline-block">
                Raw Class: {prediction.predicted_class}
              </p>
            </div>

            {/* Confidence Bar & Metric */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Model Prediction Confidence</span>
                <span className={`text-sm font-extrabold ${confidence >= 80 ? 'text-forest-800' : 'text-amber-700'}`}>
                  {confidence.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    confidence >= 80 
                      ? 'bg-gradient-to-r from-emerald-500 to-forest-700' 
                      : 'bg-gradient-to-r from-amber-400 to-amber-600'
                  }`}
                  style={{ width: `${Math.min(100, confidence)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>0% baseline</span>
                <span>Threshold: 80%</span>
                <span>100% max</span>
              </div>
            </div>

            {/* CTA action */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleConsultAI()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-forest-700 to-forest-800 text-white font-semibold text-sm hover:from-emerald-700 hover:to-forest-900 transition-all shadow-md shadow-forest-900/15 active:scale-98"
              >
                <Bot className="w-4 h-4 text-emerald-200" />
                <span>Ask AI Agronomist (Ollama)</span>
              </button>

              <button
                onClick={onReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all active:scale-98"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Analyze Another Leaf</span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid: Top 3 Predictions & Agronomic Advisory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 3 Predicted Classes */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-forest-700" />
            <h3 className="text-base font-bold text-slate-900">
              Top Predicted Classes
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Confidence probabilities output by the neural softmax layer
          </p>

          <div className="space-y-3">
            {topPredictions && topPredictions.length > 0 ? (
              topPredictions.map((item, idx) => {
                const itemParsed = formatClassName(item.class_name);
                const itemConf = Number(item.confidence) || 0;
                return (
                  <div 
                    key={idx} 
                    className={`p-3.5 rounded-xl border transition-all ${
                      idx === 0 
                        ? 'bg-forest-50/60 border-forest-200 ring-1 ring-forest-200/50' 
                        : 'bg-slate-50 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          idx === 0 ? 'bg-forest-800 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-slate-800 font-bold">
                          {itemParsed.plant} - {itemParsed.condition}
                        </span>
                      </div>
                      <span className="font-extrabold text-slate-900">{itemConf.toFixed(1)}%</span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${idx === 0 ? 'bg-forest-700' : 'bg-slate-400'}`}
                        style={{ width: `${Math.min(100, itemConf)}%` }}
                      />
                    </div>

                    <p className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                      {item.class_name}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400">No alternate predictions returned.</p>
            )}
          </div>
        </Card>

        {/* Actionable Agronomic Treatment Advice */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-forest-700" />
              <h3 className="text-base font-bold text-slate-900">
                Agronomic Recommendations
              </h3>
            </div>
            
            <div className="mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pathology Category:</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {parsed.advisory.category} ({parsed.advisory.severity} Severity)
              </p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {parsed.advisory.description}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700">Recommended Next Steps:</span>
              <ul className="space-y-1.5">
                {parsed.advisory.treatments.map((treatment, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest-600 mt-1.5 shrink-0" />
                    <span>{treatment}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleConsultAI(`Can you elaborate on these treatments for ${parsed.plant} ${parsed.condition}: ${parsed.advisory.treatments.join(', ')}? Explain the exact dosage, application time, and precautions.`)}
              className="w-full mt-3 py-2 px-3 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-800 text-xs font-semibold border border-forest-200/80 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-forest-700" />
              <span>Ask AI Agronomist how to apply these remedies</span>
            </button>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Diagnosed with PlantCare AI</span>
            <span className="text-forest-700 font-medium">Auto-saved to history</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

