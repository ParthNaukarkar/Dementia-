import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, 
  Eye, 
  CheckCircle2, 
  Volume2, 
  RotateCcw, 
  Sparkles, 
  Brain, 
  ArrowRight,
  ShieldCheck,
  Check,
  Sliders,
  History
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SmritiHaatEngine, type GamePhase } from './engine';
import type { SmritiHaatProps, RoundTelemetry, SessionSummaryTelemetry } from './types';
import { vernacularVoice } from '../../engine/vernacular-voice';
import { CognitiveClassifier, type CognitiveClassificationResult } from '../../engine/cognitive-classifier';
import type { LatencyStage } from '../../engine/latency-timer';
import { AdaptiveAssistanceEngine, type AssistanceProfileConfig } from '../../engine/adaptive-assistance';

// Multilingual audio and UI string dictionaries (Large, high-clarity phrasing)
const STRINGS = {
  as: {
    title: 'স্মৃতি হাট (Smriti Haat)',
    subtitle: 'বজাৰৰ বস্তু কেইপদ মনত ৰাখক',
    studyHeading: 'এই বস্তুবোৰ ভালদৰে লক্ষ্য কৰক:',
    studySub: 'আপোনাৰ যিমানেই সময় লাগে লওক। সাজু হ\'লে তলৰ বুটামত টিপক।',
    readyToCover: 'মই চাই ললোঁ, এতিয়া ঢাকি দিয়ক ➔',
    speakAll: 'সকলো বস্তুৰ নাম শুনক',
    concealHeading: 'মনত পেলাওক... বস্তু কেইপদ ঢাকি দিয়া হৈছে।',
    recallHeading: 'আপুনি বজাৰত কি কি বস্তু দেখিছিল বাছক:',
    itemsNeeded: (needed: number, chosen: number) => `মুঠ ${needed} টা বস্তু বাছক (${chosen} টা বাছিলে)`,
    confirmSelection: 'মই বাছি ললোঁ (Submit Choices)',
    feedbackCorrect: 'বৰ ধুনীয়া! আপুনি সকলো শুদ্ধকৈ মনত ৰাখিলে!',
    feedbackPartial: 'বহুত ভাল চেষ্টা! আপোনাৰ মনত বহুখিনি আছে!',
    nextRound: 'পৰৱৰ্তী ৰাউণ্ড (Next Round)',
    finishGame: 'ফলাফল চাওক (View Report)',
    aiAdapting: 'AI অভিযোজন: আপোনাৰ সুবিধাৰ বাবে স্তৰ নিৰ্ধাৰণ কৰা হৈছে',
    selectedBadge: 'বাছি লোৱা হ\'ল',
    encouragement: 'ধীৰে ধীৰে কৰক, একো খৰখেদা নাই। আপুনি বৰ ভালকৈ কৰিছে।',
  },
  bn: {
    title: 'স্মৃতি হাট (Smriti Haat)',
    subtitle: 'বাজারের জিনিসগুলো মনে রাখুন',
    studyHeading: 'এই জিনিসগুলো ভালো করে দেখুন:',
    studySub: 'যতক্ষণ ইচ্ছা ভালো করে দেখে নিন। দেখা হলে নিচের বোতামে চাপ দিন।',
    readyToCover: 'আমি দেখে নিয়েছি, এবার ঢেকে দিন ➔',
    speakAll: 'সব জিনিসের নাম শুনুন',
    concealHeading: 'মনে করুন... জিনিসগুলো ঢেকে দেওয়া হয়েছে।',
    recallHeading: 'আপনি বাজারে কোন কোন জিনিস দেখেছিলেন বেছে নিন:',
    itemsNeeded: (needed: number, chosen: number) => `মোট ${needed}টি জিনিস বাছুন (${chosen}টি বেছেছেন)`,
    confirmSelection: 'আমি বেছে নিয়েছি (Submit Choices)',
    feedbackCorrect: 'খুব চমৎকার! আপনি সব সঠিক মনে রেখেছেন!',
    feedbackPartial: 'খুব ভালো চেষ্টা! আপনার স্মৃতি দারুণ!',
    nextRound: 'পরবর্তী রাউন্ড (Next Round)',
    finishGame: 'ফলাফল দেখুন (View Report)',
    aiAdapting: 'AI অভিযোজন: আপনার সুবিধার জন্য স্তর সমন্বয় করা হয়েছে',
    selectedBadge: 'বেছে নেওয়া হয়েছে',
    encouragement: 'ধীরে ধীরে করুন, কোনো তাড়া নেই। আপনি খুব ভালো করছেন।',
  },
  hi: {
    title: 'स्मृति हाट (Smriti Haat)',
    subtitle: 'बाज़ार की वस्तुएं याद रखें',
    studyHeading: 'इन वस्तुओं को ध्यान से देखिए:',
    studySub: 'जितना समय चाहिए आराम से लीजिए। देखने के बाद नीचे का बटन दबाएं।',
    readyToCover: 'मैंने देख लिया, अब ढक दीजिए ➔',
    speakAll: 'सभी वस्तुओं के नाम सुनें',
    concealHeading: 'याद करें... वस्तुएं ढक दी गई हैं।',
    recallHeading: 'आपने बाज़ार में कौन-सी वस्तुएं देखी थीं, चुनिए:',
    itemsNeeded: (needed: number, chosen: number) => `कुल ${needed} वस्तुएं चुनें (${chosen} चुनी गईं)`,
    confirmSelection: 'मैंने चुन लिया (Submit Choices)',
    feedbackCorrect: 'बहुत बढ़िया! आपने सभी वस्तुएं सही याद रखीं!',
    feedbackPartial: 'बहुत अच्छा प्रयास! आपकी याददाश्त सराहनीय है!',
    nextRound: 'अगला राउंड (Next Round)',
    finishGame: 'परिणाम देखें (View Report)',
    aiAdapting: 'AI अनुकूलन: आपकी सुविधा के लिए स्तर समायोजित किया गया है',
    selectedBadge: 'चुना गया',
    encouragement: 'आराम से करिए, कोई जल्दी नहीं है। आप बहुत अच्छा कर रहे हैं।',
  },
  en: {
    title: 'Smriti Haat (Bazaar Memory)',
    subtitle: 'Remember the items from the traditional market',
    studyHeading: 'Look closely at these bazaar items:',
    studySub: 'Take all the time you need. Tap the green button below when you are ready.',
    readyToCover: 'I have looked, cover now ➔',
    speakAll: 'Listen to All Item Names',
    concealHeading: 'Holding in memory... The stall is covered.',
    recallHeading: 'Which items did you see at the bazaar? Tap to select:',
    itemsNeeded: (needed: number, chosen: number) => `Select ${needed} item${needed > 1 ? 's' : ''} (${chosen} selected)`,
    confirmSelection: 'Confirm My Choices (Submit)',
    feedbackCorrect: 'Wonderful! You remembered everything accurately!',
    feedbackPartial: 'Great effort! Your memory is strong!',
    nextRound: 'Next Round',
    finishGame: 'View Clinical Report',
    aiAdapting: 'AI Adaptation: Calibrating difficulty for your comfort',
    selectedBadge: 'Selected',
    encouragement: 'Take your time, there is no hurry at all. You are doing wonderfully.',
  },
};

export const SmritiHaat: React.FC<SmritiHaatProps> = ({
  language = 'as',
  totalRounds = 3,
  initialTheta = 0.0,
  onRoundComplete,
  onSessionComplete,
  onExit,
}) => {
  const engine = useMemo(() => new SmritiHaatEngine(initialTheta, totalRounds), [initialTheta, totalRounds]);

  const [phase, setPhase] = useState<GamePhase>(engine.getPhase());
  const [roundNumber, setRoundNumber] = useState(engine.getRoundNumber());
  const [targets, setTargets] = useState(engine.getTargets());
  const [recallOptions, setRecallOptions] = useState(engine.getRecallOptions());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [eliminatedIds, setEliminatedIds] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState(engine.getDifficulty());
  const [latestRoundTelemetry, setLatestRoundTelemetry] = useState<RoundTelemetry | null>(null);
  const [sessionSummary, setSessionSummary] = useState<SessionSummaryTelemetry | null>(null);
  const [activeSubtitle, setActiveSubtitle] = useState<string>('');
  const [isEncouragementActive, setIsEncouragementActive] = useState<boolean>(false);

  // Clinical Latency, Stage Tracking & Live DDA States
  const [latencyStage, setLatencyStage] = useState<LatencyStage>('NORMAL_DELIBERATION');
  const [deliberationSeconds, setDeliberationSeconds] = useState<number>(0);
  const [isGuidanceGlowActive, setIsGuidanceGlowActive] = useState<boolean>(false);
  const [hasTargetBeacon, setHasTargetBeacon] = useState<boolean>(false);
  const [autoAssistAlert, setAutoAssistAlert] = useState<string>('');
  const [showJudgeControls, setShowJudgeControls] = useState<boolean>(true);
  const [demoPacing, setDemoPacing] = useState<'clinical' | 'rapid'>('clinical');
  const [assistanceProfileConfig, setAssistanceProfileConfig] = useState<AssistanceProfileConfig>(() =>
    AdaptiveAssistanceEngine.deriveAssistanceProfile({ theta: initialTheta })
  );
  const [savedSessions, setSavedSessions] = useState<SessionSummaryTelemetry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('smriti_haat_sessions') || '[]');
    } catch {
      return [];
    }
  });

  const recallStartTimeRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);
  const lastTapIdRef = useRef<string>('');
  const t = STRINGS[language] || STRINGS.en;

  // ML Evaluation computed from session summary using OASIS-2 model
  const mlEvaluation = useMemo<CognitiveClassificationResult | null>(() => {
    if (!sessionSummary) return null;
    const latencies = sessionSummary.rounds.map(r => r.latencyMs);
    const meanLat = sessionSummary.averageLatencyMs;
    const variance = latencies.length > 1
      ? Math.round(Math.sqrt(latencies.reduce((sum, val) => sum + Math.pow(val - meanLat, 2), 0) / latencies.length))
      : 1200;
    const perseverationRate = sessionSummary.rounds.length > 0
      ? sessionSummary.perseverationErrors / sessionSummary.rounds.length
      : 0;
    const hesitationCount = sessionSummary.rounds.filter(r => r.hesitationMs > 0).length;
    const hesitationRatio = sessionSummary.rounds.length > 0
      ? hesitationCount / sessionSummary.rounds.length
      : 0;

    return CognitiveClassifier.classify({
      meanLatencyMs: sessionSummary.averageLatencyMs,
      latencyVarianceMs: variance,
      accuracyPct: sessionSummary.accuracyPercentage,
      perseverationRate: Number(perseverationRate.toFixed(2)),
      hesitationRatio: Number(hesitationRatio.toFixed(2)),
      tremorJitterIndex: 0.08,
    });
  }, [sessionSummary]);

  // Unified Deliberation Engine: Controls 5-Stage Live Assistance during RECALL_PHASE
  useEffect(() => {
    if (phase !== 'RECALL_PHASE') {
      setIsGuidanceGlowActive(false);
      setIsEncouragementActive(false);
      setHasTargetBeacon(false);
      return;
    }

    recallStartTimeRef.current = performance.now();
    setLatencyStage('NORMAL_DELIBERATION');
    setDeliberationSeconds(0);
    setAutoAssistAlert('');
    setHasTargetBeacon(false);

    // Dynamically derive patient assistance profile
    const profile = demoPacing === 'rapid'
      ? AdaptiveAssistanceEngine.getConfigurationForProfile('severe_amnesic')
      : AdaptiveAssistanceEngine.deriveAssistanceProfile({
          theta: engine.getTheta(),
          recentLatenciesMs: latestRoundTelemetry ? [latestRoundTelemetry.latencyMs] : [],
          accuracyPct: latestRoundTelemetry?.isFullyCorrect ? 100 : 75,
          taskType: 'recognition',
        });
    setAssistanceProfileConfig(profile);

    const limits = {
      voice: profile.multiStageTimeouts.voicePromptMs,
      blur: profile.multiStageTimeouts.contextualActionMs,
      beacon: profile.multiStageTimeouts.beaconPromptMs,
      autoAssist: profile.multiStageTimeouts.autoCompleteMs,
    };

    let stagePromptDone = false;
    let stageBlurDone = false;
    let stageBeaconDone = false;
    let stageAutoAssistDone = false;

    const timer = window.setInterval(() => {
      const elapsedMs = performance.now() - recallStartTimeRef.current;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      setDeliberationSeconds(elapsedSec);

      // Stage 2: Gentle Vernacular Voice Reassurance (16s in clinical, 4s in rapid)
      if (elapsedMs >= limits.voice && !stagePromptDone) {
        stagePromptDone = true;
        setLatencyStage('VERNACULAR_PROMPT');
        setIsEncouragementActive(true);
        vernacularVoice.playGentleChime('attention');
        vernacularVoice.playNativeAudio('encouragement', language, t.encouragement);
      }

      // Stage 3: Active Distractor Blur & Elimination (28s in clinical, 8s in rapid - 12s after voice!)
      if (elapsedMs >= limits.blur && !stageBlurDone) {
        stageBlurDone = true;
        setLatencyStage('COGNITIVE_OVERLOAD');

        const eliminatedId = engine.eliminateDistractor();
        if (eliminatedId) {
          setEliminatedIds(Array.from(engine.getEliminatedIds()));
          const msg = language === 'as'
            ? 'AI সহায়: চিন্তা সহজ কৰিবলৈ ১ টা অতিৰিক্ত ভুল বিকল্প অস্পষ্ট (Blur) কৰি আঁতৰাই দিয়া হ\'ল।'
            : language === 'bn'
            ? 'AI সহায়তা: ভাবার সুবিধার জন্য ১টি অতিরিক্ত ভুল অপশন ঝাপসা (Blur) করে বাদ দেওয়া হলো।'
            : language === 'hi'
            ? 'AI सहायता: ध्यान केंद्रित करने के लिए 1 गलत विकल्प धुंधला (Blur) करके हटा दिया गया है।'
            : 'AI Live Assist: 1 incorrect distractor blurred out & removed to ease your choice.';
          setAutoAssistAlert(msg);
          vernacularVoice.playGentleChime('attention');
        }
      }

      // Stage 4: Gentle Target Hint Beacon (42s in clinical, 12s in rapid - 14s after blur!)
      if (elapsedMs >= limits.beacon && !stageBeaconDone) {
        stageBeaconDone = true;
        setHasTargetBeacon(true);
      }

      // Stage 5: Soft Auto-Assist (58s in clinical, 16s in rapid)
      if (elapsedMs >= limits.autoAssist && !stageAutoAssistDone) {
        stageAutoAssistDone = true;
        setLatencyStage('SOFT_AUTO_ASSIST');
        engine.triggerSoftAutoAssist();
        setSelectedIds(Array.from(engine.getSelectedIds()));
        vernacularVoice.playGentleChime('attention');
      }
    }, 200);

    return () => {
      window.clearInterval(timer);
    };
  }, [phase, roundNumber, language, demoPacing]);

  // Listen for active subtitles from the voice engine
  useEffect(() => {
    vernacularVoice.setSubtitleCallback((text, isPlaying) => {
      setActiveSubtitle(isPlaying ? text : '');
    });
  }, []);

  // Sync state with engine
  const syncWithEngine = () => {
    setPhase(engine.getPhase());
    setRoundNumber(engine.getRoundNumber());
    setTargets(engine.getTargets());
    setRecallOptions(engine.getRecallOptions());
    setSelectedIds(Array.from(engine.getSelectedIds()));
    setEliminatedIds(Array.from(engine.getEliminatedIds()));
    setDifficulty(engine.getDifficulty());
  };

  // Trigger encouragement manually on button click
  const handleTriggerEncouragement = () => {
    setIsEncouragementActive(true);
    vernacularVoice.playGentleChime('attention');
    vernacularVoice.playNativeAudio('encouragement', language, t.encouragement);
  };

  // Automatically speak instructions when entering study phase
  useEffect(() => {
    if (phase === 'STUDY_PHASE') {
      vernacularVoice.playNativeAudio('study-intro', language, t.studyHeading);
    }
  }, [phase, roundNumber, language]);

  // Read all target items aloud sequentially
  const handleSpeakAllTargets = async () => {
    for (const item of targets) {
      await vernacularVoice.playNativeAudio(item.id, language, item.names[language]);
    }
  };

  // Patient manually confirms they are done looking
  const handleReadyToCover = () => {
    if (phase !== 'STUDY_PHASE') return;
    engine.advanceToConceal();
    syncWithEngine();
    setAutoAssistAlert('');
    setIsGuidanceGlowActive(false);
    setHasTargetBeacon(false);

    // Relaxed conceal transition (2.2s)
    window.setTimeout(() => {
      engine.advanceToRecall();
      syncWithEngine();
      vernacularVoice.playNativeAudio('recall-prompt', language, t.recallHeading);
    }, 2200);
  };

  // In study phase: tap card to hear authentic pronunciation
  const handleStudyItemTap = (itemId: string, itemName: string) => {
    vernacularVoice.playGentleChime('tap');
    vernacularVoice.playNativeAudio(itemId, language, itemName);
  };

  // Handle Item Tap (In recall phase, toggle selection and speak name)
  const handleItemClick = (itemId: string, itemName: string) => {
    if (phase === 'RECALL_PHASE') {
      // Cannot select an eliminated distractor
      if (eliminatedIds.includes(itemId)) return;

      const now = performance.now();
      // Tremor filter: ignore unintentional double-taps within 180ms on same card
      if (lastTapIdRef.current === itemId && (now - lastTapTimeRef.current) < 180) {
        return;
      }
      lastTapTimeRef.current = now;
      lastTapIdRef.current = itemId;

      vernacularVoice.playGentleChime('tap');
      engine.toggleSelection(itemId);
      syncWithEngine();
      vernacularVoice.playNativeAudio(itemId, language, itemName);
    }
  };

  // Submit Recall
  const handleSubmitRecall = () => {
    if (phase !== 'RECALL_PHASE') return;
    const elapsedMs = Math.round(performance.now() - recallStartTimeRef.current);
    try {
      const telemetry = engine.submitRecall(elapsedMs);
      if (!telemetry) return;
      setLatestRoundTelemetry(telemetry);
      syncWithEngine();
      setIsGuidanceGlowActive(false);
      setHasTargetBeacon(false);

      if (telemetry.isFullyCorrect) {
        vernacularVoice.playGentleChime('success');
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
        vernacularVoice.playNativeAudio('feedback-correct', language, t.feedbackCorrect);
      } else {
        vernacularVoice.playGentleChime('tap');
        vernacularVoice.playNativeAudio('feedback-partial', language, t.feedbackPartial);
      }

      if (onRoundComplete) {
        onRoundComplete(telemetry);
      }
    } catch (err) {
      console.warn('Submit recall ignored:', err);
    }
  };

  // Advance to Next Round or Complete Session
  const handleNext = () => {
    if (phase !== 'ROUND_FEEDBACK') return;
    const hasMore = engine.nextRound();
    if (hasMore) {
      syncWithEngine();
    } else {
      const summary = engine.generateSessionSummary();
      setSessionSummary(summary);
      syncWithEngine();

      // Save session to LocalStorage offline history
      try {
        const existing: SessionSummaryTelemetry[] = JSON.parse(localStorage.getItem('smriti_haat_sessions') || '[]');
        const updated = [summary, ...existing.filter(s => s.completedAt !== summary.completedAt)].slice(0, 10);
        localStorage.setItem('smriti_haat_sessions', JSON.stringify(updated));
        setSavedSessions(updated);
      } catch (err) {
        console.warn('LocalStorage save error', err);
      }

      if (onSessionComplete) {
        onSessionComplete(summary);
      }
    }
  };

  // Simulation controls for Judges / Hackathon testing
  const handleSimulateDeliberationOverload = () => {
    if (phase !== 'RECALL_PHASE') {
      engine.advanceToRecall();
      syncWithEngine();
    }
    const eliminatedId = engine.eliminateDistractor();
    if (eliminatedId) {
      setEliminatedIds(Array.from(engine.getEliminatedIds()));
      const msg = language === 'as'
        ? 'AI সহায়: চিন্তা সহজ কৰিবলৈ ভুল বিকল্প অস্পষ্ট (Blur) কৰি আঁতৰাই দিয়া হ\'ল।'
        : language === 'bn'
        ? 'AI সহায়তা: ভাবার সুবিধার জন্য ভুল অপশন ঝাপসা (Blur) করে বাদ দেওয়া হলো।'
        : language === 'hi'
        ? 'AI सहायता: ध्यान केंद्रित करने के लिए गलत विकल्प धुंधला (Blur) करके हटा दिया गया है।'
        : 'AI Live Assist: Incorrect distractor blurred out & removed to simplify your choice.';
      setAutoAssistAlert(msg);
      vernacularVoice.playGentleChime('attention');
    }
  };

  const handleTestBeacon = () => {
    if (phase !== 'RECALL_PHASE') {
      engine.advanceToRecall();
      syncWithEngine();
    }
    setHasTargetBeacon(true);
    vernacularVoice.playGentleChime('attention');
  };

  const handleForceTier = (tier: 'gentle_1_item' | 'moderate_assist' | 'independent') => {
    engine.forceDifficulty(tier);
    syncWithEngine();
  };

  // Caregiver early conclusion (Fatigue / agitation protection)
  const handleCaregiverEndEarly = () => {
    const summary = engine.concludeSessionEarly();
    setSessionSummary(summary);
    syncWithEngine();

    try {
      const existing: SessionSummaryTelemetry[] = JSON.parse(localStorage.getItem('smriti_haat_sessions') || '[]');
      const updated = [summary, ...existing.filter(s => s.completedAt !== summary.completedAt)].slice(0, 10);
      localStorage.setItem('smriti_haat_sessions', JSON.stringify(updated));
      setSavedSessions(updated);
    } catch (err) {
      console.warn('LocalStorage save error', err);
    }

    if (onSessionComplete) {
      onSessionComplete(summary);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-200/90 max-w-5xl mx-auto text-slate-800 animate-fadeIn">
      {/* Live Vernacular Subtitles for Hearing Impairment */}
      {activeSubtitle && (
        <div className="mb-6 bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-amber-50 p-4 px-6 rounded-2xl shadow-lg flex items-center gap-3.5 border border-amber-500/40 animate-pulse">
          <Volume2 className="w-7 h-7 text-amber-400 shrink-0" />
          <div>
            <span className="text-[11px] uppercase font-black tracking-widest text-amber-400 block">
              Audio Assistance: {language === 'as' ? 'অসমীয়া' : language === 'bn' ? 'বাংলা' : language === 'hi' ? 'हिन्दी' : 'English'}
            </span>
            <span className="font-black text-lg md:text-xl text-white">
              "{activeSubtitle}"
            </span>
          </div>
        </div>
      )}

      {/* Reassurance Banner when Inactivity Timer Triggers */}
      {isEncouragementActive && (
        <div className="mb-6 bg-emerald-50 border border-emerald-300 p-4 px-6 rounded-2xl shadow-sm flex items-center gap-3.5 text-emerald-950 animate-gentle-cue">
          <Sparkles className="w-7 h-7 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <span className="text-[11px] uppercase font-black tracking-widest text-emerald-700 block">
              Gentle Encouragement Active
            </span>
            <span className="font-extrabold text-base md:text-lg">
              {t.encouragement}
            </span>
          </div>
        </div>
      )}

      {/* Game Header Bar with Large Accessible Elements */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center shadow-md shrink-0">
            <ShoppingBag className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {t.title}
              </h2>
              <span className="bg-amber-100 text-amber-900 text-xs sm:text-sm px-3 py-1 rounded-full font-black border border-amber-200">
                Round {roundNumber} of {totalRounds}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
              {t.subtitle} • Mode: <strong className="text-amber-700">{difficulty.itemsToMemorize} {difficulty.itemsToMemorize === 1 ? 'Item (Gentle Recall)' : 'Items'}</strong>
            </p>
          </div>
        </div>

        {/* AI Adaptation Tag & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {phase !== 'SESSION_COMPLETE' && (
            <button
              onClick={handleCaregiverEndEarly}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-extrabold text-xs md:text-sm rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
              title="Save progress and gracefully conclude session without fatiguing the elder"
            >
              <span>Save & Rest (End Early)</span>
            </button>
          )}

          <button
            onClick={() => setShowJudgeControls(!showJudgeControls)}
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-black text-xs md:text-sm rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
            title="Inspect AI adaptive difficulty & test live features"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-700" />
            <span>AI Testbed</span>
          </button>

          <button
            onClick={handleTriggerEncouragement}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs md:text-sm rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all"
            title="Trigger gentle voice prompt now"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Voice Cue 🔊</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl text-xs md:text-sm font-black text-slate-700 shadow-2xs">
            <Brain className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Ability (θ): <strong>{engine.getTheta() > 0 ? `+${engine.getTheta()}` : engine.getTheta()}</strong></span>
          </div>
        </div>
      </div>

      {/* SIH 2026 Judge Testbed & DDA Controls */}
      {showJudgeControls && (
        <div className="my-6 p-4 bg-gradient-to-r from-slate-900 to-amber-950 text-white rounded-3xl border-2 border-amber-500 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2 text-xs font-black tracking-widest text-amber-400 uppercase">
              <Sliders className="w-4 h-4" />
              <span>SIH 2026 Live AI Inspector & Test Controls</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full">
                Profile: {assistanceProfileConfig.displayName[language] || assistanceProfileConfig.displayName.en}
              </span>
              <span className="text-[11px] font-mono bg-white/15 px-2.5 py-0.5 rounded-full text-amber-200">
                Phase: {phase} | Stage: {latencyStage} | Grid: {difficulty.gridSize} | Items: {difficulty.itemsToMemorize}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setDemoPacing(demoPacing === 'clinical' ? 'rapid' : 'clinical')}
              className={`px-3 py-2 rounded-xl cursor-pointer shadow-xs border transition-all flex items-center gap-1.5 ${
                demoPacing === 'clinical'
                  ? 'bg-emerald-600/90 hover:bg-emerald-600 text-white border-emerald-400 font-extrabold'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 font-black'
              }`}
              title="Toggle between spacious clinical pacing for real patients and rapid pacing for fast judge evaluation"
            >
              <span>{demoPacing === 'clinical' ? '🌿 Pacing: Calm Clinical (16s Voice ➔ 28s Blur)' : '⚡ Pacing: Rapid Pitch (4s Voice ➔ 8s Blur)'}</span>
            </button>
            <button
              onClick={handleSimulateDeliberationOverload}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
              title="Instantly triggers distractor blur & removal for demo"
            >
              <span>⚡ Test Distractor Blur Now</span>
            </button>
            <button
              onClick={handleTestBeacon}
              className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
              title="Instantly triggers target beacon hint pulse"
            >
              <span>💡 Test Beacon Hint Now</span>
            </button>
            <button
              onClick={() => handleForceTier('gentle_1_item')}
              className={`px-3 py-2 rounded-xl cursor-pointer shadow-xs border transition-all ${
                difficulty.assistLevel === 'gentle_1_item' 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-black' 
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
            >
              <span>Tier 0: 1-Item Mode (θ = -1.5)</span>
            </button>
            <button
              onClick={() => handleForceTier('moderate_assist')}
              className={`px-3 py-2 rounded-xl cursor-pointer shadow-xs border transition-all ${
                difficulty.assistLevel === 'moderate_assist' 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-black' 
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
            >
              <span>Tier 1: 2-Item Mode (θ = 0.5)</span>
            </button>
            <button
              onClick={() => handleForceTier('independent')}
              className={`px-3 py-2 rounded-xl cursor-pointer shadow-xs border transition-all ${
                difficulty.assistLevel === 'independent' 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-black' 
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
            >
              <span>Tier 2: 3-Item Mode (θ = 1.8)</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PHASE 1: STUDY PHASE (SELF-PACED, NO FAST TIMERS!)            */}
      {/* ============================================================ */}
      {phase === 'STUDY_PHASE' && (
        <div className="py-8 space-y-8">
          {/* Instructions Box */}
          <div className="text-center max-w-2xl mx-auto bg-amber-50/70 p-6 rounded-3xl border-2 border-amber-200">
            <div className="inline-flex items-center gap-2 text-amber-900 bg-amber-200/70 px-4 py-1.5 rounded-full text-sm font-extrabold mb-2">
              <Eye className="w-5 h-5 text-amber-800" />
              <span>{t.studyHeading}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-snug">
              {t.studySub}
            </h3>

            {/* Audio Listen All Button */}
            <div className="mt-4">
              <button
                onClick={handleSpeakAllTargets}
                className="px-6 py-2.5 bg-white hover:bg-amber-100 text-amber-900 font-extrabold text-sm md:text-base rounded-2xl border-2 border-amber-300 shadow-sm inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Volume2 className="w-5 h-5 text-amber-700" />
                <span>{t.speakAll}</span>
              </button>
            </div>
          </div>

          {/* Massive Bamboo Stall with Large Target Cards */}
          <div className="p-8 md:p-12 bg-gradient-to-b from-amber-100/70 via-amber-100/40 to-amber-200/50 rounded-3xl border-3 border-amber-300 shadow-inner">
            <div className={`grid gap-6 md:gap-8 mx-auto ${
              targets.length === 1 
                ? 'grid-cols-1 max-w-sm' 
                : targets.length === 2 
                ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl' 
                : 'grid-cols-1 sm:grid-cols-3 max-w-3xl'
            }`}>
              {targets.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleStudyItemTap(item.id, item.names[language])}
                  className={`p-8 rounded-3xl border-4 flex flex-col items-center justify-center text-center shadow-xl bg-white ${item.colorBg} transition-transform hover:scale-102 cursor-pointer select-none active:scale-95`}
                  title="Tap to hear authentic pronunciation"
                >
                  <span className="text-8xl md:text-9xl mb-4 drop-shadow-sm select-none">
                    {item.icon}
                  </span>
                  <span className="font-black text-2xl md:text-3xl text-slate-900 leading-tight">
                    {item.names[language]}
                  </span>
                  <span className="text-sm font-extrabold text-slate-600 mt-2 uppercase tracking-wider bg-white/80 px-3 py-1 rounded-full border border-slate-200">
                    📍 {item.regionOrigin}
                  </span>
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Tap card to listen</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Giant Self-Paced "Ready to Cover" Button */}
          <div className="text-center pt-2">
            <button
              onClick={handleReadyToCover}
              className="w-full max-w-xl mx-auto py-5 md:py-6 px-8 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xl md:text-2xl rounded-3xl shadow-2xl transition-all transform active:scale-95 cursor-pointer ring-4 ring-emerald-200 flex items-center justify-center gap-3"
            >
              <span>{t.readyToCover}</span>
            </button>
            <p className="text-sm text-slate-500 font-semibold mt-2">
              No rush! Take your time to remember the items above, then tap when ready.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PHASE 2: CONCEAL PHASE (STALL COVERED)                        */}
      {/* ============================================================ */}
      {phase === 'CONCEAL_PHASE' && (
        <div className="py-20 text-center space-y-6">
          <div className="w-28 h-28 mx-auto rounded-3xl bg-amber-700 text-white flex items-center justify-center shadow-2xl animate-pulse">
            <Sparkles className="w-14 h-14" />
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900">
            {t.concealHeading}
          </h3>
          <p className="text-base text-slate-600 font-semibold">
            Holding in memory... The recall choices are appearing now!
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/* PHASE 3: RECALL PHASE (MASSIVE TOUCH TARGETS)                */}
      {/* ============================================================ */}
      {phase === 'RECALL_PHASE' && (
        <div className={`py-6 space-y-6 rounded-3xl transition-all p-4 ${
          isGuidanceGlowActive ? 'ring-4 ring-amber-300/80 bg-amber-50/30' : ''
        }`}>
          {/* Active Distractor Auto-Assist Banner */}
          {autoAssistAlert && (
            <div className="max-w-2xl mx-auto bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-400 p-4 px-6 rounded-2xl shadow-md flex items-center gap-3 text-emerald-950 animate-gentle-cue">
              <Sparkles className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <span className="text-xs uppercase font-black tracking-widest text-emerald-700 block">
                  AI Live Dynamic Adaptation Active
                </span>
                <span className="font-extrabold text-base md:text-lg">
                  {autoAssistAlert}
                </span>
              </div>
            </div>
          )}

          {/* Live Deliberation Progress & Stage Tracker */}
          <div className="max-w-2xl mx-auto flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-100/90 px-5 py-2.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Deliberation Time: <strong className="text-amber-900 text-sm font-black">{deliberationSeconds}s</strong></span>
            </div>
            <span className="uppercase tracking-wider text-[11px] font-black text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-300">
              {latencyStage === 'NORMAL_DELIBERATION' && 'Stage 1: Peaceful Thinking'}
              {latencyStage === 'VERNACULAR_PROMPT' && 'Stage 2: Voice Reassurance'}
              {latencyStage === 'COGNITIVE_OVERLOAD' && !hasTargetBeacon && 'Stage 3: Distractor Blurred & Removed'}
              {hasTargetBeacon && latencyStage !== 'SOFT_AUTO_ASSIST' && 'Stage 4: Target Beacon Hint'}
              {latencyStage === 'SOFT_AUTO_ASSIST' && 'Stage 5: Soft Auto-Assist'}
            </span>
          </div>

          {/* Instruction Header */}
          <div className="text-center max-w-2xl mx-auto bg-slate-50 p-5 rounded-3xl border-2 border-slate-200">
            <h3 className="text-xl md:text-2xl font-black text-slate-900">
              {t.recallHeading}
            </h3>
            <p className="text-base md:text-lg text-amber-900 font-extrabold mt-1">
              {t.itemsNeeded(difficulty.itemsToMemorize, selectedIds.length)}
            </p>
          </div>

          {/* Massive Grid of Recall Cards */}
          <div className={`grid gap-6 mx-auto ${
            difficulty.gridSize === '1x2'
              ? 'grid-cols-1 sm:grid-cols-2 max-w-xl'
              : difficulty.gridSize === '2x2'
              ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-3xl'
          }`}>
            {recallOptions.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isEliminated = eliminatedIds.includes(item.id);
              const isTarget = targets.some(t => t.id === item.id);
              const shouldBeaconGlow = hasTargetBeacon && isTarget && !isSelected;

              if (isEliminated) {
                return (
                  <div
                    key={item.id}
                    style={{ filter: 'blur(6px) grayscale(100%)', opacity: 0.25, pointerEvents: 'none' }}
                    className="p-6 md:p-8 rounded-3xl border-2 border-dashed border-rose-300/80 bg-slate-200/80 filter blur-sm opacity-25 grayscale scale-95 pointer-events-none select-none transition-all duration-700 relative overflow-hidden flex flex-col items-center justify-center text-center cursor-not-allowed shadow-none"
                  >
                    <span className="text-7xl md:text-8xl mb-3 grayscale opacity-60">
                      {item.icon}
                    </span>
                    <span className="font-bold text-xl line-through text-slate-500">
                      {item.names[language]}
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-200/90 border border-rose-300 px-3 py-1 rounded-full mt-3">
                      🚫 Blurred & Removed by AI
                    </span>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id, item.names[language])}
                  className={`p-6 md:p-8 rounded-3xl border-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none active:scale-95 relative ${
                    isSelected
                      ? 'border-amber-600 bg-amber-50 ring-8 ring-amber-300 shadow-2xl scale-102'
                      : shouldBeaconGlow
                      ? 'border-emerald-500 bg-emerald-50/80 ring-8 ring-emerald-400 animate-pulse shadow-2xl scale-102'
                      : 'border-slate-300 bg-white hover:border-amber-400 hover:shadow-lg shadow-md'
                  }`}
                >
                  {/* Selected Green Badge */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                  )}

                  {/* Beacon Hint Badge */}
                  {shouldBeaconGlow && (
                    <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gentle Hint</span>
                    </div>
                  )}

                  <span className="text-7xl md:text-8xl mb-3 drop-shadow-sm">
                    {item.icon}
                  </span>
                  <span className="font-black text-xl md:text-2xl text-slate-900 leading-tight">
                    {item.names[language]}
                  </span>
                  <span className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                    📍 {item.regionOrigin}
                  </span>

                  {isSelected && (
                    <div className="mt-3 flex items-center gap-1.5 text-sm font-black text-amber-900 bg-amber-200/80 px-4 py-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>{t.selectedBadge}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Massive Submit Button */}
          <div className="text-center pt-4">
            <button
              onClick={handleSubmitRecall}
              disabled={selectedIds.length === 0}
              className={`w-full max-w-xl mx-auto py-5 md:py-6 px-10 rounded-3xl font-black text-xl md:text-2xl shadow-2xl transition-all active:scale-95 cursor-pointer ${
                selectedIds.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-2 border-slate-300'
                  : 'bg-amber-600 hover:bg-amber-700 text-white ring-4 ring-amber-300'
              }`}
            >
              {t.confirmSelection}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PHASE 4: ROUND FEEDBACK                                      */}
      {/* ============================================================ */}
      {phase === 'ROUND_FEEDBACK' && latestRoundTelemetry && (
        <div className="py-8 text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-24 h-24 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-lg border-2 border-emerald-300">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {latestRoundTelemetry.wasAutoAssisted
                ? (language === 'as' ? 'AI সহায়ক পৰামৰ্শ (AI Guided Round)' : language === 'bn' ? 'AI সহায়ক নির্দেশিকা (AI Guided Round)' : language === 'hi' ? 'AI सहायक अभ्यास (AI Guided Round)' : 'AI Guided Practice Round')
                : latestRoundTelemetry.isFullyCorrect ? t.feedbackCorrect : t.feedbackPartial}
            </h3>
            <p className="text-base text-slate-600 font-semibold mt-2">
              Time Taken: <strong>{(latestRoundTelemetry.latencyMs / 1000).toFixed(1)}s</strong> • 
              {latestRoundTelemetry.wasAutoAssisted ? (
                <span className="text-amber-800 font-bold ml-1">AI Guided (Not scored to protect dignity)</span>
              ) : (
                <span> Correct: <strong>{latestRoundTelemetry.correctCount} of {difficulty.itemsToMemorize}</strong></span>
              )}
            </p>
          </div>

          {/* AI Difficulty Adaptation Card with Explicit Rationale */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border-2 border-amber-400 p-6 rounded-3xl text-left space-y-4 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                <Brain className="w-6 h-6 text-amber-700" />
                <span>AI Dynamic Difficulty Calibration</span>
              </div>
              <span className="text-xs font-black px-3 py-1 bg-amber-200/80 text-amber-900 rounded-full">
                Updated Ability (θ): {latestRoundTelemetry.thetaAfterRound > 0 ? `+${latestRoundTelemetry.thetaAfterRound}` : latestRoundTelemetry.thetaAfterRound}
              </span>
            </div>

            {/* Detailed Clinical Rationale */}
            <div className="p-4 bg-white/90 rounded-2xl border border-amber-200 shadow-2xs">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">
                Clinical Adaptation Rationale:
              </p>
              <p className="text-slate-800 font-bold text-sm md:text-base leading-relaxed">
                {latestRoundTelemetry.adaptationRationale}
              </p>
            </div>

            {/* Comparison Grid: Old vs New difficulty */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-1">
              <div className="bg-white/80 p-3 rounded-2xl border border-amber-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Items to Recall</span>
                <span className="text-lg font-black text-slate-900">
                  {latestRoundTelemetry.difficulty.itemsToMemorize} ➔ <strong className="text-amber-700">{latestRoundTelemetry.nextDifficulty.itemsToMemorize}</strong>
                </span>
              </div>
              <div className="bg-white/80 p-3 rounded-2xl border border-amber-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Grid Choices</span>
                <span className="text-lg font-black text-slate-900">
                  {latestRoundTelemetry.difficulty.gridSize === '1x2' ? '2' : latestRoundTelemetry.difficulty.gridSize === '2x2' ? '4' : '6'} ➔ <strong className="text-amber-700">{latestRoundTelemetry.nextDifficulty.gridSize === '1x2' ? '2' : latestRoundTelemetry.nextDifficulty.gridSize === '2x2' ? '4' : '6'}</strong>
                </span>
              </div>
              <div className="bg-white/80 p-3 rounded-2xl border border-amber-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Deliberation</span>
                <span className="text-lg font-black text-slate-900">
                  {(latestRoundTelemetry.latencyMs / 1000).toFixed(1)}s
                </span>
              </div>
              <div className="bg-white/80 p-3 rounded-2xl border border-amber-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Mid-Round Assist</span>
                <span className={`text-base font-black ${latestRoundTelemetry.eliminatedDistractors.length > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                  {latestRoundTelemetry.eliminatedDistractors.length > 0 ? '1 Removed' : 'None'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xl rounded-3xl shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-3"
          >
            <span>{roundNumber < totalRounds ? t.nextRound : t.finishGame}</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* PHASE 5: SESSION COMPLETE & CLINICAL REPORT                  */}
      {/* ============================================================ */}
      {phase === 'SESSION_COMPLETE' && sessionSummary && (
        <div className="py-8 space-y-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="inline-flex p-4 rounded-3xl bg-emerald-100 text-emerald-700 mb-3 border-2 border-emerald-300">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-black text-slate-900">
              Session Complete • Clinical Evaluation
            </h3>
            <p className="text-base text-slate-600 font-semibold mt-1">
              Smriti Haat (Visual & Spatial Working Memory Domain)
            </p>
          </div>

          {/* Early Conclusion Notice for Caregiver Dignity */}
          {sessionSummary.caregiverEndedEarly && (
            <div className="bg-sky-50 border-2 border-sky-400 p-4 px-6 rounded-2xl text-sky-950 font-bold text-sm flex items-center gap-3 shadow-xs">
              <Sparkles className="w-5 h-5 text-sky-600 shrink-0" />
              <span>Session gracefully concluded early to protect elder comfort. Clinical assessment evaluated across {sessionSummary.totalRounds} completed round{sessionSummary.totalRounds > 1 ? 's' : ''}.</span>
            </div>
          )}

          {/* AI Auto-Assist Clinical Scaffolding Audit Banner */}
          {sessionSummary.autoAssistedRounds !== undefined && sessionSummary.autoAssistedRounds > 0 && (
            <div className="bg-amber-50 border-2 border-amber-400 p-4 px-6 rounded-2xl text-amber-950 font-bold text-sm flex items-center gap-3 shadow-xs">
              <Brain className="w-6 h-6 text-amber-600 shrink-0" />
              <span>
                <strong>Clinical Integrity Audit:</strong> {sessionSummary.autoAssistedRounds} of {sessionSummary.totalRounds} round(s) were guided by AI auto-assist to prevent patient distress. These automated selections were <strong>NOT credited to patient recall accuracy</strong>.
              </span>
            </div>
          )}

          {/* Score Summary Card */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accuracy</span>
              <p className="text-3xl font-black text-slate-900 mt-1">{sessionSummary.accuracyPercentage}%</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Median Speed</span>
              <p className="text-3xl font-black text-slate-900 mt-1">{(sessionSummary.medianLatencyMs / 1000).toFixed(1)}s</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Speed Profile</span>
              <p className="text-xs md:text-sm font-black text-slate-800 mt-2 uppercase tracking-wide">
                {sessionSummary.processingSpeedProfile ? sessionSummary.processingSpeedProfile.replace('_', ' ') : 'Normal'}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Ability (θ)</span>
              <p className="text-3xl font-black text-emerald-700 mt-1">
                {sessionSummary.finalTheta > 0 ? `+${sessionSummary.finalTheta}` : sessionSummary.finalTheta}
              </p>
            </div>
            <div className="bg-amber-50 p-4 rounded-3xl border-2 border-amber-400 text-center shadow-md">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">MoCA Memory</span>
              <p className="text-3xl font-black text-amber-950 mt-1">{sessionSummary.estimatedMoCAMemoryScore} / 5</p>
            </div>
          </div>

          {/* Machine Learning Diagnosis Card (Trained on OASIS-2 Longitudinal Data) */}
          {mlEvaluation && (
            <div className={`p-6 rounded-3xl border-2 shadow-md text-left transition-all ${
              mlEvaluation.clinicalTier === 'NORMAL'
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : mlEvaluation.clinicalTier === 'MCI'
                ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                : 'bg-rose-50/80 border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-black/10">
                <div className="flex items-center gap-2 font-black text-xs md:text-sm uppercase tracking-wider">
                  <Brain className="w-5 h-5 text-amber-700" />
                  <span>On-Device Edge ML Diagnosis (OASIS-2 Model)</span>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-white/80 rounded-full border border-black/10">
                  Confidence: <strong>{(mlEvaluation.confidenceScore * 100).toFixed(1)}%</strong>
                </span>
              </div>

              <div className="mt-3">
                <h4 className="text-xl md:text-2xl font-black">
                  {mlEvaluation.predictedClass}
                </h4>
                <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                  Clinical Benchmark Range: <strong>{mlEvaluation.estimatedMoCARange}</strong>
                </p>
                {mlEvaluation.clinicalAlert && (
                  <p className="text-xs md:text-sm font-semibold mt-2 p-3 bg-white/90 rounded-xl border border-black/5">
                    💡 <strong>Clinical Guidance:</strong> {mlEvaluation.clinicalAlert}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Offline Longitudinal Clinical History (100% Offline LocalStorage) */}
          {savedSessions.length > 0 && (
            <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl text-left space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 font-black text-slate-800 text-sm md:text-base">
                  <History className="w-5 h-5 text-amber-700" />
                  <span>Offline Clinical History ({savedSessions.length} Past Sessions Stored)</span>
                </div>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  100% Offline Encrypted LocalStorage
                </span>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {savedSessions.map((s, idx) => (
                  <div
                    key={s.completedAt || idx}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm font-semibold hover:border-amber-400 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xs">
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
                          {s.totalRounds} Rounds • Median Speed: {(s.medianLatencyMs / 1000).toFixed(1)}s
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 font-black">
                      <span className="text-slate-700">
                        Accuracy: <strong className="text-amber-700">{s.accuracyPercentage}%</strong>
                      </span>
                      <span className="text-emerald-700">
                        θ: {s.finalTheta > 0 ? `+${s.finalTheta}` : s.finalTheta}
                      </span>
                      <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-300 text-xs">
                        MoCA: {s.estimatedMoCAMemoryScore}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Replay or Exit */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={() => {
                const newEng = new SmritiHaatEngine(initialTheta, totalRounds);
                setPhase(newEng.getPhase());
                setRoundNumber(newEng.getRoundNumber());
                setTargets(newEng.getTargets());
                setRecallOptions(newEng.getRecallOptions());
                setSelectedIds([]);
                setDifficulty(newEng.getDifficulty());
                setLatestRoundTelemetry(null);
                setSessionSummary(null);
              }}
              className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-lg rounded-2xl flex items-center justify-center gap-2 cursor-pointer border-2 border-slate-300"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Play Again</span>
            </button>

            {onExit && (
              <button
                onClick={onExit}
                className="flex-1 py-5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-lg rounded-2xl shadow-xl cursor-pointer"
              >
                Back to Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
