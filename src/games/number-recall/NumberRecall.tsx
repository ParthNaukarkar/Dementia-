import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Hash,
  Brain,
  Timer,
  Sliders,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Delete,
  CornerDownLeft,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { NumberRecallEngine, NUMBER_RECALL_TIERS } from './engine';
import { numberRecallAudio } from './audio';
import type {
  NumberRecallProps,
  NumberRecallDifficulty,
  NumberRecallSettingsSnapshot,
  NumberRecallTrialTelemetry,
  NumberRecallSessionSummary,
  NumberRecallAIDynamicAction,
  KeypressEvent,
} from './types';

export const NumberRecall: React.FC<NumberRecallProps> = ({
  language = 'as',
  totalTrials = 4,
  initialTheta = 0.0,
  onTrialComplete,
  onSessionComplete,
  onExit,
}) => {
  // Initialize Engine
  const engine = useMemo(() => new NumberRecallEngine(initialTheta), [initialTheta]);

  // Current State
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [difficulty, setDifficulty] = useState<NumberRecallDifficulty>(() => engine.getDifficulty());
  const [phase, setPhase] = useState<'COUNTDOWN' | 'PRESENTATION' | 'RECALL' | 'FEEDBACK' | 'COMPLETE'>('COUNTDOWN');
  const [countdownNum, setCountdownNum] = useState(3);
  
  // Digit Presentation Sequence
  const [targetSequence, setTargetSequence] = useState<string>('');
  const [activeDigitIndex, setActiveDigitIndex] = useState<number>(-1);
  const [isDigitShowing, setIsDigitShowing] = useState<boolean>(false);
  
  // User Recall State
  const [userEnteredSequence, setUserEnteredSequence] = useState<string>('');
  const [lastTrialFeedback, setLastTrialFeedback] = useState<{
    isCorrect: boolean;
    expected: string;
    entered: string;
    errorType: string;
    primacyAccuracy: boolean;
    recencyAccuracy: boolean;
  } | null>(null);

  // Settings & Autonomy Toggles
  const [isGhostWatermarkVisible, setIsGhostWatermarkVisible] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [replaysUsedThisTrial, setReplaysUsedThisTrial] = useState<number>(0);
  const [backspaceCountThisTrial, setBackspaceCountThisTrial] = useState<number>(0);
  const [watermarkDigitsViewedCount, setWatermarkDigitsViewedCount] = useState<number>(0);
  const [proactiveHelpRequested, setProactiveHelpRequested] = useState<boolean>(false);
  const [manualTierOverride, setManualTierOverride] = useState<number | null>(null);

  // Live AI Adaptations & Telemetry Timers
  const [aiLiveReasoning, setAiLiveReasoning] = useState<string>('');
  const [aiSettingsImpact, setAiSettingsImpact] = useState<string>('');
  const [aiAdaptationFlash, setAiAdaptationFlash] = useState<boolean>(false);
  const [aiDynamicActions, setAiDynamicActions] = useState<NumberRecallAIDynamicAction[]>([]);
  const [showTestbed, setShowTestbed] = useState<boolean>(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Micro-timing refs
  const trialStartTimeRef = useRef<number>(Date.now());
  const recallStartTimeRef = useRef<number>(Date.now());
  const lastKeypressTimeRef = useRef<number>(Date.now());
  const lastActionTimeRef = useRef<number>(Date.now());
  const keystrokesRef = useRef<KeypressEvent[]>([]);
  const consecutiveFastSolvesRef = useRef<number>(0);
  const autoAssistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Session Accumulator
  const [sessionTrials, setSessionTrials] = useState<NumberRecallTrialTelemetry[]>([]);
  const [finalSessionSummary, setFinalSessionSummary] = useState<NumberRecallSessionSummary | null>(null);

  // Localized UI Dictionary
  const t = {
    title: {
      as: 'সংখ্যা সোঁৱৰণ (Number Recall)',
      bn: 'সংখ্যা স্মরণ (Number Recall)',
      hi: 'संख्या स्मरण (Number Recall)',
      en: 'Number Recall (Digit Span)',
    },
    subtitle: {
      as: 'WAIS-IV ডিজিট স্পান আৰু কৰ্কিন্মন কাৰ্যকৰী স্মৃতি অনুশীলন',
      bn: 'WAIS-IV ডিজিট স্প্যান ও কার্যকরী স্মৃতি অনুশীলন',
      hi: 'WAIS-IV डिजिट स्पैन और कार्यकारी स्मृति अभ्यास',
      en: 'WAIS-IV Digit Span & Phonological Working Memory',
    },
    readyText: {
      as: 'প্ৰস্তুত হওক... সংখ্যাবোৰ লক্ষ্য কৰক!',
      bn: 'প্রস্তুত হন... সংখ্যাগুলি লক্ষ্য করুন!',
      hi: 'तैयार हो जाएं... अंकों को ध्यान से देखें!',
      en: 'Get Ready... Watch the numbers!',
    },
    enterForward: {
      as: 'একে ক্ৰমত সংখ্যাবোৰ টাইপ কৰক (Forward Order):',
      bn: 'একই ক্রমে সংখ্যাগুলি লিখুন (Forward Order):',
      hi: 'उसी क्रम में अंक दर्ज करें (Forward Order):',
      en: 'Enter numbers in the exact order shown (Forward Order):',
    },
    enterBackward: {
      as: 'সাৱধান! ওলোটা ক্ৰমত টাইপ কৰক (Reverse / Backward Order):',
      bn: 'সাবধান! উল্টো ক্রমে লিখুন (Reverse / Backward Order):',
      hi: 'सावधान! उल्टे क्रम में अंक दर्ज करें (Reverse / Backward Order):',
      en: 'ATTENTION! Enter numbers in REVERSE order (Backward Order):',
    },
    replayBtn: {
      as: 'পুনৰ শুনক',
      bn: 'পুনরায় শুনুন',
      hi: 'पुनः सुनें',
      en: 'Replay Audio',
    },
    clearBtn: {
      as: 'মচক',
      bn: 'মুছুন',
      hi: 'साफ करें',
      en: 'Clear',
    },
    submitBtn: {
      as: 'দাখিল কৰক ➔',
      bn: 'জমা দিন ➔',
      hi: 'जमा करें ➔',
      en: 'Submit ➔',
    },
    nextTrial: {
      as: 'পৰৱৰ্তী স্তৰ ➔',
      bn: 'পরবর্তী স্তর ➔',
      hi: 'अगला स्तर ➔',
      en: 'Next Sequence ➔',
    },
    autoAssistBtn: {
      as: 'সহায় লওক (Help Me)',
      bn: 'সহায়তা নিন (Help Me)',
      hi: 'मदद लें (Help Me)',
      en: 'Gentle Hint',
    },
    exit: {
      as: 'বাহিৰ হওক',
      bn: 'প্রস্থান',
      hi: 'बाहर जाएं',
      en: 'Exit',
    },
    ghostWatermark: {
      as: 'সহায়িকা সংকেত (Watermark)',
      bn: 'সহায়ক সংকেত (Watermark)',
      hi: 'सहायक वॉटरमार्क (Watermark)',
      en: 'Ghost Watermark',
    },
  };

  // 1. Initialize New Sequence Presentation
  const initTrial = useCallback((_trialIdx: number, overrideTier?: number | null) => {
    let diff: NumberRecallDifficulty;
    if (overrideTier) {
      diff = engine.getDifficultyForTierLevel(overrideTier);
      engine.setDifficulty(diff);
    } else {
      diff = engine.getDifficulty();
    }
    setDifficulty(diff);

    const seq = engine.generateDigitSequence(diff.digitCount);
    setTargetSequence(seq);
    setUserEnteredSequence('');
    setActiveDigitIndex(-1);
    setIsDigitShowing(false);
    setReplaysUsedThisTrial(0);
    setBackspaceCountThisTrial(0);
    setWatermarkDigitsViewedCount(0);
    setProactiveHelpRequested(false);
    setLastTrialFeedback(null);
    setAiDynamicActions([]);
    keystrokesRef.current = [];

    // Start 3s countdown before presentation
    setPhase('COUNTDOWN');
    setCountdownNum(3);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNum(count);
      } else {
        clearInterval(interval);
        startPresentation(seq, diff);
      }
    }, 800);
  }, [engine]);

  // 2. Sequential Digit Presentation Loop
  const startPresentation = (seq: string, diff: NumberRecallDifficulty) => {
    setPhase('PRESENTATION');
    numberRecallAudio.speakGuidance('study', language);

    let currentIndex = 0;

    const showNextDigit = () => {
      if (currentIndex >= seq.length) {
        // Presentation finished! Transition to RECALL phase
        setActiveDigitIndex(-1);
        setIsDigitShowing(false);
        setTimeout(() => {
          setPhase('RECALL');
          recallStartTimeRef.current = Date.now();
          lastKeypressTimeRef.current = Date.now();
          lastActionTimeRef.current = Date.now();
          
          if (diff.recallMode === 'backward') {
            numberRecallAudio.speakGuidance('recall_backward', language);
          } else {
            numberRecallAudio.speakGuidance('recall_forward', language);
          }
          resetAutoAssistTimer();
        }, 500);
        return;
      }

      // Flash current digit
      setActiveDigitIndex(currentIndex);
      setIsDigitShowing(true);
      const digitChar = seq[currentIndex];
      const digitNum = parseInt(digitChar, 10);
      numberRecallAudio.playDigitTone(digitNum);
      
      // Vernacular speech readout if enabled
      if (!isMuted) {
        numberRecallAudio.speakDigit(digitChar, language, diff.speechRate);
      }

      // Hide after displaySpeedMs
      setTimeout(() => {
        setIsDigitShowing(false);
        currentIndex += 1;
        // Wait for inter-stimulus interval gap (isiGapMs)
        setTimeout(showNextDigit, diff.isiGapMs);
      }, diff.displaySpeedMs);
    };

    setTimeout(showNextDigit, 400);
  };

  // Reset auto-assist idle timer
  const resetAutoAssistTimer = useCallback(() => {
    if (autoAssistTimerRef.current) clearTimeout(autoAssistTimerRef.current);
    if (phase !== 'RECALL') return;

    autoAssistTimerRef.current = setTimeout(() => {
      triggerAutoAssist();
    }, difficulty.autoAssistTimeoutMs);
  }, [difficulty.autoAssistTimeoutMs, phase]);

  // Dignity Auto-Assist Trigger
  const triggerAutoAssist = (isManual: boolean = false) => {
    if (isManual) setProactiveHelpRequested(true);
    const expected = engine.getExpectedSequence(targetSequence, difficulty.recallMode);
    const nextCharIndex = userEnteredSequence.length;
    if (nextCharIndex < expected.length) {
      const hintDigit = expected[nextCharIndex];
      numberRecallAudio.playDigitTone(parseInt(hintDigit, 10));
      setFeedbackBanner(`💡 Hint: The next digit is "${hintDigit}"`);
      setTimeout(() => setFeedbackBanner(null), 3500);
    }
  };

  // Load trial on mount or index change
  useEffect(() => {
    trialStartTimeRef.current = Date.now();
    initTrial(currentTrialIndex, manualTierOverride);
    return () => {
      if (autoAssistTimerRef.current) clearTimeout(autoAssistTimerRef.current);
    };
  }, [currentTrialIndex, manualTierOverride, initTrial]);

  // Real-time AI Cognition & Dynamic Scaffolding Monitor (every 2s during RECALL)
  useEffect(() => {
    if (phase !== 'RECALL') return;

    const interval = setInterval(() => {
      const idleSeconds = Math.floor((Date.now() - lastActionTimeRef.current) / 1000);
      const intervention = engine.analyzeLiveIntervention({
        idleTimeSeconds: idleSeconds,
        consecutiveFastSolves: consecutiveFastSolvesRef.current,
        currentDigitLength: difficulty.digitCount,
        watermarkActive: isGhostWatermarkVisible,
      });

      if (intervention.action === 'watermark_reveal') {
        setIsGhostWatermarkVisible(true);
        lastActionTimeRef.current = Date.now();
        const rationaleText = intervention.rationale[language] || intervention.rationale.en;
        setAiLiveReasoning(rationaleText);
        setAiAdaptationFlash(true);
        setTimeout(() => setAiAdaptationFlash(false), 4000);
        numberRecallAudio.playSuccessChime();
        setAiDynamicActions(prev => [
          ...prev,
          {
            type: 'watermark_reveal',
            timestamp: Date.now(),
            rationale: intervention.rationale,
            parametersAffected: 'Ghost Watermark Auto-Revealed',
          },
        ]);
      } else if (intervention.action === 'tempo_acceleration') {
        consecutiveFastSolvesRef.current = 0;
        lastActionTimeRef.current = Date.now();
        const rationaleText = intervention.rationale[language] || intervention.rationale.en;
        setAiLiveReasoning(rationaleText);
        setAiAdaptationFlash(true);
        setTimeout(() => setAiAdaptationFlash(false), 4000);
        setAiDynamicActions(prev => [
          ...prev,
          {
            type: 'tempo_acceleration',
            timestamp: Date.now(),
            rationale: intervention.rationale,
            parametersAffected: 'Tempo Accelerated',
          },
        ]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [phase, difficulty, isGhostWatermarkVisible, engine, language]);

  // Handle Numeric Keystroke Entry
  const handleInputDigit = (digit: string) => {
    if (phase !== 'RECALL') return;
    if (!engine.filterTremorTap()) return; // 400ms Tremor Filter

    const expectedLength = difficulty.digitCount;
    if (userEnteredSequence.length >= expectedLength) return;

    const now = Date.now();
    const latencyFromPrev = now - lastKeypressTimeRef.current;
    lastKeypressTimeRef.current = now;
    lastActionTimeRef.current = now;
    resetAutoAssistTimer();

    const nextSeq = userEnteredSequence + digit;
    setUserEnteredSequence(nextSeq);
    numberRecallAudio.playDigitTone(parseInt(digit, 10));

    if (isGhostWatermarkVisible) {
      setWatermarkDigitsViewedCount(c => c + 1);
    }

    // Record Keystroke Event
    keystrokesRef.current.push({
      digit,
      timestamp: now,
      latencyFromPreviousMs: latencyFromPrev,
      isBackspace: false,
      boxIndex: nextSeq.length - 1,
    });
  };

  // Handle Backspace Key
  const handleBackspace = () => {
    if (phase !== 'RECALL') return;
    if (!engine.filterTremorTap()) return;
    if (userEnteredSequence.length === 0) return;

    const now = Date.now();
    lastKeypressTimeRef.current = now;
    lastActionTimeRef.current = now;
    resetAutoAssistTimer();

    setUserEnteredSequence(prev => prev.slice(0, -1));
    setBackspaceCountThisTrial(c => c + 1);
    numberRecallAudio.playBackspaceClick();

    keystrokesRef.current.push({
      digit: 'BACKSPACE',
      timestamp: now,
      latencyFromPreviousMs: now - lastKeypressTimeRef.current,
      isBackspace: true,
      boxIndex: userEnteredSequence.length - 1,
    });
  };

  // Handle Clear All
  const handleClear = () => {
    if (phase !== 'RECALL') return;
    if (!engine.filterTremorTap()) return;
    setUserEnteredSequence('');
    numberRecallAudio.playBackspaceClick();
    resetAutoAssistTimer();
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'RECALL') return;
      if (e.key >= '0' && e.key <= '9') {
        handleInputDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        if (userEnteredSequence.length === difficulty.digitCount) {
          handleSubmitRecall();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, userEnteredSequence, difficulty]);

  // Handle Audio Replay
  const handleReplayAudio = () => {
    if (replaysUsedThisTrial >= difficulty.maxReplaysAllowed) return;
    setReplaysUsedThisTrial(c => c + 1);
    setPhase('PRESENTATION');
    startPresentation(targetSequence, difficulty);
  };

  // Handle Trial Submission & AI Bayesian Update
  const handleSubmitRecall = () => {
    if (phase !== 'RECALL') return;
    if (autoAssistTimerRef.current) clearTimeout(autoAssistTimerRef.current);

    const now = Date.now();
    const solveTimeMs = now - recallStartTimeRef.current;
    const timeToFirstKeypressMs = keystrokesRef.current.length > 0
      ? keystrokesRef.current[0].timestamp - recallStartTimeRef.current
      : solveTimeMs;

    const evalResult = engine.evaluateTrial(
      targetSequence,
      userEnteredSequence,
      difficulty.recallMode
    );

    if (evalResult.isCorrect) {
      if (solveTimeMs < difficulty.digitCount * 1200) {
        consecutiveFastSolvesRef.current++;
      } else {
        consecutiveFastSolvesRef.current = 1;
      }
      numberRecallAudio.playSuccessChime();
      numberRecallAudio.speakGuidance('correct', language);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } else {
      consecutiveFastSolvesRef.current = 0;
      numberRecallAudio.playErrorThud();
      numberRecallAudio.speakGuidance('try_again', language);
    }

    // Snapshot of trial settings
    const settingsSnapshot: NumberRecallSettingsSnapshot = {
      ghostWatermarkEnabled: isGhostWatermarkVisible,
      watermarkPiecesViewedCount: watermarkDigitsViewedCount,
      audioSpeechEnabled: !isMuted,
      speechRateUsed: difficulty.speechRate,
      replaysUsedCount: replaysUsedThisTrial,
      backspaceCorrectionsCount: backspaceCountThisTrial,
      proactiveHelpRequested,
      isManualTierOverride: manualTierOverride !== null,
    };

    // Bayesian 2PL IRT Update Step
    const { newTheta, reasoning, settingsImpactRationale, autonomyScore } = engine.updateTheta(
      evalResult.isCorrect,
      evalResult.errorType,
      solveTimeMs,
      settingsSnapshot
    );

    const reasoningText = reasoning[language] || reasoning.en;
    const settingsText = settingsImpactRationale[language] || settingsImpactRationale.en;
    setAiLiveReasoning(reasoningText);
    setAiSettingsImpact(settingsText);
    setAiAdaptationFlash(true);
    setTimeout(() => setAiAdaptationFlash(false), 4500);

    const interDigitLatencies = keystrokesRef.current
      .filter(k => !k.isBackspace)
      .map(k => k.latencyFromPreviousMs);
    const meanInterDigitLatencyMs = interDigitLatencies.length > 0
      ? Math.round(interDigitLatencies.reduce((a, b) => a + b, 0) / interDigitLatencies.length)
      : 0;

    const trialTelemetry: NumberRecallTrialTelemetry = {
      trialIndex: currentTrialIndex + 1,
      tierLevel: difficulty.tierLevel,
      digitCount: difficulty.digitCount,
      recallMode: difficulty.recallMode,
      targetSequence,
      userEnteredSequence,
      expectedSequence: evalResult.expectedSequence,
      isCorrect: evalResult.isCorrect,
      errorType: evalResult.errorType,
      primacyAccuracy: evalResult.primacyAccuracy,
      recencyAccuracy: evalResult.recencyAccuracy,
      serialPositionHits: evalResult.serialPositionHits,
      presentationDurationMs: difficulty.digitCount * difficulty.displaySpeedMs,
      timeToFirstKeypressMs,
      totalSolveTimeMs: solveTimeMs,
      meanInterDigitLatencyMs,
      keystrokeEvents: [...keystrokesRef.current],
      backspaceCorrectionsCount: backspaceCountThisTrial,
      replaysUsedCount: replaysUsedThisTrial,
      wasAutoAssisted: proactiveHelpRequested,
      thetaAfterTrial: Number(newTheta.toFixed(2)),
      difficultySnapshot: { ...difficulty },
      settingsSnapshot,
      settingsImpactRationale,
      aiAdaptiveReasoning: reasoning,
      autonomyScore,
      aiDynamicActions,
    };

    onTrialComplete?.(trialTelemetry);
    setSessionTrials(prev => [...prev, trialTelemetry]);

    setLastTrialFeedback({
      isCorrect: evalResult.isCorrect,
      expected: evalResult.expectedSequence,
      entered: userEnteredSequence,
      errorType: evalResult.errorType,
      primacyAccuracy: evalResult.primacyAccuracy,
      recencyAccuracy: evalResult.recencyAccuracy,
    });

    setPhase('FEEDBACK');
  };

  // Advance to Next Trial or Session Finish
  const handleNextOrFinish = () => {
    if (currentTrialIndex + 1 < totalTrials) {
      setCurrentTrialIndex(prev => prev + 1);
    } else {
      setPhase('COMPLETE');
      const summary = engine.compileSessionSummary(sessionTrials);
      setFinalSessionSummary(summary);
      onSessionComplete?.(summary);
    }
  };

  // Caregiver / Patient Early Exit with Telemetry Preservation
  const handleExitSession = () => {
    if (sessionTrials.length > 0) {
      const summary = engine.compileSessionSummary(sessionTrials, true);
      setFinalSessionSummary(summary);
      onSessionComplete?.(summary);
    }
    onExit?.();
  };

  // Mute audio toggle
  const handleToggleMute = () => {
    const next = numberRecallAudio.toggleMute();
    setIsMuted(next);
  };

  // Expected sequence for display during recall
  const expectedSeqDisplay = useMemo(() => {
    return engine.getExpectedSequence(targetSequence, difficulty.recallMode);
  }, [targetSequence, difficulty.recallMode, engine]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-7 max-w-5xl mx-auto space-y-6 animate-fadeIn select-none">
      
      {/* 1. TOP HEADER & ACCESSIBILITY CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
              <Hash className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.title[language]}
            </h2>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200">
              Tier {difficulty.tierLevel}: {difficulty.digitCount} Digits ({difficulty.recallMode === 'backward' ? 'Reverse Order' : 'Forward'})
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t.subtitle[language]}
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Progress Indicator */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-slate-500" />
            <span>Sequence {currentTrialIndex + 1} of {totalTrials}</span>
          </div>

          {/* AI TESTBED BUTTON */}
          <button
            onClick={() => setShowTestbed(!showTestbed)}
            className={`px-3 py-1.5 border font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 ${
              showTestbed
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
            }`}
            title="Inspect AI dynamic variables & test live clinical features"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>AI Testbed</span>
            {showTestbed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Ability Theta Pill */}
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-black text-slate-700 shadow-2xs">
            <Brain className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Ability (θ): <strong>{engine.getTheta() >= 0 ? `+${engine.getTheta().toFixed(2)}` : engine.getTheta().toFixed(2)}</strong></span>
          </div>

          {/* Ghost Watermark Toggle */}
          <button
            onClick={() => {
              const next = !isGhostWatermarkVisible;
              setIsGhostWatermarkVisible(next);
              if (!next) {
                setFeedbackBanner('🧠 Unassisted Mode Active: Ghost Watermark OFF (+0.75 2PL IRT Ability Bonus)');
                setTimeout(() => setFeedbackBanner(null), 3500);
              } else {
                setFeedbackBanner('👁️ Scaffolding Active: Ghost Watermark ON (Visual Guideline)');
                setTimeout(() => setFeedbackBanner(null), 3000);
              }
            }}
            title="Toggle Ghost Watermark Scaffolding"
            className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              isGhostWatermarkVisible
                ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                : 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-300'
            }`}
          >
            {isGhostWatermarkVisible ? <Eye className="w-4 h-4 text-indigo-700" /> : <EyeOff className="w-4 h-4 text-emerald-700" />}
            <span className="hidden sm:inline">{t.ghostWatermark[language]}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase ${!isGhostWatermarkVisible ? 'bg-emerald-600 text-white' : 'bg-indigo-200 text-indigo-900'}`}>
              {!isGhostWatermarkVisible ? '+Bonus' : 'ON'}
            </span>
          </button>

          {/* Mute Audio Toggle */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Dignity Auto-Assist Button */}
          {phase === 'RECALL' && (
            <button
              onClick={() => triggerAutoAssist(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.autoAssistBtn[language]}</span>
            </button>
          )}

          {/* Exit Button */}
          {onExit && (
            <button
              onClick={handleExitSession}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
            >
              {t.exit[language]}
            </button>
          )}
        </div>
      </div>

      {/* 2. SIH 2026 AI TESTBED & CLINICAL INSPECTOR DRAWER */}
      {showTestbed && (
        <div className="my-4 p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl border-2 border-indigo-500 shadow-2xl space-y-4 animate-fadeIn">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-black tracking-widest text-indigo-400 uppercase">
              <Sliders className="w-4 h-4" />
              <span>SIH 2026 WAIS-IV Digit Span & Working Memory AI Testbed</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono bg-white/10 px-2.5 py-1 rounded-lg text-indigo-200">
                Tier {difficulty.tierLevel} | {difficulty.digitCount} Digits ({difficulty.recallMode})
              </span>
              <span className="text-[11px] font-mono bg-white/10 px-2.5 py-1 rounded-lg text-emerald-300">
                Display: {difficulty.displaySpeedMs}ms
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            
            {/* Gauge 1: Ability Theta */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Latent Ability θ (2PL IRT)</span>
              <div className="text-xl font-black text-indigo-400">
                {engine.getTheta() >= 0 ? `+${engine.getTheta().toFixed(2)}` : engine.getTheta().toFixed(2)}
              </div>
              <p className="text-[10px] text-slate-400 leading-snug">Range [-3.0, +3.0]. Dynamic Item Difficulty $b$: {difficulty.itemDifficultyB.toFixed(2)}</p>
            </div>

            {/* Gauge 2: WAIS Scaled Score */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider">WAIS-IV Scaled Equivalent</span>
              <div className="text-xl font-black text-emerald-400">
                {engine.calculateWAISDigitSpanScore(difficulty.digitCount, difficulty.recallMode === 'backward' ? difficulty.digitCount : 0)} / 19
              </div>
              <p className="text-[10px] text-slate-400 leading-snug">Age-normed percentile. Median = 10.</p>
            </div>

            {/* Gauge 3: Mode & Watermark */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] text-amber-300 uppercase font-bold tracking-wider">Scaffolding Status</span>
              <div className="text-sm font-black text-amber-300 capitalize">
                {isGhostWatermarkVisible ? `Watermark (${Math.round(difficulty.ghostWatermarkOpacity * 100)}%)` : 'Unassisted (+Bonus)'}
              </div>
              <p className="text-[10px] text-slate-400 leading-snug">Mode: {difficulty.recallMode.toUpperCase()}</p>
            </div>

            {/* Gauge 4: Hardware Tremor Guard */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">Tremor Debounce Guard</span>
              <div className="text-xl font-black text-purple-300">
                {engine.getTremorFilteredCount()} Taps
              </div>
              <p className="text-[10px] text-slate-400 leading-snug">400ms Debounce with Clock Skew Shield</p>
            </div>
          </div>

          {/* Testbed Interactive Controls */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-300">Direct Minimal Step Tier Force Override:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {NUMBER_RECALL_TIERS.map(t => (
                  <button
                    key={t.tierLevel}
                    onClick={() => {
                      setManualTierOverride(t.tierLevel);
                      initTrial(currentTrialIndex, t.tierLevel);
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      difficulty.tierLevel === t.tierLevel
                        ? 'bg-indigo-500 text-white ring-2 ring-indigo-300'
                        : 'bg-white/10 hover:bg-white/20 text-slate-300'
                    }`}
                  >
                    T{t.tierLevel} ({t.digitCount}d{t.recallMode === 'backward' ? 'R' : ''})
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Simulation Triggers */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400 font-bold">Simulate Response:</span>
              
              <button
                onClick={() => {
                  if (phase !== 'RECALL') return;
                  const exp = engine.getExpectedSequence(targetSequence, difficulty.recallMode);
                  setUserEnteredSequence(exp);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold cursor-pointer"
              >
                ✓ Fill Perfect Sequence
              </button>

              <button
                onClick={() => {
                  if (phase !== 'RECALL') return;
                  const exp = engine.getExpectedSequence(targetSequence, difficulty.recallMode);
                  if (exp.length >= 2) {
                    // Transpose last two digits
                    const arr = exp.split('');
                    const tmp = arr[arr.length - 1];
                    arr[arr.length - 1] = arr[arr.length - 2];
                    arr[arr.length - 2] = tmp;
                    setUserEnteredSequence(arr.join(''));
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold cursor-pointer"
              >
                ⇄ Fill Transposition Error
              </button>

              <button
                onClick={() => {
                  if (phase !== 'RECALL') return;
                  // Fill forward sequence while in backward mode
                  setUserEnteredSequence(targetSequence);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold cursor-pointer"
              >
                ✕ Fill Reversal Failure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. LIVE AI ADAPTATION & REASONING BANNER */}
      {(aiLiveReasoning || feedbackBanner) && (
        <div className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all ${
          aiAdaptationFlash
            ? 'bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-100 border-indigo-400 text-indigo-950 shadow-md ring-2 ring-indigo-200 animate-pulse'
            : feedbackBanner
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">
                SIH 2026 Real-Time Bayesian DDA & Autonomy Analysis
              </span>
              <p className="leading-snug">{feedbackBanner || aiLiveReasoning}</p>
              {aiSettingsImpact && !feedbackBanner && (
                <p className="text-[11px] text-indigo-700 font-semibold pt-0.5">{aiSettingsImpact}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN INTERACTIVE WORKSPACE */}
      <div className="min-h-[380px] flex flex-col justify-center items-center p-6 bg-slate-50/70 rounded-3xl border border-slate-200 relative overflow-hidden">
        
        {/* PHASE A: COUNTDOWN */}
        {phase === 'COUNTDOWN' && (
          <div className="text-center space-y-4 animate-fadeIn">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-indigo-600 block">
              {t.readyText[language]}
            </span>
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-5xl font-black shadow-xl mx-auto animate-bounce">
              {countdownNum}
            </div>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
              {difficulty.recallMode === 'backward'
                ? '⚠️ Attention: You will be asked to recall these digits in REVERSE (Backward) order!'
                : 'Memorize the digits in forward order.'}
            </p>
          </div>
        )}

        {/* PHASE B: SEQUENTIAL PRESENTATION */}
        {phase === 'PRESENTATION' && (
          <div className="text-center space-y-6 animate-fadeIn w-full max-w-md">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-black tracking-widest text-indigo-700 uppercase">
                Showing Digit {activeDigitIndex + 1} of {targetSequence.length}
              </span>
            </div>

            {/* Glowing Active Digit Flash Card */}
            <div className="relative mx-auto flex items-center justify-center">
              <div className={`w-40 h-48 rounded-3xl flex items-center justify-center text-7xl sm:text-8xl font-black text-indigo-950 shadow-2xl transition-all duration-300 border-4 ${
                isDigitShowing 
                  ? 'bg-white border-indigo-500 scale-105 ring-8 ring-indigo-200' 
                  : 'bg-slate-100 border-slate-200 scale-95 opacity-20'
              }`}>
                {isDigitShowing && activeDigitIndex >= 0 ? targetSequence[activeDigitIndex] : ''}
              </div>
            </div>

            {/* Presentation Progress Dots */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {targetSequence.split('').map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    idx < activeDigitIndex
                      ? 'bg-emerald-500 scale-100'
                      : idx === activeDigitIndex
                      ? 'bg-indigo-600 scale-125 ring-2 ring-indigo-300'
                      : 'bg-slate-300 scale-90'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* PHASE C: RECALL & DIALPAD */}
        {phase === 'RECALL' && (
          <div className="w-full max-w-lg space-y-5 animate-fadeIn">
            
            {/* Mode Banner */}
            <div className={`p-3 rounded-2xl border text-center transition-all ${
              difficulty.recallMode === 'backward'
                ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-xs'
                : 'bg-indigo-50 border-indigo-200 text-indigo-950'
            }`}>
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-black">
                {difficulty.recallMode === 'backward' ? (
                  <>
                    <RotateCcw className="w-4 h-4 text-amber-700 animate-spin-slow" />
                    <span>{t.enterBackward[language]}</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 text-indigo-700" />
                    <span>{t.enterForward[language]}</span>
                  </>
                )}
              </div>
              {difficulty.recallMode === 'backward' && (
                <span className="text-[11px] text-amber-800 font-bold block mt-0.5">
                  Example: If you saw 4 ➔ 9 ➔ 2, type 2 ➔ 9 ➔ 4
                </span>
              )}
            </div>

            {/* Digit Input Boxes with Optional Faint Ghost Watermark */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {Array.from({ length: difficulty.digitCount }).map((_, idx) => {
                const char = userEnteredSequence[idx];
                const watermarkChar = expectedSeqDisplay[idx];
                const isCurrent = idx === userEnteredSequence.length;

                return (
                  <div
                    key={idx}
                    className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black transition-all border-2 ${
                      char
                        ? 'bg-white border-indigo-600 text-indigo-950 shadow-sm'
                        : isCurrent
                        ? 'bg-indigo-50/50 border-indigo-400 ring-2 ring-indigo-200 scale-105'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    {char ? (
                      char
                    ) : isGhostWatermarkVisible && difficulty.ghostWatermarkOpacity > 0 ? (
                      <span
                        className="text-indigo-400/40 select-none"
                        style={{ opacity: difficulty.ghostWatermarkOpacity }}
                      >
                        {watermarkChar}
                      </span>
                    ) : (
                      ''
                    )}
                  </div>
                );
              })}
            </div>

            {/* Large 64pt Elder-Accessible Numeric Dialpad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  onClick={() => handleInputDigit(num)}
                  className="h-14 sm:h-16 rounded-2xl bg-white hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-400 text-2xl sm:text-3xl font-black text-slate-800 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                >
                  {num}
                </button>
              ))}

              {/* Backspace Button */}
              <button
                onClick={handleBackspace}
                title="Delete last digit"
                className="h-14 sm:h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 text-slate-700 font-black active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              >
                <Delete className="w-6 h-6 text-slate-600" />
              </button>

              {/* Zero Button */}
              <button
                onClick={() => handleInputDigit('0')}
                className="h-14 sm:h-16 rounded-2xl bg-white hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-400 text-2xl sm:text-3xl font-black text-slate-800 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              >
                0
              </button>

              {/* Submit / Done Button */}
              <button
                onClick={handleSubmitRecall}
                disabled={userEnteredSequence.length !== difficulty.digitCount}
                className={`h-14 sm:h-16 rounded-2xl font-black text-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center ${
                  userEnteredSequence.length === difficulty.digitCount
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md ring-2 ring-indigo-300'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                <CornerDownLeft className="w-6 h-6" />
              </button>
            </div>

            {/* Auxiliary Row: Replay & Clear */}
            <div className="flex items-center justify-between pt-2 max-w-xs mx-auto">
              <button
                onClick={handleClear}
                disabled={userEnteredSequence.length === 0}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              >
                {t.clearBtn[language]}
              </button>

              {replaysUsedThisTrial < difficulty.maxReplaysAllowed && (
                <button
                  onClick={handleReplayAudio}
                  className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.replayBtn[language]} ({difficulty.maxReplaysAllowed - replaysUsedThisTrial} left)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* PHASE D: TRIAL FEEDBACK */}
        {phase === 'FEEDBACK' && lastTrialFeedback && (
          <div className="text-center space-y-5 animate-fadeIn max-w-md w-full">
            <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-lg ${
              lastTrialFeedback.isCorrect ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' : 'bg-rose-100 text-rose-700 border-2 border-rose-300'
            }`}>
              {lastTrialFeedback.isCorrect ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {lastTrialFeedback.isCorrect
                  ? (language === 'as' ? 'অতি সুন্দৰ! সম্পূৰ্ণ শুদ্ধ!' : language === 'bn' ? 'চমৎকার! সম্পূর্ণ সঠিক!' : language === 'hi' ? 'बहुत बढ़िया! बिल्कुल सही!' : 'Splendid! Exactly correct!')
                  : (language === 'as' ? 'ভাল প্ৰচেষ্টা!' : language === 'bn' ? 'ভালো প্রচেষ্টা!' : language === 'hi' ? 'अच्छा प्रयास!' : 'Good Effort!')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Target: <strong>{lastTrialFeedback.expected}</strong> · Your entry: <strong>{lastTrialFeedback.entered}</strong>
              </p>
            </div>

            {/* Serial Position breakdown */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs flex items-center justify-around">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Primacy (First Digits)</span>
                <span className={`font-black ${lastTrialFeedback.primacyAccuracy ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {lastTrialFeedback.primacyAccuracy ? '✓ Retained' : '✗ Missed'}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Recency (Last Digits)</span>
                <span className={`font-black ${lastTrialFeedback.recencyAccuracy ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {lastTrialFeedback.recencyAccuracy ? '✓ Retained' : '✗ Missed'}
                </span>
              </div>
            </div>

            <button
              onClick={handleNextOrFinish}
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <span>{t.nextTrial[language]}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PHASE E: SESSION COMPLETE SUMMARY MODAL */}
        {phase === 'COMPLETE' && finalSessionSummary && (
          <div className="text-center space-y-5 animate-fadeIn max-w-2xl w-full p-2">
            
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900">
                {language === 'as' ? 'অনুশীলন সম্পূৰ্ণ হ’ল!' : language === 'bn' ? 'অনুশীলন সম্পূর্ণ হলো!' : language === 'hi' ? 'सत्र सफलतापूर्वक पूरा हुआ!' : 'Assessment Battery Complete!'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                WAIS-IV Digit Span & Dorsolateral Prefrontal Working Memory Profile
              </p>
            </div>

            {/* 6-Grid Clinical Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
              
              {/* Card 1: WAIS Scaled Score */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">WAIS-IV Scaled Score</span>
                <div className="text-2xl font-black text-indigo-700">
                  {finalSessionSummary.waisDigitSpanScaledScore} <span className="text-xs text-slate-400 font-bold">/ 19</span>
                </div>
                <p className="text-[10px] text-slate-500">Median older adult baseline: 10</p>
              </div>

              {/* Card 2: Max Forward Span */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Max Forward Span</span>
                <div className="text-2xl font-black text-emerald-700">
                  {finalSessionSummary.maxForwardSpanAchieved} <span className="text-xs text-slate-400 font-bold">Digits</span>
                </div>
                <p className="text-[10px] text-slate-500">Phonological echoic span</p>
              </div>

              {/* Card 3: Max Backward Span */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Max Backward Span</span>
                <div className="text-2xl font-black text-amber-700">
                  {finalSessionSummary.maxBackwardSpanAchieved} <span className="text-xs text-slate-400 font-bold">Digits</span>
                </div>
                <p className="text-[10px] text-slate-500">DLPFC mental reversal</p>
              </div>

              {/* Card 4: Phonological Loop */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Phonological Loop</span>
                <div className="text-sm font-black text-slate-900 capitalize">
                  {finalSessionSummary.phonologicalLoopRating.replace(/_/g, ' ')}
                </div>
                <p className="text-[10px] text-slate-500">Acoustic rehearsal capacity</p>
              </div>

              {/* Card 5: DLPFC Status */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Prefrontal Reversal</span>
                <div className="text-sm font-black text-slate-900 capitalize">
                  {finalSessionSummary.dorsolateralPrefrontalStatus.replace(/_/g, ' ')}
                </div>
                <p className="text-[10px] text-slate-500">Working memory manipulation</p>
              </div>

              {/* Card 6: Autonomy Score */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Settings Autonomy</span>
                <div className="text-2xl font-black text-purple-700">
                  {finalSessionSummary.autonomyScore}%
                </div>
                <p className="text-[10px] text-slate-500 capitalize">{finalSessionSummary.patientSettingsAutonomyRating.replace(/_/g, ' ')}</p>
              </div>
            </div>

            {/* Serial Position Curve Interpretation */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-left space-y-1.5">
              <span className="text-xs font-black text-indigo-950 uppercase tracking-wider block">
                Serial Position Effect Analysis: Primacy ({finalSessionSummary.serialPositionProfile.primacyRetentionRate}%) vs Recency ({finalSessionSummary.serialPositionProfile.recencyRetentionRate}%)
              </span>
              <p className="text-xs text-indigo-900 leading-snug">
                {finalSessionSummary.serialPositionProfile.clinicalInterpretation}
              </p>
            </div>

            <button
              onClick={onExit}
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition-all cursor-pointer active:scale-95"
            >
              Close & Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
