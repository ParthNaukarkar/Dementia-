import { 
  Play, 
  Flame, 
  Sparkles, 
  ChevronRight, 
  Brain, 
  Sliders,
  Lock,
  CheckCircle2,
  RotateCcw
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
}

export const PatientTodayHome: React.FC<PatientTodayHomeProps> = ({
  language,
  patient,
  prescription,
  currentRole = 'patient',
  caretakerName,
  isWorkoutCompletedToday = false,
  completedGameIds = [],
  onBeginWorkout,
  onLaunchGame,
  onOpenPrescriptionModal,
  dayStreak = 1,
  showCognitiveIndex = false,
}) => {
  const prescribedSet = new Set(prescription.prescribedGameIds);
  const todayGames = GAME_CATALOG.filter(g => prescribedSet.has(g.id));

  // Days of week for Lumosity Training History (S M T W T F S)
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const todayDayIndex = new Date().getDay(); // 0 = Sunday

  // Localized texts
  const t = {
    workoutHeader: {
      as: 'আজিৰ অনুশীলন (Day 1 of 7)',
      bn: 'আজকের অনুশীলন (Day 1 of 7)',
      hi: 'आज का मानसिक अभ्यास (Day 1 of 7)',
      en: 'Day 1 of 7 • Your Daily Workout',
    },
    workoutSub: {
      as: 'প্ৰতিটো খেল মগজুৰ ভিন্ন অংশৰ বাবে। আহক আমি শান্তভাৱে চেষ্টা কৰোঁ।',
      bn: 'প্রতিটি খেলা মস্তিষ্কের ভিন্ন অংশের জন্য। আসুন আমরা শান্তভাবে চেষ্টা করি।',
      hi: 'प्रत्येक खेल मस्तिष्क के एक अलग हिस्से को सक्रिय करता है। आइए अभ्यास करें।',
      en: 'Each exercise works a different part of your thinking. Let\'s give them all a try.',
    },
    beginBtn: {
      as: 'আৰম্ভ কৰক (Begin)',
      bn: 'শুরু করুন (Begin)',
      hi: 'शुरू करें (Begin)',
      en: 'Begin',
    },
    todayExercises: {
      as: 'আজিৰ নিৰ্বাচিত খেলসমূহ (Today\'s Exercises)',
      bn: 'আজকের নির্বাচিত খেলাসমূহ (Today\'s Exercises)',
      hi: 'आज के निर्धारित अभ्यास (Today\'s Exercises)',
      en: 'Today\'s Exercises',
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-16 animate-fadeIn">
      
      {/* LEFT COLUMN: Daily Workout Card + Rx Banner + Extra (7 Cols on desktop) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* MAIN WORKOUT CARD (Exact Lumosity layout from Image 1) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Header row with Circular Head Ring + Title + Begin Button */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            
            {/* Circular Head Graphic with Neuroplastic Ring */}
            <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shrink-0 border-4 shadow-md transition-all ${
              isWorkoutCompletedToday
                ? 'bg-gradient-to-tr from-emerald-100 via-teal-50 to-emerald-200 border-emerald-500'
                : 'bg-gradient-to-tr from-amber-100 via-orange-50 to-amber-200 border-amber-500'
            }`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-inner ${
                isWorkoutCompletedToday
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                  : 'bg-gradient-to-br from-amber-500 to-orange-600'
              }`}>
                {isWorkoutCompletedToday ? (
                  <CheckCircle2 className="w-9 h-9" />
                ) : (
                  <Brain className="w-9 h-9" />
                )}
              </div>
              {/* Flame Badge */}
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md border border-slate-200">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
              </div>
            </div>

            {/* Title & Begin Button */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <span className={`text-xs font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                  isWorkoutCompletedToday
                    ? 'text-emerald-800 bg-emerald-50 border-emerald-300'
                    : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}>
                  {isWorkoutCompletedToday ? '✓ Daily Workout Completed!' : t.workoutHeader[language]}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
                  Welcome, {patient?.name?.split(' ')[0] || 'Dadu'}!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed max-w-md">
                  {isWorkoutCompletedToday
                    ? 'Congratulations! You have finished all prescribed exercises today. You can replay the circuit anytime.'
                    : t.workoutSub[language]}
                </p>
              </div>

              {/* Big Vibrant Begin Button (Image 1) */}
              <div>
                <button
                  onClick={onBeginWorkout}
                  className={`w-full sm:w-auto px-10 py-3.5 rounded-full text-white font-black text-base shadow-lg hover:shadow-xl transition-all cursor-pointer ring-2 active:scale-97 flex items-center justify-center gap-2 ${
                    isWorkoutCompletedToday
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 ring-emerald-200'
                      : 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 ring-orange-200'
                  }`}
                >
                  {isWorkoutCompletedToday ? (
                    <>
                      <RotateCcw className="w-5 h-5 text-white" />
                      <span>Replay Daily Workout ({todayGames.length} Games)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-white" />
                      <span>{t.beginBtn[language]} ({todayGames.length} Games)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          <hr className="border-slate-100" />

          {/* Today's Exercises Section (Icons + Category pills) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                {t.todayExercises[language]} ({todayGames.length} Prescribed)
              </h4>

              {/* Prescription Editing Security: STRICTLY CARETAKER ONLY */}
              {currentRole === 'caretaker' ? (
                <button
                  onClick={onOpenPrescriptionModal}
                  className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Prescribe Games (Caregiver)</span>
                </button>
              ) : (
                <span 
                  className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 select-none"
                  title="Only your authorized caregiver can modify your cognitive prescription"
                >
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Prescribed by {caretakerName || 'Caregiver'}</span>
                </span>
              )}
            </div>

            {/* List of Game Pills (Matching Image 1) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {todayGames.map((game) => {
                const isGameDone = completedGameIds.includes(game.id);

                return (
                  <button
                    key={game.id}
                    onClick={() => onLaunchGame(game.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-left group shadow-2xs ${
                      isGameDone
                        ? 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-400'
                        : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isGameDone
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 group-hover:bg-amber-100 text-slate-700 group-hover:text-amber-800'
                      }`}>
                        {isGameDone ? <CheckCircle2 className="w-5 h-5 text-emerald-700" /> : <Brain className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-extrabold text-sm truncate ${
                          isGameDone ? 'text-emerald-950' : 'text-slate-800 group-hover:text-amber-900'
                        }`}>
                          {game.title[language]}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-amber-700">
                          {game.subtitle[language]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {isGameDone && (
                        <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Done
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Neuroplasticity unlock progress bar (Image 1) */}
          <div className="pt-2">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Neuroplastic Calibration</span>
              </div>
              <span className="text-amber-800 font-extrabold">Active (θ: +0.42)</span>
            </div>
          </div>

        </div>

        {/* LumosityRx / Digital Therapeutic Prescribed Banner (Image 1 Bottom) */}
        <div className="rounded-3xl bg-gradient-to-r from-teal-50 via-emerald-50 to-amber-50 border border-teal-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-teal-950 uppercase tracking-tight">
                Smriti<span className="text-emerald-700 font-bold">Rx</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                MDoNER Certified
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-lg leading-relaxed font-medium">
              Evidence-based cognitive rehabilitation tailored for dementia & early cognitive impairment. Calibrated on Washington University OASIS-2 clinical benchmarks.
            </p>
          </div>

          <button
            onClick={() => onLaunchGame('word-recall')}
            className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer shrink-0"
          >
            Launch Clinical Test →
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN: Training History + Current LPI (4 Cols on desktop) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* TRAINING HISTORY CARD (Exact Lumosity calendar from Image 1) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>Training History</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* S M T W T F S Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 text-center pt-2">
            {daysOfWeek.map((day, idx) => {
              const isToday = idx === todayDayIndex;
              const hasStreak = idx <= todayDayIndex && idx >= todayDayIndex - dayStreak + 1;

              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <span className={`text-xs font-black ${isToday ? 'text-amber-800 underline decoration-2' : 'text-slate-500'}`}>
                    {day}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    hasStreak 
                      ? 'bg-amber-100 border-2 border-orange-500 shadow-2xs' 
                      : 'border border-slate-200 bg-slate-50'
                  }`}>
                    {hasStreak ? (
                      <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-center text-slate-500 font-semibold pt-1">
            🔥 {dayStreak} Day Cognitive Streak Active
          </p>
        </div>

        {/* COGNITIVE PERFORMANCE INDEX (Shown in Caregiver Portal, hidden in Patient Portal) */}
        {showCognitiveIndex ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Cognitive Index
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Neuropsychological domains
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Domain Bars */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Memory</span>
                  <span className="font-extrabold text-amber-700">959</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Flexibility (Executive)</span>
                  <span className="font-extrabold text-orange-700">813</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-orange-500" style={{ width: '74%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Attention</span>
                  <span className="font-extrabold text-blue-700">768</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: '68%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Spatial</span>
                  <span className="font-extrabold text-emerald-700">692</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: '62%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Processing Speed</span>
                  <span className="font-extrabold text-purple-700">620</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-purple-500" style={{ width: '56%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Financial / Math</span>
                  <span className="font-extrabold text-slate-700">472</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: '42%' }} />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center font-medium pt-2">
              Calibrated against Washington University OASIS-2 longitudinal cohort
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-purple-50/80 to-indigo-50/80 rounded-3xl border border-purple-200/80 p-5 sm:p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-purple-900 font-extrabold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Daily Thought</span>
            </div>
            <p className="text-xs text-purple-950 font-medium leading-relaxed">
              "Regular gentle practice keeps the mind active and joyful. Enjoy each step at your own pace today."
            </p>
            <div className="pt-2 text-[11px] text-purple-700 font-semibold">
              Supervised with love by {caretakerName || 'Anita Joshi'}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
