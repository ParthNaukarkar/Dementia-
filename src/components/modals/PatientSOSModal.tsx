import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  AlertTriangle,
  Heart,
  X,
  Bell,
  CheckCircle2,
  Ambulance,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import type { SupportedLanguage } from '../../types/prescription';
import type { PatientProfile, CaretakerUser } from '../../types/auth';
import { portalSync } from '../../utils/portalSync';
import { addStoredSOSAlert } from '../../utils/caregiverStorage';

interface PatientSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
  patient: PatientProfile;
  caretaker: CaretakerUser;
}

export const PatientSOSModal: React.FC<PatientSOSModalProps> = ({
  isOpen,
  onClose,
  language,
  patient,
  caretaker,
}) => {
  const isHi = language === 'hi';
  const [alertSent, setAlertSent] = useState<boolean>(false);
  const [alertTime, setAlertTime] = useState<string>('');
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingTimer, setBreathingTimer] = useState<number>(4);

  // Sound generator for emergency reassurance
  const playReassuranceTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.46);
    } catch {}
  };

  // Broadcast SOS alert across portals immediately when patient requests help
  const handleSendCaregiverAlert = (
    triggerType: 'CALL_CAREGIVER' | 'CALL_112' | 'CALL_108' | 'MANUAL_ALERT' | 'MODAL_OPEN' = 'MANUAL_ALERT',
    triggerLabel?: string
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAlertTime(timeStr);
    setAlertSent(true);
    playReassuranceTone();

    const label = triggerLabel || (
      triggerType === 'CALL_CAREGIVER'
        ? (isHi ? 'देखभालकर्ता को सीधे कॉल किया गया' : 'Caregiver Direct Phone Call')
        : triggerType === 'CALL_112'
        ? (isHi ? '112 राष्ट्रीय आपातकालीन हेल्पलाइन' : '112 National Emergency Helpline')
        : triggerType === 'CALL_108'
        ? (isHi ? '108 एम्बुलेंस आपातकालीन सेवा' : '108 Medical Ambulance')
        : triggerType === 'MODAL_OPEN'
        ? (isHi ? 'आपातकालीन SOS स्क्रीन खोली गई' : 'SOS Emergency Screen Opened')
        : (isHi ? 'तत्काल सहायता अलर्ट' : 'Urgent Distress Alert')
    );

    const alertRecord = addStoredSOSAlert(patient.id, {
      patientId: patient.id,
      patientName: patient.name,
      caretakerName: caretaker.name,
      timestamp: Date.now(),
      timeFormatted: timeStr,
      emergencyContact: patient.emergencyContact || '+91 98765 43210',
      triggerType,
      triggerLabel: label,
      status: 'active',
    });

    portalSync.broadcast('PATIENT_SOS_ALERT', {
      ...alertRecord,
    });
  };

  // Breathing pacer cycle (4s inhale -> 4s hold -> 4s exhale)
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setBreathingTimer((prev) => {
        if (prev <= 1) {
          setBreathingPhase((current) => {
            if (current === 'inhale') return 'hold';
            if (current === 'hold') return 'exhale';
            return 'inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Reset alert state when opened
  useEffect(() => {
    if (isOpen) {
      // Auto-trigger the first notification signal so caregiver is warned immediately upon opening SOS
      handleSendCaregiverAlert('MODAL_OPEN');
    } else {
      setAlertSent(false);
      setAlertTime('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const caregiverPhone = patient.emergencyContact || '+91 98765 43210';
  const currentDate = new Date().toLocaleDateString(isHi ? 'hi-IN' : 'en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
    >
      <div className="bg-[#FAF8F5] text-[#1F2421] w-full max-w-2xl rounded-3xl sm:rounded-[32px] border-2 border-[#E5DFD5] shadow-2xl overflow-hidden my-auto">
        
        {/* ─── URGENT YET CALM TOP HEADER ─── */}
        <div className="bg-red-600 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border-2 border-white/40 shrink-0 shadow-inner">
                <AlertTriangle className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/25 text-white font-['Sora'] text-xs font-black tracking-widest uppercase mb-1">
                  {isHi ? 'आपातकालीन सहायता' : 'Emergency Assistance'}
                </span>
                <h2 id="sos-modal-title" className="font-['Sora'] text-2xl sm:text-3xl font-black text-white leading-tight">
                  {isHi ? 'मदद और आपातकाल' : 'Immediate Help & SOS'}
                </h2>
              </div>
            </div>

            {/* Accessible Close Button */}
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer border border-white/30 shrink-0"
              title={isHi ? 'बंद करें' : 'Close'}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="mt-3 text-red-50 text-base sm:text-lg leading-relaxed relative z-10">
            {isHi
              ? 'शांत रहें, आप पूरी तरह सुरक्षित हैं। अपने देखभालकर्ता या आपातकालीन सेवा को सीधे कॉल करें।'
              : 'Take a calm breath. You are safe. Call your caregiver or emergency services with one tap below.'}
          </p>
        </div>

        {/* ─── BODY ACTIONS ─── */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* 1. CAREGIVER ALERT NOTIFICATION STATUS */}
          <div className={`p-5 rounded-2xl border transition-all ${
            alertSent 
              ? 'bg-[#EDF5F0] border-[#CCE2D4] text-[#1F2421]'
              : 'bg-white border-[#E5DFD5]'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  alertSent ? 'bg-[#28573E] text-white' : 'bg-red-100 text-red-600'
                }`}>
                  {alertSent ? <CheckCircle2 className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-['Sora'] font-bold text-lg text-[#1F2421]">
                      {alertSent
                        ? (isHi ? 'देखभालकर्ता को अलर्ट भेजा गया' : 'Caregiver Alert Sent!')
                        : (isHi ? 'देखभालकर्ता को सूचित करें' : 'Alert Caregiver')}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                      {isHi ? 'डेमो मोड' : 'Demo Mode'}
                    </span>
                  </div>
                  <p className="text-sm text-[#636B65] mt-0.5 font-medium">
                    {alertSent
                      ? (isHi
                          ? `${caretaker.name} के पोर्टल पर संदेश भेजा गया (${alertTime})`
                          : `Alert dispatched to ${caretaker.name}'s portal (${alertTime})`)
                      : (isHi
                          ? `${caretaker.name} को सीधे आपातकालीन संदेश भेजें`
                          : `Send urgent notification to ${caretaker.name}`)}
                  </p>
                  <p className="text-[11px] text-[#8C7A6B] mt-1">
                    {isHi
                      ? 'ℹ️ डेमो मोड: अलर्ट स्थानीय पोर्टल सत्रों के बीच प्रसारित होता है। वास्तविक आपातकाल के लिए सीधे कॉल बटन का उपयोग करें।'
                      : 'ℹ️ Demo Mode: Alerts broadcast across local portal sessions. For real emergencies, use direct phone call buttons below.'}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => handleSendCaregiverAlert('MANUAL_ALERT')}
                  className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-['Sora'] font-bold text-sm cursor-pointer shadow-xs shrink-0 transition-transform active:scale-95"
                >
                  {alertSent 
                    ? (isHi ? 'पुनः अलर्ट भेजें' : 'Resend Alert') 
                    : (isHi ? 'अलर्ट भेजें' : 'Send Alert')}
                </button>
              </div>
            </div>
          </div>

          {/* 2. PRIMARY CAREGIVER DIRECT CALL CARD */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border-2 border-[#E5DFD5] shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#636B65]">
                  {isHi ? 'प्राथमिक देखभालकर्ता' : 'Primary Family / Caregiver'}
                </span>
                <h3 className="font-['Sora'] text-2xl font-black text-[#1F2421] mt-0.5">
                  {caretaker.name}
                </h3>
                <p className="text-sm text-[#636B65] font-semibold mt-0.5">
                  {patient.relationshipToCaretaker || (isHi ? 'देखभालकर्ता' : 'Family Caregiver')} • {caregiverPhone}
                </p>
              </div>

              {/* Direct Dial 64px Touch Target Button */}
              <a
                href={`tel:${caregiverPhone.replace(/\s+/g, '')}`}
                onClick={() => handleSendCaregiverAlert('CALL_CAREGIVER')}
                className="h-16 px-8 rounded-2xl bg-[#28573E] hover:bg-[#1E4430] text-white font-['Sora'] font-extrabold text-lg flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all active:scale-[0.98] w-full sm:w-auto"
              >
                <PhoneCall className="w-6 h-6" />
                <span>{isHi ? 'देखभालकर्ता को कॉल करें' : 'Call Caregiver Now'}</span>
              </a>
            </div>
          </div>

          {/* 3. NATIONAL EMERGENCY SERVICES (112 & 108) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 112 National Helpline */}
            <a
              href="tel:112"
              onClick={() => handleSendCaregiverAlert('CALL_112')}
              className="bg-white p-5 rounded-2xl border-2 border-red-200 hover:border-red-400 hover:bg-red-50/50 transition-all flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-['Sora'] font-black text-lg text-[#1F2421]">112</h4>
                  <p className="text-xs text-[#636B65] font-semibold">
                    {isHi ? 'राष्ट्रीय आपातकालीन नंबर' : 'National Emergency Helpline'}
                  </p>
                </div>
              </div>
              <span className="px-4 py-2 rounded-xl bg-red-600 text-white font-['Sora'] font-bold text-sm shrink-0">
                {isHi ? 'कॉल' : 'Call'}
              </span>
            </a>

            {/* 108 Ambulance */}
            <a
              href="tel:108"
              onClick={() => handleSendCaregiverAlert('CALL_108')}
              className="bg-white p-5 rounded-2xl border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Ambulance className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-['Sora'] font-black text-lg text-[#1F2421]">108</h4>
                  <p className="text-xs text-[#636B65] font-semibold">
                    {isHi ? 'एम्बुलेंस / चिकित्सा सेवा' : 'Ambulance / Medical'}
                  </p>
                </div>
              </div>
              <span className="px-4 py-2 rounded-xl bg-amber-600 text-white font-['Sora'] font-bold text-sm shrink-0">
                {isHi ? 'कॉल' : 'Call'}
              </span>
            </a>
          </div>

          {/* 4. FEELING ANXIOUS OR DISORIENTED? (CALMING REASSURANCE & BREATHING) */}
          <div className="bg-[#FAF3E7] p-6 rounded-2xl border border-[#F2E1C2] space-y-4">
            <div className="flex items-center gap-3">
              <Compass className="w-6 h-6 text-[#C05634]" />
              <h3 className="font-['Sora'] font-bold text-lg text-[#1F2421]">
                {isHi ? 'घबराहट या उलझन महसूस हो रही है?' : 'Feeling Anxious or Disoriented?'}
              </h3>
            </div>

            {/* Grounding Facts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#38403A]">
              <div className="bg-white/80 p-3 rounded-xl border border-[#E5DFD5]">
                <span className="font-bold text-[#636B65] block text-xs">{isHi ? 'आज का दिन' : 'Today is'}</span>
                <span className="font-['Sora'] font-bold text-base text-[#1F2421]">{currentDate}</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-[#E5DFD5]">
                <span className="font-bold text-[#636B65] block text-xs">{isHi ? 'स्थान' : 'You are at'}</span>
                <span className="font-['Sora'] font-bold text-base text-[#1F2421]">
                  {isHi ? 'अपने घर पर, सुरक्षित' : 'Home, in a safe space'}
                </span>
              </div>
            </div>

            {/* Guided Calm Breathing Circle */}
            <div className="bg-white/90 p-5 rounded-2xl border border-[#E5DFD5] flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#C05634]">
                  {isHi ? 'शांत श्वास अभ्यास' : 'Gentle Paced Breathing'}
                </p>
                <p className="font-['Sora'] font-bold text-xl text-[#1F2421] mt-0.5">
                  {breathingPhase === 'inhale' && (isHi ? 'साँस अंदर लें (Inhale)' : 'Breathe In Slowly')}
                  {breathingPhase === 'hold' && (isHi ? 'साँस रोकें (Hold)' : 'Gently Hold')}
                  {breathingPhase === 'exhale' && (isHi ? 'साँस बाहर छोड़ें (Exhale)' : 'Breathe Out Gently')}
                </p>
                <p className="text-xs text-[#636B65] mt-0.5">
                  {isHi ? 'इस वृत्त के साथ गहरी और सहज सांस लें' : 'Follow the gentle rhythm to ease heart rate'}
                </p>
              </div>

              {/* Visual Breathing Ring */}
              <div className="relative w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                    breathingPhase === 'inhale'
                      ? 'scale-110 bg-[#EDF5F0] border-4 border-[#28573E]'
                      : breathingPhase === 'hold'
                      ? 'scale-105 bg-[#FDF1EB] border-4 border-[#C05634]'
                      : 'scale-90 bg-slate-100 border-4 border-slate-400'
                  }`}
                />
                <span className="relative font-['Sora'] font-black text-2xl text-[#1F2421]">
                  {breathingTimer}
                </span>
              </div>
            </div>
          </div>

          {/* 5. DISMISS / I AM OKAY BUTTON (60px Touch Target) */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full h-15 sm:h-16 rounded-2xl bg-white hover:bg-[#FAF8F5] text-[#1F2421] border-2 border-[#E5DFD5] hover:border-[#D5CCC0] font-['Sora'] font-bold text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <Heart className="w-5 h-5 text-[#28573E]" />
              <span>{isHi ? 'मैं ठीक हूँ • वापस जाएँ' : "I am Feeling Better • Return to Home"}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
