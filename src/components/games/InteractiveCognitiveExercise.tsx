import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SupportedLanguage, GameId } from '../../types/prescription';
import { GAME_CATALOG } from '../../data/gameCatalog';
import { vernacularVoice } from '../../engine/vernacular-voice';

interface InteractiveCognitiveExerciseProps {
  gameId: GameId;
  language: SupportedLanguage;
  onSessionComplete?: (summary: any) => void;
  onExit?: () => void;
}

export const InteractiveCognitiveExercise: React.FC<InteractiveCognitiveExerciseProps> = ({
  gameId,
  language,
  onSessionComplete,
  onExit,
}) => {
  const meta = GAME_CATALOG.find(g => g.id === gameId) || GAME_CATALOG[0];
  
  // Exercise Phase: STUDY -> RECALL -> COMPLETE
  const [phase, setPhase] = useState<'STUDY' | 'RECALL' | 'COMPLETE'>('STUDY');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [deliberationSeconds, setDeliberationSeconds] = useState(0);

  const startTimeRef = useRef<number>(Date.now());
  const lastTapRef = useRef<number>(0);

  // Restart / Initialize
  const resetExercise = () => {
    setPhase('STUDY');
    setSelectedAnswer(null);
    setIsCorrect(null);
    setDeliberationSeconds(0);
    startTimeRef.current = Date.now();
  };

  useEffect(() => {
    resetExercise();
  }, [gameId]);

  // Deliberation timer
  useEffect(() => {
    if (phase !== 'RECALL') return;
    const timer = setInterval(() => {
      setDeliberationSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Exercise content generation based on game domain & id
  const getExerciseContent = () => {
    switch (gameId) {
      case 'number-recall':
        return {
          studyTitle: language === 'hi' 
            ? 'इस संख्या अनुक्रम को याद रखें (संख्या स्मरण)' 
            : 'Remember this Number Sequence (Digit Recall)',
          studyItems: ['4', '9', '2', '7'],
          studyPrompt: language === 'hi'
            ? 'इस 4-अंकीय कोड का ध्यान से अध्ययन करें। तैयार होने पर आगे बढ़ें।'
            : 'Study this 4-digit code. When you are ready, tap Continue.',
          question: language === 'hi'
            ? 'कौन सा अनुक्रम प्रदर्शित किया गया था?'
            : 'Which sequence was displayed?',
          options: [
            { id: 'opt_1', text: '4 - 9 - 2 - 7', isRight: true },
            { id: 'opt_2', text: '4 - 2 - 9 - 7', isRight: false },
            { id: 'opt_3', text: '7 - 2 - 9 - 4', isRight: false },
          ],
        };
      case 'what-changed':
        return {
          studyTitle: language === 'hi'
            ? 'सुबह के दृश्य का अवलोकन करें (दृश्य अवलोकन)'
            : 'Observe the Morning Scene (Visual Observation)',
          studyItems: [
            language === 'hi' ? '🫖 गर्म चाय' : '🫖 Hot Tea',
            language === 'hi' ? '🥖 ताज़ा ब्रेड' : '🥖 Fresh Bread',
            language === 'hi' ? '🧺 बांस की टोकरी' : '🧺 Bamboo Basket',
          ],
          studyPrompt: language === 'hi'
            ? 'मेज़ पर रखी 3 नाश्ते की वस्तुओं पर ध्यान दें।'
            : 'Notice the 3 breakfast items on the table.',
          question: language === 'hi'
            ? 'टोकरी बदल दी गई थी! क्या गायब है?'
            : 'The basket was replaced! What is missing?',
          options: [
            { id: 'opt_1', text: language === 'hi' ? '🧺 बांस की टोकरी' : '🧺 Bamboo Basket', isRight: true },
            { id: 'opt_2', text: language === 'hi' ? '🫖 गर्म चाय' : '🫖 Hot Tea', isRight: false },
            { id: 'opt_3', text: language === 'hi' ? '🥖 ताज़ा ब्रेड' : '🥖 Fresh Bread', isRight: false },
          ],
        };
      case 'odd-one-out':
        return {
          studyTitle: language === 'hi'
            ? 'श्रेणी मिलान (वर्गीकरण)'
            : 'Category Matching (Odd One Out)',
          studyItems: [
            language === 'hi' ? '🐘 हाथी' : '🐘 Elephant',
            language === 'hi' ? '🦏 गैंडा' : '🦏 Rhino',
            language === 'hi' ? '🐅 बाघ' : '🐅 Tiger',
            language === 'hi' ? '🚗 मोटर कार' : '🚗 Motor Car',
          ],
          studyPrompt: language === 'hi'
            ? 'नीचे दी गई चार वस्तुओं को ध्यान से देखें।'
            : 'Look at the four items presented below.',
          question: language === 'hi'
            ? 'कौन सी वस्तु जंगल के जानवरों की श्रेणी में नहीं आती?'
            : 'Which item does NOT belong to the forest animal category?',
          options: [
            { id: 'opt_1', text: language === 'hi' ? '🚗 मोटर कार' : '🚗 Motor Car', isRight: true },
            { id: 'opt_2', text: language === 'hi' ? '🦏 गैंडा' : '🦏 Rhino', isRight: false },
            { id: 'opt_3', text: language === 'hi' ? '🐘 हाथी' : '🐘 Elephant', isRight: false },
          ],
        };
      default:
        return {
          studyTitle: `${meta.title[language]} Stimulation`,
          studyItems: [
            language === 'hi' ? '🌿 प्रकृति' : '🌿 Nature',
            language === 'hi' ? '🪷 शांति' : '🪷 Peace',
            language === 'hi' ? '☀️ सुबह का सूरज' : '☀️ Morning Sun',
          ],
          studyPrompt: language === 'hi'
            ? 'इन तीन तत्वों पर शांतिपूर्वक ध्यान केंद्रित करें।'
            : 'Take a calm moment to focus on these three elements.',
          question: language === 'hi'
            ? 'ऊपर कौन सा सकारात्मक तत्व सूचीबद्ध था?'
            : 'Which positive element was listed above?',
          options: [
            { id: 'opt_1', text: language === 'hi' ? '☀️ सुबह का सूरज' : '☀️ Morning Sun', isRight: true },
            { id: 'opt_2', text: language === 'hi' ? '🌧️ भारी तूफ़ान' : '🌧️ Heavy Storm', isRight: false },
            { id: 'opt_3', text: language === 'hi' ? '❄️ ठंडी हवा' : '❄️ Cold Wind', isRight: false },
          ],
        };
    }
  };

  const content = getExerciseContent();

  const handleSelectAnswer = (optionId: string, isRight: boolean) => {
    const now = Date.now();
    if (now - lastTapRef.current < 400) return; // 400ms tremor debouncing
    lastTapRef.current = now;

    setSelectedAnswer(optionId);
    setIsCorrect(isRight);

    if (isRight) {
      vernacularVoice.playGentleChime('success');
    } else {
      vernacularVoice.playGentleChime('tap');
    }

    setTimeout(() => {
      setPhase('COMPLETE');
      try {
        confetti({ particleCount: 60, spread: 55 });
      } catch {
        // ignore
      }

      const latency = (Date.now() - startTimeRef.current);
      const summary = {
        gameId,
        gameTitle: meta.title[language],
        totalRounds: 1,
        totalCorrect: isRight ? 1 : 0,
        accuracyPercentage: isRight ? 100 : 70,
        averageLatencyMs: latency,
        medianLatencyMs: latency,
        perseverationErrors: 0,
        transpositionErrors: 0,
        intrusionErrors: 0,
        autoAssistedRounds: 0,
        finalTheta: isRight ? 0.85 : 0.1,
        estimatedMoCAMemoryScore: isRight ? 5 : 4,
        processingSpeedProfile: latency < 5000 ? 'normal' : 'deliberate',
        completedAt: new Date().toISOString(),
        rounds: []
      };

      if (onSessionComplete) {
        onSessionComplete(summary);
      }
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      
      {/* Exercise Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            {meta.clinicalStandard}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {meta.title[language]}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {meta.targetBrainArea} • ~{meta.estimatedMinutes} {language === 'hi' ? 'मिनट' : 'mins'}
          </p>
        </div>

        <button
          onClick={resetExercise}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          title={language === 'hi' ? 'अभ्यास पुनः आरंभ करें' : 'Restart Exercise'}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* PHASE 1: STUDY */}
      {phase === 'STUDY' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 text-center animate-fadeIn">
          <div className="border-2 border-teal-200 bg-teal-50/60 p-5 rounded-2xl max-w-lg mx-auto">
            <h3 className="text-base sm:text-lg font-black text-teal-950">
              {content.studyTitle}
            </h3>
            <p className="text-xs text-teal-800 font-bold mt-1">
              {content.studyPrompt}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 py-4">
            {content.studyItems.map((item, idx) => (
              <div 
                key={idx} 
                className="px-6 py-4 rounded-2xl bg-white border-2 border-teal-500 text-slate-900 text-xl sm:text-2xl font-black shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                vernacularVoice.playGentleChime('tap');
                setPhase('RECALL');
              }}
              className="px-8 py-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-base shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-97 flex items-center justify-center gap-2 mx-auto"
            >
              <span>
                {language === 'hi'
                  ? 'मैं उत्तर देने के लिए तैयार हूँ ➔'
                  : 'I am Ready to Answer ➔'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: RECALL */}
      {phase === 'RECALL' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 text-center animate-fadeIn">
          <div className="border-2 border-teal-200 bg-teal-50/60 p-5 rounded-2xl max-w-lg mx-auto">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {content.question}
            </h3>
            <p className="text-xs text-slate-600 font-bold mt-1">
              {language === 'hi'
                ? 'जो विकल्प याद है उसे चुनें:'
                : 'Select the choice you remember:'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto py-2">
            {content.options.map((opt) => {
              const isChosen = selectedAnswer === opt.id;
              return (
                <button
                  key={opt.id}
                  disabled={selectedAnswer !== null}
                  onClick={() => handleSelectAnswer(opt.id, opt.isRight)}
                  className={`p-5 rounded-2xl border-2 font-black text-base transition-all cursor-pointer shadow-xs ${
                    isChosen && opt.isRight
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 scale-102 ring-2 ring-emerald-300'
                      : isChosen && !opt.isRight
                      ? 'bg-rose-50 border-rose-400 text-rose-950'
                      : 'bg-white border-slate-200 hover:border-teal-500 text-slate-800 hover:bg-teal-50/30 active:scale-95'
                  }`}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-bold text-slate-400">
            {language === 'hi'
              ? `समय: ${deliberationSeconds}s`
              : `Time: ${deliberationSeconds}s`}
          </div>
        </div>
      )}

      {/* PHASE 3: COMPLETE */}
      {phase === 'COMPLETE' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 border-2 border-emerald-300 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              {language === 'hi'
                ? 'शानदार! अभ्यास पूरा हुआ'
                : 'Wonderful! Exercise Complete'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
              {language === 'hi' ? 'आपकी प्रगति देखभालकर्ता के लिए सुरक्षित सहेज ली गई है।' : 'Your activity has been safely saved for your caregiver.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 max-w-sm mx-auto">
            {isCorrect
              ? (language === 'hi'
                  ? '✅ 100% सही उत्तर'
                  : '✅ 100% Correct Response')
              : (language === 'hi'
                  ? '✓ अभ्यास सफलतापूर्वक संपन्न'
                  : '✓ Exercise Completed Successfully')}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={resetExercise}
              className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm cursor-pointer transition-all"
            >
              {language === 'hi' ? 'पुनः खेलें' : 'Play Again'}
            </button>

            {onExit && (
              <button
                onClick={onExit}
                className="px-8 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm shadow-sm cursor-pointer transition-all flex items-center gap-2"
              >
                <span>{language === 'hi' ? 'जारी रखें' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
