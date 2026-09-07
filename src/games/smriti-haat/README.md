# Smriti Haat (Game 1: Visual & Spatial Memory) Integration Guide

This game is fully self-contained and ready to drop into any page or modal built by any frontend teammate.

---

## 1. Quick Drop-In Usage (React Component)

```tsx
import { SmritiHaat, SessionSummaryTelemetry } from './games/smriti-haat';

function MemoryPage() {
  const handleComplete = (summary: SessionSummaryTelemetry) => {
    console.log("Session complete!", summary);
    console.log("Estimated MoCA Memory Score (0-5):", summary.estimatedMoCAMemoryScore);
    console.log("Patient Median Latency:", summary.medianLatencyMs);
  };

  return (
    <div>
      <SmritiHaat
        language="as"               // 'as' | 'bn' | 'hi' | 'en'
        totalRounds={3}             // number of rounds
        initialTheta={0.0}          // patient starting ability (-3.0 to +3.0)
        onSessionComplete={handleComplete}
        onExit={() => alert("Exited")}
      />
    </div>
  );
}
```

---

## 2. Headless Engine Usage (Pure TypeScript - Zero UI Dependencies)
If your teammate is building a custom canvas, 3D, or non-React interface, they can use the headless engine directly:

```ts
import { SmritiHaatEngine } from './games/smriti-haat';

const engine = new SmritiHaatEngine(0.0, 3);

// 1. Get targets to show
const targets = engine.getTargets();

// 2. Advance through phases
engine.advanceToConceal();
engine.advanceToRecall();

// 3. Toggle items clicked
engine.toggleSelection('assam-tea');
engine.toggleSelection('japi-hat');

// 4. Submit and get Bayesian IRT feedback
const telemetry = engine.submitRecall();
console.log("New Theta:", telemetry.thetaAfterRound);
console.log("Latency:", telemetry.latencyMs);

// 5. Generate final clinical summary
const summary = engine.generateSessionSummary();
```

---

## 3. Data Telemetry Schema Returned to Parent

```ts
interface SessionSummaryTelemetry {
  gameId: 'smriti-haat';
  totalRounds: number;
  totalCorrect: number;
  accuracyPercentage: number;
  averageLatencyMs: number;
  medianLatencyMs: number;
  perseverationErrors: number;
  finalTheta: number;
  estimatedMoCAMemoryScore: number; // 0 to 5 points (MoCA Delayed Recall standard)
  completedAt: string;
}
```
