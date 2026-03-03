export const DOCTOR_RECOMMENDATIONS = [
  {
    condition: (r) => r.heart_rate > 100 || r.heart_rate < 55,
    specialization: 'Cardiologist (Heart Specialist)',
    reason: (r) =>
      r.heart_rate > 100
        ? `Your heart rate is elevated at ${r.heart_rate.toFixed(0)} bpm (normal: 60–100 bpm).`
        : `Your heart rate is low at ${r.heart_rate.toFixed(0)} bpm (normal: 60–100 bpm).`,
    urgency: 'high',
    icon: '❤️',
    tip: 'A cardiologist can perform an ECG and comprehensive heart evaluation.',
  },
  {
    condition: (r) => r.stress > 65,
    specialization: 'Psychiatrist (Mental Health Specialist)',
    reason: (r) => `Your stress level is ${r.stress.toFixed(0)}% which is significantly elevated.`,
    urgency: r => r?.stress > 80 ? 'high' : 'medium',
    icon: '🧠',
    tip: 'A psychiatrist can help with stress management, anxiety, and mental wellness strategies.',
  },
  {
    condition: (r) => r.fatigue > 65,
    specialization: 'General Physician (Full Body Checkup)',
    reason: (r) => `Your fatigue level is ${r.fatigue.toFixed(0)}%, which may indicate underlying issues.`,
    urgency: 'medium',
    icon: '😴',
    tip: 'Chronic fatigue can be caused by thyroid issues, anemia, or sleep disorders.',
  },
  {
    condition: (r) => r.blood_flow === 'Poor' || r.blood_flow === 'Slightly Reduced',
    specialization: 'Internal Medicine Specialist',
    reason: (r) => `Your blood flow status is "${r.blood_flow}", indicating reduced peripheral circulation.`,
    urgency: r => r?.blood_flow === 'Poor' ? 'high' : 'medium',
    icon: '🩸',
    tip: 'Poor circulation can be related to cardiovascular, metabolic, or lifestyle factors.',
  },
  {
    condition: (r) => r.stress > 50 && r.fatigue > 50,
    specialization: 'Preventive Medicine Specialist',
    reason: (r) => `Combined stress (${r.stress.toFixed(0)}%) and fatigue (${r.fatigue.toFixed(0)}%) suggest burnout risk.`,
    urgency: 'medium',
    icon: '🛡️',
    tip: 'Preventive medicine specialists help identify and mitigate long-term health risks.',
  },
  {
    condition: (r) => r.health_score < 50,
    specialization: 'General Physician (Full Body Checkup)',
    reason: (r) => `Your overall health score is ${r.health_score.toFixed(0)}/100, below the healthy threshold.`,
    urgency: 'high',
    icon: '🏥',
    tip: 'A full body checkup will help identify any underlying health concerns.',
  },
];

export function getRecommendations(results) {
  if (!results) return [];
  const recs = [];
  const seenSpecs = new Set();

  for (const rule of DOCTOR_RECOMMENDATIONS) {
    if (rule.condition(results)) {
      const spec = rule.specialization;
      if (!seenSpecs.has(spec)) {
        seenSpecs.add(spec);
        const urgency = typeof rule.urgency === 'function' ? rule.urgency(results) : rule.urgency;
        recs.push({
          specialization: spec,
          reason: rule.reason(results),
          urgency,
          icon: rule.icon,
          tip: rule.tip,
        });
      }
    }
  }

  // Sort by urgency
  const order = { high: 0, medium: 1, low: 2 };
  return recs.sort((a, b) => order[a.urgency] - order[b.urgency]);
}

export const URGENCY_STYLES = {
  high: {
    badge: 'bg-red-500/15 text-red-400 border border-red-500/30',
    border: 'border-red-500/20',
    icon: '🔴',
  },
  medium: {
    badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    border: 'border-amber-500/20',
    icon: '🟡',
  },
  low: {
    badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    border: 'border-emerald-500/20',
    icon: '🟢',
  },
};
