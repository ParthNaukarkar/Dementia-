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
      <rect width="400" height="400" fill="url(#skyGrad1)" />
      <path d="M0,260 Q100,180 200,240 T400,220 L400,400 L0,400 Z" fill="#065f46" opacity="0.6" />
      <path d="M0,290 Q120,240 240,280 T400,270 L400,400 L0,400 Z" fill="#047857" opacity="0.8" />
      <rect y="310" width="400" height="90" fill="url(#grassGrad)" />
      <circle cx="200" cy="110" r="46" fill="#f97316" opacity="0.85" />
      <circle cx="200" cy="110" r="38" fill="#fde047" />
      <path d="M80,290 C80,240 120,220 180,220 C240,220 280,240 290,270 C310,250 340,245 355,270 C365,285 360,315 340,325 C320,335 300,320 285,325 L285,360 L255,360 L255,325 L190,325 L190,360 L160,360 L160,325 L120,325 C100,325 80,310 80,290 Z" fill="url(#rhinoBody)" stroke="#1e293b" stroke-width="4" />
      <path d="M340,255 L358,225 L350,265 Z" fill="#e2e8f0" stroke="#0f172a" stroke-width="3" />
      <circle cx="320" cy="270" r="5" fill="#0f172a" />
      <circle cx="321" cy="269" r="1.5" fill="#ffffff" />
      <path d="M150,230 Q160,280 150,320" stroke="#334155" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M230,230 Q240,280 230,320" stroke="#334155" stroke-width="5" fill="none" stroke-linecap="round" />
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
      <rect width="400" height="400" fill="#1c1917" />
      <circle cx="200" cy="200" r="160" fill="#f59e0b" opacity="0.15" />
      <path d="M60,350 C100,320 300,320 340,350 L360,400 L40,400 Z" fill="url(#gamusaPattern)" stroke="#b91c1c" stroke-width="3" />
      <circle cx="200" cy="365" r="14" fill="#dc2626" />
      <circle cx="160" cy="365" r="8" fill="#dc2626" />
      <circle cx="240" cy="365" r="8" fill="#dc2626" />
      <path d="M140,340 L260,340 L240,310 L160,310 Z" fill="url(#xoraiGlow)" stroke="#451a03" stroke-width="3" />
      <rect x="180" y="220" width="40" height="90" rx="6" fill="url(#xoraiGlow)" stroke="#451a03" stroke-width="3" />
      <ellipse cx="200" cy="265" rx="28" ry="10" fill="#fde047" stroke="#78350f" stroke-width="2" />
      <ellipse cx="200" cy="220" rx="140" ry="32" fill="url(#xoraiGlow)" stroke="#451a03" stroke-width="4" />
      <ellipse cx="200" cy="216" rx="125" ry="22" fill="#fef08a" opacity="0.7" />
      <path d="M170,215 Q200,185 220,215 Z" fill="#15803d" stroke="#14532d" stroke-width="2" />
      <circle cx="200" cy="210" r="10" fill="#a16207" stroke="#713f12" stroke-width="2" />
      <path d="M120,200 Q200,90 280,200 Z" fill="url(#xoraiGlow)" stroke="#451a03" stroke-width="4" />
      <ellipse cx="200" cy="200" rx="80" ry="16" fill="#fef08a" opacity="0.5" />
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
      <rect width="400" height="400" fill="#18181b" />
      <circle cx="200" cy="200" r="170" fill="#dc2626" opacity="0.12" />
      <path d="M80,80 Q180,120 300,280 Q320,310 340,320 L310,340 Q290,320 270,270 Q160,140 70,100 Z" fill="#1c1917" stroke="#d97706" stroke-width="3" />
      <circle cx="330" cy="330" r="22" fill="#d97706" stroke="#451a03" stroke-width="3" />
      <circle cx="330" cy="330" r="14" fill="#1c1917" />
      <path d="M100,160 C90,230 90,290 100,320 L280,320 C290,290 290,230 280,160 Z" fill="url(#drumWood)" stroke="#431407" stroke-width="5" />
      <ellipse cx="100" cy="240" rx="20" ry="76" fill="url(#drumHead)" stroke="#431407" stroke-width="4" />
      <ellipse cx="280" cy="240" rx="20" ry="76" fill="url(#drumHead)" stroke="#431407" stroke-width="4" />
      <polyline points="100,170 190,315 280,170 190,170 100,310 190,170 280,310" stroke="#fef08a" stroke-width="3" fill="none" stroke-linejoin="round" />
      <line x1="100" y1="240" x2="280" y2="240" stroke="#dc2626" stroke-width="4" stroke-dasharray="8,6" />
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
      <rect width="400" height="400" fill="url(#teaSky)" />
      <circle cx="310" cy="90" r="42" fill="#facc15" opacity="0.9" />
      <circle cx="310" cy="90" r="32" fill="#ffffff" opacity="0.8" />
      <polygon points="0,210 90,140 190,200 290,130 400,220 400,400 0,400" fill="#0284c7" opacity="0.4" />
      <path d="M0,260 Q120,200 240,250 T400,230 L400,400 L0,400 Z" fill="#15803d" />
      <path d="M0,300 Q150,240 300,290 T400,280 L400,400 L0,400 Z" fill="#16a34a" />
      <path d="M0,340 Q130,290 280,330 T400,320 L400,400 L0,400 Z" fill="#22c55e" />
      <rect x="90" y="220" width="10" height="50" fill="#78350f" />
      <circle cx="95" cy="210" r="32" fill="#14532d" />
      <rect x="290" y="240" width="8" height="40" fill="#78350f" />
      <circle cx="294" cy="230" r="26" fill="#14532d" />
      <path d="M50,380 Q70,340 100,360 Q70,390 50,380 Z" fill="#86efac" stroke="#15803d" stroke-width="2" />
      <path d="M120,385 Q145,345 170,365 Q140,395 120,385 Z" fill="#4ade80" stroke="#15803d" stroke-width="2" />
    </svg>`,
  },
  {
    id: 'majuli-mask',
    titles: {
      as: 'মাজুলীৰ সত্ৰীয়া মুখা',
      bn: 'মাজুলীর সত্রীয় মুখোশ',
      hi: 'माजुली का पारंपरिक मुखौटा',
      en: 'Majuli Sacred Monastery Mask',
    },
    subtitles: {
      as: 'ভাওনা আৰু পৌৰাণিক কৃষ্টি',
      bn: 'ভাওনা ও পৌরাণিক ঐতিহ্য',
      hi: 'असमिया सांस्कृतिक विरासत',
      en: 'Sacred Folk Theater of Assam',
    },
    category: 'craft',
    themeColor: '#8b5cf6',
    bgGradient: 'from-purple-900 via-indigo-950 to-slate-900',
    svgArt: `<svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="maskSkin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="60%" stop-color="#0284c7" />
          <stop offset="100%" stop-color="#0369a1" />
        </linearGradient>
        <radialGradient id="crownGold" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fde047" />
          <stop offset="70%" stop-color="#eab308" />
          <stop offset="100%" stop-color="#854d0e" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill="#0f172a" />
      <circle cx="200" cy="200" r="170" fill="#8b5cf6" opacity="0.15" />
      <!-- Ornate Vaishnavite Crown (Kirit) -->
      <polygon points="120,150 140,60 170,120 200,30 230,120 260,60 280,150" fill="url(#crownGold)" stroke="#713f12" stroke-width="4" />
      <circle cx="200" cy="40" r="10" fill="#dc2626" />
      <circle cx="140" cy="70" r="7" fill="#dc2626" />
      <circle cx="260" cy="70" r="7" fill="#dc2626" />
      <!-- Divine Face Outline (Garuda/Krishna) -->
      <path d="M130,150 C100,210 100,270 140,320 C170,350 230,350 260,320 C300,270 300,210 270,150 Z" fill="url(#maskSkin)" stroke="#0c4a6e" stroke-width="5" />
      <!-- Dramatic Painted Eyes (Bhaona Style) -->
      <ellipse cx="160" cy="220" rx="26" ry="14" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      <circle cx="162" cy="220" r="8" fill="#0f172a" />
      <ellipse cx="240" cy="220" rx="26" ry="14" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      <circle cx="238" cy="220" r="8" fill="#0f172a" />
      <!-- Eyebrows with High Arches -->
      <path d="M130,200 Q160,185 190,210" stroke="#0f172a" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M270,200 Q240,185 210,210" stroke="#0f172a" stroke-width="6" fill="none" stroke-linecap="round" />
      <!-- Sacred Chandan Tilak -->
      <path d="M195,140 L205,140 L205,210 L195,210 Z" fill="#ffffff" />
      <circle cx="200" cy="180" r="5" fill="#dc2626" />
      <!-- Golden Curved Beak / Nose -->
      <path d="M190,210 L210,210 L204,265 L196,265 Z" fill="#fde047" stroke="#854d0e" stroke-width="2" />
      <!-- Smiling Crimson Lip Line -->
      <path d="M160,285 Q200,315 240,285" stroke="#dc2626" stroke-width="8" fill="none" stroke-linecap="round" />
    </svg>`,
  },
  {
    id: 'brahmaputra-sunset',
    titles: {
      as: 'ব্ৰহ্মপুত্ৰৰ বুকুত গধূলি',
      bn: 'ব্রহ্মপুত্রের বুকে সন্ধ্যা',
      hi: 'ब्रह्मपुत्र पर संध्या',
      en: 'Brahmaputra River Twilight',
    },
    subtitles: {
      as: 'শান্ত পানী আৰু মাছমৰীয়া নাও',
      bn: 'শান্ত জল ও জেলেদের নৌকা',
      hi: 'शांत जल और नाव',
      en: 'Calm Waters and Wooden Boat',
    },
    category: 'nature',
    themeColor: '#ea580c',
    bgGradient: 'from-amber-900 via-orange-950 to-slate-900',
    svgArt: `<svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="riverSunset" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#4c1d95" />
          <stop offset="35%" stop-color="#c2410c" />
          <stop offset="65%" stop-color="#f97316" />
          <stop offset="100%" stop-color="#fbbf24" />
        </linearGradient>
        <linearGradient id="waterFlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#b45309" />
          <stop offset="40%" stop-color="#78350f" />
          <stop offset="100%" stop-color="#1e1b4b" />
        </linearGradient>
      </defs>
      <rect width="400" height="230" fill="url(#riverSunset)" />
      <!-- Golden Giant Setting Sun -->
      <circle cx="200" cy="170" r="55" fill="#fef08a" />
      <circle cx="200" cy="170" r="48" fill="#fde047" opacity="0.9" />
      <!-- Water Surface -->
      <rect y="230" width="400" height="170" fill="url(#waterFlow)" />
      <!-- Shimmering Golden Sun Reflections -->
      <line x1="160" y1="245" x2="240" y2="245" stroke="#fef08a" stroke-width="4" opacity="0.8" />
      <line x1="140" y1="260" x2="260" y2="260" stroke="#fde047" stroke-width="3" opacity="0.7" />
      <line x1="170" y1="275" x2="230" y2="275" stroke="#fde047" stroke-width="3" opacity="0.6" />
      <line x1="180" y1="290" x2="220" y2="290" stroke="#fbbf24" stroke-width="2" opacity="0.5" />
      <!-- Traditional Fisherman Wooden Boat (Naaw) Silhouette -->
      <path d="M90,300 C150,300 240,300 310,290 C290,325 120,325 90,300 Z" fill="#0f172a" />
      <!-- Boat Shelter Canopy -->
      <path d="M160,290 Q200,250 240,290 Z" fill="#1e293b" stroke="#0f172a" stroke-width="2" />
      <!-- Oar / Pole -->
      <line x1="130" y1="260" x2="270" y2="345" stroke="#0f172a" stroke-width="4" stroke-linecap="round" />
      <!-- Flying Birds Returning Home -->
      <path d="M70,80 Q80,70 90,80 Q100,70 110,80" stroke="#fef3c7" stroke-width="3" fill="none" />
      <path d="M120,105 Q128,95 136,105 Q144,95 152,105" stroke="#fef3c7" stroke-width="2.5" fill="none" />
      <path d="M280,75 Q290,65 300,75 Q310,65 320,75" stroke="#fef3c7" stroke-width="3" fill="none" />
    </svg>`,
  },
  {
    id: 'colorful-jaapi',
    titles: {
      as: 'ৰঙীন অসমীয়া জাপি',
      bn: 'রঙিন আসামের জাপি',
      hi: 'पारंपरिक रंगीन जापी',
      en: 'Conical Assam Jaapi Hat',
    },
    subtitles: {
      as: 'বাঁহ, বেত আৰু ৰঙীন কাপোৰৰ শিল্প',
      bn: 'বাঁশ, বেত ও রঙিন কাপড়ের শিল্প',
      hi: 'बांस, बेंत और रंगीन वस्त्र का शिल्प',
      en: 'Woven Bamboo & Red Velvet Artwork',
    },
    category: 'craft',
    themeColor: '#e11d48',
    bgGradient: 'from-rose-900 via-pink-950 to-slate-900',
    svgArt: `<svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="jaapiCone" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="60%" stop-color="#facc15" />
          <stop offset="100%" stop-color="#ca8a04" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill="#1e1b4b" />
      <circle cx="200" cy="200" r="170" fill="#e11d48" opacity="0.15" />
      <!-- Circular Wide Brim -->
      <circle cx="200" cy="200" r="150" fill="url(#jaapiCone)" stroke="#713f12" stroke-width="5" />
      <!-- Woven Bamboo Concentric Rings -->
      <circle cx="200" cy="200" r="120" stroke="#a16207" stroke-width="3" fill="none" stroke-dasharray="6,4" />
      <circle cx="200" cy="200" r="90" stroke="#a16207" stroke-width="3" fill="none" stroke-dasharray="6,4" />
      <circle cx="200" cy="200" r="55" stroke="#a16207" stroke-width="3" fill="none" />
      <!-- Red & Green Velvet Ornament Petals (Characteristic Jaapi Motif) -->
      <path d="M200,55 L215,90 L185,90 Z" fill="#dc2626" />
      <path d="M200,345 L215,310 L185,310 Z" fill="#dc2626" />
      <path d="M55,200 L90,215 L90,185 Z" fill="#dc2626" />
      <path d="M345,200 L310,215 L310,185 Z" fill="#dc2626" />
      <circle cx="120" cy="120" r="14" fill="#16a34a" />
      <circle cx="280" cy="120" r="14" fill="#16a34a" />
      <circle cx="120" cy="280" r="14" fill="#16a34a" />
      <circle cx="280" cy="280" r="14" fill="#16a34a" />
      <!-- Central Apex Cone -->
      <circle cx="200" cy="200" r="32" fill="#dc2626" stroke="#450a0a" stroke-width="3" />
      <circle cx="200" cy="200" r="16" fill="#fde047" stroke="#713f12" stroke-width="2" />
      <circle cx="200" cy="200" r="6" fill="#15803d" />
    </svg>`,
  },
  {
    id: 'golden-muga-silk',
    titles: {
      as: 'সোণালী মুগা ৰেচম আৰু তাঁতশাল',
      bn: 'সোনালী মুগা রেশম ও তাঁত',
      hi: 'स्वर्ण मूगा रेशम और हथकरघा',
      en: 'Golden Muga Silk & Handloom',
    },
    subtitles: {
      as: 'সুৱালকুচিৰ বিশ্ববিখ্যাত হস্তশিল্প',
      bn: 'শুয়ালকুচির বিশ্ববিখ্যাত হস্তশিল্প',
      hi: 'असम का अनूठा प्राकृतिक स्वर्ण रेशम',
      en: 'Rare Wild Golden Silk of Sualkuchi',
    },
    category: 'craft',
    themeColor: '#ca8a04',
    bgGradient: 'from-amber-800 via-yellow-950 to-slate-900',
    svgArt: `<svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="silkGleam" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="30%" stop-color="#fde047" />
          <stop offset="70%" stop-color="#ca8a04" />
          <stop offset="100%" stop-color="#854d0e" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="#292524" />
      <!-- Flowing Woven Sador Fabric -->
      <path d="M40,60 C120,40 280,100 360,60 L360,340 C280,380 120,320 40,340 Z" fill="url(#silkGleam)" stroke="#713f12" stroke-width="4" />
      <!-- Intricate Floral Pari Motif Border (Red & Black thread) -->
      <rect x="50" y="270" width="300" height="50" fill="#dc2626" rx="4" />
      <polygon points="70,295 85,275 100,295 85,315" fill="#fde047" />
      <polygon points="120,295 135,275 150,295 135,315" fill="#fde047" />
      <polygon points="170,295 185,275 200,295 185,315" fill="#fde047" />
      <polygon points="220,295 235,275 250,295 235,315" fill="#fde047" />
      <polygon points="270,295 285,275 300,295 285,315" fill="#fde047" />
      <polygon points="320,295 335,275 350,295 335,315" fill="#fde047" />
      <!-- Golden Silk Moth Silhouette in Center -->
      <path d="M200,160 Q150,110 110,130 Q130,180 190,170 Z" fill="#854d0e" />
      <path d="M200,160 Q250,110 290,130 Q270,180 210,170 Z" fill="#854d0e" />
      <ellipse cx="200" cy="165" rx="8" ry="24" fill="#451a03" />
      <circle cx="200" cy="140" r="8" fill="#451a03" />
    </svg>`,
  },
];
