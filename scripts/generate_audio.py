import asyncio
import os
import edge_tts

VOICES = {
    'as': 'bn-IN-TanishaaNeural', # Native Eastern Indo-Aryan neural voice with natural Assamese phonetics
    'bn': 'bn-IN-TanishaaNeural', # Native Bengali female voice
    'hi': 'hi-IN-SwaraNeural',    # Native Hindi female voice
    'en': 'en-IN-NeerjaNeural',   # Native Indian English voice
}

ITEMS = {
    'assam-tea': {
        'as': 'অসম চাহ',
        'bn': 'আসাম চা',
        'hi': 'असम चाय',
        'en': 'Assam Tea',
    },
    'japi-hat': {
        'as': 'বৰ জাপি',
        'bn': 'জাপি টুপি',
        'hi': 'जापी टोपी',
        'en': 'Traditional Japi Hat',
    },
    'gamusa': {
        'as': 'ফুলম গামোচা',
        'bn': 'গামোছা',
        'hi': 'गामोसा',
        'en': 'Assam Gamusa',
    },
    'dambuk-orange': {
        'as': 'ডাম্বুক সুমথিৰা',
        'bn': 'ডাম্বুক কমলা',
        'hi': 'दाम्बुक संतरा',
        'en': 'Dambuk Sweet Orange',
    },
    'naga-shawl': {
        'as': 'নগা চাদৰ',
        'bn': 'নাগা শাল',
        'hi': 'नागा शॉल',
        'en': 'Naga Shawl',
    },
    'bamboo-basket': {
        'as': 'বাঁহৰ খৰাহী',
        'bn': 'বাঁশের ঝুড়ি',
        'hi': 'बांस की टोकरी',
        'en': 'Bamboo Basket',
    },
    'mizo-puan': {
        'as': 'মিজো পুয়ান',
        'bn': 'মিজো পুয়ান',
        'hi': 'मिज़ो पुआन',
        'en': 'Mizo Puan',
    },
    'king-chilli': {
        'as': 'ভোট জলকীয়া',
        'bn': 'বোম্বাই মরিচ',
        'hi': 'भूत जोलोकिया',
        'en': 'King Chilli',
    },
}

PHRASES = {
    'study-intro': {
        'as': 'এই বস্তুবোৰ ভালদৰে লক্ষ্য কৰক।',
        'bn': 'এই জিনিসগুলো ভালো করে লক্ষ্য করুন।',
        'hi': 'इन वस्तुओं को ध्यान से देखिए।',
        'en': 'Look closely at these bazaar items.',
    },
    'recall-prompt': {
        'as': 'আপুনি বজাৰত কি কি বস্তু দেখিছিল বাছক।',
        'bn': 'আপনি বাজারে কোন কোন জিনিস দেখেছিলেন বেছে নিন।',
        'hi': 'आपने बाज़ार में कौन-सी वस्तुएं देखी थीं, चुनिए।',
        'en': 'Tap the items you saw on the stall.',
    },
    'feedback-correct': {
        'as': 'বৰ ধুনীয়া! আপুনি সকলো শুদ্ধকৈ মনত ৰাখিলে!',
        'bn': 'খুব চমৎকার! আপনি সব সঠিক মনে রেখেছেন!',
        'hi': 'बहुत बढ़िया! आपने सभी वस्तुएं सही याद रखीं!',
        'en': 'Wonderful! You remembered everything correctly!',
    },
    'feedback-partial': {
        'as': 'বহুত ভাল চেষ্টা! আপোনাৰ মনত বহুখিনি আছে!',
        'bn': 'খুব ভালো চেষ্টা! আপনার স্মৃতি দারুণ!',
        'hi': 'बहुत अच्छा प्रयास! आपकी याददाश्त सराहनीय है!',
        'en': 'Great effort! Your memory is strong!',
    },
    'encouragement': {
        'as': 'ধীৰে ধীৰে কৰক, একো খৰখেদা নাই। আপুনি বৰ ভালকৈ কৰিছে।',
        'bn': 'ধীরে ধীরে করুন, কোনো তাড়া নেই। আপনি খুব ভালো করছেন।',
        'hi': 'आराम से करिए, कोई जल्दी नहीं है। आप बहुत अच्छा प्रयास कर रहे हैं।',
        'en': 'Take your time, there is no hurry. You are doing very well.',
    },
}

async def generate_file(text: str, voice: str, output_path: str):
    communicate = edge_tts.Communicate(text, voice, rate="-15%") # -15% slower for elderly
    await communicate.save(output_path)
    print(f"Generated: {output_path}")

async def main():
    base_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')
    os.makedirs(base_dir, exist_ok=True)

    tasks = []

    for lang, voice in VOICES.items():
        lang_dir = os.path.join(base_dir, lang)
        os.makedirs(lang_dir, exist_ok=True)

        # Generate items
        for item_id, translations in ITEMS.items():
            text = translations[lang]
            out = os.path.join(lang_dir, f"{item_id}.mp3")
            tasks.append(generate_file(text, voice, out))

        # Generate phrases
        for phrase_id, translations in PHRASES.items():
            text = translations[lang]
            out = os.path.join(lang_dir, f"{phrase_id}.mp3")
            tasks.append(generate_file(text, voice, out))

    await asyncio.gather(*tasks)
    print(f"All {len(tasks)} audio files generated successfully!")

if __name__ == '__main__':
    asyncio.run(main())
