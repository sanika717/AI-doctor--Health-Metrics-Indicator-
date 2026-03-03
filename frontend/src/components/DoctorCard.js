import React from 'react';

export default function DoctorCard({ doctor, icon, delay = 0, t }) {
  const { name, designation, hospital, location, available_time, booking_url, specialization } = doctor;
  const initials = name.replace('Dr. ', '').split(' ').slice(0, 2).map(n => n[0]).join('');
  const colors = ['from-blue-600 to-cyan-500','from-teal-600 to-emerald-500','from-violet-600 to-blue-500','from-rose-600 to-pink-500','from-amber-600 to-orange-500','from-indigo-600 to-violet-500'];
  const colorIdx = name.charCodeAt(4) % colors.length;

  return (
    <div className={`glass-card glass-card-hover flex flex-col animate-fade-in-delay-${delay}`}>
      <div className="p-5 flex items-start gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center text-white font-display text-xl flex-shrink-0 shadow-lg`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base leading-tight mb-0.5 truncate">{name}</h3>
          <p className="text-slate-500 text-xs leading-snug line-clamp-2">{designation}</p>
        </div>
      </div>

      <div className="px-5 pb-3">
        <span className="inline-flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
          <span>{icon}</span>
          <span className="truncate max-w-[200px]">{specialization.split('(')[0].trim()}</span>
        </span>
      </div>

      <div className="px-5 py-3 border-t border-white/[0.05] space-y-2.5 flex-1">
        <div className="flex items-start gap-2.5">
          <svg className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-slate-400 text-xs leading-snug">{hospital}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <svg className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-slate-400 text-xs">{location}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <svg className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-emerald-400/80 text-xs font-medium">{available_time}</span>
        </div>
      </div>

      <div className="p-4 pt-3">
        <a href={booking_url} target="_blank" rel="noopener noreferrer"
          className="btn-primary w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {t ? t('doctors.bookBtn') : 'Book Appointment'}
          <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
