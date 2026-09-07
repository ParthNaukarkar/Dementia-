import type { SupportedLanguage } from '../../types/prescription';

export interface HeritageSymbol {
  pairKey: string;
  symbol: string;
  names: Record<SupportedLanguage, string>;
  culturalSignificance: Record<SupportedLanguage, string>;
}

export const MEMORY_HERITAGE_ITEMS: HeritageSymbol[] = [
  {
    pairKey: 'rhino',
    symbol: '🦏',
    names: {
      as: 'এশিঙীয়া গঁড়',
      bn: 'একশৃঙ্গ গণ্ডার',
      hi: 'एक सींग वाला गैंडा',
      en: 'One-Horned Rhino',
    },
    culturalSignificance: {
      as: 'কাজিৰঙাৰ গৌৰৱ আৰু অসমৰ প্ৰতীক',
      bn: 'কাজিরাঙ্গার গর্ব ও আসামের প্রতীক',
      hi: 'काजीरंगा का गौरव एवं असम का राज्य प्रतीक',
      en: 'Pride of Kaziranga and official state symbol of Assam',
    },
  },
  {
    pairKey: 'japi',
    symbol: '👒',
    names: {
      as: 'অসমীয়া জাপি',
      bn: 'আসামি জাপি',
      hi: 'पारंपरिक जापी',
      en: 'Assamese Japi',
    },
    culturalSignificance: {
      as: 'সন্মান আৰু ঐতিহ্যৰ টুপী',
      bn: 'সম্মান ও ঐতিহ্যের টুপি',
      hi: 'सम्मान और असमिया लोक संस्कृति का प्रतीक',
      en: 'Conical woven hat symbolizing respect and hospitality',
    },
  },
  {
    pairKey: 'dhol',
    symbol: '🥁',
    names: {
      as: 'বিহু ঢোল',
      bn: 'বিহু ঢোল',
      hi: 'बिहू ढोल',
      en: 'Bihu Dhol',
    },
    culturalSignificance: {
      as: 'ৰঙালী বিহুৰ প্ৰধান বাদ্য',
      bn: 'রঙ্গালী বিহুর প্রধান বাদ্যযন্ত্র',
      hi: 'रोंगाली बिहू का मुख्य वाद्य यंत्र',
      en: 'Two-sided drum driving the energetic rhythm of Rongali Bihu',
    },
  },
  {
    pairKey: 'pepa',
    symbol: '📯',
    names: {
      as: 'মহৰ শিঙৰ পেঁপা',
      bn: 'মহিষের শিংয়ের পেঁপা',
      hi: 'पेपा तुरही',
      en: 'Pepa Horn',
    },
    culturalSignificance: {
      as: 'ম’হৰ শিঙেৰে নিৰ্মিত মোহনীয় বাঁহী',
      bn: 'মহিষের শিং দিয়ে তৈরি বাঁশি',
      hi: 'भैंस के सींग से बनी सुरीली तुरही',
      en: 'Transverse flute crafted from buffalo horn',
    },
  },
  {
    pairKey: 'lotus',
    symbol: '🪷',
    names: {
      as: 'কামাখ্যাৰ পদুম',
      bn: 'কামাখ্যার পদ্ম',
      hi: 'पवित्र कमल',
      en: 'Sacred Lotus',
    },
    culturalSignificance: {
      as: 'শক্তিপীঠ কামাখ্যাৰ পৱিত্ৰ পূজাৰ ফুল',
      bn: 'শক্তিপীঠ কামাখ্যার পবিত্র পূজার ফুল',
      hi: 'कामाख्या धाम का पवित्र पुष्प',
      en: 'Sacred flower offered at Kamakhya Temple',
    },
  },
  {
    pairKey: 'tea',
    symbol: '🍃',
    names: {
      as: 'অসম চাহ পাত',
      bn: 'আসাম চা পাতা',
      hi: 'असम चाय पत्ती',
      en: 'Assam Tea Leaves',
    },
    culturalSignificance: {
      as: 'সোণালী সুবাসিত অসম চাহ',
      bn: 'সুবাসিত আসাম চা',
      hi: 'विश्व प्रसिद्ध असम की चाय पत्तियां',
      en: 'World-famous orthodox and CTC golden tea leaves',
    },
  },
  {
    pairKey: 'gamosa',
    symbol: '🧣',
    names: {
      as: 'ফুলাম গামোচা',
      bn: 'আসামি গামোছা',
      hi: 'फुलाम गमोसा',
      en: 'Phulam Gamosa',
    },
    culturalSignificance: {
      as: 'মৰম আৰু শ্ৰদ্ধাৰ বগা-ৰঙা কাপোৰ',
      bn: 'ভালোবাসা ও শ্রদ্ধার প্রতীক',
      hi: 'असमिया आदर और सत्कार का प्रतीक वस्त्र',
      en: 'White and red woven textile symbolizing love and reverence',
    },
  },
  {
    pairKey: 'soraai',
    symbol: '🏆',
    names: {
      as: 'পিতলৰ শৰাই',
      bn: 'পিতলের সরাই',
      hi: 'पीतल की शराई',
      en: 'Brass Xorai',
    },
    culturalSignificance: {
      as: 'তামোল-পাণ আগবঢ়োৱা পৱিত্ৰ পাত্ৰ',
      bn: 'শ্রদ্ধা নিবেদনের পবিত্র পিতলের পাত্র',
      hi: 'पूजा एवं आदर सत्कार का पारंपरिक पात्र',
      en: 'Traditional raised bell-metal offering tray',
    },
  },
  {
    pairKey: 'muga_silk',
    symbol: '🧵',
    names: {
      as: 'সোণালী মুগা সূতা',
      bn: 'সোনালী মুগা রেশম',
      hi: 'सुनहरा मूंगा रेशम',
      en: 'Golden Muga Silk',
    },
    culturalSignificance: {
      as: 'কেৱল অসমত পোৱা সোণালী ৰেশম',
      bn: 'আসামের বিখ্যাত সোনালী সিল্ক',
      hi: 'असम का अनूठा प्राकृतिक सुनहरा रेशम',
      en: 'Endemic golden wild silk unique to Brahmaputra valley',
    },
  },
  {
    pairKey: 'diya',
    symbol: '🪔',
    names: {
      as: 'মাটিৰ চাকি',
      bn: 'মাটির প্রদীপ',
      hi: 'मिट्टी का दीया',
      en: 'Earthen Lamp (Chaki)',
    },
    culturalSignificance: {
      as: 'কাতি বিহু আৰু নামঘৰৰ পৱিত্ৰ পোহৰ',
      bn: 'কাতি বিহু ও প্রার্থনার আলো',
      hi: 'काती बिहू और प्रार्थना का पवित्र दीप',
      en: 'Sacred clay oil lamp illuminating Kati Bihu and Namghars',
    },
  },
  {
    pairKey: 'boat',
    symbol: '🛶',
    names: {
      as: 'ব্ৰহ্মপুত্ৰৰ নাও',
      bn: 'ব্রহ্মপুত্রের নৌকা',
      hi: 'ब्रह्मपुत्र की नाव',
      en: 'Brahmaputra Boat',
    },
    culturalSignificance: {
      as: 'মাজুলী আৰু লুইতৰ জীৱনৰেখা',
      bn: 'মাজুলী ও নদীকেন্দ্রিক জীবনের প্রতীক',
      hi: 'माजुली द्वीप और नदी तट की जीवन रेखा',
      en: 'Traditional wooden canoe navigating the Brahmaputra',
    },
  },
  {
    pairKey: 'horn_bill',
    symbol: '🦜',
    names: {
      as: 'ধনেশ পক্ষী',
      bn: 'ধনেশ পাখি',
      hi: 'धनेश पक्षी (हॉर्नबिल)',
      en: 'Great Indian Hornbill',
    },
    culturalSignificance: {
      as: 'উত্তৰ-পূৰ্বাঞ্চলৰ পৱিত্ৰ অৰণ্য পক্ষী',
      bn: 'উত্তর-পূর্ব ভারতের পবিত্র বনের পাখি',
      hi: 'पूर्वोत्तर भारत का राजसी वन्य पक्षी',
      en: 'Majestic bird venerated across the Northeast forests',
    },
  },
  {
    pairKey: 'tokari',
    symbol: '🪕',
    names: {
      as: 'টোকাৰী গীতাৰ',
      bn: 'টোকারী বাদ্য',
      hi: 'तोकारी लोक वाद्य',
      en: 'Tokari Folk Lute',
    },
    culturalSignificance: {
      as: 'নাম-কীৰ্তন আৰু আধ্যাত্মিক গীতৰ বাদ্য',
      bn: 'আধ্যাত্মিক গানের তারের বাদ্যযন্ত্র',
      hi: 'भक्ति संगीत और लोकगीतों का तार वाद्य',
      en: 'Single or four-string plucked lute used in spiritual folk songs',
    },
  },
  {
    pairKey: 'bamboo',
    symbol: '🎋',
    names: {
      as: 'জাঁতি বাঁহ',
      bn: 'জাতি বাঁশ',
      hi: 'असमिया बांस',
      en: 'Assam Bamboo',
    },
    culturalSignificance: {
      as: 'অসমীয়া গৃহ নিৰ্মাণ আৰু হস্তশিল্পৰ প্ৰাণ',
      bn: 'গ্রামীণ কুটিরশিল্পের প্রাণ',
      hi: 'हस्तशिल्प और ग्रामीण जीवन का मुख्य आधार',
      en: 'Core sustainable material of traditional Assamese handicrafts',
    },
  },
  {
    pairKey: 'fish',
    symbol: '🐟',
    names: {
      as: 'চিতল মাছ',
      bn: 'চিতল মাছ',
      hi: 'चीतल मछली',
      en: 'Chital River Fish',
    },
    culturalSignificance: {
      as: 'লুইতৰ নদী উপত্যকাৰ খাদ্য সংস্কৃতি',
      bn: 'নদীমাতৃক সংস্কৃতির প্রিয় খাদ্য',
      hi: 'नदी तट की समृद्ध खाद्य संस्कृति',
      en: 'Prized freshwater fish celebrating riverine harvest culture',
    },
  },
  {
    pairKey: 'pitha',
    symbol: '🥞',
    names: {
      as: 'তিল পিঠা',
      bn: 'তিল পিঠে',
      hi: 'तिल पीठा',
      en: 'Til Pitha Sweet',
    },
    culturalSignificance: {
      as: 'মাঘ বিহুৰ পৰম্পৰাগত সুস্বাদু পিঠা',
      bn: 'মাঘ বিহুর ঐতিহ্যবাহী মিষ্টি',
      hi: 'माघ बिहू का पारंपरिक तिल गुड़ व्यंजन',
      en: 'Crispy rice flour roll with sesame and jaggery filling',
    },
  },
];
