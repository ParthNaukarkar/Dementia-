/**
 * NeuroSaathi - Game 10: Brain Story
 * Pan-Indian Culturally Grounded Reminiscence Vignettes
 * Grounded in WMS-IV Logical Memory & Reminiscence Therapy Paradigms.
 */

import type { StoryVignette, BrainStoryDifficulty, BrainStoryGeneratedTrial, StoryQuestion } from './types';

export const REMINISCENCE_STORIES: StoryVignette[] = [
  // Story 1: Festive Diwali & Courtyard Lights
  {
    id: 'bihu_utsav',
    theme: 'cultural_festivals',
    icon: '🪔',
    title: {
      as: 'দীপাৱলীৰ শুভ সন্ধিয়া',
      bn: 'দীপাবলির শুভ সন্ধ্যা',
      hi: 'दीपावली की पावन शाम',
      en: 'The Festive Lights of Diwali',
    },
    sentences: {
      as: [
        'দীপাৱলীৰ পুৱা গোপাল ককাই চোতালখন পৰিষ্কাৰ কৰি শাৰী শাৰীকৈ মাটিৰ চাকি সজাবলৈ ধৰিলে।',
        'গাভৰু মীনাই সোণালী ওৰণি পিন্ধি গৃহদ্বাৰত ৰঙীন ফুলৰ অপূৰ্ব আল্পনা আঁকিলে।',
        'গোপাল ককাই তেওঁৰ সৰু নাতিটোক কাঁহৰ পাত্ৰত সুস্বাদু তিল আৰু মতিচুৰ লাড়ু মৰমেৰে খাবলৈ দিলে।',
        'সন্ধিয়া গাঁৱৰ সকলো লোক বৰগছৰ তলত সমবেত হৈ শুভকামনা আৰু পৱিত্ৰ চাকিৰ পোহৰ বিলাই আনন্দ কৰিলে।',
        'ককাই হাঁহি মাৰি ক’লে যে আত্মীয় আৰু মৰমৰ পোহৰেই জীৱনৰ আটাইতকৈ ডাঙৰ আনন্দ।',
      ],
      bn: [
        'দীপাবলির সকালে গোপাল দাদু উঠোন পরিষ্কার করে সারিবদ্ধভাবে মাটির প্রদীপ সাজাতে লাগলেন।',
        'তরুণী মীনা সোনালী ওড়না পরে দরজার সামনে রঙিন ফুলের অপূর্ব রঙ্গোলি আলপনা আঁকল।',
        'গোপাল দাদু তার ছোট নাতিকে কাঁসার পাত্রে সুস্বাদু মতিচুর লাড্ডু মিষ্টি উপহার দিলেন।',
        'সন্ধ্যায় পাড়ার সকলে বটগাছের তলায় একত্র হয়ে শুভকামনা ও শুভ প্রদীপের আলোয় আনন্দ করলেন।',
        'দাদু হেসে বললেন যে আপনজনের মিলন আর ভালোবাসার আলোই জীবনের শ্রেষ্ঠ সুখ।',
      ],
      hi: [
        'दीपावली की सुबह गोपाल दादाजी ने आंगन को साफ करके करीने से मिट्टी के दीये सजाने शुरू किए।',
        'युवती मीना ने सुनहरी ओढ़नी पहनकर घर के मुख्य द्वार पर रंग-बिरंगी फूलों की रंगोली बनाई।',
        'गोपाल दादाजी ने अपने छोटे पोते को पीतल के सुंदर डिब्बे में ताज़ा मोतीचूर के लड्डू दिए।',
        'शाम को सभी मोहल्ले वाले पुराने बरगद के पेड़ के नीचे एकत्र हुए और दीयों की रोशनी में खुशियां बांटीं।',
        'दादाजी ने मुस्कुराते हुए कहा कि अपनों का साथ और दीपों का पावन प्रकाश ही जीवन की सच्ची संपत्ति है।',
      ],
      en: [
        'On the festive morning of Diwali, grandfather Gopal swept the courtyard clean and arranged neat rows of earthen diyas.',
        'Young Meena wore a golden silk dupatta and adorned the front threshold with a colorful floral rangoli.',
        'Grandfather Gopal affectionately offered his little grandson a brass bowl filled with sweet motichoor ladoos.',
        'In the evening, all the neighbors gathered beneath the ancient banyan tree to share warm greetings and radiant lights.',
        'Grandfather smiled warmly, observing that the shared light of loved ones brings true lifelong happiness to the heart.',
      ],
    },
    questions: [
      {
        id: 'bihu_q1',
        elementCategory: 'protagonist',
        questionText: {
          as: 'সাধুটোত কোনে চোতালত মাটিৰ চাকি সজাইছিল?',
          bn: 'গল্পে উঠোনে মাটির প্রদীপ কে সাজাচ্ছিলেন?',
          hi: 'कहानी में आंगन में मिट्टी के दीये कौन सजा रहा था?',
          en: 'Who was arranging the rows of earthen diyas in the courtyard?',
        },
        options: {
          as: ['গোপাল ককা', 'মীনাই', 'সৰু নাতিটো', 'গাঁৱৰ মুখীয়াল'],
          bn: ['গোপাল দাদু', 'মীনা', 'ছোট নাতি', 'গ্রামের মোড়ল'],
          hi: ['गोपाल दादाजी', 'मीना', 'छोटा पोता', 'गांव का मुखिया'],
          en: ['Grandfather Gopal', 'Meena', 'The Little Grandson', 'The Village Elder'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'প্রথম বাক্যত চাকি সজোৱা বৃদ্ধ ককাজনৰ নাম উল্লেখ আছে।',
          bn: 'প্রথম বাক্যে প্রদীপ সাজানো প্রবীণ দাদুর নাম বলা আছে।',
          hi: 'पहले वाक्य में दीये सजा रहे बुजुर्ग दादाजी का नाम है।',
          en: 'Notice the elderly gentleman named in the first sentence.',
        },
      },
      {
        id: 'bihu_q2',
        elementCategory: 'detail',
        questionText: {
          as: 'মীনাই গৃহদ্বাৰত কি আঁকি সজাইছিল?',
          bn: 'মীনা দরজার সামনে কী এঁকেছিল?',
          hi: 'मीना ने मुख्य द्वार पर क्या बनाकर सजाया था?',
          en: 'What did Meena create at the entrance threshold?',
        },
        options: {
          as: ['ৰঙীন ফুলৰ আল্পনা', 'কাগজৰ তোৰণ', 'মাটিৰ পুতলা', 'কাঁচৰ ঝাড়বাতি'],
          bn: ['রঙিন ফুলের রঙ্গোলি আলপনা', 'কাগজের তোরণ', 'মাটির পুতুল', 'কাঁচের ঝাড়বাতি'],
          hi: ['रंग-बिरंगी फूलों की रंगोली', 'कागज का तोरण', 'मिट्टी के खिलौने', 'कांच का झूमर'],
          en: ['Colorful floral rangoli', 'A paper garland', 'Clay figurines', 'A glass lantern'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'দ্বিতীয় বাক্যত মীনাই দুৱাৰমুখত কৰা সুন্দৰ শিল্পকলা চাওক।',
          bn: 'দ্বিতীয় বাক্যে মীনার আঁকা সুন্দর আলপনার উল্লেখ আছে।',
          hi: 'दूसरे वाक्य में मीना द्वारा बनाई गई कलाकृति देखें।',
          en: 'The second sentence mentions her floor art decoration.',
        },
      },
      {
        id: 'bihu_q3',
        elementCategory: 'action',
        questionText: {
          as: 'গোপাল ককাই তেওঁৰ সৰু নাতিটোক কি মিঠাই খাবলৈ দিলে?',
          bn: 'গোপাল দাদু তার ছোট নাতিকে কী মিষ্টি খেতে দিলেন?',
          hi: 'गोपाल दादाजी ने अपने छोटे पोते को कौन सी मिठाई दी?',
          en: 'What sweet treat did grandfather Gopal give to his grandson?',
        },
        options: {
          as: ['মতিচুৰ লাড়ু', 'গুড়ৰ জিলাপী', 'গাখীৰৰ সন্দেশ', 'মিঠা ৰসগোল্লা'],
          bn: ['মতিচুর লাড্ডু', 'গুড়ের জিলিপি', 'দুধের সন্দেশ', 'মিষ্টি রসগোল্লা'],
          hi: ['मोतीचूर के लड्डू', 'गुड़ की जलेबी', 'दूध का संदेश', 'मीठे रसगुल्ले'],
          en: ['Sweet motichoor ladoos', 'Jaggery jalebis', 'Milk sandesh', 'Sweet rasgullas'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'তৃতীয় বাক্যত ককাই নাতিয়েকক দিয়া সোৱাদপূৰ্ণ লাড়ুৰ কথা আছে।',
          bn: 'তৃতীয় বাক্যে দাদুর দেওয়া সুস্বাদু লাড্ডুর উল্লেখ আছে।',
          hi: 'तीसरे वाक्य में दादाजी द्वारा दी गई मिठाई देखें।',
          en: 'The third sentence mentions the traditional festive sweet.',
        },
      },
      {
        id: 'bihu_q4',
        elementCategory: 'setting',
        questionText: {
          as: 'সন্ধিয়া সকলো লোক ক’ত সমবেত হৈ আনন্দ কৰিলে?',
          bn: 'সন্ধ্যায় সকলে কোথায় একত্র হয়ে আনন্দ করলেন?',
          hi: 'शाम को सभी लोग कहां एकत्र हुए थे?',
          en: 'Where did everyone gather together in the evening?',
        },
        options: {
          as: ['বৰগছৰ তলত', 'নদীৰ ঘাটত', 'সাপ্তাহিক হাটত', 'স্কুলৰ বাৰাণ্ডাত'],
          bn: ['বটগাছের তলায়', 'নদীর ঘাটে', 'সাপ্তাহিক হাটে', 'স্কুলের বারান্দায়'],
          hi: ['बरगद के पेड़ के नीचे', 'नदी के घाट पर', 'साप्ताहिक बाज़ार में', 'स्कूल के मैदान में'],
          en: ['Beneath the ancient banyan tree', 'At the river ghat', 'At the weekly market', 'In the school veranda'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'চতুৰ্থ বাক্যত সকলো সমবেত হোৱা ছাঁযুক্ত গছজোপাৰ কথা পঢ়ক।',
          bn: 'চতুর্থ বাক্যে সকলের মিলনের স্থানটি দেখুন।',
          hi: 'चौथे वाक्य में सभी के एकत्र होने का स्थान देखें।',
          en: 'The fourth sentence describes the large community tree.',
        },
      },
    ],
  },

  // Story 2: Summer Vacation & Grandfather's Mango Orchard
  {
    id: 'chah_bagisa',
    theme: 'nature_harvest',
    icon: '🥭',
    title: {
      as: 'গৰমৰ বন্ধ আৰু আমবাগানৰ স্মৃতি',
      bn: 'গ্রীষ্মের ছুটি ও আমবাগানের স্মৃতি',
      hi: 'गर्मियों की छुट्टियां और आम का बगीचा',
      en: 'Summer Vacation & The Mango Orchard',
    },
    sentences: {
      as: [
        'গৰমৰ বন্ধৰ দিনত পুৱাতেই সাৱিত্ৰী আইতাই নাতি-নাতিনীবোৰৰ লগত পুৰণি আমবাগানখনলৈ ওলাই গ’ল।',
        'সৰু ৰমেশে গছৰ ডালৰ পৰা সুবাসিত পকা হালধীয়া আমবোৰ আনন্দমনে তুলি আনিলে।',
        'আইতাই সেই মিঠা আমবোৰ বাঁহৰ খৰাহীত নিমপাতৰ ওপৰত সযতনে থ’লে।',
        'দুপৰীয়া পৰিয়ালৰ সকলোৱে শীতল বাৰাণ্ডাত বহি জুতি লগাই ঠাণ্ডা আম আৰু মছলাদাৰ ঘোল খালে।',
        'ৰমেশে হাঁহি মাৰি ভাবিলে যে আইতাৰ ঘৰৰ গৰমৰ বন্ধৰ দিনবোৰেই জীৱনৰ আটাইতকৈ সোৱাদপূৰ্ণ দিন।',
      ],
      bn: [
        'গ্রীষ্মের ছুটির দিনে সকালে সাবিত্রী দিদিমা নাতি-নাতনিদের সঙ্গে পুরোনো আমবাগানে গেলেন।',
        'ছোট রমেশ গাছের ডাল থেকে সুগন্ধি মিষ্টি পাকা হলুদ আমগুলি হাসিমুখে পেড়ে আনল।',
        'দিদিমা সেই আমগুলি বাঁশের ঝুড়িতে নিমপাতার ওপর যত্ন করে রাখলেন।',
        'দুপুরে পরিবারের সকলে শীতল বারান্দায় বসে ঠান্ডা আম ও সুস্বাদু ঘোল একসঙ্গে খেলেন।',
        'রমেশ হেসে ভাবল যে দিদিমার বাড়ির এই ছুটির দিনগুলিই জীবনের মধুরতম স্মৃতি।',
      ],
      hi: [
        'गर्मियों की छुट्टियों में सुबह-सवेरे सावित्री दादीजी बच्चों के साथ पुराने आम के बगीचे में गईं।',
        'छोटे पोते रमेश ने डालियों से मीठे, रसीले और पीले पके आम सावधानी से चुने।',
        'दादीजी ने उन मीठे आमों को बांस की टोकरी में नीम की पत्तियों के साथ करीने से रखा।',
        'दोपहर को पूरा परिवार ठंडे बरामदे में बैठा और आम की फांकों के साथ ताजा मट्ठा पिया।',
        'रमेश ने मुस्कुराते हुए सोचा कि ननिहाल की ये छुट्टियां ही बचपन के सबसे प्यारे दिन हैं।',
      ],
      en: [
        'During the summer vacation, grandmother Savitri walked out in the morning with the children to the ancestral mango orchard.',
        'Young grandson Ramesh carefully gathered sweet, fragrant, and golden ripe mangoes from the leafy branches.',
        'Grandmother gently placed the fresh mangoes into a handwoven cane basket lined with fresh neem leaves.',
        'In the afternoon, the entire family sat on the cool veranda, savoring chilled mango slices and spiced buttermilk.',
        'Ramesh smiled, remembering that lazy summer afternoons at his grandparents\' house were the sweetest days of all.',
      ],
    },
    questions: [
      {
        id: 'chah_q1',
        elementCategory: 'protagonist',
        questionText: {
          as: 'সাধুটোত পুৱাই ল’ৰা-ছোৱালীবোৰৰ লগত আমবাগানলৈ কোনে লৈ গৈছিল?',
          bn: 'গল্পে সকালে বাচ্চাদের সাথে আমবাগানে কে গিয়েছিলেন?',
          hi: 'कहानी में सुबह बच्चों के साथ आम के बगीचे में कौन गया था?',
          en: 'Who walked with the children to the mango orchard in the morning?',
        },
        options: {
          as: ['সাৱিত্ৰী আইতা', 'ৰমেশ', 'গাঁৱৰ মালী', 'শিক্ষক মহাশয়'],
          bn: ['সাবিত্রী দিদিমা', 'রমেশ', 'গ্রামের মালী', 'শিক্ষক মহাশয়'],
          hi: ['सावित्री दादीजी', 'रमेश', 'गांव का माली', 'मास्टर जी'],
          en: ['Grandmother Savitri', 'Ramesh', 'The Village Gardener', 'The School Teacher'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'প্রথম বাক্যত পুৱা বাগানলৈ যোৱা স্নেহময়ী আইতাৰ নাম চাওক।',
          bn: 'প্রথম বাক্যে উল্লিখিত দিদিমার নামটি দেখুন।',
          hi: 'पहले वाक्य में बच्चों के साथ जाने वाली दादीजी का नाम देखें।',
          en: 'Look at the affectionate grandmother named in the first sentence.',
        },
      },
      {
        id: 'chah_q2',
        elementCategory: 'detail',
        questionText: {
          as: 'ৰমেশে গছৰ ডালৰ পৰা কেনেকুৱা আম তুলিছিল?',
          bn: 'রমেশ গাছের ডাল থেকে কেমন আম পেড়েছিল?',
          hi: 'रमेश ने डालियों से किस प्रकार के आम तोड़े थे?',
          en: 'What kind of mangoes did Ramesh gather from the tree branches?',
        },
        options: {
          as: ['মিঠা পকা হালধীয়া আম', 'কেঁচা টেঙা আম', 'শুকান আমৰ গুটি', 'সৰু বুনীয়া আম'],
          bn: ['মিষ্টি পাকা হলুদ আম', 'কাঁচা টক আম', 'শুকনো বুনো আম', 'ছোট ছোট আম'],
          hi: ['मीठे, रसीले पीले पके आम', 'कच्चे खट्टे आम', 'सूखे जंगली आम', 'छोटे हरे फल'],
          en: ['Sweet, golden ripe mangoes', 'Sour green mangoes', 'Dried wild berries', 'Small unripe fruits'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'দ্বিতীয় বাক্যত তোলা আমবোৰৰ ৰং আৰু সোৱাদৰ বৰ্ণনা চাওক।',
          bn: 'দ্বিতীয় বাক্যে পাকা আমের বর্ণনা দেখুন।',
          hi: 'दूसरे वाक्य में आमों के रंग और स्वाद का वर्णन देखें।',
          en: 'The second sentence describes the color and sweetness of the mangoes.',
        },
      },
      {
        id: 'chah_q3',
        elementCategory: 'action',
        questionText: {
          as: 'আইতাই আমবোৰ ক’ত সংৰক্ষণ কৰি থ’লে?',
          bn: 'দিদিমা আমগুলি কোথায় যত্ন করে রাখলেন?',
          hi: 'दादीजी ने आमों को किसमें करीने से रखा?',
          en: 'Where did grandmother place the fresh mangoes?',
        },
        options: {
          as: ['বাঁহৰ খৰাহীত', 'লোৰ বাকচত', 'মাটিৰ পাত্ৰত', 'প্লাষ্টিকৰ মোনাত'],
          bn: ['বাঁশের ঝুড়িতে', 'লোহার বাক্সে', 'মাটির পাত্রে', 'প্লাস্টিকের থলিতে'],
          hi: ['बांस की टोकरी में', 'लोहे के बक्से में', 'मिट्टी की मटकी में', 'कपड़े की थैली में'],
          en: ['In a handwoven cane basket', 'In an iron chest', 'In a clay pot', 'In a cloth bag'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'তৃতীয় বাক্যত আম থোৱা হস্তশিল্পৰ খৰাহীটোৰ কথা উল্লেখ আছে।',
          bn: 'তৃতীয় বাক্যে আম রাখার ঝুড়িটির কথা বলা আছে।',
          hi: 'तीसरे वाक्य में आम रखने की टोकरी देखें।',
          en: 'The third sentence mentions the woven basket.',
        },
      },
      {
        id: 'chah_q4',
        elementCategory: 'setting',
        questionText: {
          as: 'দুপৰীয়া পৰিয়ালৰ সকলোৱে ক’ত বহি আম খালে?',
          bn: 'দুপুরে পরিবারের সকলে কোথায় বসে আম খেলেন?',
          hi: 'दोपहर को पूरा परिवार कहां बैठकर आम खा रहा था?',
          en: 'Where did the family sit together in the afternoon?',
        },
        options: {
          as: ['শীতল বাৰাণ্ডাত', 'আমবাগানৰ মাজত', 'পথাৰৰ আলিত', 'ৰান্ধনি শালত'],
          bn: ['শীতল বারান্দায়', 'আমবাগানের মাঝে', 'মাঠের ধারে', 'রান্নাঘরে'],
          hi: ['ठंडे बरामदे में', 'आम के बाग में', 'खेत की मेड़ पर', 'रसोई घर में'],
          en: ['On the cool veranda', 'In the middle of the orchard', 'By the field path', 'In the kitchen'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'চতুৰ্থ বাক্যত ঘৰৰ কোন অংশত বহাৰ কথা আছে পঢ়ক।',
          bn: 'চতুর্থ বাক্যে পরিবারের বসার স্থানটি দেখুন।',
          hi: 'चौथे वाक्य में परिवार के बैठने का स्थान देखें।',
          en: 'The fourth sentence names the cool family gathering spot.',
        },
      },
    ],
  },

  // Story 3: A Nostalgic Indian Railway Journey
  {
    id: 'brahmaputra_boating',
    theme: 'travel_river',
    icon: '🚂',
    title: {
      as: 'ভাৰতীয় ৰেলৰ সুৱদী স্মৃতি',
      bn: 'ভারতীয় রেলের মধুর স্মৃতি',
      hi: 'भारतीय रेल की सुहानी यात्रा',
      en: 'A Nostalgic Indian Railway Journey',
    },
    sentences: {
      as: [
        'পুৱাতেই বৰদেউতা মাধৱে পিতলৰ পানীৰ পাত্ৰ আৰু টিকট লৈ ব্যস্ত ৰেল ষ্টেচনত উপস্থিত হ’ল।',
        'চিটি বজাই ৰেলগাড়ীখন সেউজীয়া সৰিয়হৰ পথাৰ আৰু নদীৰ ওপৰেৰে শান্তভাৱে আগবাঢ়িল।',
        'জংচন ষ্টেচন পোৱাত বৰদেউতাই পৰিয়ালৰ সকলোৰে বাবে মাটিৰ ভাঁড়ত গৰম মছলা চাহ কিনি আনিলে।',
        'সকলোৱে খিৰিকীৰ কাষৰ আসনত বহি ঘৰত বনোৱা পৰঠা আৰু সুস্বাদু আমৰ আচাৰ একেলগে খালে।',
        'বৰদেউতাই হাঁহি মাৰি ক’লে যে আত্মীয়ৰ লগত ৰেল ভ্ৰমণেই জীৱনৰ আটাইতকৈ মধুৰ অভিজ্ঞতা।',
      ],
      bn: [
        'ভোরবেলায় বড়মামা মাধব পিতলের জলের পাত্র ও টিকিট নিয়ে ব্যস্ত রেলস্টেশনে এসে পৌঁছলেন।',
        'বাঁশি বাজিয়ে ট্রেনটি দিগন্তজোড়া সবুজ সর্ষে ক্ষেত ও নদী পেরিয়ে এগিয়ে চলল।',
        'জংশন স্টেশনে ট্রেন থামতেই মামা মাটির ভাঁড়ে করে গরম মশলা চা কিনে আনলেন।',
        'সকলে জানালার ধারের হাওয়াভরা আসনে বসে ঘরের তৈরি পরোটা ও মিষ্টি আমের আচার খেলেন।',
        'মামা হেসে বললেন যে পরিবারকে নিয়ে এই রেলভ্রমণের আনন্দই জীবনের সবচেয়ে সুন্দর স্মৃতি।',
      ],
      hi: [
        'सुबह-सवेरे बड़े चाचा माधव पीतल की सुराही और टिकट लेकर चहल-पहल भरे रेलवे स्टेशन पहुंचे।',
        'सीटी बजाती हुई छुक-छुक रेलगाड़ी हरे-भरे सरसों के खेतों और नदियों को पार करती हुई आगे बढ़ी।',
        'जंक्शन स्टेशन रुकने पर चाचाजी ने सबके लिए मिट्टी के कुल्हड़ों में गर्मागर्म मसाला चाय खरीदी।',
        'सभी ने खिड़की वाली हवादार सीट पर बैठकर घर के बने पराठे और आम का खट्टा-मीठा अचार खाया।',
        'चाचाजी ने हंसते हुए कहा कि अपनों के साथ रेल की यात्रा जीवन की सबसे यादगार सैर होती है।',
      ],
      en: [
        'Early in the morning, elder uncle Madhav arrived at the bustling railway station with his brass water container and ticket.',
        'With a cheerful whistle, the passenger train chugged steadily through green mustard fields and sparkling rivers.',
        'At the busy junction stop, uncle bought steaming earthen cups of hot spiced masala chai for the whole family.',
        'They sat together by the breezy window seat, sharing warm homemade parathas and sweet mango pickle.',
        'Uncle laughed heartily, reflecting that train journeys with family create the most cherished memories of a lifetime.',
      ],
    },
    questions: [
      {
        id: 'boat_q1',
        elementCategory: 'protagonist',
        questionText: {
          as: 'সাধুটোত পুৱাই ৰেল ষ্টেচনলৈ কোনে যাত্ৰা আৰম্ভ কৰিছিল?',
          bn: 'গল্পে ভোরবেলায় রেলস্টেশনে কে পৌঁছেছিলেন?',
          hi: 'कहानी में सुबह रेलवे स्टेशन पर कौन पहुंचा था?',
          en: 'Who arrived at the railway station early in the morning?',
        },
        options: {
          as: ['বৰদেউতা মাধৱ', 'ৰেল চালক', 'ষ্টেচন মাষ্টাৰ', 'টিকট পৰীক্ষক'],
          bn: ['বড়মামা মাধব', 'ট্রেন চালক', 'স্টেশন মাস্টার', 'টিটিই পরীক্ষক'],
          hi: ['बड़े चाचा माधव', 'ट्रेन चालक', 'स्टेशन मास्टर', 'टिकट निरीक्षक'],
          en: ['Elder uncle Madhav', 'The Train Driver', 'The Station Master', 'The Ticket Inspector'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'প্রথম বাক্যত টিকট লৈ ষ্টেচনত উপস্থিত হোৱা ব্যক্তিজনৰ নাম চাওক।',
          bn: 'প্রথম বাক্যে উল্লিখিত মামার নামটি দেখুন।',
          hi: 'पहले वाक्य में स्टेशन पहुंचे व्यक्ति का नाम देखें।',
          en: 'Notice the family elder named in the first sentence.',
        },
      },
      {
        id: 'boat_q2',
        elementCategory: 'detail',
        questionText: {
          as: 'ৰেলগাড়ীখন কোনবোৰ পথাৰৰ মাজেৰে আগবাঢ়িছিল?',
          bn: 'ট্রেনটি কেমন ফসলের ক্ষেত পেরিয়ে এগিয়ে চলেছিল?',
          hi: 'रेलगाड़ी किन खेतों के बीच से होकर गुज़र रही थी?',
          en: 'What kind of scenic fields did the train pass through?',
        },
        options: {
          as: ['সেউজীয়া সৰিয়হৰ পথাৰ', 'শুকান মৰুভূমি', 'ওখ পাহাৰী শিল', 'কুঁহিয়াৰৰ পথাৰ'],
          bn: ['সবুজ সর্ষে ক্ষেত', 'মরুভূমির বালুকা', 'উঁচু পাথুরে পাহাড়', 'আখের ক্ষেত'],
          hi: ['हरे-भरे सरसों के खेत', 'सूखे रेगिस्तानी टीले', 'पथरीले पहाड़', 'गन्ने के खेत'],
          en: ['Green mustard fields', 'Dry desert sands', 'Rocky dry hills', 'Sugarcane plantations'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'দ্বিতীয় বাক্যত ৰেলৰ খিৰিকীৰে দেখা পথাৰখনৰ বৰ্ণনা চাওক।',
          bn: 'দ্বিতীয় বাক্যে ট্রেনের জানলা দিয়ে দেখা শস্যক্ষেতের উল্লেখ আছে।',
          hi: 'दूसरे वाक्य में दिखाई देने वाले खेतों का वर्णन देखें।',
          en: 'The second sentence describes the landscape viewed from the window.',
        },
      },
      {
        id: 'boat_q3',
        elementCategory: 'action',
        questionText: {
          as: 'জংচনত বৰদেউতাই মাটিৰ ভাঁড়ত কি কিনি আনিছিল?',
          bn: 'জংশন স্টেশনে মামা মাটির ভাঁড়ে করে কী কিনে আনলেন?',
          hi: 'जंक्शन पर चाचाजी ने मिट्टी के कुल्हड़ में क्या खरीदा?',
          en: 'What did uncle buy in earthen cups at the junction station?',
        },
        options: {
          as: ['গৰম মছলা চাহ', 'মিঠা চৰবত', 'ঠাণ্ডা গাখীৰ', 'ফলৰ ৰস'],
          bn: ['গরম মশলা চা', 'মিষ্টি শরবত', 'ঠান্ডা দুধ', 'ফলের রস'],
          hi: ['गर्मागर्म मसाला चाय', 'मीठा शर्बत', 'ठंडा दूध', 'फलों का रस'],
          en: ['Hot spiced masala chai', 'Sweet fruit juice', 'Cold flavored milk', 'Fresh lemonade'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'তৃতীয় বাক্যত জংচনত কিনা সুস্বাদু গৰম পানীয়ৰ কথা পঢ়ক।',
          bn: 'তৃতীয় বাক্যে মাটির ভাঁড়ের গরম পানীয়টির কথা দেখুন।',
          hi: 'तीसरे वाक्य में खरीदे गए गर्म पेय का नाम देखें।',
          en: 'The third sentence mentions the piping hot beverage.',
        },
      },
    ],
  },

  // Story 4: The Bustling Sunday Bazaar
  {
    id: 'haator_dingal',
    theme: 'market_community',
    icon: '🧺',
    title: {
      as: 'দেওবৰীয়া বজাৰৰ স্মৃতি',
      bn: 'রবিবারের জমজমাট হাট',
      hi: 'रविवार का चहल-पहल भरा बाज़ार',
      en: 'The Bustling Sunday Bazaar',
    },
    sentences: {
      as: [
        'দেওবাৰে পুৱা মোহন ককাই লাখুটিডাল লৈ গাঁৱৰ ৰঙীন আৰু জমজমাট সাপ্তাহিক বজাৰলৈ খোজ ল’লে।',
        'বজাৰখনত সুগন্ধি নাৰ্জী ফুলৰ মালা, ভজা বাদাম আৰু সতেজ ফল-মূলৰ গোন্ধ ভৰি পৰিছিল।',
        'ককাই পূজাৰ কোঠাত ওলমাবলৈ পিতলৰ কাৰুকাৰ্য্যময় সুন্দৰ ঘণ্টা এটা বাছনি কৰি কিনিলে।',
        'ঘৰলৈ উভতি অহাৰ আগেয়ে ককাই আৰু নাতিয়ে মিঠাইৰ দোকানত বহি জুতি লগাই গৰম গৰম কুৰকুৰীয়া জিলাপী খালে।',
        'নাতিয়ে ককাৰ হাতত ধৰি ভাবিলে যে দেওবৰীয়া হাটৰ দৰে আনন্দদায়ক স্থান ক’তো নাই।',
      ],
      bn: [
        'রবিবার সকালে মোহন দাদু হাতের লাঠিটি নিয়ে গ্রামের প্রাণবন্ত সাপ্তাহিক হাটের দিকে রওনা হলেন।',
        'সমগ্র হাট তাজা গাঁদা ফুলের মালা, ভাজা চিনেবাদাম ও পাকা ফলের মিষ্টি সুবাসে ভরে ছিল।',
        'দাদু ঠাকুরঘরে লাগানোর জন্য পিতলের চমৎকার নকশাদার একটি ঘণ্টা পছন্দ করে কিনলেন।',
        'বাড়ি ফেরার আগে দাদু ও নাতনি মিষ্টির দোকানে বসে মুচমুচে গরম জিলিপি পরম আনন্দে খেলেন।',
        'নাতনি দাদুর হাত ধরে অনুভব করল যে রবিবারের এই হাটটিই পৃথিবীর সবচেয়ে আনন্দময় জায়গা।',
      ],
      hi: [
        'रविवार की सुबह मोहन दादाजी अपनी लकड़ी की छड़ी लेकर कस्बे के चहल-पहल भरे बाज़ार की ओर निकले।',
        'पूरा बाज़ार ताज़े गेंदे के फूलों की मालाओं, भुनी मूंगफली और ताज़ा फलों की सुगंध से महक रहा था।',
        'दादाजी ने घर के मंदिर में लगाने के लिए पीतल की एक नक्काशीदार सुरीली घंटी पसंद करके खरीदी।',
        'घर लौटने से पहले दादाजी और नवासी ने हलवाई की दुकान पर बैठकर कुरकुरी गर्म-गर्म जलेबियों का आनंद लिया।',
        'दादाजी की उंगली थामे बच्ची ने महसूस किया कि रविवार का यह बाज़ार खुशियों से भरा मेला है।',
      ],
      en: [
        'On Sunday morning, grandfather Mohan walked with his carved walking cane toward the lively open-air town bazaar.',
        'The entire marketplace was filled with the fragrant scent of fresh marigold garlands, roasted peanuts, and ripe fruits.',
        'Grandfather thoughtfully selected an intricately carved brass bell to hang in the family prayer room.',
        'Before heading home, grandfather and his granddaughter sat at the sweet maker\'s stall to enjoy piping hot crispy jalebis.',
        'Holding grandfather\'s warm hand, the little girl felt that the lively Sunday bazaar was the happiest place of all.',
      ],
    },
    questions: [
      {
        id: 'bazaar_q1',
        elementCategory: 'protagonist',
        questionText: {
          as: 'সাধুটোত দেওবাৰে পুৱা বজাৰলৈ কোনে খোজ লৈছিল?',
          bn: 'গল্পে রবিবার সকালে হাটের দিকে কে রওনা হয়েছিলেন?',
          hi: 'कहानी में रविवार की सुबह बाज़ार की ओर कौन निकला था?',
          en: 'Who walked toward the lively bazaar on Sunday morning?',
        },
        options: {
          as: ['মোহন ককা', 'দোকানী', 'ৰেল কৰ্মী', 'নাপিত ককা'],
          bn: ['মোহন দাদু', 'দোকানদার', 'রেলকর্মী', 'গ্রামের নাপিত'],
          hi: ['मोहन दादाजी', 'दुकानदार', 'रेलकर्मी', 'गांव का नाई'],
          en: ['Grandfather Mohan', 'The Shopkeeper', 'The Railway Porter', 'The Village Barber'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'প্রথম বাক্যত লাখুটি লৈ বজাৰলৈ ওলোৱা ককাজনৰ নাম চাওক।',
          bn: 'প্রথম বাক্যে লাঠি হাতে বের হওয়া দাদুর নামটি দেখুন।',
          hi: 'पहले वाक्य में छड़ी लेकर निकले दादाजी का नाम देखें।',
          en: 'Notice the grandfather named in the opening sentence.',
        },
      },
      {
        id: 'bazaar_q2',
        elementCategory: 'detail',
        questionText: {
          as: 'বজাৰখন কোন ফুলৰ মালাৰ সুবাসেৰে ভৰি পৰিছিল?',
          bn: 'হাটটি কোন ফুলের মালার সুবাসে ভরে উঠেছিল?',
          hi: 'बाज़ार में किन फूलों की मालाओं की महक फैली हुई थी?',
          en: 'Which fragrant flower garlands filled the marketplace air?',
        },
        options: {
          as: ['নাৰ্জী ফুলৰ মালা', 'বগা বেল ফুল', 'ৰঙা গোলাপৰ মালা', 'পদ্ম ফুলৰ মালা'],
          bn: ['গাঁদা ফুলের মালা', 'সাদা বেলি ফুল', 'লাল গোলাপের মালা', 'পদ্ম ফুলের মালা'],
          hi: ['गेंदे के फूलों की मालाएं', 'सफेद चमेली', 'लाल गुलाब की माला', 'कमल के फूल'],
          en: ['Fresh marigold flower garlands', 'Jasmine strings', 'Red rose garlands', 'Lotus flowers'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'দ্বিতীয় বাক্যত সুগন্ধি ফুলৰ মালাৰ নাম পঢ়ক।',
          bn: 'দ্বিতীয় বাক্যে উল্লেখিত ফুলের নামটি দেখুন।',
          hi: 'दूसरे वाक्य में सुगंधित फूलों का नाम देखें।',
          en: 'The second sentence names the festive yellow-orange flowers.',
        },
      },
      {
        id: 'bazaar_q3',
        elementCategory: 'action',
        questionText: {
          as: 'ককাই পূজাৰ কোঠাৰ বাবে কি পিতলৰ বস্তু কিনিলে?',
          bn: 'দাদু ঠাকুরঘরের জন্য পিতলের কী বস্তু কিনলেন?',
          hi: 'दादाजी ने पूजा घर के लिए पीतल की कौन सी वस्तु खरीदी?',
          en: 'What brass item did grandfather purchase for the prayer room?',
        },
        options: {
          as: ['কাৰুকাৰ্য্যময় পিতলৰ ঘণ্টা', 'পিতলৰ ফুলদানী', 'পিতলৰ চাকিৰ ষ্টেণ্ড', 'পিতলৰ থালী'],
          bn: ['নকশাদার পিতলের ঘণ্টা', 'পিতলের ফুলদানি', 'পিতলের প্রদীপ দানি', 'পিতলের থালা'],
          hi: ['नक्काशीदार पीतल की घंटी', 'पीतल का गुलदस्ता', 'पीतल का दीया स्टैंड', 'पीतल की थाली'],
          en: ['An intricately carved brass bell', 'A brass flower vase', 'A brass lamp stand', 'A brass dining plate'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'তৃতীয় বাক্যত ককাই কিনা পৱিত্ৰ ধ্বনিৰ পিতলৰ বাদ্য চাওক।',
          bn: 'তৃতীয় বাক্যে ঠাকুরঘরের জন্য কেনা ঘণ্টাটির কথা আছে।',
          hi: 'तीसरे वाक्य में खरीदी गई घंटी का उल्लेख देखें।',
          en: 'The third sentence mentions the resonant prayer bell.',
        },
      },
    ],
  },
];

/**
 * Story Trial Generator: Adapts story length, question count, and choices according to tier.
 */
export class StoryGenerator {
  public static generateTrial(
    difficulty: BrainStoryDifficulty,
    trialIndex: number,
    preferredStoryId?: string
  ): BrainStoryGeneratedTrial {
    const storyList = REMINISCENCE_STORIES;
    const safeIdx = Math.max(0, Math.floor(trialIndex || 1) - 1) % storyList.length;
    let story = storyList[safeIdx] || storyList[0];

    if (preferredStoryId) {
      const found = storyList.find(s => s.id === preferredStoryId);
      if (found) story = found;
    }

    // Determine sentence count based on difficulty
    const targetSentences = Math.max(1, Math.min(5, difficulty.sentenceCount));
    const displayedSentences = story.sentences.en.slice(0, targetSentences);

    // Filter questions whose element is mentioned in the selected sentences
    // Sentence 0 gives Q1, Sentence 1 gives Q2, etc.
    const availableQuestions = story.questions.slice(0, Math.min(story.questions.length, difficulty.storyElementsCount));
    const activeQuestions = availableQuestions.length > 0 ? availableQuestions : [story.questions[0]];

    // Adjust choices count for each question according to difficulty.choicesCount (2, 3, or 4 choices)
    const targetChoicesCount = Math.max(2, Math.min(4, difficulty.choicesCount));

    const calibratedQuestions: StoryQuestion[] = activeQuestions.map(q => {
      // In the master data, correct option is index 0
      // We randomly shuffle the indices so the correct answer is distributed across A, B, C, D
      const indices = Array.from({ length: targetChoicesCount }, (_, i) => i);
      // Fisher-Yates shuffle
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      // The original correct option was at index 0. Find where it was shuffled to.
      const newCorrectIndex = indices.indexOf(0);

      // Reorder options across all languages synchronously using the same shuffled permutation
      const shuffledOptions: Record<string, string[]> = {
        as: indices.map(idx => (q.options.as || [])[idx] || ''),
        bn: indices.map(idx => (q.options.bn || [])[idx] || ''),
        hi: indices.map(idx => (q.options.hi || [])[idx] || ''),
        en: indices.map(idx => (q.options.en || [])[idx] || ''),
      };

      return {
        ...q,
        options: shuffledOptions,
        correctOptionIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
      };
    });

    return {
      trialIndex,
      story,
      displayedSentences,
      activeQuestions: calibratedQuestions,
      difficulty,
    };
  }
}
