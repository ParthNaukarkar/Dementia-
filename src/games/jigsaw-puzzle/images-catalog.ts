import type { PuzzleImage } from './types';

export const PUZZLE_IMAGES: PuzzleImage[] = [
  {
    id: 'kaziranga-rhino',
    titles: {
      as: 'কাজিৰঙাৰ এশিঙীয়া গঁড়',
      bn: 'কাজিরাঙ্গার একশৃঙ্গ গণ্ডার',
      hi: 'काजीरंगा का एक सींग वाला गैंडा',
      en: 'Kaziranga One-Horned Rhino',
    },
    subtitles: {
      as: 'অসমৰ গৌৰৱ আৰু বন্যপ্ৰাণ',
      bn: 'আসামের গর্ব ও বন্যপ্রাণী',
      hi: 'असम का गौरव व वन्यजीव',
      en: 'Pride of Assam Wildlife',
    },
    category: 'nature',
    themeColor: '#059669',
    bgGradient: 'from-emerald-800 via-teal-900 to-slate-900',
    svgArt: `<svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skyGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fdba74" />
          <stop offset="50%" stop-color="#fef08a" />
          <stop offset="100%" stop-color="#86efac" />
        </linearGradient>
        <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#4ade80" />
          <stop offset="100%" stop-color="#15803d" />
        </linearGradient>
        <linearGradient id="rhinoBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#64748b" />
          <stop offset="50%" stop-color="#475569" />
          <stop offset="100%" stop-color="#334155" />
        </linearGradient>
      </defs>
      <!-- Background Sky -->
      <rect width="400" height="400" fill="url(#skyGrad1)" />
      <!-- Distant Hills -->
      <path d="M0,260 Q100,180 200,240 T400,220 L400,400 L0,400 Z" fill="#065f46" opacity="0.6" />
      <path d="M0,290 Q120,240 240,280 T400,270 L400,400 L0,400 Z" fill="#047857" opacity="0.8" />
      <!-- Lush Kaziranga Elephant Grass Foreground -->
      <rect y="310" width="400" height="90" fill="url(#grassGrad)" />
      <!-- Sun -->
      <circle cx="200" cy="110" r="46" fill="#f97316" opacity="0.85" />
      <circle cx="200" cy="110" r="38" fill="#fde047" />
      <!-- Rhino Body -->
      <path d="M80,290 C80,240 120,220 180,220 C240,220 280,240 290,270 C310,250 340,245 355,270 C365,285 360,315 340,325 C320,335 300,320 285,325 L285,360 L255,360 L255,325 L190,325 L190,360 L160,360 L160,325 L120,325 C100,325 80,310 80,290 Z" fill="url(#rhinoBody)" stroke="#1e293b" stroke-width="4" />
      <!-- Rhino Horn -->
      <path d="M340,255 L358,225 L350,265 Z" fill="#e2e8f0" stroke="#0f172a" stroke-width="3" />
      <!-- Rhino Eye -->
      <circle cx="320" cy="270" r="5" fill="#0f172a" />
      <circle cx="321" cy="269" r="1.5" fill="#ffffff" />
      <!-- Armor Skin Plates Fold -->
      <path d="M150,230 Q160,280 150,320" stroke="#334155" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M230,230 Q240,280 230,320" stroke="#334155" stroke-width="5" fill="none" stroke-linecap="round" />
      <!-- River Water Reflections -->
      <path d="M20,370 Q60,365 100,370" stroke="#93c5fd" stroke-width="4" stroke-linecap="round" fill="none" />
      <path d="M280,375 Q320,370 360,375" stroke="#93c5fd" stroke-width="4" stroke-linecap="round" fill="none" />
    </svg>`,
  },
  {
    id: 'brass-xorai',
    titles: {
      as: 'ঐতিহ্যমণ্ডিত কাঁহৰ শৰাই',
      bn: 'ঐতিহ্যবাহী কাঁসার সরাই',
      hi: 'पारंपरिक पीतल का सराई',
      en: 'Traditional Brass Xorai',
    },
    subtitles: {
      as: 'শ্ৰদ্ধা আৰু সন্মানৰ প্ৰতীক',
      bn: 'শ্রদ্ধা ও সম্মানের প্রতীক',
      hi: 'सम्मान और श्रद्धा का प्रतीक',
      en: 'Assamese Symbol of Reverence',
    },
    category: 'craft',
    themeColor: '#d97706',
    bgGradient: 'from-amber-800 via-amber-950 to-slate-900',
    svgArt: `<svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="xoraiGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="60%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#78350f" />
        </radialGradient>
        <linearGradient id="gamusaPattern" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="20%" stop-color="#ffffff" />
          <stop offset="50%" stop-color="#dc2626" />
          <stop offset="80%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#ffffff" />
        </linearGradient>
      </defs>
      <!-- Background Sacred Temple Wall -->
      <rect width="400" height="400" fill="#1c1917" />
      <!-- Soft Sacred Aura -->
      <circle cx="200" cy="200" r="160" fill="#f59e0b" opacity="0.15" />
      <!-- Draped Gamusa Base -->
      <path d="M60,350 C100,320 300,320 340,350 L360,400 L40,400 Z" fill="url(#gamusaPattern)" stroke="#b91c1c" stroke-width="3" />
      <!-- Gamusa Red Floral Embroidery Motif -->
      <circle cx="200" cy="365" r="14" fill="#dc2626" />
      <circle cx="160" cy="365" r="8" fill="#dc2626" />
      <circle cx="240" cy="365" r="8" fill="#dc2626" />
      <!-- Xorai Base Pedestal -->
      <path d="M140,340 L260,340 L240,310 L160,310 Z" fill="url(#xoraiGlow)" stroke="#451a03" stroke-width="3" />
      <!-- Central Pillar Column -->
      <rect x="180" y="220" width="40" height="90" rx="6" fill="url(#xoraiGlow)" stroke="#451a03" stroke-width="3" />
      <ellipse cx="200" cy="265" rx="28" ry="10" fill="#fde047" stroke="#78350f" stroke-width="2" />
      <!-- Broad Offering Tray -->
      <ellipse cx="200" cy="220" rx="140" ry="32" fill="url(#xoraiGlow)" stroke="#451a03" stroke-width="4" />
      <ellipse cx="200" cy="216" rx="125" ry="22" fill="#fef08a" opacity="0.7" />
      <!-- Tamul-Paan Offering (Betel leaf & Areca Nut) -->
      <path d="M170,215 Q200,185 220,215 Z" fill="#15803d" stroke="#14532d" stroke-width="2" />
      <circle cx="200" cy="210" r="10" fill="#a16207" stroke="#713f12" stroke-width="2" />
      <!-- Xorai Conical Lid (Mukut / Top) -->
      <path d="M120,200 Q200,90 280,200 Z" fill="url(#xoraiGlow)" stroke="#451a03" stroke-width="4" />
      <ellipse cx="200" cy="200" rx="80" ry="16" fill="#fef08a" opacity="0.5" />
      <!-- Ornamental Top Finial Pin -->
      <path d="M195,100 L205,100 L202,50 L198,50 Z" fill="#fde047" stroke="#451a03" stroke-width="2" />
      <circle cx="200" cy="45" r="8" fill="#fde047" stroke="#451a03" stroke-width="2" />
    </svg>`,
  },
  {
    id: 'bihu-dhol',
    titles: {
      as: 'ৰঙালী বিহুৰ ঢোল আৰু পেঁপা',
      bn: 'রঙালি বিহুর ঢোল ও পেঁপা',
      hi: 'रोंगाली बिहू ढोल और पेपा',
      en: 'Rongali Bihu Dhol & Pepa',
    },
    subtitles: {
      as: 'বসন্তৰ উৎসৱ আৰু আনন্দৰ ধ্বনি',
      bn: 'বসন্তের উৎসব ও আনন্দের সুর',
      hi: 'वसंत उत्सव और आनंद की ध्वनि',
      en: 'Spring Festival Rhythms',
    },
    category: 'heritage',
    themeColor: '#dc2626',
    bgGradient: 'from-rose-900 via-red-950 to-slate-900',
    svgArt: `<svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="drumWood" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#9a3412" />
          <stop offset="35%" stop-color="#ea580c" />
          <stop offset="65%" stop-color="#c2410c" />
          <stop offset="100%" stop-color="#7c2d12" />
        </linearGradient>
        <radialGradient id="drumHead" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fef3c7" />
          <stop offset="80%" stop-color="#d97706" />
          <stop offset="100%" stop-color="#78350f" />
        </radialGradient>
      </defs>
      <!-- Background Festivity Glow -->
      <rect width="400" height="400" fill="#18181b" />
      <circle cx="200" cy="200" r="170" fill="#dc2626" opacity="0.12" />
      <!-- Pepa Buffalo Horn Musical Instrument (Diagonal) -->
      <path d="M80,80 Q180,120 300,280 Q320,310 340,320 L310,340 Q290,320 270,270 Q160,140 70,100 Z" fill="#1c1917" stroke="#d97706" stroke-width="3" />
      <circle cx="330" cy="330" r="22" fill="#d97706" stroke="#451a03" stroke-width="3" />
      <circle cx="330" cy="330" r="14" fill="#1c1917" />
      <!-- Dhol Barrel Body -->
      <path d="M100,160 C90,230 90,290 100,320 L280,320 C290,290 290,230 280,160 Z" fill="url(#drumWood)" stroke="#431407" stroke-width="5" />
      <!-- Drum Leather Heads (Right & Left) -->
      <ellipse cx="100" cy="240" rx="20" ry="76" fill="url(#drumHead)" stroke="#431407" stroke-width="4" />
      <ellipse cx="280" cy="240" rx="20" ry="76" fill="url(#drumHead)" stroke="#431407" stroke-width="4" />
      <!-- Zigzag Leather Tension Cords -->
      <polyline points="100,170 190,315 280,170 190,170 100,310 190,170 280,310" stroke="#fef08a" stroke-width="3" fill="none" stroke-linejoin="round" />
      <line x1="100" y1="240" x2="280" y2="240" stroke="#dc2626" stroke-width="4" stroke-dasharray="8,6" />
      <!-- Beating Sticks (Doliya) -->
      <line x1="60" y1="130" x2="160" y2="220" stroke="#fef08a" stroke-width="7" stroke-linecap="round" />
      <line x1="320" y1="130" x2="230" y2="220" stroke="#fef08a" stroke-width="7" stroke-linecap="round" />
    </svg>`,
  },
  {
    id: 'assam-tea',
    titles: {
      as: 'সেউজীয়া চাহ বাগিচা',
      bn: 'সবুজ চা বাগান',
      hi: 'हरा-भरा चाय बागान',
      en: 'Lush Assam Tea Terraces',
    },
    subtitles: {
      as: 'পুৱাৰ ৰূপালী ৰ’দ আৰু সুবাস',
      bn: 'সকালের রোদ্দুর ও মিষ্টি সুবাস',
      hi: 'सुबह की धूप और ताज़ा महक',
      en: 'Morning Sun over Tea Canopies',
    },
    category: 'nature',
    themeColor: '#16a34a',
    bgGradient: 'from-green-900 via-emerald-950 to-slate-900',
    svgArt: `<svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="teaSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="45%" stop-color="#bae6fd" />
          <stop offset="100%" stop-color="#fef08a" />
        </linearGradient>
      </defs>
      <!-- Clear Morning Sky -->
      <rect width="400" height="400" fill="url(#teaSky)" />
      <!-- Radiant Golden Sun -->
      <circle cx="310" cy="90" r="42" fill="#facc15" opacity="0.9" />
      <circle cx="310" cy="90" r="32" fill="#ffffff" opacity="0.8" />
      <!-- Distant Blue Ridge Mountains -->
      <polygon points="0,210 90,140 190,200 290,130 400,220 400,400 0,400" fill="#0284c7" opacity="0.4" />
      <!-- Stepped Tea Plantation Hills -->
      <path d="M0,260 Q120,200 240,250 T400,230 L400,400 L0,400 Z" fill="#15803d" />
      <path d="M0,300 Q150,240 300,290 T400,280 L400,400 L0,400 Z" fill="#16a34a" />
      <path d="M0,340 Q130,290 280,330 T400,320 L400,400 L0,400 Z" fill="#22c55e" />
      <!-- Shade Trees -->
      <rect x="90" y="220" width="10" height="50" fill="#78350f" />
      <circle cx="95" cy="210" r="32" fill="#14532d" />
      <rect x="290" y="240" width="8" height="40" fill="#78350f" />
      <circle cx="294" cy="230" r="26" fill="#14532d" />
      <!-- Fresh Tea Leaves Foreground -->
      <path d="M50,380 Q70,340 100,360 Q70,390 50,380 Z" fill="#86efac" stroke="#15803d" stroke-width="2" />
      <path d="M120,385 Q145,345 170,365 Q140,395 120,385 Z" fill="#4ade80" stroke="#15803d" stroke-width="2" />
    </svg>`,
  },
];
