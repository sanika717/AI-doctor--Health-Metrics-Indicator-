import React, { useEffect, useState } from 'react';
import { getStatusColor, getStatusLabel, STATUS_COLORS } from '../utils/healthUtils';

export default function MetricCard({ metric, delay = 0 }) {
  const { key, label, value, unit, icon, barVal, description } = metric;
  const [animatedBar, setAnimatedBar] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimatedBar(barVal), 100 + delay * 120);
    return () => clearTimeout(t);
  }, [barVal, delay]);

  const colorKey = getStatusColor(key, typeof value === 'number' ? value : value === 'Good' || value === 'Normal' ? 70 : 30);
  const colors = STATUS_COLORS[colorKey];
  const statusLabel = key === 'blood_flow' ? value : getStatusLabel(key, value);

  return (
    <div className={`glass-card glass-card-hover p-4 animate-fade-in-delay-${delay}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
            <p className="text-slate-600 text-xs">{description}</p>
          </div>
        </div>
        <span className={`status-pill ${colors.pill} text-xs`}>{statusLabel}</span>
      </div>

      <div className="flex items-end gap-1.5 mb-3">
        <span className={`metric-value text-3xl font-semibold ${colors.text}`}>
          {typeof value === 'number' ? value.toFixed(value >= 10 ? 1 : 1) : value}
        </span>
        {unit && <span className="text-slate-600 text-sm mb-0.5">{unit}</span>}
      </div>

      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${colors.bar}`}
          style={{ width: `${animatedBar}%` }}
        />
      </div>
    </div>
  );
}
