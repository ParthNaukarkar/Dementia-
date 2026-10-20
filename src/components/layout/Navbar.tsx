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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 shadow-sm shrink-0">
            <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl text-slate-900 tracking-tight">
                Neuro<span className="text-teal-600">Saathi</span>
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-widest bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                {language === 'hi' ? 'राष्ट्रीय संस्करण' : 'National Edition'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden md:block leading-tight">
              {language === 'hi' ? 'एआई संज्ञानात्मक देखभाल एवं पुनर्वास • राष्ट्रीय क्लिनिकल मंच' : 'AI Cognitive Care & Rehabilitation • National Clinical Platform'}
            </p>
          </div>
        </div>

        {/* Right Controls: Prescription Badge, Language Picker, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* 100% Offline PWA Badge (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
            <WifiOff className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'hi' ? '100% ऑफ़लाइन PWA' : '100% Offline PWA'}</span>
          </div>

          {/* Care Plan Prescription Quick Button (Desktop & Mobile) */}
          <button
            onClick={onOpenPrescriptionModal}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-2xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-97"
            title={language === 'hi' ? 'रोगी देखभाल योजना अनुकूलित करें' : 'Customize Patient Care Plan'}
          >
            <Sliders className="w-4 h-4 text-teal-700" />
            <span className="hidden sm:inline">{language === 'hi' ? 'देखभाल योजना:' : 'Care Plan:'}</span>
            <span className="bg-teal-700 text-white text-[11px] px-1.5 py-0.5 rounded-md font-black">
              {activeCount} / 10
            </span>
          </button>

          {/* Accessible Language Selector */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black border border-slate-200">
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl transition-all cursor-pointer font-black ${
                language === 'hi' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-700 hover:bg-white/60'
              }`}
              title="Hindi"
            >
              हिन्दी
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl transition-all cursor-pointer font-black ${
                language === 'en' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-700 hover:bg-white/60'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Profile / Patient Badge */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

        </div>

      </div>
    </header>
  );
};

