import React, { useState } from 'react';
import { 
  Sparkles, 
  Sliders, 
  ShoppingBag, 
  Layers, 
  Palette, 
  Coins, 
  Eye, 
  Users, 
  Compass, 
  Play, 
  Clock, 
  CheckCircle2, 
  Brain,
  ArrowRight,
  Activity
} from 'lucide-react';
import type { SupportedLanguage, PatientPrescription, GameId } from '../../types/prescription';
import { GAME_CATALOG, PRESET_PRESCRIPTIONS } from '../../data/gameCatalog';
import type { SessionSummaryTelemetry } from '../../games/smriti-haat';

interface GameHubProps {
  language: SupportedLanguage;
  prescription: PatientPrescription;
  onOpenPrescriptionModal: () => void;
  onSelectGame: (gameId: GameId) => void;
  lastSessionReport: SessionSummaryTelemetry | null;
  activeView?: 'CARE_PLAN' | 'ALL_GAMES';
}

const ICONS: Record<string, React.FC<{ className?: string }>> = {
  ShoppingBag,
  Layers,
  Palette,
  Sparkles,
  Coins,
  Eye,
  Users,
  Compass,
};

export const GameHub: React.FC<GameHubProps> = ({
  language,
  prescription,
  onOpenPrescriptionModal,
  onSelectGame,
  lastSessionReport,
  activeView = 'CARE_PLAN',
}) => {
  const [filterMode, setFilterMode] = useState<'CARE_PLAN' | 'ALL_GAMES'>(activeView);

  // Sync internal filter mode if prop changes (e.g. from bottom mobile nav)
  React.useEffect(() => {
    setFilterMode(activeView);
  }, [activeView]);

  const prescribedSet = new Set(prescription.prescribedGameIds);
  const displayedGames = filterMode === 'CARE_PLAN'
    ? GAME_CATALOG.filter(g => prescribedSet.has(g.id))
    : GAME_CATALOG;

  const currentPresetInfo = PRESET_PRESCRIPTIONS[prescription.presetType] || null;

  // Localized UI strings
  const t = {
    greeting: {
      as: 'নমস্কাৰ! আপোনাৰ দৈনিক মগজুৰ যত্ন আৰু ব্যায়াম',
      bn: 'নমস্কার! আপনার দৈনিক মস্তিষ্ক যত্ন ও ব্যায়াম',
      hi: 'नमस्ते! आपका दैनिक न्यूरो-केयर और मानसिक अभ्यास',
      en: 'Welcome! Daily Cognitive Care & Therapy Routine',
    },
    planLabel: {
      as: 'ৰোগীৰ বাবে নিৰ্ধাৰিত খেলসমূহ (Prescribed Therapy)',
      bn: 'রোগীর জন্য নির্ধারিত খেলাসমূহ (Prescribed Therapy)',
      hi: 'मरीज़ के लिए निर्धारित अभ्यास (Prescribed Therapy)',
      en: 'Prescribed Daily Therapy',
    },
    allLabel: {
      as: 'সকলো ৮ টা ক্লিনিকেল ব্যায়াম (All 8 Games)',
      bn: 'সমস্ত ৮টি ক্লিনিক্যাল ব্যায়াম (All 8 Games)',
      hi: 'सभी ८ न्यूरो-अभ्यास (All 8 Games)',
      en: 'All 8 Clinical Exercises',
    },
    changePlanBtn: {
      as: 'পৰিকল্পনা সলনি কৰক',
      bn: 'পরিকল্পনা পরিবর্তন করুন',
      hi: 'केयर प्लान बदलें',
      en: 'Customize Care Plan',
    },
    startExercise: {
      as: 'ব্যায়াম আৰম্ভ কৰক',
      bn: 'ব্যায়াম শুরু করুন',
      hi: 'अभ्यास शुरू करें',
      en: 'Start Exercise',
    },
    prescribedBadge: {
      as: 'দৈনিক নিৰ্ধাৰিত',
      bn: 'দৈনিক নির্ধারিত',
      hi: 'दैनिक निर्धारित',
      en: 'Prescribed',
    },
    optionalBadge: {
      as: 'ঐচ্ছিক পৰীক্ষা',
      bn: 'ঐচ্ছিক পরীক্ষা',
      hi: 'वैकल्पिक अभ्यास',
      en: 'Available in Suite',
    },
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8 animate-fadeIn">
      
      {/* Hero: Personalized Care Plan Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white p-5 sm:p-7 shadow-xl border border-amber-500/30">
        
        {/* Background Subtle Motif */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/25 backdrop-blur-xs flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                <span>Active Care Protocol</span>
              </span>
              {currentPresetInfo && (
                <span className="text-[11px] font-bold text-amber-200 truncate hidden sm:inline">
                  • {currentPresetInfo.label[language]}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug">
              {t.greeting[language]}
            </h1>
            
            <p className="text-xs sm:text-sm text-amber-100/90 mt-2 font-medium leading-relaxed">
              {currentPresetInfo 
                ? currentPresetInfo.description[language]
                : 'Customized clinical suite tailored to patient cognitive profile.'}
            </p>

            {/* Quick Metrics Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-bold text-amber-100">
              <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-xl border border-white/10">
                <Activity className="w-4 h-4 text-amber-300" />
                <span><strong>{prescription.prescribedGameIds.length}</strong> Exercises Active</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-xl border border-white/10">
                <Clock className="w-4 h-4 text-amber-300" />
                <span>~<strong>{prescription.dailyGoalMinutes}</strong> mins Daily Therapy</span>
              </div>
              {lastSessionReport && (
                <div className="flex items-center gap-1.5 bg-emerald-900/40 text-emerald-200 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Last MoCA Memory: <strong>{lastSessionReport.estimatedMoCAMemoryScore}/5</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Change Care Plan Button */}
          <div className="shrink-0 w-full md:w-auto">
            <button
              onClick={onOpenPrescriptionModal}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-amber-50 text-amber-950 font-black text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer ring-2 ring-amber-300 active:scale-97"
            >
              <Sliders className="w-4 h-4 text-amber-700" />
              <span>{t.changePlanBtn[language]}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Desktop Filter Switcher (Prescribed vs All 8) */}
      <div className="hidden sm:flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('CARE_PLAN')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all cursor-pointer ${
              filterMode === 'CARE_PLAN'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.planLabel[language]}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
              filterMode === 'CARE_PLAN' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {prescription.prescribedGameIds.length}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('ALL_GAMES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all cursor-pointer ${
              filterMode === 'ALL_GAMES'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t.allLabel[language]}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
              filterMode === 'ALL_GAMES' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              8
            </span>
          </button>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          Dementia-calibrated digital therapeutics • 100% offline
        </p>
      </div>

      {/* Game Cards Grid (Optimized for Large Touch Targets & Geriatric Accessibility) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {displayedGames.map((game) => {
          const isPrescribed = prescribedSet.has(game.id);
          const IconComp = ICONS[game.iconType] || Brain;

          return (
            <div
              key={game.id}
              className={`rounded-3xl border-2 transition-all flex flex-col justify-between overflow-hidden bg-white shadow-xs hover:shadow-md ${
                isPrescribed
                  ? 'border-amber-200/90 ring-1 ring-amber-100'
                  : 'border-slate-200/80 bg-slate-50/40 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Card Header & Content */}
              <div className="p-5 sm:p-6">
                
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      isPrescribed
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {isPrescribed ? t.prescribedBadge[language] : t.optionalBadge[language]}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      ~{game.estimatedMinutes} mins
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {game.domainLabel[language]}
                  </span>
                </div>

                {/* Title & Cultural Theme */}
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md shrink-0">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                      {game.title[language]}
                    </h3>
                    <p className="text-xs text-amber-800 font-extrabold mt-0.5">
                      {game.subtitle[language]}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-3 leading-relaxed">
                  {game.description[language]}
                </p>

                {/* Clinical Science Box */}
                <div className="mt-4 p-3 rounded-2xl bg-amber-50/60 border border-amber-100 text-[11px] space-y-1">
                  <div className="text-slate-700">
                    <strong className="text-amber-950 font-bold">Standard:</strong> {game.clinicalStandard}
                  </div>
                  <div className="text-slate-600 font-medium">
                    <strong className="text-amber-950 font-bold">Target Brain:</strong> {game.targetBrainArea}
                  </div>
                </div>

              </div>

              {/* Action Button (Large Touch Target >= 52px for Tremor/Motor Safety) */}
              <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-[11px] font-bold text-slate-500 hidden sm:block">
                  Parametric DDA Active
                </div>

                <button
                  onClick={() => onSelectGame(game.id)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm sm:text-base shadow-md hover:shadow-lg transition-all cursor-pointer ring-2 ring-amber-300 active:scale-97"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{t.startExercise[language]}</span>
                  <ArrowRight className="w-4 h-4 ml-1 hidden sm:inline" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
