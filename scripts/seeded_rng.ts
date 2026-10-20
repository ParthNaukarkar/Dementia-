/**
 * Mulberry32 seeded Pseudo-Random Number Generator (PRNG)
 * Produces deterministic, reproducible random floats in [0, 1)
 */
export function createSeededRandom(seed: number = 0x5D41): () => number {
  let s = seed | 0;
  return function(): number {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
