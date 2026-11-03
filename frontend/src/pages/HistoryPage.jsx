import React from 'react';
import { useHistory } from '../context/HistoryContext';
import HistoryTable from '../components/history/HistoryTable';
import EmptyState from '../components/common/EmptyState';
import { History, ScanLine } from 'lucide-react';

export default function HistoryPage() {
  const { history, removePrediction, clearHistory } = useHistory();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 text-forest-800 text-xs font-semibold border border-forest-200 mb-1.5">
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Prediction History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            View, filter, inspect, and export all plant leaf diagnostics evaluated in this browser session.
          </p>
        </div>
      </div>

      {/* History Table or Empty State */}
      {history.length === 0 ? (
        <EmptyState
          icon={ScanLine}
          title="No Prediction Records Saved"
          description="You haven't analyzed any plant images in this browser yet. Run your first leaf diagnostic on the Detection page to begin building your crop disease history."
          actionText="Analyze Leaf Now"
          actionLink="/detect"
        />
      ) : (
        <HistoryTable
          history={history}
          onDeletePrediction={removePrediction}
          onClearAll={clearHistory}
        />
      )}
    </div>
  );
}

