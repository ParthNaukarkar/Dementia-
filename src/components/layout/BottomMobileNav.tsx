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
}

export const BottomMobileNav: React.FC<BottomMobileNavProps> = ({
  activeTab,
  onTabChange,
  onOpenPrescriptionModal,
  prescribedCount,
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-2xl px-2 py-1.5 flex items-center justify-around">
      
      {/* Tab 1: Today's Care Plan */}
      <button
        onClick={() => onTabChange('CARE_PLAN')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
          activeTab === 'CARE_PLAN'
            ? 'text-amber-600 font-black'
            : 'text-slate-500 font-bold hover:text-slate-800'
        }`}
      >
        <div className="relative">
          <Sparkles className={`w-5 h-5 ${activeTab === 'CARE_PLAN' ? 'text-amber-600 stroke-[2.5]' : ''}`} />
          <span className="absolute -top-1 -right-2 bg-amber-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
            {prescribedCount}
          </span>
        </div>
        <span className="text-[10px]">Today's Plan</span>
      </button>

      {/* Tab 2: All 8 Exercises */}
      <button
        onClick={() => onTabChange('ALL_GAMES')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
          activeTab === 'ALL_GAMES'
            ? 'text-amber-600 font-black'
            : 'text-slate-500 font-bold hover:text-slate-800'
        }`}
      >
        <Layers className={`w-5 h-5 ${activeTab === 'ALL_GAMES' ? 'text-amber-600 stroke-[2.5]' : ''}`} />
        <span className="text-[10px]">All 8 Games</span>
      </button>

      {/* Tab 3: Clinical Timing Engine */}
      <button
        onClick={() => onTabChange('TIME_ENGINE')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
          activeTab === 'TIME_ENGINE'
            ? 'text-amber-600 font-black'
            : 'text-slate-500 font-bold hover:text-slate-800'
        }`}
      >
        <Clock className={`w-5 h-5 ${activeTab === 'TIME_ENGINE' ? 'text-amber-600 stroke-[2.5]' : ''}`} />
        <span className="text-[10px]">Timing Engine</span>
      </button>

      {/* Action 4: Setup Care Plan */}
      <button
        onClick={onOpenPrescriptionModal}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-500 font-bold hover:text-slate-800 transition-all cursor-pointer active:scale-95"
      >
        <Sliders className="w-5 h-5 text-amber-700" />
        <span className="text-[10px]">Customize</span>
      </button>

    </nav>
  );
};
