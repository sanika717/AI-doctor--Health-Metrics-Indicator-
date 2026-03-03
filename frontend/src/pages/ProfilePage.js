import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useHealthHistory } from '../hooks/useHealthHistory';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const { getStats, clearHistory } = useHealthHistory();
  const stats = getStats();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    gender: user?.gender || '',
  });
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="glass-card p-10 text-center max-w-sm">
          <div className="text-5xl mb-4">👤</div>
          <h2 className="font-display text-2xl text-white mb-2">Not Logged In</h2>
          <p className="text-slate-500 text-sm mb-6">Please login to view your profile.</p>
          <button onClick={() => navigate('/login')} className="btn-primary px-6 py-3 rounded-xl text-sm">
            Login / Create Profile
          </button>
        </div>
      </main>
    );
  }

  const handleSave = () => {
    updateProfile(form);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = user.name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="font-display text-4xl text-white mb-2">{t('profile.title')}</h1>
        <p className="text-slate-500 text-sm">Manage your health profile and view statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left — Avatar & Stats */}
        <div className="space-y-4">
          {/* Avatar Card */}
          <div className="glass-card p-6 text-center animate-fade-in-delay-1">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-2xl font-display text-white mx-auto mb-4 shadow-lg shadow-blue-500/30">
              {initials}
            </div>
            <h3 className="text-white font-semibold text-lg">{user.name}</h3>
            <p className="text-slate-500 text-xs mt-1">{user.email}</p>
            {user.age && <p className="text-slate-500 text-xs">Age: {user.age} · {user.gender}</p>}

            {!editing && (
              <button onClick={() => setEditing(true)} className="btn-ghost mt-4 w-full py-2.5 rounded-xl text-xs">
                ✏️ {t('profile.editProfile')}
              </button>
            )}
          </div>

          {/* Health Stats */}
          {stats && (
            <div className="glass-card p-5 animate-fade-in-delay-2">
              <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs">{t('profile.totalScans')}</span>
                  <span className="text-white font-mono text-sm font-semibold">{stats.totalScans}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs">{t('profile.avgScore')}</span>
                  <span className={`font-mono text-sm font-semibold ${
                    stats.avgHealthScore >= 70 ? 'text-emerald-400' : stats.avgHealthScore >= 50 ? 'text-amber-400' : 'text-red-400'
                  }`}>{stats.avgHealthScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs">Avg Heart Rate</span>
                  <span className="text-blue-400 font-mono text-sm font-semibold">{stats.avgHeartRate} bpm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs">Avg Stress</span>
                  <span className="text-amber-400 font-mono text-sm font-semibold">{stats.avgStress}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right — Edit Form */}
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card p-6 animate-fade-in-delay-1">
            <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
              👤 Personal Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 text-xs uppercase tracking-wider mb-2">{t('profile.name')}</label>
                  <input type="text" value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    disabled={!editing}
                    className="w-full bg-slate-950/60 border border-white/[0.08] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-xs uppercase tracking-wider mb-2">{t('profile.email')}</label>
                  <input type="email" value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    disabled={!editing}
                    className="w-full bg-slate-950/60 border border-white/[0.08] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-xs uppercase tracking-wider mb-2">{t('profile.age')}</label>
                  <input type="number" value={form.age} min="1" max="120"
                    onChange={e => setForm({...form, age: e.target.value})}
                    disabled={!editing}
                    className="w-full bg-slate-950/60 border border-white/[0.08] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-xs uppercase tracking-wider mb-2">{t('profile.gender')}</label>
                  <select value={form.gender}
                    onChange={e => setForm({...form, gender: e.target.value})}
                    disabled={!editing}
                    className="w-full bg-slate-950/60 border border-white/[0.08] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                  >
                    <option value="">Select...</option>
                    <option value="Male">{t('profile.male')}</option>
                    <option value="Female">{t('profile.female')}</option>
                    <option value="Other">{t('profile.other')}</option>
                  </select>
                </div>
              </div>

              {editing && (
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSave} className="btn-primary flex-1 py-3 rounded-xl text-sm">
                    {t('profile.save')}
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-ghost flex-1 py-3 rounded-xl text-sm">
                    Cancel
                  </button>
                </div>
              )}

              {saved && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                  <span>✓</span> {t('profile.saved')}
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-6 animate-fade-in-delay-2 border-red-500/10">
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Account Actions</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => { if(window.confirm('Clear all health history?')) clearHistory(); }}
                className="btn-ghost flex-1 py-3 rounded-xl text-sm text-amber-400 hover:text-amber-300">
                🗑️ Clear Health History
              </button>
              <button onClick={() => { logout(); navigate('/'); }}
                className="flex-1 py-3 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                🚪 {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
