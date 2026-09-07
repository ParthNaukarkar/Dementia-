import type { SupportedLanguage } from '../../types/prescription';

export interface LocationData {
  id: string;
  name: Record<SupportedLanguage, string>;
  clues: Record<SupportedLanguage, string[]>;
}

export const LOCATIONS: LocationData[] = [
  {
    id: 'kaziranga',
    name: {
      en: 'Kaziranga National Park',
      as: 'কাজিৰঙা ৰাষ্ট্ৰীয় উদ্যান',
      bn: 'কাজিরাপঙা জাতীয় উদ্যান',
      hi: 'काजीरंगा राष्ट्रीय उद्यान'
    },
    clues: {
      en: [
        'It is located in the state of Assam.',
        'It is a World Heritage Site recognized by UNESCO.',
        'It is famous for the Great Indian One-Horned Rhinoceros.'
      ],
      as: [
        'এই স্থানখন অসমত অৱস্থিত।',
        'ই ইউনেস্কোৰ বিশ্ব ঐতিহ্য ক্ষেত্ৰৰ স্বীকৃতি প্ৰাপ্ত।',
        'ই এশিঙীয়া গঁড়ৰ বাবে বিখ্যাত।'
      ],
      bn: [
        'এটি আসাম রাজ্যে অবস্থিত।',
        'এটি ইউনেস্কো ওয়ার্ল্ড হেরিটেজ সাইট।',
        'এটি একশৃঙ্গ গণ্ডারের জন্য বিখ্যাত।'
      ],
      hi: [
        'यह असम राज्य में स्थित है।',
        'यह यूनेस्को द्वारा मान्यता प्राप्त विश्व धरोहर स्थल है।',
        'यह एक सींग वाले गैंडे के लिए प्रसिद्ध है।'
      ]
    }
  },
  {
    id: 'majuli',
    name: {
      en: 'Majuli',
      as: 'মাজুলী',
      bn: 'মাজুলী',
      hi: 'माजुली'
    },
    clues: {
      en: [
        'It is surrounded by water on all sides.',
        'It is the largest river island in the world.',
        'It is the cultural capital of Assamese neo-Vaishnavite culture (Satras).'
      ],
      as: [
        'ইয়াৰ চাৰিওফালে পানীৰে আবৃত।',
        'ই বিশ্বৰ সৰ্ববৃহৎ নদী দ্বীপ।',
        'ই অসমীয়া নৱ-বৈষ্ণৱ সংস্কৃতিৰ (সত্ৰসমূহৰ) কেন্দ্ৰস্থল।'
      ],
      bn: [
        'এটি চারদিক থেকে জল দ্বারা বেষ্টিত।',
        'এটি বিশ্বের বৃহত্তম নদী দ্বীপ।',
        'এটি অসমীয়া নব-বৈষ্ণব সংস্কৃতির (সত্র) কেন্দ্র।'
      ],
      hi: [
        'यह चारों ओर से पानी से घिरा है।',
        'यह दुनिया का सबसे बड़ा नदी द्वीप है।',
        'यह असमिया नव-वैष्णव संस्कृति (सत्र) का केंद्र है।'
      ]
    }
  },
  {
    id: 'kamakhya',
    name: {
      en: 'Kamakhya Temple',
      as: 'কামাখ্যা মন্দিৰ',
      bn: 'কামাখ্যা মন্দির',
      hi: 'कामाख्या मंदिर'
    },
    clues: {
      en: [
        'It is located in Guwahati.',
        'It is situated on the Nilachal Hill.',
        'It hosts the famous annual Ambubachi Mela.'
      ],
      as: [
        'এই মন্দিৰ গুৱাহাটীত অৱস্থিত।',
        'ই নীলাচল পাহাৰত অৱস্থিত।',
        'ইয়াত প্ৰতি বছৰে অম্বুবাচী মেলা অনুষ্ঠিত হয়।'
      ],
      bn: [
        'এই মন্দির গুয়াহাটিতে অবস্থিত।',
        'এটি নীলাচল পাহাড়ে অবস্থিত।',
        'এখানে বিখ্যাত বার্ষিক অম্বুবাচী মেলা অনুষ্ঠিত হয়।'
      ],
      hi: [
        'यह मंदिर गुवाहाटी में स्थित है।',
        'यह नीलाचल पहाड़ी पर स्थित है।',
        'यहाँ प्रसिद्ध वार्षिक अंबुबाची मेला आयोजित किया जाता है।'
      ]
    }
  },
  {
    id: 'loktak',
    name: {
      en: 'Loktak Lake',
      as: 'লকটক হ্ৰদ',
      bn: 'লোকতাক হ্রদ',
      hi: 'लोकतक झील'
    },
    clues: {
      en: [
        'It is located in the state of Manipur.',
        'It is the largest freshwater lake in Northeast India.',
        'It is famous for the floating circular swamps called Phumdis.'
      ],
      as: [
        'ই মণিপুৰ ৰাজ্যত অৱস্থিত।',
        'ই উত্তৰ-পূব ভাৰতৰ সৰ্ববৃহৎ নিৰ্মল পানীৰ হ্ৰদ।',
        'ই ওপঙি থকা ফুমডিৰ বাবে বিখ্যাত।'
      ],
      bn: [
        'এটি মণিপুর রাজ্যে অবস্থিত।',
        'এটি উত্তর-পূর্ব ভারতের বৃহত্তম স্বাদু জলের হ্রদ।',
        'এটি ভাসমান বৃত্তাকার জলাভূমির (ফুমডি) জন্য বিখ্যাত।'
      ],
      hi: [
        'यह मणिपुर राज्य में स्थित है।',
        'यह पूर्वोत्तर भारत की सबसे बड़ी मीठे पानी की झील है।',
        'यह तैरते हुए फुमदी (फुमडिस) के लिए प्रसिद्ध है।'
      ]
    }
  },
  {
    id: 'tawang',
    name: {
      en: 'Tawang Monastery',
      as: 'টাৱাং মঠ',
      bn: 'তাওয়াং মঠ',
      hi: 'तवांग मठ'
    },
    clues: {
      en: [
        'It is located in Arunachal Pradesh.',
        'It is situated at an elevation of about 3,000 meters.',
        'It is the largest Buddhist monastery in India.'
      ],
      as: [
        'ই অৰুণাচল প্ৰদেশত অৱস্থিত।',
        'ই প্ৰায় ৩,০০০ মিটাৰ উচ্চতাত অৱস্থিত।',
        'ই ভাৰতৰ সৰ্ববৃহৎ বৌদ্ধ মঠ।'
      ],
      bn: [
        'এটি অরুণাচল প্রদেশে অবস্থিত।',
        'এটি প্রায় ৩,০০০ মিটার উচ্চতায় অবস্থিত।',
        'এটি ভারতের বৃহত্তম বৌদ্ধ মঠ।'
      ],
      hi: [
        'यह अरुणाचल प्रदेश में स्थित है।',
        'यह लगभग 3,000 मीटर की ऊंचाई पर स्थित है।',
        'यह भारत का सबसे बड़ा बौद्ध मठ है।'
      ]
    }
  },
  {
    id: 'cherrapunji',
    name: {
      en: 'Cherrapunji',
      as: 'চেৰাপুঞ্জী',
      bn: 'চেরাপুঞ্জি',
      hi: 'चेरापूंजी'
    },
    clues: {
      en: [
        'It is located in the state of Meghalaya.',
        'It is known for the Living Root Bridges.',
        'It was once credited as being the wettest place on Earth.'
      ],
      as: [
        'ই মেঘালয় ৰাজ্যত অৱস্থিত।',
        'ই জীৱন্ত শিপাৰ দলঙৰ বাবে পৰিচিত।',
        'ইয়াক এসময়ত পৃথিৱীৰ আটাইতকৈ বেছি বৰষুণ হোৱা ঠাই বুলি ধৰা হৈছিল।'
      ],
      bn: [
        'এটি মেঘালয় রাজ্যে অবস্থিত।',
        'এটি জীবন্ত শেকড়ের সেতুর জন্য পরিচিত।',
        'এটিকে একসময় পৃথিবীর সবচেয়ে বৃষ্টিবহুল স্থান হিসেবে ধরা হতো।'
      ],
      hi: [
        'यह मेघालय राज्य में स्थित है।',
        'यह जीवित जड़ पुलों (Living Root Bridges) के लिए जाना जाता है।',
        'इसे कभी पृथ्वी पर सबसे अधिक वर्षा वाले स्थान के रूप में जाना जाता था।'
      ]
    }
  }
];
