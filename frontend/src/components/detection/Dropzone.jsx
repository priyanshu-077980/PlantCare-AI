import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, AlertCircle, FileCheck } from 'lucide-react';
import Card from '../common/Card';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/bmp'
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export default function Dropzone({ 
  selectedFile, 
  previewUrl, 
  onFileSelect, 
  onRemoveFile, 
  onAnalyze, 
  isAnalyzing, 
  errorMessage 
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndHandleFile = (file) => {
    setLocalError(null);
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setLocalError('Invalid file format. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setLocalError('File exceeds 10 MB limit. Please select a smaller leaf image.');
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndHandleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndHandleFile(e.target.files[0]);
    }
  };

  const triggerBrowse = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const displayError = errorMessage || localError;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/bmp"
        className="hidden"
        onChange={handleInputChange}
      />

      {!selectedFile ? (
        /* Empty Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerBrowse}
          className={`
            border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-200
            flex flex-col items-center justify-center bg-white
            ${isDragOver 
              ? 'border-forest-600 bg-forest-50/50 scale-[1.01] shadow-lg' 
              : 'border-slate-200 hover:border-forest-500 hover:bg-slate-50/50 shadow-xs'}
          `}
        >
          <div className="w-20 h-20 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center mb-5 ring-10 ring-forest-50/50 shadow-inner">
            <UploadCloud className="w-10 h-10 text-forest-700 animate-bounce duration-1000" />
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-1">
            Drag & Drop Leaf Specimen Here
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            Upload a clear close-up photograph of a diseased or healthy crop leaf
          </p>

          <button
            type="button"
            className="px-6 py-2.5 rounded-xl bg-forest-800 text-white text-sm font-semibold hover:bg-forest-900 transition-colors shadow-sm"
          >
            Browse Image Files
          </button>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-forest-600" /> JPG, JPEG, PNG, WEBP
            </span>
            <span>&bull;</span>
            <span>Max 10 MB</span>
            <span>&bull;</span>
            <span>128×128 Auto-resize</span>
          </div>
        </div>
      ) : (
        /* Preview Card */
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            {/* Image Preview Thumbnail */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-xs group">
              <img 
                src={previewUrl} 
                alt="Selected plant leaf" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={triggerBrowse}
                  className="p-2 rounded-xl bg-white text-slate-800 hover:bg-slate-100 transition-colors text-xs font-semibold shadow-md flex items-center gap-1"
                  title="Replace with another image"
                >
                  <RefreshCw className="w-4 h-4" /> Replace
                </button>
              </div>
            </div>

            {/* Specimen Details & Controls */}
            <div className="flex-1 w-full space-y-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-forest-50 text-forest-700 border border-forest-200 mb-2">
                  Specimen Ready
                </span>
                <h4 className="text-base font-bold text-slate-800 break-all truncate">
                  {selectedFile.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Type: {selectedFile.type || 'Image'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-700">Pre-processing checklist:</p>
                <p>&bull; Clear leaf focused in frame with natural lighting</p>
                <p>&bull; Image tensor is normalized to [0, 1]</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onAnalyze}
                  disabled={isAnalyzing}
                  className="flex-1 min-w-[160px] py-3 px-5 rounded-xl bg-forest-800 hover:bg-forest-900 disabled:bg-slate-300 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                      <span>Classifying Leaf...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 text-emerald-300" />
                      <span>Analyze Image Now</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={triggerBrowse}
                  disabled={isAnalyzing}
                  className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Replace</span>
                </button>

                <button
                  type="button"
                  onClick={onRemoveFile}
                  disabled={isAnalyzing}
                  className="p-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Error message banner */}
      {displayError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3 text-xs sm:text-sm animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Classification Encountered An Issue</p>
            <p className="mt-0.5 text-rose-600">{displayError}</p>
          </div>
        </div>
      )}
    </div>
  );
}

