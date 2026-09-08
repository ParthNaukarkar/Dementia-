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

  // Caregiver credential form state (optional demo form)
  const [caregiverEmail, setCaregiverEmail] = useState(caretaker.email || 'anita.joshi@smritiner.in');
  const [caregiverPassword, setCaregiverPassword] = useState('••••••••••••');
  const [showClinicianLogin, setShowClinicianLogin] = useState(false);

  const handleCaregiverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectRole('caregiver');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col font-sans select-none">
      
      {/* ─── TOP SYSTEM HEADER & LANGUAGE SWITCHER ────────────────────────── */}
      <header className="px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-teal-400 p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-teal-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white">
                SmritiNER
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                SIH 26003
              </span>
            </div>
            <p className="text-xs text-slate-400">
              MDoNER Clinical Cognitive Rehabilitation Platform
            </p>
          </div>
        </div>

        {/* Language selector & Single-Port Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Single Localhost Active • Port 5173</span>
          </div>

          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            <Languages className="w-3.5 h-3.5 text-slate-400 mx-2" />
            {(['en', 'as', 'bn', 'hi'] as SupportedLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  language === lang
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ─── HERO GREETING SECTION ────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-teal-300 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Dual-Portal Unified Authentication</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            {t.welcomeBack}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {t.selectRole}. Both portals now operate concurrently on a single origin with zero-latency synchronization.
          </p>
        </div>

        {/* ─── DUAL ROLE CARDS ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          
          {/* ═══ CARD 1: PATIENT LOGIN (MEERA JOSHI) ════════════════════════ */}
          <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-300 shadow-2xl shadow-teal-950/30 p-6 sm:p-8 flex flex-col justify-between group">
            
            {/* Top Badge */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 group-hover:scale-105 transition-transform">
                    <Heart className="w-6 h-6 fill-teal-400/30 text-teal-300" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-teal-400 block">
                      Elder-Friendly Mode
                    </span>
                    <h3 className="text-xl font-black text-white">
                      {t.patientLogin}
                    </h3>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-teal-950 border border-teal-800 text-teal-200 font-semibold">
                  1-Click Access
                </span>
              </div>

              {/* Patient Profile Snapshot */}
              <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/20 mb-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shrink-0">
                  {patient.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-white truncate">
                      {patient.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">
                      Age {patient.age}
                    </span>
                  </div>
                  <p className="text-xs text-teal-200/80 font-medium">
                    {patient.relationshipToCaretaker} of {caretaker.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    Stage: Mild Cognitive Impairment (MCI)
                  </p>
                </div>
              </div>

              {/* Clinical Features List */}
              <div className="space-y-2.5 mb-8">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Daily 3-Round Brain Workout</strong> tailored for attention and recall</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>10 Northeast Culturally Anchored Games</strong> (Smriti Haat, Jigsaw, etc.)</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Calm Elder Interface:</strong> 400ms tremor debounce & clear contrast</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Medication & Routine Tracker:</strong> Simple visual checklist</span>
                </div>
              </div>
            </div>

            {/* Big 1-Click Action Button */}
            <div>
              <button
                onClick={() => onSelectRole('patient')}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold text-base flex items-center justify-center gap-3 transition-all duration-200 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 cursor-pointer transform active:scale-[0.98]"
              >
                <span>{t.loginAsPatient}</span>
                <ArrowRight className="w-5 h-5 text-teal-100" />
              </button>
              <p className="text-center text-[11px] text-slate-400 mt-2.5">
                Zero complex passwords required • Direct access for {patient.name}
              </p>
            </div>
          </div>

          {/* ═══ CARD 2: CAREGIVER LOGIN (ANITA JOSHI) ═══════════════════════ */}
          <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 shadow-2xl shadow-purple-950/30 p-6 sm:p-8 flex flex-col justify-between group">
            
            {/* Top Badge */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform">
                    <Brain className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 block">
                      Clinical Monitoring
                    </span>
                    <h3 className="text-xl font-black text-white">
                      {t.caregiverLogin}
                    </h3>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-950 border border-purple-800 text-purple-200 font-semibold">
                  Clinician Portal
                </span>
              </div>

              {/* Caregiver Profile Snapshot */}
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 mb-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-white font-extrabold text-xl shadow-md shrink-0">
                  {caretaker.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-white truncate">
                      {caretaker.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                      Primary Caregiver
                    </span>
                  </div>
                  <p className="text-xs text-purple-200/80 font-medium">
                    {caretaker.email || 'anita.joshi@smritiner.in'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    Monitoring: {patient.name} (Mother, Age {patient.age})
                  </p>
                </div>
              </div>

              {/* Clinical Features List */}
              <div className="space-y-2.5 mb-8">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Cognitive Composite Index (0-100)</strong> with 7-day trend analytics</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Adaptive Game Flow Recommendation:</strong> AI-driven difficulty tuning</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Comprehensive Rx & Schedule Management:</strong> Meds, timing, and reports</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Clinical PDF Dossier & Telemetry:</strong> Export standard MoCA/CDR data</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Quick 1-Click Demo Login OR Expand Credentials Form */}
            <div>
              {!showClinicianLogin ? (
                <div className="space-y-2.5">
                  <button
                    onClick={() => onSelectRole('caregiver')}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-base flex items-center justify-center gap-3 transition-all duration-200 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 cursor-pointer transform active:scale-[0.98]"
                  >
                    <span>{t.loginAsCaregiver}</span>
                    <ArrowRight className="w-5 h-5 text-purple-200" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClinicianLogin(true)}
                    className="w-full py-2 text-center text-xs text-purple-300 hover:text-purple-200 font-semibold transition-colors cursor-pointer"
                  >
                    Use custom clinician credentials →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCaregiverSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={caregiverEmail}
                      onChange={(e) => setCaregiverEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-500/40 text-white text-xs focus:outline-hidden focus:border-purple-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Password / Clinical PIN
                    </label>
                    <input
                      type="password"
                      value={caregiverPassword}
                      onChange={(e) => setCaregiverPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-500/40 text-white text-xs focus:outline-hidden focus:border-purple-400"
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowClinicianLogin(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
                    >
                      Sign In to Caregiver Portal
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>

        </div>

        {/* ─── FOOTER METADATA ──────────────────────────────────────────────── */}
        <div className="mt-12 text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-4">
          <span>Smart India Hackathon 2024 • Problem Statement SIH 26003</span>
          <span>•</span>
          <span>Ministry of Development of North Eastern Region (MDoNER)</span>
          <span>•</span>
          <span className="text-slate-400">All data encrypted in client memory & localStorage</span>
        </div>

      </main>

    </div>
  );
};

export default LoginPage;
