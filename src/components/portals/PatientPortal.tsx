import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  Pill,
  Calendar,
  Settings,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  Brain,
  AlertTriangle,
  LogOut,
  Cpu,
  ChevronDown,
} from 'lucide-react';

import type { SupportedLanguage, PatientPrescription, GameId } from '../../types/prescription';
import type { PatientProfile, CaretakerUser } from '../../types/auth';
import type { MedicationItem, DailyRoutineItem } from '../../types/caregiver';
import { getTranslation } from '../../locales/translations';
import { portalSync, type PortalSyncMessage } from '../../utils/portalSync';
import {
  getStoredMedications,
  saveStoredMedications,
  getStoredRoutine,
  saveStoredRoutine,
} from '../../utils/caregiverStorage';
import { DailySessionManager } from '../../utils/dailySessionManager';
import { recordGameGeneratedReport, recordFullSessionReport } from '../../utils/reportsStorage';
import { AdaptiveGameFlowEngine, type FlowRecommendation } from '../../engine/adaptive-game-flow';
import { GAME_CATALOG } from '../../data/gameCatalog';

// Game Engines
import { SmritiHaat, type SessionSummaryTelemetry } from '../../games/smriti-haat';
import { SequenceRecall } from '../../games/sequence-recall';
import { MemoryMatch } from '../../games/memory-match/MemoryMatch';
import { JigsawPuzzle } from '../../games/jigsaw-puzzle';
import { NumberRecall } from '../../games/number-recall';
import { WhatChanged } from '../../games/what-changed';
import { PatternRecall } from '../../games/pattern-recall';
import { OddOneOut } from '../../games/odd-one-out';
import { WhereAmI } from '../../games/where-am-i';
import { BrainStory } from '../../games/brain-story';
import { InteractiveCognitiveExercise } from '../games/InteractiveCognitiveExercise';

// Workout Components
import { PatientTodayHome } from '../dashboard/PatientTodayHome';
import { CognitiveLibrary } from '../hub/CognitiveLibrary';
import { WorkoutProgressHeader } from '../workout/WorkoutProgressHeader';
import { WorkoutIntermissionModal } from '../workout/WorkoutIntermissionModal';
import { WorkoutCompletedCelebrationModal } from '../workout/WorkoutCompletedCelebrationModal';
import { AIGameCalibratorService, type GameAIConfig } from '../../services/ai-game-calibrator';
import { CloudAIConfigModal } from '../modals/CloudAIConfigModal';
import { PatientSOSModal } from '../modals/PatientSOSModal';

interface PatientPortalProps {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  patient: PatientProfile;
  caretaker: CaretakerUser;
  prescription: PatientPrescription;
  onOpenCaregiverPortal?: () => void;
  onLogout?: () => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  language,
  onLanguageChange,
  patient,
  caretaker,
  prescription,
  onOpenCaregiverPortal,
  onLogout,
}) => {
  const t = getTranslation(language);

  // Active navigation: 'workout' | 'library' | 'medications' | 'routine' | 'settings'
  const [activeTab, setActiveTab] = useState<'workout' | 'library' | 'medications' | 'routine' | 'settings'>('workout');

  // Game execution state
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  const [isWorkoutMode, setIsWorkoutMode] = useState<boolean>(false);
  const [workoutCurrentIndex, setWorkoutCurrentIndex] = useState<number>(0);
  const [activeWorkoutPlaylist, setActiveWorkoutPlaylist] = useState<GameId[]>(() => prescription.prescribedGameIds);
  const [completedWorkoutGames, setCompletedWorkoutGames] = useState<GameId[]>([]);
  const [workoutSessionSummaries, setWorkoutSessionSummaries] = useState<Record<string, any>>({});
  const [isIntermissionOpen, setIsIntermissionOpen] = useState<boolean>(false);
  const [isWorkoutCelebrationOpen, setIsWorkoutCelebrationOpen] = useState<boolean>(false);
  const [lastFlowRecommendation, setLastFlowRecommendation] = useState<FlowRecommendation | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [gameAIConfig, setGameAIConfig] = useState<GameAIConfig>(() => AIGameCalibratorService.getConfig());

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

  // Synchronize active workout playlist when prescription changes outside workout
  useEffect(() => {
    if (!isWorkoutMode) {
      setActiveWorkoutPlaylist(prescription.prescribedGameIds);
    }
  }, [prescription, isWorkoutMode]);

  // Medications and Routine
  const [medications, setMedications] = useState<MedicationItem[]>(() =>
    getStoredMedications(patient.id)
  );
  const [routines, setRoutines] = useState<DailyRoutineItem[]>(() =>
    getStoredRoutine(patient.id)
  );

  // Dynamic streak calculation from played dates index
  const dayStreak = (() => {
    try {
      const datesRaw = localStorage.getItem('smriti_played_dates_index_v2');
      const dates: string[] = datesRaw ? JSON.parse(datesRaw) : [];
      return Math.max(1, dates.length);
    } catch {
      return 1;
    }
  })();

  const completedTodayGameIds = Object.keys(DailySessionManager.getDailySessions()) as GameId[];
  const isWorkoutCompletedToday =
    prescription.prescribedGameIds.length > 0 &&
    prescription.prescribedGameIds.every((id) => completedTodayGameIds.includes(id));

  // Cross-portal synchronization listener
  useEffect(() => {
    const unsubscribe = portalSync.subscribe((msg: PortalSyncMessage) => {
      if (msg.type === 'MEDICATION_MUTATED') {
        setMedications(getStoredMedications(patient.id));
      } else if (msg.type === 'ROUTINE_MUTATED') {
        setRoutines(getStoredRoutine(patient.id));
      } else if (msg.type === 'PRESCRIPTION_MUTATED') {
        if (msg.payload?.prescribedGameIds && !isWorkoutMode) {
          setActiveWorkoutPlaylist(msg.payload.prescribedGameIds);
        }
      }
    });

    return () => unsubscribe();
  }, [patient.id, isWorkoutMode]);

  // Handlers for Medications
  const handleToggleMed = (medId: string) => {
    const updated = medications.map((m) =>
      m.id === medId ? { ...m, takenToday: !m.takenToday } : m
    );
    setMedications(updated);
    saveStoredMedications(patient.id, updated);
    portalSync.broadcast('MEDICATION_MUTATED', { medId, patientId: patient.id, allMeds: updated, by: 'patient' }, 'patient');
  };

  // Handlers for Routine
  const handleToggleRoutine = (routineId: string) => {
    const updated = routines.map((r) =>
      r.id === routineId ? { ...r, completed: !r.completed } : r
    );
    setRoutines(updated);
    saveStoredRoutine(patient.id, updated);
    portalSync.broadcast('ROUTINE_MUTATED', { routineId, patientId: patient.id, allRoutines: updated, by: 'patient' }, 'patient');
  };

  const prescribedGameCount = prescription.prescribedGameIds.length > 0 
    ? prescription.prescribedGameIds.length 
    : 3;

  // Workout Flow Handlers
  const handleBeginWorkout = () => {
    const basePlaylist: GameId[] = prescription.prescribedGameIds.length > 0 
      ? prescription.prescribedGameIds 
      : ['memory-match', 'sequence-recall', 'what-changed'];
    const playlist = basePlaylist.slice(0, prescribedGameCount);
    setIsWorkoutMode(true);
    setWorkoutCurrentIndex(0);
    setCompletedWorkoutGames([]);
    setActiveWorkoutPlaylist([...playlist]);
    setActiveGameId(playlist[0]);
  };

  const handleRecordSessionSummary = (gameId: GameId, summary: any) => {
    // 1. Record session in DailySessionManager (only counts played games)
    const dailyComposite = DailySessionManager.recordSession(summary, true);

    // 1b. Store persistent generated game report document for Caregiver Reports Vault
    recordGameGeneratedReport(patient.id, {
      ...summary,
      gameId,
    });

    // 2. Broadcast to Caregiver Portal with full data mirroring payload
    portalSync.broadcast(
      'SESSION_COMPLETED',
      {
        gameId,
        summary,
        dailyComposite,
        todayDateKey: DailySessionManager.getTodayDateKey(),
        allTodaySessions: DailySessionManager.getDailySessions(),
        playedDates: JSON.parse(localStorage.getItem('smriti_played_dates_index_v2') || '[]'),
      },
      'patient'
    );

    // 3. Update local session summaries
    const updatedSummaries = {
      ...workoutSessionSummaries,
      [gameId]: summary,
    };
    setWorkoutSessionSummaries(updatedSummaries);

    const updatedCompleted = completedWorkoutGames.includes(gameId)
      ? completedWorkoutGames
      : [...completedWorkoutGames, gameId];
    setCompletedWorkoutGames(updatedCompleted);

    if (isWorkoutMode) {
      // Check if workout has reached the prescribed game count
      const isFinished = (workoutCurrentIndex + 1 >= prescribedGameCount) || (updatedCompleted.length >= prescribedGameCount);

      if (isFinished) {
        // Record daily full comprehensive session report document
        recordFullSessionReport(patient.id, dailyComposite);
        setIsIntermissionOpen(false);
        setIsWorkoutMode(false);
        setActiveGameId(null);
        setIsWorkoutCelebrationOpen(true);
        return;
      }

      const currentPlaylist = activeWorkoutPlaylist.length > 0 ? activeWorkoutPlaylist : prescription.prescribedGameIds;

      // Dynamically evaluate patient telemetry using the AI Adaptive Flow Engine
      const recommendation = AdaptiveGameFlowEngine.recommendNextGame({
        completedGameId: gameId,
        completedSummary: summary,
        currentPlaylist,
        completedGameIds: updatedCompleted,
        sessionReports: updatedSummaries,
        patientLanguage: language,
      });

      setLastFlowRecommendation(recommendation);

      // Adjust playlist on the fly based on clinical AI recommendation (strictly bounded to prescribed game count)
      if (recommendation.adjustedPlaylist && recommendation.adjustedPlaylist.length > 0) {
        setActiveWorkoutPlaylist(recommendation.adjustedPlaylist.slice(0, prescribedGameCount));
      }

      setIsIntermissionOpen(true);
    }
  };

  const handleStartNextFromIntermission = () => {
    setIsIntermissionOpen(false);
    const nextIdx = workoutCurrentIndex + 1;

    // Conclude workout if prescribed game count is reached
    if (nextIdx >= prescribedGameCount || completedWorkoutGames.length >= prescribedGameCount) {
      setIsWorkoutMode(false);
      setActiveGameId(null);
      setIsWorkoutCelebrationOpen(true);
      return;
    }

    setWorkoutCurrentIndex(nextIdx);

    // Pick next game strictly from remaining prescribed playlist
    const nextGame =
      lastFlowRecommendation?.nextGameId ||
      activeWorkoutPlaylist[nextIdx] ||
      prescription.prescribedGameIds[nextIdx];

    if (nextGame && !completedWorkoutGames.includes(nextGame)) {
      setActiveGameId(nextGame);
    } else if (activeWorkoutPlaylist[nextIdx]) {
      setActiveGameId(activeWorkoutPlaylist[nextIdx]);
    } else {
      setIsWorkoutMode(false);
      setActiveGameId(null);
      setIsWorkoutCelebrationOpen(true);
    }
  };

  const handleExitWorkout = () => {
    setIsIntermissionOpen(false);
    setIsWorkoutMode(false);
    setActiveGameId(null);
  };

  const handleGameExit = () => {
    if (isWorkoutMode) {
      if (workoutCurrentIndex + 1 >= prescribedGameCount || completedWorkoutGames.length >= prescribedGameCount) {
        setIsWorkoutMode(false);
        setActiveGameId(null);
        setIsWorkoutCelebrationOpen(true);
      } else {
        setIsIntermissionOpen(true);
      }
    } else {
      setActiveGameId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F2421] font-sans flex flex-col">
      
      {/* ─── TOP PATIENT HEADER (Keen System) ─────────────────────────────── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E5DFD5] sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FDF1EB] border border-[#F5D3C4] flex items-center justify-center text-[#C05634] shadow-xs">
              <Brain className="w-6 h-6 text-[#C05634]" />
            </div>
            <div>
              <h1 className="font-['Sora'] font-extrabold text-lg text-[#1F2421] leading-tight flex items-center gap-1">
                <span>Smriti</span><span className="text-[#C05634]">Setu</span>
              </h1>
              <p className="text-[12px] font-bold text-[#28573E] uppercase tracking-wider">
                {t.patientPortal} • <span className="text-[#1F2421]">{patient.name}</span>
              </p>
            </div>
          </div>

          {/* Right Controls: Quick SOS & Consolidated Menu Dropdown */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick SOS Emergency Header Button */}
            <button
              onClick={() => setIsSOSOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white font-['Sora'] font-black text-xs transition-all shadow-xs cursor-pointer shrink-0"
              title={language === 'hi' ? 'आपातकालीन सहायता (SOS)' : 'Emergency Assistance (SOS)'}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
              <span>SOS</span>
            </button>

            {/* Consolidated Patient Menu Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl bg-[#F4F0EA] hover:bg-[#EDE7DE] border border-[#E5DFD5] text-[#1F2421] transition-all cursor-pointer shadow-2xs select-none"
                aria-expanded={isMenuOpen}
                aria-label="Patient menu and options"
              >
                <div className="w-7 h-7 rounded-lg sm:rounded-xl bg-[#C05634] text-white flex items-center justify-center font-['Sora'] font-black text-xs">
                  {patient.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-['Sora'] font-bold text-xs hidden sm:inline text-[#1F2421]">
                  {patient.name.split(' ')[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#636B65] transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Panel */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-[#E5DFD5] shadow-xl py-2 z-50 animate-fadeIn divide-y divide-[#E5DFD5]/60">
                  
                  {/* Profile Summary */}
                  <div className="px-4 py-3 bg-[#FAF8F5]/80 rounded-t-2xl">
                    <p className="font-['Sora'] font-bold text-sm text-[#1F2421] truncate">
                      {patient.name}
                    </p>
                    <p className="text-xs text-[#28573E] font-medium mt-0.5">
                      {language === 'hi' ? 'दैनिक संज्ञान पोर्टल' : 'Cognitive Daily Wellness'}
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

                  {/* Menu Items */}
                  <div className="py-1">
                    {/* Settings Option (Moved from Tab Bar) */}
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

                    {/* Game AI Configuration */}
                    <button
                      onClick={() => {
                        setIsAIModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-[#FAF8F5] text-sm font-medium text-[#1F2421] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Cpu className="w-4 h-4 text-[#28573E]" />
                        <span>{language === 'hi' ? 'गेम AI कैलिब्रेटर' : 'Game AI Engine'}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDF5F0] text-[#28573E]">
                        {gameAIConfig.apiKey.trim() && gameAIConfig.enabled ? 'Cloud' : 'Adaptive'}
                      </span>
                    </button>

                    {/* Switch to Caregiver Portal */}
                    {onOpenCaregiverPortal && (
                      <button
                        onClick={() => {
                          onOpenCaregiverPortal();
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-[#FAF8F5] text-sm font-medium text-[#28573E] transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4 text-[#28573E]" />
                        <span>{t.switchToCaregiver}</span>
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
          </div>

        </div>

        {/* Navigation Tabs Bar (Generous Senior Interaction Targets: 52px height) */}
        {!activeGameId && (
          <div className="border-t border-[#E5DFD5] bg-[#F4F0EA]/70 backdrop-blur-xs py-2.5">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-2.5 overflow-x-auto">
              
              <button
                onClick={() => setActiveTab('workout')}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-['Sora'] font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === 'workout'
                    ? 'bg-[#C05634] text-white shadow-sm'
                    : 'bg-white hover:bg-[#FAF8F5] text-[#38403A] border border-[#E5DFD5]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.todaysWorkout}</span>
              </button>

              <button
                onClick={() => setActiveTab('library')}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-['Sora'] font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === 'library'
                    ? 'bg-[#C05634] text-white shadow-sm'
                    : 'bg-white hover:bg-[#FAF8F5] text-[#38403A] border border-[#E5DFD5]'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                <span>{t.gameLibrary}</span>
              </button>

              <button
                onClick={() => setActiveTab('medications')}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-['Sora'] font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === 'medications'
                    ? 'bg-[#C05634] text-white shadow-sm'
                    : 'bg-white hover:bg-[#FAF8F5] text-[#38403A] border border-[#E5DFD5]'
                }`}
              >
                <Pill className="w-4 h-4" />
                <span>{t.myMedsToday}</span>
              </button>

              <button
                onClick={() => setActiveTab('routine')}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-['Sora'] font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === 'routine'
                    ? 'bg-[#C05634] text-white shadow-sm'
                    : 'bg-white hover:bg-[#FAF8F5] text-[#38403A] border border-[#E5DFD5]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{t.myRoutineToday}</span>
              </button>

            </div>
          </div>
        )}
      </header>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        
        {/* ACTIVE GAME EXECUTION OVERLAY */}
        {activeGameId ? (
          <div className="space-y-4">
            
            {/* Workout Progress Bar (if in workout mode) */}
            {isWorkoutMode && (
              <WorkoutProgressHeader
                currentIndex={workoutCurrentIndex}
                totalExercises={prescribedGameCount}
                currentGameTitle={
                  GAME_CATALOG.find((g) => g.id === activeGameId)?.title[language] || activeGameId || ''
                }
                nextGameTitle={
                  workoutCurrentIndex + 1 < prescribedGameCount
                    ? (lastFlowRecommendation?.nextGameId
                        ? GAME_CATALOG.find((g) => g.id === lastFlowRecommendation.nextGameId)?.title[language] || null
                        : GAME_CATALOG.find((g) => g.id === activeWorkoutPlaylist[workoutCurrentIndex + 1])?.title[language] || null)
                    : null
                }
                onNextExercise={() => {
                  if (workoutCurrentIndex + 1 >= prescribedGameCount) {
                    setIsIntermissionOpen(false);
                    setIsWorkoutMode(false);
                    setActiveGameId(null);
                    setIsWorkoutCelebrationOpen(true);
                  } else {
                    handleStartNextFromIntermission();
                  }
                }}
                onExitWorkout={handleExitWorkout}
                language={language}
              />
            )}

            {!isWorkoutMode && (
              <button
                onClick={() => setActiveGameId(null)}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white hover:bg-[#FAF8F5] border border-[#D5CCC0] text-sm font-['Sora'] font-bold text-[#1F2421] hover:text-[#C05634] transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <ArrowLeft className="w-4 h-4 text-[#C05634]" />
                <span>{language === 'hi' ? 'अभ्यास से बाहर निकलें' : 'Exit Exercise to Library'}</span>
              </button>
            )}

            {/* Game Engines */}
            {activeGameId === 'smriti-haat' && (
              <SmritiHaat
                language={language}
                totalRounds={4}
                onSessionComplete={(summary: SessionSummaryTelemetry) => {
                  handleRecordSessionSummary('smriti-haat', summary);
                }}
                onExit={handleGameExit}
              />
            )}

            {activeGameId === 'memory-match' && (
              <MemoryMatch
                language={language}
                totalRounds={3}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('memory-match', summary);
                }}
                onExit={handleGameExit}
              />
            )}

            {activeGameId === 'sequence-recall' && (
              <SequenceRecall
                language={language}
                totalTrials={4}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('sequence-recall', summary);
                }}
                onExit={handleGameExit}
              />
            )}

            {activeGameId === 'jigsaw-puzzle' && (
              <JigsawPuzzle
                language={language}
                totalPuzzles={3}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('jigsaw-puzzle', summary);
                }}
                onExit={handleGameExit}
              />
            )}

            {activeGameId === 'number-recall' && (
              <NumberRecall
                language={language}
                totalTrials={4}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('number-recall', summary);
                }}
                onExit={handleGameExit}
              />
            )}

            {activeGameId === 'what-changed' && (
              <WhatChanged
                language={language}
                totalTrials={4}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('what-changed', summary);
                }}
                onExit={handleGameExit}
              />
            )}

            {activeGameId === 'pattern-recall' && (
              <PatternRecall
                language={language}
                totalTrials={5}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('pattern-recall', summary);
                }}
                onExit={handleGameExit}
              />
            )}

            {activeGameId === 'odd-one-out' && (
              <OddOneOut
                language={language}
                totalTrials={5}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('odd-one-out', summary);
                }}
                onExit={handleGameExit}
              />
            )}

            {activeGameId === 'where-am-i' && (
              <WhereAmI
                language={language}
                totalTrials={5}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('where-am-i', summary);
                }}
                onExit={handleGameExit}
              />
            )}

            {activeGameId === 'brain-story' && (
              <BrainStory
                language={language}
                totalTrials={3}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('brain-story', summary);
                }}
                onExit={handleGameExit}
              />
            )}

            {activeGameId === 'word-recall' && (
              <InteractiveCognitiveExercise
                gameId="word-recall"
                language={language}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('word-recall', summary);
                }}
                onExit={handleGameExit}
              />
            )}

            {/* Fallback Graceful State if game ID is unrecognized */}
            {activeGameId && ![
              'smriti-haat', 'memory-match', 'sequence-recall', 'jigsaw-puzzle',
              'number-recall', 'what-changed', 'pattern-recall', 'odd-one-out',
              'where-am-i', 'brain-story', 'word-recall'
            ].includes(activeGameId) && (
              <div className="bg-white p-8 rounded-3xl border border-rose-200 shadow-sm text-center space-y-4 max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {language === 'hi' ? 'अभ्यास उपलब्ध नहीं है' : 'Exercise Not Available'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'hi' 
                      ? `अनुरोधित अभ्यास "${activeGameId}" लोड नहीं किया जा सका।` 
                      : `The requested exercise "${activeGameId}" could not be loaded.`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveGameId(null);
                    setIsWorkoutMode(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-slate-800"
                >
                  {language === 'hi' ? 'डैशबोर्ड पर वापस जाएं' : 'Return to Dashboard'}
                </button>
              </div>
            )}

          </div>
        ) : (
          /* REGULAR TAB VIEWS */
          <div className="space-y-6">

            {/* TAB: TODAY'S WORKOUT (Cognitive Index hidden as requested) */}
            {activeTab === 'workout' && (
              <PatientTodayHome
                language={language}
                patient={patient}
                prescription={prescription}
                currentRole="patient"
                caretakerName={caretaker.name}
                isWorkoutCompletedToday={isWorkoutCompletedToday}
                completedGameIds={completedTodayGameIds}
                onBeginWorkout={handleBeginWorkout}
                onLaunchGame={(gId) => {
                  setIsWorkoutMode(false);
                  setActiveGameId(gId);
                }}
                onOpenPrescriptionModal={() => {}}
                dayStreak={dayStreak}
                showCognitiveIndex={false}
                onOpenSOS={() => setIsSOSOpen(true)}
              />
            )}

            {/* TAB: GAME LIBRARY */}
            {activeTab === 'library' && (
              <CognitiveLibrary
                language={language}
                onLaunchGame={(gId) => {
                  setIsWorkoutMode(false);
                  setActiveGameId(gId);
                }}
              />
            )}

            {/* TAB: MY MEDICATIONS CHECKLIST (Keen Senior Design) */}
            {activeTab === 'medications' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E5DFD5] shadow-xs">
                  <div className="flex items-center gap-4 border-b border-[#E5DFD5] pb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#EDF5F0] text-[#28573E] flex items-center justify-center border border-[#CCE2D4]">
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-['Sora'] text-2xl font-bold text-[#1F2421]">{t.myMedsToday}</h3>
                      <p className="text-sm text-[#636B65] font-medium mt-0.5">
                        {language === 'hi' ? 'दवा लेने के बाद उस पर टैप करें। यह सूची आपके देखभालकर्ता के साथ तुरंत सिंक होती है।' : 'Tap each medicine after taking it. Synced in real-time with your caregiver.'}
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-[#E5DFD5] mt-5">
                    {medications.map((med) => (
                      <div
                        key={med.id}
                        onClick={() => handleToggleMed(med.id)}
                        className={`py-5 px-4 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all duration-150 ${
                          med.takenToday ? 'bg-[#EDF5F0]/60' : 'hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                          {/* 48px Touch Target Checkbox */}
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                              med.takenToday
                                ? 'bg-[#28573E] text-white shadow-xs'
                                : 'border-2 border-[#D5CCC0] text-transparent hover:border-[#28573E]'
                            }`}
                          >
                            <CheckCircle2 className="w-7 h-7" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <p className={`font-['Sora'] font-bold text-lg ${med.takenToday ? 'text-[#28573E] line-through opacity-75' : 'text-[#1F2421]'}`}>
                                {med.name}
                              </p>
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F4F0EA] text-[#38403A] border border-[#E5DFD5]">
                                {med.dosage}
                              </span>
                            </div>
                            <p className="text-sm text-[#636B65] mt-1 capitalize font-medium">
                              {med.timing} • {med.instructions}
                            </p>
                          </div>
                        </div>

                        <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full shrink-0 ${
                          med.takenToday 
                            ? 'bg-[#EDF5F0] text-[#28573E] border border-[#CCE2D4]' 
                            : 'bg-[#FAF3E7] text-[#A86F15] border border-[#F2E1C2]'
                        }`}>
                          {med.takenToday ? t.taken : t.pending}
                        </span>
                      </div>
                    ))}

                    {medications.length === 0 && (
                      <p className="text-sm text-[#636B65] py-10 text-center font-medium">{t.noMedications}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MY DAILY ROUTINE CHECKLIST (Keen Senior Design) */}
            {activeTab === 'routine' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E5DFD5] shadow-xs">
                  <div className="flex items-center gap-4 border-b border-[#E5DFD5] pb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF3E7] text-[#A86F15] flex items-center justify-center border border-[#F2E1C2]">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-['Sora'] text-2xl font-bold text-[#1F2421]">{t.myRoutineToday}</h3>
                      <p className="text-sm text-[#636B65] font-medium mt-0.5">
                        {language === 'hi' ? 'आज के लिए आपकी नियोजित गतिविधियाँ व कल्याणकारी कार्य।' : 'Your planned wellness and cognitive routine for today.'}
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-[#E5DFD5] mt-5">
                    {routines.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleRoutine(item.id)}
                        className={`py-5 px-4 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all duration-150 ${
                          item.completed ? 'bg-[#EDF5F0]/60' : 'hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                          {/* 48px Touch Target Checkbox */}
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                              item.completed
                                ? 'bg-[#28573E] text-white shadow-xs'
                                : 'border-2 border-[#D5CCC0] text-transparent hover:border-[#28573E]'
                            }`}
                          >
                            <CheckCircle2 className="w-7 h-7" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="font-bold text-xs text-[#28573E] bg-[#EDF5F0] px-3 py-1 rounded-full border border-[#CCE2D4]">
                                {item.time}
                              </span>
                              <p className={`font-['Sora'] font-bold text-lg ${item.completed ? 'text-[#28573E] line-through opacity-75' : 'text-[#1F2421]'}`}>
                                {item.activity}
                              </p>
                            </div>
                            <p className="text-sm text-[#636B65] mt-1 capitalize font-medium">{item.category}</p>
                          </div>
                        </div>

                        <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full shrink-0 ${
                          item.completed 
                            ? 'bg-[#EDF5F0] text-[#28573E] border border-[#CCE2D4]' 
                            : 'bg-[#F4F0EA] text-[#636B65] border border-[#E5DFD5]'
                        }`}>
                          {item.completed ? t.completed : t.pending}
                        </span>
                      </div>
                    ))}

                    {routines.length === 0 && (
                      <p className="text-sm text-[#636B65] py-10 text-center font-medium">{t.noRoutines}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SETTINGS (Keen Surface) */}
            {activeTab === 'settings' && (
              <div className="bg-white p-7 sm:p-9 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-6 animate-fadeIn">
                <div className="border-b border-[#E5DFD5] pb-5">
                  <h3 className="font-['Sora'] text-2xl font-bold text-[#1F2421]">{t.platformSettings}</h3>
                  <p className="text-sm text-[#636B65] font-medium mt-0.5">{t.platformSettingsDesc}</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#F4F0EA] border border-[#E5DFD5] space-y-3">
                  <span className="text-xs font-bold text-[#38403A] uppercase tracking-wider">
                    {t.selectLanguage}
                  </span>
                  <div className="flex gap-2.5 flex-wrap">
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'hi', label: 'हिन्दी (Hindi)' },
                      { code: 'bn', label: 'বাংলা (Bengali)' },
                      { code: 'as', label: 'অসমীয়া (Assamese)' },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => onLanguageChange(lang.code as SupportedLanguage)}
                        className={`px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                          language === lang.code
                            ? 'bg-[#C05634] text-white shadow-xs'
                            : 'bg-white text-[#38403A] border border-[#D5CCC0] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cloud AI Multi-Model Calibrator Trigger */}
                <div className="p-6 rounded-2xl bg-[#EDF5F0] border border-[#CCE2D4] flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#28573E]" />
                      <h4 className="font-['Sora'] text-sm font-bold uppercase tracking-wider text-[#1F2421]">
                        {language === 'hi' ? 'क्लाउड AI मल्टी-मॉडल कैलिब्रेटर' : 'Cloud AI Multi-Model Calibrator'}
                      </h4>
                      <span className="text-xs font-bold bg-white text-[#28573E] border border-[#CCE2D4] px-2.5 py-0.5 rounded-full">
                        {gameAIConfig.enabled && gameAIConfig.apiKey 
                          ? (language === 'hi' ? `${gameAIConfig.provider.toUpperCase()} सक्रिय` : `${gameAIConfig.provider.toUpperCase()} Active`)
                          : (language === 'hi' ? 'IRT बैकअप' : 'IRT Fallback')}
                      </span>
                    </div>
                    <p className="text-sm text-[#38403A] max-w-md font-medium leading-relaxed">
                      {language === 'hi'
                        ? 'वास्तविक समय में खेल के स्तर को समायोजित करने और क्लिनिकल मूल्यांकन हेतु Google Gemini या OpenAI कुंजियाँ कॉन्फ़िगर करें।'
                        : 'Configure Google Gemini or OpenAI keys for real-time neuro-adaptive game difficulty scaling and clinical reflection.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAIModalOpen(true)}
                    className="px-5 py-3 rounded-xl bg-[#28573E] hover:bg-[#1E4430] text-white text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4 text-[#CCE2D4]" />
                    <span>{t.configureCloudAi}</span>
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-[#38403A] space-y-1.5 font-medium">
                  <p className="font-bold text-[#1F2421]">{t.syncStatus}</p>
                  <p className="text-[#28573E] font-bold">{t.realtimeSyncActive}</p>
                  <p className="text-xs text-[#636B65]">
                    {language === 'hi' 
                      ? <>मरीज पोर्टल: <strong>Port 5173</strong> • देखभालकर्ता पोर्टल: <strong>Port 5174</strong></>
                      : <>Patient Portal: <strong>Port 5173</strong> • Caregiver Portal: <strong>Port 5174</strong></>}
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* ─── WORKOUT MODALS ───────────────────────────────────────────────── */}
      <WorkoutIntermissionModal
        isOpen={isIntermissionOpen}
        completedGameTitle={
          GAME_CATALOG.find((g) => g.id === activeGameId)?.title[language] ||
          activeGameId ||
          ''
        }
        completedIndex={workoutCurrentIndex}
        totalExercises={prescribedGameCount}
        nextGameTitle={
          (lastFlowRecommendation?.nextGameId &&
            GAME_CATALOG.find((g) => g.id === lastFlowRecommendation.nextGameId)?.title[language]) ||
          (workoutCurrentIndex + 1 < prescribedGameCount &&
            GAME_CATALOG.find((g) => g.id === activeWorkoutPlaylist[workoutCurrentIndex + 1])?.title[language]) ||
          ''
        }
        nextGameSubtitle={
          lastFlowRecommendation?.nextGameId
            ? GAME_CATALOG.find((g) => g.id === lastFlowRecommendation.nextGameId)?.subtitle[language]
            : workoutCurrentIndex + 1 < prescribedGameCount
            ? GAME_CATALOG.find((g) => g.id === activeWorkoutPlaylist[workoutCurrentIndex + 1])?.subtitle[language]
            : undefined
        }
        nextGameDomain={
          lastFlowRecommendation?.domain
            ? (GAME_CATALOG.find((g) => g.id === lastFlowRecommendation.nextGameId)?.domainLabel[language] || lastFlowRecommendation.domain)
            : workoutCurrentIndex + 1 < prescribedGameCount
            ? GAME_CATALOG.find((g) => g.id === activeWorkoutPlaylist[workoutCurrentIndex + 1])?.domainLabel[language]
            : undefined
        }
        nextGameEstimatedMinutes={lastFlowRecommendation?.estimatedMinutes || 3}
        onStartNext={handleStartNextFromIntermission}
        onExitWorkout={handleExitWorkout}
        flowReason={lastFlowRecommendation?.reason}
        flowRationale={lastFlowRecommendation?.clinicalRationale?.[language]}
        language={language}
      />

      <WorkoutCompletedCelebrationModal
        isOpen={isWorkoutCelebrationOpen}
        onReturnHome={() => {
          setIsWorkoutCelebrationOpen(false);
          setIsWorkoutMode(false);
          setActiveGameId(null);
        }}
        completedGameIds={completedWorkoutGames}
        sessionSummaries={workoutSessionSummaries}
        language={language}
        dayStreak={dayStreak}
        patientName={patient.name}
        onGoToMedications={() => {
          setIsWorkoutCelebrationOpen(false);
          setIsWorkoutMode(false);
          setActiveGameId(null);
          setActiveTab('medications');
        }}
        onGoToRoutine={() => {
          setIsWorkoutCelebrationOpen(false);
          setIsWorkoutMode(false);
          setActiveGameId(null);
          setActiveTab('routine');
        }}
      />

      <CloudAIConfigModal
        isOpen={isAIModalOpen}
        onClose={() => {
          setIsAIModalOpen(false);
          setGameAIConfig(AIGameCalibratorService.getConfig());
        }}
        initialTab="GAMES_AI"
        language={language}
      />

      {/* ─── BIG ASS PERSISTENT FLOATING SOS EMERGENCY BUTTON (Calm, Dignified, Non-distracting) ─── */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40">
        <button
          onClick={() => setIsSOSOpen(true)}
          className="group relative flex items-center gap-3.5 h-16 sm:h-18 px-6 sm:px-7 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white shadow-lg hover:shadow-xl border-3 border-white transition-all duration-150 transform hover:scale-102 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-red-200 select-none"
          aria-label={language === 'hi' ? 'आपातकालीन सहायता बटन (SOS)' : 'Emergency SOS Help Button'}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>

          <div className="text-left pr-1">
            <span className="block font-['Sora'] font-black text-lg sm:text-xl tracking-widest leading-none text-white">
              SOS
            </span>
            <span className="block text-[10px] sm:text-[11px] font-['Sora'] font-bold uppercase tracking-wider text-red-100 mt-0.5">
              {language === 'hi' ? 'सहायता' : 'Emergency'}
            </span>
          </div>
        </button>
      </div>

      {/* ─── FULLSCREEN REASSURING EMERGENCY & DISTRESS MODAL ─── */}
      <PatientSOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        language={language}
        patient={patient}
        caretaker={caretaker}
      />

    </div>
  );
};
