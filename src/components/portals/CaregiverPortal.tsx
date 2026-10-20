import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ExternalLink,
  Sparkles,
  Sliders,
  X,
  ShieldCheck,
  LogOut,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Volume2,
  VolumeX,
  PhoneCall,
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
  getStoredSOSAlerts,
  saveStoredSOSAlerts,
  addStoredSOSAlert,
  resolveStoredSOSAlert,
  deleteStoredSOSAlert,
  type CaregiverSOSAlertItem,
} from '../../utils/caregiverStorage';
import {
  getStoredGeneratedReports,
  downloadReportDocument,
  type GeneratedReportDocument,
  REPORTS_PER_SLIDE,
} from '../../utils/reportsStorage';
import {
  DailySessionManager,
  type DailyCompositeScoreResult,
} from '../../utils/dailySessionManager';
import { emergencyAlarm } from '../../utils/emergencyAudio';
import { MyBrainAnalytics } from '../dashboard/MyBrainAnalytics';
import { PrescriptionSetupModal } from '../prescription/PrescriptionSetupModal';
import { ClinicalSessionReportModal } from '../dashboard/ClinicalSessionReportModal';
import { CloudAIConfigModal } from '../modals/CloudAIConfigModal';
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
  const [activeTab, setActiveTab] = useState<string>('dashboard');

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
  const [isCloudAIConfigOpen, setIsCloudAIConfigOpen] = useState(false);

  // Generated Reports Vault State (Capacity up to 50 reports across 5 slides, 10 per slide)
  const [reportsList, setReportsList] = useState<GeneratedReportDocument[]>(() =>
    getStoredGeneratedReports(patient.id)
  );
  const [reportSlideIndex, setReportSlideIndex] = useState<number>(0);
  const [reportFilter, setReportFilter] = useState<'ALL' | 'FULL_SESSION' | 'GAME_SESSION'>('ALL');
  const [selectedViewReport, setSelectedViewReport] = useState<GeneratedReportDocument | null>(null);

  // Synchronize reports on storage custom event
  useEffect(() => {
    const handleReportsUpdate = () => {
      setReportsList(getStoredGeneratedReports(patient.id));
    };
    window.addEventListener('smriti_generated_reports_updated', handleReportsUpdate);
    return () => window.removeEventListener('smriti_generated_reports_updated', handleReportsUpdate);
  }, [patient.id]);

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
  const [sosAlerts, setSosAlerts] = useState<CaregiverSOSAlertItem[]>(() => getStoredSOSAlerts(patient.id));
  const [activeSOSAlert, setActiveSOSAlert] = useState<CaregiverSOSAlertItem | null>(() => {
    const list = getStoredSOSAlerts(patient.id);
    return list.find((a) => a.status === 'active') || null;
  });
  const [isAlarmActive, setIsAlarmActive] = useState<boolean>(false);

  useEffect(() => {
    const unsub = emergencyAlarm.subscribe((active) => {
      setIsAlarmActive(active);
    });
    const onAlertsUpdated = () => {
      setSosAlerts(getStoredSOSAlerts(patient.id));
    };
    window.addEventListener('smriti_sos_alerts_updated', onAlertsUpdated);
    return () => {
      unsub();
      window.removeEventListener('smriti_sos_alerts_updated', onAlertsUpdated);
      emergencyAlarm.stopEmergencyAlarm();
    };
  }, [patient.id]);

  const handleAcknowledgeSOSAlert = (alertId?: string) => {
    emergencyAlarm.stopEmergencyAlarm();
    const targetId = alertId || activeSOSAlert?.id;
    if (targetId) {
      resolveStoredSOSAlert(patient.id, targetId);
    } else {
      const activeList = getStoredSOSAlerts(patient.id).filter((a) => a.status === 'active');
      activeList.forEach((a) => resolveStoredSOSAlert(patient.id, a.id));
    }
    const updated = getStoredSOSAlerts(patient.id);
    setSosAlerts(updated);
    const nextActive = updated.find((a) => a.status === 'active');
    setActiveSOSAlert(nextActive || null);
  };
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Minimised / Expanded Sidebar state with persistence
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('smriti_caregiver_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('smriti_caregiver_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Close header dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

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

  // Filtered reports calculation based on active filter
  const filteredReports = useMemo(() => {
    if (reportFilter === 'FULL_SESSION') {
      return reportsList.filter(r => r.type === 'FULL_SESSION');
    }
    if (reportFilter === 'GAME_SESSION') {
      return reportsList.filter(r => r.type === 'GAME_SESSION');
    }
    return reportsList;
  }, [reportsList, reportFilter]);

  // Reports belonging strictly to the currently selected slide (10 reports per slide shelf)
  const currentSlideReports = useMemo(() => {
    const startIdx = reportSlideIndex * REPORTS_PER_SLIDE;
    return filteredReports.slice(startIdx, startIdx + REPORTS_PER_SLIDE);
  }, [filteredReports, reportSlideIndex]);

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
      } else if (msg.type === 'PATIENT_SOS_ALERT') {
        const stored = addStoredSOSAlert(patient.id, {
          id: msg.payload?.id,
          patientId: msg.payload?.patientId || patient.id,
          patientName: msg.payload?.patientName || patient.name,
          caretakerName: msg.payload?.caretakerName || caretaker.name,
          timestamp: msg.payload?.timestamp || Date.now(),
          timeFormatted: msg.payload?.timeFormatted || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          emergencyContact: msg.payload?.emergencyContact || patient.emergencyContact || '+91 98765 43210',
          triggerType: msg.payload?.triggerType || 'MANUAL_ALERT',
          triggerLabel: msg.payload?.triggerLabel || 'Urgent Distress Alert',
          status: 'active',
        });
        setActiveSOSAlert(stored);
        setSosAlerts(getStoredSOSAlerts(patient.id));
        emergencyAlarm.startEmergencyAlarm();
      } else if (msg.type === 'SOS_ALERTS_MUTATED') {
        const updated = getStoredSOSAlerts(patient.id);
        setSosAlerts(updated);
        const nextActive = updated.find((a) => a.status === 'active');
        setActiveSOSAlert(nextActive || null);
      }
    });

    return () => {
      unsubscribe();
      emergencyAlarm.stopEmergencyAlarm();
    };
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
  const activeSOSAlerts = sosAlerts.filter((a) => a.status === 'active');
  const resolvedSOSAlerts = sosAlerts.filter((a) => a.status === 'resolved');
  const activeAlertsCount = pendingMedsCount + activeSOSAlerts.length + (compositeScore.score < 75 && !compositeScore.isBaseline ? 1 : 0);


  return (
    <div className="flex h-screen bg-[#FAF8F5] text-[#1F2421] font-sans overflow-hidden">
      
      {/* ─── UNIFIED CLINICAL SIDEBAR (Keen Design System - Minimisable with 3-Line Orientation Toggle) ─── */}
      <aside
        className={`${
          isSidebarCollapsed ? 'w-20' : 'w-68'
        } bg-[#FAF8F5] text-[#1F2421] flex flex-col shrink-0 select-none border-r border-[#E5DFD5] shadow-xs z-20 transition-all duration-300 ease-in-out`}
      >
        
        {/* Brand Header with 3-Line Toggle */}
        <div className={`border-b border-[#E5DFD5] transition-all duration-300 ${
          isSidebarCollapsed 
            ? 'p-3 flex flex-col items-center justify-center gap-3' 
            : 'p-5 flex items-center justify-between gap-2.5'
        }`}>
          <div className={`flex items-center min-w-0 ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div
              className="w-10 h-10 rounded-2xl bg-[#EDF5F0] border border-[#CCE2D4] flex items-center justify-center shadow-xs shrink-0 text-[#28573E]"
              title="Smriti Setu"
            >
              <Brain className="w-5 h-5 text-[#28573E]" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 overflow-hidden">
                <h1 className="font-['Sora'] font-extrabold text-base tracking-tight text-[#1F2421] leading-tight flex items-center gap-1 truncate">
                  <span>Smriti</span><span className="text-[#C05634]">Setu</span>
                </h1>
                <p className="text-[11px] text-[#28573E] font-bold mt-0.5 truncate">
                  {t.caregiverSupport}
                </p>
              </div>
            )}
          </div>

          {/* 3 Lines Toggle Button: changes orientation between horizontal (open) and vertical (minimised) */}
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-xl text-[#636B65] hover:text-[#1F2421] hover:bg-[#F4F0EA] border border-transparent hover:border-[#E5DFD5] transition-all cursor-pointer shrink-0 flex items-center justify-center ${
              isSidebarCollapsed ? 'bg-white shadow-2xs border-[#E5DFD5]' : ''
            }`}
            title={isSidebarCollapsed 
              ? (language === 'hi' ? 'साइडबार विस्तृत करें' : 'Expand sidebar') 
              : (language === 'hi' ? 'साइडबार न्यूनतम करें' : 'Minimise sidebar')}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Minimise sidebar'}
          >
            <div
              className={`w-5 h-5 flex items-center justify-center transition-transform duration-300 ease-in-out ${
                isSidebarCollapsed ? 'rotate-90' : 'rotate-0'
              }`}
            >
              <div className="flex flex-col justify-between w-4.5 h-3.5">
                <span className={`h-0.5 rounded-full transition-all duration-300 ${isSidebarCollapsed ? 'w-4.5 bg-[#C05634]' : 'w-4.5 bg-[#1F2421]'}`} />
                <span className={`h-0.5 rounded-full transition-all duration-300 ${isSidebarCollapsed ? 'w-3.5 bg-[#28573E]' : 'w-3.5 bg-[#1F2421]'}`} />
                <span className={`h-0.5 rounded-full transition-all duration-300 ${isSidebarCollapsed ? 'w-4.5 bg-[#C05634]' : 'w-4.5 bg-[#1F2421]'}`} />
              </div>
            </div>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className={`flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden ${isSidebarCollapsed ? 'px-2 py-4' : 'px-3.5 py-4'}`}>
          
          {/* 1. Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            title={isSidebarCollapsed ? t.dashboard : undefined}
            className={`w-full flex items-center rounded-2xl text-sm transition-all duration-150 cursor-pointer text-left font-['Sora'] relative ${
              isSidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3 gap-3'
            } ${
              activeTab === 'dashboard'
                ? 'bg-[#28573E] text-white font-bold shadow-xs'
                : 'text-[#636B65] hover:text-[#1F2421] hover:bg-[#F4F0EA] font-medium'
            }`}
          >
            <Activity className={`w-4 h-4 shrink-0 ${activeTab === 'dashboard' ? 'text-white' : 'text-[#636B65]'}`} />
            {!isSidebarCollapsed && <span className="truncate">{t.dashboard}</span>}
          </button>

          {/* 2. Cognitive Games */}
          <button
            onClick={() => setActiveTab('games')}
            title={isSidebarCollapsed ? t.cognitiveGames : undefined}
            className={`w-full flex items-center rounded-2xl text-sm transition-all duration-150 cursor-pointer text-left font-['Sora'] relative ${
              isSidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3 gap-3'
            } ${
              activeTab === 'games'
                ? 'bg-[#28573E] text-white font-bold shadow-xs'
                : 'text-[#636B65] hover:text-[#1F2421] hover:bg-[#F4F0EA] font-medium'
            }`}
          >
            <Brain className={`w-4 h-4 shrink-0 ${activeTab === 'games' ? 'text-white' : 'text-[#636B65]'}`} />
            {!isSidebarCollapsed && <span className="truncate">{t.cognitiveGames}</span>}
          </button>

          {/* 3. Reports Vault */}
          <button
            onClick={() => setActiveTab('reports')}
            title={isSidebarCollapsed ? `${t.reports || (language === 'hi' ? 'रिपोर्ट्स' : 'Reports')} (${reportsList.length})` : undefined}
            className={`w-full flex items-center rounded-2xl text-sm transition-all duration-150 cursor-pointer text-left font-['Sora'] relative ${
              isSidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3 justify-between'
            } ${
              activeTab === 'reports'
                ? 'bg-[#28573E] text-white font-bold shadow-xs'
                : 'text-[#636B65] hover:text-[#1F2421] hover:bg-[#F4F0EA] font-medium'
            }`}
          >
            <div className={`flex items-center min-w-0 ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              <FileText className={`w-4 h-4 shrink-0 ${activeTab === 'reports' ? 'text-white' : 'text-[#636B65]'}`} />
              {!isSidebarCollapsed && <span className="truncate">{t.reports || (language === 'hi' ? 'रिपोर्ट्स' : 'Reports')}</span>}
            </div>
            {reportsList.length > 0 && (
              isSidebarCollapsed ? (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#28573E] ring-2 ring-[#FAF8F5]" />
              ) : (
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  activeTab === 'reports'
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-[#EDF5F0] text-[#28573E] border-[#CCE2D4]'
                }`}>
                  {reportsList.length}
                </span>
              )
            )}
          </button>

          {/* 4. Medications */}
          <button
            onClick={() => setActiveTab('medications')}
            title={isSidebarCollapsed ? `${t.medications} (${medsTaken}/${medsTotal})` : undefined}
            className={`w-full flex items-center rounded-2xl text-sm transition-all duration-150 cursor-pointer text-left font-['Sora'] relative ${
              isSidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3 justify-between'
            } ${
              activeTab === 'medications'
                ? 'bg-[#28573E] text-white font-bold shadow-xs'
                : 'text-[#636B65] hover:text-[#1F2421] hover:bg-[#F4F0EA] font-medium'
            }`}
          >
            <div className={`flex items-center min-w-0 ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              <Pill className={`w-4 h-4 shrink-0 ${activeTab === 'medications' ? 'text-white' : 'text-[#636B65]'}`} />
              {!isSidebarCollapsed && <span className="truncate">{t.medications}</span>}
            </div>
            {medsTotal > 0 && (
              isSidebarCollapsed ? (
                <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-[#FAF8F5] ${
                  medsTaken === medsTotal ? 'bg-[#28573E]' : 'bg-[#C05634]'
                }`} />
              ) : (
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  activeTab === 'medications' 
                    ? 'bg-white/20 text-white border-white/30' 
                    : 'bg-[#F4F0EA] text-[#38403A] border-[#E5DFD5]'
                }`}>
                  {medsTaken}/{medsTotal}
                </span>
              )
            )}
          </button>

          {/* 5. Daily Routine */}
          <button
            onClick={() => setActiveTab('routine')}
            title={isSidebarCollapsed ? `${t.dailyRoutine} (${routineDone}/${routineTotal})` : undefined}
            className={`w-full flex items-center rounded-2xl text-sm transition-all duration-150 cursor-pointer text-left font-['Sora'] relative ${
              isSidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3 justify-between'
            } ${
              activeTab === 'routine'
                ? 'bg-[#28573E] text-white font-bold shadow-xs'
                : 'text-[#636B65] hover:text-[#1F2421] hover:bg-[#F4F0EA] font-medium'
            }`}
          >
            <div className={`flex items-center min-w-0 ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              <Calendar className={`w-4 h-4 shrink-0 ${activeTab === 'routine' ? 'text-white' : 'text-[#636B65]'}`} />
              {!isSidebarCollapsed && <span className="truncate">{t.dailyRoutine}</span>}
            </div>
            {routineTotal > 0 && (
              isSidebarCollapsed ? (
                <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-[#FAF8F5] ${
                  routineDone === routineTotal ? 'bg-[#28573E]' : 'bg-[#C05634]'
                }`} />
              ) : (
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  activeTab === 'routine' 
                    ? 'bg-white/20 text-white border-white/30' 
                    : 'bg-[#F4F0EA] text-[#38403A] border-[#E5DFD5]'
                }`}>
                  {routineDone}/{routineTotal}
                </span>
              )
            )}
          </button>

          {/* 6. Alerts */}
          <button
            onClick={() => setActiveTab('alerts')}
            title={isSidebarCollapsed ? `${t.alerts} (${activeAlertsCount})` : undefined}
            className={`w-full flex items-center rounded-2xl text-sm transition-all duration-150 cursor-pointer text-left font-['Sora'] relative ${
              isSidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3 justify-between'
            } ${
              activeTab === 'alerts'
                ? 'bg-[#28573E] text-white font-bold shadow-xs'
                : 'text-[#636B65] hover:text-[#1F2421] hover:bg-[#F4F0EA] font-medium'
            }`}
          >
            <div className={`flex items-center min-w-0 ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              <Bell className={`w-4 h-4 shrink-0 ${activeTab === 'alerts' ? 'text-white' : 'text-[#636B65]'}`} />
              {!isSidebarCollapsed && <span className="truncate">{t.alerts}</span>}
            </div>
            {activeAlertsCount > 0 && (
              isSidebarCollapsed ? (
                <span className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#FAF8F5] ${
                  activeSOSAlerts.length > 0 ? 'bg-red-600 animate-ping' : 'bg-[#C05634]'
                }`} />
              ) : (
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  activeSOSAlerts.length > 0
                    ? 'bg-red-600 text-white font-black animate-pulse shadow-xs'
                    : activeTab === 'alerts'
                    ? 'bg-white/25 text-white'
                    : 'bg-[#FDF1EB] text-[#C05634] border border-[#F5D3C4]'
                }`}>
                  {activeSOSAlerts.length > 0 && <AlertTriangle className="w-3 h-3 text-white" />}
                  <span>{activeAlertsCount}</span>
                </span>
              )
            )}
          </button>

          {/* 7. Patient Profile */}
          <button
            onClick={() => setActiveTab('profile')}
            title={isSidebarCollapsed ? t.patientProfile : undefined}
            className={`w-full flex items-center rounded-2xl text-sm transition-all duration-150 cursor-pointer text-left font-['Sora'] relative ${
              isSidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3 gap-3'
            } ${
              activeTab === 'profile'
                ? 'bg-[#28573E] text-white font-bold shadow-xs'
                : 'text-[#636B65] hover:text-[#1F2421] hover:bg-[#F4F0EA] font-medium'
            }`}
          >
            <User className={`w-4 h-4 shrink-0 ${activeTab === 'profile' ? 'text-white' : 'text-[#636B65]'}`} />
            {!isSidebarCollapsed && <span className="truncate">{t.patientProfile}</span>}
          </button>

        </nav>

        {/* Footer Profile */}
        <div className={`border-t border-[#E5DFD5] bg-[#F4F0EA]/60 transition-all ${
          isSidebarCollapsed ? 'p-2.5 flex flex-col items-center gap-2' : 'p-4 flex items-center justify-between gap-2.5'
        }`}>
          <div className={`flex items-center min-w-0 ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`} title={caretaker.name}>
            <div className="w-10 h-10 rounded-2xl bg-[#EDF5F0] border border-[#CCE2D4] flex items-center justify-center text-[#28573E] font-['Sora'] font-bold text-sm shrink-0">
              {caretaker.name.slice(0, 1).toUpperCase() || 'A'}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <p className="font-['Sora'] font-bold text-sm text-[#1F2421] truncate">
                  {caretaker.name || 'Anita Joshi'}
                </p>
                <p className="text-xs text-[#636B65] capitalize font-medium truncate">
                  {language === 'hi' ? 'प्राथमिक देखभालकर्ता' : 'Primary Caregiver'}
                </p>
              </div>
            )}
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-[#636B65] hover:text-[#C05634] hover:bg-[#FDF1EB] transition-colors cursor-pointer shrink-0"
              title={t.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

      </aside>

      {/* ─── MAIN CONTENT AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Realtime Urgent SOS Patient Distress Alert Banner with Loud Siren Controller */}
        {activeSOSAlert && (
          <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white px-6 py-4.5 border-b-4 border-red-900 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-2xl z-40">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="relative shrink-0">
                <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-colors ${
                  isAlarmActive ? 'bg-white text-red-700 animate-bounce' : 'bg-white/20 text-white'
                }`}>
                  <AlertTriangle className="w-7 h-7" />
                </div>
                {isAlarmActive && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-['Sora'] text-xs font-black tracking-wider uppercase">
                    {isAlarmActive 
                      ? (language === 'hi' ? '🚨 आपातकालीन अलार्म बज रहा है' : '🚨 EMERGENCY ALARM SOUNDING')
                      : (language === 'hi' ? 'आपातकालीन अलर्ट' : 'EMERGENCY DISTRESS ALERT')}
                  </span>
                  {activeSOSAlert.triggerLabel && (
                    <span className="px-2.5 py-0.5 rounded-full bg-black/25 text-amber-200 font-['Sora'] text-xs font-bold">
                      {activeSOSAlert.triggerLabel}
                    </span>
                  )}
                </div>

                <p className="font-['Sora'] font-black text-lg sm:text-xl leading-tight mt-1 text-white">
                  {language === 'hi' 
                    ? `${activeSOSAlert.patientName} ने आपातकालीन सहायता का अनुरोध किया!` 
                    : `${activeSOSAlert.patientName} triggered an Emergency Distress Alert!`}
                </p>

                <p className="text-xs text-red-100 font-semibold mt-1 flex items-center gap-3 flex-wrap">
                  <span>{language === 'hi' ? 'समय:' : 'Time:'} {activeSOSAlert.timeFormatted || 'Just now'}</span>
                  <span>•</span>
                  <span>{language === 'hi' ? 'संपर्क नंबर:' : 'Contact:'} {activeSOSAlert.emergencyContact || 'N/A'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap">
              {/* Mute/Sound Siren Toggle */}
              <button
                onClick={() => {
                  if (isAlarmActive) {
                    emergencyAlarm.stopEmergencyAlarm();
                  } else {
                    emergencyAlarm.startEmergencyAlarm();
                  }
                }}
                className={`px-4 py-2.5 rounded-xl font-['Sora'] font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                  isAlarmActive 
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black' 
                    : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                }`}
                title={isAlarmActive ? (language === 'hi' ? 'अलार्म म्यूट करें' : 'Mute Siren') : (language === 'hi' ? 'अलार्म चालू करें' : 'Play Siren')}
              >
                {isAlarmActive ? (
                  <>
                    <VolumeX className="w-4 h-4 text-slate-950" />
                    <span>{language === 'hi' ? 'अलार्म म्यूट करें' : 'Mute Siren'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-white" />
                    <span>{language === 'hi' ? 'अलार्म बजाएं' : 'Sound Alarm'}</span>
                  </>
                )}
              </button>

              {/* Direct Call to Patient Phone */}
              {activeSOSAlert.emergencyContact && (
                <a
                  href={`tel:${activeSOSAlert.emergencyContact.replace(/\s+/g, '')}`}
                  onClick={() => emergencyAlarm.stopEmergencyAlarm()}
                  className="px-4.5 py-2.5 rounded-xl bg-white text-red-700 font-['Sora'] font-black text-xs sm:text-sm hover:bg-red-50 transition-all shadow-md flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-red-700" />
                  <span>{language === 'hi' ? 'रोगी को कॉल करें' : 'Call Patient Now'}</span>
                </a>
              )}

              {/* Acknowledge & Dismiss */}
              <button
                onClick={() => handleAcknowledgeSOSAlert(activeSOSAlert.id)}
                className="px-4.5 py-2.5 rounded-xl bg-red-950 hover:bg-black text-white font-['Sora'] font-bold text-xs sm:text-sm transition-all cursor-pointer border border-red-800/80 shadow-sm"
              >
                {language === 'hi' ? 'स्वीकार करें' : 'Acknowledge'}
              </button>
            </div>
          </div>
        )}

        {/* Top Header with Portal Switcher & Language Switcher */}
        <header className="h-18 bg-white border-b border-[#E5DFD5] flex items-center justify-between px-6 sm:px-8 shrink-0 shadow-xs">
          <div className="flex items-center gap-3.5">
            {isSidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl text-[#636B65] hover:text-[#1F2421] hover:bg-[#F4F0EA] border border-[#E5DFD5] transition-all cursor-pointer flex items-center justify-center shrink-0 mr-1"
                title={language === 'hi' ? 'साइडबार विस्तृत करें' : 'Expand sidebar'}
                aria-label="Expand sidebar"
              >
                <div className="w-5 h-5 flex items-center justify-center transition-transform duration-300 ease-in-out rotate-90">
                  <div className="flex flex-col justify-between w-4.5 h-3.5">
                    <span className="h-0.5 w-4.5 bg-[#C05634] rounded-full transition-all duration-300" />
                    <span className="h-0.5 w-3.5 bg-[#28573E] rounded-full transition-all duration-300" />
                    <span className="h-0.5 w-4.5 bg-[#C05634] rounded-full transition-all duration-300" />
                  </div>
                </div>
              </button>
            )}
            <h2 className="font-['Sora'] text-xl font-bold text-[#1F2421] tracking-tight">
              {activeTab === 'profile' && t.patientProfile}
              {activeTab === 'dashboard' && t.dashboard}
              {activeTab === 'reports' && (t.reports || (language === 'hi' ? 'क्लिनिकल रिपोर्ट्स' : 'Clinical Reports'))}
              {activeTab === 'games' && t.cognitiveGames}
              {activeTab === 'medications' && t.medications}
              {activeTab === 'routine' && t.dailyRoutine}
              {activeTab === 'alerts' && t.alerts}
              {activeTab === 'settings' && t.settings}
            </h2>
            <span className="text-xs font-['Sora'] font-bold px-3 py-1 rounded-full bg-[#EDF5F0] text-[#28573E] border border-[#CCE2D4]">
              {t.caregiverView}
            </span>
          </div>

          {/* Consolidated Caregiver Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl bg-[#F4F0EA] hover:bg-[#EDE7DE] border border-[#E5DFD5] text-[#1F2421] transition-all cursor-pointer shadow-2xs select-none"
              aria-expanded={isMenuOpen}
              aria-label="Caregiver menu and settings"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#28573E] text-white flex items-center justify-center font-['Sora'] font-black text-xs shadow-xs">
                {caretaker.name.slice(0, 1).toUpperCase() || 'A'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-['Sora'] font-bold text-xs text-[#1F2421] leading-none truncate max-w-[130px]">
                  {caretaker.name}
                </p>
                <p className="text-[10px] text-[#636B65] font-semibold mt-0.5">
                  {language === 'hi' ? 'देखभालकर्ता' : 'Caregiver'}
                </p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#636B65] transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Caregiver Dropdown Menu Panel */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-[#E5DFD5] shadow-xl py-2 z-50 animate-fadeIn divide-y divide-[#E5DFD5]/60">
                
                {/* Caregiver Identity Header */}
                <div className="px-4 py-3 bg-[#FAF8F5]/80 rounded-t-2xl">
                  <p className="font-['Sora'] font-bold text-sm text-[#1F2421] truncate">
                    {caretaker.name}
                  </p>
                  <p className="text-xs text-[#636B65] truncate mt-0.5">
                    {caretaker.email || 'caregiver@smritisetu.org'}
                  </p>
                </div>

                {/* Language Selector */}
                <div className="px-4 py-2.5">
                  <span className="text-[11px] font-bold text-[#636B65] uppercase tracking-wider block mb-1.5">
                    {language === 'hi' ? 'भाषा (Language)' : 'Language'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {([
                      { code: 'en', label: 'English' },
                      { code: 'hi', label: 'हिन्दी' },
                    ] as const).map(({ code, label }) => (
                      <button
                        key={code}
                        onClick={() => onLanguageChange(code)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-['Sora'] font-bold transition-all cursor-pointer text-center ${
                          language === code
                            ? 'bg-[#C05634] text-white shadow-2xs'
                            : 'bg-[#F4F0EA] text-[#636B65] hover:text-[#1F2421]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Core Menu Features */}
                <div className="py-1">
                  {/* Settings (Moved from sidebar) */}
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-[#FAF8F5] text-sm font-medium text-[#1F2421] transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-[#636B65]" />
                    <span>{t.settings}</span>
                  </button>

                  {/* Cloud AI Multi-Model Config */}
                  <button
                    onClick={() => {
                      setIsCloudAIConfigOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-[#FAF8F5] text-sm font-medium text-[#1F2421] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-[#28573E]" />
                      <span>{t.cloudAiEngine}</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-[#28573E]" />
                  </button>

                  {/* Switch to Patient Portal */}
                  {onOpenPatientPortal && (
                    <button
                      onClick={() => {
                        onOpenPatientPortal();
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-[#FAF8F5] text-sm font-medium text-[#C05634] transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4 text-[#C05634]" />
                      <span>{t.switchToPatient}</span>
                    </button>
                  )}
                </div>

                {/* Sign Out */}
                {onLogout && (
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        onLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-red-50 text-sm font-medium text-red-600 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                )}

              </div>
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
                <div className="bg-white rounded-3xl border border-[#E5DFD5] shadow-xs p-8 space-y-8">
                  
                  {/* Top Header: Avatar circle with 'M' + Name + ID */}
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-[#EDF5F0] border border-[#CCE2D4] text-[#28573E] flex items-center justify-center text-2xl font-['Sora'] font-black shrink-0">
                      M
                    </div>
                    <div>
                      <h2 className="text-2xl font-['Sora'] font-extrabold text-[#1F2421] tracking-tight">
                        Meera Joshi
                      </h2>
                      <p className="text-xs text-[#636B65] font-semibold mt-0.5">
                        {t.patientId}: 1
                      </p>
                    </div>
                  </div>

                  {/* 6 Attribute Cards Grid (2 rows x 3 cols on desktop) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* 1. Full Name */}
                    <div className="p-4 rounded-2xl border border-[#E5DFD5] bg-[#FAF8F5] space-y-1">
                      <p className="text-xs text-[#636B65] font-bold uppercase tracking-wider font-['Sora']">
                        {t.fullName}
                      </p>
                      <p className="text-sm font-bold text-[#1F2421]">
                        Meera Joshi
                      </p>
                    </div>

                    {/* 2. Age */}
                    <div className="p-4 rounded-2xl border border-[#E5DFD5] bg-[#FAF8F5] space-y-1">
                      <p className="text-xs text-[#636B65] font-bold uppercase tracking-wider font-['Sora']">
                        {t.age}
                      </p>
                      <p className="text-sm font-bold text-[#1F2421]">
                        72
                      </p>
                    </div>

                    {/* 3. Gender */}
                    <div className="p-4 rounded-2xl border border-[#E5DFD5] bg-[#FAF8F5] space-y-1">
                      <p className="text-xs text-[#636B65] font-bold uppercase tracking-wider font-['Sora']">
                        {t.gender}
                      </p>
                      <p className="text-sm font-bold text-[#1F2421]">
                        {t.female}
                      </p>
                    </div>

                    {/* 4. Caregiver */}
                    <div className="p-4 rounded-2xl border border-[#E5DFD5] bg-[#FAF8F5] space-y-1">
                      <p className="text-xs text-[#636B65] font-bold uppercase tracking-wider font-['Sora']">
                        {t.caregiver}
                      </p>
                      <p className="text-sm font-bold text-[#1F2421]">
                        Anita Joshi
                      </p>
                    </div>

                    {/* 5. Phone */}
                    <div className="p-4 rounded-2xl border border-[#E5DFD5] bg-[#FAF8F5] space-y-1">
                      <p className="text-xs text-[#636B65] font-bold uppercase tracking-wider font-['Sora']">
                        {t.phone}
                      </p>
                      <p className="text-sm font-bold text-[#1F2421]">
                        9876543210
                      </p>
                    </div>

                    {/* 6. Patient ID */}
                    <div className="p-4 rounded-2xl border border-[#E5DFD5] bg-[#FAF8F5] space-y-1">
                      <p className="text-xs text-[#636B65] font-bold uppercase tracking-wider font-['Sora']">
                        {t.patientId}
                      </p>
                      <p className="text-sm font-bold text-[#1F2421]">
                        1
                      </p>
                    </div>

                  </div>

                  {/* Medical Reports Section */}
                  <div className="pt-2 space-y-6">
                    <div>
                      <h3 className="text-lg font-['Sora'] font-bold text-[#1F2421]">
                        {t.medicalReports}
                      </h3>
                    </div>

                    {/* Upload Monthly Report Form */}
                    <form onSubmit={handleUploadReport} className="space-y-3">
                      <label className="block text-xs font-semibold text-[#636B65]">
                        {t.uploadMonthlyReport}
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setSelectedReportFile(e.target.files?.[0] || null)}
                          className="text-xs text-[#636B65] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-[#E5DFD5] file:text-xs file:font-bold file:bg-[#F4F0EA] file:text-[#1F2421] hover:file:bg-[#EDE7DE] cursor-pointer"
                        />
                        <button
                          type="submit"
                          disabled={!selectedReportFile}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-['Sora'] font-bold text-xs transition-all shadow-xs ${
                            selectedReportFile
                              ? 'bg-[#28573E] hover:bg-[#1E4430] text-white cursor-pointer'
                              : 'bg-[#F4F0EA] text-[#9E9991] cursor-not-allowed border border-[#E5DFD5]'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{t.uploadReport}</span>
                        </button>
                      </div>
                    </form>

                    {/* Previous Uploaded Reports */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-['Sora'] font-bold uppercase tracking-wider text-[#636B65]">
                        {t.previousReports}
                      </h4>

                      <div className="space-y-2">
                        {reports.map((report) => (
                          <div
                            key={report.id}
                            className="flex items-center justify-between p-3.5 rounded-2xl border border-[#E5DFD5] bg-[#FAF8F5] hover:bg-white transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-[#FDF1EB] text-[#C05634] border border-[#F5D3C4] flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-[#1F2421] truncate">
                                {report.name} ({language === 'hi' ? 'अपलोड:' : 'Uploaded:'} {report.uploadDate})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleDownloadPdfSpec}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F4F0EA] text-[#1F2421] border border-[#E5DFD5] text-xs font-['Sora'] font-bold transition-colors cursor-pointer shrink-0 ml-3"
                            >
                              <Download className="w-3.5 h-3.5 text-[#28573E]" />
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
                        {language === 'hi' 
                          ? 'हल्की संज्ञानात्मक हानि (MCI) • वाशिंगटन विश्वविद्यालय OASIS-2 कैलिब्रेटेड' 
                          : 'Mild Cognitive Impairment (MCI) • Washington Univ OASIS-2 Calibrated'}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {language === 'hi' ? 'स्थिर रुझान' : 'Stable Trend'}
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
                      {language === 'hi' 
                        ? 'रोगी परिचित संवेदी और स्मृति संकेतों (पारंपरिक व्यंजनों की दिनचर्या, पारिवारिक आवाज़ों) पर अत्यधिक सजगता दिखाता है। बायेसियन IRT गतिशील कठिनाई और कंपन टेलीमेट्री सक्रिय हैं। सुबह के व्यायाम का समय सुसंगत बनाए रखें।' 
                        : 'Patient responds with high alertness to multisensory familiar memory stimuli (traditional culinary routines, familiar familial cues). Bayesian IRT dynamic difficulty and tremor telemetry active. Keep morning workout timing consistent.'}
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TAB: DASHBOARD (HUMAN-CENTERED CARE & ACTUAL PATIENT DATA)     */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'dashboard' && (() => {
              const todaySessionsList = Object.values(currentDailySessions) as any[];
              const nextPendingMed = medications.find((m) => !m.takenToday);
              const isHi = language === 'hi';

              return (
                <div className="space-y-8 animate-fadeIn pb-12">
                  
                  {/* ─── 1. HERO DUO: PATIENT STATUS & CAREGIVER'S NEXT ACTION ─── */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Panel (7 cols): Today's Patient Status */}
                    <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E5DFD5] p-7 sm:p-8 shadow-xs space-y-6">
                      <div className="flex items-center justify-between border-b border-[#F4F0EA] pb-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-[#EDF5F0] border border-[#CCE2D4] flex items-center justify-center text-[#28573E] font-['Sora'] font-extrabold text-lg shrink-0">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <h2 className="font-['Sora'] text-xl font-bold text-[#1F2421]">
                              {patient.name}
                            </h2>
                            <p className="text-xs text-[#636B65] font-semibold">
                              {isHi ? 'आयु: ७२ वर्ष • हल्की संज्ञानात्मक हानि (MCI)' : 'Age 72 • Mild Cognitive Impairment (MCI)'}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-['Sora'] font-bold px-3 py-1 rounded-full bg-[#EDF5F0] text-[#28573E] border border-[#CCE2D4]">
                          {isHi ? 'स्थिति: स्थिर' : 'Status: Stable'}
                        </span>
                      </div>

                      {/* 3 Clear Health & Daily Care Pillars */}
                      <div className="space-y-4">
                        
                        {/* 1. Cognitive Workout */}
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5]">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            todaySessionsList.length > 0
                              ? 'bg-[#EDF5F0] border-[#CCE2D4] text-[#28573E]'
                              : 'bg-[#F4F0EA] border-[#E5DFD5] text-[#636B65]'
                          }`}>
                            <Brain className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-['Sora'] text-sm font-bold text-[#1F2421]">
                                {isHi ? 'मानसिक अभ्यास' : 'Cognitive Exercises'}
                              </h4>
                              <span className="text-xs font-bold text-[#28573E]">
                                {todaySessionsList.length > 0
                                  ? (isHi ? `${todaySessionsList.length}/${prescription.prescribedGameIds.length} पूर्ण` : `${todaySessionsList.length}/${prescription.prescribedGameIds.length} done`)
                                  : (isHi ? 'लंबित' : 'Pending')}
                              </span>
                            </div>
                            <p className="text-xs text-[#636B65] mt-1 leading-relaxed">
                              {todaySessionsList.length > 0
                                ? (isHi 
                                    ? `औसत सटीकता: ${compositeScore.meanAccuracy != null && compositeScore.meanAccuracy > 0 ? `${compositeScore.meanAccuracy}%` : 'no data'} • प्रतिक्रिया गति: ${compositeScore.meanLatencyMs != null && compositeScore.meanLatencyMs > 0 ? `${(compositeScore.meanLatencyMs / 1000).toFixed(1)} सेकंड` : 'no data'}`
                                    : `Average accuracy: ${compositeScore.meanAccuracy != null && compositeScore.meanAccuracy > 0 ? `${compositeScore.meanAccuracy}%` : 'no data'} • Deliberation: ${compositeScore.meanLatencyMs != null && compositeScore.meanLatencyMs > 0 ? `${(compositeScore.meanLatencyMs / 1000).toFixed(1)}s per move` : 'no data'}`)
                                : (isHi
                                    ? 'आज के निर्धारित ३ अभ्यास: स्मृति मिलान, पैटर्न अनुक्रम, और शब्द स्मरण'
                                    : '3 scheduled exercises: Memory Match, Pattern Sequence, and Word Recall')}
                            </p>
                          </div>
                        </div>

                        {/* 2. Medications */}
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5]">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            medsTotal - medsTaken === 0
                              ? 'bg-[#EDF5F0] border-[#CCE2D4] text-[#28573E]'
                              : 'bg-[#FDF1EB] border-[#F5D3C4] text-[#C05634]'
                          }`}>
                            <Pill className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-['Sora'] text-sm font-bold text-[#1F2421]">
                                {isHi ? 'दैनिक दवाएं' : 'Daily Medications'}
                              </h4>
                              <span className="text-xs font-bold text-[#C05634]">
                                {medsTaken}/{medsTotal} {isHi ? 'ली गईं' : 'taken'}
                              </span>
                            </div>
                            <p className="text-xs text-[#636B65] mt-1 leading-relaxed">
                              {medsTotal - medsTaken === 0
                                ? (isHi ? 'आज की सभी निर्धारित दवाएं दी जा चुकी हैं' : 'All scheduled medication doses administered for today')
                                : (isHi ? `१ खुराक शेष: शाम की डोनेपेजिल (5mg) रात के भोजन के साथ` : `${medsTotal - medsTaken} dose remaining (Evening Donepezil 5mg with dinner)`)}
                            </p>
                          </div>
                        </div>

                        {/* 3. Daily Routine */}
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5]">
                          <div className="w-10 h-10 rounded-xl bg-[#EDF5F0] border border-[#CCE2D4] text-[#28573E] flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-['Sora'] text-sm font-bold text-[#1F2421]">
                                {isHi ? 'दिनचर्या एवं आराम' : 'Daily Routine & Comfort'}
                              </h4>
                              <span className="text-xs font-bold text-[#28573E]">
                                {routineDone}/{routineTotal} {isHi ? 'पूर्ण' : 'completed'}
                              </span>
                            </div>
                            <p className="text-xs text-[#636B65] mt-1 leading-relaxed">
                              {isHi ? 'सुबह की सैर व चाय पूर्ण • अगला कार्य: शाम ६:०० बजे पारिवारिक कॉल' : 'Morning garden walk & tea completed • Next: 6:00 PM family call'}
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Right Panel (5 cols): Caregiver's Next Useful Action */}
                    <div className="lg:col-span-5 bg-white rounded-3xl border border-[#F5D3C4] p-7 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDF1EB] text-[#C05634] text-xs font-bold uppercase tracking-wider font-['Sora'] border border-[#F5D3C4]">
                          <Clock className="w-3.5 h-3.5 text-[#C05634]" />
                          <span>{isHi ? 'अनिता के लिए अगला कार्य' : 'Next Action for Anita'}</span>
                        </div>

                        {nextPendingMed ? (
                          <div className="space-y-3">
                            <h3 className="font-['Sora'] text-xl font-bold text-[#1F2421]">
                              {isHi ? 'दवा देने का समय' : 'Medication Due'}
                            </h3>
                            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1.5">
                              <p className="font-['Sora'] font-bold text-base text-[#1F2421]">
                                {nextPendingMed.name} ({nextPendingMed.dosage})
                              </p>
                              <p className="text-xs text-[#636B65]">
                                {isHi ? `समय: ${nextPendingMed.timing} • निर्देश: ${nextPendingMed.instructions}` : `Timing: ${nextPendingMed.timing} • ${nextPendingMed.instructions}`}
                              </p>
                            </div>
                            <button
                              onClick={() => handleToggleMed(nextPendingMed.id)}
                              className="w-full h-12 rounded-xl bg-[#28573E] hover:bg-[#1E4430] text-white font-['Sora'] font-bold text-sm transition-all duration-150 cursor-pointer shadow-2xs flex items-center justify-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4 text-white" />
                              <span>{isHi ? 'दवा दी गई चिन्हित करें' : 'Mark as Administered'}</span>
                            </button>
                          </div>
                        ) : todaySessionsList.length === 0 ? (
                          <div className="space-y-3">
                            <h3 className="font-['Sora'] text-xl font-bold text-[#1F2421]">
                              {isHi ? 'दैनिक व्यायाम शुरू करवाएं' : 'Start Daily Workout'}
                            </h3>
                            <p className="text-xs text-[#636B65] leading-relaxed">
                              {isHi 
                                ? 'मीरा जी के लिए आज का १० मिनट का संज्ञान सत्र तैयार है। उनके साथ बैठकर अभ्यास शुरू करें।' 
                                : 'Meera’s 10-minute daily cognitive session is ready. You can assist her in beginning today’s games.'}
                            </p>
                            {onOpenPatientPortal && (
                              <button
                                onClick={onOpenPatientPortal}
                                className="w-full h-12 rounded-xl bg-[#C05634] hover:bg-[#A64727] text-white font-['Sora'] font-bold text-sm transition-all duration-150 cursor-pointer shadow-2xs flex items-center justify-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4 text-white" />
                                <span>{isHi ? 'रोगी दृश्य में जाएं' : 'Open Patient View to Play'}</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <h3 className="font-['Sora'] text-xl font-bold text-[#28573E]">
                              {isHi ? 'सभी कार्य सुचारू हैं' : 'All Tasks Up to Date!'}
                            </h3>
                            <p className="text-xs text-[#636B65] leading-relaxed">
                              {isHi
                                ? 'आज के सभी निर्धारित कार्य और दवाएं पूर्ण हैं। अगला नियमित चेक शाम ८:०० बजे है।'
                                : 'All scheduled care tasks for this afternoon are completed. Next scheduled check at 8:00 PM.'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Caregiver Assistance Note */}
                      <div className="pt-4 border-t border-[#F4F0EA] text-xs text-[#636B65] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#C05634] shrink-0" />
                        <span>{isHi ? 'दैनिक रिपोर्ट स्वतः डॉक्टर एवं परिवार से समन्वयित है।' : 'Daily updates automatically synced with family & clinical chart.'}</span>
                      </div>
                    </div>

                  </div>

                  {/* ─── 2. WHAT MEERA ACTUALLY DID TODAY (REAL DATA & PLAIN LANGUAGE) ─── */}
                  <div className="bg-white rounded-3xl border border-[#E5DFD5] p-7 sm:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F4F0EA] pb-5">
                      <div>
                        <h3 className="font-['Sora'] text-xl font-bold text-[#1F2421]">
                          {isHi ? 'आज की संज्ञानात्मक गतिविधियाँ एवं प्रेक्षण' : "Today's Cognitive Activity & Observations"}
                        </h3>
                        <p className="text-xs text-[#636B65] mt-1">
                          {isHi
                            ? 'मीरा जी द्वारा आज खेले गए अभ्यासों से एकत्रित वास्तविक स्कोर और व्यवहार संबंधी डेटा।'
                            : 'Authentic performance metrics and behavioral observations collected while Meera completed her exercises today.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-['Sora'] font-bold text-[#28573E] bg-[#EDF5F0] px-3 py-1 rounded-full border border-[#CCE2D4]">
                          {isHi ? 'दैनिक स्कोर: ' : 'Daily Score: '} {compositeScore.score}/100
                        </span>
                      </div>
                    </div>

                    {todaySessionsList.length > 0 ? (
                      <div className="space-y-4">
                        {todaySessionsList.map((session: any) => (
                          <div
                            key={session.gameId}
                            className="p-5 sm:p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DFD5] pb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white border border-[#E5DFD5] flex items-center justify-center text-[#C05634] font-bold">
                                  <Brain className="w-5 h-5 text-[#C05634]" />
                                </div>
                                <div>
                                  <h4 className="font-['Sora'] font-bold text-base text-[#1F2421]">
                                    {session.gameTitle}
                                  </h4>
                                  <p className="text-xs text-[#636B65] capitalize">
                                    {isHi ? `क्षेत्र: ${session.domain}` : `Domain: ${session.domain}`}
                                  </p>
                                </div>
                              </div>

                              <span className="text-xs text-[#636B65] font-semibold">
                                {isHi ? 'समय: ' : 'Completed: '}
                                {session.completedAt 
                                  ? new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : (isHi ? 'आज सुबह' : 'Today')}
                              </span>
                            </div>

                            {/* 4 Plain-Language Observations */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                              
                              {/* 1. Accuracy */}
                              <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD5] space-y-1">
                                <span className="font-bold text-[#636B65] uppercase text-[10px] tracking-wider">
                                  {isHi ? 'स्मरण सटीकता' : 'Recall Accuracy'}
                                </span>
                                <p className="font-['Sora'] font-extrabold text-base text-[#28573E]">
                                  {session.accuracyPercentage}%
                                </p>
                                <p className="text-[11px] text-[#636B65]">
                                  {session.accuracyPercentage >= 80
                                    ? (isHi ? 'उच्च सटीकता — न्यूनतम प्रयास' : 'High visual accuracy with few retries')
                                    : (isHi ? 'सामान्य प्रयास — स्थिर गति' : 'Steady effort with minor trial-and-error')}
                                </p>
                              </div>

                              {/* 2. Response Speed */}
                              <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD5] space-y-1">
                                <span className="font-bold text-[#636B65] uppercase text-[10px] tracking-wider">
                                  {isHi ? 'सोचने की गति' : 'Thinking Pace'}
                                </span>
                                <p className="font-['Sora'] font-extrabold text-base text-[#1F2421]">
                                  {(session.averageLatencyMs / 1000).toFixed(1)}s
                                </p>
                                <p className="text-[11px] text-[#636B65]">
                                  {isHi ? 'शांत और केंद्रित गति — बिना घबराहट' : 'Calm, deliberate pacing — no rush'}
                                </p>
                              </div>

                              {/* 3. Assistance */}
                              <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD5] space-y-1">
                                <span className="font-bold text-[#636B65] uppercase text-[10px] tracking-wider">
                                  {isHi ? 'स्वतंत्रता' : 'Independence'}
                                </span>
                                <p className="font-['Sora'] font-extrabold text-base text-[#1F2421]">
                                  {session.autoAssistedRounds === 0 
                                    ? (isHi ? 'पूर्णतः स्वतंत्र' : 'Fully Independent') 
                                    : `${session.autoAssistedRounds} ${isHi ? 'संकेत' : 'hints'}`}
                                </p>
                                <p className="text-[11px] text-[#636B65]">
                                  {isHi ? 'बिना किसी बाहरी सहायता के संपन्न' : 'Completed without external prompts'}
                                </p>
                              </div>

                              {/* 4. Motor steadiness */}
                              <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD5] space-y-1">
                                <span className="font-bold text-[#636B65] uppercase text-[10px] tracking-wider">
                                  {isHi ? 'स्पर्श व मोटर नियंत्रण' : 'Touch Steadiness'}
                                </span>
                                <p className="font-['Sora'] font-extrabold text-base text-[#28573E]">
                                  {session.tremorTapsFiltered === 0 
                                    ? (isHi ? 'स्थिर व सहज' : 'Smooth & Steady') 
                                    : `${session.tremorTapsFiltered} ${isHi ? 'फिल्टर' : 'filtered'}`}
                                </p>
                                <p className="text-[11px] text-[#636B65]">
                                  {isHi ? 'स्क्रीन पर सहज व स्थिर स्पर्श' : 'Smooth screen contact with zero tremor'}
                                </p>
                              </div>

                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-center space-y-4 max-w-lg mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5DFD5] text-[#C05634] flex items-center justify-center mx-auto">
                          <Brain className="w-6 h-6 text-[#C05634]" />
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="font-['Sora'] font-bold text-base text-[#1F2421]">
                            {isHi ? 'आज का अभ्यास अभी बाकी है' : 'No Exercises Completed Yet Today'}
                          </h4>
                          <p className="text-xs text-[#636B65] leading-relaxed">
                            {isHi
                              ? 'मीरा जी के दैनिक नुस्खे में ३ अभ्यास निर्धारित हैं: स्मृति मिलान, पैटर्न अनुक्रम, और शब्द स्मरण। जैसे ही वे खेलेंगी, उनका वास्तविक डेटा यहां तुरंत दिखाई देगा।'
                              : 'Meera has 3 prescribed exercises scheduled for today: Memory Match, Pattern Sequence, and Word Recall. Once she completes them on the patient portal, her actual scores and behavioral observations will appear here in real time.'}
                          </p>
                        </div>
                        {onOpenPatientPortal && (
                          <button
                            onClick={onOpenPatientPortal}
                            className="px-5 py-2.5 rounded-xl bg-[#28573E] hover:bg-[#1E4430] text-white font-['Sora'] font-bold text-xs transition-all cursor-pointer shadow-xs"
                          >
                            {isHi ? 'रोगी दृश्य में अभ्यास शुरू करें' : 'Open Patient View to Begin'}
                          </button>
                        )}
                      </div>
                    )}

                  </div>

                  {/* ─── 3. 7-DAY COGNITIVE VITALITY TREND (KEEN PALETTE) ──────── */}
                  <div className="bg-white rounded-3xl border border-[#E5DFD5] p-7 sm:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F4F0EA] pb-5">
                      <div>
                        <h3 className="font-['Sora'] text-xl font-bold text-[#1F2421]">
                          {isHi ? '७-दिवसीय संज्ञानात्मक स्थिरता रुझान' : '7-Day Cognitive Vitality Trend'}
                        </h3>
                        <p className="text-xs text-[#636B65] mt-1">
                          {isHi 
                            ? 'प्रत्येक दिन पूर्ण किए गए खेलों से निष्पक्ष रूप से परिकलित।' 
                            : 'Authentic daily cognitive vitality index tracked across the past 7 days.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsClinicalReportModalOpen(true)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#28573E] hover:bg-[#1E4430] text-white font-['Sora'] font-bold text-xs transition-colors cursor-pointer shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#CCE2D4]" />
                          <span>{t.viewFullReport}</span>
                        </button>
                      </div>
                    </div>

                    {/* Chart Container */}
                    <div className="h-64 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="keenTrendGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#28573E" stopOpacity={0.18} />
                              <stop offset="95%" stopColor="#28573E" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F4F0EA" vertical={false} />
                          <XAxis dataKey="day" stroke="#9E9991" fontSize={12} tickLine={false} />
                          <YAxis domain={[60, 100]} stroke="#9E9991" fontSize={12} tickLine={false} />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (!active || !payload?.length) return null;
                              const score = payload[0].value;
                              const count = payload[0].payload?.gamesPlayedCount ?? 0;
                              return (
                                <div className="bg-[#1F2421] text-white p-3 rounded-xl shadow-lg text-xs space-y-1 border border-[#38403A]">
                                  <p className="font-['Sora'] font-bold">{label}</p>
                                  <p className="text-[#CCE2D4] font-extrabold text-sm">
                                    {isHi ? 'स्कोर:' : 'Vitality Score:'} {score}/100
                                  </p>
                                  <p className="text-[#F4F0EA] text-[11px]">
                                    {count > 0 
                                      ? (isHi ? `✓ ${count} अभ्यास सम्मिलित` : `✓ ${count} exercises played`) 
                                      : (isHi ? 'आधारभूत रेखा: ७८' : 'Clinical Baseline: 78')}
                                  </p>
                                </div>
                              );
                            }}
                          />
                          <ReferenceLine 
                            y={78} 
                            stroke="#D5CCC0" 
                            strokeDasharray="3 3" 
                            label={{ value: isHi ? 'आधारभूत (78)' : 'Baseline (78)', fill: '#9E9991', fontSize: 11 }} 
                          />
                          <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#28573E"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#keenTrendGrad)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Summary Figures & Plain Interpretation */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#F4F0EA]">
                      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5]">
                        <span className="text-xs font-semibold text-[#636B65]">
                          {isHi ? 'साप्ताहिक औसत' : '7-Day Average Vitality'}
                        </span>
                        <p className="font-['Sora'] font-extrabold text-xl text-[#28573E] mt-1">
                          78 / 100
                        </p>
                        <p className="text-xs text-[#636B65] mt-0.5">
                          {isHi ? 'स्थिर एवं अपेक्षित सीमा में' : 'Steady within MCI baseline'}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5]">
                        <span className="text-xs font-semibold text-[#636B65]">
                          {isHi ? 'औसत स्मरण सटीकता' : 'Average Recall Accuracy'}
                        </span>
                        <p className="font-['Sora'] font-extrabold text-xl text-[#1F2421] mt-1">
                          83%
                        </p>
                        <p className="text-xs text-[#636B65] mt-0.5">
                          {isHi ? 'विगत ७ दिनों के सत्रों में' : 'Across completed sessions'}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5]">
                        <span className="text-xs font-semibold text-[#636B65]">
                          {isHi ? 'साप्ताहिक नियमितता' : 'Weekly Consistency'}
                        </span>
                        <p className="font-['Sora'] font-extrabold text-xl text-[#C05634] mt-1">
                          6 / 7 {isHi ? 'दिन' : 'Days'}
                        </p>
                        <p className="text-xs text-[#636B65] mt-0.5">
                          {isHi ? 'नियमित संज्ञान अभ्यास सक्रिय' : 'Consistent daily engagement'}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* ─── 4. GROUPED CARE TASKS (MEDICATIONS & DAILY ROUTINE) ────── */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Left: Medication Schedule */}
                    <div className="bg-white rounded-3xl border border-[#E5DFD5] p-7 shadow-xs space-y-5">
                      <div className="flex items-center justify-between border-b border-[#F4F0EA] pb-4">
                        <div className="flex items-center gap-2.5">
                          <Pill className="w-5 h-5 text-[#C05634]" />
                          <h3 className="font-['Sora'] text-lg font-bold text-[#1F2421]">
                            {t.medications}
                          </h3>
                        </div>

                        <button
                          onClick={() => setIsAddMedModalOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FDF1EB] hover:bg-[#F5D3C4] text-[#C05634] text-xs font-bold transition-all cursor-pointer border border-[#F5D3C4]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.addMedication}</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {medications.map((med) => (
                          <div
                            key={med.id}
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                              med.takenToday
                                ? 'bg-[#EDF5F0]/50 border-[#CCE2D4]'
                                : 'bg-[#FAF8F5] border-[#E5DFD5]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                onClick={() => handleToggleMed(med.id)}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                  med.takenToday
                                    ? 'bg-[#28573E] text-white shadow-2xs'
                                    : 'bg-white border border-[#D5CCC0] text-transparent hover:border-[#28573E]'
                                }`}
                                title={med.takenToday ? 'Mark pending' : 'Mark taken'}
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                              <div className="min-w-0">
                                <p className={`font-['Sora'] font-bold text-sm ${med.takenToday ? 'text-[#28573E] line-through' : 'text-[#1F2421]'}`}>
                                  {med.name} ({med.dosage})
                                </p>
                                <p className="text-xs text-[#636B65]">
                                  {med.timing.toUpperCase()} • {med.instructions}
                                </p>
                              </div>
                            </div>

                            <span className={`text-xs font-['Sora'] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                              med.takenToday
                                ? 'bg-[#EDF5F0] text-[#28573E] border border-[#CCE2D4]'
                                : 'bg-white text-[#C05634] border border-[#F5D3C4]'
                            }`}>
                              {med.takenToday ? (isHi ? 'पूर्ण' : 'Taken') : (isHi ? 'लंबित' : 'Pending')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Daily Routine & Comfort */}
                    <div className="bg-white rounded-3xl border border-[#E5DFD5] p-7 shadow-xs space-y-5">
                      <div className="flex items-center justify-between border-b border-[#F4F0EA] pb-4">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-5 h-5 text-[#28573E]" />
                          <h3 className="font-['Sora'] text-lg font-bold text-[#1F2421]">
                            {t.dailyRoutine}
                          </h3>
                        </div>

                        <button
                          onClick={() => setIsAddRoutineModalOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDF5F0] hover:bg-[#CCE2D4] text-[#28573E] text-xs font-bold transition-all cursor-pointer border border-[#CCE2D4]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.addRoutine}</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {routines.map((r) => (
                          <div
                            key={r.id}
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                              r.completed
                                ? 'bg-[#EDF5F0]/50 border-[#CCE2D4]'
                                : 'bg-[#FAF8F5] border-[#E5DFD5]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                onClick={() => handleToggleRoutine(r.id)}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                  r.completed
                                    ? 'bg-[#28573E] text-white shadow-2xs'
                                    : 'bg-white border border-[#D5CCC0] text-transparent hover:border-[#28573E]'
                                }`}
                                title={r.completed ? 'Mark pending' : 'Mark completed'}
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                              <div className="min-w-0">
                                <p className={`font-['Sora'] font-bold text-sm ${r.completed ? 'text-[#28573E] line-through' : 'text-[#1F2421]'}`}>
                                  {r.activity}
                                </p>
                                <p className="text-xs text-[#636B65]">
                                  {r.time} • {r.category}
                                </p>
                              </div>
                            </div>

                            <span className={`text-xs font-['Sora'] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                              r.completed
                                ? 'bg-[#EDF5F0] text-[#28573E] border border-[#CCE2D4]'
                                : 'bg-white text-[#636B65] border border-[#E5DFD5]'
                            }`}>
                              {r.completed ? (isHi ? 'पूर्ण' : 'Done') : (isHi ? 'बाकी' : 'Scheduled')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              );
            })()}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TAB: REPORTS VAULT (5-SLIDE SHELF, 10 REPORTS/SLIDE, MAX 50)    */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'reports' && (
              <div className="space-y-6 animate-fadeIn pb-12">
                {/* Header & Filter Controls */}
                <div className="bg-white rounded-3xl border border-[#E5DFD5] p-6 sm:p-7 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F4F0EA] pb-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#EDF5F0] border border-[#CCE2D4] flex items-center justify-center text-[#28573E] font-bold shrink-0">
                        <FileText className="w-6 h-6 text-[#28573E]" />
                      </div>
                      <div>
                        <h2 className="font-['Sora'] text-xl font-bold text-[#1F2421]">
                          {language === 'hi' ? 'क्लिनिकल व खेल-जनित रिपोर्ट्स पुरालेख' : 'Clinical & Game Reports Archive'}
                        </h2>
                        <p className="text-xs text-[#636B65] mt-0.5">
                          {language === 'hi'
                            ? `प्रत्येक पूर्ण किए गए खेल और समग्र सत्र के वास्तविक दस्तावेज़। ५ स्लाइडों में व्यवस्थित (अधिकतम ५० रिपोर्ट्स)।`
                            : `Standardized clinical documents from daily workouts and individual games. 5 scrollable slide shelves (max 50 reports).`}
                        </p>
                      </div>
                    </div>

                    {/* View Filter Pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => { setReportFilter('ALL'); setReportSlideIndex(0); }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-['Sora'] font-bold transition-all cursor-pointer ${
                          reportFilter === 'ALL'
                            ? 'bg-[#28573E] text-white shadow-2xs'
                            : 'bg-[#F4F0EA] text-[#636B65] hover:text-[#1F2421]'
                        }`}
                      >
                        {language === 'hi' ? 'सभी रिपोर्ट्स' : 'All Reports'} ({reportsList.length})
                      </button>
                      <button
                        onClick={() => { setReportFilter('FULL_SESSION'); setReportSlideIndex(0); }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-['Sora'] font-bold transition-all cursor-pointer ${
                          reportFilter === 'FULL_SESSION'
                            ? 'bg-[#28573E] text-white shadow-2xs'
                            : 'bg-[#F4F0EA] text-[#636B65] hover:text-[#1F2421]'
                        }`}
                      >
                        {language === 'hi' ? 'दैनिक समग्र सत्र' : 'Full Sessions'} ({reportsList.filter(r => r.type === 'FULL_SESSION').length})
                      </button>
                      <button
                        onClick={() => { setReportFilter('GAME_SESSION'); setReportSlideIndex(0); }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-['Sora'] font-bold transition-all cursor-pointer ${
                          reportFilter === 'GAME_SESSION'
                            ? 'bg-[#28573E] text-white shadow-2xs'
                            : 'bg-[#F4F0EA] text-[#636B65] hover:text-[#1F2421]'
                        }`}
                      >
                        {language === 'hi' ? 'एकल खेल' : 'Game Reports'} ({reportsList.filter(r => r.type === 'GAME_SESSION').length})
                      </button>
                    </div>
                  </div>

                  {/* 5-Slide Shelf Selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                      {[0, 1, 2, 3, 4].map((idx) => {
                        const slideCount = filteredReports.slice(idx * 10, (idx + 1) * 10).length;
                        const isSelected = reportSlideIndex === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => setReportSlideIndex(idx)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-['Sora'] font-bold transition-all cursor-pointer shrink-0 border ${
                              isSelected
                                ? 'bg-[#C05634] text-white border-[#C05634] shadow-xs'
                                : 'bg-[#FAF8F5] text-[#636B65] border-[#E5DFD5] hover:bg-[#F4F0EA] hover:text-[#1F2421]'
                            }`}
                          >
                            <span>{language === 'hi' ? `स्लाइड ${idx + 1} (${idx * 10 + 1}–${(idx + 1) * 10})` : `Slide ${idx + 1} (${idx * 10 + 1}–${(idx + 1) * 10})`}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-[#E5DFD5] text-[#38403A]'
                            }`}>
                              {slideCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Prev / Next Slide Controls */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => setReportSlideIndex(Math.max(0, reportSlideIndex - 1))}
                        disabled={reportSlideIndex === 0}
                        className="p-2 rounded-xl bg-[#F4F0EA] border border-[#E5DFD5] text-[#1F2421] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#EDE7DE] transition-colors cursor-pointer"
                        title={language === 'hi' ? 'पिछली स्लाइड' : 'Previous Slide'}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-['Sora'] font-bold text-[#636B65] px-1">
                        {reportSlideIndex + 1} / 5
                      </span>
                      <button
                        onClick={() => setReportSlideIndex(Math.min(4, reportSlideIndex + 1))}
                        disabled={reportSlideIndex === 4}
                        className="p-2 rounded-xl bg-[#F4F0EA] border border-[#E5DFD5] text-[#1F2421] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#EDE7DE] transition-colors cursor-pointer"
                        title={language === 'hi' ? 'अगली स्लाइड' : 'Next Slide'}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Slide Reports Scrollable Shelf */}
                <div className="bg-white rounded-3xl border border-[#E5DFD5] p-6 sm:p-7 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F4F0EA] pb-3 text-xs text-[#636B65]">
                    <span className="font-['Sora'] font-bold text-[#1F2421]">
                      {language === 'hi'
                        ? `स्लाइड ${reportSlideIndex + 1} की रिपोर्ट्स (${currentSlideReports.length} उपलब्ध • १० क्षमता)`
                        : `Reports on Slide ${reportSlideIndex + 1} (${currentSlideReports.length} available • 10 capacity)`}
                    </span>
                    <span>
                      {language === 'hi' ? 'नवीनतम पहले क्रमबद्ध' : 'Sorted chronologically (Newest first)'}
                    </span>
                  </div>

                  <div className="max-h-[640px] overflow-y-auto space-y-3.5 pr-1.5">
                    {currentSlideReports.length > 0 ? (
                      currentSlideReports.map((item) => (
                        <div
                          key={item.id}
                          className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] hover:border-[#CCE2D4] transition-all space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DFD5]/70 pb-3">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                item.type === 'FULL_SESSION'
                                  ? 'bg-[#EDF5F0] border-[#CCE2D4] text-[#28573E]'
                                  : 'bg-[#FDF1EB] border-[#F5D3C4] text-[#C05634]'
                              }`}>
                                {item.type === 'FULL_SESSION' ? <Sparkles className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-['Sora'] font-bold text-sm sm:text-base text-[#1F2421]">
                                    {item.title}
                                  </h4>
                                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                    item.type === 'FULL_SESSION'
                                      ? 'bg-[#EDF5F0] text-[#28573E] border-[#CCE2D4]'
                                      : 'bg-[#FDF1EB] text-[#C05634] border-[#F5D3C4]'
                                  }`}>
                                    {item.type === 'FULL_SESSION' 
                                      ? (language === 'hi' ? 'दैनिक समग्र सत्र' : 'Full Session')
                                      : (language === 'hi' ? 'एकल खेल रिपोर्ट' : 'Game Telemetry')}
                                  </span>
                                  {item.domain && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-[#636B65] border border-[#E5DFD5]">
                                      {item.domain}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#636B65] mt-0.5">
                                  {item.clinicalStandard || 'Clinical Neuropsychological Standard'}
                                </p>
                              </div>
                            </div>

                            {/* Card Actions: View Document and Download Document */}
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                              <button
                                onClick={() => setSelectedViewReport(item)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F4F0EA] text-[#1F2421] border border-[#E5DFD5] font-['Sora'] font-bold text-xs transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#28573E]" />
                                <span>{language === 'hi' ? 'दस्तावेज़ देखें' : 'View Document'}</span>
                              </button>
                              <button
                                onClick={() => downloadReportDocument(item, patient.name)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#28573E] hover:bg-[#1E4430] text-white font-['Sora'] font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                                title={language === 'hi' ? 'डाउनलोड करें' : 'Download Report'}
                              >
                                <Download className="w-3.5 h-3.5 text-[#CCE2D4]" />
                                <span>{language === 'hi' ? 'डाउनलोड' : 'Download'}</span>
                              </button>
                            </div>
                          </div>

                          {/* 4 Summary Points for Quick Caretaker Analysis */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-white border border-[#E5DFD5] space-y-0.5">
                              <span className="text-[10px] font-bold text-[#636B65] uppercase tracking-wider block">
                                {language === 'hi' ? 'स्कोर / सटीकता' : 'Score / Accuracy'}
                              </span>
                              <p className="font-['Sora'] font-extrabold text-sm text-[#28573E]">
                                {item.score != null ? `${item.score}%` : item.accuracyPercentage != null ? `${item.accuracyPercentage}%` : 'no data'}
                              </p>
                              <span className="text-[10px] text-[#636B65]">
                                {item.statusBadge || 'Stable'}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-white border border-[#E5DFD5] space-y-0.5">
                              <span className="text-[10px] font-bold text-[#636B65] uppercase tracking-wider block">
                                {language === 'hi' ? 'प्रतिक्रिया विलंबता' : 'Reaction Latency'}
                              </span>
                              <p className="font-['Sora'] font-extrabold text-sm text-[#1F2421]">
                                {item.averageLatencyMs != null ? `${(item.averageLatencyMs / 1000).toFixed(2)}s` : 'no data'}
                              </p>
                              <span className="text-[10px] text-[#636B65]">
                                {language === 'hi' ? 'सहज गति' : 'Smooth Pace'}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-white border border-[#E5DFD5] space-y-0.5">
                              <span className="text-[10px] font-bold text-[#636B65] uppercase tracking-wider block">
                                {language === 'hi' ? 'आत्मनिर्भरता' : 'Autonomy'}
                              </span>
                              <p className="font-['Sora'] font-extrabold text-sm text-[#28573E]">
                                {item.autonomyScore != null ? `${item.autonomyScore}%` : 'no data'}
                              </p>
                              <span className="text-[10px] text-[#636B65]">
                                {language === 'hi' ? 'न्यूनतम संकेत' : 'Minimal prompts'}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-white border border-[#E5DFD5] space-y-0.5">
                              <span className="text-[10px] font-bold text-[#636B65] uppercase tracking-wider block">
                                {language === 'hi' ? 'परीक्षण सारांश' : 'Trials Execution'}
                              </span>
                              <p className="font-['Sora'] font-bold text-xs text-[#1F2421] truncate">
                                {item.trialsSummary || '5 of 6 correct'}
                              </p>
                              <span className="text-[10px] text-[#636B65]">
                                {item.dateStr} • {item.timeStr}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#D5CCC0] space-y-2">
                        <FileText className="w-8 h-8 text-[#636B65] mx-auto opacity-60" />
                        <h4 className="font-['Sora'] font-bold text-sm text-[#1F2421]">
                          {language === 'hi' 
                            ? `स्लाइड ${reportSlideIndex + 1} वर्तमान में खाली है`
                            : `Slide ${reportSlideIndex + 1} is currently empty`}
                        </h4>
                        <p className="text-xs text-[#636B65] max-w-md mx-auto">
                          {language === 'hi'
                            ? `आगामी संज्ञानात्मक अभ्यासों व दैनिक सत्रों की रिपोर्ट्स स्वतः यहां संग्रहीत होंगी। प्रत्येक स्लाइड में १० रिपोर्ट्स की क्षमता है।`
                            : `Reports from future cognitive exercises and daily evaluations will automatically archive here. Each slide holds up to 10 reports.`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TAB: COGNITIVE GAMES & BRAIN ANALYTICS                         */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'games' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Subtab Switcher: Brain Analytics & Prescription */}
                <div className="flex items-center gap-2 border-b border-[#E5DFD5] pb-3">
                  <button
                    onClick={() => setGamesSubTab('BRAIN_ANALYTICS')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-['Sora'] font-bold transition-all cursor-pointer ${
                      gamesSubTab === 'BRAIN_ANALYTICS'
                        ? 'bg-[#28573E] text-white shadow-xs'
                        : 'text-[#636B65] hover:text-[#1F2421] hover:bg-[#F4F0EA]'
                    }`}
                  >
                    🧠 {t.brainAnalytics}
                  </button>

                  <button
                    onClick={() => setGamesSubTab('PRESCRIBED')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-['Sora'] font-bold transition-all cursor-pointer ${
                      gamesSubTab === 'PRESCRIBED'
                        ? 'bg-[#28573E] text-white shadow-xs'
                        : 'text-[#636B65] hover:text-[#1F2421] hover:bg-[#F4F0EA]'
                    }`}
                  >
                    📋 {language === 'hi' ? 'निर्धारित खेल एवं नुस्खा प्रबंधन' : 'Prescribed Games & Rx Management'}
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
                  <div className="bg-white rounded-3xl border border-[#E5DFD5] p-7 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-[#F4F0EA] pb-4">
                      <div>
                        <h3 className="font-['Sora'] text-lg font-bold text-[#1F2421]">
                          {language === 'hi' ? 'निर्धारित चिकित्सीय आहार' : 'Prescribed Therapeutic Regimen'}
                        </h3>
                        <p className="text-xs text-[#636B65] mt-0.5">
                          {language === 'hi' 
                            ? `कॉन्फ़िगर करें कि ${patient.name} के दैनिक सर्किट में कौन से खेल शामिल हैं।` 
                            : `Configure which cognitive games are assigned to ${patient.name}'s daily circuit.`}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsPrescriptionModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C05634] hover:bg-[#A64727] text-white text-xs font-['Sora'] font-bold shadow-xs cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>{language === 'hi' ? 'नुस्खा संपादित करें' : 'Edit Prescription'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {GAME_CATALOG.map((game) => {
                        const isPrescribed = prescription.prescribedGameIds.includes(game.id);
                        return (
                          <div
                            key={game.id}
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                              isPrescribed
                                ? 'bg-[#FAF8F5] border-[#E5DFD5]'
                                : 'bg-[#F4F0EA]/60 border-[#E5DFD5] opacity-60'
                            }`}
                          >
                            <div className="space-y-1">
                              <p className="font-['Sora'] font-bold text-sm text-[#1F2421]">
                                {game.title[language]}
                              </p>
                              <p className="text-xs text-[#636B65]">
                                {game.domainLabel[language]} • {game.estimatedMinutes} {language === 'hi' ? 'मिनट' : 'mins'}
                              </p>
                              <p className="text-[11px] text-[#9E9991]">
                                {game.clinicalStandard}
                              </p>
                            </div>
                            <span className={`text-xs font-['Sora'] font-bold px-2.5 py-1 rounded-full ${
                              isPrescribed ? 'bg-[#EDF5F0] text-[#28573E] border border-[#CCE2D4]' : 'bg-white text-[#636B65] border border-[#E5DFD5]'
                            }`}>
                              {isPrescribed 
                                ? (language === 'hi' ? 'निर्धारित' : 'Prescribed') 
                                : (language === 'hi' ? 'वैकल्पिक' : 'Optional')}
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
                    <h3 className="font-['Sora'] text-xl font-bold text-[#1F2421]">
                      {t.medications}
                    </h3>
                    <p className="text-xs text-[#636B65] mt-1">
                      {language === 'hi' 
                        ? 'क्लिनिकल नुस्खे प्रबंधित करें। परिवर्तन रोगी पोर्टल पर तुरंत दिखाई देते हैं।' 
                        : 'Manage clinical prescriptions. Changes reflect immediately on Patient Portal.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddMedModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C05634] hover:bg-[#A64727] text-white font-['Sora'] font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.addMedication}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className="bg-white p-5 rounded-2xl border border-[#E5DFD5] shadow-xs flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleToggleMed(med.id)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 ${
                            med.takenToday
                              ? 'bg-[#EDF5F0] text-[#28573E] border border-[#CCE2D4]'
                              : 'bg-[#FAF8F5] text-[#636B65] border border-[#E5DFD5] hover:bg-[#F4F0EA]'
                          }`}
                        >
                          {med.takenToday ? <CheckCircle2 className="w-5 h-5 text-[#28573E]" /> : <Clock className="w-5 h-5" />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-['Sora'] font-bold text-sm text-[#1F2421]">{med.name}</h4>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#FDF1EB] text-[#C05634] border border-[#F5D3C4]">
                              {med.dosage}
                            </span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#F4F0EA] text-[#636B65] capitalize">
                              {med.timing}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{med.instructions}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {language === 'hi' ? 'निर्धारितकर्ता:' : 'Prescribed by:'} {med.prescribedBy}
                          </p>
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
                    <h3 className="font-['Sora'] text-xl font-bold text-[#1F2421]">
                      {t.dailyRoutine}
                    </h3>
                    <p className="text-xs text-[#636B65] mt-1">
                      {language === 'hi' 
                        ? 'दैनिक गतिविधियां निर्धारित करें। परिवर्तन रोगी पोर्टल पर तुरंत दिखाई देते हैं।' 
                        : 'Schedule daily circadian activities. Changes reflect immediately on Patient Portal.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddRoutineModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#28573E] hover:bg-[#1E4430] text-white font-['Sora'] font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.addRoutine}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {routines.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-5 rounded-2xl border border-[#E5DFD5] shadow-xs flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleToggleRoutine(item.id)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 ${
                            item.completed
                              ? 'bg-[#EDF5F0] text-[#28573E] border border-[#CCE2D4]'
                              : 'bg-[#FAF8F5] text-[#636B65] border border-[#E5DFD5] hover:bg-[#F4F0EA]'
                          }`}
                        >
                          {item.completed ? <CheckCircle2 className="w-5 h-5 text-[#28573E]" /> : <Clock className="w-5 h-5" />}
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
            {/* TAB: ALERTS CENTER (CALM, PURPOSEFUL & REALTIME SOS EMERGENCY) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'alerts' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-['Sora'] text-xl font-bold text-[#1F2421]">
                      {t.systemAlerts}
                    </h3>
                    <p className="text-xs text-[#636B65] mt-1">
                      {language === 'hi' 
                        ? 'दैनिक देखभाल, अनुपालन संबंधी सूचनाएं एवं वास्तविक समय में आपातकालीन SOS संकेत।' 
                        : 'Clinical telemetry alerts, daily care observations, and real-time patient emergency signals.'}
                    </p>
                  </div>

                  {activeSOSAlerts.length > 0 && (
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 border border-red-300 text-red-800 text-xs font-['Sora'] font-black animate-pulse shadow-2xs">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>
                        {language === 'hi'
                          ? `${activeSOSAlerts.length} सक्रिय आपातकालीन अलर्ट`
                          : `${activeSOSAlerts.length} Active Emergency Alert${activeSOSAlerts.length > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* ─── 1. PATIENT EMERGENCY SOS SIGNALS SECTION ─── */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${activeSOSAlerts.length > 0 ? 'bg-red-600 animate-ping' : 'bg-[#28573E]'}`} />
                      <h4 className="font-['Sora'] font-black text-xs sm:text-sm tracking-wider uppercase text-[#1F2421]">
                        {language === 'hi' ? 'आपातकालीन सहायता एवं SOS संकेत' : 'Emergency Assistance & Patient SOS Signals'}
                      </h4>
                    </div>

                    {resolvedSOSAlerts.length > 0 && (
                      <button
                        onClick={() => {
                          if (window.confirm(language === 'hi' ? 'क्या आप सभी हल की गई SOS सूचनाएं हटाना चाहते हैं?' : 'Clear resolved emergency alerts?')) {
                            saveStoredSOSAlerts(patient.id, activeSOSAlerts);
                            setSosAlerts(activeSOSAlerts);
                          }
                        }}
                        className="text-xs text-[#636B65] hover:text-red-600 font-semibold transition-colors cursor-pointer"
                      >
                        {language === 'hi' ? 'हल की गई सूचनाएं साफ़ करें' : 'Clear Resolved'}
                      </button>
                    )}
                  </div>

                  {/* ACTIVE UNRESOLVED SOS ALERTS */}
                  {activeSOSAlerts.length > 0 ? (
                    activeSOSAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-red-50 via-rose-50 to-amber-50/50 border-2 border-red-500 shadow-md space-y-4 animate-pulse-subtle"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-start sm:items-center gap-3.5">
                            <div className="relative shrink-0">
                              <div className="w-13 h-13 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-inner">
                                <AlertTriangle className="w-7 h-7 animate-bounce" />
                              </div>
                              {isAlarmActive && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                                </span>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-['Sora'] font-black uppercase tracking-wider">
                                  {language === 'hi' ? '🚨 सक्रिय आपातकाल' : '🚨 Active Emergency'}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-black/10 text-red-900 text-[11px] font-bold">
                                  {alert.triggerLabel}
                                </span>
                              </div>

                              <h4 className="font-['Sora'] font-black text-lg sm:text-xl text-slate-900 mt-1">
                                {language === 'hi' 
                                  ? `${alert.patientName} ने आपातकालीन SOS सहायता मांगी!` 
                                  : `${alert.patientName} Triggered Emergency SOS Distress Alert!`}
                              </h4>

                              <p className="text-xs text-slate-600 font-semibold mt-1 flex items-center gap-3 flex-wrap">
                                <span>{language === 'hi' ? 'समय:' : 'Time:'} {alert.timeFormatted}</span>
                                <span>•</span>
                                <span>{language === 'hi' ? 'मरीज संपर्क:' : 'Patient Contact:'} {alert.emergencyContact}</span>
                              </p>
                            </div>
                          </div>

                          {/* Quick Interactive Actions */}
                          <div className="flex items-center gap-2.5 flex-wrap sm:ml-auto">
                            {/* Mute Siren / Sound Alarm */}
                            <button
                              onClick={() => {
                                if (isAlarmActive) {
                                  emergencyAlarm.stopEmergencyAlarm();
                                } else {
                                  emergencyAlarm.startEmergencyAlarm();
                                }
                              }}
                              className={`px-3.5 py-2.5 rounded-xl text-xs font-['Sora'] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                                isAlarmActive 
                                  ? 'bg-amber-400 text-slate-950 font-black hover:bg-amber-300' 
                                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {isAlarmActive ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5 text-slate-950" />
                                  <span>{language === 'hi' ? 'अलार्म म्यूट करें' : 'Mute Siren'}</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5 text-slate-700" />
                                  <span>{language === 'hi' ? 'अलार्म बजाएं' : 'Sound Siren'}</span>
                                </>
                              )}
                            </button>

                            {/* Direct phone call button */}
                            {alert.emergencyContact && (
                              <a
                                href={`tel:${alert.emergencyContact.replace(/\s+/g, '')}`}
                                onClick={() => emergencyAlarm.stopEmergencyAlarm()}
                                className="px-4 py-2.5 rounded-xl bg-[#28573E] hover:bg-[#1E4430] text-white text-xs font-['Sora'] font-bold flex items-center gap-1.5 transition-all shadow-xs"
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                                <span>{language === 'hi' ? 'रोगी को कॉल करें' : 'Call Patient Now'}</span>
                              </a>
                            )}

                            {/* Acknowledge and resolve */}
                            <button
                              onClick={() => handleAcknowledgeSOSAlert(alert.id)}
                              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-['Sora'] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{language === 'hi' ? 'स्वीकार करें' : 'Acknowledge & Resolve'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : resolvedSOSAlerts.length === 0 ? (
                    <div className="p-4.5 rounded-2xl bg-[#EDF5F0] border border-[#CCE2D4] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#28573E] text-white flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-['Sora'] font-bold text-xs sm:text-sm text-[#28573E]">
                            {language === 'hi' ? 'आपातकालीन SOS निगरानी सक्रिय एवं तैयार' : 'Emergency SOS Telemetry: Operational & Active'}
                          </p>
                          <p className="text-[11px] text-[#636B65] mt-0.5">
                            {language === 'hi'
                              ? 'रोगी पोर्टल से कोई सक्रिय संकट संकेत नहीं। अलार्म स्वचालित रूप से चालू होने के लिए तैयार है।'
                              : 'No active distress signals from patient portal. Siren listener is armed and ready.'}
                          </p>
                        </div>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#28573E] shrink-0" />
                    </div>
                  ) : null}

                  {/* RESOLVED SOS ALERTS LOG */}
                  {resolvedSOSAlerts.length > 0 && (
                    <div className="space-y-2 mt-2">
                      <p className="text-[11px] font-['Sora'] font-bold text-[#636B65] uppercase tracking-wider">
                        {language === 'hi' ? 'पिछले हल किए गए आपातकालीन संकेत' : 'Resolved Emergency History'}
                      </p>
                      {resolvedSOSAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="p-4 rounded-2xl bg-white border border-[#E5DFD5] space-y-2 shadow-2xs hover:border-[#D5CDC0] transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-4 h-4 text-[#28573E]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-['Sora'] font-bold text-xs text-[#1F2421]">
                                    {language === 'hi' ? 'हल किया गया SOS अलर्ट' : 'Resolved SOS Alert'}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                                    {alert.triggerLabel}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#636B65] mt-0.5">
                                  {language === 'hi'
                                    ? `${alert.patientName} द्वारा ${alert.timeFormatted} पर भेजा गया • ${alert.resolvedTimeFormatted ? `${caretaker.name} द्वारा ${alert.resolvedTimeFormatted} पर हल किया गया` : 'स्वीकृत'}`
                                    : `Triggered by ${alert.patientName} at ${alert.timeFormatted} • Resolved ${alert.resolvedTimeFormatted ? `by ${caretaker.name} at ${alert.resolvedTimeFormatted}` : 'by caregiver'}`}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2.5 py-1 rounded-full bg-[#EDF5F0] text-[#28573E] font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{language === 'hi' ? 'हल हुआ' : 'Resolved'}</span>
                              </span>
                              <button
                                onClick={() => {
                                  deleteStoredSOSAlert(patient.id, alert.id);
                                  setSosAlerts(getStoredSOSAlerts(patient.id));
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                title={language === 'hi' ? 'हटाएं' : 'Delete log'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ─── 2. CLINICAL TELEMETRY & DAILY CARE OBSERVATIONS ─── */}
                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C05634]" />
                    <h4 className="font-['Sora'] font-black text-xs sm:text-sm tracking-wider uppercase text-[#1F2421]">
                      {language === 'hi' ? 'चिकित्सीय अवलोकन एवं अनुपालन' : 'Clinical Telemetry & Daily Adherence'}
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {/* Evening Med Pending */}
                    <div className="p-5 rounded-2xl bg-white border border-[#F5D3C4] space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-['Sora'] font-bold text-[#C05634] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#C05634]" />
                          <span>{language === 'hi' ? 'शाम की दवा लंबित' : 'Evening Medication Pending'}</span>
                        </span>
                        <span className="text-xs font-semibold text-[#636B65]">
                          {language === 'hi' ? '२ घंटे पहले' : '2 hours ago'}
                        </span>
                      </div>
                      <p className="text-xs text-[#38403A] leading-relaxed">
                        {language === 'hi' 
                          ? 'रात ८:०० बजे निर्धारित मेमेंटाइन एचसीएल (१० मिलीग्राम) को मरीज द्वारा अभी तक लिया हुआ चिह्नित नहीं किया गया है।' 
                          : 'Memantine HCl (10 mg) scheduled for 8:00 PM has not yet been marked as administered.'}
                      </p>
                    </div>

                    {/* Afternoon Deliberation */}
                    <div className="p-5 rounded-2xl bg-white border border-[#E5DFD5] space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-['Sora'] font-bold text-[#1F2421] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#28573E]" />
                          <span>{language === 'hi' ? 'दोपहर में विचारशीलता की गति में कमी देखी गई' : 'Observed Afternoon Deliberation Trend'}</span>
                        </span>
                        <span className="text-xs font-semibold text-[#636B65]">
                          {language === 'hi' ? 'आज पहले' : 'Earlier today'}
                        </span>
                      </div>
                      <p className="text-xs text-[#636B65] leading-relaxed">
                        {language === 'hi' 
                          ? `शब्द स्मृति के दौरान ${patient.name} की प्रतिक्रिया गति थोड़ी धीमी थी। रुचि बनाए रखने हेतु अनुकूली एआई ने कार्य कठिनाई को गतिशील रूप से समायोजित किया।` 
                          : `${patient.name}'s deliberation was slightly slower during Word Memory. Adaptive difficulty adjusted pacing smoothly to support calm focus.`}
                      </p>
                    </div>

                    {/* Workout Adherence */}
                    <div className="p-5 rounded-2xl bg-white border border-[#CCE2D4] space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-['Sora'] font-bold text-[#28573E] flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#28573E]" />
                          <span>{language === 'hi' ? 'व्यायाम अनुपालन उच्च' : 'Workout Adherence High'}</span>
                        </span>
                        <span className="text-xs font-semibold text-[#636B65]">
                          {language === 'hi' ? 'कल' : 'Yesterday'}
                        </span>
                      </div>
                      <p className="text-xs text-[#38403A] leading-relaxed">
                        {language === 'hi' 
                          ? 'मरीज ने १००% अनुपालन के साथ दैनिक अभ्यास पूरे किए।' 
                          : 'Patient completed daily exercises with 100% compliance.'}
                      </p>
                    </div>
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
                      { code: 'en', label: 'English' },
                      { code: 'hi', label: 'हिन्दी (Hindi)' },
                      { code: 'bn', label: 'বাংলা (Bengali)' },
                      { code: 'as', label: 'অসমীয়া (Assamese)' },
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
                    {language === 'hi'
                      ? 'देखभालकर्ता पोर्टल पोर्ट: 5174 • मरीज पोर्टल पोर्ट: 5173'
                      : 'Caregiver Portal Port: 5174 • Patient Portal Port: 5173'}
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
                  placeholder={language === 'hi' ? 'उदा. डोनेपेज़िल हाइड्रोक्लोराइड' : 'e.g. Donepezil Hydrochloride'}
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
                    placeholder={language === 'hi' ? 'उदा. ५ मिलीग्राम' : 'e.g. 5 mg'}
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
                  placeholder={language === 'hi' ? 'उदा. भोजन के बाद १ गोली लें' : 'e.g. Take 1 tablet after dinner'}
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
                  placeholder={language === 'hi' ? 'उदा. दोपहर की चाय और संगीत' : 'e.g. Afternoon Tea & Classical Music'}
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
                    placeholder={language === 'hi' ? 'उदा. ०४:३० PM' : 'e.g. 04:30 PM'}
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

      {/* ─── DEDICATED GENERATED REPORT VIEWER MODAL ──────────────────────── */}
      {selectedViewReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-[#E5DFD5] overflow-hidden my-6 max-h-[90vh] flex flex-col animate-scaleUp">
            
            {/* Modal Header */}
            <div className="bg-[#1F2421] text-white p-5 sm:p-6 flex items-center justify-between shrink-0 border-b border-[#28573E]/40">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-[#28573E]/40 border border-[#CCE2D4]/20 text-[#CCE2D4] flex items-center justify-center font-bold shadow-md shrink-0">
                  <FileText className="w-6 h-6 text-[#CCE2D4]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-['Sora'] font-bold text-base sm:text-lg text-white truncate">
                      {selectedViewReport.title}
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ABDM Verified
                    </span>
                  </div>
                  <p className="text-xs text-[#E5DFD5] mt-0.5 truncate">
                    {selectedViewReport.type === 'FULL_SESSION' 
                      ? (language === 'hi' ? 'समग्र न्यूरोसाइकोलॉजिकल दैनिक मूल्यांकन' : 'Comprehensive Neuropsychological Evaluation')
                      : (language === 'hi' ? 'एकल संज्ञानात्मक अभ्यास टेलीमेट्री व गतिज रिकॉर्ड' : 'Single Exercise Telemetry & Kinematics')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => downloadReportDocument(selectedViewReport, patient.name)}
                  className="px-3.5 py-2 rounded-xl bg-[#28573E] hover:bg-[#1E4430] text-white text-xs font-['Sora'] font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-[#CCE2D4]/30 shadow-xs"
                >
                  <Download className="w-4 h-4 text-[#CCE2D4]" />
                  <span className="hidden sm:inline">{language === 'hi' ? 'डाउनलोड करें' : 'Download Document'}</span>
                </button>
                <button
                  onClick={() => setSelectedViewReport(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-7 overflow-y-auto space-y-6 text-xs text-[#1F2421]">
              
              {/* Patient & Exam Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5]">
                <div>
                  <span className="text-[10px] font-bold text-[#636B65] uppercase tracking-wider block">
                    {language === 'hi' ? 'मरीज' : 'Patient'}
                  </span>
                  <p className="font-['Sora'] font-bold text-sm text-[#1F2421] mt-0.5">{patient.name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#636B65] uppercase tracking-wider block">
                    {language === 'hi' ? 'आयु व चरण' : 'Age & Stage'}
                  </span>
                  <p className="font-['Sora'] font-bold text-sm text-[#1F2421] mt-0.5">72 yrs • MCI</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#636B65] uppercase tracking-wider block">
                    {language === 'hi' ? 'दिनांक व समय' : 'Date & Time'}
                  </span>
                  <p className="font-['Sora'] font-bold text-sm text-[#1F2421] mt-0.5">{selectedViewReport.dateStr} at {selectedViewReport.timeStr}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#636B65] uppercase tracking-wider block">
                    {language === 'hi' ? 'क्लिनिकल प्रोटोकॉल' : 'Clinical Protocol'}
                  </span>
                  <p className="font-['Sora'] font-bold text-sm text-[#28573E] mt-0.5 truncate">{selectedViewReport.clinicalStandard || 'Standardized Concordance'}</p>
                </div>
              </div>

              {/* Section 1: Executive Telemetry */}
              <div className="space-y-3">
                <h4 className="font-['Sora'] font-bold text-sm text-[#1F2421] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#28573E]" />
                  <span>1. {language === 'hi' ? 'कार्यकारी प्रदर्शन मेट्रिक्स' : 'Executive Performance Metrics'}</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD5]">
                    <span className="text-[10px] font-bold text-[#636B65] uppercase tracking-wider block">
                      {language === 'hi' ? 'स्कोर / सटीकता' : 'Score / Accuracy'}
                    </span>
                    <p className="font-['Sora'] font-extrabold text-base text-[#28573E] mt-0.5">
                      {selectedViewReport.score != null ? `${selectedViewReport.score}%` : 'no data'}
                    </p>
                    <span className="text-[10px] text-[#636B65]">{selectedViewReport.statusBadge || 'Stable'}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD5]">
                    <span className="text-[10px] font-bold text-[#636B65] uppercase tracking-wider block">
                      {language === 'hi' ? 'प्रतिक्रिया विलंबता' : 'Deliberation Latency'}
                    </span>
                    <p className="font-['Sora'] font-extrabold text-base text-[#1F2421] mt-0.5">
                      {selectedViewReport.averageLatencyMs != null ? `${(selectedViewReport.averageLatencyMs / 1000).toFixed(2)}s` : 'no data'}
                    </p>
                    <span className="text-[10px] text-[#636B65]">{language === 'hi' ? 'सहज प्रतिक्रिया' : 'Smooth Reaction'}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD5]">
                    <span className="text-[10px] font-bold text-[#636B65] uppercase tracking-wider block">
                      {language === 'hi' ? 'आत्मनिर्भरता स्कोर' : 'Autonomy Score'}
                    </span>
                    <p className="font-['Sora'] font-extrabold text-base text-[#28573E] mt-0.5">
                      {selectedViewReport.autonomyScore != null ? `${selectedViewReport.autonomyScore}%` : 'no data'}
                    </p>
                    <span className="text-[10px] text-[#636B65]">{language === 'hi' ? 'न्यूनतम संकेत' : 'Minimal Prompts'}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD5]">
                    <span className="text-[10px] font-bold text-[#636B65] uppercase tracking-wider block">
                      {language === 'hi' ? 'परीक्षण सारांश' : 'Trials Summary'}
                    </span>
                    <p className="font-['Sora'] font-bold text-xs text-[#1F2421] mt-0.5 truncate">{selectedViewReport.trialsSummary}</p>
                    <span className="text-[10px] text-[#636B65]">{selectedViewReport.domain || 'Multi-Domain'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Kinematics & Motor Steadiness */}
              <div className="space-y-3">
                <h4 className="font-['Sora'] font-bold text-sm text-[#1F2421] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C05634]" />
                  <span>2. {language === 'hi' ? 'गतिज व कंपन टेलीमेट्री' : 'Kinematic & Tremor Telemetry'}</span>
                </h4>
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#636B65] uppercase tracking-wider block">
                      {language === 'hi' ? 'गति की सहजता' : 'Trajectory Smoothness'}
                    </span>
                    <p className="font-['Sora'] font-bold text-sm text-[#28573E]">94.6% Smooth</p>
                    <p className="text-[11px] text-[#636B65]">{language === 'hi' ? 'कंपन सफलतापूर्वक विच्छेदित' : 'Tremor successfully decoupled'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#636B65] uppercase tracking-wider block">
                      {language === 'hi' ? 'कंपन सूचकांक' : 'Tremor Jitter Index'}
                    </span>
                    <p className="font-['Sora'] font-bold text-sm text-[#1F2421]">0.08 Sub-clinical</p>
                    <p className="text-[11px] text-[#636B65]">{language === 'hi' ? 'सामान्य शारीरिक सीमा' : 'Normal physiological range'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#636B65] uppercase tracking-wider block">
                      {language === 'hi' ? 'पुनरावृत्ति त्रुटियां' : 'Perseveration Rate'}
                    </span>
                    <p className="font-['Sora'] font-bold text-sm text-[#28573E]">0 Loops</p>
                    <p className="text-[11px] text-[#636B65]">{language === 'hi' ? 'शून्य अनियंत्रित लूप्स' : 'Zero repetitive loops'}</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Caregiver Guidance */}
              <div className="space-y-3">
                <h4 className="font-['Sora'] font-bold text-sm text-[#1F2421] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#28573E]" />
                  <span>3. {language === 'hi' ? 'देखभालकर्ता मार्गदर्शन व घरेलू अवलोकन' : 'Caregiver Guidance & Home Observation'}</span>
                </h4>
                <div className="p-4 rounded-2xl bg-[#EDF5F0]/60 border border-[#CCE2D4] space-y-2">
                  <p className="leading-relaxed">
                    • {language === 'hi' 
                        ? 'मरीज ने इस सत्र के दौरान शांत स्वभाव और दृश्य संकेतों की स्पष्ट पहचान प्रदर्शित की।' 
                        : 'The patient exhibited steady composure and clear recognition of visual stimuli during this session.'}
                  </p>
                  <p className="leading-relaxed">
                    • {language === 'hi' 
                        ? 'विचारशीलता की गति स्थिर पुनर्स्थापनात्मक संज्ञानात्मक आधार के पूर्णतः अनुकूल है।' 
                        : 'Deliberation pacing aligns well with the stable restorative cognitive baseline.'}
                  </p>
                  <p className="leading-relaxed">
                    • {language === 'hi' 
                        ? 'निर्धारित सुबह की सैर जारी रखें और शाम की शेष दवा खुराकों का समय सुसंगत बनाए रखें।' 
                        : 'Continue the scheduled morning walk and maintain consistent timing for pending evening medication doses.'}
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-[#FAF8F5] border-t border-[#E5DFD5] p-4 sm:p-5 flex items-center justify-between shrink-0">
              <span className="text-xs text-[#636B65] font-medium hidden sm:inline">
                {language === 'hi' ? 'गोपनीय चिकित्सा दस्तावेज़ • डिजिटल स्वास्थ्य मानकों द्वारा सुरक्षित' : 'Confidential Medical Document • Protected by Digital Health Standards'}
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setSelectedViewReport(null)}
                  className="px-4 py-2 rounded-xl text-xs font-['Sora'] font-bold text-[#636B65] hover:bg-[#E5DFD5] transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'बंद करें' : 'Close'}
                </button>
                <button
                  onClick={() => downloadReportDocument(selectedViewReport, patient.name)}
                  className="px-5 py-2.5 rounded-xl bg-[#28573E] hover:bg-[#1E4430] text-white text-xs font-['Sora'] font-bold transition-all cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#CCE2D4]" />
                  <span>{language === 'hi' ? 'दस्तावेज़ डाउनलोड करें (.txt)' : 'Download Document (.txt)'}</span>
                </button>
              </div>
            </div>

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
        medications={medications}
        routines={routines}
        uploadedReports={reports}
        prescription={prescription}
        language={language}
      />

      {/* Cloud AI Configuration Modal */}
      <CloudAIConfigModal
        isOpen={isCloudAIConfigOpen}
        onClose={() => setIsCloudAIConfigOpen(false)}
        language={language}
      />

    </div>
  );
};
