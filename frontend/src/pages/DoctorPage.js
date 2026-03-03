import React, { useState, useEffect } from 'react';

import { getAllDoctors } from '../utils/api';
import { useLang } from '../context/LangContext';
import DoctorCard from '../components/DoctorCard';

const SPECIALIZATIONS = [
  'All',
  'Cardiologist (Heart Specialist)',
  'General Physician (Full Body Checkup)',
  'Internal Medicine Specialist',
  'Preventive Medicine Specialist',
  'Neurologist (Brain and Nervous System Specialist)',
  'Endocrinologist (Hormones and Metabolism Specialist)',
  'Pulmonologist (Lung and Breathing Specialist)',
  'Gastroenterologist (Digestive System Specialist)',
  'Nephrologist (Kidney Specialist)',
  'Dermatologist (Skin Specialist)',
  'Orthopedic Specialist (Bones, Joints, and Muscles)',
  'Ophthalmologist (Eye Specialist)',
  'ENT Specialist (Ear, Nose, and Throat Specialist)',
  'Psychiatrist (Mental Health Specialist)',
  'General Surgeon (Full Body Surgical Specialist)',
];

const SPEC_ICONS = {
  'Cardiologist (Heart Specialist)': '❤️',
  'General Physician (Full Body Checkup)': '🏥',
  'Internal Medicine Specialist': '🩺',
  'Preventive Medicine Specialist': '🛡️',
  'Neurologist (Brain and Nervous System Specialist)': '🧠',
  'Endocrinologist (Hormones and Metabolism Specialist)': '⚗️',
  'Pulmonologist (Lung and Breathing Specialist)': '🫁',
  'Gastroenterologist (Digestive System Specialist)': '🔬',
  'Nephrologist (Kidney Specialist)': '💊',
  'Dermatologist (Skin Specialist)': '✨',
  'Orthopedic Specialist (Bones, Joints, and Muscles)': '🦴',
  'Ophthalmologist (Eye Specialist)': '👁️',
  'ENT Specialist (Ear, Nose, and Throat Specialist)': '👂',
  'Psychiatrist (Mental Health Specialist)': '🧘',
  'General Surgeon (Full Body Surgical Specialist)': '⚕️',
};

export default function DoctorPage() {
  const { t } = useLang();

  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [specialization, setSpecialization] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if redirected from recommendation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const spec = params.get('spec');
    if (spec) setSpecialization(spec);
  }, []);

  useEffect(() => { fetchDoctors(); }, []);

  useEffect(() => {
    let list = [...doctors];
    if (specialization !== 'All') {
      list = list.filter(d => d.specialization.toLowerCase().includes(specialization.toLowerCase()));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) || d.hospital.toLowerCase().includes(q) || d.location.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [doctors, specialization, searchQuery]);

  const fetchDoctors = async () => {
    setLoading(true); setError('');
    try {
      const res = await getAllDoctors();
      setDoctors(res.data);
    } catch {
      setError('Unable to load doctors. Please ensure the backend is running.');
    } finally { setLoading(false); }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="font-display text-4xl text-white mb-2">{t('doctors.title')}</h1>
        <p className="text-slate-500 text-sm">{t('doctors.subtitle')}</p>
      </div>

      <div className="glass-card p-5 mb-6 animate-fade-in-delay-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder={t('doctors.search')} value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/[0.08] text-white placeholder-slate-600 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div className="md:col-span-2">
            <select value={specialization} onChange={e => setSpecialization(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/[0.08] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
              style={{ backgroundImage:`url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center', backgroundSize:'18px' }}>
              {SPECIALIZATIONS.map(s => (
                <option key={s} value={s} className="bg-slate-900">
                  {s === 'All' ? t('doctors.allSpec') : `${SPEC_ICONS[s] || '🏥'} ${s}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(specialization !== 'All' || searchQuery) && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/[0.05]">
            <span className="text-xs text-slate-500">Filters:</span>
            {specialization !== 'All' && (
              <span className="status-pill bg-blue-500/15 text-blue-400 border border-blue-500/25 text-xs">
                {SPEC_ICONS[specialization]} {specialization.split('(')[0].trim()}
                <button onClick={() => setSpecialization('All')} className="ml-1.5 opacity-60 hover:opacity-100">×</button>
              </span>
            )}
            {searchQuery && (
              <span className="status-pill bg-slate-500/15 text-slate-400 border border-slate-500/25 text-xs">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-1.5 opacity-60 hover:opacity-100">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {!loading && !error && (
        <p className="text-slate-600 text-xs mb-4 pl-1">
          {t('doctors.showing')} {filtered.length} {filtered.length !== 1 ? t('doctors.doctors') : t('doctors.doctor')}
          {specialization !== 'All' ? ` ${t('doctors.in')} ${specialization.split('(')[0].trim()}` : ''}
        </p>
      )}

      {loading && (
        <div className="flex flex-col items-center py-24 gap-4">
          <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">{t('doctors.loading')}</p>
        </div>
      )}

      {error && (
        <div className="glass-card p-8 text-center">
          <p className="text-3xl mb-3">⚠️</p>
          <p className="text-red-400 font-medium mb-2">{error}</p>
          <button onClick={fetchDoctors} className="btn-primary mt-4 px-6 py-2.5 rounded-xl text-sm">Retry</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-slate-400 font-medium mb-1">{t('doctors.noResults')}</p>
          <p className="text-slate-600 text-sm">{t('doctors.adjustFilters')}</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((doctor, i) => (
            <DoctorCard key={doctor.id} doctor={doctor} icon={SPEC_ICONS[doctor.specialization] || '🏥'} delay={Math.min(i, 5)} t={t} />
          ))}
        </div>
      )}
    </main>
  );
}
