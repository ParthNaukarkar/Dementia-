import React from 'react';
import { ArrowRight, RotateCcw, CheckCircle2, Sparkles, Heart } from 'lucide-react';
import type { SupportedLanguage } from '../../types/prescription';

export interface PatientGameCompletionStat {
  label: string;
  value: string | number;
}

export interface PatientGameCompletionViewProps {
  language?: SupportedLanguage | string;
  title?: string;
  subtitle?: string;
  activityTitle?: string;
  stats?: PatientGameCompletionStat[];
  onExit?: () => void;
  onRetry?: () => void;
  primaryButtonLabel?: string;
  retryButtonLabel?: string;
}

export const PatientGameCompletionView: React.FC<PatientGameCompletionViewProps> = ({
  language = 'en',
  title,
  subtitle,
  activityTitle,
  stats = [],
  onExit,
  onRetry,
  primaryButtonLabel,
  retryButtonLabel,
}) => {
  const langStr = String(language);
  const isHi = langStr === 'hi';
  const isBn = langStr === 'bn';
  const isAs = langStr === 'as';

  const defaultTitle = isHi
    ? 'शानदार! अभ्यास पूरा हुआ'
    : isBn
    ? 'চমৎকার! অনুশীলন সম্পন্ন হয়েছে'
    : isAs
    ? 'চমৎকাৰ! অনুশীলন সম্পন্ন হ’ল'
    : 'Wonderful! Exercise Complete';

  const defaultSubtitle = isHi
    ? 'आपने आज का अभ्यास पूरे ध्यान और धैर्य के साथ पूरा किया। आपका अभ्यास आपकी देखभालकर्ता के लिए सुरक्षित सहेज लिया गया है।'
    : isBn
    ? 'আপনি আজকের অনুশীলনটি শান্ত মনোযোগ এবং ধৈর্যের সাথে সম্পন্ন করেছেন।'
    : isAs
    ? 'আপুনি আজিৰ অনুশীলনটো শান্ত মনোযোগেৰে সম্পন্ন কৰিছে।'
    : 'You completed today’s exercise with calm focus and patience. Your progress has been safely saved.';

  const defaultPrimaryLabel = isHi
    ? 'डैशबोर्ड पर लौटें'
    : isBn
    ? 'ড্যাশবোর্ডে ফিরে যান'
    : isAs
    ? 'ডেচব’ৰ্ডলৈ উভতি যাওক'
    : 'Return to Dashboard';

  const defaultRetryLabel = isHi
    ? 'पुनः खेलें'
    : isBn
    ? 'আবার খেলুন'
    : isAs
    ? 'পুনৰ খেলক'
    : 'Play Again';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 sm:p-8 max-w-2xl mx-auto w-full animate-fadeIn">
      <div className="bg-[#FAF8F5] text-[#1F2421] w-full rounded-3xl sm:rounded-[32px] border-2 border-[#E5DFD5] shadow-xl p-6 sm:p-10 text-center space-y-6">
        
        {/* Warm Celebratory Trophy Badge */}
        <div className="relative inline-block mx-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#FAF3E7] text-[#C05634] border-2 border-[#F2E1C2] flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-[#C05634]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#28573E] text-white flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Reassuring Titles */}
        <div className="space-y-2">
          {activityTitle && (
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#EDF5F0] text-[#28573E] font-['Sora'] text-xs font-bold tracking-wider uppercase">
              {activityTitle}
            </span>
          )}
          <h2 className="font-['Sora'] text-2xl sm:text-3xl font-black text-[#1F2421] leading-tight">
            {title || defaultTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#636B65] max-w-lg mx-auto font-medium leading-relaxed">
            {subtitle || defaultSubtitle}
          </p>
        </div>

        {/* Gentle, Elder-Friendly Stats (Strictly Non-Clinical) */}
        {stats.length > 0 && (
          <div className={`grid gap-3 pt-2 max-w-md mx-auto ${
            stats.length === 1 ? 'grid-cols-1' : stats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
          }`}>
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DFD5] shadow-2xs space-y-1"
              >
                <span className="text-[11px] font-['Sora'] font-bold text-[#636B65] uppercase tracking-wider block">
                  {stat.label}
                </span>
                <span className="text-xl sm:text-2xl font-['Sora'] font-black text-[#1F2421] block">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Supportive Wellness Well */}
        <div className="p-4 rounded-2xl bg-[#EDF5F0] border border-[#CCE2D4] flex items-center justify-center gap-3 text-xs sm:text-sm text-[#28573E] font-medium max-w-md mx-auto">
          <Heart className="w-5 h-5 text-[#28573E] shrink-0" />
          <span>
            {isHi
              ? 'दैनिक नियमित अभ्यास आपके मस्तिष्क को सक्रिय और स्वस्थ बनाए रखता है।'
              : 'Consistent daily exercises keep your mind engaged, active, and healthy.'}
          </span>
        </div>

        {/* Primary Interactive Touch Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto h-14 px-6 rounded-2xl bg-[#F4F0EA] hover:bg-[#EDE7DE] text-[#1F2421] border border-[#E5DFD5] font-['Sora'] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <RotateCcw className="w-4 h-4 text-[#636B65]" />
              <span>{retryButtonLabel || defaultRetryLabel}</span>
            </button>
          )}

          {onExit && (
            <button
              onClick={onExit}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-[#C05634] hover:bg-[#A8492A] text-white font-['Sora'] font-black text-sm sm:text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98"
            >
              <span>{primaryButtonLabel || defaultPrimaryLabel}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
