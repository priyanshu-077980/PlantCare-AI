import React, { useState } from 'react';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';
import HistoryModal from './HistoryModal';
import { 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  Eye, 
  Image as ImageIcon, 
  Calendar,
  AlertCircle,
  Database
} from 'lucide-react';
import { exportHistoryToCSV, exportHistoryToJSON } from '../../utils/exportUtils';

export default function HistoryTable({ 
  history = [], 
  onDeletePrediction, 
  onClearAll 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'healthy' | 'diseased'
  const [selectedItem, setSelectedItem] = useState(null);

  // Filtered list
  const filteredHistory = history.filter(item => {
    // Search filter
    const matchesSearch = 
      (item.plant || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.condition || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.predicted_class || '').toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    if (statusFilter === 'healthy') return matchesSearch && item.isHealthy;
    if (statusFilter === 'diseased') return matchesSearch && !item.isHealthy;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Notice Banner: Local Browser History */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
        <Database className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 flex-1">
          <strong className="text-forest-900 font-semibold">Local Browser Storage:</strong>{' '}
          All prediction logs and leaf thumbnails are stored locally within your browser's <code className="font-mono text-forest-800 bg-white/70 px-1 py-0.5 rounded">localStorage</code>. 
          This history is private to this machine and not synchronized to an external database.
        </div>
      </div>

      {/* Toolbar: Search, Filters & Export */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by crop, pathogen, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-600/20 focus:border-forest-600 transition-all"
            />
          </div>

          {/* Filter Pill and Export Options */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Status Dropdown */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === 'all' ? 'bg-white text-forest-800 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                All ({history.length})
              </button>
              <button
                onClick={() => setStatusFilter('healthy')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === 'healthy' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Healthy
              </button>
              <button
                onClick={() => setStatusFilter('diseased')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === 'diseased' ? 'bg-white text-rose-700 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Diseased
              </button>
            </div>

            {/* Export Dropdown / Buttons */}
            {history.length > 0 && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <button
                  onClick={() => exportHistoryToCSV(history)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-medium transition-colors flex items-center gap-1"
                  title="Export records to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">CSV</span>
                </button>
                <button
                  onClick={() => exportHistoryToJSON(history)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-medium transition-colors flex items-center gap-1"
                  title="Export records to JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">JSON</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear your local prediction history? This action cannot be undone.')) {
                      onClearAll();
                    }
                  }}
                  className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors"
                  title="Clear all records"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-slate-700">No predictions matching your criteria</p>
            <p className="text-xs text-slate-400 mt-1">
              {history.length === 0 ? 'Upload an image on the Detection page to start logging history.' : 'Try adjusting your search terms or filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Leaf Specimen</th>
                  <th className="py-3.5 px-4">Predicted Class</th>
                  <th className="py-3.5 px-4">Confidence</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.displayDate}</span>
                      </div>
                    </td>

                    {/* Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
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

                    {/* Predicted Class */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {item.plant} - {item.condition}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5 max-w-xs truncate">
                        {item.predicted_class}
                      </div>
                    </td>

                    {/* Confidence */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${item.confidence >= 80 ? 'bg-forest-600' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(100, item.confidence)}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-slate-800 text-xs">
                          {item.confidence}%
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge isHealthy={item.isHealthy} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-2 rounded-lg text-slate-500 hover:text-forest-800 hover:bg-forest-50 transition-colors"
                          title="View detailed diagnostics"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Remove this record from history?')) {
                              onDeletePrediction(item.id);
                            }
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Details Modal */}
      {selectedItem && (
        <HistoryModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onDelete={onDeletePrediction} 
        />
      )}
    </div>
  );
}

