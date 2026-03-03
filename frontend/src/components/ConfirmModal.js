import React from 'react';

export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-box glass-card max-w-md w-full mx-4 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl mx-auto mb-5">
          ⚠️
        </div>

        <h3 className="font-display text-2xl text-white text-center mb-2">{title}</h3>
        <p className="text-slate-400 text-sm text-center leading-relaxed mb-8">{message}</p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="btn-ghost py-3 rounded-xl text-sm font-medium"
          >
            No, Keep It
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600/80 hover:bg-red-600 border border-red-500/30 text-white py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-red-600/20"
          >
            Yes, Discard
          </button>
        </div>
      </div>
    </div>
  );
}
