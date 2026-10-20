import type { BazaarItem } from './types';

/**
 * Culturally Authentic Pan-Indian Bazaar & Haat Items
 * Grounded in universally recognized national heritage to stimulate emotional resonance & reminiscence in older adults.
 */
export const BAZAAR_CATALOG: BazaarItem[] = [
  {
    id: 'spiced-tea',
    names: {
      as: 'মছলাদাৰ সুবাসিত চাহ (Masala Chai)',
      bn: 'সুগন্ধি মশলা চা (Masala Chai)',
      hi: 'कुल्हड़ मसाला चाय (Masala Chai)',
      en: 'Spiced Masala Chai Pack',
    },
    category: 'beverage',
    icon: '🍵',
    colorBg: 'bg-amber-100 border-amber-400 text-amber-950',
    regionOrigin: 'Assam & Darjeeling',
  },
  {
    id: 'alphonso-mango',
    names: {
      as: 'ৰসাল পকা আম (Alphonso Mango)',
      bn: 'মিষ্টি পাকা আম (Alphonso Mango)',
      hi: 'अल्फ़ांसो मीठा आम (Alphonso Mango)',
      en: 'Alphonso Sweet Mangoes',
    },
    category: 'produce',
    icon: '🥭',
    colorBg: 'bg-orange-100 border-orange-400 text-orange-950',
    regionOrigin: 'Ratnagiri, Maharashtra',
  },
  {
    id: 'banarasi-silk',
    names: {
      as: 'বনাৰসী ৰেচমী ওৰণি (Banarasi Silk)',
      bn: 'বেনারসি রেশম ওড়না (Banarasi Silk)',
      hi: 'बनारसी रेशमी दुपट्टा (Banarasi Silk)',
      en: 'Banarasi Zari Silk Stole',
    },
    category: 'textile',
    icon: '🧣',
    colorBg: 'bg-rose-100 border-rose-400 text-rose-950',
    regionOrigin: 'Varanasi, Uttar Pradesh',
  },
  {
    id: 'brass-diya',
    names: {
      as: 'পিতলৰ কাৰুকাৰ্য্যময় চাকি (Brass Diya)',
      bn: 'নকশাদার পিতলের প্রদীপ (Brass Diya)',
      hi: 'हस्तनिर्मित पीतल का दीया (Brass Diya)',
      en: 'Handcrafted Brass Diya',
    },
    category: 'craft',
    icon: '🪔',
    colorBg: 'bg-yellow-100 border-yellow-500 text-yellow-950',
    regionOrigin: 'Moradabad, Uttar Pradesh',
  },
  {
    id: 'kashmiri-saffron',
    names: {
      as: 'পৱিত্ৰ কাশ্মিৰী কেশৰ (Kashmiri Kesar)',
      bn: 'খাঁটি কাশ্মীরি জাফরান (Kashmiri Kesar)',
      hi: 'शुद्ध कश्मीरी केसर (Kashmiri Saffron)',
      en: 'Pure Kashmiri Saffron',
    },
    category: 'produce',
    icon: '🌸',
    colorBg: 'bg-red-100 border-red-400 text-red-950',
    regionOrigin: 'Pampore, Kashmir',
  },
  {
    id: 'terracotta-matka',
    names: {
      as: 'মাটিৰ সুন্দৰ কলহ (Terracotta Matka)',
      bn: 'মাটির সুদৃশ্য কলসি (Terracotta Matka)',
      hi: 'मिट्टी का पारंपरिक घड़ा (Terracotta Matka)',
      en: 'Earthen Terracotta Matka',
    },
    category: 'craft',
    icon: '🏺',
    colorBg: 'bg-amber-100 border-amber-500 text-amber-950',
    regionOrigin: 'Rajasthan & Bengal',
  },
  {
    id: 'nagpur-orange',
    names: {
      as: 'নাগপুৰৰ সুমথিৰা (Nagpur Orange)',
      bn: 'নাগপুরি মিষ্টি কমলা (Nagpur Orange)',
      hi: 'नागपुरी रसीला संतरा (Nagpur Orange)',
      en: 'Nagpur Sweet Oranges',
    },
    category: 'produce',
    icon: '🍊',
    colorBg: 'bg-orange-100 border-orange-500 text-orange-950',
    regionOrigin: 'Nagpur, Maharashtra',
  },
  {
    id: 'pashmina-shawl',
    names: {
      as: 'কোমল পশ্মিনা চাদৰ (Pashmina Shawl)',
      bn: 'কাশ্মীরি পশমিনা শাল (Pashmina Shawl)',
      hi: 'कश्मीरी पश्मीना शॉल (Pashmina Shawl)',
      en: 'Kashmiri Pashmina Shawl',
    },
    category: 'textile',
    icon: '👘',
    colorBg: 'bg-indigo-100 border-indigo-400 text-indigo-950',
    regionOrigin: 'Kashmir Valley',
  },
  {
    id: 'bamboo-basket',
    names: {
      as: 'বাঁহ আৰু বেতৰ খৰাহী (Bamboo Basket)',
      bn: 'হাতে বোনা বাঁশের ঝুড়ি (Bamboo Basket)',
      hi: 'बांस और बेंत की टोकरी (Bamboo Basket)',
      en: 'Handcrafted Cane Basket',
    },
    category: 'craft',
    icon: '🧺',
    colorBg: 'bg-lime-100 border-lime-500 text-lime-950',
    regionOrigin: 'Tripura & Assam',
  },
  {
    id: 'green-cardamom',
    names: {
      as: 'সুগন্ধি সৰু ইলাচী (Green Cardamom)',
      bn: 'সুগন্ধি ছোট এলাচ (Green Cardamom)',
      hi: 'मालाबार छोटी इलायची (Green Cardamom)',
      en: 'Aromatic Green Cardamom',
    },
    category: 'produce',
    icon: '🌿',
    colorBg: 'bg-emerald-100 border-emerald-400 text-emerald-950',
    regionOrigin: 'Kerala & Western Ghats',
  },
  {
    id: 'kanjeevaram-silk',
    names: {
      as: 'কাঞ্জিভৰম ৰেচমী বস্ত্ৰ (Kanjeevaram)',
      bn: 'কাঞ্জিভরম রেশম শাড়ি (Kanjeevaram)',
      hi: 'कांजीवरम हथकरघा रेशम (Kanjeevaram)',
      en: 'Kanjeevaram Handloom Silk',
    },
    category: 'textile',
    icon: '🧵',
    colorBg: 'bg-purple-100 border-purple-400 text-purple-950',
    regionOrigin: 'Tamil Nadu',
  },
  {
    id: 'mysore-sandalwood',
    names: {
      as: 'মহীশূৰৰ চন্দন কাঠৰ শিল্প (Sandalwood)',
      bn: 'মহীশূর চন্দন কাঠের কারুশিল্প (Sandalwood)',
      hi: 'मैसूर सुगंधित चंदन शिल्प (Sandalwood)',
      en: 'Mysore Sandalwood Craft',
    },
    category: 'craft',
    icon: '🪵',
    colorBg: 'bg-stone-100 border-stone-400 text-stone-950',
    regionOrigin: 'Mysore, Karnataka',
  },
];
