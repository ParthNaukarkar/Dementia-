import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Brain,
  ArrowRight,
  Sparkles,
  Activity,
  Award,
  ShieldAlert,
  Wrench,
  Volume2,
  VolumeX,
  Eye,
  Zap,
  CheckCircle2,
  XCircle,
  Sliders,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SupportedLanguage } from '../../types/prescription';
import type {
  PatternRecallDifficulty,
  PatternRecallGeneratedTrial,
  PatternRecallSettingsSnapshot,
  PatternRecallTrialTelemetry,
  PatternRecallSessionSummary,
  OasisPatternRecallPersona,
} from './types';
import { REAL_WORLD_PATTERN_RECALL_PERSONAS } from './types';
import { PatternRecallEngine } from './engine';
import { MOTIF_THEMES } from './data';
import { patternRecallAudio } from './audio';

export interface PatternRecallProps {
  language: SupportedLanguage;
  totalTrials?: number;
  initialTheta?: number;
  onSessionComplete?: (summary: PatternRecallSessionSummary) => void;
  onExit?: () => void;
}

type GameState = 'intro' | 'memorize' | 'recall' | 'feedback' | 'completed';

const UI_STRINGS = {
  as: {
    title: 'নক্সাৰ ছন্দ (Pattern Recall)',
    desc: 'গ্ৰিডৰ ওপৰত চমু সময়ৰ বাবে জিলিকি উঠা হস্ততাঁতৰ চানেকিটো মন দি চাওক। ই নোহোৱা হোৱাৰ পিছত সেই স্থানসমূহ সঠিকভাৱে বাছি উলিওৱা।',
    start: 'আৰম্ভ কৰক',
    next: 'পৰৱৰ্তী চানেকি',
    exit: 'প্ৰস্থান কৰক',
    completed: 'অভিনন্দন! অধিবেশন সমাপ্ত',
    scoreMsg: (c: number, t: number) => `আপুনি ${t} টাৰ ভিতৰত ${c} টা চানেকি নিখুঁতভাৱে মনত ৰাখিলে।`,
    autonomyGauge: 'আত্মনিৰ্ভৰশীলতা',
    thetaGauge: 'জ্ঞানীয় ক্ষমতা (θ)',
    tremorFiltered: 'কম্পন প্ৰতিৰোধ',
    peekBtn: 'পুনৰ দর্শন (পিক)',
    peeksLeft: (n: number) => `${n} বাৰ বাকী`,
    beaconBtn: 'সোণালী সংকেত (বিকন)',
    aiTestbed: 'AI ক্লিনিকেল পৰীক্ষাগাৰ',
    simulationMode: 'OASIS-2 ৰোগী অনুকৰণ',
    runSimulation: 'অনুকৰণ আৰম্ভ কৰক',
    exportCsv: 'CSV ৰিপ\'ৰ্ট ডাউনলোড',
    tierLabel: 'স্তৰ',
    mocaVisuospatial: 'MoCA স্থানিক মান',
    staging: 'ক্লিনিকেল অৱস্থা',
    correct: 'অসাধাৰণ! সঠিক চানেকি!',
    incorrect: 'অসম্পূৰ্ণ চানেকি! শুদ্ধ স্থানসমূহ চাওক।',
    memorizePrompt: 'চানেকিটো মনত ৰাখক...',
    recallPrompt: 'মনত থকা স্থানসমূহত স্পৰ্শ কৰক',
    maxSpan: 'সৰ্বোচ্চ স্থানিক পৰিসৰ',
  },
  bn: {
    title: 'নকশার ছন্দ (Pattern Recall)',
    desc: 'গ্রিডের ওপর ক্ষণিকের জন্য ভেসে ওঠা তাঁত নকশাটি মনোযোগ দিয়ে দেখুন। এটি মিলিয়ে যাওয়ার পর সঠিক ঘরগুলি বেছে নিন।',
    start: 'শুরু করুন',
    next: 'পরবর্তী নকশা',
    exit: 'প্রস্থান করুন',
    completed: 'অভিনন্দন! অধিবেশন সমাপ্ত',
    scoreMsg: (c: number, t: number) => `আপনি ${t} টির মধ্যে ${c} টি নকশা নিখুঁতভাবে মনে রেখেছেন।`,
    autonomyGauge: 'স্বায়ত্তশাসন',
    thetaGauge: 'জ্ঞানীয় ক্ষমতা (θ)',
    tremorFiltered: 'কম্পন প্রতিরোধ',
    peekBtn: 'পুনরায় দর্শন (পিক)',
    peeksLeft: (n: number) => `${n} বার বাকি`,
    beaconBtn: 'সোনালী সঙ্কেত (বিকন)',
    aiTestbed: 'AI ক্লিনিকাল টেস্টবেড',
    simulationMode: 'OASIS-2 রোগী অনুকরণ',
    runSimulation: 'অনুকরণ শুরু করুন',
    exportCsv: 'CSV রিপোর্ট ডাউনলোড',
    tierLabel: 'স্তর',
    mocaVisuospatial: 'MoCA স্থানিক মান',
    staging: 'ক্লিনিকাল অবস্থা',
    correct: 'চমৎকার! সঠিক নকশা!',
    incorrect: 'অসম্পূর্ণ নকশা! সঠিক ঘরগুলি দেখুন।',
    memorizePrompt: 'নকশাটি মনে রাখুন...',
    recallPrompt: 'মনে থাকা ঘরগুলিতে স্পর্শ করুন',
    maxSpan: 'সর্বোচ্চ স্থানিক পরিসর',
  },
  hi: {
    title: 'पैटर्न पहचान (Pattern Recall)',
    desc: 'ग्रिड पर थोड़े समय के लिए प्रदर्शित होने वाले हथकरघा पैटर्न को ध्यान से देखें। इसके गायब होने के बाद सही स्थान चुनें।',
    start: 'शुरू करें',
    next: 'अगला पैटर्न',
    exit: 'बाहर निकलें',
    completed: 'बधाई हो! सत्र पूर्ण',
    scoreMsg: (c: number, t: number) => `आपने ${t} में से ${c} पैटर्न पूरी तरह याद रखे।`,
    autonomyGauge: 'स्वायत्तता स्कोर',
    thetaGauge: 'संज्ञानात्मक क्षमता (θ)',
    tremorFiltered: 'कंपन फिल्टर',
    peekBtn: 'पुनः अवलोकन (पीक)',
    peeksLeft: (n: number) => `${n} शेष`,
    beaconBtn: 'स्वर्णिम बीकन संकेत',
    aiTestbed: 'AI क्लिनिकल टेस्टबेड',
    simulationMode: 'OASIS-2 रोगी सिमुलेशन',
    runSimulation: 'सिमुलेशन शुरू करें',
    exportCsv: 'CSV रिपोर्ट डाउनलोड',
    tierLabel: 'स्तर',
    mocaVisuospatial: 'MoCA स्थानिक मान',
    staging: 'क्लिनिकल चरण',
    correct: 'अद्भुत! सटीक पैटर्न!',
    incorrect: 'अपूर्ण पैटर्न! सही स्थान देखें।',
    memorizePrompt: 'पैटर्न याद रखें...',
    recallPrompt: 'याद किए गए स्थानों को स्पर्श करें',
    maxSpan: 'अधिकतम स्थानिक फैलाव',
  },
  en: {
    title: 'Pattern Recall (Visuospatial Memory)',
    desc: 'Carefully observe the handloom motif pattern lighting up across the grid. Once it disappears, tap the exact tiles to recreate the pattern.',
    start: 'Start Session',
    next: 'Next Pattern',
    exit: 'Finish & Exit',
    completed: 'Congratulations! Session Complete',
    scoreMsg: (c: number, t: number) => `You correctly remembered ${c} out of ${t} patterns.`,
    autonomyGauge: 'Patient Autonomy',
    thetaGauge: 'Cognitive Ability (θ)',
    tremorFiltered: 'Tremors Filtered',
    peekBtn: 'Peek Replay',
    peeksLeft: (n: number) => `${n} left`,
    beaconBtn: 'Golden Beacon',
    aiTestbed: 'AI Clinical Testbed',
    simulationMode: 'OASIS-2 Patient Simulation',
    runSimulation: 'Run Simulation',
    exportCsv: 'Export CSV Telemetry',
    tierLabel: 'Tier',
    mocaVisuospatial: 'MoCA Visuospatial',
    staging: 'Clinical Stage',
    correct: 'Splendid! Pattern Correct!',
    incorrect: 'Incomplete recall! Inspect target cells.',
    memorizePrompt: 'Memorize the pattern...',
    recallPrompt: 'Tap the remembered tiles',
    maxSpan: 'Max Spatial Span',
  },
};

export const PatternRecall: React.FC<PatternRecallProps> = ({
  language,
  totalTrials = 5,
  initialTheta = 0.0,
  onSessionComplete,
  onExit,
}) => {
  const engine = useMemo(() => new PatternRecallEngine(initialTheta), [initialTheta]);

  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentTrialNumber, setCurrentTrialNumber] = useState(1);
  const [currentDifficulty, setCurrentDifficulty] = useState<PatternRecallDifficulty>(engine.getDifficulty());
  const [currentTrial, setCurrentTrial] = useState<PatternRecallGeneratedTrial | null>(null);

  // In-trial telemetry & selection state
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [isTrialCorrect, setIsTrialCorrect] = useState<boolean | null>(null);
  const [peeksUsedCount, setPeeksUsedCount] = useState(0);
  const [beaconHintUsed, setBeaconHintUsed] = useState(false);
  const [beaconTileIndices, setBeaconTileIndices] = useState<number[]>([]);
  const [isPeekingActive, setIsPeekingActive] = useState(false);
  const [trialStartTime, setTrialStartTime] = useState<number>(0);
  const [timeToFirstTap, setTimeToFirstTap] = useState<number>(0);
  const [totalTapsCount, setTotalTapsCount] = useState<number>(0);
  const [trialsTelemetry, setTrialsTelemetry] = useState<PatternRecallTrialTelemetry[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [tremorCount, setTremorCount] = useState(0);

  // AI Testbed drawer & live simulation
  const [isTestbedOpen, setIsTestbedOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<OasisPatternRecallPersona>(REAL_WORLD_PATTERN_RECALL_PERSONAS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [autoAssistTriggered, setAutoAssistTriggered] = useState(false);

  // Timers
  const memorizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const peekTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const assistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = UI_STRINGS[language] || UI_STRINGS.en;

  // Sound sync
  useEffect(() => {
    patternRecallAudio.setMuted(isMuted);
  }, [isMuted]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (memorizeTimerRef.current) clearTimeout(memorizeTimerRef.current);
      if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
      if (assistTimerRef.current) clearTimeout(assistTimerRef.current);
    };
  }, []);

  // Handle Trial Start
  const startTrial = (trialIndex: number, diff: PatternRecallDifficulty) => {
    const trial = engine.generateTrial(trialIndex, diff);
    setCurrentTrial(trial);
    setCurrentDifficulty(diff);
    setSelectedCells([]);
    setIsTrialCorrect(null);
    setPeeksUsedCount(0);
    setBeaconHintUsed(false);
    setBeaconTileIndices([]);
    setIsPeekingActive(false);
    setAutoAssistTriggered(false);
    setTimeToFirstTap(0);
    setTotalTapsCount(0);

    // Enter memorize state
    setGameState('memorize');
    patternRecallAudio.playPatternShow();

    // After display duration, transition to recall state
    if (memorizeTimerRef.current) clearTimeout(memorizeTimerRef.current);
    memorizeTimerRef.current = setTimeout(() => {
      const now = Date.now();
      setTrialStartTime(now);
      setGameState('recall');

      // Voice prompt
      patternRecallAudio.speakGuidance(t.recallPrompt, language);

      // Arm Auto-Assist timer
      if (assistTimerRef.current) clearTimeout(assistTimerRef.current);
      assistTimerRef.current = setTimeout(() => {
        handleAutoAssist(trial, diff);
      }, diff.autoAssistTimeoutMs);
    }, diff.displayDurationMs);
  };

  // Auto-assist for prolonged hesitation
  const handleAutoAssist = (trial: PatternRecallGeneratedTrial, diff: PatternRecallDifficulty) => {
    setAutoAssistTriggered(true);
    if (diff.beaconAllowed && !beaconHintUsed) {
      triggerBeaconHint(trial, diff);
    } else if (diff.peeksAllowed > 0 && peeksUsedCount < diff.peeksAllowed) {
      triggerPeekReplay(diff);
    }
  };

  const handleStartGame = () => {
    startTrial(1, engine.getDifficulty());
  };

  // Trigger Peek Replay
  const triggerPeekReplay = (diff: PatternRecallDifficulty = currentDifficulty) => {
    if (peeksUsedCount >= diff.peeksAllowed || isPeekingActive || gameState !== 'recall') return;

    setPeeksUsedCount(prev => prev + 1);
    setIsPeekingActive(true);
    patternRecallAudio.playPeekChime();

    if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
    peekTimerRef.current = setTimeout(() => {
      setIsPeekingActive(false);
    }, 1400); // 1.4s brief visual replay
  };

  // Trigger Golden Beacon Hint
  const triggerBeaconHint = (
    trial: PatternRecallGeneratedTrial | null = currentTrial,
    diff: PatternRecallDifficulty = currentDifficulty
  ) => {
    if (!trial || !diff.beaconAllowed || beaconHintUsed || gameState !== 'recall') return;

    const beaconTiles = engine.getBeaconHintTiles(trial, selectedCells, diff.beaconIlluminatesCount);
    setBeaconTileIndices(beaconTiles);
    setBeaconHintUsed(true);
    patternRecallAudio.playBeaconChime();
  };

  // Handle Cell Tap
  const handleCellTap = (cellIndex: number) => {
    if (gameState !== 'recall' || !currentTrial) return;

    const now = Date.now();
    const totalCells = currentTrial.gridSize * currentTrial.gridSize;

    // 400ms Parkinsonian tremor filter
    if (!engine.filterTremorTap(cellIndex, now)) {
      patternRecallAudio.playCellTap(cellIndex, totalCells);
      setTremorCount(engine.getTremorFilteredCount());
      return; // Micro-jitter safely absorbed
    }

    patternRecallAudio.playCellTap(cellIndex, totalCells);
    setTotalTapsCount(prev => prev + 1);

    if (timeToFirstTap === 0) {
      setTimeToFirstTap(now - trialStartTime);
    }

    // Toggle cell selection
    const isAlreadySelected = selectedCells.includes(cellIndex);
    const updatedSelection = isAlreadySelected
      ? selectedCells.filter(idx => idx !== cellIndex)
      : [...selectedCells, cellIndex];

    setSelectedCells(updatedSelection);

    // Auto-check when selection count reaches target pattern length
    if (updatedSelection.length === currentTrial.patternLength) {
      evaluateTrial(updatedSelection, now);
    }
  };

  // Evaluate Trial
  const evaluateTrial = (finalSelection: number[], nowTimestamp: number) => {
    if (!currentTrial) return;

    if (assistTimerRef.current) clearTimeout(assistTimerRef.current);

    const deliberationMs = Math.max(800, nowTimestamp - trialStartTime);
    const targetSet = new Set(currentTrial.pattern);

    let correctCount = 0;
    let falseAlarmCount = 0;
    finalSelection.forEach(idx => {
      if (targetSet.has(idx)) {
        correctCount++;
      } else {
        falseAlarmCount++;
      }
    });

    const isCorrect = correctCount === currentTrial.patternLength && falseAlarmCount === 0;
    setIsTrialCorrect(isCorrect);

    if (isCorrect) {
      patternRecallAudio.playSuccessChime();
    } else {
      patternRecallAudio.playErrorChime();
    }

    const settingsSnapshot: PatternRecallSettingsSnapshot = {
      peeksUsedCount,
      maxPeeksAllowed: currentDifficulty.peeksAllowed,
      beaconHintUsed,
      proactiveBeaconRequested: beaconHintUsed && !autoAssistTriggered,
      isManualTierOverride: false,
      soundMuted: isMuted,
    };

    const tilesRecalledRatio = currentTrial.patternLength > 0 ? correctCount / currentTrial.patternLength : 0;
    const { newTheta, autonomyScore, reasoning } = engine.updateTheta(
      isCorrect,
      deliberationMs,
      settingsSnapshot,
      tilesRecalledRatio
    );

    const trialRecord: PatternRecallTrialTelemetry = {
      trialIndex: currentTrialNumber,
      tierLevel: currentDifficulty.tierLevel,
      gridSize: currentTrial.gridSize,
      patternLength: currentTrial.patternLength,
      targetPattern: currentTrial.pattern,
      playerSelection: finalSelection,
      correctTilesSelected: correctCount,
      falseAlarmTilesSelected: falseAlarmCount,
      isCorrect,
      peeksUsedCount,
      beaconHintUsed,
      beaconTileIndices,
      deliberationTimeMs: deliberationMs,
      timeToFirstTapMs: timeToFirstTap || deliberationMs,
      totalTapsCount: totalTapsCount + 1,
      autonomyScore,
      thetaAfterTrial: newTheta,
      difficultySnapshot: { ...currentDifficulty },
      settingsSnapshot,
      aiAdaptiveReasoning: reasoning,
    };

    setTrialsTelemetry(prev => [...prev, trialRecord]);
    setGameState('feedback');
  };

  // Advance to Next Trial or Complete
  const handleNextTrial = () => {
    if (currentTrialNumber < totalTrials) {
      const nextNum = currentTrialNumber + 1;
      setCurrentTrialNumber(nextNum);
      const nextDiff = engine.deriveDifficultyFromTheta(engine.getTheta());
      startTrial(nextNum, nextDiff);
    } else {
      finishSession();
    }
  };

  // Complete Session
  const finishSession = () => {
    setGameState('completed');
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });

    const summary = engine.compileSessionSummary(trialsTelemetry);
    if (onSessionComplete) {
      onSessionComplete(summary);
    }
  };

  // Caregiver Assistance Presets
  const applyAssistancePreset = (preset: 'autonomy' | 'support' | 'scaffolding' | 'floor') => {
    let targetTier = 5;
    if (preset === 'autonomy') targetTier = 8;
    if (preset === 'support') targetTier = 5;
    if (preset === 'scaffolding') targetTier = 3;
    if (preset === 'floor') targetTier = 1;

    const diff = engine.getDifficultyForTierLevel(targetTier);
    setCurrentDifficulty(diff);
    engine.setDifficulty(diff);
    if (gameState === 'memorize' || gameState === 'recall') {
      startTrial(currentTrialNumber, diff);
    }
  };

  // Run Real-World OASIS-2 Patient Simulation
  const handleRunOasisSimulation = async () => {
    setIsSimulating(true);
    setSimulationLog([]);

    const simTelemetry: PatternRecallTrialTelemetry[] = [];
    const simEngine = new PatternRecallEngine(0.0);
    const persona = selectedPersona;

    setSimulationLog(prev => [
      ...prev,
      `--- Starting Authentic OASIS-2 Simulation: ${persona.name} (${persona.clinicalDiagnosis}, MMSE ${persona.mmse}, CDR ${persona.cdr}) ---`,
    ]);

    for (let trialIdx = 1; trialIdx <= 5; trialIdx++) {
      const diff = simEngine.deriveDifficultyFromTheta(simEngine.getTheta());
      const trial = simEngine.generateTrial(trialIdx, diff);

      const simResult = simEngine.simulateOasisPatientAction(persona, trial, diff);

      const targetSet = new Set(trial.pattern);
      let correctCount = 0;
      let falseAlarmCount = 0;
      simResult.playerSelection.forEach(idx => {
        if (targetSet.has(idx)) correctCount++;
        else falseAlarmCount++;
      });

      const tilesRatio = trial.patternLength > 0 ? correctCount / trial.patternLength : 0;
      const settings: PatternRecallSettingsSnapshot = {
        peeksUsedCount: simResult.peeksUsedCount,
        maxPeeksAllowed: diff.peeksAllowed,
        beaconHintUsed: simResult.beaconHintUsed,
        proactiveBeaconRequested: simResult.beaconHintUsed,
        isManualTierOverride: false,
        soundMuted: true,
      };

      const { newTheta, autonomyScore, reasoning } = simEngine.updateTheta(
        simResult.isCorrect,
        simResult.deliberationTimeMs,
        settings,
        tilesRatio
      );

      simTelemetry.push({
        trialIndex: trialIdx,
        tierLevel: diff.tierLevel,
        gridSize: trial.gridSize,
        patternLength: trial.patternLength,
        targetPattern: trial.pattern,
        playerSelection: simResult.playerSelection,
        correctTilesSelected: correctCount,
        falseAlarmTilesSelected: falseAlarmCount,
        isCorrect: simResult.isCorrect,
        peeksUsedCount: simResult.peeksUsedCount,
        beaconHintUsed: simResult.beaconHintUsed,
        beaconTileIndices: simResult.beaconTileIndices,
        deliberationTimeMs: simResult.deliberationTimeMs,
        timeToFirstTapMs: Math.round(simResult.deliberationTimeMs * 0.4),
        totalTapsCount: trial.patternLength + simResult.tremorJitterCount,
        autonomyScore,
        thetaAfterTrial: newTheta,
        difficultySnapshot: { ...diff },
        settingsSnapshot: settings,
        aiAdaptiveReasoning: reasoning,
      });

      setSimulationLog(prev => [
        ...prev,
        `Trial ${trialIdx} (Tier ${diff.tierLevel}): ${simResult.clinicalObservation[language]} -> θ=${newTheta.toFixed(3)}, Autonomy=${autonomyScore}%`,
      ]);

      await new Promise(res => setTimeout(res, 250));
    }

    const simSummary = simEngine.compileSessionSummary(simTelemetry);
    setTrialsTelemetry(simTelemetry);
    setGameState('completed');
    setIsSimulating(false);
    setIsTestbedOpen(false);

    if (onSessionComplete) {
      onSessionComplete(simSummary);
    }
  };

  // Export CSV Telemetry
  const handleExportCsv = () => {
    if (trialsTelemetry.length === 0) return;
    const headers = [
      'TrialIndex',
      'Tier',
      'GridSize',
      'PatternLength',
      'IsCorrect',
      'CorrectTiles',
      'FalseAlarms',
      'PeeksUsed',
      'BeaconUsed',
      'DeliberationMs',
      'TimeToFirstTapMs',
      'AutonomyScore',
      'ThetaAfterTrial',
    ];
    const rows = trialsTelemetry.map(t => [
      t.trialIndex,
      t.tierLevel,
      t.gridSize,
      t.patternLength,
      t.isCorrect ? 1 : 0,
      t.correctTilesSelected,
      t.falseAlarmTilesSelected,
      t.peeksUsedCount,
      t.beaconHintUsed ? 1 : 0,
      t.deliberationTimeMs,
      t.timeToFirstTapMs,
      t.autonomyScore,
      t.thetaAfterTrial,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smriti_pattern_recall_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Current active theme
  const currentTheme = useMemo(() => {
    if (!currentTrial) return MOTIF_THEMES[0];
    return MOTIF_THEMES.find(m => m.id === currentTrial.motifTheme) || MOTIF_THEMES[0];
  }, [currentTrial]);

  // Dynamic grid classes
  const getGridClasses = (size: number) => {
    switch (size) {
      case 2:
        return 'grid-cols-2 max-w-xs';
      case 3:
        return 'grid-cols-3 max-w-sm sm:max-w-md';
      case 4:
        return 'grid-cols-4 max-w-md sm:max-w-lg';
      case 5:
        return 'grid-cols-5 max-w-lg sm:max-w-xl';
      default:
        return 'grid-cols-3 max-w-sm';
    }
  };

  const getCellDimensions = (size: number) => {
    switch (size) {
      case 2:
        return 'h-28 sm:h-36 text-3xl sm:text-4xl';
      case 3:
        return 'h-20 sm:h-28 text-2xl sm:text-3xl';
      case 4:
        return 'h-16 sm:h-20 text-xl sm:text-2xl';
      case 5:
        return 'h-14 sm:h-16 text-lg sm:text-xl';
      default:
        return 'h-20 sm:h-28 text-2xl';
    }
  };

  // --- RENDER INTRO ---
  if (gameState === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] p-6 text-center max-w-3xl mx-auto">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-indigo-200">
          <Brain className="w-12 h-12 text-indigo-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">{t.title}</h1>
        <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">{t.desc}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-8 max-w-xl">
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 text-center">
            <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider block">গ্ৰিড সীমা</span>
            <span className="text-lg font-bold text-slate-800">2x2 to 5x5</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
            <span className="text-xs text-amber-600 font-semibold uppercase tracking-wider block">স্থানিক চানেকি</span>
            <span className="text-lg font-bold text-slate-800">2 to 6 Tiles</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
            <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wider block">কম্পন ফিল্টাৰ</span>
            <span className="text-lg font-bold text-slate-800">400ms Guard</span>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 text-center">
            <span className="text-xs text-purple-600 font-semibold uppercase tracking-wider block">সহায়ক সংকেত</span>
            <span className="text-lg font-bold text-slate-800">Peek & Beacon</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleStartGame}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-10 rounded-2xl shadow-lg hover:shadow-indigo-200 hover:scale-[1.02] transition-all flex items-center gap-3 text-lg"
          >
            {t.start} <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsTestbedOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3.5 px-6 rounded-2xl transition-all flex items-center gap-2 border border-slate-300"
          >
            <Sliders className="w-5 h-5 text-indigo-600" />
            {t.aiTestbed}
          </button>
        </div>

        {/* AI Testbed Drawer render */}
        {renderTestbedDrawer()}
      </div>
    );
  }

  // --- RENDER COMPLETED ---
  if (gameState === 'completed') {
    const summary = engine.compileSessionSummary(trialsTelemetry);
    const correctCount = summary.correctTrials;
    const totalCount = summary.totalTrials;

    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] p-6 text-center max-w-3xl mx-auto">
        <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-emerald-200">
          <Sparkles className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">{t.completed}</h2>
        <p className="text-lg text-slate-600 mb-8">{t.scoreMsg(correctCount, totalCount)}</p>

        {/* Comprehensive Clinical Summary Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mb-8 text-left">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">{t.thetaGauge}</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">{summary.finalTheta.toFixed(2)}</span>
            <span className="text-xs text-slate-500 block">Bayesian 2PL Latent</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Brain className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">{t.mocaVisuospatial}</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">{summary.estimatedMoCAVisuospatialScore}/5.0</span>
            <span className="text-xs text-slate-500 block">Visuospatial Index</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">{t.maxSpan}</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">{summary.maxSpatialSpanRecalled} Tiles</span>
            <span className="text-xs text-slate-500 block">CANTAB Spatial Span</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">{t.tremorFiltered}</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">{summary.tremorTapsFilteredTotal}</span>
            <span className="text-xs text-slate-500 block">400ms Debounce</span>
          </div>
        </div>

        {/* Clinical Classification & Autonomy Badge */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{t.staging}</h4>
            </div>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
              {summary.oasisClinicalClassification?.clinicalTier || 'NORMAL'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-700 block">স্থানিক স্মৃতি (Phenotype):</span>
              {summary.visuospatialRetentionStatus}
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">কাৰ্যকৰী গতি (Visuomotor):</span>
              {summary.visuomotorExecutionProfile}
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">আত্মনিৰ্ভৰশীলতা (Autonomy):</span>
              {summary.autonomyScore}% (পিক: {summary.totalPeeksUsed}, বিকন: {summary.totalBeaconsUsed})
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onExit}
            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all"
          >
            {t.exit}
          </button>
          <button
            onClick={handleExportCsv}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            {t.exportCsv}
          </button>
          <button
            onClick={() => setIsTestbedOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-6 rounded-xl transition-all border border-slate-300 flex items-center gap-2"
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            {t.aiTestbed}
          </button>
        </div>

        {renderTestbedDrawer()}
      </div>
    );
  }

  // --- RENDER MAIN GAMEPLAY (MEMORIZE / RECALL / FEEDBACK) ---
  const gridSize = currentTrial ? currentTrial.gridSize : 3;
  const totalCells = gridSize * gridSize;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 max-w-3xl mx-auto w-full select-none">
      {/* Top Clinical HUD Bar */}
      <div className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg">
            {t.tierLabel} {currentDifficulty.tierLevel}
          </span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Trial {currentTrialNumber} of {totalTrials}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Brain className="w-4 h-4 text-indigo-600" />
            <span>θ: {engine.getTheta().toFixed(2)}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Autonomy: {trialsTelemetry.length > 0 ? trialsTelemetry[trialsTelemetry.length - 1].autonomyScore : 100}%</span>
          </div>
          {tremorCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{tremorCount}</span>
            </div>
          )}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsTestbedOpen(true)}
            className="text-slate-500 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Instruction / Phase Header */}
      <div className="mb-4 text-center">
        {gameState === 'memorize' && (
          <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold text-lg animate-pulse">
            <Eye className="w-5 h-5" />
            <span>{t.memorizePrompt} ({currentTrial?.patternLength} {t.maxSpan})</span>
          </div>
        )}
        {gameState === 'recall' && (
          <div className="flex items-center justify-center gap-2 text-slate-800 font-bold text-lg">
            <Brain className="w-5 h-5 text-indigo-600" />
            <span>
              {isPeekingActive ? t.memorizePrompt : t.recallPrompt} ({selectedCells.length}/{currentTrial?.patternLength})
            </span>
          </div>
        )}
        {gameState === 'feedback' && (
          <div className={`flex items-center justify-center gap-2 font-bold text-lg ${isTrialCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isTrialCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            <span>{isTrialCorrect ? t.correct : t.incorrect}</span>
          </div>
        )}
        <span className="text-xs text-slate-500 font-medium block mt-1">
          {currentTheme.name[language]} • {currentDifficulty.tierDescription[language]}
        </span>
      </div>

      {/* Grid Container */}
      <div className={`w-full grid gap-3 sm:gap-4 p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-3xl shadow-inner mb-6 ${getGridClasses(gridSize)}`}>
        {Array.from({ length: totalCells }).map((_, cellIdx) => {
          const isTargetCell = currentTrial?.pattern.includes(cellIdx) ?? false;
          const isSelected = selectedCells.includes(cellIdx);
          const isBeaconTarget = beaconTileIndices.includes(cellIdx);

          let cellStyle = 'bg-white border-2 border-slate-200 text-slate-700 shadow-sm hover:border-indigo-300';
          let displaySymbol = '';

          if (gameState === 'memorize' || isPeekingActive) {
            if (isTargetCell) {
              cellStyle = `${currentTheme.colorTheme.active} scale-[1.03] transition-transform duration-200`;
              displaySymbol = currentTheme.symbol;
            } else {
              cellStyle = 'bg-slate-100/60 border-slate-200 opacity-60';
            }
          } else if (gameState === 'recall') {
            if (isBeaconTarget && !isSelected) {
              cellStyle = currentTheme.colorTheme.beacon;
              displaySymbol = currentTheme.symbol;
            } else if (isSelected) {
              cellStyle = 'bg-indigo-500 border-indigo-600 text-white shadow-md scale-[1.02]';
              displaySymbol = currentTheme.symbol;
            }
          } else if (gameState === 'feedback') {
            if (isTargetCell && isSelected) {
              cellStyle = 'bg-emerald-500 border-emerald-600 text-white shadow-md'; // Correct
              displaySymbol = currentTheme.symbol;
            } else if (isTargetCell && !isSelected) {
              cellStyle = 'bg-amber-400 border-amber-500 text-amber-950 ring-2 ring-amber-300'; // Missed target
              displaySymbol = currentTheme.symbol;
            } else if (!isTargetCell && isSelected) {
              cellStyle = 'bg-rose-500 border-rose-600 text-white'; // False alarm
              displaySymbol = '✖';
            } else {
              cellStyle = 'bg-slate-100/40 border-slate-200 opacity-40';
            }
          }

          return (
            <button
              key={cellIdx}
              onClick={() => handleCellTap(cellIdx)}
              disabled={gameState !== 'recall' || isPeekingActive}
              className={`rounded-2xl font-bold flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer ${getCellDimensions(gridSize)} ${cellStyle}`}
            >
              <span>{displaySymbol}</span>
            </button>
          );
        })}
      </div>

      {/* Patient Autonomy & Assist Tools Bar */}
      {gameState === 'recall' && (
        <div className="w-full flex flex-wrap items-center justify-center gap-3 mb-6">
          {currentDifficulty.peeksAllowed > 0 && (
            <button
              onClick={() => triggerPeekReplay()}
              disabled={peeksUsedCount >= currentDifficulty.peeksAllowed || isPeekingActive}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm border transition-all ${
                peeksUsedCount < currentDifficulty.peeksAllowed
                  ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 shadow-sm'
                  : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Eye className="w-4 h-4 text-amber-600" />
              <span>{t.peekBtn}</span>
              <span className="text-xs bg-amber-200/80 px-2 py-0.5 rounded-full font-bold text-amber-900">
                {t.peeksLeft(currentDifficulty.peeksAllowed - peeksUsedCount)}
              </span>
            </button>
          )}

          {currentDifficulty.beaconAllowed && (
            <button
              onClick={() => triggerBeaconHint()}
              disabled={beaconHintUsed}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm border transition-all ${
                !beaconHintUsed
                  ? 'bg-yellow-50 border-yellow-300 text-yellow-900 hover:bg-yellow-100 shadow-sm'
                  : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4 text-yellow-600" />
              <span>{t.beaconBtn}</span>
            </button>
          )}
        </div>
      )}

      {/* Feedback Next Button */}
      {gameState === 'feedback' && (
        <div className="w-full flex justify-center">
          <button
            onClick={handleNextTrial}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-10 rounded-2xl shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-3 text-base"
          >
            {t.next} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* AI Testbed Drawer render */}
      {renderTestbedDrawer()}
    </div>
  );

  // --- RENDER AI TESTBED DRAWER ---
  function renderTestbedDrawer() {
    if (!isTestbedOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
        <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto p-6 flex flex-col justify-between text-left">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg">
                <Wrench className="w-5 h-5" />
                <span>{t.aiTestbed}</span>
              </div>
              <button
                onClick={() => setIsTestbedOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Caregiver Presets */}
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                সহায়ক প্ৰিচেট (Scaffolding Presets)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => applyAssistancePreset('autonomy')}
                  className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-medium text-slate-700 text-left"
                >
                  <span className="font-bold block text-indigo-600">Full Autonomy</span>
                  Tier 8 (4x4, 5 Tiles, No Peeks)
                </button>
                <button
                  onClick={() => applyAssistancePreset('support')}
                  className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-medium text-slate-700 text-left"
                >
                  <span className="font-bold block text-emerald-600">Gentle Support</span>
                  Tier 5 (3x3, 4 Tiles, 1 Peek)
                </button>
                <button
                  onClick={() => applyAssistancePreset('scaffolding')}
                  className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-medium text-slate-700 text-left"
                >
                  <span className="font-bold block text-amber-600">High Scaffolding</span>
                  Tier 3 (3x3, 3 Tiles, 2 Peeks)
                </button>
                <button
                  onClick={() => applyAssistancePreset('floor')}
                  className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-medium text-slate-700 text-left"
                >
                  <span className="font-bold block text-rose-600">Palliative Floor</span>
                  Tier 1 (2x2, 2 Tiles, 5s Display)
                </button>
              </div>
            </div>

            {/* Fine-grained Tier Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  মনোমিতিক স্তৰ বাছনি (1 to 9)
                </label>
                <span className="text-xs font-bold text-indigo-600">Tier {currentDifficulty.tierLevel}</span>
              </div>
              <input
                type="range"
                min={1}
                max={9}
                step={1}
                value={currentDifficulty.tierLevel}
                onChange={e => {
                  const level = Number(e.target.value);
                  const diff = engine.getDifficultyForTierLevel(level);
                  setCurrentDifficulty(diff);
                  engine.setDifficulty(diff);
                  if (gameState === 'memorize' || gameState === 'recall') {
                    startTrial(currentTrialNumber, diff);
                  }
                }}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs text-slate-500 block mt-1.5">
                {currentDifficulty.tierDescription[language]}
              </span>
            </div>

            {/* OASIS-2 Patient Simulation Section */}
            <div className="mb-6 border-t border-slate-200 pt-5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                {t.simulationMode}
              </label>
              <select
                value={selectedPersona.id}
                onChange={e => {
                  const found = REAL_WORLD_PATTERN_RECALL_PERSONAS.find(p => p.id === e.target.value);
                  if (found) setSelectedPersona(found);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 mb-3"
              >
                {REAL_WORLD_PATTERN_RECALL_PERSONAS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.avatarIcon} {p.name} - MMSE {p.mmse}, CDR {p.cdr} ({p.clinicalDiagnosis})
                  </option>
                ))}
              </select>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 text-xs text-slate-600">
                <span className="font-semibold block text-slate-700 mb-1">ক্লিনিকেল পৰ্যবেক্ষণ:</span>
                {selectedPersona.clinicalNotes[language]}
              </div>

              <button
                onClick={handleRunOasisSimulation}
                disabled={isSimulating}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Activity className="w-4 h-4" />
                <span>{isSimulating ? 'অনুকৰণ চলি আছে...' : t.runSimulation}</span>
              </button>
            </div>

            {/* Simulation Event Log */}
            {simulationLog.length > 0 && (
              <div className="bg-slate-900 text-slate-200 rounded-xl p-3 text-xs font-mono max-h-48 overflow-y-auto mb-6">
                {simulationLog.map((log, idx) => (
                  <div key={idx} className="mb-1 leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4 flex gap-2">
            <button
              onClick={handleExportCsv}
              disabled={trialsTelemetry.length === 0}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-xl text-xs transition-colors border border-slate-300"
            >
              {t.exportCsv}
            </button>
            <button
              onClick={() => setIsTestbedOpen(false)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-xl text-xs transition-colors"
            >
              বন্ধ কৰক
            </button>
          </div>
        </div>
      </div>
    );
  }
};
