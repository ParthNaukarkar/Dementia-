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
    subheading: '10 cognitive monitoring exercises calibrated for memory and daily thinking.',
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
      
      {/* Top Header & Filter Bar (Keen Design System) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b border-[#E5DFD5] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-['Sora'] text-2xl sm:text-3xl font-extrabold text-[#1F2421] tracking-tight">
              {t.heading}
            </h2>
            <span className="text-xs font-['Sora'] font-bold px-3 py-1 rounded-full bg-[#FDF1EB] text-[#C05634] border border-[#F5D3C4]">
              {language === 'hi' ? '१० प्रमाणित खेल' : '10 Validated Games'}
            </span>
          </div>
          <p className="text-sm sm:text-base text-[#636B65] font-medium mt-1">
            {t.subheading}
          </p>
        </div>

        {/* Filter Pills (Senior Accessible 44px Tap Targets) */}
        <div className="flex items-center gap-2 flex-wrap bg-[#F4F0EA] p-1.5 rounded-2xl border border-[#E5DFD5] text-xs font-bold">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2.5 rounded-xl transition-all duration-150 cursor-pointer font-['Sora'] ${
                activeFilter === tab.id
                  ? 'bg-[#C05634] text-white shadow-xs font-bold'
                  : 'text-[#636B65] hover:text-[#1F2421] hover:bg-white/90'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 10-Game Grid with Keen Surface GameCards: Strictly 2 Games Per Row for Elderly Readability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-8">
        {filteredGames.map((game) => {
          const domainLabel = language === 'hi'
            ? game.domain === 'memory' ? '🧠 स्मृति (Memory)'
            : game.domain === 'attention' ? '⚡ एकाग्रता (Attention)'
            : game.domain === 'speed' ? '⏱️ गति (Speed)'
            : game.domain === 'spatial' ? '🧩 स्थानिक (Spatial)'
            : game.domain === 'language' ? '🗣️ भाषा (Language)'
            : '🎯 निर्णय (Executive)'
            : game.domain === 'memory' ? 'Memory'
            : game.domain === 'attention' ? 'Attention'
            : game.domain === 'speed' ? 'Speed'
            : game.domain === 'spatial' ? 'Spatial'
            : game.domain === 'language' ? 'Language'
            : 'Executive';

          // Keen Category Badge Color Token
          const categoryBadgeColorMap: Record<string, string> = {
            memory: 'bg-[#7A4E6C]/90 text-white border-[#E6D2E1]/40',
            attention: 'bg-[#356784]/90 text-white border-[#CFE0EB]/40',
            speed: 'bg-[#C05634]/90 text-white border-[#F5D3C4]/40',
            language: 'bg-[#28573E]/90 text-white border-[#CCE2D4]/40',
            spatial: 'bg-[#356784]/90 text-white border-[#CFE0EB]/40',
            executive: 'bg-[#A86F15]/90 text-white border-[#F2E1C2]/40',
          };
          const categoryBadgeColor = categoryBadgeColorMap[game.domain] || 'bg-[#1F2421]/80 text-white border-white/20';

          return (
            <div
              key={game.id}
              onClick={() => onLaunchGame(game.id)}
              className="group relative bg-white hover:bg-[#FAF8F5] rounded-3xl border-2 border-[#E5DFD5] hover:border-[#C05634] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              {/* Top Visual Image Section */}
              <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-[#1F2421] flex items-center justify-center">
                <GameThumbnail
                  gameId={game.id}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />

                {/* Soft gradient vignette for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25 pointer-events-none" />

                {/* Domain Pill Badge Overlaid on Top-Left */}
                <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full backdrop-blur-md text-xs sm:text-sm font-bold border shadow-sm ${categoryBadgeColor}`}>
                  <span>{domainLabel}</span>
                </div>

                {/* Duration Badge Overlaid on Top-Right */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/15 shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-[#F5D3C4]" />
                  <span>~{game.estimatedMinutes} {t.minutes}</span>
                </div>

                {/* Center Hover Play Button: Terracotta */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-2xs">
                  <div className="w-16 h-16 rounded-full bg-[#C05634] hover:bg-[#A64727] text-white flex items-center justify-center shadow-lg transform scale-95 group-hover:scale-100 transition-transform">
                    <Play className="w-8 h-8 fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Bottom Card Labels & Action Bar: Spacious, Clear, Highly Readable */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[#8C5E39] uppercase tracking-wider font-['Sora']">
                      {game.subtitle[language]}
                    </span>
                    <span className="text-xs font-semibold text-[#636B65] bg-[#F4F0EA] px-2.5 py-1 rounded-full border border-[#E5DFD5]">
                      {game.clinicalStandard.split('•')[0]}
                    </span>
                  </div>

                  <h4 className="font-['Sora'] font-bold text-xl sm:text-2xl text-[#1F2421] group-hover:text-[#C05634] transition-colors leading-snug">
                    {game.title[language]}
                  </h4>

                  <p className="text-sm sm:text-base font-normal text-[#474F49] leading-relaxed pt-1">
                    {game.description[language]}
                  </p>
                </div>

                {/* Clinical Evidence & Action CTA */}
                <div className="pt-4 border-t border-[#E5DFD5] flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-[#636B65] max-w-[200px] truncate" title={game.clinicalStandard}>
                    {game.clinicalStandard}
                  </span>

                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#C05634] group-hover:bg-[#A64727] text-white font-['Sora'] font-bold text-sm sm:text-base shadow-xs transition-colors">
                    <span>{t.playNow}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
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
