import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Eye,
  Sparkles,
  Award,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowRight,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Clock,
  Check,
  X,
  Target,
  Play,
  Square,
  UserCheck,
  Activity,
  Stethoscope,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  WhatChangedEngine,
  WHAT_CHANGED_TIERS,
} from './engine';
import { whatChangedAudio } from './audio';
import type {
  WhatChangedDifficulty,
  WhatChangedSettingsSnapshot,
  WhatChangedTrialTelemetry,
  WhatChangedSessionSummary,
  WhatChangedAIDynamicAction,
  SceneItem,
  TapEvent,
  OasisPatientPersona,
} from './types';
import { REAL_WORLD_OASIS_PERSONAS } from './types';
import type { SupportedLanguage } from '../../types/prescription';
import { AdaptiveAssistanceEngine } from '../../engine/adaptive-assistance';

interface WhatChangedProps {
  language?: SupportedLanguage;
  totalTrials?: number;
  initialTheta?: number;
  onTrialComplete?: (telemetry: WhatChangedTrialTelemetry) => void;
  onSessionComplete?: (summary: WhatChangedSessionSummary) => void;
  onExit?: () => void;
}

export const WhatChanged: React.FC<WhatChangedProps> = ({
  language = 'en',
  totalTrials = 4,
  initialTheta = 0.0,
  onTrialComplete,
  onSessionComplete,
  onExit,
}) => {
  // ─── Engine & Core States ──────────────────────────────────────────────────
  const engine = useMemo(() => new WhatChangedEngine(initialTheta), [initialTheta]);
  const [currentTrialIndex, setCurrentTrialIndex] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<WhatChangedDifficulty>(engine.getDifficulty());
  
  // Lifecycle Phase: STUDY -> MASK -> DETECTION -> FEEDBACK -> COMPLETE
  const [phase, setPhase] = useState<'STUDY' | 'MASK' | 'DETECTION' | 'FEEDBACK' | 'COMPLETE'>('STUDY');
  
  // Scene Items
  const [sceneA, setSceneA] = useState<SceneItem[]>([]);
  const [sceneB, setSceneB] = useState<SceneItem[]>([]);
  const [targetSlotId, setTargetSlotId] = useState<number>(-1);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  // Assistance & Scaffolding
  const [isHaloVisible, setIsHaloVisible] = useState<boolean>(false);
  const [replaysUsedThisTrial, setReplaysUsedThisTrial] = useState<number>(0);
  const [isPeekingSceneA, setIsPeekingSceneA] = useState<boolean>(false);
  const [proactiveHelpRequested, setProactiveHelpRequested] = useState<boolean>(false);
  const [manualTierOverride, setManualTierOverride] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Study Progress
  const [studyTimeRemainingMs, setStudyTimeRemainingMs] = useState<number>(15000);

  // AI Adaptations & Telemetry Timers
  const [aiLiveReasoning, setAiLiveReasoning] = useState<string>('');
  const [aiSettingsImpact, setAiSettingsImpact] = useState<string>('');
  const [aiAdaptationFlash, setAiAdaptationFlash] = useState<boolean>(false);
  const [aiDynamicActions, setAiDynamicActions] = useState<WhatChangedAIDynamicAction[]>([]);
  const [showTestbed, setShowTestbed] = useState<boolean>(false);

  // ─── Real-World OASIS-2 Patient Simulation State ───────────────────────────
  const [selectedOasisPersona, setSelectedOasisPersona] = useState<OasisPatientPersona>(REAL_WORLD_OASIS_PERSONAS[0]);
  const [isSimulatingPlayback, setIsSimulatingPlayback] = useState<boolean>(false);
  const [simulatedGazeSlot, setSimulatedGazeSlot] = useState<number | null>(null);
  const [simulatedTremorBurstActive, setSimulatedTremorBurstActive] = useState<boolean>(false);
  const [simulationStatusMsg, setSimulationStatusMsg] = useState<string | null>(null);
  const simulationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Micro-timing refs
  const trialStartTimeRef = useRef<number>(Date.now());
  const studyStartTimeRef = useRef<number>(Date.now());
  const detectionStartTimeRef = useRef<number>(Date.now());
  const lastActionTimeRef = useRef<number>(Date.now());
  const firstTapTimeRef = useRef<number | null>(null);
  const tapEventsRef = useRef<TapEvent[]>([]);
  const consecutiveFastSolvesRef = useRef<number>(0);

  // Timers & Intervals Guard Refs
  const studyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maskTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAssistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const peekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Session Accumulator
  const [sessionTrials, setSessionTrials] = useState<WhatChangedTrialTelemetry[]>([]);
  const [lastTrialFeedback, setLastTrialFeedback] = useState<{
    isCorrect: boolean;
    targetSlotId: number;
    targetItemA?: SceneItem;
    targetItemB?: SceneItem;
    changeDescription: Record<SupportedLanguage, string>;
  } | null>(null);
  const [finalSessionSummary, setFinalSessionSummary] = useState<WhatChangedSessionSummary | null>(null);

  // Localized UI Dictionary
  const t = {
    title: {
      as: 'কি সলনি হ’ল? (What Changed?)',
      bn: 'কী পরিবর্তন হলো? (What Changed?)',
      hi: 'क्या बदला? (What Changed?)',
      en: 'What Changed? (Visual Change Blindness)',
    },
    subtitle: {
      as: 'দৃষ্টি একাগ্ৰতা আৰু স্থানিক বৈশিষ্ট্য নিৰীক্ষণ অনুশীলন',
      bn: 'দৃষ্টি একাগ্রতা ও স্থানিক বৈশিষ্ট্য পর্যবেক্ষণ অনুশীলন',
      hi: 'दृश्य सतर्कता और स्थानिक विशेषता बंधन अभ्यास',
      en: 'Visual Attention & Feature Binding Paradigm',
    },
    studyHeader: {
      as: 'দৃশ্যখন ভালদৰে লক্ষ্য কৰক (Memorize Scene):',
      bn: 'দৃশ্যটি ভালো করে দেখুন (Memorize Scene):',
      hi: 'दृश्य का ध्यान से अध्ययन करें (Memorize Scene):',
      en: 'Study all items in the scene carefully:',
    },
    detectHeader: {
      as: 'কি সলনি হ’ল? পৰিৱৰ্তিত বস্তুটো বাছক:',
      bn: 'কী পরিবর্তন হলো? পরিবর্তিত বস্তুটি নির্বাচন করুন:',
      hi: 'क्या बदला? बदली हुई वस्तु पर टैप करें:',
      en: 'What changed? Tap the object that was modified:',
    },
    readyBtn: {
      as: 'মই প্ৰস্তুত ➔',
      bn: 'আমি প্রস্তুত ➔',
      hi: 'मैं तैयार हूँ ➔',
      en: "I'm Ready ➔",
    },
    submitBtn: {
      as: 'দাখিল কৰক ➔',
      bn: 'জমা দিন ➔',
      hi: 'जमा करें ➔',
      en: 'Submit Choice ➔',
    },
    nextTrial: {
      as: 'পৰৱৰ্তী দৃশ্য ➔',
      bn: 'পরবর্তী দৃশ্য ➔',
      hi: 'अगला दृश्य ➔',
      en: 'Next Scene ➔',
    },
    peekBtn: {
      as: 'পুৰণি দৃশ্য চাওক (Peek Scene A)',
      bn: 'পুরোনো দৃশ্য দেখুন (Peek Scene A)',
      hi: 'पिछला दृश्य देखें (Peek Scene A)',
      en: 'Peek Scene A',
    },
    helpBtn: {
      as: 'সহায় লওক (Hint)',
      bn: 'সহায়তা নিন (Hint)',
      hi: 'मदद लें (Hint)',
      en: 'Gentle Hint',
    },
    exit: {
      as: 'বাহিৰ হওক',
      bn: 'প্রস্থান',
      hi: 'बाहर जाएं',
      en: 'Exit',
    },
  };

  // Safe timer clearing helper
  const clearAllTimers = useCallback(() => {
    if (studyIntervalRef.current) {
      clearInterval(studyIntervalRef.current);
      studyIntervalRef.current = null;
    }
    if (maskTimeoutRef.current) {
      clearTimeout(maskTimeoutRef.current);
      maskTimeoutRef.current = null;
    }
    if (autoAssistTimerRef.current) {
      clearTimeout(autoAssistTimerRef.current);
      autoAssistTimerRef.current = null;
    }
    if (peekTimeoutRef.current) {
      clearTimeout(peekTimeoutRef.current);
      peekTimeoutRef.current = null;
    }
    if (simulationTimerRef.current) {
      clearTimeout(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
  }, []);

  // 1. Initialize New Trial
  const initTrial = useCallback((_trialIdx: number, overrideTier?: number | null) => {
    clearAllTimers();
    whatChangedAudio.stopAllSpeech();

    let diff: WhatChangedDifficulty;
    if (overrideTier) {
      diff = engine.getDifficultyForTierLevel(overrideTier);
      engine.setDifficulty(diff);
    } else {
      diff = engine.getDifficulty();
    }
    setDifficulty(diff);

    // Generate Scene A and Scene B
    const generated = engine.generateScenePair(diff);
    setSceneA(generated.sceneA);
    setSceneB(generated.sceneB);
    setTargetSlotId(generated.targetSlotId);
    setSelectedSlotId(null);
    setIsHaloVisible(false);
    setReplaysUsedThisTrial(0);
    setIsPeekingSceneA(false);
    setProactiveHelpRequested(false);
    setLastTrialFeedback(null);
    setAiDynamicActions([]);
    tapEventsRef.current = [];
    firstTapTimeRef.current = null;

    // Start STUDY Phase
    setPhase('STUDY');
    studyStartTimeRef.current = Date.now();
    setStudyTimeRemainingMs(diff.studyDurationMs);
    whatChangedAudio.playStudyStartChord();

    if (!isMuted) {
      whatChangedAudio.speakGuidance('study', language);
    }

    // Study countdown interval
    const intervalMs = 100;
    studyIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - studyStartTimeRef.current;
      const remaining = Math.max(0, diff.studyDurationMs - elapsed);
      setStudyTimeRemainingMs(remaining);

      if (remaining <= 0) {
        transitionToMaskAndDetection(generated.sceneB, diff);
      }
    }, intervalMs);
  }, [engine, clearAllTimers, isMuted, language]);

  // 2. Transition from Study to Mask to Detection
  const transitionToMaskAndDetection = useCallback((_testScene: SceneItem[], diff: WhatChangedDifficulty) => {
    clearAllTimers();

    if (diff.maskDurationMs > 0) {
      setPhase('MASK');
      whatChangedAudio.playMaskTransition();

      maskTimeoutRef.current = setTimeout(() => {
        setPhase('DETECTION');
        detectionStartTimeRef.current = Date.now();
        lastActionTimeRef.current = Date.now();
        if (!isMuted) {
          whatChangedAudio.speakGuidance('detect', language);
        }
        resetAutoAssistTimer();
      }, diff.maskDurationMs);
    } else {
      // 0ms smooth crossfade (Tier 1 floor)
      setPhase('DETECTION');
      detectionStartTimeRef.current = Date.now();
      lastActionTimeRef.current = Date.now();
      if (!isMuted) {
        whatChangedAudio.speakGuidance('detect', language);
      }
      resetAutoAssistTimer();
    }
  }, [clearAllTimers, isMuted, language]);

  // Patient-Profile Adaptive Assistance Derivation
  const liveAssistanceProfile = useMemo(() => {
    return AdaptiveAssistanceEngine.deriveAssistanceProfile({
      theta: engine.getTheta(),
      tremorTapsCount: engine.getTremorFilteredCount(),
      recentLatenciesMs: tapEventsRef.current.map(t => t.latencyFromPreviousMs),
      consecutiveErrors: 0,
      accuracyPct: currentTrialIndex > 0 ? 80 : 100,
      hesitationMs: Date.now() - lastActionTimeRef.current,
      taskType: 'recognition',
    });
  }, [engine, currentTrialIndex]);

  // Reset auto-assist idle timer (Profile-Adaptive)
  const resetAutoAssistTimer = useCallback(() => {
    if (autoAssistTimerRef.current) clearTimeout(autoAssistTimerRef.current);
    if (phase !== 'DETECTION') return;

    autoAssistTimerRef.current = setTimeout(() => {
      triggerAutoAssist(false, liveAssistanceProfile);
    }, liveAssistanceProfile.assistTimeoutMs);
  }, [liveAssistanceProfile, phase]);

  // Dignity Auto-Assist Trigger (Profile-Adaptive)
  const triggerAutoAssist = (isManual: boolean = false, activeProfile = liveAssistanceProfile) => {
    if (isManual) setProactiveHelpRequested(true);
    setIsHaloVisible(true);
    whatChangedAudio.playHaloPulse();

    if (activeProfile.profile === 'severe_amnesic') {
      whatChangedAudio.speakGuidance('hint', language);
      setFeedbackBanner('AI Live Assist: Golden spotlight revealed the changed spot.');
      setTimeout(() => setFeedbackBanner(null), 4000);
    } else if (activeProfile.profile === 'motor_tremor_slowed') {
      setFeedbackBanner('🛡️ Motor grace active. Tap the highlighted item when ready.');
      setTimeout(() => setFeedbackBanner(null), 4500);
    } else {
      setFeedbackBanner('💡 Notice the gentle golden spotlight glow on the changed item.');
      setTimeout(() => setFeedbackBanner(null), 3500);
    }
  };

  // Load trial on mount or index change
  useEffect(() => {
    trialStartTimeRef.current = Date.now();
    initTrial(currentTrialIndex, manualTierOverride);
    return () => {
      clearAllTimers();
      whatChangedAudio.stopAllSpeech();
    };
  }, [currentTrialIndex, manualTierOverride, initTrial, clearAllTimers]);

  // Real-time AI Cognition & Dynamic Scaffolding Monitor (every 2s during DETECTION)
  useEffect(() => {
    if (phase !== 'DETECTION') return;

    const interval = setInterval(() => {
      const idleSeconds = Math.floor((Date.now() - lastActionTimeRef.current) / 1000);
      const intervention = engine.analyzeLiveIntervention({
        idleTimeSeconds: idleSeconds,
        consecutiveFastSolves: consecutiveFastSolvesRef.current,
        itemCount: difficulty.itemCount,
        haloActive: isHaloVisible,
      });

      if (intervention.action === 'spotlight_hint') {
        setIsHaloVisible(true);
        lastActionTimeRef.current = Date.now();
        const rationaleText = intervention.rationale[language] || intervention.rationale.en;
        setAiLiveReasoning(rationaleText);
        setAiAdaptationFlash(true);
        setTimeout(() => setAiAdaptationFlash(false), 4000);
        whatChangedAudio.playHaloPulse();
        setAiDynamicActions(prev => [
          ...prev,
          {
            type: 'spotlight_hint',
            timestamp: Date.now(),
            rationale: intervention.rationale,
            parametersAffected: 'Golden Spotlight Activated',
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
            parametersAffected: 'Mask Tempo Accelerated',
          },
        ]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [phase, difficulty, isHaloVisible, engine, language]);

  // Handle User Tapping a Slot in the Scene
  const handleSlotTap = (slotId: number) => {
    if (phase !== 'DETECTION') return;
    if (!engine.filterTremorTap()) return; // 400ms Tremor Guard

    const now = Date.now();
    if (firstTapTimeRef.current === null) {
      firstTapTimeRef.current = now - detectionStartTimeRef.current;
    }

    const latencyFromPrev = tapEventsRef.current.length > 0
      ? now - tapEventsRef.current[tapEventsRef.current.length - 1].timestamp
      : now - detectionStartTimeRef.current;

    tapEventsRef.current.push({
      slotId,
      timestamp: now,
      latencyFromPreviousMs: latencyFromPrev,
      isTarget: slotId === targetSlotId,
    });

    lastActionTimeRef.current = now;
    resetAutoAssistTimer();
    setSelectedSlotId(slotId);
    whatChangedAudio.playTapFeedback();
  };

  // Handle Peek Back at Scene A
  const handlePeekSceneA = () => {
    if (phase !== 'DETECTION') return;
    if (replaysUsedThisTrial >= difficulty.maxReplayPeeksAllowed) return;

    setReplaysUsedThisTrial(c => c + 1);
    setIsPeekingSceneA(true);
    whatChangedAudio.playStudyStartChord();

    if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);
    peekTimeoutRef.current = setTimeout(() => {
      setIsPeekingSceneA(false);
    }, 2200);
  };

  // Handle Trial Submission
  const handleSubmitChoice = (overrideSlotId?: number) => {
    const slotToSubmit = overrideSlotId !== undefined ? overrideSlotId : selectedSlotId;
    if (phase !== 'DETECTION' || slotToSubmit === null) return;
    clearAllTimers();
    whatChangedAudio.stopAllSpeech();

    const now = Date.now();
    const deliberationTimeMs = now - detectionStartTimeRef.current;
    const isCorrect = slotToSubmit === targetSlotId;
    const studyDurationActualMs = Date.now() - studyStartTimeRef.current;

    if (isCorrect) {
      if (deliberationTimeMs < 3000) {
        consecutiveFastSolvesRef.current++;
      } else {
        consecutiveFastSolvesRef.current = 1;
      }
      whatChangedAudio.playSuccessChime();
      whatChangedAudio.speakGuidance('correct', language);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } else {
      consecutiveFastSolvesRef.current = 0;
      whatChangedAudio.playErrorThud();
      whatChangedAudio.speakGuidance('try_again', language);
    }

    // Snapshot of trial settings
    const settingsSnapshot: WhatChangedSettingsSnapshot = {
      haloScaffoldingActive: isHaloVisible,
      studyTimeUsedRatio: Math.min(1.0, studyDurationActualMs / difficulty.studyDurationMs),
      replaysUsedCount: replaysUsedThisTrial,
      proactiveHelpRequested,
      isManualTierOverride: manualTierOverride !== null,
      soundMuted: isMuted,
    };

    // Bayesian 2PL IRT Update Step
    const { newTheta, reasoning, settingsImpactRationale, autonomyScore } = engine.updateTheta(
      isCorrect,
      deliberationTimeMs,
      settingsSnapshot
    );

    const reasoningText = reasoning[language] || reasoning.en;
    const settingsText = settingsImpactRationale[language] || settingsImpactRationale.en;
    setAiLiveReasoning(reasoningText);
    setAiSettingsImpact(settingsText);
    setAiAdaptationFlash(true);
    setTimeout(() => setAiAdaptationFlash(false), 4500);

    const targetItemA = sceneA.find(i => i.slotId === targetSlotId);
    const targetItemB = sceneB.find(i => i.slotId === targetSlotId);

    const trialTelemetry: WhatChangedTrialTelemetry = {
      trialIndex: currentTrialIndex + 1,
      tierLevel: difficulty.tierLevel,
      itemCount: difficulty.itemCount,
      changeType: difficulty.changeType,
      targetSlotId,
      selectedSlotId: slotToSubmit,
      isCorrect,
      studyDurationActualMs,
      maskDurationMs: difficulty.maskDurationMs,
      deliberationTimeMs,
      timeToFirstTapMs: firstTapTimeRef.current ?? deliberationTimeMs,
      totalTapsCount: tapEventsRef.current.length,
      tapEvents: tapEventsRef.current,
      wasAutoAssisted: isHaloVisible || proactiveHelpRequested,
      replaysUsedCount: replaysUsedThisTrial,
      autonomyScore,
      thetaAfterTrial: newTheta,
      difficultySnapshot: difficulty,
      settingsSnapshot,
      settingsImpactRationale,
      aiAdaptiveReasoning: reasoning,
      aiDynamicActions,
    };

    onTrialComplete?.(trialTelemetry);
    setSessionTrials(prev => [...prev, trialTelemetry]);

    setLastTrialFeedback({
      isCorrect,
      targetSlotId,
      targetItemA,
      targetItemB,
      changeDescription: targetItemB?.changeDescription || { as: '', bn: '', hi: '', en: '' },
    });

    setPhase('FEEDBACK');
  };

  // Advance to Next Trial or Finish
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

  // Exit early
  const handleExitSession = () => {
    clearAllTimers();
    whatChangedAudio.stopAllSpeech();
    if (sessionTrials.length > 0) {
      const summary = engine.compileSessionSummary(sessionTrials, true);
      setFinalSessionSummary(summary);
      onSessionComplete?.(summary);
    }
    onExit?.();
  };

  // ─── Real-World OASIS Patient Simulation Runner ─────────────────────────────
  useEffect(() => {
    if (!isSimulatingPlayback) {
      if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
      setSimulatedGazeSlot(null);
      setSimulatedTremorBurstActive(false);
      return;
    }

    if (phase === 'STUDY') {
      const action = engine.simulateOasisPatientAction(
        selectedOasisPersona,
        { sceneA, sceneB, targetSlotId, changeType: difficulty.changeType },
        difficulty
      );
      setSimulationStatusMsg(`[STUDY] ${selectedOasisPersona.name} studying scene items (${(action.studyDurationActualMs / 1000).toFixed(1)}s)...`);

      // Simulated gaze saccade over study scene
      const gazeInterval = setInterval(() => {
        if (sceneA.length > 0) {
          const randSlot = sceneA[Math.floor(Math.random() * sceneA.length)].slotId;
          setSimulatedGazeSlot(randSlot);
        }
      }, 700);

      simulationTimerRef.current = setTimeout(() => {
        clearInterval(gazeInterval);
        setSimulatedGazeSlot(null);
        transitionToMaskAndDetection(sceneB, difficulty);
      }, action.studyDurationActualMs);

      return () => {
        clearInterval(gazeInterval);
        if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
      };
    }

    if (phase === 'DETECTION') {
      const action = engine.simulateOasisPatientAction(
        selectedOasisPersona,
        { sceneA, sceneB, targetSlotId, changeType: difficulty.changeType },
        difficulty
      );

      const note = action.clinicalObservation[language] || action.clinicalObservation.en;
      setSimulationStatusMsg(`[DETECTION] ${note}`);

      // Simulated visual search gaze scan
      const gazeInterval = setInterval(() => {
        if (sceneB.length > 0) {
          const randSlot = sceneB[Math.floor(Math.random() * sceneB.length)].slotId;
          setSimulatedGazeSlot(randSlot);
        }
      }, 850);

      // Replay peek if patient needs reassurance
      let replayTimer: ReturnType<typeof setTimeout> | null = null;
      if (action.usedReplay) {
        replayTimer = setTimeout(() => {
          handlePeekSceneA();
        }, 1200);
      }

      // Halo assistance trigger if patient is stuck
      let haloTimer: ReturnType<typeof setTimeout> | null = null;
      if (action.neededHaloAssistance) {
        haloTimer = setTimeout(() => {
          triggerAutoAssist(false);
        }, Math.min(3500, action.deliberationTimeMs * 0.6));
      }

      // Tremor burst simulation if persona exhibits motor tremor
      let tremorTimer: ReturnType<typeof setTimeout> | null = null;
      if (action.hasTremorJitter) {
        tremorTimer = setTimeout(() => {
          setSimulatedTremorBurstActive(true);
          const now = Date.now();
          engine.filterTremorTap(now);
          engine.filterTremorTap(now + 60);
          engine.filterTremorTap(now + 120);
          setTimeout(() => setSimulatedTremorBurstActive(false), 600);
        }, Math.max(800, action.deliberationTimeMs - 600));
      }

      simulationTimerRef.current = setTimeout(() => {
        clearInterval(gazeInterval);
        setSimulatedGazeSlot(action.selectedSlotId);
        setSelectedSlotId(action.selectedSlotId);

        setTimeout(() => {
          handleSubmitChoice(action.selectedSlotId);
        }, 450);
      }, action.deliberationTimeMs);

      return () => {
        clearInterval(gazeInterval);
        if (replayTimer) clearTimeout(replayTimer);
        if (haloTimer) clearTimeout(haloTimer);
        if (tremorTimer) clearTimeout(tremorTimer);
        if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
      };
    }

    if (phase === 'FEEDBACK') {
      setSimulationStatusMsg(`[FEEDBACK] ${selectedOasisPersona.name} finished Trial ${currentTrialIndex + 1}. Transitioning...`);
      simulationTimerRef.current = setTimeout(() => {
        handleNextOrFinish();
      }, 2400);

      return () => {
        if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
      };
    }

    if (phase === 'COMPLETE') {
      setIsSimulatingPlayback(false);
      setSimulationStatusMsg('Simulation complete. Clinical report generated.');
    }
  }, [
    isSimulatingPlayback,
    phase,
    currentTrialIndex,
    sceneA,
    sceneB,
    targetSlotId,
    difficulty,
    selectedOasisPersona,
    engine,
    language,
    transitionToMaskAndDetection,
  ]);

  // Toggle Mute
  const handleToggleMute = () => {
    const next = whatChangedAudio.toggleMute();
    setIsMuted(next);
  };

  // Grid style computation
  const gridStyle = useMemo(() => {
    const cols = difficulty.gridCols;
    if (cols === 2) return 'grid-cols-2 max-w-sm';
    if (cols === 3) return 'grid-cols-3 max-w-md';
    return 'grid-cols-3 sm:grid-cols-4 max-w-xl';
  }, [difficulty.gridCols]);

  const activeSceneToDisplay = isPeekingSceneA ? sceneA : phase === 'STUDY' ? sceneA : sceneB;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-7 max-w-5xl mx-auto space-y-6 animate-fadeIn select-none">
      
      {/* 1. TOP HEADER & ACCESSIBILITY CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 text-white flex items-center justify-center shadow-xs">
              <Eye className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.title[language]}
            </h2>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200">
              Tier {difficulty.tierLevel}: {difficulty.itemCount} Items ({difficulty.changeType.replace('_', ' ')})
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t.subtitle[language]}
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Scene {currentTrialIndex + 1} of {totalTrials}</span>
          </div>

          {/* AI TESTBED BUTTON */}
          <button
            onClick={() => setShowTestbed(!showTestbed)}
            className={`px-3 py-1.5 border font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 ${
              showTestbed
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>AI Testbed</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border text-slate-600 hover:text-slate-900 transition-all cursor-pointer ${
              isMuted ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Exit */}
          <button
            onClick={handleExitSession}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200 text-xs font-bold text-slate-600 transition-all cursor-pointer"
          >
            {t.exit[language]}
          </button>
        </div>
      </div>

      {/* 2. EXPANDABLE AI TESTBED DRAWER */}
      {showTestbed && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/60 space-y-4 animate-fadeIn shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                SIH 2026 AI Testbed: Rensink Change Blindness & Bayesian 2PL IRT Diagnostics
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              Active Latent Ability θ: {engine.getTheta().toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Gauge 1: Latent Ability Theta */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Latent Ability θ</span>
              <div className="text-xl font-black text-indigo-400">
                {engine.getTheta() >= 0 ? `+${engine.getTheta().toFixed(2)}` : engine.getTheta().toFixed(2)}
              </div>
              <p className="text-[10px] text-slate-400 leading-snug">Range [-3.0, +3.0]. Dynamic Item Difficulty $b$: {difficulty.itemDifficultyB.toFixed(2)}</p>
            </div>

            {/* Gauge 2: Items & Mask Flicker */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider">Flicker Mask Parameters</span>
              <div className="text-xl font-black text-emerald-400">
                {difficulty.itemCount} Items / {difficulty.maskDurationMs}ms Mask
              </div>
              <p className="text-[10px] text-slate-400 leading-snug">Study: {difficulty.studyDurationMs / 1000}s. Mode: {difficulty.changeType}</p>
            </div>

            {/* Gauge 3: Scaffolding Beacon */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] text-amber-300 uppercase font-bold tracking-wider">Golden Beacon Assist</span>
              <div className="text-sm font-black text-amber-300 capitalize">
                {isHaloVisible ? 'Spotlight Active' : 'Autonomous Search'}
              </div>
              <p className="text-[10px] text-slate-400 leading-snug">Auto-delay: {difficulty.haloDelayMs / 1000}s</p>
            </div>

            {/* Gauge 4: Hardware Tremor Guard */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">Tremor Debounce Guard</span>
              <div className="text-xl font-black text-purple-300">
                {engine.getTremorFilteredCount()} Taps Filtered
              </div>
              <p className="text-[10px] text-slate-400 leading-snug">400ms Debounce with Clock Skew Shield</p>
            </div>
          </div>

          {/* Testbed Interactive Controls */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-300">Direct Minimal Step Tier Force Override:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {WHAT_CHANGED_TIERS.map(t => (
                  <button
                    key={t.tierLevel}
                    onClick={() => {
                      clearAllTimers();
                      whatChangedAudio.stopAllSpeech();
                      if (manualTierOverride === t.tierLevel) {
                        initTrial(currentTrialIndex, t.tierLevel);
                      } else {
                        setManualTierOverride(t.tierLevel);
                      }
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      difficulty.tierLevel === t.tierLevel
                        ? 'bg-indigo-500 text-white ring-2 ring-indigo-300'
                        : 'bg-white/10 hover:bg-white/20 text-slate-300'
                    }`}
                  >
                    T{t.tierLevel} ({t.itemCount} items)
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Simulation Triggers */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400 font-bold">Simulate Response:</span>
              
              <button
                onClick={() => {
                  if (phase !== 'DETECTION') return;
                  setSelectedSlotId(targetSlotId);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold cursor-pointer"
              >
                ✓ Select Correct Changed Item
              </button>

              <button
                onClick={() => {
                  if (phase !== 'DETECTION') return;
                  const wrongSlot = sceneB.find(s => s.slotId !== targetSlotId)?.slotId;
                  if (wrongSlot !== undefined) setSelectedSlotId(wrongSlot);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold cursor-pointer"
              >
                ✕ Select Distractor Item
              </button>

              <button
                onClick={() => triggerAutoAssist(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold cursor-pointer"
              >
                ✨ Trigger Golden Spotlight Hint
              </button>
            </div>

            {/* Real-World OASIS Longitudinal Patient Simulation */}
            <div className="pt-3 border-t border-white/10 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  <span>Washington University OASIS-2 Real Patient Archetypes:</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {isSimulatingPlayback ? (
                    <button
                      onClick={() => {
                        setIsSimulatingPlayback(false);
                        setSimulationStatusMsg('Simulation halted by user.');
                      }}
                      className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer animate-pulse"
                    >
                      <Square className="w-3 h-3" />
                      <span>Stop Simulation</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsSimulatingPlayback(true);
                        setSimulationStatusMsg(`Initiating live simulation of ${selectedOasisPersona.name}...`);
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>▶ Run Real-World Gameplay Simulation</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Persona Selection Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {REAL_WORLD_OASIS_PERSONAS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedOasisPersona(p);
                      if (isSimulatingPlayback) {
                        setIsSimulatingPlayback(false);
                      }
                    }}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedOasisPersona.id === p.id
                        ? 'bg-sky-950/80 border-sky-400 ring-2 ring-sky-400/50 text-white'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{p.avatarIcon}</span>
                      <span className="font-bold text-[11px] truncate">{p.name.split(' ')[0]}</span>
                    </div>
                    <div className="mt-1 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>MMSE {p.mmse}</span>
                      <span className={`px-1 py-0.2 rounded font-black text-[9px] ${
                        p.cdr === 0 ? 'bg-emerald-950 text-emerald-300' : p.cdr <= 0.5 ? 'bg-amber-950 text-amber-300' : 'bg-rose-950 text-rose-300'
                      }`}>
                        CDR {p.cdr}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Persona Details Card */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-white">{selectedOasisPersona.name}</span>
                    <span className="text-[11px] text-sky-300 font-medium">Age {selectedOasisPersona.age} • {selectedOasisPersona.clinicalDiagnosis}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-300">Edu: {selectedOasisPersona.educationYears}y</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {selectedOasisPersona.clinicalNotes[language] || selectedOasisPersona.clinicalNotes.en}
                  </p>
                </div>

                <button
                  onClick={() => {
                    // Apply persona baseline to human play
                    clearAllTimers();
                    whatChangedAudio.stopAllSpeech();
                    let targetTier = 4;
                    if (selectedOasisPersona.cdr === 0.0 && selectedOasisPersona.tremorJitterProbability < 0.2) targetTier = 7;
                    else if (selectedOasisPersona.cdr === 0.5) targetTier = 4;
                    else if (selectedOasisPersona.cdr === 1.0) targetTier = 2;
                    else if (selectedOasisPersona.cdr >= 2.0) targetTier = 1;
                    else if (selectedOasisPersona.tremorJitterProbability > 0.5) targetTier = 5;

                    setManualTierOverride(targetTier);
                    initTrial(currentTrialIndex, targetTier);
                    setFeedbackBanner(`Applied ${selectedOasisPersona.name}'s baseline: Tier ${targetTier} configured.`);
                    setTimeout(() => setFeedbackBanner(null), 4000);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Play as this Persona</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2.5 LIVE OASIS RE-ENACTMENT STATUS RIBBON */}
      {isSimulatingPlayback && simulationStatusMsg && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-950 via-indigo-950 to-slate-900 border border-sky-400/60 text-white shadow-lg flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-black text-sky-300 shrink-0">Live Patient Simulation ({selectedOasisPersona.name.split(' ')[0]}):</span>
            <span className="font-medium text-slate-200">{simulationStatusMsg}</span>
          </div>
          <button
            onClick={() => {
              setIsSimulatingPlayback(false);
              setSimulationStatusMsg('Simulation stopped.');
            }}
            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-black cursor-pointer shrink-0 shadow-xs"
          >
            Halt
          </button>
        </div>
      )}

      {/* 3. LIVE AI ADAPTATION & REASONING BANNER */}
      {(aiLiveReasoning || feedbackBanner) && (
        <div className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all ${
          aiAdaptationFlash
            ? 'bg-gradient-to-r from-indigo-50 via-sky-50 to-indigo-100 border-indigo-400 text-indigo-950 shadow-md ring-2 ring-indigo-200 animate-pulse'
            : feedbackBanner
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">
                SIH 2026 Real-Time Bayesian DDA & Feature Binding
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
      <div className="min-h-[420px] flex flex-col justify-center items-center p-6 bg-slate-50/70 rounded-3xl border border-slate-200 relative overflow-hidden">
        
        {/* PHASE A: STUDY PHASE */}
        {phase === 'STUDY' && (
          <div className="text-center space-y-5 animate-fadeIn w-full max-w-2xl">
            <div className="flex items-center justify-between flex-wrap gap-2 px-2">
              <div className="flex items-center gap-2 text-indigo-950 font-black text-sm sm:text-base">
                <Eye className="w-5 h-5 text-indigo-600" />
                <span>{t.studyHeader[language]}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-600">
                  {Math.ceil(studyTimeRemainingMs / 1000)}s
                </span>
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-100"
                    style={{ width: `${(studyTimeRemainingMs / difficulty.studyDurationMs) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Cultural Wooden Display Arena */}
            <div className={`grid gap-3 sm:gap-4 mx-auto p-4 sm:p-6 bg-amber-50/40 rounded-3xl border-2 border-amber-200/80 shadow-inner ${gridStyle}`}>
              {sceneA.map(item => {
                const isGazeFocused = simulatedGazeSlot === item.slotId;
                return (
                  <div
                    key={item.slotId}
                    className={`h-24 sm:h-28 rounded-2xl flex flex-col items-center justify-center p-2 border-2 shadow-xs transition-all duration-300 relative ${item.color} ${
                      isGazeFocused ? 'ring-4 ring-sky-400 scale-105 shadow-md' : ''
                    }`}
                  >
                    {isGazeFocused && (
                      <span className="absolute -bottom-2 px-1.5 py-0.5 rounded-full bg-sky-600 text-white font-black text-[9px] shadow-sm flex items-center gap-0.5 animate-bounce z-10">
                        👁️ Gaze Scan
                      </span>
                    )}
                    <span className="text-3xl sm:text-4xl mb-1 select-none">{item.icon}</span>
                    <span className="text-[10px] sm:text-xs font-extrabold text-center leading-tight line-clamp-1">
                      {item.name[language]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Skip ahead button for confident patients */}
            <div className="pt-2">
              <button
                onClick={() => transitionToMaskAndDetection(sceneB, difficulty)}
                className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs transition-all cursor-pointer active:scale-95 inline-flex items-center gap-1.5"
              >
                <span>{t.readyBtn[language]}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PHASE B: FLICKER MASK PHASE */}
        {phase === 'MASK' && (
          <div className="w-full h-72 flex items-center justify-center animate-pulse bg-slate-300/80 rounded-3xl">
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">
              • • •
            </span>
          </div>
        )}

        {/* PHASE C: DETECTION PHASE */}
        {phase === 'DETECTION' && (
          <div className="text-center space-y-5 animate-fadeIn w-full max-w-2xl">
            <div className="flex items-center justify-between flex-wrap gap-2 px-2">
              <div className="flex items-center gap-2 text-indigo-950 font-black text-sm sm:text-base">
                <Target className="w-5 h-5 text-indigo-600" />
                <span>{t.detectHeader[language]}</span>
              </div>

              {isPeekingSceneA && (
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black animate-pulse">
                  👁️ Peeking at Original Scene A
                </span>
              )}
            </div>

            {/* Interactive Grid */}
            <div className={`grid gap-3 sm:gap-4 mx-auto p-4 sm:p-6 bg-amber-50/40 rounded-3xl border-2 border-amber-200/80 shadow-inner ${gridStyle}`}>
              {activeSceneToDisplay.map(item => {
                const isSelected = selectedSlotId === item.slotId;
                const isTargetSpot = item.slotId === targetSlotId;
                const shouldHaloGlow = isHaloVisible && isTargetSpot;
                const isGazeFocused = simulatedGazeSlot === item.slotId;
                const isTremorShaking = simulatedTremorBurstActive && isSelected;

                return (
                  <button
                    key={item.slotId}
                    onClick={() => handleSlotTap(item.slotId)}
                    style={{ transform: `rotate(${item.rotationDeg}deg)` }}
                    className={`h-24 sm:h-28 rounded-2xl flex flex-col items-center justify-center p-2 border-2 shadow-xs transition-all cursor-pointer active:scale-95 relative ${
                      item.color
                    } ${
                      isSelected
                        ? 'ring-4 ring-indigo-500 scale-105 border-indigo-600 shadow-md bg-white'
                        : 'hover:scale-102 hover:border-indigo-300'
                    } ${
                      shouldHaloGlow
                        ? 'ring-4 ring-amber-400 border-amber-500 shadow-lg animate-pulse'
                        : ''
                    } ${
                      isGazeFocused
                        ? 'ring-4 ring-sky-400 scale-105'
                        : ''
                    }`}
                  >
                    {/* Golden Halo Spotlight Beacon */}
                    {shouldHaloGlow && (
                      <span className="absolute -top-2.5 -right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-black text-[9px] shadow-sm flex items-center gap-0.5 z-10">
                        <Sparkles className="w-2.5 h-2.5" />
                        Hint
                      </span>
                    )}

                    {/* Simulated Patient Gaze Focus */}
                    {isGazeFocused && (
                      <span className="absolute -bottom-2.5 px-1.5 py-0.5 rounded-full bg-sky-600 text-white font-black text-[9px] shadow-sm flex items-center gap-0.5 animate-bounce z-10">
                        👁️ Gaze Focus
                      </span>
                    )}

                    {/* Tremor Filter Ripple */}
                    {isTremorShaking && (
                      <span className="absolute -top-2.5 -left-2 px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[9px] shadow-sm flex items-center gap-0.5 animate-pulse z-10">
                        ⚡ Tremor Filter
                      </span>
                    )}

                    <span className="text-3xl sm:text-4xl mb-1 select-none">
                      {item.icon || '❓'}
                    </span>
                    <span className="text-[10px] sm:text-xs font-extrabold text-center leading-tight line-clamp-1">
                      {item.name[language] || 'Empty Slot'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Auxiliary Actions & Submit Row */}
            <div className="flex items-center justify-between flex-wrap gap-3 max-w-md mx-auto pt-2">
              
              {/* Peek Back Button */}
              {difficulty.maxReplayPeeksAllowed > 0 && (
                <button
                  onClick={handlePeekSceneA}
                  disabled={replaysUsedThisTrial >= difficulty.maxReplayPeeksAllowed}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    replaysUsedThisTrial < difficulty.maxReplayPeeksAllowed
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                      : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.peekBtn[language]} ({difficulty.maxReplayPeeksAllowed - replaysUsedThisTrial})</span>
                </button>
              )}

              {/* Dignity Hint Button */}
              <button
                onClick={() => triggerAutoAssist(true)}
                disabled={isHaloVisible}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  !isHaloVisible
                    ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200 shadow-2xs'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{t.helpBtn[language]}</span>
              </button>

              {/* Submit Button */}
              <button
                onClick={() => handleSubmitChoice()}
                disabled={selectedSlotId === null}
                className={`px-5 py-2 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedSlotId !== null
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95 ring-2 ring-indigo-300'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                <span>{t.submitBtn[language]}</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PHASE D: TRIAL FEEDBACK */}
        {phase === 'FEEDBACK' && lastTrialFeedback && (
          <div className="text-center space-y-5 animate-fadeIn max-w-md w-full">
            <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-lg ${
              lastTrialFeedback.isCorrect ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' : 'bg-rose-100 text-rose-700 border-2 border-rose-300'
            }`}>
              {lastTrialFeedback.isCorrect ? <CheckCircle2 className="w-10 h-10" /> : <X className="w-10 h-10" />}
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">
                {lastTrialFeedback.isCorrect
                  ? (language === 'as' ? 'শুদ্ধ হৈছে! অপূৰ্ব!' : language === 'bn' ? 'সঠিক হয়েছে! চমৎকার!' : language === 'hi' ? 'बिल्कुल सही! बहुत बढ़िया!' : 'Correct! Excellent Eye!')
                  : (language === 'as' ? 'পৰিৱৰ্তনটো লক্ষ্য কৰক' : language === 'bn' ? 'পরিবর্তনটি লক্ষ্য করুন' : language === 'hi' ? 'बदलाव पर ध्यान दें' : 'Here was the exact change:')}
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed px-4">
                {lastTrialFeedback.changeDescription[language] || lastTrialFeedback.changeDescription.en}
              </p>
            </div>

            {/* Before and After Visual Comparison */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-center gap-4 text-xs font-bold">
              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase text-slate-400 font-black block">Scene A</span>
                <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl mx-auto">
                  {lastTrialFeedback.targetItemA?.icon || '—'}
                </div>
                <span className="text-[10px] text-slate-600 line-clamp-1 max-w-[80px]">
                  {lastTrialFeedback.targetItemA?.name[language]}
                </span>
              </div>

              <ArrowRight className="w-5 h-5 text-indigo-400" />

              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase text-indigo-600 font-black block">Scene B (Changed)</span>
                <div className="w-16 h-16 rounded-xl bg-indigo-50 border-2 border-indigo-400 flex items-center justify-center text-3xl mx-auto shadow-xs">
                  {lastTrialFeedback.targetItemB?.icon || '—'}
                </div>
                <span className="text-[10px] text-indigo-900 font-black line-clamp-1 max-w-[80px]">
                  {lastTrialFeedback.targetItemB?.name[language] || 'Disappeared'}
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900">
                {language === 'as' ? 'অনুশীলন সম্পূৰ্ণ হ’ল!' : language === 'bn' ? 'অনুশীলন সম্পূর্ণ হলো!' : language === 'hi' ? 'सत्र सफलतापूर्वक पूरा हुआ!' : 'Assessment Complete!'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Rensink Change Blindness & Ventral Visual Stream Feature Binding
              </p>
            </div>

            {/* 6-Grid Clinical Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
              
              {/* Card 1: MoCA Visual Attention */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">MoCA Visual Attention</span>
                <div className="text-2xl font-black text-indigo-700">
                  {finalSessionSummary.estimatedMoCAVisualScore} <span className="text-xs text-slate-400 font-bold">/ 5</span>
                </div>
                <p className="text-[10px] text-slate-500">Visuospatial attention equivalent</p>
              </div>

              {/* Card 2: Feature Binding */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Feature Binding</span>
                <div className="text-2xl font-black text-emerald-700">
                  {finalSessionSummary.featureBindingScore}%
                </div>
                <p className="text-[10px] text-slate-500">Color & object replacement</p>
              </div>

              {/* Card 3: Spatial Binding */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Spatial Binding</span>
                <div className="text-2xl font-black text-amber-700">
                  {finalSessionSummary.spatialBindingScore}%
                </div>
                <p className="text-[10px] text-slate-500">Coordinates & rotation</p>
              </div>

              {/* Card 4: Change Blindness */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Blindness Index</span>
                <div className="text-sm font-black text-slate-900 capitalize">
                  {finalSessionSummary.changeBlindnessIndex.replace(/_/g, ' ')}
                </div>
                <p className="text-[10px] text-slate-500">Flicker mask resilience</p>
              </div>

              {/* Card 5: Ventral Stream */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Ventral Stream</span>
                <div className="text-sm font-black text-slate-900 capitalize">
                  {finalSessionSummary.ventralStreamBinding.replace(/_/g, ' ')}
                </div>
                <p className="text-[10px] text-slate-500">Occipitotemporal pathway</p>
              </div>

              {/* Card 6: Autonomy */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Settings Autonomy</span>
                <div className="text-2xl font-black text-purple-700">
                  {finalSessionSummary.autonomyScore}%
                </div>
                <p className="text-[10px] text-slate-500 capitalize">{finalSessionSummary.patientSettingsAutonomyRating.replace(/_/g, ' ')}</p>
              </div>
            </div>

            {/* OASIS-2 Trained Machine Learning Cognitive Staging Card */}
            {finalSessionSummary.oasisClinicalClassification && (
              <div className="p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-2xl text-white text-left space-y-2.5 border border-indigo-500/40 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                      OASIS-2 Machine Learning Cognitive Staging
                    </span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-emerald-300 border border-emerald-400/30">
                    {(finalSessionSummary.oasisClinicalClassification.confidenceScore * 100).toFixed(1)}% Confidence
                  </span>
                </div>

                <div className="text-lg font-black text-white flex items-center gap-2">
                  <span>{finalSessionSummary.oasisClinicalClassification.predictedClass}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <span>Standardized MoCA Score Range:</span>
                  <span className="font-bold text-amber-300">{finalSessionSummary.oasisClinicalClassification.estimatedMoCARange}</span>
                </div>

                {finalSessionSummary.oasisClinicalClassification.clinicalAlert && (
                  <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs leading-snug">
                    ⚠️ {finalSessionSummary.oasisClinicalClassification.clinicalAlert}
                  </div>
                )}
              </div>
            )}

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
