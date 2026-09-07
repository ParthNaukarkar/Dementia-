import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Brain, 
  ArrowRight, 
  MapPin, 
  Compass, 
  Volume2, 
  VolumeX, 
  Sliders, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Play, 
  Square, 
  UserCheck, 
  Award, 
  ShieldCheck, 
  ChevronRight, 
  Eye 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SupportedLanguage } from '../../types/prescription';
import { 
  WhereAmIEngine, 
  WHERE_AM_I_TIERS, 
  type GeneratedTrial 
} from './engine';
import { whereAmIAudio } from './audio';
import type {
  WhereAmIDifficulty,
  WhereAmISettingsSnapshot,
  WhereAmITrialTelemetry,
  WhereAmISessionSummary,
  OasisWhereAmIPersona
} from './types';
import { REAL_WORLD_WHERE_AM_I_PERSONAS } from './types';


export interface WhereAmIProps {
  language: SupportedLanguage;
  totalTrials?: number;
  initialTheta?: number;
  onTrialComplete?: (telemetry: WhereAmITrialTelemetry) => void;
  onSessionComplete?: (summary: WhereAmISessionSummary) => void;
  onExit?: () => void;
}

type GameState = 'intro' | 'play' | 'feedback' | 'completed';

const UI_TEXT = {
  as: {
    title: 'মই ক’ত আছোঁ? (Where Am I?)',
    subtitle: 'উত্তৰ-পূবৰ বিখ্যাত স্থান আৰু ঐতিহ্য চিনাক্তকৰণ',
    desc: 'এটাৰ পিছত এটাকৈ দিয়া সংকেতসমূহ পঢ়ি ঠাইখন চিনাক্ত কৰক। যিমানে কম সংকেতত আৰু ক্ষিপ্ৰভাৱে ক’ব পাৰিব, সিমানেই আপোনাৰ স্মৃতিশক্তি প্ৰতিফলিত হ’ব।',
    start: 'অনুশীলন আৰম্ভ কৰক',
    next: 'পৰৱৰ্তী স্থান',
    exit: 'সম্পূৰ্ণ কৰক',
    cluesTitle: 'স্থানৰ সংকেতসমূহ',
    revealNextClue: 'পৰৱৰ্তী সংকেত খোলক',
    compassHint: 'দিশানিৰ্ণায়ক কম্পাস সহায়',
    compassUsed: 'কম্পাসে ভুল বিকল্প আঁতৰালে',
    allCluesRevealed: 'সকলো সংকেত মুকলি কৰা হৈছে',
    correct: 'অসাধাৰণ! আপুনি সঠিক স্থান চিনাক্ত কৰিলে!',
    incorrect: 'ভুল উত্তৰ! সঠিক স্থানটো চিনাক্ত কৰক।',
    trial: 'স্থান',
    of: 'ৰ ভিতৰত',
    score: 'সঠিক',
    autonomy: 'স্বায়ত্তশাসন',
    theta: 'মগজুৰ স্তৰ (θ)',
    tremorGuard: 'মটৰ ফিল্টাৰ সক্ৰিয়',
    testbedTitle: 'AI ক্লিনিকেল পৰীক্ষাগাৰ',
    simulationTitle: 'প্ৰকৃত ৰোগী অনুকৰণ (OASIS-2)',
    simulateStep: 'ৰোগীৰ কাৰ্য অনুকৰণ কৰক',
    autoSimulate: 'স্বয়ংক্ৰিয় অনুকৰণ',
    mocaScore: 'MoCA স্থান নিৰ্ণয় স্ক’ৰ',
    topography: 'স্থানমুখী দিশজ্ঞান',
    semantic: 'শব্দাৰ্থ সন্ধান দক্ষতা',
  },
  bn: {
    title: 'আমি কোথায়? (Where Am I?)',
    subtitle: 'উত্তর-পূর্বের বিখ্যাত স্থান ও ঐতিহ্য চিহ্নিতকরণ',
    desc: 'একের পর এক দেওয়া সূত্রগুলি পড়ে স্থানটি চিহ্নিত করুন। যত কম সূত্রে ও দ্রুত উত্তর দিতে পারবেন, ততই আপনার স্মৃতিশক্তি প্রতিফলিত হবে।',
    start: 'অনুশীলন শুরু করুন',
    next: 'পরবর্তী স্থান',
    exit: 'সম্পূর্ণ করুন',
    cluesTitle: 'স্থানের সূত্রাবলী',
    revealNextClue: 'পরবর্তী সূত্র খুলুন',
    compassHint: 'দিকনির্ণায়ক কম্পাস সাহায্য',
    compassUsed: 'কম্পাস ভুল বিকল্প অপসারণ করেছে',
    allCluesRevealed: 'সমস্ত সূত্র প্রকাশিত হয়েছে',
    correct: 'অসাধারণ! আপনি সঠিক স্থান চিহ্নিত করেছেন!',
    incorrect: 'ভুল উত্তর! সঠিক স্থানটি চিনে নিন।',
    trial: 'স্থান',
    of: 'এর মধ্যে',
    score: 'সঠিক',
    autonomy: 'স্বায়ত্তশাসন',
    theta: 'মস্তিষ্কের স্তর (θ)',
    tremorGuard: 'মোটর ফিল্টার সক্রিয়',
    testbedTitle: 'AI ক্লিনিক্যাল পরীক্ষাগার',
    simulationTitle: 'প্রকৃত রোগী অনুকরণ (OASIS-2)',
    simulateStep: 'রোগীর পদক্ষেপ অনুকরণ করুন',
    autoSimulate: 'স্বয়ংক্রিয় অনুকরণ',
    mocaScore: 'MoCA স্থান নির্ণয় স্কোর',
    topography: 'স্থানমুখী দিকজ্ঞান',
    semantic: 'স্মৃতি পুনরুদ্ধার দক্ষতা',
  },
  hi: {
    title: 'मैं कहाँ हूँ? (Where Am I?)',
    subtitle: 'पूर्वोत्तर के प्रसिद्ध स्थलों व सांस्कृतिक धरोहर की पहचान',
    desc: 'एक के बाद एक दिए गए सुरागों को पढ़कर सही स्थान को पहचानें। आप जितने कम सुरागों में और जितनी जल्दी उत्तर देंगे, आपकी स्थानिक स्मृति उतनी ही बेहतर आंकी जाएगी।',
    start: 'अभ्यास शुरू करें',
    next: 'अगला स्थान',
    exit: 'समाप्त करें',
    cluesTitle: 'स्थान के सुराग',
    revealNextClue: 'अगला सुराग खोलें',
    compassHint: 'दिशा सूचक कम्पास सहायता',
    compassUsed: 'कम्पास ने गलत विकल्प हटा दिए',
    allCluesRevealed: 'सभी सुराग प्रकट हो चुके हैं',
    correct: 'शानदार! आपने सही स्थान पहचाना!',
    incorrect: 'गलत उत्तर! सही स्थान को जानें।',
    trial: 'स्थान',
    of: 'में से',
    score: 'सटीक',
    autonomy: 'स्वायत्तता',
    theta: 'मस्तिष्क स्तर (θ)',
    tremorGuard: 'मोटर फ़िल्टर सक्रिय',
    testbedTitle: 'AI क्लीनिकल टेस्टबेड',
    simulationTitle: 'वास्तविक रोगी अनुकरण (OASIS-2)',
    simulateStep: 'रोगी कदम अनुकरण करें',
    autoSimulate: 'स्वचालित अनुकरण',
    mocaScore: 'MoCA स्थानिक संज्ञान स्कोर',
    topography: 'स्थानिक दिशा-ज्ञान',
    semantic: 'स्मृति पुनर्प्राप्ति दक्षता',
  },
  en: {
    title: 'Where Am I?',
    subtitle: 'Northeast India Topographical Orientation & Landmark Memory',
    desc: 'Identify the iconic place from progressive clues. Answering with fewer clues and decisive speed demonstrates sharper hippocampal retrieval.',
    start: 'Begin Assessment',
    next: 'Next Location',
    exit: 'Complete Session',
    cluesTitle: 'Progressive Clues',
    revealNextClue: 'Reveal Next Clue',
    compassHint: 'Compass Guide Hint',
    compassUsed: 'Compass eliminated incorrect choices',
    allCluesRevealed: 'All available clues revealed',
    correct: 'Outstanding! Correct location identified!',
    incorrect: 'Incorrect choice! Review the landmark features.',
    trial: 'Location',
    of: 'of',
    score: 'Score',
    autonomy: 'Autonomy',
    theta: 'Latent Ability (θ)',
    tremorGuard: 'Motor Guard Active',
    testbedTitle: 'AI Clinical Testbed',
    simulationTitle: 'Real-World OASIS-2 Patient Simulation',
    simulateStep: 'Simulate Patient Step',
    autoSimulate: 'Auto-Simulate Session',
    mocaScore: 'MoCA Place Orientation Score',
    topography: 'Topographical Wayfinding',
    semantic: 'Semantic Retrieval Efficiency',
  }
};

export const WhereAmI: React.FC<WhereAmIProps> = ({
  language,
  totalTrials = 5,
  initialTheta = 0.0,
  onTrialComplete,
  onSessionComplete,
  onExit
}) => {
  // ─── Engine & Calibration ─────────────────────────────────────────────
  const engine = useMemo(() => new WhereAmIEngine(initialTheta), [initialTheta]);
  const [currentDifficulty, setCurrentDifficulty] = useState<WhereAmIDifficulty>(engine.getDifficulty());
  const [manualTierOverride, setManualTierOverride] = useState<number | null>(null);
  
  // ─── Game State ────────────────────────────────────────────────────────
  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentTrialIndex, setCurrentTrialIndex] = useState(1);
  const [correctTrials, setCorrectTrials] = useState(0);
  const [currentTrial, setCurrentTrial] = useState<GeneratedTrial | null>(null);
  const [usedLocationIds, setUsedLocationIds] = useState<string[]>([]);
  
  // ─── Scaffolding & Clues ───────────────────────────────────────────────
  const [visibleClueCount, setVisibleClueCount] = useState(1);
  const [compassHintUsed, setCompassHintUsed] = useState(false);
  const [eliminatedOptionIds, setEliminatedOptionIds] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  
  // ─── Selection & Feedback ──────────────────────────────────────────────
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isTrialCorrect, setIsTrialCorrect] = useState<boolean | null>(null);
  const [lastAdaptiveReasoning, setLastAdaptiveReasoning] = useState<Record<SupportedLanguage, string>>({
    as: '', bn: '', hi: '', en: ''
  });
  
  // ─── Telemetry & Kinematics ────────────────────────────────────────────
  const trialStartTimeRef = useRef<number>(0);
  const [trialTelemetryList, setTrialTelemetryList] = useState<WhereAmITrialTelemetry[]>([]);
  const [sessionSummary, setSessionSummary] = useState<WhereAmISessionSummary | null>(null);
  const [tremorCount, setTremorCount] = useState(0);
  const [liveAutonomy, setLiveAutonomy] = useState(100);
  
  // ─── Testbed & Real-World OASIS Simulation ─────────────────────────────
  const [isTestbedOpen, setIsTestbedOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<OasisWhereAmIPersona>(REAL_WORLD_WHERE_AM_I_PERSONAS[0]);
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const autoSimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = UI_TEXT[language] || UI_TEXT.en;

  // Sync audio mute
  useEffect(() => {
    whereAmIAudio.setMuted(isMuted);
  }, [isMuted]);

  // Generate trial
  const startTrial = useCallback((tier: WhereAmIDifficulty, historyIds: string[]) => {
    const trial = engine.generateTrial(tier, historyIds);
    setCurrentTrial(trial);
    setVisibleClueCount(trial.initialVisibleClues);
    setCompassHintUsed(false);
    setEliminatedOptionIds([]);
    setSelectedOptionId(null);
    setIsTrialCorrect(null);
    trialStartTimeRef.current = Date.now();
    setLiveAutonomy(100);

    // Initial voice cue
    const clueText = trial.targetLocation.clues[language]?.[0] || trial.targetLocation.clues.en[0];
    whereAmIAudio.speakGuidance(clueText, language);
  }, [engine, language]);


  // Start game
  const handleStartGame = () => {
    const tier = manualTierOverride ? engine.getDifficultyForTierLevel(manualTierOverride) : engine.getDifficulty();
    setCurrentDifficulty(tier);
    startTrial(tier, []);
    setUsedLocationIds([]);
    setCurrentTrialIndex(1);
    setCorrectTrials(0);
    setTrialTelemetryList([]);
    setGameState('play');
  };

  // Clue auto-reveal countdown timer
  useEffect(() => {
    if (gameState !== 'play' || !currentTrial) return;
    const maxClues = currentTrial.targetLocation.clues[language]?.length || 4;
    if (visibleClueCount < maxClues) {
      const intervalMs = currentDifficulty.clueIntervalSec * 1000;
      const timer = setTimeout(() => {
        setVisibleClueCount(prev => {
          const next = prev + 1;
          whereAmIAudio.playClueReveal();
          const nextClueText = currentTrial.targetLocation.clues[language]?.[next - 1];
          if (nextClueText) whereAmIAudio.speakGuidance(nextClueText, language);
          return next;
        });
      }, intervalMs);
      return () => clearTimeout(timer);
    }
  }, [gameState, visibleClueCount, currentTrial, currentDifficulty, language]);

  // Reveal next clue voluntarily
  const handleRevealNextClue = () => {
    if (!currentTrial) return;
    const maxClues = currentTrial.targetLocation.clues[language]?.length || 4;
    if (visibleClueCount < maxClues) {
      const nextCount = visibleClueCount + 1;
      setVisibleClueCount(nextCount);
      whereAmIAudio.playClueReveal();
      const nextClue = currentTrial.targetLocation.clues[language]?.[nextCount - 1];
      if (nextClue) whereAmIAudio.speakGuidance(nextClue, language);
    }
  };

  // Compass hint: eliminates 1 or 2 wrong options
  const handleUseCompassHint = () => {
    if (!currentTrial || compassHintUsed || !currentDifficulty.compassAllowed) return;
    whereAmIAudio.playCompassChime();
    const eliminated = engine.applyCompassHint(
      currentTrial.options,
      currentTrial.targetLocation.id,
      currentDifficulty.compassEliminatesCount
    );
    setCompassHintUsed(true);
    setEliminatedOptionIds(eliminated);
  };

  // Option selection
  const handleOptionClick = (optionId: string) => {
    if (gameState !== 'play' || !currentTrial) return;

    // 400ms Tremor Guard Filter
    const now = Date.now();
    if (!engine.filterTremorTap(now)) {
      setTremorCount(engine.getTremorFilteredCount());
      return; // Suppress involuntary tremor jitter
    }

    whereAmIAudio.playOptionTap();
    const deliberationTimeMs = Date.now() - trialStartTimeRef.current;
    setSelectedOptionId(optionId);
    
    const isCorrect = optionId === currentTrial.targetLocation.id;
    setIsTrialCorrect(isCorrect);

    if (isCorrect) {
      setCorrectTrials(prev => prev + 1);
      whereAmIAudio.playCorrectSound();
    } else {
      whereAmIAudio.playIncorrectSound();
    }

    // Unfold all 4 clues for reinforcement
    const maxClues = currentTrial.targetLocation.clues[language]?.length || 4;
    setVisibleClueCount(maxClues);

    // Settings Snapshot
    const settingsSnapshot: WhereAmISettingsSnapshot = {
      compassHintUsed,
      cluesRevealed: visibleClueCount,
      totalCluesAvailable: maxClues,
      proactiveClueRequested: visibleClueCount > currentTrial.initialVisibleClues,
      isManualTierOverride: manualTierOverride !== null,
      soundMuted: isMuted,
    };

    // Bayesian 2PL IRT Update
    const irtResult = engine.updateTheta(
      isCorrect,
      deliberationTimeMs,
      visibleClueCount,
      settingsSnapshot
    );

    setLastAdaptiveReasoning(irtResult.reasoning);
    setLiveAutonomy(irtResult.autonomyScore);

    // Update Difficulty if not locked by manual override
    if (manualTierOverride === null) {
      const nextDiff = engine.deriveDifficultyFromTheta(irtResult.newTheta);
      engine.setDifficulty(nextDiff);
      setCurrentDifficulty(nextDiff);
    }

    // Telemetry Record
    const telemetry: WhereAmITrialTelemetry = {
      trialIndex: currentTrialIndex,
      tierLevel: currentDifficulty.tierLevel,
      targetLocationId: currentTrial.targetLocation.id,
      targetLocationName: currentTrial.targetLocation.name.en,
      targetState: currentTrial.targetLocation.state,
      selectedOptionId: optionId,
      isCorrect,
      cluesRevealedCount: visibleClueCount,
      compassHintUsed,
      eliminatedOptionIds,
      deliberationTimeMs,
      timeToFirstTapMs: deliberationTimeMs,
      totalTapsCount: 1,
      autonomyScore: irtResult.autonomyScore,
      thetaAfterTrial: irtResult.newTheta,
      difficultySnapshot: { ...currentDifficulty },
      settingsSnapshot,
      aiAdaptiveReasoning: irtResult.reasoning,
    };

    setTrialTelemetryList(prev => [...prev, telemetry]);
    if (onTrialComplete) onTrialComplete(telemetry);

    setGameState('feedback');
  };

  // Next Trial or Complete
  const handleNextTrial = () => {
    if (currentTrialIndex < totalTrials) {
      const nextIdx = currentTrialIndex + 1;
      setCurrentTrialIndex(nextIdx);
      const newHistory = currentTrial ? [...usedLocationIds, currentTrial.targetLocation.id] : usedLocationIds;
      setUsedLocationIds(newHistory);
      const tier = manualTierOverride ? engine.getDifficultyForTierLevel(manualTierOverride) : engine.getDifficulty();
      setCurrentDifficulty(tier);
      startTrial(tier, newHistory);
      setGameState('play');
    } else {
      handleCompleteSession();
    }
  };

  // Complete Session
  const handleCompleteSession = () => {
    const summary = engine.compileSessionSummary(trialTelemetryList);
    setSessionSummary(summary);
    setGameState('completed');
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
    if (onSessionComplete) {
      onSessionComplete(summary);
    }
  };

  // ─── OASIS Simulation Runner ─────────────────────────────────────────
  const runSingleSimulatedStep = useCallback(() => {
    if (!currentTrial || gameState !== 'play') return;
    const simResult = engine.simulateOasisPatientAction(
      selectedPersona,
      currentTrial,
      currentDifficulty
    );

    // Apply simulation outcomes
    setVisibleClueCount(simResult.cluesRevealedCount);
    if (simResult.compassHintUsed) {
      setCompassHintUsed(true);
      const elim = engine.applyCompassHint(
        currentTrial.options,
        currentTrial.targetLocation.id,
        currentDifficulty.compassEliminatesCount
      );
      setEliminatedOptionIds(elim);
    }
    setTremorCount(engine.getTremorFilteredCount());

    // Execute option selection after deliberate delay
    setTimeout(() => {
      handleOptionClick(simResult.selectedOptionId);
    }, 400);
  }, [currentTrial, gameState, selectedPersona, currentDifficulty, engine]);

  // Auto-simulate through all remaining rounds
  useEffect(() => {
    if (isAutoSimulating) {
      if (gameState === 'intro') {
        handleStartGame();
      } else if (gameState === 'play') {
        autoSimTimerRef.current = setTimeout(() => {
          runSingleSimulatedStep();
        }, 600);
      } else if (gameState === 'feedback') {
        autoSimTimerRef.current = setTimeout(() => {
          handleNextTrial();
        }, 900);
      } else if (gameState === 'completed') {
        setIsAutoSimulating(false);
      }
    }
    return () => {
      if (autoSimTimerRef.current) clearTimeout(autoSimTimerRef.current);
    };
  }, [isAutoSimulating, gameState, currentTrialIndex, runSingleSimulatedStep]);

  // ─── RENDER: INTRO VIEW ───────────────────────────────────────────────
  if (gameState === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] p-6 text-center max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-amber-100 rounded-3xl flex items-center justify-center mb-6 shadow-md border-2 border-amber-300">
          <MapPin className="w-12 h-12 text-amber-700 animate-bounce" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">{t.title}</h1>
        <p className="text-amber-800 font-semibold text-base mb-4">{t.subtitle}</p>
        <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-xl">{t.desc}</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg mb-8 text-left">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
            <span className="text-xs text-amber-700 font-bold block uppercase tracking-wider">Clinical Domain</span>
            <span className="text-sm font-semibold text-slate-800">MoCA Place & CANTAB</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
            <span className="text-xs text-emerald-700 font-bold block uppercase tracking-wider">Tremor Guard</span>
            <span className="text-sm font-semibold text-slate-800">400ms Debounce</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 col-span-2 sm:col-span-1">
            <span className="text-xs text-blue-700 font-bold block uppercase tracking-wider">Adaptive IRT</span>
            <span className="text-sm font-semibold text-slate-800">9 Minimal Tiers</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleStartGame}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-10 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 text-lg active:scale-95"
          >
            {t.start} <ArrowRight className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setIsTestbedOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-4 px-6 rounded-2xl border border-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <Sliders className="w-5 h-5 text-amber-600" />
            <span>AI Testbed</span>
          </button>
        </div>
      </div>
    );
  }

  // ─── RENDER: COMPLETION VIEW ──────────────────────────────────────────
  if (gameState === 'completed' && sessionSummary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] p-6 max-w-3xl mx-auto w-full">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6 shadow-md border-2 border-emerald-300">
          <Award className="w-10 h-10 text-emerald-600 animate-pulse" />
        </div>
        
        <h2 className="text-3xl font-extrabold text-slate-900 mb-1">
          {sessionSummary.accuracyPercentage >= 80 ? 'অসাধাৰণ স্থান সংবেদন!' : 'অনুশীলন সম্পন্ন হ’ল!'}
        </h2>
        <p className="text-slate-600 text-lg mb-8">
          {sessionSummary.accuracyPercentage}% স্থান সঠিকভাৱে নিৰ্ণয় কৰা হ’ল ({sessionSummary.correctTrials}/{sessionSummary.totalTrials})
        </p>

        {/* Clinical Phenotype Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">
          {/* MoCA Place Orientation Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.mocaScore}</span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">MoCA Place</span>
            </div>
            <div className="text-3xl font-extrabold text-amber-700 mb-2">
              {sessionSummary.estimatedMoCAPlaceOrientationScore.toFixed(1)} <span className="text-lg font-normal text-slate-500">/ 6.0</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
              <div 
                className="bg-amber-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${(sessionSummary.estimatedMoCAPlaceOrientationScore / 6.0) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600">
              {sessionSummary.topographicalOrientationStatus === 'intact_wayfinding'
                ? 'অক্ষত স্থান অভিমুখীতা আৰু হিপ’কেম্পেল স্মৃতি। প্ৰথম সংকেততে প্ৰত্যক্ষ চিনাক্তকৰণ।'
                : sessionSummary.topographicalOrientationStatus === 'mild_topographical_disorientation'
                ? 'মৃদু স্থান বিভ্ৰম (MCI সূচক)। সহায়ক সংকেতৰ প্ৰয়োজন দেখা গৈছে।'
                : 'লক্ষণীয় স্থানমুখী স্মৃতিভ্ৰংশ। সৰ্বাধিক সহায়িকাৰ প্ৰয়োজন।'}
            </p>
          </div>

          {/* Autonomy & Clues Efficiency */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">স্বায়ত্তশাসন আৰু সংকেত ব্যৱহাৰ</span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">CANTAB Norm</span>
            </div>
            <div className="flex items-baseline gap-4 mb-2">
              <div className="text-3xl font-extrabold text-blue-700">{sessionSummary.autonomyScore}%</div>
              <div className="text-sm text-slate-600">গড় সংকেত: <span className="font-bold text-slate-800">{sessionSummary.meanCluesPerTrial}</span></div>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${sessionSummary.autonomyScore}%` }}
              />
            </div>
            <p className="text-xs text-slate-600">
              লক্ষণীয়: {sessionSummary.semanticRetrievalEfficiency === 'rapid_direct'
                ? 'দ্ৰুত আৰু পোনপটীয়া শব্দ সন্ধান। সংকেত নিৰ্ভৰশীলতা অতি কম।'
                : 'সংকেত-নিৰ্ভৰশীল স্থান পুনৰুদ্ধাৰ। প্ৰগতিশীল সহায়িকাত অনুকূল সঁহাৰি।'}
            </p>
          </div>
        </div>

        {/* On-Device Edge Cognitive Classifier Results */}
        {sessionSummary.oasisClinicalClassification && (
          <div className="w-full p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-lg mb-8 text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">On-Device Edge ML Classifier</span>
              </div>
              <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full">OASIS-2 Trained</span>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xl font-bold text-white">
                {sessionSummary.oasisClinicalClassification.clinicalTier === 'NORMAL' && 'স্বাভাৱিক সংজ্ঞান (Normal Aging)'}
                {sessionSummary.oasisClinicalClassification.clinicalTier === 'MCI' && 'মৃদু সংজ্ঞান ক্ষয় (MCI Range)'}
                {sessionSummary.oasisClinicalClassification.clinicalTier === 'HIGH_SUPPORT' && 'উচ্চ সহায় প্ৰয়োজনীয় (Dementia)'}
              </span>
              <span className="text-sm text-amber-300 font-semibold">
                কনফিডেন্স: {Math.round(sessionSummary.oasisClinicalClassification.confidenceScore * 100)}%
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              আনুমানিক MoCA শ্ৰেণী: <span className="text-white font-bold">{sessionSummary.oasisClinicalClassification.estimatedMoCARange}</span> • 
              লেটেন্সি: {sessionSummary.meanDeliberationMs}ms • মটৰ কঁপনি সংৰক্ষণ: {engine.getTremorFilteredCount()} ফিল্টাৰ
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Normal</span>
                <span className="font-bold text-white">{(sessionSummary.oasisClinicalClassification.probabilities['NORMAL'] * 100).toFixed(1)}%</span>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">MCI</span>
                <span className="font-bold text-white">{(sessionSummary.oasisClinicalClassification.probabilities['MCI'] * 100).toFixed(1)}%</span>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Support</span>
                <span className="font-bold text-white">{(sessionSummary.oasisClinicalClassification.probabilities['HIGH_SUPPORT'] * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleStartGame}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" /> পুনৰ আৰম্ভ কৰক
          </button>
          <button
            onClick={onExit}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-8 rounded-2xl shadow-md transition-all"
          >
            {t.exit}
          </button>
        </div>
      </div>
    );
  }

  // ─── RENDER: ACTIVE PLAY VIEW ─────────────────────────────────────────
  return (
    <div className="flex flex-col items-center min-h-[70vh] p-4 max-w-4xl mx-auto w-full select-none">
      {/* Top HUD Bar */}
      <div className="flex flex-wrap justify-between items-center w-full mb-4 gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            {t.trial} {currentTrialIndex} {t.of} {totalTrials}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
            স্তৰ {currentDifficulty.tierLevel} ({currentDifficulty.choicesCount} বিকল্প)
          </span>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-xl">
            {t.score}: {correctTrials}
          </span>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-xl">
            {t.autonomy}: {liveAutonomy}%
          </span>
          {tremorCount > 0 && (
            <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-xl">
              ফিল্টাৰ: {tremorCount}
            </span>
          )}
        </div>


        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <Activity className="w-3.5 h-3.5" />
            <span>θ: {engine.getTheta() >= 0 ? '+' : ''}{engine.getTheta().toFixed(2)}</span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title={isMuted ? 'শব্দ খোলক' : 'শব্দ বন্ধ কৰক'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-amber-600" />}
          </button>

          <button
            onClick={() => setIsTestbedOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors border border-slate-200"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">AI Testbed</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-grow w-full">
        {/* Clues Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t.cluesTitle}</h3>
                <span className="text-xs text-slate-500 font-medium">
                  {visibleClueCount} / {currentTrial?.targetLocation.clues[language]?.length || 4} সংকেত মুকলি
                </span>
              </div>
            </div>

            {/* Dignified Compass Hint Action */}
            {gameState === 'play' && currentDifficulty.compassAllowed && (
              <button
                disabled={compassHintUsed}
                onClick={handleUseCompassHint}
                className={`flex items-center gap-2 text-xs font-bold py-2 px-3.5 rounded-xl transition-all shadow-sm ${
                  compassHintUsed
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-200 active:scale-95'
                }`}
                title="ভুল বিকল্প আঁতৰাই স্থান নিশ্চিত কৰক"
              >
                <Compass className={`w-4 h-4 ${compassHintUsed ? '' : 'animate-spin'}`} style={{ animationDuration: '6s' }} />
                <span>{compassHintUsed ? t.compassUsed : t.compassHint}</span>
              </button>
            )}
          </div>

          {/* Clues List */}
          {currentTrial && (
            <div className="space-y-3 mb-4">
              {currentTrial.targetLocation.clues[language]?.slice(0, visibleClueCount).map((clue, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gradient-to-r from-amber-50/90 to-orange-50/50 rounded-2xl border border-amber-200/80 text-slate-800 font-medium text-base sm:text-lg animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-200/70 text-amber-900 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{clue}</span>
                </div>
              ))}
            </div>
          )}

          {/* Progressive Clue Reveal Button */}
          {gameState === 'play' && currentTrial && visibleClueCount < (currentTrial.targetLocation.clues[language]?.length || 4) && (
            <div className="flex justify-end mt-2">
              <button
                onClick={handleRevealNextClue}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-100/60 hover:bg-amber-100 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{t.revealNextClue}</span>
              </button>
            </div>
          )}
        </div>

        {/* Feedback Banner */}
        {gameState === 'feedback' && (
          <div className={`p-4 rounded-2xl mb-6 text-center font-bold text-lg border animate-in zoom-in-95 duration-200 ${
            isTrialCorrect 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              {isTrialCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <XCircle className="w-6 h-6 text-rose-600" />}
              <span>{isTrialCorrect ? t.correct : t.incorrect}</span>
            </div>
            {currentTrial && (
              <div className="text-sm font-semibold text-slate-700">
                ঐতিহাসিক স্থান: <span className="text-amber-800 font-bold">{currentTrial.targetLocation.name[language] || currentTrial.targetLocation.name.en}</span> ({currentTrial.targetLocation.state})
              </div>
            )}
            {lastAdaptiveReasoning[language] && (
              <p className="text-xs text-slate-600 font-normal mt-2 max-w-xl mx-auto">
                {lastAdaptiveReasoning[language]}
              </p>
            )}
          </div>
        )}

        {/* Location Choice Buttons */}
        <div className={`grid gap-3.5 ${
          (currentTrial?.options.length || 4) <= 2 
            ? 'grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto w-full' 
            : (currentTrial?.options.length || 4) === 3
            ? 'grid-cols-1 sm:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2'
        }`}>
          {currentTrial?.options.map((option) => {
            const isCorrectOption = option.id === currentTrial.targetLocation.id;
            const isSelected = option.id === selectedOptionId;
            const isEliminated = eliminatedOptionIds.includes(option.id);

            let btnStyle = "relative p-5 rounded-2xl text-left border-2 font-bold text-base sm:text-lg transition-all shadow-sm flex items-center justify-between";

            if (isEliminated && gameState === 'play') {
              btnStyle += " bg-slate-50 border-slate-200 text-slate-300 line-through opacity-40 cursor-not-allowed";
            } else if (gameState === 'play') {
              btnStyle += " bg-white border-slate-200 hover:border-amber-400 hover:shadow-md text-slate-800 active:scale-98 cursor-pointer";
            } else {
              // Feedback mode
              if (isCorrectOption) {
                btnStyle += " bg-emerald-50 border-emerald-500 text-emerald-900 shadow-md ring-2 ring-emerald-300";
              } else if (isSelected && !isCorrectOption) {
                btnStyle += " bg-rose-50 border-rose-400 text-rose-800";
              } else {
                btnStyle += " bg-slate-50 border-slate-200 text-slate-400 opacity-50";
              }
            }

            return (
              <button
                key={option.id}
                disabled={gameState !== 'play' || isEliminated}
                onClick={() => handleOptionClick(option.id)}
                className={btnStyle}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <div className="leading-snug">{option.name[language] || option.name.en}</div>
                    <span className="text-xs font-normal text-slate-500 block mt-0.5">
                      {option.stateName[language] || option.state}
                    </span>
                  </div>
                </div>

                {gameState === 'feedback' && isCorrectOption && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                )}
                {gameState === 'feedback' && isSelected && !isCorrectOption && (
                  <XCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Next Action */}
        {gameState === 'feedback' && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleNextTrial}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 text-lg active:scale-95 transform hover:-translate-y-0.5"
            >
              <span>{t.next}</span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* ─── SLIDE-OUT AI TESTBED DRAWER ─────────────────────────────────── */}
      {isTestbedOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-600" />
                  <h3 className="font-extrabold text-slate-900 text-lg">{t.testbedTitle}</h3>
                </div>
                <button
                  onClick={() => setIsTestbedOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Real-time Gauges */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Latent Theta (θ)</span>
                  <span className="text-2xl font-black text-amber-900">
                    {engine.getTheta() >= 0 ? '+' : ''}{engine.getTheta().toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Tremor Suppressed</span>
                  <span className="text-2xl font-black text-emerald-900">{engine.getTremorFilteredCount()} taps</span>
                </div>
              </div>

              {/* Tier Selection (1 to 9) */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Active Minimal Tier (1-9)
                  </label>
                  {manualTierOverride && (
                    <button
                      onClick={() => setManualTierOverride(null)}
                      className="text-[11px] font-bold text-amber-600 hover:underline"
                    >
                      Reset Auto-Adaptive
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {WHERE_AM_I_TIERS.map((tier) => {
                    const isSelected = (manualTierOverride ?? currentDifficulty.tierLevel) === tier.tierLevel;
                    return (
                      <button
                        key={tier.tierLevel}
                        onClick={() => {
                          setManualTierOverride(tier.tierLevel);
                          setCurrentDifficulty(tier);
                        }}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        T{tier.tierLevel}: {tier.choicesCount} Ch
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  {currentDifficulty.tierDescription[language] || currentDifficulty.tierDescription.en}
                </p>
              </div>

              {/* OASIS-2 Patient Persona Simulator */}
              <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {t.simulationTitle}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {REAL_WORLD_WHERE_AM_I_PERSONAS.map((p) => {
                    const isSelected = selectedPersona.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPersona(p)}
                        className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-100/70 border-amber-400 text-amber-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{p.avatarIcon}</span>
                          <div>
                            <div className="font-bold">{p.name}</div>
                            <span className="text-[10px] text-slate-500">MMSE {p.mmse} • CDR {p.cdr}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          p.clinicalTier === 'NORMAL' ? 'bg-emerald-100 text-emerald-800' :
                          p.clinicalTier === 'MCI' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {p.clinicalTier}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[11px] text-slate-600 italic mb-4">
                  {selectedPersona.clinicalNotes[language] || selectedPersona.clinicalNotes.en}
                </p>

                {/* Simulation Controls */}
                <div className="flex gap-2">
                  <button
                    disabled={gameState !== 'play'}
                    onClick={runSingleSimulatedStep}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{t.simulateStep}</span>
                  </button>

                  <button
                    onClick={() => setIsAutoSimulating(!isAutoSimulating)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isAutoSimulating
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-slate-800 text-white hover:bg-slate-900'
                    }`}
                  >
                    {isAutoSimulating ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isAutoSimulating ? 'Stop' : t.autoSimulate}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => setIsTestbedOpen(false)}
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
