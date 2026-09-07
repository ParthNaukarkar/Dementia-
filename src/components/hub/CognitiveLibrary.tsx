import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  Type, 
  Puzzle, 
  Hash, 
  Eye, 
  BookOpen, 
  Compass, 
  Layers, 
  Grid3X3,
  Play
} from 'lucide-react';
import type { SupportedLanguage, GameId, LumosityDomain } from '../../types/prescription';
import { GAME_CATALOG } from '../../data/gameCatalog';

interface CognitiveLibraryProps {
  language: SupportedLanguage;
  onLaunchGame: (gameId: GameId) => void;
}

const LOCALIZED_TEXTS = {
  as: {
    heading: 'জ্ঞানমূলক পুথিভঁৰাল',
    subheading: 'আপোনাৰ মগজুৰ কাৰ্যক্ষমতা অনুসৰি প্ৰস্তুত কৰা দৈনিক অনুশীলন।',
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
    filters: {
      all: 'সব',
      memory: 'স্মৃতি',
      attention: 'মনোযোগ',
      speed: 'গতি',
      spatial: 'স্থানিক',
      language: 'ভাষা',
      executive: 'কার্যকরী'
    }
  },
  hi: {
    heading: 'संज्ञानात्मक पुस्तकालय',
    subheading: 'आपके मस्तिष्क की न्यूरोप्लास्टिक क्षमता के अनुसार तैयार दैनिक अभ्यास।',
    filters: {
      all: 'सभी',
      memory: 'स्मृति',
      attention: 'एकाग्रता',
      speed: 'गति',
      spatial: 'स्थानिक',
      language: 'भाषा',
      executive: 'निर्णय'
    }
  },
  en: {
    heading: 'Cognitive Library',
    subheading: 'Daily exercises calibrated to your neuroplastic baseline.',
    filters: {
      all: 'All',
      memory: 'Memory',
      attention: 'Attention',
      speed: 'Speed',
      spatial: 'Spatial',
      language: 'Language',
      executive: 'Executive'
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
    { id: 'speed', label: t.filters.speed },
    { id: 'spatial', label: t.filters.spatial },
    { id: 'language', label: t.filters.language },
    { id: 'executive', label: t.filters.executive },
  ];

  const filteredGames = activeFilter === 'all'
    ? GAME_CATALOG
    : GAME_CATALOG.filter(g => g.domain === activeFilter);

  // Icon mapping matching user's image glyphs
  const renderGlyph = (iconType: string) => {
    switch (iconType) {
      case 'brain': return <Brain className="w-8 h-8 stroke-[1.5]" />;
      case 'sparkle': return <Sparkles className="w-8 h-8 stroke-[1.5]" />;
      case 'text': return <Type className="w-8 h-8 stroke-[1.5]" />;
      case 'puzzle': return <Puzzle className="w-8 h-8 stroke-[1.5]" />;
      case 'hash': return <Hash className="w-8 h-8 stroke-[1.5]" />;
      case 'eye': return <Eye className="w-8 h-8 stroke-[1.5]" />;
      case 'book': return <BookOpen className="w-8 h-8 stroke-[1.5]" />;
      case 'compass': return <Compass className="w-8 h-8 stroke-[1.5]" />;
      case 'layers': return <Layers className="w-8 h-8 stroke-[1.5]" />;
      case 'grid': return <Grid3X3 className="w-8 h-8 stroke-[1.5]" />;
      default: return <Brain className="w-8 h-8 stroke-[1.5]" />;
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      
      {/* Top Header & Filter Bar (Matching User's Uploaded Image) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.heading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {t.subheading}
          </p>
        </div>

        {/* Filter Pills (Matching User's Image Top Right) */}
        <div className="flex items-center gap-1.5 flex-wrap bg-slate-100 p-1.5 rounded-full border border-slate-200 text-xs font-black">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 10-Game Grid (Direct Recreation of User's Image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            onClick={() => onLaunchGame(game.id)}
            className="group relative bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-3xl p-6 border border-slate-800 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between min-h-[220px]"
          >
            {/* Top Center Icon (Matching User's Card Glyphs) */}
            <div className="flex-1 flex items-center justify-center py-4">
              <div className="text-slate-300 group-hover:text-cyan-400 group-hover:scale-110 transition-all duration-200">
                {renderGlyph(game.iconType)}
              </div>
            </div>

            {/* Bottom Card Labels */}
            <div className="pt-4 border-t border-slate-800/80 text-center space-y-1">
              <h4 className="font-extrabold text-base text-white group-hover:text-cyan-300 transition-colors">
                {game.title[language]}
              </h4>
              <p className="text-[11px] font-semibold text-slate-400 tracking-wider">
                {game.subtitle[language]}
              </p>
            </div>

            {/* Hover Play Pill */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-md">
                <Play className="w-3.5 h-3.5 fill-slate-950 ml-0.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
