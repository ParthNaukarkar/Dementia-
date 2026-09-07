import type { BazaarItem } from './types';

/**
 * Culturally Authentic North Eastern Region (NER) Bazaar Items
 * Grounded in local heritage to stimulate emotional resonance & reminiscence in dementia patients.
 */
export const BAZAAR_CATALOG: BazaarItem[] = [
  {
    id: 'assam-tea',
    names: {
      as: 'অসম চাহ (Assam Saah)',
      bn: 'আসাম চা (Assam Cha)',
      hi: 'असम चाय (Assam Chai)',
      en: 'Assam Tea Pack',
    },
    category: 'beverage',
    icon: '🍵',
    colorBg: 'bg-emerald-100 border-emerald-400 text-emerald-950',
    regionOrigin: 'Assam',
  },
  {
    id: 'japi-hat',
    names: {
      as: 'বৰ জাপি (Assamese Japi)',
      bn: 'জাপি টুপি (Japi Hat)',
      hi: 'जापी टोपी (Japi Hat)',
      en: 'Traditional Japi Hat',
    },
    category: 'craft',
    icon: '👒',
    colorBg: 'bg-amber-100 border-amber-400 text-amber-950',
    regionOrigin: 'Assam',
  },
  {
    id: 'gamusa',
    names: {
      as: 'ফুলম গামোচা (Gamusa)',
      bn: 'গামোছা (Gamocha)',
      hi: 'गामोसा (Gamusa)',
      en: 'Assam Gamusa Towel',
    },
    category: 'textile',
    icon: '🧣',
    colorBg: 'bg-rose-100 border-rose-400 text-rose-950',
    regionOrigin: 'Assam',
  },
  {
    id: 'dambuk-orange',
    names: {
      as: 'ডাম্বুক সুমথিৰা (Dambuk Orange)',
      bn: 'কমলা লেবু (Dambuk Orange)',
      hi: 'दाम्बुक संतरा (Dambuk Orange)',
      en: 'Dambuk Sweet Orange',
    },
    category: 'produce',
    icon: '🍊',
    colorBg: 'bg-orange-100 border-orange-400 text-orange-950',
    regionOrigin: 'Arunachal Pradesh',
  },
  {
    id: 'naga-shawl',
    names: {
      as: 'নগা চাদৰ (Naga Shawl)',
      bn: 'নাগা শাল (Naga Shawl)',
      hi: 'नागा शॉल (Naga Shawl)',
      en: 'Naga Warrior Shawl',
    },
    category: 'textile',
    icon: '👘',
    colorBg: 'bg-red-100 border-red-400 text-red-950',
    regionOrigin: 'Nagaland',
  },
  {
    id: 'bamboo-basket',
    names: {
      as: 'বাঁহৰ খৰাহী (Bamboo Basket)',
      bn: 'বাঁশের ঝুড়ি (Bamboo Basket)',
      hi: 'बांस की टोकरी (Bamboo Basket)',
      en: 'Cane Bamboo Basket',
    },
    category: 'craft',
    icon: '🧺',
    colorBg: 'bg-amber-100 border-amber-500 text-amber-950',
    regionOrigin: 'Meghalaya / Tripura',
  },
  {
    id: 'mizo-puan',
    names: {
      as: 'মিজো পুয়ান (Mizo Puan)',
      bn: 'মিজো পুয়ান (Mizo Puan)',
      hi: 'मिज़ो पुआन (Mizo Puan)',
      en: 'Mizo Handloom Puan',
    },
    category: 'textile',
    icon: '🧵',
    colorBg: 'bg-indigo-100 border-indigo-400 text-indigo-950',
    regionOrigin: 'Mizoram',
  },
  {
    id: 'king-chilli',
    names: {
      as: 'ভোট জলকীয়া (Bhut Jolokia)',
      bn: 'বোম্বাই মরিচ (Bhut Jolokia)',
      hi: 'भूत जोलोकिया (King Chilli)',
      en: 'Bhut Jolokia (King Chilli)',
    },
    category: 'produce',
    icon: '🌶️',
    colorBg: 'bg-red-100 border-red-500 text-red-950',
    regionOrigin: 'Assam / Nagaland',
  },
];
