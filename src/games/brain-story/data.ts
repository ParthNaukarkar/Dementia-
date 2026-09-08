/**
 * SmritiNER - Game 10: Brain Story (Monor Sadhukatha / মনৰ সাধুকথা)
 * Culturally Grounded Reminiscence Vignettes (Assamese, Bengali, Hindi, English)
 * Grounded in WMS-IV Logical Memory & Reminiscence Therapy Paradigms.
 */

import type { SupportedLanguage } from '../../types/prescription';
import type { StoryVignette, BrainStoryDifficulty, BrainStoryGeneratedTrial, StoryQuestion } from './types';

export const REMINISCENCE_STORIES: StoryVignette[] = [
  // Story 1: Rongali Bihu Celebration (বিহুত নাচো বাঘালী)
  {
    id: 'bihu_utsav',
    theme: 'cultural_festivals',
    icon: '🪘',
    title: {
      as: 'ৰঙালী বিহুৰ পুৱা',
      bn: 'রঙালী বিহুর সকাল',
      hi: 'रोंगाली बिहू की सुबह',
      en: 'Morning of Rongali Bihu',
    },
    sentences: {
      as: [
        'বৰষুণৰ পিছত চ’তৰ বিহুৰ দিনা পুৱাই গোপাল ককাই তামোলৰ তলত ঢোল বজাবলৈ ধৰিলে।',
        'গাভৰু মীনাই গছৰ ডালত ফুলা ৰঙা কপৌফুল খোপাত গুজি আনন্দমনে নাচনী দলৰ লগত ওলাই গ’ল।',
        'গোপাল ককাই তেওঁৰ সৰু নাতিটোক ৰঙা সুতাৰে বোৱা এখন নতুন ফুলাম গামোচা আদৰেৰে পিন্ধাই দিলে।',
        'সন্ধিয়া গাঁৱৰ সকলোৱে নামঘৰৰ বাকৰিত সমবেত হৈ সুস্বাদু তিলৰ পিঠা আৰু কোমল চাউল একেলগে খালে।',
        'ককাই বৰ হাঁহি মাৰি ক’লে যে এই বছৰৰ বিহুৰ উছাহ সদায় তেওঁৰ অন্তৰত চিৰসেউজ হৈ থাকিব।',
      ],
      bn: [
        'বৃষ্টির পর চৈত্র বিহুর দিন সকালে গোপাল দাদু সুপারি গাছের নিচে ঢোল বাজাতে লাগলেন।',
        'তরুণী মীনা গাছের ডালে ফোটা লাল কপৌফুল খোঁপায় গুঁজে নাচিয়ে দলের সঙ্গে হাসিমুখে বের হলো।',
        'গোপাল দাদু তার ছোট নাতিকে লাল সুতো দিয়ে বোনা একটি নতুন নকশাদার গামোছা আদরে পরিয়ে দিলেন।',
        'সন্ধ্যায় গ্রামের সকলে নামঘরের প্রাঙ্গণে একত্র হয়ে সুস্বাদু তিল পিঠে ও কোমল চাল একসঙ্গে খেলেন।',
        'দাদু হেসে বললেন যে এ বছরের বিহুর আনন্দ চিরকাল তার হৃদয়ে সতেজ হয়ে থাকবে।',
      ],
      hi: [
        'बारिश के बाद चैत्र बिहू की सुबह गोपाल दादाजी सुपारी के पेड़ के नीचे ढोल बजाने लगे।',
        'युवती मीना ने पेड़ पर खिले लाल कपौ फूल को जूड़े में लगाया और खुशी से नर्तक दल के साथ निकल पड़ी।',
        'गोपाल दादाजी ने अपने छोटे पोते को लाल धागे से बुना नया सजावटी गमोसा प्यार से पहनाया।',
        'शाम को सभी ग्रामीण नामघर के आंगन में एकत्र हुए और स्वादिष्ट तिल के पीठे व कोमल चावल साथ खाए।',
        'दादाजी ने मुस्कुराते हुए कहा कि इस वर्ष के बिहू का उत्साह उनके मन में सदा हरा-भरा रहेगा।',
      ],
      en: [
        'After the rain on the morning of Chait Bihu, grandfather Gopal began playing the dhol under the betel tree.',
        'Young Meena tucked red Kopou orchids into her hair bun and happily joined the village dance troupe.',
        'Grandfather Gopal affectionately draped a newly woven red-flowered gamosa around his little grandson.',
        'In the evening, all the villagers gathered in the Namghar courtyard and shared delicious til pitha and sweet rice.',
        'Grandfather smiled warmly, remarking that this joyous Bihu celebration would forever remain fresh in his heart.',
      ],
    },
    questions: [
      {
        id: 'bihu_q1',
        elementCategory: 'protagonist',
        questionText: {
          as: 'সাধুটোত কোনে তামোলৰ তলত ঢোল বজাইছিল?',
          bn: 'গল্পে সুপারি গাছের নিচে কে ঢোল বাজাচ্ছিলেন?',
          hi: 'कहानी में सुपारी के पेड़ के नीचे कौन ढोल बजा रहा था?',
          en: 'Who was playing the dhol under the betel tree?',
        },
        options: {
          as: ['গোপাল ককা', 'মীনাই', 'সৰু নাতিটো', 'গাঁৱৰ মুখীয়াল'],
          bn: ['গোপাল দাদু', 'মীনা', 'ছোট নাতি', 'গ্রামের মোড়ল'],
          hi: ['गोपाल दादाजी', 'मीना', 'छोटा पोता', 'गांव का मुखिया'],
          en: ['Grandfather Gopal', 'Meena', 'The Little Grandson', 'The Village Elder'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'প্রথম বাক্যত ঢোল বজোৱা বৃদ্ধ ককাজনৰ নাম উল্লেখ আছে।',
          bn: 'প্রথম বাক্যে ঢোল বাদক বয়োবৃদ্ধ দাদুর নাম বলা আছে।',
          hi: 'पहले वाक्य में ढोल बजा रहे बुजुर्ग दादाजी का नाम है।',
          en: 'Notice the elderly gentleman named in the first sentence.',
        },
      },
      {
        id: 'bihu_q2',
        elementCategory: 'detail',
        questionText: {
          as: 'মীনাই তাইৰ খোপাত কি ফুল গুজিছিল?',
          bn: 'মীনা তার খোঁপায় কী ফুল গুঁজেছিল?',
          hi: 'मीना ने अपने जूड़े में कौन सा फूल लगाया था?',
          en: 'What flower did Meena tuck into her hair bun?',
        },
        options: {
          as: ['ৰঙা কপৌফুল', 'বগা গোলাপ', 'সুগন্ধি বকুল', 'হালধীয়া সৰিয়হ'],
          bn: ['লাল কপৌফুল', 'সাদা গোলাপ', 'সুগন্ধি বকুল', 'হলুদ সর্ষে'],
          hi: ['लाल कपौ फूल', 'सफेद गुलाब', 'सुगंधित बकुल', 'पीला सरसों'],
          en: ['Red Kopou Orchids', 'White Rose', 'Fragrant Bakul', 'Yellow Mustard'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'দ্বিতীয় বাক্যত বিহুৰ গছত ফুলা পৰম্পৰাগত ৰঙা ফুলৰ কথা কোৱা হৈছে।',
          bn: 'দ্বিতীয় বাক্যে বিহুর ঐতিহ্যবাহী গাছের লাল ফুলের কথা বলা হয়েছে।',
          hi: 'दूसरे वाक्य में बिहू के पारंपरिक लाल आर्किड फूल का उल्लेख है।',
          en: 'The second sentence mentions the traditional red orchid flower.',
        },
      },
      {
        id: 'bihu_q3',
        elementCategory: 'action',
        questionText: {
          as: 'গোপাল ককাই তেওঁৰ সৰু নাতিটোক কি উপহাৰ পিন্ধাই দিলে?',
          bn: 'গোপাল দাদু তার ছোট নাতিকে কী উপহার পরিয়ে দিলেন?',
          hi: 'गोपाल दादाजी ने अपने छोटे पोते को क्या उपहार पहनाया?',
          en: 'What gift did grandfather Gopal drape around his grandson?',
        },
        options: {
          as: ['নতুন ফুলাম গামোচা', 'সোণালী আঙুঠি', 'বাঁহৰ পেঁপা', 'ৰূপৰ পদক'],
          bn: ['নতুন নকশাদার গামোছা', 'সোনার আংটি', 'বাঁশের পেঁপা', 'রুপোর পদক'],
          hi: ['नया सजावटी गमोसा', 'सोने की अंगूठी', 'बांस की पेपा', 'चांदी का पदक'],
          en: ['A new floral gamosa', 'A golden ring', 'A bamboo pepa horn', 'A silver locket'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'তৃতীয় বাক্যত ৰঙা সুতাৰে বোৱা বস্ত্ৰখনৰ কথা আছে।',
          bn: 'তৃতীয় বাক্যে লাল সুতোয় বোনা বস্ত্রের উল্লেখ আছে।',
          hi: 'तीसरे वाक्य में लाल धागे से बुने वस्त्र की बात है।',
          en: 'The third sentence mentions the woven red-flowered fabric.',
        },
      },
      {
        id: 'bihu_q4',
        elementCategory: 'setting',
        questionText: {
          as: 'সন্ধিয়া গাঁৱৰ সকলো লোক ক’ত সমবেত হৈছিল?',
          bn: 'সন্ধ্যায় গ্রামের সমস্ত মানুষ কোথায় একত্র হয়েছিলেন?',
          hi: 'शाम को गांव के सभी लोग कहां एकत्र हुए थे?',
          en: 'Where did all the villagers gather in the evening?',
        },
        options: {
          as: ['নামঘৰৰ বাকৰিত', 'ব্ৰহ্মপুত্ৰৰ ঘাটত', 'সাপ্তাহিক বজাৰত', 'স্কুলৰ খেলপথাৰত'],
          bn: ['নামঘরের প্রাঙ্গণে', 'ব্রহ্মপুত্রের ঘাটে', 'সাপ্তাহিক বাজারে', 'স্কুলের মাঠে'],
          hi: ['नामघर के आंगन में', 'ब्रह्मपुत्र के घाट पर', 'साप्ताहिक बाजार में', 'स्कूल के मैदान में'],
          en: ['In the Namghar courtyard', 'On the Brahmaputra bank', 'At the weekly market', 'In the school ground'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'চতুৰ্থ বাক্যত সকলোৱে পিঠা খোৱা পৱিত্ৰ স্থানৰ নাম চাওক।',
          bn: 'চতুর্থ বাক্যে সকলের পিঠে খাওয়ার পবিত্র স্থানটি দেখুন।',
          hi: 'चौथे वाक्य में सभी के एकत्र होने का पारंपरिक स्थान देखें।',
          en: 'Check the fourth sentence for the community courtyard location.',
        },
      },
    ],
  },

  // Story 2: Upper Assam Tea Garden (চাহ বাগিচাৰ স্মৃতি)
  {
    id: 'chah_bagisa',
    theme: 'nature_work',
    icon: '🍃',
    title: {
      as: 'চাহ বাগিচাৰ পুৱাৰ কুঁৱলী',
      bn: 'চা বাগানের সকালের কুয়াশা',
      hi: 'चाय बागान की सुबह की धुंध',
      en: 'Morning Mist in the Tea Garden',
    },
    sentences: {
      as: [
        'উজনি অসমৰ এখন চাহ বাগিচাত ৰুমঝুম পুৱাই বাঁহৰ পাচিটো পিঠিত বান্ধি ওলাই আহিল।',
        'দূৰৰ পাহাৰৰ পৰা কুঁৱলী নামি আহিছিল আৰু সেউজীয়া চাহপাতৰ ওপৰত নিয়ৰৰ টোপাল জিলিকিছিল।',
        'ৰুমঝুমে নিপুণ হাতেৰে কোমল দুটি পাত আৰু এটি কলি তুলি পাচিত জমা কৰিলে।',
        'দুপৰীয়া বেলি উঠাৰ পিছত তেওঁ ডাঙৰ গছৰ ছাঁত পিতলৰ গিলাচত আদা দিয়া গৰম চাহ খালে।',
        'ঘৰলৈ উভতি আহোঁতে তেওঁৰ মনটো তাজা চাহপাতৰ সুবাসেৰে ভৰি আছিল।',
      ],
      bn: [
        'উজান আসামের এক চা বাগানে রুমঝুম সকালে বাঁশের খাঁচাটি পিঠে বেঁধে বেরিয়ে এল।',
        'দূরের পাহাড় থেকে কুয়াশা নেমে আসছিল এবং সবুজ চা পাতার ওপর শিশিরবিন্দু জ্বলজ্বল করছিল।',
        'রুমঝুম দক্ষ হাতে নরম দুটি পাতা ও একটি কুঁড়ি তুলে খাঁচায় জমা করল।',
        'দুপুরে রোদ বাড়ার পর সে বড় গাছের ছায়ায় পিতলের গ্লাসে আদা দেওয়া গরম চা খেল।',
        'বাড়ি ফেরার পথে তার মন তাজা চা পাতার সুবাসে ভরে ছিল।',
      ],
      hi: [
        'ऊपरी असम के एक चाय बागान में रुमझुम सुबह बांस की टोकरी पीठ पर बांधकर निकली।',
        'दूर की पहाड़ियों से कोहरा उतर रहा था और हरी चाय की पत्तियों पर ओस की बूंदें चमक रही थीं।',
        'रुमझुम ने कुशल हाथों से कोमल दो पत्तियां और एक कली तोड़कर टोकरी में एकत्र की।',
        'दोपहर में धूप चढ़ने पर उसने बड़े पेड़ की छांव में पीतल के गिलास में अदरक वाली गर्म चाय पी।',
        'घर लौटते समय उसका मन ताजी चाय की पत्तियों की सुगंध से महक रहा था।',
      ],
      en: [
        'In an upper Assam tea garden, Rumjhum set out in the morning with a bamboo basket strapped to her back.',
        'Soft mist descended from distant hills, making dew drops glisten upon the lush green tea leaves.',
        'With nimble hands, Rumjhum gently plucked two tender leaves and a bud, placing them into her basket.',
        'At noon under a large shade tree, she enjoyed warm ginger tea served in a traditional brass tumbler.',
        'Returning home, her heart was filled with the refreshing, earthy aroma of freshly plucked tea leaves.',
      ],
    },
    questions: [
      {
        id: 'chah_q1',
        elementCategory: 'protagonist',
        questionText: {
          as: 'সাধুটোত চাহপাত তুলিবলৈ কোন ওলাই আহিল?',
          bn: 'গল্পে চা পাতা তুলতে কে বেরিয়েছিল?',
          hi: 'कहानी में चाय की पत्तियां तोड़ने कौन निकली?',
          en: 'Who set out to pluck tea leaves in the story?',
        },
        options: {
          as: ['ৰুমঝুম', 'লক্ষ্মী', 'ৰীতা', 'সীতা'],
          bn: ['রুমঝুম', 'লক্ষ্মী', 'রীতা', 'সীতা'],
          hi: ['रुमझुम', 'लक्ष्मी', 'रीता', 'सीता'],
          en: ['Rumjhum', 'Lakshmi', 'Rita', 'Sita'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'প্রথম বাক্যত পিঠিত বাঁহৰ পাচি লোৱা ছোৱালীজনীৰ নাম আছে।',
          bn: 'প্রথম বাক্যে পিঠে বাঁশের খাঁচা নেওয়া মেয়েটির নাম আছে।',
          hi: 'पहले वाक्य में टोकरी लिए लड़की का नाम देखें।',
          en: 'Check the very first sentence for the worker’s name.',
        },
      },
      {
        id: 'chah_q2',
        elementCategory: 'action',
        questionText: {
          as: 'ৰুমঝুমে পাত তুলিবৰ বাবে কি নিয়ম মানি চলিলে?',
          bn: 'রুমঝুম চা পাতা তোলার জন্য কী নিয়ম মেনে তুলল?',
          hi: 'रुमझुम ने पत्तियां चुनते समय क्या नियम अपनाया?',
          en: 'What specific parts did Rumjhum pluck from the bush?',
        },
        options: {
          as: ['দুটি পাত আৰু এটি কলি', 'ডাঙৰ পুৰণি পাত', 'গছৰ শুকান ডাল', 'চাহ গছৰ ফুল'],
          bn: ['দুটি পাতা ও একটি কুঁড়ি', 'বড় পুরোনো পাতা', 'গাছের শুকনো ডাল', 'চা গাছের ফুল'],
          hi: ['दो पत्तियां और एक कली', 'बड़ी पुरानी पत्तियां', 'पेड़ की सूखी टहनी', 'चाय का फूल'],
          en: ['Two leaves and a bud', 'Large old leaves', 'Dry woody twigs', 'Tea bush blossoms'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'তৃতীয় বাক্যত চাহপাত তোলাৰ পৰম্পৰাগত নিয়মটো চাওক।',
          bn: 'তৃতীয় বাক্যে চা পাতা তোলার ঐতিহ্যবাহী নিয়মটি দেখুন।',
          hi: 'तीसरे वाक्य में चाय चुनने का पारंपरिक नियम देखें।',
          en: 'The third sentence describes the classic two-leaves-and-a-bud rule.',
        },
      },
      {
        id: 'chah_q3',
        elementCategory: 'detail',
        questionText: {
          as: 'দুপৰীয়া ৰুমঝুমে কি পাত্ৰত চাহ খালে?',
          bn: 'দুপুরে রুমঝুম কোন পাত্রে চা খেয়েছিল?',
          hi: 'दोपहर में रुमझुम ने किस बर्तन में चाय पी?',
          en: 'What container did Rumjhum drink tea from at noon?',
        },
        options: {
          as: ['পিতলৰ গিলাচত', 'কাঁচৰ কাপত', 'মাটিৰ পাত্ৰত', 'প্লাষ্টিকৰ বটলত'],
          bn: ['পিতলের গ্লাসে', 'কাচের কাপে', 'মাটির পাত্রে', 'প্লাস্টিকের বোতলে'],
          hi: ['पीतल के गिलास में', 'कांच के कप में', 'मिट्टी के बर्तन में', 'प्लास्टिक की बोतल में'],
          en: ['A brass tumbler', 'A glass teacup', 'A clay pot', 'A plastic bottle'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'চতুৰ্থ বাক্যত পিতলৰ ধাতুৰ গিলাচৰ উল্লেখ আছে।',
          bn: 'চতুর্থ বাক্যে পিতলের তৈরি গ্লাসের কথা বলা আছে।',
          hi: 'चौथे वाक्य में धातु के पारंपरिक गिलास का उल्लेख है।',
          en: 'Look at the fourth sentence for the metallic vessel.',
        },
      },
      {
        id: 'chah_q4',
        elementCategory: 'setting',
        questionText: {
          as: 'এই সাধুটো অসমৰ কোন অঞ্চলৰ পটভূমিত ঘটিছে?',
          bn: 'এই গল্পটি আসামের কোন অঞ্চলের প্রেক্ষাপটে ঘটেছে?',
          hi: 'यह कहानी असम के किस क्षेत्र की पृष्ठभूमि में घटित हुई?',
          en: 'In which region of Assam is this story set?',
        },
        options: {
          as: ['উজনি অসমৰ চাহ বাগিচা', 'নগাঁও চহৰৰ মাজমজিয়া', 'গুৱাহাটী ৰেল ষ্টেচন', 'ধুবুৰী ঘাট'],
          bn: ['উজান আসামের চা বাগান', 'নগাঁও শহরের কেন্দ্রস্থল', 'গুয়াহাটি রেল স্টেশন', 'ধুবুড়ি ঘাট'],
          hi: ['ऊपरी असम का चाय बागान', 'नगांव शहर का केंद्र', 'गुवाहाटी रेलवे स्टेशन', 'धुबरी घाट'],
          en: ['Upper Assam Tea Garden', 'Nagaon Town Center', 'Guwahati Railway Station', 'Dhubri River Port'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'প্রথম বাক্যৰ আৰম্ভণিতে থকা ভৌগোলিক স্থান চাওক।',
          bn: 'প্রথম বাক্যের শুরুতে থাকা ভৌগোলিক স্থানটি দেখুন।',
          hi: 'पहले वाक्य के आरंभ में दिया गया भौगोलिक स्थान देखें।',
          en: 'The opening phrase mentions the upper Assam region.',
        },
      },
    ],
  },

  // Story 3: Brahmaputra Ferry Journey (লুইতৰ পাৰৰ আবেলি)
  {
    id: 'brahmaputra_boating',
    theme: 'river_journey',
    icon: '⛵',
    title: {
      as: 'ব্ৰহ্মপুত্ৰৰ আবেলি ফেৰী',
      bn: 'ব্রহ্মপুত্রের বিকেলের ফেরি',
      hi: 'ब्रह्मपुत्र की शाम की नौका',
      en: 'Evening Ferry on the Brahmaputra',
    },
    sentences: {
      as: [
        'সূৰ্য্য মাৰ যোৱাৰ সময়ত ভবেন ককাই উমানন্দ ঘাটৰ পৰা ফেৰীখনত উঠিল।',
        'লুইতৰ শীতল বতাহে সকলো যাত্ৰীৰ মন শাঁত পেলাইছিল আৰু পানীৰ সোঁতত ৰূপোৱালী হাঁহবোৰ সাঁতুৰি আছিল।',
        'হঠাৎ পানীত এটা শুহু (নদীৰ ডলফিন) ওপৰলৈ জপিয়াই আকৌ ডুব মাৰিলে।',
        'ভবেন ককাই জেপৰ পৰা ৰঙা মুগাৰ গামোচাখন উলিয়াই মূৰত বান্ধি নৈৰ দৃশ্য উপভোগ কৰিলে।',
        'আনপাৰৰ ঘাট পাওঁতে আকাশত সন্ধিয়াৰ প্ৰথম তৰাটো জিলিকি উঠিছিল।',
      ],
      bn: [
        'সূর্যাস্তের সময় ভবেন দাদু উমানন্দ ঘাট থেকে ফেরিতে উঠলেন।',
        'ব্রহ্মপুত্রের ঠান্ডা বাতাস সব যাত্রীর মন জুড়িয়ে দিল এবং জলের স্রোতে রূপোলি হাঁসগুলো সাঁতার কাটছিল।',
        'হঠাৎ জলে একটি শুশুক (নদীর ডলফিন) ওপরের দিকে লাফিয়ে আবার ডুব দিল।',
        'ভবেন দাদু পকেট থেকে লাল মুগার গামোছা বের করে মাথায় বেঁধে নদীর দৃশ্য উপভোগ করলেন।',
        'অন্য পাড়ে পৌঁছানোর সময় আকাশে সন্ধ্যার প্রথম তারাটি জ্বলে উঠেছিল।',
      ],
      hi: [
        'सूर्यास्त के समय भबेन दादाजी उमानंद घाट से नाव पर चढ़े।',
        'ब्रह्मपुत्र की ठंडी हवा ने सभी यात्रियों का मन शांत किया और लहरों पर बत्तखें तैर रही थीं।',
        'अचानक पानी में एक सोंस (नदी की डॉल्फिन) ऊपर उछलकर वापस पानी में समा गई।',
        'भबेन दादाजी ने जेब से लाल मूगा का गमोसा निकालकर सिर पर बांधा और नदी का दृश्य देखा।',
        'दूसरे किनारे पहुंचते-पहुंचते आसमान में शाम का पहला तारा चमक उठा था।',
      ],
      en: [
        'At sunset, grandfather Bhaben boarded the ferry boat from the historic Umananda ghat.',
        'A cool river breeze soothed the passengers as ducks paddled peacefully across the silver water.',
        'Suddenly, a freshwater river dolphin leaped out from the ripples and dived back into the depths.',
        'Grandfather Bhaben pulled out a red Muga gamosa from his coat and wrapped it comfortably around his head.',
        'By the time the ferry docked on the northern bank, the evening star had already appeared in the twilight sky.',
      ],
    },
    questions: [
      {
        id: 'boat_q1',
        elementCategory: 'protagonist',
        questionText: {
          as: 'সাধুটোত উমানন্দ ঘাটৰ পৰা ফেৰীত কোন উঠিল?',
          bn: 'গল্পে উমানন্দ ঘাট থেকে ফেরিতে কে উঠলেন?',
          hi: 'कहानी में उमानंद घाट से नाव में कौन सवार हुआ?',
          en: 'Who boarded the ferry from the Umananda ghat?',
        },
        options: {
          as: ['ভবেন ককা', 'ৰমেশ মাঝি', 'অৰুণ বৰা', 'দীপক দাস'],
          bn: ['ভবেন দাদু', 'রমেশ মাঝি', 'অরুণ বরা', 'দীপক দাস'],
          hi: ['भबेन दादाजी', 'रमेश मांझी', 'अरुण बोरा', 'दीपक दास'],
          en: ['Grandfather Bhaben', 'Ramesh Boatman', 'Arun Borah', 'Deepak Das'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'প্রথম বাক্যত ঘাটত উঠা বৃদ্ধ যাত্ৰীজনৰ নাম উল্লেখ আছে।',
          bn: 'প্রথম বাক্যে ঘাটে ওঠা বয়স্ক যাত্রীর নাম দেওয়া আছে।',
          hi: 'पहले वाक्य में घाट से चढ़ने वाले वृद्ध यात्री का नाम है।',
          en: 'The opening sentence introduces the main passenger.',
        },
      },
      {
        id: 'boat_q2',
        elementCategory: 'detail',
        questionText: {
          as: 'লুইতৰ পানীৰ পৰা হঠাৎ কি প্ৰাণীয়ে জপিয়াই উঠিল?',
          bn: 'নদীর জল থেকে হঠাৎ কোন প্রাণী লাফিয়ে উঠল?',
          hi: 'नदी के पानी से अचानक कौन सा जीव उछलकर दिखा?',
          en: 'What aquatic creature suddenly leaped out of the water?',
        },
        options: {
          as: ['শুহু (নদীৰ ডলফিন)', 'ডাঙৰ ঘঁৰিয়াল', 'চিতল মাছ', 'বৰ কাছ'],
          bn: ['শুশুক (নদীর ডলফিন)', 'বড় কুমির', 'চিতল মাছ', 'বড় কচ্ছপ'],
          hi: ['सोंस (नदी की डॉल्फिन)', 'बड़ा घड़ियाल', 'चीतल मछली', 'बड़ा कछुआ'],
          en: ['Freshwater river dolphin (Xuhu)', 'Large marsh crocodile', 'Chital fish', 'River turtle'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'তৃতীয় বাক্যত পানীৰ পৰা জপিয়াই উঠা নদীৰ ডলফিনৰ নাম আছে।',
          bn: 'তৃতীয় বাক্যে জল থেকে লাফিয়ে ওঠা নদীর ডলফিনের উল্লেখ আছে।',
          hi: 'तीसरे वाक्य में नदी की डॉल्फिन का उल्लेख देखें।',
          en: 'The third sentence describes the leaping river dolphin.',
        },
      },
      {
        id: 'boat_q3',
        elementCategory: 'setting',
        questionText: {
          as: 'ফেৰীখন কোন ঘাটৰ পৰা যাত্ৰা আৰম্ভ কৰিছিল?',
          bn: 'ফেরিটি কোন ঘাট থেকে যাত্রা শুরু করেছিল?',
          hi: 'नाव ने अपनी यात्रा किस घाट से शुरू की थी?',
          en: 'From which river ghat did the ferry begin its voyage?',
        },
        options: {
          as: ['উমানন্দ ঘাট', 'পাণ্ডু ঘাট', 'শিলঘাট', 'মাজুলী ঘাট'],
          bn: ['উমানন্দ ঘাট', 'পান্ডু ঘাট', 'শিলঘাট', 'মাজুলী ঘাট'],
          hi: ['उमानंद घाट', 'पांडु घाट', 'शिलघाट', 'माजुली घाट'],
          en: ['Umananda Ghat', 'Pandu Ghat', 'Silghat', 'Majuli Ghat'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'প্রথম বাক্যত আৰম্ভণি ঘাটটোৰ নাম উল্লেখ আছে।',
          bn: 'প্রথম বাক্যে শুরুর ঘাটের নাম লেখা আছে।',
          hi: 'पहले वाक्य में शुरुआती घाट का नाम पढ़ें।',
          en: 'Look at the first sentence for the departure ghat.',
        },
      },
    ],
  },

  // Story 4: Rural Weekly Bazaar (গাঁৱৰ সাপ্তাহিক হাট)
  {
    id: 'haator_dingal',
    theme: 'village_life',
    icon: '🧺',
    title: {
      as: 'গাঁৱৰ সাপ্তাহিক হাট',
      bn: 'গ্রামের সাপ্তাহিক হাট',
      hi: 'गांव का साप्ताहिक बाजार',
      en: 'The Rural Weekly Bazaar',
    },
    sentences: {
      as: [
        'দেওবাৰে পুৱাই তৰুণ দাদাই মৰাপাটৰ মোনা এটা লৈ গাঁৱৰ সাপ্তাহিক হাটলৈ গ’ল।',
        'হাটত নতুনকৈ তোলা বগা ওলকবি আৰু মিঠা ৰঙালাউৰ শাৰী শাৰী দোকান বহিছিল।',
        'দাদাই নৈৰ তাজা চিতল মাছ আৰু মাটিৰ চৰুত থোৱা মিঠা গুৰ কিনিলে।',
        'হাতৰ মোনাটো গধূৰ হোৱাত তেওঁ বাঁহৰ দলঙৰ কাষৰ চাহৰ দোকানত বহিল।',
        'চিনাকি মানুহৰ লগত সুখ-দুখৰ কথা পাতি তেওঁ হাঁহিমুখে ঘৰলৈ খোজ ল’লে।',
      ],
      bn: [
        'রবিবার সকালে তরুণ কাকু পাটের ব্যাগ নিয়ে গ্রামের সাপ্তাহিক হাটে গেলেন।',
        'হাটে নতুন তোলা সাদা ওলকপি ও মিষ্টি কুমড়োর সারি সারি দোকান বসেছিল।',
        'কাকু নদীর তাজা চিতল মাছ এবং মাটির পাত্রে রাখা মিষ্টি গুড় কিনলেন।',
        'হাতের ব্যাগটি ভারী হয়ে যাওয়ায় তিনি বাঁশের সেতুর পাশের চায়ের দোকানে বসলেন।',
        'চেনা মানুষের সঙ্গে সুখ-দুঃখের গল্প করে তিনি হাসিমুখে বাড়ির দিকে রওনা হলেন।',
      ],
      hi: [
        'रविवार की सुबह तरुण चाचा जूट का थैला लेकर गांव के साप्ताहिक बाजार पहुंचे।',
        'बाजार में ताजी सफेद गांठगोभी और मीठे कद्दू की कतारबद्ध दुकानें सजी थीं।',
        'चाचा ने नदी की ताजी चीतल मछली और मिट्टी की हांडी में रखा मीठा गुड़ खरीदा।',
        'थैला भारी होने पर वे बांस के पुल के पास बनी चाय की दुकान पर बैठ गए।',
        'परिचित लोगों से सुख-दुख की बातें करके वे मुस्कुराते हुए घर की ओर चल पड़े।',
      ],
      en: [
        'On Sunday morning, Tarun took a sturdy jute bag and walked to the village weekly market.',
        'Lined across the stalls were freshly harvested crisp knolkhol cabbages and sweet orange pumpkins.',
        'Tarun purchased fresh river chital fish and sweet sugarcane jaggery stored in an earthen pot.',
        'With his bag growing heavy, he paused at a small tea stall nestled right beside the bamboo footbridge.',
        'After exchanging warm laughter and village news with familiar neighbors, he happily walked home.',
      ],
    },
    questions: [
      {
        id: 'bazaar_q1',
        elementCategory: 'protagonist',
        questionText: {
          as: 'সাপ্তাহিক হাটলৈ মোনা লৈ কোনে গৈছিল?',
          bn: 'সাপ্তাহিক হাটে ব্যাগ নিয়ে কে গিয়েছিলেন?',
          hi: 'साप्ताहिक बाजार में थैला लेकर कौन गया था?',
          en: 'Who went to the weekly market with a bag?',
        },
        options: {
          as: ['তৰুণ দাদা', 'যোগেন দোকানী', 'প্ৰদীপ ককা', 'মহেন্দ্ৰ মাষ্টৰ'],
          bn: ['তরুণ কাকু', 'যোগেন দোকানদার', 'প্রদীপ দাদু', 'মহেন্দ্র মাস্টার'],
          hi: ['तरुण चाचा', 'जोगेन दुकानदार', 'प्रदीप दादाजी', 'महेंद्र मास्टर'],
          en: ['Tarun', 'Jogen Shopkeeper', 'Pradip Grandfather', 'Mahendra Teacher'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'প্রথম বাক্যত বজাৰলৈ যোৱা ব্যক্তিজনৰ নাম চাওক।',
          bn: 'প্রথম বাক্যে বাজারে যাওয়া ব্যক্তির নামটি দেখুন।',
          hi: 'पहले वाक्य में बाजार जाने वाले व्यक्ति का नाम पढ़ें।',
          en: 'Check the very first sentence for the shopper.',
        },
      },
      {
        id: 'bazaar_q2',
        elementCategory: 'action',
        questionText: {
          as: 'তৰুণ দাদাই হাটৰ পৰা কি মাছ আৰু মিঠাই কিনিলে?',
          bn: 'তরুণ কাকু হাট থেকে কী মাছ ও মিষ্টি জিনিস কিনলেন?',
          hi: 'तरुण चाचा ने बाजार से कौन सी मछली और मीठी वस्तु खरीदी?',
          en: 'What fish and sweet item did Tarun buy from the market?',
        },
        options: {
          as: ['তাজা চিতল মাছ আৰু মিঠা গুৰ', 'শুকান মাছ আৰু লাড়ু', 'ৰৌ মাছ আৰু জিলাপী', 'ইলিচ মাছ আৰু সন্দেশ'],
          bn: ['তাজা চিতল মাছ ও মিষ্টি গুড়', 'শুটকি মাছ ও নাড়ু', 'রুই মাছ ও জিলিপি', 'ইলিশ মাছ ও সন্দেশ'],
          hi: ['ताजी चीतल मछली और मीठा गुड़', 'सूखी मछली और लड्डू', 'रोहू मछली और जलेबी', 'हिल्सा मछली और संदेश'],
          en: ['Fresh chital fish and sweet jaggery', 'Dried fish and laddoos', 'Rohu fish and jalebis', 'Hilsa fish and sandesh'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'তৃতীয় বাক্যত চিতল মাছ আৰু মাটিৰ চৰুৰ গুৰৰ কথা আছে।',
          bn: 'তৃতীয় বাক্যে চিতল মাছ ও মাটির পাত্রের গুড়ের উল্লেখ আছে।',
          hi: 'तीसरे वाक्य में मछली और गुड़ के नाम पढ़ें।',
          en: 'The third sentence lists the river fish and jaggery.',
        },
      },
      {
        id: 'bazaar_q3',
        elementCategory: 'setting',
        questionText: {
          as: 'মোনাটো গধূৰ হোৱাত তেওঁ ক’ত জিৰণি ল’লে?',
          bn: 'ব্যাগটি ভারী হয়ে যাওয়ায় তিনি কোথায় বিশ্রাম নিয়েছিলেন?',
          hi: 'थैला भारी होने पर उन्होंने कहां विश्राम किया?',
          en: 'Where did he stop to rest when the bag grew heavy?',
        },
        options: {
          as: ['বাঁহৰ দলঙৰ কাষৰ চাহ দোকানত', 'মন্দিৰৰ চিৰিত', 'ডাকঘৰৰ সন্মুখত', 'নদীৰ নাওত'],
          bn: ['বাঁশের সেতুর পাশের চায়ের দোকানে', 'মন্দিরের সিঁড়িতে', 'ডাকঘরের সামনে', 'নদীর নৌকায়'],
          hi: ['बांस के पुल के पास चाय की दुकान पर', 'मंदिर की सीढ़ियों पर', 'डाकघर के सामने', 'नदी की नाव में'],
          en: ['At a tea stall beside the bamboo footbridge', 'On the temple steps', 'In front of the post office', 'Inside a ferry boat'],
        },
        correctOptionIndex: 0,
        clueHintText: {
          as: 'চতুৰ্থ বাক্যত দলঙৰ কাষৰ দোকানৰ উল্লেখ চাওক।',
          bn: 'চতুর্থ বাক্যে সেতুর পাশের দোকানের উল্লেখ দেখুন।',
          hi: 'चौथे वाक्य में पुल के पास वाली दुकान देखें।',
          en: 'Look at the fourth sentence for the resting spot near the bridge.',
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
      // Create calibrated options: correct option is index 0 in the master dataset
      const correctIdx = q.correctOptionIndex;

      const trimmedOptions: Record<SupportedLanguage, string[]> = {
        as: q.options.as.slice(0, targetChoicesCount),
        bn: q.options.bn.slice(0, targetChoicesCount),
        hi: q.options.hi.slice(0, targetChoicesCount),
        en: q.options.en.slice(0, targetChoicesCount),
      };

      // In the master data, correct option is always index 0
      return {
        ...q,
        options: trimmedOptions,
        correctOptionIndex: correctIdx < targetChoicesCount ? correctIdx : 0,
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
