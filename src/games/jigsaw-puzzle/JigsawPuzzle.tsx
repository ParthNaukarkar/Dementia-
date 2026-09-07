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
  Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { 
  JigsawPuzzleProps, 
  PuzzlePiece, 
  PiecePlacementEvent, 
  PuzzleTrialTelemetry, 
  JigsawDifficulty 
} from './types';
import { PUZZLE_IMAGES } from './images-catalog';
import { JigsawPraxisEngine } from './engine';
import { jigsawAudio } from './audio';

/**
 * High-precision Piece Slice Renderer.
 * Slices the full-size vector artwork so that piece (col, row) fills the slot 100% edge-to-edge
 * with zero empty borders or scaling distortion.
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
      className="w-full h-full relative overflow-hidden"
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

export const JigsawPuzzle: React.FC<JigsawPuzzleProps> = ({
  language = 'as',
  totalPuzzles = 3,
  initialTheta = 0.0,
  onTrialComplete,
  onSessionComplete,
  onExit,
}) => {
  // Initialize Engine
  const engine = useMemo(() => new JigsawPraxisEngine(initialTheta), [initialTheta]);

  // Current Puzzle State
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [difficulty, setDifficulty] = useState<JigsawDifficulty>(() => engine.getDifficulty());
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [isGhostVisible, setIsGhostVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Timers & Telemetry Tracking
  const [puzzleStartTime, setPuzzleStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [misplacements, setMisplacements] = useState(0);
  const [rotationsUsed, setRotationsUsed] = useState(0);
  const [wasAutoAssisted, setWasAutoAssisted] = useState(false);
  const [autoAssistedPiecesCount, setAutoAssistedPiecesCount] = useState(0);
  const [placementHistory, setPlacementHistory] = useState<PiecePlacementEvent[]>([]);
  const [timeToFirstPlacementMs, setTimeToFirstPlacementMs] = useState<number | null>(null);

  // Completion State
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [sessionTrials, setSessionTrials] = useState<PuzzleTrialTelemetry[]>([]);

  // Auto-Assist Idle Timer
  const autoAssistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Current Artwork
  const currentImage = PUZZLE_IMAGES[currentPuzzleIndex % PUZZLE_IMAGES.length];

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
      as: 'ঘূৰাওক (Rotate)',
      bn: 'ঘোরান (Rotate)',
      hi: 'घुमाएं (Rotate)',
      en: 'Rotate 90°',
    },
    autoAssistBtn: {
      as: 'সহায় লওক (Help Me)',
      bn: 'সহায়তা নিন (Help Me)',
      hi: 'मदद लें (Help Me)',
      en: 'Gentle Hint',
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
      hi: 'परिणाम देखें ➔',
      en: 'View Clinical Summary ➔',
    },
    exit: {
      as: 'বাহিৰ হওক',
      bn: 'প্রস্থান',
      hi: 'बाहर जाएं',
      en: 'Exit',
    },
  };

  // Reset auto-assist idle timer
  const resetAutoAssistTimer = useCallback(() => {
    if (autoAssistTimerRef.current) {
      clearTimeout(autoAssistTimerRef.current);
    }

    if (isPuzzleSolved) return;

    autoAssistTimerRef.current = setTimeout(() => {
      triggerAutoAssist();
    }, difficulty.autoAssistTimeoutMs);
  }, [difficulty.autoAssistTimeoutMs, isPuzzleSolved]);

  // Initialize new puzzle
  const initPuzzle = useCallback((_puzzleIdx: number) => {
    const diff = engine.getDifficulty();
    setDifficulty(diff);

    const generated = engine.generatePieces(diff.gridCols, diff.gridRows, diff.allowRotation);
    setPieces(generated);
    setSelectedPieceId(null);
    setIsPuzzleSolved(false);
    setMisplacements(0);
    setRotationsUsed(0);
    setWasAutoAssisted(false);
    setAutoAssistedPiecesCount(0);
    setPlacementHistory([]);
    setTimeToFirstPlacementMs(null);
    setPuzzleStartTime(Date.now());
    setElapsedSeconds(0);

    jigsawAudio.speakGuidance('intro', language);
  }, [engine, language]);

  // Load puzzle on index change
  useEffect(() => {
    initPuzzle(currentPuzzleIndex);
    return () => {
      if (autoAssistTimerRef.current) clearTimeout(autoAssistTimerRef.current);
    };
  }, [currentPuzzleIndex, initPuzzle]);

  // Elapsed timer tick
  useEffect(() => {
    if (isPuzzleSolved) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - puzzleStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [puzzleStartTime, isPuzzleSolved]);

  // Dignity Auto-Assist Trigger
  const triggerAutoAssist = () => {
    const targetPiece = engine.getNextAssistPiece(pieces);
    if (!targetPiece) return;

    setWasAutoAssisted(true);
    setAutoAssistedPiecesCount(prev => prev + 1);

    // Highlight piece and target cell
    setPieces(prev => prev.map(p => p.id === targetPiece.id ? { ...p, isHighlighted: true } : { ...p, isHighlighted: false }));
    setSelectedPieceId(targetPiece.id);

    jigsawAudio.playAutoAssistChime();
    jigsawAudio.speakGuidance('assist', language);
  };

  // Handle Piece Selection from Tray
  const handleSelectPiece = (pieceId: string) => {
    if (!engine.filterTremorTap()) return; // 400ms Tremor filter
    setSelectedPieceId(pieceId);
    resetAutoAssistTimer();
  };

  // Handle Rotation of Selected Piece (Ceiling Difficulty)
  const handleRotatePiece = (pieceId: string, e?: React.MouseEvent) => {
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
    jigsawAudio.playRotateChime();
    resetAutoAssistTimer();
  };

  // Core Placement Logic (Handles both Click-to-Place and Drag-and-Drop)
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

    const isCorrect = engine.evaluatePlacement(piece, targetCol, targetRow, piece.rotation);

    if (isCorrect) {
      // Correct placement!
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

    } else {
      // Gentle incorrect attempt
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

  // Handle Full Puzzle Completion
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
    const newTheta = engine.updateTheta(true, misplacements, wasAutoAssisted);

    const trialTelemetry: PuzzleTrialTelemetry = {
      trialIndex: currentPuzzleIndex + 1,
      puzzleImageId: currentImage.id,
      totalPieces: difficulty.totalPieces,
      piecesPlacedCorrectly: solvedPieces.filter(p => p.isLocked).length,
      misplacementsCount: misplacements,
      timeToFirstPlacementMs: timeToFirstPlacementMs || totalSolveTimeMs,
      totalSolveTimeMs,
      rotationsUsed,
      wasAutoAssisted,
      autoAssistedPiecesCount,
      thetaAfterTrial: Number(newTheta.toFixed(2)),
      difficultySnapshot: difficulty,
      placementHistory,
    };

    onTrialComplete?.(trialTelemetry);
    setSessionTrials(prev => [...prev, trialTelemetry]);
  };

  // Advance to Next Puzzle or Finish
  const handleNextOrFinish = () => {
    if (currentPuzzleIndex + 1 < totalPuzzles) {
      setCurrentPuzzleIndex(prev => prev + 1);
    } else {
      setIsSessionFinished(true);
      const summary = engine.compileSessionSummary(sessionTrials);
      onSessionComplete?.(summary);
    }
  };

  // Audio mute toggle
  const handleToggleMute = () => {
    const next = jigsawAudio.toggleMute();
    setIsMuted(next);
  };

  // Calculate cell aspect ratio (width / height)
  // Since the whole board is 1:1 square, cell width is 1/cols and cell height is 1/rows.
  // So width / height = (1/cols) / (1/rows) = rows / cols.
  const cellAspectRatio = `${difficulty.gridRows} / ${difficulty.gridCols}`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-7 max-w-5xl mx-auto space-y-6 animate-fadeIn select-none">
      
      {/* 1. TOP HEADER & ACCESSIBILITY CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs">
              <Puzzle className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.title[language]}
            </h2>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
              {difficulty.gridCols}×{difficulty.gridRows} ({difficulty.totalPieces} Pieces)
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

          {/* Ghost Guide Toggle */}
          <button
            onClick={() => setIsGhostVisible(v => !v)}
            title="Toggle Ghost Guide"
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
              isGhostVisible 
                ? 'bg-amber-50 border-amber-300 text-amber-900' 
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            {isGhostVisible ? <Eye className="w-4 h-4 text-amber-700" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{t.ghostGuide[language]}</span>
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
            onClick={triggerAutoAssist}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.autoAssistBtn[language]}</span>
          </button>

          {/* Exit Button */}
          {onExit && (
            <button
              onClick={onExit}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
            >
              {t.exit[language]}
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN PUZZLE WORKSPACE */}
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

          {/* Assembly Board Container (1:1 Aspect Ratio) */}
          <div className="relative w-full aspect-square max-w-[420px] rounded-3xl overflow-hidden border-4 border-slate-300 bg-slate-900 shadow-xl">
            
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
                      className={`relative border-2 border-dashed border-slate-400/40 flex items-center justify-center transition-all cursor-pointer overflow-hidden ${
                        !placedPiece && selectedPieceId ? 'hover:bg-amber-400/25 hover:border-amber-400' : ''
                      } ${
                        isTargetAssisted && !placedPiece 
                          ? 'ring-4 ring-amber-400 ring-inset animate-pulse bg-amber-300/30 border-amber-500' 
                          : ''
                      }`}
                    >
                      {/* Placed Locked Piece Rendering: Fills cell 100% edge-to-edge */}
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
                          {/* Locked subtle badge */}
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        /* Empty Slot Placeholder with guide coordinates */
                        <div className="text-center p-2">
                          <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/40 flex items-center justify-center mx-auto text-xs font-black text-white/80 shadow-xs">
                            {r * difficulty.gridCols + c + 1}
                          </div>
                          <span className="text-[10px] font-bold text-slate-300/80 mt-1 block">
                            Slot ({c + 1}, {r + 1})
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              ))}
            </div>

          </div>

          {/* Guidance Caption */}
          <p className="text-xs text-slate-500 font-medium text-center mt-3 max-w-sm leading-relaxed">
            {t.tapToPlace[language]}
          </p>
        </div>

        {/* RIGHT COLUMN: PIECE TRAY (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Pieces Tray ({pieces.filter(p => !p.isLocked).length} Left)
            </h3>
            {difficulty.allowRotation && selectedPieceId && (
              <button
                onClick={(e) => handleRotatePiece(selectedPieceId, e)}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{t.rotatePiece[language]}</span>
              </button>
            )}
          </div>

          {/* Unplaced Pieces Tray: Pieces now render with 100% matching slot aspect ratio */}
          <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 min-h-[280px] grid grid-cols-2 gap-4 max-h-[460px] overflow-y-auto">
            {pieces.filter(p => !p.isLocked).map(piece => {
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
                  className={`relative rounded-2xl overflow-hidden border-3 cursor-pointer transition-all duration-150 shadow-md flex items-center justify-center bg-slate-900 ${
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
                  {/* Sliced Piece Visual: Sized to match slot exactly */}
                  <PieceRenderer
                    col={piece.correctCol}
                    row={piece.correctRow}
                    cols={difficulty.gridCols}
                    rows={difficulty.gridRows}
                    svgArt={currentImage.svgArt}
                    rotation={piece.rotation}
                  />

                  {/* Selected Pill Badge */}
                  {isSelected && (
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase shadow-sm">
                      Ready to Place
                    </div>
                  )}

                  {/* Piece index hint badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-black shadow-xs">
                    Piece {piece.correctRow * difficulty.gridCols + piece.correctCol + 1}
                  </div>
                </div>
              );
            })}

            {/* When All Pieces from Tray Are Placed */}
            {pieces.filter(p => !p.isLocked).length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                <p className="text-sm font-bold text-slate-700">All pieces placed into puzzle grid!</p>
              </div>
            )}
          </div>

          {/* Neuroplastic Scaffolding Information Card */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900/90 space-y-1">
            <div className="flex items-center gap-1.5 font-black text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Adaptive Dignity Support Active</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Pieces match the puzzle grid slot dimensions with full-bleed vector precision.
              Ghost guide opacity is dynamically set to <strong>{Math.round(difficulty.ghostOpacity * 100)}%</strong>.
            </p>
          </div>

        </div>

      </div>

      {/* 3. PUZZLE COMPLETED CELEBRATION BANNER */}
      {isPuzzleSolved && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 border-2 border-emerald-300 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-scaleUp">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
              🎉
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Solved in {elapsedSeconds} Seconds
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {t.completedPuzzleTitle[language]}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {currentImage.subtitles[language]} · {misplacements} Misplacement{misplacements !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            onClick={handleNextOrFinish}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{currentPuzzleIndex + 1 < totalPuzzles ? t.nextPuzzle[language] : t.viewSummary[language]}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. SESSION FINISHED RECAP MODAL */}
      {isSessionFinished && (
        <div className="p-8 rounded-3xl bg-white border-2 border-slate-300 shadow-xl space-y-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center mx-auto text-3xl shadow-md">
            🏆
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900">
              Visuoconstructional Praxis Session Complete
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              WAIS-IV Block Design & CERAD Visuomotor Analysis
            </p>
          </div>

          {/* 3 Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Spatial Praxis Score</span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">
                {Math.max(0, Math.min(5, Math.round((engine.getTheta() + 2.5))))} / 5
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold">WAIS-IV Equivalent</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">CERAD Standard Index</span>
              <p className="text-2xl font-black text-amber-700 mt-0.5">
                {Math.max(0, Math.min(14, Math.round((engine.getTheta() + 2.5) * 2.8)))} / 14
              </p>
              <span className="text-[11px] text-slate-500 font-semibold">Constructional Praxis</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Latent Ability θ</span>
              <p className="text-2xl font-black text-indigo-700 mt-0.5">
                {engine.getTheta() >= 0 ? '+' : ''}{engine.getTheta().toFixed(2)}
              </p>
              <span className="text-[11px] text-indigo-600 font-semibold">2PL IRT Calibration</span>
            </div>
          </div>

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
