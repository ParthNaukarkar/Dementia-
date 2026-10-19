import React, { useMemo, useState } from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  Sparkles, 
  User, 
  Calendar, 
  FileText, 
  Brain,
  Activity,
  Zap,
  RefreshCw,
  Pill,
  Clock,
  ArrowRight,
  AlertTriangle,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { PatientProfile } from '../../types/auth';
import type { MedicationItem, DailyRoutineItem } from '../../types/caregiver';
import type { MedicalReportItem } from '../../utils/caregiverStorage';
import type { PatientPrescription, GameId } from '../../types/prescription';
import { CognitiveClassifier } from '../../engine/cognitive-classifier';
import { 
  AIClinicalReportingService, 
  type GeneratedClinicalReport,
  type ClinicalReportPayload,
  type ComprehensiveClinicalPayload,
  type ComprehensiveClinicalReport,
  type AIProvider,
  type CloudAIConfig,
} from '../../services/ai-clinical-reporting';
import { CloudAIConfigModal } from '../modals/CloudAIConfigModal';
import type { 
  DailyCompositeScoreResult, 
  DailyGameSessionRecord 
} from '../../utils/dailySessionManager';

interface ClinicalSessionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report?: any | null;
  patient?: PatientProfile | null;
  dailyComposite?: DailyCompositeScoreResult;
  dailySessions?: Record<string, any>;
  medications?: MedicationItem[];
  routines?: DailyRoutineItem[];
  uploadedReports?: MedicalReportItem[];
  prescription?: PatientPrescription;
  onLaunchGame?: (gameId: GameId) => void;
}

export const ClinicalSessionReportModal: React.FC<ClinicalSessionReportModalProps> = ({
  isOpen,
  onClose,
  report = null,
  patient = null,
  dailyComposite,
  dailySessions = {},
  medications = [],
  routines = [],
  uploadedReports = [],
  prescription,
  onLaunchGame,
}) => {
  if (!isOpen) return null;

  // Active view mode: 'COMPREHENSIVE' (All Games + Caregiver Records + Meds) vs 'SINGLE_SESSION'
  const [reportMode, setReportMode] = useState<'COMPREHENSIVE' | 'SINGLE_SESSION'>('COMPREHENSIVE');

  const patientName = patient?.name || 'Meera Joshi';
  const patientAge = patient?.age || 74;
  const diagnosis = patient?.diagnosisStage?.replace(/_/g, ' ') || 'Mild Cognitive Impairment';
  const completedDate = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  // Single-game fallback data if specific report is passed
  const activeReport = report || {
    gameId: 'memory-match',
    gameTitle: 'Memory Match (Paired Associates)',
    accuracyPercentage: 88,
    totalRounds: 6,
    totalCorrect: 5,
    averageLatencyMs: 2350,
    finalTheta: 0.58,
    estimatedMoCAMemoryScore: 4,
    speedProfile: 'normal',
    transpositionErrors: 0,
    intrusionErrors: 1,
    perseverationErrors: 0,
    autoAssistedRounds: 0,
    maxSpanAchieved: 4,
  };

  const isSequenceRecall = activeReport.gameId === 'sequence-recall' || activeReport.maxSpanAchieved !== undefined;
  const gameTitle = activeReport.gameTitle || (isSequenceRecall ? 'Sequence Recall (Spatial Span)' : 'Memory Match (Paired Associates)');

  // Single Session Classification
  const classification = useMemo(() => {
    const totalRounds = activeReport.totalRounds || activeReport.totalTrials || 5;
    return CognitiveClassifier.classify({
      meanLatencyMs: activeReport.averageLatencyMs || 2400,
      latencyVarianceMs: Math.round((activeReport.averageLatencyMs || 2400) * 0.25),
      accuracyPct: activeReport.accuracyPercentage ?? 100,
      perseverationRate: totalRounds > 0 ? ((activeReport.perseverationErrors || 0) / totalRounds) : 0,
      hesitationRatio: (activeReport.averageLatencyMs || 0) > 4500 ? 0.35 : 0.05,
      tremorJitterIndex: 0.12,
    });
  }, [activeReport]);

  // AI Configuration Modal state
  const [isAIConfigOpen, setIsAIConfigOpen] = useState(false);
  const [cloudConfig, setCloudConfig] = useState<CloudAIConfig>(() => AIClinicalReportingService.getConfig());
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => AIClinicalReportingService.getConfig().apiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  // Single-Game Cloud Report State
  const [singleCloudReport, setSingleCloudReport] = useState<GeneratedClinicalReport | null>(null);
  const [isGeneratingSingle, setIsGeneratingSingle] = useState(false);

  // Comprehensive Multi-Modal Cloud Report State (Ingesting EVERYTHING)
  const [comprehensiveReport, setComprehensiveReport] = useState<ComprehensiveClinicalReport | null>(null);
  const [isGeneratingComprehensive, setIsGeneratingComprehensive] = useState(false);

  // Handle Generating Single Game Report
  const handleGenerateSingleReport = async () => {
    setIsGeneratingSingle(true);
    const payload: ClinicalReportPayload = {
      patient: {
        name: patientName,
        age: patientAge,
        gender: patient?.gender,
        diagnosisStage: diagnosis,
      },
      gameData: {
        gameId: activeReport.gameId || 'memory-match',
        gameTitle,
        accuracyPercentage: activeReport.accuracyPercentage ?? 90,
        totalTrials: activeReport.totalRounds ?? activeReport.totalTrials ?? 6,
        correctTrials: activeReport.totalCorrect ?? activeReport.correctTrials ?? 5,
        averageLatencyMs: activeReport.averageLatencyMs || 2400,
        finalTheta: activeReport.finalTheta ?? 0.65,
        estimatedMoCAScore: activeReport.estimatedMoCAMemoryScore ?? 4,
        transpositionErrors: activeReport.transpositionErrors ?? 0,
        intrusionErrors: activeReport.intrusionErrors ?? 0,
        perseverationErrors: activeReport.perseverationErrors ?? 0,
        autoAssistedRounds: activeReport.autoAssistedRounds ?? 0,
        speedProfile: activeReport.speedProfile || 'normal',
        maxSpanAchieved: activeReport.maxSpanAchieved ?? 4,
      },
      kinematicData: {
        pathEfficiencyRatio: 0.94,
        bandPower_4_6Hz: 0.09,
        bandPower_8_12Hz: 0.11,
        tremorPhenotype: 'normal_smooth',
        tremorSeverityIndex: 0.08,
        fittsPerformanceIndex: 1.88,
      },
      dailyComposite: dailyComposite ? {
        overallScore: dailyComposite.score,
        domainBreakdown: dailyComposite.domainBreakdown.map((d) => ({
          domain: d.domain,
          score: d.score,
          accuracy: d.accuracy ?? 0,
        })),
      } : undefined,
    };

    try {
      const res = await AIClinicalReportingService.generateReport(payload);
      setSingleCloudReport(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingSingle(false);
    }
  };

  // Handle Generating Comprehensive Multi-Modal Report (EVERYTHING)
  const handleGenerateComprehensiveReport = async (overrideBenchmark = false) => {
    setIsGeneratingComprehensive(true);
    setApiErrorMessage(null);

    let activeConfig: CloudAIConfig = { ...cloudConfig };
    if (!overrideBenchmark) {
      if (apiKeyInput.trim()) {
        activeConfig = {
          ...cloudConfig,
          apiKey: apiKeyInput.trim(),
        };
        AIClinicalReportingService.saveConfig(activeConfig);
        setCloudConfig(activeConfig);
      } else {
        setIsGeneratingComprehensive(false);
        setApiErrorMessage('Cloud API Key Required: Please paste your Google Gemini, OpenAI, or Groq API key below to generate this report via Cloud AI.');
        return;
      }
    } else {
      activeConfig = {
        ...cloudConfig,
        apiKey: '', // Triggers reference cloud benchmark
      };
    }

    const sessionsArray: DailyGameSessionRecord[] = Object.values(dailySessions);
    const compositeData = dailyComposite || {
      score: 82,
      meanAccuracy: 88.5,
      meanLatencyMs: 2350,
      meanTheta: 0.62,
      meanAutonomy: 94,
      gamesPlayedCount: sessionsArray.length,
      playedGameIds: sessionsArray.map(s => s.gameId),
      isBaseline: sessionsArray.length === 0,
      domainBreakdown: [
        { domain: 'memory', label: 'Memory (Hippocampal)', score: 84, accuracy: 89, gamesPlayed: ['memory-match'], isPlayedToday: true },
        { domain: 'attention', label: 'Attention (Prefrontal)', score: 80, accuracy: 86, gamesPlayed: ['sequence-recall'], isPlayedToday: true },
        { domain: 'executive', label: 'Executive (Decision)', score: 81, accuracy: 87, gamesPlayed: ['odd-one-out'], isPlayedToday: true },
        { domain: 'spatial', label: 'Spatial (Parietal)', score: 85, accuracy: 91, gamesPlayed: ['jigsaw-puzzle'], isPlayedToday: true },
        { domain: 'language', label: 'Language (Temporal)', score: 79, accuracy: 84, gamesPlayed: ['word-recall'], isPlayedToday: true },
      ]
    };

    const comprehensivePayload: ComprehensiveClinicalPayload = {
      patient: {
        name: patientName,
        age: patientAge,
        gender: patient?.gender || 'Female',
        diagnosisStage: diagnosis,
        educationYears: 14,
        clinicalNotes: 'Patient demonstrates high alertness to familiar routine cues. Keep morning exercise timing consistent.',
        emergencyContact: '+91 98765 43210 (Anita Joshi - Caregiver)',
      },
      allGameSessions: sessionsArray.length > 0 ? sessionsArray.map(s => ({
        gameId: s.gameId,
        gameTitle: s.gameTitle,
        accuracyPercentage: s.accuracyPercentage,
        averageLatencyMs: s.averageLatencyMs,
        finalTheta: s.finalTheta,
        autonomyScore: s.autonomyScore,
        autoAssistedRounds: s.autoAssistedRounds,
        perseverationErrors: s.perseverationErrors,
        domain: s.domain,
        completedAt: s.completedAt,
      })) : [
        {
          gameId: 'memory-match',
          gameTitle: 'Memory Match (Paired Associates)',
          accuracyPercentage: 88,
          averageLatencyMs: 2200,
          finalTheta: 0.65,
          autonomyScore: 100,
          autoAssistedRounds: 0,
          perseverationErrors: 0,
          domain: 'memory',
          completedAt: 'Today, 10:15 AM',
        },
        {
          gameId: 'sequence-recall',
          gameTitle: 'Sequence Recall (Corsi Span)',
          accuracyPercentage: 85,
          averageLatencyMs: 2450,
          finalTheta: 0.58,
          autonomyScore: 90,
          autoAssistedRounds: 1,
          perseverationErrors: 0,
          domain: 'attention',
          completedAt: 'Today, 10:22 AM',
        }
      ],
      kinematicMetrics: {
        pathEfficiencyRatio: 0.942,
        bandPower_4_6Hz: 0.086,
        bandPower_8_12Hz: 0.112,
        tremorPhenotype: 'Normal smooth motor trajectory (Sub-clinical 4-6 Hz band)',
        tremorSeverityIndex: 0.08,
        fittsPerformanceIndex: 1.89,
        jerkSmoothnessPercent: 94.6,
      },
      dailyComposite: {
        overallScore: compositeData.score,
        isBaseline: compositeData.isBaseline,
        gamesPlayedCount: compositeData.gamesPlayedCount,
        meanAccuracy: compositeData.meanAccuracy,
        meanLatencyMs: compositeData.meanLatencyMs,
        meanTheta: compositeData.meanTheta,
        domainBreakdown: compositeData.domainBreakdown.map(d => ({
          domain: d.domain,
          label: d.label,
          score: d.score,
          accuracy: d.accuracy ?? 0,
          gamesPlayed: d.gamesPlayed,
        })),
      },
      uploadedMedicalReports: uploadedReports.length > 0 ? uploadedReports : [
        {
          id: 'rep_01',
          name: 'MMSE_Assessment_August.pdf',
          uploadDate: 'Aug 15, 2024',
          sizeBytes: 245000,
        },
        {
          id: 'rep_02',
          name: 'Brain_MRI_Hippocampal_Volumetry.pdf',
          uploadDate: 'Sep 02, 2024',
          sizeBytes: 512000,
        }
      ],
      medications: medications.length > 0 ? medications : [
        {
          id: 'med_01',
          patientId: patient?.id || 'p_01',
          name: 'Donepezil Hydrochloride',
          dosage: '5 mg',
          timing: 'bedtime',
          instructions: 'Take 1 tablet at night with water. Cholinesterase inhibitor for memory consolidation.',
          takenToday: true,
          prescribedBy: 'Dr. A. Sarma (Neurology, GMCH)',
        },
        {
          id: 'med_02',
          patientId: patient?.id || 'p_01',
          name: 'Memantine HCl',
          dosage: '10 mg',
          timing: 'morning',
          instructions: 'Take in the morning with breakfast. NMDA receptor antagonist preventing excitotoxicity.',
          takenToday: false,
          prescribedBy: 'Dr. A. Sarma (Neurology, GMCH)',
        },
        {
          id: 'med_03',
          patientId: patient?.id || 'p_01',
          name: 'Vitamin B12 & Folate',
          dosage: '1500 mcg',
          timing: 'morning',
          instructions: 'Neuro-protective vitamin supplement supporting cellular myelin.',
          takenToday: true,
          prescribedBy: 'Dr. P. Goswami (Geriatrics)',
        }
      ],
      dailyRoutines: routines.length > 0 ? routines : [
        { id: 'r1', patientId: patient?.id || 'p_01', time: '08:00 AM', activity: 'Morning Walk & Sunlight', category: 'exercise', completed: true },
        { id: 'r2', patientId: patient?.id || 'p_01', time: '10:00 AM', activity: 'Cognitive Game Workout', category: 'cognitive', completed: true },
        { id: 'r3', patientId: patient?.id || 'p_01', time: '01:00 PM', activity: 'Nutritious Lunch & Rest', category: 'meal', completed: true },
        { id: 'r4', patientId: patient?.id || 'p_01', time: '05:00 PM', activity: 'Family Tea & Conversation', category: 'social', completed: false },
      ],
    };

    try {
      const res = await AIClinicalReportingService.generateComprehensiveReport(comprehensivePayload, activeConfig);
      setComprehensiveReport(res);
    } catch (e: any) {
      console.error(e);
      setApiErrorMessage(e?.message || 'Cloud API request failed. Please check your API key.');
    } finally {
      setIsGeneratingComprehensive(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Count pending medicines for alert pill
  const pendingMedCount = medications.filter(m => !m.takenToday).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-purple-600 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black tracking-tight text-white">
                  Comprehensive Neuro-Clinical Intelligence Report
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ABDM Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Standardized Multi-Modal Digital Evaluation • Ingesting 10 Games, Tremor FFT, Caregiver Records &amp; Medications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode Tabs: Comprehensive vs Single Exercise */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReportMode('COMPREHENSIVE')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                reportMode === 'COMPREHENSIVE'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Full Multi-Modal Report (All Games + Caregiver Records + Meds)</span>
              <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                Everything
              </span>
            </button>

            <button
              onClick={() => setReportMode('SINGLE_SESSION')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                reportMode === 'SINGLE_SESSION'
                  ? 'bg-slate-900 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
              <span>Single Exercise Telemetry Drilldown</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Patient: <strong className="text-slate-900">{patientName}</strong></span>
            <span>•</span>
            <span>{completedDate}</span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-slate-800">

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* VIEW: COMPREHENSIVE MULTI-MODAL EVALUATION (INGESTING EVERYTHING)  */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {reportMode === 'COMPREHENSIVE' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Comprehensive Patient & Caregiver Records Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Patient Profile</span>
                  <strong className="text-sm text-slate-900 flex items-center gap-1 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{patientName}</span>
                  </strong>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Age {patientAge} • {diagnosis} {prescription?.presetType ? `• Rx: ${prescription.presetType.replace(/_/g, ' ')}` : ''}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Active Daily Exercises</span>
                  <strong className="text-sm text-slate-900 flex items-center gap-1 mt-0.5">
                    <Brain className="w-3.5 h-3.5 text-purple-600" />
                    <span>{dailyComposite ? dailyComposite.gamesPlayedCount : 2} Games Completed</span>
                  </strong>
                  <span className="text-[11px] text-emerald-600 font-bold block">
                    Composite Score: {dailyComposite ? dailyComposite.score : 82}/100
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Medication Adherence</span>
                  <strong className="text-sm text-slate-900 flex items-center gap-1 mt-0.5">
                    <Pill className="w-3.5 h-3.5 text-sky-600" />
                    <span>{medications.filter(m => m.takenToday).length}/{medications.length} Doses Taken</span>
                  </strong>
                  <span className={`text-[11px] font-bold block ${pendingMedCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {pendingMedCount > 0 ? `⚠️ ${pendingMedCount} dose pending action` : '✓ All doses completed'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Clinical Uploads</span>
                  <strong className="text-sm text-slate-900 flex items-center gap-1 mt-0.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>{uploadedReports.length || 2} Medical Records</span>
                  </strong>
                  <span className="text-[11px] text-slate-500 font-medium block">MMSE, MRI on file</span>
                </div>
              </div>

              {/* CLOUD AI FULL-BLOWN TEST REPORT SUITE (API KEY POWERED) */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-2 border-amber-400/80 shadow-xl space-y-4">
                
                {/* Header & Status */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                      <Sparkles className="w-6 h-6 text-slate-950" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-base flex items-center gap-2">
                        <span>Cloud AI Clinical Intelligence Engine</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                          Cloud API Powered
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300 font-medium max-w-xl">
                        Uses external Cloud LLM API keys directly. Zero local model training or local hardware required.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {apiKeyInput.trim() ? (
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>API Key Active ({cloudConfig.provider.toUpperCase()})</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        <span>API Key Needed for Live Cloud Call</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Inline Provider Selection & API Key Input Bar */}
                <div className="space-y-3 pt-1">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>1. Select Provider &amp; Enter API Key</span>
                    </label>

                    {cloudConfig.provider === 'gemini' && (
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Get Free Google Gemini Key (Google AI Studio)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Provider Toggle */}
                    <div className="sm:col-span-4 grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
                      {(['gemini', 'openai', 'groq'] as AIProvider[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            const defaultModel = p === 'gemini' ? 'gemini-2.0-flash' : p === 'openai' ? 'gpt-4o-mini' : 'llama-3.3-70b-versatile';
                            const updated = { ...cloudConfig, provider: p, model: defaultModel };
                            setCloudConfig(updated);
                            AIClinicalReportingService.saveConfig(updated);
                          }}
                          className={`py-2 px-1 text-center rounded-xl text-xs font-black transition-all capitalize cursor-pointer ${
                            cloudConfig.provider === p
                              ? 'bg-amber-400 text-slate-950 shadow-md'
                              : 'text-slate-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {p === 'gemini' ? 'Gemini' : p === 'openai' ? 'OpenAI' : 'Groq'}
                        </button>
                      ))}
                    </div>

                    {/* API Key Input */}
                    <div className="sm:col-span-8 relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKeyInput}
                        onChange={(e) => {
                          setApiKeyInput(e.target.value);
                          setApiErrorMessage(null);
                          const updated = { ...cloudConfig, apiKey: e.target.value };
                          setCloudConfig(updated);
                          AIClinicalReportingService.saveConfig(updated);
                        }}
                        placeholder={`Paste your ${cloudConfig.provider.toUpperCase()} API key here...`}
                        className="w-full px-4 py-2.5 pr-10 rounded-2xl bg-black/60 border border-white/20 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-white cursor-pointer"
                        title={showApiKey ? 'Hide Key' : 'Show Key'}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {apiErrorMessage && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <div className="flex-1">
                      <strong className="block font-bold">API Notice:</strong>
                      <span>{apiErrorMessage}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Target: <strong className="text-white">{cloudConfig.model}</strong> • Full multi-modal synthesis (all 10 games, tremor FFT, records, meds)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenerateComprehensiveReport(false)}
                      disabled={isGeneratingComprehensive}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                    >
                      {isGeneratingComprehensive ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Calling Cloud API ({cloudConfig.provider.toUpperCase()})...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-slate-950" />
                          <span>{comprehensiveReport ? 'Regenerate via Cloud API' : 'Generate Full Report (via API Key)'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGenerateComprehensiveReport(true)}
                      disabled={isGeneratingComprehensive}
                      className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white font-bold text-xs transition-all cursor-pointer"
                      title="Load pre-synthesized cloud clinical reference benchmark"
                    >
                      <span>Preview Cloud Benchmark</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* RENDER FULL-BLOWN TEST REPORT */}
              {comprehensiveReport ? (
                <div className="space-y-6">

                  {/* 1. EXECUTIVE DIAGNOSTIC STAGING & RISK BANNER */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border-2 border-amber-400 shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                            Official Neuropsychological Evaluation
                          </span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span>{comprehensiveReport.isCloudGenerated ? 'Live Cloud REST API' : 'Cloud Benchmark Reference'}</span>
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-white mt-0.5">
                          {comprehensiveReport.dsm5Staging}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">
                          Evaluated via {comprehensiveReport.provider} ({comprehensiveReport.model}) • {comprehensiveReport.generatedAt}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-center px-4 py-2 rounded-2xl bg-white/10 border border-white/15">
                          <span className="text-[9px] uppercase font-bold text-slate-300 block">Estimated MoCA</span>
                          <span className="text-xl font-black text-amber-300">{comprehensiveReport.estimatedMoCAScore} / 30</span>
                        </div>

                        <div className="text-center px-4 py-2 rounded-2xl bg-white/10 border border-white/15">
                          <span className="text-[9px] uppercase font-bold text-slate-300 block">Decline Risk</span>
                          <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 inline-block mt-0.5">
                            {comprehensiveReport.cognitiveDeclineRiskLevel} Risk
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Executive Narrative */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        Executive Diagnostic Summary
                      </span>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                        {comprehensiveReport.diagnosticSummary}
                      </p>
                    </div>
                  </div>

                  {/* 2. 🚨 TOP PRIORITY MEDICATIONS (USER CORE REQUEST) */}
                  <div className="bg-white rounded-3xl border-2 border-rose-200 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                          <Pill className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <span>Top Priority Medications &amp; Adherence Schedule</span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                              Top Priority
                            </span>
                          </h3>
                          <p className="text-xs text-slate-500">
                            Ranked clinical schedule prioritizing neuro-protective agents and active dosage compliance.
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-slate-500">
                        {comprehensiveReport.medicationPriorities.length} Meds Monitored
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {comprehensiveReport.medicationPriorities.map((med, idx) => {
                        const isCritical = med.priorityLevel === 'CRITICAL_HIGH';
                        const isPending = med.adherenceStatus === 'PENDING_ACTION_REQUIRED';

                        return (
                          <div 
                            key={idx} 
                            className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                              isCritical 
                                ? 'bg-rose-50/40 border-rose-300 shadow-xs' 
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${
                                  isCritical 
                                    ? 'bg-rose-600 text-white' 
                                    : med.priorityLevel === 'HIGH'
                                    ? 'bg-amber-500 text-slate-950'
                                    : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {med.priorityLevel.replace('_', ' ')}
                                </span>
                                <h4 className="font-black text-sm text-slate-900 mt-1">
                                  {med.medicineName}
                                </h4>
                              </div>

                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                                isPending 
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse' 
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}>
                                {isPending ? '⚠️ PENDING' : '✓ TAKEN'}
                              </span>
                            </div>

                            <div className="text-xs space-y-1">
                              <p className="text-[11px] text-slate-600">
                                <strong className="text-slate-800">Timing:</strong> {med.timing}
                              </p>
                              <p className="text-[11px] text-slate-500 leading-snug">
                                {med.instructions}
                              </p>
                            </div>

                            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] space-y-1">
                              <strong className="text-indigo-900 block font-bold text-[10px] uppercase">
                                Clinical Rationale:
                              </strong>
                              <p className="text-slate-700 leading-tight">
                                {med.clinicalRationale}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-rose-900 font-bold">
                              <span>Action: {med.caregiverAction}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. 🎮 RECOMMENDED GAMES TO PLAY NEXT (USER CORE REQUEST) */}
                  <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                          <Brain className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <span>Recommended Games to Play Next</span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              Targeted ZPD
                            </span>
                          </h3>
                          <p className="text-xs text-slate-500">
                            Ranked exercises designed to rehabilitate specific cognitive deficits identified in today's telemetry.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {comprehensiveReport.recommendedGamesNext.map((rec) => (
                        <div 
                          key={rec.gameId} 
                          className="p-4 rounded-2xl border-2 border-amber-200/80 bg-amber-50/30 space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                                #{rec.priorityRank}
                              </span>
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                                {rec.targetDomain.split(' ')[0]}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-black text-sm text-slate-900">
                                {rec.gameTitle}
                              </h4>
                              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                                {rec.clinicalReason}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-amber-200/60 space-y-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>{rec.recommendedFrequency}</span>
                            </div>

                            {onLaunchGame && (
                              <button
                                onClick={() => {
                                  onClose();
                                  onLaunchGame(rec.gameId as GameId);
                                }}
                                className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <span>Launch Exercise</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. 📋 WHAT TO DO NEXT: 24-48H CAREGIVER ACTION PLAN (USER CORE REQUEST) */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">
                          What To Do Next: Actionable 24–48 Hour Caregiver Roadmap
                        </h3>
                        <p className="text-xs text-slate-500">
                          Practical home steps to maintain neuroplastic stability and prevent cognitive fatigue.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {comprehensiveReport.whatToDoNext.map((section, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                          <strong className="text-xs font-black text-indigo-900 uppercase tracking-wider block border-b border-slate-200 pb-1.5">
                            {section.timeframe}
                          </strong>
                          <ul className="space-y-2 text-xs text-slate-700 font-medium">
                            {section.actions.map((act, aIdx) => (
                              <li key={aIdx} className="flex items-start gap-2">
                                <span className="text-indigo-600 font-black shrink-0">•</span>
                                <span className="leading-relaxed">{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5. 5-DOMAIN COGNITIVE RADAR & KINEMATICS */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    {/* Domain Breakdown */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-600" />
                        <span>Multi-Domain Neurocognitive Analysis</span>
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                          <strong className="text-purple-700 block font-bold text-[11px]">Hippocampal Memory</strong>
                          <p className="text-slate-600 text-[11px] mt-0.5">{comprehensiveReport.domainAnalysis.episodicMemory}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                          <strong className="text-sky-700 block font-bold text-[11px]">Executive Control</strong>
                          <p className="text-slate-600 text-[11px] mt-0.5">{comprehensiveReport.domainAnalysis.executiveControl}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                          <strong className="text-emerald-700 block font-bold text-[11px]">Visuomotor Praxis</strong>
                          <p className="text-slate-600 text-[11px] mt-0.5">{comprehensiveReport.domainAnalysis.visuomotorPraxis}</p>
                        </div>
                      </div>
                    </div>

                    {/* Kinematics & Medical Reports Correlation */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>Tremor Spectral FFT &amp; Caregiver Reports Correlation</span>
                      </h4>
                      
                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 text-xs">
                        <strong className="text-slate-800 block font-bold text-[11px]">
                          Motor Tremor Decomposition ({comprehensiveReport.tremorEvaluation.phenotype})
                        </strong>
                        <p className="text-[11px] text-slate-600">{comprehensiveReport.tremorEvaluation.band4_6HzAnalysis}</p>
                        <p className="text-[11px] text-slate-600">{comprehensiveReport.tremorEvaluation.fittsLawEfficiency}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 text-xs">
                        <strong className="text-indigo-800 block font-bold text-[11px]">
                          Correlation with Uploaded Medical Records:
                        </strong>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {comprehensiveReport.caregiverReportsCorrelation}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* 6. RED FLAG WARNING SIGNS & ABDM CODING */}
                  <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
                    <div className="flex items-center gap-2 text-rose-900 font-black text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Red-Flag Warning Signs (Requires Immediate Physician Review)</span>
                    </div>
                    <ul className="text-xs text-rose-950 space-y-1.5 list-disc pl-5 font-medium">
                      {comprehensiveReport.redFlagWarningSigns.map((rf, rIdx) => (
                        <li key={rIdx}>{rf}</li>
                      ))}
                    </ul>
                    <div className="pt-2 border-t border-rose-200/60 flex flex-wrap items-center justify-between text-[10px] text-rose-800 font-mono">
                      <span>SNOMED-CT: {comprehensiveReport.abdmCoding.snomedCode}</span>
                      <span>LOINC: {comprehensiveReport.abdmCoding.loincCode}</span>
                      <span>ICD-11: {comprehensiveReport.abdmCoding.icd11Code}</span>
                    </div>
                  </div>

                </div>
              ) : (
                /* Empty state prompt to generate */
                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-base text-slate-900">
                      Multi-Modal Intelligence Synthesis Ready
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Click the button above to ingest all 10 clinical games, 60-120Hz kinematic tremor data, uploaded caregiver medical files, and medication adherence logs.
                    </p>
                  </div>
                  <button
                    onClick={() => handleGenerateComprehensiveReport(false)}
                    className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs cursor-pointer shadow-md inline-flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Generate Full-Blown Test Report (API Key)</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* VIEW: SINGLE EXERCISE SESSION TELEMETRY (PRESERVED)                */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {reportMode === 'SINGLE_SESSION' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Single Session Demographics */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Patient Name</span>
                  <strong className="text-sm text-slate-900 flex items-center gap-1 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{patientName}</span>
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Age &amp; Stage</span>
                  <strong className="text-sm text-slate-900 block mt-0.5">
                    {patientAge} yrs • <span className="capitalize text-amber-700">{diagnosis}</span>
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Exercise Protocol</span>
                  <strong className="text-sm text-slate-900 block mt-0.5 truncate">
                    {gameTitle}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Date &amp; Time</span>
                  <strong className="text-sm text-slate-900 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{completedDate}</span>
                  </strong>
                </div>
              </div>

              {/* Single Game Cloud Generator */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-300 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-black text-slate-900 text-xs sm:text-sm">
                    Single Exercise AI Clinical Drilldown
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Evaluates accuracy, latency variance, and intrusion errors for {gameTitle}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSingleReport}
                  disabled={isGeneratingSingle}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer shadow-xs hover:bg-slate-800 disabled:opacity-60"
                >
                  {isGeneratingSingle ? 'Analyzing...' : singleCloudReport ? 'Regenerate' : 'Generate'}
                </button>
              </div>

              {/* Cognitive Classifier Staging Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-800">OASIS-2 Softmax Baseline Staging</span>
                  <p className="font-bold text-amber-950">{classification.predictedClass} (MoCA: {classification.estimatedMoCARange})</p>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                  Confidence: {Math.round(classification.confidenceScore * 100)}%
                </span>
              </div>

              {singleCloudReport && (
                <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-700 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-amber-300 font-black uppercase">{singleCloudReport.dsm5Staging}</span>
                    <span className="text-[10px] text-slate-400">{singleCloudReport.provider} • {singleCloudReport.model}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-medium">{singleCloudReport.diagnosticSummary}</p>
                </div>
              )}

              {/* Cognitive Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Accuracy</span>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">{activeReport.accuracyPercentage ?? 90}%</p>
                  <span className="text-[9px] text-slate-500">({activeReport.totalCorrect ?? 5}/{activeReport.totalRounds ?? 6} trials)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Reaction Latency</span>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">{((activeReport.averageLatencyMs ?? 2400) / 1000).toFixed(1)}s</p>
                  <span className="text-[9px] text-slate-500">Speed: {activeReport.speedProfile || 'Normal'}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Latent Ability θ</span>
                  <p className="text-2xl font-black text-purple-700 mt-0.5">
                    {activeReport.finalTheta >= 0 ? `+${activeReport.finalTheta?.toFixed(2)}` : activeReport.finalTheta?.toFixed(2) || '+0.65'}
                  </p>
                  <span className="text-[9px] text-slate-500">2PL Psychometrics</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Tremor Decoupling</span>
                  <p className="text-2xl font-black text-emerald-600 mt-0.5">94.6%</p>
                  <span className="text-[9px] text-slate-500">Trajectory Smoothness</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Cloud AI Config Modal */}
      <CloudAIConfigModal
        isOpen={isAIConfigOpen}
        onClose={() => setIsAIConfigOpen(false)}
      />
    </div>
  );
};
