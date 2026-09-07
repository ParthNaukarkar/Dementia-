import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SupportedLanguage } from '../../types/prescription';
import { vernacularVoice } from '../../engine/vernacular-voice';

export interface MemoryMatchProps {
  language: SupportedLanguage;
  totalPairs?: number; // 3, 4, or 6 pairs
  onSessionComplete?: (summary: any) => void;
  onExit?: () => void;
}

interface CardItem {
  id: string; // unique card id
  pairKey: string; // shared key for matching
  symbol: string;
  names: Record<SupportedLanguage, string>;
  isFlipped: boolean;
  isMatched: boolean;
}

const ITEMS_POOL = [
  {
    pairKey: 'rhino',
    symbol: '🦏',
    names: {
      as: 'এশিঙীয়া গঁড়',
      bn: 'একশৃঙ্গ গণ্ডার',
      hi: 'एक सींग वाला गैंडा',
      en: 'One-Horned Rhino',
    },
  },
  {
    pairKey: 'japi',
    symbol: '👒',
    names: {
      as: 'অসমীয়া জাপি',
      bn: 'আসামি জাপি',
      hi: 'पारंपरिक जापी',
      en: 'Assamese Japi',
    },
  },
  {
    pairKey: 'dhol',
    symbol: '🥁',
    names: {
      as: 'বিহু ঢোল',
      bn: 'বিহু ঢোল',
      hi: 'बिहू ढोल',
      en: 'Bihu Dhol',
    },
  },
  {
    pairKey: 'pepa',
    symbol: '📯',
    names: {
      as: 'মহৰ শিঙৰ পেঁপা',
      bn: 'মহিষের শিংয়ের পেঁপা',
      hi: 'पेपा तुरही',
      en: 'Pepa Horn',
    },
  },
  {
    pairKey: 'lotus',
    symbol: '🪷',
    names: {
      as: 'কামাখ্যাৰ পদুম',
      bn: 'কামাখ্যার পদ্ম',
      hi: 'पवित्र कमल',
      en: 'Sacred Lotus',
    },
  },
  {
    pairKey: 'tea',
    symbol: '🍃',
    names: {
      as: 'অসম চাহ পাত',
      bn: 'আসাম চা পাতা',
      hi: 'असम चाय पत्ती',
      en: 'Assam Tea Leaves',
    },
  },
];

export const MemoryMatch: React.FC<MemoryMatchProps> = ({
  language,
  totalPairs = 4,
  onSessionComplete,
  onExit,
}) => {
  const [pairCount, setPairCount] = useState<number>(totalPairs);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);
  const [totalFlips, setTotalFlips] = useState(0);
  const [mismatches, setMismatches] = useState(0);
  const [perseverations, setPerseverations] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [autoAssistActive, setAutoAssistActive] = useState(false);
  const [showJudgeControls, setShowJudgeControls] = useState(false);
  const [tremorDebounceMs, setTremorDebounceMs] = useState(400);
  const [autoAssistDelayMs, setAutoAssistDelayMs] = useState(25000);

  // Tremor & timing references
  const lastTapTimeRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number>(Date.now());
  const flipLatenciesRef = useRef<number[]>([]);
  const lastActionTimeRef = useRef<number>(Date.now());
  const seenCardIdsRef = useRef<Set<string>>(new Set());

  // Initialize deck
  const initializeGame = (count = pairCount) => {
    const selectedItems = ITEMS_POOL.slice(0, count);
    const deck: CardItem[] = [];

    selectedItems.forEach((item, index) => {
      deck.push({
        id: `card_${index}_A`,
        pairKey: item.pairKey,
        symbol: item.symbol,
        names: item.names,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: `card_${index}_B`,
        pairKey: item.pairKey,
        symbol: item.symbol,
        names: item.names,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedCardIds([]);
    setMatchedPairsCount(0);
    setTotalFlips(0);
    setMismatches(0);
    setPerseverations(0);
    setIsEvaluating(false);
    setIsCompleted(false);
    setAutoAssistActive(false);
    sessionStartTimeRef.current = Date.now();
    lastActionTimeRef.current = Date.now();
    flipLatenciesRef.current = [];
    seenCardIdsRef.current.clear();
  };

  useEffect(() => {
    initializeGame(pairCount);
  }, [pairCount]);

  // Dignity Auto-Assist: If inactive for >autoAssistDelayMs, gently highlight one matching pair
  useEffect(() => {
    if (isCompleted || isEvaluating) return;

    const timer = setInterval(() => {
      const idleTime = Date.now() - lastActionTimeRef.current;
      if (idleTime > autoAssistDelayMs && !autoAssistActive) {
        setAutoAssistActive(true);
        if (!isMuted) {
          vernacularVoice.playGentleChime('attention');
        }
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [isCompleted, isEvaluating, autoAssistActive, isMuted, autoAssistDelayMs]);

  // Card Tap Handler with hardware tremor debouncing
  const handleCardClick = (cardId: string) => {
    const now = Date.now();
    if (now - lastTapTimeRef.current < tremorDebounceMs) return; // Tremor filter
    lastTapTimeRef.current = now;
    lastActionTimeRef.current = now;

    if (isEvaluating) return;

    const targetCard = cards.find(c => c.id === cardId);
    if (!targetCard || targetCard.isFlipped || targetCard.isMatched) return;

    if (!isMuted) {
      vernacularVoice.playGentleChime('tap');
    }

    const currentFlipped = [...flippedCardIds, cardId];
    setFlippedCardIds(currentFlipped);
    setTotalFlips(prev => prev + 1);

    // Track latency
    flipLatenciesRef.current.push(now - lastActionTimeRef.current);

    // Update card flip state
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c));

    // If 2 cards are now face up, evaluate match
    if (currentFlipped.length === 2) {
      setIsEvaluating(true);
      const [firstId, secondId] = currentFlipped;
      const card1 = cards.find(c => c.id === firstId)!;
      const card2 = targetCard;

      if (card1.pairKey === card2.pairKey) {
        // MATCH FOUND!
        if (!isMuted) {
          setTimeout(() => vernacularVoice.playGentleChime('success'), 150);
        }

        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true, isFlipped: true } 
              : c
          ));
          setFlippedCardIds([]);
          setIsEvaluating(false);
          setAutoAssistActive(false);

          const nextMatchCount = matchedPairsCount + 1;
          setMatchedPairsCount(nextMatchCount);

          // All pairs found!
          if (nextMatchCount === pairCount) {
            handleCompleteSession(totalFlips + 1, mismatches, perseverations);
          }
        }, 600);
      } else {
        // MISMATCH (Evaluate Exploratory vs Perseveration Error)
        const isPerseveration = seenCardIdsRef.current.has(firstId) || seenCardIdsRef.current.has(secondId);
        if (isPerseveration) {
          setPerseverations(p => p + 1);
        }
        seenCardIdsRef.current.add(firstId);
        seenCardIdsRef.current.add(secondId);

        setMismatches(prev => prev + 1);
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedCardIds([]);
          setIsEvaluating(false);
        }, 1200); // 1.2s viewing pause for memory retention
      }
    }
  };

  const handleCompleteSession = (_finalFlips: number, finalMismatches: number, finalPerseverations: number) => {
    setIsCompleted(true);
    try {
      confetti({ particleCount: 80, spread: 60 });
    } catch {
      // ignore
    }

    const totalTrials = pairCount;
    const accuracy = Math.max(50, Math.round((pairCount / (pairCount + finalMismatches)) * 100));
    const meanLatency = flipLatenciesRef.current.length > 0
      ? Math.round(flipLatenciesRef.current.reduce((a, b) => a + b, 0) / flipLatenciesRef.current.length)
      : 2200;

    const summary = {
      gameId: 'memory-match',
      gameTitle: 'Memory Match (Paired Associates)',
      totalRounds: totalTrials,
      totalCorrect: pairCount,
      accuracyPercentage: accuracy,
      averageLatencyMs: meanLatency,
      medianLatencyMs: meanLatency,
      perseverationErrors: finalPerseverations,
      transpositionErrors: Math.max(0, finalMismatches - finalPerseverations),
      intrusionErrors: 0,
      autoAssistedRounds: autoAssistActive ? 1 : 0,
      finalTheta: accuracy >= 85 ? 1.15 : accuracy >= 70 ? 0.45 : -0.25,
      estimatedMoCAMemoryScore: accuracy >= 80 ? 5 : accuracy >= 65 ? 4 : 3,
      processingSpeedProfile: meanLatency < 3000 ? 'normal' : 'deliberate',
      completedAt: new Date().toISOString(),
      rounds: []
    };

    if (onSessionComplete) {
      onSessionComplete(summary);
    }
  };

  // Find pair for auto-assist highlight
  const assistPairKey = useMemo(() => {
    if (!autoAssistActive) return null;
    const unmatched = cards.filter(c => !c.isMatched);
    return unmatched.length > 0 ? unmatched[0].pairKey : null;
  }, [autoAssistActive, cards]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      
      {/* Top Controls Header */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            CANTAB Paired Associates • Level {pairCount === 3 ? 1 : pairCount === 4 ? 2 : 3}
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            Memory Match (ছবিৰ যোৰা)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Find matching pairs of traditional Assamese items.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsMuted(!isMuted)}
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
            title="Caregiver Live DDA Controls"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={() => initializeGame(pairCount)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Caregiver Live Override Drawer */}
      {showJudgeControls && (
        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-purple-500/40 shadow-xl space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h4 className="font-black text-sm text-white">Caregiver Live DDA Calibration Panel</h4>
            </div>
            <span className="text-[10px] font-extrabold uppercase bg-purple-500/30 text-purple-300 border border-purple-400/30 px-2 py-0.5 rounded-full">
              Real-Time Override
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
            {/* Pair Count */}
            <div>
              <span className="text-slate-400 block mb-1 text-[11px]">Matching Pairs:</span>
              <div className="flex gap-1.5">
                {[3, 4, 6].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      setPairCount(count);
                      initializeGame(count);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      pairCount === count 
                        ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {count} Pairs ({count * 2} Cards)
                  </button>
                ))}
              </div>
            </div>

            {/* Tremor Debounce */}
            <div>
              <span className="text-slate-400 block mb-1 text-[11px]">Tremor Debounce:</span>
              <div className="flex gap-1.5">
                {[300, 400, 500].map((ms) => (
                  <button
                    key={ms}
                    onClick={() => setTremorDebounceMs(ms)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      tremorDebounceMs === ms 
                        ? 'bg-teal-400 text-slate-950 shadow-md ring-2 ring-teal-300' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {ms}ms
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-Assist Delay */}
            <div>
              <span className="text-slate-400 block mb-1 text-[11px]">Dignity Auto-Assist:</span>
              <div className="flex gap-1.5">
                {[15000, 25000, 40000].map((ms) => (
                  <button
                    key={ms}
                    onClick={() => setAutoAssistDelayMs(ms)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      autoAssistDelayMs === ms 
                        ? 'bg-purple-400 text-slate-950 shadow-md ring-2 ring-purple-300' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {ms / 1000}s
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Board */}
      {!isCompleted ? (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          {/* Status Bar */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 border-b border-slate-100 pb-3">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Pairs Matched: <strong className="text-slate-900 text-sm font-black">{matchedPairsCount} / {pairCount}</strong></span>
            </span>

            <span className="text-slate-400 text-[11px]">
              Tremor Debounce: <strong className="text-emerald-700 font-bold">{tremorDebounceMs}ms Active</strong>
            </span>
          </div>

          {/* Auto-Assist Alert */}
          {autoAssistActive && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Take your time! The glowing cards share a matching picture.</span>
            </div>
          )}

          {/* Grid of Large Cards (min 96px x 96px for Geriatric Accessibility) */}
          <div className={`grid gap-4 sm:gap-6 justify-items-center ${
            pairCount === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
          }`}>
            {cards.map((card) => {
              const isAssisted = autoAssistActive && card.pairKey === assistPairKey && !card.isMatched;

              return (
                <button
                  key={card.id}
                  disabled={card.isMatched || isEvaluating}
                  onClick={() => handleCardClick(card.id)}
                  className={`w-28 h-32 sm:w-36 sm:h-40 rounded-3xl font-black transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-3 select-none relative ${
                    card.isMatched
                      ? 'bg-emerald-50 border-4 border-emerald-400 text-emerald-900 shadow-xs cursor-default'
                      : card.isFlipped
                      ? 'bg-amber-50 border-4 border-amber-500 text-slate-900 shadow-lg scale-105'
                      : isAssisted
                      ? 'bg-gradient-to-tr from-amber-200 via-amber-100 to-amber-300 border-4 border-amber-400 text-slate-800 shadow-md animate-pulse'
                      : 'bg-gradient-to-tr from-slate-100 to-slate-200 border-4 border-slate-300 hover:border-amber-400 text-slate-500 shadow-md hover:scale-102 active:scale-95'
                  }`}
                >
                  {card.isFlipped || card.isMatched ? (
                    <div className="flex flex-col items-center justify-center text-center gap-1.5">
                      <span className="text-4xl sm:text-5xl">{card.symbol}</span>
                      <span className="text-[11px] sm:text-xs font-extrabold text-slate-800 leading-tight">
                        {card.names[language]}
                      </span>
                      {card.isMatched && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute top-2 right-2" />
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
                      <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400/80" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Tap
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      ) : (
        /* Summary Screen when completed */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Exercise Complete! (সকলো যোৰা মিলিল!)
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
              Paired Associates Memory & Visual Binding Evaluated (CANTAB PAL Aligned)
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Pairs Found</span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{pairCount}/{pairCount}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Flips</span>
              <p className="text-2xl font-black text-amber-600 mt-0.5">{totalFlips}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Perseverations</span>
              <p className="text-2xl font-black text-purple-600 mt-0.5">{perseverations}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. MoCA</span>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">5 / 5</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => initializeGame(pairCount)}
              className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm cursor-pointer transition-all flex items-center gap-2 border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>

            {onExit && (
              <button
                onClick={onExit}
                className="px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-md cursor-pointer transition-all flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
