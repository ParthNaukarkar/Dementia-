import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  Brain, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  AlertCircle, 
  Sliders, 
  ShieldCheck, 
  Eye, 
  HelpCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  MemoryMatchEngine, 
  MEMORY_MATCH_TIERS 
} from './engine';
import { memoryMatchAudio } from './audio';
import type { 
  CardItem, 
  MemoryMatchProps, 
  MemoryMatchDifficulty, 
  MemoryMatchSettingsSnapshot, 
  MemoryMatchRoundTelemetry, 
  MemoryMatchSessionSummary,
  FlipEvent,
  AIDynamicAction
} from './types';
import type { AssistanceProfileConfig } from '../../engine/adaptive-assistance';

export const MemoryMatch: React.FC<MemoryMatchProps> = ({
  language = 'as',
  totalRounds = 3,
  initialTheta = 0.0,
  onRoundComplete,
  onSessionComplete,
  onExit,
}) => {
  // Engine instance
  const engine = useMemo(() => new MemoryMatchEngine(initialTheta, totalRounds), [initialTheta, totalRounds]);

  // Round & Tier States
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [currentTier, setCurrentTier] = useState<MemoryMatchDifficulty>(() => engine.getCurrentTier());
  const [manualTierOverride, setManualTierOverride] = useState<number | null>(null);

  // Deck & Gameplay States
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);
  const [totalFlips, setTotalFlips] = useState(0);
  const [mismatches, setMismatches] = useState(0);
  const [perseverations, setPerseverations] = useState(0);
  const [exploratoryErrors, setExploratoryErrors] = useState(0);
  const [firstTrialCorrectCount, setFirstTrialCorrectCount] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  // Phase & Preview Study States
  const [isInPreviewPhase, setIsInPreviewPhase] = useState(false);
  const [previewSecondsRemaining, setPreviewSecondsRemaining] = useState(0);
  const [previewStudyEnabled, setPreviewStudyEnabled] = useState(true);

  // Patient Settings & Autonomy Tracking
  const [proactiveHelpRequested, setProactiveHelpRequested] = useState(false);
  const [wasAutoAssisted, setWasAutoAssisted] = useState(false);
  const [autoAssistedPairsCount, setAutoAssistedPairsCount] = useState(0);
  const [lastAutonomyScore, setLastAutonomyScore] = useState<number>(100);

  // Audio & SIH Diagnostics Drawer
  const [isMuted, setIsMuted] = useState(false);
  const [showJudgeControls, setShowJudgeControls] = useState(false);
  const [tremorDebounceMs, setTremorDebounceMs] = useState(400);

  // Telemetry references
  const roundStartTimeRef = useRef<number>(Date.now());
  const lastActionTimeRef = useRef<number>(Date.now());
  const seenCardIdsRef = useRef<Set<string>>(new Set());
  const pairAttemptHistoryRef = useRef<Map<string, number>>(new Map()); // pairKey -> attempts count
  const flipEventsRef = useRef<FlipEvent[]>([]);
  const roundTelemetryListRef = useRef<MemoryMatchRoundTelemetry[]>([]);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAssistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live AI Adaptation Messaging & Dynamic Scaffolding
  const [aiLiveReasoning, setAiLiveReasoning] = useState<string>('');
  const [aiAdaptationFlash, setAiAdaptationFlash] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [aiDynamicActions, setAiDynamicActions] = useState<AIDynamicAction[]>([]);
  const [activeAssistPairKey, setActiveAssistPairKey] = useState<string | null>(null);
  const [dimmedCardIds, setDimmedCardIds] = useState<string[]>([]);
  const [liveAssistanceProfile, setLiveAssistanceProfile] = useState<AssistanceProfileConfig>(() =>
    engine.deriveAssistanceProfile(0, 100, 0)
  );

  // Localized UI Dictionary
  const t = {
    as: {
      title: 'ছবিৰ যোৰা (Memory Match)',
      subtitle: 'CANTAB সহযোগী স্মৃতি আৰু স্থানিক সংযোগ মূল্যায়ন',
      studyHeading: 'মন দি লক্ষ্য কৰক: কাৰ্ডবোৰৰ ছবি মনত ৰাখক',
      studySub: 'আপুনি সাজু হ’লে তলৰ সেউজীয়া বুটামত টিপক।',
      startNow: 'মই চাই ললোঁ, খেল আৰম্ভ কৰক ➔',
      pairsMatched: (matched: number, total: number) => `যোৰা মিলিল: ${matched} / ${total}`,
      accuracy: 'শুদ্ধতা',
      tapToFlip: 'স্পৰ্শ কৰক',
      nextRound: 'পৰৱৰ্তী ৰাউণ্ড (Next Round) ➔',
      viewReport: 'চিকিৎসা প্ৰতিবেদন চাওক (View Report)',
      autoAssistPrompt: 'AI সহায়: মিল থকা কাৰ্ড দুখন আলোকিত কৰা হৈছে।',
      ftcLabel: 'প্ৰথমবাৰতেই শুদ্ধ',
      perseverationLabel: 'পুনৰাবৃত্তিমূলক ভুল',
      entropyLabel: 'স্থানিক অন্বেষণ এন্ট্ৰপি',
      autonomyLabel: 'স্বায়ত্তশাসন সূচক',
    },
    bn: {
      title: 'ছবির জোড়া (Memory Match)',
      subtitle: 'CANTAB সহযোগী স্মৃতি ও স্থানিক সংযোগ মূল্যায়ন',
      studyHeading: 'মন দিয়ে দেখুন: কার্ডগুলোর ছবি মনে রাখুন',
      studySub: 'প্রস্তুত হলে নিচের সবুজ বোতামে চাপ দিন।',
      startNow: 'আমি দেখে নিয়েছি, খেলা শুরু করুন ➔',
      pairsMatched: (matched: number, total: number) => `জোড়া মিলল: ${matched} / ${total}`,
      accuracy: 'সঠিকতা',
      tapToFlip: 'স্পর্শ করুন',
      nextRound: 'পরবর্তী রাউন্ড (Next Round) ➔',
      viewReport: 'ক্লিনিক্যাল রিপোর্ট দেখুন (View Report)',
      autoAssistPrompt: 'AI সাহায্য: ম্যাচিং কার্ড দুটি চিহ্নিত করা হয়েছে।',
      ftcLabel: 'প্রথম প্রচেষ্টায় সঠিক',
      perseverationLabel: 'পুনরাবৃত্তিমূলক ভুল',
      entropyLabel: 'স্থানিক অনুসন্ধান এন্ট্রপি',
      autonomyLabel: 'স্বায়ত্তশাসন সূচক',
    },
    hi: {
      title: 'स्मृति युग्म (Memory Match)',
      subtitle: 'CANTAB संबद्ध स्मृति एवं स्थानिक संयोजन मूल्यांकन',
      studyHeading: 'ध्यान से देखें: कार्डों के चित्र याद रखें',
      studySub: 'तैयार होने पर नीचे का हरा बटन दबाएं।',
      startNow: 'मैंने देख लिया, खेल शुरू करें ➔',
      pairsMatched: (matched: number, total: number) => `जोड़ियां मिलीं: ${matched} / ${total}`,
      accuracy: 'सटीकता',
      tapToFlip: 'स्पर्श करें',
      nextRound: 'अगला राउंड (Next Round) ➔',
      viewReport: 'चिकित्सीय रिपोर्ट देखें (View Report)',
      autoAssistPrompt: 'AI सहायता: सही जोड़ी वाले कार्डों को चमकाया गया है।',
      ftcLabel: 'प्रथम प्रयास में सही',
      perseverationLabel: 'पुनरावृत्ति त्रुटियां',
      entropyLabel: 'स्थानिक खोज एंट्रॉपी',
      autonomyLabel: 'स्वायत्तता स्कोर',
    },
    en: {
      title: 'Memory Match (Paired Associates)',
      subtitle: 'CANTAB Paired Associates Learning & Spatial Memory Span',
      studyHeading: 'Study Closely: Remember the picture locations',
      studySub: 'Cards will flip over shortly. Tap the button when ready.',
      startNow: 'I Am Ready, Begin ➔',
      pairsMatched: (matched: number, total: number) => `Pairs Matched: ${matched} / ${total}`,
      accuracy: 'Accuracy',
      tapToFlip: 'Tap',
      nextRound: 'Next Round ➔',
      viewReport: 'View Clinical Report',
      autoAssistPrompt: 'AI Scaffolding: Matching cards gently highlighted to assist recall.',
      ftcLabel: 'First-Trial Correct',
      perseverationLabel: 'Perseverative Errors',
      entropyLabel: 'Search Pattern Entropy',
      autonomyLabel: 'Autonomy Index',
    },
  }[language] || {
    title: 'Memory Match (Paired Associates)',
    subtitle: 'CANTAB Paired Associates Learning & Spatial Memory Span',
    studyHeading: 'Study Closely: Remember the picture locations',
    studySub: 'Cards will flip over shortly. Tap the button when ready.',
    startNow: 'I Am Ready, Begin ➔',
    pairsMatched: (matched: number, total: number) => `Pairs Matched: ${matched} / ${total}`,
    accuracy: 'Accuracy',
    tapToFlip: 'Tap',
    nextRound: 'Next Round ➔',
    viewReport: 'View Clinical Report',
    autoAssistPrompt: 'AI Scaffolding: Matching cards gently highlighted to assist recall.',
    ftcLabel: 'First-Trial Correct',
    perseverationLabel: 'Perseverative Errors',
    entropyLabel: 'Search Pattern Entropy',
    autonomyLabel: 'Autonomy Index',
  };

  /**
   * Initialize or Reset Round
   */
  const initRound = useCallback((roundIdx: number, overrideTierIdx?: number | null) => {
    let diff: MemoryMatchDifficulty;
    if (overrideTierIdx !== null && overrideTierIdx !== undefined) {
      diff = engine.getTierByIndex(overrideTierIdx);
      engine.setTierIndex(overrideTierIdx);
    } else {
      diff = engine.getCurrentTier();
    }

    setCurrentTier(diff);
    setCurrentRoundIdx(roundIdx);

    // Generate balanced randomized deck
    const deck = engine.generateDeck(diff);
    setCards(deck);
    setFlippedCardIds([]);
    setMatchedPairsCount(0);
    setTotalFlips(0);
    setMismatches(0);
    setPerseverations(0);
    setExploratoryErrors(0);
    setFirstTrialCorrectCount(0);
    setIsEvaluating(false);
    setIsCompleted(false);
    setWasAutoAssisted(false);
    setAutoAssistedPairsCount(0);
    setActiveAssistPairKey(null);
    setDimmedCardIds([]);
    setFeedbackBanner(null);
    setAiDynamicActions([]);

    seenCardIdsRef.current.clear();
    pairAttemptHistoryRef.current.clear();
    flipEventsRef.current = [];
    roundStartTimeRef.current = Date.now();
    lastActionTimeRef.current = Date.now();

    // Check if Preview Study Phase should execute
    if (previewStudyEnabled && diff.previewTimeMs > 0) {
      setIsInPreviewPhase(true);
      const totalSec = Math.ceil(diff.previewTimeMs / 1000);
      setPreviewSecondsRemaining(totalSec);

      memoryMatchAudio.speakGuidance('preview', language);

      let remaining = totalSec;
      const interval = setInterval(() => {
        remaining -= 1;
        setPreviewSecondsRemaining(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          finishPreviewPhase();
        }
      }, 1000);

      previewTimerRef.current = interval as unknown as ReturnType<typeof setTimeout>;
    } else {
      setIsInPreviewPhase(false);
      memoryMatchAudio.speakGuidance('intro', language);
      scheduleAutoAssist();
    }
  }, [engine, previewStudyEnabled, language]);

  /**
   * Transition from Preview Phase to Active Recall
   */
  const finishPreviewPhase = () => {
    if (previewTimerRef.current) {
      clearInterval(previewTimerRef.current as unknown as number);
      previewTimerRef.current = null;
    }
    setIsInPreviewPhase(false);
    lastActionTimeRef.current = Date.now();
    scheduleAutoAssist();
  };

  /**
   * Schedule Patient-Profile Adaptive Dignity Auto-Assist
   */
  const scheduleAutoAssist = useCallback(() => {
    if (autoAssistTimerRef.current) {
      clearTimeout(autoAssistTimerRef.current);
      autoAssistTimerRef.current = null;
    }

    // Derive profile
    const accuracy = totalFlips > 0 ? Math.round(((matchedPairsCount * 2) / totalFlips) * 100) : 100;
    const idleMs = Date.now() - lastActionTimeRef.current;
    const profileConfig = engine.deriveAssistanceProfile(mismatches, accuracy, idleMs);
    setLiveAssistanceProfile(profileConfig);

    autoAssistTimerRef.current = setTimeout(() => {
      triggerAdaptiveAssistance(profileConfig);
    }, profileConfig.assistTimeoutMs);
  }, [engine, totalFlips, matchedPairsCount, mismatches]);

  /**
   * Execute profile-adaptive assistance intervention
   */
  const triggerAdaptiveAssistance = (profileConfig: AssistanceProfileConfig, isManual: boolean = false) => {
    if (isCompleted || isEvaluating) return;

    if (isManual) {
      setProactiveHelpRequested(true);
    }

    setWasAutoAssisted(true);
    setAutoAssistedPairsCount(c => c + 1);

    // Find unmatched cards (or prioritize the matching partner of already-flipped card)
    const unmatched = cards.filter(c => !c.isMatched);
    if (unmatched.length === 0) return;
    const flippedCard = flippedCardIds.length > 0 ? cards.find(c => c.id === flippedCardIds[0]) : null;
    const assistTarget = flippedCard ? flippedCard : unmatched[0];
    const targetKey = assistTarget.pairKey;

    if (profileConfig.scaffoldingLevel === 'direct_beacon') {
      // Level 3: Direct pair beacon highlight
      setActiveAssistPairKey(targetKey);
      memoryMatchAudio.playAutoAssistChime();
      memoryMatchAudio.speakGuidance('assist', language);
      setFeedbackBanner(t.autoAssistPrompt);
      setTimeout(() => setFeedbackBanner(null), 4000);

      setAiDynamicActions(prev => [
        ...prev,
        {
          type: 'pair_beacon',
          timestamp: Date.now(),
          rationale: profileConfig.clinicalRationale,
          cardsAffected: 2,
        }
      ]);
    } else if (profileConfig.scaffoldingLevel === 'contextual_reduction') {
      // Level 2: Dim out 2 non-matching distractor cards temporarily
      const distractors = unmatched.filter(c => c.pairKey !== targetKey).slice(0, 2).map(c => c.id);
      setDimmedCardIds(distractors);
      setActiveAssistPairKey(targetKey);
      memoryMatchAudio.playAutoAssistChime();
      const dimMsg = {
        en: 'AI Live Assist: Dimmed non-matching cards to focus your gaze.',
        as: 'AI সহায়: চকুৰ দৃষ্টি কেন্দ্ৰীভূত কৰিবলৈ অমিল কাৰ্ডবোৰ ধূসৰ কৰা হ’ল।',
        bn: 'AI সহায়তা: দৃষ্টি নিবদ্ধ করতে অমিল কার্ডগুলি আবছা করা হলো।',
        hi: 'AI सहायता: ध्यान केंद्रित करने के लिए बेमेल कार्डों को धुंधला कर दिया गया है।',
      };
      setFeedbackBanner(dimMsg[language] || dimMsg.en);
      setTimeout(() => {
        setFeedbackBanner(null);
        setDimmedCardIds([]);
      }, 5000);

      setAiDynamicActions(prev => [
        ...prev,
        {
          type: 'distractor_dim',
          timestamp: Date.now(),
          rationale: profileConfig.clinicalRationale,
          cardsAffected: distractors.length,
        }
      ]);
    } else if (profileConfig.scaffoldingLevel === 'motor_stabilization') {
      // Motor profile: Reassure patient, keep generous touch windows
      memoryMatchAudio.playAutoAssistChime();
      setFeedbackBanner('🛡️ Motor stabilization active. Take all the time you need to tap.');
      setTimeout(() => setFeedbackBanner(null), 4500);

      setAiDynamicActions(prev => [
        ...prev,
        {
          type: 'pace_reassurance',
          timestamp: Date.now(),
          rationale: profileConfig.clinicalRationale,
        }
      ]);
    } else {
      // Level 1: Subtle Cue
      setActiveAssistPairKey(targetKey);
      const hintMsg = {
        en: '💡 Hint: One matching pair has been gently illuminated.',
        as: '💡 সংকেত: এটা মিল থকা যোৰা মৃদুভাৱে উজ্বলাই তোলা হৈছে।',
        bn: '💡 ইঙ্গিত: একটি মিল থাকা জোড়া মৃদুভাবে আলোকিত করা হয়েছে।',
        hi: '💡 संकेत: एक मेल खाता हुआ जोड़ा धीरे से चमकाया गया है।',
      };
      setFeedbackBanner(hintMsg[language] || hintMsg.en);
      setTimeout(() => setFeedbackBanner(null), 3500);
    }

    // Re-arm auto assist timer so if patient remains stuck in later half, guidance continues
    if (autoAssistTimerRef.current) clearTimeout(autoAssistTimerRef.current);
    autoAssistTimerRef.current = setTimeout(() => {
      triggerAdaptiveAssistance(profileConfig);
    }, Math.min(8000, profileConfig.assistTimeoutMs));
  };

  // Mount & Tier Initialization
  useEffect(() => {
    initRound(currentRoundIdx, manualTierOverride);
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      if (autoAssistTimerRef.current) clearTimeout(autoAssistTimerRef.current);
    };
  }, [currentRoundIdx, manualTierOverride, initRound]);

  /**
   * Handle Card Tap with Hardware Tremor Filter
   */
  const handleCardClick = (cardId: string) => {
    if (isInPreviewPhase || isEvaluating || isCompleted) return;

    // Apply hardware tremor filter
    if (!engine.filterTremorTap(tremorDebounceMs)) {
      return; // Suppress double-tap tremor
    }

    const now = Date.now();
    const deliberation = now - lastActionTimeRef.current;
    lastActionTimeRef.current = now;
    engine.recordLatency(deliberation);

    const targetCard = cards.find(c => c.id === cardId);
    if (!targetCard || targetCard.isFlipped || targetCard.isMatched) return;

    // Reset auto-assist glow if user tapped
    setActiveAssistPairKey(null);
    setDimmedCardIds([]);
    scheduleAutoAssist();

    memoryMatchAudio.playCardFlip();

    const nextFlippedIds = [...flippedCardIds, cardId];
    setFlippedCardIds(nextFlippedIds);
    setTotalFlips(prev => prev + 1);

    // Track card flip state
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c));

    // Evaluate match when 2 cards are face up
    if (nextFlippedIds.length === 2) {
      setIsEvaluating(true);
      const [firstId, secondId] = nextFlippedIds;
      const card1 = cards.find(c => c.id === firstId)!;
      const card2 = targetCard;

      const isMatch = card1.pairKey === card2.pairKey;
      const priorAttempts = pairAttemptHistoryRef.current.get(card1.pairKey) || 0;
      pairAttemptHistoryRef.current.set(card1.pairKey, priorAttempts + 1);

      // Record flip events for CANTAB spatial entropy & error taxonomy
      const isCard1Seen = seenCardIdsRef.current.has(firstId);
      const isCard2Seen = seenCardIdsRef.current.has(secondId);
      const isPerseveration = !isMatch && (isCard1Seen || isCard2Seen);

      const flip1: FlipEvent = {
        cardId: firstId,
        pairKey: card1.pairKey,
        timestamp: now - deliberation,
        deliberationMs: deliberation,
        isMatch,
        isPerseveration,
        gridRow: card1.gridRow,
        gridCol: card1.gridCol,
      };
      const flip2: FlipEvent = {
        cardId: secondId,
        pairKey: card2.pairKey,
        timestamp: now,
        deliberationMs: 250,
        isMatch,
        isPerseveration,
        gridRow: card2.gridRow,
        gridCol: card2.gridCol,
      };
      flipEventsRef.current.push(flip1, flip2);

      if (isMatch) {
        // Match found!
        memoryMatchAudio.playPairMatch();
        memoryMatchAudio.speakItemName(card1.names[language], language);

        // Check if First-Trial Correct
        if (priorAttempts === 0) {
          setFirstTrialCorrectCount(c => c + 1);
        }

        setTimeout(() => {
          const updatedCards = cards.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true, isFlipped: true } 
              : c
          );
          setCards(updatedCards);
          setFlippedCardIds([]);
          setIsEvaluating(false);

          const nextMatched = matchedPairsCount + 1;
          setMatchedPairsCount(nextMatched);

          // Check if round complete
          if (nextMatched === currentTier.pairCount) {
            handleRoundComplete(updatedCards);
          } else {
            scheduleAutoAssist();
          }
        }, 500);

      } else {
        // Mismatch!
        memoryMatchAudio.playMismatchTone();
        setMismatches(m => m + 1);

        if (isPerseveration) {
          setPerseverations(p => p + 1);
        } else {
          setExploratoryErrors(e => e + 1);
        }

        seenCardIdsRef.current.add(firstId);
        seenCardIdsRef.current.add(secondId);

        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedCardIds([]);
          setIsEvaluating(false);
          scheduleAutoAssist();
        }, currentTier.cardFlipBackDelayMs);
      }
    }
  };

  /**
   * Handle Round Completion & Bayesian IRT DDA Step
   */
  const handleRoundComplete = (_solvedCards: CardItem[]) => {
    setIsCompleted(true);
    if (autoAssistTimerRef.current) clearTimeout(autoAssistTimerRef.current);

    memoryMatchAudio.playRoundComplete();
    memoryMatchAudio.speakGuidance('complete', language);

    try {
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
    } catch {}

    const solveTimeSec = Math.round((Date.now() - roundStartTimeRef.current) / 1000);
    const spatialEntropy = engine.calculateSpatialEntropy(
      flipEventsRef.current, 
      currentTier.gridCols, 
      currentTier.gridRows
    );

    // Settings Snapshot
    const settingsSnapshot: MemoryMatchSettingsSnapshot = {
      previewStudyEnabled,
      previewTimeMs: currentTier.previewTimeMs,
      audioMuted: isMuted,
      proactiveHelpRequested,
      isManualTierOverride: manualTierOverride !== null,
    };

    // Update IRT Theta
    const { newTheta, autonomyScore, reasoning } = engine.updateTheta(
      currentTier.pairCount,
      totalFlips,
      perseverations,
      firstTrialCorrectCount,
      wasAutoAssisted,
      settingsSnapshot
    );

    setLastAutonomyScore(autonomyScore);
    const rationaleText = reasoning[language] || reasoning.en;
    setAiLiveReasoning(rationaleText);
    setAiAdaptationFlash(true);
    setTimeout(() => setAiAdaptationFlash(false), 5000);

    // Total Errors Adjusted (TEA)
    const tea = mismatches + Math.max(0, currentTier.tier - 3) * 0.5;

    // Mean Latency
    const meanLatency = flipEventsRef.current.length > 0
      ? Math.round(flipEventsRef.current.reduce((a, b) => a + b.deliberationMs, 0) / flipEventsRef.current.length)
      : 2200;

    const roundTelemetry: MemoryMatchRoundTelemetry = {
      roundIndex: currentRoundIdx + 1,
      tier: currentTier.tier,
      pairCount: currentTier.pairCount,
      totalCards: currentTier.totalCards,
      totalFlips,
      firstTrialCorrect: firstTrialCorrectCount,
      perseverativeErrors: perseverations,
      exploratoryErrors,
      totalErrorsAdjusted: Number(tea.toFixed(1)),
      searchPatternEntropy: spatialEntropy,
      meanLatencyMs: meanLatency,
      solveTimeSeconds: solveTimeSec,
      autonomyScore,
      wasAutoAssisted,
      autoAssistedPairsCount,
      assistanceProfile: liveAssistanceProfile.profile,
      flips: [...flipEventsRef.current],
      settingsSnapshot,
      aiDynamicActions,
      theta: newTheta,
      completedAt: new Date().toISOString(),
    };

    roundTelemetryListRef.current.push(roundTelemetry);
    if (onRoundComplete) {
      onRoundComplete(roundTelemetry);
    }
  };

  /**
   * Next Round or Complete Full Session
   */
  const handleProceedNext = () => {
    if (engine.getRoundIndex() + 1 >= totalRounds) {
      // Full session complete
      handleFinalizeSession();
    } else {
      engine.advanceRound();
      initRound(engine.getRoundIndex(), manualTierOverride);
    }
  };

  /**
   * Finalize multi-round session summary
   */
  const handleFinalizeSession = () => {
    setIsSessionFinished(true);

    const rounds = roundTelemetryListRef.current;
    const totalFlipsAll = rounds.reduce((sum, r) => sum + r.totalFlips, 0);
    const totalFTC = rounds.reduce((sum, r) => sum + r.firstTrialCorrect, 0);
    const totalPersev = rounds.reduce((sum, r) => sum + r.perseverativeErrors, 0);
    const totalExpl = rounds.reduce((sum, r) => sum + r.exploratoryErrors, 0);
    const totalTEA = rounds.reduce((sum, r) => sum + r.totalErrorsAdjusted, 0);
    const meanEntropy = rounds.length > 0
      ? Number((rounds.reduce((sum, r) => sum + r.searchPatternEntropy, 0) / rounds.length).toFixed(3))
      : 1.5;
    const meanLatency = rounds.length > 0
      ? Math.round(rounds.reduce((sum, r) => sum + r.meanLatencyMs, 0) / rounds.length)
      : 2200;
    const meanAutonomy = rounds.length > 0
      ? Math.round(rounds.reduce((sum, r) => sum + r.autonomyScore, 0) / rounds.length)
      : 80;

    const totalPairsAll = rounds.reduce((sum, r) => sum + r.pairCount, 0);
    const accuracyPct = Math.round(((totalPairsAll * 2) / Math.max(1, totalFlipsAll)) * 100);

    // MoCA Equivalent Paired Associates score (0 to 5)
    let mocaScore = 5;
    if (accuracyPct < 60 || totalPersev > 4) mocaScore = 3;
    if (accuracyPct < 45 || totalPersev > 7) mocaScore = 2;
    if (accuracyPct < 30) mocaScore = 1;

    const summary: MemoryMatchSessionSummary = {
      gameId: 'memory-match',
      gameTitle: 'Memory Match (CANTAB Paired Associates)',
      rounds,
      totalRounds: rounds.length,
      finalTier: currentTier.tier,
      finalTheta: engine.getTheta(),
      overallAccuracyPct: Math.min(100, accuracyPct),
      totalFlips: totalFlipsAll,
      totalFirstTrialCorrect: totalFTC,
      totalPerseverations: totalPersev,
      totalExploratoryErrors: totalExpl,
      cantabTotalErrorsAdjusted: Number(totalTEA.toFixed(1)),
      meanSearchEntropy: meanEntropy,
      averageLatencyMs: meanLatency,
      medianLatencyMs: meanLatency,
      overallAutonomyScore: meanAutonomy,
      estimatedMoCAMemoryScore: mocaScore,
      processingSpeedProfile: meanLatency < 2000 ? 'hyper_rapid' : meanLatency < 3500 ? 'normal' : 'deliberate',
      dominantAssistanceProfile: liveAssistanceProfile.profile,
      completedAt: new Date().toISOString(),
    };

    if (onSessionComplete) {
      onSessionComplete(summary);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn select-none">
      
      {/* Top Controls Header */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              Tier {currentTier.tier}/9 • {currentTier.pairCount} Pairs ({currentTier.totalCards} Cards)
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Round {currentRoundIdx + 1} / {totalRounds}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {t.title}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const muted = memoryMatchAudio.toggleMute();
              setIsMuted(muted);
            }}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-slate-700" />}
          </button>

          <button
            onClick={() => setShowJudgeControls(!showJudgeControls)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              showJudgeControls 
                ? 'bg-purple-100 text-purple-900 border-purple-300 shadow-inner' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent'
            }`}
            title="Caregiver Live DDA Calibration Panel"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={() => triggerAdaptiveAssistance(liveAssistanceProfile, true)}
            disabled={isCompleted || isInPreviewPhase}
            className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            title="Request AI Scaffolding Hint"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Hint</span>
          </button>

          <button
            onClick={() => initRound(currentRoundIdx, manualTierOverride)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Reset Current Round"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Live Adaptation Flash Banner */}
      {aiAdaptationFlash && aiLiveReasoning && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white text-xs font-bold border border-purple-500/40 shadow-lg flex items-center gap-3 animate-fadeIn">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
          <div className="flex-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block">
              AI Dynamic Calibration Event (Bayesian IRT):
            </span>
            <p className="mt-0.5 leading-snug">{aiLiveReasoning}</p>
          </div>
        </div>
      )}

      {/* Feedback / Scaffolding Banner */}
      {feedbackBanner && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{feedbackBanner}</span>
        </div>
      )}

      {/* Caregiver Live DDA & SIH 2026 Testbed Drawer */}
      {showJudgeControls && (
        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-purple-500/40 shadow-xl space-y-4 animate-in slide-in-from-top duration-300 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h4 className="font-black text-sm text-white">SIH 2026 AI Testbed & Live Telemetry Inspector</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2.5 py-1 rounded-full">
                Profile: {liveAssistanceProfile.displayName[language] || liveAssistanceProfile.displayName.en}
              </span>
            </div>
          </div>

          {/* Real-time Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div>
              <span className="text-slate-400 text-[10px] block">Bayesian Ability (θ):</span>
              <strong className="text-amber-400 text-sm font-mono">{engine.getTheta().toFixed(3)}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Assistance Timeout:</span>
              <strong className="text-teal-400 text-sm font-mono">{liveAssistanceProfile.assistTimeoutMs / 1000}s</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Tremor Debounce Taps:</span>
              <strong className="text-emerald-400 text-sm font-mono">{engine.getTremorTapCount()} filtered</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Autonomy Index:</span>
              <strong className="text-purple-400 text-sm font-mono">{lastAutonomyScore}%</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-bold pt-1">
            {/* Tier Override */}
            <div>
              <span className="text-slate-400 block mb-1 text-[11px]">Manual Tier Select (1-9):</span>
              <select
                value={manualTierOverride !== null ? manualTierOverride : currentTier.tier - 1}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setManualTierOverride(val);
                  initRound(currentRoundIdx, val);
                }}
                className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-400 outline-none"
              >
                {MEMORY_MATCH_TIERS.map((t, idx) => (
                  <option key={t.tier} value={idx}>
                    Tier {t.tier}: {t.pairCount} Pairs ({t.totalCards} Cards) - θ:{t.baseTheta}
                  </option>
                ))}
              </select>
            </div>

            {/* Tremor Debounce Slider */}
            <div>
              <span className="text-slate-400 block mb-1 text-[11px]">
                Tremor Debounce: <strong className="text-teal-300">{tremorDebounceMs}ms</strong>
              </span>
              <div className="flex gap-1.5">
                {[300, 400, 500, 550].map((ms) => (
                  <button
                    key={ms}
                    onClick={() => setTremorDebounceMs(ms)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      tremorDebounceMs === ms 
                        ? 'bg-teal-400 text-slate-950 ring-2 ring-teal-300' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {ms}ms
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Study Toggle */}
            <div>
              <span className="text-slate-400 block mb-1 text-[11px]">Preview Study Phase:</span>
              <button
                onClick={() => setPreviewStudyEnabled(!previewStudyEnabled)}
                className={`w-full py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  previewStudyEnabled 
                    ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300' 
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {previewStudyEnabled ? 'Active (Face-Up Study)' : 'Disabled (Immediate Recall)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Game Board or Summary */}
      {!isCompleted ? (
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          {/* Live Status Bar */}
          <div className="flex flex-wrap items-center justify-between text-xs font-bold text-slate-600 border-b border-slate-100 pb-3 gap-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t.pairsMatched(matchedPairsCount, currentTier.pairCount)}</span>
            </span>

            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span>Flips: <strong className="text-slate-900">{totalFlips}</strong></span>
              <span>FTC: <strong className="text-emerald-700">{firstTrialCorrectCount}</strong></span>
              <span>Perseverations: <strong className="text-purple-700">{perseverations}</strong></span>
            </div>
          </div>

          {/* Preview Phase Notification */}
          {isInPreviewPhase && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <Eye className="w-5 h-5 text-amber-700 shrink-0 animate-bounce" />
                <div>
                  <h4 className="font-black text-sm">{t.studyHeading}</h4>
                  <p className="text-xs text-amber-800">{t.studySub}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black bg-amber-200/80 px-3 py-1 rounded-xl text-amber-900 border border-amber-400">
                  {previewSecondsRemaining}s
                </span>
                <button
                  onClick={finishPreviewPhase}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <span>{t.startNow}</span>
                </button>
              </div>
            </div>
          )}

          {/* Cards Grid */}
          <div 
            className="grid gap-3 sm:gap-4 justify-items-center mx-auto"
            style={{
              gridTemplateColumns: `repeat(${currentTier.gridCols}, minmax(0, 1fr))`,
              maxWidth: currentTier.gridCols <= 3 ? '420px' : currentTier.gridCols <= 4 ? '580px' : '780px'
            }}
          >
            {cards.map((card) => {
              const isAssisted = activeAssistPairKey === card.pairKey && !card.isMatched;
              const isDimmed = dimmedCardIds.includes(card.id);
              const showFace = card.isFlipped || card.isMatched || isInPreviewPhase;

              return (
                <button
                  key={card.id}
                  disabled={card.isMatched || isEvaluating || isInPreviewPhase}
                  onClick={() => handleCardClick(card.id)}
                  className={`w-full aspect-square rounded-2xl sm:rounded-3xl font-black transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-2 sm:p-3 select-none relative ${
                    card.isMatched
                      ? 'bg-emerald-50 border-3 border-emerald-400 text-emerald-900 shadow-xs cursor-default'
                      : showFace
                      ? 'bg-amber-50 border-3 border-amber-500 text-slate-900 shadow-md scale-102'
                      : isAssisted
                      ? 'bg-gradient-to-tr from-amber-200 via-amber-100 to-amber-300 border-4 border-amber-400 text-slate-800 shadow-md animate-pulse ring-4 ring-amber-300'
                      : isDimmed
                      ? 'opacity-30 grayscale border-2 border-slate-200 bg-slate-100'
                      : 'bg-gradient-to-tr from-slate-100 to-slate-200 border-3 border-slate-300 hover:border-amber-400 text-slate-500 shadow-sm hover:scale-102 active:scale-95'
                  }`}
                >
                  {showFace ? (
                    <div className="flex flex-col items-center justify-center text-center gap-1">
                      <span className="text-3xl sm:text-4xl md:text-5xl">{card.symbol}</span>
                      <span className="text-[10px] sm:text-xs font-black text-slate-800 leading-tight line-clamp-1">
                        {card.names[language]}
                      </span>
                      {card.isMatched && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute top-2 right-2" />
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
                      <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400/70" />
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {t.tapToFlip}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      ) : (
        /* Round / Session Completion Modal */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              {isSessionFinished ? 'Assessment Complete!' : `Round ${currentRoundIdx + 1} Complete!`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
              CANTAB Paired Associates Learning Telemetry Registered
            </p>
          </div>

          {/* Clinical Metrics Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto text-left">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.ftcLabel}</span>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">{firstTrialCorrectCount} / {currentTier.pairCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.perseverationLabel}</span>
              <p className="text-2xl font-black text-purple-600 mt-0.5">{perseverations}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.autonomyLabel}</span>
              <p className="text-2xl font-black text-blue-600 mt-0.5">{lastAutonomyScore}%</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Bayesian Ability (θ)</span>
              <p className="text-2xl font-black text-amber-600 mt-0.5">{engine.getTheta().toFixed(2)}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => initRound(currentRoundIdx, manualTierOverride)}
              className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm cursor-pointer transition-all flex items-center gap-2 border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Round</span>
            </button>

            {!isSessionFinished && (
              <button
                onClick={handleProceedNext}
                className="px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-md cursor-pointer transition-all flex items-center gap-2"
              >
                <span>{currentRoundIdx + 1 >= totalRounds ? t.viewReport : t.nextRound}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {isSessionFinished && onExit && (
              <button
                onClick={onExit}
                className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md cursor-pointer transition-all flex items-center gap-2"
              >
                <span>Return to Hub</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
