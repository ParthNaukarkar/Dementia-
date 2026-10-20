import React from 'react';
import { 
  Play, 
  Sparkles, 
  RotateCcw,
  Check,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import type { SupportedLanguage, PatientPrescription, GameId } from '../../types/prescription';
import type { PatientProfile, UserRole } from '../../types/auth';
import { GAME_CATALOG } from '../../data/gameCatalog';

interface PatientTodayHomeProps {
  language: SupportedLanguage;
  patient: PatientProfile | null;
  prescription: PatientPrescription;
  currentRole?: UserRole;
  caretakerName?: string;
  isWorkoutCompletedToday?: boolean;
  completedGameIds?: GameId[];
  onBeginWorkout: () => void;
  onLaunchGame: (gameId: GameId) => void;
  onOpenPrescriptionModal: () => void;
  dayStreak?: number;
  showCognitiveIndex?: boolean;
  onOpenSOS?: () => void;
}

export const PatientTodayHome: React.FC<PatientTodayHomeProps> = ({
  language,
  patient,
  prescription,
  isWorkoutCompletedToday = false,
  completedGameIds = [],
  onBeginWorkout,
  onLaunchGame,
  onOpenSOS,
}) => {
  const prescribedSet = new Set(prescription.prescribedGameIds);
  const todayGames = GAME_CATALOG.filter(g => prescribedSet.has(g.id));

  // Determine the next game to play: first prescribed game that is not yet completed
  const nextGame = todayGames.find(g => !completedGameIds.includes(g.id)) || todayGames[0];
  const completedCount = todayGames.filter(g => completedGameIds.includes(g.id)).length;
  const isHi = language === 'hi';

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = patient?.name?.split(' ')[0] || (isHi ? 'मीरा' : 'Meera');
    if (hour < 12) {
      return isHi ? `सुप्रभात, ${firstName} जी` : `Good morning, ${firstName}`;
    } else if (hour < 17) {
      return isHi ? `नमस्ते, ${firstName} जी` : `Good afternoon, ${firstName}`;
    } else {
      return isHi ? `शुभ संध्या, ${firstName} जी` : `Good evening, ${firstName}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-fadeIn">
      
      {/* ─── 1. NATURAL, HUMAN GREETING (Sitting naturally on page, no boxes) ─── */}
      <section className="space-y-2 pt-2">
        <h1 className="font-['Sora'] text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#1F2421] tracking-tight leading-tight">
          {getGreeting()}
        </h1>
        <p className="text-lg sm:text-xl text-[#636B65] font-normal leading-relaxed max-w-2xl">
          {isWorkoutCompletedToday
            ? (isHi 
                ? 'आपने आज के सभी अभ्यास पूरे कर लिए हैं। बहुत बढ़िया प्रयास! आप जब चाहें दोबारा खेल सकते हैं।' 
                : 'You have completed all your exercises for today. Wonderful effort! You can rest or replay any exercise whenever you like.')
            : (isHi
                ? 'आज के विचारशील और शांत अभ्यास आपके लिए तैयार हैं। कोई जल्दी नहीं है — अपनी गति से आनंद लें।'
                : 'Your gentle daily cognitive practice is ready. Take all the time you need, with no rush or pressure.')}
        </p>
      </section>

      {/* ─── 2. CENTERPIECE: NEXT RECOMMENDED ACTIVITY ─────────────────────────── */}
      <section>
        {isWorkoutCompletedToday ? (
          /* ALL COMPLETED STATE: Warm, Restful, Dignified */
          <div className="bg-white rounded-3xl border border-[#CCE2D4] p-8 sm:p-10 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDF5F0] text-[#28573E] text-xs font-bold uppercase tracking-wider font-['Sora']">
                  <Check className="w-4 h-4 text-[#28573E]" />
                  <span>{isHi ? 'दैनिक अभ्यास पूर्ण' : 'Daily Practice Completed'}</span>
                </div>
                <h2 className="font-['Sora'] text-2xl sm:text-3xl font-bold text-[#1F2421]">
                  {isHi ? 'आज का अभ्यास सफलता से संपन्न हुआ' : 'All done for today!'}
                </h2>
                <p className="text-[#636B65] text-base leading-relaxed">
                  {isHi
                    ? `आपने आज ${todayGames.length} अभ्यास पूरे किए हैं। अपने दिमाग को सक्रिय और तरोताज़ा रखना एक सुंदर आदत है।`
                    : `You completed all ${todayGames.length} exercises today. Keeping your mind active and relaxed is wonderful for daily wellness.`}
                </p>
              </div>

              <button
                onClick={onBeginWorkout}
                className="h-14 px-8 rounded-2xl bg-[#28573E] hover:bg-[#1E4430] text-white font-['Sora'] font-bold text-base transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98] flex items-center gap-2.5 shrink-0"
              >
                <RotateCcw className="w-5 h-5 text-white" />
                <span>{isHi ? 'अभ्यास दोबारा खेलें' : 'Replay Practice'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE HERO ACTIVITY TILE */
          <div className="bg-white rounded-3xl border border-[#E5DFD5] p-8 sm:p-11 shadow-xs space-y-8">
            
            {/* Header: Next Recommended Exercise */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F4F0EA] pb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C05634]" />
                <span className="text-xs font-['Sora'] font-bold text-[#C05634] uppercase tracking-wider">
                  {isHi ? 'आज का मुख्य अनुशंसित अभ्यास' : 'Recommended Next Exercise'}
                </span>
              </div>
              {todayGames.length > 1 && (
                <span className="text-xs font-semibold text-[#636B65]">
                  {isHi 
                    ? `कुल ${todayGames.length} में से ${completedCount} पूर्ण` 
                    : `${completedCount} of ${todayGames.length} completed`}
                </span>
              )}
            </div>

            {/* Next Game Details */}
            {nextGame && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-3.5 max-w-xl">
                  <h2 className="font-['Sora'] text-2xl sm:text-3xl font-extrabold text-[#1F2421] tracking-tight">
                    {nextGame.title[language]}
                  </h2>
                  <p className="text-[#38403A] text-base sm:text-lg leading-relaxed">
                    {nextGame.subtitle[language]}
                  </p>
                  <p className="text-sm text-[#636B65] leading-relaxed">
                    {nextGame.description[language] || (isHi ? 'अपनी गति से खेलें, कोई समय सीमा नहीं है।' : 'Take your time, with no countdown or rush.')}
                  </p>
                </div>

                {/* Big Accessible Primary CTA Button (60px high, terracotta, tactile) */}
                <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-start gap-3">
                  <button
                    onClick={() => onLaunchGame(nextGame.id)}
                    className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-[#C05634] hover:bg-[#A64727] text-white font-['Sora'] font-bold text-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    <Play className="w-5 h-5 fill-white text-white" />
                    <span>{isHi ? 'अभ्यास शुरू करें' : 'Begin Exercise'}</span>
                  </button>
                  <span className="text-xs text-[#636B65] font-medium self-center sm:self-start md:self-center">
                    {isHi ? 'लगभग ३–४ मिनट • शांति से खेलें' : 'About 3–4 mins • No time pressure'}
                  </span>
                </div>
              </div>
            )}

            {/* Reassuring Garden Note */}
            <div className="pt-2">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] flex items-center gap-3.5 text-sm text-[#38403A]">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#E5DFD5] flex items-center justify-center text-[#28573E] shrink-0">
                  <Sparkles className="w-4 h-4 text-[#28573E]" />
                </div>
                <p className="leading-relaxed font-medium">
                  {isHi
                    ? '💡 कोई भी उत्तर सही या गलत सीखने का हिस्सा है। आराम से बैठें और खेल का आनंद लें।'
                    : '💡 Every exercise is designed for calm focus. Rest whenever you like — there are no penalties or timers.'}
                </p>
              </div>
            </div>

          </div>
        )}
      </section>

      {/* ─── 3. TODAY'S EXERCISE PLAYLIST (Clean & Natural, No Clutter) ─────────── */}
      {todayGames.length > 1 && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-['Sora'] text-xl font-bold text-[#1F2421]">
              {isHi ? 'आज के अभ्यास' : "Today's Activities"}
            </h3>
            <span className="text-sm font-medium text-[#636B65]">
              {isHi ? `${todayGames.length} अभ्यास निर्धारित` : `${todayGames.length} exercises planned`}
            </span>
          </div>

          <div className="space-y-3">
            {todayGames.map((game, index) => {
              const isDone = completedGameIds.includes(game.id);
              const isCurrentNext = !isDone && game.id === nextGame?.id;

              return (
                <div
                  key={game.id}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDone
                      ? 'bg-[#FAF8F5] border-[#E5DFD5] opacity-80'
                      : isCurrentNext
                      ? 'bg-white border-[#C05634] shadow-xs'
                      : 'bg-white border-[#E5DFD5] hover:border-[#D5CCC0]'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                      isDone
                        ? 'bg-[#EDF5F0] border-[#CCE2D4] text-[#28573E]'
                        : isCurrentNext
                        ? 'bg-[#FDF1EB] border-[#F5D3C4] text-[#C05634]'
                        : 'bg-[#F4F0EA] border-[#E5DFD5] text-[#636B65]'
                    }`}>
                      {isDone ? (
                        <Check className="w-6 h-6 text-[#28573E]" />
                      ) : (
                        <span className="font-['Sora'] font-bold text-base">{index + 1}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-['Sora'] font-bold text-base sm:text-lg text-[#1F2421] truncate">
                          {game.title[language]}
                        </h4>
                        {isDone && (
                          <span className="text-xs font-['Sora'] font-bold text-[#28573E] bg-[#EDF5F0] px-2.5 py-0.5 rounded-full border border-[#CCE2D4]">
                            {isHi ? 'पूर्ण' : 'Completed'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#636B65] mt-0.5 truncate">
                        {game.subtitle[language]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => onLaunchGame(game.id)}
                      className={`h-11 px-5 rounded-xl font-['Sora'] font-bold text-sm transition-all duration-150 cursor-pointer flex items-center gap-2 ${
                        isDone
                          ? 'bg-white hover:bg-[#F4F0EA] text-[#38403A] border border-[#E5DFD5]'
                          : isCurrentNext
                          ? 'bg-[#C05634] hover:bg-[#A64727] text-white shadow-2xs'
                          : 'bg-white hover:bg-[#FAF8F5] text-[#1F2421] border border-[#E5DFD5]'
                      }`}
                    >
                      <span>{isDone ? (isHi ? 'पुनः खेलें' : 'Replay') : (isHi ? 'खेलें' : 'Play')}</span>
                      {!isDone && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── 4. EMERGENCY & DISTRESS REASSURANCE CARD ─── */}
      <section className="bg-red-50/70 border-2 border-red-200/80 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-['Sora'] font-black text-xl text-[#1F2421]">
              {isHi ? 'तत्काल सहायता या आपातकाल?' : 'Need Immediate Help or Feeling Distressed?'}
            </h3>
            <p className="text-sm text-[#636B65] font-medium mt-0.5">
              {isHi
                ? 'यदि आप असहज या चिंतित महसूस कर रहे हैं, तो तुरंत सहायता प्राप्त करें।'
                : 'If you feel unwell, anxious, or disoriented, tap here to reach your caregiver or emergency services.'}
            </p>
          </div>
        </div>

        {onOpenSOS && (
          <button
            onClick={onOpenSOS}
            className="h-14 px-8 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-['Sora'] font-black text-base transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0 flex items-center justify-center gap-2.5 active:scale-98"
          >
            <span>{isHi ? 'आपातकालीन सहायता (SOS)' : 'Open SOS Emergency'}</span>
          </button>
        )}
      </section>

    </div>
  );
};
