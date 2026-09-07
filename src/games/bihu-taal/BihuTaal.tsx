import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Music, 
  Volume2, 
  RotateCcw, 
  Sparkles, 
  Brain, 
  ShieldCheck, 
  Sliders, 
  History,
  Hand
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BihuTaalEngine } from './engine';
import { bihuAudio } from './audio';
import type { 
  BihuTaalProps, 
  BihuTrialTelemetry, 
  BihuTaalSessionSummary, 
  SupportedLanguage 
} from './types';

const STRINGS: Record<SupportedLanguage, {
  title: string;
  subtitle: string;
  goRule: string;
  noGoRule: string;
  tapButton: string;
  tappedBadge: string;
  heldBadge: string;
  startPrompt: string;
  startDescription: string;
  startButton: string;
  holdingBeat: string;
  pepaPrompt: string;
  holdPrompt: string;
  responseRegistered: string;
  tapOnlyWhenPepa: string;
  beatLabel: string;
  ofLabel: string;
  sessionCompleteTitle: string;
  impulsivityLabel: string;
  inattentionLabel: string;
  playAgain: string;
  backToDashboard: string;
}> = {
  as: {
    title: 'বীহু তাল (Bihu Taal)',
    subtitle: 'মনোযোগ আৰু নিয়ন্ত্ৰণ অনুশীলন (Go/No-Go Attention)',
    goRule: 'পেঁপা ওলালে 📯 ➔ লগে লগে ঢোলত চাপৰ মাৰক (TAP)!',
    noGoRule: 'অন্য বাদ্য ওলালে (ঢোল, গগনা, টোকৰী) ➔ শান্ত হৈ ৰওক (DO NOT TAP)!',
    tapButton: 'ঢোলত চাপৰ মাৰক (TAP DRUM)!',
    tappedBadge: 'চাপৰ মৰা হ\'ল!',
    heldBadge: 'ৰৈ দিলে (Good Hold)',
    startPrompt: 'তাল মিলাবলৈ সাজু হওক...',
    startDescription: 'বিহুৰ সুৰ শুনক। যেতিয়াই পেঁপা বাজিব, ঢোলৰ বুটামত চাপৰ মাৰক!',
    startButton: 'বীহু তাল আৰম্ভ কৰক ➔',
    holdingBeat: 'তাল ৰখা হৈছে... পৰৱৰ্তী বাদ্য আহি আছে!',
    pepaPrompt: 'পেঁপা! ঢোলত চাপৰ মাৰক!',
    holdPrompt: 'শান্ত হৈ ৰওক (টিপিব নালাগে)',
    responseRegistered: 'চাপৰ গ্ৰহণ কৰা হ\'ল ✓',
    tapOnlyWhenPepa: 'কেৱল পেঁপা 📯 ওলালেহে চাপৰ মাৰক!',
    beatLabel: 'তাল',
    ofLabel: '/',
    sessionCompleteTitle: 'অনুশীলন সমাপ্ত • মনোযোগ মূল্যায়ন',
    impulsivityLabel: 'আবেগ নিয়ন্ত্ৰণ (Commission Errors / Impulsivity)',
    inattentionLabel: 'সজাগতা (Omission Errors / Inattention)',
    playAgain: 'পুনৰ খেলক',
    backToDashboard: 'মুখ্য পৃষ্ঠালৈ উভতি যাওক',
  },
  bn: {
    title: 'বিহু তাল (Bihu Taal)',
    subtitle: 'মনোযোগ ও নিয়ন্ত্রণ পরীক্ষা (Go/No-Go Attention)',
    goRule: 'পেঁপা দেখলে 📯 ➔ সাথে সাথে ঢোলে চাপড় দিন (TAP)!',
    noGoRule: 'অন্য বাদ্য দেখলে ➔ শান্ত থাকুন, চাপবেন না (DO NOT TAP)!',
    tapButton: 'ঢোলে চাপড় দিন (TAP DRUM)!',
    tappedBadge: 'চাপড় দেওয়া হয়েছে!',
    heldBadge: 'থামলেন (Good Hold)',
    startPrompt: 'তাল মেলাতে প্রস্তুত হোন...',
    startDescription: 'বিহুর বাদ্য শুনুন। পেঁপা বাজলেই বড় ঢোলের বোতামে চাপড় দিন!',
    startButton: 'বিহু তাল শুরু করুন ➔',
    holdingBeat: 'তাল ধরা হচ্ছে... পরবর্তী বাদ্য আসছে!',
    pepaPrompt: 'পেঁপা! ঢোলে চাপড় দিন!',
    holdPrompt: 'থামুন (চাপবেন না)',
    responseRegistered: 'প্রতিক্রিয়া গ্রহণ করা হয়েছে ✓',
    tapOnlyWhenPepa: 'শুধু পেঁপা 📯 দেখলে চাপড় দিন!',
    beatLabel: 'তাল',
    ofLabel: '/',
    sessionCompleteTitle: 'অনুশীলন সম্পন্ন • মনোযোগ মূল্যায়ন',
    impulsivityLabel: 'আবেগ নিয়ন্ত্রণ (Commission Errors / Impulsivity)',
    inattentionLabel: 'সতর্কতা (Omission Errors / Inattention)',
    playAgain: 'আবার খেলুন',
    backToDashboard: 'ড্যাশবোর্ডে ফিরে যান',
  },
  hi: {
    title: 'बिहू ताल (Bihu Taal)',
    subtitle: 'एकाग्रता एवं आत्म-नियंत्रण अभ्यास (Go/No-Go Attention)',
    goRule: 'पेपा दिखे 📯 ➔ तुरंत ढोल पर थपकी दें (TAP)!',
    noGoRule: 'अन्य वाद्य दिखे ➔ शांत रहें, थपकी न दें (DO NOT TAP)!',
    tapButton: 'ढोल पर थपकी दें (TAP DRUM)!',
    tappedBadge: 'थपकी दी गई!',
    heldBadge: 'रुक गए (Good Hold)',
    startPrompt: 'ताल मिलाने के लिए तैयार हो जाएं...',
    startDescription: 'बिहू वाद्यों को सुनें। जैसे ही पेपा बजे, बड़े ढोल बटन पर थपकी दें!',
    startButton: 'बिहू ताल शुरू करें ➔',
    holdingBeat: 'ताल साधी जा रही है... अगला वाद्य आ रहा है!',
    pepaPrompt: 'पेपा! ढोल पर थपकी दें!',
    holdPrompt: 'शांत रहें (दबाएं नहीं)',
    responseRegistered: 'प्रतिक्रिया दर्ज हुई ✓',
    tapOnlyWhenPepa: 'केवल पेपा 📯 दिखने पर ही थपकी दें!',
    beatLabel: 'ताल',
    ofLabel: '/',
    sessionCompleteTitle: 'सत्र पूर्ण • एकाग्रता मूल्यांकन',
    impulsivityLabel: 'आवेग नियंत्रण (Commission Errors / Impulsivity)',
    inattentionLabel: 'सजगता स्तर (Omission Errors / Inattention)',
    playAgain: 'पुनः खेलें',
    backToDashboard: 'डैशबोर्ड पर लौटें',
  },
  en: {
    title: 'Bihu Taal (Rhythm & Focus)',
    subtitle: 'Vigilance & Motor Inhibition (Go / No-Go Paradigm)',
    goRule: 'When Pepa appears 📯 ➔ TAP THE DRUM IMMEDIATELY!',
    noGoRule: 'When other instruments appear ➔ HOLD STILL, DO NOT TAP!',
    tapButton: 'TAP THE BIHU DRUM!',
    tappedBadge: 'Tapped!',
    heldBadge: 'Held Still (Good)',
    startPrompt: 'Get ready for the rhythm...',
    startDescription: 'Listen to the Bihu instruments. When the Pepa horn plays, tap the big drum button!',
    startButton: 'Start Bihu Taal ➔',
    holdingBeat: 'Holding beat... Next instrument coming!',
    pepaPrompt: 'PEPA! TAP THE DRUM!',
    holdPrompt: 'HOLD STILL (DO NOT TAP)',
    responseRegistered: 'Response Registered ✓',
    tapOnlyWhenPepa: 'Tap only when Pepa 📯 appears!',
    beatLabel: 'Beat',
    ofLabel: 'of',
    sessionCompleteTitle: 'Session Complete • Attention Evaluation',
    impulsivityLabel: 'Inhibitory Control (Commission Errors / Impulsivity)',
    inattentionLabel: 'Sustained Vigilance (Omission Errors / Inattention)',
    playAgain: 'Play Again',
    backToDashboard: 'Back to Dashboard',
  },
};

export const BihuTaal: React.FC<BihuTaalProps> = ({
  language = 'as',
  totalTrials = 12,
  initialTheta = 0.0,
  onTrialComplete,
  onSessionComplete,
  onExit,
}) => {
  const [engine, setEngine] = useState(() => new BihuTaalEngine(initialTheta, totalTrials));

  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'INTER_STIMULUS' | 'COMPLETE'>('READY');
  const [currentTrialNumber, setCurrentTrialNumber] = useState<number>(1);
  const [activeInstrument, setActiveInstrument] = useState(engine.getCurrentInstrument());
  const [hasTapped, setHasTapped] = useState<boolean>(false);
  const [latestTrialTelemetry, setLatestTrialTelemetry] = useState<BihuTrialTelemetry | null>(null);
  const [sessionSummary, setSessionSummary] = useState<BihuTaalSessionSummary | null>(null);
  const [activeSubtitle, setActiveSubtitle] = useState<string>('');
  const [showJudgeControls, setShowJudgeControls] = useState<boolean>(true);
  const [savedSessions, setSavedSessions] = useState<BihuTaalSessionSummary[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('bihu_taal_sessions') || '[]');
    } catch {
      return [];
    }
  });

  const lastTapTimeRef = useRef<number>(0);
  const trialTimerRef = useRef<number | null>(null);
  const startActiveTrialRef = useRef<() => void>(() => {});
  const t = STRINGS[language] || STRINGS.en;

  // Sync engine if props change
  useEffect(() => {
    const newEng = new BihuTaalEngine(initialTheta, totalTrials);
    setEngine(newEng);
    setActiveInstrument(newEng.getCurrentInstrument());
  }, [initialTheta, totalTrials]);

  // Subtitle sync
  useEffect(() => {
    bihuAudio.setSubtitleCallback((text, isPlaying) => {
      setActiveSubtitle(isPlaying ? text : '');
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trialTimerRef.current) window.clearTimeout(trialTimerRef.current);
    };
  }, []);

  // Concludes active trial and sets up ISI / next trial
  const concludeActiveTrial = useCallback(() => {
    if (trialTimerRef.current) {
      window.clearTimeout(trialTimerRef.current);
      trialTimerRef.current = null;
    }

    const tele = engine.concludeTrial();
    setLatestTrialTelemetry(tele);
    if (onTrialComplete) onTrialComplete(tele);

    // Transition to silent Inter-Stimulus Interval (ISI breathing space)
    setGameState('INTER_STIMULUS');

    const diff = engine.getDifficulty();
    const hasMore = engine.nextTrial();

    trialTimerRef.current = window.setTimeout(() => {
      if (hasMore) {
        startActiveTrialRef.current();
      } else {
        // Session Complete
        const summary = engine.generateSessionSummary();
        setSessionSummary(summary);
        setGameState('COMPLETE');
        bihuAudio.playSuccessChime();
        confetti({ particleCount: 60, spread: 75, origin: { y: 0.65 } });

        try {
          const existing: BihuTaalSessionSummary[] = JSON.parse(localStorage.getItem('bihu_taal_sessions') || '[]');
          const updated = [summary, ...existing.filter(s => s.completedAt !== summary.completedAt)].slice(0, 10);
          localStorage.setItem('bihu_taal_sessions', JSON.stringify(updated));
          setSavedSessions(updated);
        } catch (err) {
          console.warn('LocalStorage error', err);
        }

        if (onSessionComplete) onSessionComplete(summary);
      }
    }, diff.isiDurationMs);
  }, [engine, onTrialComplete, onSessionComplete]);

  // Starts presenting 1 trial (Stimulus Active)
  const startActiveTrial = useCallback(() => {
    const inst = engine.startTrial();
    setActiveInstrument(inst);
    setHasTapped(false);
    setCurrentTrialNumber(engine.getCurrentTrialNumber());
    setGameState('PLAYING');

    // Play authentic regional folk sound tailored to instrument
    bihuAudio.playInstrumentSound(inst.id);

    const diff = engine.getDifficulty();

    // Stimulus duration window (3600ms - 4500ms)
    trialTimerRef.current = window.setTimeout(() => {
      concludeActiveTrial();
    }, diff.stimulusDurationMs);
  }, [engine, concludeActiveTrial]);

  useEffect(() => {
    startActiveTrialRef.current = startActiveTrial;
  }, [startActiveTrial]);

  // Start the entire session
  const handleStartGame = useCallback(() => {
    setGameState('PLAYING');
    startActiveTrial();
  }, [startActiveTrial]);

  // Patient taps the drum
  const handleTapDrum = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    const now = performance.now();
    // Motor tremor filter: 160ms debounce
    if (now - lastTapTimeRef.current < 160) return;
    lastTapTimeRef.current = now;

    bihuAudio.playTapClick();
    const accepted = engine.registerTap();
    if (accepted) {
      setHasTapped(true);

      // Geriatric UX: Patient responded! Cancel the remaining long stimulus wait.
      // Give an 800ms tactile feedback window so the elder clearly sees their tap registered,
      // then seamlessly advance to the gentle inter-stimulus pause.
      if (trialTimerRef.current) {
        window.clearTimeout(trialTimerRef.current);
      }
      trialTimerRef.current = window.setTimeout(() => {
        concludeActiveTrial();
      }, 800);
    }
  }, [gameState, engine, concludeActiveTrial]);

  // Keyboard accessibility: Spacebar or Enter taps drum or starts game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        if (gameState === 'PLAYING') {
          e.preventDefault();
          handleTapDrum();
        } else if (gameState === 'READY') {
          e.preventDefault();
          handleStartGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleTapDrum, handleStartGame]);

  const handleRestart = useCallback(() => {
    if (trialTimerRef.current) window.clearTimeout(trialTimerRef.current);
    const newEngine = new BihuTaalEngine(initialTheta, totalTrials);
    setEngine(newEngine);
    setActiveInstrument(newEngine.getCurrentInstrument());
    setCurrentTrialNumber(1);
    setHasTapped(false);
    setLatestTrialTelemetry(null);
    setSessionSummary(null);
    setGameState('READY');
  }, [initialTheta, totalTrials]);

  // Caregiver early conclusion (Fatigue / agitation safety)
  const handleCaregiverEndEarly = useCallback(() => {
    if (trialTimerRef.current) window.clearTimeout(trialTimerRef.current);
    const summary = engine.concludeSessionEarly();
    setSessionSummary(summary);
    setGameState('COMPLETE');
    bihuAudio.playSuccessChime();

    try {
      const existing: BihuTaalSessionSummary[] = JSON.parse(localStorage.getItem('bihu_taal_sessions') || '[]');
      const updated = [summary, ...existing.filter(s => s.completedAt !== summary.completedAt)].slice(0, 10);
      localStorage.setItem('bihu_taal_sessions', JSON.stringify(updated));
      setSavedSessions(updated);
    } catch (err) {
      console.warn('LocalStorage error', err);
    }

    if (onSessionComplete) onSessionComplete(summary);
  }, [engine, onSessionComplete]);

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl border-2 border-rose-300 max-w-5xl mx-auto text-slate-800">
      {/* Subtitle Banner for Hearing Impairment */}
      {activeSubtitle && (
        <div className="mb-6 bg-gradient-to-r from-rose-900 to-amber-900 text-amber-50 p-4 px-6 rounded-2xl shadow-xl flex items-center gap-3.5 border-2 border-amber-400 animate-pulse">
          <Volume2 className="w-7 h-7 text-amber-300 shrink-0" />
          <span className="font-black text-lg md:text-xl text-white">
            "{activeSubtitle}"
          </span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b-2 border-rose-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-700 text-white flex items-center justify-center shadow-lg shrink-0">
            <Music className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {t.title}
              </h2>
              <span className="bg-rose-100 text-rose-900 text-sm md:text-base px-3.5 py-1 rounded-full font-extrabold border border-rose-300">
                {t.beatLabel} {currentTrialNumber} {t.ofLabel} {totalTrials}
              </span>
            </div>
            <p className="text-base text-slate-600 font-semibold mt-0.5">
              {t.subtitle} • Tempo: <strong className="text-rose-900">{engine.getDifficulty().stimulusDurationMs / 1000}s</strong>
            </p>
          </div>
        </div>

        {/* AI & Test Controls */}
        <div className="flex items-center gap-2.5">
          {gameState !== 'COMPLETE' && (
            <button
              onClick={handleCaregiverEndEarly}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 font-extrabold text-xs md:text-sm rounded-2xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
              title="Save progress and gracefully conclude session without fatiguing the elder"
            >
              <span>Save & Rest (End Early)</span>
            </button>
          )}

          <button
            onClick={() => setShowJudgeControls(!showJudgeControls)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-black text-xs md:text-sm rounded-2xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
            title="Inspect Bihu Taal Attention AI and force Go/No-Go trials"
          >
            <Sliders className="w-4 h-4 text-slate-600" />
            <span>AI Testbed</span>
          </button>

          <div className="flex items-center gap-2 bg-rose-50 border-2 border-rose-300 px-3.5 py-2 rounded-2xl text-xs md:text-sm font-extrabold text-rose-900 shadow-2xs">
            <Brain className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Ability (θ): <strong>{engine.getTheta() > 0 ? `+${engine.getTheta()}` : engine.getTheta()}</strong></span>
          </div>
        </div>
      </div>

      {/* SIH 2026 Judge Inspector & Testbed */}
      {showJudgeControls && (
        <div className="my-6 p-4 bg-gradient-to-r from-slate-900 to-rose-950 text-white rounded-3xl border-2 border-rose-500 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2 text-xs font-black tracking-widest text-rose-400 uppercase">
              <Sliders className="w-4 h-4" />
              <span>SIH 2026 Go/No-Go Attention AI Inspector</span>
            </div>
            <span className="text-[11px] font-mono bg-white/15 px-2.5 py-0.5 rounded-full text-rose-200">
              State: {gameState} | Target: {activeInstrument.role} | Tempo: {engine.getDifficulty().tier}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <button
              onClick={() => bihuAudio.playPepaSound()}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>📯 Pepa (Go Horn)</span>
            </button>
            <button
              onClick={() => bihuAudio.playDholSound()}
              className="px-3 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>🥁 Dhol (Drum)</span>
            </button>
            <button
              onClick={() => bihuAudio.playGogonaSound()}
              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>🎋 Gogona (Harp)</span>
            </button>
            <button
              onClick={() => bihuAudio.playTokariSound()}
              className="px-3 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>🪕 Tokari (Lute)</span>
            </button>
            <button
              onClick={() => bihuAudio.playTaalSound()}
              className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>🔔 Taal (Cymbals)</span>
            </button>
            <button
              onClick={() => engine.forceDifficulty('gentle_slow')}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl cursor-pointer"
            >
              <span>Gentle Tempo (4.5s)</span>
            </button>
            <button
              onClick={() => engine.forceDifficulty('moderate')}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl cursor-pointer"
            >
              <span>Moderate Tempo (3.6s)</span>
            </button>
            <button
              onClick={() => engine.forceDifficulty('stimulating_fast')}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl cursor-pointer"
            >
              <span>Fast Tempo (2.8s)</span>
            </button>
          </div>

          {latestTrialTelemetry && (
            <div className="mt-2 text-xs font-mono text-slate-300 bg-black/40 px-3 py-1.5 rounded-lg border border-slate-700/60 flex flex-wrap gap-x-4 gap-y-1">
              <span>Trial #{latestTrialTelemetry.trialNumber}</span>
              <span>Stimulus: <strong>{latestTrialTelemetry.instrument.role === 'GO_TARGET' ? '📯 Target (Pepa)' : '🛑 Inhibit'}</strong></span>
              <span>Result: <strong className={latestTrialTelemetry.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>{latestTrialTelemetry.isCorrect ? 'CORRECT' : latestTrialTelemetry.isCommissionError ? 'IMPULSE ERROR' : 'MISSED TARGET'}</strong></span>
              <span>Reaction: <strong>{latestTrialTelemetry.reactionTimeMs !== null ? `${Math.round(latestTrialTelemetry.reactionTimeMs)}ms` : 'None (Held)'}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Rules Banner (Clear, Simple, Elder-Friendly) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 flex items-center gap-3 shadow-xs">
          <span className="text-4xl shrink-0">📯</span>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 block">
              TARGET (GO):
            </span>
            <span className="font-extrabold text-sm md:text-base text-slate-900 leading-snug">
              {t.goRule}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 flex items-center gap-3 shadow-xs">
          <span className="text-4xl shrink-0">🛑</span>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-rose-800 block">
              DO NOT TAP (NO-GO):
            </span>
            <span className="font-extrabold text-sm md:text-base text-slate-900 leading-snug">
              {t.noGoRule}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* STATE 1: READY / START SCREEN                                */}
      {/* ============================================================ */}
      {gameState === 'READY' && (
        <div className="py-12 text-center space-y-8 max-w-xl mx-auto">
          <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-amber-500 to-rose-700 text-white flex items-center justify-center text-7xl shadow-2xl animate-pulse">
            📯
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900">
              {t.startPrompt}
            </h3>
            <p className="text-base text-slate-600 font-semibold">
              {t.startDescription}
            </p>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full py-6 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-2xl rounded-3xl shadow-2xl transition-all transform active:scale-95 cursor-pointer ring-4 ring-rose-200"
          >
            {t.startButton}
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* STATE 2 & 3: PLAYING & INTER-STIMULUS (RHYTHMIC STAGE)       */}
      {/* ============================================================ */}
      {(gameState === 'PLAYING' || gameState === 'INTER_STIMULUS') && (
        <div className="py-6 space-y-8 max-w-2xl mx-auto text-center">
          {/* Active Instrument Card Stage */}
          <div className={`p-8 md:p-12 rounded-3xl border-4 transition-all duration-300 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden min-h-[300px] ${
            gameState === 'INTER_STIMULUS'
              ? 'bg-slate-100 border-dashed border-slate-300 opacity-60 scale-95'
              : activeInstrument.role === 'GO_TARGET'
              ? 'bg-gradient-to-b from-amber-50 via-amber-100/60 to-amber-200/40 border-amber-500 ring-8 ring-amber-300 scale-102'
              : 'bg-gradient-to-b from-rose-50 via-rose-100/60 to-rose-200/40 border-rose-400'
          }`}>
            {gameState === 'INTER_STIMULUS' ? (
              <div className="space-y-3 py-6">
                <div className="w-12 h-12 rounded-full border-4 border-slate-400 border-t-transparent animate-spin mx-auto" />
                <span className="font-extrabold text-slate-500 text-lg block">
                  {t.holdingBeat}
                </span>
              </div>
            ) : (
              <>
                <span className="text-8xl md:text-9xl mb-4 select-none drop-shadow-md animate-gentle-cue">
                  {activeInstrument.icon}
                </span>
                <span className="font-black text-3xl md:text-4xl text-slate-900 leading-tight">
                  {activeInstrument.names[language]}
                </span>
                <span className="text-sm font-extrabold text-slate-600 mt-2 uppercase tracking-wider bg-white/80 px-4 py-1.5 rounded-full border border-slate-200 shadow-2xs">
                  📍 {activeInstrument.regionalOrigin}
                </span>

                {/* Target Role Guidance Badge */}
                <div className="mt-4">
                  {activeInstrument.role === 'GO_TARGET' ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white font-black text-sm uppercase tracking-wider rounded-full shadow-md animate-bounce">
                      <Sparkles className="w-4 h-4" />
                      <span>{t.pepaPrompt}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-700 text-white font-black text-sm uppercase tracking-wider rounded-full shadow-md">
                      <Hand className="w-4 h-4" />
                      <span>{t.holdPrompt}</span>
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Giant Tactile Drum Button (Massive Touch Target) */}
          <div className="pt-2">
            <button
              onClick={handleTapDrum}
              disabled={gameState !== 'PLAYING'}
              className={`w-full max-w-lg mx-auto py-8 md:py-10 px-8 rounded-4xl font-black text-2xl md:text-3xl shadow-2xl transition-all transform active:scale-90 cursor-pointer flex flex-col items-center justify-center gap-2 border-4 ${
                hasTapped
                  ? 'bg-emerald-600 border-emerald-400 text-white ring-8 ring-emerald-200 shadow-emerald-200'
                  : 'bg-gradient-to-b from-rose-600 via-rose-700 to-rose-800 border-amber-300 text-white hover:bg-rose-700 ring-8 ring-rose-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Music className="w-8 h-8" />
                <span>{hasTapped ? t.tappedBadge : t.tapButton}</span>
              </div>
              <span className="text-xs md:text-sm font-bold opacity-80 uppercase tracking-widest">
                {hasTapped ? t.responseRegistered : t.tapOnlyWhenPepa}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STATE 4: SESSION COMPLETE & CLINICAL ATTENTION EVALUATION    */}
      {/* ============================================================ */}
      {gameState === 'COMPLETE' && sessionSummary && (
        <div className="py-8 space-y-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="inline-flex p-4 rounded-3xl bg-rose-100 text-rose-700 mb-3 border-2 border-rose-300 shadow-md">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-black text-slate-900">
              {t.sessionCompleteTitle}
            </h3>
            <p className="text-base text-slate-600 font-semibold mt-1">
              Bihu Taal (Attention, Vigilance & Motor Inhibition Domain)
            </p>
          </div>

          {/* Early Conclusion Notice for Caregiver Dignity */}
          {sessionSummary.caregiverEndedEarly && (
            <div className="bg-sky-50 border-2 border-sky-400 p-4 px-6 rounded-2xl text-sky-950 font-bold text-sm flex items-center gap-3 shadow-xs">
              <Sparkles className="w-5 h-5 text-sky-600 shrink-0" />
              <span>Session gracefully concluded early to protect elder comfort. Assessment calibrated across {sessionSummary.totalTrials} completed beat{sessionSummary.totalTrials > 1 ? 's' : ''}.</span>
            </div>
          )}

          {/* Score Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accuracy</span>
              <p className="text-3xl font-black text-slate-900 mt-1">{sessionSummary.accuracyPercentage}%</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mean RT</span>
              <p className="text-3xl font-black text-slate-900 mt-1">{sessionSummary.meanReactionTimeMs}ms</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Speed Profile</span>
              <p className="text-xs md:text-sm font-black text-slate-800 mt-2 uppercase tracking-wide">
                {sessionSummary.processingSpeedProfile ? sessionSummary.processingSpeedProfile.replace('_', ' ') : 'Normal'}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Ability (θ)</span>
              <p className="text-3xl font-black text-rose-700 mt-1">
                {sessionSummary.finalTheta > 0 ? `+${sessionSummary.finalTheta}` : sessionSummary.finalTheta}
              </p>
            </div>
            <div className="bg-rose-50 p-4 rounded-3xl border-2 border-rose-400 text-center shadow-md">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">MoCA Attention</span>
              <p className="text-3xl font-black text-rose-950 mt-1">{sessionSummary.estimatedMoCAAttentionScore} / 6</p>
            </div>
          </div>

          {/* Clinical Inhibition vs Inattention Biomarker Breakdown */}
          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border-2 border-amber-300 text-left space-y-3 shadow-xs">
            <div className="flex items-center gap-2 font-black text-amber-950 text-base">
              <Brain className="w-5 h-5 text-amber-700" />
              <span>Clinical Motor Inhibition Breakdown</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 bg-white/90 rounded-2xl border border-amber-200">
                <span className="text-xs font-bold text-slate-600 block uppercase">
                  {t.impulsivityLabel}:
                </span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">
                  {sessionSummary.commissionErrors} <span className="text-xs font-normal text-slate-500">taps on No-Go</span>
                </p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  Lower is better. Reflects healthy prefrontal motor suppression.
                </p>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-amber-200">
                <span className="text-xs font-bold text-slate-600 block uppercase">
                  {t.inattentionLabel}:
                </span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">
                  {sessionSummary.omissionErrors} <span className="text-xs font-normal text-slate-500">missed targets</span>
                </p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  Lower is better. Reflects sustained vigilance and continuous visual focus.
                </p>
              </div>
            </div>
          </div>

          {/* Offline History Card */}
          {savedSessions.length > 0 && (
            <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl text-left space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 font-black text-slate-800 text-sm md:text-base">
                  <History className="w-5 h-5 text-rose-700" />
                  <span>Offline Attention History ({savedSessions.length} Past Sessions)</span>
                </div>
                <span className="text-xs font-extrabold text-rose-700 bg-rose-100 px-3 py-1 rounded-full border border-rose-300">
                  100% Offline LocalStorage
                </span>
              </div>

              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {savedSessions.map((s, idx) => (
                  <div
                    key={s.completedAt || idx}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm font-semibold hover:border-rose-400 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-rose-100 text-rose-900 flex items-center justify-center font-black text-xs">
                        #{savedSessions.length - idx}
                      </span>
                      <div>
                        <span className="font-black text-slate-800 block">
                          {new Date(s.completedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-[11px] text-slate-500 font-bold">
                          {s.totalTrials} Beats • Speed: {s.meanReactionTimeMs}ms
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 font-black">
                      <span className="text-slate-700">
                        Accuracy: <strong className="text-rose-700">{s.accuracyPercentage}%</strong>
                      </span>
                      <span className="bg-rose-100 text-rose-900 px-2.5 py-1 rounded-lg border border-rose-300 text-xs">
                        MoCA: {s.estimatedMoCAAttentionScore}/6
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={handleRestart}
              className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-lg rounded-2xl flex items-center justify-center gap-2 cursor-pointer border-2 border-slate-300"
            >
              <RotateCcw className="w-5 h-5" />
              <span>{t.playAgain}</span>
            </button>

            {onExit && (
              <button
                onClick={onExit}
                className="flex-1 py-5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-lg rounded-2xl shadow-xl cursor-pointer"
              >
                {t.backToDashboard}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
