import type { BihuInstrument } from './types';

export const BIHU_INSTRUMENTS: BihuInstrument[] = [
  {
    id: 'pepa',
    names: {
      as: 'ম\'হৰ শিঙৰ পেঁপা (Pepa)',
      bn: 'মহিষের শিংয়ের পেঁপা (Pepa)',
      hi: 'असमिया पेपा (Pepa Horn)',
      en: 'Assamese Pepa (Buffalo Horn Horn)',
    },
    role: 'GO_TARGET',
    icon: '📯',
    regionalOrigin: 'Assam / Brahmaputra Valley',
    description: {
      as: 'বিহুৰ মূল বাদ্য। পেঁপা বাজিলে ঢোলত চাপৰ মাৰক!',
      bn: 'বিহুর মূল বাদ্যযন্ত্র। পেঁপা বাজলে ঢোলে চাপড় দিন!',
      hi: 'बिहू का मुख्य वाद्य। पेपा बजते ही ढोल पर थपकी दें!',
      en: 'Primary Bihu horn. Tap the drum whenever Pepa appears!',
    },
    colorTheme: 'from-amber-600 to-amber-800 border-amber-500',
  },
  {
    id: 'dhol',
    names: {
      as: 'বিহু ঢোল (Bihu Dhol)',
      bn: 'বিহু ঢোল (Bihu Dhol)',
      hi: 'असमिया ढोल (Bihu Dhol)',
      en: 'Bihu Dhol (Wooden Drum)',
    },
    role: 'NO_GO_INHIBIT',
    icon: '🥁',
    regionalOrigin: 'Assam',
    description: {
      as: 'ঢোল বাজিলে ৰওক—টিপিব নালাগে!',
      bn: 'ঢোল বাজলে থামুন—চাপ দেবেন না!',
      hi: 'ढोल आने पर रुकें—दबाएं नहीं!',
      en: 'Bihu Drum. Hold still—do NOT tap!',
    },
    colorTheme: 'from-rose-700 to-rose-900 border-rose-600',
  },
  {
    id: 'gogona',
    names: {
      as: 'বাঁহৰ গগনা (Gogona)',
      bn: 'বাঁশের গগনা (Gogona)',
      hi: 'बांस का गगना (Gogona)',
      en: 'Bamboo Gogona (Jaw Harp)',
    },
    role: 'NO_GO_INHIBIT',
    icon: '🎋',
    regionalOrigin: 'Assam / Bodo Heartland',
    description: {
      as: 'গগনা বাজিলে ৰওক—টিপিব নালাগে!',
      bn: 'গগনা বাজলে শান্ত থাকুন—চাপ দেবেন না!',
      hi: 'गगना आने पर रुकें—दबाएं नहीं!',
      en: 'Bamboo harp. Hold still—do NOT tap!',
    },
    colorTheme: 'from-emerald-700 to-emerald-900 border-emerald-600',
  },
  {
    id: 'tokari',
    names: {
      as: 'টোকৰী (Tokari)',
      bn: 'টোকরী (Tokari)',
      hi: 'टोकरा लोकवाद्य (Tokari)',
      en: 'Tokari (Folk Lute)',
    },
    role: 'NO_GO_INHIBIT',
    icon: '🪕',
    regionalOrigin: 'Assam & Arunachal Foothills',
    description: {
      as: 'টোকৰী বাজিলে ৰওক—টিপিব নালাগে!',
      bn: 'টোকরী বাজলে থামুন—চাপ দেবেন না!',
      hi: 'टोकरा आने पर रुकें—दबाएं नहीं!',
      en: 'Single-string folk lute. Hold still—do NOT tap!',
    },
    colorTheme: 'from-indigo-700 to-indigo-900 border-indigo-600',
  },
  {
    id: 'taal',
    names: {
      as: 'কাঁহৰ তাল (Bhor Taal)',
      bn: 'কাঁসার তাল (Bhor Taal)',
      hi: 'कांस्य ताल (Taal Cymbals)',
      en: 'Bell-Metal Taal (Cymbals)',
    },
    role: 'NO_GO_INHIBIT',
    icon: '🔔',
    regionalOrigin: 'Sarthebari, Barpeta (Assam)',
    description: {
      as: 'তাল বাজিলে ৰওক—টিপিব নালাগে!',
      bn: 'তাল বাজলে শান্ত থাকুন—চাপ দেবেন না!',
      hi: 'ताल बजने पर रुकें—दबाएं नहीं!',
      en: 'Traditional cymbals. Hold still—do NOT tap!',
    },
    colorTheme: 'from-amber-700 to-yellow-900 border-yellow-600',
  }
];
