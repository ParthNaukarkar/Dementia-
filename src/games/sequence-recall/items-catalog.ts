import type { SequenceItem } from './types';

export const SEQUENCE_ITEMS: SequenceItem[] = [
  {
    id: 'dhol',
    names: {
      as: 'ঢোলক (Dholak)',
      bn: 'ঢোলক (Dholak)',
      hi: 'ढोलक (Dholak)',
      en: 'Folk Drum (Dholak)'
    },
    category: 'instrument',
    color: 'text-amber-700',
    bgGradient: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-400',
    activeRingColor: 'ring-amber-500 shadow-amber-200',
    audioPitchHz: 261.63, // C4
    iconName: 'drum'
  },
  {
    id: 'japi',
    names: {
      as: 'পাগুৰী (Pagri)',
      bn: 'পাগড়ি (Pagri)',
      hi: 'पगड़ी (Pagri)',
      en: 'Heritage Turban (Pagri)'
    },
    category: 'cultural',
    color: 'text-yellow-700',
    bgGradient: 'from-yellow-50 to-amber-50',
    borderColor: 'border-yellow-400',
    activeRingColor: 'ring-yellow-500 shadow-yellow-200',
    audioPitchHz: 293.66, // D4
    iconName: 'hat'
  },
  {
    id: 'pepa',
    names: {
      as: 'পৱিত্ৰ শংখ (Shankha)',
      bn: 'পবিত্র শাঁখ (Shankha)',
      hi: 'पावन शंख (Shankha)',
      en: 'Sacred Conch (Shankha)'
    },
    category: 'instrument',
    color: 'text-rose-700',
    bgGradient: 'from-rose-50 to-red-50',
    borderColor: 'border-rose-400',
    activeRingColor: 'ring-rose-500 shadow-rose-200',
    audioPitchHz: 329.63, // E4
    iconName: 'horn'
  },
  {
    id: 'xorai',
    names: {
      as: 'পিতলৰ ঘণ্টা (Temple Bell)',
      bn: 'মন্দিরের ঘণ্টা (Temple Bell)',
      hi: 'मंदिर की घंटी (Temple Bell)',
      en: 'Temple Bronze Bell'
    },
    category: 'cultural',
    color: 'text-purple-700',
    bgGradient: 'from-purple-50 to-indigo-50',
    borderColor: 'border-purple-400',
    activeRingColor: 'ring-purple-500 shadow-purple-200',
    audioPitchHz: 392.00, // G4
    iconName: 'bell'
  },
  {
    id: 'toka',
    names: {
      as: 'মঞ্জিৰা (Manjira)',
      bn: 'করতাল (Kartal)',
      hi: 'मंजीरा (Manjira)',
      en: 'Folk Cymbals (Manjira)'
    },
    category: 'instrument',
    color: 'text-emerald-700',
    bgGradient: 'from-emerald-50 to-teal-50',
    borderColor: 'border-emerald-400',
    activeRingColor: 'ring-emerald-500 shadow-emerald-200',
    audioPitchHz: 440.00, // A4
    iconName: 'clapper'
  },
  {
    id: 'bansuri',
    names: {
      as: 'সুৰীয়া বাঁহী (Bansuri)',
      bn: 'মধুর বাঁশি (Bansuri)',
      hi: 'मधुर बांसुरी (Bansuri)',
      en: 'Classical Flute (Bansuri)'
    },
    category: 'instrument',
    color: 'text-sky-700',
    bgGradient: 'from-sky-50 to-blue-50',
    borderColor: 'border-sky-400',
    activeRingColor: 'ring-sky-500 shadow-sky-200',
    audioPitchHz: 523.25, // C5
    iconName: 'flute'
  },
  {
    id: 'kamal',
    names: {
      as: 'পৱিত্ৰ পদুম (Lotus)',
      bn: 'পবিত্র পদ্ম (Lotus)',
      hi: 'पवित्र कमल (Lotus)',
      en: 'Sacred Lotus'
    },
    category: 'nature',
    color: 'text-pink-700',
    bgGradient: 'from-pink-50 to-rose-50',
    borderColor: 'border-pink-400',
    activeRingColor: 'ring-pink-500 shadow-pink-200',
    audioPitchHz: 587.33, // D5
    iconName: 'lotus'
  },
  {
    id: 'diya',
    names: {
      as: 'মাটিৰ চাকি (Diya)',
      bn: 'মাটির প্রদীপ (Diya)',
      hi: 'पावन दीया (Diya)',
      en: 'Earthen Lamp (Diya)'
    },
    category: 'cultural',
    color: 'text-orange-700',
    bgGradient: 'from-orange-50 to-amber-50',
    borderColor: 'border-orange-400',
    activeRingColor: 'ring-orange-500 shadow-orange-200',
    audioPitchHz: 659.25, // E5
    iconName: 'lamp'
  }
];

export const getItemById = (id: string): SequenceItem | undefined => {
  return SEQUENCE_ITEMS.find(item => item.id === id);
};
