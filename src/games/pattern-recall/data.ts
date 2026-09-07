/**
 * SmritiNER - Game 9: Pattern Recall (Noxar Chonda / চানেকিৰ ছন্দ)
 * Assamese Handloom Weaving Motif Themes (তাঁতশালৰ চানেকি) & Spatial Topologies
 * Supporting Multi-Lingual Localizations: Assamese, Bengali, Hindi, English.
 */

import type { SupportedLanguage } from '../../types/prescription';
import type { PatternTopology } from './types';

export interface MotifTheme {
  id: string;
  symbol: string;
  name: Record<SupportedLanguage, string>;
  description: Record<SupportedLanguage, string>;
  colorTheme: {
    base: string;
    active: string;
    beacon: string;
    border: string;
  };
}

export const MOTIF_THEMES: MotifTheme[] = [
  {
    id: 'gamosa_phool',
    symbol: '🌸',
    name: {
      as: 'গামোচাৰ ফুল',
      bn: 'গামোছার ফুল',
      hi: 'गमोसा का फूल',
      en: 'Gamosa Floral Weave',
    },
    description: {
      as: 'অসমৰ পৰম্পৰাগত ৰঙা ফুলৰ হস্ততাঁত চানেকি',
      bn: 'আসামের ঐতিহ্যবাহী লাল ফুলের তাঁত নকশা',
      hi: 'असम का पारंपरिक लाल फूलों वाला हथकरघा पैटर्न',
      en: 'Traditional Assamese red floral border embroidery',
    },
    colorTheme: {
      base: 'bg-rose-50 border-rose-200 text-rose-700',
      active: 'bg-rose-500 border-rose-600 text-white shadow-rose-300',
      beacon: 'bg-amber-400 border-amber-500 text-amber-950 animate-pulse ring-4 ring-amber-300',
      border: 'border-rose-400',
    },
  },
  {
    id: 'jaapi_tara',
    symbol: '⭐',
    name: {
      as: 'জাপিৰ তৰা',
      bn: 'জাপির তারা',
      hi: 'जापी का सितारा',
      en: 'Jaapi Starburst Weave',
    },
    description: {
      as: 'বাঁহ আৰু বেতৰ ফুলাম জাপিৰ কেন্দ্ৰীয় তৰা চানেকি',
      bn: 'বাঁশ ও বেতের নকশাদার জাপির কেন্দ্রীয় তারা নকশা',
      hi: 'बांस और बेंत की सजी हुई जापी का तारा पैटर्न',
      en: 'Conical sun-hat geometric bamboo starburst pattern',
    },
    colorTheme: {
      base: 'bg-amber-50 border-amber-200 text-amber-700',
      active: 'bg-amber-500 border-amber-600 text-white shadow-amber-300',
      beacon: 'bg-yellow-300 border-yellow-500 text-yellow-950 animate-pulse ring-4 ring-yellow-200',
      border: 'border-amber-400',
    },
  },
  {
    id: 'xorai_alankar',
    symbol: '🏆',
    name: {
      as: 'শৰাইৰ অলংকাৰ',
      bn: 'শরাই অলংকার',
      hi: 'शराई अलंकरण',
      en: 'Xorai Royal Insignia',
    },
    description: {
      as: 'কাঁহ-পিতলৰ ঐতিহাসিক শৰাইৰ শিল্পকলা',
      bn: 'কাঁসা-পিতলের ঐতিহাসিক শরাইয়ের শিল্পকলা',
      hi: 'कांस्य-पीतल की ऐतिहासिक शराई का शाही प्रतीक',
      en: 'Historic brass bell-metal offering tray royal emblem',
    },
    colorTheme: {
      base: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      active: 'bg-yellow-500 border-yellow-600 text-white shadow-yellow-300',
      beacon: 'bg-amber-300 border-amber-500 text-amber-950 animate-pulse ring-4 ring-amber-200',
      border: 'border-yellow-400',
    },
  },
  {
    id: 'chahpaat_koli',
    symbol: '🍃',
    name: {
      as: 'চাহপাত আৰু কলি',
      bn: 'চা পাতা ও কুঁড়ি',
      hi: 'चाय की पत्ती और कली',
      en: 'Tea Leaf & Bud',
    },
    description: {
      as: 'অসমৰ সেউজ চাহ বাগিচাৰ দুটি পাত আৰু এটি কলি',
      bn: 'আসামের সবুজ চা বাগানের দুটি পাতা ও একটি কুঁড়ি',
      hi: 'असम के हरे चाय बागानों की दो पत्तियां और एक कली',
      en: 'Lush Assam tea garden signature two-leaves-and-a-bud',
    },
    colorTheme: {
      base: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      active: 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-300',
      beacon: 'bg-lime-300 border-lime-500 text-lime-950 animate-pulse ring-4 ring-lime-200',
      border: 'border-emerald-400',
    },
  },
  {
    id: 'muga_buta',
    symbol: '✨',
    name: {
      as: 'মুগা কাপোৰৰ বুটা',
      bn: 'মুগা কাপড়ের বুটা',
      hi: 'मूगा रेशम की बूटी',
      en: 'Golden Muga Silk Buta',
    },
    description: {
      as: 'সোণালী মুগা সূতাৰে তোলা জিলিকা বুটা চানেকি',
      bn: 'সোনালী মুগা সুতোয় বোনা চকচকে বুটা নকশা',
      hi: 'सुनहरे मूगा रेशम से बुना हुआ चमकदार बूटी पैटर्न',
      en: 'Gleaming golden silk diamond-rhombus weave',
    },
    colorTheme: {
      base: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      active: 'bg-indigo-500 border-indigo-600 text-white shadow-indigo-300',
      beacon: 'bg-amber-300 border-amber-500 text-amber-950 animate-pulse ring-4 ring-amber-200',
      border: 'border-indigo-400',
    },
  },
];

/**
 * Visuospatial Pattern Generator helpers for N x N grids
 */
export class PatternGenerator {
  /**
   * Generates target cell indices according to specified topology and grid constraints.
   */
  public static generatePattern(
    gridSize: number,
    patternLength: number,
    topology: PatternTopology
  ): number[] {
    const totalCells = gridSize * gridSize;
    const clampedLength = Math.max(2, Math.min(totalCells - 1, patternLength));

    // Cell coord conversions
    const toRowCol = (idx: number) => ({ row: Math.floor(idx / gridSize), col: idx % gridSize });
    const toIdx = (row: number, col: number) => row * gridSize + col;

    // Check bounds
    const inBounds = (r: number, c: number) => r >= 0 && r < gridSize && c >= 0 && c < gridSize;

    // 1. Adjacent Linear (Tiers 1-2):
    // Connected contiguous walk (horizontal, vertical, or gentle turn)
    if (topology === 'adjacent_linear') {
      for (let attempt = 0; attempt < 40; attempt++) {
        const startR = Math.floor(Math.random() * gridSize);
        const startC = Math.floor(Math.random() * gridSize);
        const path: number[] = [toIdx(startR, startC)];

        const directions = [
          { dr: 0, dc: 1 },
          { dr: 1, dc: 0 },
          { dr: 0, dc: -1 },
          { dr: -1, dc: 0 },
        ];

        let currR = startR;
        let currC = startC;

        while (path.length < clampedLength) {
          const shuffledDirs = [...directions].sort(() => Math.random() - 0.5);
          let extended = false;

          for (const dir of shuffledDirs) {
            const nextR = currR + dir.dr;
            const nextC = currC + dir.dc;
            const nextIdx = toIdx(nextR, nextC);

            if (inBounds(nextR, nextC) && !path.includes(nextIdx)) {
              path.push(nextIdx);
              currR = nextR;
              currC = nextC;
              extended = true;
              break;
            }
          }

          if (!extended) break; // Dead end, retry
        }

        if (path.length === clampedLength) {
          return path.sort((a, b) => a - b);
        }
      }
    }

    // 2. Clustered Quadrant (Tiers 3-4):
    // Confined to one quadrant or compact 2x2 / 2x3 bounding region
    if (topology === 'clustered_quadrant') {
      for (let attempt = 0; attempt < 30; attempt++) {
        const startR = Math.floor(Math.random() * Math.max(1, gridSize - 1));
        const startC = Math.floor(Math.random() * Math.max(1, gridSize - 1));
        const candidatePool: number[] = [];

        for (let r = startR; r < Math.min(gridSize, startR + 2); r++) {
          for (let c = startC; c < Math.min(gridSize, startC + 2); c++) {
            candidatePool.push(toIdx(r, c));
          }
        }

        if (candidatePool.length >= clampedLength) {
          const shuffled = [...candidatePool].sort(() => Math.random() - 0.5);
          return shuffled.slice(0, clampedLength).sort((a, b) => a - b);
        }
      }
    }

    // 3. Diagonal Distributed (Tier 5):
    // Emphasizes primary or secondary diagonal + cross-cell
    if (topology === 'diagonal_distributed') {
      const diag1: number[] = [];
      const diag2: number[] = [];
      for (let i = 0; i < gridSize; i++) {
        diag1.push(toIdx(i, i));
        diag2.push(toIdx(i, gridSize - 1 - i));
      }
      const chosenDiag = Math.random() < 0.5 ? diag1 : diag2;
      const shuffledDiag = [...chosenDiag].sort(() => Math.random() - 0.5);
      const selected = new Set<number>(shuffledDiag.slice(0, Math.min(shuffledDiag.length, clampedLength - 1)));

      while (selected.size < clampedLength) {
        const randomCell = Math.floor(Math.random() * totalCells);
        selected.add(randomCell);
      }
      return Array.from(selected).sort((a, b) => a - b);
    }

    // 4. Semi-Clustered Quadrant (Tier 6):
    // 2-3 cells in one quadrant + 1-2 cells in opposite quadrant
    if (topology === 'semi_clustered_quadrant') {
      const quad1Cells: number[] = [];
      const quad4Cells: number[] = [];
      const half = Math.floor(gridSize / 2);

      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const idx = toIdx(r, c);
          if (r < half && c < half) quad1Cells.push(idx);
          if (r >= half && c >= half) quad4Cells.push(idx);
        }
      }

      if (quad1Cells.length >= 2 && quad4Cells.length >= 2) {
        const count1 = Math.min(quad1Cells.length, Math.ceil(clampedLength / 2));
        const count4 = clampedLength - count1;
        const part1 = [...quad1Cells].sort(() => Math.random() - 0.5).slice(0, count1);
        const part4 = [...quad4Cells].sort(() => Math.random() - 0.5).slice(0, count4);
        return [...part1, ...part4].sort((a, b) => a - b);
      }
    }

    // 5. High Entropy Dispersed (Tier 9) & Complex Distributed (Tiers 7-8):
    if (topology === 'high_entropy_dispersed' || topology === 'complex_distributed') {
      for (let attempt = 0; attempt < 50; attempt++) {
        const selected: number[] = [];
        const pool = Array.from({ length: totalCells }, (_, i) => i).sort(() => Math.random() - 0.5);

        for (const candidate of pool) {
          const cPos = toRowCol(candidate);
          const isTooClose = selected.some(s => {
            const sPos = toRowCol(s);
            const dist = Math.abs(cPos.row - sPos.row) + Math.abs(cPos.col - sPos.col);
            return dist < 1;
          });

          if (!isTooClose) {
            selected.push(candidate);
          }

          if (selected.length === clampedLength) {
            return selected.sort((a, b) => a - b);
          }
        }
      }
    }

    // Robust Deterministic Fallback: Uniform random without duplicates
    const fallbackSet = new Set<number>();
    while (fallbackSet.size < clampedLength) {
      fallbackSet.add(Math.floor(Math.random() * totalCells));
    }
    return Array.from(fallbackSet).sort((a, b) => a - b);
  }
}
