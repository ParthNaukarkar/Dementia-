import React from 'react';
import type { GameId } from '../../types/prescription';

interface GameThumbnailProps {
  gameId: GameId | string;
  className?: string;
}

export const GameThumbnail: React.FC<GameThumbnailProps> = ({ gameId, className = 'w-full h-full' }) => {
  switch (gameId) {
    /* ══════════════════════════════════════════════════════════════════════
       1. MEMORY MATCH: Paired Flip Cards with Heritage Animals & Sparkles
       ══════════════════════════════════════════════════════════════════════ */
    case 'memory-match':
      return (
        <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="mmBg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="50%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
            <linearGradient id="cardFrontGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
            <linearGradient id="cardBackGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="glowG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <filter id="shadowLg" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background Table Canvas */}
          <rect width="320" height="180" rx="16" fill="url(#mmBg)" />
          {/* Subtle felt table grid lines */}
          <circle cx="160" cy="90" r="130" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="2" />
          <circle cx="160" cy="90" r="80" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Card 1 (Back face, left tilted) */}
          <g transform="translate(32, 28) rotate(-8 35 55)" filter="url(#shadowLg)">
            <rect width="70" height="100" rx="10" fill="url(#cardBackGrad)" stroke="#fde68a" strokeWidth="2" />
            <rect x="6" y="6" width="58" height="88" rx="6" fill="#78350f" fillOpacity="0.4" stroke="#fef08a" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="35" cy="50" r="16" fill="#fef3c7" fillOpacity="0.25" />
            <path d="M35 40 L38 47 L45 48 L40 53 L41 60 L35 56 L29 60 L30 53 L25 48 L32 47 Z" fill="#fef08a" />
          </g>

          {/* Card 2 (Front face MATCHED 1 - Rhino with Golden Border) */}
          <g transform="translate(112, 24)" filter="url(#shadowLg)">
            <rect width="72" height="102" rx="10" fill="url(#cardFrontGrad)" stroke="#10b981" strokeWidth="3" />
            <rect x="4" y="4" width="64" height="94" rx="8" fill="#ecfdf5" />
            {/* Animal Illustration (Rhino emoji styled / vector) */}
            <circle cx="36" cy="46" r="26" fill="#d1fae5" />
            <text x="36" y="55" fontSize="28" textAnchor="middle" dominantBaseline="middle">🦏</text>
            <text x="36" y="86" fontSize="10" fontWeight="900" fill="#047857" textAnchor="middle" letterSpacing="0.5">RHINO</text>
            <circle cx="60" cy="14" r="7" fill="#10b981" />
            <path d="M57 14 L59 16 L63 12" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Card 3 (Front face MATCHED 2 - Matching Pair Card) */}
          <g transform="translate(196, 24)" filter="url(#shadowLg)">
            <rect width="72" height="102" rx="10" fill="url(#cardFrontGrad)" stroke="#10b981" strokeWidth="3" />
            <rect x="4" y="4" width="64" height="94" rx="8" fill="#ecfdf5" />
            <circle cx="36" cy="46" r="26" fill="#d1fae5" />
            <text x="36" y="55" fontSize="28" textAnchor="middle" dominantBaseline="middle">🦏</text>
            <text x="36" y="86" fontSize="10" fontWeight="900" fill="#047857" textAnchor="middle" letterSpacing="0.5">PAIR!</text>
            <circle cx="60" cy="14" r="7" fill="#10b981" />
            <path d="M57 14 L59 16 L63 12" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Card 4 (Back face, right tilted) */}
          <g transform="translate(244, 46) rotate(10 35 55)" filter="url(#shadowLg)">
            <rect width="66" height="95" rx="10" fill="url(#cardBackGrad)" stroke="#fde68a" strokeWidth="2" />
            <rect x="5" y="5" width="56" height="85" rx="6" fill="#78350f" fillOpacity="0.4" stroke="#fef08a" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="33" cy="47" r="14" fill="#fef3c7" fillOpacity="0.25" />
          </g>

          {/* Floating Celebration Sparkles */}
          <path d="M190 20 L193 25 L198 26 L194 30 L195 35 L190 32 L185 35 L186 30 L182 26 L187 25 Z" fill="#fbbf24" />
          <path d="M110 142 L112 145 L116 146 L113 149 L114 153 L110 150 L106 153 L107 149 L104 146 L108 145 Z" fill="#38bdf8" />
          <circle cx="280" cy="24" r="3" fill="#fef08a" />
          <circle cx="50" cy="155" r="3.5" fill="#a7f3d0" />
        </svg>
      );

    /* ══════════════════════════════════════════════════════════════════════
       2. SEQUENCE RECALL: Corsi Span Audio-Visual Illuminated Pads
       ══════════════════════════════════════════════════════════════════════ */
    case 'sequence-recall':
      return (
        <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="srBg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0c4a6e" />
              <stop offset="50%" stopColor="#075985" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <filter id="glowCyan" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glowGold" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="320" height="180" rx="16" fill="url(#srBg)" />

          {/* Sequence Beam Guide */}
          <path d="M65 90 Q125 50 160 90 T255 90" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 6" strokeOpacity="0.6" fill="none" />

          {/* Pad 1: Cyan Active Step 1 */}
          <g transform="translate(35, 55)">
            <circle cx="35" cy="35" r="34" fill="#0284c7" fillOpacity="0.4" filter="url(#glowCyan)" />
            <circle cx="35" cy="35" r="28" fill="#38bdf8" stroke="#ffffff" strokeWidth="3" />
            <circle cx="35" cy="35" r="20" fill="#0284c7" />
            <text x="35" y="41" fontSize="18" fontWeight="900" fill="#ffffff" textAnchor="middle">1</text>
            <path d="M16 16 L22 22" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Pad 2: Amber Radiant Step 2 */}
          <g transform="translate(105, 55)">
            <circle cx="35" cy="35" r="34" fill="#f59e0b" fillOpacity="0.4" filter="url(#glowGold)" />
            <circle cx="35" cy="35" r="28" fill="#fbbf24" stroke="#ffffff" strokeWidth="3" />
            <circle cx="35" cy="35" r="20" fill="#d97706" />
            <text x="35" y="41" fontSize="18" fontWeight="900" fill="#ffffff" textAnchor="middle">2</text>
          </g>

          {/* Pad 3: Emerald Active Step 3 */}
          <g transform="translate(175, 55)">
            <circle cx="35" cy="35" r="32" fill="#10b981" fillOpacity="0.3" />
            <circle cx="35" cy="35" r="28" fill="#34d399" stroke="#ffffff" strokeWidth="3" />
            <circle cx="35" cy="35" r="20" fill="#059669" />
            <text x="35" y="41" fontSize="18" fontWeight="900" fill="#ffffff" textAnchor="middle">3</text>
          </g>

          {/* Pad 4: Rose Idle Next */}
          <g transform="translate(245, 55)">
            <circle cx="35" cy="35" r="26" fill="#f43f5e" fillOpacity="0.3" stroke="#fecdd3" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="35" cy="35" r="18" fill="#9f1239" fillOpacity="0.6" />
            <text x="35" y="41" fontSize="16" fontWeight="800" fill="#fda4af" textAnchor="middle">4</text>
          </g>

          {/* Musical Tone Waves & Header Pill */}
          <rect x="90" y="14" width="140" height="24" rx="12" fill="#082f49" fillOpacity="0.8" stroke="#38bdf8" strokeWidth="1" />
          <text x="160" y="30" fontSize="11" fontWeight="800" fill="#e0f2fe" textAnchor="middle" letterSpacing="1">
            ♪ 1 → 2 → 3 RHYTHM
          </text>
          <path d="M45 152 Q70 140 95 152 T145 152" stroke="#38bdf8" strokeWidth="2" fill="none" opacity="0.7" />
          <path d="M185 152 Q210 140 235 152 T285 152" stroke="#fcd34d" strokeWidth="2" fill="none" opacity="0.7" />
        </svg>
      );

    /* ══════════════════════════════════════════════════════════════════════
       3. SMRITI HAAT / WORD RECALL: Vibrant Indian Bazaar & Market Stall
       ══════════════════════════════════════════════════════════════════════ */
    case 'word-recall':
    case 'smriti-haat':
      return (
        <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="shBg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="40%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="awningRed" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
            <linearGradient id="awningWhite" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#fde047" />
            </linearGradient>
          </defs>

          <rect width="320" height="180" rx="16" fill="url(#shBg)" />

          {/* Market Stall Awning (Traditional Bazaar Canopy) */}
          <path d="M16 12 L304 12 L310 44 L10 44 Z" fill="#451a03" />
          {/* Awning Scallops */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <path
              key={i}
              d={`M${14 + i * 36.5} 12 L${50.5 + i * 36.5} 12 L${46.5 + i * 36.5} 44 C${46.5 + i * 36.5} 52 ${18 + i * 36.5} 52 ${18 + i * 36.5} 44 Z`}
              fill={i % 2 === 0 ? 'url(#awningRed)' : 'url(#awningWhite)'}
              stroke="#7f1d1d"
              strokeWidth="1"
            />
          ))}

          {/* Wooden Counter Shelf */}
          <rect x="24" y="112" width="272" height="14" rx="3" fill="#d97706" stroke="#451a03" strokeWidth="2" />
          <rect x="36" y="126" width="248" height="42" fill="#78350f" opacity="0.9" />

          {/* Produce Basket 1: Assam Green Tea */}
          <g transform="translate(36, 68)">
            <ellipse cx="32" cy="46" rx="28" ry="12" fill="#92400e" stroke="#451a03" strokeWidth="2" />
            <circle cx="32" cy="34" r="22" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
            <text x="32" y="41" fontSize="24" textAnchor="middle">🍵</text>
            <rect x="10" y="46" width="44" height="14" rx="4" fill="#14532d" />
            <text x="32" y="56" fontSize="9" fontWeight="900" fill="#86efac" textAnchor="middle">CHAI</text>
          </g>

          {/* Produce Basket 2: Sweet Oranges */}
          <g transform="translate(112, 64)">
            <ellipse cx="32" cy="50" rx="28" ry="12" fill="#92400e" stroke="#451a03" strokeWidth="2" />
            <circle cx="32" cy="34" r="24" fill="#ffedd5" stroke="#ea580c" strokeWidth="2" />
            <text x="32" y="42" fontSize="26" textAnchor="middle">🍊</text>
            <rect x="8" y="48" width="48" height="14" rx="4" fill="#7c2d12" />
            <text x="32" y="58" fontSize="9" fontWeight="900" fill="#fdba74" textAnchor="middle">ORANGE</text>
          </g>

          {/* Produce Basket 3: Japi Hat */}
          <g transform="translate(188, 66)">
            <ellipse cx="32" cy="48" rx="28" ry="12" fill="#92400e" stroke="#451a03" strokeWidth="2" />
            <circle cx="32" cy="34" r="22" fill="#fef9c3" stroke="#ca8a04" strokeWidth="2" />
            <text x="32" y="41" fontSize="24" textAnchor="middle">👒</text>
            <rect x="12" y="46" width="40" height="14" rx="4" fill="#713f12" />
            <text x="32" y="56" fontSize="9" fontWeight="900" fill="#fde047" textAnchor="middle">JAPI</text>
          </g>

          {/* Memory Checklist Badge on Right */}
          <g transform="translate(254, 58)">
            <rect width="44" height="60" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
            <rect x="8" y="8" width="28" height="4" rx="2" fill="#e2e8f0" />
            <circle cx="12" cy="22" r="3" fill="#10b981" />
            <rect x="18" y="20" width="18" height="4" rx="2" fill="#64748b" />
            <circle cx="12" cy="34" r="3" fill="#10b981" />
            <rect x="18" y="32" width="18" height="4" rx="2" fill="#64748b" />
            <circle cx="12" cy="46" r="3" fill="#f59e0b" />
            <rect x="18" y="44" width="14" height="4" rx="2" fill="#cbd5e1" />
          </g>
        </svg>
      );

    /* ══════════════════════════════════════════════════════════════════════
       4. JIGSAW PUZZLE: Interlocking Puzzle Assembly with Scenic Art
       ══════════════════════════════════════════════════════════════════════ */
    case 'jigsaw-puzzle':
      return (
        <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="jpBg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="50%" stopColor="#047857" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="puzzleSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fdba74" />
              <stop offset="100%" stopColor="#86efac" />
            </linearGradient>
            <filter id="puzzleShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="3" dy="6" stdDeviation="5" floodOpacity="0.4" />
            </filter>
          </defs>

          <rect width="320" height="180" rx="16" fill="url(#jpBg)" />

          {/* Puzzle Frame Board */}
          <rect x="36" y="20" width="248" height="140" rx="12" fill="#022c22" stroke="#34d399" strokeWidth="3" />
          
          {/* Internal Scenic Artwork (Kaziranga Sun & Meadows) */}
          <g clipPath="url(#frameClip)">
            <rect x="40" y="24" width="240" height="132" rx="8" fill="url(#puzzleSky)" />
            <circle cx="160" cy="65" r="28" fill="#f97316" opacity="0.9" />
            <circle cx="160" cy="65" r="22" fill="#fde047" />
            {/* Hills */}
            <path d="M40 120 Q110 80 180 115 T280 100 L280 156 L40 156 Z" fill="#047857" />
            <path d="M40 135 Q140 110 240 135 L280 156 L40 156 Z" fill="#15803d" />
            <text x="160" y="135" fontSize="24" textAnchor="middle">🦏</text>
          </g>

          {/* Interlocking Jigsaw Cut Lines (Quadrant grid with tabs) */}
          {/* Horizontal dividing cut with notch */}
          <path d="M40 90 L145 90 C145 80 155 80 160 80 C165 80 175 80 175 90 L280 90" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.75" fill="none" />
          {/* Vertical dividing cut with notch */}
          <path d="M160 24 L160 80 C150 80 150 90 150 95 C150 100 150 110 160 110 L160 156" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.75" fill="none" />

          {/* Lifted Top-Right Piece Being Snapped in Place */}
          <g transform="translate(175, 14) rotate(4 50 40)" filter="url(#puzzleShadow)">
            <rect width="90" height="68" rx="8" fill="#fef08a" stroke="#fbbf24" strokeWidth="3" />
            <circle cx="45" cy="34" r="14" fill="#f59e0b" opacity="0.8" />
            <text x="45" y="40" fontSize="16" fontWeight="900" fill="#78350f" textAnchor="middle">SNAP!</text>
            {/* Golden corner highlight */}
            <circle cx="80" cy="10" r="4" fill="#fbbf24" />
          </g>
        </svg>
      );

    /* ══════════════════════════════════════════════════════════════════════
       5. NUMBER RECALL: Tactile Glowing Numeric Keypad & Digit Span
       ══════════════════════════════════════════════════════════════════════ */
    case 'number-recall':
      return (
        <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="nrBg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#18181b" />
              <stop offset="50%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#3f3f46" />
            </linearGradient>
            <linearGradient id="keyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3f3f46" />
              <stop offset="100%" stopColor="#27272a" />
            </linearGradient>
            <linearGradient id="screenGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#022c22" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>
          </defs>

          <rect width="320" height="180" rx="16" fill="url(#nrBg)" />

          {/* Digit Sequence LCD Screen on Top */}
          <rect x="40" y="16" width="240" height="42" rx="10" fill="url(#screenGrad)" stroke="#10b981" strokeWidth="2" />
          {/* Glowing Green Segmented Digits */}
          <text x="75" y="44" fontSize="22" fontWeight="900" fill="#34d399" fontFamily="monospace" letterSpacing="4">8</text>
          <text x="115" y="44" fontSize="22" fontWeight="900" fill="#34d399" fontFamily="monospace" letterSpacing="4">3</text>
          <text x="155" y="44" fontSize="22" fontWeight="900" fill="#34d399" fontFamily="monospace" letterSpacing="4">6</text>
          <text x="195" y="44" fontSize="22" fontWeight="900" fill="#34d399" fontFamily="monospace" letterSpacing="4">9</text>
          {/* Active Blinking Cursor */}
          <rect x="228" y="24" width="3" height="24" fill="#a7f3d0" />
          <text x="245" y="41" fontSize="11" fontWeight="700" fill="#6ee7b7">FWD</text>

          {/* Tactile Keypad Matrix 3x3 */}
          <g transform="translate(68, 68)">
            {/* Row 1 */}
            <rect x="0" y="0" width="54" height="30" rx="8" fill="url(#keyGrad)" stroke="#52525b" strokeWidth="1.5" />
            <text x="27" y="20" fontSize="15" fontWeight="900" fill="#ffffff" textAnchor="middle">1</text>

            <rect x="65" y="0" width="54" height="30" rx="8" fill="url(#keyGrad)" stroke="#52525b" strokeWidth="1.5" />
            <text x="92" y="20" fontSize="15" fontWeight="900" fill="#ffffff" textAnchor="middle">2</text>

            <rect x="130" y="0" width="54" height="30" rx="8" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
            <text x="157" y="20" fontSize="15" fontWeight="900" fill="#000000" textAnchor="middle">3</text>

            {/* Row 2 */}
            <rect x="0" y="36" width="54" height="30" rx="8" fill="url(#keyGrad)" stroke="#52525b" strokeWidth="1.5" />
            <text x="27" y="56" fontSize="15" fontWeight="900" fill="#ffffff" textAnchor="middle">4</text>

            <rect x="65" y="36" width="54" height="30" rx="8" fill="url(#keyGrad)" stroke="#52525b" strokeWidth="1.5" />
            <text x="92" y="56" fontSize="15" fontWeight="900" fill="#ffffff" textAnchor="middle">5</text>

            <rect x="130" y="36" width="54" height="30" rx="8" fill="url(#keyGrad)" stroke="#52525b" strokeWidth="1.5" />
            <text x="157" y="56" fontSize="15" fontWeight="900" fill="#ffffff" textAnchor="middle">6</text>

            {/* Row 3 */}
            <rect x="0" y="72" width="54" height="30" rx="8" fill="url(#keyGrad)" stroke="#52525b" strokeWidth="1.5" />
            <text x="27" y="92" fontSize="15" fontWeight="900" fill="#ffffff" textAnchor="middle">7</text>

            <rect x="65" y="72" width="54" height="30" rx="8" fill="#10b981" stroke="#34d399" strokeWidth="2" />
            <text x="92" y="92" fontSize="15" fontWeight="900" fill="#ffffff" textAnchor="middle">8</text>

            <rect x="130" y="72" width="54" height="30" rx="8" fill="url(#keyGrad)" stroke="#52525b" strokeWidth="1.5" />
            <text x="157" y="92" fontSize="15" fontWeight="900" fill="#ffffff" textAnchor="middle">9</text>
          </g>
        </svg>
      );

    /* ══════════════════════════════════════════════════════════════════════
       6. WHAT CHANGED?: Spot-the-Difference Scene with Spotlight Halo
       ══════════════════════════════════════════════════════════════════════ */
    case 'what-changed':
      return (
        <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="wcBg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4c1d95" />
              <stop offset="50%" stopColor="#5b21b6" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
            <radialGradient id="spotHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="320" height="180" rx="16" fill="url(#wcBg)" />

          {/* Wooden Display Table */}
          <rect x="24" y="125" width="272" height="16" rx="4" fill="#78350f" stroke="#451a03" strokeWidth="2" />
          <rect x="36" y="141" width="248" height="24" fill="#451a03" opacity="0.8" />

          {/* Item 1: Traditional Diya / Lamp (Unchanged) */}
          <g transform="translate(45, 75)">
            <ellipse cx="24" cy="45" rx="20" ry="8" fill="#d97706" />
            <path d="M12 45 Q24 25 36 45 Z" fill="#b45309" />
            {/* Diya Flame */}
            <path d="M24 20 Q28 32 24 38 Q20 32 24 20 Z" fill="#fbbf24" />
            <circle cx="24" cy="30" r="3" fill="#ffffff" />
          </g>

          {/* Item 2: SPOTLIGHT CHANGED OBJECT (Golden Bell with Pulse Ring) */}
          <g transform="translate(125, 45)">
            {/* Golden Spotlight Halo */}
            <circle cx="35" cy="45" r="42" fill="url(#spotHalo)" />
            <circle cx="35" cy="45" r="32" stroke="#fde047" strokeWidth="3" strokeDasharray="5 3" />
            
            {/* The Bell that changed */}
            <circle cx="35" cy="24" r="5" fill="#f59e0b" />
            <path d="M22 55 C22 36 48 36 48 55 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
            <ellipse cx="35" cy="55" rx="13" ry="5" fill="#f59e0b" />
            <circle cx="35" cy="62" r="3" fill="#b45309" />

            {/* Detective Magnifying Glass Overlay */}
            <circle cx="58" cy="28" r="16" stroke="#ffffff" strokeWidth="3" fill="#38bdf8" fillOpacity="0.2" />
            <path d="M70 40 L82 52" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <text x="35" y="82" fontSize="9" fontWeight="900" fill="#fef08a" textAnchor="middle">CHANGED!</text>
          </g>

          {/* Item 3: Tea Cup (Unchanged) */}
          <g transform="translate(225, 78)">
            <rect x="8" y="20" width="30" height="26" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M38 26 C44 26 44 38 38 38" stroke="#ffffff" strokeWidth="3" fill="none" />
            <path d="M18 14 Q22 6 20 0" stroke="#f1f5f9" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
            <path d="M26 14 Q30 6 28 0" stroke="#f1f5f9" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
          </g>

          {/* Top Comparison Label */}
          <rect x="90" y="12" width="140" height="22" rx="11" fill="#2e1065" stroke="#a855f7" strokeWidth="1" />
          <text x="160" y="27" fontSize="10" fontWeight="800" fill="#f3e8ff" textAnchor="middle" letterSpacing="0.8">
            🔍 SPOT THE DIFFERENCE
          </text>
        </svg>
      );

    /* ══════════════════════════════════════════════════════════════════════
       7. PATTERN RECALL: Matrix Grid of Glowing Luminescent Tiles
       ══════════════════════════════════════════════════════════════════════ */
    case 'pattern-recall':
      return (
        <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="prBg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <filter id="tileCyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="tileAmberGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="320" height="180" rx="16" fill="url(#prBg)" />

          {/* Circuit / Matrix Grid Board (4x3 Grid) */}
          <g transform="translate(68, 20)">
            {/* Row 1 */}
            <rect x="0" y="0" width="40" height="40" rx="8" fill="#38bdf8" filter="url(#tileCyanGlow)" stroke="#ffffff" strokeWidth="2" />
            <rect x="46" y="0" width="40" height="40" rx="8" fill="#334155" stroke="#475569" strokeWidth="1.5" />
            <rect x="92" y="0" width="40" height="40" rx="8" fill="#fbbf24" filter="url(#tileAmberGlow)" stroke="#ffffff" strokeWidth="2" />
            <rect x="138" y="0" width="40" height="40" rx="8" fill="#334155" stroke="#475569" strokeWidth="1.5" />

            {/* Row 2 */}
            <rect x="0" y="46" width="40" height="40" rx="8" fill="#334155" stroke="#475569" strokeWidth="1.5" />
            <rect x="46" y="46" width="40" height="40" rx="8" fill="#38bdf8" filter="url(#tileCyanGlow)" stroke="#ffffff" strokeWidth="2" />
            <rect x="92" y="46" width="40" height="40" rx="8" fill="#334155" stroke="#475569" strokeWidth="1.5" />
            <rect x="138" y="46" width="40" height="40" rx="8" fill="#fbbf24" filter="url(#tileAmberGlow)" stroke="#ffffff" strokeWidth="2" />

            {/* Row 3 */}
            <rect x="0" y="92" width="40" height="40" rx="8" fill="#fbbf24" filter="url(#tileAmberGlow)" stroke="#ffffff" strokeWidth="2" />
            <rect x="46" y="92" width="40" height="40" rx="8" fill="#334155" stroke="#475569" strokeWidth="1.5" />
            <rect x="92" y="92" width="40" height="40" rx="8" fill="#38bdf8" filter="url(#tileCyanGlow)" stroke="#ffffff" strokeWidth="2" />
            <rect x="138" y="92" width="40" height="40" rx="8" fill="#334155" stroke="#475569" strokeWidth="1.5" />
          </g>

          {/* Connecting Neural Pulse Lines */}
          <path d="M88 40 L182 86 L114 132" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" fill="none" />
          <path d="M180 40 L226 86 L88 132" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" fill="none" />

          {/* Status Label on Bottom */}
          <rect x="95" y="152" width="130" height="18" rx="9" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="1" />
          <text x="160" y="165" fontSize="10" fontWeight="900" fill="#38bdf8" textAnchor="middle" letterSpacing="1">
            PATTERN ACTIVE
          </text>
        </svg>
      );

    /* ══════════════════════════════════════════════════════════════════════
       8. ODD ONE OUT: Categorical Sorting with Spotlight on Contrasting Item
       ══════════════════════════════════════════════════════════════════════ */
    case 'odd-one-out':
      return (
        <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="oooBg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <radialGradient id="oddGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#e11d48" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#9f1239" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="320" height="180" rx="16" fill="url(#oooBg)" />

          {/* 4 Pedestals in a Row */}
          {/* Pedestal 1: Green Leaf (Category: Nature) */}
          <g transform="translate(30, 48)">
            <rect width="56" height="74" rx="12" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
            <circle cx="28" cy="32" r="18" fill="#d1fae5" />
            <text x="28" y="38" fontSize="22" textAnchor="middle">🍃</text>
            <text x="28" y="62" fontSize="9" fontWeight="800" fill="#34d399" textAnchor="middle">NATURE</text>
          </g>

          {/* Pedestal 2: Green Tree (Category: Nature) */}
          <g transform="translate(98, 48)">
            <rect width="56" height="74" rx="12" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
            <circle cx="28" cy="32" r="18" fill="#d1fae5" />
            <text x="28" y="38" fontSize="22" textAnchor="middle">🌳</text>
            <text x="28" y="62" fontSize="9" fontWeight="800" fill="#34d399" textAnchor="middle">NATURE</text>
          </g>

          {/* Pedestal 3: Green Flower (Category: Nature) */}
          <g transform="translate(166, 48)">
            <rect width="56" height="74" rx="12" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
            <circle cx="28" cy="32" r="18" fill="#d1fae5" />
            <text x="28" y="38" fontSize="22" textAnchor="middle">🌸</text>
            <text x="28" y="62" fontSize="9" fontWeight="800" fill="#34d399" textAnchor="middle">NATURE</text>
          </g>

          {/* Pedestal 4: ODD ONE OUT - Red Sports Car (Vehicle / Different!) */}
          <g transform="translate(234, 44)">
            <circle cx="28" cy="38" r="32" fill="url(#oddGlow)" />
            <rect width="56" height="82" rx="12" fill="#881337" stroke="#f43f5e" strokeWidth="3" />
            <circle cx="28" cy="34" r="20" fill="#ffe4e6" stroke="#fb7185" strokeWidth="2" />
            <text x="28" y="41" fontSize="24" textAnchor="middle">🚗</text>
            <rect x="6" y="58" width="44" height="16" rx="4" fill="#f43f5e" />
            <text x="28" y="70" fontSize="9" fontWeight="900" fill="#ffffff" textAnchor="middle">ODD ONE!</text>
          </g>

          {/* Top Instruction Pill */}
          <rect x="85" y="14" width="150" height="22" rx="11" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
          <text x="160" y="29" fontSize="10" fontWeight="800" fill="#e2e8f0" textAnchor="middle" letterSpacing="0.6">
            WHICH ONE IS DIFFERENT?
          </text>
        </svg>
      );

    /* ══════════════════════════════════════════════════════════════════════
       9. WHERE AM I?: Indian Heritage Landmark & Brass Compass Rose
       ══════════════════════════════════════════════════════════════════════ */
    case 'where-am-i':
      return (
        <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="waiBg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="50%" stopColor="#0f2b48" />
              <stop offset="100%" stopColor="#0b1b2d" />
            </linearGradient>
            <linearGradient id="goldBrass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>

          <rect width="320" height="180" rx="16" fill="url(#waiBg)" />

          {/* Topographic Contour Lines */}
          <path d="M0 130 C80 90 140 140 220 110 T320 120" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.25" fill="none" />
          <path d="M0 150 C90 110 160 160 250 130 T320 140" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.2" fill="none" />

          {/* Landmark Silhouette (India Gate / Monument Arch) */}
          <g transform="translate(45, 30)">
            <rect x="15" y="45" width="80" height="75" fill="#f59e0b" fillOpacity="0.85" rx="4" />
            {/* Monument Archway */}
            <path d="M35 120 L35 80 C35 68 75 68 75 80 L75 120 Z" fill="#0b1b2d" />
            <rect x="25" y="32" width="60" height="14" fill="#fde047" rx="3" />
            <rect x="35" y="20" width="40" height="12" fill="#d97706" rx="2" />
            <text x="55" y="112" fontSize="22" textAnchor="middle">🇮🇳</text>
          </g>

          {/* Location Pin */}
          <g transform="translate(145, 30)">
            <circle cx="12" cy="14" r="12" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" />
            <path d="M4 18 L12 36 L20 18 Z" fill="#ef4444" />
            <circle cx="12" cy="14" r="5" fill="#ffffff" />
          </g>

          {/* Brass Nautical Compass Rose on Right */}
          <g transform="translate(205, 30)">
            <circle cx="45" cy="55" r="42" fill="#0f172a" stroke="url(#goldBrass)" strokeWidth="3" />
            <circle cx="45" cy="55" r="34" stroke="#fde047" strokeWidth="1" strokeDasharray="3 3" />
            {/* North-South Needle */}
            <path d="M45 22 L51 55 L45 52 L39 55 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
            <path d="M45 88 L51 55 L45 58 L39 55 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
            {/* East-West Points */}
            <path d="M78 55 L45 50 L48 55 L45 60 Z" fill="url(#goldBrass)" />
            <path d="M12 55 L45 50 L42 55 L45 60 Z" fill="url(#goldBrass)" />
            <circle cx="45" cy="55" r="5" fill="#fde047" stroke="#78350f" strokeWidth="1.5" />
            {/* Cardinal Letters */}
            <text x="45" y="18" fontSize="11" fontWeight="900" fill="#f87171" textAnchor="middle">N</text>
            <text x="45" y="102" fontSize="10" fontWeight="900" fill="#94a3b8" textAnchor="middle">S</text>
            <text x="92" y="59" fontSize="10" fontWeight="900" fill="#fde047" textAnchor="middle">E</text>
            <text x="3" y="59" fontSize="10" fontWeight="900" fill="#fde047" textAnchor="middle">W</text>
          </g>
        </svg>
      );

    /* ══════════════════════════════════════════════════════════════════════
       10. BRAIN STORY: Illustrated Storybook with Narrative Parchment & Quill
       ══════════════════════════════════════════════════════════════════════ */
    case 'brain-story':
    default:
      return (
        <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="bsBg" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="50%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <linearGradient id="parchmentGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
            <filter id="bookShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.4" />
            </filter>
          </defs>

          <rect width="320" height="180" rx="16" fill="url(#bsBg)" />

          {/* Open Leather Book Cover */}
          <g transform="translate(35, 20)" filter="url(#bookShadow)">
            <rect width="250" height="140" rx="10" fill="#311505" stroke="#92400e" strokeWidth="3" />
            
            {/* Left Page (Parchment with Character Art) */}
            <path d="M15 8 L122 8 L122 132 L15 132 Z" fill="url(#parchmentGrad)" />
            <circle cx="68" cy="48" r="24" fill="#fed7aa" stroke="#ea580c" strokeWidth="2" />
            <text x="68" y="56" fontSize="28" textAnchor="middle">👵</text>
            <text x="68" y="88" fontSize="10" fontWeight="900" fill="#78350f" textAnchor="middle">DADI’S TALE</text>
            <rect x="28" y="98" width="80" height="4" rx="2" fill="#ca8a04" opacity="0.4" />
            <rect x="36" y="108" width="64" height="4" rx="2" fill="#ca8a04" opacity="0.4" />

            {/* Book Spine Center Crease */}
            <rect x="122" y="8" width="6" height="124" fill="#92400e" opacity="0.6" />

            {/* Right Page (Story Text & Question Mark) */}
            <path d="M128 8 L235 8 L235 132 L128 132 Z" fill="url(#parchmentGrad)" />
            <rect x="142" y="24" width="76" height="6" rx="3" fill="#b45309" opacity="0.6" />
            <rect x="142" y="38" width="76" height="6" rx="3" fill="#b45309" opacity="0.6" />
            <rect x="142" y="52" width="60" height="6" rx="3" fill="#b45309" opacity="0.6" />

            {/* Memory Recall Badge */}
            <g transform="translate(150, 72)">
              <rect width="66" height="42" rx="8" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="2" />
              <text x="33" y="22" fontSize="13" fontWeight="900" fill="#fde047" textAnchor="middle">RECALL?</text>
              <text x="33" y="34" fontSize="8" fontWeight="800" fill="#c4b5fd" textAnchor="middle">WHO / WHAT</text>
            </g>

            {/* Red Silk Ribbon Bookmark */}
            <path d="M123 0 L127 0 L127 95 L125 90 L123 95 Z" fill="#dc2626" />
          </g>
        </svg>
      );
  }
};
