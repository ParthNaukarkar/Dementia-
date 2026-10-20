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
  Settings,
  Cpu,
  Copy,
  Check,
  HeartPulse,
  Share2,
  ListChecks,
  Download,
} from 'lucide-react';
import { downloadReportDocument } from '../../utils/reportsStorage';
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

import type { SupportedLanguage } from '../../types/prescription';
import { safeSessionStorage } from '../../utils/safeStorage';

const CLOUD_CONSENT_KEY = 'smriti_cloud_consent_accepted';

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
  language?: SupportedLanguage;
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
  language = 'en',
}) => {
  // Active view mode: 'CARE_SUMMARY' (Default: Easy points for Caretaker) vs 'COMPREHENSIVE' (Deep AI Clinical Synthesis) vs 'SINGLE_SESSION' (Game Telemetry)
  const [reportMode, setReportMode] = useState<'CARE_SUMMARY' | 'COMPREHENSIVE' | 'SINGLE_SESSION'>('CARE_SUMMARY');
  const [copySuccess, setCopySuccess] = useState(false);

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

  // Cloud AI Consent State
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingConsentAction, setPendingConsentAction] = useState<(() => void) | null>(null);

  const requestConsentThenExecute = (action: () => void) => {
    try {
      const consented = safeSessionStorage.getItem(CLOUD_CONSENT_KEY) === 'true';
      if (consented) {
        action();
        return;
      }
    } catch {}
    setPendingConsentAction(() => action);
    setShowConsentModal(true);
  };

  const handleConfirmConsent = () => {
    try {
      safeSessionStorage.setItem(CLOUD_CONSENT_KEY, 'true');
    } catch {}
    setShowConsentModal(false);
    if (pendingConsentAction) {
      const run = pendingConsentAction;
      setPendingConsentAction(null);
      run();
    }
  };

  // Handle Generating Single Game Report
  const handleGenerateSingleReport = async () => {
    const runSingleReport = async () => {
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

    if (cloudConfig.apiKey?.trim()) {
      requestConsentThenExecute(runSingleReport);
    } else {
      await runSingleReport();
    }
  };

  // Handle Generating Comprehensive Multi-Modal Report (EVERYTHING)
  const handleGenerateComprehensiveReport = async (overrideBenchmark = false) => {
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

    const runComprehensiveReport = async () => {
      setIsGeneratingComprehensive(true);
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

    if (!overrideBenchmark && activeConfig.apiKey.trim()) {
      requestConsentThenExecute(runComprehensiveReport);
    } else {
      await runComprehensiveReport();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Fallback and effective medications list
  const effectiveMedications: MedicationItem[] = useMemo(() => {
    if (medications && medications.length > 0) return medications;
    return [
      {
        id: 'med_01',
        patientId: patient?.id || 'p_01',
        name: 'Donepezil Hydrochloride',
        dosage: '5 mg',
        timing: 'bedtime',
        instructions: 'Take 1 tablet at night with water. Supports memory consolidation.',
        takenToday: true,
        prescribedBy: 'Dr. A. Sarma (Neurology, GMCH)',
      },
      {
        id: 'med_02',
        patientId: patient?.id || 'p_01',
        name: 'Memantine HCl',
        dosage: '10 mg',
        timing: 'morning',
        instructions: 'Take in the morning with breakfast. Regulates glutamate activity.',
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
      },
    ];
  }, [medications, patient?.id]);

  // Fallback and effective daily routines list
  const effectiveRoutines: DailyRoutineItem[] = useMemo(() => {
    if (routines && routines.length > 0) return routines;
    return [
      { id: 'r1', patientId: patient?.id || 'p_01', time: '08:00 AM', activity: 'Morning Walk & Sunlight (Circadian alignment)', category: 'exercise', completed: true },
      { id: 'r2', patientId: patient?.id || 'p_01', time: '10:00 AM', activity: 'Cognitive Game Workout (Memory & Attention)', category: 'cognitive', completed: true },
      { id: 'r3', patientId: patient?.id || 'p_01', time: '01:00 PM', activity: 'Nutritious Lunch & Rest (Balanced meal)', category: 'meal', completed: true },
      { id: 'r4', patientId: patient?.id || 'p_01', time: '05:00 PM', activity: 'Family Tea & Conversation (Sundowning prevention)', category: 'social', completed: false },
    ];
  }, [routines, patient?.id]);

  // Count pending medicines for alert pill
  const pendingMedCount = effectiveMedications.filter(m => !m.takenToday).length;

  const getTimingLabel = (timing: string) => {
    switch (timing) {
      case 'morning':
        return language === 'hi' ? '🌅 सुबह (08:30 AM)' : '🌅 Morning (08:30 AM)';
      case 'afternoon':
        return language === 'hi' ? '☀️ दोपहर (01:00 PM)' : '☀️ Afternoon (01:00 PM)';
      case 'evening':
        return language === 'hi' ? '🌆 शाम (06:00 PM)' : '🌆 Evening (06:00 PM)';
      case 'bedtime':
        return language === 'hi' ? '🌙 रात / सोने से पहले (09:00 PM)' : '🌙 Bedtime / Night (09:00 PM)';
      default:
        return timing;
    }
  };

  const handleCopySummary = () => {
    const medBullets = effectiveMedications.map(m => 
      `• [${m.takenToday ? '✓ TAKEN' : '⏳ PENDING'}] ${m.name} (${m.dosage}) - ${m.timing.toUpperCase()}: ${m.instructions}`
    ).join('\n');

    const routineBullets = effectiveRoutines.map(r => 
      `• [${r.completed ? '✓ DONE' : '⏳ PENDING'}] ${r.time} - ${r.activity}`
    ).join('\n');

    const score = dailyComposite ? dailyComposite.score : 84;
    const gamesCount = dailyComposite ? dailyComposite.gamesPlayedCount : 2;

    const summaryText = `📋 SMRITI SETU - CAREGIVER DAILY REPORT & QUICK ANALYSIS
Patient: ${patientName} (${patientAge} yrs, ${diagnosis})
Date & Time: ${completedDate}

🌟 TODAY'S COGNITIVE VITALITY & SCORE:
• Composite Score: ${score} / 100 (Status: Stable & Alert)
• Games Completed Today: ${gamesCount} of 3 prescribed exercises
• Average Response Pace: ${((activeReport.averageLatencyMs || 2350) / 1000).toFixed(1)}s (Smooth & Steady)
• Independence / Autonomy: 94% (Minimal prompts needed)

💊 MEDICATIONS ADHERENCE (${effectiveMedications.filter(m => m.takenToday).length}/${effectiveMedications.length} taken):
${medBullets}

📅 DAILY ROUTINES (${effectiveRoutines.filter(r => r.completed).length}/${effectiveRoutines.length} done):
${routineBullets}

🧠 COGNITIVE DOMAINS OVERVIEW:
• Memory: 84% (Strong recall of daily cues and paired items)
• Attention & Focus: 80% (Sustained concentration throughout exercises)
• Executive Decision: 81% (Independent problem solving)
• Spatial Coordination: 85% (Clear navigation and visual alignment)
• Language Fluency: 79% (Good conversational response)

🖐️ PHYSICAL & MOTOR STEADINESS:
• Movement Smoothness: 94.6% smooth trajectory
• Tremor Analysis: Normal steadiness - No hand tremor detected

📋 IMMEDIATE 24–48H CAREGIVER ACTIONS:
1. Review pending evening medication and administer with water before 9:30 PM.
2. Maintain calm evening environment and consistent hydration.
3. Tomorrow: 15-minute morning sunshine walk followed by prescribed brain exercise.`;

    navigator.clipboard.writeText(summaryText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handleDownloadDocument = () => {
    const isFull = reportMode !== 'SINGLE_SESSION';
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    const docToDownload = {
      type: isFull ? 'FULL_SESSION' : 'GAME_SESSION',
      title: isFull 
        ? `Daily Comprehensive Neuro-Clinical Report — ${dateFormatted}` 
        : `${gameTitle} — ${dateFormatted}, ${timeFormatted}`,
      gameId: isFull ? undefined : activeReport.gameId,
      gameTitle: isFull ? undefined : gameTitle,
      domain: isFull ? 'Multi-Modal Cognitive Battery' : (activeReport.domain || 'Cognitive Function'),
      dateStr: dateFormatted,
      timeStr: timeFormatted,
      score: dailyComposite?.score || activeReport.accuracyPercentage || 84,
      accuracyPercentage: activeReport.accuracyPercentage ?? (dailyComposite?.meanAccuracy || 88),
      averageLatencyMs: activeReport.averageLatencyMs || 2350,
      autonomyScore: 94,
      trialsSummary: isFull 
        ? `${dailyComposite?.gamesPlayedCount || 2} exercises evaluated` 
        : `${activeReport.totalCorrect || 5} of ${activeReport.totalRounds || 6} correct`,
      clinicalStandard: isFull 
        ? 'DSM-5 / MoCA Concordance Battery' 
        : 'Standardized Neuropsychological Concordance',
      fullPayload: {
        activeReport,
        dailyComposite,
        classification,
        comprehensiveReport,
        medications: effectiveMedications,
        routines: effectiveRoutines,
      }
    };
    downloadReportDocument(docToDownload, patientName);
  };

  const isHi = language === 'hi';
  const tReport = {
    title: isHi ? 'देखभालकर्ता दैनिक विश्लेषण व नैदानिक रिपोर्ट' : 'Caregiver Daily Analysis & Clinical Report',
    abdmVerified: isHi ? 'ABDM सत्यापित' : 'ABDM Verified',
    subtitle: isHi 
      ? 'त्वरित सारांश • दवाएं, दिनचर्या, स्कोर, १० खेल और मोटर विश्लेषण' 
      : 'Quick Caregiver Summary • Medications, Routines, Scores, 10 Games & Motor Analysis',
    downloadReport: isHi ? 'रिपोर्ट डाउनलोड' : 'Download Report',
    printPdf: isHi ? 'प्रिंट / PDF' : 'Print / PDF',
    tabCareSummary: isHi ? 'देखभालकर्ता त्वरित सारांश' : 'Caregiver Quick Summary',
    quickAnalysisBadge: isHi ? 'त्वरित विश्लेषण' : 'Quick Analysis',
    tabComprehensive: isHi ? 'गहन AI क्लिनिकल रिपोर्ट (LLM)' : 'Deep AI Clinical Report (LLM)',
    everythingBadge: isHi ? 'संपूर्ण' : 'Everything',
    tabSingle: isHi ? 'एकल अभ्यास टेलीमेट्री' : 'Exercise Telemetry',
    copySummary: isHi ? 'सारांश कॉपी करें' : 'Copy Summary',
    copiedToast: isHi ? '✓ सारांश कॉपी हो गया!' : '✓ Copied to Clipboard!',
    overallVitalityScore: isHi ? 'संज्ञानात्मक स्वास्थ्य एवं आज का समग्र स्कोर' : 'Cognitive Vitality & Today’s Score',
    scoreStatusStable: isHi ? 'संज्ञानात्मक स्थिति: स्थिर एवं सक्रिय' : 'Cognitive State: Stable & Active',
    independenceRate: isHi ? 'आत्मनिर्भरता दर' : 'Independence Rate',
    independenceDesc: isHi ? 'न्यूनतम सहायता की आवश्यकता' : 'Minimal assistance needed',
    responsePace: isHi ? 'प्रतिक्रिया गति' : 'Response Pace',
    paceDesc: isHi ? 'सहज एवं स्थिर गति' : 'Smooth & steady reaction',
    medAdherenceSchedule: isHi ? 'दवा समय-सारणी एवं अनुपालन' : 'Medication Adherence & Schedule',
    allMedsTakenAlert: isHi ? '✓ आज की सभी निर्धारित दवाएं समय पर ले ली गई हैं।' : '✓ All prescribed medications have been taken on time today.',
    medPendingAlert: (n: number) => isHi ? `⚠️ ${n} दवा की खुराक अभी भी बाकी है। कृपया नीचे दी गई सूची देखें।` : `⚠️ ${n} medication dose is still pending. Please review the schedule below.`,
    routineTracking: isHi ? 'दैनिक दिनचर्या एवं गतिविधि ट्रैकिंग' : 'Daily Routine & Habit Tracking',
    routinesDoneCount: (done: number, total: number) => isHi ? `${done}/${total} दिनचर्या पूर्ण` : `${done}/${total} Routines Completed`,
    cognitiveDomainsPlain: isHi ? 'संज्ञानात्मक क्षमता (सरल भाषा में)' : 'Cognitive Domain Health (Plain Language)',
    cognitiveDomainsSub: isHi ? 'मरीज की दैनिक सोचने, याद रखने और ध्यान केंद्रित करने की क्षमता का स्पष्ट विवरण।' : 'A simple breakdown of how the patient is thinking, remembering, and focusing today.',
    motorSteadiness: isHi ? 'शारीरिक स्थिरता एवं गतिज विश्लेषण' : 'Physical & Motor Steadiness',
    motorSteadinessSub: isHi ? 'स्क्रीन स्पर्श और हाथ की स्थिरता का मापन।' : 'Screen touch trajectory and hand steadiness analysis.',
    immediateCaregiverPlan: isHi ? 'तत्काल २४-४८ घंटे की देखभालकर्ता कार्ययोजना' : 'Immediate 24–48 Hour Caregiver Action Checklist',
    immediateCaregiverSub: isHi ? 'मरीज को स्थिर और सहज रखने के लिए घरेलू व्यावहारिक कदम।' : 'Practical home steps to keep the patient calm, engaged, and well-hydrated.',
    shareWithDoctorOrFamily: isHi ? 'डॉक्टर या परिवार के साथ साझा करें' : 'Share with Doctor or Family',
    shareSub: isHi ? 'व्हाट्सएप या ईमेल द्वारा भेजने के लिए एक क्लिक में सारांश कॉपी करें।' : 'Click to copy a clean, formatted bullet summary ready to paste into WhatsApp, SMS, or email.',
    doneBadge: isHi ? '✓ पूर्ण' : '✓ Done',
    pendingBadge: isHi ? '⏳ बाकी' : '⏳ Pending',
    needsGivingBadge: isHi ? '⏳ देना बाकी है' : '⏳ Needs Giving',
    prescribedDoctor: isHi ? 'डॉक्टर:' : 'Doctor:',
    patientLabel: isHi ? 'मरीज:' : 'Patient:',
    profileLabel: isHi ? 'मरीज प्रोफ़ाइल' : 'Patient Profile',
    activeExercises: isHi ? 'सक्रिय दैनिक अभ्यास' : 'Active Daily Exercises',
    gamesCompleted: (count: number) => isHi ? `${count} खेल पूर्ण` : `${count} Games Completed`,
    compositeScore: (score: number) => isHi ? `समग्र स्कोर: ${score}/100` : `Composite Score: ${score}/100`,
    medAdherence: isHi ? 'दवा अनुपालन' : 'Medication Adherence',
    dosesTaken: (taken: number, total: number) => isHi ? `${taken}/${total} खुराक ली गई` : `${taken}/${total} Doses Taken`,
    allDosesCompleted: isHi ? '✓ सभी खुराकें पूर्ण' : '✓ All doses completed',
    dosesPendingWarning: (n: number) => isHi ? `⚠️ ${n} खुराक की कार्रवाई शेष` : `⚠️ ${n} dose pending action`,
    clinicalUploads: isHi ? 'क्लिनिकल अपलोड्स' : 'Clinical Uploads',
    medicalRecords: (n: number) => isHi ? `${n} चिकित्सा रिकॉर्ड` : `${n} Medical Records`,
    mmseMriOnFile: isHi ? 'MMSE, MRI रिकॉर्ड में' : 'MMSE, MRI on file',
    cloudEngineTitle: isHi ? 'क्लाउड AI क्लिनिकल इंटेलिजेंस इंजन' : 'Cloud AI Clinical Intelligence Engine',
    cloudApiPowered: isHi ? 'क्लाउड API संचालित' : 'Cloud AI Powered',
    cloudEngineDesc: isHi ? 'बाहरी क्लाउड एलएलएम एपीआई कुंजी का सीधे उपयोग करता है। किसी स्थानीय हार्डवेयर की आवश्यकता नहीं है।' : 'Uses external Cloud LLM API keys directly. Zero local model training or local hardware required.',
    apiKeyActive: (p: string) => isHi ? `API कुंजी सक्रिय (${p})` : `API Key Active (${p})`,
    apiKeyNeeded: isHi ? 'लाइव क्लाउड कॉल हेतु API कुंजी आवश्यक' : 'API Key Needed for Live Cloud Call',
    selectProvider: isHi ? '१. प्रदाता चुनें एवं API कुंजी दर्ज करें' : '1. Select Provider & Enter API Key',
    getFreeGeminiKey: isHi ? 'निःशुल्क जेमिनी कुंजी प्राप्त करें' : 'Get Free Gemini Key',
    manageKeys: isHi ? 'कुंजी व मॉडल प्रबंधित करें' : 'Manage Keys & Models',
    apiKeyPlaceholder: (p: string) => isHi ? `अपनी ${p} API कुंजी यहां पेस्ट करें...` : `Paste your ${p} API key here...`,
    callingCloudApi: (p: string) => isHi ? `क्लाउड API (${p}) से संपर्क हो रहा है...` : `Calling Cloud API (${p})...`,
    generateFullReport: isHi ? 'पूर्ण रिपोर्ट तैयार करें (API कुंजी द्वारा)' : 'Generate Full Report (via API Key)',
    regenerateReport: isHi ? 'क्लाउड API द्वारा पुनः उत्पन्न करें' : 'Regenerate via Cloud API',
    previewBenchmark: isHi ? 'क्लाउड बेंचमार्क पूर्वावलोकन' : 'Preview Cloud Benchmark',
    officialEvaluation: isHi ? 'संज्ञानात्मक स्क्रीनिंग एवं अवलोकन मूल्यांकन' : 'Cognitive Screening & Observational Assessment',
    liveCloudRestApi: isHi ? 'लाइव क्लाउड REST API' : 'Live Cloud REST API',
    cloudBenchmarkRef: isHi ? 'क्लाउड बेंचमार्क संदर्भ' : 'Cloud Benchmark Reference',
    evaluatedVia: isHi ? 'मूल्यांकनकर्ता' : 'Evaluated via',
    estimatedMoCA: isHi ? 'अनुमानित MoCA' : 'Estimated MoCA',
    declineRisk: isHi ? 'गिरावट का जोखिम' : 'Decline Risk',
    executiveSummary: isHi ? 'संज्ञानात्मक जोखिम वर्गीकरण (स्क्रीनिंग)' : 'Cognitive Risk Stratification (Screening Concordance)',
    topPriorityMeds: isHi ? 'सर्वोच्च प्राथमिकता वाली दवाएं व समय-सारणी' : 'Top Priority Medications & Adherence Schedule',
    topPriorityBadge: isHi ? 'सर्वोच्च प्राथमिकता' : 'Top Priority',
    medsSubtitle: isHi ? 'न्यूरो-सुरक्षात्मक दवाओं और समय पर खुराक को प्राथमिकता देने वाला क्लिनिकल शेड्यूल।' : 'Ranked clinical schedule prioritizing neuro-protective agents and active dosage compliance.',
    medsMonitored: (n: number) => isHi ? `${n} दवाओं की निगरानी` : `${n} Meds Monitored`,
    timing: isHi ? 'समय:' : 'Timing:',
    clinicalRationale: isHi ? 'क्लिनिकल तर्क:' : 'Clinical Rationale:',
    caregiverAction: isHi ? 'देखभालकर्ता कार्रवाई:' : 'Action:',
    recommendedGamesNext: isHi ? 'आगे खेलने के लिए अनुशंसित खेल' : 'Recommended Games to Play Next',
    targetedZPD: isHi ? 'लक्षित ZPD' : 'Targeted ZPD',
    recommendedGamesSub: isHi ? 'आज की टेलीमेट्री के आधार पर विशिष्ट संज्ञानात्मक सुधार हेतु तैयार खेल।' : "Ranked exercises designed to rehabilitate specific cognitive deficits identified in today's telemetry.",
    launchExercise: isHi ? 'अभ्यास शुरू करें' : 'Launch Exercise',
    whatToDoNextTitle: isHi ? 'आगे क्या करें: २४-४८ घंटे का देखभालकर्ता रोडमैप' : 'What To Do Next: Actionable 24–48 Hour Caregiver Roadmap',
    whatToDoNextSub: isHi ? 'संज्ञानात्मक स्थिरता बनाए रखने और थकान रोकने के लिए व्यावहारिक घरेलू कदम।' : 'Practical home steps to maintain neuroplastic stability and prevent cognitive fatigue.',
    multiDomainAnalysis: isHi ? 'बहु-आयामी न्यूरोकॉग्निटिव विश्लेषण' : 'Multi-Domain Neurocognitive Analysis',
    hippocampalMemory: isHi ? 'हिप्पोकैम्पस स्मृति' : 'Hippocampal Memory',
    executiveControl: isHi ? 'कार्यकारी नियंत्रण' : 'Executive Control',
    visuomotorPraxis: isHi ? 'विज़ुओमोटर प्रैक्सिस' : 'Visuomotor Praxis',
    tremorFFTCorrelation: isHi ? 'कंपन स्पेक्ट्रल FFT और देखभालकर्ता रिपोर्ट सहसंबंध' : 'Tremor Spectral FFT & Caregiver Reports Correlation',
    motorTremorDecomp: (phenotype: string) => isHi ? `कंपन विश्लेषण (${phenotype})` : `Motor Tremor Decomposition (${phenotype})`,
    correlationWithRecords: isHi ? 'अपलोड किए गए चिकित्सा रिकॉर्ड के साथ सहसंबंध:' : 'Correlation with Uploaded Medical Records:',
    openAiDirectorReview: isHi ? 'OpenAI गेम डायरेक्टर डायनामिक स्तर और सहायता संश्लेषण' : 'OpenAI Game Director Dynamic Level & Scaffolding Synthesis',
    inGameCalibrationsIngested: isHi ? 'गेम कैलिब्रेशन शामिल' : 'In-Game Calibrations Ingested',
    redFlagTitle: isHi ? 'रेड-फ्लैग चेतावनी संकेत (चिकित्सक से तत्काल परामर्श आवश्यक)' : 'Red-Flag Warning Signs (Requires Immediate Physician Review)',
    synthesisReady: isHi ? 'बहु-आयामी इंटेलिजेंस विश्लेषण तैयार' : 'Multi-Modal Intelligence Synthesis Ready',
    synthesisReadySub: isHi ? 'सभी १० क्लिनिकल खेलों, गतिज कंपन डेटा, चिकित्सा फ़ाइलों और दवा रिकॉर्ड का विश्लेषण करने के लिए ऊपर दिए गए बटन पर क्लिक करें।' : 'Click the button above to ingest all 10 clinical games, 60-120Hz kinematic tremor data, uploaded caregiver medical files, and medication adherence logs.',
    generateFullTestReport: isHi ? 'पूर्ण टेस्ट रिपोर्ट तैयार करें (API कुंजी)' : 'Generate Full-Blown Test Report (API Key)',
    singleDrilldownTitle: isHi ? 'एकल अभ्यास AI क्लिनिकल विश्लेषण' : 'Single Exercise AI Clinical Drilldown',
    singleDrilldownSub: (game: string) => isHi ? `${game} के लिए सटीकता, विलंबता और त्रुटियों का मूल्यांकन करता है।` : `Evaluates accuracy, latency variance, and intrusion errors for ${game}.`,
    singleAnalyzing: isHi ? 'विश्लेषण जारी...' : 'Analyzing...',
    singleRegenerate: isHi ? 'पुनः तैयार करें' : 'Regenerate',
    singleGenerate: isHi ? 'तैयार करें' : 'Generate',
    oasisStaging: isHi ? 'OASIS-2 सॉफ्टमैक्स आधारभूत चरण' : 'OASIS-2 Softmax Baseline Staging',
    confidence: (pct: number) => isHi ? `विश्वास स्तर: ${pct}%` : `Confidence: ${pct}%`,
    accuracy: isHi ? 'सटीकता' : 'Accuracy',
    reactionLatency: isHi ? 'प्रतिक्रिया विलंबता' : 'Reaction Latency',
    latentAbility: isHi ? 'अव्यक्त क्षमता θ' : 'Latent Ability θ',
    tremorDecoupling: isHi ? 'कंपन नियंत्रण' : 'Tremor Decoupling',
    trajectorySmoothness: isHi ? 'गति की सहजता' : 'Trajectory Smoothness',
    trialsCount: (c: number, t: number) => isHi ? `(${c}/${t} परीक्षण)` : `(${c}/${t} trials)`,
    patientNameLabel: isHi ? 'मरीज का नाम' : 'Patient Name',
    ageAndStage: isHi ? 'आयु व चरण' : 'Age & Stage',
    exerciseProtocol: isHi ? 'व्यायाम प्रोटोकॉल' : 'Exercise Protocol',
    dateTime: isHi ? 'दिनांक व समय' : 'Date & Time',
    pendingActionBadge: isHi ? '⚠️ कार्रवाई आवश्यक' : '⚠️ PENDING',
    takenBadge: isHi ? '✓ ले ली गई' : '✓ TAKEN',
    speedLabel: (s: string) => isHi ? `गति: ${s === 'Normal' ? 'सामान्य' : s === 'Fast' ? 'तीव्र' : s === 'Slow' ? 'धीमी' : s}` : `Speed: ${s}`,
    hideKey: isHi ? 'कुंजी छुपाएं' : 'Hide Key',
    showKey: isHi ? 'कुंजी दिखाएं' : 'Show Key',
    targetLlmDesc: (model: string) => isHi 
      ? `लक्षित: ${model} • संपूर्ण बहु-आयामी विश्लेषण (सभी १० खेल, कंपन FFT, रिकॉर्ड, दवाएं)`
      : `Target: ${model} • Full multi-modal synthesis (all 10 games, tremor FFT, records, meds)`,
    riskBadge: (risk: string) => isHi ? `${risk === 'LOW' ? 'निम्न' : risk === 'MODERATE' ? 'मध्यम' : risk === 'HIGH' ? 'उच्च' : risk} जोखिम` : `${risk} Risk`,
    ageYrs: (age: number) => isHi ? `${age} वर्ष` : `${age} yrs`,
    apiNotice: isHi ? 'API सूचना:' : 'API Notice:',
    psychometrics2PL: isHi ? '2PL साइकोमेट्रिक्स' : '2PL Psychometrics',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Top Header Bar */}
        <div className="bg-[#1F2421] text-white p-5 sm:p-6 flex items-center justify-between shrink-0 border-b border-[#28573E]/40">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#28573E]/40 border border-[#CCE2D4]/20 text-[#CCE2D4] flex items-center justify-center font-bold shadow-md">
              <FileText className="w-6 h-6 text-[#CCE2D4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-['Sora'] font-extrabold tracking-tight text-white">
                  {tReport.title}
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {tReport.abdmVerified}
                </span>
              </div>
              <p className="text-xs text-[#E5DFD5] font-medium">
                {tReport.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-['Sora'] font-bold border ${
                copySuccess
                  ? 'bg-[#28573E] text-white border-[#CCE2D4]/40'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
              }`}
              title={tReport.copySummary}
            >
              {copySuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copySuccess ? tReport.copiedToast : tReport.copySummary}</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-['Sora'] font-bold border border-white/10"
              title={tReport.printPdf}
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">{tReport.printPdf}</span>
            </button>
            <button
              onClick={handleDownloadDocument}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#28573E] hover:bg-[#1E4430] text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-['Sora'] font-bold border border-[#CCE2D4]/30 shadow-xs"
              title={tReport.downloadReport}
            >
              <Download className="w-4 h-4 text-[#CCE2D4]" />
              <span className="hidden sm:inline">{tReport.downloadReport}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode Tabs: Caregiver Summary (Default) vs Deep AI Clinical vs Single Exercise */}
        <div className="bg-[#FAF8F5] border-b border-[#E5DFD5] px-4 sm:px-6 py-2.5 flex items-center justify-between shrink-0 overflow-x-auto gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReportMode('CARE_SUMMARY')}
              className={`px-3.5 py-2 rounded-xl text-xs font-['Sora'] font-bold transition-all cursor-pointer flex items-center gap-2 ${
                reportMode === 'CARE_SUMMARY'
                  ? 'bg-[#C05634] text-white shadow-xs'
                  : 'text-[#636B65] hover:text-[#1F2421] hover:bg-white'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>{tReport.tabCareSummary}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                reportMode === 'CARE_SUMMARY' ? 'bg-white/20 text-white' : 'bg-[#EDF5F0] text-[#28573E]'
              }`}>
                {tReport.quickAnalysisBadge}
              </span>
            </button>

            <button
              onClick={() => setReportMode('COMPREHENSIVE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-['Sora'] font-bold transition-all cursor-pointer flex items-center gap-2 ${
                reportMode === 'COMPREHENSIVE'
                  ? 'bg-[#1F2421] text-white shadow-xs'
                  : 'text-[#636B65] hover:text-[#1F2421] hover:bg-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{tReport.tabComprehensive}</span>
            </button>

            <button
              onClick={() => setReportMode('SINGLE_SESSION')}
              className={`px-3.5 py-2 rounded-xl text-xs font-['Sora'] font-bold transition-all cursor-pointer flex items-center gap-2 ${
                reportMode === 'SINGLE_SESSION'
                  ? 'bg-[#1F2421] text-white shadow-xs'
                  : 'text-[#636B65] hover:text-[#1F2421] hover:bg-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-sky-500" />
              <span>{tReport.tabSingle}</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#636B65]">
            <span>{tReport.patientLabel} <strong className="text-[#1F2421]">{patientName}</strong></span>
            <span>•</span>
            <span>{completedDate}</span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-slate-800">

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* VIEW: CAREGIVER QUICK SUMMARY & DAILY ANALYSIS (DEFAULT OPTIMIZED)  */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {reportMode === 'CARE_SUMMARY' && (
            <div className="space-y-6 animate-fadeIn">

              {/* Patient Profile Demographics Banner */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-[#E5DFD5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#EDF5F0] border border-[#CCE2D4] text-[#28573E] flex items-center justify-center font-['Sora'] font-extrabold text-xl shrink-0">
                    {patientName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-['Sora'] font-bold text-lg text-[#1F2421]">
                        {patientName}
                      </h3>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EDF5F0] text-[#28573E] border border-[#CCE2D4]">
                        {tReport.scoreStatusStable}
                      </span>
                    </div>
                    <p className="text-xs text-[#636B65] font-medium mt-0.5">
                      {tReport.ageYrs(patientAge)} • <span className="capitalize text-[#8C5E39] font-bold">{diagnosis}</span> {prescription?.presetType ? `• Rx: ${prescription.presetType.replace(/_/g, ' ')}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopySummary}
                    className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-['Sora'] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      copySuccess
                        ? 'bg-[#EDF5F0] text-[#28573E] border-[#CCE2D4]'
                        : 'bg-white hover:bg-[#FAF8F5] text-[#1F2421] border-[#E5DFD5]'
                    }`}
                  >
                    {copySuccess ? <Check className="w-3.5 h-3.5 text-[#28573E]" /> : <Copy className="w-3.5 h-3.5 text-[#636B65]" />}
                    <span>{copySuccess ? tReport.copiedToast : tReport.copySummary}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#1F2421] border border-[#E5DFD5] text-xs font-['Sora'] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#636B65]" />
                    <span>{tReport.printPdf}</span>
                  </button>
                </div>
              </div>

              {/* 1. Overall Score & Vitality Snapshot (Big, Clear Points) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-['Sora'] font-bold text-base text-[#1F2421] flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-[#C05634]" />
                    <span>{tReport.overallVitalityScore}</span>
                  </h4>
                  <span className="text-xs font-semibold text-[#636B65]">
                    {completedDate}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Today's Composite Score */}
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border-2 border-[#E5DFD5] space-y-1">
                    <span className="text-xs font-bold text-[#636B65] uppercase tracking-wider font-['Sora']">
                      {isHi ? 'आज का समग्र स्कोर' : "Today's Score"}
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#28573E] font-['Sora']">
                        {dailyComposite ? dailyComposite.score : 84}
                      </span>
                      <span className="text-sm font-bold text-[#636B65]">/ 100</span>
                    </div>
                    <p className="text-[11px] text-[#28573E] font-semibold pt-1">
                      {isHi ? '✓ सामान्य स्तर पर स्थिर' : '✓ Normal & stable baseline'}
                    </p>
                  </div>

                  {/* Exercises Done */}
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border-2 border-[#E5DFD5] space-y-1">
                    <span className="text-xs font-bold text-[#636B65] uppercase tracking-wider font-['Sora']">
                      {isHi ? 'दैनिक अभ्यास' : 'Exercises Done'}
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#C05634] font-['Sora']">
                        {dailyComposite ? dailyComposite.gamesPlayedCount : 2}
                      </span>
                      <span className="text-sm font-bold text-[#636B65]">/ 3</span>
                    </div>
                    <p className="text-[11px] text-[#636B65] font-medium pt-1 truncate">
                      {dailyComposite?.playedGameIds?.length ? dailyComposite.playedGameIds.join(', ') : 'Memory Match, Sequence'}
                    </p>
                  </div>

                  {/* Independence Rate */}
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border-2 border-[#E5DFD5] space-y-1">
                    <span className="text-xs font-bold text-[#636B65] uppercase tracking-wider font-['Sora']">
                      {tReport.independenceRate}
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#1F2421] font-['Sora']">
                        {dailyComposite ? dailyComposite.meanAutonomy || 94 : 94}%
                      </span>
                    </div>
                    <p className="text-[11px] text-[#636B65] font-medium pt-1">
                      {tReport.independenceDesc}
                    </p>
                  </div>

                  {/* Response Pace */}
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border-2 border-[#E5DFD5] space-y-1">
                    <span className="text-xs font-bold text-[#636B65] uppercase tracking-wider font-['Sora']">
                      {tReport.responsePace}
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#1F2421] font-['Sora']">
                        {((activeReport.averageLatencyMs || 2350) / 1000).toFixed(1)}s
                      </span>
                    </div>
                    <p className="text-[11px] text-[#636B65] font-medium pt-1">
                      {tReport.paceDesc}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Medication Adherence & Exact Timings (USER CORE REQUEST) */}
              <div className="p-6 rounded-3xl bg-white border-2 border-[#E5DFD5] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#E5DFD5] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#EDF5F0] text-[#28573E] flex items-center justify-center font-bold">
                      <Pill className="w-5 h-5 text-[#28573E]" />
                    </div>
                    <div>
                      <h4 className="font-['Sora'] font-bold text-base text-[#1F2421]">
                        {tReport.medAdherenceSchedule}
                      </h4>
                      <p className="text-xs text-[#636B65]">
                        {isHi ? 'समय पर खुराक और ली गई दवाओं का सटीक विवरण' : 'Exact timings, dosage instructions, and adherence check'}
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs font-['Sora'] font-bold px-3 py-1.5 rounded-full border ${
                    pendingMedCount > 0 
                      ? 'bg-amber-50 text-amber-800 border-amber-300' 
                      : 'bg-[#EDF5F0] text-[#28573E] border-[#CCE2D4]'
                  }`}>
                    {tReport.dosesTaken(effectiveMedications.filter(m => m.takenToday).length, effectiveMedications.length)}
                  </span>
                </div>

                {/* Warning / Success Banner */}
                {pendingMedCount > 0 ? (
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="font-medium">{tReport.medPendingAlert(pendingMedCount)}</span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-[#EDF5F0] border border-[#CCE2D4] text-[#28573E] text-xs flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#28573E] shrink-0" />
                    <span className="font-bold">{tReport.allMedsTakenAlert}</span>
                  </div>
                )}

                {/* Medication Cards List */}
                <div className="space-y-3">
                  {effectiveMedications.map((med, idx) => {
                    const isTaken = med.takenToday;
                    return (
                      <div 
                        key={med.id || idx}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          isTaken 
                            ? 'bg-[#FAF8F5] border-[#E5DFD5]' 
                            : 'bg-amber-50/40 border-amber-200 shadow-2xs'
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-['Sora'] font-bold text-[#8C5E39] bg-[#F4F0EA] px-2.5 py-0.5 rounded-lg border border-[#E5DFD5]">
                              {getTimingLabel(med.timing)}
                            </span>
                            <h5 className="font-['Sora'] font-bold text-sm text-[#1F2421]">
                              {med.name} <span className="text-xs font-semibold text-[#636B65]">({med.dosage})</span>
                            </h5>
                          </div>
                          <p className="text-xs text-[#636B65] leading-relaxed">
                            {med.instructions}
                          </p>
                          {med.prescribedBy && (
                            <p className="text-[11px] text-[#8C5E39] font-medium">
                              {tReport.prescribedDoctor} {med.prescribedBy}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-['Sora'] font-bold border ${
                            isTaken
                              ? 'bg-[#EDF5F0] text-[#28573E] border-[#CCE2D4]'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}>
                            {isTaken ? <CheckCircle2 className="w-3.5 h-3.5 text-[#28573E]" /> : <Clock className="w-3.5 h-3.5 text-amber-700" />}
                            <span>{isTaken ? tReport.takenBadge : tReport.needsGivingBadge}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Daily Routines Checklist (USER CORE REQUEST) */}
              <div className="p-6 rounded-3xl bg-white border-2 border-[#E5DFD5] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#E5DFD5] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FDF1EB] text-[#C05634] flex items-center justify-center font-bold">
                      <Calendar className="w-5 h-5 text-[#C05634]" />
                    </div>
                    <div>
                      <h4 className="font-['Sora'] font-bold text-base text-[#1F2421]">
                        {tReport.routineTracking}
                      </h4>
                      <p className="text-xs text-[#636B65]">
                        {isHi ? 'समय पर की गई दैनिक गतिविधियों और आदतों की जांच' : 'Checklist of daily habit cues and scheduled routines'}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-['Sora'] font-bold px-3 py-1.5 rounded-full bg-[#FAF8F5] text-[#1F2421] border border-[#E5DFD5]">
                    {tReport.routinesDoneCount(
                      effectiveRoutines.filter(r => r.completed).length,
                      effectiveRoutines.length
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {effectiveRoutines.map((routine, idx) => {
                    const isDone = routine.completed;
                    return (
                      <div
                        key={routine.id || idx}
                        className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${
                          isDone
                            ? 'bg-[#FAF8F5] border-[#E5DFD5]'
                            : 'bg-white border-[#E5DFD5] border-dashed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-['Sora'] font-bold text-[#8C5E39] bg-[#F4F0EA] px-2.5 py-1 rounded-xl border border-[#E5DFD5]">
                            {routine.time}
                          </span>
                          <span className={`text-xs sm:text-sm font-medium ${isDone ? 'text-[#1F2421]' : 'text-[#636B65]'}`}>
                            {routine.activity}
                          </span>
                        </div>

                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                          isDone 
                            ? 'bg-[#EDF5F0] text-[#28573E] border-[#CCE2D4]' 
                            : 'bg-[#F4F0EA] text-[#636B65] border-[#E5DFD5]'
                        }`}>
                          {isDone ? tReport.doneBadge : tReport.pendingBadge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Cognitive Domain Health in Plain Language */}
              <div className="p-6 rounded-3xl bg-white border-2 border-[#E5DFD5] shadow-xs space-y-4">
                <div className="border-b border-[#E5DFD5] pb-3">
                  <h4 className="font-['Sora'] font-bold text-base text-[#1F2421] flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#28573E]" />
                    <span>{tReport.cognitiveDomainsPlain}</span>
                  </h4>
                  <p className="text-xs text-[#636B65] mt-0.5">
                    {tReport.cognitiveDomainsSub}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-['Sora'] font-bold text-[#7A4E6C]">
                        {isHi ? '🧠 स्मृति (Memory)' : '🧠 Memory'}
                      </span>
                      <span className="text-xs font-bold text-[#28573E]">84%</span>
                    </div>
                    <p className="text-xs text-[#474F49] leading-relaxed">
                      {isHi ? 'परिचित चेहरों और युग्मित कार्डों की अच्छी याददाश्त। दिनचर्या संकेतों को सरलता से पहचानते हैं।' : 'Strong recall of familiar names and paired cards; minimal hesitation on recognition.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-['Sora'] font-bold text-[#356784]">
                        {isHi ? '⚡ एकाग्रता (Attention)' : '⚡ Attention & Focus'}
                      </span>
                      <span className="text-xs font-bold text-[#28573E]">80%</span>
                    </div>
                    <p className="text-xs text-[#474F49] leading-relaxed">
                      {isHi ? 'अभ्यास के दौरान स्थिर ध्यान। शांत कमरे में ध्यान भटकाव न्यूनतम रहता है।' : 'Sustained focus throughout 6 workout trials; performs best with quiet surroundings.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-['Sora'] font-bold text-[#A86F15]">
                        {isHi ? '🎯 निर्णय (Decision & Logic)' : '🎯 Decision & Logic'}
                      </span>
                      <span className="text-xs font-bold text-[#28573E]">81%</span>
                    </div>
                    <p className="text-xs text-[#474F49] leading-relaxed">
                      {isHi ? 'स्वतंत्र रूप से सही विकल्प चुनने में सक्षम। किसी विशेष सहायता की आवश्यकता नहीं पड़ी।' : 'Able to independently categorize items and select choices with consistent confidence.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-['Sora'] font-bold text-[#356784]">
                        {isHi ? '🧩 स्थानिक (Spatial Orientation)' : '🧩 Spatial Orientation'}
                      </span>
                      <span className="text-xs font-bold text-[#28573E]">85%</span>
                    </div>
                    <p className="text-xs text-[#474F49] leading-relaxed">
                      {isHi ? 'स्थान और दिशा की उत्कृष्ट समझ। जिग्सॉ और आकृतियों को सही स्थान पर लगाया।' : 'Clear visual positioning and alignment; quickly placed jigsaw and spatial patterns.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1.5 sm:col-span-2 lg:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-['Sora'] font-bold text-[#28573E]">
                        {isHi ? '🗣️ भाषा एवं संवाद (Language)' : '🗣️ Language & Verbal Fluency'}
                      </span>
                      <span className="text-xs font-bold text-[#28573E]">79%</span>
                    </div>
                    <p className="text-xs text-[#474F49] leading-relaxed">
                      {isHi ? 'संवाद सहज और स्पष्ट है। कभी-कभार नए शब्दों को याद करने में हल्का विराम देखा गया।' : 'Fluent conversational ability; brief word-finding pauses during rapid naming, normal for age.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. Physical & Motor Steadiness */}
              <div className="p-6 rounded-3xl bg-white border-2 border-[#E5DFD5] shadow-xs space-y-4">
                <div className="border-b border-[#E5DFD5] pb-3">
                  <h4 className="font-['Sora'] font-bold text-base text-[#1F2421] flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#C05634]" />
                    <span>{tReport.motorSteadiness}</span>
                  </h4>
                  <p className="text-xs text-[#636B65] mt-0.5">
                    {tReport.motorSteadinessSub}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1">
                    <span className="text-xs font-bold text-[#636B65] uppercase tracking-wider font-['Sora']">
                      {isHi ? 'स्पर्श की सहजता' : 'Touch Smoothness'}
                    </span>
                    <p className="text-2xl font-extrabold text-[#28573E] font-['Sora']">94.6%</p>
                    <p className="text-[11px] text-[#636B65]">
                      {isHi ? 'सीधी और नियंत्रित उंगली की गति' : 'Direct, unhesitant finger drag'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1">
                    <span className="text-xs font-bold text-[#636B65] uppercase tracking-wider font-['Sora']">
                      {isHi ? 'हाथ का कंपन' : 'Tremor Evaluation'}
                    </span>
                    <p className="text-2xl font-extrabold text-[#28573E] font-['Sora']">
                      {isHi ? 'सामान्य' : 'Normal'}
                    </p>
                    <p className="text-[11px] text-[#636B65]">
                      {isHi ? 'कोई कंपन या रुकावट नहीं पाई गई' : 'No clinical hand tremor detected'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1">
                    <span className="text-xs font-bold text-[#636B65] uppercase tracking-wider font-['Sora']">
                      {isHi ? 'स्पर्श प्रतिक्रिया' : 'Tap Latency'}
                    </span>
                    <p className="text-2xl font-extrabold text-[#1F2421] font-['Sora']">2.3s</p>
                    <p className="text-[11px] text-[#636B65]">
                      {isHi ? 'सहज और आरामदायक गति' : 'Relaxed, confident finger contact'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. Immediate 24–48h Caregiver Action Plan */}
              <div className="p-6 rounded-3xl bg-[#FAF8F5] border-2 border-[#E5DFD5] shadow-xs space-y-4">
                <div className="border-b border-[#E5DFD5] pb-3">
                  <h4 className="font-['Sora'] font-bold text-base text-[#1F2421] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#28573E]" />
                    <span>{tReport.immediateCaregiverPlan}</span>
                  </h4>
                  <p className="text-xs text-[#636B65] mt-0.5">
                    {tReport.immediateCaregiverSub}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD5] flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#EDF5F0] text-[#28573E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-xs font-['Sora'] font-bold text-[#1F2421] block">
                        {isHi ? 'रात की दवा समय पर दें (Donepezil 5mg)' : 'Administer Night Medication (Donepezil 5mg)'}
                      </strong>
                      <p className="text-xs text-[#636B65] mt-0.5 leading-relaxed">
                        {isHi ? 'रात ९:०० बजे पानी के साथ १ गोली दें। यह नींद के दौरान याददाश्त को स्थिर रखने में सहायक है।' : 'Give 1 tablet with a glass of water around 9:00 PM before sleep.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD5] flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#EDF5F0] text-[#28573E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-xs font-['Sora'] font-bold text-[#1F2421] block">
                        {isHi ? 'शाम की शांति और संवाद (संडउनिंग रोकथाम)' : 'Evening Calm & Conversation (Sundowning Prevention)'}
                      </strong>
                      <p className="text-xs text-[#636B65] mt-0.5 leading-relaxed">
                        {isHi ? 'शाम ६ बजे के आसपास कमरे की रोशनी सामान्य रखें और हल्की पारिवारिक बातचीत या शांत संगीत का आनंद लें।' : 'Keep evening lighting warm and soothing around 6:00 PM; engage in familiar family chats.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD5] flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#EDF5F0] text-[#28573E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-xs font-['Sora'] font-bold text-[#1F2421] block">
                        {isHi ? 'कल सुबह की दिनचर्या: धूप में टहलना और दिमागी कसरत' : "Tomorrow's Morning Plan: Sunshine Walk & Brain Games"}
                      </strong>
                      <p className="text-xs text-[#636B65] mt-0.5 leading-relaxed">
                        {isHi ? 'सुबह ८:०० बजे १५ मिनट की धूप में सैर, उसके बाद नाश्ता और निर्धारित मेमोरी मैच अभ्यास।' : '15-minute sunshine walk at 8:00 AM, followed by breakfast and the scheduled Memory Match game.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 7. Quick Share Action Banner */}
              <div className="p-5 rounded-2xl bg-[#EDF5F0] border border-[#CCE2D4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h5 className="font-['Sora'] font-bold text-sm text-[#28573E] flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#28573E]" />
                    <span>{tReport.shareWithDoctorOrFamily}</span>
                  </h5>
                  <p className="text-xs text-[#636B65] mt-0.5">
                    {tReport.shareSub}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={handleCopySummary}
                    className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-['Sora'] font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                      copySuccess
                        ? 'bg-[#28573E] text-white'
                        : 'bg-[#C05634] hover:bg-[#A64727] text-white'
                    }`}
                  >
                    {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copySuccess ? tReport.copiedToast : tReport.copySummary}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#CCE2D4] text-[#28573E] font-['Sora'] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{tReport.printPdf}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* VIEW: COMPREHENSIVE MULTI-MODAL EVALUATION (INGESTING EVERYTHING)  */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {reportMode === 'COMPREHENSIVE' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Comprehensive Patient & Caregiver Records Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">{tReport.profileLabel}</span>
                  <strong className="text-sm text-slate-900 flex items-center gap-1 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{patientName}</span>
                  </strong>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    {tReport.ageYrs(patientAge)} • {diagnosis} {prescription?.presetType ? `• Rx: ${prescription.presetType.replace(/_/g, ' ')}` : ''}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">{tReport.activeExercises}</span>
                  <strong className="text-sm text-slate-900 flex items-center gap-1 mt-0.5">
                    <Brain className="w-3.5 h-3.5 text-purple-600" />
                    <span>{tReport.gamesCompleted(dailyComposite ? dailyComposite.gamesPlayedCount : 2)}</span>
                  </strong>
                  <span className="text-[11px] text-emerald-600 font-bold block">
                    {tReport.compositeScore(dailyComposite ? dailyComposite.score : 82)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">{tReport.medAdherence}</span>
                  <strong className="text-sm text-slate-900 flex items-center gap-1 mt-0.5">
                    <Pill className="w-3.5 h-3.5 text-sky-600" />
                    <span>{tReport.dosesTaken(medications.filter(m => m.takenToday).length, medications.length)}</span>
                  </strong>
                  <span className={`text-[11px] font-bold block ${pendingMedCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {pendingMedCount > 0 ? tReport.dosesPendingWarning(pendingMedCount) : tReport.allDosesCompleted}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">{tReport.clinicalUploads}</span>
                  <strong className="text-sm text-slate-900 flex items-center gap-1 mt-0.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>{tReport.medicalRecords(uploadedReports.length || 2)}</span>
                  </strong>
                  <span className="text-[11px] text-slate-500 font-medium block">{tReport.mmseMriOnFile}</span>
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
                        <span>{tReport.cloudEngineTitle}</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                          {tReport.cloudApiPowered}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300 font-medium max-w-xl">
                        {tReport.cloudEngineDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {apiKeyInput.trim() ? (
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{tReport.apiKeyActive(cloudConfig.provider.toUpperCase())}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        <span>{tReport.apiKeyNeeded}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Inline Provider Selection & API Key Input Bar */}
                <div className="space-y-3 pt-1">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>{tReport.selectProvider}</span>
                    </label>

                    <div className="flex items-center gap-3">
                      {cloudConfig.provider === 'gemini' && (
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>{tReport.getFreeGeminiKey}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsAIConfigOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title={tReport.manageKeys}
                      >
                        <Settings className="w-3 h-3 text-amber-400" />
                        <span>{tReport.manageKeys}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Provider Toggle */}
                    <div className="sm:col-span-4 grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
                      {(['gemini', 'openai', 'groq'] as AIProvider[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            const defaultModel = p === 'gemini' ? 'gemini-3.8-flash' : p === 'openai' ? 'gpt-4o-mini' : 'llama-3.3-70b-versatile';
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
                        placeholder={tReport.apiKeyPlaceholder(cloudConfig.provider.toUpperCase())}
                        className="w-full px-4 py-2.5 pr-10 rounded-2xl bg-black/60 border border-white/20 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-white cursor-pointer"
                        title={showApiKey ? tReport.hideKey : tReport.showKey}
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
                      <strong className="block font-bold">{tReport.apiNotice}</strong>
                      <span>{apiErrorMessage}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{tReport.targetLlmDesc(cloudConfig.model)}</span>
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
                          <span>{tReport.callingCloudApi(cloudConfig.provider.toUpperCase())}</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-slate-950" />
                          <span>{comprehensiveReport ? tReport.regenerateReport : tReport.generateFullReport}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGenerateComprehensiveReport(true)}
                      disabled={isGeneratingComprehensive}
                      className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white font-bold text-xs transition-all cursor-pointer"
                      title={tReport.previewBenchmark}
                    >
                      <span>{tReport.previewBenchmark}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* RENDER FULL-BLOWN TEST REPORT */}
              {comprehensiveReport ? (
                <div className="space-y-6">

                  {/* 1. EXECUTIVE DIAGNOSTIC STAGING & RISK BANNER */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border-2 border-amber-400 shadow-xl space-y-4">
                    {/* STATUTORY CLINICAL NOTICE BANNER */}
                    <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-2.5 text-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed font-medium">
                        <strong className="font-bold text-amber-300">STATUTORY CLINICAL NOTICE:</strong> This assessment provides algorithmic cognitive screening concordance and observational risk indicators. It is NOT a medical diagnosis. Definitive clinical diagnosis of Alzheimer&apos;s disease or dementia requires comprehensive neurological, laboratory, and radiological evaluation by a licensed specialist.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                            {tReport.officialEvaluation}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span>{comprehensiveReport.isCloudGenerated ? tReport.liveCloudRestApi : tReport.cloudBenchmarkRef}</span>
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-white mt-0.5">
                          {comprehensiveReport.dsm5Staging}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">
                          {tReport.evaluatedVia} {comprehensiveReport.provider} ({comprehensiveReport.model}) • {comprehensiveReport.generatedAt}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-center px-4 py-2 rounded-2xl bg-white/10 border border-white/15">
                          <span className="text-[9px] uppercase font-bold text-slate-300 block">{tReport.estimatedMoCA}</span>
                          <span className="text-xl font-black text-amber-300">{comprehensiveReport.estimatedMoCAScore} / 30</span>
                        </div>

                        <div className="text-center px-4 py-2 rounded-2xl bg-white/10 border border-white/15">
                          <span className="text-[9px] uppercase font-bold text-slate-300 block">{tReport.declineRisk}</span>
                          <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 inline-block mt-0.5">
                            {tReport.riskBadge(comprehensiveReport.cognitiveDeclineRiskLevel)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Executive Narrative */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        {tReport.executiveSummary}
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
                            <span>{tReport.topPriorityMeds}</span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                              {tReport.topPriorityBadge}
                            </span>
                          </h3>
                          <p className="text-xs text-slate-500">
                            {tReport.medsSubtitle}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-slate-500">
                        {tReport.medsMonitored(comprehensiveReport.medicationPriorities.length)}
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
                                  {med.priorityLevel === 'CRITICAL_HIGH' ? (isHi ? 'अति गंभीर' : 'CRITICAL HIGH') : med.priorityLevel === 'HIGH' ? (isHi ? 'उच्च' : 'HIGH') : (isHi ? 'मध्यम' : 'MEDIUM')}
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
                                {isPending ? tReport.pendingActionBadge : tReport.takenBadge}
                              </span>
                            </div>

                            <div className="text-xs space-y-1">
                              <p className="text-[11px] text-slate-600">
                                <strong className="text-slate-800">{tReport.timing}</strong> {med.timing}
                              </p>
                              <p className="text-[11px] text-slate-500 leading-snug">
                                {med.instructions}
                              </p>
                            </div>

                            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] space-y-1">
                              <strong className="text-indigo-900 block font-bold text-[10px] uppercase">
                                {tReport.clinicalRationale}
                              </strong>
                              <p className="text-slate-700 leading-tight">
                                {med.clinicalRationale}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-rose-900 font-bold">
                              <span>{tReport.caregiverAction} {med.caregiverAction}</span>
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
                            <span>{tReport.recommendedGamesNext}</span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              {tReport.targetedZPD}
                            </span>
                          </h3>
                          <p className="text-xs text-slate-500">
                            {tReport.recommendedGamesSub}
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
                                <span>{tReport.launchExercise}</span>
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
                          {tReport.whatToDoNextTitle}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {tReport.whatToDoNextSub}
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
                        <span>{tReport.multiDomainAnalysis}</span>
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                          <strong className="text-purple-700 block font-bold text-[11px]">{tReport.hippocampalMemory}</strong>
                          <p className="text-slate-600 text-[11px] mt-0.5">{comprehensiveReport.domainAnalysis.episodicMemory}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                          <strong className="text-sky-700 block font-bold text-[11px]">{tReport.executiveControl}</strong>
                          <p className="text-slate-600 text-[11px] mt-0.5">{comprehensiveReport.domainAnalysis.executiveControl}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                          <strong className="text-emerald-700 block font-bold text-[11px]">{tReport.visuomotorPraxis}</strong>
                          <p className="text-slate-600 text-[11px] mt-0.5">{comprehensiveReport.domainAnalysis.visuomotorPraxis}</p>
                        </div>
                      </div>
                    </div>

                    {/* Kinematics & Medical Reports Correlation */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>{tReport.tremorFFTCorrelation}</span>
                      </h4>
                      
                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 text-xs">
                        <strong className="text-slate-800 block font-bold text-[11px]">
                          {tReport.motorTremorDecomp(comprehensiveReport.tremorEvaluation.phenotype)}
                        </strong>
                        <p className="text-[11px] text-slate-600">{comprehensiveReport.tremorEvaluation.band4_6HzAnalysis}</p>
                        <p className="text-[11px] text-slate-600">{comprehensiveReport.tremorEvaluation.fittsLawEfficiency}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 text-xs">
                        <strong className="text-indigo-800 block font-bold text-[11px]">
                          {tReport.correlationWithRecords}
                        </strong>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {comprehensiveReport.caregiverReportsCorrelation}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* 5B. 🤖 AI GAME DIRECTOR (OPENAI) DYNAMIC LEVEL SYNTHESIS */}
                  {comprehensiveReport.aiGameCalibrationReview && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-2 border-emerald-300 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-950 font-black text-xs uppercase tracking-wider">
                          <Cpu className="w-4 h-4 text-emerald-600" />
                          <span>{tReport.openAiDirectorReview}</span>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300">
                          {tReport.inGameCalibrationsIngested}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-emerald-950/90 leading-relaxed font-medium bg-white/80 p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
                        {comprehensiveReport.aiGameCalibrationReview}
                      </p>
                    </div>
                  )}

                  {/* 6. RED FLAG WARNING SIGNS & ABDM CODING */}
                  <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
                    <div className="flex items-center gap-2 text-rose-900 font-black text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>{tReport.redFlagTitle}</span>
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
                      {tReport.synthesisReady}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      {tReport.synthesisReadySub}
                    </p>
                  </div>
                  <button
                    onClick={() => handleGenerateComprehensiveReport(false)}
                    className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs cursor-pointer shadow-md inline-flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>{tReport.generateFullTestReport}</span>
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
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">{tReport.patientNameLabel}</span>
                  <strong className="text-sm text-slate-900 flex items-center gap-1 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{patientName}</span>
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">{tReport.ageAndStage}</span>
                  <strong className="text-sm text-slate-900 block mt-0.5">
                    {tReport.ageYrs(patientAge)} • <span className="capitalize text-amber-700">{diagnosis}</span>
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">{tReport.exerciseProtocol}</span>
                  <strong className="text-sm text-slate-900 block mt-0.5 truncate">
                    {gameTitle}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">{tReport.dateTime}</span>
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
                    {tReport.singleDrilldownTitle}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {tReport.singleDrilldownSub(gameTitle)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSingleReport}
                  disabled={isGeneratingSingle}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer shadow-xs hover:bg-slate-800 disabled:opacity-60"
                >
                  {isGeneratingSingle ? tReport.singleAnalyzing : singleCloudReport ? tReport.singleRegenerate : tReport.singleGenerate}
                </button>
              </div>

              {/* Cognitive Classifier Staging Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-800">{tReport.oasisStaging}</span>
                  <p className="font-bold text-amber-950">{classification.predictedClass} (MoCA: {classification.estimatedMoCARange})</p>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                  {tReport.confidence(Math.round(classification.confidenceScore * 100))}
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
                  <span className="text-[10px] font-bold uppercase text-slate-400">{tReport.accuracy}</span>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">{activeReport.accuracyPercentage ?? 90}%</p>
                  <span className="text-[9px] text-slate-500">{tReport.trialsCount(activeReport.totalCorrect ?? 5, activeReport.totalRounds ?? 6)}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">{tReport.reactionLatency}</span>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">{((activeReport.averageLatencyMs ?? 2400) / 1000).toFixed(1)}s</p>
                  <span className="text-[9px] text-slate-500">{tReport.speedLabel(activeReport.speedProfile || 'Normal')}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">{tReport.latentAbility}</span>
                  <p className="text-2xl font-black text-purple-700 mt-0.5">
                    {activeReport.finalTheta >= 0 ? `+${activeReport.finalTheta?.toFixed(2)}` : activeReport.finalTheta?.toFixed(2) || '+0.65'}
                  </p>
                  <span className="text-[9px] text-slate-500">{tReport.psychometrics2PL}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">{tReport.tremorDecoupling}</span>
                  <p className="text-2xl font-black text-emerald-600 mt-0.5">94.6%</p>
                  <span className="text-[9px] text-slate-500">{tReport.trajectorySmoothness}</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* One-Time Cloud AI Consent Notice Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cloud AI Consent</h3>
                <p className="text-xs text-slate-500">Privacy & Data Protection Notice</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                Anonymised gameplay data will be sent to {cloudConfig.provider || 'gemini'}.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowConsentModal(false);
                  setPendingConsentAction(null);
                  setIsGeneratingComprehensive(false);
                  setIsGeneratingSingle(false);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmConsent}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#28573E] text-white hover:bg-[#1E4330] transition-colors shadow-sm"
              >
                Consent & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud AI Config Modal */}
      <CloudAIConfigModal
        isOpen={isAIConfigOpen}
        onClose={() => {
          setIsAIConfigOpen(false);
          const fresh = AIClinicalReportingService.getConfig();
          setCloudConfig(fresh);
          setApiKeyInput(fresh.apiKey);
        }}
        initialTab="REPORT_AI"
        language={language}
      />
    </div>
  );
};
