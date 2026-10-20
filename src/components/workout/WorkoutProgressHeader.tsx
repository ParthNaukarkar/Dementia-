import React from 'react';
import { 
  CheckCircle2, 
  ChevronRight, 
  X, 
  Sparkles
} from 'lucide-react';

import type { SupportedLanguage } from '../../types/prescription';

interface WorkoutProgressHeaderProps {
  currentIndex: number;
  totalExercises: number;
  currentGameTitle: string;
  nextGameTitle?: string | null;
  onNextExercise: () => void;
  onExitWorkout: () => void;
  language?: SupportedLanguage;
}

export const WorkoutProgressHeader: React.FC<WorkoutProgressHeaderProps> = ({
  currentIndex,
  totalExercises,
  currentGameTitle,
  nextGameTitle,
  onNextExercise,
  onExitWorkout,
  language = 'en',
}) => {
  const currentStep = currentIndex + 1;
  const progressPercent = Math.round((currentStep / totalExercises) * 100);

  return (
    <div className="bg-white text-[#1F2421] p-4 sm:p-5 rounded-3xl shadow-xs border border-[#E5DFD5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 animate-fadeIn">
      
      {/* Left: Current Exercise Info */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-[#FDF1EB] border border-[#F5D3C4] text-[#C05634] font-['Sora'] font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
          {currentStep}/{totalExercises}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-[#EDF5F0] text-[#28573E] border border-[#CCE2D4] px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#28573E]" />
              <span>{language === 'hi' ? 'दैनिक सर्किट' : 'Daily Circuit'}</span>
            </span>
            <span className="text-xs text-[#636B65] font-semibold hidden md:inline">
              {language === 'hi' ? `अभ्यास ${currentStep} / ${totalExercises}` : `Exercise ${currentStep} of ${totalExercises}`}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-['Sora'] font-bold text-[#1F2421] truncate mt-0.5">
            {currentGameTitle}
          </h3>

          {nextGameTitle && (
            <p className="text-xs text-[#636B65] font-medium truncate hidden sm:block">
              {language === 'hi' ? 'अगला:' : 'Next:'} <span className="font-bold text-[#1F2421]">{nextGameTitle}</span>
            </p>
          )}
        </div>
      </div>

      {/* Right: Progress Meter & Action Controls */}
      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E5DFD5]">
        
        {/* Progress Bar */}
        <div className="flex flex-col items-start sm:items-end gap-1.5">
          <span className="text-xs text-[#38403A] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#28573E]" />
            <span>{language === 'hi' ? `${progressPercent}% पूर्ण` : `${progressPercent}% Done`}</span>
          </span>
          <div className="w-32 sm:w-40 bg-[#F4F0EA] h-2.5 rounded-full overflow-hidden border border-[#E5DFD5]">
            <div 
              className="bg-[#C05634] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Next & Exit Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNextExercise}
            className="px-4 py-2.5 rounded-2xl bg-[#C05634] hover:bg-[#A64727] text-white font-['Sora'] font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            title={currentStep === totalExercises ? (language === 'hi' ? 'व्यायाम समाप्त करें' : 'Finish Workout') : (language === 'hi' ? 'अगले व्यायाम पर जाएं' : 'Continue to Next Exercise')}
          >
            <span>
              {currentStep === totalExercises 
                ? (language === 'hi' ? 'समाप्त करें' : 'Finish') 
                : (language === 'hi' ? 'अगला खेल' : 'Next Game')}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExitWorkout}
            className="p-2.5 rounded-2xl bg-[#F4F0EA] hover:bg-[#FAF8F5] text-[#636B65] hover:text-[#C05634] border border-[#E5DFD5] transition-colors cursor-pointer"
            title={language === 'hi' ? 'व्यायाम रोकें और मुख्य पृष्ठ पर जाएं' : 'Pause & Exit Workout to Home'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
