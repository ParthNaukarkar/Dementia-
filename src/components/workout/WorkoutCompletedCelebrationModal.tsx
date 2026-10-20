import React, { useEffect } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-xl border border-[#E5DFD5] overflow-hidden text-[#1F2421] my-8">
        
        {/* Vibrant Celebration Header (Keen Warm Canvas) */}
        <div className="bg-[#FAF8F5] p-6 sm:p-8 text-center relative overflow-hidden border-b border-[#E5DFD5]">
          <div className="w-20 h-20 rounded-3xl bg-[#FAF3E7] border border-[#F2E1C2] flex items-center justify-center text-[#A86F15] mx-auto shadow-xs mb-3.5">
            <Trophy className="w-10 h-10 text-[#A86F15]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EDF5F0] text-[#28573E] border border-[#CCE2D4] text-xs font-['Sora'] font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'दैनिक मस्तिष्क व्यायाम पूर्ण!' : "Today's Daily Workout Complete!"}</span>
          </div>

          <h2 className="font-['Sora'] text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F2421]">
            {language === 'hi' 
              ? `शानदार प्रयास, ${patientName.split(' ')[0]} जी!` 
              : `Splendid effort, ${patientName.split(' ')[0]}!`}
          </h2>
          <p className="text-sm text-[#636B65] font-medium mt-1.5 max-w-md mx-auto leading-relaxed">
            {language === 'hi' 
              ? `आपने आज के सभी ${completedGameIds.length} निर्धारित खेल सफलतापूर्वक पूरे किए। आपकी स्मृति और ध्यान के तंत्रिका मार्ग सक्रिय हैं!` 
              : `You completed all ${completedGameIds.length} prescribed exercises today. Your memory and focus pathways are actively firing!`}
          </p>

          {/* Streak pill */}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-white text-[#C05634] border border-[#F5D3C4] text-xs font-['Sora'] font-bold shadow-xs">
            <Flame className="w-4 h-4 text-[#C05634] fill-[#C05634]" />
            <span>
              {language === 'hi' 
                ? `${dayStreak} दिन का संज्ञान सिलसिला जारी!` 
                : `${dayStreak} Day Cognitive Streak Preserved!`}
            </span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Direct Next Step Action Guidance Banner in Warm Terracotta Well */}
          <div className="p-5 rounded-2xl bg-[#FDF1EB] border border-[#F5D3C4] space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-['Sora'] font-bold uppercase tracking-wider text-[#C05634] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C05634]" />
                <span>{language === 'hi' ? 'अब अगला महत्वपूर्ण कदम:' : 'Next Important Steps:'}</span>
              </span>
              <span className="text-xs font-bold text-[#636B65] bg-white px-2.5 py-0.5 rounded-full border border-[#F5D3C4]">
                {language === 'hi' ? 'दैनिक दिनचर्या' : 'Daily Routine'}
              </span>
            </div>

            {/* Go to Medications CTA Button: Terracotta 56px Target */}
            {onGoToMedications && (
              <button
                onClick={onGoToMedications}
                className="w-full p-4 rounded-2xl bg-[#C05634] hover:bg-[#A64727] text-white font-['Sora'] font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer active:scale-[0.98] group"
              >
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Pill className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-base leading-tight">
                      {language === 'hi' ? '💊 अपनी निर्धारित दवाइयां लें' : '💊 Take Scheduled Medications Now'}
                    </p>
                    <span className="text-xs text-[#FDF1EB] font-normal mt-0.5 block">
                      {language === 'hi' ? 'दवाइयों की सूची देखें और टिक मार्क करें' : 'View daily schedule and mark today’s doses as taken'}
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </button>
            )}

            {/* Go to Routine Tasks CTA Button: Forest Green */}
            {onGoToRoutine && (
              <button
                onClick={onGoToRoutine}
                className="w-full p-3.5 rounded-2xl bg-[#28573E] hover:bg-[#1E4430] text-white font-['Sora'] font-bold text-sm shadow-xs hover:shadow-sm transition-all flex items-center justify-between cursor-pointer active:scale-[0.98] group"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight">
                      {language === 'hi' ? '📋 दैनिक दिनचर्या कार्य देखें' : '📋 Check Daily Routine Tasks'}
                    </p>
                    <span className="text-xs text-[#CCE2D4] font-normal">
                      {language === 'hi' ? 'पानी पीना, टहलना और विश्राम कार्य' : 'Hydration, walking, gentle rest and wellness tasks'}
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
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-['Sora'] font-bold uppercase tracking-wider text-[#1F2421]">
              <span>{language === 'hi' ? `पूर्ण किए गए अभ्यास (${completedGameIds.length})` : `Completed Routine (${completedGameIds.length} Exercises)`}</span>
              <span className="text-[#28573E] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[#28573E]" />
                <span>{language === 'hi' ? '१००% अनुपालन' : '100% Adherence'}</span>
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
                    className="p-3.5 rounded-2xl bg-[#F4F0EA] border border-[#E5DFD5] flex items-center justify-between text-xs font-bold"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#EDF5F0] text-[#28573E] flex items-center justify-center shrink-0 border border-[#CCE2D4]">
                        <CheckCircle2 className="w-4 h-4 text-[#28573E]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-['Sora'] text-sm font-bold text-[#1F2421] truncate">
                          {title}
                        </p>
                        <span className="text-[11px] text-[#636B65] uppercase font-bold">
                          {meta?.domainLabel[language] || 'Cognitive Training'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EDF5F0] text-[#28573E] border border-[#CCE2D4] font-['Sora'] font-bold text-xs">
                        {acc}% {language === 'hi' ? 'सटीकता' : 'Accuracy'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Neuroplastic Calibration Status */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] flex items-center justify-between text-xs font-medium text-[#38403A]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C05634]" />
              <span>{language === 'hi' ? 'सत्र की रिपोर्ट देखभालकर्ता कंसोल में स्वतः दर्ज' : 'Session Telemetry Synced to Caregiver Console'}</span>
            </div>
            <span className="text-[11px] uppercase font-bold bg-[#EDF5F0] text-[#28573E] px-2.5 py-0.5 rounded-full border border-[#CCE2D4]">
              {language === 'hi' ? 'OASIS-2 कैलिब्रेटेड' : 'OASIS-2 Calibrated'}
            </span>
          </div>

          {/* Secondary Footer Action: Return to Patient Home */}
          <div className="pt-1">
            <button
              onClick={onReturnHome}
              className="w-full h-13 rounded-2xl bg-[#F4F0EA] hover:bg-[#EDE7DE] border border-[#E5DFD5] text-[#1F2421] font-['Sora'] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Home className="w-4 h-4 text-[#636B65]" />
              <span>{language === 'hi' ? 'मुख्य पृष्ठ पर वापस' : 'Back to Home'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
