import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Pill,
  Calendar,
  Settings,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  Heart,
  AlertTriangle,
  LogOut,
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

  // Workout Flow Handlers
  const handleBeginWorkout = () => {
    const playlist: GameId[] = prescription.prescribedGameIds.length > 0 ? prescription.prescribedGameIds : ['memory-match', 'sequence-recall', 'what-changed'];
    setIsWorkoutMode(true);
    setWorkoutCurrentIndex(0);
    setActiveWorkoutPlaylist([...playlist]);
    setActiveGameId(playlist[0]);
  };

  const handleRecordSessionSummary = (gameId: GameId, summary: any) => {
    // 1. Record session in DailySessionManager (only counts played games)
    const dailyComposite = DailySessionManager.recordSession(summary, true);

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

      // Adjust playlist on the fly based on clinical AI recommendation
      if (recommendation.adjustedPlaylist && recommendation.adjustedPlaylist.length > 0) {
        setActiveWorkoutPlaylist(recommendation.adjustedPlaylist);
      }

      const totalRounds = recommendation.adjustedPlaylist?.length || currentPlaylist.length;
      const isLast = workoutCurrentIndex + 1 >= totalRounds;

      if (isLast) {
        setIsWorkoutCelebrationOpen(true);
      } else {
        setIsIntermissionOpen(true);
      }
    }
  };

  const handleStartNextFromIntermission = () => {
    setIsIntermissionOpen(false);
    const nextIdx = workoutCurrentIndex + 1;
    setWorkoutCurrentIndex(nextIdx);

    // Prioritize AI Adaptive Engine's recommendation, then fallback to adjusted playlist
    const nextGame =
      lastFlowRecommendation?.nextGameId ||
      activeWorkoutPlaylist[nextIdx] ||
      prescription.prescribedGameIds[nextIdx];

    if (nextGame) {
      setActiveGameId(nextGame);
    } else {
      setIsWorkoutCelebrationOpen(true);
    }
  };

  const handleExitWorkout = () => {
    setIsIntermissionOpen(false);
    setIsWorkoutMode(false);
    setActiveGameId(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col">
      
      {/* ─── TOP PATIENT HEADER ───────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-slate-900 leading-tight">
                {t.appTitle}
              </h1>
              <p className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                {t.patientPortal} • {patient.name}
              </p>
            </div>
          </div>

          {/* Right Controls: Language & Switch to Caregiver */}
          <div className="flex items-center gap-3">
            {/* 4-Language Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(['en', 'as', 'bn', 'hi'] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    language === lang
                      ? 'bg-white text-teal-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Switch to Caregiver Portal */}
            {onOpenCaregiverPortal && (
              <button
                onClick={onOpenCaregiverPortal}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>{t.switchToCaregiver}</span>
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

        </div>

        {/* Navigation Tabs Bar */}
        {!activeGameId && (
          <div className="border-t border-slate-100 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto py-2">
              
              <button
                onClick={() => setActiveTab('workout')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'workout'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.todaysWorkout}</span>
              </button>

              <button
                onClick={() => setActiveTab('library')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'library'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>{t.gameLibrary}</span>
              </button>

              <button
                onClick={() => setActiveTab('medications')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'medications'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span>{t.myMedsToday}</span>
              </button>

              <button
                onClick={() => setActiveTab('routine')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'routine'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t.myRoutineToday}</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{t.settings}</span>
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
                totalExercises={activeWorkoutPlaylist.length || prescription.prescribedGameIds.length}
                currentGameTitle={
                  GAME_CATALOG.find((g) => g.id === activeGameId)?.title[language] || activeGameId || ''
                }
                nextGameTitle={
                  lastFlowRecommendation?.nextGameId
                    ? GAME_CATALOG.find((g) => g.id === lastFlowRecommendation.nextGameId)?.title[language] || null
                    : workoutCurrentIndex + 1 < activeWorkoutPlaylist.length
                    ? GAME_CATALOG.find((g) => g.id === activeWorkoutPlaylist[workoutCurrentIndex + 1])?.title[language] || null
                    : null
                }
                onNextExercise={handleStartNextFromIntermission}
                onExitWorkout={handleExitWorkout}
              />
            )}

            {!isWorkoutMode && (
              <button
                onClick={() => setActiveGameId(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← Exit Exercise</span>
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
                onExit={() => {
                  if (isWorkoutMode) {
                    setIsIntermissionOpen(true);
                  } else {
                    setActiveGameId(null);
                  }
                }}
              />
            )}

            {activeGameId === 'memory-match' && (
              <MemoryMatch
                language={language}
                totalRounds={3}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('memory-match', summary);
                }}
                onExit={() => {
                  if (isWorkoutMode) setIsIntermissionOpen(true);
                  else setActiveGameId(null);
                }}
              />
            )}

            {activeGameId === 'sequence-recall' && (
              <SequenceRecall
                language={language}
                totalTrials={4}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('sequence-recall', summary);
                }}
                onExit={() => {
                  if (isWorkoutMode) setIsIntermissionOpen(true);
                  else setActiveGameId(null);
                }}
              />
            )}

            {activeGameId === 'jigsaw-puzzle' && (
              <JigsawPuzzle
                language={language}
                totalPuzzles={3}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('jigsaw-puzzle', summary);
                }}
                onExit={() => {
                  if (isWorkoutMode) setIsIntermissionOpen(true);
                  else setActiveGameId(null);
                }}
              />
            )}

            {activeGameId === 'number-recall' && (
              <NumberRecall
                language={language}
                totalTrials={4}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('number-recall', summary);
                }}
                onExit={() => {
                  if (isWorkoutMode) setIsIntermissionOpen(true);
                  else setActiveGameId(null);
                }}
              />
            )}

            {activeGameId === 'what-changed' && (
              <WhatChanged
                language={language}
                totalTrials={4}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('what-changed', summary);
                }}
                onExit={() => {
                  if (isWorkoutMode) setIsIntermissionOpen(true);
                  else setActiveGameId(null);
                }}
              />
            )}

            {activeGameId === 'pattern-recall' && (
              <PatternRecall
                language={language}
                totalTrials={5}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('pattern-recall', summary);
                }}
                onExit={() => {
                  if (isWorkoutMode) setIsIntermissionOpen(true);
                  else setActiveGameId(null);
                }}
              />
            )}

            {activeGameId === 'odd-one-out' && (
              <OddOneOut
                language={language}
                totalTrials={5}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('odd-one-out', summary);
                }}
                onExit={() => {
                  if (isWorkoutMode) setIsIntermissionOpen(true);
                  else setActiveGameId(null);
                }}
              />
            )}

            {activeGameId === 'where-am-i' && (
              <WhereAmI
                language={language}
                totalTrials={5}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('where-am-i', summary);
                }}
                onExit={() => {
                  if (isWorkoutMode) setIsIntermissionOpen(true);
                  else setActiveGameId(null);
                }}
              />
            )}

            {activeGameId === 'brain-story' && (
              <BrainStory
                language={language}
                totalTrials={3}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('brain-story', summary);
                }}
                onExit={() => {
                  if (isWorkoutMode) setIsIntermissionOpen(true);
                  else setActiveGameId(null);
                }}
              />
            )}

            {activeGameId === 'word-recall' && (
              <InteractiveCognitiveExercise
                gameId="word-recall"
                language={language}
                onSessionComplete={(summary) => {
                  handleRecordSessionSummary('word-recall', summary);
                }}
                onExit={() => {
                  if (isWorkoutMode) setIsIntermissionOpen(true);
                  else setActiveGameId(null);
                }}
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
                  <h3 className="text-base font-bold text-slate-900">Exercise Not Available</h3>
                  <p className="text-xs text-slate-500 mt-1">The requested exercise "{activeGameId}" could not be loaded.</p>
                </div>
                <button
                  onClick={() => {
                    setActiveGameId(null);
                    setIsWorkoutMode(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-slate-800"
                >
                  Return to Dashboard
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

            {/* TAB: MY MEDICATIONS CHECKLIST */}
            {activeTab === 'medications' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{t.myMedsToday}</h3>
                      <p className="text-xs text-slate-500">Tap each medicine after taking it.</p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 mt-4">
                    {medications.map((med) => (
                      <div
                        key={med.id}
                        onClick={() => handleToggleMed(med.id)}
                        className={`py-4 px-3 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                          med.takenToday ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                              med.takenToday
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'border-2 border-slate-300 text-transparent'
                            }`}
                          >
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`font-bold text-base ${med.takenToday ? 'text-emerald-950 line-through' : 'text-slate-900'}`}>
                                {med.name}
                              </p>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                {med.dosage}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 capitalize">
                              {med.timing} • {med.instructions}
                            </p>
                          </div>
                        </div>

                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          med.takenToday ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {med.takenToday ? t.taken : t.pending}
                        </span>
                      </div>
                    ))}

                    {medications.length === 0 && (
                      <p className="text-xs text-slate-400 py-8 text-center">{t.noMedications}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MY DAILY ROUTINE CHECKLIST */}
            {activeTab === 'routine' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{t.myRoutineToday}</h3>
                      <p className="text-xs text-slate-500">Your planned activities for today.</p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 mt-4">
                    {routines.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleRoutine(item.id)}
                        className={`py-4 px-3 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                          item.completed ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                              item.completed
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'border-2 border-slate-300 text-transparent'
                            }`}
                          >
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                                {item.time}
                              </span>
                              <p className={`font-bold text-sm ${item.completed ? 'text-emerald-950 line-through' : 'text-slate-900'}`}>
                                {item.activity}
                              </p>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 capitalize">{item.category}</p>
                          </div>
                        </div>

                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          item.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.completed ? t.completed : t.pending}
                        </span>
                      </div>
                    ))}

                    {routines.length === 0 && (
                      <p className="text-xs text-slate-400 py-8 text-center">{t.noRoutines}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{t.platformSettings}</h3>
                  <p className="text-xs text-slate-500">{t.platformSettingsDesc}</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
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
                            ? 'bg-teal-800 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 text-xs text-teal-900 space-y-2">
                  <p className="font-bold">{t.syncStatus}</p>
                  <p className="text-teal-800">{t.realtimeSyncActive}</p>
                  <p className="text-[11px] text-teal-700">
                    Patient Portal: <strong>Port 5173</strong> • Caregiver Portal: <strong>Port 5174</strong>
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
        totalExercises={activeWorkoutPlaylist.length || prescription.prescribedGameIds.length}
        nextGameTitle={
          (lastFlowRecommendation?.nextGameId &&
            GAME_CATALOG.find((g) => g.id === lastFlowRecommendation.nextGameId)?.title[language]) ||
          (workoutCurrentIndex + 1 < activeWorkoutPlaylist.length &&
            GAME_CATALOG.find((g) => g.id === activeWorkoutPlaylist[workoutCurrentIndex + 1])?.title[language]) ||
          ''
        }
        nextGameSubtitle={
          lastFlowRecommendation?.nextGameId
            ? GAME_CATALOG.find((g) => g.id === lastFlowRecommendation.nextGameId)?.subtitle[language]
            : workoutCurrentIndex + 1 < activeWorkoutPlaylist.length
            ? GAME_CATALOG.find((g) => g.id === activeWorkoutPlaylist[workoutCurrentIndex + 1])?.subtitle[language]
            : undefined
        }
        nextGameDomain={
          lastFlowRecommendation?.domain
            ? (GAME_CATALOG.find((g) => g.id === lastFlowRecommendation.nextGameId)?.domainLabel[language] || lastFlowRecommendation.domain)
            : workoutCurrentIndex + 1 < activeWorkoutPlaylist.length
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
        onViewReport={() => {
          setIsWorkoutCelebrationOpen(false);
          setActiveTab('workout');
        }}
      />

    </div>
  );
};
