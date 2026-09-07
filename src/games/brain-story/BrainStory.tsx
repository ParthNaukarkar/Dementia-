import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  Activity,
  Award,
  ShieldAlert,
  Wrench,
  Volume2,
  VolumeX,
  RotateCcw,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sliders,
  Eye,
  EyeOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SupportedLanguage } from '../../types/prescription';
import type {
  BrainStoryDifficulty,
  BrainStoryGeneratedTrial,
  BrainStorySettingsSnapshot,
  BrainStoryTrialTelemetry,
  BrainStorySessionSummary,
  OasisBrainStoryPersona,
} from './types';
import { REAL_WORLD_BRAIN_STORY_PERSONAS } from './types';
import { BrainStoryEngine } from './engine';
import { brainStoryAudio } from './audio';

export interface BrainStoryProps {
  language: SupportedLanguage;
  totalTrials?: number;
  initialTheta?: number;
  onSessionComplete?: (summary: BrainStorySessionSummary) => void;
  onExit?: () => void;
}

type GameState = 'intro' | 'story' | 'question' | 'feedback' | 'completed';

const UI_STRINGS = {
  as: {
    title: 'মনৰ সাধুকথা (Brain Story)',
    desc: 'এটি চুটি আৰু পুৰণি পৰিচিত কাহিনী মন দি শুনক বা পঢ়ক। কাহিনী শেষ হোৱাৰ পিছত কোনে কি কৰিছিল আৰু কি ঘটিছিল সেই সম্পৰ্কে সোধা প্ৰশ্নৰ উত্তৰ দিয়ক।',
    start: 'সাধু শুনক',
    readyForQuestions: 'প্ৰশ্নৰ উত্তৰ দিয়ক',
    nextQuestion: 'পৰৱৰ্তী প্ৰশ্ন',
    nextStory: 'পৰৱৰ্তী সাধু',
    exit: 'প্ৰস্থান কৰক',
    completed: 'অভিনন্দন! সাধু মনত ৰখা সমাপ্ত',
    scoreMsg: (c: number, t: number) => `আপুনি ${t} টা প্ৰশ্নৰ ভিতৰত ${c} টা প্ৰশ্নৰ সঠিক উত্তৰ দিলে।`,
    autonomyGauge: 'আত্মনিৰ্ভৰশীলতা',
    thetaGauge: 'জ্ঞানীয় ক্ষমতা (θ)',
    tremorFiltered: 'কম্পন প্ৰতিৰোধ',
    replayAudio: 'পুনৰ শুনক',
    replaysLeft: (n: number) => `${n} বাৰ বাকী`,
    clueBtn: 'সংকেত চাওক',
    aiTestbed: 'AI ক্লিনিকেল পৰীক্ষাগাৰ',
    simulationMode: 'OASIS-2 ৰোগী অনুকৰণ',
    runSimulation: 'অনুকৰণ আৰম্ভ কৰক',
    exportCsv: 'CSV ৰিপ\'ৰ্ট ডাউনলোড',
    tierLabel: 'স্তৰ',
    wmsMemoryScore: 'WMS আখ্যান মান',
    mocaLanguage: 'MoCA ভাষা/স্মৃতি',
    staging: 'ক্লিনিকেল অৱস্থা',
    correct: 'অসাধাৰণ! সঠিক উত্তৰ!',
    incorrect: 'অশুদ্ধ উত্তৰ! সঠিক উত্তৰটো চাওক।',
    storyTextLabel: 'কাহিনীৰ মূল কথা:',
    hideStory: 'কাহিনী লুকুৱাওক',
    showStory: 'কাহিনী চাওক',
  },
  bn: {
    title: 'গল্প ও স্মৃতি (Brain Story)',
    desc: 'একটি ছোট ও চিরচেনা গল্প মনোযোগ দিয়ে শুনুন বা পড়ুন। গল্প শেষ হওয়ার পর কী ঘটেছিল ও কারা ছিল সে সম্পর্কিত প্রশ্নের উত্তর দিন।',
    start: 'গল্প শুনুন',
    readyForQuestions: 'প্রশ্নের উত্তর দিন',
    nextQuestion: 'পরবর্তী প্রশ্ন',
    nextStory: 'পরবর্তী গল্প',
    exit: 'প্রস্থান করুন',
    completed: 'অভিনন্দন! গল্প স্মৃতি সমাপ্ত',
    scoreMsg: (c: number, t: number) => `আপনি ${t} টি প্রশ্নের মধ্যে ${c} টি প্রশ্নের সঠিক উত্তর দিয়েছেন।`,
    autonomyGauge: 'স্বায়ত্তশাসন',
    thetaGauge: 'জ্ঞানীয় ক্ষমতা (θ)',
    tremorFiltered: 'কম্পন প্রতিরোধ',
    replayAudio: 'পুনরায় শুনুন',
    replaysLeft: (n: number) => `${n} বার বাকি`,
    clueBtn: 'সূত্র দেখুন',
    aiTestbed: 'AI ক্লিনিকাল টেস্টবেড',
    simulationMode: 'OASIS-2 রোগী অনুকরণ',
    runSimulation: 'অনুকরণ শুরু করুন',
    exportCsv: 'CSV রিপোর্ট ডাউনলোড',
    tierLabel: 'স্তর',
    wmsMemoryScore: 'WMS আখ্যান মান',
    mocaLanguage: 'MoCA ভাষা/স্মৃতি',
    staging: 'ক্লিনিকাল অবস্থা',
    correct: 'চমৎকার! সঠিক উত্তর!',
    incorrect: 'ভুল উত্তর! সঠিক উত্তরটি দেখুন।',
    storyTextLabel: 'গল্পের মূল বিবরণ:',
    hideStory: 'গল্প লুকান',
    showStory: 'গল্প দেখুন',
  },
  hi: {
    title: 'कहानी और यादें (Brain Story)',
    desc: 'एक छोटी और जानी-पहचानी कहानी ध्यान से सुनें या पढ़ें। कहानी के बाद उसमें क्या हुआ और कौन शामिल था, उससे जुड़े प्रश्नों के उत्तर दें।',
    start: 'कहानी सुनें',
    readyForQuestions: 'प्रश्नों के उत्तर दें',
    nextQuestion: 'अगला प्रश्न',
    nextStory: 'अगली कहानी',
    exit: 'बाहर निकलें',
    completed: 'बधाई हो! सत्र पूर्ण',
    scoreMsg: (c: number, t: number) => `आपने ${t} में से ${c} प्रश्नों के सही उत्तर दिए।`,
    autonomyGauge: 'स्वायत्तता स्कोर',
    thetaGauge: 'संज्ञानात्मक क्षमता (θ)',
    tremorFiltered: 'कंपन फिल्टर',
    replayAudio: 'पुनः सुनें',
    replaysLeft: (n: number) => `${n} शेष`,
    clueBtn: 'संकेत देखें',
    aiTestbed: 'AI क्लिनिकल टेस्टबेड',
    simulationMode: 'OASIS-2 रोगी सिमुलेशन',
    runSimulation: 'सिमुलेशन शुरू करें',
    exportCsv: 'CSV रिपोर्ट डाउनलोड',
    tierLabel: 'स्तर',
    wmsMemoryScore: 'WMS आख्यान मान',
    mocaLanguage: 'MoCA भाषा/स्मृति',
    staging: 'क्लिनिकल चरण',
    correct: 'अद्भुत! सटीक उत्तर!',
    incorrect: 'अशुद्ध उत्तर! सही उत्तर देखें।',
    storyTextLabel: 'कहानी का विवरण:',
    hideStory: 'कहानी छिपाएं',
    showStory: 'कहानी देखें',
  },
  en: {
    title: 'Brain Story (Logical Narrative Memory)',
    desc: 'Listen to or read a short reminiscent story. Afterwards, answer multiple-choice questions assessing who was involved, what happened, and key details.',
    start: 'Begin Story',
    readyForQuestions: 'Answer Questions',
    nextQuestion: 'Next Question',
    nextStory: 'Next Story',
    exit: 'Finish & Exit',
    completed: 'Congratulations! Story Recall Complete',
    scoreMsg: (c: number, t: number) => `You correctly answered ${c} out of ${t} story questions.`,
    autonomyGauge: 'Patient Autonomy',
    thetaGauge: 'Cognitive Ability (θ)',
    tremorFiltered: 'Tremors Filtered',
    replayAudio: 'Replay Story Audio',
    replaysLeft: (n: number) => `${n} left`,
    clueBtn: 'Reveal Clue',
    aiTestbed: 'AI Clinical Testbed',
    simulationMode: 'OASIS-2 Patient Simulation',
    runSimulation: 'Run Simulation',
    exportCsv: 'Export CSV Telemetry',
    tierLabel: 'Tier',
    wmsMemoryScore: 'WMS Logical Memory',
    mocaLanguage: 'MoCA Language/Memory',
    staging: 'Clinical Stage',
    correct: 'Splendid! Correct Answer!',
    incorrect: 'Incorrect! Inspect the story cue.',
    storyTextLabel: 'Story Passage:',
    hideStory: 'Hide Story',
    showStory: 'Show Story',
  },
};

export const BrainStory: React.FC<BrainStoryProps> = ({
  language,
  totalTrials = 3,
  initialTheta = 0.0,
  onSessionComplete,
  onExit,
}) => {
  const engine = useMemo(() => new BrainStoryEngine(initialTheta), [initialTheta]);

  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentTrialNumber, setCurrentTrialNumber] = useState(1);
  const [currentDifficulty, setCurrentDifficulty] = useState<BrainStoryDifficulty>(engine.getDifficulty());
  const [currentTrial, setCurrentTrial] = useState<BrainStoryGeneratedTrial | null>(null);

  // In-trial question index
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isQuestionCorrect, setIsQuestionCorrect] = useState<boolean | null>(null);

  // Assistance tools state
  const [audioReplaysUsed, setAudioReplaysUsed] = useState(0);
  const [cluesUsedCount, setCluesUsedCount] = useState(0);
  const [isClueVisible, setIsClueVisible] = useState(false);
  const [isStoryExpanded, setIsStoryExpanded] = useState(true);
  const [isNarrating, setIsNarrating] = useState(false);
  const [highlightedSentenceIndex, setHighlightedSentenceIndex] = useState<number>(-1);

  // In-trial telemetry & timers
  const [trialStartTime, setTrialStartTime] = useState<number>(0);
  const [timeToFirstTap, setTimeToFirstTap] = useState<number>(0);
  const [totalTapsCount, setTotalTapsCount] = useState<number>(0);
  const [trialSelectedOptions, setTrialSelectedOptions] = useState<number[]>([]);
  const [trialCorrectCount, setTrialCorrectCount] = useState(0);
  const [trialsTelemetry, setTrialsTelemetry] = useState<BrainStoryTrialTelemetry[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [tremorCount, setTremorCount] = useState(0);

  // AI Testbed drawer & live simulation
  const [isTestbedOpen, setIsTestbedOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<OasisBrainStoryPersona>(REAL_WORLD_BRAIN_STORY_PERSONAS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [autoAssistTriggered, setAutoAssistTriggered] = useState(false);

  const assistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = UI_STRINGS[language] || UI_STRINGS.en;

  // Sync mute state
  useEffect(() => {
    brainStoryAudio.setMuted(isMuted);
  }, [isMuted]);

  // Clean up narration and timers on unmount
  useEffect(() => {
    return () => {
      brainStoryAudio.stopSpeaking();
      if (assistTimerRef.current) clearTimeout(assistTimerRef.current);
    };
  }, []);

  // Handle Trial Start
  const startTrial = (trialIndex: number, diff: BrainStoryDifficulty) => {
    brainStoryAudio.stopSpeaking();
    const trial = engine.generateTrial(trialIndex, diff);
    setCurrentTrial(trial);
    setCurrentDifficulty(diff);
    setActiveQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsQuestionCorrect(null);
    setAudioReplaysUsed(0);
    setCluesUsedCount(0);
    setIsClueVisible(false);
    setAutoAssistTriggered(false);
    setTimeToFirstTap(0);
    setTotalTapsCount(0);
    setTrialSelectedOptions([]);
    setTrialCorrectCount(0);
    setIsStoryExpanded(diff.storyVisibleDuringQuestions);
    setHighlightedSentenceIndex(-1);

    setGameState('story');
    brainStoryAudio.playStoryStart();

    // Auto-narrate initial story sentences
    narrateStory(trial, diff);
  };

  // Narrate Story Sentences Sequentially
  const narrateStory = (trial: BrainStoryGeneratedTrial, _diff: BrainStoryDifficulty) => {
    setIsNarrating(true);
    const sentences = trial.story.sentences[language] || trial.story.sentences.en;
    const targetCount = Math.min(sentences.length, trial.difficulty.sentenceCount);

    let currentIndex = 0;

    const playNext = () => {
      if (currentIndex >= targetCount) {
        setIsNarrating(false);
        setHighlightedSentenceIndex(-1);
        return;
      }
      setHighlightedSentenceIndex(currentIndex);
      const text = sentences[currentIndex];
      currentIndex++;
      brainStoryAudio.speakStorySentence(text, language, () => {
        playNext();
      });
    };

    playNext();
  };

  // Replay Audio
  const handleReplayAudio = () => {
    if (!currentTrial || audioReplaysUsed >= currentDifficulty.audioReplaysAllowed || isNarrating) return;
    setAudioReplaysUsed(prev => prev + 1);
    brainStoryAudio.playReplayChime();
    narrateStory(currentTrial, currentDifficulty);
  };

  // Proceed from Story Phase to Questions
  const handleProceedToQuestions = () => {
    brainStoryAudio.stopSpeaking();
    setIsNarrating(false);
    setHighlightedSentenceIndex(-1);
    const now = Date.now();
    setTrialStartTime(now);
    setGameState('question');

    // Arm Auto-Assist Timer
    armAutoAssistTimer(currentTrial, currentDifficulty);
  };

  // Arm Auto-Assist Timer for Prolonged Hesitation
  const armAutoAssistTimer = (trial: BrainStoryGeneratedTrial | null, diff: BrainStoryDifficulty) => {
    if (assistTimerRef.current) clearTimeout(assistTimerRef.current);
    assistTimerRef.current = setTimeout(() => {
      handleAutoAssistIntervention(trial, diff);
    }, diff.autoAssistTimeoutMs);
  };

  const handleAutoAssistIntervention = (_trial: BrainStoryGeneratedTrial | null, diff: BrainStoryDifficulty) => {
    setAutoAssistTriggered(true);
    if (diff.clueHintAllowed && !isClueVisible) {
      setIsClueVisible(true);
      setCluesUsedCount(prev => prev + 1);
      brainStoryAudio.playClueChime();
    }
  };

  // Reveal Clue Hint
  const handleRevealClue = () => {
    if (isClueVisible || !currentDifficulty.clueHintAllowed) return;
    setIsClueVisible(true);
    setCluesUsedCount(prev => prev + 1);
    brainStoryAudio.playClueChime();
  };

  // Handle Option Tap
  const handleOptionTap = (optionIndex: number) => {
    if (gameState !== 'question' || !currentTrial) return;

    const now = Date.now();

    // 400ms Parkinsonian tremor filter
    if (!engine.filterTremorTap(optionIndex, now)) {
      brainStoryAudio.playOptionTap();
      setTremorCount(engine.getTremorFilteredCount());
      return; // Micro-jitter suppressed
    }

    brainStoryAudio.playOptionTap();
    setTotalTapsCount(prev => prev + 1);

    if (timeToFirstTap === 0) {
      setTimeToFirstTap(now - trialStartTime);
    }

    if (assistTimerRef.current) clearTimeout(assistTimerRef.current);

    setSelectedOptionIndex(optionIndex);
    const activeQ = currentTrial.activeQuestions[activeQuestionIndex];
    const isCorrect = optionIndex === activeQ.correctOptionIndex;
    setIsQuestionCorrect(isCorrect);

    const updatedSelected = [...trialSelectedOptions, optionIndex];
    setTrialSelectedOptions(updatedSelected);

    const updatedCorrect = isCorrect ? trialCorrectCount + 1 : trialCorrectCount;
    setTrialCorrectCount(updatedCorrect);

    if (isCorrect) {
      brainStoryAudio.playSuccessChime();
    } else {
      brainStoryAudio.playErrorChime();
    }

    setGameState('feedback');
  };

  // Next Question or Next Story Trial
  const handleNextStep = () => {
    if (!currentTrial) return;

    const nextQIndex = activeQuestionIndex + 1;
    if (nextQIndex < currentTrial.activeQuestions.length) {
      // Advance to next question in this story
      setActiveQuestionIndex(nextQIndex);
      setSelectedOptionIndex(null);
      setIsQuestionCorrect(null);
      setIsClueVisible(false);
      setGameState('question');
      armAutoAssistTimer(currentTrial, currentDifficulty);
    } else {
      // Story trial complete, update Bayesian IRT
      completeTrial(trialSelectedOptions, trialCorrectCount);
    }
  };

  // Complete Trial & Update Bayesian 2PL IRT
  const completeTrial = (finalSelected: number[], finalCorrectCount: number) => {
    if (!currentTrial) return;

    const deliberationMs = Math.max(1000, Date.now() - trialStartTime);
    const totalQ = currentTrial.activeQuestions.length;
    const isAllCorrect = finalCorrectCount === totalQ;
    const questionsRatio = totalQ > 0 ? finalCorrectCount / totalQ : 0;

    const settingsSnapshot: BrainStorySettingsSnapshot = {
      audioReplaysUsed,
      maxReplaysAllowed: currentDifficulty.audioReplaysAllowed,
      cluesUsedCount,
      storyVisible: isStoryExpanded,
      isManualTierOverride: false,
      soundMuted: isMuted,
    };

    const { newTheta, autonomyScore, reasoning } = engine.updateTheta(
      isAllCorrect,
      deliberationMs,
      settingsSnapshot,
      questionsRatio
    );

    const trialRecord: BrainStoryTrialTelemetry = {
      trialIndex: currentTrialNumber,
      tierLevel: currentDifficulty.tierLevel,
      storyId: currentTrial.story.id,
      totalQuestions: totalQ,
      correctQuestionsCount: finalCorrectCount,
      isAllCorrect,
      selectedOptionIndices: finalSelected,
      deliberationTimeMs: deliberationMs,
      timeToFirstTapMs: timeToFirstTap || deliberationMs,
      totalTapsCount: totalTapsCount + 1,
      audioReplaysUsed,
      cluesUsedCount,
      autonomyScore,
      thetaAfterTrial: newTheta,
      difficultySnapshot: { ...currentDifficulty },
      settingsSnapshot,
      aiAdaptiveReasoning: reasoning,
    };

    setTrialsTelemetry(prev => [...prev, trialRecord]);

    if (currentTrialNumber < totalTrials) {
      const nextTrialNum = currentTrialNumber + 1;
      setCurrentTrialNumber(nextTrialNum);
      const nextDiff = engine.deriveDifficultyFromTheta(engine.getTheta());
      startTrial(nextTrialNum, nextDiff);
    } else {
      finishSession();
    }
  };

  // Complete Full Session
  const finishSession = () => {
    brainStoryAudio.stopSpeaking();
    setGameState('completed');
    confetti({ particleCount: 95, spread: 80, origin: { y: 0.6 } });

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
    if (gameState === 'story' || gameState === 'question') {
      startTrial(currentTrialNumber, diff);
    }
  };

  // Run Real-World OASIS-2 Patient Simulation
  const handleRunOasisSimulation = async () => {
    setIsSimulating(true);
    setSimulationLog([]);

    const simTelemetry: BrainStoryTrialTelemetry[] = [];
    const simEngine = new BrainStoryEngine(0.0);
    const persona = selectedPersona;

    setSimulationLog(prev => [
      ...prev,
      `--- Starting Authentic OASIS-2 Simulation: ${persona.name} (${persona.clinicalDiagnosis}, MMSE ${persona.mmse}, CDR ${persona.cdr}) ---`,
    ]);

    for (let trialIdx = 1; trialIdx <= 4; trialIdx++) {
      const diff = simEngine.deriveDifficultyFromTheta(simEngine.getTheta());
      const trial = simEngine.generateTrial(trialIdx, diff);

      const simResult = simEngine.simulateOasisPatientAction(persona, trial, diff);

      const totalQ = trial.activeQuestions.length;
      const questionsRatio = totalQ > 0 ? simResult.correctCount / totalQ : 0;

      const settings: BrainStorySettingsSnapshot = {
        audioReplaysUsed: simResult.audioReplaysUsed,
        maxReplaysAllowed: diff.audioReplaysAllowed,
        cluesUsedCount: simResult.cluesUsedCount,
        storyVisible: diff.storyVisibleDuringQuestions,
        isManualTierOverride: false,
        soundMuted: true,
      };

      const { newTheta, autonomyScore, reasoning } = simEngine.updateTheta(
        simResult.isAllCorrect,
        simResult.deliberationTimeMs,
        settings,
        questionsRatio
      );

      simTelemetry.push({
        trialIndex: trialIdx,
        tierLevel: diff.tierLevel,
        storyId: trial.story.id,
        totalQuestions: totalQ,
        correctQuestionsCount: simResult.correctCount,
        isAllCorrect: simResult.isAllCorrect,
        selectedOptionIndices: simResult.selectedOptionIndices,
        deliberationTimeMs: simResult.deliberationTimeMs,
        timeToFirstTapMs: Math.round(simResult.deliberationTimeMs * 0.45),
        totalTapsCount: totalQ + simResult.tremorJitterCount,
        audioReplaysUsed: simResult.audioReplaysUsed,
        cluesUsedCount: simResult.cluesUsedCount,
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
      'StoryId',
      'TotalQuestions',
      'CorrectQuestions',
      'IsAllCorrect',
      'AudioReplaysUsed',
      'CluesUsedCount',
      'DeliberationMs',
      'TimeToFirstTapMs',
      'AutonomyScore',
      'ThetaAfterTrial',
    ];
    const rows = trialsTelemetry.map(t => [
      t.trialIndex,
      t.tierLevel,
      t.storyId,
      t.totalQuestions,
      t.correctQuestionsCount,
      t.isAllCorrect ? 1 : 0,
      t.audioReplaysUsed,
      t.cluesUsedCount,
      t.deliberationTimeMs,
      t.timeToFirstTapMs,
      t.autonomyScore,
      t.thetaAfterTrial,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smriti_brain_story_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Active Question and Story sentences
  const activeQuestion = useMemo(() => {
    if (!currentTrial || !currentTrial.activeQuestions[activeQuestionIndex]) return null;
    return currentTrial.activeQuestions[activeQuestionIndex];
  }, [currentTrial, activeQuestionIndex]);

  const displayedSentences = useMemo(() => {
    if (!currentTrial) return [];
    const list = currentTrial.story.sentences[language] || currentTrial.story.sentences.en;
    return list.slice(0, currentTrial.difficulty.sentenceCount);
  }, [currentTrial, language]);

  // --- RENDER INTRO ---
  if (gameState === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] p-6 text-center max-w-3xl mx-auto">
        <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-rose-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-amber-200">
          <BookOpen className="w-12 h-12 text-amber-700" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">{t.title}</h1>
        <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">{t.desc}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-8 max-w-xl">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
            <span className="text-xs text-amber-700 font-semibold uppercase tracking-wider block">ক্লিনিকেল মানদণ্ড</span>
            <span className="text-lg font-bold text-slate-800">WMS-IV Logical</span>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-center">
            <span className="text-xs text-rose-700 font-semibold uppercase tracking-wider block">মনোমিতিক স্তৰ</span>
            <span className="text-lg font-bold text-slate-800">Tiers 1 to 9</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
            <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider block">কম্পন ফিল্টাৰ</span>
            <span className="text-lg font-bold text-slate-800">400ms Guard</span>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 text-center">
            <span className="text-xs text-indigo-700 font-semibold uppercase tracking-wider block">শ্ৰব্য আখ্যান</span>
            <span className="text-lg font-bold text-slate-800">Voice Narrator</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => startTrial(1, engine.getDifficulty())}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3.5 px-10 rounded-2xl shadow-lg hover:shadow-amber-200 hover:scale-[1.02] transition-all flex items-center gap-3 text-lg"
          >
            {t.start} <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsTestbedOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3.5 px-6 rounded-2xl transition-all flex items-center gap-2 border border-slate-300"
          >
            <Sliders className="w-5 h-5 text-amber-700" />
            {t.aiTestbed}
          </button>
        </div>

        {renderTestbedDrawer()}
      </div>
    );
  }

  // --- RENDER COMPLETED ---
  if (gameState === 'completed') {
    const summary = engine.compileSessionSummary(trialsTelemetry);

    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] p-6 text-center max-w-3xl mx-auto">
        <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-emerald-200">
          <Sparkles className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">{t.completed}</h2>
        <p className="text-lg text-slate-600 mb-8">{t.scoreMsg(summary.correctQuestions, summary.totalQuestions)}</p>

        {/* Clinical Summary Grid */}
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
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">{t.wmsMemoryScore}</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">{summary.wmsLogicalMemoryScaledScore}/19</span>
            <span className="text-xs text-slate-500 block">WMS Scaled Score</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">{t.mocaLanguage}</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">{summary.estimatedMoCALanguageScore}/5.0</span>
            <span className="text-xs text-slate-500 block">MoCA Subscore</span>
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
              <Activity className="w-5 h-5 text-amber-700" />
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{t.staging}</h4>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
              {summary.oasisClinicalClassification?.clinicalTier || 'NORMAL'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-700 block">আখ্যান স্মৃতি (Phenotype):</span>
              {summary.narrativeRetentionStatus}
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">বোধগম্যতা (Comprehension):</span>
              {summary.storyComprehensionProfile}
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">আত্মনিৰ্ভৰশীলতা (Autonomy):</span>
              {summary.autonomyScore}% (পুনৰাবৃত্তি: {summary.totalReplaysUsed}, সংকেত: {summary.totalCluesUsed})
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
            <Sliders className="w-4 h-4 text-amber-700" />
            {t.aiTestbed}
          </button>
        </div>

        {renderTestbedDrawer()}
      </div>
    );
  }

  // --- RENDER MAIN GAMEPLAY (STORY / QUESTION / FEEDBACK) ---
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 max-w-3xl mx-auto w-full select-none">
      {/* Top Clinical HUD Bar */}
      <div className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-lg">
            {t.tierLabel} {currentDifficulty.tierLevel}
          </span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Story {currentTrialNumber} of {totalTrials}
            {gameState !== 'story' && currentTrial && ` • Q${activeQuestionIndex + 1}/${currentTrial.activeQuestions.length}`}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>θ: {engine.getTheta().toFixed(2)}</span>
          </div>
          {autoAssistTriggered && (
            <div className="hidden sm:flex items-center gap-1 text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Scaffolding</span>
            </div>
          )}
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
            className="text-slate-500 hover:text-amber-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PHASE 1: STORY READING & NARRATION */}
      {gameState === 'story' && currentTrial && (
        <div className="w-full bg-amber-50/60 border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-6 text-left">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentTrial.story.icon}</span>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-amber-950">
                  {currentTrial.story.title[language] || currentTrial.story.title.en}
                </h3>
                <span className="text-xs text-amber-800/80 font-medium">
                  {currentDifficulty.tierDescription[language]}
                </span>
              </div>
            </div>

            {currentDifficulty.audioReplaysAllowed > 0 && (
              <button
                onClick={handleReplayAudio}
                disabled={audioReplaysUsed >= currentDifficulty.audioReplaysAllowed || isNarrating}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  audioReplaysUsed < currentDifficulty.audioReplaysAllowed
                    ? 'bg-white border-amber-300 text-amber-900 hover:bg-amber-100 shadow-sm'
                    : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                <span>{t.replayAudio}</span>
                <span className="bg-amber-200/80 px-1.5 py-0.5 rounded-full text-[10px]">
                  {t.replaysLeft(currentDifficulty.audioReplaysAllowed - audioReplaysUsed)}
                </span>
              </button>
            )}
          </div>

          {/* Story Sentences with Live Narration Highlighting */}
          <div className="space-y-3 mb-8">
            {displayedSentences.map((sentence, sIdx) => {
              const isSentenceActive = highlightedSentenceIndex === sIdx;
              return (
                <p
                  key={sIdx}
                  className={`text-base sm:text-lg leading-relaxed p-2.5 rounded-xl transition-all duration-200 ${
                    isSentenceActive
                      ? 'bg-amber-200 text-amber-950 font-semibold shadow-sm ring-2 ring-amber-300'
                      : 'text-slate-800'
                  }`}
                >
                  {sentence}
                </p>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleProceedToQuestions}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3.5 px-8 rounded-2xl shadow-md hover:shadow-amber-200 transition-all flex items-center gap-2 text-base"
            >
              <span>{t.readyForQuestions}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: QUESTIONS & COMPREHENSION RECALL */}
      {(gameState === 'question' || gameState === 'feedback') && activeQuestion && currentTrial && (
        <div className="w-full flex flex-col items-center">
          {/* Supportive Story Collapsible Card (Available on Tiers 1-4) */}
          {currentDifficulty.storyVisibleDuringQuestions && (
            <div className="w-full bg-amber-50/50 border border-amber-200 rounded-2xl p-4 mb-5 text-left transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-amber-900 text-xs font-bold uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>{t.storyTextLabel}</span>
                </div>
                <button
                  onClick={() => setIsStoryExpanded(!isStoryExpanded)}
                  className="text-xs text-amber-800 hover:text-amber-950 font-medium flex items-center gap-1"
                >
                  {isStoryExpanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{isStoryExpanded ? t.hideStory : t.showStory}</span>
                </button>
              </div>
              {isStoryExpanded && (
                <div className="space-y-1 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-32 overflow-y-auto">
                  {displayedSentences.map((s, idx) => (
                    <p key={idx}>{s}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Question Card */}
          <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-6 text-left">
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg uppercase">
                {activeQuestion.elementCategory}
              </span>

              {currentDifficulty.clueHintAllowed && (
                <button
                  onClick={handleRevealClue}
                  disabled={isClueVisible}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    !isClueVisible
                      ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 shadow-sm'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t.clueBtn}</span>
                </button>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-6 leading-relaxed">
              {activeQuestion.questionText[language] || activeQuestion.questionText.en}
            </h3>

            {/* Revealed Clue Box */}
            {isClueVisible && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 mb-6 text-xs text-amber-950 leading-relaxed flex items-start gap-2 animate-fadeIn">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{activeQuestion.clueHintText[language] || activeQuestion.clueHintText.en}</span>
              </div>
            )}

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {(activeQuestion.options[language] || activeQuestion.options.en).map((optionText, oIdx) => {
                const isSelected = selectedOptionIndex === oIdx;
                const isCorrectOption = oIdx === activeQuestion.correctOptionIndex;

                let optionStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-amber-50/50 hover:border-amber-300';

                if (gameState === 'feedback') {
                  if (isCorrectOption) {
                    optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-300';
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = 'bg-rose-50 border-rose-400 text-rose-950 line-through';
                  } else {
                    optionStyle = 'bg-slate-100/50 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleOptionTap(oIdx)}
                    disabled={gameState === 'feedback'}
                    className={`p-4 rounded-2xl border-2 text-left font-medium text-sm sm:text-base transition-all duration-150 active:scale-[0.98] flex items-center justify-between cursor-pointer ${optionStyle}`}
                  >
                    <span>{optionText}</span>
                    {gameState === 'feedback' && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {gameState === 'feedback' && isSelected && !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback & Advance Button */}
          {gameState === 'feedback' && (
            <div className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                {isQuestionCorrect ? (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{t.correct}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-600">
                    <XCircle className="w-5 h-5" />
                    <span>{t.incorrect}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleNextStep}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md hover:shadow-amber-200 transition-all flex items-center gap-2 text-sm"
              >
                <span>
                  {activeQuestionIndex + 1 < currentTrial.activeQuestions.length ? t.nextQuestion : t.nextStory}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
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
              <div className="flex items-center gap-2 text-amber-800 font-bold text-lg">
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
                  className="p-2.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-xs font-medium text-slate-700 text-left"
                >
                  <span className="font-bold block text-indigo-600">Full Autonomy</span>
                  Tier 8 (5 Sentences, No Replays)
                </button>
                <button
                  onClick={() => applyAssistancePreset('support')}
                  className="p-2.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-xs font-medium text-slate-700 text-left"
                >
                  <span className="font-bold block text-emerald-600">Gentle Support</span>
                  Tier 5 (3 Sentences, 1 Replay)
                </button>
                <button
                  onClick={() => applyAssistancePreset('scaffolding')}
                  className="p-2.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-xs font-medium text-slate-700 text-left"
                >
                  <span className="font-bold block text-amber-600">High Scaffolding</span>
                  Tier 3 (2 Sentences, Persistent Text)
                </button>
                <button
                  onClick={() => applyAssistancePreset('floor')}
                  className="p-2.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-xs font-medium text-slate-700 text-left"
                >
                  <span className="font-bold block text-rose-600">Palliative Floor</span>
                  Tier 1 (1 Sentence, 2 Replays)
                </button>
              </div>
            </div>

            {/* 9-Tier Fine-Grained Slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  মনোমিতিক স্তৰ বাছনি (1 to 9)
                </label>
                <span className="text-xs font-bold text-amber-800">Tier {currentDifficulty.tierLevel}</span>
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
                  if (gameState === 'story' || gameState === 'question') {
                    startTrial(currentTrialNumber, diff);
                  }
                }}
                className="w-full accent-amber-600 cursor-pointer"
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
                  const found = REAL_WORLD_BRAIN_STORY_PERSONAS.find(p => p.id === e.target.value);
                  if (found) setSelectedPersona(found);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 mb-3"
              >
                {REAL_WORLD_BRAIN_STORY_PERSONAS.map(p => (
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
                className="w-full bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Activity className="w-4 h-4" />
                <span>{isSimulating ? 'অনুকৰণ চলি আছে...' : t.runSimulation}</span>
              </button>
            </div>

            {/* Simulation Terminal Log */}
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
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-5 rounded-xl text-xs transition-colors"
            >
              বন্ধ কৰক
            </button>
          </div>
        </div>
      </div>
    );
  }
};
