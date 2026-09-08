import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Sliders, 
  Brain, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  ChevronRight,
  Disc3,
  Sun,
  Wind,
  Bell,
  Sparkles,
  Music,
  Flower2,
  Flame,
  Heart,
  Undo2,
  RotateCcw
} from 'lucide-react';
import type { 
  SequenceRecallProps, 
  SequenceRecallSessionSummary, 
  TrialTelemetry
} from './types';
import { SequenceRecallEngine } from './engine';
import { getItemById } from './items-catalog';
import { sequenceAudio } from './audio';
import { AdaptiveAssistanceEngine } from '../../engine/adaptive-assistance';

type SequencePhase = 'PRESENTATION' | 'RETENTION_PAUSE' | 'RECALL' | 'FEEDBACK' | 'SESSION_COMPLETE';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  drum: Disc3,
  hat: Sun,
  horn: Wind,
  bell: Bell,
  clapper: Sparkles,
  flute: Music,
  lotus: Flower2,
  lamp: Flame,
};

const LOCALIZED_UI = {
  as: {
    title: 'সুৰৰ ক্ৰম (Sequence Recall)',
    subtitle: 'বস্তুবোৰৰ ক্ৰম মনত ৰাখক',
    watchHeading: 'মন দি চাওক: বস্তুবোৰ এটা এটাকৈ জ্বলিব',
    watchSub: 'বস্তুৰ ক্ৰমটো মনত ৰাখক। কোনো খৰখেদা নাই।',
    pauseHeading: 'মনত সাঁচি ৰাখক... ক্ষন্তেক জিৰাওক',
    recallHeadingForward: 'ক্ৰমত বাছক: যিদৰে আহিছিল সেই ক্ৰমত স্পৰ্শ কৰক',
    recallHeadingReverse: 'উলোটা ক্ৰমত বাছক: শেষৰ পৰা প্ৰথমলৈ স্পৰ্শ কৰক',
    recallSub: (current: number, total: number) => `পদক্ষেপ ${current} / ${total}`,
    undo: 'পূৰ্বৰ পদক্ষেপ বাতিল কৰক (Undo)',
    correctFeedback: 'অতি উত্তম! আপুনি সম্পূৰ্ণ ক্ৰমটো সঠিককৈ মনত ৰাখিলে!',
    partialFeedback: 'বহুত ভাল চেষ্টা! আপোনাৰ ক্ৰম পঞ্জীয়ন হ’ল।',
    nextTrial: 'পৰৱৰ্তী ক্ৰম (Next Sequence) ➔',
    finish: 'ফলাফল চাওক (View Report)',
    audioOn: 'শব্দ অন (Audio Cues ON)',
    audioMute: 'শব্দ বন্ধ (Muted)',
    autoAssistBeacon: 'AI সহায়: পৰৱৰ্তী বস্তুটো বাছনি কৰিবলৈ ইংগিত দিয়া হৈছে',
    encouragement: 'ধীৰে ধীৰে কৰক, কোনো তাৰা নাই। আপুনি বৰ ভাল কৰিছে।',
    watchedHeading: 'ক্ৰমটো মনত ৰাখিলেনে?',
    watchedPrompt: 'আৰামসে সময় লওক, কোনো খৰখেদা নাই। আপুনি সাজু হ’লে তলৰ বুটামত টিপক:',
    readyToRecall: 'মই সাজু, এতিয়া বাছক ➔ (Start Recall)',
    replaySequence: 'ক্ৰমটো পুনৰ চাওক ↺ (Replay Sequence)'
  },
  bn: {
    title: 'সুরের ক্রম (Sequence Recall)',
    subtitle: 'বস্তুগুলোর সঠিক ক্রম মনে রাখুন',
    watchHeading: 'মন দিয়ে দেখুন: বস্তুগুলো একে একে জ্বলবে',
    watchSub: 'সঠিক ক্রমটি মনে রাখুন। কোনো তাড়াহুড়ো নেই।',
    pauseHeading: 'মনে ধরে রাখুন... শান্তভাবে স্মরণ করুন',
    recallHeadingForward: 'ক্রমে স্পর্শ করুন: যে ক্রমে এসেছিল সেই অনুযায়ী বেছে নিন',
    recallHeadingReverse: 'উল্টো ক্রমে স্পর্শ করুন: শেষ থেকে প্রথম দিকে বেছে নিন',
    recallSub: (current: number, total: number) => `পদক্ষেপ ${current} / ${total}`,
    undo: 'আগের পদক্ষেপ বাতিল (Undo)',
    correctFeedback: 'দারুণ! আপনি পুরো ক্রমটি নির্ভুলভাবে মনে রেখেছেন!',
    partialFeedback: 'খুব ভালো প্রয়াস! আপনার স্মৃতি প্রশংসনীয়।',
    nextTrial: 'পরবর্তী ক্রম (Next Sequence) ➔',
    finish: 'রিপোর্ট দেখুন (View Report)',
    audioOn: 'শব্দ চালু (Audio Cues ON)',
    audioMute: 'শব্দ বন্ধ (Muted)',
    autoAssistBeacon: 'AI সাহায্য: পরবর্তী সঠিক বস্তুটি নির্দেশ করা হয়েছে',
    encouragement: 'ধীরে ধীরে করুন, কোনো তাড়া নেই। আপনি খুব ভালো করছেন।',
    watchedHeading: 'ক্রমটি মনে রেখেছেন?',
    watchedPrompt: 'যত সময় প্রয়োজন নিন, কোনো তাড়াহুড়ো নেই। প্রস্তুত হলে নিচের বোতামে স্পর্শ করুন:',
    readyToRecall: 'আমি প্রস্তুত, এবার উত্তর দিন ➔ (Start Recall)',
    replaySequence: 'ক্রমটি আবার দেখুন ↺ (Replay Sequence)'
  },
  hi: {
    title: 'स्वर क्रम (Sequence Recall)',
    subtitle: 'वस्तुओं का सही क्रम याद रखें',
    watchHeading: 'ध्यान से देखिए: वस्तुएं एक-एक करके चमकेंगी',
    watchSub: 'क्रम को याद रखिए। कोई जल्दबाज़ी नहीं है।',
    pauseHeading: 'स्मृति में रखिए... थोड़ा रुकिए',
    recallHeadingForward: 'क्रम में चुनिए: जिस क्रम में दिखी थीं उसी क्रम में दबाएं',
    recallHeadingReverse: 'उलटे क्रम में चुनिए: अंत से शुरुआत की ओर दबाएं',
    recallSub: (current: number, total: number) => `चरण ${current} / ${total}`,
    undo: 'पिछला चयन हटाएं (Undo)',
    correctFeedback: 'शानदार! आपने पूरा क्रम बिल्कुल सही याद रखा!',
    partialFeedback: 'बहुत अच्छा प्रयास! आपकी याददाश्त सराहनीय है।',
    nextTrial: 'अगला क्रम (Next Sequence) ➔',
    finish: 'रिपोर्ट देखें (View Report)',
    audioOn: 'ध्वनि चालू (Audio ON)',
    audioMute: 'ध्वनि बंद (Mute)',
    autoAssistBeacon: 'AI सहायता: अगली वस्तु की ओर संकेत किया गया है',
    encouragement: 'आराम से करिए, कोई जल्दी नहीं है। आप बहुत अच्छा कर रहे हैं।',
    watchedHeading: 'क्या आपने क्रम याद कर लिया?',
    watchedPrompt: 'आराम से समय लीजिए, कोई जल्दी नहीं है। जब आप तैयार हों, नीचे का बटन दबाएं:',
    readyToRecall: 'मैं तैयार हूँ, अब उत्तर देंगे ➔ (Start Recall)',
    replaySequence: 'क्रम फिर से देखें ↺ (Replay Sequence)'
  },
  en: {
    title: 'Sequence Recall (Spatial Span)',
    subtitle: 'Remember and reproduce the sequential order',
    watchHeading: 'Watch Closely: Items will illuminate one by one',
    watchSub: 'Remember the order. Take all the time you need.',
    pauseHeading: 'Holding in memory... Brief pause',
    recallHeadingForward: 'Tap in Order: Reproduce the exact sequence',
    recallHeadingReverse: 'Tap in REVERSE Order: Start from the last item',
    recallSub: (current: number, total: number) => `Step ${current} of ${total}`,
    undo: 'Undo Last Tap',
    correctFeedback: 'Wonderful! You remembered the exact sequence accurately!',
    partialFeedback: 'Great effort! Your sequential memory is strong!',
    nextTrial: 'Next Sequence ➔',
    finish: 'View Clinical Report',
    audioOn: 'Sound Cues: ON',
    audioMute: 'Sound: MUTED',
    autoAssistBeacon: 'AI Scaffolding: Next target card gently highlighted',
    encouragement: 'Take your time, there is no hurry at all. You are doing wonderfully.',
    watchedHeading: 'Sequence Complete! Ready to Answer?',
    watchedPrompt: 'Take all the time you need. Tap the button below when you feel ready:',
    readyToRecall: 'I am Ready to Answer ➔',
    replaySequence: 'Replay Sequence ↺'
  }
};

export const SequenceRecall: React.FC<SequenceRecallProps> = ({
  language = 'as',
  totalTrials = 5,
  initialTheta = 0.0,
  onTrialComplete,
  onSessionComplete,
  onExit,
}) => {
  const [gameKey, setGameKey] = useState(0);
  const engine = useMemo(() => new SequenceRecallEngine(initialTheta, totalTrials), [initialTheta, totalTrials, gameKey]);
  
  const [phase, setPhase] = useState<SequencePhase>('PRESENTATION');
  const [activeItemIndexInPresentation, setActiveItemIndexInPresentation] = useState<number | null>(null);
  const [recalledSteps, setRecalledSteps] = useState<string[]>([]);
  const [latestTelemetry, setLatestTelemetry] = useState<TrialTelemetry | null>(null);
  const [sessionSummary, setSessionSummary] = useState<SequenceRecallSessionSummary | null>(null);
  const [autoAssistItemId, setAutoAssistItemId] = useState<string | null>(null);
  const [showJudgeControls, setShowJudgeControls] = useState<boolean>(false);
  const [showEncouragementBanner, setShowEncouragementBanner] = useState<boolean>(false);

  // Audio optional state (default to ON, user can mute anytime)
  const [isAudioActive, setIsAudioActive] = useState<boolean>(() => sequenceAudio.getAudioEnabled());

  const autoAssistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const presentationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = LOCALIZED_UI[language] || LOCALIZED_UI.en;
  const difficulty = engine.getDifficulty();
  const targetSequence = engine.getTargetSequence();
  const expectedSequence = engine.getExpectedSequence();
  const poolIds = engine.getPoolItemIds();
  const trialNumber = engine.getTrialNumber();

  const toggleAudio = () => {
    const nextState = !isAudioActive;
    setIsAudioActive(nextState);
    sequenceAudio.setAudioEnabled(nextState);
  };

  const [trialIndex, setTrialIndex] = useState<number>(0);
  const [isPresentationPlaying, setIsPresentationPlaying] = useState<boolean>(true);
  const [hasFinishedIllumination, setHasFinishedIllumination] = useState<boolean>(false);
  const [replayCounter, setReplayCounter] = useState<number>(0);

  const handleProceedToRecall = () => {
    if (presentationTimerRef.current) {
      clearTimeout(presentationTimerRef.current);
      presentationTimerRef.current = null;
    }
    setActiveItemIndexInPresentation(null);
    setIsPresentationPlaying(false);
    setPhase('RECALL');
    engine.notifyRecallPhaseStarted();
  };

  const handleReplaySequence = () => {
    if (presentationTimerRef.current) {
      clearTimeout(presentationTimerRef.current);
      presentationTimerRef.current = null;
    }
    setReplayCounter(c => c + 1);
  };

  // Launch trial presentation safely when trialIndex or replayCounter changes
  useEffect(() => {
    setPhase('PRESENTATION');
    setRecalledSteps([]);
    setAutoAssistItemId(null);
    setActiveItemIndexInPresentation(null);
    setIsPresentationPlaying(true);
    setHasFinishedIllumination(false);

    let step = 0;
    const seq = engine.getTargetSequence();
    const currentDiff = engine.getDifficulty();
    const duration = currentDiff.stimulusDurationMs;
    const isi = currentDiff.isiDurationMs;

    const showNext = () => {
      if (step < seq.length) {
        setActiveItemIndexInPresentation(step);
        const item = getItemById(seq[step]);
        if (item) {
          sequenceAudio.playItemChime(item, duration);
          if (currentDiff.scaffoldingLevel === 'high') {
            sequenceAudio.speakItemName(item.names[language], language);
          }
        }

        presentationTimerRef.current = setTimeout(() => {
          setActiveItemIndexInPresentation(null);
          step++;

          if (step < seq.length) {
            presentationTimerRef.current = setTimeout(showNext, isi);
          } else {
            // Sequence illumination finished! DO NOT auto-advance. Let elder take their time!
            setIsPresentationPlaying(false);
            setHasFinishedIllumination(true);
          }
        }, duration);
      }
    };

    presentationTimerRef.current = setTimeout(showNext, 600);

    return () => {
      if (presentationTimerRef.current) {
        clearTimeout(presentationTimerRef.current);
      }
    };
  }, [trialIndex, replayCounter, engine, language]);

  // Live Assistance Profile derivation
  const liveProfileConfig = useMemo(() => {
    return AdaptiveAssistanceEngine.deriveAssistanceProfile({
      theta: engine.getTheta(),
      recentLatenciesMs: latestTelemetry ? [latestTelemetry.initialDeliberationMs, ...latestTelemetry.stepLatencies] : [],
      consecutiveErrors: latestTelemetry && !latestTelemetry.isCorrect ? 1 : 0,
      accuracyPct: latestTelemetry?.isCorrect ? 100 : 80,
      taskType: 'working_memory',
    });
  }, [engine, latestTelemetry]);

  // Dignity Auto-Assist Inactivity Guard (Profile-Adaptive)
  useEffect(() => {
    if (phase === 'RECALL') {
      const timeout = Math.min(12000, liveProfileConfig.assistTimeoutMs || 12000);
      autoAssistTimerRef.current = setTimeout(() => {
        const hintItem = engine.triggerAutoAssist();
        if (hintItem) {
          setAutoAssistItemId(hintItem);
          setShowEncouragementBanner(true);
          sequenceAudio.playAttentionTone();
          setTimeout(() => setShowEncouragementBanner(false), 4000);

          // Re-arm so if elder remains frozen on the step, beacon pulses continuously
          autoAssistTimerRef.current = setTimeout(() => {
            const nextHint = engine.triggerAutoAssist();
            if (nextHint) setAutoAssistItemId(nextHint);
          }, 8000);
        }
      }, timeout);
    } else {
      if (autoAssistTimerRef.current) clearTimeout(autoAssistTimerRef.current);
      setAutoAssistItemId(null);
    }
    return () => {
      if (autoAssistTimerRef.current) clearTimeout(autoAssistTimerRef.current);
    };
  }, [phase, recalledSteps, engine, liveProfileConfig]);

  /**
   * Handle Elder Card Tap
   */
  const handleCardTap = (itemId: string) => {
    if (phase !== 'RECALL') return;

    // Reset auto assist if user taps
    setAutoAssistItemId(null);

    const res = engine.registerItemTap(itemId);
    if (!res.accepted) {
      // Tremor filtered or duplicate
      return;
    }

    const item = getItemById(itemId);
    if (item) {
      sequenceAudio.playItemChime(item, 350);
    }

    const updatedSteps = engine.getCurrentRecalledSteps();
    setRecalledSteps([...updatedSteps]);

    if (res.isComplete) {
      // Complete current trial
      completeCurrentTrial();
    }
  };

  /**
   * Handle Undo Last Tap
   */
  const handleUndoTap = () => {
    if (phase !== 'RECALL') return;
    const undone = engine.undoLastTap();
    if (undone) {
      setRecalledSteps([...engine.getCurrentRecalledSteps()]);
    }
  };

  /**
   * Finalize current trial & evaluate telemetry
   */
  const completeCurrentTrial = () => {
    const telemetry = engine.evaluateCurrentTrial();
    setLatestTelemetry(telemetry);
    setPhase('FEEDBACK');

    if (telemetry.isCorrect) {
      sequenceAudio.playSuccessChime();
    } else {
      sequenceAudio.playNeutralRetryTone();
    }

    if (onTrialComplete) {
      onTrialComplete(telemetry);
    }

    if (engine.isSessionComplete()) {
      const summary = engine.generateSessionSummary(false);
      setSessionSummary(summary);
      if (onSessionComplete) onSessionComplete(summary);
    }
  };

  /**
   * Move to Next Trial or Complete Session
   */
  const handleNextTrial = () => {
    if (engine.isSessionComplete()) {
      setPhase('SESSION_COMPLETE');
    } else {
      engine.startNewTrial();
      setTrialIndex(prev => prev + 1);
    }
  };

  /**
   * Caregiver Early End Graceful Exit
   */
  const handleCaregiverEndEarly = () => {
    const summary = engine.generateSessionSummary(true);
    setSessionSummary(summary);
    setPhase('SESSION_COMPLETE');
    if (onSessionComplete) onSessionComplete(summary);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Encouragement Banner */}
      {showEncouragementBanner && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 fill-white" />
            <span className="font-extrabold text-sm sm:text-base">
              {t.encouragement}
            </span>
          </div>
          <button 
            onClick={() => setShowEncouragementBanner(false)}
            className="text-white/80 hover:text-white font-black text-xs uppercase px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Game Header Bar (Lumosity Aligned) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {t.title}
              </h2>
              <span className="bg-amber-100 text-amber-900 text-xs sm:text-sm px-3 py-1 rounded-full font-black border border-amber-200">
                Sequence {trialNumber} of {totalTrials}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
              {t.subtitle} • Span: <strong className="text-amber-700">{difficulty.sequenceLength} Items</strong> ({difficulty.direction})
            </p>
          </div>
        </div>

        {/* Header Controls: Audio Toggle, Early End, AI Testbed */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Optional Audio Toggle Button */}
          <button
            onClick={toggleAudio}
            className={`px-3.5 py-2 rounded-xl border font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 ${
              isAudioActive 
                ? 'bg-amber-100/80 border-amber-300 text-amber-900 hover:bg-amber-200' 
                : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
            }`}
            title={isAudioActive ? 'Sound is ON. Tap to mute.' : 'Sound is MUTED. Tap to turn on sound.'}
          >
            {isAudioActive ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-700" />
                <span>{t.audioOn}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span>{t.audioMute}</span>
              </>
            )}
          </button>

          {phase !== 'SESSION_COMPLETE' && (
            <button
              onClick={handleCaregiverEndEarly}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-extrabold text-xs rounded-xl cursor-pointer transition-all"
              title="Save progress and gracefully conclude session"
            >
              Save & Rest
            </button>
          )}

          <button
            onClick={() => setShowJudgeControls(!showJudgeControls)}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-black text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all"
            title="Inspect real-time 2PL IRT dynamic variables"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-600" />
            <span>AI Testbed</span>
          </button>

          {onExit && (
            <button
              onClick={onExit}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-xl cursor-pointer"
            >
              Exit
            </button>
          )}
        </div>
      </div>

      {/* AI Testbed Drawer */}
      {showJudgeControls && (
        <div className="bg-slate-900 text-amber-400 p-5 rounded-3xl text-xs space-y-3 shadow-xl border border-slate-800 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Continuous 2PL IRT Dynamic Difficulty Adjustment (DDA) Telemetry
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full">
                Profile: {liveProfileConfig.displayName[language] || liveProfileConfig.displayName.en} ({liveProfileConfig.assistTimeoutMs / 1000}s)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Bayesian Adaptive Loop</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Latent Ability (θ)</span>
              <strong className="text-base text-white">{engine.getTheta().toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Sequence Span (L)</span>
              <strong className="text-base text-amber-300">{difficulty.sequenceLength} items</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Display Exposure (T_disp)</span>
              <strong className="text-base text-emerald-300">{difficulty.stimulusDurationMs}ms</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Breathing Gap (ISI)</span>
              <strong className="text-base text-sky-300">{difficulty.isiDurationMs}ms</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Choice Pool (K)</span>
              <strong className="text-base text-white">{difficulty.poolSize} cards</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Recall Direction</span>
              <strong className="text-base text-orange-300">{difficulty.direction}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Tremor Debounce</span>
              <strong className="text-base text-teal-300">{difficulty.tremorDebounceMs}ms</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Auto-Assist Dignity</span>
              <strong className="text-base text-purple-300">{difficulty.autoAssistTimeoutMs / 1000}s</strong>
            </div>
          </div>

          {/* Interactive DDA Variable Adjuster for Testing */}
          <div className="pt-3 border-t border-slate-800 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-300 font-extrabold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span>⚡ Test Sequence Span (Items that Flash):</span>
              </span>
              <div className="flex items-center gap-1.5">
                {[2, 3, 4, 5, 6].map((span) => (
                  <button
                    key={span}
                    onClick={() => {
                      engine.overrideDifficulty({ sequenceLength: span });
                      setTrialIndex(prev => prev + 1);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      difficulty.sequenceLength === span
                        ? 'bg-amber-400 text-slate-950 shadow-md scale-105 ring-2 ring-amber-300'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {span} Items
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-300 font-extrabold uppercase tracking-wider text-[11px]">
                Board Card Pool (Choices on Screen):
              </span>
              <div className="flex items-center gap-1.5">
                {[3, 4, 5, 6, 7, 8].map((pool) => (
                  <button
                    key={pool}
                    disabled={pool < difficulty.sequenceLength}
                    onClick={() => {
                      engine.overrideDifficulty({ poolSize: pool });
                      setTrialIndex(prev => prev + 1);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      difficulty.poolSize === pool
                        ? 'bg-teal-400 text-slate-950 shadow-md scale-105 ring-2 ring-teal-300'
                        : pool < difficulty.sequenceLength
                        ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-500'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {pool}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-300 font-extrabold uppercase tracking-wider text-[11px]">
                Order Direction:
              </span>
              <div className="flex items-center gap-1.5">
                {(['FORWARD', 'REVERSE'] as const).map((dir) => (
                  <button
                    key={dir}
                    onClick={() => {
                      engine.overrideDifficulty({ direction: dir });
                      setTrialIndex(prev => prev + 1);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      difficulty.direction === dir
                        ? 'bg-orange-400 text-slate-950 shadow-md scale-105 ring-2 ring-orange-300'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 1: PRESENTATION & WATCH (ELDER CONTROLLED PACING) */}
      {phase === 'PRESENTATION' && (
        <div className="space-y-6">
          <div className={`border-2 rounded-3xl p-6 text-center space-y-2 transition-all ${
            hasFinishedIllumination 
              ? 'bg-emerald-50/80 border-emerald-300' 
              : 'bg-amber-50/80 border-amber-200'
          }`}>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {hasFinishedIllumination ? t.watchedHeading : t.watchHeading}
            </h3>
            <p className="text-sm font-bold text-slate-600">
              {hasFinishedIllumination ? t.watchedPrompt : t.watchSub}
            </p>
          </div>

          {/* Large Card Grid (Min 96px x 96px for Geriatric Accessibility) */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-4">
            {poolIds.map((itemId) => {
              const item = getItemById(itemId);
              if (!item) return null;
              const IconComp = ICON_MAP[item.iconName] || Brain;
              
              // Check if this item is currently illuminated in presentation
              const isCurrentlyIlluminated = activeItemIndexInPresentation !== null && 
                targetSequence[activeItemIndexInPresentation] === itemId;

              return (
                <div
                  key={itemId}
                  className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-3xl border-3 flex flex-col items-center justify-center p-3 text-center transition-all duration-300 select-none shadow-sm ${
                    isCurrentlyIlluminated
                      ? `${item.activeRingColor} ring-4 scale-110 bg-white border-amber-500 shadow-xl`
                      : `bg-slate-50/70 ${item.borderColor} opacity-60`
                  }`}
                >
                  <div className={`p-2 rounded-2xl ${isCurrentlyIlluminated ? 'bg-amber-100' : 'bg-slate-100'} ${item.color} mb-1 transition-colors`}>
                    <IconComp className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-black text-slate-800 truncate max-w-full">
                    {item.names[language]}
                  </span>
                  {isCurrentlyIlluminated && (
                    <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full mt-1 animate-pulse">
                      Step {(activeItemIndexInPresentation ?? 0) + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Elder Action Controls: Replay or Proceed at their own pace */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={handleReplaySequence}
              disabled={isPresentationPlaying}
              className={`px-5 py-3.5 rounded-2xl font-extrabold text-sm border flex items-center gap-2 transition-all cursor-pointer ${
                isPresentationPlaying
                  ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 shadow-xs active:scale-95'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.replaySequence}</span>
            </button>

            <button
              onClick={handleProceedToRecall}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-sm sm:text-base shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-2"
            >
              <span>{t.readyToRecall}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: RETENTION PAUSE */}
      {phase === 'RETENTION_PAUSE' && (
        <div className="py-16 text-center space-y-4">
          <div className="w-20 h-20 rounded-full border-4 border-amber-400 border-t-amber-600 animate-spin mx-auto shadow-inner" />
          <h3 className="text-xl sm:text-2xl font-black text-slate-800">
            {t.pauseHeading}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-bold">
            Consolidating sequential order in working memory...
          </p>
        </div>
      )}

      {/* PHASE 3: ACTIVE RECALL */}
      {phase === 'RECALL' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {difficulty.direction === 'REVERSE' ? t.recallHeadingReverse : t.recallHeadingForward}
              </h3>
              <p className="text-xs sm:text-sm font-bold text-slate-500 mt-0.5">
                {t.recallSub(recalledSteps.length, difficulty.sequenceLength)}
              </p>
            </div>

            {/* Sequence Slots Tracker */}
            <div className="flex items-center gap-2">
              {Array.from({ length: difficulty.sequenceLength }).map((_, idx) => {
                const filledId = recalledSteps[idx];
                const filledItem = filledId ? getItemById(filledId) : null;

                return (
                  <div
                    key={idx}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border-2 flex items-center justify-center font-black text-sm transition-all shadow-xs ${
                      filledItem
                        ? 'bg-amber-100 border-amber-500 text-amber-900 scale-105'
                        : 'border-dashed border-slate-300 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {filledItem ? idx + 1 : idx + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Auto-Assist Dignity Beacon Alert */}
          {autoAssistItemId && (
            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs">
              <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
              <span>{t.autoAssistBeacon}</span>
            </div>
          )}

          {/* Interactive Card Selection Grid (Large 96px+ Touch Targets) */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-4">
            {poolIds.map((itemId) => {
              const item = getItemById(itemId);
              if (!item) return null;
              const IconComp = ICON_MAP[item.iconName] || Brain;
              const isAutoAssistTarget = autoAssistItemId === itemId;

              return (
                <button
                  key={itemId}
                  onClick={() => handleCardTap(itemId)}
                  className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-3xl border-3 flex flex-col items-center justify-center p-3 text-center transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-95 select-none bg-white ${
                    isAutoAssistTarget 
                      ? 'border-purple-500 ring-4 ring-purple-300 shadow-purple-200 animate-pulse' 
                      : `${item.borderColor} hover:border-amber-500`
                  }`}
                >
                  <div className={`p-2.5 rounded-2xl bg-slate-50 ${item.color} mb-1 shadow-2xs`}>
                    <IconComp className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-black text-slate-800 truncate max-w-full">
                    {item.names[language]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Geriatric Ergonomic Actions Bar: Undo & Encouragement */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleUndoTap}
              disabled={recalledSteps.length === 0}
              className={`px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                recalledSteps.length > 0
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 shadow-2xs active:scale-95'
                  : 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border border-slate-200'
              }`}
            >
              <Undo2 className="w-4 h-4" />
              <span>{t.undo}</span>
            </button>

            <button
              onClick={() => setShowEncouragementBanner(true)}
              className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-amber-700" />
              <span>Comfort Guide</span>
            </button>
          </div>
        </div>
      )}

      {/* PHASE 4: FEEDBACK */}
      {phase === 'FEEDBACK' && latestTelemetry && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center space-y-6 animate-in fade-in duration-300">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
            latestTelemetry.isCorrect 
              ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' 
              : 'bg-amber-100 text-amber-700 border-2 border-amber-300'
          }`}>
            {latestTelemetry.isCorrect ? (
              <CheckCircle2 className="w-10 h-10" />
            ) : (
              <Brain className="w-10 h-10" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {latestTelemetry.isCorrect ? t.correctFeedback : t.partialFeedback}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-bold">
              Sequence Length: {latestTelemetry.difficultySnapshot.sequenceLength} items • Deliberation: {(latestTelemetry.initialDeliberationMs / 1000).toFixed(1)}s
            </p>
          </div>

          {/* Step Comparison Visualizer */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-lg mx-auto space-y-2 text-left">
            <span className="text-[10px] font-black text-slate-400 uppercase">Target Sequence Order:</span>
            <div className="flex flex-wrap items-center gap-2">
              {expectedSequence.map((id, idx) => {
                const item = getItemById(id);
                return (
                  <span key={idx} className="bg-white border border-slate-200 px-3 py-1 rounded-xl text-xs font-extrabold text-slate-700 shadow-2xs">
                    {idx + 1}. {item?.names[language]}
                  </span>
                );
              })}
            </div>

            {latestTelemetry.errorType !== 'NONE' && (
              <div className="pt-2 border-t border-slate-200 text-[11px] font-bold text-amber-800">
                Cognitive Biomarker Note: <span className="uppercase">{latestTelemetry.errorType}</span> detected (calibrated in 2PL IRT).
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={handleNextTrial}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-sm sm:text-base shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-2 mx-auto"
            >
              <span>{engine.isSessionComplete() ? t.finish : t.nextTrial}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* PHASE 5: SESSION COMPLETE (CLINICAL SUMMARY) */}
      {phase === 'SESSION_COMPLETE' && sessionSummary && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8 animate-in fade-in duration-300">
          <div className="text-center space-y-2 border-b border-slate-100 pb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Sequence Recall Assessment Report
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-bold">
              Cognitive Working Memory & Temporal Sequencing Concordance (Corsi / CANTAB Aligned)
            </p>
          </div>

          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Max Span Achieved</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{sessionSummary.maxSpanAchieved} Items</p>
              <span className="text-[10px] text-slate-500 font-bold">Forward: {sessionSummary.forwardSpan} | Reverse: {sessionSummary.reverseSpan}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Accuracy Rate</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{sessionSummary.accuracyPercentage}%</p>
              <span className="text-[10px] text-slate-500 font-bold">{sessionSummary.correctTrials} of {sessionSummary.totalTrials} Trials</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Est. MoCA Memory</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{sessionSummary.estimatedMoCAWorkingMemoryScore} / 5</p>
              <span className="text-[10px] text-slate-500 font-bold">Working Memory Index</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Processing Speed</span>
              <p className="text-2xl font-black text-indigo-700 mt-1 capitalize">{sessionSummary.processingSpeedProfile}</p>
              <span className="text-[10px] text-slate-500 font-bold">{(sessionSummary.meanDeliberationMs / 1000).toFixed(1)}s Deliberation</span>
            </div>
          </div>

          {/* Clinical Error Decomposition Breakdown */}
          <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
            <h4 className="font-extrabold text-sm text-amber-950 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              Neuropsychological Error Pattern Decomposition
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-amber-200/80">
                <span className="font-extrabold text-slate-800 block">Transposition Errors: {sessionSummary.transpositionErrors}</span>
                <span className="text-[10px] text-slate-500">Correct items in altered order (Frontal sequencing)</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-amber-200/80">
                <span className="font-extrabold text-slate-800 block">Intrusion Errors: {sessionSummary.intrusionErrors}</span>
                <span className="text-[10px] text-slate-500">Unpresented items selected (Hippocampal storage)</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-amber-200/80">
                <span className="font-extrabold text-slate-800 block">Perseverations: {sessionSummary.perseverationErrors}</span>
                <span className="text-[10px] text-slate-500">Repetitive single card taps (Motor disinhibition)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setGameKey(k => k + 1);
                setPhase('PRESENTATION');
                setSessionSummary(null);
                setRecalledSteps([]);
                setActiveItemIndexInPresentation(null);
                setLatestTelemetry(null);
                setAutoAssistItemId(null);
              }}
              className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm cursor-pointer transition-all flex items-center gap-2 border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>

            <button
              onClick={onExit}
              className="px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
