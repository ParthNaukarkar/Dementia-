import React, { useState } from 'react';
import {
  Heart,
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Languages,
  ShieldCheck,
  Smile,
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

  // Caregiver credential form state
  const [caregiverEmail, setCaregiverEmail] = useState(caretaker.email || 'anita.joshi@neurosaathi.in');
  const [caregiverPassword, setCaregiverPassword] = useState('••••••••••••');
  const [showClinicianLogin, setShowClinicianLogin] = useState(false);

  const handleCaregiverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectRole('caregiver');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F2421] flex flex-col font-sans select-none">
      
      {/* ─── KEEN TOP HEADER ──────────────────────────────────────────────── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E5DFD5] sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          
          {/* Logo & Platform Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FDF1EB] border border-[#F5D3C4] flex items-center justify-center text-[#C05634] shadow-xs">
              <Brain className="w-6 h-6 text-[#C05634]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-['Sora'] font-extrabold text-lg text-[#1F2421] leading-tight tracking-tight">
                  <span>Smriti</span><span className="text-[#C05634]">Setu</span>
                </h1>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EDF5F0] text-[#28573E] border border-[#CCE2D4]">
                  {language === 'hi' ? 'बुजुर्ग संज्ञान मंच' : 'Cognitive Wellness'}
                </span>
              </div>
              <p className="text-[12px] font-medium text-[#636B65]">
                {language === 'hi' ? 'दैनिक मस्तिष्क स्वास्थ्य एवं स्मृति सहायता' : 'Daily Memory Care & Cognitive Fitness'}
              </p>
            </div>
          </div>

          {/* Right Controls: Single Localhost Status & Accessible Language Switcher */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4F0EA] text-[#38403A] border border-[#E5DFD5] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#28573E] animate-pulse" />
              <span>{language === 'hi' ? 'सुरक्षित ऑन-डिवाइस सिस्टम' : 'Secure On-Device System'}</span>
            </div>

            {/* Language Selector (English, Hindi) */}
            <div className="flex items-center bg-[#F4F0EA] p-1 rounded-xl border border-[#E5DFD5]">
              <Languages className="w-4 h-4 text-[#636B65] mx-1.5" />
              {([
                { code: 'en', label: 'EN' },
                { code: 'hi', label: 'हिन्दी' },
              ] as const).map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => onLanguageChange(code)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    language === code
                      ? 'bg-[#C05634] text-white shadow-xs'
                      : 'text-[#636B65] hover:text-[#1F2421]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </header>

      {/* ─── MAIN LOGIN CONTAINER ────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 flex flex-col justify-center">
        
        {/* Welcome Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF3E7] border border-[#F2E1C2] text-[#A86F15] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#A86F15]" />
            <span>{language === 'hi' ? 'वरिष्ठ नागरिकों और देखभालकर्ताओं के लिए समर्पित' : 'Dedicated for Older Adults & Loving Caregivers'}</span>
          </div>
          <h2 className="font-['Sora'] text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1F2421] mb-3">
            {t.welcomeBack}
          </h2>
          <p className="text-base sm:text-lg text-[#636B65] leading-relaxed font-normal">
            {language === 'hi' 
              ? 'कृपया चुनें कि आप किसके रूप में उपयोग करना चाहते हैं। बड़े बटन और स्पष्ट पाठ के साथ बनाया गया।' 
              : 'Please choose your profile below to begin today’s session. Designed with generous spacing and calm clarity.'}
          </p>
        </div>

        {/* ─── DUAL ROLE SELECTION CARDS ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          
          {/* ═══ CARD 1: PATIENT LOGIN (MEERA JOSHI) ═══════════════════════ */}
          <div className="bg-white rounded-3xl border-2 border-[#E5DFD5] hover:border-[#C05634] p-7 sm:p-9 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#C05634]" />

            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FDF1EB] border border-[#F5D3C4] flex items-center justify-center text-[#C05634] group-hover:scale-105 transition-transform">
                    <Heart className="w-6 h-6 fill-[#C05634] text-[#C05634]" />
                  </div>
                  <div>
                    <span className="text-[12px] font-bold uppercase tracking-wider text-[#C05634] block">
                      {language === 'hi' ? 'वरिष्ठ नागरिक पोर्टल' : 'Senior Member Portal'}
                    </span>
                    <h3 className="font-['Sora'] text-2xl font-bold text-[#1F2421]">
                      {t.patientLogin}
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EDF5F0] text-[#28573E] border border-[#CCE2D4]">
                  {language === 'hi' ? '१-क्लिक पहुंच' : '1-Click Access'}
                </span>
              </div>

              {/* Patient Profile Snapshot in Warm Well */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F4F0EA] border border-[#E5DFD5] mb-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#C05634] flex items-center justify-center text-white font-['Sora'] font-extrabold text-2xl shadow-sm shrink-0">
                  {patient.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-['Sora'] font-bold text-lg text-[#1F2421] truncate">
                      {patient.name}
                    </h4>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#38403A] border border-[#D5CCC0] shadow-2xs">
                      {language === 'hi' ? `आयु ${patient.age}` : `Age ${patient.age}`}
                    </span>
                  </div>
                  <p className="text-sm text-[#636B65] font-medium mt-0.5">
                    {language === 'hi' ? `${caretaker.name} की ${patient.relationshipToCaretaker}` : `${patient.relationshipToCaretaker} of ${caretaker.name}`}
                  </p>
                  <p className="text-xs text-[#28573E] font-bold truncate mt-1">
                    {language === 'hi' ? '• दैनिक मानसिक अभ्यास एवं दिनचर्या' : '• Daily Cognitive Exercises & Routine'}
                  </p>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3 text-sm text-[#38403A]">
                  <CheckCircle2 className="w-5 h-5 text-[#28573E] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#1F2421] font-bold">{language === 'hi' ? 'दैनिक 3-राउंड मस्तिष्क व्यायाम:' : 'Daily 3-Round Brain Workout:'}</strong> {language === 'hi' ? 'शांत ऑडियो संकेतों व बड़े अक्षरों के साथ' : 'with calming voice guidance and zero time pressure'}
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[#38403A]">
                  <CheckCircle2 className="w-5 h-5 text-[#28573E] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#1F2421] font-bold">{language === 'hi' ? '10 सांस्कृतिक स्मृति खेल:' : '10 Cultural Memory Games:'}</strong> {language === 'hi' ? 'स्मृति हाट, जिगसॉ पहेली, संगीत व कहानी' : 'Smriti Haat, Jigsaw Puzzle, Brain Story, and more'}
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[#38403A]">
                  <CheckCircle2 className="w-5 h-5 text-[#28573E] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#1F2421] font-bold">{language === 'hi' ? 'दवा एवं दिनचर्या चेकलिस्ट:' : 'Medication & Schedule Checklist:'}</strong> {language === 'hi' ? 'आसान बड़े टिक बॉक्स के साथ' : 'Clear visual checklists with generous tap targets'}
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[#38403A]">
                  <CheckCircle2 className="w-5 h-5 text-[#28573E] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#1F2421] font-bold">{language === 'hi' ? 'कंपन सुरक्षा (Tremor Debouncing):' : 'Tremor Damping (400ms):'}</strong> {language === 'hi' ? 'अनजाने में दो बार छूने से बचाव' : 'Accidental double-tap filtering for steady interactions'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button: 56px Terracotta Primary Button */}
            <div>
              <button
                onClick={() => onSelectRole('patient')}
                className="w-full h-15 rounded-2xl bg-[#C05634] hover:bg-[#A64727] text-white font-['Sora'] font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98]"
              >
                <span>{t.loginAsPatient}</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
              <p className="text-center text-xs text-[#636B65] font-medium mt-3">
                {language === 'hi' ? 'किसी पासवर्ड की आवश्यकता नहीं • सुरक्षित १-क्लिक प्रवेश' : 'No password required • Respectful and direct access'}
              </p>
            </div>
          </div>

          {/* ═══ CARD 2: CAREGIVER LOGIN (ANITA JOSHI) ═════════════════════ */}
          <div className="bg-white rounded-3xl border-2 border-[#E5DFD5] hover:border-[#28573E] p-7 sm:p-9 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#28573E]" />

            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#EDF5F0] border border-[#CCE2D4] flex items-center justify-center text-[#28573E] group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6 text-[#28573E]" />
                  </div>
                  <div>
                    <span className="text-[12px] font-bold uppercase tracking-wider text-[#28573E] block">
                      {language === 'hi' ? 'देखभालकर्ता एवं परिजन पोर्टल' : 'Caregiver & Family Portal'}
                    </span>
                    <h3 className="font-['Sora'] text-2xl font-bold text-[#1F2421]">
                      {t.caregiverLogin}
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF3E7] text-[#A86F15] border border-[#F2E1C2]">
                  {language === 'hi' ? 'निगरानी कंसोल' : 'Monitoring Console'}
                </span>
              </div>

              {/* Caregiver Profile Snapshot in Warm Well */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F4F0EA] border border-[#E5DFD5] mb-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#28573E] flex items-center justify-center text-white font-['Sora'] font-extrabold text-2xl shadow-sm shrink-0">
                  {caretaker.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-['Sora'] font-bold text-lg text-[#1F2421] truncate">
                      {caretaker.name}
                    </h4>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#38403A] border border-[#D5CCC0] shadow-2xs">
                      {language === 'hi' ? 'प्राथमिक देखभालकर्ता' : 'Primary Caregiver'}
                    </span>
                  </div>
                  <p className="text-sm text-[#636B65] font-medium mt-0.5">
                    {caretaker.email || 'anita.joshi@neurosaathi.in'}
                  </p>
                  <p className="text-xs text-[#28573E] font-bold truncate mt-1">
                    {language === 'hi' ? `निगरानी: ${patient.name} (माता, आयु ${patient.age})` : `Monitoring: ${patient.name} (Mother, Age ${patient.age})`}
                  </p>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3 text-sm text-[#38403A]">
                  <CheckCircle2 className="w-5 h-5 text-[#28573E] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#1F2421] font-bold">{language === 'hi' ? 'संज्ञानात्मक प्रगति ट्रैकिंग (0–100):' : 'Cognitive Composite Tracking (0–100):'}</strong> {language === 'hi' ? '7-दिवसीय रुझान विश्लेषण' : '7-day trend analytics and memory retention graphs'}
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[#38403A]">
                  <CheckCircle2 className="w-5 h-5 text-[#28573E] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#1F2421] font-bold">{language === 'hi' ? 'अनुकूली कठिनाई प्रबंधन:' : 'Palliative AI Calibration:'}</strong> {language === 'hi' ? 'थकावट और तनाव से बचाने वाला स्वतः समायोजन' : 'Automated easing when hesitation or fatigue is detected'}
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[#38403A]">
                  <CheckCircle2 className="w-5 h-5 text-[#28573E] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#1F2421] font-bold">{language === 'hi' ? 'दवा एवं दिनचर्या व्यवस्थापन:' : 'Medication & Routine Management:'}</strong> {language === 'hi' ? 'तुरंत सिंक होने वाले नुस्खे और अलार्म' : 'Instant cross-portal synchronization'}
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[#38403A]">
                  <CheckCircle2 className="w-5 h-5 text-[#28573E] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#1F2421] font-bold">{language === 'hi' ? 'डॉक्टर के लिए क्लिनिकल रिपोर्ट:' : 'Clinical MoCA Export:'}</strong> {language === 'hi' ? 'न्यूरोलॉजिस्ट के साथ साझा करने हेतु पीडीएफ रिपोर्ट' : 'Exportable clinical dossier for neurologist consultations'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: 56px Forest Green Secondary Button */}
            <div>
              {!showClinicianLogin ? (
                <div>
                  <button
                    onClick={() => onSelectRole('caregiver')}
                    className="w-full h-15 rounded-2xl bg-[#28573E] hover:bg-[#1E4430] text-white font-['Sora'] font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98]"
                  >
                    <span>{t.loginAsCaregiver}</span>
                    <ArrowRight className="w-5 h-5 text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClinicianLogin(true)}
                    className="w-full py-2.5 text-center text-xs text-[#636B65] hover:text-[#1F2421] font-semibold transition-colors cursor-pointer mt-1"
                  >
                    {language === 'hi' ? 'कस्टम क्लिनिशियन क्रेडेंशियल से लॉगिन करें →' : 'Use custom clinician credentials →'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCaregiverSubmit} className="space-y-3.5 bg-[#F4F0EA] p-4 rounded-2xl border border-[#E5DFD5]">
                  <div>
                    <label className="block text-xs font-bold text-[#38403A] uppercase tracking-wider mb-1">
                      {language === 'hi' ? 'क्लिनिशियन ईमेल पता' : 'Clinician Email Address'}
                    </label>
                    <input
                      type="email"
                      value={caregiverEmail}
                      onChange={(e) => setCaregiverEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5CCC0] text-[#1F2421] text-sm focus:outline-none focus:border-[#28573E]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#38403A] uppercase tracking-wider mb-1">
                      {language === 'hi' ? 'पासवर्ड / क्लिनिकल पिन' : 'Password / Clinical PIN'}
                    </label>
                    <input
                      type="password"
                      value={caregiverPassword}
                      onChange={(e) => setCaregiverPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5CCC0] text-[#1F2421] text-sm focus:outline-none focus:border-[#28573E]"
                      required
                    />
                  </div>
                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowClinicianLogin(false)}
                      className="flex-1 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#38403A] font-bold text-xs transition-colors cursor-pointer border border-[#D5CCC0]"
                    >
                      {language === 'hi' ? 'वापस' : 'Back'}
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-2.5 rounded-xl bg-[#28573E] hover:bg-[#1E4430] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      {language === 'hi' ? 'देखभालकर्ता पोर्टल में साइन इन करें' : 'Sign In to Portal'}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>

        </div>

        {/* ─── RESPECTFUL FOOTER METADATA ─────────────────────────────────── */}
        <div className="mt-12 text-center text-xs text-[#636B65] flex flex-wrap items-center justify-center gap-3">
          <span className="font-semibold text-[#38403A] flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-[#C05634]" />
            {language === 'hi' ? 'वरिष्ठ नागरिक मानसिक स्वास्थ्य आर्किटेक्चर' : 'Empowering Cognitive Independence & Dignity'}
          </span>
          <span>•</span>
          <span className="font-semibold text-[#38403A]">
            {language === 'hi' ? '100% ऑन-डिवाइस सुरक्षित डेटा' : '100% On-Device Private & Offline Capable'}
          </span>
          <span>•</span>
          <span className="text-[#28573E] font-bold">
            {language === 'hi' ? 'भारतीय सांस्कृतिक संदर्भों के साथ प्रमाणित' : 'Calibrated for Indian Cultural Contexts'}
          </span>
        </div>

      </main>

    </div>
  );
};

export default LoginPage;

