/**
 * TEST ALL 10 COGNITIVE GAME ENGINES
 * Tests initialization, difficulty tiers, input validation, and telemetry generation
 * across all 10 game engines using their actual public APIs.
 */

import { MemoryMatchEngine } from '../src/games/memory-match/engine';
import { NumberRecallEngine } from '../src/games/number-recall/engine';
import { SequenceRecallEngine } from '../src/games/sequence-recall/engine';
import { PatternRecallEngine } from '../src/games/pattern-recall/engine';
import { JigsawPraxisEngine } from '../src/games/jigsaw-puzzle/engine';
import { WhatChangedEngine } from '../src/games/what-changed/engine';
import { WhereAmIEngine } from '../src/games/where-am-i/engine';
import { OddOneOutEngine } from '../src/games/odd-one-out/engine';
import { SmritiHaatEngine } from '../src/games/smriti-haat/engine';
import { BrainStoryEngine } from '../src/games/brain-story/engine';

interface GameTestResult {
  gameId: string;
  initPass: boolean;
  trialPass: boolean;
  scoringPass: boolean;
  edgeCasePass: boolean;
  notes: string;
}

const results: GameTestResult[] = [];

console.log('================================================================================');
console.log('🎮 COMPREHENSIVE ENGINE AUDIT: ALL 10 COGNITIVE GAMES');
console.log('================================================================================');

// 1. Memory Match
try {
  const g1 = new MemoryMatchEngine(0.0);
  const tier = g1.getCurrentTier();
  const deck = g1.generateDeck(tier);
  const initOk = deck.length === tier.totalCards;

  // Verify coordinates assigned and pair structure
  const trialOk = deck.length > 0 && deck.every(c => c.gridRow >= 0 && c.gridCol >= 0);

  // Tremor filter: second immediate tap debounced
  const t1 = g1.filterTremorTap(400);
  const t2 = g1.filterTremorTap(400);
  const edgeOk = t1 === true && t2 === false;

  // Bayesian IRT theta update step
  const updateRes = g1.updateTheta(tier.pairCount, tier.totalCards, 0, tier.pairCount, false, {} as any);
  const scoringOk = typeof updateRes.newTheta === 'number' && !isNaN(updateRes.newTheta);

  results.push({
    gameId: 'memory-match',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: scoringOk,
    edgeCasePass: edgeOk,
    notes: `Deck: ${deck.length} cards, Tier: ${tier.tier}`
  });
} catch (e: any) {
  results.push({ gameId: 'memory-match', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// 2. Number Recall
try {
  const g2 = new NumberRecallEngine(0.0);
  const diff = g2.getDifficulty();
  const target = g2.generateDigitSequence(diff.digitCount);
  const initOk = target.length === diff.digitCount;

  // Evaluate forward recall trial
  const evalRes = g2.evaluateTrial(target, target, 'forward');
  const trialOk = evalRes.isCorrect === true && evalRes.errorType === 'none';

  // Empty string edge case
  const emptyRes = g2.evaluateTrial(target, '', 'forward');
  const edgeOk = emptyRes.isCorrect === false && emptyRes.errorType === 'omission';

  const scoringOk = evalRes.serialPositionHits.length === target.length && evalRes.primacyAccuracy;

  results.push({
    gameId: 'number-recall',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: scoringOk,
    edgeCasePass: edgeOk,
    notes: `Digits: ${target.length}, Evaluated accurately`
  });
} catch (e: any) {
  results.push({ gameId: 'number-recall', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// 3. Sequence Recall
try {
  const g3 = new SequenceRecallEngine(0.0);
  g3.startNewTrial();
  const expSeq = g3.getExpectedSequence();
  const initOk = expSeq.length >= 2;

  const baseTime = Date.now();
  g3.notifyRecallPhaseStarted(baseTime);
  let allAccepted = true;
  expSeq.forEach((item, idx) => {
    // Space taps by 500ms to clear 400ms tremor filter
    const tapRes = g3.registerItemTap(item, baseTime + (idx + 1) * 500);
    if (!tapRes.accepted) allAccepted = false;
  });
  const evalRes = g3.evaluateCurrentTrial();
  const trialOk = allAccepted && evalRes.isCorrect === true;

  // Tremor filter check: rapid second tap within 50ms is filtered
  g3.startNewTrial();
  g3.notifyRecallPhaseStarted(baseTime);
  const t1 = g3.registerItemTap(expSeq[0], baseTime + 100);
  const t2 = g3.registerItemTap(expSeq[0], baseTime + 150);
  const edgeOk = t1.accepted === true && t2.isTremorFiltered === true;

  const scoringOk = evalRes.errorType === 'NONE' && typeof evalRes.thetaAfterTrial === 'number';

  results.push({
    gameId: 'sequence-recall',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: scoringOk,
    edgeCasePass: edgeOk,
    notes: `Sequence length: ${expSeq.length}, Correct: ${evalRes.isCorrect}`
  });
} catch (e: any) {
  results.push({ gameId: 'sequence-recall', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// 4. Pattern Recall
try {
  const g4 = new PatternRecallEngine(0.0);
  const diff = g4.getDifficulty();
  const trial = g4.generateTrial(1, diff);
  const initOk = trial.pattern.length === diff.patternLength && trial.gridSize === diff.gridSize;

  // Golden beacon hint verification
  const beaconHints = g4.getBeaconHintTiles(trial, [], 1);
  const trialOk = beaconHints.length === 1 && trial.pattern.includes(beaconHints[0]);

  // Tremor filter check
  const t1 = g4.filterTremorTap(0, 1000);
  const t2 = g4.filterTremorTap(0, 1050);
  const edgeOk = t1 === true && t2 === false;

  const updateRes = g4.updateTheta(true, 2000, 0, 0, {} as any);
  const scoringOk = typeof updateRes.newTheta === 'number' && !isNaN(updateRes.newTheta);

  results.push({
    gameId: 'pattern-recall',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: scoringOk,
    edgeCasePass: edgeOk,
    notes: `Grid: ${trial.gridSize}x${trial.gridSize}, Active tiles: ${trial.pattern.length}`
  });
} catch (e: any) {
  results.push({ gameId: 'pattern-recall', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// 5. Jigsaw Puzzle
try {
  const g5 = new JigsawPraxisEngine(0.0);
  const diff = g5.deriveDifficultyFromTheta(0.0);
  const pieces = g5.generatePieces(diff.gridCols, diff.gridRows, diff.allowRotation, diff.rotationModes);
  const initOk = pieces.length === diff.totalPieces;

  // Correct piece placement evaluation
  const p0 = pieces[0];
  const placeRes = g5.evaluatePlacement(p0, p0.correctCol, p0.correctRow, 0);
  const trialOk = placeRes.isCorrect === true;

  // Incorrect piece placement
  const wrongRes = g5.evaluatePlacement(p0, (p0.correctCol + 1) % diff.gridCols, p0.correctRow, 0);
  const edgeOk = wrongRes.isCorrect === false;

  const t1 = g5.filterTremorTap(1000);
  const t2 = g5.filterTremorTap(1050);
  const scoringOk = t1 === true && t2 === false && typeof diff.snapMarginPx === 'number';

  results.push({
    gameId: 'jigsaw-puzzle',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: scoringOk,
    edgeCasePass: edgeOk,
    notes: `Pieces: ${pieces.length}, Placement verified`
  });
} catch (e: any) {
  results.push({ gameId: 'jigsaw-puzzle', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// 6. What Changed
try {
  const g6 = new WhatChangedEngine(0.0);
  const diff = g6.getDifficulty();
  const pair = g6.generateScenePair(diff);
  const initOk = pair.sceneA.length === diff.itemCount && pair.sceneB.length === diff.itemCount;

  const trialOk = typeof pair.targetSlotId === 'number' && typeof pair.changeType === 'string';

  const t1 = g6.filterTremorTap(1000);
  const t2 = g6.filterTremorTap(1050);
  const edgeOk = t1 === true && t2 === false;

  const updateRes = g6.updateTheta(true, 3000);
  const scoringOk = typeof updateRes.newTheta === 'number' && !isNaN(updateRes.newTheta);

  results.push({
    gameId: 'what-changed',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: scoringOk,
    edgeCasePass: edgeOk,
    notes: `Changed slot: ${pair.targetSlotId}, Type: ${pair.changeType}`
  });
} catch (e: any) {
  results.push({ gameId: 'what-changed', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// 7. Where Am I
try {
  const g7 = new WhereAmIEngine(0.0);
  const diff = g7.getDifficulty();
  const trial = g7.generateTrial(diff);
  const initOk = trial.options.length === diff.choicesCount && trial.targetLocation !== undefined;

  const trialOk = trial.options.some(o => o.id === trial.targetLocation.id);

  // Compass distractor elimination
  const eliminated = g7.applyCompassHint(trial.options, trial.targetLocation.id, 1);
  const edgeOk = eliminated.length === 1 && eliminated[0] !== trial.targetLocation.id;

  const updateRes = g7.updateTheta(true, 3500, 1);
  const scoringOk = typeof updateRes.newTheta === 'number' && !isNaN(updateRes.newTheta);

  results.push({
    gameId: 'where-am-i',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: scoringOk,
    edgeCasePass: edgeOk,
    notes: `Target: "${trial.targetLocation.name.en}", Choices: ${trial.options.length}`
  });
} catch (e: any) {
  results.push({ gameId: 'where-am-i', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// 8. Odd One Out
try {
  const g8 = new OddOneOutEngine(0.0);
  const diff = g8.getDifficulty();
  const trial = g8.generateTrial(diff, 1);
  const initOk = trial.items.length === diff.choicesCount && trial.oddItem !== undefined;

  const trialOk = trial.items[trial.oddItemIndex].id === trial.oddItem.id;

  // Spotlight distractor elimination
  const eliminated = g8.getSpotlightEliminations(trial, 1);
  const edgeOk = eliminated.length === 1 && eliminated[0] !== trial.oddItemIndex;

  const updateRes = g8.updateTheta(true, 2500, false, 0, {} as any);
  const scoringOk = typeof updateRes.newTheta === 'number' && !isNaN(updateRes.newTheta);

  results.push({
    gameId: 'odd-one-out',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: scoringOk,
    edgeCasePass: edgeOk,
    notes: `Odd item: "${trial.oddItem.name.en}", Choices: ${trial.items.length}`
  });
} catch (e: any) {
  results.push({ gameId: 'odd-one-out', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// 9. Smriti Haat
try {
  const g9 = new SmritiHaatEngine(0.0, 3);
  const targets = g9.getTargets();
  const recallOptions = g9.getRecallOptions();
  const initOk = targets.length === g9.getDifficulty().itemsToMemorize && recallOptions.length > targets.length;

  g9.advanceToConceal();
  g9.advanceToRecall();
  const toggled = g9.toggleSelection(targets[0].id);
  const trialOk = toggled === true;

  const roundRes = g9.submitRecall(3000);
  const scoringOk = roundRes.roundNumber === 1 && typeof roundRes.correctCount === 'number' && typeof roundRes.thetaAfterRound === 'number';

  // Distractor elimination
  g9.startNewRound();
  g9.advanceToRecall();
  const elimId = g9.eliminateDistractor();
  const edgeOk = elimId !== null && typeof elimId === 'string';

  results.push({
    gameId: 'smriti-haat',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: scoringOk,
    edgeCasePass: edgeOk,
    notes: `Targets: ${targets.length}, Options: ${recallOptions.length}`
  });
} catch (e: any) {
  results.push({ gameId: 'smriti-haat', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// 10. Brain Story
try {
  const g10 = new BrainStoryEngine(0.0);
  const diff = g10.getDifficulty();
  const trial = g10.generateTrial(1, diff);
  const initOk = trial.displayedSentences.length > 0 && trial.activeQuestions.length > 0;

  const q0 = trial.activeQuestions[0];
  const trialOk = q0.options['en'] && q0.options['en'].length >= 2;

  const t1 = g10.filterTremorTap(0, 1000);
  const t2 = g10.filterTremorTap(0, 1050);
  const edgeOk = t1 === true && t2 === false;

  const updateRes = g10.updateTheta(true, 2500, {} as any, 1.0);
  const scoringOk = typeof updateRes.newTheta === 'number' && !isNaN(updateRes.newTheta);

  results.push({
    gameId: 'brain-story',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: scoringOk,
    edgeCasePass: edgeOk,
    notes: `Story: "${trial.story.title.en}", Questions: ${trial.activeQuestions.length}`
  });
} catch (e: any) {
  results.push({ gameId: 'brain-story', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// Print results table
console.log('\n--- ENGINE TEST RESULTS ---');
console.table(results);

const allPassed = results.every(r => r.initPass && r.trialPass && r.scoringPass && r.edgeCasePass);
console.log(`\nAll 10 Engines Operational: ${allPassed ? '✅ YES (10/10)' : '❌ NO'}`);

if (!allPassed) {
  process.exit(1);
}
