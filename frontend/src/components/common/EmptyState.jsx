import React from 'react';
import { Sprout, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = Sprout,
  title = "No Analysis Records Yet",
  description = "Upload leaf images to diagnose crop diseases with our deep learning model. All your predictions will appear here.",
  actionText = "Analyze First Leaf",
  actionLink = "/detect"
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="w-16 h-16 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center mb-4 ring-8 ring-forest-50/50">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 text-white font-medium text-sm hover:bg-forest-900 transition-all shadow-sm hover:shadow active:scale-98"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

