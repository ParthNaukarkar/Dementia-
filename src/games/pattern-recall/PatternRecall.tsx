import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SupportedLanguage } from '../../types/prescription';

export interface PatternRecallProps {
  language: SupportedLanguage;
  totalTrials?: number;
  onSessionComplete?: (summary: any) => void;
  onExit?: () => void;
}

type GameState = 'intro' | 'countdown' | 'show_pattern' | 'recall' | 'feedback' | 'completed';

const INSTRUCTIONS = {
  as: {
    title: 'নক্সাৰ ছন্দ',
    desc: 'গ্ৰিডৰ ওপৰত চমু সময়ৰ বাবে জিলিকি উঠা নক্সাটো চাওক। ই নোহোৱা হোৱাৰ পিছত সেই স্থানসমূহ সঠিকভাৱে বাছি উলিওৱা।',
    start: 'আৰম্ভ কৰক',
    next: 'পৰৱৰ্তী',
    exit: 'প্ৰস্থান কৰক',
    completed: 'অভিনন্দন!',
    scoreMsg: (c: number, t: number) => `আপুনি ${t} টাৰ ভিতৰত ${c} টা নক্সা মনত ৰাখিলে।`,
  },
  bn: {
    title: 'নকশার ছন্দ',
    desc: 'গ্রিডের ওপর ক্ষণিকের জন্য ভেসে ওঠা নকশাটি লক্ষ্য করুন। এটি মিলিয়ে যাওয়ার পর সঠিক ঘরগুলি বেছে নিন।',
    start: 'শুরু করুন',
    next: 'পরবর্তী',
    exit: 'প্রস্থান করুন',
    completed: 'অভিনন্দন!',
    scoreMsg: (c: number, t: number) => `আপনি ${t} টির মধ্যে ${c} টি নকশা মনে রেখেছেন।`,
  },
  hi: {
    title: 'पैटर्न पहचान',
    desc: 'ग्रिड पर थोड़े समय के लिए दिखने वाले पैटर्न को देखें। इसके गायब होने के बाद सही स्थान चुनें।',
    start: 'शुरू करें',
    next: 'अगला',
    exit: 'बाहर निकलें',
    completed: 'बधाई हो!',
    scoreMsg: (c: number, t: number) => `आपने ${t} में से ${c} पैटर्न याद रखे।`,
  },
  en: {
    title: 'Pattern Recall',
    desc: 'A pattern will light up briefly on the grid. After it disappears, select the same tiles to recreate the pattern.',
    start: 'Start',
    next: 'Next',
    exit: 'Exit',
    completed: 'Congratulations!',
    scoreMsg: (c: number, t: number) => `You remembered ${c} out of ${t} patterns.`,
  }
};

export const PatternRecall: React.FC<PatternRecallProps> = ({
  language,
  totalTrials = 5,
  onSessionComplete,
  onExit
}) => {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentTrial, setCurrentTrial] = useState(1);
  const [gridSize, setGridSize] = useState(3);
  const [pattern, setPattern] = useState<number[]>([]);
  const [playerSelection, setPlayerSelection] = useState<number[]>([]);
  const [correctTrials, setCorrectTrials] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [isTrialCorrect, setIsTrialCorrect] = useState<boolean | null>(null);
  
  // Telemetry

  const trialStartTimeRef = useRef<number>(0);
  const [totalLatency, setTotalLatency] = useState(0);
  
  const text = INSTRUCTIONS[language] || INSTRUCTIONS.en;

  // Determine grid size and pattern length based on trial
  const setupTrial = (trialNum: number) => {
    let size = 3;
    let patternLength = 3;
    
    if (trialNum >= 3) {
      size = 4;
      patternLength = 4;
    }
    if (trialNum === 5) {
      size = 5;
      patternLength = 5;
    }

    setGridSize(size);
    
    // Generate random pattern
    const totalCells = size * size;
    const newPattern: number[] = [];
    while (newPattern.length < patternLength) {
      const randomCell = Math.floor(Math.random() * totalCells);
      if (!newPattern.includes(randomCell)) {
        newPattern.push(randomCell);
      }
    }
    setPattern(newPattern);
    setPlayerSelection([]);
    setIsTrialCorrect(null);
  };

  const handleStartGame = () => {
    setupTrial(1);
    setGameState('countdown');
    setCountdown(3);
  };

  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState('show_pattern');
      }
    }
  }, [gameState, countdown]);

  useEffect(() => {
    if (gameState === 'show_pattern') {
      // Play a subtle sound maybe
      const timer = setTimeout(() => {
        setGameState('recall');
        trialStartTimeRef.current = Date.now();
      }, 2000); // show for 2 seconds
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const handleCellClick = (index: number) => {
    if (gameState !== 'recall') return;
    
    // Toggle cell selection
    const newSelection = playerSelection.includes(index)
      ? playerSelection.filter(i => i !== index)
      : [...playerSelection, index];
      
    setPlayerSelection(newSelection);

    // Auto-check when selection length matches pattern length
    if (newSelection.length === pattern.length) {
      handleCheck(newSelection);
    }
  };

  const handleCheck = (finalSelection: number[]) => {
    const latencyMs = Date.now() - trialStartTimeRef.current;
    setTotalLatency(prev => prev + latencyMs);

    // Check if every selected cell is in the pattern
    const isCorrect = finalSelection.every(i => pattern.includes(i)) && finalSelection.length === pattern.length;
    
    setIsTrialCorrect(isCorrect);
    if (isCorrect) {
      setCorrectTrials(prev => prev + 1);
    }
    setGameState('feedback');
  };

  const handleNextTrial = () => {
    if (currentTrial < totalTrials) {
      setCurrentTrial(prev => prev + 1);
      setupTrial(currentTrial + 1);
      setGameState('show_pattern');
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setGameState('completed');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    if (onSessionComplete) {
      const summary = {
        totalTrials,
        correctTrials,
        accuracyPercentage: Math.round((correctTrials / totalTrials) * 100),
        meanDeliberationMs: Math.round(totalLatency / totalTrials),
        maxGridSize: gridSize
      };
      onSessionComplete(summary);
    }
  };

  if (gameState === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-8 shadow-sm">
          <Brain className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">{text.title}</h1>
        <p className="text-lg text-slate-600 mb-12 leading-relaxed">{text.desc}</p>
        <button
          onClick={handleStartGame}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-12 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 text-lg"
        >
          {text.start} <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    );
  }

  if (gameState === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 shadow-sm">
          <Sparkles className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">{text.completed}</h2>
        <p className="text-xl text-slate-600 mb-12">{text.scoreMsg(correctTrials, totalTrials)}</p>
        <button
          onClick={onExit}
          className="bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 px-8 rounded-xl shadow-md transition-all"
        >
          {text.exit}
        </button>
      </div>
    );
  }

  const getGridTemplateColumns = () => {
    switch(gridSize) {
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      default: return 'grid-cols-3';
    }
  };

  const getCellSizeClass = () => {
    switch(gridSize) {
      case 3: return 'w-24 h-24 sm:w-32 sm:h-32';
      case 4: return 'w-20 h-20 sm:w-24 sm:h-24';
      case 5: return 'w-16 h-16 sm:w-20 sm:h-20';
      default: return 'w-24 h-24 sm:w-32 sm:h-32';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center w-full mb-8">
        <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          Trial {currentTrial} of {totalTrials}
        </div>
        <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          Score: {correctTrials}
        </div>
      </div>

      {gameState === 'countdown' && (
        <div className="flex items-center justify-center flex-grow">
          <div className="text-8xl font-bold text-blue-600 animate-pulse">
            {countdown}
          </div>
        </div>
      )}

      {(gameState === 'show_pattern' || gameState === 'recall' || gameState === 'feedback') && (
        <div className="flex flex-col items-center flex-grow justify-center w-full">
          {gameState === 'recall' && (
            <p className="text-lg font-medium text-blue-600 mb-6 animate-pulse">
              Recreate the pattern!
            </p>
          )}
          {gameState === 'feedback' && (
            <p className={`text-xl font-bold mb-6 ${isTrialCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isTrialCorrect ? 'Correct!' : 'Incorrect!'}
            </p>
          )}

          <div className={`grid gap-2 sm:gap-4 p-4 bg-slate-100 rounded-2xl shadow-inner ${getGridTemplateColumns()}`}>
            {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
              const isPatternCell = pattern.includes(idx);
              const isSelected = playerSelection.includes(idx);
              
              let cellClass = "bg-white border-2 border-slate-200 cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-95";
              
              if (gameState === 'show_pattern' && isPatternCell) {
                cellClass = "bg-blue-500 border-blue-600 shadow-lg scale-105 transition-all duration-300";
              } else if (gameState === 'recall') {
                if (isSelected) {
                  cellClass = "bg-blue-200 border-blue-400";
                }
              } else if (gameState === 'feedback') {
                if (isPatternCell && isSelected) {
                  cellClass = "bg-green-500 border-green-600 shadow-md"; // Correctly selected
                } else if (isPatternCell && !isSelected) {
                  cellClass = "bg-yellow-400 border-yellow-500 opacity-70"; // Missed
                } else if (!isPatternCell && isSelected) {
                  cellClass = "bg-red-500 border-red-600"; // Incorrectly selected
                } else {
                  cellClass = "bg-white border-slate-200 opacity-50"; // Unrelated
                }
                cellClass = cellClass.replace("cursor-pointer hover:shadow-md active:scale-95", "");
              }

              return (
                <div 
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  className={`rounded-xl ${getCellSizeClass()} ${cellClass}`}
                />
              );
            })}
          </div>

          {gameState === 'feedback' && (
            <button
              onClick={handleNextTrial}
              className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {text.next} <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
