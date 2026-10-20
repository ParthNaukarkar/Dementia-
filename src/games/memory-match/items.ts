export interface HeritageSymbol {
  pairKey: string;
  symbol: string;
  names: Record<string, string>;
  culturalSignificance: Record<string, string>;
}

export const MEMORY_HERITAGE_ITEMS: HeritageSymbol[] = [
  {
    pairKey: 'peacock',
    symbol: '🦚',
    names: {
      as: 'ৰাষ্ট্ৰীয় পক্ষী ময়ূৰ',
      bn: 'জাতীয় পাখি ময়ূর',
      hi: 'राष्ट्रीय पक्षी मयूर',
      en: 'Royal Indian Peacock',
    },
    culturalSignificance: {
      as: 'ভাৰতৰ ৰাষ্ট্ৰীয় পক্ষী আৰু সৌন্দৰ্য্যৰ প্ৰতীক',
      bn: 'ভারতের জাতীয় পাখি ও রাজকীয় সৌন্দর্যের প্রতীক',
      hi: 'भारत का राष्ट्रीय पक्षी एवं प्राकृतिक सौंदर्य का प्रतीक',
      en: 'National bird of India symbolizing grace, beauty, and monsoon joy',
    },
  },
  {
    pairKey: 'lotus',
    symbol: '🪷',
    names: {
      as: 'পৱিত্ৰ পদুম ফুল',
      bn: 'পবিত্র পদ্ম ফুল',
      hi: 'पवित्र कमल पुष्प',
      en: 'Sacred Lotus',
    },
    culturalSignificance: {
      as: 'পৱিত্ৰতা আৰু আধ্যাত্মিক সাধনাৰ প্ৰতীক',
      bn: 'পবিত্রতা ও আধ্যাত্মিক চেতনার প্রতীক',
      hi: 'पवित्रता, शांति और भारतीय संस्कृति का राष्ट्रीय पुष्प',
      en: 'Sacred national flower symbolizing purity and divine illumination',
    },
  },
  {
    pairKey: 'diya',
    symbol: '🪔',
    names: {
      as: 'মাটিৰ পৱিত্ৰ চাকি',
      bn: 'মাটির শুভ প্রদীপ',
      hi: 'मिट्टी का पावन दीया',
      en: 'Earthen Diya Lamp',
    },
    culturalSignificance: {
      as: 'উৎসৱ আৰু সন্ধিয়াৰ প্ৰাৰ্থনাৰ পৱিত্ৰ পোহৰ',
      bn: 'সন্ধ্যা আরতি ও শুভ উৎসবের পবিত্র আলো',
      hi: 'दीपोत्सव, प्रार्थना और अंधकार पर प्रकाश की विजय का प्रतीक',
      en: 'Traditional clay lamp illuminating homes during evening prayer and festivals',
    },
  },
  {
    pairKey: 'elephant',
    symbol: '🐘',
    names: {
      as: 'ঐতিহ্যমণ্ডিত হাতী',
      bn: 'ঐতিহাসিক রাজকীয় হাতি',
      hi: 'राजसी भारतीय हाथी (गजराज)',
      en: 'Royal Indian Elephant',
    },
    culturalSignificance: {
      as: 'শক্তি, শুভকামনা আৰু ঐতিহ্যৰ মৰ্যাদাপূৰ্ণ প্ৰতীক',
      bn: 'শক্তি, শুভলক্ষণ ও ঐতিহাসিক রাজকীয়তার প্রতীক',
      hi: 'शक्ति, बुद्धि और भारतीय परंपराओं में शुभता का प्रतीक',
      en: 'Venerated across India as an auspicious symbol of wisdom and majesty',
    },
  },
  {
    pairKey: 'mango',
    symbol: '🥭',
    names: {
      as: 'সুস্বাদু পকা আম',
      bn: 'সুস্বাদু পাকা আম',
      hi: 'रसीला भारतीय आम',
      en: 'Alphonso Mango',
    },
    culturalSignificance: {
      as: 'ফলৰ ৰজা আৰু গৰমৰ দিনৰ আনন্দদায়ক স্মৃতি',
      bn: 'ফলের রাজা এবং গ্রামীণ গ্রীষ্মের মধুর স্মৃতি',
      hi: 'फलों का राजा और भारतीय गर्मियों की मीठी स्मृतियां',
      en: 'King of fruits cherished across India for its golden sweetness',
    },
  },
  {
    pairKey: 'chai',
    symbol: '☕',
    names: {
      as: 'মছলাদাৰ গৰম চাহ',
      bn: 'সুগন্ধি মশলা চা',
      hi: 'कुल्हड़ मसाला चाय',
      en: 'Spiced Masala Chai',
    },
    culturalSignificance: {
      as: 'অতিথিশালা আৰু পুৱাৰ আন্তৰিক আপ্যায়নৰ প্ৰতীক',
      bn: 'আতিথেয়তা ও সকালের আড্ডার প্রাণ',
      hi: 'भारतीय आतिथ्य और घर-घर में सुबह की ताज़गी का प्रतीक',
      en: 'Heart of Indian hospitality brewed with cardamom, ginger, and love',
    },
  },
  {
    pairKey: 'bansuri',
    symbol: '🪈',
    names: {
      as: 'সুৰীয়া বাঁহী',
      bn: 'মধুর সুরের বাঁশি',
      hi: 'मधुर बांसुरी',
      en: 'Classical Flute (Bansuri)',
    },
    culturalSignificance: {
      as: 'পৰম্পৰাগত শাস্ত্ৰীয় সংগীত আৰু ভক্তিৰ ধ্বনি',
      bn: 'শাস্ত্রীয় সংগীত ও ভক্তিমূলক সুরের প্রতীক',
      hi: 'शास्त्रीय संगीत और भक्ति रस का सुरीला वाद्ययंत्र',
      en: 'Timeless wooden flute echoing classical melodies and spiritual devotion',
    },
  },
  {
    pairKey: 'tabla',
    symbol: '🥁',
    names: {
      as: 'শাস্ত্ৰীয় তবলা',
      bn: 'শাস্ত্রীয় তবলা-বাঁয়া',
      hi: 'शास्त्रीय तबला-जोड़ी',
      en: 'Classical Indian Tabla',
    },
    culturalSignificance: {
      as: 'ভাৰতীয় শাস্ত্ৰীয় সংগীতৰ তাল আৰু ছন্দ',
      bn: 'ভারতীয় সংগীতের তাল ও ছন্দময় পরিবেশনা',
      hi: 'भारतीय संगीत और लोकगीतों की धड़कन व लय का मुख्य वाद्य',
      en: 'Dynamic two-piece percussion instrument anchoring Indian classical rhythm',
    },
  },
  {
    pairKey: 'kalash',
    symbol: '🏺',
    names: {
      as: 'পৱিত্ৰ মঙ্গল কলহ',
      bn: 'পবিত্র মঙ্গল ঘট',
      hi: 'शुभ मंगल कलश',
      en: 'Sacred Mangal Kalash',
    },
    culturalSignificance: {
      as: 'সকলো শুভ কাৰ্যৰ আৰম্ভণিতে মংগলৰ প্ৰতীক',
      bn: 'সকল শুভ কাজের সূচনায় সমৃদ্ধি ও শান্তির প্রতীক',
      hi: 'सभी शुभ कार्यों के आरंभ में समृद्धि और कल्याण का प्रतीक पात्र',
      en: 'Sacred brass urn adorned with mango leaves and coconut for blessings',
    },
  },
  {
    pairKey: 'shankha',
    symbol: '🐚',
    names: {
      as: 'পৱিত্ৰ পূজাৰ শংখ',
      bn: 'পবিত্র পূজার শাঁখ',
      hi: 'पावन शंख',
      en: 'Sacred Conch (Shankha)',
    },
    culturalSignificance: {
      as: 'পূজা আৰু শুভ অনুষ্ঠানৰ মঙ্গলময় ধ্বনি',
      bn: 'সন্ধ্যা আরতি ও শুভ কাজের মঙ্গলধ্বনি',
      hi: 'मंदिरों और घरों में पवित्र वातावरण बनाने वाली मंगल ध्वनि',
      en: 'Auspicious natural conch resonated to invoke peace and positivity',
    },
  },
  {
    pairKey: 'marigold',
    symbol: '🌼',
    names: {
      as: 'সুগন্ধি নাৰ্জী ফুল',
      bn: 'উজ্জ্বল গাঁদা ফুল',
      hi: 'सुगंधित गेंदा फूल',
      en: 'Festive Marigold Flower',
    },
    culturalSignificance: {
      as: 'উৎসৱ আৰু গৃহ সজোৱা পৰম্পৰাগত ফুল',
      bn: 'উৎসব ও পূজার মালা গাঁথার প্রিয় ফুল',
      hi: 'त्योहारों पर तोरण और पूजन में प्रयुक्त होने वाला मांगलिक पुष्प',
      en: 'Vibrant golden blossom strung into garlands for celebrations across India',
    },
  },
  {
    pairKey: 'banyan',
    symbol: '🌳',
    names: {
      as: 'ছাঁযুক্ত বটবৃক্ষ',
      bn: 'বিশাল ছায়াঘন বটগাছ',
      hi: 'विशाल वटवृक्ष (बरगद)',
      en: 'Sacred Banyan Tree',
    },
    culturalSignificance: {
      as: 'দীৰ্ঘায়ু, আশ্ৰয় আৰু ভাৰতৰ ৰাষ্ট্ৰীয় গছ',
      bn: 'দীর্ঘায়ু, ঐতিহ্য ও ভারতের জাতীয় বৃক্ষ',
      hi: 'दीर्घायु, स्थिरता और लोक संस्कृति का राष्ट्रीय वृक्ष',
      en: 'National tree of India representing longevity, shelter, and community gather',
    },
  },
  {
    pairKey: 'ladoo',
    symbol: '🟡',
    names: {
      as: 'সুস্বাদু মতিচুৰ লাড়ু',
      bn: 'উৎসবের মতিচুর লাড্ডু',
      hi: 'पारंपरिक मोतीचूर लड्डू',
      en: 'Motichoor Festive Ladoo',
    },
    culturalSignificance: {
      as: 'আনন্দ আৰু শুভ সংবাদৰ মধুৰ মিঠাই',
      bn: 'আনন্দ ও শুভ মুহূর্তের মিষ্টি বার্তা',
      hi: 'खुशियों के पलों और त्योहारों पर बांटा जाने वाला पारंपरिक मिष्ठान',
      en: 'Quintessential Indian celebratory sweet shared during happy milestones',
    },
  },
  {
    pairKey: 'sitar',
    symbol: '🪕',
    names: {
      as: 'শাস্ত্ৰীয় সেতাৰ',
      bn: 'ঐতিহ্যবাহী সেতার',
      hi: 'शास्त्रीय सितार',
      en: 'Classical Sitar',
    },
    culturalSignificance: {
      as: 'ভাৰতীয় সংগীত আৰু সুৰৰ বিশ্ববিখ্যাত বাদ্য',
      bn: 'ভারতীয় সংগীতের বিশ্ববরেণ্য তারের বাদ্য',
      hi: 'भारतीय शास्त्रीय रागों की पहचान व मधुर तार वाद्य',
      en: 'Plucked string instrument synonymous with Indian classical ragas worldwide',
    },
  },
  {
    pairKey: 'temple_bell',
    symbol: '🔔',
    names: {
      as: 'মন্দিৰৰ কাঁহৰ ঘণ্টা',
      bn: 'মন্দিরের পিতলের ঘণ্টা',
      hi: 'मंदिर की कांस्य घंटी',
      en: 'Temple Bronze Bell',
    },
    culturalSignificance: {
      as: 'প্ৰাৰ্থনাৰ পৱিত্ৰ আৰু মন শান্ত কৰা ধ্বনি',
      bn: 'প্রার্থনার শান্তিময় ও পবিত্র ঝংকার',
      hi: 'मन को शांत और एकाग्र करने वाली देवालयों की पावन ध्वनि',
      en: 'Resonant bell rung upon entering shrines to clear the mind and awaken focus',
    },
  },
  {
    pairKey: 'silk_saree',
    symbol: '🧵',
    names: {
      as: 'হস্ততাঁতৰ ৰেচমী বস্ত্ৰ',
      bn: 'ঐতিহ্যবাহী তাঁত ও রেশম',
      hi: 'पारंपरिक बनारसी व कांजीवरम रेशम',
      en: 'Handloom Silk Textile',
    },
    culturalSignificance: {
      as: 'ভাৰতৰ গৌৰৱান্বিত তাঁতশিল্পীসকলৰ সোণালী সৃষ্টি',
      bn: 'ভারতীয় তাঁতিদের নিপুণ হাতের ঐতিহ্যবাহী রেশম শিল্প',
      hi: 'भारत के कुशल बुनकरों का सदियों पुराना गौरवमयी हथकरघा शिल्प',
      en: 'Masterpiece of Indian handloom weaving passed down through generations',
    },
  },
];
