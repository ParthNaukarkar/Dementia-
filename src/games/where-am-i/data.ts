import type { SupportedLanguage } from '../../types/prescription';

export interface LocationData {
  id: string;
  state: 'Assam' | 'Meghalaya' | 'Manipur' | 'Arunachal Pradesh' | 'Nagaland' | 'Tripura';
  stateName: Record<SupportedLanguage, string>;
  category: 'wildlife_sanctuary' | 'river_island' | 'temple_heritage' | 'lake_nature' | 'monastery_heritage' | 'hills_waterfalls' | 'monument_heritage' | 'palace_heritage' | 'valley_nature' | 'cultural_heritage' | 'nature_wonder' | 'landmark_engineering' | 'tea_estate' | 'river_nature';
  icon: string;
  name: Record<SupportedLanguage, string>;
  clues: Record<SupportedLanguage, string[]>;
}

export const LOCATIONS: LocationData[] = [
  {
    "id": "kaziranga",
    "state": "Assam",
    "stateName": {
      "en": "Assam",
      "as": "অসম",
      "bn": "আসাম",
      "hi": "असम"
    },
    "category": "wildlife_sanctuary",
    "icon": "🦏",
    "name": {
      "en": "Kaziranga National Park",
      "as": "কাজিৰঙা ৰাষ্ট্ৰীয় উদ্যান",
      "bn": "কাজিরাপঙা জাতীয় উদ্যান",
      "hi": "काजीरंगा राष्ट्रीय उद्यान"
    },
    "clues": {
      "en": [
        "It is located in the fertile floodplains of Assam along the Brahmaputra River.",
        "It is a prestigious UNESCO World Heritage Site recognized for biodiversity.",
        "It features tall elephant grass, wetlands, and tropical broadleaf forests.",
        "It is world-renowned as home to two-thirds of the Great Indian One-Horned Rhinoceros."
      ],
      "as": [
        "এই স্থানখন অসমত ব্ৰহ্মপুত্ৰ নদীৰ পাৰৰ উৰ্বৰ সমভূমিত অৱস্থিত।",
        "ই জৈৱ বৈচিত্ৰ্যৰ বাবে ইউনেস্কোৰ বিশ্ব ঐতিহ্য ক্ষেত্ৰৰ স্বীকৃতি প্ৰাপ্ত।",
        "ইয়াত ওখ নল-খাগৰি, জলাশয় আৰু ক্ৰান্তীয় বনাঞ্চল আছে।",
        "ই পৃথিৱীৰ দুই-তৃতীয়াংশ এশিঙীয়া গঁড়ৰ বাবে বিশ্ববিখ্যাত।"
      ],
      "bn": [
        "এই স্থানটি আসামের ব্রহ্মপুত্র নদের উর্বর প্লাবনভূমিতে অবস্থিত।",
        "এটি জীববৈচিত্র্যের জন্য ইউনেস্কো ওয়ার্ল্ড হেরিটেজ সাইট হিসেবে স্বীকৃত।",
        "এখানে উঁচু নল-খাগড়া, জলাভূমি ও ক্রান্তীয় অরণ্য রয়েছে।",
        "এটি বিশ্বের দুই-তৃতীয়াংশ একশৃঙ্গ গণ্ডারের আবাসস্থল হিসেবে বিশ্বখ্যাত।"
      ],
      "hi": [
        "यह असम में ब्रह्मपुत्र नदी के उपजाऊ मैदानों में स्थित है।",
        "यह जैव विविधता के लिए यूनेस्को विश्व धरोहर स्थल के रूप में मान्यता प्राप्त है।",
        "यहाँ विशाल हाथी घास, आर्द्रभूमि और सघन उष्णकटिबंधीय वन हैं।",
        "यह दुनिया के दो-तिहाई एक सींग वाले गैंडों के घर के रूप में प्रसिद्ध है।"
      ]
    }
  },
  {
    "id": "majuli",
    "state": "Assam",
    "stateName": {
      "en": "Assam",
      "as": "অসম",
      "bn": "আসাম",
      "hi": "असम"
    },
    "category": "river_island",
    "icon": "🏝️",
    "name": {
      "en": "Majuli River Island",
      "as": "মাজুলী নদী দ্বীপ",
      "bn": "মাজুলী নদী দ্বীপ",
      "hi": "माजुली नदी द्वीप"
    },
    "clues": {
      "en": [
        "It is cradled by the waters of the Brahmaputra and Subansiri rivers in Assam.",
        "It is the cradle of Assamese neo-Vaishnavite culture and historic Satra monasteries.",
        "It is internationally celebrated for traditional clay mask-making and pottery.",
        "It holds the Guinness World Record as the largest inhabited river island on Earth."
      ],
      "as": [
        "ই অসমত ব্ৰহ্মপুত্ৰ আৰু সোৱণশিৰি নদীৰ বুকুত অৱস্থিত।",
        "ই মহাপুৰুষ শ্ৰীমন্ত শংকৰদেৱ প্ৰৱৰ্তিত নৱ-বৈষ্ণৱ সত্ৰীয়া সংস্কৃতিৰ কেন্দ্ৰস্থল।",
        "ই পৰম্পৰাগত মাটিৰ মুখা শিল্প আৰু মৃৎশিল্পৰ বাবে জনাজাত।",
        "ই পৃথিৱীৰ সৰ্ববৃহৎ জনবসতিপূৰ্ণ নদী দ্বীপ হিচাপে গিনিজ বুকত অন্তৰ্ভুক্ত।"
      ],
      "bn": [
        "এটি আসামে ব্রহ্মপুত্র ও সুবর্ণসিঁড়ি নদীর বুকে অবস্থিত।",
        "এটি নব্য-বৈষ্ণব সত্ৰিয়া সংস্কৃতির মূল কেন্দ্র ও আধ্যাত্মিক রাজধানী।",
        "এটি ঐতিহ্যবাহী মুখোশ নির্মাণ ও মৃৎশিল্পের জন্য বিখ্যাত।",
        "এটি পৃথিবীর বৃহত্তম মানববসতিপূর্ণ নদী দ্বীপ।"
      ],
      "hi": [
        "यह असम में ब्रह्मपुत्र और सुबनसिरी नदियों के बीच स्थित है।",
        "यह असमिया नव-वैष्णव सत्र संस्कृति का ऐतिहासिक केंद्र है।",
        "यह पारंपरिक मुखौटा निर्माण और मिट्टी के बर्तनों के लिए प्रसिद्ध है।",
        "यह पृथ्वी पर सबसे बड़ा आबाद नदी द्वीप होने का गिनीज रिकॉर्ड रखता है।"
      ]
    }
  },
  {
    "id": "kamakhya",
    "state": "Assam",
    "stateName": {
      "en": "Assam",
      "as": "অসম",
      "bn": "আসাম",
      "hi": "असम"
    },
    "category": "temple_heritage",
    "icon": "🛕",
    "name": {
      "en": "Kamakhya Temple",
      "as": "কামাখ্যা মন্দিৰ",
      "bn": "কামাখ্যা মন্দির",
      "hi": "कामाख्या मंदिर"
    },
    "clues": {
      "en": [
        "It is perched atop the sacred Nilachal Hill overlooking Guwahati in Assam.",
        "It is one of the oldest and most revered of the 51 Shakti Peethas in Tantric tradition.",
        "The sanctum houses no statue, but a natural rock fissure shaped as a yoni fed by a spring.",
        "It hosts the legendary annual Ambubachi Mela celebrating the generative power of Mother Earth."
      ],
      "as": [
        "এই মন্দিৰ অসমৰ গুৱাহাটীৰ পবিত্ৰ নীলাচল পাহাৰৰ চূড়াত অৱস্থিত।",
        "ই ৫১টা শক্তিপীঠৰ অন্যতম প্ৰাচীন আৰু সৰ্বাধিক মৰ্যাদাপূৰ্ণ তীৰ্থস্থান।",
        "ইয়াৰ গৰ্ভগৃহত কোনো মূৰ্তি নাই, বৰঞ্চ প্ৰাকৃতিক শিলৰ যোনিপীঠ আৰু জুৰি আছে।",
        "ইয়াত প্ৰতি বছৰে বিখ্যাত অম্বুবাচী মেলা মহাসমাৰোহেৰে অনুষ্ঠিত হয়।"
      ],
      "bn": [
        "এই পবিত্র মন্দির আসামের গুয়াহাটির নীলাচল পাহাড়ের চূড়ায় অবস্থিত।",
        "এটি ৫১টি শক্তিপীঠের অন্যতম প্রধান ও প্রাচীন তান্ত্রিক তীর্থস্থল।",
        "গর্ভগৃহে কোনো প্রতিমা নেই, কেবল ভূগর্ভস্থ ঝর্ণা দ্বারা সিক্ত একটি প্রাকৃতিক শিলাখন্ড রয়েছে।",
        "এখানে প্রতি বছর বিখ্যাত অম্বুবাচী মেলা উদযাপিত হয়।"
      ],
      "hi": [
        "यह असम के गुवाहाटी में पवित्र नीलाचल पहाड़ी पर स्थित है।",
        "यह ५१ शक्तिपीठों में से एक अत्यंत प्राचीन एवं सिद्ध शक्तिपीठ है।",
        "गर्भगृह में कोई मूर्ति नहीं, बल्कि एक प्राकृतिक शिला और जलस्रोत है।",
        "यहाँ प्रतिवर्ष प्रसिद्ध अंबुबाची मेला आयोजित किया जाता है।"
      ]
    }
  },
  {
    "id": "loktak",
    "state": "Manipur",
    "stateName": {
      "en": "Manipur",
      "as": "মণিপুৰ",
      "bn": "মণিপুর",
      "hi": "मणिपुर"
    },
    "category": "lake_nature",
    "icon": "🌊",
    "name": {
      "en": "Loktak Lake",
      "as": "লকটক হ্ৰদ",
      "bn": "লোকতাক হ্রদ",
      "hi": "लोकतक झील"
    },
    "clues": {
      "en": [
        "It is nestled in the scenic valley of Manipur in Northeast India.",
        "It is the largest freshwater lake across the entire northeastern region.",
        "It is internationally famous for floating circular islands of vegetation called Phumdis.",
        "It hosts Keibul Lamjao, the world's only floating national park and refuge of the dancing Sangai deer."
      ],
      "as": [
        "ই উত্তৰ-পূব ভাৰতৰ মণিপুৰ ৰাজ্যৰ উপত্যকাত অৱস্থিত।",
        "ই সমগ্ৰ উত্তৰ-পূব ভাৰতৰ সৰ্ববৃহৎ নিৰ্মল পানীৰ হ্ৰদ।",
        "ই বৃত্তাকাৰ ওপঙি থকা জৈৱিক দ্বীপ বা ফুমডিৰ বাবে বিখ্যাত।",
        "ইয়াতেই পৃথিৱীৰ একমাত্ৰ ওপঙি থকা ৰাষ্ট্ৰীয় উদ্যান আৰু দুষ্প্ৰাপ্য চাংগাই পহুৰ বাসস্থান আছে।"
      ],
      "bn": [
        "এটি উত্তর-পূর্ব ভারতের মণিপুর রাজ্যের মনোরম উপত্যকায় অবস্থিত।",
        "এটি উত্তর-পূর্ব ভারতের সর্ববৃহৎ সুপেয় জলের হ্রদ।",
        "এটি বৃত্তাকার ভাসমান দ্বীপ বা ফুমডির জন্য জগৎখ্যাত।",
        "এখানে বিশ্বের একমাত্র ভাসমান জাতীয় উদ্যান এবং বিরল সাঙ্গাই হরিণ বাস করে।"
      ],
      "hi": [
        "यह पूर्वोत्तर भारत के मणिपुर राज्य में स्थित है।",
        "यह पूर्वोत्तर भारत की सबसे बड़ी मीठे पानी की झील है।",
        "यह पानी पर तैरते हुए गोलाकार द्वीपों जिन्हें फुमदी कहते हैं, के लिए प्रसिद्ध है।",
        "यहाँ दुनिया का एकमात्र तैरता हुआ केबुल लामजाओ राष्ट्रीय उद्यान और संगाई हिरण स्थित हैं।"
      ]
    }
  },
  {
    "id": "tawang",
    "state": "Arunachal Pradesh",
    "stateName": {
      "en": "Arunachal Pradesh",
      "as": "অৰুণাচল প্ৰদেশ",
      "bn": "অরুণাচল প্রদেশ",
      "hi": "अरुणाचल प्रदेश"
    },
    "category": "monastery_heritage",
    "icon": "🏮",
    "name": {
      "en": "Tawang Monastery",
      "as": "টাৱাং বৌদ্ধ মঠ",
      "bn": "তাওয়াং বৌদ্ধ মঠ",
      "hi": "तवांग बौद्ध मठ"
    },
    "clues": {
      "en": [
        "It is perched in the snow-capped Himalayan ranges of Arunachal Pradesh at 3,000 meters.",
        "It belongs to the Gelug school of Mahayana Buddhism, founded in 1680.",
        "It houses a priceless 8-meter high gilded Buddha statue and centuries-old Tibetan scriptures.",
        "It is the largest Buddhist monastery in India and the second largest in the world."
      ],
      "as": [
        "ই অৰুণাচল প্ৰদেশৰ হিমালয়ৰ কোলাত প্ৰায় ৩,০০০ মিটাৰ উচ্চতাত অৱস্থিত।",
        "ই ১৬৮০ চনত প্ৰতিষ্ঠিত গেলুগ পন্থীয় মহাযান বৌদ্ধ ধৰ্মৰ এক পবিত্ৰ স্থান।",
        "ইয়াত ৮ মিটাৰ ওখ সোণৰ জলপ দিয়া বুদ্ধৰ মূৰ্তি আৰু প্ৰাচীন তিব্বতী পাণ্ডুলিপি আছে।",
        "ই ভাৰতৰ সৰ্ববৃহৎ আৰু বিশ্বৰ দ্বিতীয় বৃহত্তম বৌদ্ধ মঠ।"
      ],
      "bn": [
        "এটি অরুণাচল প্রদেশের তুষারাবৃত হিমালয়ের ৩,০০০ মিটার উচ্চতায় অবস্থিত।",
        "এটি ১৬৮০ সালে প্রতিষ্ঠিত গেলুগপা সম্প্রদায়ের অন্যতম পবিত্র মহাযান কেন্দ্র।",
        "এখানে ৮ মিটার উঁচু স্বর্ণখচিত বুদ্ধ মূর্তি ও শত শত বছরের তিব্বতি পুথি রক্ষিত আছে।",
        "এটি ভারতের বৃহত্তম এবং বিশ্বের দ্বিতীয় বৃহত্তম বৌদ্ধ মঠ।"
      ],
      "hi": [
        "यह अरुणाचल प्रदेश में हिमालय की गोद में ३,००० मीटर की ऊंचाई पर स्थित है।",
        "यह १६८० में स्थापित गेलुग्पा संप्रदाय का प्रमुख बौद्ध केंद्र है।",
        "यहाँ ८ मीटर ऊंची स्वर्ण मंडित बुद्ध प्रतिमा और प्राचीन तिब्बती पांडुलिपियां हैं।",
        "यह भारत का सबसे बड़ा और ल्हासा के बाद विश्व का दूसरा सबसे बड़ा बौद्ध मठ है।"
      ]
    }
  },
  {
    "id": "cherrapunji",
    "state": "Meghalaya",
    "stateName": {
      "en": "Meghalaya",
      "as": "মেঘালয়",
      "bn": "মেঘালয়",
      "hi": "मेघालय"
    },
    "category": "hills_waterfalls",
    "icon": "🌧️",
    "name": {
      "en": "Cherrapunji (Sohra)",
      "as": "চেৰাপুঞ্জী (চোহৰা)",
      "bn": "চেরাপুঞ্জি (সোহরা)",
      "hi": "चेरापूंजी (सोहरा)"
    },
    "clues": {
      "en": [
        "It sits on the high southern plateau of the East Khasi Hills in Meghalaya.",
        "It overlooks dramatic limestone cliffs and the spectacular plunging Nohkalikai Falls.",
        "Indigenous Khasi communities engineered bio-living root bridges across roaring torrents here.",
        "It was historically recorded in meteorological annals as the wettest place on Earth."
      ],
      "as": [
        "ই মেঘালয়ৰ পূব খাছি পাহাৰৰ উচ্চ দক্ষিণাঞ্চলীয় মালভূমিত অৱস্থিত।",
        "ইয়াৰ পৰা মনোৰম নোহকালিকাই জলপ্ৰপাত আৰু গভীৰ গিৰিখাদ দেখা যায়।",
        "ইয়াত খাচী জনজাতীয় লোকে গছৰ শিপাৰে জীৱন্ত দলং নিৰ্মাণ কৰিছিল।",
        "ই ঐতিহাসিকভাৱে পৃথিৱীৰ সৰ্বাধিক বৃষ্টিপাত হোৱা স্থান হিচাপে পৰিচিত।"
      ],
      "bn": [
        "এটি মেঘালয়ের পূর্ব খাসি পাহাড়ের উচ্চ মালভূমিতে অবস্থিত।",
        "এখান থেকে বিখ্যাত নোহকালিকাই জলপ্রপাত ও মনোরম চুনাপাথরের উপত্যকা দেখা যায়।",
        "এখানে স্থানীয় খাসি উপজাতিরা গাছের জীবন্ত শিকড় দিয়ে মজবুত সেতু তৈরি করেছে।",
        "এটি আবহাওয়া বিজ্ঞানের ইতিহাসে পৃথিবীর সবচেয়ে বৃষ্টিবহুল স্থান হিসেবে চিহ্নিত।"
      ],
      "hi": [
        "यह मेघालय के पूर्वी खासी हिल्स के ऊंचे पठार पर स्थित है।",
        "यहाँ से विहंगम नोहकलिकाई जलप्रपात और गहरी चूना पत्थर की घाटियाँ दिखाई देती हैं।",
        "यहाँ खासी जनजाति द्वारा पेड़ों की जीवित जड़ों से बनाए गए प्राकृतिक पुल हैं।",
        "यह ऐतिहासिक रूप से पृथ्वी पर सबसे अधिक वर्षा वाले स्थान के रूप में जाना जाता है।"
      ]
    }
  },
  {
    "id": "sivasagar",
    "state": "Assam",
    "stateName": {
      "en": "Assam",
      "as": "অসম",
      "bn": "আসাম",
      "hi": "असम"
    },
    "category": "monument_heritage",
    "icon": "🏛️",
    "name": {
      "en": "Sivasagar Rang Ghar",
      "as": "শিৱসাগৰ ৰংঘৰ",
      "bn": "শিবসাগর রংঘর",
      "hi": "शिवसागर रंग घर"
    },
    "clues": {
      "en": [
        "It was the glorious royal capital of the Ahom Dynasty in Upper Assam.",
        "It is built beside a colossal historic man-made reservoir called Borpukhuri.",
        "It features subterranean battle fortifications with escape tunnels at Talatal Ghar.",
        "It houses Rang Ghar, a two-storeyed royal sports pavilion recognized as Asia's oldest amphitheatre."
      ],
      "as": [
        "ই উজনি অসমত ৬০০ বছৰ শাসন কৰা আহোম স্বৰ্গদেউসকলৰ ঐতিহাসিক ৰাজধানী আছিল।",
        "ই বৰপুখুৰী নামৰ বিশাল ঐতিহাসিক মানৱসৃষ্ট পুখুৰীৰ পাৰত অৱস্থিত।",
        "ইয়াত যুদ্ধৰ সুৰক্ষা আৰু সুৰংগ থকা তলাতল ঘৰ আৰু কাৰেংঘৰ আছে।",
        "ইয়াত এছিয়াৰ সৰ্বপ্ৰথম খেল-ধেমালিৰ ৰাজপ্ৰাসাদ বা পেভিলিয়ন ৰংঘৰ অৱস্থিত।"
      ],
      "bn": [
        "এটি উজনি আসামে ৬০০ বছর রাজত্বকারী আহোম রাজাদের ঐতিহাসিক রাজধানী ছিল।",
        "এটি বরপুখুরী নামের এক সুবিশাল ঐতিহাসিক হ্রদের তীরে গড়ে উঠেছিল।",
        "এখানে মাটির নিচের গোপন সুড়ঙ্গ সম্বলিত তালাতল ঘর অবস্থিত।",
        "এখানে অবস্থিত রংঘর, যা এশিয়ার প্রাচীনতম ক্রীড়া ও সাংস্কৃতিক অ্যাম্পিথিয়েটার।"
      ],
      "hi": [
        "यह ऊपरी असम में ६०० वर्षों तक शासन करने वाले अहोम साम्राज्य की राजधानी थी।",
        "यह ऐतिहासिक बोरपुखुरी नामक विशाल कृत्रिम सरोवर के तट पर स्थित है।",
        "यहाँ युद्धकालीन गुप्त सुरंगों से युक्त तलातल घर स्थित है।",
        "यहाँ दो मंजिला रंग घर स्थित है, जिसे एशिया का सबसे पुराना क्रीड़ा रंगमंच माना जाता है।"
      ]
    }
  },
  {
    "id": "ujjayanta",
    "state": "Tripura",
    "stateName": {
      "en": "Tripura",
      "as": "ত্ৰিপুৰা",
      "bn": "ত্রিপুরা",
      "hi": "त्रिपुरा"
    },
    "category": "palace_heritage",
    "icon": "🏰",
    "name": {
      "en": "Ujjayanta Palace",
      "as": "উজ্জয়ন্ত প্ৰাসাদ",
      "bn": "উজ্জয়ন্ত প্রাসাদ",
      "hi": "उज्जयंत पैलेस"
    },
    "clues": {
      "en": [
        "It stands majestically in the heart of Agartala, the capital of Tripura.",
        "It was bestowed its poetic name by Nobel laureate Rabindranath Tagore during royal visits.",
        "It features grand neoclassical domes, tiled marble floors, and Mughal-style garden fountains.",
        "It was the seat of the Manikya kings and now houses the state museum celebrating Northeast heritage."
      ],
      "as": [
        "ই ত্ৰিপুৰাৰ ৰাজধানী আগৰতলাৰ বুকুত গাম্ভীৰ্যপূৰ্ণভাৱে দণ্ডায়মান।",
        "ইয়াৰ এই কাব্যিক নামটো বিশ্বকবি ৰবীন্দ্ৰনাথ ঠাকুৰে প্ৰদান কৰিছিল।",
        "ইয়াত সুন্দৰ মোগল শৈলীৰ বাগিচা, ফোৱাৰা আৰু মাৰ্বল পাথৰৰ বিশাল গম্বুজ আছে।",
        "ই মাণিক্য ৰাজবংশৰ ৰাজপ্ৰাসাদ আছিল আৰু বৰ্তমান ই উত্তৰ-পূব ঐতিহ্যৰ ৰাজ্যিক সংগ্ৰহালয়।"
      ],
      "bn": [
        "এটি ত্রিপুরার রাজধানী আগরতলার কেন্দ্রস্থলে অবস্থিত এক রাজকীয় প্রাসাদ।",
        "এই অনন্য প্রাসাদটির নামকরণ করেছিলেন স্বয়ং বিশ্বকবি রবীন্দ্রনাথ ঠাকুর।",
        "এটিতে সুন্দর মুঘল ধাঁচের বাগান, কৃত্রিম ফোয়ারা ও বিশাল গম্বুজ রয়েছে।",
        "এটি মাণিক্য রাজবংশের বাসস্থান ছিল এবং বর্তমানে ত্রিপুরার রাজ্য জাদুঘর।"
      ],
      "hi": [
        "यह त्रिपुरा की राजधानी अगरतला के हृदय स्थल में स्थित एक भव्य महल है।",
        "इस ऐतिहासिक महल का नामकरण नोबेल पुरस्कार विजेता रवींद्रनाथ टैगोर ने किया था।",
        "इसमें सुंदर मुगल शैली के बगीचे, फव्वारे और नवशास्त्रीय संगमरमरी गुंबद हैं।",
        "यह माणिक्य राजवंश की गद्दी थी और वर्तमान में पूर्वोत्तर विरासत का राज्य संग्रहालय है।"
      ]
    }
  },
  {
    "id": "ziro",
    "state": "Arunachal Pradesh",
    "stateName": {
      "en": "Arunachal Pradesh",
      "as": "অৰুণাচল প্ৰদেশ",
      "bn": "অরুণাচল প্রদেশ",
      "hi": "अरुणाचल प्रदेश"
    },
    "category": "valley_nature",
    "icon": "🌾",
    "name": {
      "en": "Ziro Valley",
      "as": "জিৰো উপত্যকা",
      "bn": "জিরো উপত্যকা",
      "hi": "जीरो घाटी"
    },
    "clues": {
      "en": [
        "It is an idyllic plateau valley in Lower Subansiri district of Arunachal Pradesh.",
        "It is home to the indigenous Apatani tribe, revered for traditional nose plugs and tattoos.",
        "It features an ingenious UNESCO-proposed wet-rice cultivation system integrating fish farming.",
        "It hosts India's premier eco-friendly open-air independent Ziro Music Festival."
      ],
      "as": [
        "ই অৰুণাচল প্ৰদেশৰ নামনি সোৱণশিৰি জিলাৰ এক মনোৰম উপত্যকা।",
        "ই পৰম্পৰাগত মুখৰ টেটু আৰু নাকৰ অলংকাৰৰ বাবে জনাজাত আপাতানি জনগোষ্ঠীৰ বাসস্থান।",
        "ইয়াত মাছ পালন আৰু ধান খেতিৰ এক অতুলনীয় পৰম্পৰাগত জলসিঞ্চন প্ৰণালী আছে।",
        "ইয়াত পাইন বনেৰে ঘেৰা ধাননি পথাৰৰ মাজত বিখ্যাত মুকলি আকাশৰ জিৰো সংগীত মহোৎসৱ অনুষ্ঠিত হয়।"
      ],
      "bn": [
        "এটি অরুণাচল প্রদেশের নিম্ন সুবর্ণসিঁড়ি জেলার এক নয়নাবিরাম উপত্যকা।",
        "এটি ঐতিহ্যবাহী মুখের উল্কি ও নাকের রিং পরা অপাতানি উপজাতির আবাসভূমি।",
        "এখানে ধান চাষের সাথে মাছ চাষের এক যুগান্তকারী কৃষি পদ্ধতি রয়েছে।",
        "এখানে পাইন গাছের পটভূমিতে ভারতের বিখ্যাত উন্মুক্ত জিরো মিউজিক ফেস্টিভ্যাল অনুষ্ঠিত হয়।"
      ],
      "hi": [
        "यह अरुणाचल प्रदेश के निचले सुबनसिरी जिले में स्थित एक सुरम्य घाटी है।",
        "यह पारंपरिक चेहरे के टैटू और नाक के आभूषणों वाली आपातानी जनजाति का घर है।",
        "यहाँ धान के खेतों में मछली पालन की अनोखी पर्यावरण-अनुकूल कृषि प्रणाली है।",
        "यहाँ धान के हरे-भरे खेतों के बीच प्रसिद्ध खुला जीरो संगीत समारोह आयोजित होता है।"
      ]
    }
  },
  {
    "id": "kohima_hornbill",
    "state": "Nagaland",
    "stateName": {
      "en": "Nagaland",
      "as": "নাগালেণ্ড",
      "bn": "নাগাল্যান্ড",
      "hi": "नागालैंड"
    },
    "category": "cultural_heritage",
    "icon": "🪶",
    "name": {
      "en": "Kohima (Hornbill Heritage)",
      "as": "কহিমা (হৰ্ণবিল ঐতিহ্য)",
      "bn": "কোহিমা (হর্নবিল ঐতিহ্য)",
      "hi": "कोहिमा (हॉर्नबिल हेरिटेज)"
    },
    "clues": {
      "en": [
        "It is situated in the rugged highland hills of Nagaland.",
        "It witnessed the fierce 1944 World War II battle known as the Stalingrad of the East.",
        "Its Commonwealth War Cemetery bears the moving words: For your tomorrow, we gave our today.",
        "Its nearby Kisama Heritage Village stages the electrifying Hornbill Festival uniting all Naga tribes."
      ],
      "as": [
        "ই নাগালেণ্ডৰ উচ্চ পাহাৰীয়া ভূখণ্ডত অৱস্থিত।",
        "ইয়াত ১৯৪৪ চনৰ দ্বিতীয় বিশ্বযুদ্ধৰ বিখ্যাত পূবৰ ষ্টেলিনগ্ৰাড যুদ্ধ সংঘটিত হৈছিল।",
        "ইয়াৰ কমনৱেলথ কবৰস্থানত বিখ্যাত উক্তি তোমালোকৰ কাইলৈৰ বাবে আমি আমাৰ আজি ত্যাগ কৰিলোঁ খোদিত আছে।",
        "ইয়াৰ ওচৰৰ কিচামা ঐতিহ্য গাঁৱত সকলো নাগা জনগোষ্ঠীক একত্ৰিত কৰা হৰ্ণবিল মহোৎসৱ অনুষ্ঠিত হয়।"
      ],
      "bn": [
        "এটি নাগাল্যান্ডের মনোরম ও পার্বত্য উচ্চভূমিতে অবস্থিত।",
        "এখানে ১৯৪৪ সালে দ্বিতীয় বিশ্বযুদ্ধের বিখ্যাত পূর্বের স্ট্যালিনগ্রাদ যুদ্ধ সংঘটিত হয়েছিল।",
        "এখানে অবস্থিত ওয়ার সিমেট্রিতে বীরদের স্মরণে বিখ্যাত স্মৃতিবাণী খোদাই করা আছে।",
        "এর নিকটে অবস্থিত কিসামা গ্রামে সকল নাগা উপজাতিকে নিয়ে মহা সমারোহে হর্নবিল উৎসব পালিত হয়।"
      ],
      "hi": [
        "यह नागालैंड के ऊंचे और खूबसूरत पहाड़ी इलाकों में स्थित है।",
        "यह १९४४ में द्वितीय विश्व युद्ध की प्रसिद्ध पूर्व का स्टालिनग्राद लड़ाई का साक्षी रहा है।",
        "इसके युद्ध स्मारक पर प्रसिद्ध पंक्ति तुम्हारे कल के लिए हमने अपना आज दिया अंकित है।",
        "यहाँ का किसामा हेरिटेज विलेज हर साल सभी नागा जनजातियों का भव्य हॉर्नबिल महोत्सव मनाता है।"
      ]
    }
  },
  {
    "id": "kangla",
    "state": "Manipur",
    "stateName": {
      "en": "Manipur",
      "as": "মণিপুৰ",
      "bn": "মণিপুর",
      "hi": "मणिपुर"
    },
    "category": "monument_heritage",
    "icon": "🏯",
    "name": {
      "en": "Kangla Fort",
      "as": "কাংলা দুৰ্গ",
      "bn": "কাংলা দুর্গ",
      "hi": "कांगला किला"
    },
    "clues": {
      "en": [
        "It is situated on the tranquil banks of the Imphal River in Manipur.",
        "It was the ancient traditional seat and spiritual citadel of the Meitei royalty for centuries.",
        "It encompasses sacred shrines, coronation enclosures, and ancient moated defensive walls.",
        "It is famously guarded by towering statues of the mythical dragon-lion beast, the Kangla Sha."
      ],
      "as": [
        "ই মণিপুৰৰ ইম্ফল নদীৰ শান্ত পাৰত অৱস্থিত।",
        "ই শতিকা ধৰি মেইটেই ৰজা আৰু ৰাজ্যখনৰ প্ৰাচীন ৰাজনৈতিক আৰু আধ্যাত্মিক কেন্দ্ৰ আছিল।",
        "ইয়াত পবিত্ৰ উপাসনা গৃহ, ৰাজ অভিষেক স্থল আৰু ঐতিহাসিক গড়খাৱৈ আছে।",
        "ইয়াৰ প্ৰৱেশদ্বাৰত পৌৰাণিক সিংহ-ড্ৰেগন সদৃশ কাংলা চাৰ বিশাল মূৰ্তি আছে।"
      ],
      "bn": [
        "এটি মণিপুরের ইম্ফল নদীর তীরে অবস্থিত এক ঐতিহাসিক সুরক্ষিত স্থান।",
        "এটি মেইতেই রাজাদের শতাব্দী প্রাচীন ঐতিহ্যবাহী রাজপ্রাসাদ ও প্রশাসনিক কেন্দ্র ছিল।",
        "এর ভেতরে রয়েছে প্রাচীন মন্দির, রাজ্যাভিষেক স্থল ও প্রতিরক্ষামূলক পরিখা।",
        "এর প্রধান চত্বরে পৌরাণিক ড্রাগন-সিংহ কাংলা শা-র রাজকীয় ভাস্কর্য রয়েছে।"
      ],
      "hi": [
        "यह मणिपुर में इम्फाल नदी के शांत तट पर स्थित है।",
        "यह सदियों तक मैतेई राजवंश की प्राचीन राजधानी और पवित्र प्रशासनिक केंद्र रहा।",
        "इसके भीतर पवित्र मंदिर, राज्याभिषेक मंडप और गहरी सुरक्षात्मक खाइयाँ हैं।",
        "इसके मुख्य द्वार पर पौराणिक ड्रैगन-सिंह कांगला शा की विशाल मूर्तियां स्थापित हैं।"
      ]
    }
  },
  {
    "id": "root_bridges",
    "state": "Meghalaya",
    "stateName": {
      "en": "Meghalaya",
      "as": "মেঘালয়",
      "bn": "মেঘালয়",
      "hi": "मेघालय"
    },
    "category": "nature_wonder",
    "icon": "🌉",
    "name": {
      "en": "Living Root Bridges",
      "as": "জীৱন্ত শিপাৰ দলং",
      "bn": "জীবন্ত শিকড়ের সেতু",
      "hi": "जीवित जड़ पुल (Living Root Bridges)"
    },
    "clues": {
      "en": [
        "They are woven across raging jungle rivers in the deep valleys of the East Khasi Hills.",
        "They are painstakingly handcrafted over decades by coaxing the aerial roots of rubber fig trees.",
        "Unlike concrete bridges that decay, these bio-structures grow stronger and denser with time.",
        "The iconic Double Decker living root bridge at Nongriat spans two breathtaking tiers."
      ],
      "as": [
        "এই দলংসমূহ মেঘালয়ৰ পূব খাছি পাহাৰৰ গভীৰ জংঘল আৰু পাহাৰীয়া নদীৰ ওপৰত অৱস্থিত।",
        "ৰবৰ গছৰ শিপা বাঁহৰ সহায়ত নদীৰ ওপৰেৰে নি বহু দশক ধৰি এই দলং গঢ়ি তোলা হয়।",
        "সাধাৰণ দলঙৰ দৰে নষ্ট হোৱাৰ পৰিৱৰ্তে সময়ৰ লগে লগে এই দলং অধিক শক্তিশালী হৈ পৰে।",
        "ননগ্ৰিয়াট গাঁৱত অৱস্থিত দুমহলীয়া (Double Decker) জীৱন্ত শিপাৰ দলং বিশ্ববিখ্যাত।"
      ],
      "bn": [
        "এগুলি মেঘালয়ের গভীর অরণ্য ও খরস্রোতা নদীর ওপর খাসি উপজাতিদের দ্বারা নির্মিত।",
        "রাবার গাছের জীবন্ত শিকড়কে বহু দশক ধরে সুকৌশলে নদী পারাপারের সেতুতে রূপ দেওয়া হয়।",
        "কালক্রমে নষ্ট হওয়ার বদলে এই প্রাকৃতিক সেতুগুলি দিন দিন আরও মজবুত ও শক্তিশালী হয়।",
        "নংরিয়াট গ্রামের দোতলা জীবন্ত শিকড়ের সেতুটি বিশ্বের এক অনন্য বিস্ময়।"
      ],
      "hi": [
        "यह मेघालय के घने जंगलों और पहाड़ी नदियों के ऊपर पूर्वी खासी हिल्स में स्थित हैं।",
        "इन्हें रबर के पेड़ों की जीवित जड़ों को दशकों तक विशेष तकनीक से मोड़कर बनाया जाता है।",
        "कृत्रिम पुलों के विपरीत, ये जीवित पुल समय के साथ और भी अधिक मजबूत होते जाते हैं।",
        "नोंगरियाट गाँव का प्रसिद्ध दो मंजिला जीवित जड़ पुल दुनिया भर में प्रसिद्ध है।"
      ]
    }
  },
  {
    "id": "saraighat",
    "state": "Assam",
    "stateName": {
      "en": "Assam",
      "as": "অসম",
      "bn": "আসাম",
      "hi": "असम"
    },
    "category": "landmark_engineering",
    "icon": "🌉",
    "name": {
      "en": "Saraighat Brahmaputra Bridge",
      "as": "শৰাইঘাট ব্ৰহ্মপুত্ৰ দলং",
      "bn": "শরাইঘাট ব্রহ্মপুত্র সেতু",
      "hi": "सरायघाट ब्रह्मपुत्र पुल"
    },
    "clues": {
      "en": [
        "It spans across the majestic expanse of the Brahmaputra River at Guwahati.",
        "It was the heroic site of the 1671 river battle where General Lachit Borphukan routed Mughal forces.",
        "It was the landmark first rail-cum-road bridge constructed over the mighty Brahmaputra.",
        "It serves as the historic gateway connecting the seven northeastern states to the rest of India."
      ],
      "as": [
        "ই গুৱাহাটীত মহাবাহু ব্ৰহ্মপুত্ৰ নদীৰ দুয়োপাৰক সংযোগ কৰে।",
        "ইয়াত ১৬৭১ চনত বীৰ লাচিত বৰফুকনে মোগল সেনাক শোচনীয়ভাৱে পৰাস্ত কৰা শৰাইঘাটৰ ৰণ সংঘটিত হৈছিল।",
        "ই ব্ৰহ্মপুত্ৰৰ বুকুত নিৰ্মিত সৰ্বপ্ৰথম ৰেল আৰু পথযুক্ত ঐতিহাসিক দলং (১৯৬২ চনত মুকলি)।",
        "ই সমগ্ৰ উত্তৰ-পূব ভাৰতক দেশৰ আন অংশৰ সৈতে সংযোগ কৰা মূল প্ৰৱেশদ্বাৰ।"
      ],
      "bn": [
        "এটি গুয়াহাটিতে মহাবাহু ব্রহ্মপুত্র নদীর প্রশস্ত বক্ষের ওপর নির্মিত।",
        "এখানে ১৬৭১ সালে সেনাপতি লাচিত বরফুকন মোগল বাহিনীকে ঐতিহাসিক নৌযুদ্ধে পরাজিত করেছিলেন।",
        "এটি ব্রহ্মপুত্র নদের ওপর নির্মিত সর্বপ্রথম রেল-কাম-সড়ক সেতু।",
        "এটি উত্তর-পূর্ব ভারতের রাজ্যগুলিকে বাকি ভারতের সাথে যুক্ত করার ঐতিহাসিক প্রবেশদ্বার।"
      ],
      "hi": [
        "यह गुवाहाटी में विशाल ब्रह्मपुत्र नदी के ऊपर बना हुआ है।",
        "यहाँ १६७१ में वीर सेनापति लाचित बोरफुकन ने शक्तिशाली मुगल सेना को परास्त किया था।",
        "यह ब्रह्मपुत्र नदी पर बना भारत का पहला रेल-सह-सड़क ऐतिहासिक पुल है।",
        "यह पूर्वोत्तर भारत को देश के अन्य भागों से जोड़ने वाला मुख्य प्रवेश द्वार है।"
      ]
    }
  },
  {
    "id": "jorhat_tea",
    "state": "Assam",
    "stateName": {
      "en": "Assam",
      "as": "অসম",
      "bn": "আসাম",
      "hi": "असम"
    },
    "category": "tea_estate",
    "icon": "🍃",
    "name": {
      "en": "Jorhat Tea Gardens",
      "as": "যোৰহাট চাহ বাগিচা",
      "bn": "যোরহাট চা বাগান",
      "hi": "जोरहाट चाय बागान"
    },
    "clues": {
      "en": [
        "It is nestled in the fertile river plains of Upper Assam.",
        "It is universally celebrated as the Tea Capital of the World with endless emerald estates.",
        "It houses the Tocklai Tea Research Institute, established in 1911 as the world's oldest tea research station.",
        "It was the last historic capital of the independent Ahom kingdom before British colonization."
      ],
      "as": [
        "ই উজনি অসমৰ ব্ৰহ্মপুত্ৰ উপত্যকাৰ সেউজীয়া সমভূমিত অৱস্থিত।",
        "অগণন সেউজীয়া চাহ বাগিচাৰে পৰিপূৰ্ণ এই ঠাইক বিশ্বৰ চাহৰ ৰাজধানী বুলি জনা যায়।",
        "ইয়াত ১৯১১ চনত স্থাপিত বিশ্বৰ সৰ্বপ্ৰথম আৰু সৰ্ববৃহৎ টোকলাই চাহ গৱেষণা প্ৰতিষ্ঠান অৱস্থিত।",
        "ই ব্ৰিটিছ শাসনৰ পূৰ্বে স্বাধীন আহোম ৰাজ্যৰ শেষ ৰাজধানী আছিল।"
      ],
      "bn": [
        "এটি উজনি আসামের উর্বর সমভূমিতে অবস্থিত সবুজ চা বাগানের এক রাজ্য।",
        "বিশাল ও মনোরম চা বাগানের জন্য এটিকে বিশ্বের চায়ের রাজধানী বলা হয়।",
        "এখানে ১৯১১ সালে প্রতিষ্ঠিত বিশ্বের প্রাচীনতম তোকলাই চা গবেষণা কেন্দ্র অবস্থিত।",
        "এটি ব্রিটিশদের আগমনের পূর্বে স্বাধীন আহোম রাজ্যের সর্বশেষ রাজধানী ছিল।"
      ],
      "hi": [
        "यह ऊपरी असम के उपजाऊ मैदानी इलाकों में स्थित है।",
        "सैकड़ों विशाल और हरे-भरे चाय बागानों के कारण इसे विश्व की चाय राजधानी कहा जाता है।",
        "यहाँ १९११ में स्थापित विश्व का सबसे पुराना टोकलाई चाय अनुसंधान केंद्र स्थित है।",
        "यह ब्रिटिश शासन से पूर्व अहोम राजवंश की अंतिम राजधानी थी।"
      ]
    }
  },
  {
    "id": "unakoti",
    "state": "Tripura",
    "stateName": {
      "en": "Tripura",
      "as": "ত্ৰিপুৰা",
      "bn": "ত্রিপুরা",
      "hi": "त्रिपुरा"
    },
    "category": "monument_heritage",
    "icon": "🗿",
    "name": {
      "en": "Unakoti Rock Carvings",
      "as": "উনাকোটি শিলৰ ভাস্কৰ্য",
      "bn": "উনাকোটি পাথরের খোদাই",
      "hi": "उनाकोटी शैल मूर्तियां"
    },
    "clues": {
      "en": [
        "It is hidden in the forested Raghunandan hills of Kailashahar in northern Tripura.",
        "Its name in Bengali and Sanskrit means one less than a crore (9,999,999 figures).",
        "It features colossal rock-cut bas-relief carvings sculpted into jungle cliffs between 7th-9th centuries.",
        "The central masterwork is the 30-foot carving of Lord Shiva, known as Unakotiswara Kal Bhairava."
      ],
      "as": [
        "ই উত্তৰ ত্ৰিপুৰাৰ কৈলাসহৰৰ বনাবৃত ৰঘুনন্দন পাহাৰৰ বুকুত অৱস্থিত।",
        "ইয়াৰ নামৰ অৰ্থ হ'ল এক কোটিতকৈ এক কম (৯৯,৯৯,৯৯৯টা মূৰ্তি)।",
        "পাহাৰৰ শিল কাটি প্ৰস্তুত কৰা সপ্তম-নৱম শতিকাৰ অসংখ্য বিশাল ভাস্কৰ্য ইয়াত আছে।",
        "ইয়াৰ কেন্দ্ৰবিন্দুত ভগৱান শিৱৰ ৩০ ফুট ওখ বিশাল কালভৈৰৱ মূৰ্তি খোদিত আছে।"
      ],
      "bn": [
        "এটি উত্তর ত্রিপুরার কৈলাসহরের গভীর জঙ্গলে ঘেরা রঘুনন্দন পাহাড়ে অবস্থিত।",
        "এই স্থানটির নামের অর্থ এক কোটি থেকে এক কম (৯৯,৯৯,৯৯৯)।",
        "এখানে সপ্তম থেকে নবম শতাব্দীর পাহাড় কেটে খোদাই করা বিশাল শৈব ভাস্কর্য রয়েছে।",
        "এর মূল আকর্ষণ হলো ভগবান শিবের ৩০ ফুট উঁচু সুবিশাল কালভৈরব পাথুরে মূর্তি।"
      ],
      "hi": [
        "यह उत्तरी त्रिपुरा के कैलाशहर में घने जंगलों से घिरी रघुनंदन पहाड़ियों में स्थित है।",
        "इसके नाम का शाब्दिक अर्थ है एक करोड़ से एक कम (९९,९९,९९९)।",
        "यहाँ ७वीं से ९वीं शताब्दी के बीच प्राकृतिक चट्टानों पर उकेरी गई विशाल मूर्तियाँ हैं।",
        "यहाँ भगवान शिव की ३० फीट ऊंची विशाल काल भैरव की शैल प्रतिमा सबसे प्रमुख है।"
      ]
    }
  },
  {
    "id": "dzukou",
    "state": "Nagaland",
    "stateName": {
      "en": "Nagaland",
      "as": "নাগালেণ্ড",
      "bn": "নাগাল্যান্ড",
      "hi": "नागालैंड"
    },
    "category": "valley_nature",
    "icon": "🌺",
    "name": {
      "en": "Dzukou Valley",
      "as": "জুকৌ উপত্যকা",
      "bn": "জুকো উপত্যকা",
      "hi": "जुको घाटी"
    },
    "clues": {
      "en": [
        "It straddles the high mountainous border between Nagaland and Manipur at 2,600 meters.",
        "It is famously hailed as the Valley of Flowers of the Northeast.",
        "It is characterized by undulating emerald-green hills covered in gentle dwarf bamboo.",
        "It is the exclusive native sanctuary of the rare, seasonal pink-white Dzukou Lily."
      ],
      "as": [
        "ই নাগালেণ্ড আৰু মণিপুৰ সীমান্তৰ ওখ পাহাৰৰ মাজত ২,৬০০ মিটাৰ উচ্চতাত অৱস্থিত।",
        "ইয়াক উত্তৰ-পূবৰ ফুলৰ উপত্যকা বুলি অভিহিত কৰা হয়।",
        "ইয়াত সৰু বাঁহ গছেৰে আবৃত মনোৰম সেউজীয়া পাহাৰ আৰু স্ফটিক পানীৰ জুৰি বৈ আছে।",
        "ই বিশ্বৰ একমাত্ৰ দুষ্প্ৰাপ্য জুকৌ লিলি (Dzukou Lily) ফুলৰ প্ৰাকৃতিক বাসস্থান।"
      ],
      "bn": [
        "এটি নাগাল্যান্ড ও মণিপুর সীমান্তের ২,৬০০ মিটার উচ্চতায় বিস্তৃত এক স্বপ্নিল উপত্যকা।",
        "এটিকে উত্তর-পূর্ব ভারতের ফুলের উপত্যকা বলা হয়।",
        "সবুজ ছোট বাঁশ বনে আবৃত ঢেউ খেলানো পাহাড় এবং স্বচ্ছ পাহাড়ি ঝর্ণা এর বিশেষত্ব।",
        "এটি বিশ্বের অত্যন্ত দুর্লভ ও সুন্দর জুকো লিলি ফুলের একমাত্র প্রাকৃতিক আবাস।"
      ],
      "hi": [
        "यह नागालैंड और मणिपुर की सीमा पर २,६०० मीटर की ऊंचाई पर स्थित एक स्वर्गीय घाटी है।",
        "इसे पूर्वोत्तर की फूलों की घाटी के रूप में जाना जाता है।",
        "यहाँ बौने बांस से ढकी मखमली हरी पहाड़ियाँ और शीतल पर्वतीय धाराएं बहती हैं।",
        "यह केवल इसी घाटी में खिलने वाले दुर्लभ जुको लिली पुष्प का एकमात्र प्राकृतिक घर है।"
      ]
    }
  },
  {
    "id": "dawki",
    "state": "Meghalaya",
    "stateName": {
      "en": "Meghalaya",
      "as": "মেঘালয়",
      "bn": "মেঘালয়",
      "hi": "मेघालय"
    },
    "category": "river_nature",
    "icon": "🛶",
    "name": {
      "en": "Dawki (Umngot River)",
      "as": "ডাউকি (উমংগোট নদী)",
      "bn": "ডাউকি (উমঙ্গোট নদী)",
      "hi": "डावकी (उमंगोट नदी)"
    },
    "clues": {
      "en": [
        "It is located on the picturesque international border between Meghalaya and Bangladesh.",
        "It flows through steep rocky gorges adorned with betel palms in the Jaintia Hills.",
        "Its river Umngot is globally renowned for water so crystal-clear that boats seem to hover in air.",
        "It is crowned by an iconic British-era suspension bridge built in 1932."
      ],
      "as": [
        "ই মেঘালয় আৰু বাংলাদেশৰ আন্তঃৰাষ্ট্ৰীয় সীমান্তৰ কাষত অৱস্থিত।",
        "ই জয়ন্তীয়া পাহাৰৰ সুউচ্চ শিল আৰু তামোল গছেৰে আবৃত গভীৰ গিৰিখাদৰ মাজেৰে বৈ গৈছে।",
        "ইয়াৰ উমংগোট নদীৰ পানী ইমানেই ফটফটীয়া আৰু নিৰ্মল যে নাওবোৰ বতাহত ওপঙি থকা যেন লাগে।",
        "ইয়াৰ ওপৰত ১৯৩২ চনত নিৰ্মিত ঐতিহাসিক ব্ৰিটিছ ওলমা দলং (Suspension Bridge) আছে।"
      ],
      "bn": [
        "এটি মেঘালয় ও বাংলাদেশ আন্তর্জাতিক সীমান্তের কোলে অবস্থিত এক মনোমুগ্ধকর স্থান।",
        "এটি জয়ন্তিয়া পাহাড়ের খাড়া গিরিখাত ও সুপারি বনের মধ্য দিয়ে প্রবাহিত।",
        "এর উমঙ্গোট নদীর পানি এতটাই স্ফটিকস্বচ্ছ ও নির্মল যে নৌকাগুলোকে শূন্যে ভাসমান মনে হয়।",
        "এর নদীর ওপর ১৯৩২ সালে নির্মিত বিখ্যাত ব্রিটিশ সাসপেনশন ঝুলন্ত সেতু রয়েছে।"
      ],
      "hi": [
        "यह मेघालय और बांग्लादेश की अंतरराष्ट्रीय सीमा पर स्थित एक अद्भुत प्राकृतिक स्थल है।",
        "यह जयंतिया पहाड़ियों की खड़ी चट्टानों और सुपारी के पेड़ों से होकर गुजरती है।",
        "यहाँ की उमंगोट नदी का जल इतना पारदर्शी और स्वच्छ है कि नावें हवा में तैरती हुई प्रतीत होती हैं।",
        "इसके ऊपर १९३२ में निर्मित ब्रिटिश काल का प्रसिद्ध सस्पेंशन झूला पुल बना हुआ है।"
      ]
    }
  },
  {
    "id": "haflong",
    "state": "Assam",
    "stateName": {
      "en": "Assam",
      "as": "অসম",
      "bn": "আসাম",
      "hi": "असम"
    },
    "category": "hills_waterfalls",
    "icon": "⛰️",
    "name": {
      "en": "Haflong Hill Station",
      "as": "হাফলং শৈল চহৰ",
      "bn": "হাফলং হিল স্টেশন",
      "hi": "हाफलोंग हिल स्टेशन"
    },
    "clues": {
      "en": [
        "It is nestled in the mist-shrouded Barail mountain range of Dima Hasao.",
        "It is celebrated as the one and only picturesque hill station in the state of Assam.",
        "It features an azure natural lake at its heart, surrounded by cool breezes and pineapples.",
        "It is near Jatinga village, famous for the enigmatic phenomenon of high-altitude bird arrivals."
      ],
      "as": [
        "ই ডিমা হাচাও জিলাৰ ডাৱৰৰে আবৃত বৰাইল পৰ্বতমালাৰ কোলাত অৱস্থিত।",
        "ই সমগ্ৰ অসম ৰাজ্যৰ একমাত্ৰ মনোৰম শৈল চহৰ (Hill Station)।",
        "চহৰখনৰ মাজমজিয়াত এটা সুন্দৰ প্ৰাকৃতিক হ্ৰদ আছে আৰু ই শীতল বতাহ আৰু আনাৰসৰ বাবে জনাজাত।",
        "ইয়াৰ কাষতেই প্ৰব্ৰজনকাৰী চৰাইৰ ৰহস্যজনক সমাগমৰ বাবে বিখ্যাত জাতিঙ্গা গাঁও অৱস্থিত।"
      ],
      "bn": [
        "এটি দিমা হাসাও জেলার বরবৃত বরাইল পর্বতশ্রেণীর কোলে অবস্থিত।",
        "এটি সমগ্র আসাম রাজ্যের একমাত্র ও নয়নাভিরাম হিল স্টেশন।",
        "শহরের কেন্দ্রস্থলে একটি সুন্দর নীল হ্রদ রয়েছে এবং এটি আনারসের বাগানের জন্য পরিচিত।",
        "এর কাছেই পাখির রহস্যজনক সমাগমের জন্য বিশ্বখ্যাত জাটিঙ্গা গ্রাম অবস্থিত।"
      ],
      "hi": [
        "यह दीमा हसाओ जिले में बादलों से ढकी बराइल पर्वत श्रृंखला में स्थित है।",
        "यह पूरे असम राज्य का एकमात्र खूबसूरत हिल स्टेशन है।",
        "इसके केंद्र में एक सुंदर झील है और यह अपनी ठंडी हवाओं और अनन्नास के बागानों के लिए प्रसिद्ध है।",
        "इसके पास ही पक्षियों के रहस्यमय आगमन के लिए विश्व प्रसिद्ध जटिंगा गाँव स्थित है।"
      ]
    }
  }
];

