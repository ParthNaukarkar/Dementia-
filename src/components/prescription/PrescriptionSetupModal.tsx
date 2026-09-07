import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  X, 
  Brain, 
  Sliders, 
  ShieldCheck, 
  Check,
  Type,
  Puzzle,
  Hash,
  Eye,
  BookOpen,
  Compass,
  Layers,
  Grid3X3
} from 'lucide-react';
import type { SupportedLanguage, GameId, PatientPrescription } from '../../types/prescription';
import { GAME_CATALOG, PRESET_PRESCRIPTIONS } from '../../data/gameCatalog';

const renderGameIcon = (iconType: string) => {
  switch (iconType) {
    case 'brain': return <Brain className="w-4 h-4" />;
    case 'sparkle': return <Sparkles className="w-4 h-4" />;
    case 'text': return <Type className="w-4 h-4" />;
    case 'puzzle': return <Puzzle className="w-4 h-4" />;
    case 'hash': return <Hash className="w-4 h-4" />;
    case 'eye': return <Eye className="w-4 h-4" />;
    case 'book': return <BookOpen className="w-4 h-4" />;
    case 'compass': return <Compass className="w-4 h-4" />;
    case 'layers': return <Layers className="w-4 h-4" />;
    case 'grid': return <Grid3X3 className="w-4 h-4" />;
    default: return <Brain className="w-4 h-4" />;
  }
};

export interface PrescriptionSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
  currentPrescription: PatientPrescription;
  onSave: (prescription: PatientPrescription) => void;
  isFirstTimeSetup?: boolean;
}

export const PrescriptionSetupModal: React.FC<PrescriptionSetupModalProps> = ({
  isOpen,
  onClose,
  language,
  currentPrescription,
  onSave,
  isFirstTimeSetup = false,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<PatientPrescription['presetType']>(
    currentPrescription.presetType || 'custom'
  );
  const [selectedGameIds, setSelectedGameIds] = useState<GameId[]>(
    currentPrescription.prescribedGameIds || []
  );

  if (!isOpen) return null;

  const handleSelectPreset = (presetKey: string) => {
    const preset = PRESET_PRESCRIPTIONS[presetKey];
    if (preset) {
      setSelectedPreset(presetKey as PatientPrescription['presetType']);
      setSelectedGameIds([...preset.gameIds]);
    }
  };

  const handleToggleGame = (gameId: GameId) => {
    setSelectedPreset('custom');
    if (selectedGameIds.includes(gameId)) {
      // Prevent unselecting all games - must have at least 1 game
      if (selectedGameIds.length > 1) {
        setSelectedGameIds(selectedGameIds.filter(id => id !== gameId));
      }
    } else {
      setSelectedGameIds([...selectedGameIds, gameId]);
    }
  };

  const handleSave = () => {
    const updated: PatientPrescription = {
      ...currentPrescription,
      prescribedGameIds: selectedGameIds,
      presetType: selectedPreset,
      updatedAt: new Date().toISOString(),
      dailyGoalMinutes: Math.max(5, selectedGameIds.length * 3),
    };
    onSave(updated);
    onClose();
  };

  // Translations for modal UI
  const t = {
    title: {
      as: 'ৰোগীৰ ব্যক্তিগত মগজুৰ যত্নৰ পৰিকল্পনা',
      bn: 'রোগীর ব্যক্তিগত মস্তিষ্ক যত্ন পরিকল্পনা',
      hi: 'मरीज़ की व्यक्तिगत न्यूरो-केयर योजना',
      en: 'Personalized Cognitive Care Plan',
    },
    subtitle: {
      as: 'ৰোগীৰ অৱস্থা অনুসৰি প্ৰয়োজনীয় খেলসমূহ নিৰ্বাচন কৰক। ইয়াৰ দ্বাৰা মগজুত অতিৰিক্ত বোজা নপৰে।',
      bn: 'রোগীর অবস্থা অনুযায়ী প্রয়োজনীয় খেলা নির্বাচন করুন। এতে মস্তিষ্কে অপ্রয়োজনীয় চাপ পড়বে না।',
      hi: 'मरीज़ की स्थिति के अनुसार आवश्यक खेल चुनें। यह मस्तिष्क पर अनावश्यक तनाव से बचाता है।',
      en: 'Select the targeted exercises this patient needs. Helps prevent cognitive fatigue and frustration.',
    },
    presetsHeader: {
      as: '১. দ্ৰুত ক্লিনিকেল আৰ্হি বাছক (Recommended Presets)',
      bn: '১. দ্রুত ক্লিনিক্যাল মডেল বাছুন (Recommended Presets)',
      hi: '१. अनुशंसित क्लिनिकल मॉडल चुनें (Presets)',
      en: '1. Choose a Clinical Preset or Customize Below',
    },
    gamesHeader: {
      as: '২. নিৰ্দিষ্ট খেলসমূহ বাছক (Personalize Individual Games)',
      bn: '২. নির্দিষ্ট খেলাসমূহ নির্বাচন করুন (Personalize Games)',
      hi: '२. विशिष्ट खेल चुनें (Personalize Games)',
      en: '2. Prescribe Individual Exercises (Select / Deselect)',
    },
    saveBtn: {
      as: 'পৰিকল্পনা সংৰক্ষণ কৰক আৰু আৰম্ভ কৰক',
      bn: 'পরিকল্পনা সংরক্ষণ করুন ও শুরু করুন',
      hi: 'योजना सुरक्षित करें और शुरू करें',
      en: 'Save Care Plan & Launch Therapy',
    },
    exercisesCount: {
      as: 'টা খেল নিৰ্বাচিত',
      bn: 'টি খেলা নির্বাচিত',
      hi: 'खेल चयनित',
      en: 'Exercises Prescribed',
    },
    dailyEstimate: {
      as: 'দৈনিক সময় প্ৰায়',
      bn: 'দৈনিক সময় প্রায়',
      hi: 'दैनिक समय लगभग',
      en: 'Est. Daily Routine',
    },
  };

  const totalMinutes = selectedGameIds.length * 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-amber-100 overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner shrink-0">
              <Brain className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{t.title[language]}</h2>
                {isFirstTimeSetup && (
                  <span className="text-[10px] uppercase font-extrabold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md">
                    Initial Setup
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-xl">
                {t.subtitle[language]}
              </p>
            </div>
          </div>

          {!isFirstTimeSetup && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* Section 1: Presets */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              <Sliders className="w-4 h-4 text-amber-600" />
              <span>{t.presetsHeader[language]}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(PRESET_PRESCRIPTIONS).map(([key, preset]) => {
                const isSelected = selectedPreset === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectPreset(key)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/80 shadow-md ring-2 ring-amber-200'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-800">
                        {preset.label[language]}
                      </h4>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                        isSelected ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                      {preset.description[language]}
                    </p>
                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold text-amber-800">
                      <span>{preset.gameIds.length} Exercises</span>
                      <span>~{preset.gameIds.length * 3} mins daily</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Individual Game Selection */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t.gamesHeader[language]}</span>
              </div>
              <span className="text-amber-800 font-extrabold lowercase">
                {selectedGameIds.length} / 10 active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GAME_CATALOG.map((game) => {
                const isSelected = selectedGameIds.includes(game.id);

                return (
                  <div
                    key={game.id}
                    onClick={() => handleToggleGame(game.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                      isSelected
                        ? 'border-amber-500 bg-white shadow-xs ring-1 ring-amber-200'
                        : 'border-slate-200 bg-slate-100/60 opacity-60 hover:opacity-100 hover:bg-white'
                    }`}
                  >
                    {/* Custom Checkbox */}
                    <div className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all shrink-0 ${
                      isSelected
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>

                    {/* Game Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                          {renderGameIcon(game.iconType)}
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 truncate">
                          {game.title[language]}
                        </h4>
                      </div>

                      <p className="text-[11px] text-slate-500 font-semibold mt-1">
                        {game.domainLabel[language]}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                          {game.clinicalStandard.split('•')[0].trim()}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          ~{game.estimatedMinutes}m
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer with Summary & Action Button */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{selectedGameIds.length} {t.exercisesCount[language]}</span>
            </div>
            <span className="text-slate-300">•</span>
            <span>{t.dailyEstimate[language]} <strong>{totalMinutes} mins</strong></span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {!isFirstTimeSetup && (
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-sm"
              >
                Cancel
              </button>
            )}

            <button
              onClick={handleSave}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm sm:text-base shadow-lg hover:shadow-xl transition-all cursor-pointer ring-2 ring-amber-300"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>{t.saveBtn[language]}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
