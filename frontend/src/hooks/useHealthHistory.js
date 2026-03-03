import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useHealthHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  const storageKey = user ? `health_history_${user.email}` : 'health_history_guest';

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch { setHistory([]); }
    } else {
      setHistory([]);
    }
  }, [storageKey]);

  const addScan = (scanData) => {
    const entry = {
      ...scanData,
      id: scanData.id || Date.now().toString(),
      timestamp: scanData.timestamp || new Date().toISOString(),
    };
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, 50); // keep last 50
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem(storageKey);
    setHistory([]);
  };

  const getStats = () => {
    if (history.length === 0) return null;
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    return {
      totalScans: history.length,
      avgHealthScore: avg(history.map((h) => h.health_score)).toFixed(1),
      avgHeartRate: avg(history.map((h) => h.heart_rate)).toFixed(1),
      avgStress: avg(history.map((h) => h.stress)).toFixed(1),
      lastScan: history[0]?.timestamp,
    };
  };

  return { history, addScan, clearHistory, getStats };
}
