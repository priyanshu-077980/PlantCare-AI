import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { formatClassName } from '../utils/diseaseFormatter';

const HistoryContext = createContext(null);

const STORAGE_KEY = 'plantcare_prediction_history';

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse history from localStorage', e);
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('LocalStorage quota exceeded or unavailable', e);
    }
  }, [history]);

  /**
   * Add a new prediction to history
   */
  const addPrediction = (predictionData, imageBase64 = null) => {
    const parsed = formatClassName(predictionData.predicted_class);

    const newRecord = {
      id: 'pred_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      displayDate: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      predicted_class: predictionData.predicted_class,
      confidence: predictionData.confidence,
      status: predictionData.status || 'success',
      top_predictions: predictionData.top_predictions || [],
      plant: parsed.plant,
      condition: parsed.condition,
      isHealthy: parsed.isHealthy,
      advisory: parsed.advisory,
      imageThumbnail: imageBase64
    };

    setHistory(prev => [newRecord, ...prev]);
    return newRecord;
  };

  /**
   * Delete an item by ID
   */
  const removePrediction = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  /**
   * Clear all history records
   */
  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  };

  /**
   * Calculated statistics from REAL history
   */
  const stats = useMemo(() => {
    const total = history.length;
    if (total === 0) {
      return {
        totalAnalyzed: 0,
        healthyCount: 0,
        diseasedCount: 0,
        avgConfidence: 0,
        diseaseDistribution: [],
        plantDistribution: []
      };
    }

    let healthy = 0;
    let diseased = 0;
    let confidenceSum = 0;
    const diseaseMap = {};
    const plantMap = {};

    history.forEach(item => {
      if (item.isHealthy) {
        healthy += 1;
      } else {
        diseased += 1;
      }
      confidenceSum += (Number(item.confidence) || 0);

      const cond = item.condition || 'Other';
      diseaseMap[cond] = (diseaseMap[cond] || 0) + 1;

      const pl = item.plant || 'Unknown';
      plantMap[pl] = (plantMap[pl] || 0) + 1;
    });

    const avgConfidence = total > 0 ? (confidenceSum / total).toFixed(1) : 0;

    const diseaseDistribution = Object.keys(diseaseMap).map(name => ({
      name,
      count: diseaseMap[name]
    })).sort((a, b) => b.count - a.count);

    const plantDistribution = Object.keys(plantMap).map(name => ({
      name,
      count: plantMap[name]
    })).sort((a, b) => b.count - a.count);

    return {
      totalAnalyzed: total,
      healthyCount: healthy,
      diseasedCount: diseased,
      avgConfidence: Number(avgConfidence),
      diseaseDistribution,
      plantDistribution
    };
  }, [history]);

  return (
    <HistoryContext.Provider value={{
      history,
      stats,
      addPrediction,
      removePrediction,
      clearHistory
    }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
