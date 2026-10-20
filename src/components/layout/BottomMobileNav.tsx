import React from 'react';
import { 
  Sparkles, 
  Layers, 
  Clock, 
  Sliders 
} from 'lucide-react';

export type MainNavTab = 'CARE_PLAN' | 'ALL_GAMES' | 'TIME_ENGINE';

interface BottomMobileNavProps {
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  onOpenPrescriptionModal: () => void;
  prescribedCount: number;
  language?: 'en' | 'hi';
}

export const BottomMobileNav: React.FC<BottomMobileNavProps> = ({
  activeTab,
  onTabChange,
  onOpenPrescriptionModal,
  prescribedCount,
  language = 'hi',
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#E5DFD5] shadow-lg px-2 py-2 flex items-center justify-around">
      
      {/* Tab 1: Today's Care Plan */}
      <button
        onClick={() => onTabChange('CARE_PLAN')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer font-['Sora'] ${
          activeTab === 'CARE_PLAN'
            ? 'text-[#C05634] font-bold'
            : 'text-[#636B65] font-semibold hover:text-[#1F2421]'
        }`}
      >
        <div className="relative">
          <Sparkles className={`w-5 h-5 ${activeTab === 'CARE_PLAN' ? 'text-[#C05634] stroke-[2.5]' : ''}`} />
          <span className="absolute -top-1 -right-2 bg-[#C05634] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {prescribedCount}
          </span>
        </div>
        <span className="text-[11px]">
          {language === 'hi' ? 'आज की योजना' : "Today's Plan"}
        </span>
      </button>

      {/* Tab 2: All 10 Exercises */}
      <button
        onClick={() => onTabChange('ALL_GAMES')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer font-['Sora'] ${
          activeTab === 'ALL_GAMES'
            ? 'text-[#C05634] font-bold'
            : 'text-[#636B65] font-semibold hover:text-[#1F2421]'
        }`}
      >
        <Layers className={`w-5 h-5 ${activeTab === 'ALL_GAMES' ? 'text-[#C05634] stroke-[2.5]' : ''}`} />
        <span className="text-[11px]">
          {language === 'hi' ? 'सभी 10 अभ्यास' : 'All 10 Games'}
        </span>
      </button>

      {/* Tab 3: Clinical Timing Engine */}
      <button
        onClick={() => onTabChange('TIME_ENGINE')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer font-['Sora'] ${
          activeTab === 'TIME_ENGINE'
            ? 'text-[#C05634] font-bold'
            : 'text-[#636B65] font-semibold hover:text-[#1F2421]'
        }`}
      >
        <Clock className={`w-5 h-5 ${activeTab === 'TIME_ENGINE' ? 'text-[#C05634] stroke-[2.5]' : ''}`} />
        <span className="text-[11px]">
          {language === 'hi' ? 'समय इंजन' : 'Timing Engine'}
        </span>
      </button>

      {/* Action 4: Setup Care Plan */}
      <button
        onClick={onOpenPrescriptionModal}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[#636B65] font-semibold hover:text-[#1F2421] transition-all cursor-pointer active:scale-95 font-['Sora']"
      >
        <Sliders className="w-5 h-5 text-[#C05634]" />
        <span className="text-[11px]">
          {language === 'hi' ? 'अनुकूलन' : 'Customize'}
        </span>
      </button>

    </nav>
  );
};
