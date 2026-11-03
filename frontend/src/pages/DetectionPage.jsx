import React, { useState } from 'react';
import Dropzone from '../components/detection/Dropzone';
import ScanningState from '../components/detection/ScanningState';
import ResultView from '../components/detection/ResultView';
import { predictPlantDisease } from '../api/plantApi';
import { useHistory } from '../context/HistoryContext';
import { useSettings } from '../context/SettingsContext';
import { ScanLine, AlertCircle, Info, ShieldAlert } from 'lucide-react';

export default function DetectionPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);

  const { addPrediction } = useHistory();
  const { settings, backendStatus } = useSettings();

  // Create preview and thumbnail
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setPredictionResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    setPredictionResult(null);
  };

  // Compress thumbnail for localStorage to avoid quota limits
  const createThumbnail = (imageFile) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 120;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(imageFile);
    });
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await predictPlantDisease(selectedFile);

      if (!response.success) {
        setErrorMessage(response.error);
        setIsAnalyzing(false);
        return;
      }

      const data = response.data;
      setPredictionResult(data);

      // Create thumbnail and save to local history if enabled
      if (settings.autoSaveHistory) {
        const thumb = await createThumbnail(selectedFile);
        addPrediction(data, thumb || previewUrl);
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during image classification.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPredictionResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 text-forest-800 text-xs font-semibold border border-forest-200">
          <ScanLine className="w-3.5 h-3.5" />
          <span>Real-time Foliar Disease Detection</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Crop Leaf Pathogen Diagnostics
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Upload an image of a leaf from any supported crop species (Tomato, Apple, Potato, Corn, Grape, Rice, etc.) to receive instant AI classification.
        </p>
      </div>

      {/* Server offline warning banner if needed */}
      {!backendStatus.online && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3 text-xs sm:text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">AI Diagnostic service is currently not reachable.</span>
            <p className="text-amber-700 mt-0.5">
              Please ensure the service is running via <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">python -m uvicorn main:app --port 8000</code>.
            </p>
          </div>
        </div>
      )}

      {/* Main Flow: Uploading / Scanning / Results */}
      {isAnalyzing ? (
        <ScanningState previewUrl={previewUrl} />
      ) : predictionResult ? (
        <ResultView 
          prediction={predictionResult} 
          previewUrl={previewUrl} 
          onReset={handleReset} 
        />
      ) : (
        <Dropzone
          selectedFile={selectedFile}
          previewUrl={previewUrl}
          onFileSelect={handleFileSelect}
          onRemoveFile={handleRemoveFile}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          errorMessage={errorMessage}
        />
      )}

      {/* Guidance Tips Card */}
      {!predictionResult && !isAnalyzing && (
        <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Info className="w-4 h-4 text-forest-700" />
            <span>Photography Best Practices for Maximum CNN Accuracy:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="font-semibold text-slate-800 block mb-1">1. Good Illumination</span>
              Avoid harsh shadows and direct camera flash. Natural diffuse daylight yields the best foliar color balance.
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="font-semibold text-slate-800 block mb-1">2. Clear Focal Plane</span>
              Keep leaf flat and centered with the camera lens parallel to the leaf surface to expose lesion details.
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="font-semibold text-slate-800 block mb-1">3. Single Specimen</span>
              Frame a single leaf rather than whole bush or background soil for clean 128×128 pixel normalization.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

