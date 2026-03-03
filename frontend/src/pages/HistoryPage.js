import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHealthHistory } from '../hooks/useHealthHistory';
import { useLang } from '../context/LangContext';
import { downloadReport } from '../utils/api';
import { STATUS_COLORS, getStatusColor } from '../utils/healthUtils';

function MiniChart({ data, color = '#3b82f6', height = 60 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 200;
  const h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polygon
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`url(#grad-${color.replace('#','')})`}
      />
    </svg>
  );
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function HistoryPage() {
  const { history, getStats, clearHistory } = useHealthHistory();
  const { t } = useLang();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(null);
  const stats = getStats();

  const last7 = history.slice(0, 7).reverse();

  const hrData = last7.map(h => h.heart_rate);
  const stressData = last7.map(h => h.stress);
  const fatigueData = last7.map(h => h.fatigue);
  const scoreData = last7.map(h => h.health_score);

  const handleDownload = async (scan) => {
    if (!scan.id) return;
    setDownloading(scan.id);
    try {
      const res = await downloadReport(scan.id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-report-${scan.id.slice(0, 8)}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Report not available. Scan may not have been saved to server.');
    } finally {
      setDownloading(null);
    }
  };

  if (history.length === 0) {
    return (
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="glass-card p-12 text-center max-w-sm animate-fade-in">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="font-display text-3xl text-white mb-2">{t('history.title')}</h2>
          <p className="text-slate-500 text-sm mb-2">{t('history.noScans')}</p>
          <p className="text-slate-600 text-xs mb-6">{t('history.startFirst')}</p>
          <button onClick={() => navigate('/scan')} className="btn-primary px-8 py-3 rounded-xl text-sm">
            {t('history.scanNow')}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="font-display text-4xl text-white mb-1">{t('history.title')}</h1>
          <p className="text-slate-500 text-sm">{t('history.subtitle')}</p>
        </div>
        <button onClick={() => { if(window.confirm('Clear all history?')) clearHistory(); }}
          className="btn-ghost px-4 py-2.5 rounded-xl text-xs text-slate-500 hover:text-red-400">
          🗑️ Clear All
        </button>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-fade-in-delay-1">
          {[
            { label: 'Total Scans', value: stats.totalScans, color: 'text-blue-400' },
            { label: 'Avg Health Score', value: stats.avgHealthScore, color: stats.avgHealthScore >= 70 ? 'text-emerald-400' : 'text-amber-400' },
            { label: 'Avg Heart Rate', value: `${stats.avgHeartRate} bpm`, color: 'text-blue-400' },
            { label: 'Avg Stress', value: `${stats.avgStress}%`, color: 'text-amber-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card p-4 text-center">
              <p className="text-slate-500 text-xs mb-1">{label}</p>
              <p className={`font-display text-2xl ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Trend Charts */}
      {last7.length >= 2 && (
        <div className="glass-card p-5 mb-6 animate-fade-in-delay-2">
          <h3 className="text-slate-300 font-semibold text-sm mb-4 flex items-center gap-2">
            📈 {t('history.trend')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '❤️ Heart Rate', data: hrData, color: '#ef4444', unit: 'bpm' },
              { label: '🧠 Stress', data: stressData, color: '#f59e0b', unit: '%' },
              { label: '😴 Fatigue', data: fatigueData, color: '#8b5cf6', unit: '%' },
              { label: '📊 Health Score', data: scoreData, color: '#10b981', unit: '/100' },
            ].map(({ label, data, color, unit }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-xs font-mono" style={{ color }}>
                    {data[data.length - 1]?.toFixed(1)}{unit}
                  </span>
                </div>
                <MiniChart data={data} color={color} height={50} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Scans List */}
      <div className="animate-fade-in-delay-3">
        <h3 className="text-slate-300 font-semibold text-sm mb-3 flex items-center gap-2">
          🗂️ {t('history.pastScans')} ({history.length})
        </h3>
        <div className="space-y-3">
          {history.map((scan, i) => {
            const scoreColor = getStatusColor('health_score', scan.health_score);
            const colors = STATUS_COLORS[scoreColor];
            return (
              <div key={scan.id || i} className="glass-card glass-card-hover p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Score bubble */}
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${
                  scan.health_score >= 70 ? 'bg-emerald-500/15 border border-emerald-500/25'
                  : scan.health_score >= 50 ? 'bg-amber-500/15 border border-amber-500/25'
                  : 'bg-red-500/15 border border-red-500/25'
                }`}>
                  <span className={`font-display text-lg ${colors.text}`}>{scan.health_score?.toFixed(0)}</span>
                  <span className="text-slate-600 text-xs">score</span>
                </div>

                {/* Metrics */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <p className="text-slate-600 text-xs">Heart Rate</p>
                    <p className="text-white text-sm font-mono">{scan.heart_rate?.toFixed(0)} <span className="text-slate-600 text-xs">bpm</span></p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs">Stress</p>
                    <p className="text-amber-400 text-sm font-mono">{scan.stress?.toFixed(0)}<span className="text-slate-600 text-xs">%</span></p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs">Fatigue</p>
                    <p className="text-violet-400 text-sm font-mono">{scan.fatigue?.toFixed(0)}<span className="text-slate-600 text-xs">%</span></p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs">Blood Flow</p>
                    <p className="text-slate-300 text-sm">{scan.blood_flow}</p>
                  </div>
                </div>

                {/* Date + Download */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-slate-600 text-xs">{formatDate(scan.timestamp)}</p>
                  {scan.id && !scan.id.startsWith('loc_') && (
                    <button
                      onClick={() => handleDownload(scan)}
                      disabled={downloading === scan.id}
                      className="btn-ghost px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
                    >
                      {downloading === scan.id
                        ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                        : '⬇️'
                      }
                      {t('history.viewReport')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
