import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hi', label: 'हि', name: 'Hindi' },
  { code: 'mr', label: 'म', name: 'Marathi' },
  { code: 'ta', label: 'த', name: 'Tamil' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { lang, changeLang, t } = useLang();
  const [showLang, setShowLang] = useState(false);
  const [showUser, setShowUser] = useState(false);

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/scan', label: t('nav.scan') },
    { to: '/doctors', label: t('nav.doctors') },
    { to: '/history', label: t('nav.history') },
  ];

  const handleLogout = () => {
    logout();
    setShowUser(false);
    navigate('/');
  };

  return (
    <header className="relative z-50">
      <nav className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L13.5 8.5L20 7L15.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L8.5 12L4 7L10.5 8.5L12 2Z" fill="white" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <span className="font-display text-lg text-white leading-none block">AI Health</span>
            <span className="text-xs text-blue-400 font-mono tracking-widest uppercase">Scanner</span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-0.5 bg-white/[0.03] border border-white/[0.07] rounded-full px-1.5 py-1.5">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                pathname === to ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => { setShowLang(!showLang); setShowUser(false); }}
              className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-full hover:text-white hover:border-white/[0.15] transition-all"
            >
              🌐 {LANGUAGES.find(l => l.code === lang)?.label}
            </button>
            {showLang && (
              <div className="absolute right-0 top-10 glass-card py-1 min-w-[130px] z-50">
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { changeLang(l.code); setShowLang(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      lang === l.code ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}>
                    <span className="font-semibold mr-2">{l.label}</span>{l.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => { setShowUser(!showUser); setShowLang(false); }}
                className="flex items-center gap-2 text-xs text-slate-400 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-full hover:text-white hover:border-white/[0.15] transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
              </button>
              {showUser && (
                <div className="absolute right-0 top-10 glass-card py-2 min-w-[160px] z-50">
                  <div className="px-4 py-2 border-b border-white/[0.06]">
                    <p className="text-white text-sm font-medium truncate">{user.name}</p>
                    <p className="text-slate-500 text-xs truncate">{user.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setShowUser(false)}
                    className="block px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors">
                    👤 {t('nav.profile')}
                  </Link>
                  <Link to="/history" onClick={() => setShowUser(false)}
                    className="block px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors">
                    📊 {t('nav.history')}
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.05] transition-colors">
                    🚪 {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login"
              className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-full transition-all">
              {t('nav.login')}
            </Link>
          )}

          {/* Online badge */}
          <span className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            {t('nav.online')}
          </span>
        </div>
      </nav>
      <div className="nav-glow-line" />
    </header>
  );
}
