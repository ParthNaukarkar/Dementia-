import { JigsawPraxisEngine } from '../src/games/jigsaw-puzzle/engine';
import { PUZZLE_IMAGES } from '../src/games/jigsaw-puzzle/images-catalog';
import type { PuzzleTrialTelemetry } from '../src/games/jigsaw-puzzle/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('======================================================================');
console.log('   JIGSAW PUZZLE (VISUOCONSTRUCTIONAL PRAXIS) VERIFICATION SUITE    ');
console.log('======================================================================\n');

// 1. Image Catalog Integrity
console.log('>>> [1] Validating Cultural Artworks Catalog...');
assert(PUZZLE_IMAGES.length >= 4, `Catalog contains ${PUZZLE_IMAGES.length} artworks (expected >= 4)`);
PUZZLE_IMAGES.forEach((img, i) => {
  assert(img.id.length > 0, `Artwork #${i+1} has valid ID: ${img.id}`);
  assert(img.svgArt.includes('<svg'), `Artwork #${i+1} contains valid SVG markup`);
  assert(img.titles.as.length > 0 && img.titles.en.length > 0, `Artwork #${i+1} has localized titles`);
});

// 2. Engine Baseline Initialization
console.log('\n>>> [2] Validating Baseline Engine Difficulty (theta = 0.0)...');
const engine = new JigsawPraxisEngine(0.0);
const baselineDiff = engine.getDifficulty();

assert(baselineDiff.totalPieces === 4, `Baseline piece count is 4 (2x2 grid)`);
assert(baselineDiff.gridCols === 2 && baselineDiff.gridRows === 2, `Grid is 2x2`);
assert(baselineDiff.ghostOpacity === 0.40, `Baseline ghost guide opacity is 40%`);
assert(baselineDiff.allowRotation === false, `Mental rotation is disabled at baseline (locked 0 deg)`);
assert(baselineDiff.snapMarginPx === 60, `Snap tolerance is generous at 60px`);
assert(baselineDiff.tremorDebounceMs === 400, `Tremor debouncing filter is active at 400ms`);

// 3. Clinical Floor Titration (Struggling / Dementia Support Mode)
console.log('\n>>> [3] Validating Adaptive Titration Down to Clinical Floor...');
// Force drop theta below -0.8
engine.setTheta(-1.2);
const floorDiff = engine.getDifficulty();

console.log('Floor Parameters:', floorDiff);
assert(floorDiff.totalPieces === 2, `Clinical floor piece count drops to 2 pieces (1x2 split)`);
assert(floorDiff.gridCols === 2 && floorDiff.gridRows === 1, `Grid is 2x1 (Left/Right halves)`);
assert(floorDiff.ghostOpacity === 1.0, `Ghost opacity is 100% (full-color identical match)`);
assert(floorDiff.allowRotation === false, `Rotation remains locked at 0 deg`);
assert(floorDiff.snapMarginPx === 80, `Snap margin expands to super-magnetic 80px`);
assert(floorDiff.autoAssistTimeoutMs === 25000, `Auto-assist timeout accelerates to 25s to protect dignity`);
assert(floorDiff.scaffoldingLevel === 'floor_full_assist', `Scaffolding level is 'floor_full_assist'`);

// 4. Upward Escalation to Ceiling (High Ability)
console.log('\n>>> [4] Validating Upward Titration to High Preservation Ceiling...');
engine.setTheta(1.8);
const ceilingDiff = engine.getDifficulty();

assert(ceilingDiff.totalPieces === 9, `Ceiling piece count scales to 9 pieces (3x3 grid)`);
assert(ceilingDiff.gridCols === 3 && ceilingDiff.gridRows === 3, `Grid is 3x3`);
assert(ceilingDiff.ghostOpacity === 0.0, `Ghost opacity fades to 0% (pure mental reconstruction)`);
assert(ceilingDiff.allowRotation === true, `Mental rotation enabled (90 deg increments)`);
assert(ceilingDiff.snapMarginPx === 25, `Snap margin tightens to 25px`);

// 5. Tremor Filter Test
console.log('\n>>> [5] Validating Tremor Debounce Filter (400ms)...');
const t0 = 100000;
const firstTap = engine.filterTremorTap(t0);
const duplicateTremorTap = engine.filterTremorTap(t0 + 150); // 150ms after first tap
const legitimateSecondTap = engine.filterTremorTap(t0 + 450); // 450ms after first tap

assert(firstTap === true, `First intentional tap accepted`);
assert(duplicateTremorTap === false, `Rapid 150ms tremor mis-tap suppressed`);
assert(legitimateSecondTap === true, `Second tap after 450ms accepted`);

// 6. Piece Generation & Placement Evaluation
console.log('\n>>> [6] Validating Piece Generation and Placement Logic...');
const pieces = engine.generatePieces(2, 2, false);
assert(pieces.length === 4, `Generated 4 pieces for 2x2 puzzle`);

const piece0 = pieces.find(p => p.correctCol === 0 && p.correctRow === 0)!;
assert(piece0 !== undefined, `Found piece at (0, 0)`);
const correctPlacement = engine.evaluatePlacement(piece0, 0, 0, 0);
const wrongPosPlacement = engine.evaluatePlacement(piece0, 1, 1, 0);
assert(correctPlacement === true, `Correct coordinate placement evaluates to true`);
assert(wrongPosPlacement === false, `Incorrect coordinate placement evaluates to false`);

// 7. Dignity Auto-Assist Piece Identification
console.log('\n>>> [7] Validating Dignity Auto-Assist Piece Target Selection...');
const assistPiece = engine.getNextAssistPiece(pieces);
assert(assistPiece !== null, `Auto-assist identifies an unplaced piece`);
assert(assistPiece?.correctCol === 0 && assistPiece?.correctRow === 0, `Auto-assist prioritizes corner piece (0, 0)`);

// 8. Clinical Session Summary Compilation
console.log('\n>>> [8] Validating Clinical Session Summary Compilation...');
engine.setTheta(0.4);
const dummyTrials: PuzzleTrialTelemetry[] = [
  {
    trialIndex: 1,
    puzzleImageId: 'kaziranga-rhino',
    totalPieces: 4,
    piecesPlacedCorrectly: 4,
    misplacementsCount: 0,
    timeToFirstPlacementMs: 3200,
    totalSolveTimeMs: 14500,
    rotationsUsed: 0,
    wasAutoAssisted: false,
    autoAssistedPiecesCount: 0,
    thetaAfterTrial: 0.2,
    difficultySnapshot: baselineDiff,
    placementHistory: [],
  },
  {
    trialIndex: 2,
    puzzleImageId: 'brass-xorai',
    totalPieces: 4,
    piecesPlacedCorrectly: 4,
    misplacementsCount: 1,
    timeToFirstPlacementMs: 4100,
    totalSolveTimeMs: 18200,
    rotationsUsed: 0,
    wasAutoAssisted: false,
    autoAssistedPiecesCount: 0,
    thetaAfterTrial: 0.4,
    difficultySnapshot: baselineDiff,
    placementHistory: [],
  },
];

const summary = engine.compileSessionSummary(dummyTrials);
console.log('Session Summary Payload:', {
  accuracy: `${summary.accuracyPercentage}%`,
  spatialPraxisScore: `${summary.spatialPraxisScore} / 5`,
  ceradIndex: `${summary.estimatedCERADPraxisScore} / 14`,
  visuomotorProfile: summary.visuomotorProfile,
  theta: summary.finalTheta,
});

assert(summary.gameId === 'jigsaw-puzzle', `gameId is 'jigsaw-puzzle'`);
assert(summary.totalPuzzles === 2, `Total puzzles count is 2`);
assert(summary.solvedPuzzles === 2, `Solved puzzles count is 2`);
assert(summary.accuracyPercentage === 100, `Accuracy is 100%`);
assert(summary.spatialPraxisScore >= 0 && summary.spatialPraxisScore <= 5, `WAIS-IV Block design score is within [0, 5]`);
assert(summary.estimatedCERADPraxisScore >= 0 && summary.estimatedCERADPraxisScore <= 14, `CERAD praxis score is within [0, 14]`);
assert(summary.visuomotorProfile === 'fluid', `Visuomotor profile is 'fluid'`);

console.log('\n======================================================================');
console.log('   ALL JIGSAW PRAXIS ENGINE VERIFICATION TESTS PASSED SUCCESSFULLY!   ');
console.log('======================================================================\n');
