import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLang();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email.'); return; }
    login({ name: name.trim(), email: email.trim().toLowerCase() });
    navigate('/');
  };

  const handleGuest = () => {
    login({ name: 'Guest User', email: 'guest@healthscanner.app', isGuest: true });
    navigate('/');
  };

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-blue-500/30">
            🏥
          </div>
          <h1 className="font-display text-4xl text-white mb-2">{t('login.title')}</h1>
          <p className="text-slate-500 text-sm">{t('login.subtitle')}</p>
        </div>

        {/* Form */}
        <div className="glass-card p-8 animate-fade-in-delay-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                {t('login.name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                placeholder="John Doe"
                className="w-full bg-slate-950/60 border border-white/[0.08] text-white placeholder-slate-600 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                {t('login.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="john@example.com"
                className="w-full bg-slate-950/60 border border-white/[0.08] text-white placeholder-slate-600 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                ⚠️ {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full py-3.5 rounded-xl text-sm mt-2">
              {t('login.createProfile')}
            </button>
          </form>

          <p className="text-slate-600 text-xs text-center mt-4">{t('login.noAccount')}</p>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-slate-600 text-xs">{t('login.orContinue')}</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <button
            onClick={handleGuest}
            className="btn-ghost w-full py-3 rounded-xl text-sm"
          >
            👤 {t('login.guest')}
          </button>
        </div>
      </div>
    </main>
  );
}
