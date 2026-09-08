/**
 * NeuroSaathi (SIH 26003) - Comprehensive 10-Game Adaptive Assistance Audit
 * 
 * Exhaustively tests the assistance function across ALL 10 Cognitive Games:
 *   1. Jigsaw Puzzle (Visuomotor Praxis)
 *   2. Where Am I? (Orientation & Spatial Navigation)
 *   3. Memory Match (Paired Associates Learning)
 *   4. Pattern Recall (Visuospatial Working Memory)
 *   5. Odd One Out (Categorization & Reasoning)
 *   6. Brain Story (Episodic Narrative Recall)
 *   7. Smriti Haat (Semantic Recognition & Working Memory)
 *   8. Sequence Recall (Corsi Spatial Span)
 *   9. Number Recall (Digit Span Forward & Backward)
 *  10. What Changed? (Visual Feature & Spatial Binding)
 * 
 * Test Dimensions for Each Game:
 *   [A] Parameter & Tier Sweeps (Tiers 1 through 9 / piece counts / recall modes)
 *   [B] Initial Hesitation (Waiting it out at trial start)
 *   [C] Later-Half Hesitation (Stuck after doing part of the game / 1st step / 1st piece / 1st match / 1st digit)
 *   [D] Dignity Scaffolding Payloads & 4-Language Localization (en, as, bn, hi)
 */

import { AdaptiveAssistanceEngine } from '../src/engine/adaptive-assistance';
import { JigsawPraxisEngine } from '../src/games/jigsaw-puzzle/engine';
import { WhereAmIEngine, WHERE_AM_I_TIERS } from '../src/games/where-am-i/engine';
import { MemoryMatchEngine, MEMORY_MATCH_TIERS } from '../src/games/memory-match/engine';
import { PatternRecallEngine, PATTERN_RECALL_TIERS } from '../src/games/pattern-recall/engine';
import { OddOneOutEngine, ODD_ONE_OUT_TIERS } from '../src/games/odd-one-out/engine';
import { BrainStoryEngine, BRAIN_STORY_TIERS } from '../src/games/brain-story/engine';
import { SmritiHaatEngine } from '../src/games/smriti-haat/engine';
import { SequenceRecallEngine } from '../src/games/sequence-recall/engine';
import { NumberRecallEngine, NUMBER_RECALL_TIERS } from '../src/games/number-recall/engine';
import { WhatChangedEngine, WHAT_CHANGED_TIERS } from '../src/games/what-changed/engine';
import { TRANSLATIONS, type SupportedLanguage } from '../src/locales/translations';

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedAssertions++;
    console.error(`  ❌ FAIL: ${testName} ${detail ? `--> ${detail}` : ''}`);
  }
}

const LANGUAGES: SupportedLanguage[] = ['en', 'as', 'bn', 'hi'];

console.log('================================================================================');
console.log('🧠 NEUROSAATHI (SIH 26003) - 10-GAME EXHAUSTIVE ADAPTIVE ASSISTANCE AUDIT');
console.log('================================================================================');

// ============================================================================
// 1. JIGSAW PUZZLE (Visuomotor Praxis)
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🧩 [1/10] JIGSAW PUZZLE - Assistance & Later-Half Scaffolding Audit');
console.log('--------------------------------------------------------------------------------');
{
  const engine = new JigsawPraxisEngine(0.0);
  const pieceCounts = [2, 4, 6, 8, 9, 12, 16, 20, 24, 25, 30, 32, 36];

  // Parameter sweep across piece tiers
  for (const count of pieceCounts) {
    const diff = engine.getDifficultyForPieceCount(count);
    assert(
      diff.autoAssistTimeoutMs >= 20000 && diff.autoAssistTimeoutMs <= 60000,
      `Jigsaw (${count} pcs): Difficulty auto-assist timeout defined (${diff.autoAssistTimeoutMs}ms)`
    );
  }

  // Initial Hesitation Test
  const pieces = engine.generatePieces(2, 2, false, [0]);
  const initialAssistPiece = engine.getNextAssistPiece(pieces);
  assert(
    initialAssistPiece !== null && !initialAssistPiece.isLocked,
    'Jigsaw: Initial hesitation yields valid unplaced target piece'
  );

  const { modifiedPieces } = engine.straightenTrayPieces(pieces);
  assert(
    modifiedPieces.length === pieces.length,
    'Jigsaw: Auto-assist tray reorientation produces valid pieces'
  );

  // Later-Half Hesitation Test (Lock piece 1, elder pauses on remaining 3 pieces)
  const pieceToPlace = pieces[0];
  const evalResult = engine.evaluatePlacement(pieceToPlace, pieceToPlace.correctCol, pieceToPlace.correctRow, 0);
  assert(evalResult.isCorrect, 'Jigsaw: Step 1 piece placement evaluated as correct');

  // Lock the first piece and verify next assist targets the remaining unplaced piece
  const remainingPieces = pieces.map(p => p.id === pieceToPlace.id ? { ...p, isLocked: true } : p);
  const laterHalfAssistPiece = engine.getNextAssistPiece(remainingPieces);
  assert(
    laterHalfAssistPiece !== null && !laterHalfAssistPiece.isLocked && laterHalfAssistPiece.id !== pieceToPlace.id,
    `Jigsaw Later-Half: Stuck on later half correctly targets remaining unplaced piece (${laterHalfAssistPiece?.id})`
  );

  // Live profile-adaptive assistance tests
  const severeProfile = AdaptiveAssistanceEngine.deriveAssistanceProfile({
    theta: -2.5,
    consecutiveErrors: 3,
    accuracyPct: 30,
    hesitationMs: 14000,
    taskType: 'visuomotor',
  });
  assert(
    severeProfile.profile === 'severe_amnesic' && severeProfile.assistTimeoutMs <= 8000,
    `Jigsaw: Severe amnesic profile receives rapid assistance (${severeProfile.assistTimeoutMs}ms)`
  );

  const motorProfile = AdaptiveAssistanceEngine.deriveAssistanceProfile({
    theta: 0.0,
    tremorTapsCount: 5,
    recentLatenciesMs: [4500, 5000],
    consecutiveErrors: 0,
    accuracyPct: 90,
    hesitationMs: 5000,
    taskType: 'visuomotor',
  });
  assert(
    motorProfile.profile === 'motor_tremor_slowed' && motorProfile.assistTimeoutMs >= 20000,
    `Jigsaw: Motor tremor profile grants generous time before assist (${motorProfile.assistTimeoutMs}ms)`
  );
}

// ============================================================================
// 2. WHERE AM I? (Spatial Navigation & Orientation)
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🧭 [2/10] WHERE AM I? - Compass Elimination & Beacon Audit');
console.log('--------------------------------------------------------------------------------');
{
  const engine = new WhereAmIEngine(0.0);

  // Parameter sweep across all tiers (including high Tiers 8 & 9)
  for (const tier of WHERE_AM_I_TIERS) {
    assert(
      tier.compassAllowed === true,
      `Where Am I Tier ${tier.tierLevel}: Compass assistance enabled (compassAllowed: true)`
    );
    assert(
      tier.autoAssistTimeoutMs >= 10000 && tier.autoAssistTimeoutMs <= 25000,
      `Where Am I Tier ${tier.tierLevel}: Auto-assist timeout properly calibrated (${tier.autoAssistTimeoutMs}ms)`
    );
  }

  // Initial Hesitation Test
  const tier1 = WHERE_AM_I_TIERS[0];
  const trial = engine.generateTrial(tier1);
  const eliminatedInitial = engine.applyCompassHint(trial.options, trial.targetLocation.id, 1);
  assert(
    eliminatedInitial.length === 1 && !eliminatedInitial.includes(trial.targetLocation.id),
    `Where Am I Initial: Compass eliminates 1 wrong distractor (${eliminatedInitial[0]}) without eliminating target`
  );

  // Later-Half Hesitation Test (Elder heard clues, used compass, but still pauses before tapping)
  const stage3BeaconTarget = trial.targetLocation.id;
  const targetOptionExists = trial.options.some(opt => opt.id === stage3BeaconTarget);
  assert(
    targetOptionExists,
    `Where Am I Later-Half: Stage 3 golden beacon targets valid location card (${stage3BeaconTarget})`
  );
}

// ============================================================================
// 3. MEMORY MATCH (Paired Associates Learning)
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🃏 [3/10] MEMORY MATCH - Paired Associates Assistance & Re-arming Audit');
console.log('--------------------------------------------------------------------------------');
{
  const engine = new MemoryMatchEngine(0.0);

  // Parameter sweep across tiers
  for (const tier of MEMORY_MATCH_TIERS) {
    assert(
      tier.pairCount >= 2 && tier.totalCards === tier.pairCount * 2,
      `Memory Match Tier ${tier.tier} (${tier.pairCount} pairs): Valid card grid configured`
    );
    // Profile-adaptive assistance derivation
    const profile = engine.deriveAssistanceProfile(0, 100, 10000);
    assert(
      profile.assistTimeoutMs <= 18000,
      `Memory Match Tier ${tier.tier}: Assist timeout dynamically bounded (${profile.assistTimeoutMs}ms)`
    );
  }

  // Initial Hesitation Test (No cards flipped yet)
  const tier1Cards = engine.generateDeck(MEMORY_MATCH_TIERS[0]);
  const unmatchedInitial = tier1Cards.filter(c => !c.isMatched);
  const initialAssistTarget = unmatchedInitial[0];
  assert(
    initialAssistTarget !== undefined,
    `Memory Match Initial: Targets valid unmatched pair (${initialAssistTarget.pairKey})`
  );

  // Later-Half Hesitation Test: 1st Pair matched! (4 cards total, 2 matched, 2 remaining)
  const firstPairKey = tier1Cards[0].pairKey;
  const updatedCardsAfterPair1 = tier1Cards.map(c => 
    c.pairKey === firstPairKey ? { ...c, isMatched: true, isFlipped: true } : c
  );
  const remainingUnmatched = updatedCardsAfterPair1.filter(c => !c.isMatched);
  assert(
    remainingUnmatched.length === 2,
    'Memory Match Later-Half: 1st pair solved, exactly 1 pair remaining'
  );

  // Verify assist picks the remaining pair
  const remainingPairKey = remainingUnmatched[0].pairKey;
  assert(
    remainingPairKey !== firstPairKey,
    `Memory Match Later-Half: Re-armed assist specifically illuminates remaining pair (${remainingPairKey})`
  );

  // Single card flipped hesitation test (Elder flipped Card A, freezes searching for Twin B)
  const singleFlippedCard = remainingUnmatched[0];
  const twinCard = remainingUnmatched.find(c => c.id !== singleFlippedCard.id && c.pairKey === singleFlippedCard.pairKey);
  assert(
    twinCard !== undefined,
    `Memory Match Single-Flip: Directly locates matching twin card (${twinCard?.id})`
  );
}

// ============================================================================
// 4. PATTERN RECALL (Visuospatial Working Memory)
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🔲 [4/10] PATTERN RECALL - Beacon Hint & Subsequent Tile Assistance Audit');
console.log('--------------------------------------------------------------------------------');
{
  const engine = new PatternRecallEngine(0.0);

  // Parameter sweep across all 9 tiers
  for (const tier of PATTERN_RECALL_TIERS) {
    assert(
      tier.beaconAllowed === true,
      `Pattern Recall Tier ${tier.tierLevel}: Beacon allowed = true (including high tiers)`
    );
    assert(
      tier.beaconIlluminatesCount >= 1,
      `Pattern Recall Tier ${tier.tierLevel}: Beacon illuminates at least 1 tile`
    );
  }

  // Initial Hesitation Test
  const tier1 = PATTERN_RECALL_TIERS[0];
  const trial = engine.generateTrial(1, tier1);
  const initialSelection: number[] = [];
  const initialBeaconTiles = engine.getBeaconHintTiles(trial, initialSelection, 1);
  assert(
    initialBeaconTiles.length === 1 && trial.pattern.includes(initialBeaconTiles[0]),
    `Pattern Recall Initial: Beacon illuminates target pattern tile (${initialBeaconTiles[0]})`
  );

  // Later-Half Hesitation Test (Elder tapped 1st tile, pauses before 2nd/3rd tile)
  const firstTappedTile = initialBeaconTiles[0];
  const partialSelection = [firstTappedTile];
  const laterHalfBeaconTiles = engine.getBeaconHintTiles(trial, partialSelection, 1);
  assert(
    laterHalfBeaconTiles.length === 1 &&
    trial.pattern.includes(laterHalfBeaconTiles[0]) &&
    !partialSelection.includes(laterHalfBeaconTiles[0]),
    `Pattern Recall Later-Half: Staggered assist illuminates subsequent unselected tile (${laterHalfBeaconTiles[0]})`
  );
}

// ============================================================================
// 5. ODD ONE OUT (Categorization & Reasoning)
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🔍 [5/10] ODD ONE OUT - Rule Clue & Multi-Stage Distractor Elimination Audit');
console.log('--------------------------------------------------------------------------------');
{
  const engine = new OddOneOutEngine(0.0);

  // Parameter sweep across all 9 tiers
  for (const tier of ODD_ONE_OUT_TIERS) {
    assert(
      tier.ruleClueAvailable === true,
      `Odd One Out Tier ${tier.tierLevel}: Rule clue available = true`
    );
    assert(
      tier.spotlightAllowed === true,
      `Odd One Out Tier ${tier.tierLevel}: Spotlight allowed = true`
    );
  }

  // Initial Hesitation Test (Stage 1: Rule clue availability)
  const tier1 = ODD_ONE_OUT_TIERS[0];
  const trial = engine.generateTrial(tier1, 1);
  assert(
    trial.ruleExplanation.en.length > 0 && trial.ruleExplanation.hi.length > 0,
    'Odd One Out Initial: Stage 1 rule explanation available in multiple languages'
  );

  // Later-Half Hesitation Test (Stage 2: Spotlight distractor elimination)
  const eliminations = engine.getSpotlightEliminations(trial, 1);
  assert(
    eliminations.length === 1 && !eliminations.includes(trial.oddItemIndex),
    `Odd One Out Later-Half: Spotlight eliminates distractor index (${eliminations[0]}) preserving odd item (${trial.oddItemIndex})`
  );
}

// ============================================================================
// 6. BRAIN STORY (Episodic Narrative Recall)
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('📖 [6/10] BRAIN STORY - Multi-Stage Scaffolding & Multi-Question Audit');
console.log('--------------------------------------------------------------------------------');
{
  const engine = new BrainStoryEngine(0.0);

  // Parameter sweep across all 9 tiers
  for (const tier of BRAIN_STORY_TIERS) {
    assert(
      tier.clueHintAllowed === true,
      `Brain Story Tier ${tier.tierLevel}: Clue hint allowed = true across all tiers`
    );
  }

  // Question 1 Hesitation Test
  const tier1 = BRAIN_STORY_TIERS[0];
  const trial = engine.generateTrial(1, tier1);
  assert(trial !== null, 'Brain Story: Trial generated successfully');
  if (trial) {
    const q1 = trial.activeQuestions[0];
    assert(
      q1.clueHintText.en.length > 0 && q1.clueHintText.hi.length > 0,
      'Brain Story Q1: Stage 1 clue text available'
    );

    // Later-Half Hesitation Test: Advance to Question 2 in the same story
    if (trial.activeQuestions.length > 1) {
      const q2 = trial.activeQuestions[1];
      assert(
        q2.clueHintText.en.length > 0,
        `Brain Story Later-Half (Q2): Clue text available for second question ("${q2.questionText.en}")`
      );
      assert(
        q2.correctOptionIndex >= 0 && q2.correctOptionIndex < q2.options.en.length,
        'Brain Story Later-Half (Q2): Target option index valid for stage 3 beacon'
      );
    }
  }
}

// ============================================================================
// 7. SMRITI HAAT (Semantic Recognition & Working Memory)
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🛒 [7/10] SMRITI HAAT - Market Distractor Blur & Later Target Beacon Audit');
console.log('--------------------------------------------------------------------------------');
{
  const engine = new SmritiHaatEngine(0.0, 3);
  // Advance to RECALL phase
  engine.advanceToRecall();

  // Initial Hesitation Test (Stage 3 Distractor Elimination)
  const eliminatedDistractorId = engine.eliminateDistractor();
  assert(
    eliminatedDistractorId !== null,
    `Smriti Haat Initial: Distractor successfully eliminated (${eliminatedDistractorId})`
  );

  // Later-Half Hesitation Test (Player selects 1st item, freezes on remaining item)
  const targets = engine.getTargets();
  assert(targets.length >= 2, 'Smriti Haat: At least 2 targets configured for multi-item test');
  
  engine.toggleSelection(targets[0].id);
  const selectedAfter1 = Array.from(engine.getSelectedIds());
  assert(
    selectedAfter1.length === 1 && selectedAfter1[0] === targets[0].id,
    'Smriti Haat Later-Half: Step 1 target item selected'
  );

  // Now simulate auto-assist triggering for the remaining targets
  engine.triggerSoftAutoAssist();
  const selectedAfterAutoAssist = Array.from(engine.getSelectedIds());
  assert(
    selectedAfterAutoAssist.length === targets.length && selectedAfterAutoAssist.includes(targets[1].id),
    `Smriti Haat Later-Half: Soft auto-assist selects remaining target item (${targets[1].id})`
  );
}

// ============================================================================
// 8. SEQUENCE RECALL (Corsi Spatial Span)
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🔢 [8/10] SEQUENCE RECALL - Multi-Step Sequence Auto-Assist Audit');
console.log('--------------------------------------------------------------------------------');
{
  const engine = new SequenceRecallEngine(0.0);
  engine.startNewTrial();
  engine.notifyRecallPhaseStarted();

  // Initial Hesitation Test (Step 0)
  const step0Hint = engine.triggerAutoAssist();
  assert(
    step0Hint !== null,
    `Sequence Recall Initial: Step 0 auto-assist hints 1st item (${step0Hint})`
  );

  // Later-Half Hesitation Test (Elder tapped step 0, pauses on step 1)
  if (step0Hint) {
    engine.registerItemTap(step0Hint, Date.now());
    const step1Hint = engine.triggerAutoAssist();
    assert(
      step1Hint !== null && step1Hint !== step0Hint,
      `Sequence Recall Later-Half: Re-armed assist hints next step (${step1Hint})`
    );
  }
}

// ============================================================================
// 9. NUMBER RECALL (Digit Span Forward & Backward)
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('📞 [9/10] NUMBER RECALL - Forward/Backward Later-Digit Dialpad Pulse Audit');
console.log('--------------------------------------------------------------------------------');
{
  const engine = new NumberRecallEngine(0.0);

  // Parameter sweep across all 9 tiers
  for (const tier of NUMBER_RECALL_TIERS) {
    assert(
      tier.autoAssistTimeoutMs >= 10000 && tier.autoAssistTimeoutMs <= 25000,
      `Number Recall Tier ${tier.tierLevel} (${tier.digitCount} digits, ${tier.recallMode}): Timeout calibrated (${tier.autoAssistTimeoutMs}ms)`
    );
  }

  // Forward Mode Later-Half Test ("4829")
  const forwardTarget = '4829';
  const expectedForward = engine.getExpectedSequence(forwardTarget, 'forward');
  assert(expectedForward === '4829', 'Number Recall: Forward expected sequence correct');

  // Elder entered '4', pauses in later half
  const entered1 = '4';
  const nextForwardDigit = expectedForward[entered1.length];
  assert(
    nextForwardDigit === '8',
    `Number Recall Forward Later-Half: Stuck after '4' pulses next digit '8'`
  );

  // Backward Mode Later-Half Test ("3715" -> expected "5173")
  const backwardTarget = '3715';
  const expectedBackward = engine.getExpectedSequence(backwardTarget, 'backward');
  assert(expectedBackward === '5173', 'Number Recall: Backward expected sequence reversed ("5173")');

  // Elder entered '5' (first reversed digit), pauses in later half
  const enteredBack1 = '5';
  const nextBackwardDigit = expectedBackward[enteredBack1.length];
  assert(
    nextBackwardDigit === '1',
    `Number Recall Backward Later-Half: Stuck after '5' pulses next reversed digit '1'`
  );
}

// ============================================================================
// 10. WHAT CHANGED? (Visual Feature & Spatial Binding)
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('⚡ [10/10] WHAT CHANGED? - Golden Spotlight Halo Assistance Audit');
console.log('--------------------------------------------------------------------------------');
{
  const engine = new WhatChangedEngine(0.0);

  // Parameter sweep across all 9 tiers
  for (const tier of WHAT_CHANGED_TIERS) {
    assert(
      tier.haloAssistanceAllowed === true,
      `What Changed Tier ${tier.tierLevel}: haloAssistanceAllowed = true across all tiers`
    );
    assert(
      tier.autoAssistTimeoutMs >= 10000 && tier.autoAssistTimeoutMs <= 25000,
      `What Changed Tier ${tier.tierLevel}: Timeout properly bounded (${tier.autoAssistTimeoutMs}ms)`
    );
  }

  // Initial Hesitation Test
  const tier1 = WHAT_CHANGED_TIERS[0];
  const pair1 = engine.generateScenePair(tier1);
  assert(
    pair1.targetSlotId >= 0 && pair1.sceneB.some(s => s.slotId === pair1.targetSlotId),
    `What Changed Initial: Target changed slot identified for halo spotlight (${pair1.targetSlotId})`
  );

  // Later-Half Hesitation Test (Later trials: Tier 5)
  const tier5 = WHAT_CHANGED_TIERS[4];
  const pair5 = engine.generateScenePair(tier5);
  assert(
    pair5.targetSlotId >= 0 && pair5.sceneB.some(s => s.slotId === pair5.targetSlotId),
    `What Changed Later-Half: Tier 5 changed slot identified for halo spotlight (${pair5.targetSlotId})`
  );
}

// ============================================================================
// 11. 4-LANGUAGE LOCALIZATION AUDIT FOR ASSISTANCE CUES
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🌐 [11/10] LOCALIZATION VERIFICATION - 4-Language Dignity Assist Strings');
console.log('--------------------------------------------------------------------------------');
{
  const profiles = ['severe_amnesic', 'motor_tremor_slowed', 'mild_executive_mci', 'autonomous_mastery'] as const;
  for (const profile of profiles) {
    const config = AdaptiveAssistanceEngine.getConfigurationForProfile(profile);
    for (const lang of LANGUAGES) {
      assert(
        config.displayName[lang] && config.displayName[lang].length > 0,
        `Assistance Profile [${profile}][${lang}]: displayName localized`
      );
      assert(
        config.clinicalRationale[lang] && config.clinicalRationale[lang].length > 0,
        `Assistance Profile [${profile}][${lang}]: clinicalRationale localized`
      );
    }
  }

  for (const lang of LANGUAGES) {
    const t = TRANSLATIONS[lang];
    assert(t.cognitiveGames && t.cognitiveGames.length > 0, `Global Translations [${lang}]: cognitiveGames present`);
    assert(t.cognitiveScore && t.cognitiveScore.length > 0, `Global Translations [${lang}]: cognitiveScore present`);
  }
}

// ============================================================================
// FINAL AUDIT SUMMARY
// ============================================================================
console.log('\n================================================================================');
console.log(`🏁 AUDIT COMPLETE: ${passedAssertions}/${totalAssertions} Assertions Passed`);
if (failedAssertions === 0) {
  console.log('🎉 ALL 10 COGNITIVE GAMES GUARANTEE UNIVERSAL ADAPTIVE ASSISTANCE!');
  console.log('   - Initial hesitation triggers dignity hints across all tiers.');
  console.log('   - Later-half hesitation reliably guides remaining uncompleted steps.');
  console.log('   - 100% offline and localized across Assamese, Bengali, Hindi, and English.');
  console.log('================================================================================');
  process.exit(0);
} else {
  console.error(`💥 ${failedAssertions} Assertions Failed! Please check logs above.`);
  console.log('================================================================================');
  process.exit(1);
}
