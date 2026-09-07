import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Puzzle, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  RotateCw, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Timer,
  ImageIcon,
  Brain,
  Zap,
  Sliders,
  Compass,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { 
  JigsawPuzzleProps, 
  PuzzlePiece, 
  PiecePlacementEvent, 
  PuzzleTrialTelemetry, 
  JigsawDifficulty,
  AIDynamicAction,
  TrialSettingsSnapshot
} from './types';
import { PUZZLE_IMAGES } from './images-catalog';
import { JigsawPraxisEngine } from './engine';
import { jigsawAudio } from './audio';
import { AdaptiveAssistanceEngine } from '../../engine/adaptive-assistance';

/**
 * High-precision Piece Slice Renderer.
 * Slices the full-size vector artwork so that piece (col, row) fills the slot 100% edge-to-edge.
 */
function PieceRenderer({
  col,
  row,
  cols,
  rows,
  svgArt,
  rotation = 0,
}: {
  col: number;
  row: number;
  cols: number;
  rows: number;
  svgArt: string;
  rotation?: number;
}) {
  return (
    <div
      className="w-full h-full relative overflow-hidden transition-transform duration-200"
      style={{
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        transformOrigin: 'center center',
      }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          width: `${cols * 100}%`,
          height: `${rows * 100}%`,
          left: `-${col * 100}%`,
          top: `-${row * 100}%`,
        }}
        dangerouslySetInnerHTML={{ __html: svgArt }}
      />
    </div>
  );
}

// 13 Minimal-step piece tiers
const PIECE_COUNT_TIERS = [
  { count: 2, label: 'T1: 2 Pcs (1×2 Floor)' },
  { count: 4, label: 'T2: 4 Pcs (2×2)' },
  { count: 6, label: 'T3: 6 Pcs (3×2)' },
  { count: 8, label: 'T4: 8 Pcs (4×2)' },
  { count: 9, label: 'T5: 9 Pcs (3×3 Baseline)' },
  { count: 12, label: 'T6: 12 Pcs (4×3)' },
  { count: 16, label: 'T7: 16 Pcs (4×4 Advanced)' },
  { count: 20, label: 'T8: 20 Pcs (5×4)' },
  { count: 24, label: 'T9: 24 Pcs (6×4)' },
  { count: 25, label: 'T10: 25 Pcs (5×5 Expert)' },
  { count: 30, label: 'T11: 30 Pcs (6×5)' },
  { count: 32, label: 'T12: 32 Pcs (8×4 Master)' },
  { count: 36, label: 'T13: 36 Pcs (6×6 Ceiling)' },
];

export const JigsawPuzzle: React.FC<JigsawPuzzleProps> = ({
  language = 'as',
  totalPuzzles = 4,
  initialTheta = 0.0,
  onTrialComplete,
  onSessionComplete,
  onExit,
}) => {
  // Initialize Engine
  const engine = useMemo(() => new JigsawPraxisEngine(initialTheta), [initialTheta]);

  // Shuffled artwork playlist so elder never sees the same in identical order
  const shuffledImages = useMemo(() => {
    const list = [...PUZZLE_IMAGES];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }, []);

  // Current Puzzle State
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [showArtworkPicker, setShowArtworkPicker] = useState(false);
  const [showTestbed, setShowTestbed] = useState(false);
  const [manualPieceCount, setManualPieceCount] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<JigsawDifficulty>(() => engine.getDifficulty());
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [isGhostVisible, setIsGhostVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [trayCategoryFilter, setTrayCategoryFilter] = useState<'all' | 'corners' | 'edges' | 'centers'>('all');

  // Patient Settings Choices & Autonomy Tracking (Per-Trial)
  const [manualStraightenCount, setManualStraightenCount] = useState(0);
  const [manualScrambleCount, setManualScrambleCount] = useState(0);
  const [proactiveHelpRequested, setProactiveHelpRequested] = useState(false);
  const [lastSettingsImpactRationale, setLastSettingsImpactRationale] = useState<string>('');
  const [lastAutonomyScore, setLastAutonomyScore] = useState<number>(70);

  // Live AI Adaptation Messaging & Alerts
  const [aiLiveReasoning, setAiLiveReasoning] = useState<string>('');
  const [aiAdaptationFlash, setAiAdaptationFlash] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [aiDynamicActions, setAiDynamicActions] = useState<AIDynamicAction[]>([]);

  // Timers & Telemetry Tracking
  const [puzzleStartTime, setPuzzleStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [misplacements, setMisplacements] = useState(0);
  const [rotationalErrorsCount, setRotationalErrorsCount] = useState(0); // Cumulative for clinical telemetry
  const [ghostOffPiecesPlacedCount, setGhostOffPiecesPlacedCount] = useState(0); // Exploit verification metric
  const [rotationsUsed, setRotationsUsed] = useState(0);
  const [wasAutoAssisted, setWasAutoAssisted] = useState(false);
  const [autoAssistedPiecesCount, setAutoAssistedPiecesCount] = useState(0);
  const [placementHistory, setPlacementHistory] = useState<PiecePlacementEvent[]>([]);
  const [timeToFirstPlacementMs, setTimeToFirstPlacementMs] = useState<number | null>(null);

  // Live analysis refs
  const lastActionTimeRef = useRef<number>(Date.now());
  const consecutiveFastSolvesRef = useRef<number>(0);
  const lastPlacementTimeRef = useRef<number>(Date.now());
  const liveRotationalErrorsRef = useRef<number>(0); // Transient trigger for live AI interventions

  // Completion State
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [sessionTrials, setSessionTrials] = useState<PuzzleTrialTelemetry[]>([]);

  // Auto-Assist Idle Timer
  const autoAssistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Current Artwork (Either manually selected from gallery or auto-sequenced)
  const currentImage = useMemo(() => {
    if (selectedArtworkId) {
      const found = PUZZLE_IMAGES.find(img => img.id === selectedArtworkId);
      if (found) return found;
    }
    return shuffledImages[currentPuzzleIndex % shuffledImages.length];
  }, [selectedArtworkId, shuffledImages, currentPuzzleIndex]);

  // Localized Strings
  const t = {
    title: {
      as: 'টুকৰা সংযোগ (Jigsaw Puzzle)',
      bn: 'টুকরো জোড়া (Jigsaw Puzzle)',
      hi: 'चित्र पहेली (Jigsaw Puzzle)',
      en: 'Jigsaw Puzzle (Visuomotor Praxis)',
    },
    subtitle: {
      as: 'WAIS-IV ব্লক ডিজাইন আৰু স্থানিক সমন্বয় অনুশীলন',
      bn: 'WAIS-IV ব্লক ডিজাইন ও স্থানিক সমন্বয় অনুশীলন',
      hi: 'स्थानिक समझ और दृश्य-संयोजन अभ्यास',
      en: 'WAIS-IV Block Design & Spatial Visuomotor Praxis',
    },
    tapToPlace: {
      as: 'ট্ৰে’ৰ পৰা এটা টুকুৰা স্পৰ্শ কৰক (বা টানি আনক), আৰু সঠিক স্থানত বহুৱাওক।',
      bn: 'ট্রে থেকে একটি টুকরো স্পর্শ করুন (বা টেনে আনুন), এবং সঠিক স্থানে বসান।',
      hi: 'ट्रे से टुकड़ा छुएं (या खींचें), और सही स्थान पर बिठाएं।',
      en: 'Tap or drag a piece from the tray, and place it into its matching grid slot.',
    },
    ghostGuide: {
      as: 'সহায়িকা ছবি (Ghost Guide)',
      bn: 'সহায়িকা ছবি (Ghost Guide)',
      hi: 'सहायक चित्र (Ghost Guide)',
      en: 'Ghost Guide',
    },
    rotatePiece: {
      as: 'ঘূৰাওক (Rotate 90°)',
      bn: 'ঘোরান (Rotate 90°)',
      hi: 'घुमाएं (Rotate 90°)',
      en: 'Rotate 90°',
    },
    straightenAll: {
      as: 'সকলো পোন কৰক (0°)',
      bn: 'সব সোজা করুন (0°)',
      hi: 'सीधा करें (0°)',
      en: 'Straighten All (0°)',
    },
    perturbAngles: {
      as: 'কোণ ঘূৰাওক (Scramble)',
      bn: 'কোণ ঘোরান (Scramble)',
      hi: 'कोण बदलें (Scramble)',
      en: 'Scramble Angles',
    },
    autoAssistBtn: {
      as: 'সহায় লওক (Help Me)',
      bn: 'সহায়তা নিন (Help Me)',
      hi: 'मदद लें (Help Me)',
      en: 'Gentle Hint',
    },
    chooseArt: {
      as: 'ছবি বাছক (Gallery)',
      bn: 'ছবি নির্বাচন (Gallery)',
      hi: 'चित्र चुनें (Gallery)',
      en: 'Art Gallery',
    },
    completedPuzzleTitle: {
      as: 'অপূৰ্ব! ছবিখন সম্পূৰ্ণ হ’ল!',
      bn: 'চমৎকার! ছবিটি সম্পূর্ণ হয়েছে!',
      hi: 'बहुत सुंदर! चित्र पूरा हो गया!',
      en: 'Splendid! Picture Completed!',
    },
    nextPuzzle: {
      as: 'পৰৱৰ্তী ছবি ➔',
      bn: 'পরবর্তী ছবি ➔',
      hi: 'अगला चित्र ➔',
      en: 'Next Puzzle ➔',
    },
    viewSummary: {
      as: 'ফলাফল চাওক ➔',
      bn: 'ফলাফল দেখুন ➔',
      hi: 'পরিणाम देखें ➔',
      en: 'View Clinical Summary ➔',
    },
    exit: {
      as: 'বাহিৰ হওক',
      bn: 'প্রস্থান',
      hi: 'बाहर जाएं',
      en: 'Exit',
    },
  };

  // Patient-Profile Adaptive Assistance Derivation
  const liveAssistanceProfile = useMemo(() => {
    const latencies = placementHistory.map(p => p.deliberationMs);
    const lockedCount = pieces.filter(p => p.isLocked).length;
    const accuracy = (lockedCount + misplacements) > 0
      ? Math.round((lockedCount / (lockedCount + misplacements)) * 100)
      : 100;

    return AdaptiveAssistanceEngine.deriveAssistanceProfile({
      theta: engine.getTheta(),
      tremorTapsCount: 0,
      recentLatenciesMs: latencies,
      consecutiveErrors: misplacements,
      accuracyPct: accuracy,
      hesitationMs: Date.now() - lastActionTimeRef.current,
      taskType: 'visuomotor',
    });
  }, [engine, placementHistory, misplacements, pieces]);

  // Reset auto-assist idle timer (Profile-Adaptive)
  const resetAutoAssistTimer = useCallback(() => {
    if (autoAssistTimerRef.current) {
      clearTimeout(autoAssistTimerRef.current);
    }

    if (isPuzzleSolved) return;

    autoAssistTimerRef.current = setTimeout(() => {
      triggerAutoAssist(false, liveAssistanceProfile);
    }, liveAssistanceProfile.assistTimeoutMs);
  }, [liveAssistanceProfile, isPuzzleSolved]);

  // Initialize new puzzle
  const initPuzzle = useCallback((_puzzleIdx: number, overridePieces?: number | null) => {
    let diff: JigsawDifficulty;
    if (overridePieces) {
      diff = engine.getDifficultyForPieceCount(overridePieces);
      engine.setDifficulty(diff);
    } else {
      diff = engine.getDifficulty();
    }
    setDifficulty(diff);

    const generated = engine.generatePieces(
      diff.gridCols, 
      diff.gridRows, 
      diff.allowRotation, 
      diff.rotationModes
    );
    setPieces(generated);
    setSelectedPieceId(null);
    setIsPuzzleSolved(false);
    setMisplacements(0);
    setRotationalErrorsCount(0);
    setRotationsUsed(0);
    setWasAutoAssisted(false);
    setAutoAssistedPiecesCount(0);
    setPlacementHistory([]);
    setTimeToFirstPlacementMs(null);
    setPuzzleStartTime(Date.now());
    setElapsedSeconds(0);
    setFeedbackBanner(null);
    setAiDynamicActions([]);
    setManualStraightenCount(0);
    setManualScrambleCount(0);
    setProactiveHelpRequested(false);
    setGhostOffPiecesPlacedCount(0);
    liveRotationalErrorsRef.current = 0;
    consecutiveFastSolvesRef.current = 0;
    lastActionTimeRef.current = Date.now();
    lastPlacementTimeRef.current = Date.now();

    jigsawAudio.speakGuidance('intro', language);
  }, [engine, language]);

  // Load puzzle on index or artwork change or piece count override
  useEffect(() => {
    initPuzzle(currentPuzzleIndex, manualPieceCount);
    return () => {
      if (autoAssistTimerRef.current) clearTimeout(autoAssistTimerRef.current);
    };
  }, [currentPuzzleIndex, selectedArtworkId, manualPieceCount, initPuzzle]);

  // Elapsed timer tick
  useEffect(() => {
    if (isPuzzleSolved) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - puzzleStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [puzzleStartTime, isPuzzleSolved]);

  // Dignity Auto-Assist Trigger (Profile-Adaptive)
  const triggerAutoAssist = (isManual: boolean = false, activeProfile = liveAssistanceProfile) => {
    if (isManual) {
      setProactiveHelpRequested(true);
    }
    const targetPiece = engine.getNextAssistPiece(pieces);
    if (!targetPiece) return;

    setWasAutoAssisted(true);
    setAutoAssistedPiecesCount(prev => prev + 1);

    if (activeProfile.profile === 'severe_amnesic') {
      // Level 3: Auto-straighten tray pieces to 0° upright & highlight piece
      const { modifiedPieces } = engine.straightenTrayPieces(pieces);
      const highlightedPieces = modifiedPieces.map(p => 
        p.id === targetPiece.id ? { ...p, isHighlighted: true } : { ...p, isHighlighted: false }
      );
      setPieces(highlightedPieces);
      setSelectedPieceId(targetPiece.id);
      setFeedbackBanner('AI Live Assist: Tray aligned to 0° & target piece illuminated for ease.');
      setTimeout(() => setFeedbackBanner(null), 4000);
    } else if (activeProfile.profile === 'motor_tremor_slowed') {
      // Motor profile: Reassure patient without jarring tray rotation
      setPieces(prev => prev.map(p => p.id === targetPiece.id ? { ...p, isHighlighted: true } : { ...p, isHighlighted: false }));
      setSelectedPieceId(targetPiece.id);
      setFeedbackBanner('🛡️ Motor stabilization active. Aim and drop comfortably without rush.');
      setTimeout(() => setFeedbackBanner(null), 4500);
    } else {
      // Level 1 / 2: Highlight piece and target cell
      setPieces(prev => prev.map(p => p.id === targetPiece.id ? { ...p, isHighlighted: true } : { ...p, isHighlighted: false }));
      setSelectedPieceId(targetPiece.id);
    }

    jigsawAudio.playAutoAssistChime();
    jigsawAudio.speakGuidance('assist', language);
  };

  // Handle Piece Selection from Tray
  const handleSelectPiece = (pieceId: string) => {
    if (!engine.filterTremorTap()) return; // 400ms Tremor filter
    setSelectedPieceId(pieceId);
    lastActionTimeRef.current = Date.now();
    resetAutoAssistTimer();
  };

  // Handle Single Piece Rotation
  const handleRotateSinglePiece = (pieceId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!engine.filterTremorTap()) return;

    setPieces(prev => prev.map(p => {
      if (p.id === pieceId && !p.isLocked) {
        const nextRot = (p.rotation + 90) % 360;
        return { ...p, rotation: nextRot };
      }
      return p;
    }));

    setRotationsUsed(r => r + 1);
    lastActionTimeRef.current = Date.now();
    jigsawAudio.playRotateChime();
    resetAutoAssistTimer();
  };

  // Manual Straighten All Pieces (0 deg)
  const handleStraightenAll = () => {
    setManualStraightenCount(c => c + 1);
    const { modifiedPieces, changedCount } = engine.straightenTrayPieces(pieces);
    if (changedCount > 0) {
      setPieces(modifiedPieces);
      liveRotationalErrorsRef.current = 0; // Reset live trigger without wiping cumulative telemetry!
      lastActionTimeRef.current = Date.now();
      jigsawAudio.playAutoAssistChime();
      setFeedbackBanner('🛡️ Tray auto-aligned to 0° upright. AI will prioritize upright pieces for patient comfort.');
      setTimeout(() => setFeedbackBanner(null), 4000);
    }
  };

  // Manual Perturb Angles (Challenge Trigger)
  const handlePerturbAngles = () => {
    setManualScrambleCount(c => c + 1);
    const { modifiedPieces, changedCount } = engine.perturbTrayPieces(pieces, difficulty.rotationModes);
    if (changedCount > 0) {
      setPieces(modifiedPieces);
      lastActionTimeRef.current = Date.now();
      jigsawAudio.playRotateChime();
      setFeedbackBanner('⚡ Rotations scrambled. AI will accelerate mental rotation challenge.');
      setTimeout(() => setFeedbackBanner(null), 4000);
    }
  };

  // Core Placement Logic
  const handlePlacePieceAt = (pieceId: string, targetCol: number, targetRow: number) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece || piece.isLocked) return;

    // Check if slot is already occupied
    const isOccupied = pieces.some(p => p.isLocked && p.correctCol === targetCol && p.correctRow === targetRow);
    if (isOccupied) return;

    const now = Date.now();
    const deliberation = now - puzzleStartTime;
    if (timeToFirstPlacementMs === null) {
      setTimeToFirstPlacementMs(deliberation);
    }
    lastActionTimeRef.current = now;

    const { isCorrect, wasCorrectPositionWrongAngle } = engine.evaluatePlacement(
      piece, 
      targetCol, 
      targetRow, 
      piece.rotation
    );

    if (isCorrect) {
      // Track verification metric: pieces placed while ghost guide was OFF
      if (!isGhostVisible) {
        setGhostOffPiecesPlacedCount(c => c + 1);
      }

      // Fast solve tracking
      const solveDelta = now - lastPlacementTimeRef.current;
      lastPlacementTimeRef.current = now;
      if (solveDelta < 5000) {
        consecutiveFastSolvesRef.current++;
      } else {
        consecutiveFastSolvesRef.current = 1;
      }

      jigsawAudio.playPieceSnap();
      jigsawAudio.speakGuidance('snap', language);

      const updatedPieces = pieces.map(p => {
        if (p.id === piece.id) {
          return {
            ...p,
            currentCol: targetCol,
            currentRow: targetRow,
            isLocked: true,
            isHighlighted: false,
          };
        }
        return p;
      });

      setPieces(updatedPieces);
      setSelectedPieceId(null);
      setFeedbackBanner(null);

      const event: PiecePlacementEvent = {
        pieceId: piece.id,
        targetCol,
        targetRow,
        isCorrect: true,
        deliberationMs: deliberation,
        rotationAtPlacement: piece.rotation,
        timestamp: now,
      };
      setPlacementHistory(prev => [...prev, event]);

      // Check if entire puzzle is solved!
      const lockedCount = updatedPieces.filter(p => p.isLocked).length;
      if (lockedCount === difficulty.totalPieces) {
        handlePuzzleCompleted(updatedPieces);
      } else {
        resetAutoAssistTimer();
      }

    } else if (wasCorrectPositionWrongAngle) {
      // Placed in correct slot, but orientation was wrong!
      consecutiveFastSolvesRef.current = 0;
      setRotationalErrorsCount(r => r + 1); // Cumulative trial metric
      liveRotationalErrorsRef.current += 1; // Live trigger for AI intervention
      setMisplacements(m => m + 1);

      jigsawAudio.playRotateChime();
      setFeedbackBanner('🎯 Correct slot! Rotate the piece to upright (0°) to lock.');
      setTimeout(() => setFeedbackBanner(null), 3500);

      const event: PiecePlacementEvent = {
        pieceId: piece.id,
        targetCol,
        targetRow,
        isCorrect: false,
        wasCorrectPositionWrongAngle: true,
        deliberationMs: deliberation,
        rotationAtPlacement: piece.rotation,
        timestamp: now,
      };
      setPlacementHistory(prev => [...prev, event]);
      resetAutoAssistTimer();

    } else {
      // Coordinate mismatch
      consecutiveFastSolvesRef.current = 0;
      setMisplacements(m => m + 1);
      const event: PiecePlacementEvent = {
        pieceId: piece.id,
        targetCol,
        targetRow,
        isCorrect: false,
        deliberationMs: deliberation,
        rotationAtPlacement: piece.rotation,
        timestamp: now,
      };
      setPlacementHistory(prev => [...prev, event]);
      resetAutoAssistTimer();
    }
  };

  // Real-time AI Cognition & Dynamic Tray Orientation Monitor
  useEffect(() => {
    if (isPuzzleSolved || !difficulty.dynamicReorientationEnabled) return;

    const checkInterval = setInterval(() => {
      const idleSeconds = Math.floor((Date.now() - lastActionTimeRef.current) / 1000);
      
      const intervention = engine.analyzeLiveIntervention({
        consecutiveFastSolves: consecutiveFastSolvesRef.current,
        rotationalErrorsCount: liveRotationalErrorsRef.current,
        idleTimeSeconds: idleSeconds,
        allowRotation: difficulty.allowRotation,
        currentPieces: pieces,
      });

      if (intervention.action === 'perturb_tray') {
        const { modifiedPieces, changedCount } = engine.perturbTrayPieces(pieces, difficulty.rotationModes);
        if (changedCount > 0) {
          setPieces(modifiedPieces);
          consecutiveFastSolvesRef.current = 0;
          lastActionTimeRef.current = Date.now();
          const rationaleText = intervention.rationale[language] || intervention.rationale.en;
          setAiLiveReasoning(rationaleText);
          setAiAdaptationFlash(true);
          setTimeout(() => setAiAdaptationFlash(false), 4500);
          jigsawAudio.playRotateChime();
          setAiDynamicActions(prev => [
            ...prev,
            {
              type: 'perturb_tray',
              timestamp: Date.now(),
              rationale: intervention.rationale,
              piecesAffected: changedCount,
            }
          ]);
        }
      } else if (intervention.action === 'straighten_tray') {
        const { modifiedPieces, changedCount } = engine.straightenTrayPieces(pieces);
        if (changedCount > 0) {
          setPieces(modifiedPieces);
          liveRotationalErrorsRef.current = 0;
          lastActionTimeRef.current = Date.now();
          const rationaleText = intervention.rationale[language] || intervention.rationale.en;
          setAiLiveReasoning(rationaleText);
          setAiAdaptationFlash(true);
          setTimeout(() => setAiAdaptationFlash(false), 4500);
          jigsawAudio.playAutoAssistChime();
          setAiDynamicActions(prev => [
            ...prev,
            {
              type: 'straighten_tray',
              timestamp: Date.now(),
              rationale: intervention.rationale,
              piecesAffected: changedCount,
            }
          ]);
        }
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, [isPuzzleSolved, difficulty, pieces, engine, language]);

  // Handle Full Puzzle Completion & Real-time AI Parameter Adaptation
  const handlePuzzleCompleted = (solvedPieces: PuzzlePiece[]) => {
    setIsPuzzleSolved(true);
    if (autoAssistTimerRef.current) clearTimeout(autoAssistTimerRef.current);

    jigsawAudio.playPuzzleComplete();
    jigsawAudio.speakGuidance('complete', language);

    // Confetti celebration
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {}

    const totalSolveTimeMs = Date.now() - puzzleStartTime;
    
    // Trial Settings Snapshot
    const settingsSnapshot: TrialSettingsSnapshot = {
      ghostGuideVisible: isGhostVisible,
      ghostOffPiecesPlacedCount,
      audioMuted: isMuted,
      manualStraightenCount,
      manualScrambleCount,
      manualPieceRotationsCount: rotationsUsed,
      trayFilterUsed: trayCategoryFilter,
      proactiveHelpRequested,
      isManualTierOverride: manualPieceCount !== null,
    };

    // AI Bayesian Theta & DDA Step with Settings Factor
    const { newTheta, reasoning, settingsImpactRationale, autonomyScore } = engine.updateTheta(
      true, 
      misplacements, 
      wasAutoAssisted,
      settingsSnapshot
    );
    const newDiff = engine.getDifficulty();
    
    // Flash AI reasoning and settings impact rationale on screen
    const reasoningText = reasoning[language] || reasoning.en;
    const settingsText = settingsImpactRationale[language] || settingsImpactRationale.en;
    setAiLiveReasoning(reasoningText);
    setLastSettingsImpactRationale(settingsText);
    setLastAutonomyScore(autonomyScore);
    setAiAdaptationFlash(true);
    setTimeout(() => setAiAdaptationFlash(false), 5000);

    const parietalSynthesisIndex = Math.max(10, Math.min(100, Math.round(
      100 - (rotationalErrorsCount * 18) - (misplacements * 8)
    )));

    const trialTelemetry: PuzzleTrialTelemetry = {
      trialIndex: currentPuzzleIndex + 1,
      puzzleImageId: currentImage.id,
      totalPieces: difficulty.totalPieces,
      piecesPlacedCorrectly: solvedPieces.filter(p => p.isLocked).length,
      misplacementsCount: misplacements,
      rotationalErrorsCount,
      parietalSynthesisIndex,
      timeToFirstPlacementMs: timeToFirstPlacementMs || totalSolveTimeMs,
      totalSolveTimeMs,
      rotationsUsed,
      wasAutoAssisted,
      autoAssistedPiecesCount,
      thetaAfterTrial: Number(newTheta.toFixed(2)),
      difficultySnapshot: newDiff,
      aiAdaptiveReasoning: reasoning,
      settingsSnapshot,
      settingsImpactRationale,
      autonomyScore,
      aiDynamicActions,
      placementHistory,
    };

    onTrialComplete?.(trialTelemetry);
    setSessionTrials(prev => [...prev, trialTelemetry]);
  };

  // Advance to Next Puzzle or Finish
  const handleNextOrFinish = () => {
    if (currentPuzzleIndex + 1 < totalPuzzles) {
      setSelectedArtworkId(null);
      setCurrentPuzzleIndex(prev => prev + 1);
    } else {
      setIsSessionFinished(true);
      const summary = engine.compileSessionSummary(sessionTrials);
      onSessionComplete?.(summary);
    }
  };

  // Caregiver / Patient Early Session Exit with Partial Telemetry Preservation
  const handleExitSession = () => {
    if (sessionTrials.length > 0) {
      const summary = engine.compileSessionSummary(sessionTrials, true);
      onSessionComplete?.(summary);
    }
    onExit?.();
  };

  // Switch to specific artwork from gallery
  const handleSelectArtworkFromGallery = (artId: string) => {
    setSelectedArtworkId(artId);
    setShowArtworkPicker(false);
  };

  // Audio mute toggle
  const handleToggleMute = () => {
    const next = jigsawAudio.toggleMute();
    setIsMuted(next);
  };

  // Filtered pieces in tray
  const unplacedPieces = useMemo(() => {
    const raw = pieces.filter(p => !p.isLocked);
    if (difficulty.totalPieces < 16 || trayCategoryFilter === 'all') return raw;

    const cols = difficulty.gridCols;
    const rows = difficulty.gridRows;

    if (trayCategoryFilter === 'corners') {
      return raw.filter(p => 
        (p.correctCol === 0 || p.correctCol === cols - 1) && 
        (p.correctRow === 0 || p.correctRow === rows - 1)
      );
    }

    if (trayCategoryFilter === 'edges') {
      return raw.filter(p => 
        p.correctCol === 0 || p.correctCol === cols - 1 || 
        p.correctRow === 0 || p.correctRow === rows - 1
      );
    }

    if (trayCategoryFilter === 'centers') {
      return raw.filter(p => 
        p.correctCol > 0 && p.correctCol < cols - 1 && 
        p.correctRow > 0 && p.correctRow < rows - 1
      );
    }

    return raw;
  }, [pieces, difficulty.totalPieces, difficulty.gridCols, difficulty.gridRows, trayCategoryFilter]);

  // Responsive column count for tray
  const trayGridClass = useMemo(() => {
    if (difficulty.totalPieces <= 4) return 'grid-cols-2';
    if (difficulty.totalPieces <= 9) return 'grid-cols-2 sm:grid-cols-3';
    if (difficulty.totalPieces <= 16) return 'grid-cols-3 sm:grid-cols-4';
    return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5';
  }, [difficulty.totalPieces]);

  // Aspect ratio of the piece slot
  const cellAspectRatio = `${difficulty.gridRows} / ${difficulty.gridCols}`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-7 max-w-6xl mx-auto space-y-5 animate-fadeIn select-none">
      
      {/* 1. TOP HEADER & ACCESSIBILITY CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs">
              <Puzzle className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.title[language]}
            </h2>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
              Tier {difficulty.tierLevel}: {difficulty.gridCols}×{difficulty.gridRows} ({difficulty.totalPieces} Pcs)
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t.subtitle[language]}
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Progress Indicator */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-slate-500" />
            <span>Puzzle {currentPuzzleIndex + 1} of {totalPuzzles}</span>
            <span className="text-slate-400">·</span>
            <span className="text-amber-700 font-black">{elapsedSeconds}s</span>
          </div>

          {/* AI TESTBED BUTTON (Matching Game 1 & 2) */}
          <button
            onClick={() => setShowTestbed(!showTestbed)}
            className={`px-3 py-1.5 border font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 ${
              showTestbed
                ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
            }`}
            title="Inspect AI dynamic variables & test live clinical features"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>AI Testbed</span>
            {showTestbed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Ability Theta Pill */}
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-black text-slate-700 shadow-2xs">
            <Brain className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Ability (θ): <strong>{engine.getTheta() >= 0 ? `+${engine.getTheta().toFixed(2)}` : engine.getTheta().toFixed(2)}</strong></span>
          </div>

          {/* Gallery Artwork Picker */}
          <button
            onClick={() => setShowArtworkPicker(v => !v)}
            title="Browse All 8 Heritage Artworks"
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <ImageIcon className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">{t.chooseArt[language]}</span>
          </button>

          {/* Ghost Guide Toggle with +Bonus Indicator */}
          <button
            onClick={() => {
              const next = !isGhostVisible;
              setIsGhostVisible(next);
              if (!next) {
                setFeedbackBanner('🧠 Unassisted Mode Active: Ghost Guide OFF (+0.75 2PL IRT Ability Bonus on success)');
                setTimeout(() => setFeedbackBanner(null), 4000);
              } else {
                setFeedbackBanner('👁️ Visual Scaffolding Active: Ghost Guide ON (Standard Baseline Guidance)');
                setTimeout(() => setFeedbackBanner(null), 3500);
              }
            }}
            title="Toggle Ghost Guide Underlay"
            className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              isGhostVisible 
                ? 'bg-amber-50 border-amber-300 text-amber-900' 
                : 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-300'
            }`}
          >
            {isGhostVisible ? <Eye className="w-4 h-4 text-amber-700" /> : <EyeOff className="w-4 h-4 text-emerald-700" />}
            <span className="hidden sm:inline">{t.ghostGuide[language]}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase ${!isGhostVisible ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-amber-200 text-amber-900'}`}>
              {!isGhostVisible ? '+Bonus' : 'ON'}
            </span>
          </button>

          {/* Mute Audio Toggle */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Dignity Auto-Assist Button */}
          <button
            onClick={() => triggerAutoAssist(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.autoAssistBtn[language]}</span>
          </button>

          {/* Exit Button */}
          {onExit && (
            <button
              onClick={handleExitSession}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
            >
              {t.exit[language]}
            </button>
          )}
        </div>
      </div>

      {/* 2. SIH 2026 AI TESTBED & CLINICAL INSPECTOR DRAWER */}
      {showTestbed && (
        <div className="my-4 p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950 text-white rounded-3xl border-2 border-amber-500 shadow-2xl space-y-4 animate-fadeIn">
          
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-black tracking-widest text-amber-400 uppercase">
              <Sliders className="w-4 h-4" />
              <span>SIH 2026 Visuoconstructional Praxis AI Inspector & Testbed</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2.5 py-1 rounded-lg">
                Profile: {liveAssistanceProfile.displayName[language] || liveAssistanceProfile.displayName.en} ({liveAssistanceProfile.assistTimeoutMs / 1000}s)
              </span>
              <span className="text-[11px] font-mono bg-white/10 px-2.5 py-1 rounded-lg text-amber-200">
                Tier {difficulty.tierLevel} | {difficulty.gridCols}×{difficulty.gridRows} ({difficulty.totalPieces} Pcs)
              </span>
              <span className="text-[11px] font-mono bg-white/10 px-2.5 py-1 rounded-lg text-emerald-300">
                Ghost: {Math.round(difficulty.ghostOpacity * 100)}%
              </span>
              <span className="text-[11px] font-mono bg-white/10 px-2.5 py-1 rounded-lg text-indigo-300">
                Snap: {difficulty.snapMarginPx}px
              </span>
              <span className="text-[11px] font-mono bg-white/10 px-2.5 py-1 rounded-lg text-rose-300">
                Rotation: {difficulty.allowRotation ? (difficulty.rotationModes.length > 2 ? '4-Way (90°)' : '180° Inversion') : '0° Locked'}
              </span>
            </div>
          </div>

          {/* Section A: Live Simulated AI Actions */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              1. Live Dynamic AI Interventions & Sensory Triggers:
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <button
                onClick={handlePerturbAngles}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                title="Simulates rapid patient flow: dynamically perturbs tray piece angles to 90°/180°/270°"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>⚡ Simulate Rapid Flow (Perturb Tray Angles)</span>
              </button>

              <button
                onClick={handleStraightenAll}
                className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                title="Simulates hesitation: auto-aligns all tray pieces upright to 0°"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                <span>🛡️ Simulate Hesitation (Auto-Align Tray 0°)</span>
              </button>

              <button
                onClick={() => triggerAutoAssist(true)}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                title="Fires dignity auto-assist pulse"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>💡 Test Dignity Auto-Assist Glide</span>
              </button>

              <button
                onClick={() => jigsawAudio.speakGuidance('assist', language)}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                <span>🔊 Test Vernacular Voice Prompt</span>
              </button>
            </div>
          </div>

          {/* Section B: Force Minimal-Step Difficulty Tier */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              2. Force Minimal-Step Clinical Tier (2 to 36 Pieces):
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <button
                onClick={() => setManualPieceCount(null)}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  manualPieceCount === null
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                }`}
              >
                Auto AI (Bayesian 2PL IRT)
              </button>

              {PIECE_COUNT_TIERS.map(tier => {
                const isSelected = manualPieceCount === tier.count || (manualPieceCount === null && difficulty.totalPieces === tier.count);
                return (
                  <button
                    key={tier.count}
                    onClick={() => setManualPieceCount(tier.count)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-xs'
                        : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                    }`}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section C: Live Patient Settings Audit & Scaffolding Adaptation */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                3. Patient Settings Audit & Scaffolding Adaptation:
              </span>
              <span className="text-[10px] font-mono text-amber-300">
                Current Autonomy: <strong>{lastAutonomyScore}%</strong> ({lastAutonomyScore >= 75 ? 'Autonomous Mastery' : (lastAutonomyScore >= 45 ? 'Moderate Guidance' : 'High Scaffolding Reliance')})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Ghost Guide</span>
                <span className={`font-black text-xs flex items-center gap-1 mt-0.5 ${!isGhostVisible ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {!isGhostVisible ? 'OFF (+0.75 IRT Bonus)' : `ON (${Math.round(difficulty.ghostOpacity * 100)}% Guide)`}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {!isGhostVisible ? 'Pure mental coordinate reconstruction' : 'Visual matching scaffold active'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Tray Straightens</span>
                <span className={`font-black text-xs flex items-center gap-1 mt-0.5 ${manualStraightenCount > 0 ? 'text-indigo-300' : 'text-slate-200'}`}>
                  {manualStraightenCount} Request(s)
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {engine.getPatientPrefersUpright() ? 'AI locked to 0° upright for comfort' : 'Spontaneous orientation'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Manual Scrambles</span>
                <span className={`font-black text-xs flex items-center gap-1 mt-0.5 ${manualScrambleCount > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {manualScrambleCount} Provocation(s)
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {manualScrambleCount > 0 ? 'Patient requested rotational challenge' : 'No scramble requested'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Executive Filter</span>
                <span className="font-black text-xs text-amber-300 capitalize mt-0.5 block">
                  {trayCategoryFilter} pieces
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {trayCategoryFilter !== 'all' ? 'Active chunking strategy recorded' : 'Full visual search'}
                </span>
              </div>
            </div>

            {lastSettingsImpactRationale && (
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-[11px] text-amber-200 leading-relaxed">
                <strong>⚙️ AI Settings Adaptation Rationale:</strong> {lastSettingsImpactRationale}
              </div>
            )}
          </div>

          {/* Section D: Live Real-Time Diagnostics Telemetry Bar */}
          <div className="pt-2 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Latent Ability (θ)</span>
              <strong className="text-base text-amber-300">{engine.getTheta() >= 0 ? `+${engine.getTheta().toFixed(2)}` : engine.getTheta().toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Parietal Synthesis</span>
              <strong className="text-base text-emerald-300">
                {Math.max(10, Math.min(100, Math.round(100 - (rotationalErrorsCount * 18) - (misplacements * 8))))}%
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Rotational Errors</span>
              <strong className="text-base text-rose-300">{rotationalErrorsCount}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Tremor Debounce</span>
              <strong className="text-base text-cyan-300">{engine.getTremorFilteredCount()} taps filtered</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Deliberation</span>
              <strong className="text-base text-purple-300">{elapsedSeconds}s elapsed</strong>
            </div>
          </div>

        </div>
      )}

      {/* 3. ARTWORK PICKER DRAWER */}
      {showArtworkPicker && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-slate-800">
              Cultural Artworks Gallery ({PUZZLE_IMAGES.length} Available)
            </h4>
            <span className="text-[11px] text-slate-500">Tap any artwork to load immediately</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PUZZLE_IMAGES.map(img => (
              <button
                key={img.id}
                onClick={() => handleSelectArtworkFromGallery(img.id)}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-1.5 ${
                  currentImage.id === img.id
                    ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400'
                    : 'bg-white hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden border border-slate-300/60 bg-slate-900 pointer-events-none" dangerouslySetInnerHTML={{ __html: img.svgArt }} />
                <p className="text-[11px] font-black text-slate-800 truncate">{img.titles[language]}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. LIVE AI ADAPTIVE REASONING & ACTIVE PARAMETERS HUD */}
      <div className={`p-3.5 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
        aiAdaptationFlash 
          ? 'bg-amber-100/90 border-amber-400 shadow-md ring-2 ring-amber-300' 
          : 'bg-gradient-to-r from-slate-50 via-amber-50/40 to-slate-50 border-slate-200/80'
      }`}>
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1">
                <span>Live AI Cognitive-Motor Analysis</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              </span>

              {/* Live Settings Impact Badges */}
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${
                !isGhostVisible 
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                {!isGhostVisible ? '★ Unassisted Ghost (+Bonus)' : 'Ghost Scaffolding'}
              </span>

              {engine.getPatientPrefersUpright() && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase border bg-indigo-100 text-indigo-900 border-indigo-300">
                  0° Upright Locked by Patient
                </span>
              )}

              {isMuted && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase border bg-rose-100 text-rose-800 border-rose-200">
                  Audio Muted
                </span>
              )}
            </div>

            <p className="text-xs text-slate-700 font-medium leading-relaxed mt-0.5">
              {aiLiveReasoning || `Monitoring spatial synthesis & orientation angles (θ: ${engine.getTheta() >= 0 ? '+' : ''}${engine.getTheta().toFixed(2)}). Minimal-step parameter titration active.`}
            </p>

            {lastSettingsImpactRationale && (
              <p className="text-[11px] text-amber-900 font-bold mt-0.5">
                ⚙️ {lastSettingsImpactRationale}
              </p>
            )}
          </div>
        </div>

        {/* Active Parameter Chips + Autonomy Score */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <span className="text-[10px] font-bold bg-white text-slate-700 px-2 py-1 rounded-lg border border-slate-200">
            Grid: <strong>{difficulty.gridCols}×{difficulty.gridRows}</strong>
          </span>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
            !isGhostVisible ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-black' : 'bg-white text-slate-700 border-slate-200'
          }`}>
            Ghost: <strong>{isGhostVisible ? `${Math.round(difficulty.ghostOpacity * 100)}%` : 'OFF (+Bonus)'}</strong>
          </span>
          <span className="text-[10px] font-bold bg-white text-slate-700 px-2 py-1 rounded-lg border border-slate-200">
            Snap: <strong>{difficulty.snapMarginPx}px</strong>
          </span>
          <span className="text-[10px] font-bold bg-white text-slate-700 px-2 py-1 rounded-lg border border-slate-200">
            Rotation: <strong>{difficulty.allowRotation ? (difficulty.rotationModes.length > 2 ? '4-Way (90°)' : '180° Inversion') : '0° Locked'}</strong>
          </span>
          <span className="text-[10px] font-bold bg-amber-50 text-amber-900 px-2 py-1 rounded-lg border border-amber-300 font-black">
            Autonomy: <strong>{lastAutonomyScore}%</strong>
          </span>
        </div>
      </div>

      {/* Optional Feedback Alert Banner */}
      {feedbackBanner && (
        <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-black flex items-center gap-2 animate-fadeIn">
          <Compass className="w-4 h-4 text-indigo-600 animate-spin" />
          <span>{feedbackBanner}</span>
        </div>
      )}

      {/* 5. MAIN PUZZLE WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: TARGET ASSEMBLY CANVAS (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          
          {/* Target Title */}
          <div className="w-full mb-3 flex items-center justify-between text-xs font-bold text-slate-600">
            <span className="font-extrabold text-slate-800 text-sm">
              {currentImage.titles[language]}
            </span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
              {pieces.filter(p => p.isLocked).length} / {difficulty.totalPieces} Placed
            </span>
          </div>

          {/* Assembly Board Container */}
          <div className="relative w-full aspect-square max-w-[430px] rounded-3xl overflow-hidden border-4 border-slate-300 bg-slate-900 shadow-xl">
            
            {/* Ghost Image Underlay */}
            {isGhostVisible && (
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
                style={{ opacity: difficulty.ghostOpacity }}
                dangerouslySetInnerHTML={{ __html: currentImage.svgArt }}
              />
            )}

            {/* Target Snap Grid Overlay */}
            <div 
              className="absolute inset-0 z-10 grid"
              style={{
                gridTemplateColumns: `repeat(${difficulty.gridCols}, 1fr)`,
                gridTemplateRows: `repeat(${difficulty.gridRows}, 1fr)`,
              }}
            >
              {Array.from({ length: difficulty.gridRows }).map((_, r) => (
                Array.from({ length: difficulty.gridCols }).map((__, c) => {
                  const placedPiece = pieces.find(p => p.isLocked && p.correctCol === c && p.correctRow === r);
                  const isTargetAssisted = pieces.some(p => p.isHighlighted && p.correctCol === c && p.correctRow === r);

                  return (
                    <div
                      key={`cell_${r}_${c}`}
                      onClick={() => {
                        if (selectedPieceId) {
                          handlePlacePieceAt(selectedPieceId, c, r);
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const pId = e.dataTransfer.getData('text/plain') || selectedPieceId;
                        if (pId) handlePlacePieceAt(pId, c, r);
                      }}
                      className={`relative border border-dashed border-slate-400/40 flex items-center justify-center transition-all cursor-pointer overflow-hidden ${
                        !placedPiece && selectedPieceId ? 'hover:bg-amber-400/25 hover:border-amber-400' : ''
                      } ${
                        isTargetAssisted && !placedPiece 
                          ? 'ring-4 ring-amber-400 ring-inset animate-pulse bg-amber-300/30 border-amber-500' 
                          : ''
                      }`}
                    >
                      {/* Placed Locked Piece Rendering */}
                      {placedPiece ? (
                        <div className="w-full h-full relative">
                          <PieceRenderer
                            col={c}
                            row={r}
                            cols={difficulty.gridCols}
                            rows={difficulty.gridRows}
                            svgArt={currentImage.svgArt}
                            rotation={placedPiece.rotation}
                          />
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ) : (
                        /* Empty Slot Placeholder */
                        <div className="text-center p-1 pointer-events-none">
                          <span className="text-[10px] font-bold text-white/40">
                            {r * difficulty.gridCols + c + 1}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              ))}
            </div>

          </div>

          <p className="text-xs text-slate-500 font-medium text-center mt-3 max-w-sm leading-relaxed">
            {t.tapToPlace[language]}
          </p>
        </div>

        {/* RIGHT COLUMN: PIECE TRAY (5 COLS) */}
        <div className="lg:col-span-5 space-y-3">
          
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Pieces Tray ({pieces.filter(p => !p.isLocked).length} Left)
            </h3>

            {/* Tray Action Controls */}
            <div className="flex items-center gap-1.5">
              {difficulty.allowRotation && selectedPieceId && (
                <button
                  onClick={(e) => handleRotateSinglePiece(selectedPieceId, e)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>{t.rotatePiece[language]}</span>
                </button>
              )}

              {/* Straighten All (0 deg) Button */}
              {pieces.some(p => !p.isLocked && p.rotation !== 0) && (
                <button
                  onClick={handleStraightenAll}
                  title="Straighten all tray pieces upright (0°)"
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{t.straightenAll[language]}</span>
                </button>
              )}

              {/* Perturb Angles Manual Trigger */}
              {difficulty.allowRotation && (
                <button
                  onClick={handlePerturbAngles}
                  title="Randomize piece rotation angles"
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <RotateCw className="w-3 h-3 text-indigo-500" />
                  <span className="hidden sm:inline">{t.perturbAngles[language]}</span>
                </button>
              )}
            </div>
          </div>

          {/* Piece Category Filter Tabs for 16+ Pieces */}
          {difficulty.totalPieces >= 16 && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 text-[11px] font-black">
              {(['all', 'corners', 'edges', 'centers'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setTrayCategoryFilter(cat)}
                  className={`flex-1 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                    trayCategoryFilter === cat 
                      ? 'bg-white text-slate-900 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Unplaced Pieces Tray */}
          <div className={`p-3 rounded-3xl bg-slate-50 border border-slate-200 min-h-[300px] grid ${trayGridClass} gap-3 max-h-[480px] overflow-y-auto`}>
            {unplacedPieces.map(piece => {
              const isSelected = selectedPieceId === piece.id;

              return (
                <div
                  key={piece.id}
                  draggable={!piece.isLocked}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', piece.id);
                    setSelectedPieceId(piece.id);
                  }}
                  onClick={() => handleSelectPiece(piece.id)}
                  className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-150 shadow-sm flex items-center justify-center bg-slate-900 group ${
                    isSelected
                      ? 'border-amber-500 ring-4 ring-amber-300 scale-103 shadow-xl'
                      : piece.isHighlighted
                      ? 'border-amber-400 ring-4 ring-amber-300/80 animate-pulse'
                      : 'border-slate-300 hover:border-slate-400 hover:scale-102'
                  }`}
                  style={{
                    aspectRatio: cellAspectRatio,
                  }}
                >
                  {/* Sliced Piece Visual */}
                  <PieceRenderer
                    col={piece.correctCol}
                    row={piece.correctRow}
                    cols={difficulty.gridCols}
                    rows={difficulty.gridRows}
                    svgArt={currentImage.svgArt}
                    rotation={piece.rotation}
                  />

                  {/* Individual Rotate Button in Card Corner */}
                  {difficulty.allowRotation && (
                    <button
                      onClick={(e) => handleRotateSinglePiece(piece.id, e)}
                      title="Rotate 90° Clockwise"
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-indigo-600 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                    >
                      <RotateCw className="w-3 h-3" />
                    </button>
                  )}

                  {/* Non-Zero Rotation Angle Badge */}
                  {piece.rotation !== 0 && (
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-indigo-900/90 text-indigo-100 text-[9px] font-black">
                      {piece.rotation}°
                    </div>
                  )}

                  {/* Selected Pill Badge */}
                  {isSelected && (
                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-black uppercase shadow-xs">
                      Selected
                    </div>
                  )}
                </div>
              );
            })}

            {/* When Tray Filter Returns Empty */}
            {unplacedPieces.length === 0 && pieces.some(p => !p.isLocked) && (
              <div className="col-span-full py-8 text-center text-slate-400">
                <p className="text-xs font-bold">No pieces in this category filter.</p>
                <button
                  onClick={() => setTrayCategoryFilter('all')}
                  className="mt-1 text-xs text-amber-700 font-bold underline cursor-pointer"
                >
                  Show All Pieces
                </button>
              </div>
            )}

            {/* When All Pieces from Tray Are Placed */}
            {pieces.filter(p => !p.isLocked).length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                <p className="text-sm font-bold text-slate-700">All pieces assembled into grid!</p>
              </div>
            )}
          </div>

          {/* Neuroplastic Scaffolding Information Card */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900/90 space-y-1">
            <div className="flex items-center gap-1.5 font-black text-amber-950">
              <Brain className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Parietal Visuomotor Stimulation</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900/80">
              Fine-grained titration dynamically challenges mental rotation (Shepard-Metzler paradigm) while 400ms motor debouncing filters involuntary tremors.
            </p>
          </div>

        </div>

      </div>

      {/* 6. PUZZLE SOLVED RECAP CARD */}
      {isPuzzleSolved && !isSessionFinished && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 shadow-md text-center space-y-4 animate-fadeIn">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto text-2xl shadow-sm">
            ✓
          </div>
          <div>
            <h3 className="text-xl font-black text-emerald-950">
              {t.completedPuzzleTitle[language]}
            </h3>
            <p className="text-xs text-emerald-800 font-medium mt-1">
              Solved in {elapsedSeconds}s with {misplacements} attempt(s) and {rotationsUsed} rotation(s).
            </p>
          </div>

          <button
            onClick={handleNextOrFinish}
            className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>{currentPuzzleIndex + 1 < totalPuzzles ? t.nextPuzzle[language] : t.viewSummary[language]}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 7. COMPREHENSIVE CLINICAL ANALYSIS MODAL */}
      {isSessionFinished && (
        <div className="p-8 rounded-3xl bg-white border-2 border-slate-300 shadow-2xl space-y-6 animate-fadeIn">
          
          <div className="text-center space-y-1.5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center mx-auto text-3xl shadow-md">
              🏆
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              Visuoconstructional Praxis Clinical Analysis
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Standardized WAIS-IV Block Design & CERAD Visuomotor Assessment
            </p>
          </div>

          {(() => {
            const summary = engine.compileSessionSummary(sessionTrials);
            return (
              <>
                {/* Comprehensive Clinical Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                  
                  {/* 1. WAIS-IV Block Design Score */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">WAIS-IV Praxis</span>
                    <p className="text-xl font-black text-slate-900 mt-0.5">
                      {summary.spatialPraxisScore} / 5
                    </p>
                    <span className="text-[11px] text-emerald-700 font-semibold">Standard Praxis</span>
                  </div>

                  {/* 2. CERAD Praxis Scale */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">CERAD Index</span>
                    <p className="text-xl font-black text-amber-700 mt-0.5">
                      {summary.estimatedCERADPraxisScore} / 14
                    </p>
                    <span className="text-[11px] text-slate-500 font-semibold">Visuomotor Score</span>
                  </div>

                  {/* 3. Latent Ability Theta */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Latent Ability θ</span>
                    <p className="text-xl font-black text-indigo-700 mt-0.5">
                      {summary.finalTheta >= 0 ? '+' : ''}{summary.finalTheta.toFixed(2)}
                    </p>
                    <span className="text-[11px] text-indigo-600 font-semibold">2PL IRT Calibration</span>
                  </div>

                  {/* 4. Patient Autonomy Rating */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Autonomy Rating</span>
                    <p className="text-xs font-black text-slate-900 mt-1 uppercase">
                      {summary.patientSettingsAutonomyRating.replace(/_/g, ' ')}
                    </p>
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      {100 - summary.ghostGuideReliancePercentage}% Ghost Independence
                    </span>
                  </div>

                  {/* 5. Right Parietal Function */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Parietal Function</span>
                    <p className="text-sm font-black text-slate-900 mt-1 capitalize">
                      {summary.parietalPraxisRating.replace(/_/g, ' ')}
                    </p>
                    <span className="text-[11px] text-slate-500 font-semibold">Coordinate Mapping</span>
                  </div>

                  {/* 6. Tremor Filtration Audit */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tremor Guard</span>
                    <p className="text-xl font-black text-emerald-700 mt-0.5">
                      {summary.tremorTapsFilteredCount} Filtered
                    </p>
                    <span className="text-[11px] text-emerald-600 font-semibold">400ms Debounce</span>
                  </div>

                  {/* 7. Visuomotor Trajectory Profile */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Motor Profile</span>
                    <p className="text-sm font-black text-slate-900 mt-1 capitalize">
                      {summary.visuomotorProfile.replace(/_/g, ' ')}
                    </p>
                    <span className="text-[11px] text-slate-500 font-semibold">Tactile Trajectory</span>
                  </div>

                  {/* 8. Orientation Scaffolding Requests */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Straighten Requests</span>
                    <p className="text-xl font-black text-indigo-700 mt-0.5">
                      {summary.totalManualStraightens}
                    </p>
                    <span className="text-[11px] text-indigo-600 font-semibold">
                      {summary.totalManualScrambles} Manual Scrambles
                    </span>
                  </div>

                </div>

                {/* Patient Autonomy & Scaffolding Strategy Analysis Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-200 text-left space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 font-black text-xs text-indigo-950 uppercase">
                      <Sliders className="w-4 h-4 text-indigo-600" />
                      <span>Patient Autonomy & Scaffolding Strategy Profile</span>
                    </div>
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300">
                      Rating: {summary.patientSettingsAutonomyRating.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">Visual Reference</span>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {summary.settingsAnalysisReport.ghostGuideIndependence}
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">Rotational Scaffolding</span>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {summary.settingsAnalysisReport.rotationalAssistanceReliance}
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">Executive Strategy</span>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {summary.settingsAnalysisReport.executiveChunkingStrategy}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Clinical Diagnostic Synthesis */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-left space-y-1">
                  <div className="flex items-center gap-2 font-black text-xs text-amber-950 uppercase">
                    <Brain className="w-4 h-4 text-amber-700" />
                    <span>AI Clinical Diagnostic Summary</span>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed">
                    Patient completed <strong>{summary.totalPuzzles} puzzles</strong> with an accuracy rate of <strong>{summary.accuracyPercentage}%</strong>.
                    Average construction solve time: <strong>{summary.meanSolveTimeSeconds}s</strong>.
                    The AI evaluated {summary.totalRotationalErrors} rotational error(s) and executed {summary.totalAIDynamicInterventions} dynamic tray reorientations.
                    Settings analysis confirmed <strong>{100 - summary.ghostGuideReliancePercentage}% unassisted ghost-free solving</strong> and <strong>{summary.totalManualStraightens} manual straightening request(s)</strong>, directly integrated into the calibrated ability level θ ({summary.finalTheta >= 0 ? '+' : ''}{summary.finalTheta.toFixed(2)}).
                  </p>
                </div>
              </>
            );
          })()}

          <button
            onClick={onExit}
            className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-md transition-all cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      )}

    </div>
  );
};
