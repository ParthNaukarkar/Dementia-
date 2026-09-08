import { useState, useEffect } from 'react';
import { CaregiverPortal } from './components/portals/CaregiverPortal';
import { PatientPortal } from './components/portals/PatientPortal';
import { LoginPage } from './components/auth/LoginPage';
import { ensureDemoProfiles, getStoredSessionReport } from './utils/authStorage';
import { getSavedPrescription, getDefaultPrescription, savePrescription } from './utils/prescriptionStorage';
import { DailySessionManager } from './utils/dailySessionManager';
import { portalSync, type PortalSyncMessage } from './utils/portalSync';
import type { SupportedLanguage, PatientPrescription } from './types/prescription';
import type { CaretakerUser, PatientProfile } from './types/auth';
import { ArrowRightLeft, LogOut } from 'lucide-react';

export type AuthView = 'login' | 'patient' | 'caregiver';

export function App() {
  // Determine initial portal:
  // 1. URL search param: ?portal=caregiver, ?portal=patient, or ?portal=login
  // 2. URL pathname: /caregiver, /patient, or /login
  // 3. Stored user session in localStorage ('smriti_auth_view')
  // 4. Fallback to 'login'
  const detectInitialView = (): AuthView => {
    if (typeof window === 'undefined') return 'login';
    const params = new URLSearchParams(window.location.search);
    const portalParam = params.get('portal');
    if (portalParam === 'caregiver') return 'caregiver';
    if (portalParam === 'patient') return 'patient';
    if (portalParam === 'login') return 'login';

    if (window.location.pathname.startsWith('/caregiver')) return 'caregiver';
    if (window.location.pathname.startsWith('/patient')) return 'patient';
    if (window.location.pathname.startsWith('/login')) return 'login';

    try {
      const saved = localStorage.getItem('smriti_auth_view');
      if (saved === 'patient' || saved === 'caregiver' || saved === 'login') {
        return saved as AuthView;
      }
    } catch {}

    if (window.location.port === '5174') return 'caregiver';
    return 'login';
  };

  const [activeView, setActiveView] = useState<AuthView>(detectInitialView);

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

  // Setup cross-port bridge on mount for legacy or dual-browser tabs
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

  const updateView = (newView: AuthView) => {
    setActiveView(newView);
    try {
      localStorage.setItem('smriti_auth_view', newView);
      const url = new URL(window.location.href);
      url.searchParams.set('portal', newView);
      window.history.replaceState({}, '', url);
    } catch {}
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    try {
      localStorage.setItem('smriti_language_preference', newLang);
    } catch {}
    const sender = activeView === 'caregiver' ? 'caregiver' : 'patient';
    portalSync.broadcast('LANGUAGE_CHANGED', { language: newLang }, sender);
  };

  const handleUpdatePrescription = (newRx: PatientPrescription) => {
    setPrescription(newRx);
    savePrescription(newRx);
  };

  const handleLogin = (role: 'patient' | 'caregiver') => {
    updateView(role);
  };

  const handleLogout = () => {
    updateView('login');
  };

  const handleSwitchToCaregiver = () => {
    updateView('caregiver');
  };

  const handleSwitchToPatient = () => {
    updateView('patient');
  };

  const togglePortalInPlace = () => {
    updateView(activeView === 'caregiver' ? 'patient' : 'caregiver');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900">
      
      {/* ─── UNIFIED SINGLE-ORIGIN TOP BAR (When Logged In) ──────────────── */}
      {activeView !== 'login' && (
        <div className="bg-slate-900 text-slate-300 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 z-50">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white tracking-tight">NeuroSaathi Unified Platform</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">
              Single Localhost: <strong className="text-white">{window.location.port || '5173'}</strong> • Active Mode:{' '}
              <strong className={activeView === 'caregiver' ? 'text-purple-400' : 'text-teal-400'}>
                {activeView === 'caregiver' ? 'Caregiver Portal (Anita Joshi)' : 'Patient Portal (Meera Joshi)'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* In-Place View Switcher */}
            <button
              onClick={togglePortalInPlace}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
              title="Toggle portal view in-place"
            >
              <ArrowRightLeft className="w-3 h-3 text-purple-400" />
              <span>Switch to {activeView === 'caregiver' ? 'Patient Portal' : 'Caregiver Portal'}</span>
            </button>

            {/* Logout / Switch User */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/80 font-bold transition-colors cursor-pointer"
              title="Log out to Login / Role Selection Screen"
            >
              <LogOut className="w-3 h-3 text-rose-300" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── CONDITIONAL VIEW RENDERING ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        {activeView === 'login' ? (
          <LoginPage
            language={language}
            onLanguageChange={handleLanguageChange}
            patient={patient}
            caretaker={caretaker}
            onSelectRole={handleLogin}
          />
        ) : activeView === 'caregiver' ? (
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
            onLogout={handleLogout}
          />
        ) : (
          <PatientPortal
            language={language}
            onLanguageChange={handleLanguageChange}
            patient={patient}
            caretaker={caretaker}
            prescription={prescription}
            onOpenCaregiverPortal={handleSwitchToCaregiver}
            onLogout={handleLogout}
          />
        )}
      </div>

    </div>
  );
}

export default App;
