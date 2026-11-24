import React, { useState } from 'react';
import { X, Settings, Key, Cpu, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { updateSettings } from '../services/api';

export default function SettingsModal({ isOpen, onClose, currentKey, onSaved }) {
  const [apiKey, setApiKey] = useState(currentKey || '');
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(null);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus(null);

    try {
      const res = await updateSettings(apiKey, model);
      setStatus({ type: 'success', text: res.message || 'Saved successfully!' });
      if (onSaved) onSaved(apiKey);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-campus-500/10 text-campus-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Configuration & API Keys</h3>
              <p className="text-xs text-slate-400">Configure Groq LLM inference parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Key className="w-3.5 h-3.5 text-campus-400" />
              <span>Groq API Key:</span>
            </label>
            <input
              type="password"
              placeholder="gsk_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-campus-500 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Your key is saved locally in <code className="text-campus-400">.env</code>. If omitted, the assistant uses the built-in RAG rule-engine for queries.
            </p>
          </div>

          <div>
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Cpu className="w-3.5 h-3.5 text-campus-400" />
              <span>Groq LLM Model:</span>
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-campus-500"
            >
              <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
              <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fastest)</option>
              <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
            </select>
          </div>

          {status && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center space-x-2 ${
                status.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{status.text}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-campus-600 hover:bg-campus-500 text-white text-xs font-medium rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
