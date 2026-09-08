import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Brain,
  ArrowRight,
  Sparkles,
  Volume2,
  VolumeX,
  Sliders,
  Play,
  Shield,
  HelpCircle,
  Eye,
  CheckCircle,
  XCircle,
  Download,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SupportedLanguage } from '../../types/prescription';
import { REAL_WORLD_ODD_ONE_OUT_PERSONAS } from './types';
import type {
  OddOneOutDifficulty,
  OddOneOutGeneratedTrial,
  OddOneOutSettingsSnapshot,
  OddOneOutTrialTelemetry,
  OddOneOutSessionSummary,
  OasisOddOneOutPersona,
} from './types';
import { OddOneOutEngine, ODD_ONE_OUT_TIERS } from './engine';
import { oddOneOutAudio } from './audio';

export interface OddOneOutProps {
  language: SupportedLanguage;
  totalTrials?: number;
  initialTheta?: number;
  onSessionComplete?: (summary: OddOneOutSessionSummary) => void;
  onExit?: () => void;
}

type GameState = 'intro' | 'play' | 'feedback' | 'completed';

const UI_STRINGS = {
  as: {
    title: 'অমিলটো বাছক (Odd One Out)',
    desc: 'কেইবাটাও বস্তু একেলগে দেখুওৱা হ\'ব। বেছিভাগেই একে নিয়ম বা শ্ৰেণীৰ অন্তৰ্ভুক্ত, কিন্তু এটা সম্পূৰ্ণ পৃথক। যিমান সোনকালে পাৰে সেই অমিল বস্তুটো বাছক।',
    start: 'আৰম্ভ কৰক',
    next: 'পৰৱৰ্তী প্ৰশ্ন',
    exit: 'প্ৰস্থান কৰক',
    completed: 'অভিনন্দন! অধিবেশন সমাপ্ত',
    scoreMsg: (c: number, t: number) => `আপুনি ${t} টাৰ ভিতৰত ${c} টা অমিল বস্তু সঠিকভাৱে চিনাক্ত কৰিলে।`,
    autonomyGauge: 'আত্মনিৰ্ভৰশীলতা',
    thetaGauge: 'জ্ঞানীয় ক্ষমতা (θ)',
    tremorFiltered: 'কম্পন প্ৰতিৰোধ',
    ruleClueBtn: 'নিয়ম চাওক',
    spotlightBtn: 'স্পটলাইট সহায়',
    aiTestbed: 'AI ক্লিনিকেল পৰীক্ষাগাৰ',
    simulationMode: 'OASIS-2 ৰোগী অনুকৰণ',
    runSimulation: 'অনুকৰণ আৰম্ভ কৰক',
    exportCsv: 'CSV ৰিপ\'ৰ্ট ডাউনলোড',
    tierLabel: 'স্তৰ',
    mocaAbstraction: 'MoCA বিমূৰ্ত মান',
    staging: 'ক্লিনিকেল অৱস্থা',
    correct: 'সঠিক উত্তৰ!',
    incorrect: 'অশুদ্ধ! সঠিক উত্তৰটো চাওক।',
    oddQuestion: 'কোনটো বস্তু বাকী কেইটাৰ লগত নিমিলে?',
  },
  bn: {
    title: 'ভিন্নটি বাছুন (Odd One Out)',
    desc: 'কয়েকটি বস্তু একসাথে দেখানো হবে। বেশিরভাগ একই নিয়মের অন্তর্ভুক্ত, কিন্তু একটি সম্পূর্ণ ভিন্ন। যত দ্রুত সম্ভব সেই ভিন্ন বস্তুটি বেছে নিন।',
    start: 'শুরু করুন',
    next: 'পরবর্তী প্রশ্ন',
    exit: 'প্রস্থান করুন',
    completed: 'অভিনন্দন! অধিবেশন সমাপ্ত',
    scoreMsg: (c: number, t: number) => `আপনি ${t} টির মধ্যে ${c} টি ভিন্ন বস্তু সঠিকভাবে শনাক্ত করেছেন।`,
    autonomyGauge: 'স্বায়ত্তশাসন',
    thetaGauge: 'জ্ঞানীয় ক্ষমতা (θ)',
    tremorFiltered: 'কম্পন প্রতিরোধ',
    ruleClueBtn: 'নিয়ম দেখুন',
    spotlightBtn: 'স্পটলাইট সাহায্য',
    aiTestbed: 'AI ক্লিনিকাল টেস্টবেড',
    simulationMode: 'OASIS-2 রোগী অনুকরণ',
    runSimulation: 'অনুকরণ শুরু করুন',
    exportCsv: 'CSV রিপোর্ট ডাউনলোড',
    tierLabel: 'স্তর',
    mocaAbstraction: 'MoCA বিমূর্ত মান',
    staging: 'ক্লিনিকাল অবস্থা',
    correct: 'সঠিক উত্তর!',
    incorrect: 'ভুল! সঠিক উত্তরটি দেখুন।',
    oddQuestion: 'কোন বস্তুটি বাকিগুলোর সাথে মেলে না?',
  },
  hi: {
    title: 'अलग पहचानें (Odd One Out)',
    desc: 'कई वस्तुएं एक साथ प्रदर्शित होंगी। अधिकांश एक ही श्रेणी या नियम की हैं, किंतु एक वस्तु भिन्न है। शीघ्र उस भिन्न वस्तु को पहचानें।',
    start: 'शुरू करें',
    next: 'अगला प्रश्न',
    exit: 'बाहर निकलें',
    completed: 'बधाई हो! सत्र पूर्ण',
    scoreMsg: (c: number, t: number) => `आपने ${t} में से ${c} अलग वस्तुओं को सही पहचाना।`,
    autonomyGauge: 'स्वायत्तता स्कोर',
    thetaGauge: 'संज्ञानात्मक क्षमता (θ)',
    tremorFiltered: 'कंपन फिल्टर',
    ruleClueBtn: 'नियम देखें',
    spotlightBtn: 'स्पॉटलाइट सहायता',
    aiTestbed: 'AI क्लिनिकल टेस्टबेड',
    simulationMode: 'OASIS-2 रोगी सिमुलेशन',
    runSimulation: 'सिमुलेशन शुरू करें',
    exportCsv: 'CSV रिपोर्ट डाउनलोड',
    tierLabel: 'स्तर',
    mocaAbstraction: 'MoCA अमूर्त मान',
    staging: 'क्लिनिकल चरण',
    correct: 'सटीक उत्तर!',
    incorrect: 'अशुद्ध! सही उत्तर देखें।',
    oddQuestion: 'कौन सी वस्तु बाकी से मेल नहीं खाती?',
  },
  en: {
    title: 'Odd One Out (Semantic Reasoning)',
    desc: 'Several objects are displayed together. Most belong to the same category, while one is distinct. Identify the odd item as promptly as possible.',
    start: 'Start Session',
    next: 'Next Trial',
    exit: 'Finish & Exit',
    completed: 'Congratulations! Session Complete',
    scoreMsg: (c: number, t: number) => `You correctly identified ${c} out of ${t} odd items.`,
    autonomyGauge: 'Patient Autonomy',
    thetaGauge: 'Cognitive Ability (θ)',
    tremorFiltered: 'Tremors Filtered',
    ruleClueBtn: 'Category Rule',
    spotlightBtn: 'Spotlight Hint',
    aiTestbed: 'AI Clinical Testbed',
    simulationMode: 'OASIS-2 Patient Simulation',
    runSimulation: 'Run Simulation',
    exportCsv: 'Export CSV Telemetry',
    tierLabel: 'Tier',
    mocaAbstraction: 'MoCA Abstraction',
    staging: 'Clinical Stage',
    correct: 'Correct!',
    incorrect: 'Incorrect! Note the odd item.',
    oddQuestion: 'Which item does not belong with the others?',
  },
};

export const OddOneOut: React.FC<OddOneOutProps> = ({
  language,
  totalTrials = 5,
  initialTheta = 0.0,
  onSessionComplete,
  onExit,
}) => {
  const engine = useMemo(() => new OddOneOutEngine(initialTheta), [initialTheta]);

  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentTrialNumber, setCurrentTrialNumber] = useState(1);
  const [currentDifficulty, setCurrentDifficulty] = useState<OddOneOutDifficulty>(engine.getDifficulty());
  const [currentTrial, setCurrentTrial] = useState<OddOneOutGeneratedTrial | null>(null);

  // In-trial telemetry & state
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [isTrialCorrect, setIsTrialCorrect] = useState<boolean | null>(null);
  const [ruleClueRevealed, setRuleClueRevealed] = useState(false);
  const [spotlightHintUsed, setSpotlightHintUsed] = useState(false);
  const [eliminatedIndices, setEliminatedIndices] = useState<number[]>([]);
  const [trialStartTime, setTrialStartTime] = useState<number>(0);
  const [timeToFirstTap, setTimeToFirstTap] = useState<number>(0);
  const [trialsTelemetry, setTrialsTelemetry] = useState<OddOneOutTrialTelemetry[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  // AI Testbed drawer & live simulation
  const [isTestbedOpen, setIsTestbedOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<OasisOddOneOutPersona>(REAL_WORLD_ODD_ONE_OUT_PERSONAS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [autoAssistTriggered, setAutoAssistTriggered] = useState(false);

  // Auto-assist hesitation timer ref
  const assistTimerRef = useRef<any>(null);

  const t = UI_STRINGS[language] || UI_STRINGS.en;

  // Sound sync
  useEffect(() => {
    oddOneOutAudio.setMuted(isMuted);
  }, [isMuted]);

  // Handle Trial Start
  const startTrial = (trialIndex: number, diff: OddOneOutDifficulty) => {
    const trial = engine.generateTrial(diff, trialIndex);
    setCurrentTrial(trial);
    setCurrentDifficulty(diff);
    setSelectedItemIndex(null);
    setIsTrialCorrect(null);
    setSpotlightHintUsed(false);
    setEliminatedIndices([]);
    setAutoAssistTriggered(false);
    setTimeToFirstTap(0);

    // If tier has ruleClueAutoVisible (Tiers 1-2 for severe impairment)
    setRuleClueRevealed(diff.ruleClueAutoVisible);

    const now = Date.now();
    setTrialStartTime(now);
    setGameState('play');

    // Speak trial prompt if accessible
    oddOneOutAudio.speakGuidance(t.oddQuestion, language);

    // Arm Auto-Assist Hesitation Scaffolding
    if (assistTimerRef.current) clearTimeout(assistTimerRef.current);
    assistTimerRef.current = setTimeout(() => {
      handleAutoAssistIntervention(trial, diff);
    }, diff.autoAssistTimeoutMs);
  };

  // Auto-assist intervention after prolonged hesitation
  const handleAutoAssistIntervention = (trial: OddOneOutGeneratedTrial, diff: OddOneOutDifficulty) => {
    setAutoAssistTriggered(true);
    if (!ruleClueRevealed && diff.ruleClueAvailable) {
      setRuleClueRevealed(true);
      oddOneOutAudio.playClueChime();
      oddOneOutAudio.speakGuidance(trial.ruleExplanation[language], language);

      // Stage 2: If patient is STILL stuck after hearing the clue, trigger spotlight distractor elimination!
      if (assistTimerRef.current) clearTimeout(assistTimerRef.current);
      assistTimerRef.current = setTimeout(() => {
        triggerSpotlightHint(trial, diff);
      }, Math.min(8000, diff.autoAssistTimeoutMs || 8000));
    } else {
      triggerSpotlightHint(trial, diff);
    }
  };

  const handleStartGame = () => {
    startTrial(1, engine.getDifficulty());
  };

  // Toggle Rule Clue
  const toggleRuleClue = () => {
    if (!currentTrial || ruleClueRevealed) return;
    setRuleClueRevealed(true);
    oddOneOutAudio.playClueChime();
    oddOneOutAudio.speakGuidance(currentTrial.ruleExplanation[language], language);
  };

  // Trigger Golden Spotlight Distractor Eliminator
  const triggerSpotlightHint = (trial: OddOneOutGeneratedTrial | null = currentTrial, diff: OddOneOutDifficulty = currentDifficulty) => {
    if (!trial || spotlightHintUsed) return;
    const count = Math.max(1, diff.spotlightEliminatesCount || 1);
    const eliminated = engine.getSpotlightEliminations(trial, count);
    setEliminatedIndices(eliminated);
    setSpotlightHintUsed(true);
    oddOneOutAudio.playSpotlightChime();

    // Re-arm so if patient remains stuck after distractor elimination, reassurance continues
    if (assistTimerRef.current) clearTimeout(assistTimerRef.current);
    assistTimerRef.current = setTimeout(() => {
      oddOneOutAudio.playSpotlightChime();
      oddOneOutAudio.speakGuidance(trial.ruleExplanation[language], language);
    }, 8000);
  };

  // Handle Item Tap
  const handleItemTap = (index: number) => {
    if (gameState !== 'play' || !currentTrial) return;

    // Parkinsonian 400ms Tremor Guard
    const now = Date.now();
    if (!engine.filterTremorTap(now)) {
      oddOneOutAudio.playItemTap();
      return; // Micro-jitter suppressed without penalty
    }

    if (eliminatedIndices.includes(index)) return; // Eliminated item

    if (timeToFirstTap === 0) {
      setTimeToFirstTap(now - trialStartTime);
    }

    const deliberationMs = Math.max(800, now - trialStartTime);
    if (assistTimerRef.current) clearTimeout(assistTimerRef.current);

    setSelectedItemIndex(index);
    oddOneOutAudio.playItemTap();

    const isCorrect = index === currentTrial.oddItemIndex;
    setIsTrialCorrect(isCorrect);

    if (isCorrect) {
      oddOneOutAudio.playCorrectSound();
    } else {
      oddOneOutAudio.playIncorrectSound();
    }

    // Settings Snapshot
    const snap: OddOneOutSettingsSnapshot = {
      ruleClueRevealed,
      spotlightHintUsed,
      proactiveClueRequested: autoAssistTriggered,
      isManualTierOverride: false,
      soundMuted: isMuted,
    };

    // Bayesian 2PL IRT Ability Update
    const update = engine.updateTheta(isCorrect, deliberationMs, snap);
    const nextDiff = engine.deriveDifficultyFromTheta(update.newTheta);
    engine.setDifficulty(nextDiff);

    // Record Telemetry
    const telemetry: OddOneOutTrialTelemetry = {
      trialIndex: currentTrialNumber,
      tierLevel: currentDifficulty.tierLevel,
      totalItemsCount: currentDifficulty.choicesCount,
      oddItemId: currentTrial.oddItem.id,
      oddItemName: currentTrial.oddItem.name[language],
      commonCategoryId: currentTrial.commonCategory,
      selectedItemId: currentTrial.items[index].id,
      selectedItemIndex: index,
      isCorrect,
      ruleClueRevealed,
      spotlightHintUsed,
      eliminatedItemIndices: eliminatedIndices,
      deliberationTimeMs: deliberationMs,
      timeToFirstTapMs: timeToFirstTap || deliberationMs,
      totalTapsCount: 1,
      autonomyScore: update.autonomyScore,
      thetaAfterTrial: update.newTheta,
      difficultySnapshot: { ...currentDifficulty },
      settingsSnapshot: snap,
      aiAdaptiveReasoning: update.reasoning,
    };

    setTrialsTelemetry(prev => [...prev, telemetry]);
    setGameState('feedback');
  };

  const handleNextTrial = () => {
    if (currentTrialNumber < totalTrials) {
      const nextNum = currentTrialNumber + 1;
      setCurrentTrialNumber(nextNum);
      startTrial(nextNum, engine.getDifficulty());
    } else {
      handleCompleteSession();
    }
  };

  const handleCompleteSession = () => {
    setGameState('completed');
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.6 },
    });

    const summary = engine.compileSessionSummary(trialsTelemetry);
    if (onSessionComplete) {
      onSessionComplete(summary);
    }
  };

  // Run Real-time OASIS Patient Simulation
  const handleRunOasisSimulation = async () => {
    if (isSimulating || !currentTrial) return;
    setIsSimulating(true);
    setSimulationLog([]);

    const logEntry = (msg: string) => {
      setSimulationLog(prev => [...prev, msg]);
    };

    logEntry(`Starting OASIS-2 simulation for ${selectedPersona.name}...`);
    const action = engine.simulateOasisPatientAction(selectedPersona, currentTrial, currentDifficulty);

    if (action.hasTremorJitter) {
      logEntry(`Motor Tremor: 400ms Tremor Guard absorbed ${action.tremorJitterCount} involuntary jitter taps.`);
    }

    if (action.ruleClueRevealed) {
      setRuleClueRevealed(true);
      logEntry(`Caregiver Scaffolding: Rule clue revealed.`);
    }

    if (action.spotlightHintUsed) {
      setSpotlightHintUsed(true);
      setEliminatedIndices(action.eliminatedIndices);
      logEntry(`Caregiver Scaffolding: Spotlight eliminated non-odd item(s).`);
    }

    await new Promise(r => setTimeout(r, Math.min(2500, action.deliberationTimeMs / 2)));
    logEntry(action.clinicalObservation[language]);

    setSelectedItemIndex(action.selectedItemIndex);
    setIsTrialCorrect(action.isCorrect);
    if (action.isCorrect) oddOneOutAudio.playCorrectSound();
    else oddOneOutAudio.playIncorrectSound();

    const snap: OddOneOutSettingsSnapshot = {
      ruleClueRevealed: action.ruleClueRevealed,
      spotlightHintUsed: action.spotlightHintUsed,
      proactiveClueRequested: false,
      isManualTierOverride: false,
      soundMuted: isMuted,
    };

    const update = engine.updateTheta(action.isCorrect, action.deliberationTimeMs, snap);
    const nextDiff = engine.deriveDifficultyFromTheta(update.newTheta);
    engine.setDifficulty(nextDiff);

    const telemetry: OddOneOutTrialTelemetry = {
      trialIndex: currentTrialNumber,
      tierLevel: currentDifficulty.tierLevel,
      totalItemsCount: currentDifficulty.choicesCount,
      oddItemId: currentTrial.oddItem.id,
      oddItemName: currentTrial.oddItem.name[language],
      commonCategoryId: currentTrial.commonCategory,
      selectedItemId: action.selectedItemId,
      selectedItemIndex: action.selectedItemIndex,
      isCorrect: action.isCorrect,
      ruleClueRevealed: action.ruleClueRevealed,
      spotlightHintUsed: action.spotlightHintUsed,
      eliminatedItemIndices: action.eliminatedIndices,
      deliberationTimeMs: action.deliberationTimeMs,
      timeToFirstTapMs: action.deliberationTimeMs * 0.75,
      totalTapsCount: 1,
      autonomyScore: update.autonomyScore,
      thetaAfterTrial: update.newTheta,
      difficultySnapshot: { ...currentDifficulty },
      settingsSnapshot: snap,
      aiAdaptiveReasoning: update.reasoning,
    };

    setTrialsTelemetry(prev => [...prev, telemetry]);
    setGameState('feedback');
    setIsSimulating(false);
  };

  // CSV Telemetry Export
  const exportTelemetryCsv = () => {
    if (trialsTelemetry.length === 0) return;
    const headers = [
      'Trial',
      'Tier',
      'ItemsCount',
      'OddItem',
      'Selected',
      'IsCorrect',
      'DeliberationMs',
      'RuleClue',
      'SpotlightUsed',
      'AutonomyScore',
      'ThetaAfter',
    ];
    const rows = trialsTelemetry.map(t => [
      t.trialIndex,
      t.tierLevel,
      t.totalItemsCount,
      t.oddItemName,
      t.selectedItemId,
      t.isCorrect ? 1 : 0,
      t.deliberationTimeMs,
      t.ruleClueRevealed ? 1 : 0,
      t.spotlightHintUsed ? 1 : 0,
      t.autonomyScore,
      t.thetaAfterTrial.toFixed(3),
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `smritiner_odd_one_out_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const finalSummary = useMemo(() => {
    if (gameState !== 'completed') return null;
    return engine.compileSessionSummary(trialsTelemetry);
  }, [gameState, trialsTelemetry, engine]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (assistTimerRef.current) clearTimeout(assistTimerRef.current);
    };
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // INTRO SCREEN
  // ───────────────────────────────────────────────────────────────────────────
  if (gameState === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] p-6 text-center max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-gradient-to-tr from-amber-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-200">
          <Brain className="w-12 h-12 text-white animate-pulse" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">{t.title}</h1>
        <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">{t.desc}</p>

        <div className="flex flex-wrap gap-4 justify-center items-center">
          <button
            onClick={handleStartGame}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 text-lg transform hover:-translate-y-0.5"
          >
            {t.start} <ArrowRight className="w-6 h-6" />
          </button>
          <button
            onClick={() => setIsTestbedOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-4 px-6 rounded-2xl transition-all flex items-center gap-2 border border-slate-300"
          >
            <Sliders className="w-5 h-5 text-indigo-600" /> {t.aiTestbed}
          </button>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // COMPLETED SCREEN
  // ───────────────────────────────────────────────────────────────────────────
  if (gameState === 'completed' && finalSummary) {
    const ml = finalSummary.oasisClinicalClassification;
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center max-w-3xl mx-auto">
        <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6 shadow-md">
          <Sparkles className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">{t.completed}</h2>
        <p className="text-lg text-slate-600 mb-8">
          {t.scoreMsg(finalSummary.correctTrials, finalSummary.totalTrials)}
        </p>

        {/* Clinical Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mb-8 text-left">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {t.thetaGauge}
            </span>
            <span className="text-2xl font-black text-indigo-600">{finalSummary.finalTheta.toFixed(2)}</span>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {t.autonomyGauge}
            </span>
            <span className="text-2xl font-black text-emerald-600">{finalSummary.autonomyScore}%</span>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {t.mocaAbstraction}
            </span>
            <span className="text-2xl font-black text-purple-600">
              {finalSummary.estimatedMoCAAbstractionScore} / 5.0
            </span>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {t.tremorFiltered}
            </span>
            <span className="text-2xl font-black text-amber-600">{finalSummary.tremorTapsFilteredTotal}</span>
          </div>
        </div>

        {/* On-Device Edge ML Cognitive Classifier Staging */}
        {ml && (
          <div className="p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200 rounded-3xl w-full mb-8 text-left shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-indigo-700 tracking-wider uppercase flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> SmritiNER Edge ML Cognitive Staging
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-white rounded-full text-indigo-800 border border-indigo-200 shadow-sm">
                {(ml.confidenceScore * 100).toFixed(1)}% Confidence
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-1">{ml.predictedClass}</h3>
            <p className="text-sm text-slate-600 mb-3">
              Estimated MoCA Range: <strong className="text-slate-800">{ml.estimatedMoCARange}</strong>
            </p>
            {ml.clinicalAlert && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{ml.clinicalAlert}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={exportTelemetryCsv}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2 border border-slate-300"
          >
            <Download className="w-5 h-5 text-indigo-600" /> {t.exportCsv}
          </button>
          <button
            onClick={onExit}
            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all"
          >
            {t.exit}
          </button>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ACTIVE GAMEPLAY SCREEN
  // ───────────────────────────────────────────────────────────────────────────
  const gridColsClass =
    currentDifficulty.choicesCount === 3
      ? 'grid-cols-3'
      : currentDifficulty.choicesCount === 4
      ? 'grid-cols-2 sm:grid-cols-4'
      : currentDifficulty.choicesCount === 5
      ? 'grid-cols-2 sm:grid-cols-5'
      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6';

  return (
    <div className="flex flex-col items-center justify-between min-h-[75vh] p-4 max-w-5xl mx-auto w-full relative">
      {/* Top HUD Bar */}
      <div className="flex flex-wrap justify-between items-center w-full gap-3 bg-white/80 backdrop-blur p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <span className="text-xs font-black px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-lg tracking-wide uppercase">
            {t.tierLabel} {currentDifficulty.tierLevel}
          </span>
          <span className="text-sm font-semibold text-slate-600">
            Trial {currentTrialNumber} / {totalTrials}
          </span>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600">
            <span>θ:</span>
            <strong className="text-indigo-600 font-bold text-sm">{engine.getTheta().toFixed(2)}</strong>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Autonomy:</span>
            <strong className="text-emerald-600 font-bold text-sm">{engine.compileSessionSummary(trialsTelemetry).autonomyScore}%</strong>
          </div>
          {engine.getTremorFilteredCount() > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800">
              <span>Tremor Guard:</span>
              <span>{engine.getTremorFilteredCount()}</span>
            </div>
          )}

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all"
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-indigo-600" />}
          </button>
          <button
            onClick={() => setIsTestbedOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all"
            aria-label="AI Testbed"
          >
            <Sliders className="w-5 h-5 text-indigo-600" />
          </button>
        </div>
      </div>

      {/* Main Game Interaction Zone */}
      <div className="flex flex-col items-center flex-grow justify-center w-full max-w-4xl">
        <p className="text-xl md:text-2xl font-bold text-slate-800 mb-4 text-center">
          {t.oddQuestion}
        </p>

        {/* Category Rule Clue Display */}
        {ruleClueRevealed && currentTrial && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl max-w-xl text-center text-sm font-semibold flex items-center justify-center gap-2 shadow-sm animate-fade-in">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{currentTrial.ruleExplanation[language]}</span>
          </div>
        )}

        {/* Grid of Items */}
        {currentTrial && (
          <div className={`grid ${gridColsClass} gap-4 p-6 bg-slate-50 border border-slate-200 rounded-3xl shadow-inner w-full`}>
            {currentTrial.items.map((item, idx) => {
              const isEliminated = eliminatedIndices.includes(idx);
              const isSelected = idx === selectedItemIndex;
              const isOdd = idx === currentTrial.oddItemIndex;

              let cellStyle =
                'bg-white border-2 border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all transform active:scale-95 cursor-pointer rounded-3xl p-4 flex flex-col items-center justify-center aspect-square text-center select-none shadow-sm';

              if (isEliminated) {
                cellStyle =
                  'bg-slate-100 border border-slate-200 opacity-25 grayscale pointer-events-none rounded-3xl p-4 flex flex-col items-center justify-center aspect-square';
              } else if (gameState === 'feedback') {
                if (isOdd) {
                  cellStyle =
                    'bg-emerald-50 border-3 border-emerald-500 shadow-xl scale-105 rounded-3xl p-4 flex flex-col items-center justify-center aspect-square ring-4 ring-emerald-100';
                } else if (isSelected && !isOdd) {
                  cellStyle =
                    'bg-red-50 border-3 border-red-500 opacity-85 rounded-3xl p-4 flex flex-col items-center justify-center aspect-square';
                } else {
                  cellStyle =
                    'bg-slate-50 border border-slate-200 opacity-40 grayscale rounded-3xl p-4 flex flex-col items-center justify-center aspect-square';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleItemTap(idx)}
                  disabled={gameState !== 'play' || isEliminated}
                  className={cellStyle}
                  aria-label={item.name[language]}
                >
                  <span className="text-5xl sm:text-6xl mb-2 drop-shadow-sm">{item.symbol}</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-700 tracking-tight leading-tight line-clamp-1">
                    {item.name[language]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Feedback Banner */}
        {gameState === 'feedback' && (
          <div className="mt-8 flex flex-col items-center animate-fade-in">
            <div
              className={`flex items-center gap-2 text-2xl font-black mb-4 ${
                isTrialCorrect ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {isTrialCorrect ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
              <span>{isTrialCorrect ? t.correct : t.incorrect}</span>
            </div>
            <button
              onClick={handleNextTrial}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-12 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 text-lg transform hover:-translate-y-1"
            >
              {t.next} <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Assistance Toolbar (Dignified Scaffolding) */}
      {gameState === 'play' && currentTrial && (
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 w-full">
          {currentDifficulty.ruleClueAvailable && !ruleClueRevealed && (
            <button
              onClick={toggleRuleClue}
              className="px-5 py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all hover:shadow"
            >
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>{t.ruleClueBtn}</span>
            </button>
          )}

          {currentDifficulty.spotlightAllowed && !spotlightHintUsed && (
            <button
              onClick={() => triggerSpotlightHint(currentTrial, currentDifficulty)}
              className="px-5 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all hover:shadow"
            >
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>{t.spotlightBtn}</span>
            </button>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SLIDE-OUT AI TESTBED & CAREGIVER DRAWER */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {isTestbedOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Sliders className="w-6 h-6 text-indigo-600" /> {t.aiTestbed}
                </h3>
                <button
                  onClick={() => setIsTestbedOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* 9-Tier Selector */}
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Psychometric Tier (1 to 9)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ODD_ONE_OUT_TIERS.map(tier => (
                    <button
                      key={tier.tierLevel}
                      onClick={() => {
                        engine.setDifficulty(tier);
                        setCurrentDifficulty(tier);
                        if (gameState === 'play') {
                          startTrial(currentTrialNumber, tier);
                        }
                      }}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                        currentDifficulty.tierLevel === tier.tierLevel
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      Tier {tier.tierLevel} ({tier.choicesCount} items)
                    </button>
                  ))}
                </div>
              </div>

              {/* OASIS-2 Patient Personas */}
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  OASIS-2 Real Patient Persona
                </label>
                <div className="space-y-2">
                  {REAL_WORLD_ODD_ONE_OUT_PERSONAS.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPersona(p)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                        selectedPersona.id === p.id
                          ? 'bg-indigo-50 border-indigo-400 shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-2xl">{p.avatarIcon}</span>
                      <div className="flex-grow">
                        <div className="flex justify-between items-center">
                          <strong className="text-xs text-slate-800">{p.name}</strong>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              p.clinicalTier === 'NORMAL'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.clinicalTier === 'MCI'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {p.clinicalTier}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          Age: {p.age} | MMSE: {p.mmse} | CDR: {p.cdr}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulation Runner */}
              <div className="mb-6">
                <button
                  onClick={handleRunOasisSimulation}
                  disabled={isSimulating || gameState !== 'play'}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <Play className="w-4 h-4" /> {t.runSimulation}
                </button>

                {simulationLog.length > 0 && (
                  <div className="mt-3 p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl max-h-36 overflow-y-auto space-y-1">
                    {simulationLog.map((log, i) => (
                      <div key={i}>&gt; {log}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsTestbedOpen(false)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
