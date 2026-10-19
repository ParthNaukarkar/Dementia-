import React, { useState } from 'react';
import { 
  Clock, 
  Play,
  ArrowRight
} from 'lucide-react';
import type { SupportedLanguage, GameId, LumosityDomain } from '../../types/prescription';
import { GAME_CATALOG } from '../../data/gameCatalog';
import { GameThumbnail } from './GameCardThumbnails';

interface CognitiveLibraryProps {
  language: SupportedLanguage;
  onLaunchGame: (gameId: GameId) => void;
}

const LOCALIZED_TEXTS = {
  hi: {
    heading: 'संज्ञानात्मक पुस्तकालय (Cognitive Library)',
    subheading: 'आपके मस्तिष्क के लिए तैयार 10 वैज्ञानिक रूप से प्रमाणित अभ्यास।',
    playNow: 'शुरू करें (Play)',
    minutes: 'मिनट',
    filters: {
      all: 'सभी अभ्यास (All)',
      memory: 'स्मृति (Memory)',
      attention: 'एकाग्रता (Attention)',
      speed: 'गति (Speed)',
      spatial: 'स्थानिक (Spatial)',
      language: 'भाषा (Language)',
      executive: 'निर्णय (Executive)'
    }
  },
  en: {
    heading: 'Cognitive Library',
    subheading: '10 clinically validated neuroplastic exercises calibrated for memory and daily thinking.',
    playNow: 'Play Game',
    minutes: 'mins',
    filters: {
      all: 'All Games',
      memory: 'Memory',
      attention: 'Attention',
      speed: 'Speed',
      spatial: 'Spatial',
      language: 'Language',
      executive: 'Executive'
    }
  },
  as: {
    heading: 'জ্ঞানমূলক পুথিভঁৰাল',
    subheading: 'আপোনাৰ মগজুৰ কাৰ্যক্ষমতা অনুসৰি প্ৰস্তুত কৰা দৈনিক অনুশীলন।',
    playNow: 'খেল আৰম্ভ কৰক',
    minutes: 'মিনিট',
    filters: {
      all: 'সকলো',
      memory: 'স্মৃতি',
      attention: 'মনোযোগ',
      speed: 'গতি',
      spatial: 'স্থানিক',
      language: 'ভাষা',
      executive: 'কাৰ্যকৰী'
    }
  },
  bn: {
    heading: 'জ্ঞানমূলক সংগ্রহশালা',
    subheading: 'আপনার মস্তিষ্কের কার্যক্ষমতা অনুযায়ী প্রস্তুত করা দৈনিক অনুশীলন।',
    playNow: 'শুরু করুন',
    minutes: 'মিনিট',
    filters: {
      all: 'সব',
      memory: 'স্মৃতি',
      attention: 'মনোযোগ',
      speed: 'গতি',
      spatial: 'স্থানিক',
      language: 'ভাষা',
      executive: 'কার্যকরী'
    }
  }
};

const DOMAIN_COLOR_BADGES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  memory: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', label: '🧠 Memory' },
  attention: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', label: '⚡ Attention' },
  speed: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', label: '⏱️ Speed' },
  spatial: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', label: '🧩 Spatial' },
  language: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', label: '🗣️ Language' },
  executive: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', label: '🎯 Executive' },
};

export const CognitiveLibrary: React.FC<CognitiveLibraryProps> = ({
  language,
  onLaunchGame,
}) => {
  const [activeFilter, setActiveFilter] = useState<LumosityDomain>('all');
  const t = LOCALIZED_TEXTS[language] || LOCALIZED_TEXTS.en;

  const filterTabs: { id: LumosityDomain; label: string }[] = [
    { id: 'all', label: t.filters.all },
    { id: 'memory', label: t.filters.memory },
    { id: 'attention', label: t.filters.attention },
    { id: 'spatial', label: t.filters.spatial },
    { id: 'language', label: t.filters.language },
    { id: 'executive', label: t.filters.executive },
  ];

  const filteredGames = activeFilter === 'all'
    ? GAME_CATALOG
    : GAME_CATALOG.filter(g => g.domain === activeFilter);

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      
      {/* Top Header & Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t.heading}
            </h2>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              10 Games
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {t.subheading}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-black">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-amber-600 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 10-Game Grid with Rich Game Images (Replacing plain black cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGames.map((game) => {
          const domainBadge = DOMAIN_COLOR_BADGES[game.domain] || DOMAIN_COLOR_BADGES.memory;

          return (
            <div
              key={game.id}
              onClick={() => onLaunchGame(game.id)}
              className="group relative bg-white hover:bg-slate-50/50 rounded-3xl border-2 border-slate-200/90 hover:border-amber-500 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              {/* Top Visual Image Section */}
              <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-950 flex items-center justify-center">
                <GameThumbnail
                  gameId={game.id}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Gradient vignette for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                {/* Domain Pill Badge Overlaid on Top-Left */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-black border border-white/20 shadow-md">
                  <span>{domainBadge.label}</span>
                </div>

                {/* Duration Badge Overlaid on Top-Right */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-white/10 shadow-md">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>~{game.estimatedMinutes} {t.minutes}</span>
                </div>

                {/* Floating Center Play Button on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/20 backdrop-blur-2xs">
                  <div className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-6 h-6 fill-slate-950 ml-1" />
                  </div>
                </div>
              </div>

              {/* Bottom Card Labels & Action Bar */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h4 className="font-black text-base sm:text-lg text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                    {game.title[language]}
                  </h4>
                  <p className="text-xs font-semibold text-slate-500 line-clamp-1">
                    {game.subtitle[language]}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 line-clamp-2 pt-1">
                    {game.description[language]}
                  </p>
                </div>

                {/* Clinical Standard & Action Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 truncate max-w-[140px]" title={game.clinicalStandard}>
                    {game.clinicalStandard.split('•')[0]}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 group-hover:text-amber-700 transition-colors">
                    <span>{t.playNow}</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
