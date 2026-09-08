import React, { useState } from 'react';
import {
  Heart,
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Languages,
} from 'lucide-react';
import type { SupportedLanguage } from '../../types/prescription';
import type { PatientProfile, CaretakerUser } from '../../types/auth';
import { getTranslation } from '../../locales/translations';

interface LoginPageProps {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  patient: PatientProfile;
  caretaker: CaretakerUser;
  onSelectRole: (role: 'patient' | 'caregiver') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  language,
  onLanguageChange,
  patient,
  caretaker,
  onSelectRole,
}) => {
  const t = getTranslation(language);

  // Caregiver credential form state (optional toggle)
  const [caregiverEmail, setCaregiverEmail] = useState(caretaker.email || 'anita.joshi@smritiner.in');
  const [caregiverPassword, setCaregiverPassword] = useState('••••••••••••');
  const [showClinicianLogin, setShowClinicianLogin] = useState(false);

  const handleCaregiverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectRole('caregiver');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none">
      
      {/* ─── TOP SYSTEM NAVBAR (Matching Rest of SmritiNER UI) ───────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Platform Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-sm">
              <Brain className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base text-slate-900 leading-tight">
                  SmritiNER
                </h1>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  SIH 26003
                </span>
              </div>
              <p className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                MDoNER Cognitive Rehabilitation Platform
              </p>
            </div>
          </div>

          {/* Right Controls: Single Localhost Status & 4-Language Switcher */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Unified Localhost 5173</span>
            </div>

            {/* 4-Language Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <Languages className="w-3.5 h-3.5 text-slate-500 mx-1.5" />
              {(['en', 'as', 'bn', 'hi'] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    language === lang
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

        </div>
      </header>

      {/* ─── MAIN LOGIN CONTAINER ────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12 flex flex-col justify-center">
        
        {/* Welcome Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Dual-Portal Authentication • Single Origin</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2">
            {t.welcomeBack}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            {t.selectRole} to enter your personalized dashboard.
          </p>
        </div>

        {/* ─── DUAL ROLE SELECTION CARDS ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          
          {/* ═══ CARD 1: PATIENT LOGIN (MEERA JOSHI) ═══════════════════════ */}
          <div className="bg-white rounded-3xl border-2 border-teal-200 hover:border-teal-400 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500" />

            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 group-hover:scale-105 transition-transform">
                    <Heart className="w-5 h-5 fill-teal-500 text-teal-600" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 block">
                      Elder-Friendly Mode
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {t.patientLogin}
                    </h3>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  1-Click Access
                </span>
              </div>

              {/* Patient Profile Snapshot */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50/70 to-emerald-50/70 border border-teal-100 mb-6 flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-sm shrink-0">
                  {patient.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-base text-slate-900 truncate">
                      {patient.name}
                    </h4>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-teal-800 border border-teal-200 shadow-2xs">
                      Age {patient.age}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {patient.relationshipToCaretaker} of {caretaker.name}
                  </p>
                  <p className="text-[11px] text-teal-700 font-bold truncate mt-0.5">
                    Stage: Mild Cognitive Impairment (MCI)
                  </p>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2.5 mb-8">
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Daily 3-Round Brain Workout</strong> with calming audio cues</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>10 Northeast Cultural Games:</strong> Smriti Haat, Jigsaw, etc.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Medication & Schedule Checklist:</strong> Easy visual tracking</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Calm Elder Interface:</strong> 400ms motor tremor debouncing</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div>
              <button
                onClick={() => onSelectRole('patient')}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-base flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg cursor-pointer transform active:scale-[0.98]"
              >
                <span>{t.loginAsPatient}</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
              <p className="text-center text-[11px] text-slate-500 font-medium mt-2">
                No password required • Instant elder access
              </p>
            </div>
          </div>

          {/* ═══ CARD 2: CAREGIVER LOGIN (ANITA JOSHI) ═════════════════════ */}
          <div className="bg-white rounded-3xl border-2 border-indigo-200 hover:border-purple-400 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7c3aed] to-[#4338ca]" />

            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 group-hover:scale-105 transition-transform">
                    <Brain className="w-5 h-5 text-[#7c3aed]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 block">
                      Clinical Monitoring
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {t.caregiverLogin}
                    </h3>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                  Clinician Portal
                </span>
              </div>

              {/* Caregiver Profile Snapshot */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/70 to-indigo-50/70 border border-purple-100 mb-6 flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-[#7c3aed] flex items-center justify-center text-white font-black text-xl shadow-sm shrink-0">
                  {caretaker.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-base text-slate-900 truncate">
                      {caretaker.name}
                    </h4>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-purple-800 border border-purple-200 shadow-2xs">
                      Primary Caregiver
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {caretaker.email || 'anita.joshi@smritiner.in'}
                  </p>
                  <p className="text-[11px] text-purple-700 font-bold truncate mt-0.5">
                    Monitoring: {patient.name} (Mother, Age {patient.age})
                  </p>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2.5 mb-8">
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Cognitive Composite Index (0–100)</strong> with 7-day trend analytics</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Adaptive AI Game Flow:</strong> Dynamic palliative difficulty tuning</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Rx & Schedule Management:</strong> Real-time cross-portal updates</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Clinical PDF Dossier & Telemetry:</strong> Export standard MoCA reports</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div>
              {!showClinicianLogin ? (
                <div>
                  <button
                    onClick={() => onSelectRole('caregiver')}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] hover:from-[#6d28d9] hover:to-[#4338ca] text-white font-extrabold text-base flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg cursor-pointer transform active:scale-[0.98]"
                  >
                    <span>{t.loginAsCaregiver}</span>
                    <ArrowRight className="w-5 h-5 text-purple-200" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClinicianLogin(true)}
                    className="w-full py-2 text-center text-xs text-purple-700 hover:text-purple-900 font-bold transition-colors cursor-pointer mt-1"
                  >
                    Use custom clinician credentials →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCaregiverSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Clinician Email Address
                    </label>
                    <input
                      type="email"
                      value={caregiverEmail}
                      onChange={(e) => setCaregiverEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:border-purple-500 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Password / Clinical PIN
                    </label>
                    <input
                      type="password"
                      value={caregiverPassword}
                      onChange={(e) => setCaregiverPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:border-purple-500 focus:bg-white"
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowClinicianLogin(false)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                    >
                      Sign In to Caregiver Portal
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>

        </div>

        {/* ─── FOOTER METADATA ────────────────────────────────────────────── */}
        <div className="mt-12 text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-3">
          <span className="font-semibold text-slate-600">Smart India Hackathon 2024</span>
          <span>•</span>
          <span>Problem Statement SIH 26003</span>
          <span>•</span>
          <span className="font-semibold text-slate-600">Ministry of Development of North Eastern Region (MDoNER)</span>
          <span>•</span>
          <span className="text-emerald-700 font-bold">100% On-Device Offline Execution</span>
        </div>

      </main>

    </div>
  );
};

export default LoginPage;
