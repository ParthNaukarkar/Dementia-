import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Brain,
  Pill,
  Calendar,
  Bell,
  User,
  Settings,
  Plus,
  Trash2,
  FileText,
  Upload,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
  Sparkles,
  Sliders,
  X,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

import type { SupportedLanguage, PatientPrescription } from '../../types/prescription';
import type { CaretakerUser, PatientProfile } from '../../types/auth';
import type { MedicationItem, DailyRoutineItem, MedicationTiming } from '../../types/caregiver';
import { getTranslation } from '../../locales/translations';
import { portalSync, type PortalSyncMessage } from '../../utils/portalSync';
import {
  getStoredMedications,
  saveStoredMedications,
  addStoredMedication,
  deleteStoredMedication,
  getStoredRoutine,
  saveStoredRoutine,
  addStoredRoutine,
  deleteStoredRoutine,
  getStoredReports,
  addStoredReport,
  type MedicalReportItem,
} from '../../utils/caregiverStorage';
import {
  DailySessionManager,
  type DailyCompositeScoreResult,
} from '../../utils/dailySessionManager';
import { MyBrainAnalytics } from '../dashboard/MyBrainAnalytics';
import { PrescriptionSetupModal } from '../prescription/PrescriptionSetupModal';
import { ClinicalSessionReportModal } from '../dashboard/ClinicalSessionReportModal';
import { GAME_CATALOG } from '../../data/gameCatalog';

interface CaregiverPortalProps {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  caretaker: CaretakerUser;
  patient: PatientProfile;
  prescription: PatientPrescription;
  onUpdatePrescription: (newRx: PatientPrescription) => void;
  dailySessions?: Record<string, any>;
  lastSessionReport?: any;
  onOpenPatientPortal?: () => void;
  onLogout?: () => void;
}

export const CaregiverPortal: React.FC<CaregiverPortalProps> = ({
  language,
  onLanguageChange,
  caretaker,
  patient,
  prescription,
  onUpdatePrescription,
  dailySessions = {},
  lastSessionReport = null,
  onOpenPatientPortal,
  onLogout,
}) => {
  const t = getTranslation(language);

  // Active navigation tab
  // Options: 'dashboard' | 'games' | 'medications' | 'routine' | 'alerts' | 'profile' | 'settings'
  const [activeTab, setActiveTab] = useState<string>('profile');

  // Games sub-tab: 'PRESCRIBED' | 'BRAIN_ANALYTICS'
  const [gamesSubTab, setGamesSubTab] = useState<'PRESCRIBED' | 'BRAIN_ANALYTICS'>('BRAIN_ANALYTICS');

  // Local state for Medications, Routines, and Medical Reports
  const [medications, setMedications] = useState<MedicationItem[]>(() =>
    getStoredMedications(patient.id)
  );
  const [routines, setRoutines] = useState<DailyRoutineItem[]>(() =>
    getStoredRoutine(patient.id)
  );
  const [reports, setReports] = useState<MedicalReportItem[]>(() =>
    getStoredReports(patient.id)
  );

  // Modals
  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);
  const [isAddRoutineModalOpen, setIsAddRoutineModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isClinicalReportModalOpen, setIsClinicalReportModalOpen] = useState(false);

  // New Medication Form State
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedTiming, setNewMedTiming] = useState<MedicationTiming>('morning');
  const [newMedInstructions, setNewMedInstructions] = useState('');
  const [newMedDoctor, setNewMedDoctor] = useState('Dr. Priya Mehta (GMCH Neurology)');

  // New Routine Form State
  const [newRoutineActivity, setNewRoutineActivity] = useState('');
  const [newRoutineTime, setNewRoutineTime] = useState('08:00 AM');
  const [newRoutineCategory, setNewRoutineCategory] = useState<'exercise' | 'cognitive' | 'meal' | 'rest' | 'social'>('exercise');

  // File upload state for Medical Reports
  const [selectedReportFile, setSelectedReportFile] = useState<File | null>(null);

  // Local reactive state for daily sessions and latest clinical report
  const [currentDailySessions, setCurrentDailySessions] = useState<Record<string, any>>(() =>
    dailySessions && Object.keys(dailySessions).length > 0 ? dailySessions : DailySessionManager.getDailySessions()
  );
  const [currentReport, setCurrentReport] = useState<any | null>(lastSessionReport);

  // Synchronize state when props update
  useEffect(() => {
    if (dailySessions && Object.keys(dailySessions).length > 0) {
      setCurrentDailySessions(dailySessions);
    }
  }, [dailySessions]);

  useEffect(() => {
    if (lastSessionReport) {
      setCurrentReport(lastSessionReport);
    }
  }, [lastSessionReport]);

  // Calculate composite score dynamically from today's real sessions
  const compositeScore: DailyCompositeScoreResult = useMemo(() => {
    return DailySessionManager.calculateDailyCompositeScore();
  }, [currentDailySessions, dailySessions]);

  // Sync listener: reload medications/routines/scores when updated from patient portal
  useEffect(() => {
    const unsubscribe = portalSync.subscribe((msg: PortalSyncMessage) => {
      if (msg.type === 'MEDICATION_MUTATED') {
        setMedications(getStoredMedications(patient.id));
      } else if (msg.type === 'ROUTINE_MUTATED') {
        setRoutines(getStoredRoutine(patient.id));
      } else if (msg.type === 'SESSION_COMPLETED') {
        const updated = DailySessionManager.getDailySessions();
        setCurrentDailySessions({ ...updated });
        if (msg.payload?.summary) {
          setCurrentReport(msg.payload.summary);
        }
      } else if (msg.type === 'REPORTS_MUTATED') {
        setReports(getStoredReports(patient.id));
      }
    });

    return () => unsubscribe();
  }, [patient.id]);

  // 7-day authentic performance trend generated from real patient session history & clinical baseline
  const chartData = useMemo(() => {
    return DailySessionManager.get7DayPerformanceTrend(78);
  }, [currentDailySessions]);

  // Handlers for Medications
  const handleToggleMed = (medId: string) => {
    const updated = medications.map((m) =>
      m.id === medId ? { ...m, takenToday: !m.takenToday } : m
    );
    setMedications(updated);
    saveStoredMedications(patient.id, updated);
    portalSync.broadcast('MEDICATION_MUTATED', { medId, patientId: patient.id, allMeds: updated }, 'caregiver');
  };

  const handleAddMedicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const created = addStoredMedication(patient.id, {
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || '1 tab',
      timing: newMedTiming,
      instructions: newMedInstructions.trim() || 'Take with water',
      prescribedBy: newMedDoctor.trim() || 'Primary Neurologist',
      takenToday: false,
    });

    const updatedMeds = getStoredMedications(patient.id);
    setMedications(updatedMeds);
    portalSync.broadcast('MEDICATION_MUTATED', { createdId: created.id, patientId: patient.id, allMeds: updatedMeds }, 'caregiver');

    // Reset and close
    setNewMedName('');
    setNewMedDosage('');
    setNewMedInstructions('');
    setIsAddMedModalOpen(false);
  };

  const handleDeleteMedication = (medId: string) => {
    if (window.confirm(t.deleteConfirm)) {
      deleteStoredMedication(patient.id, medId);
      const updatedMeds = getStoredMedications(patient.id);
      setMedications(updatedMeds);
      portalSync.broadcast('MEDICATION_MUTATED', { deletedId: medId, patientId: patient.id, allMeds: updatedMeds }, 'caregiver');
    }
  };

  // Handlers for Routine
  const handleToggleRoutine = (routineId: string) => {
    const updated = routines.map((r) =>
      r.id === routineId ? { ...r, completed: !r.completed } : r
    );
    setRoutines(updated);
    saveStoredRoutine(patient.id, updated);
    portalSync.broadcast('ROUTINE_MUTATED', { routineId, patientId: patient.id, allRoutines: updated }, 'caregiver');
  };

  const handleAddRoutineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineActivity.trim()) return;

    const created = addStoredRoutine(patient.id, {
      time: newRoutineTime,
      activity: newRoutineActivity.trim(),
      category: newRoutineCategory,
      completed: false,
    });

    const updatedRoutines = getStoredRoutine(patient.id);
    setRoutines(updatedRoutines);
    portalSync.broadcast('ROUTINE_MUTATED', { createdId: created.id, patientId: patient.id, allRoutines: updatedRoutines }, 'caregiver');

    // Reset and close
    setNewRoutineActivity('');
    setIsAddRoutineModalOpen(false);
  };

  const handleDeleteRoutine = (routineId: string) => {
    if (window.confirm('Delete this routine activity?')) {
      deleteStoredRoutine(patient.id, routineId);
      const updatedRoutines = getStoredRoutine(patient.id);
      setRoutines(updatedRoutines);
      portalSync.broadcast('ROUTINE_MUTATED', { deletedId: routineId, patientId: patient.id, allRoutines: updatedRoutines }, 'caregiver');
    }
  };

  // Handlers for Medical Reports
  const handleUploadReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportFile) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    addStoredReport(patient.id, {
      name: selectedReportFile.name,
      uploadDate: dateStr,
      sizeBytes: selectedReportFile.size,
    });

    setReports(getStoredReports(patient.id));
    setSelectedReportFile(null);
    portalSync.broadcast('REPORTS_MUTATED', { uploaded: true }, 'caregiver');
  };

  const handleDownloadPdfSpec = () => {
    window.open('/SmritiNER_Clinical_Formulas_and_Telemetry_Specification.pdf', '_blank');
  };

  // Count medication & routine stats
  const medsTaken = medications.filter((m) => m.takenToday).length;
  const medsTotal = medications.length;
  const routineDone = routines.filter((r) => r.completed).length;
  const routineTotal = routines.length;

  const pendingMedsCount = medications.filter((m) => !m.takenToday).length;
  const activeAlertsCount = pendingMedsCount + (compositeScore.score < 75 && !compositeScore.isBaseline ? 1 : 0);

  const scoreDiff = compositeScore.score - 78;

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      
      {/* ─── PURPLE SIDEBAR (Matches Screenshot EXACTLY) ───────────────────── */}
      <aside className="w-64 bg-[#1e1b4b] text-white flex flex-col shrink-0 select-none shadow-xl z-20">
        
        {/* Brand Header */}
        <div className="p-6 pb-5 flex items-center gap-3.5 border-b border-indigo-900/40">
          <div className="w-10 h-10 rounded-xl bg-[#7c3aed] flex items-center justify-center shadow-md shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white leading-tight">
              {t.appTitle}
            </h1>
            <p className="text-xs text-indigo-300 font-medium">
              {t.caregiverSupport}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          
          {/* 1. Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
              activeTab === 'dashboard'
                ? 'bg-[#f3f0ff] text-[#7c3aed] font-bold shadow-xs'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-[#7c3aed]' : 'text-indigo-300'}`} />
            <span>{t.dashboard}</span>
          </button>

          {/* 2. Cognitive Games */}
          <button
            onClick={() => setActiveTab('games')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
              activeTab === 'games'
                ? 'bg-[#f3f0ff] text-[#7c3aed] font-bold shadow-xs'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Brain className={`w-4 h-4 ${activeTab === 'games' ? 'text-[#7c3aed]' : 'text-indigo-300'}`} />
            <span>{t.cognitiveGames}</span>
          </button>

          {/* 3. Medications */}
          <button
            onClick={() => setActiveTab('medications')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
              activeTab === 'medications'
                ? 'bg-[#f3f0ff] text-[#7c3aed] font-bold shadow-xs'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Pill className={`w-4 h-4 ${activeTab === 'medications' ? 'text-[#7c3aed]' : 'text-indigo-300'}`} />
              <span>{t.medications}</span>
            </div>
            {medsTotal > 0 && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeTab === 'medications' ? 'bg-[#7c3aed] text-white' : 'bg-indigo-900/80 text-indigo-300'
              }`}>
                {medsTaken}/{medsTotal}
              </span>
            )}
          </button>

          {/* 4. Daily Routine */}
          <button
            onClick={() => setActiveTab('routine')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
              activeTab === 'routine'
                ? 'bg-[#f3f0ff] text-[#7c3aed] font-bold shadow-xs'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className={`w-4 h-4 ${activeTab === 'routine' ? 'text-[#7c3aed]' : 'text-indigo-300'}`} />
              <span>{t.dailyRoutine}</span>
            </div>
            {routineTotal > 0 && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeTab === 'routine' ? 'bg-[#7c3aed] text-white' : 'bg-indigo-900/80 text-indigo-300'
              }`}>
                {routineDone}/{routineTotal}
              </span>
            )}
          </button>

          {/* 5. Alerts */}
          <button
            onClick={() => setActiveTab('alerts')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
              activeTab === 'alerts'
                ? 'bg-[#f3f0ff] text-[#7c3aed] font-bold shadow-xs'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className={`w-4 h-4 ${activeTab === 'alerts' ? 'text-[#7c3aed]' : 'text-indigo-300'}`} />
              <span>{t.alerts}</span>
            </div>
            {activeAlertsCount > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* 6. Patient Profile (Active state in screenshot) */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
              activeTab === 'profile'
                ? 'bg-[#f3f0ff] text-[#7c3aed] font-bold shadow-xs'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-[#7c3aed]' : 'text-indigo-300'}`} />
            <span>{t.patientProfile}</span>
          </button>

          {/* 7. Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
              activeTab === 'settings'
                ? 'bg-[#f3f0ff] text-[#7c3aed] font-bold shadow-xs'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-[#7c3aed]' : 'text-indigo-300'}`} />
            <span>{t.settings}</span>
          </button>

        </nav>

        {/* Footer Profile (Matches Screenshot: Avatar A + Anita Joshi + Caregiver) */}
        <div className="p-4 border-t border-indigo-900/40 bg-[#17153b] flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#7c3aed] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {caretaker.name.slice(0, 1).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-xs text-white truncate">
                {caretaker.name || 'Anita Joshi'}
              </p>
              <p className="text-[11px] text-indigo-300 capitalize">
                Caregiver
              </p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title={t.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

      </aside>

      {/* ─── MAIN CONTENT AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header with Portal Switcher & Language Switcher */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-900">
              {activeTab === 'profile' && t.patientProfile}
              {activeTab === 'dashboard' && t.dashboard}
              {activeTab === 'games' && t.cognitiveGames}
              {activeTab === 'medications' && t.medications}
              {activeTab === 'routine' && t.dailyRoutine}
              {activeTab === 'alerts' && t.alerts}
              {activeTab === 'settings' && t.settings}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              Caregiver View
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* 4-Language Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(['en', 'as', 'bn', 'hi'] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    language === lang
                      ? 'bg-white text-purple-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Portal Switcher Button */}
            {onOpenPatientPortal && (
              <button
                onClick={onOpenPatientPortal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>{t.switchToPatient}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Logout / Switch User */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 text-xs font-bold transition-all cursor-pointer"
                title={t.logout}
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
                <span>{t.logout}</span>
              </button>
            )}
          </div>
        </header>

        {/* Tab Content Container */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TAB: PATIENT PROFILE (EXACT MATCH TO USER SCREENSHOT)          */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Main Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 space-y-8">
                  
                  {/* Top Header: Avatar circle with 'M' + Name + ID */}
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-[#ede9fe] text-[#7c3aed] flex items-center justify-center text-2xl font-black shrink-0">
                      M
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Meera Joshi
                      </h2>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {t.patientId}: 1
                      </p>
                    </div>
                  </div>

                  {/* 6 Attribute Cards Grid (2 rows x 3 cols on desktop) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* 1. Full Name */}
                    <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-1">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        {t.fullName}
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        Meera Joshi
                      </p>
                    </div>

                    {/* 2. Age */}
                    <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-1">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        {t.age}
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        72
                      </p>
                    </div>

                    {/* 3. Gender */}
                    <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-1">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        {t.gender}
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {t.female}
                      </p>
                    </div>

                    {/* 4. Caregiver */}
                    <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-1">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        {t.caregiver}
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        Anita Joshi
                      </p>
                    </div>

                    {/* 5. Phone */}
                    <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-1">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        {t.phone}
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        9876543210
                      </p>
                    </div>

                    {/* 6. Patient ID */}
                    <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-1">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        {t.patientId}
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        1
                      </p>
                    </div>

                  </div>

                  {/* Medical Reports Section */}
                  <div className="pt-2 space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {t.medicalReports}
                      </h3>
                    </div>

                    {/* Upload Monthly Report Form */}
                    <form onSubmit={handleUploadReport} className="space-y-3">
                      <label className="block text-xs font-semibold text-slate-600">
                        {t.uploadMonthlyReport}
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setSelectedReportFile(e.target.files?.[0] || null)}
                          className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                        />
                        <button
                          type="submit"
                          disabled={!selectedReportFile}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
                            selectedReportFile
                              ? 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white cursor-pointer'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{t.uploadReport}</span>
                        </button>
                      </div>
                    </form>

                    {/* Previous Uploaded Reports */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {t.previousReports}
                      </h4>

                      <div className="space-y-2">
                        {reports.map((report) => (
                          <div
                            key={report.id}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {report.name} (Uploaded: {report.uploadDate})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleDownloadPdfSpec}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f3f0ff] hover:bg-[#ede9fe] text-[#7c3aed] text-xs font-bold transition-colors cursor-pointer shrink-0 ml-3"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{t.download}</span>
                            </button>
                          </div>
                        ))}
                      </div>

                    </div>

                  </div>

                </div>

                {/* Additional Clinical Staging Box */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {t.dementiaStaging}
                      </h4>
                      <p className="text-base font-extrabold text-slate-900 mt-0.5">
                        Mild Cognitive Impairment (MCI) • Washington Univ OASIS-2 Calibrated
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      Stable Trend
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 font-semibold">{t.mocaRange}:</span>
                      <p className="text-slate-800 font-bold text-sm mt-0.5">22 - 25 / 30</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 font-semibold">{t.emergencyContact}:</span>
                      <p className="text-slate-800 font-bold text-sm mt-0.5">+91 98765 43210 (Anita Joshi)</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <span className="font-bold uppercase tracking-wider text-[11px] text-amber-800">
                      {t.clinicalNotes}
                    </span>
                    <p className="leading-relaxed">
                      Meera Joshi responds with high alertness to Northeast cultural memory stimuli (Assam tea garden patterns, traditional folk memory cues). Keep morning workout timing consistent.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TAB: DASHBOARD (MOVED FROM PREVIOUS PORTAL WITH ALL ANALYTICS) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Metric 1: Cognitive Score */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {t.cognitiveScore}
                      </span>
                      <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">
                        {compositeScore.score}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        / 100
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff} {t.scoreVsBaseline}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      {compositeScore.gamesPlayedCount > 0
                        ? `✓ ${compositeScore.gamesPlayedCount} game${compositeScore.gamesPlayedCount > 1 ? 's' : ''} combined (${t.unplayedExcluded})`
                        : t.unplayedExcluded}
                    </p>
                  </div>

                  {/* Metric 2: Medications */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {t.dailyAdherence}
                      </span>
                      <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                        <Pill className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">
                        {medsTaken}/{medsTotal}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        Taken Today
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${medsTotal ? (medsTaken / medsTotal) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 pt-1">
                      {medsTotal - medsTaken === 0 ? 'All doses taken on schedule' : `${medsTotal - medsTaken} dose pending`}
                    </p>
                  </div>

                  {/* Metric 3: Daily Routine */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {t.routineAdherence}
                      </span>
                      <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">
                        {routineDone}/{routineTotal}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        Completed
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${routineTotal ? (routineDone / routineTotal) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 pt-1">
                      Circadian sync: Active
                    </p>
                  </div>

                  {/* Metric 4: Active Alerts */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {t.activeAlertsCount}
                      </span>
                      <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Bell className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-amber-600">
                        {activeAlertsCount}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        Requiring Attention
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-700">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Evening Memantine pending</span>
                    </div>
                    <p className="text-[10px] text-slate-400 pt-1">
                      Last alert: 2h ago
                    </p>
                  </div>

                </div>

                {/* 7-Day Cognitive Performance Area Chart */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {t.sevenDayTrend}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Calculated strictly from games actually recommended and completed on each day.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownloadPdfSpec}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{t.downloadPdf}</span>
                      </button>

                      <button
                        onClick={() => setIsClinicalReportModalOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t.viewFullReport}</span>
                      </button>
                    </div>
                  </div>

                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="cogScoreGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                        <YAxis domain={[60, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            const score = payload[0].value;
                            const count = payload[0].payload?.gamesPlayedCount ?? 0;
                            return (
                              <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                                <p className="font-bold">{label}</p>
                                <p className="text-purple-300 font-extrabold text-sm">Score: {score}/100</p>
                                <p className="text-emerald-400 text-[11px]">
                                  {count > 0 ? `✓ ${count} games combined` : 'Baseline 78'}
                                </p>
                              </div>
                            );
                          }}
                        />
                        <ReferenceLine y={78} stroke="#cbd5e1" strokeDasharray="3 3" label={{ value: 'Baseline (78)', fill: '#94a3b8', fontSize: 10 }} />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="#7c3aed"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#cogScoreGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Telemetry Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t.recentSessions}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {compositeScore.domainBreakdown.map((domainRec) => (
                      <div key={domainRec.domain} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 capitalize">{domainRec.label}</span>
                          <span className="text-xs font-extrabold text-purple-700">
                            {domainRec.score != null ? `${domainRec.score}/100` : '—'}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${domainRec.score ?? 0}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {domainRec.gamesPlayed.length > 0
                            ? `${domainRec.gamesPlayed.length} exercise active`
                            : 'No exercise today'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TAB: COGNITIVE GAMES & BRAIN ANALYTICS                         */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'games' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Subtab Switcher: Brain Analytics (Moved here) & Prescription */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <button
                    onClick={() => setGamesSubTab('BRAIN_ANALYTICS')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      gamesSubTab === 'BRAIN_ANALYTICS'
                        ? 'bg-purple-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🧠 {t.brainAnalytics}
                  </button>

                  <button
                    onClick={() => setGamesSubTab('PRESCRIBED')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      gamesSubTab === 'PRESCRIBED'
                        ? 'bg-purple-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    📋 Prescribed Games & Rx Management
                  </button>
                </div>

                {gamesSubTab === 'BRAIN_ANALYTICS' && (
                  <div className="space-y-6">
                    <MyBrainAnalytics
                      language={language}
                      patient={patient}
                      lastSessionReport={currentReport}
                      dailyComposite={compositeScore}
                      dailySessions={currentDailySessions}
                    />
                  </div>
                )}

                {gamesSubTab === 'PRESCRIBED' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          Prescribed Therapeutic Regimen
                        </h3>
                        <p className="text-xs text-slate-500">
                          Configure which cognitive games are assigned to {patient.name}'s daily circuit.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsPrescriptionModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Edit Prescription</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {GAME_CATALOG.map((game) => {
                        const isPrescribed = prescription.prescribedGameIds.includes(game.id);
                        return (
                          <div
                            key={game.id}
                            className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                              isPrescribed
                                ? 'bg-purple-50/40 border-purple-200'
                                : 'bg-slate-50 border-slate-200 opacity-60'
                            }`}
                          >
                            <div className="space-y-1">
                              <p className="font-bold text-sm text-slate-900">
                                {game.title[language]}
                              </p>
                              <p className="text-xs text-slate-500">
                                {game.domainLabel[language]} • {game.estimatedMinutes} mins
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {game.clinicalStandard}
                              </p>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              isPrescribed ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {isPrescribed ? 'Prescribed' : 'Optional'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TAB: MEDICATIONS MANAGEMENT                                    */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'medications' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {t.medications}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Manage clinical prescriptions. Changes reflect immediately on Patient Portal.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddMedModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.addMedication}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleToggleMed(med.id)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 ${
                            med.takenToday
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {med.takenToday ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{med.name}</h4>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                              {med.dosage}
                            </span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">
                              {med.timing}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{med.instructions}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Prescribed by: {med.prescribedBy}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => handleToggleMed(med.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            med.takenToday
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {med.takenToday ? t.taken : t.pending}
                        </button>
                        <button
                          onClick={() => handleDeleteMedication(med.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title={t.deleteMedication}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {medications.length === 0 && (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                      {t.noMedications}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TAB: DAILY ROUTINE MANAGEMENT                                  */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'routine' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {t.dailyRoutine}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Schedule daily circadian activities. Changes reflect immediately on Patient Portal.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddRoutineModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.addRoutine}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {routines.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleToggleRoutine(item.id)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 ${
                            item.completed
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {item.completed ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                              {item.time}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">
                              {item.category}
                            </span>
                          </div>
                          <p className="font-bold text-sm text-slate-900 mt-1">{item.activity}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => handleToggleRoutine(item.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            item.completed
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {item.completed ? t.completed : t.pending}
                        </button>
                        <button
                          onClick={() => handleDeleteRoutine(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title={t.deleteRoutine}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {routines.length === 0 && (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                      {t.noRoutines}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TAB: ALERTS CENTER                                             */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'alerts' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {t.systemAlerts}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Clinical telemetry alerts and daily observance notifications.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Evening Medication Pending</span>
                      </span>
                      <span className="text-[11px] font-semibold text-amber-700">2 hours ago</span>
                    </div>
                    <p className="text-xs text-amber-900/90 leading-relaxed">
                      Memantine HCl (10 mg) scheduled for 8:00 PM has not yet been marked as taken by patient.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-blue-600" />
                        <span>Observed Afternoon Deliberation Trend</span>
                      </span>
                      <span className="text-[11px] font-semibold text-blue-700">Earlier today</span>
                    </div>
                    <p className="text-xs text-blue-900/90 leading-relaxed">
                      {patient.name}'s deliberation was slightly slower during Word Memory. Adaptive AI lowered task difficulty dynamically to maintain engagement.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Workout Adherence High</span>
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700">Yesterday</span>
                    </div>
                    <p className="text-xs text-emerald-900/90 leading-relaxed">
                      Patient completed daily exercises with 100% compliance.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TAB: SETTINGS & REGIONALIZATION                                */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'settings' && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {t.platformSettings}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t.platformSettingsDesc}
                  </p>
                </div>

                {/* Language selection */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {t.selectLanguage}
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { code: 'as', label: 'অসমীয়া (Assamese)' },
                      { code: 'bn', label: 'বাংলা (Bengali)' },
                      { code: 'hi', label: 'हिन्दी (Hindi)' },
                      { code: 'en', label: 'English' },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => onLanguageChange(lang.code as SupportedLanguage)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          language === lang.code
                            ? 'bg-purple-900 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sync status info */}
                <div className="p-5 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                    <ShieldCheck className="w-4 h-4 text-purple-700" />
                    <span>{t.syncStatus}</span>
                  </div>
                  <p className="text-xs text-purple-800">
                    {t.realtimeSyncActive}
                  </p>
                  <p className="text-[11px] text-purple-600">
                    Caregiver Portal Port: <strong>5174</strong> • Patient Portal Port: <strong>5173</strong>
                  </p>
                </div>

              </div>
            )}

          </div>
        </main>
      </div>

      {/* ─── ADD MEDICATION MODAL ─────────────────────────────────────────── */}
      {isAddMedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">{t.addMedication}</h3>
              <button
                onClick={() => setIsAddMedModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedicationSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.medicineName}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Donepezil Hydrochloride"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.dosage}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 mg"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.timing}</label>
                  <select
                    value={newMedTiming}
                    onChange={(e) => setNewMedTiming(e.target.value as MedicationTiming)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-purple-600 bg-white"
                  >
                    <option value="morning">{t.morning}</option>
                    <option value="afternoon">{t.afternoon}</option>
                    <option value="evening">{t.evening}</option>
                    <option value="bedtime">{t.bedtime}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.instructions}</label>
                <input
                  type="text"
                  placeholder="e.g. Take 1 tablet after dinner"
                  value={newMedInstructions}
                  onChange={(e) => setNewMedInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.prescribedBy}</label>
                <input
                  type="text"
                  value={newMedDoctor}
                  onChange={(e) => setNewMedDoctor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMedModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold cursor-pointer shadow-xs"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ADD ROUTINE MODAL ────────────────────────────────────────────── */}
      {isAddRoutineModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">{t.addRoutine}</h3>
              <button
                onClick={() => setIsAddRoutineModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoutineSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.activityName}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon Tea & Assam Folk Music"
                  value={newRoutineActivity}
                  onChange={(e) => setNewRoutineActivity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.time}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 04:30 PM"
                    value={newRoutineTime}
                    onChange={(e) => setNewRoutineTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.category}</label>
                  <select
                    value={newRoutineCategory}
                    onChange={(e) => setNewRoutineCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-purple-600 bg-white"
                  >
                    <option value="exercise">{t.exercise}</option>
                    <option value="cognitive">{t.cognitiveCategory}</option>
                    <option value="meal">{t.meal}</option>
                    <option value="rest">{t.rest}</option>
                    <option value="social">{t.social}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRoutineModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold cursor-pointer shadow-xs"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      <PrescriptionSetupModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        currentPrescription={prescription}
        onSave={(newRx) => {
          onUpdatePrescription(newRx);
          portalSync.broadcast('PRESCRIPTION_MUTATED', newRx, 'caregiver');
          setIsPrescriptionModalOpen(false);
        }}
        language={language}
      />

      {/* Clinical Session Report Modal */}
      <ClinicalSessionReportModal
        isOpen={isClinicalReportModalOpen}
        onClose={() => setIsClinicalReportModalOpen(false)}
        report={currentReport}
        patient={patient}
        dailyComposite={compositeScore}
        dailySessions={currentDailySessions}
      />

    </div>
  );
};
