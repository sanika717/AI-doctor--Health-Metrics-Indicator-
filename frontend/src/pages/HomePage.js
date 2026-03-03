import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '❤️', key: 'Heart Rate Analysis', desc: 'Real-time BPM detection via facial blood flow patterns using rPPG technology.' },
  { icon: '🧠', key: 'Stress Detection', desc: 'HRV-based stress level estimation through micro-circulation analysis.' },
  { icon: '😴', key: 'Fatigue Assessment', desc: 'Facial signal processing to estimate mental and physical fatigue levels.' },
  { icon: '🩸', key: 'Blood Flow Status', desc: 'Peripheral blood circulation quality derived from skin optical signals.' },
  { icon: '📊', key: 'Health Score', desc: 'Composite wellness score aggregating all vital biometric indicators.' },
  { icon: '📄', key: 'PDF Health Report', desc: 'Downloadable clinical-style report with all scan metrics and recommendations.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { user } = useAuth();

  const STATS = [
    { value: '99%', label: t('home.stats.noninvasive') },
    { value: '15s', label: t('home.stats.scantime') },
    { value: '94%', label: t('home.stats.accuracy') },
    { value: '6+', label: t('home.stats.metrics') },
  ];

  return (
    <main className="min-h-[calc(100vh-80px)] flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-16">
        <div className="animate-fade-in mb-8 inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full uppercase tracking-wider">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          {t('home.badge')}
        </div>

        {user && !user.isGuest && (
          <div className="animate-fade-in mb-4 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs px-4 py-2 rounded-full">
            👋 Welcome back, {user.name?.split(' ')[0]}!
          </div>
        )}

        <h1 className="animate-fade-in-delay-1 font-display text-6xl md:text-7xl lg:text-8xl text-white mb-6 leading-none tracking-tight">
          {t('home.title1')}<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
            {t('home.title2')}
          </span>
        </h1>

        <p className="animate-fade-in-delay-2 text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('home.subtitle')}
        </p>

        <div className="animate-fade-in-delay-3 flex flex-col sm:flex-row gap-3 items-center">
          <button onClick={() => navigate('/scan')}
            className="group relative overflow-hidden btn-primary text-lg px-10 py-5 rounded-2xl glow-blue inline-flex items-center gap-3">
            <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
            <span className="heartbeat text-xl">❤️</span>
            <span>{t('home.cta')}</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          {!user && (
            <button onClick={() => navigate('/login')} className="btn-ghost px-8 py-5 rounded-2xl text-base">
              👤 Create Profile
            </button>
          )}
        </div>

        <div className="animate-fade-in-delay-4 mt-14 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
          {STATS.map(({ value, label }) => (
            <div key={label} className="bg-slate-950/60 backdrop-blur-sm px-8 py-5 text-center">
              <div className="font-display text-3xl text-white mb-1">{value}</div>
              <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl text-white mb-3">{t('home.whatWeMeasure')}</h2>
          <p className="text-slate-500 text-base">{t('home.whatSub')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon, key, desc }, i) => (
            <div key={key} className={`glass-card glass-card-hover p-6 animate-fade-in-delay-${Math.min(i + 1, 5)}`}>
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="text-white font-semibold text-base mb-2">{key}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/[0.05] py-12 px-6 text-center">
        <p className="text-slate-600 text-xs max-w-lg mx-auto">{t('home.disclaimer')}</p>
      </section>
    </main>
  );
}
