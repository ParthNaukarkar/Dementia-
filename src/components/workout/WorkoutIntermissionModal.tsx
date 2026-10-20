import React from 'react';
import { 
  CheckCircle2, 
  Brain, 
  Sparkles, 
  Coffee,
  Heart,
  X,
  Cpu
} from 'lucide-react';
import type { SupportedLanguage } from '../../types/prescription';
import { AIGameCalibratorService } from '../../services/ai-game-calibrator';

interface WorkoutIntermissionModalProps {
  isOpen: boolean;
  language: SupportedLanguage;
  patientName?: string;
  completedGameTitle: string;
  completedIndex: number;
  totalExercises: number;
  lastSummary?: any | null;
  nextGameTitle: string;
  nextGameSubtitle?: string;
  nextGameDomain?: string;
  nextGameEstimatedMinutes?: number;
  flowReason?: string;
  flowRationale?: string;
  onStartNext: () => void;
  onExitWorkout: () => void;
}

export const WorkoutIntermissionModal: React.FC<WorkoutIntermissionModalProps> = ({
  isOpen,
  language,
  patientName = 'Dadu',
  completedGameTitle,
  completedIndex,
  totalExercises,
  lastSummary,
  nextGameTitle,
  nextGameSubtitle,
  nextGameDomain = 'Cognitive Stimulation',
  nextGameEstimatedMinutes = 3,
  flowReason: _flowReason,
  flowRationale,
  onStartNext,
  onExitWorkout,
}) => {
  if (!isOpen) return null;

  const isHi = language === 'hi';
  const currentStep = completedIndex + 1;
  const progressPercent = Math.round((currentStep / totalExercises) * 100);
  const recentCalibrations = AIGameCalibratorService.getHistory();
  const lastCalibration = recentCalibrations.length > 0 ? recentCalibrations[0] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-[#E5DFD5] overflow-hidden text-[#1F2421]">
        
        {/* Top Header (Keen Warm Ivory) */}
        <div className="bg-[#F4F0EA] p-6 sm:p-7 relative border-b border-[#E5DFD5]">
          <button
            onClick={onExitWorkout}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#636B65] hover:text-[#C05634] border border-[#E5DFD5] transition-colors cursor-pointer"
            title={isHi ? 'वर्कआउट से बाहर निकलें' : 'Exit Workout'}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-[#EDF5F0] border border-[#CCE2D4] flex items-center justify-center text-[#28573E] shrink-0 shadow-xs">
              <CheckCircle2 className="w-7 h-7 text-[#28573E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-[#EDF5F0] text-[#28573E] border border-[#CCE2D4] px-2.5 py-0.5 rounded-full">
                  {isHi ? `अभ्यास ${currentStep} / ${totalExercises} पूर्ण` : `Exercise ${currentStep} of ${totalExercises} Complete`}
                </span>
                <span className="text-xs text-[#636B65] font-bold">
                  {progressPercent}% {isHi ? 'पूर्ण' : 'Done'}
                </span>
              </div>
              <h2 className="font-['Sora'] text-xl sm:text-2xl font-bold text-[#1F2421] mt-1">
                {isHi ? `बहुत बढ़िया प्रयास, ${patientName.split(' ')[0]} जी!` : `Wonderful effort, ${patientName.split(' ')[0]}!`}
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5">
          
          {/* Reassurance & Breathing Break Box (Keen Warm Rest Architecture) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF3E7] border border-[#F2E1C2] flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white text-[#A86F15] border border-[#F2E1C2] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Coffee className="w-5 h-5 text-[#A86F15]" />
            </div>
            <div>
              <h4 className="font-['Sora'] text-xs font-bold uppercase tracking-wider text-[#7D520E] flex items-center gap-1.5">
                <span>{isHi ? 'विश्राम एवं राहत ब्रेक' : 'Calm Rest & Hydration Break'}</span>
                <Heart className="w-3.5 h-3.5 text-[#C05634] fill-[#C05634]" />
              </h4>
              <p className="text-sm text-[#7D520E] font-medium mt-1 leading-relaxed">
                {isHi 
                  ? 'गहरी सांस लें और आराम करें। कोई जल्दबाजी नहीं है। जब आप सहज महसूस करें, हम अगला अभ्यास शुरू करेंगे।'
                  : 'Take a relaxed breath and sip some water. There is zero rush. When you feel ready, tap below to continue.'}
              </p>
            </div>
          </div>

          {/* Just Completed Performance Summary in Warm Well */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F4F0EA] border border-[#E5DFD5] space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-[#636B65] font-bold uppercase tracking-wider text-[11px]">
              <span>{isHi ? 'अभी पूर्ण किया गया अभ्यास' : 'Just Completed'}</span>
              <span className="text-[#28573E] font-bold">{isHi ? 'सफलतापूर्वक दर्ज' : 'Success Recorded'}</span>
            </div>
            <p className="font-['Sora'] text-base font-bold text-[#1F2421]">
              {completedGameTitle}
            </p>
            {lastSummary && (
              <div className="grid grid-cols-3 gap-2.5 pt-1.5 border-t border-[#E5DFD5] text-center text-xs">
                <div className="p-2 rounded-xl bg-white border border-[#E5DFD5]">
                  <span className="text-[#636B65] block text-[10px] font-bold uppercase">{isHi ? 'सटीकता' : 'Accuracy'}</span>
                  <strong className="text-[#28573E] font-['Sora'] font-bold text-sm">{lastSummary.accuracyPercentage ?? 100}%</strong>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#E5DFD5]">
                  <span className="text-[#636B65] block text-[10px] font-bold uppercase">{isHi ? 'सोचने का समय' : 'Deliberation'}</span>
                  <strong className="text-[#356784] font-['Sora'] font-bold text-sm">{((lastSummary.averageLatencyMs || lastSummary.meanDeliberationMs || 2400) / 1000).toFixed(1)}s</strong>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#E5DFD5]">
                  <span className="text-[#636B65] block text-[10px] font-bold uppercase">{isHi ? 'सहायता' : 'Assistance'}</span>
                  <strong className="text-[#A86F15] font-['Sora'] font-bold text-sm">
                    {lastSummary.autoAssistedRounds || lastSummary.autoAssistedTrials 
                      ? (isHi ? 'सहायता प्राप्त' : 'Assisted') 
                      : (isHi ? 'स्वतंत्र' : 'Independent')}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* AI Game Director Micro-Calibration Card */}
          {lastCalibration && (
            <div className="p-4 rounded-2xl bg-[#EDF5F0] border border-[#CCE2D4] text-xs flex items-start gap-3 text-[#28573E] animate-fadeIn">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#CCE2D4] text-[#28573E] flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-2xs">
                <Cpu className="w-4 h-4 text-[#28573E]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-['Sora'] font-bold text-[11px] uppercase tracking-wider text-[#28573E]">
                    {lastCalibration.calibratorProvider === 'openai' 
                      ? `OpenAI (${lastCalibration.calibratorModel}) Director` 
                      : (isHi ? 'AI गेम कैलिब्रेटर' : 'Adaptive Calibrator')}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-[#28573E] border border-[#CCE2D4]">
                    {isHi ? `स्तर ${lastCalibration.recommendedTier}` : `Tier ${lastCalibration.recommendedTier}`}
                  </span>
                </div>
                <p className="text-xs font-medium leading-relaxed mt-1 text-[#38403A]">
                  {lastCalibration.clinicalRationale}
                </p>
              </div>
            </div>
          )}

          {/* Up Next Card or Final Exercise Completed Banner */}
          {currentStep < totalExercises ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FDF1EB] border border-[#F5D3C4] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-['Sora'] font-bold uppercase tracking-wider text-[#C05634] bg-white px-2.5 py-0.5 rounded-full border border-[#F5D3C4]">
                  {isHi ? `अगला अभ्यास (${currentStep + 1} / ${totalExercises})` : `Next in Routine (${currentStep + 1} of ${totalExercises})`}
                </span>
                <span className="text-xs text-[#C05634] font-bold flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5 text-[#C05634]" />
                  <span>~{nextGameEstimatedMinutes} {isHi ? 'मिनट' : 'mins'}</span>
                </span>
              </div>

              <div>
                <h3 className="font-['Sora'] text-lg font-bold text-[#1F2421]">
                  {nextGameTitle}
                </h3>
                <p className="text-xs text-[#636B65] font-semibold mt-0.5">
                  {nextGameSubtitle || nextGameDomain}
                </p>
              </div>

              {/* Dynamic AI Flow Adaptation Rationale */}
              {flowRationale && (
                <div className="mt-2.5 p-3 rounded-xl bg-white border border-[#F5D3C4] text-xs flex items-start gap-2.5 text-[#38403A] animate-fadeIn">
                  <Sparkles className="w-4 h-4 text-[#C05634] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[11px] uppercase tracking-wider text-[#C05634] block">
                      {isHi ? 'AI क्लिनिकल अनुकूलन' : 'AI Clinical Adaptation'}
                    </span>
                    <p className="text-xs font-medium leading-relaxed mt-0.5 text-[#636B65]">
                      {flowRationale}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#EDF5F0] border border-[#CCE2D4] text-[#28573E] space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-2 font-['Sora'] font-bold text-sm uppercase tracking-wider text-[#28573E]">
                <CheckCircle2 className="w-5 h-5 text-[#28573E]" />
                <span>{isHi ? `सभी ${totalExercises} निर्धारित अभ्यास पूर्ण!` : `All ${totalExercises} Prescribed Exercises Complete!`}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#38403A] font-medium leading-relaxed">
                {isHi 
                  ? 'आपने आज के सभी निर्धारित संज्ञानात्मक अभ्यास सफलतापूर्वक पूर्ण कर लिए हैं। अपनी निर्धारित दवाएं और दैनिक दिनचर्या देखने के लिए नीचे क्लिक करें।'
                  : 'You have successfully completed your prescribed cognitive exercises for today. Click below to review your scheduled medicines and daily routine.'}
              </p>
            </div>
          )}

          {/* Action Buttons: 56px Terracotta Primary Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onStartNext}
              className="w-full sm:flex-1 h-14 rounded-2xl bg-[#C05634] hover:bg-[#A64727] text-white font-['Sora'] font-bold text-base shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>
                {currentStep >= totalExercises 
                  ? (isHi ? 'दवाएं व दिनचर्या जांचें ➔' : 'Check Medications & Routine ➔')
                  : (isHi ? 'अगला अभ्यास शुरू करें ➔' : 'Start Next Exercise ➔')}
              </span>
            </button>

            <button
              onClick={onExitWorkout}
              className="w-full sm:w-auto h-14 px-6 rounded-2xl bg-white hover:bg-[#F4F0EA] border border-[#D5CCC0] text-[#38403A] font-['Sora'] font-bold text-sm cursor-pointer transition-all"
            >
              {isHi ? 'विराम दें' : 'Pause Routine'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
