import React, { useState } from 'react';
import { X, BookOpen, Upload, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { uploadDocument } from '../services/api';

export default function KnowledgeBaseModal({ isOpen, onClose, documents = [], onRefresh }) {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('academic');
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen) return null;

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setStatusMessage(null);
    try {
      const res = await uploadDocument(file, docType);
      setStatusMessage({ type: 'success', text: res.message || 'File uploaded and index refreshed!' });
      setFile(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Upload failed' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-campus-500/10 text-campus-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Knowledge Base & PDFs</h3>
              <p className="text-xs text-slate-400">Official college documents indexed in FAISS vector store</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Document List */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Documents
            </div>
            
            {documents.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No documents detected.</p>
            ) : (
              documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-campus-500/10 text-campus-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{doc.filename}</div>
                      <div className="text-[11px] text-slate-400">
                        {doc.size_kb > 0 ? `${doc.size_kb} KB` : 'Missing'} • {doc.modified}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide border ${
                      doc.status === 'Indexed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Upload New Document Section */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Upload / Replace PDF Document
            </div>

            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Target Document Type:</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-campus-500"
                >
                  <option value="academic">Academic Handbook (academics_handbook.pdf)</option>
                  <option value="fee">Fee Structure (fee_structure.pdf)</option>
                  <option value="custom">Additional Custom PDF Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Select PDF File:</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-campus-600 file:text-white hover:file:bg-campus-500 cursor-pointer"
                />
              </div>

              {statusMessage && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center space-x-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!file || isUploading}
                className="w-full py-2.5 px-4 bg-campus-600 hover:bg-campus-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading & Indexing Chunks...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload & Update Vector Store</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
