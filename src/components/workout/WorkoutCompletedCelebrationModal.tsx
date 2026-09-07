import React, { useEffect } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  FileText, 
  Home
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SupportedLanguage, GameId } from '../../types/prescription';
import { GAME_CATALOG } from '../../data/gameCatalog';

interface WorkoutCompletedCelebrationModalProps {
  isOpen: boolean;
  language: SupportedLanguage;
  patientName?: string;
  completedGameIds: GameId[];
  sessionSummaries: Record<string, any>;
  dayStreak?: number;
  onViewReport: () => void;
  onReturnHome: () => void;
}

export const WorkoutCompletedCelebrationModal: React.FC<WorkoutCompletedCelebrationModalProps> = ({
  isOpen,
  language,
  patientName = 'Dadu',
  completedGameIds,
  sessionSummaries,
  dayStreak = 1,
  onViewReport,
  onReturnHome,
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        // Fire celebration confetti cannon
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 300);
      } catch {
        // Ignore canvas confetti in unsupported environments
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 my-8">
        
        {/* Vibrant Celebration Header */}
        <div className="bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white mx-auto shadow-inner border border-white/40 mb-3 animate-bounce">
            <Trophy className="w-10 h-10 text-white fill-white/20" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today's Daily Workout Complete!</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Sensational effort, {patientName.split(' ')[0]}!
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 font-medium mt-1 max-w-md mx-auto leading-relaxed">
            You completed all <strong>{completedGameIds.length} prescribed exercises</strong> today. Your memory and focus pathways are actively firing!
          </p>

          {/* Streak pill */}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-slate-950/40 text-amber-300 border border-amber-300/30 text-xs font-black shadow-md">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span>{dayStreak} Day Cognitive Streak Preserved!</span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-7 space-y-5">
          
          {/* Exercises Completed Recap */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-700">
              <span>Completed Routine ({completedGameIds.length} Exercises)</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Adherence</span>
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {completedGameIds.map((gameId, idx) => {
                const meta = GAME_CATALOG.find(g => g.id === gameId);
                const title = meta?.title[language] || gameId.replace(/-/g, ' ');
                const summary = sessionSummaries[gameId];
                const acc = summary?.accuracyPercentage ?? 100;

                return (
                  <div 
                    key={`${gameId}-${idx}`} 
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-900 font-extrabold truncate">
                          {title}
                        </p>
                        <span className="text-[10px] text-slate-400 uppercase font-black">
                          {meta?.domainLabel[language] || 'Cognitive Training'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[11px]">
                        {acc}% Accuracy
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Neuroplastic Calibration Alert */}
          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs font-bold text-purple-950">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Session Logged to Attending Caregiver Console</span>
            </div>
            <span className="text-[10px] uppercase font-black bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">
              OASIS-2 Calibrated
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onViewReport}
              className="w-full sm:flex-1 py-4 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-97"
            >
              <FileText className="w-4 h-4" />
              <span>View Caregiver Medical Report</span>
            </button>

            <button
              onClick={onReturnHome}
              className="w-full sm:flex-1 py-4 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-97"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
