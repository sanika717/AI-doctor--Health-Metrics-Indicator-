import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { simulateHealthScan } from '../utils/healthUtils';
import { getRecommendations, URGENCY_STYLES } from '../utils/recommendations';
import { saveScan, downloadReport } from '../utils/api';
import { useHealthHistory } from '../hooks/useHealthHistory';
import { useLang } from '../context/LangContext';
import ConfirmModal from '../components/ConfirmModal';
import MetricCard from '../components/MetricCard';

const SCAN_DURATION = 15000;
const PHASES = { IDLE: 'idle', REQUESTING: 'requesting', SCANNING: 'scanning', COMPLETE: 'complete', ERROR: 'error' };

// Face mesh dot positions (simplified 20-point approximation around face)
const FACE_POINTS = [
  // Forehead
  {x:50,y:12},{x:38,y:14},{x:62,y:14},{x:28,y:20},{x:72,y:20},
  // Eyes
  {x:33,y:33},{x:40,y:30},{x:47,y:33},{x:53,y:33},{x:60,y:30},{x:67,y:33},
  // Nose
  {x:50,y:45},{x:44,y:52},{x:56,y:52},{x:50,y:58},
  // Cheeks
  {x:24,y:48},{x:76,y:48},
  // Mouth
  {x:39,y:65},{x:50,y:67},{x:61,y:65},{x:50,y:72},
  // Jaw
  {x:28,y:72},{x:72,y:72},{x:38,y:82},{x:62,y:82},{x:50,y:88},
];

function FaceMeshOverlay({ active, phase }) {
  const [opacity, setOpacity] = useState(0);
  const [pulseOffset, setPulseOffset] = useState(0);

  useEffect(() => {
    if (!active) { setOpacity(0); return; }
    const t = setTimeout(() => setOpacity(1), 300);
    return () => clearTimeout(t);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => setPulseOffset(p => (p + 1) % 3), 500);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity, transition: 'opacity 0.5s ease' }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" style={{ transform: 'scaleX(-1)' }}>
        {/* Mesh lines connecting key points */}
        {[
          [0,1],[1,2],[2,3],[0,3],[3,5],[4,11],[5,6],[6,7],[8,9],[9,10],
          [5,11],[10,11],[11,13],[13,14],[11,15],[11,16],[17,18],[18,19],
          [17,21],[22,21],[22,23],[23,24],[24,25],
        ].map(([a, b], i) => (
          <line key={i}
            x1={FACE_POINTS[a]?.x} y1={FACE_POINTS[a]?.y}
            x2={FACE_POINTS[b]?.x} y2={FACE_POINTS[b]?.y}
            stroke="rgba(59,130,246,0.25)" strokeWidth="0.3"
          />
        ))}

        {/* Mesh dots */}
        {FACE_POINTS.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r={i === pulseOffset * 8 ? 1.2 : 0.8}
            fill={i % 3 === 0 ? '#14b8a6' : '#3b82f6'}
            opacity={i === pulseOffset * 8 ? 1 : 0.7}
            style={{ transition: 'all 0.3s ease' }}
          />
        ))}

        {/* Face oval outline */}
        <ellipse cx="50" cy="52" rx="28" ry="38" fill="none"
          stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" strokeDasharray="2,2" />
      </svg>
    </div>
  );
}

function RecommendationCard({ rec, t }) {
  const styles = URGENCY_STYLES[rec.urgency];
  return (
    <div className={`glass-card p-4 border ${styles.border} animate-fade-in`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{rec.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="text-white text-sm font-medium">{rec.specialization.split('(')[0].trim()}</h4>
            <span className={`status-pill ${styles.badge} text-xs`}>
              {styles.icon} {t(`recommendation.urgency.${rec.urgency}`)}
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed mb-1">{rec.reason}</p>
          <p className="text-slate-600 text-xs italic">{rec.tip}</p>
        </div>
      </div>
    </div>
  );
}

export default function ScanPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { addScan } = useHealthHistory();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [phase, setPhase] = useState(PHASES.IDLE);
  const [scanProgress, setScanProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [savedScanId, setSavedScanId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [showMesh, setShowMesh] = useState(false);
  const [activeTab, setActiveTab] = useState('metrics'); // metrics | recommendations

  useEffect(() => {
    return () => { stopStream(); };
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const startScan = useCallback(async () => {
    setPhase(PHASES.REQUESTING);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }, audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPhase(PHASES.SCANNING);
      setScanProgress(0);
      
      // Show face mesh after short delay
      setTimeout(() => setShowMesh(true), 800);

      const startTime = Date.now();
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setScanProgress(Math.min((elapsed / SCAN_DURATION) * 100, 99));
        if (elapsed >= SCAN_DURATION) clearInterval(progressInterval);
      }, 100);

      const data = await simulateHealthScan(SCAN_DURATION);
      clearInterval(progressInterval);
      setScanProgress(100);
      setShowMesh(false);

      // Save to MongoDB
      let scanId = null;
      try {
        const res = await saveScan(data);
        scanId = res.data.id;
        setSavedScanId(scanId);
      } catch {}

      // Save to local history
      addScan({ ...data, id: scanId || `loc_${Date.now()}` });
      setResults(data);
      setPhase(PHASES.COMPLETE);
    } catch (err) {
      setError(
        err.name === 'NotAllowedError'
          ? t('scan.cameraPermission')
          : t('scan.cameraError')
      );
      setPhase(PHASES.ERROR);
      stopStream();
    }
  }, [t, addScan]);

  const handleNewScan = () => setShowModal(true);

  const doReset = () => {
    stopStream();
    setResults(null);
    setSavedScanId(null);
    setScanProgress(0);
    setShowMesh(false);
    setPhase(PHASES.IDLE);
    setShowModal(false);
    navigate('/');
  };

  const handleDownload = async () => {
    if (!savedScanId) { alert('Report only available for server-saved scans.'); return; }
    setDownloading(true);
    try {
      const res = await downloadReport(savedScanId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `health-report-${savedScanId.slice(0, 8)}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert('Failed to download report. Please try again.'); }
    finally { setDownloading(false); }
  };

  const recommendations = results ? getRecommendations(results) : [];

  const METRICS = results ? [
    { key:'heart_rate', label:t('metrics.heart_rate'), value:results.heart_rate, unit:'bpm', icon:'❤️', barVal:Math.min(100,(results.heart_rate/180)*100), description:'Beats per minute' },
    { key:'stress', label:t('metrics.stress'), value:results.stress, unit:'%', icon:'🧠', barVal:results.stress, description:'HRV-based estimation' },
    { key:'fatigue', label:t('metrics.fatigue'), value:results.fatigue, unit:'%', icon:'😴', barVal:results.fatigue, description:'Mental & physical fatigue' },
    { key:'blood_flow', label:t('metrics.blood_flow'), value:results.blood_flow, unit:'', icon:'🩸', barVal:results.blood_flow==='Good'?90:results.blood_flow==='Normal'?70:results.blood_flow==='Slightly Reduced'?45:25, description:'Peripheral circulation' },
    { key:'health_score', label:t('metrics.health_score'), value:results.health_score, unit:'/ 100', icon:'📊', barVal:results.health_score, description:'Overall wellness index' },
    { key:'confidence', label:t('metrics.confidence'), value:results.confidence, unit:'%', icon:'🎯', barVal:results.confidence, description:'Signal quality score' },
  ] : [];

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="font-display text-4xl text-white mb-2">
          {phase === PHASES.COMPLETE ? t('scan.complete') : t('scan.title')}
        </h1>
        <p className="text-slate-500 text-sm">
          {phase === PHASES.COMPLETE ? t('scan.subtitleDone') : t('scan.subtitle')}
        </p>
      </div>

      <div className={`grid gap-6 ${phase === PHASES.COMPLETE ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
        {/* Camera Panel */}
        <div className={phase === PHASES.COMPLETE ? 'lg:col-span-2' : 'col-span-1'}>
          <div className="glass-card p-4">
            <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline style={{ transform:'scaleX(-1)' }} />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-0" />

              {/* Face Mesh Overlay */}
              <FaceMeshOverlay active={showMesh} phase={phase} />

              {/* Idle */}
              {phase === PHASES.IDLE && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.869V15.13a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-600 text-xs">Camera preview here</p>
                </div>
              )}

              {/* Requesting */}
              {phase === PHASES.REQUESTING && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                  <div className="dot-loader mb-3"><span /><span /><span /></div>
                  <p className="text-blue-400 text-sm">{t('scan.accessingCamera')}</p>
                </div>
              )}

              {/* Scanning overlays */}
              {phase === PHASES.SCANNING && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Corner brackets */}
                  {[{t:'top-0',l:'left-0'},{t:'top-0',l:'right-0',r:true},{t:'bottom-0',l:'left-0',b:true},{t:'bottom-0',l:'right-0',r:true,b:true}].map((pos,i) => (
                    <div key={i} className={`absolute ${pos.t} ${pos.l} w-10 h-10`}>
                      <div className={`absolute w-full h-0.5 bg-blue-400 ${pos.b ? 'bottom-0' : 'top-0'}`} />
                      <div className={`absolute h-full w-0.5 bg-blue-400 ${pos.r ? 'right-0' : 'left-0'}`} />
                    </div>
                  ))}
                  {/* Face oval */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="scan-ring w-36 h-44 border-2 border-blue-400/40 rounded-full" />
                  </div>
                  {/* Scan line */}
                  <div className="scan-line-anim" />
                  {/* Status chip */}
                  <div className="absolute top-3 left-0 right-0 flex justify-center">
                    <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur border border-blue-500/30 px-3 py-1.5 rounded-full text-xs text-blue-300 font-medium">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                      {t('scan.scanning')}
                    </div>
                  </div>
                  {/* Mesh indicator */}
                  {showMesh && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                      <div className="flex items-center gap-1.5 bg-teal-950/80 border border-teal-500/30 px-3 py-1 rounded-full text-xs text-teal-400">
                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                        Face Mesh Active — {FACE_POINTS.length} landmarks
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Complete */}
              {phase === PHASES.COMPLETE && (
                <div className="absolute top-3 left-0 right-0 flex justify-center">
                  <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs text-emerald-300">
                    <span>✓</span>{t('scan.scanComplete')}
                  </div>
                </div>
              )}

              {/* Error */}
              {phase === PHASES.ERROR && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 p-4">
                  <div className="text-3xl mb-3">⚠️</div>
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {(phase === PHASES.SCANNING || phase === PHASES.COMPLETE) && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>{t('scan.signalProcessing')}</span>
                  <span className="text-blue-400 font-mono">{scanProgress.toFixed(0)}%</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill bg-gradient-to-r from-blue-600 to-teal-400" style={{ width:`${scanProgress}%` }} />
                </div>
              </div>
            )}

            {/* Start button */}
            {(phase === PHASES.IDLE || phase === PHASES.ERROR) && (
              <button onClick={startScan} className="btn-primary w-full mt-4 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
                <span className="heartbeat">❤️</span>
                {phase === PHASES.ERROR ? t('scan.tryAgain') : t('scan.startScan')}
              </button>
            )}

            {phase === PHASES.SCANNING && (
              <p className="mt-4 text-center text-xs text-slate-600">{t('scan.keepFace')}</p>
            )}

            {/* Recommendations panel (when complete) */}
            {phase === PHASES.COMPLETE && results && recommendations.length > 0 && (
              <div className="mt-4 glass-card p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  💡 {t('scan.recommendations')}
                </h3>
                <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
                  {results.heart_rate > 100 && <p className="text-amber-400/90">• Elevated heart rate. Consider seeing a cardiologist.</p>}
                  {results.stress > 65 && <p className="text-amber-400/90">• High stress. Practice mindfulness and adequate rest.</p>}
                  {results.fatigue > 65 && <p className="text-amber-400/90">• High fatigue. Prioritize 7–9 hours of quality sleep.</p>}
                  {results.health_score >= 70 && <p className="text-emerald-400/90">• Good overall health. Maintain your lifestyle.</p>}
                  <p className="text-slate-600 pt-1">⚕️ Consult a qualified physician for clinical diagnosis.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Panel */}
        {phase === PHASES.COMPLETE && results && (
          <div className="lg:col-span-3">
            {/* Health Score */}
            <div className="glass-card p-5 mb-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{t('scan.healthScore')}</p>
                  <div className="flex items-end gap-3">
                    <span className="font-display text-6xl text-white">{results.health_score}</span>
                    <span className="text-slate-500 text-xl mb-2">/ 100</span>
                  </div>
                </div>
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                    <circle cx="50" cy="50" r="42" fill="none"
                      stroke={results.health_score >= 70 ? '#10b981' : results.health_score >= 50 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - results.health_score / 100)}`}
                      style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-slate-500">Score</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 mb-4">
              {[
                { id: 'metrics', label: '📊 Metrics' },
                { id: 'recommendations', label: `🏥 Doctor Recommendations ${recommendations.length > 0 ? `(${recommendations.length})` : ''}` },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Metrics Tab */}
            {activeTab === 'metrics' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {METRICS.map((metric, i) => (
                  <MetricCard key={metric.key} metric={metric} delay={i} />
                ))}
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <div className="space-y-3">
                {recommendations.length === 0 ? (
                  <div className="glass-card p-8 text-center">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="text-emerald-400 font-medium mb-1">{t('recommendation.noIssues')}</p>
                    <p className="text-slate-500 text-sm">{t('recommendation.keepIt')}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-500 text-xs mb-3">{t('recommendation.subtitle')}</p>
                    {recommendations.map((rec, i) => (
                      <RecommendationCard key={i} rec={rec} t={t} />
                    ))}
                    <button
                      onClick={() => navigate('/doctors')}
                      className="btn-teal w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 mt-2"
                    >
                      🔍 {t('recommendation.findDoctors')}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {phase === PHASES.COMPLETE && (
        <div className="flex flex-col sm:flex-row gap-3 mt-6 max-w-2xl mx-auto animate-fade-in">
          <button onClick={handleNewScan} className="btn-ghost flex-1 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('scan.newScan')}
          </button>
          <button onClick={() => navigate('/doctors')} className="btn-teal flex-1 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {t('scan.doctorAppt')}
          </button>
          <button onClick={handleDownload} disabled={downloading}
            className="btn-primary flex-1 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            {downloading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('scan.generating')}</>
              : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>{t('scan.downloadReport')}</>
            }
          </button>
        </div>
      )}

      {showModal && (
        <ConfirmModal
          title={t('scan.discardTitle')}
          message={t('scan.discardMsg')}
          onConfirm={doReset}
          onCancel={() => setShowModal(false)}
        />
      )}
    </main>
  );
}
