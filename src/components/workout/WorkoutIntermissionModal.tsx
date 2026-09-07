import React from 'react';
import { 
  CheckCircle2, 
  Brain, 
  Sparkles, 
  Coffee,
  Heart,
  X
} from 'lucide-react';
import type { SupportedLanguage } from '../../types/prescription';

interface WorkoutIntermissionModalProps {
  isOpen: boolean;
  language: SupportedLanguage;
  patientName?: string;
  completedGameTitle: string;
  completedIndex: number;
  totalExercises: number;
  lastSummary?: any | null;
  nextGameTitle: string;
  nextGameSubtitle?: string;
  nextGameDomain?: string;
  nextGameEstimatedMinutes?: number;
  onStartNext: () => void;
  onExitWorkout: () => void;
}

export const WorkoutIntermissionModal: React.FC<WorkoutIntermissionModalProps> = ({
  isOpen,
  language: _language,
  patientName = 'Dadu',
  completedGameTitle,
  completedIndex,
  totalExercises,
  lastSummary,
  nextGameTitle,
  nextGameSubtitle,
  nextGameDomain = 'Cognitive Stimulation',
  nextGameEstimatedMinutes = 3,
  onStartNext,
  onExitWorkout,
}) => {
  if (!isOpen) return null;

  const currentStep = completedIndex + 1;
  const progressPercent = Math.round((currentStep / totalExercises) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 relative">
          <button
            onClick={onExitWorkout}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Exit Workout"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 border border-white/30 shadow-inner">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                  Exercise {currentStep} of {totalExercises} Complete
                </span>
                <span className="text-xs text-emerald-100 font-bold">
                  {progressPercent}% Done
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Excellent effort, {patientName.split(' ')[0]}!
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5">
          
          {/* Reassurance & Breathing Break Box */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Coffee className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <span>Intermission & Rest Break</span>
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              </h4>
              <p className="text-xs sm:text-sm text-amber-900/90 font-medium mt-1 leading-relaxed">
                Take a deep breath and relax your shoulders. There is zero rush. When you feel refreshed, we will move to your next exercise.
              </p>
            </div>
          </div>

          {/* Just Completed Performance Pill */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <span>Just Completed</span>
              <span className="text-emerald-700 font-black">Success Recorded</span>
            </div>
            <p className="text-sm font-black text-slate-900">
              {completedGameTitle}
            </p>
            {lastSummary && (
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/80 text-center text-[11px]">
                <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[9px] font-bold uppercase">Accuracy</span>
                  <strong className="text-emerald-700 font-black">{lastSummary.accuracyPercentage ?? 100}%</strong>
                </div>
                <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[9px] font-bold uppercase">Deliberation</span>
                  <strong className="text-blue-700 font-black">{((lastSummary.averageLatencyMs || lastSummary.meanDeliberationMs || 2400) / 1000).toFixed(1)}s</strong>
                </div>
                <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[9px] font-bold uppercase">Assistance</span>
                  <strong className="text-amber-800 font-black">{lastSummary.autoAssistedRounds || lastSummary.autoAssistedTrials ? 'Assisted' : 'Independent'}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Up Next Card */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                Next in Routine ({currentStep + 1} of {totalExercises})
              </span>
              <span className="text-xs text-purple-900 font-bold flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-purple-600" />
                <span>~{nextGameEstimatedMinutes} mins</span>
              </span>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                {nextGameTitle}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {nextGameSubtitle || nextGameDomain}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onStartNext}
              className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm sm:text-base shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-97"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Start Next Exercise ➔</span>
            </button>

            <button
              onClick={onExitWorkout}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs cursor-pointer transition-all"
            >
              Pause & Exit
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
