export interface LocationData {
  id: string;
  state: string;
  stateName: Record<string, string>;
  category: 'wildlife_sanctuary' | 'river_island' | 'temple_heritage' | 'lake_nature' | 'monastery_heritage' | 'hills_waterfalls' | 'monument_heritage' | 'palace_heritage' | 'valley_nature' | 'cultural_heritage' | 'nature_wonder' | 'landmark_engineering' | 'tea_estate' | 'river_nature' | 'cave_heritage' | 'desert_nature';
  icon: string;
  name: Record<string, string>;
  clues: Record<string, string[]>;
}

export const LOCATIONS: LocationData[] = [
  {
    id: "taj_mahal",
    state: "Uttar Pradesh",
    stateName: {
      en: "Uttar Pradesh",
      as: "উত্তৰ প্ৰদেশ",
      bn: "উত্তর প্রদেশ",
      hi: "उत्तर प्रदेश"
    },
    category: "monument_heritage",
    icon: "🏛️",
    name: {
      en: "Taj Mahal, Agra",
      as: "তাজমহল, আগ্ৰা",
      bn: "তাজমহল, আগ্রা",
      hi: "ताजमहल, आगरा"
    },
    clues: {
      en: [
        "It is situated on the south bank of the sacred Yamuna River in northern India.",
        "It is recognized worldwide as a UNESCO World Heritage Site and one of the New Seven Wonders of the World.",
        "It is constructed of pure white Makrana marble with intricate Pietra Dura floral inlays.",
        "It is the legendary 17th-century mausoleum built by Mughal Emperor Shah Jahan for Mumtaz Mahal."
      ],
      as: [
        "ই উত্তৰ ভাৰতৰ পৱিত্ৰ যমুনা নদীৰ দক্ষিণ পাৰত অৱস্থিত।",
        "ই ইউনেস্কোৰ বিশ্ব ঐতিহ্য ক্ষেত্ৰ আৰু পৃথিৱীৰ অন্যতম আশ্চৰ্য্য হিচাপে সৰ্বজনবিদিত।",
        "ই বিশুদ্ধ বগা মাৰ্বল শিলেৰে নিৰ্মিত আৰু ফুলৰ সুন্দৰ কাৰুকাৰ্য্যৰে খোদিত।",
        "ই মোগল সম্ৰাট শ্বাহজাহানে পত্নী মমতাজ মহলৰ স্মৃতিত সজোৱা ঐতিহাসিক সমাধি।"
      ],
      bn: [
        "এটি উত্তর ভারতে পবিত্র যমুনা নদীর দক্ষিণ তীরে অবস্থিত।",
        "এটি ইউনেস্কো ওয়ার্ল্ড হেরিটেজ সাইট এবং বিশ্বের সপ্তাশ্চর্যের অন্যতম।",
        "এটি শুভ্র মাকরানা মার্বেল পাথরে নিখুঁত ফুলেল নকশায় নির্মিত।",
        "এটি মোঘল সম্রাট শাহজাহান কর্তৃক বেগম মমতাজ মহলের স্মৃতিতে নির্মিত ঐতিহাসিক সৌধ।"
      ],
      hi: [
        "यह उत्तर भारत में पवित्र यमुना नदी के दक्षिणी तट पर स्थित है।",
        "यह यूनेस्को विश्व धरोहर स्थल और दुनिया के सात अजूबों में से एक है।",
        "यह शुद्ध श्वेत मकराना संगमरमर और कीमती पत्थरों की पच्चीकारी से निर्मित है।",
        "यह मुग़ल बादशाह शाहजहाँ द्वारा अपनी बेगम मुमताज़ महल की याद में बनवाया गया प्रसिद्ध स्मारक है।"
      ]
    }
  },
  {
    id: "kashi_vishwanath",
    state: "Uttar Pradesh",
    stateName: {
      en: "Uttar Pradesh",
      as: "উত্তৰ প্ৰদেশ",
      bn: "উত্তর প্রদেশ",
      hi: "उत्तर प्रदेश"
    },
    category: "temple_heritage",
    icon: "🛕",
    name: {
      en: "Kashi Vishwanath & Ganga Ghats",
      as: "কাশী বিশ্বনাথ আৰু গংগা ঘাট",
      bn: "কাশী বিশ্বনাথ ও গঙ্গা ঘাট",
      hi: "काशी विश्वनाथ एवं गंगा घाट"
    },
    clues: {
      en: [
        "It is located in one of the world's oldest continuously inhabited living cities on the banks of the River Ganges.",
        "It is home to the sacred Dashashwamedh Ghat where magnificent evening Maha Aarti takes place every sunset.",
        "Its golden temple spire is dedicated to Lord Shiva as the supreme Jyotirlinga of liberation.",
        "It is the spiritual capital of Varanasi, revered for centuries by pilgrims seeking inner peace."
      ],
      as: [
        "ই পৱিত্ৰ গংগা নদীৰ পাৰত অৱস্থিত পৃথিৱীৰ অন্যতম প্ৰাচীন জীৱন্ত নগৰীত স্থিত।",
        "ইয়াত বিখ্যাত দশাশ্বমেধ ঘাট আছে য’ত প্ৰতি সন্ধিয়া ভব্য গংগা আৰতি অনুষ্ঠিত হয়।",
        "ইয়াৰ সোণালী মন্দিৰ ভগৱান শিৱৰ পৱিত্ৰ জ্যোতিৰ্লিঙ্গ হিচাপে পূজিত।",
        "ই মোক্ষ আৰু আধ্যাত্মিক শান্তিৰ বিশ্ববিখ্যাত তীৰ্থস্থান বাৰাণসী বা কাশী।"
      ],
      bn: [
        "এটি পবিত্র গঙ্গা নদীর তীরে অবস্থিত বিশ্বের অন্যতম প্রাচীন জীবন্ত নগরীতে অবস্থিত।",
        "এখানে বিখ্যাত দশাশ্বমেধ ঘাট রয়েছে যেখানে প্রতিদিন সন্ধ্যায় মনোরম গঙ্গা আরতি হয়।",
        "এর স্বর্ণমন্দির ভগবান শিবের অন্যতম প্রধান জ্যোতির্লিঙ্গ হিসেবে পূজিত।",
        "এটি ভারতীয় আধ্যাত্মিকতার ঐতিহাসিক প্রাণকেন্দ্র বারাণসী বা কাশী।"
      ],
      hi: [
        "यह पवित्र गंगा नदी के तट पर बसी विश्व की प्राचीनतम जीवित नगरियों में से एक है।",
        "यहाँ प्रसिद्ध दशाश्वमेध घाट है जहाँ प्रतिदिन संध्या को भव्य गंगा आरती होती है।",
        "इसका स्वर्ण शिखर भगवान शिव के द्वादश ज्योतिर्लिंगों में प्रमुख ज्योतिर्लिंग को समर्पित है।",
        "यह मोक्ष और सनातन संस्कृति की पावन आध्यात्मिक राजधानी काशी (वाराणसी) है।"
      ]
    }
  },
  {
    id: "red_fort",
    state: "Delhi",
    stateName: {
      en: "Delhi",
      as: "দিল্লী",
      bn: "দিল্লি",
      hi: "दिल्ली"
    },
    category: "monument_heritage",
    icon: "🏰",
    name: {
      en: "Red Fort (Lal Qila)",
      as: "লালকিল্লা, দিল্লী",
      bn: "লালকেল্লা, দিল্লি",
      hi: "लाल किला, दिल्ली"
    },
    clues: {
      en: [
        "It stands majestically in the heart of Old Delhi near the historic Chandni Chowk bazaar.",
        "It is fortified with massive red sandstone walls stretching over two kilometers.",
        "Every year on Independence Day (15th August), the Prime Minister of India unfurls the National Flag from its ramparts.",
        "It is the historic Lal Qila commissioned by Emperor Shah Jahan in 1638."
      ],
      as: [
        "ই পুৰণি দিল্লীৰ ঐতিহাসিক চান্দনী চকৰ কাষতে অৱস্থিত।",
        "ই ৰঙা শিলৰ বিশালাকাৰ দুৰ্গ প্ৰাচীৰেৰে সুৰক্ষিত।",
        "প্ৰতি বছৰে ১৫ আগষ্ট স্বাধীনতা দিৱসত ভাৰতৰ প্ৰধানমন্ত্ৰীয়ে ইয়াৰ প্ৰাচীৰৰ পৰা ত্ৰিৰংগা পতাকা উত্তোলন কৰে।",
        "ই ১৬৩৮ চনত সম্ৰাট শ্বাহজাহানে নিৰ্মাণ কৰা ঐতিহাসিক লালকিল্লা।"
      ],
      bn: [
        "এটি পুরানো দিল্লির ঐতিহাসিক চাঁদনি চকের সন্নিকটে সগৌরবে দাঁড়িয়ে রয়েছে।",
        "এটি দুই কিলোমিটারের বেশি বিস্তৃত লাল বেলেপাথরের প্রাচীর দ্বারা বেষ্টিত।",
        "প্রতি বছর ১৫ আগস্ট স্বাধীনতা দিবসে ভারতের প্রধানমন্ত্রী এর প্রাচীর থেকে জাতীয় পতাকা উত্তোলন করেন।",
        "এটি ১৬৩৮ সালে সম্রাট শাহজাহান নির্মিত ঐতিহাসিক লালকেল্লা।"
      ],
      hi: [
        "यह पुरानी दिल्ली के दिल में ऐतिहासिक चाँदनी चौक के समीप स्थित है।",
        "यह लाल बलुआ पत्थर की विशाल और भव्य प्राचीरों से घिरा हुआ है।",
        "प्रतिवर्ष १५ अगस्त को भारत के प्रधानमंत्री इसके प्राचीर से राष्ट्रीय ध्वज तिरंगा फहराते हैं।",
        "यह सन् १६३८ में मुग़ल बादशाह शाहजहाँ द्वारा बनवाया गया ऐतिहासिक लाल किला है।"
      ]
    }
  },
  {
    id: "golden_temple",
    state: "Punjab",
    stateName: {
      en: "Punjab",
      as: "পাঞ্জাব",
      bn: "পাঞ্জাব",
      hi: "पंजाब"
    },
    category: "temple_heritage",
    icon: "🛕",
    name: {
      en: "Golden Temple (Harmandir Sahib)",
      as: "স্বৰ্ণ মন্দিৰ, অমৃতসৰ",
      bn: "স্বর্ণ মন্দির, অমৃতসর",
      hi: "स्वर्ण मंदिर (हरिमंदिर साहिब)",
      en_sub: "Amritsar, Punjab"
    },
    clues: {
      en: [
        "It is situated in the vibrant northern state of Punjab, surrounded by a sacred man-made pool called the Amrit Sarovar.",
        "Its upper floors and domes are gilded with hundreds of kilograms of pure shimmering gold foil.",
        "It serves free warm meals through its community kitchen (Langar) to over one hundred thousand people daily without discrimination.",
        "It is Sri Harmandir Sahib in Amritsar, the holiest spiritual shrine of Sikhism."
      ],
      as: [
        "ই পৱিত্ৰ অমৃত সৰোবৰ নামৰ সৰোবৰটোৰ মাজমজিয়াত অৱস্থিত পাঞ্জাবৰ পৱিত্ৰ তীৰ্থ।",
        "ইয়াৰ ওপৰৰ অংশ আৰু গম্বুজসমূহ বিশুদ্ধ সোণৰ পাতেৰে আবৃত।",
        "ইয়াৰ বৃহৎ লংগৰত প্ৰতিদিনে এক লাখতকৈও অধিক লোকক বিনামূল্যে তৃপ্তিদায়ক খাদ্য খুওৱা হয়।",
        "ই অমৃতসৰত অৱস্থিত শিখ ধৰ্মৰ সৰ্বোচ্চ পৱিত্ৰ স্থান শ্ৰী হৰমন্দিৰ চাহিব।"
      ],
      bn: [
        "এটি পাঞ্জাবের পবিত্র অমৃত সরোবরের কেন্দ্রস্থলে শান্ত জলে ভাসমান এক অপূর্ব তীর্থ।",
        "এর উপরিভাগ শত শত কেজি খাঁটি সোনার পাতে মোড়ানো।",
        "এখানে বিশ্বখ্যাত লঙ্গরে প্রতিদিন লক্ষাধিক মানুষকে জাতি-ধর্ম নির্বিশেষে বিনামূল্যে প্রসাদ বিতরণ করা হয়।",
        "এটি অমৃতসরে অবস্থিত শিখ সম্প্রদায়ের পরম পবিত্র তীর্থস্থান শ্রী হরমন্দির সাহিব।"
      ],
      hi: [
        "यह पंजाब के अमृतसर में पवित्र अमृत सरोवर के बीचों-बीच स्थित है।",
        "इसके ऊपरी गुंबद और दीवारें सैकड़ों किलो शुद्ध सोने के पत्तर से सुसज्जित हैं।",
        "यहाँ का विश्वप्रसिद्ध लंगर बिना किसी भेदभाव के प्रतिदिन एक लाख से अधिक लोगों को निःशुल्क भोजन कराता है।",
        "यह सिख धर्म का सर्वोच्च और सबसे पावन तीर्थ स्थल श्री हरिमंदिर साहिब है।"
      ]
    }
  },
  {
    id: "gateway_of_india",
    state: "Maharashtra",
    stateName: {
      en: "Maharashtra",
      as: "মহাৰাষ্ট্ৰ",
      bn: "মহারাষ্ট্র",
      hi: "महाराष्ट्र"
    },
    category: "monument_heritage",
    icon: "🏛️",
    name: {
      en: "Gateway of India, Mumbai",
      as: "গেটৱে অফ ইণ্ডিয়া, মুম্বাই",
      bn: "গেটওয়ে অফ ইন্ডিয়া, মুম্বাই",
      hi: "गेटवे ऑफ़ इंडिया, मुंबई"
    },
    clues: {
      en: [
        "It overlooks the Arabian Sea at the Apollo Bunder waterfront in India's financial capital.",
        "It is built in Indo-Saracenic architectural style using yellow basalt stone and reinforced concrete.",
        "Directly opposite stands the iconic heritage Taj Mahal Palace Hotel opened in 1903.",
        "It was erected to commemorate the landing of King George V and Queen Mary in Mumbai in 1911."
      ],
      as: [
        "ই ভাৰতৰ বাণিজ্যিক ৰাজধানী মুম্বাইৰ আৰব সাগৰৰ পাৰত অৱস্থিত।",
        "ই হালধীয়া বেছল্ট শিলেৰে ভাৰতীয় আৰু ইছলামিক শৈলীৰ সংমিশ্ৰণত নিৰ্মিত।",
        "ইয়াৰ ঠিক মুখামুখিকৈ ঐতিহাসিক তাজমহল পেলেচ হোটেলখন অৱস্থিত।",
        "ই ১৯১১ চনত ভাৰতলৈ অহা ৰজা পঞ্চম জৰ্জৰ আগমনৰ স্মৃতিত সজোৱা ঐতিহাসিক তোৰণ।"
      ],
      bn: [
        "এটি ভারতের বাণিজ্যিক রাজধানী মুম্বাইয়ের আরব সাগরের তীরে অবস্থিত।",
        "এটি হলুদ ব্যাসল্ট পাথরে ইন্দো-সারাসেনিক স্থাপত্যরীতিতে তৈরি এক বিশাল খিলান।",
        "এর ঠিক বিপরীতে দাঁড়িয়ে রয়েছে ঐতিহ্যবাহী তাজমহল প্যালেস হোটেল।",
        "এটি ১৯১১ সালে ভারতে রাজা পঞ্চম জর্জের পদার্পণ উপলক্ষে নির্মিত তোরণ।"
      ],
      hi: [
        "यह देश की आर्थिक राजधानी मुंबई में अरब सागर के तट (अपोलो बंदर) पर स्थित है।",
        "यह पीले बेसाल्ट पत्थर से भारत-अरबी (इंडो-सारैसेनिक) शैली में बना भव्य मेहराब है।",
        "इसके ठीक सामने ऐतिहासिक ताज महल पैलेस होटल स्थित है।",
        "यह सन् १९११ में ब्रिटिश सम्राट जॉर्ज पंचम के भारत आगमन की स्मृति में बनाया गया प्रसिद्ध स्मारक है।"
      ]
    }
  },
  {
    id: "hawa_mahal",
    state: "Rajasthan",
    stateName: {
      en: "Rajasthan",
      as: "ৰাজস্থান",
      bn: "রাজস্থান",
      hi: "राजस्थान"
    },
    category: "palace_heritage",
    icon: "🏰",
    name: {
      en: "Hawa Mahal (Palace of Winds)",
      as: "হাওয়া মহল, জয়পুৰ",
      bn: "হাওয়া মহল, জয়পুর",
      hi: "हवा महल, जयपुर"
    },
    clues: {
      en: [
        "It is situated in the famous Pink City of Rajasthan, built of pink and red sandstone.",
        "Its facade resembles the honeycomb of a beehive, designed in the shape of Lord Krishna's crown.",
        "It features 953 uniquely carved small casements (jharokhas) that allow cool breezes to circulate continuously.",
        "It was built in 1799 by Maharaja Sawai Pratap Singh so royal women could observe street festivals unseen."
      ],
      as: [
        "ই ৰাজস্থানৰ বিখ্যাত গোলাপী চহৰ জয়পুৰত ৰঙা আৰু গুলপীয়া শিলেৰে নিৰ্মিত।",
        "ইয়াৰ সন্মুখভাগ ভগৱান শ্ৰীকৃষ্ণৰ মুকুটৰ আকৃতিৰ আৰু মৌচাকৰ দৰে সজোৱা।",
        "ইয়াত ৯৫৩টা সৰু সৰু খিৰিকী (ঝৰোকা) আছে যাৰ মাজেৰে শীতল বতাহ অহৰহ বৈ থাকে।",
        "ই ১৭৯৯ চনত মহাৰাজা সৱাই প্ৰতাপ সিঙে নিৰ্মাণ কৰা বিখ্যাত বতাহৰ ৰাজপ্ৰাসাদ।"
      ],
      bn: [
        "এটি রাজস্থানের ঐতিহাসিক গোলাপি শহর জয়পুরে লাল ও গোলাপি বেলেপাথরে নির্মিত।",
        "এর বহিরঙ্গ মৌচাকের মতো এবং এটি ভগবান শ্রীকৃষ্ণের মুকুটের আদলে তৈরি।",
        "এতে ৯৫৩টি সূক্ষ্মভাবে খোদাই করা ছোট জানালা বা ঝরোখা রয়েছে যা বাতাস চলাচলে সাহায্য করে।",
        "১৭৯৯ সালে মহারাজা সোয়াই প্রতাপ সিংহ এটি নির্মাণ করেন।"
      ],
      hi: [
        "यह राजस्थान की गुलाबी नगरी जयपुर में लाल व गुलाबी बलुआ पत्थर से निर्मित है।",
        "इसकी संरचना भगवान श्रीकृष्ण के मुकुट के समान है और मधुमक्खी के छत्ते जैसी प्रतीत होती है।",
        "इसमें ९५३ नक्काशीदार झरोखे (खिड़कियाँ) हैं जिनसे होकर सदैव ठंडी हवा प्रवाहित होती है।",
        "यह सन् १७९९ में महाराजा सवाई प्रताप सिंह द्वारा बनवाया गया प्रसिद्ध 'हवा महल' है।"
      ]
    }
  },
  {
    id: "meenakshi_temple",
    state: "Tamil Nadu",
    stateName: {
      en: "Tamil Nadu",
      as: "তামিলনাডু",
      bn: "তামিলনাড়ু",
      hi: "तमिलनाडु"
    },
    category: "temple_heritage",
    icon: "🛕",
    name: {
      en: "Meenakshi Amman Temple, Madurai",
      as: "মীনাক্ষী আম্মান মন্দিৰ, মাদুৰাই",
      bn: "মীনাক্ষী আম্মান মন্দির, মাদুরাই",
      hi: "मीनाक्षी अम्मन मंदिर, मदुरै"
    },
    clues: {
      en: [
        "It is located on the southern bank of the Vaigai River in the historic temple city of Madurai.",
        "It is an architectural marvel of Dravidian style featuring 14 soaring Gopuram gateway towers covered in thousands of painted sculptures.",
        "Its premises house the legendary Hall of a Thousand Pillars (Aayiram Kaal Mandapam) carved with extraordinary lifelike details.",
        "It is dedicated to Goddess Meenakshi (an avatar of Parvati) and her consort Sundareswarar (Lord Shiva)."
      ],
      as: [
        "ই দক্ষিণ ভাৰতৰ তামিলনাডুৰ বৈগাই নদীৰ পাৰত অৱস্থিত ঐতিহাসিক মন্দিৰ চহৰ মাদুৰাইত স্থিত।",
        "ই দ্ৰাবিড় স্থাপত্যৰ উৎকৃষ্ট নিদৰ্শন, য’ত হাজাৰ হাজাৰ ভাস্কৰ্য্যৰে সুসজ্জিত ১৪টা ওখ গোপুৰম তোৰণ আছে।",
        "ইয়াত বিখ্যাত 'হাজাৰ স্তম্ভৰ মণ্ডপ' আছে য’ত প্ৰতিটো খুটা অপূৰ্ব ভাস্কৰ্য্যৰে খোদিত।",
        "ই দেৱী মীনাক্ষী আৰু ভগৱান সুন্দৰেশ্বৰৰ পৱিত্ৰ মহিমামণ্ডিত মন্দিৰ।"
      ],
      bn: [
        "এটি দক্ষিণ ভারতের তামিলনাড়ুর বৈগাই নদীর তীরে ঐতিহাসিক মাদুরাই নগরীতে অবস্থিত।",
        "এটি দ্রাবিড় স্থাপত্যের শ্রেষ্ঠ নিদর্শন, যাতে রয়েছে হাজার হাজার রঙিন মূর্তিতে সুসজ্জিত ১৪টি বিশাল গোপুরম।",
        "এর ভেতরে রয়েছে বিশ্বখ্যাত হাজার স্তম্ভের সভাগৃহ (আয়িরাম কাল মণ্ডপম)।",
        "এটি দেবী মীনাক্ষী ও ভগবান সুন্দরেশ্বরকে উৎসর্গীকৃত প্রাচীন মহাতীর্থ।"
      ],
      hi: [
        "यह दक्षिण भारत के तमिलनाडु में वैगई नदी के तट पर ऐतिहासिक मदुरै नगर में स्थित है।",
        "यह द्रविड़ वास्तुकला का अनुपम उदाहरण है, जिसमें हज़ारों रंग-बिरंगी मूर्तियों से सजे १४ विशाल गोपुरम हैं।",
        "इसके परिसर में अद्भुत नक्काशी वाला प्रसिद्ध 'हज़ार खंभों का मंडप' स्थित है।",
        "यह देवी पार्वती के स्वरूप 'मीनाक्षी' और भगवान शिव के स्वरूप 'सुंदरेश्वर' को समर्पित भव्य मंदिर है।"
      ]
    }
  },
  {
    id: "ajanta_ellora",
    state: "Maharashtra",
    stateName: {
      en: "Maharashtra",
      as: "মহাৰাষ্ট্ৰ",
      bn: "মহারাষ্ট্র",
      hi: "महाराष्ट्र"
    },
    category: "cave_heritage",
    icon: "🏔️",
    name: {
      en: "Ajanta & Ellora Rock-Cut Caves",
      as: "অজন্তা আৰু ইলোৰা গুহা",
      bn: "অজন্তা ও ইলোরা গুহা",
      hi: "अजंता एवं एलोरा की प्राचीन गुफाएं"
    },
    clues: {
      en: [
        "They are carved directly into basalt volcanic cliffs in the Aurangabad (Chhatrapati Sambhaji Nagar) district.",
        "They feature exquisite ancient Buddhist frescoes, murals, and sculptures dating back to the 2nd century BCE.",
        "Ellora Cave 16 houses the Kailash Temple, the world's largest monolithic rock excavation carved top-down from a single cliff.",
        "They represent the supreme pinnacle of ancient Indian rock-cut art and harmony of Buddhism, Hinduism, and Jainism."
      ],
      as: [
        "ই মহাৰাষ্ট্ৰৰ পাহাৰ কাটি নিৰ্মাণ কৰা বিশ্ববিখ্যাত প্ৰাচীন গুহা সমষ্টি।",
        "ইয়াত খ্ৰীষ্টপূৰ্ব দ্বিতীয় শতিকাৰ বৌদ্ধ দেৱালচিত্ৰ আৰু অনন্য ভাস্কৰ্য্য সংৰক্ষিত হৈ আছে।",
        "ইলোৰাৰ ১৬ নং গুহাত এটা মাত্ৰ বিশাল শিল কাটি ওপৰৰ পৰা তললৈ সাজি উলিওৱা কৈলাস মন্দিৰ অৱস্থিত।",
        "ই প্ৰাচীন ভাৰতীয় শিল্পকলা আৰু বৌদ্ধ, হিন্দু আৰু জৈন ধৰ্মৰ ঐতিহাসিক মিলনভূমি।"
      ],
      bn: [
        "এগুলি মহারাষ্ট্রের আগ্নেয়গিরির ব্যাসল্ট শিলা কেটে তৈরি প্রাচীন গুহা স্থাপত্য।",
        "এখানে খ্রিস্টপূর্ব দ্বিতীয় শতকের অপূর্ব বৌদ্ধ দেয়ালচিত্র ও নিখুঁত ভাস্কর্য রয়েছে।",
        "ইলোরার ১৬ নম্বর গুহায় অবস্থিত কৈলাশ মন্দিরটি একটিমাত্র বিশাল পাথর কেটে তৈরি পৃথিবীর বৃহত্তম স্থাপত্য।",
        "এটি প্রাচীন ভারতীয় চিত্রকলা ও বৌদ্ধ, হিন্দু ও জৈন সংস্কৃতির মহামিলনের প্রতীক।"
      ],
      hi: [
        "यह महाराष्ट्र के छत्रपति संभाजी नगर में ज्वालामुखीय बेसाल्ट चट्टानों को तराश कर बनाई गई हैं।",
        "यहाँ ईसा पूर्व दूसरी शताब्दी के बौद्ध भित्तिचित्र, जातक कथाएं और सजीव मूर्तियां विद्यमान हैं।",
        "एलोरा की गुफा संख्या १६ में एक ही विशालकाय पहाड़ी को ऊपर से नीचे तराशकर बना 'कैलाश मंदिर' स्थित है।",
        "यह प्राचीन भारतीय पाषाण-शिल्प तथा बौद्ध, हिंदू और जैन धर्मों के सौहार्द का अद्वितीय प्रमाण है।"
      ]
    }
  },
  {
    id: "konark_sun_temple",
    state: "Odisha",
    stateName: {
      en: "Odisha",
      as: "ওড়িশা",
      bn: "ওড়িশা",
      hi: "ओडिशा"
    },
    category: "temple_heritage",
    icon: "🛕",
    name: {
      en: "Konark Sun Temple",
      as: "কোণাৰ্কৰ সূৰ্য্য মন্দিৰ",
      bn: "কোণার্কের সূর্য মন্দির",
      hi: "कोणार्क सूर्य मंदिर"
    },
    clues: {
      en: [
        "It is situated on the coastline of the Bay of Bengal in the sacred state of Odisha.",
        "The entire temple is designed as a colossal chariot for the Sun God (Surya) with 24 elaborately carved stone wheels pulled by 7 spirited horses.",
        "The giant wheels act as precise sundials, calculating time accurately to the minute using the shadows of spokes.",
        "It is the celebrated 13th-century 'Black Pagoda' built by King Narasimhadeva I of the Eastern Ganga Dynasty."
      ],
      as: [
        "ই ওড়িশাৰ বঙ্গোপসাগৰৰ উপকূলত অৱস্থিত বিশ্ববিখ্যাত সূৰ্য্য মন্দিৰ।",
        "সম্পূৰ্ণ মন্দিৰটো ২৪টা বিশাল খোদিত চকা আৰু ৭টা ঘোঁৰাই টানি নিয়া সূৰ্য্যদেৱতাৰ এক সুবিশাল ৰথৰ আকৃতিৰে গঢ়া।",
        "ইয়াৰ চকাবোৰ নিখুঁত সূৰ্য্য-ঘড়ী হিচাপে কাম কৰে আৰু ছাঁৰ সহায়ত মিনিটৰ হিচাপ দিব পাৰে।",
        "ই ত্ৰয়োদশ শতিকাৰ ৰজা নৰসিংহদেৱে নিৰ্মাণ কৰা বিখ্যাত কোণাৰ্কৰ সূৰ্য্য মন্দিৰ।"
      ],
      bn: [
        "এটি ওড়িশার বঙ্গোপসাগর উপকূলবর্তী অঞ্চলে অবস্থিত একটি ইউনেস্কো বিশ্ব ঐতিহ্য ক্ষেত্র।",
        "সমগ্র মন্দিরটি সূর্যদেবের এক বিশাল রথরূপে পরিকল্পিত, যার রয়েছে ২৪টি অলঙ্কৃত চাকা এবং ৭টি অশ্ব।",
        "এর পাথরের চাকাগুলি সূক্ষ্ম সূর্যঘড়ি হিসেবে কাজ করে এবং সূর্যের ছায়া দেখে সময় নির্ণয় করা যায়।",
        "এটি ত্রয়োদশ শতকে রাজা প্রথম নরসিংহদেব দ্বারা নির্মিত ব্ল্যাক প্যাগোডা নামে খ্যাত কোণার্ক মন্দির।"
      ],
      hi: [
        "यह ओडिशा के तट पर बंगाल की खाड़ी के समीप स्थित यूनेस्को विश्व धरोहर स्थल है।",
        "इस संपूर्ण मंदिर को भगवान सूर्य के २४ नक्काशीदार पहियों और ७ घोड़ों वाले एक विशाल रथ के रूप में गढ़ा गया है।",
        "इसके विशाल पहिये सटीक धूप-घड़ी का काम करते हैं जो सूर्य की छाया से सही समय बताते हैं।",
        "यह १३वीं शताब्दी में पूर्वी गंग वंश के राजा नरसिंहदेव प्रथम द्वारा निर्मित प्रसिद्ध कोणार्क सूर्य मंदिर है।"
      ]
    }
  },
  {
    id: "victoria_memorial",
    state: "West Bengal",
    stateName: {
      en: "West Bengal",
      as: "পশ্চিমবঙ্গ",
      bn: "পশ্চিমবঙ্গ",
      hi: "पश्चिम बंगाल"
    },
    category: "monument_heritage",
    icon: "🏛️",
    name: {
      en: "Victoria Memorial & Howrah Bridge",
      as: "ভিক্টোৰিয়া মেম’ৰিয়েল আৰু হাওৰা দলং",
      bn: "ভিক্টোরিয়া মেমোরিয়াল ও হাওড়া ব্রিজ",
      hi: "विक्टोरिया मेमोरियल एवं हावड़ा ब्रिज"
    },
    clues: {
      en: [
        "It is located in Kolkata on the banks of the sacred Hooghly River, surrounded by the green expanse of the Maidan.",
        "It is constructed of pristine white Makrana marble and houses royal galleries, gardens, and historic artifacts.",
        "Nearby stands the iconic cantilever engineering marvel over the river that operates without a single central pillar.",
        "It is the cultural heart of the City of Joy, capturing Bengal's rich intellectual and architectural heritage."
      ],
      as: [
        "ই পশ্চিমবঙ্গৰ ৰাজধানী কলকাতাত হুগলি নদী আৰু ময়দানৰ কাষত অৱস্থিত।",
        "ই শুভ্ৰ মাৰ্বল শিলেৰে নিৰ্মিত আৰু ইয়াৰ ভিতৰত বিশাল সংগ্ৰহালয় আৰু সুন্দৰ উদ্যান আছে।",
        "ইয়াৰ কাষতে হুগলি নদীৰ ওপৰত কোনো মাজৰ খুঁটা নোহোৱাকৈ নিৰ্মিত ঐতিহাসিক হাওৰা দলংখন স্থিত।",
        "ই আনন্দৰ চহৰ কলকাতাৰ সাংস্কৃতিক আৰু ঐতিহ্যপূৰ্ণ প্ৰাণকেন্দ্ৰ।"
      ],
      bn: [
        "এটি কলকাতার ময়দানের দক্ষিণ প্রান্তে হুগলি নদীর সন্নিকটে অবস্থিত সাদা মার্বেলের অনন্য সৌধ।",
        "এটি শুভ্র মাকরানা মার্বেল পাথরে নির্মিত এবং এর চারপাশে রয়েছে বিস্তৃত সবুজ বাগান ও দিঘি।",
        "নিকটেই রয়েছে নদী পারাপারের বিশ্ববিখ্যাত হাওড়া ব্রিজ যা কোনো মধ্যবর্তী স্তম্ভ ছাড়াই দাঁড়িয়ে আছে।",
        "এটি তিলোত্তমা কলকাতার আভিজাত্য, সংস্কৃতি ও ঐতিহ্যের চিরন্তন প্রতীক।"
      ],
      hi: [
        "यह पश्चिम बंगाल की राजधानी कोलकाता में हुगली नदी के पास मैदान के विशाल हरित क्षेत्र में स्थित है।",
        "यह सफेद मकराना संगमरमर से निर्मित एक भव्य महलनुमा स्मारक व संग्रहालय है।",
        "इसके पास ही हुगली नदी पर बिना किसी केंद्रीय खंभे के टिका ऐतिहासिक हावड़ा ब्रिज स्थित है।",
        "यह 'आनंद के नगर' (कोलकाता) की समृद्ध सांस्कृतिक और वास्तुकला की अमूल्य धरोहर है।"
      ]
    }
  },
  {
    id: "dal_lake",
    state: "Jammu & Kashmir",
    stateName: {
      en: "Jammu & Kashmir",
      as: "জম্মু আৰু কাশ্মীৰ",
      bn: "জম্মু ও কাশ্মীর",
      hi: "जम्मू और कश्मीर"
    },
    category: "lake_nature",
    icon: "⛵",
    name: {
      en: "Dal Lake & Houseboats",
      as: "ডাল হ্ৰদ আৰু হাউচব’ট",
      bn: "ডাল লেক ও হাউসবোট",
      hi: "डल झील एवं शिकारे"
    },
    clues: {
      en: [
        "It is nestled in Srinagar surrounded by the breathtaking snow-capped Pir Panjal mountain range.",
        "It is affectionately celebrated as the 'Jewel in the crown of Kashmir' and the 'Lake of Flowers'.",
        "It is famous for wooden houseboats, vibrant floating vegetable markets, and colorful canopied Shikara boats.",
        "Along its boulevards lie the historic terraced Mughal gardens of Shalimar Bagh and Nishat Bagh."
      ],
      as: [
        "ই কাশ্মীৰ উপত্যকাৰ শ্ৰীনগৰত বৰফেৰে আবৃত সুউচ্চ হিমালয় পাহাৰৰ মাজত অৱস্থিত।",
        "ইয়াক মৰমেৰে 'কাশ্মীৰৰ মুকুটৰ মণি' আৰু 'ফুলৰ হ্ৰদ' বুলি কোৱা হয়।",
        "ই ঐতিহ্যবাহী কাঠৰ হাউচব’ট, ওপঙা বজাৰ আৰু ৰঙীন কাপোৰেৰে সজোৱা চিকাৰা নাওঁবোৰৰ বাবে জনাজাত।",
        "ইয়াৰ পাৰতে সম্ৰাট জাহাংগীৰৰ ঐতিহাসিক মোগল উদ্যান শালিমৰ আৰু নিশাত বাগ অৱস্থিত।"
      ],
      bn: [
        "এটি কাশ্মীরের শ্রীনগরে বরফাবৃত পীর পাঞ্জাল পর্বতমালার কোলে অবস্থিত শান্ত ও সুন্দর হ্রদ।",
        "এটিকে 'কাশ্মীরের মুকুটের মণি' বা 'পুষ্প হ্রদ' নামে অভিহিত করা হয়।",
        "এটি হস্তনির্মিত কাঠের হাউসবোট, ভাসমান সবজি বাজার এবং রঙিন শিকারার জন্য বিশ্বখ্যাত।",
        "এর তীরেই রয়েছে ঐতিহাসিক মুঘল উদ্যান শালিমার ও নিশাত বাগ।"
      ],
      hi: [
        "यह श्रीनगर में बर्फ से ढकी पीर पंजाल पर्वतमाला की तलहटी में स्थित अत्यंत मनोरम झील है।",
        "इसे 'कश्मीर के मुकुट का नगीना' और 'फूलों की झील' कहा जाता है।",
        "यह पारंपरिक नक्काशीदार हाउसबोट, तैरते बाज़ार और रंगीन शिकारा नौकाओं के लिए विश्वप्रसिद्ध है।",
        "इसके किनारे पर मुग़ल बादशाहों द्वारा बनवाए गए प्रसिद्ध निशात और शालीमार बाग स्थित हैं।"
      ]
    }
  },
  {
    id: "qutub_minar",
    state: "Delhi",
    stateName: {
      en: "Delhi",
      as: "দিল্লী",
      bn: "দিল্লি",
      hi: "दिल्ली"
    },
    category: "monument_heritage",
    icon: "🗼",
    name: {
      en: "Qutub Minar & Iron Pillar",
      as: "কুতুব মিনাৰ আৰু লৌহ স্তম্ভ",
      bn: "কুতুব মিনার ও লৌহ স্তম্ভ",
      hi: "क़ुतुब मीनार एवं लौह स्तंभ"
    },
    clues: {
      en: [
        "It stands in South Delhi as the tallest brick minaret in the world at a height of 72.5 meters.",
        "Constructed of red sandstone and marble, its five fluted stories are inscribed with intricate calligraphy.",
        "In its courtyard stands a mysterious 1,600-year-old Gupta-era Iron Pillar that has never rusted despite centuries of weather.",
        "It was initiated in 1199 CE by Qutb-ud-din Aibak, marking the inception of the Delhi Sultanate."
      ],
      as: [
        "ই দিল্লীত অৱস্থিত পৃথিৱীৰ সৰ্বোচ্চ ইটাৰে নিৰ্মিত মিনাৰ, যাৰ উচ্চতা ৭২.৫ মিটাৰ।",
        "ৰঙা শিল আৰু মাৰ্বলেৰে নিৰ্মিত ইয়াৰ ৫টা মহলাত সুন্দৰ কাৰুকাৰ্য্য আৰু আৰবী লিপি খোদিত আছে।",
        "ইয়াৰ চোতালত ১৬০০ বছৰ পুৰণি ঐতিহাসিক গুপ্ত যুগৰ লোৰ স্তম্ভ আছে য’ত কেতিয়াও মামৰে নধৰে।",
        "ই ১১৯৯ চনত কুতুবুদ্দিন আইবাকে নিৰ্মাণ আৰম্ভ কৰা ঐতিহাসিক কুতুব মিনাৰ।"
      ],
      bn: [
        "এটি দক্ষিণ দিল্লিতে অবস্থিত এবং এটি ইটের তৈরি বিশ্বের উচ্চতম মিনার (উচ্চতা ৭২.৫ মিটার)।",
        "লাল বেলেপাথর ও মার্বেল পাথরে নির্মিত এই পাঁচতলা মিনারে সূক্ষ্ম লিপি ও কারুকাজ খোদিত আছে।",
        "এর প্রাঙ্গণে রয়েছে ১৬০০ বছরের পুরনো এক রহস্যময় লৌহস্তম্ভ যাতে শতবর্ষেও কখনো মরিচা ধরে না।",
        "এটি ১১৯৯ সালে কুতুবউদ্দিন আইবেক কর্তৃক প্রতিষ্ঠিত ঐতিহাসিক কুতুব মিনার।"
      ],
      hi: [
        "यह दक्षिण दिल्ली के महरौली में स्थित ईंटों से बनी विश्व की सबसे ऊँची मीनार (७२.५ मीटर) है।",
        "लाल बलुआ पत्थर और संगमरमर से बनी इसकी पाँच मंजिलों पर बारीक नक्काशी और शिलालेख हैं।",
        "इसके परिसर में १६०० वर्ष पुराना गुप्तकालीन लौह स्तंभ खड़ा है जिसमें सदियों से जंग नहीं लगा।",
        "यह सन् ११९९ में कुतुबुद्दीन ऐबक द्वारा शुरू करवाई गई ऐतिहासिक क़ुतुब मीनार है।"
      ]
    }
  },
  {
    id: "kaziranga",
    state: "Assam",
    stateName: {
      en: "Assam",
      as: "অসম",
      bn: "আসাম",
      hi: "असम"
    },
    category: "wildlife_sanctuary",
    icon: "🦏",
    name: {
      en: "Kaziranga National Park",
      as: "কাজিৰঙা ৰাষ্ট্ৰীয় উদ্যান",
      bn: "কাজিরাঙ্গা জাতীয় উদ্যান",
      hi: "काजीरंगा राष्ट्रीय उद्यान"
    },
    clues: {
      en: [
        "It is located in the fertile floodplains along the mighty Brahmaputra River.",
        "It is a prestigious UNESCO World Heritage Site recognized globally for its biodiversity conservation.",
        "It features tall elephant grass, lush wetlands, swamp deer, wild water buffalo, and tigers.",
        "It is world-renowned as home to over two-thirds of the planet's Great Indian One-Horned Rhinoceroses."
      ],
      as: [
        "এই স্থানখন ব্ৰহ্মপুত্ৰ নদীৰ পাৰৰ উৰ্বৰ সমভূমিত অৱস্থিত।",
        "ই জৈৱ বৈচিত্ৰ্য সংৰক্ষণৰ বাবে ইউনেস্কোৰ বিশ্ব ঐতিহ্য ক্ষেত্ৰৰ স্বীকৃতি প্ৰাপ্ত।",
        "ইয়াত ওখ নল-খাগৰি, জলাশয়, নল-গাহৰি আৰু জলচৰ পখীৰ বিশাল সমাহাৰ আছে।",
        "ই পৃথিৱীৰ দুই-তৃতীয়াংশ এশিঙীয়া গঁড়ৰ বাবে বিশ্ববিখ্যাত জাতীয় উদ্যান।"
      ],
      bn: [
        "এই স্থানটি ব্রহ্মপুত্র নদের উর্বর প্লাবনভূমিতে অবস্থিত।",
        "এটি জীববৈচিত্র্যের জন্য ইউনেস্কো ওয়ার্ল্ড হেরিটেজ সাইট হিসেবে স্বীকৃত।",
        "এখানে উঁচু নল-খাগড়া, জলাভূমি, বুনো মোষ ও বাঘের নিরাপদ বিচরণক্ষেত্র রয়েছে।",
        "এটি বিশ্বের দুই-তৃতীয়াংশ একশৃঙ্গ গণ্ডারের আবাসস্থল হিসেবে বিশ্বখ্যাত।"
      ],
      hi: [
        "यह ब्रह्मपुत्र नदी के उपजाऊ कछारी मैदानों में स्थित भारत का गौरवशाली अभयारण्य है।",
        "यह जैव विविधता के संरक्षण के लिए यूनेस्को विश्व धरोहर स्थल के रूप में मान्यता प्राप्त है।",
        "यहाँ विशाल हाथी घास, आर्द्रभूमि, जंगली भैंसे और दलदली हिरण पाए जाते हैं।",
        "यह दुनिया के दो-तिहाई दुर्लभ एक सींग वाले गैंडों के प्राकृतिक घर के रूप में प्रसिद्ध है।"
      ]
    }
  },
  {
    id: "charminar",
    state: "Telangana",
    stateName: {
      en: "Telangana",
      as: "তেলেংগানা",
      bn: "তেলেঙ্গানা",
      hi: "तेलंगाना"
    },
    category: "monument_heritage",
    icon: "🏛️",
    name: {
      en: "Charminar, Hyderabad",
      as: "চাৰমিনাৰ, হায়দৰাবাদ",
      bn: "চারমিনার, হায়দ্রাবাদ",
      hi: "चारमीनार, हैदराबाद"
    },
    clues: {
      en: [
        "It stands in the bustling heart of Hyderabad near the historic Laad Bazaar and Musi River.",
        "It is a square structure featuring four grand arches facing the cardinal directions, each topped by an elegant 56-meter minaret.",
        "Surrounding it are bustling markets world-famous for natural pearl jewelry and traditional glass lac bangles.",
        "It was built in 1591 by Muhammad Quli Qutb Shah to commemorate the eradication of a devastating plague."
      ],
      as: [
        "ই তেলেংগানাৰ ৰাজধানী হায়দৰাবাদৰ বিখ্যাত লাদ বজাৰৰ কাষত অৱস্থিত।",
        "ইয়াৰ চাৰিওফালে চাৰিটা সুবিশাল তোৰণ আৰু ৫৬ মিটাৰ ওখ চাৰিটা সুন্দৰ মিনাৰ আছে।",
        "ইয়াৰ চৌপাশে খাঁটি মুকুতাৰ গহনা আৰু কাঁচৰ খাৰুৰ বিশ্ববিখ্যাত বজাৰ অৱস্থিত।",
        "ই ১৫৯১ চনত চুলতান মহম্মদ কুলি কুতুব শ্বাহে নিৰ্মাণ কৰোৱা ঐতিহাসিক চাৰমিনাৰ।"
      ],
      bn: [
        "এটি হায়দ্রাবাদের প্রাণকেন্দ্রে ঐতিহাসিক লাদ বাজার ও মুসি নদীর তীরে অবস্থিত।",
        "এর চারদিকে চারটি বিশাল খিলান এবং চার কোণায় চারটি ৫৬ মিটার উঁচু সুদৃশ্য মিনার রয়েছে।",
        "এর সংলগ্ন বাজারে বিশ্বখ্যাত খাঁটি মুক্তোর গয়না ও ঐতিহ্যবাহী কাঁচের চুড়ি পাওয়া যায়।",
        "১৫৯১ সালে কুতুব শাহি বংশের সুলতান মুহম্মদ কুলি কুতুব শাহ এটি নির্মাণ করেন।"
      ],
      hi: [
        "यह तेलंगाना के हैदराबाद के प्राचीन केंद्र में मूसी नदी और लाड़ बाज़ार के पास स्थित है।",
        "इस चौकोर स्मारक में चार भव्य मेहराब और चारों कोनों पर ५६ मीटर ऊँची चार सुंदर मीनारें हैं।",
        "इसके आसपास का बाज़ार मोतियों के आभूषणों और लाख की चूड़ियों के लिए विश्वविख्यात है।",
        "यह सन् १५९१ में सुल्तान मुहम्मद कुली क़ुतुब शाह द्वारा निर्मित ऐतिहासिक चारमीनार है।"
      ]
    }
  },
  {
    id: "alleppey_backwaters",
    state: "Kerala",
    stateName: {
      en: "Kerala",
      as: "কেৰালা",
      bn: "কেরালা",
      hi: "केरल"
    },
    category: "river_nature",
    icon: "🌴",
    name: {
      en: "Alleppey (Alappuzha) Backwaters",
      as: "আলেপ্পীৰ ব্যাকৱাটাৰ, কেৰালা",
      bn: "আলেপ্পির ব্যাকওয়াটার, কেরালা",
      hi: "अल्लेप्पी (केरल) के बैकवाटर"
    },
    clues: {
      en: [
        "It is located on the tropical southwestern Malabar coast of India, often titled the 'Venice of the East'.",
        "It is a tranquil labyrinth of palm-fringed canals, lagoons, and lakes parallel to the Arabian Sea.",
        "It is world-renowned for traditional thatched houseboats (Kettuvallam) cruising peacefully through coconut groves.",
        "It hosts the thrilling annual Nehru Trophy Boat Race featuring magnificent hundred-foot snake boats (Chundan Vallam)."
      ],
      as: [
        "ই দক্ষিণ-পশ্চিম ভাৰতৰ মালাবাৰ উপকূলৰ কেৰালাত অৱস্থিত, যাক 'পূবৰ ভেনিচ' বুলি জনা যায়।",
        "ই নাৰিকল গছেৰে আবৃত শান্ত খাল, উপহ্ৰদ আৰু নদীৰ এক অপূৰ্ব জলপথ।",
        "ইয়াত পৰম্পৰাগত কাঠ আৰু নলেৰে সজোৱা কেট্টুভল্লম হাউচব’টত পৰ্যটকসকলে ভ্ৰমণ কৰে।",
        "প্ৰতি বছৰে ইয়াত বিখ্যাত নেহৰু ট্ৰফীৰ সাঁপৰ আকৃতিৰ বিশাল নাওঁৰ প্ৰতিযোগিতা অনুষ্ঠিত হয়।"
      ],
      bn: [
        "এটি ভারতের দক্ষিণ-পশ্চিম মালাবার উপকূলে কেরালায় অবস্থিত, যাকে 'প্রাচ্যের ভেনিস' বলা হয়।",
        "এটি নারকেল ও পাম গাছে ঘেরা শান্ত খাল, হ্রদ ও লেগুনের এক মনোরম জলজাল।",
        "এখানে ঐতিহ্যবাহী খড়ের ছাদযুক্ত হাউসবোটে (কেট্টুভল্লম) ভেসে শান্ত জলভ্রমণ করা যায়।",
        "এখানে প্রতি বছর ঐতিহ্যবাহী শতফুট দীর্ঘ সর্পনৌকার (চুন্দন বল্লম) রোমাঞ্চকর প্রতিযোগিতা হয়।"
      ],
      hi: [
        "यह दक्षिण-पश्चिम भारत के केरल के मालाबार तट पर स्थित है, जिसे 'पूर्व का वेनिस' भी कहा जाता है।",
        "यह नारियल के घने कुंजों, शांत नहरों और लैगून का एक अद्भुत व मनोरम जल-संसार है।",
        "यहाँ पारंपरिक लकड़ी व फूस की छतों वाली हाउसबोट (केट्टुवल्लम) में ठहरने का अनूठा अनुभव मिलता है।",
        "यहाँ प्रतिवर्ष नेहरू ट्रॉफी के तहत सौ फुट लंबी विशाल सर्प-नौकाओं (चुंदन वल्लम) की रोमांचक दौड़ होती है।"
      ]
    }
  },
  {
    id: "sanchi_stupa",
    state: "Madhya Pradesh",
    stateName: {
      en: "Madhya Pradesh",
      as: "মধ্যপ্ৰদেশ",
      bn: "মধ্যপ্রদেশ",
      hi: "मध्य प्रदेश"
    },
    category: "monument_heritage",
    icon: "🛕",
    name: {
      en: "Great Stupa of Sanchi",
      as: "সাঁচীৰ মহান স্তূপ",
      bn: "সাঁচির মহান স্তূপ",
      hi: "साँची का महान स्तूप"
    },
    clues: {
      en: [
        "It crowns a serene hilltop near the Betwa River in the central Indian state of Madhya Pradesh.",
        "It is the oldest intact stone structure in India, originally commissioned by Emperor Ashoka the Great in the 3rd century BCE.",
        "It features four magnificent ceremonial stone gateways (Toranas) carved with intricate stories of Lord Buddha's life and Jataka tales.",
        "It is crowned by the sacred stone Chhatri umbrella atop its massive hemispherical dome encasing holy relics."
      ],
      as: [
        "ই মধ্য ভাৰতৰ মধ্যপ্ৰদেশৰ বেতৱা নদীৰ কাষৰ এক শান্ত পাহাৰৰ ওপৰত অৱস্থিত।",
        "ই ভাৰতৰ অন্যতম প্ৰাচীন অক্ষত শিলৰ স্থাপত্য, যি খ্ৰীষ্টপূৰ্ব তৃতীয় শতিকাত সম্ৰাট অশোকে নিৰ্মাণ কৰিছিল।",
        "ইয়াৰ চাৰিটা দিশত চাৰিখন বিশাল তোৰণ আছে য’ত বুদ্ধদেৱৰ জীৱন আৰু জাতকৰ কাহিনী খোদিত আছে।",
        "ই ভগৱান বুদ্ধৰ পৱিত্ৰ ধাতু সংৰক্ষণ কৰা সাঁচীৰ মহান বৌদ্ধ স্তূপ।"
      ],
      bn: [
        "এটি মধ্যপ্রদেশের বেতোয়া নদীর সন্নিকটে একটি শান্ত পাহাড়ের চূড়ায় অবস্থিত।",
        "এটি ভারতের অন্যতম প্রাচীন শিলা স্থাপত্য, যা খ্রিস্টপূর্ব তৃতীয় শতকে মহামতি অশোক প্রতিষ্ঠা করেছিলেন।",
        "এর চারদিকে চারটি অপূর্ব পাথরের তোরণ রয়েছে যাতে বুদ্ধদেবের জীবনী ও জাতকের গল্প খোদিত।",
        "এটি বৌদ্ধ ঐতিহ্যের পরম পবিত্র প্রতীক সাঁচীর মহামহিমাম্বিত স্তূপ।"
      ],
      hi: [
        "यह मध्य भारत के मध्य प्रदेश में बेतवा नदी के समीप एक शांत पहाड़ी पर स्थित है।",
        "यह भारत की सबसे प्राचीन पाषाण संरचनाओं में से एक है, जिसे ईसा पूर्व तीसरी शताब्दी में सम्राट अशोक ने बनवाया था।",
        "इसके चारों ओर चार अलंकृत तोरण द्वार हैं जिन पर भगवान बुद्ध के जीवन और जातक कथाओं की सुंदर नक्काशी है।",
        "यह पावन बौद्ध अवशेषों को सहेजे हुए 'साँची का महान स्तूप' है।"
      ]
    }
  },
  {
    id: "mysore_palace",
    state: "Karnataka",
    stateName: {
      en: "Karnataka",
      as: "কৰ্ণাটক",
      bn: "কর্ণাটক",
      hi: "कर्नाटक"
    },
    category: "palace_heritage",
    icon: "🏰",
    name: {
      en: "Mysore Palace (Amba Vilas)",
      as: "মহীশূৰ ৰাজপ্ৰাসাদ",
      bn: "মহীশূর রাজপ্রাসাদ",
      hi: "मैसूर महल (अम्बा विलास)"
    },
    clues: {
      en: [
        "It is situated in the historic royal city of Mysuru in the southern state of Karnataka.",
        "It is a breathtaking Indo-Saracenic palace with granite domes, stained glass ceilings, and carved teakwood pillars.",
        "During the autumn Dasara festival, the entire palace is illuminated every evening by nearly one hundred thousand golden incandescent bulbs.",
        "It was the royal seat of the Wadiyar dynasty and is celebrated as the Amba Vilas Palace."
      ],
      as: [
        "ই দক্ষিণ ভাৰতৰ কৰ্ণাটকৰ ঐতিহাসিক ৰাজকীয় চহৰ মহীশূৰত অৱস্থিত।",
        "ই গ্ৰেনাইট শিল, ৰঙীন কাঁচৰ চালি আৰু কাঠেৰে সজোৱা এক অপূৰ্ব ৰাজপ্ৰাসাদ।",
        "দশেৰা উৎসৱৰ সময়ত প্ৰায় এক লাখ বিজুলী বাতিৰে সমগ্ৰ ৰাজপ্ৰাসাদটো সোণালী পোহৰত জিলিকাই তোলা হয়।",
        "ই ৱাডিয়াৰ ৰাজবংশৰ ঐতিহাসিক বাসগৃহ আৰু বিখ্যাত অম্বা বিলাস প্ৰাসাদ।"
      ],
      bn: [
        "এটি দক্ষিণ ভারতের কর্ণাটকের ঐতিহাসিক নগরী মহীশূরের কেন্দ্রস্থলে অবস্থিত।",
        "এটি গ্রানাইট পাথর, রঙিন কাচ ও খোদাই করা মেহগনি কাঠে নির্মিত এক অপূর্ব প্রাসাদ।",
        "দশেরা উৎসবের সময় প্রায় এক লক্ষ প্রদীপ্ত বাল্বে সমগ্র রাজপ্রাসাদটি স্বর্ণালী আভায় আলোকিত হয়।",
        "এটি ওয়াদিয়ার রাজপরিবারের ঐতিহাসিক আম্বা বিলাস রাজপ্রাসাদ।"
      ],
      hi: [
        "यह दक्षिण भारत के कर्नाटक के ऐतिहासिक नगर मैसूरु में स्थित भव्य राजमहल है।",
        "यह ग्रेनाइट पत्थरों, रंगीन शीशों की छतों और नक्काशीदार खंभों से बना भारत-अरबी वास्तुकला का अनुपम उदाहरण है।",
        "प्रसिद्ध मैसूर दशहरा महोत्सव के दौरान यह महल लगभग एक लाख जगमगाते बल्बों की रोशनी से नहा उठता है।",
        "यह वाडियार राजवंश का ऐतिहासिक राजसिंहासन 'अम्बा विलास पैलेस' है।"
      ]
    }
  },
  {
    id: "rann_of_kutch",
    state: "Gujarat",
    stateName: {
      en: "Gujarat",
      as: "গুজৰাট",
      bn: "গুজরাট",
      hi: "गुजरात"
    },
    category: "desert_nature",
    icon: "🏜️",
    name: {
      en: "Great Rann of Kutch (White Desert)",
      as: "কচ্ছৰ বগা মৰুভূমি",
      bn: "কচ্ছের সাদা মরুভূমি",
      hi: "कच्छ का रण (श्वेत मरुस्थल)"
    },
    clues: {
      en: [
        "It is located along the western coast of India in the vibrant state of Gujarat near the Arabian Sea.",
        "It is one of the world's largest seasonal salt marshes, transforming into an endless shimmering expanse of white salt under the full moon.",
        "Every winter, it hosts the vibrant three-month Rann Utsav celebrating Kutchi folk music, dance, and colorful embroidery.",
        "It is also a natural sanctuary for the endangered Indian Wild Ass (Khur) and thousands of migratory greater flamingos."
      ],
      as: [
        "ই পশ্চিম ভাৰতৰ গুজৰাটৰ উপকূলত অৱস্থিত পৃথিৱীৰ সৰ্ববৃহৎ নিমখৰ মৰুভূমি।",
        "পূৰ্ণিমাৰ নিশাত চন্দ্ৰৰ পোহৰত ইয়াৰ শুভ্ৰ নিমখৰ বিশাল সমভূমি ৰূপালী পোহৰৰ দৰে জিলিকে।",
        "প্ৰতি শীতকালত ইয়াত তিনিমহীয়া কচ্ছ উৎসৱ অনুষ্ঠিত হয় য’ত থলুৱা লোকসংগীত আৰু হস্তশিল্প প্ৰদৰ্শিত হয়।",
        "ই ভাৰতৰ বিৰল বনৰীয়া গাধ আৰু হাজাৰ হাজাৰ ৰাজহাঁহৰ এক প্ৰাকৃতিক বিচৰণভূমি।"
      ],
      bn: [
        "এটি ভারতের পশ্চিম প্রান্তে গুজরাটের উপকূল সংলগ্ন পৃথিবীর অন্যতম বৃহত্তম লবণের মরুভূমি।",
        "পূর্ণিমার রাতে চাঁদের আলোয় মাইলের পর মাইল বিস্তৃত শুভ্র লবণের প্রান্তর রূপালি চাদরের মতো জ্বলজ্বল করে।",
        "শীতকালে এখানে বিখ্যাত তিন মাসব্যাপী 'রণ উৎসব' উদযাপিত হয় যা হস্তশিল্প ও লোকগীতিতে মুখরিত থাকে।",
        "এটি বিরল ভারতীয় বুনো গাধা ও পরিযায়ী ফ্লেমিঙ্গো পাখির প্রাকৃতিক আশ্রয়স্থল।"
      ],
      hi: [
        "यह भारत के पश्चिमी राज्य गुजरात में थार मरुस्थल और अरब सागर के बीच स्थित है।",
        "यह दुनिया के सबसे बड़े नमक के मैदानों में से एक है जो पूर्णिमा की रात को चाँदी की तरह चमकता है।",
        "सर्दियों में यहाँ तीन महीने का भव्य 'रण उत्सव' आयोजित होता है जिसमें कच्छी लोककला और संगीत की धूम रहती है।",
        "यह दुर्लभ भारतीय जंगली गधे (खुर) और हज़ारों प्रवासी राजहंसों (फ्लेमिंगो) का प्राकृतिक घर है।"
      ]
    }
  }
];