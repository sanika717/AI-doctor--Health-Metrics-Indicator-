/**
 * Client-side rPPG simulation that mimics what a real signal processor would compute.
 * In a full implementation, you'd stream frames to the backend for OpenCV/MediaPipe processing.
 */

export function simulateHealthScan(durationMs = 15000) {
  return new Promise((resolve) => {
    // Simulate realistic biometric values
    const heart_rate = parseFloat((62 + Math.random() * 38).toFixed(1));
    const stress = parseFloat((15 + Math.random() * 65).toFixed(1));
    const fatigue = parseFloat((10 + Math.random() * 65).toFixed(1));
    const blood_flows = ['Good', 'Normal', 'Normal', 'Slightly Reduced'];
    const blood_flow = blood_flows[Math.floor(Math.random() * blood_flows.length)];

    const hr_score = heart_rate >= 60 && heart_rate <= 100
      ? 100 : Math.max(0, 100 - Math.abs(heart_rate - 80) * 2);
    const health_score = parseFloat(((hr_score * 0.55 + (100 - stress) * 0.3 + (100 - fatigue) * 0.15)).toFixed(1));
    const confidence = parseFloat((78 + Math.random() * 16).toFixed(1));

    setTimeout(() => {
      resolve({ heart_rate, stress, fatigue, blood_flow, health_score, confidence });
    }, durationMs);
  });
}

export function getStatusColor(metric, value) {
  switch (metric) {
    case 'heart_rate':
      if (value >= 60 && value <= 100) return 'green';
      if (value > 100) return 'red';
      return 'yellow';
    case 'stress':
    case 'fatigue':
      if (value < 35) return 'green';
      if (value < 65) return 'yellow';
      return 'red';
    case 'health_score':
    case 'confidence':
      if (value >= 70) return 'green';
      if (value >= 50) return 'yellow';
      return 'red';
    case 'blood_flow':
      if (value === 'Good' || value === 'Normal') return 'green';
      if (value === 'Slightly Reduced') return 'yellow';
      return 'red';
    default:
      return 'blue';
  }
}

export function getStatusLabel(metric, value) {
  switch (metric) {
    case 'heart_rate':
      if (value >= 60 && value <= 100) return 'Normal';
      if (value > 100) return 'Elevated';
      return 'Low';
    case 'stress':
      if (value < 35) return 'Low';
      if (value < 65) return 'Moderate';
      return 'High';
    case 'fatigue':
      if (value < 35) return 'Low';
      if (value < 65) return 'Moderate';
      return 'High';
    case 'health_score':
    case 'confidence':
      if (value >= 70) return 'Good';
      if (value >= 50) return 'Fair';
      return 'Low';
    default:
      return '';
  }
}

export const STATUS_COLORS = {
  green: {
    pill: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
  },
  yellow: {
    pill: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    bar: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
  },
  red: {
    pill: 'bg-red-500/15 text-red-400 border border-red-500/25',
    bar: 'bg-gradient-to-r from-red-500 to-rose-400',
    text: 'text-red-400',
    glow: 'shadow-red-500/20',
  },
  blue: {
    pill: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
    bar: 'bg-gradient-to-r from-blue-500 to-cyan-400',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
};
