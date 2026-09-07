import React, { useState, useRef } from 'react';
import { 
  Brain, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SupportedLanguage } from '../../types/prescription';
import { CATEGORIES } from './data';

export interface OddOneOutProps {
  language: SupportedLanguage;
  totalTrials?: number;
  onSessionComplete?: (summary: any) => void;
  onExit?: () => void;
}

type GameState = 'intro' | 'play' | 'feedback' | 'completed';

const INSTRUCTIONS = {
  as: {
    title: 'অমিলটো বাছক',
    desc: 'কেইবাটাও বস্তু একেলগে দেখুওৱা হয়। বেছিভাগেই একে নিয়ম মানে, কিন্তু এটা পৃথক। পৃথক বস্তুটো যিমান সোনকালে পাৰে বাছক।',
    start: 'আৰম্ভ কৰক',
    next: 'পৰৱৰ্তী',
    exit: 'প্ৰস্থান কৰক',
    completed: 'অভিনন্দন!',
    scoreMsg: (c: number, t: number) => `আপুনি ${t} টাৰ ভিতৰত ${c} টা অমিল বিচাৰি উলিয়ালে।`,
  },
  bn: {
    title: 'ভিন্নটি বাছুন',
    desc: 'কয়েকটি বস্তু একসাথে দেখানো হয়। বেশিরভাগ একই নিয়মের অন্তর্ভুক্ত, একটি ভিন্ন। যত দ্রুত সম্ভব ভিন্ন বস্তুটি বেছে নিন।',
    start: 'শুরু করুন',
    next: 'পরবর্তী',
    exit: 'প্রস্থান করুন',
    completed: 'অভিনন্দন!',
    scoreMsg: (c: number, t: number) => `আপনি ${t} টির মধ্যে ${c} টি ভিন্ন বস্তু খুঁজে পেয়েছেন।`,
  },
  hi: {
    title: 'अलग पहचानें',
    desc: 'कई वस्तुएं एक साथ प्रदर्शित होती हैं। अधिकांश एक ही श्रेणी की हैं, जबकि एक भिन्न है। अलग वस्तु को शीघ्र पहचानें।',
    start: 'शुरू करें',
    next: 'अगला',
    exit: 'बाहर निकलें',
    completed: 'बधाई हो!',
    scoreMsg: (c: number, t: number) => `आपने ${t} में से ${c} अलग वस्तुओं को पहचाना।`,
  },
  en: {
    title: 'Odd One Out',
    desc: 'Several objects are displayed together. Most belong to the same category or follow the same pattern, while one is different. Identify the odd item as quickly as possible.',
    start: 'Start',
    next: 'Next',
    exit: 'Exit',
    completed: 'Congratulations!',
    scoreMsg: (c: number, t: number) => `You correctly identified ${c} out of ${t} odd objects.`,
  }
};

interface TrialData {
  items: string[];
  oddItemIndex: number;
}

export const OddOneOut: React.FC<OddOneOutProps> = ({
  language,
  totalTrials = 5,
  onSessionComplete,
  onExit
}) => {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentTrial, setCurrentTrial] = useState(1);
  const [correctTrials, setCorrectTrials] = useState(0);
  const [isTrialCorrect, setIsTrialCorrect] = useState<boolean | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [currentTrialData, setCurrentTrialData] = useState<TrialData | null>(null);
  
  // Telemetry
  const trialStartTimeRef = useRef<number>(0);
  const [totalLatency, setTotalLatency] = useState(0);
  
  const text = INSTRUCTIONS[language] || INSTRUCTIONS.en;

  const generateTrialData = (): TrialData => {
    const categoryKeys = Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[];
    
    // Pick a main category
    const mainCategoryKey = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    const mainCategoryItems = [...CATEGORIES[mainCategoryKey]];
    
    // Pick a different category for the odd one out
    let oddCategoryKey = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    while (oddCategoryKey === mainCategoryKey) {
      oddCategoryKey = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    }
    const oddCategoryItems = [...CATEGORIES[oddCategoryKey]];

    // Select 3 items from main category
    const selectedMainItems: string[] = [];
    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(Math.random() * mainCategoryItems.length);
      selectedMainItems.push(mainCategoryItems[idx]);
      mainCategoryItems.splice(idx, 1); // remove to prevent duplicates
    }

    // Select 1 item from odd category
    const oddItem = oddCategoryItems[Math.floor(Math.random() * oddCategoryItems.length)];

    // Mix them up
    const items = [...selectedMainItems, oddItem];
    // Shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    return {
      items,
      oddItemIndex: items.indexOf(oddItem)
    };
  };

  const handleStartGame = () => {
    setCurrentTrialData(generateTrialData());
    setGameState('play');
    trialStartTimeRef.current = Date.now();
  };

  const handleItemClick = (index: number) => {
    if (gameState !== 'play' || !currentTrialData) return;
    
    const latencyMs = Date.now() - trialStartTimeRef.current;
    setTotalLatency(prev => prev + latencyMs);
    setSelectedItemIndex(index);
    
    const isCorrect = index === currentTrialData.oddItemIndex;
    setIsTrialCorrect(isCorrect);
    
    if (isCorrect) {
      setCorrectTrials(prev => prev + 1);
    }
    
    setGameState('feedback');
  };

  const handleNextTrial = () => {
    if (currentTrial < totalTrials) {
      setCurrentTrial(prev => prev + 1);
      setCurrentTrialData(generateTrialData());
      setGameState('play');
      setIsTrialCorrect(null);
      setSelectedItemIndex(null);
      trialStartTimeRef.current = Date.now();
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

      <div className="flex flex-col items-center flex-grow justify-center w-full">
        {gameState === 'play' && (
          <p className="text-xl font-medium text-slate-800 mb-8 animate-pulse">
            Which one is the odd one out?
          </p>
        )}
        
        {gameState === 'feedback' && (
          <p className={`text-2xl font-bold mb-8 ${isTrialCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isTrialCorrect ? 'Correct!' : 'Incorrect!'}
          </p>
        )}

        {currentTrialData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-slate-100 rounded-3xl shadow-inner w-full max-w-3xl">
            {currentTrialData.items.map((item, idx) => {
              const isOddItem = idx === currentTrialData.oddItemIndex;
              const isSelected = idx === selectedItemIndex;
              
              let cellClass = "bg-white border-2 border-slate-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-105 transition-all active:scale-95 flex items-center justify-center text-6xl sm:text-7xl w-full aspect-square rounded-2xl";
              
              if (gameState === 'feedback') {
                cellClass = cellClass.replace("cursor-pointer hover:shadow-md hover:scale-105 active:scale-95", "");
                
                if (isOddItem) {
                  // This is the correct answer
                  cellClass = cellClass.replace("border-slate-200", "border-green-500 bg-green-50 shadow-lg scale-105");
                } else if (isSelected && !isOddItem) {
                  // Player selected this wrongly
                  cellClass = cellClass.replace("border-slate-200", "border-red-500 bg-red-50 opacity-80");
                } else {
                  // Unrelated item
                  cellClass = cellClass.replace("border-slate-200 bg-white", "border-slate-200 bg-white opacity-50 grayscale transition-all duration-500");
                }
              }

              return (
                <button 
                  key={idx}
                  onClick={() => handleItemClick(idx)}
                  disabled={gameState !== 'play'}
                  className={cellClass}
                  aria-label={`Select item ${idx}`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        )}

        {gameState === 'feedback' && (
          <button
            onClick={handleNextTrial}
            className="mt-12 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 text-lg transform hover:-translate-y-1"
          >
            {text.next} <ArrowRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};
