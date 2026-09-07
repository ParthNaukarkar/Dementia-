import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  ArrowRight, 
  Sparkles,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SupportedLanguage } from '../../types/prescription';
import { LOCATIONS, type LocationData } from './data';

export interface WhereAmIProps {
  language: SupportedLanguage;
  totalTrials?: number;
  onSessionComplete?: (summary: any) => void;
  onExit?: () => void;
}

type GameState = 'intro' | 'play' | 'feedback' | 'completed';

const INSTRUCTIONS = {
  as: {
    title: 'মই ক’ত আছোঁ?',
    desc: 'এটাৰ পিছত এটাকৈ দিয়া সংকেতসমূহ পঢ়ি ঠাইখন চিনাক্ত কৰক। যিমান সোনকালে উত্তৰ দিব পাৰিব, সিমানেই ভাল!',
    start: 'আৰম্ভ কৰক',
    next: 'পৰৱৰ্তী',
    exit: 'প্ৰস্থান কৰক',
    completed: 'অভিনন্দন!',
    scoreMsg: (c: number, t: number) => `আপুনি ${t} খনৰ ভিতৰত ${c} খন ঠাই চিনাক্ত কৰিলে।`,
  },
  bn: {
    title: 'আমি কোথায়?',
    desc: 'একের পর এক দেওয়া সূত্রগুলি পড়ে স্থানটি চিহ্নিত করুন। যত তাড়াতাড়ি উত্তর দিতে পারবেন, তত ভালো!',
    start: 'শুরু করুন',
    next: 'পরবর্তী',
    exit: 'প্রস্থান করুন',
    completed: 'অভিনন্দন!',
    scoreMsg: (c: number, t: number) => `আপনি ${t} টির মধ্যে ${c} টি স্থান চিহ্নিত করেছেন।`,
  },
  hi: {
    title: 'मैं कहाँ हूँ?',
    desc: 'एक के बाद एक दिए गए सुरागों को पढ़कर स्थान को पहचानें। आप जितनी जल्दी उत्तर देंगे, उतना अच्छा है!',
    start: 'शुरू करें',
    next: 'अगला',
    exit: 'बाहर निकलें',
    completed: 'बधाई हो!',
    scoreMsg: (c: number, t: number) => `आपने ${t} में से ${c} स्थानों को पहचाना।`,
  },
  en: {
    title: 'Where Am I?',
    desc: 'Identify the place by reading the clues given one by one. The faster you answer, the better!',
    start: 'Start',
    next: 'Next',
    exit: 'Exit',
    completed: 'Congratulations!',
    scoreMsg: (c: number, t: number) => `You correctly identified ${c} out of ${t} places.`,
  }
};

interface TrialData {
  targetLocation: LocationData;
  options: LocationData[];
}

export const WhereAmI: React.FC<WhereAmIProps> = ({
  language,
  totalTrials = 5,
  onSessionComplete,
  onExit
}) => {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentTrial, setCurrentTrial] = useState(1);
  const [correctTrials, setCorrectTrials] = useState(0);
  const [isTrialCorrect, setIsTrialCorrect] = useState<boolean | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [currentTrialData, setCurrentTrialData] = useState<TrialData | null>(null);
  
  // Clue state
  const [visibleClueCount, setVisibleClueCount] = useState(1);
  
  // Telemetry
  const trialStartTimeRef = useRef<number>(0);
  const [totalLatency, setTotalLatency] = useState(0);
  
  const text = INSTRUCTIONS[language] || INSTRUCTIONS.en;

  const generateTrialData = (): TrialData => {
    // Shuffle locations
    const shuffled = [...LOCATIONS].sort(() => 0.5 - Math.random());
    const targetLocation = shuffled[0];
    
    // Pick 3 wrong options
    const options = [targetLocation, shuffled[1], shuffled[2], shuffled[3]];
    
    // Shuffle options
    options.sort(() => 0.5 - Math.random());

    return {
      targetLocation,
      options
    };
  };

  const handleStartGame = () => {
    setCurrentTrialData(generateTrialData());
    setVisibleClueCount(1);
    setGameState('play');
    trialStartTimeRef.current = Date.now();
  };

  // Timer to reveal clues every 4 seconds
  useEffect(() => {
    if (gameState === 'play' && currentTrialData) {
      const maxClues = currentTrialData.targetLocation.clues[language]?.length || 3;
      if (visibleClueCount < maxClues) {
        const timer = setTimeout(() => {
          setVisibleClueCount(prev => prev + 1);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, visibleClueCount, currentTrialData, language]);

  const handleOptionClick = (optionId: string) => {
    if (gameState !== 'play' || !currentTrialData) return;
    
    const latencyMs = Date.now() - trialStartTimeRef.current;
    setTotalLatency(prev => prev + latencyMs);
    setSelectedOptionId(optionId);
    
    const isCorrect = optionId === currentTrialData.targetLocation.id;
    setIsTrialCorrect(isCorrect);
    
    if (isCorrect) {
      setCorrectTrials(prev => prev + 1);
    }
    
    // Reveal all clues on answer
    const maxClues = currentTrialData.targetLocation.clues[language]?.length || 3;
    setVisibleClueCount(maxClues);
    setGameState('feedback');
  };

  const handleNextTrial = () => {
    if (currentTrial < totalTrials) {
      setCurrentTrial(prev => prev + 1);
      setCurrentTrialData(generateTrialData());
      setVisibleClueCount(1);
      setGameState('play');
      setIsTrialCorrect(null);
      setSelectedOptionId(null);
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
      const accuracyPercentage = Math.round((correctTrials / totalTrials) * 100);
      const summary = {
        totalRounds: totalTrials,
        totalCorrect: correctTrials,
        accuracyPercentage: accuracyPercentage,
        averageLatencyMs: Math.round(totalLatency / totalTrials),
        finalTheta: accuracyPercentage >= 85 ? 1.15 : accuracyPercentage >= 70 ? 0.45 : -0.25,
      };
      onSessionComplete(summary);
    }
  };

  if (gameState === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-8 shadow-sm">
          <MapPin className="w-12 h-12 text-amber-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">{text.title}</h1>
        <p className="text-lg text-slate-600 mb-12 leading-relaxed">{text.desc}</p>
        <button
          onClick={handleStartGame}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 px-12 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 text-lg"
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
    <div className="flex flex-col items-center min-h-[60vh] p-4 max-w-3xl mx-auto w-full">
      <div className="flex justify-between items-center w-full mb-6">
        <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          Trial {currentTrial} of {totalTrials}
        </div>
        <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          Score: {correctTrials}
        </div>
      </div>

      <div className="flex flex-col flex-grow w-full">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-8 min-h-[200px]">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-6 h-6 text-amber-500" />
            <h3 className="text-xl font-bold text-slate-800">Clues</h3>
          </div>
          
          {currentTrialData && (
            <ul className="space-y-4">
              {currentTrialData.targetLocation.clues[language]?.slice(0, visibleClueCount).map((clue, idx) => (
                <li 
                  key={idx} 
                  className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-900 font-medium text-lg animate-in fade-in slide-in-from-bottom-2 duration-500"
                >
                  {clue}
                </li>
              ))}
              
              {gameState === 'play' && visibleClueCount < (currentTrialData.targetLocation.clues[language]?.length || 3) && (
                <li className="flex items-center gap-2 text-slate-400 font-medium p-4 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-300 delay-100"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-300 delay-200"></span>
                  <span className="ml-2 text-sm">Thinking of next clue...</span>
                </li>
              )}
            </ul>
          )}
        </div>

        {gameState === 'feedback' && (
          <div className={`text-center p-4 rounded-2xl mb-8 font-bold text-xl ${isTrialCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isTrialCorrect ? 'Correct!' : 'Incorrect!'}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentTrialData?.options.map((option) => {
            const isCorrectOption = option.id === currentTrialData.targetLocation.id;
            const isSelected = option.id === selectedOptionId;
            
            let btnClass = "p-5 rounded-2xl text-left border-2 font-semibold text-lg transition-all shadow-sm";
            
            if (gameState === 'play') {
              btnClass += " bg-white border-slate-200 hover:border-amber-400 hover:shadow-md text-slate-700 active:scale-95";
            } else {
              if (isCorrectOption) {
                btnClass += " bg-green-50 border-green-500 text-green-800 shadow-md transform scale-[1.02]";
              } else if (isSelected && !isCorrectOption) {
                btnClass += " bg-red-50 border-red-500 text-red-800";
              } else {
                btnClass += " bg-slate-50 border-slate-200 text-slate-400 opacity-60";
              }
            }

            return (
              <button
                key={option.id}
                disabled={gameState !== 'play'}
                onClick={() => handleOptionClick(option.id)}
                className={btnClass}
              >
                {option.name[language] || option.name.en}
              </button>
            );
          })}
        </div>

        {gameState === 'feedback' && (
          <div className="flex justify-center mt-10">
            <button
              onClick={handleNextTrial}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 text-lg transform hover:-translate-y-1"
            >
              {text.next} <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
