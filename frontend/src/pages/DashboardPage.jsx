import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHistory } from '../context/HistoryContext';
import { useSettings } from '../context/SettingsContext';
import MetricCard from '../components/dashboard/MetricCard';
import DiseaseChart from '../components/dashboard/DiseaseChart';
import RecentTable from '../components/dashboard/RecentTable';
import EmptyState from '../components/common/EmptyState';
import HistoryModal from '../components/history/HistoryModal';
import { 
  ScanLine, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp,
  Activity,
  Layers,
  Bot
} from 'lucide-react';

export default function DashboardPage() {
  const { history, stats, removePrediction } = useHistory();
  const { backendStatus } = useSettings();
  const [selectedItem, setSelectedItem] = useState(null);

  const hasHistory = history.length > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcoming Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-forest-950 via-forest-900 to-forest-800 text-white p-6 sm:p-8 shadow-xl shadow-forest-950/10">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-60 h-60 rounded-full bg-forest-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-semibold border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>PlantCare AI Diagnostics Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Welcome to PlantCare AI
            </h1>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Detect 67 crop diseases in real-time with our high-precision Convolutional Neural Network. Upload leaf photos to protect crop yield with targeted treatment strategies.
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap items-center gap-3">
            <Link
              to="/detect"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-forest-900 font-bold text-sm hover:bg-emerald-50 hover:shadow-lg transition-all duration-200 shadow-md active:scale-98 group"
            >
              <ScanLine className="w-5 h-5 text-forest-700 group-hover:rotate-12 transition-transform" />
              <span>Analyze New Image</span>
            </Link>

            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm backdrop-blur-md border border-white/20 transition-all duration-200 active:scale-98"
            >
              <Bot className="w-5 h-5 text-emerald-300" />
              <span>AI Chatbot</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Images Analyzed */}
        <MetricCard
          title="Total Images Analyzed"
          value={stats.totalAnalyzed}
          icon={Layers}
          colorClass="text-forest-700 bg-forest-50 border-forest-200"
          description={hasHistory ? "Specimens logged locally" : "No evaluations yet"}
          trend={hasHistory ? `${stats.totalAnalyzed} total` : null}
        />

        {/* Healthy Plants */}
        <MetricCard
          title="Healthy Plants"
          value={stats.healthyCount}
          icon={ShieldCheck}
          colorClass="text-emerald-700 bg-emerald-50 border-emerald-200"
          description={hasHistory ? `${((stats.healthyCount / stats.totalAnalyzed) * 100).toFixed(0)}% of scans` : "No scans logged"}
          trend={stats.healthyCount > 0 ? "Vigorous" : null}
        />

        {/* Diseases Detected */}
        <MetricCard
          title="Diseases Detected"
          value={stats.diseasedCount}
          icon={AlertTriangle}
          colorClass="text-rose-700 bg-rose-50 border-rose-200"
          description={hasHistory ? `${((stats.diseasedCount / stats.totalAnalyzed) * 100).toFixed(0)}% identified issues` : "Zero issues reported"}
          trend={stats.diseasedCount > 0 ? "Pathogens found" : null}
        />

        {/* Average Prediction Confidence */}
        <MetricCard
          title="Average Confidence"
          value={stats.avgConfidence}
          unit="%"
          icon={TrendingUp}
          colorClass="text-teal-700 bg-teal-50 border-teal-200"
          description={hasHistory ? "Based on real softmax outputs" : "Awaiting first run"}
          trend={stats.avgConfidence >= 80 ? "High certainty" : null}
        />
      </div>

      {/* Analytics Chart & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart (spans 2 columns on large screens) */}
        <div className="lg:col-span-2">
          <DiseaseChart 
            diseaseDistribution={stats.diseaseDistribution}
            plantDistribution={stats.plantDistribution}
          />
        </div>

        {/* Quick Diagnostic Status Card (spans 1 column) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-forest-700" />
              Neural Engine Status
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Real-time telemetry of the local inference microservice
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-600 font-medium">Model Architecture</span>
                <span className="font-bold text-slate-800">CNN (39 Layers)</span>
              </div>
              <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-600 font-medium">Detectable Classes</span>
                <span className="font-bold text-forest-700">67 Pathogens & Crops</span>
              </div>
              <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-600 font-medium">Input Dimension</span>
                <span className="font-bold text-slate-800">128 × 128 × 3 RGB</span>
              </div>
              <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-600 font-medium">System Service</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                  <span className={`w-2 h-2 rounded-full ${backendStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  {backendStatus.online ? 'Healthy & Ready' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div>
        <RecentTable
          recentPredictions={history}
          onSelectPrediction={(item) => setSelectedItem(item)}
        />
      </div>

      {/* Selected Item Modal */}
      {selectedItem && (
        <HistoryModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDelete={removePrediction}
        />
      )}
    </div>
  );
}

