import React, { useEffect } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  FileText, 
  Home,
  Pill,
  CalendarCheck,
  ArrowRight
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
  onGoToMedications?: () => void;
  onGoToRoutine?: () => void;
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
  onGoToMedications,
  onGoToRoutine,
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
            <span>{language === 'hi' ? 'आज का दैनिक व्यायाम पूर्ण!' : "Today's Daily Workout Complete!"}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === 'hi' 
              ? `शानदार प्रयास, ${patientName.split(' ')[0]} जी!` 
              : `Sensational effort, ${patientName.split(' ')[0]}!`}
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 font-medium mt-1 max-w-md mx-auto leading-relaxed">
            {language === 'hi' 
              ? `आपने आज के सभी ${completedGameIds.length} निर्धारित खेल सफलतापूर्वक पूरे किए। आपके मस्तिष्क के तंत्रिका मार्ग सक्रिय हैं!` 
              : `You completed all ${completedGameIds.length} prescribed exercises today. Your memory and focus pathways are actively firing!`}
          </p>

          {/* Streak pill */}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-slate-950/40 text-amber-300 border border-amber-300/30 text-xs font-black shadow-md">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span>
              {language === 'hi' 
                ? `${dayStreak} दिन का संज्ञान सिलसिला जारी!` 
                : `${dayStreak} Day Cognitive Streak Preserved!`}
            </span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-7 space-y-5">
          
          {/* Direct Next Step Action Guidance Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border-2 border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{language === 'hi' ? 'अब अगला महत्वपूर्ण कदम:' : 'Next Important Steps:'}</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                {language === 'hi' ? 'देखभालकर्ता द्वारा निर्धारित' : 'Prescribed by Caregiver'}
              </span>
            </div>

            {/* Go to Medications CTA Button */}
            {onGoToMedications && (
              <button
                onClick={onGoToMedications}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-between cursor-pointer active:scale-98 group"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Pill className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm sm:text-base leading-tight">
                      {language === 'hi' ? '💊 अपनी दवाइयां लें (दैनिक खुराक)' : '💊 Go Get Your Medicine (Take Scheduled Doses Now)'}
                    </p>
                    <span className="text-[11px] text-emerald-100 font-medium">
                      {language === 'hi' ? 'निर्धारित दवाइयों की जांच करें और टिक करें' : 'View daily schedule and mark today’s doses as taken'}
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </button>
            )}

            {/* Go to Routine Tasks CTA Button */}
            {onGoToRoutine && (
              <button
                onClick={onGoToRoutine}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-700 hover:from-indigo-700 hover:to-sky-800 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-between cursor-pointer active:scale-98 group"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-extrabold text-xs sm:text-sm leading-tight">
                      {language === 'hi' ? '📋 दैनिक दिनचर्या कार्य देखें' : '📋 Check Daily Routine Tasks'}
                    </p>
                    <span className="text-[10px] text-indigo-100 font-medium">
                      {language === 'hi' ? 'पानी पीना, टहलना और स्वास्थ्य कार्य' : 'Hydration, walking, wellness and rest tasks'}
                    </span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
            )}
          </div>

          {/* Exercises Completed Recap */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-700">
              <span>{language === 'hi' ? `पूर्ण किए गए अभ्यास (${completedGameIds.length})` : `Completed Routine (${completedGameIds.length} Exercises)`}</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Adherence</span>
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
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
              <span>{language === 'hi' ? 'सत्र की रिपोर्ट देखभालकर्ता कंसोल में दर्ज की गई' : 'Session Logged to Attending Caregiver Console'}</span>
            </div>
            <span className="text-[10px] uppercase font-black bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">
              OASIS-2 Calibrated
            </span>
          </div>

          {/* Secondary Footer Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onViewReport}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-97"
            >
              <FileText className="w-4 h-4 text-amber-700" />
              <span>{language === 'hi' ? 'क्लिनिकल रिपोर्ट देखें' : 'View Clinical Session Report'}</span>
            </button>

            <button
              onClick={onReturnHome}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-97"
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>{language === 'hi' ? 'मुख्य पृष्ठ पर वापस' : 'Back to Home'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
