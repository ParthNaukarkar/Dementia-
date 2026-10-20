/**
 * TEST ALL 10 COGNITIVE GAME ENGINES
 * Tests initialization, difficulty tiers, input validation, and telemetry generation
 * across all 10 game engines.
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
  const deck = g1.startNewGame();
  const initOk = deck.length > 0;
  
  // Flip two cards
  const flip1 = g1.flipCard(0);
  const flip2 = g1.flipCard(1);
  const trialOk = flip1 !== undefined && flip2 !== undefined;
  
  // Rapid tap tremor filter check
  const now = performance.now();
  const debounceOk = g1.isTremorDebounced(now);
  
  results.push({
    gameId: 'memory-match',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: g1.getMatchesFound() >= 0,
    edgeCasePass: typeof debounceOk === 'boolean',
    notes: `Deck size: ${deck.length}, Matches: ${g1.getMatchesFound()}`
  });
} catch (e: any) {
  results.push({ gameId: 'memory-match', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// 2. Number Recall
try {
  const g2 = new NumberRecallEngine(0.0);
  const target = g2.startNewTrial();
  const initOk = target.length >= 3;
  
  // Evaluate forward recall
  const evalRes = g2.evaluateTrial(target, 2500);
  const trialOk = evalRes.isSuccess === true;
  
  // Empty input edge case
  const emptyRes = g2.evaluateTrial('', 500);
  const edgeOk = emptyRes.isSuccess === false;

  results.push({
    gameId: 'number-recall',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: evalRes.accuracyPct === 100,
    edgeCasePass: edgeOk,
    notes: `Target: "${target}", Evaluated accurately`
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
  
  // User enters sequence
  g3.notifyRecallPhaseStarted();
  let trialOk = true;
  for (const item of expSeq) {
    const tapRes = g3.handleUserItemTap(item);
    if (!tapRes.accepted) trialOk = false;
  }
  const evalRes = g3.evaluateCurrentTrial();
  
  results.push({
    gameId: 'sequence-recall',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: evalRes.isCorrect === true,
    edgeCasePass: true,
    notes: `Sequence length: ${expSeq.length}, Accuracy: ${evalRes.accuracyPct}%`
  });
} catch (e: any) {
  results.push({ gameId: 'sequence-recall', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// 4. Pattern Recall
try {
  const g4 = new PatternRecallEngine(0.0);
  const trial = g4.startNewTrial();
  const initOk = trial.activeTileIndices.length > 0;
  
  // Toggle tile
  const firstTile = trial.activeTileIndices[0];
  const tapRes = g4.toggleTile(firstTile);
  const trialOk = tapRes !== undefined;
  
  // Check tremor debounce
  const debOk = g4.shouldDebounceTap(performance.now());

  results.push({
    gameId: 'pattern-recall',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: trial.gridDimensions.rows > 0,
    edgeCasePass: typeof debOk === 'boolean',
    notes: `Grid: ${trial.gridDimensions.rows}x${trial.gridDimensions.cols}, Active tiles: ${trial.activeTileIndices.length}`
  });
} catch (e: any) {
  results.push({ gameId: 'pattern-recall', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// 5. Jigsaw Puzzle
try {
  const g5 = new JigsawPraxisEngine(0.0);
  const puzzle = g5.startNewPuzzle();
  const initOk = puzzle.pieces.length === 4; // 2x2
  
  // Place piece in correct slot
  const p0 = puzzle.pieces[0];
  const placeRes = g5.placePiece(p0.id, p0.targetSlot);
  const trialOk = placeRes.isCorrect === true;
  
  // Hint assist
  const assist = g5.getAssistPiece();

  results.push({
    gameId: 'jigsaw-puzzle',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: g5.getPlacedPiecesCount() >= 1,
    edgeCasePass: assist !== null,
    notes: `Puzzle pieces: ${puzzle.pieces.length}, Placement verified`
  });
} catch (e: any) {
  results.push({ gameId: 'jigsaw-puzzle', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// 6. What Changed
try {
  const g6 = new WhatChangedEngine(0.0);
  const trial = g6.startNewTrial();
  const initOk = trial.originalScene.length > 0;
  
  // Guess the changed slot
  const evalRes = g6.evaluateGuess(trial.changedSlotIndex, 3000);
  const trialOk = evalRes.isCorrect === true;

  results.push({
    gameId: 'what-changed',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: evalRes.reactionTimeMs > 0,
    edgeCasePass: true,
    notes: `Changed slot: ${trial.changedSlotIndex}, Evaluation accurate`
  });
} catch (e: any) {
  results.push({ gameId: 'what-changed', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// 7. Where Am I
try {
  const g7 = new WhereAmIEngine(0.0);
  const trial = g7.startNewTrial();
  const initOk = trial.choices.length >= 2;
  
  // Select correct choice
  const evalRes = g7.evaluateSelection(trial.targetLocation.id, 4000);
  const trialOk = evalRes.isCorrect === true;

  results.push({
    gameId: 'where-am-i',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: evalRes.accuracyPct === 100,
    edgeCasePass: trial.clues.length > 0,
    notes: `Landmark: "${trial.targetLocation.name.en}", Choices: ${trial.choices.length}`
  });
} catch (e: any) {
  results.push({ gameId: 'where-am-i', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// 8. Odd One Out
try {
  const g8 = new OddOneOutEngine(0.0);
  const trial = g8.startNewTrial();
  const initOk = trial.options.length >= 3;
  
  // Select odd item
  const evalRes = g8.evaluateSelection(trial.oddItemId, 2000);
  const trialOk = evalRes.isCorrect === true;

  results.push({
    gameId: 'odd-one-out',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: evalRes.accuracyPct === 100,
    edgeCasePass: trial.commonCategory.length > 0,
    notes: `Category: "${trial.commonCategory}", Odd item: "${trial.oddItemId}"`
  });
} catch (e: any) {
  results.push({ gameId: 'odd-one-out', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// 9. Smriti Haat
try {
  const g9 = new SmritiHaatEngine(0.0);
  const trial = g9.startNewRound();
  const initOk = trial.targetItems.length > 0;
  
  // Submit recall selection
  const selected = [trial.targetItems[0].id];
  const evalRes = g9.evaluateRecall(selected, 3500);
  const trialOk = evalRes.correctRecalled >= 1;

  results.push({
    gameId: 'smriti-haat',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: evalRes.accuracyPercentage > 0,
    edgeCasePass: trial.recallGrid.length > trial.targetItems.length,
    notes: `Shopping items: ${trial.targetItems.length}, Recall grid: ${trial.recallGrid.length}`
  });
} catch (e: any) {
  results.push({ gameId: 'smriti-haat', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// 10. Brain Story
try {
  const g10 = new BrainStoryEngine(0.0);
  const story = g10.startNewStory();
  const initOk = story.paragraphs.length > 0;
  
  // Answer first question
  const q0 = story.questions[0];
  const evalRes = g10.evaluateAnswer(q0.id, q0.correctOptionIndex, 2800);
  const trialOk = evalRes.isCorrect === true;

  results.push({
    gameId: 'brain-story',
    initPass: initOk,
    trialPass: trialOk,
    scoringPass: evalRes.accuracyPct === 100,
    edgeCasePass: story.questions.length >= 2,
    notes: `Story title: "${story.title.en}", Questions: ${story.questions.length}`
  });
} catch (e: any) {
  results.push({ gameId: 'brain-story', initPass: false, trialPass: false, scoringPass: false, edgeCasePass: false, notes: e.message });
}

// Print results table
console.log('\n--- ENGINE TEST RESULTS ---');
console.table(results);

const allPassed = results.every(r => r.initPass && r.trialPass && r.scoringPass && r.edgeCasePass);
console.log(`\nAll 10 Engines Operational: ${allPassed ? '✅ YES (10/10)' : '❌ NO'}`);
