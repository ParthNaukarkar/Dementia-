import React from 'react';
import { 
  Flame, 
  Zap, 
  WifiOff, 
  Menu, 
  Shield, 
  User, 
  Sliders
} from 'lucide-react';
import type { SupportedLanguage } from '../../types/prescription';
import type { UserRole, CaretakerUser, PatientProfile } from '../../types/auth';

interface LumosityHeaderProps {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  currentRole: UserRole;
  onToggleRole: () => void;
  caretaker: CaretakerUser | null;
  activePatient: PatientProfile | null;
  streakCount?: number;
  cognitiveScore?: number;
  onOpenMobileMenu: () => void;
  onOpenPrescriptionModal: () => void;
}

export const LumosityHeader: React.FC<LumosityHeaderProps> = ({
  language,
  onLanguageChange,
  currentRole,
  onToggleRole,
  caretaker,
  activePatient,
  streakCount = 1,
  cognitiveScore = 959,
  onOpenMobileMenu,
  onOpenPrescriptionModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs">
      
      {/* Left (Mobile only hamburger + Title) */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          onClick={onOpenMobileMenu}
          className="w-9 h-9 rounded-xl border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-black text-lg tracking-tight text-slate-900">
          Smriti<span className="text-amber-600">NER</span>
        </span>
      </div>

      {/* Center/Left Desktop status message */}
      <div className="hidden lg:flex items-center gap-2">
        <span className="text-xs font-black text-slate-700">
          {currentRole === 'caretaker' ? '🩺 Caregiver Management Console' : '🧠 Dementia Cognitive Routine'}
        </span>
        <span className="text-slate-300">•</span>
        <span className="text-xs text-slate-500 font-medium">
          Patient: <strong>{activePatient?.name || 'Grandfather'}</strong> ({activePatient?.age || 76}y)
        </span>
      </div>

      {/* Right side widgets (matching Image 1 exactly: Flame Streak, Score, User Pill) */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* 100% Offline PWA Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
          <WifiOff className="w-3.5 h-3.5 text-emerald-600" />
          <span>Offline PWA</span>
        </div>

        {/* Streak Flame (Image 1) */}
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full text-xs font-black text-amber-900 shadow-2xs" title="Daily Workout Streak">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
          <span>{streakCount}</span>
        </div>

        {/* Cognitive Index Score / Bolt (Image 1) */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-black text-slate-700 shadow-2xs" title="Cognitive Performance Index">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{cognitiveScore}</span>
        </div>

        {/* Care Plan Prescribe Button (Caregiver Only) */}
        {currentRole === 'caretaker' && (
          <button
            onClick={onOpenPrescriptionModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-extrabold transition-colors cursor-pointer border border-amber-300"
            title="Caregiver Game Prescription"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-700" />
            <span>Care Plan</span>
          </button>
        )}

        {/* Multilingual Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-black border border-slate-200">
          <button
            onClick={() => onLanguageChange('as')}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              language === 'as' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            অসমীয়া
          </button>
          <button
            onClick={() => onLanguageChange('bn')}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              language === 'bn' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            বাংলা
          </button>
          <button
            onClick={() => onLanguageChange('hi')}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              language === 'hi' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              language === 'en' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            EN
          </button>
        </div>

        {/* User Pill / Role Switcher (Image 1 right corner) */}
        <button
          onClick={onToggleRole}
          className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-black text-slate-800 transition-all cursor-pointer shadow-2xs"
          title="Click to toggle between Caregiver and Patient view"
        >
          <span className="truncate max-w-[80px] sm:max-w-[110px]">
            {currentRole === 'caretaker' ? (caretaker?.name || 'Parth') : (activePatient?.name?.split(' ')[0] || 'Dadu')}
          </span>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${
            currentRole === 'caretaker' ? 'bg-purple-600' : 'bg-emerald-600'
          }`}>
            {currentRole === 'caretaker' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
          </div>
        </button>

      </div>

    </header>
  );
};
