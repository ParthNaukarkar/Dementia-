import type { SupportedLanguage } from '../../types/prescription';

export interface CatalogItem {
  id: string;
  names: Record<SupportedLanguage, string>;
  icon: string;
  category: 'craft' | 'textile' | 'household' | 'instrument' | 'produce';
  defaultColorBg: string;
  alternateColors: { bg: string; name: Record<SupportedLanguage, string> }[];
}

/**
 * 24 Authentic North-Eastern & Indian Cultural Objects
 * Chosen for high emotional familiarity, nostalgia, and sharp visual distinctiveness.
 */
export const WHAT_CHANGED_CATALOG: CatalogItem[] = [
  {
    id: 'japi',
    names: {
      as: 'বৰ জাপি (Japi)',
      bn: 'জাপি টুপি (Japi)',
      hi: 'पारंपरिक जापी (Japi)',
      en: 'Traditional Japi Hat',
    },
    icon: '👒',
    category: 'craft',
    defaultColorBg: 'bg-amber-100 border-amber-400 text-amber-950',
    alternateColors: [
      { bg: 'bg-rose-100 border-rose-400 text-rose-950', name: { as: 'ৰঙা (Red)', bn: 'লাল (Red)', hi: 'लाल (Red)', en: 'Red' } },
      { bg: 'bg-emerald-100 border-emerald-400 text-emerald-950', name: { as: 'সেউজীয়া (Green)', bn: 'সবুজ (Green)', hi: 'हरा (Green)', en: 'Green' } },
      { bg: 'bg-indigo-100 border-indigo-400 text-indigo-950', name: { as: 'নীলা (Blue)', bn: 'নীল (Blue)', hi: 'नीला (Blue)', en: 'Blue' } },
    ],
  },
  {
    id: 'gamusa',
    names: {
      as: 'ফুলাম গামোচা (Gamusa)',
      bn: 'গামোছা (Gamusa)',
      hi: 'गामोसा (Gamusa)',
      en: 'Assam Gamusa',
    },
    icon: '🧣',
    category: 'textile',
    defaultColorBg: 'bg-rose-100 border-rose-400 text-rose-950',
    alternateColors: [
      { bg: 'bg-sky-100 border-sky-400 text-sky-950', name: { as: 'আকাশী নীলা (Sky)', bn: 'আকাশি (Sky)', hi: 'आसमानी (Sky)', en: 'Sky Blue' } },
      { bg: 'bg-amber-100 border-amber-400 text-amber-950', name: { as: 'হালধীয়া (Yellow)', bn: 'হলুদ (Yellow)', hi: 'पीला (Yellow)', en: 'Yellow' } },
    ],
  },
  {
    id: 'xorai',
    names: {
      as: 'পিতলৰ শৰাই (Xorai)',
      bn: 'পিতলের সরাই (Xorai)',
      hi: 'पीतल की सराई (Xorai)',
      en: 'Brass Xorai Offering Stand',
    },
    icon: '🏆',
    category: 'craft',
    defaultColorBg: 'bg-yellow-100 border-yellow-500 text-yellow-950',
    alternateColors: [
      { bg: 'bg-slate-200 border-slate-400 text-slate-900', name: { as: 'ৰূপালী (Silver)', bn: 'রূপালি (Silver)', hi: 'चांदी (Silver)', en: 'Silver' } },
      { bg: 'bg-orange-100 border-orange-400 text-orange-950', name: { as: 'তামৰ (Copper)', bn: 'তামা (Copper)', hi: 'तांबा (Copper)', en: 'Copper' } },
    ],
  },
  {
    id: 'dhol',
    names: {
      as: 'বিহু ঢোল (Bihu Dhol)',
      bn: 'ঢোল (Dhol)',
      hi: 'बिहू ढोल (Bihu Dhol)',
      en: 'Bihu Dhol Drum',
    },
    icon: '🥁',
    category: 'instrument',
    defaultColorBg: 'bg-orange-100 border-orange-500 text-orange-950',
    alternateColors: [
      { bg: 'bg-purple-100 border-purple-400 text-purple-950', name: { as: 'বেঙুনীয়া (Purple)', bn: 'বেগুনি (Purple)', hi: 'बैंगनी (Purple)', en: 'Purple' } },
      { bg: 'bg-emerald-100 border-emerald-400 text-emerald-950', name: { as: 'সেউজীয়া (Green)', bn: 'সবুজ (Green)', hi: 'हरा (Green)', en: 'Green' } },
    ],
  },
  {
    id: 'pepa',
    names: {
      as: 'ম’হৰ শিঙৰ পেঁপা (Pepa)',
      bn: 'শিং পেঁপা (Pepa)',
      hi: 'पेपा बाजा (Pepa)',
      en: 'Buffalo Horn Pepa',
    },
    icon: '🎺',
    category: 'instrument',
    defaultColorBg: 'bg-stone-200 border-stone-500 text-stone-900',
    alternateColors: [
      { bg: 'bg-amber-100 border-amber-500 text-amber-950', name: { as: 'সোণালী (Golden)', bn: 'সোনালি (Golden)', hi: 'सुनहरा (Golden)', en: 'Golden' } },
    ],
  },
  {
    id: 'tea-cup',
    names: {
      as: 'অসম চাহ কাপ (Assam Tea)',
      bn: 'চা কাপ (Tea Cup)',
      hi: 'चाय का प्याला (Tea Cup)',
      en: 'Clay Tea Cup',
    },
    icon: '🍵',
    category: 'household',
    defaultColorBg: 'bg-emerald-100 border-emerald-500 text-emerald-950',
    alternateColors: [
      { bg: 'bg-rose-100 border-rose-400 text-rose-950', name: { as: 'ৰঙা কাপ (Red)', bn: 'লাল কাপ (Red)', hi: 'लाल प्याला (Red)', en: 'Red' } },
      { bg: 'bg-blue-100 border-blue-400 text-blue-950', name: { as: 'নীলা কাপ (Blue)', bn: 'নীল কাপ (Blue)', hi: 'नीला प्याला (Blue)', en: 'Blue' } },
    ],
  },
  {
    id: 'ketli',
    names: {
      as: 'পিতলৰ কেটলী (Kettle)',
      bn: 'কেটলি (Kettle)',
      hi: 'चाय की केतली (Kettle)',
      en: 'Tea Kettle',
    },
    icon: '🫖',
    category: 'household',
    defaultColorBg: 'bg-cyan-100 border-cyan-500 text-cyan-950',
    alternateColors: [
      { bg: 'bg-amber-100 border-amber-400 text-amber-950', name: { as: 'হালধীয়া (Yellow)', bn: 'হলুদ (Yellow)', hi: 'पीली (Yellow)', en: 'Yellow' } },
      { bg: 'bg-rose-100 border-rose-400 text-rose-950', name: { as: 'ৰঙা (Red)', bn: 'লাল (Red)', hi: 'लाल (Red)', en: 'Red' } },
    ],
  },
  {
    id: 'diya',
    names: {
      as: 'মাটিৰ চাকি (Diya Lamp)',
      bn: 'মাটির প্রদীপ (Diya)',
      hi: 'मिट्टी का दीया (Diya)',
      en: 'Clay Diya Lamp',
    },
    icon: '🪔',
    category: 'craft',
    defaultColorBg: 'bg-amber-100 border-amber-500 text-amber-950',
    alternateColors: [
      { bg: 'bg-indigo-100 border-indigo-400 text-indigo-950', name: { as: 'নীলা চাকি (Blue)', bn: 'নীল প্রদীপ (Blue)', hi: 'नीला दीया (Blue)', en: 'Blue' } },
    ],
  },
  {
    id: 'marigold',
    names: {
      as: 'নাৰ্জী ফুল (Marigold)',
      bn: 'গাঁদা ফুল (Genda)',
      hi: 'गेंदे का फूल (Marigold)',
      en: 'Marigold Blossom',
    },
    icon: '🌼',
    category: 'produce',
    defaultColorBg: 'bg-yellow-100 border-yellow-400 text-yellow-950',
    alternateColors: [
      { bg: 'bg-orange-100 border-orange-400 text-orange-950', name: { as: 'কমলা ফুল (Orange)', bn: 'কমলা ফুল (Orange)', hi: 'नारंगी फूल (Orange)', en: 'Orange' } },
      { bg: 'bg-rose-100 border-rose-400 text-rose-950', name: { as: 'ৰঙা ফুল (Red)', bn: 'লাল ফুল (Red)', hi: 'लाल फूल (Red)', en: 'Red' } },
    ],
  },
  {
    id: 'mango',
    names: {
      as: 'মালভোগ আম (Mango)',
      bn: 'মিষ্টি আম (Mango)',
      hi: 'मीठा आम (Mango)',
      en: 'Ripe Mango',
    },
    icon: '🥭',
    category: 'produce',
    defaultColorBg: 'bg-amber-100 border-amber-400 text-amber-950',
    alternateColors: [
      { bg: 'bg-emerald-100 border-emerald-400 text-emerald-950', name: { as: 'কেঁচা সেউজীয়া (Green)', bn: 'কাঁচা সবুজ (Green)', hi: 'कच्चा हरा (Green)', en: 'Green' } },
    ],
  },
  {
    id: 'orange',
    names: {
      as: 'ডাম্বুক সুমথিৰা (Orange)',
      bn: 'কমলা লেবু (Orange)',
      hi: 'दाम्बुक संतरा (Orange)',
      en: 'Sweet Orange',
    },
    icon: '🍊',
    category: 'produce',
    defaultColorBg: 'bg-orange-100 border-orange-400 text-orange-950',
    alternateColors: [
      { bg: 'bg-yellow-100 border-yellow-400 text-yellow-950', name: { as: 'হালধীয়া (Yellow)', bn: 'হলুদ (Yellow)', hi: 'पीला (Yellow)', en: 'Yellow' } },
    ],
  },
  {
    id: 'kalash',
    names: {
      as: 'পিতলৰ ঘট (Kalash)',
      bn: 'পিতলের ঘট (Kalash)',
      hi: 'पीतल का कलश (Kalash)',
      en: 'Brass Kalash Vessel',
    },
    icon: '🏺',
    category: 'craft',
    defaultColorBg: 'bg-amber-100 border-amber-500 text-amber-950',
    alternateColors: [
      { bg: 'bg-stone-200 border-stone-400 text-stone-900', name: { as: 'মাটিৰ ঘট (Clay)', bn: 'মাটির ঘট (Clay)', hi: 'मिट्टी का कलश (Clay)', en: 'Clay' } },
    ],
  },
  {
    id: 'bell',
    names: {
      as: 'পূজাৰ ঘণ্টা (Puja Bell)',
      bn: 'পূজার ঘণ্টা (Puja Bell)',
      hi: 'पूजा की घंटी (Puja Bell)',
      en: 'Brass Temple Bell',
    },
    icon: '🔔',
    category: 'household',
    defaultColorBg: 'bg-yellow-100 border-yellow-500 text-yellow-950',
    alternateColors: [
      { bg: 'bg-slate-200 border-slate-400 text-slate-900', name: { as: 'ৰূপালী ঘণ্টা (Silver)', bn: 'রূপালি ঘণ্টা (Silver)', hi: 'चांदी की घंटी (Silver)', en: 'Silver' } },
    ],
  },
  {
    id: 'conch',
    names: {
      as: 'পবিত্ৰ শংখ (Conch)',
      bn: 'পবিত্র শাঁখ (Conch)',
      hi: 'पवित्र शंख (Conch)',
      en: 'Sacred Shankha Shell',
    },
    icon: '🐚',
    category: 'craft',
    defaultColorBg: 'bg-slate-100 border-slate-300 text-slate-900',
    alternateColors: [
      { bg: 'bg-amber-100 border-amber-300 text-amber-950', name: { as: 'সোণালী শংখ (Golden)', bn: 'সোনালি শাঁখ (Golden)', hi: 'सुनहरा शंख (Golden)', en: 'Golden' } },
    ],
  },
  {
    id: 'bamboo-fan',
    names: {
      as: 'বাঁহৰ বিচনী (Hand Fan)',
      bn: 'হাতের পাখা (Hand Fan)',
      hi: 'बांस का पंखा (Hand Fan)',
      en: 'Bamboo Hand Fan',
    },
    icon: '🪭',
    category: 'craft',
    defaultColorBg: 'bg-lime-100 border-lime-500 text-lime-950',
    alternateColors: [
      { bg: 'bg-rose-100 border-rose-400 text-rose-950', name: { as: 'ৰঙা বিচনী (Red)', bn: 'লাল পাখা (Red)', hi: 'लाल पंखा (Red)', en: 'Red' } },
    ],
  },
  {
    id: 'flute',
    names: {
      as: 'বাঁহী (Bamboo Flute)',
      bn: 'বাঁশি (Flute)',
      hi: 'बांसुरी (Flute)',
      en: 'Bamboo Flute',
    },
    icon: '🪈',
    category: 'instrument',
    defaultColorBg: 'bg-emerald-100 border-emerald-400 text-emerald-950',
    alternateColors: [
      { bg: 'bg-amber-100 border-amber-400 text-amber-950', name: { as: 'হালধীয়া বাঁহী (Yellow)', bn: 'হলুদ বাঁশি (Yellow)', hi: 'पीली बांसुरी (Yellow)', en: 'Yellow' } },
    ],
  },
  {
    id: 'clock',
    names: {
      as: 'পুৰণি ঘড়ী (Wall Clock)',
      bn: 'প্রাচীন দেয়াল ঘড়ি (Clock)',
      hi: 'दीवार घड़ी (Clock)',
      en: 'Classic Wall Clock',
    },
    icon: '🕰️',
    category: 'household',
    defaultColorBg: 'bg-blue-100 border-blue-400 text-blue-950',
    alternateColors: [
      { bg: 'bg-rose-100 border-rose-400 text-rose-950', name: { as: 'ৰঙা ঘড়ী (Red)', bn: 'লাল ঘড়ি (Red)', hi: 'लाल घड़ी (Red)', en: 'Red' } },
      { bg: 'bg-emerald-100 border-emerald-400 text-emerald-950', name: { as: 'সেউজীয়া ঘড়ী (Green)', bn: 'সবুজ ঘড়ি (Green)', hi: 'हरी घड़ी (Green)', en: 'Green' } },
    ],
  },
  {
    id: 'spectacles',
    names: {
      as: 'আইতাৰ চশমা (Glasses)',
      bn: 'চশমা (Glasses)',
      hi: 'चश्मा (Glasses)',
      en: 'Reading Spectacles',
    },
    icon: '👓',
    category: 'household',
    defaultColorBg: 'bg-indigo-100 border-indigo-400 text-indigo-950',
    alternateColors: [
      { bg: 'bg-amber-100 border-amber-400 text-amber-950', name: { as: 'সোণালী ফ্ৰেম (Gold)', bn: 'সোনালি ফ্রেম (Gold)', hi: 'सुनहरा फ्रेम (Gold)', en: 'Gold' } },
    ],
  },
  {
    id: 'lotus',
    names: {
      as: 'পদুম ফুল (Pink Lotus)',
      bn: 'পদ্ম ফুল (Lotus)',
      hi: 'कमल का फूल (Lotus)',
      en: 'Sacred Lotus',
    },
    icon: '🪷',
    category: 'produce',
    defaultColorBg: 'bg-pink-100 border-pink-400 text-pink-950',
    alternateColors: [
      { bg: 'bg-sky-100 border-sky-400 text-sky-950', name: { as: 'নীলা পদুম (Blue)', bn: 'নীল পদ্ম (Blue)', hi: 'नीलकमल (Blue)', en: 'Blue' } },
      { bg: 'bg-slate-100 border-slate-300 text-slate-900', name: { as: 'বগা পদুম (White)', bn: 'শ্বেত পদ্ম (White)', hi: 'श्वेत कमल (White)', en: 'White' } },
    ],
  },
  {
    id: 'paan',
    names: {
      as: 'তামোল-পাণ (Tamul Paan)',
      bn: 'পান-সুপারি (Paan)',
      hi: 'पान-सुपारी (Paan)',
      en: 'Assam Betel Leaf',
    },
    icon: '🍃',
    category: 'produce',
    defaultColorBg: 'bg-emerald-100 border-emerald-500 text-emerald-950',
    alternateColors: [
      { bg: 'bg-amber-100 border-amber-400 text-amber-950', name: { as: 'শুকান পাণ (Yellow)', bn: 'শুকনো পান (Yellow)', hi: 'सूखा पत्ता (Yellow)', en: 'Yellow' } },
    ],
  },
  {
    id: 'mala',
    names: {
      as: 'জপমালা (Prayer Beads)',
      bn: 'জপমালা (Prayer Beads)',
      hi: 'रुद्राक्ष माला (Mala)',
      en: 'Rudraksha Mala',
    },
    icon: '📿',
    category: 'craft',
    defaultColorBg: 'bg-stone-200 border-stone-500 text-stone-900',
    alternateColors: [
      { bg: 'bg-rose-100 border-rose-400 text-rose-950', name: { as: 'ৰঙা মালা (Red)', bn: 'লাল মালা (Red)', hi: 'लाल माला (Red)', en: 'Red' } },
    ],
  },
  {
    id: 'brass-lock',
    names: {
      as: 'পিতলৰ তলা (Antique Lock)',
      bn: 'পিতলের তালা (Brass Lock)',
      hi: 'पीतल का ताला (Lock)',
      en: 'Antique Brass Lock',
    },
    icon: '🔒',
    category: 'household',
    defaultColorBg: 'bg-amber-100 border-amber-500 text-amber-950',
    alternateColors: [
      { bg: 'bg-slate-200 border-slate-500 text-slate-900', name: { as: 'লোহাৰ তলা (Iron)', bn: 'লোহার তালা (Iron)', hi: 'लोहे का ताला (Iron)', en: 'Iron' } },
    ],
  },
  {
    id: 'umbrella',
    names: {
      as: 'ক’লা ছাতি (Black Umbrella)',
      bn: 'কালো ছাতা (Umbrella)',
      hi: 'काला छाता (Umbrella)',
      en: 'Walking Umbrella',
    },
    icon: '☂️',
    category: 'household',
    defaultColorBg: 'bg-slate-200 border-slate-500 text-slate-900',
    alternateColors: [
      { bg: 'bg-blue-100 border-blue-500 text-blue-950', name: { as: 'নীলা ছাতি (Blue)', bn: 'নীল ছাতা (Blue)', hi: 'नीला छाता (Blue)', en: 'Blue' } },
      { bg: 'bg-rose-100 border-rose-500 text-rose-950', name: { as: 'ৰঙা ছাতি (Red)', bn: 'লাল ছাতা (Red)', hi: 'लाल छाता (Red)', en: 'Red' } },
    ],
  },
  {
    id: 'book',
    names: {
      as: 'পুৰণি কিতাপ (Vintage Book)',
      bn: 'পুরোনো বই (Book)',
      hi: 'पुरानी किताब (Book)',
      en: 'Classic Book',
    },
    icon: '📖',
    category: 'household',
    defaultColorBg: 'bg-amber-100 border-amber-400 text-amber-950',
    alternateColors: [
      { bg: 'bg-emerald-100 border-emerald-400 text-emerald-950', name: { as: 'সেউজীয়া কিতাপ (Green)', bn: 'সবুজ বই (Green)', hi: 'हरी किताब (Green)', en: 'Green' } },
      { bg: 'bg-indigo-100 border-indigo-400 text-indigo-950', name: { as: 'নীলা কিতাপ (Blue)', bn: 'নীল বই (Blue)', hi: 'नीली किताब (Blue)', en: 'Blue' } },
    ],
  },
];
