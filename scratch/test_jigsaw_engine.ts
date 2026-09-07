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
assert(PUZZLE_IMAGES.length >= 8, `Catalog contains ${PUZZLE_IMAGES.length} artworks (expected >= 8)`);
PUZZLE_IMAGES.forEach((img, i) => {
  assert(img.id.length > 0, `Artwork #${i+1} has valid ID: ${img.id}`);
  assert(img.svgArt.includes('<svg'), `Artwork #${i+1} contains valid SVG markup`);
  assert(img.titles.as.length > 0 && img.titles.en.length > 0, `Artwork #${i+1} has localized titles`);
});

// 2. Engine Baseline Initialization
console.log('\n>>> [2] Validating Baseline Engine Difficulty (theta = 0.0)...');
const engine = new JigsawPraxisEngine(0.0);
const baselineDiff = engine.getDifficulty();

assert(baselineDiff.totalPieces === 8, `Baseline piece count at theta 0.0 is 8 (4x2 grid, Tier 4)`);
assert(baselineDiff.gridCols === 4 && baselineDiff.gridRows === 2, `Grid is 4x2`);
assert(baselineDiff.ghostOpacity === 0.50, `Baseline ghost guide opacity is 50%`);
assert(baselineDiff.allowRotation === false, `Mental rotation is disabled at baseline (locked 0 deg)`);
assert(baselineDiff.snapMarginPx === 55, `Snap tolerance is generous at 55px`);
assert(baselineDiff.tremorDebounceMs === 400, `Tremor debouncing filter is active at 400ms`);

// 3. Clinical Floor Titration (Struggling / Dementia Support Mode)
console.log('\n>>> [3] Validating Adaptive Titration Down to Clinical Floor...');
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

// 4. Fine-Grained Minimal Step Tiers (2 -> 4 -> 6 -> 8 -> 9 -> 12 -> 16 -> 20 -> 24 -> 25 -> 30 -> 32 -> 36)
console.log('\n>>> [4] Validating Fine-Grained Minimal Step Tiers & Direct Piece Counts...');
const expectedPieceCounts = [2, 4, 6, 8, 9, 12, 16, 20, 24, 25, 30, 32, 36];
expectedPieceCounts.forEach(count => {
  const diff = engine.getDifficultyForPieceCount(count);
  assert(diff.totalPieces === count, `Direct lookup for ${count} pieces succeeds (tierLevel ${diff.tierLevel})`);
  assert(diff.gridCols * diff.gridRows === count, `Grid dimensions ${diff.gridCols}x${diff.gridRows} equal ${count}`);
});

// 5. Upward Escalation to Ceiling (32 & 36 Pieces)
console.log('\n>>> [5] Validating Upward Titration to High Preservation Ceiling...');
engine.setTheta(2.7);
const diff32 = engine.getDifficulty();
assert(diff32.totalPieces === 32, `Theta 2.7 yields 32 pieces (8x4 grid, Tier 12)`);
assert(diff32.allowRotation === true, `Rotation enabled for 32 pieces`);

engine.setTheta(2.95);
const ceilingDiff = engine.getDifficulty();
assert(ceilingDiff.totalPieces === 36, `Ceiling piece count scales to 36 pieces (6x6 grid, Tier 13)`);
assert(ceilingDiff.ghostOpacity === 0.0, `Ghost opacity fades to 0% (pure mental reconstruction)`);
assert(ceilingDiff.snapMarginPx === 15, `Snap margin tightens to 15px`);
assert(ceilingDiff.trayOrientationPerturbation === 'full_90_180_270', `Dynamic tray perturbation active`);

// 6. Tremor Filter Test
console.log('\n>>> [6] Validating Tremor Debounce Filter (400ms)...');
const t0 = 100000;
const firstTap = engine.filterTremorTap(t0);
const duplicateTremorTap = engine.filterTremorTap(t0 + 150); // 150ms after first tap
const legitimateSecondTap = engine.filterTremorTap(t0 + 450); // 450ms after first tap

assert(firstTap === true, `First intentional tap accepted`);
assert(duplicateTremorTap === false, `Rapid 150ms tremor mis-tap suppressed`);
assert(legitimateSecondTap === true, `Second tap after 450ms accepted`);

// 7. Piece Generation & Placement Evaluation (With Rotation Checks)
console.log('\n>>> [7] Validating Piece Generation and Placement Logic (Including Angular Errors)...');
const pieces = engine.generatePieces(4, 4, true, [0, 90, 180, 270]);
assert(pieces.length === 16, `Generated 16 pieces for 4x4 puzzle`);

const testPiece = pieces[0];
// Correct pos, correct rot (0)
const perfectPlacement = engine.evaluatePlacement(testPiece, testPiece.correctCol, testPiece.correctRow, 0);
assert(perfectPlacement.isCorrect === true, `Placement at correct pos with 0 deg is correct`);
assert(perfectPlacement.wasCorrectPositionWrongAngle === false, `Not wrong angle`);

// Correct pos, wrong rot (90 deg)
const rotatedPlacement = engine.evaluatePlacement(testPiece, testPiece.correctCol, testPiece.correctRow, 90);
assert(rotatedPlacement.isCorrect === false, `Placement at correct pos with 90 deg fails`);
assert(rotatedPlacement.wasCorrectPositionWrongAngle === true, `Identified as correct position with wrong angle!`);

// Wrong pos
const wrongPosPlacement = engine.evaluatePlacement(testPiece, (testPiece.correctCol + 1) % 4, testPiece.correctRow, 0);
assert(wrongPosPlacement.isCorrect === false, `Incorrect coordinates evaluate to false`);
assert(wrongPosPlacement.wasCorrectPositionWrongAngle === false, `Not wrong angle (was wrong pos)`);

// 8. Dynamic Live AI In-Game Analysis & Tray Manipulation
console.log('\n>>> [8] Validating Real-time AI Dynamic Tray Orientation & Scaffolding...');
// Unscrambling / auto-straighten on hesitation
const scrambledPieces = engine.generatePieces(2, 2, false);
scrambledPieces[0].rotation = 90;
scrambledPieces[1].rotation = 180;

const hesitationIntervention = engine.analyzeLiveIntervention({
  consecutiveFastSolves: 0,
  rotationalErrorsCount: 1,
  idleTimeSeconds: 14,
  allowRotation: true,
  currentPieces: scrambledPieces,
});

assert(hesitationIntervention.action === 'straighten_tray', `AI intervenes to straighten tray on hesitation/errors`);
const { modifiedPieces: straightened, changedCount } = engine.straightenTrayPieces(scrambledPieces);
assert(changedCount === 2, `Straightened 2 rotated pieces`);
assert(straightened.every(p => p.rotation === 0), `All pieces in tray are now 0 deg upright`);

// Perturb tray on rapid solve flow
const uprightPieces = engine.generatePieces(4, 4, false);
const flowIntervention = engine.analyzeLiveIntervention({
  consecutiveFastSolves: 3,
  rotationalErrorsCount: 0,
  idleTimeSeconds: 2,
  allowRotation: true,
  currentPieces: uprightPieces,
});

assert(flowIntervention.action === 'perturb_tray', `AI intervenes to perturb tray on rapid flow`);
const { modifiedPieces: perturbed } = engine.perturbTrayPieces(uprightPieces, [90, 180, 270]);
assert(perturbed.some(p => p.rotation !== 0), `Tray pieces successfully perturbed to non-zero rotations`);

// 9. Settings Analysis in Bayesian DDA & Autonomy Evaluation
console.log('\n>>> [9] Validating Patient Settings Analysis in Bayesian DDA & Scaffolding Autonomy...');

// 9A: Ghost Guide OFF IRT Bonus
const engineGhostOn = new JigsawPraxisEngine(0.5);
const engineGhostOff = new JigsawPraxisEngine(0.5);

const resGhostOn = engineGhostOn.updateTheta(true, 0, false, {
  ghostGuideVisible: true,
  audioMuted: false,
  manualStraightenCount: 0,
  manualScrambleCount: 0,
  manualPieceRotationsCount: 0,
  trayFilterUsed: 'all',
  proactiveHelpRequested: false,
  isManualTierOverride: false,
});

const resGhostOff = engineGhostOff.updateTheta(true, 0, false, {
  ghostGuideVisible: false, // Unassisted visual synthesis!
  audioMuted: false,
  manualStraightenCount: 0,
  manualScrambleCount: 0,
  manualPieceRotationsCount: 0,
  trayFilterUsed: 'all',
  proactiveHelpRequested: false,
  isManualTierOverride: false,
});

console.log(`Ghost ON delta theta: +${(resGhostOn.newTheta - 0.5).toFixed(3)}, Autonomy: ${resGhostOn.autonomyScore}%`);
console.log(`Ghost OFF delta theta: +${(resGhostOff.newTheta - 0.5).toFixed(3)}, Autonomy: ${resGhostOff.autonomyScore}%`);

assert(resGhostOff.newTheta > resGhostOn.newTheta, `Ghost Guide OFF grants a significantly higher theta delta than Ghost ON (+${(resGhostOff.newTheta - resGhostOn.newTheta).toFixed(3)} bonus)`);
assert(resGhostOff.autonomyScore > resGhostOn.autonomyScore, `Ghost Guide OFF yields higher autonomy score (${resGhostOff.autonomyScore}% vs ${resGhostOn.autonomyScore}%)`);
assert(resGhostOff.settingsImpactRationale.en.includes('Ghost Guide OFF'), `Settings impact rationale mentions Ghost Guide OFF`);

// 9B: Manual "Straighten All" Request Suppresses Rotational Perturbation
const engineDisoriented = new JigsawPraxisEngine(1.2); // Tier 7 (normally has allowRotation: true)
assert(engineDisoriented.getDifficulty().allowRotation === true, `Tier 7 baseline allows rotation`);

const resStraighten = engineDisoriented.updateTheta(true, 0, false, {
  ghostGuideVisible: true,
  audioMuted: false,
  manualStraightenCount: 2, // Patient repeatedly asked to straighten tray
  manualScrambleCount: 0,
  manualPieceRotationsCount: 1,
  trayFilterUsed: 'all',
  proactiveHelpRequested: false,
  isManualTierOverride: false,
});

assert(engineDisoriented.getPatientPrefersUpright() === true, `AI flagged patient preference for upright orientation`);
assert(engineDisoriented.getDifficulty().allowRotation === false, `AI locked rotation to 0 deg upright to respect patient preference`);
assert(engineDisoriented.getDifficulty().rotationModes.length === 1 && engineDisoriented.getDifficulty().rotationModes[0] === 0, `Rotation modes locked to [0]`);
assert(resStraighten.settingsImpactRationale.en.includes('Straighten All requested'), `Rationale reflects straighten request`);

// 9C: Manual Scramble Challenge Resets Upright Lock
engineDisoriented.updateTheta(true, 0, false, {
  ghostGuideVisible: true,
  audioMuted: false,
  manualStraightenCount: 0,
  manualScrambleCount: 1, // Patient proactively clicked Scramble
  manualPieceRotationsCount: 2,
  trayFilterUsed: 'all',
  proactiveHelpRequested: false,
  isManualTierOverride: false,
});

assert(engineDisoriented.getPatientPrefersUpright() === false, `Patient upright preference reset after voluntary scramble`);
assert(engineDisoriented.getDifficulty().allowRotation === true, `AI re-enabled rotation challenge`);

// 10. Clinical Session Summary Compilation
console.log('\n>>> [10] Validating Comprehensive Clinical Session Summary Payload...');
engine.setTheta(1.4);
const dummyTrials: PuzzleTrialTelemetry[] = [
  {
    trialIndex: 1,
    puzzleImageId: 'kaziranga-rhino',
    totalPieces: 16,
    piecesPlacedCorrectly: 16,
    misplacementsCount: 1,
    rotationalErrorsCount: 1,
    parietalSynthesisIndex: 85,
    timeToFirstPlacementMs: 2800,
    totalSolveTimeMs: 24000,
    rotationsUsed: 3,
    wasAutoAssisted: false,
    autoAssistedPiecesCount: 0,
    thetaAfterTrial: 1.4,
    difficultySnapshot: engine.getDifficultyForPieceCount(16),
    aiAdaptiveReasoning: { as: 'টেস্ট', bn: 'টেস্ট', hi: 'टेस्ट', en: 'Test' },
    settingsSnapshot: {
      ghostGuideVisible: false,
      audioMuted: false,
      manualStraightenCount: 0,
      manualScrambleCount: 1,
      manualPieceRotationsCount: 3,
      trayFilterUsed: 'corners',
      proactiveHelpRequested: false,
      isManualTierOverride: false,
    },
    settingsImpactRationale: { as: 'টেস্ট', bn: 'টেস্ট', hi: 'टेस्ट', en: 'Unassisted test' },
    autonomyScore: 90,
    aiDynamicActions: [
      {
        type: 'perturb_tray',
        timestamp: Date.now(),
        rationale: { as: '', bn: '', hi: '', en: 'Parietal rotation challenge' },
        piecesAffected: 4,
      }
    ],
    placementHistory: [],
  },
];

const summary = engine.compileSessionSummary(dummyTrials);
console.log('Session Summary Payload:', {
  accuracy: `${summary.accuracyPercentage}%`,
  spatialPraxisScore: `${summary.spatialPraxisScore} / 5`,
  ceradIndex: `${summary.estimatedCERADPraxisScore} / 14`,
  visuomotorProfile: summary.visuomotorProfile,
  totalRotationalErrors: summary.totalRotationalErrors,
  meanParietalSynthesisIndex: `${summary.meanParietalSynthesisIndex}%`,
  totalAIDynamicInterventions: summary.totalAIDynamicInterventions,
  ghostGuideReliance: `${summary.ghostGuideReliancePercentage}%`,
  autonomyRating: summary.patientSettingsAutonomyRating,
  report: summary.settingsAnalysisReport,
});

assert(summary.gameId === 'jigsaw-puzzle', `gameId is 'jigsaw-puzzle'`);
assert(summary.totalPuzzles === 1, `Total puzzles count is 1`);
assert(summary.solvedPuzzles === 1, `Solved puzzles count is 1`);
assert(summary.totalRotationalErrors === 1, `Total rotational errors recorded accurately`);
assert(summary.meanParietalSynthesisIndex === 85, `Mean parietal synthesis index recorded accurately`);
assert(summary.totalAIDynamicInterventions === 1, `AI dynamic interventions count recorded accurately`);
assert(summary.ghostGuideReliancePercentage === 0, `Ghost reliance is 0% since trial had ghost OFF`);
assert(summary.patientSettingsAutonomyRating === 'autonomous_mastery', `Autonomy rating is 'autonomous_mastery'`);
assert(summary.settingsAnalysisReport.ghostGuideIndependence.includes('turned OFF'), `Report includes ghost independence`);
assert(summary.settingsAnalysisReport.rotationalAssistanceReliance.includes('Scramble Angles'), `Report includes scramble note`);
assert(summary.settingsAnalysisReport.executiveChunkingStrategy.includes('corners/edges'), `Report includes executive chunking`);

console.log('\n======================================================================');
console.log('   ALL JIGSAW PRAXIS ENGINE VERIFICATION TESTS PASSED SUCCESSFULLY!   ');
console.log('======================================================================\n');
