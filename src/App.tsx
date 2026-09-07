import { useState, useEffect } from 'react';
import { CaregiverPortal } from './components/portals/CaregiverPortal';
import { PatientPortal } from './components/portals/PatientPortal';
import { ensureDemoProfiles, getStoredSessionReport } from './utils/authStorage';
import { getSavedPrescription, getDefaultPrescription, savePrescription } from './utils/prescriptionStorage';
import { DailySessionManager } from './utils/dailySessionManager';
import { portalSync, type PortalSyncMessage } from './utils/portalSync';
import type { SupportedLanguage, PatientPrescription } from './types/prescription';
import type { CaretakerUser, PatientProfile } from './types/auth';
import { ArrowRightLeft, ExternalLink } from 'lucide-react';

export function App() {
  // Determine initial portal:
  // 1. URL search param: ?portal=caregiver or ?portal=patient
  // 2. URL pathname: /caregiver or /patient
  // 3. Port: 5174 = caregiver, 5173 = patient
  const detectInitialPortal = (): 'caregiver' | 'patient' => {
    if (typeof window === 'undefined') return 'patient';
    const params = new URLSearchParams(window.location.search);
    const portalParam = params.get('portal');
    if (portalParam === 'caregiver') return 'caregiver';
    if (portalParam === 'patient') return 'patient';

    if (window.location.pathname.startsWith('/caregiver')) return 'caregiver';
    if (window.location.pathname.startsWith('/patient')) return 'patient';

    if (window.location.port === '5174') return 'caregiver';
    return 'patient';
  };

  const [currentPortal, setCurrentPortal] = useState<'caregiver' | 'patient'>(detectInitialPortal);

  // Vernacular Language State
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('smriti_language_preference');
      if (saved === 'as' || saved === 'bn' || saved === 'hi' || saved === 'en') {
        return saved as SupportedLanguage;
      }
    } catch {}
    return 'en';
  });

  // User & Patient profiles
  const [{ caretaker, patient }] = useState<{ caretaker: CaretakerUser; patient: PatientProfile }>(() =>
    ensureDemoProfiles()
  );

  // Prescription
  const [prescription, setPrescription] = useState<PatientPrescription>(() =>
    getSavedPrescription() || getDefaultPrescription()
  );

  // Sessions and Clinical Reports
  const [dailySessions, setDailySessions] = useState<Record<string, any>>(() =>
    DailySessionManager.getDailySessions()
  );
  const [lastSessionReport, setLastSessionReport] = useState<any | null>(() =>
    getStoredSessionReport()
  );

  // Setup cross-port bridge on mount
  useEffect(() => {
    const currentPort = window.location.port ? parseInt(window.location.port, 10) : 5173;
    const targetPort = currentPort === 5174 ? 5173 : 5174;
    portalSync.setupCrossPortBridge(targetPort);

    // Subscribe to cross-portal synchronization messages
    const unsubscribe = portalSync.subscribe((msg: PortalSyncMessage) => {
      if (msg.type === 'SESSION_COMPLETED') {
        setDailySessions(DailySessionManager.getDailySessions());
        setLastSessionReport(msg.payload.summary);
      } else if (msg.type === 'LANGUAGE_CHANGED') {
        if (msg.payload?.language) {
          setLanguage(msg.payload.language);
        }
      } else if (msg.type === 'PRESCRIPTION_MUTATED') {
        if (msg.payload) {
          setPrescription(msg.payload);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    try {
      localStorage.setItem('smriti_language_preference', newLang);
    } catch {}
    portalSync.broadcast('LANGUAGE_CHANGED', { language: newLang }, currentPortal);
  };

  const handleUpdatePrescription = (newRx: PatientPrescription) => {
    setPrescription(newRx);
    savePrescription(newRx);
  };

  const handleSwitchToCaregiver = () => {
    if (window.location.port === '5174') {
      setCurrentPortal('caregiver');
    } else {
      try {
        const url = `http://${window.location.hostname}:5174/?portal=caregiver`;
        window.open(url, '_blank');
      } catch {}
      setCurrentPortal('caregiver');
    }
  };

  const handleSwitchToPatient = () => {
    if (window.location.port === '5173' || !window.location.port) {
      setCurrentPortal('patient');
    } else {
      try {
        const url = `http://${window.location.hostname}:5173/?portal=patient`;
        window.open(url, '_blank');
      } catch {}
      setCurrentPortal('patient');
    }
  };

  const togglePortalInPlace = () => {
    setCurrentPortal((prev) => (prev === 'caregiver' ? 'patient' : 'caregiver'));
  };

  const currentPortNum = window.location.port || '5173';

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900">
      
      {/* ─── DUAL-PORT SYSTEM SWITCHER BAR ───────────────────────────────── */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white tracking-tight">NeuroSaathi Dual-Portal</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">
            Active Port: <strong className="text-white">{currentPortNum}</strong> • Active View:{' '}
            <strong className={currentPortal === 'caregiver' ? 'text-purple-400' : 'text-teal-400'}>
              {currentPortal === 'caregiver' ? 'Caregiver Portal' : 'Patient Portal'}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* In-Place View Switcher */}
          <button
            onClick={togglePortalInPlace}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
            title="Toggle portal view in-place"
          >
            <ArrowRightLeft className="w-3 h-3 text-purple-400" />
            <span>Switch to {currentPortal === 'caregiver' ? 'Patient Portal' : 'Caregiver Portal'}</span>
          </button>

          {/* Port Jump Links */}
          {currentPortal === 'patient' ? (
            <button
              onClick={handleSwitchToCaregiver}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800 font-bold transition-colors cursor-pointer"
            >
              <span>Port 5174 (Caregiver)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={handleSwitchToPatient}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-950 hover:bg-teal-900 text-teal-200 border border-teal-800 font-bold transition-colors cursor-pointer"
            >
              <span>Port 5173 (Patient)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ─── CONDITIONAL PORTAL RENDERING ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        {currentPortal === 'caregiver' ? (
          <CaregiverPortal
            language={language}
            onLanguageChange={handleLanguageChange}
            caretaker={caretaker}
            patient={patient}
            prescription={prescription}
            onUpdatePrescription={handleUpdatePrescription}
            dailySessions={dailySessions}
            lastSessionReport={lastSessionReport}
            onOpenPatientPortal={handleSwitchToPatient}
          />
        ) : (
          <PatientPortal
            language={language}
            onLanguageChange={handleLanguageChange}
            patient={patient}
            caretaker={caretaker}
            prescription={prescription}
            onOpenCaregiverPortal={handleSwitchToCaregiver}
          />
        )}
      </div>

    </div>
  );
}

export default App;
