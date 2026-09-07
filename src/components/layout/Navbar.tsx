import React from 'react';
import { 
  HeartHandshake, 
  WifiOff, 
  Sliders, 
  User
} from 'lucide-react';
import type { SupportedLanguage, PatientPrescription } from '../../types/prescription';

interface NavbarProps {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  prescription: PatientPrescription;
  onOpenPrescriptionModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  prescription,
  onOpenPrescriptionModal,
}) => {
  const activeCount = prescription.prescribedGameIds.length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md ring-2 ring-amber-200/60 shrink-0">
            <HeartHandshake className="w-6 h-6 sm:w-6.5 sm:h-6.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl text-slate-900 tracking-tight">
                Smriti<span className="text-amber-600">NER</span>
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-widest bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                SIH26003
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden md:block leading-tight">
              AI Cognitive Care & Rehabilitation • MDoNER North East
            </p>
          </div>
        </div>

        {/* Right Controls: Prescription Badge, Language Picker, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* 100% Offline PWA Badge (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
            <WifiOff className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Offline PWA</span>
          </div>

          {/* Care Plan Prescription Quick Button (Desktop & Mobile) */}
          <button
            onClick={onOpenPrescriptionModal}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-97"
            title="Customize Patient Care Plan"
          >
            <Sliders className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">Care Plan:</span>
            <span className="bg-amber-600 text-white text-[11px] px-1.5 py-0.5 rounded-md font-black">
              {activeCount} / 8
            </span>
          </button>

          {/* Accessible Language Selector */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black border border-slate-200">
            <button
              onClick={() => onLanguageChange('as')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl transition-all cursor-pointer font-black ${
                language === 'as' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white/60'
              }`}
              title="Assamese"
            >
              অসমীয়া
            </button>
            <button
              onClick={() => onLanguageChange('bn')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl transition-all cursor-pointer font-black ${
                language === 'bn' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white/60'
              }`}
              title="Bengali"
            >
              বাংলা
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl transition-all cursor-pointer font-black ${
                language === 'hi' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white/60'
              }`}
              title="Hindi"
            >
              हिन्दी
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl transition-all cursor-pointer font-black ${
                language === 'en' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white/60'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Profile / Patient Badge */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

        </div>

      </div>
    </header>
  );
};
