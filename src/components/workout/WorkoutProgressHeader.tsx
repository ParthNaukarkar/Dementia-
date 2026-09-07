import React from 'react';
import { 
  CheckCircle2, 
  ChevronRight, 
  X, 
  Sparkles
} from 'lucide-react';

interface WorkoutProgressHeaderProps {
  currentIndex: number;
  totalExercises: number;
  currentGameTitle: string;
  nextGameTitle?: string | null;
  onNextExercise: () => void;
  onExitWorkout: () => void;
}

export const WorkoutProgressHeader: React.FC<WorkoutProgressHeaderProps> = ({
  currentIndex,
  totalExercises,
  currentGameTitle,
  nextGameTitle,
  onNextExercise,
  onExitWorkout,
}) => {
  const currentStep = currentIndex + 1;
  const progressPercent = Math.round((currentStep / totalExercises) * 100);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-3.5 sm:p-4 rounded-3xl shadow-lg border border-purple-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-fadeIn">
      
      {/* Left: Current Exercise Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
          {currentStep}/{totalExercises}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Prescribed Daily Circuit</span>
            </span>
            <span className="text-xs text-slate-400 font-bold hidden md:inline">
              Exercise {currentStep} of {totalExercises}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-black text-white truncate mt-0.5">
            {currentGameTitle}
          </h3>

          {nextGameTitle && (
            <p className="text-[11px] text-purple-300 font-medium truncate hidden sm:block">
              Next: <span className="font-bold text-white">{nextGameTitle}</span>
            </p>
          )}
        </div>
      </div>

      {/* Right: Progress Meter & Action Controls */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-purple-800/40">
        
        {/* Progress Bar */}
        <div className="flex flex-col items-start sm:items-end gap-1">
          <span className="text-[10px] text-purple-200 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{progressPercent}% Routine Done</span>
          </span>
          <div className="w-28 sm:w-36 bg-slate-800/80 h-2 rounded-full overflow-hidden border border-purple-500/20">
            <div 
              className="bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Next & Exit Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNextExercise}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
            title={currentStep === totalExercises ? 'Finish Workout' : 'Continue to Next Exercise'}
          >
            <span>{currentStep === totalExercises ? 'Finish' : 'Next'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onExitWorkout}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Pause & Exit Workout to Home"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
