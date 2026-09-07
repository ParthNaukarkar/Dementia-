import type { SequenceItem } from './types';

export const SEQUENCE_ITEMS: SequenceItem[] = [
  {
    id: 'dhol',
    names: {
      as: 'ঢোল (Dhol)',
      bn: 'ঢোল (Dhol)',
      hi: 'ढोल (Dhol)',
      en: 'Drum (Dhol)'
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
      as: 'জাপি (Japi)',
      bn: 'জাপি (Japi)',
      hi: 'जापी (Japi)',
      en: 'Sun Hat (Japi)'
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
      as: 'পেঁপা (Pepa)',
      bn: 'পেঁপা (Pepa)',
      hi: 'पेंपा (Pepa)',
      en: 'Horn (Pepa)'
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
      as: 'শৰাই (Xorai)',
      bn: 'শরাই (Xorai)',
      hi: 'शराई (Xorai)',
      en: 'Bell-metal Vessel (Xorai)'
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
      as: 'টকা (Toka)',
      bn: 'টকা (Toka)',
      hi: 'टोका (Toka)',
      en: 'Bamboo Clapper (Toka)'
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
      as: 'বাঁহী (Bansuri)',
      bn: 'বাঁশি (Bansuri)',
      hi: 'बांसुरी (Bansuri)',
      en: 'Flute (Bansuri)'
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
      as: 'পদ্ম (Kamal)',
      bn: 'পদ্ম (Kamal)',
      hi: 'कमल (Kamal)',
      en: 'Lotus Flower'
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
      as: 'চাকি (Diya)',
      bn: 'প্রদীপ (Diya)',
      hi: 'दीया (Diya)',
      en: 'Oil Lamp (Diya)'
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
