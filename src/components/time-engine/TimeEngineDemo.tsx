import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Sun, 
  Moon, 
  Sunset, 
  Brain, 
  Activity, 
  Sparkles, 
  Volume2, 
  ShieldAlert, 
  CheckCircle2, 
  RotateCcw,
  Info
} from 'lucide-react';
import { 
  clinicalLatencyEngine, 
  type LatencyStage, 
  type PatientTimingProfile 
} from '../../engine/latency-timer';
import { 
  circadianManager, 
  type CircadianStatus 
} from '../../engine/circadian-manager';
import type { SupportedLanguage } from '../../types/prescription';

interface TimeEngineDemoProps {
  language?: SupportedLanguage;
}

export const TimeEngineDemo: React.FC<TimeEngineDemoProps> = ({ language = 'hi' }) => {
  // Latency Simulator State
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [currentStage, setCurrentStage] = useState<LatencyStage>('NORMAL_DELIBERATION');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lastRecordedLatency, setLastRecordedLatency] = useState<number | null>(null);
  const [timingProfile, setTimingProfile] = useState<PatientTimingProfile>(
    clinicalLatencyEngine.getClinicalTimingProfile()
  );

  // Circadian State
  const [circadian, setCircadian] = useState<CircadianStatus>(circadianManager.getStatus());

  // Animation frame loop for smooth millisecond visual counter
  useEffect(() => {
    let animId: number;
    const start = performance.now();

    const updateDisplay = () => {
      if (isTrialActive) {
        setElapsedMs(Math.round(performance.now() - start));
        animId = requestAnimationFrame(updateDisplay);
      }
    };

    if (isTrialActive) {
      animId = requestAnimationFrame(updateDisplay);
    }
    return () => cancelAnimationFrame(animId);
  }, [isTrialActive]);

  // Handle Trial Start
  const handleStartTrial = () => {
    setIsTrialActive(true);
    setElapsedMs(0);
    setCurrentStage('NORMAL_DELIBERATION');

    clinicalLatencyEngine.startTrial((newStage, timeMs) => {
      setCurrentStage(newStage);
      setElapsedMs(Math.round(timeMs));
    });
  };

  // Handle Patient Tap
  const handlePatientTap = () => {
    if (!isTrialActive) return;
    const latency = clinicalLatencyEngine.stopTrial();
    setIsTrialActive(false);
    setLastRecordedLatency(latency);
    setTimingProfile(clinicalLatencyEngine.getClinicalTimingProfile());
  };

  // Circadian Time Shift
  const handleSetSimulatedHour = (hour: number | null) => {
    circadianManager.setSimulatedHour(hour);
    setCircadian(circadianManager.getStatus());
  };

  const elapsedSeconds = (elapsedMs / 1000).toFixed(1);

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 md:p-6 text-slate-800">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 text-sm px-3 py-1 rounded-full mb-3 backdrop-blur-xs font-semibold border border-teal-500/30">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>{language === 'hi' ? 'राष्ट्रीय क्लिनिकल AI • समय एवं सर्कैडियन आर्किटेक्चर' : 'National Clinical AI • Time & Circadian Architecture'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2">
            {language === 'hi' ? 'क्लिनिकल विलंबता एवं सर्कैडियन टाइमिंग इंजन' : 'Clinical Latency & Circadian Timing Engine'}
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
            {language === 'hi' 
              ? 'CANTAB और Cogstate दिशानिर्देशों के आधार पर बुजुर्गों के प्रतिक्रिया समय का मानकीकरण। कठोर उलटी गिनती टाइमर को करुणामय चरणबद्ध संकेतों और स्वचालित सनडाउनिंग सुरक्षा से बदलता है।' 
              : 'Standardizing geriatric response times based on CANTAB & Cogstate guidelines. Replaces rigid countdown timers with compassionate stage-graduated cues and automated Sundowning protection.'}
          </p>
        </div>
        <div className="absolute right-0 -bottom-10 opacity-10 pointer-events-none text-white">
          <Clock className="w-64 h-64" />
        </div>
      </div>

      {/* MODULE 1: CLINICAL IN-GAME LATENCY & STAGED PROMPT ENGINE */}
      <section className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-slate-200/90">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-teal-700 font-bold text-sm tracking-wider uppercase">
              <Brain className="w-5 h-5 text-teal-600" />
              <span>{language === 'hi' ? 'सिस्टम १ • क्लिनिकल विलंबता स्टेजिंग' : 'System 1 • Clinical Latency Staging'}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mt-1">
              {language === 'hi' ? 'चरणबद्ध चिंतन अवधि (0s – 30s)' : 'Graduated Thinking Window (0s – 30s)'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">
              {language === 'hi' ? 'दर्ज परीक्षण:' : 'Trials Logged:'} <strong>{timingProfile.totalTrialsRecorded}</strong>
            </span>
            <span className="text-xs font-medium bg-teal-50 text-teal-800 px-3 py-1.5 rounded-lg border border-teal-200">
              {language === 'hi' ? 'माध्यिका विलंबता:' : 'Median Latency:'} <strong>{(timingProfile.personalBaselineMs / 1000).toFixed(1)}s</strong>
            </span>
          </div>
        </div>

        {/* Live Timeline Stages Visualizer */}
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>{language === 'hi' ? '0.0s सामान्य' : '0.0s Normal'}</span>
            <span>{language === 'hi' ? '7.0s विज़ुअल चमक' : '7.0s Visual Glow'}</span>
            <span>{language === 'hi' ? '10.0s क्षेत्रीय स्वर' : '10.0s Vernacular Voice'}</span>
            <span>{language === 'hi' ? '15.0s पुनर्समायोजन' : '15.0s Recalibrate'}</span>
            <span>{language === 'hi' ? '30.0s सौम्य सहायता' : '30.0s Soft Assist'}</span>
          </div>

          {/* Progress Bar with stages */}
          <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200">
            <div 
              className={`h-full rounded-full transition-all duration-100 ${
                currentStage === 'NORMAL_DELIBERATION' 
                  ? 'bg-emerald-500' 
                  : currentStage === 'VISUAL_GUIDANCE' 
                  ? 'bg-amber-400' 
                  : currentStage === 'VERNACULAR_PROMPT' 
                  ? 'bg-orange-500' 
                  : currentStage === 'COGNITIVE_OVERLOAD'
                  ? 'bg-rose-500'
                  : 'bg-purple-600'
              }`}
              style={{ width: `${Math.min(100, (elapsedMs / 30000) * 100)}%` }}
            />
          </div>

          {/* Current Stage Indicator Banner */}
          <div className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
            currentStage === 'NORMAL_DELIBERATION'
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : currentStage === 'VISUAL_GUIDANCE'
              ? 'bg-amber-50/80 border-amber-300 text-amber-900 animate-pulse'
              : currentStage === 'VERNACULAR_PROMPT'
              ? 'bg-orange-50 border-orange-300 text-orange-900'
              : currentStage === 'COGNITIVE_OVERLOAD'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-purple-50 border-purple-300 text-purple-900'
          }`}>
            <div className="p-2.5 rounded-lg bg-white shadow-xs shrink-0">
              {currentStage === 'NORMAL_DELIBERATION' && <Brain className="w-6 h-6 text-emerald-600" />}
              {currentStage === 'VISUAL_GUIDANCE' && <Sparkles className="w-6 h-6 text-amber-600" />}
              {currentStage === 'VERNACULAR_PROMPT' && <Volume2 className="w-6 h-6 text-orange-600" />}
              {currentStage === 'COGNITIVE_OVERLOAD' && <Activity className="w-6 h-6 text-rose-600" />}
              {currentStage === 'SOFT_AUTO_ASSIST' && <CheckCircle2 className="w-6 h-6 text-purple-600" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide uppercase">{language === 'hi' ? 'सक्रिय चरण:' : 'Active Stage:'}</span>
                <span className="font-extrabold text-base">
                  {currentStage === 'NORMAL_DELIBERATION' && (language === 'hi' ? '१. शांत चिंतन क्षेत्र (0.0s – 7.0s)' : '1. Unhurried Deliberation Zone (0.0s – 7.0s)')}
                  {currentStage === 'VISUAL_GUIDANCE' && (language === 'hi' ? '२. सूक्ष्म दृश्य मार्गदर्शन चमक (7.0s – 10.0s)' : '2. Subtle Visual Guidance Glow (7.0s – 10.0s)')}
                  {currentStage === 'VERNACULAR_PROMPT' && (language === 'hi' ? '३. क्षेत्रीय स्वर संकेत सक्रिय (10.0s – 15.0s)' : '3. Vernacular Voice Prompt Triggered (10.0s – 15.0s)')}
                  {currentStage === 'COGNITIVE_OVERLOAD' && (language === 'hi' ? '४. क्लिनिकल विलंब दर्ज (>15.0s • अगला राउंड सरल)' : '4. Clinical Delay Logged (>15.0s • Next Round Eased)')}
                  {currentStage === 'SOFT_AUTO_ASSIST' && (language === 'hi' ? '५. सौम्य स्वतः सहायता संपन्न (30.0s • शून्य दंड)' : '5. Soft Auto-Assist Completed (30.0s • Zero Penalty)')}
                </span>
              </div>
              <p className="text-sm mt-1 opacity-90">
                {currentStage === 'NORMAL_DELIBERATION' && (language === 'hi' ? 'शांत चिंतन स्थल। स्क्रीन पर शून्य व्याकुलता, बुजुर्ग को गरिमा और समय प्रदान करता है।' : 'Silent thinking space. Zero on-screen distractions, giving the elder dignity and time.')}
                {currentStage === 'VISUAL_GUIDANCE' && (language === 'hi' ? 'लक्षित कार्ड प्राकृतिक रूप से ध्यान आकर्षित करने के लिए सुनहरी रूपरेखा के साथ धीरे से चमकते हैं।' : 'Target cards gently pulse with a warm golden outline to draw natural eye focus.')}
                {currentStage === 'VERNACULAR_PROMPT' && (language === 'hi' ? 'शांत स्थानीय ऑडियो: "धीमे-धीमे करें, कोई जल्दी नहीं है" ("आराम से समय लें दादाजी")।' : 'Soothing local audio speaks: "ধীৰে ধীৰে কৰক, একো অসুবিধা নাই" ("Take your time, Dada").')}
                {currentStage === 'COGNITIVE_OVERLOAD' && (language === 'hi' ? 'उच्च संज्ञानात्मक भार पहचाना गया। AI अगले परीक्षण के लिए व्याकुलता कम करता है और बटन बड़े करता है।' : 'High cognitive load recognized. AI reduces distractors and expands buttons for the next trial.')}
                {currentStage === 'SOFT_AUTO_ASSIST' && (language === 'hi' ? 'सकारात्मक शब्दों और सुखद ध्वनि के साथ चरण स्वतः पूरा होता है। कोई विफलता स्क्रीन नहीं।' : 'Step completes automatically with cheerful chime and positive words. No failure screen.')}
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="text-2xl md:text-3xl font-mono font-black tracking-tight">
                {elapsedSeconds}s
              </div>
              <span className="text-xs text-slate-500 font-medium">{language === 'hi' ? 'बीता हुआ समय' : 'Elapsed Time'}</span>
            </div>
          </div>
        </div>

        {/* Interactive Simulation Controls */}
        <div className="mt-8 flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          {!isTrialActive ? (
            <button
              onClick={handleStartTrial}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Clock className="w-5 h-5" />
              <span>{language === 'hi' ? 'परीक्षण टाइमर शुरू करें' : 'Start Trial Timer'}</span>
            </button>
          ) : (
            <button
              onClick={handlePatientTap}
              className={`px-8 py-3.5 font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-3 cursor-pointer text-white ${
                currentStage === 'VISUAL_GUIDANCE' 
                  ? 'bg-amber-500 hover:bg-amber-600 animate-gentle-cue ring-4 ring-amber-300' 
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-6 h-6" />
              <span>{language === 'hi' ? 'रोगी के टैप का अनुकरण करें (विकल्प चुनें)' : 'Simulate Patient Tap (Select Item)'}</span>
            </button>
          )}

          {lastRecordedLatency !== null && !isTrialActive && (
            <div className="text-sm bg-white px-4 py-2.5 rounded-lg border border-slate-200 font-medium text-slate-700">
              {language === 'hi' ? 'पिछला प्रतिक्रिया समय:' : 'Last Response Time:'} <strong className="text-amber-700 font-bold">{(lastRecordedLatency / 1000).toFixed(2)}s</strong> ({lastRecordedLatency} ms)
            </div>
          )}
        </div>

        {/* Clinical Rationale Box for Judges */}
        <div className="mt-4 flex items-start gap-2.5 text-xs text-slate-500 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            <strong>{language === 'hi' ? 'नैदानिक बेंचमार्क:' : 'Clinical Benchmark:'}</strong> {language === 'hi' ? 'CANTAB दिशानिर्देश MCI समूहों के लिए पसंद प्रतिक्रिया समय 2.5s–4.5s और मनोभ्रंश अनुक्रमण 8.0s–14.0s स्थापित करते हैं। NeuroSaathi धीमी गति वाले व्यक्तियों के लिए गलत अलार्म को रोकने के लिए एक रोलिंग माध्यिका (MdL) का उपयोग करता है।' : 'CANTAB guidelines establish choice reaction times for MCI cohorts at 2.5s–4.5s and dementia sequencing at 8.0s–14.0s. NeuroSaathi uses a rolling median (MdL) to prevent false alarms for slower individuals.'}
          </span>
        </div>
      </section>

      {/* MODULE 2: CIRCADIAN RHYTHM & SUNDOWNING PROTECTION ENGINE */}
      <section className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-amber-100/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm tracking-wider uppercase">
              <Sunset className="w-5 h-5 text-indigo-600" />
              <span>{language === 'hi' ? 'सिस्टम २ • सर्कैडियन सनडाउनिंग सुरक्षा' : 'System 2 • Circadian Sundowning Safeguard'}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mt-1">
              {language === 'hi' ? '२४-घंटे सर्कैडियन चरण प्रबंधक' : '24-Hour Circadian Phase Manager'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
              circadian.isSundowningActive
                ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {circadian.isSundowningActive ? (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>{language === 'hi' ? 'सनडाउनिंग सक्रिय (शाम)' : 'Sundowning Active (Evening)'}</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4" />
                  <span>{language === 'hi' ? 'मानक संज्ञानात्मक चरण' : 'Standard Cognitive Phase'}</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Active Phase Card */}
        <div className="mt-6 p-5 rounded-2xl border transition-all bg-gradient-to-br from-slate-50 to-amber-50/30 border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-xl shadow-xs text-white ${
                circadian.phase === 'MORNING_COGNITIVE'
                  ? 'bg-amber-500'
                  : circadian.phase === 'AFTERNOON_STABLE'
                  ? 'bg-blue-500'
                  : circadian.phase === 'SUNDOWNING_VULNERABLE'
                  ? 'bg-rose-600'
                  : 'bg-indigo-900'
              }`}>
                {circadian.phase === 'MORNING_COGNITIVE' && <Sun className="w-7 h-7" />}
                {circadian.phase === 'AFTERNOON_STABLE' && <Sun className="w-7 h-7" />}
                {circadian.phase === 'SUNDOWNING_VULNERABLE' && <Sunset className="w-7 h-7" />}
                {circadian.phase === 'NIGHT_REST' && <Moon className="w-7 h-7" />}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'hi' ? 'वर्तमान चरण स्थिति' : 'Current Phase Status'}
                </span>
                <h3 className="text-lg md:text-xl font-extrabold text-slate-800">
                  {language === 'hi'
                    ? (circadian.phase === 'MORNING_COGNITIVE'
                        ? 'सुबह संज्ञानात्मक'
                        : circadian.phase === 'AFTERNOON_STABLE'
                        ? 'दोपहर स्थिर'
                        : circadian.phase === 'SUNDOWNING_VULNERABLE'
                        ? 'सनडाउनिंग संवेदनशील'
                        : 'रात्रि विश्राम')
                    : circadian.phase.replace('_', ' ')}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                  {language === 'hi' ? 'अनुशंसित मोड:' : 'Recommended Mode:'} <strong className="text-amber-700">{circadian.recommendedMode}</strong>
                </p>
              </div>
            </div>

            <div className="text-xs md:text-sm text-slate-600 max-w-md bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              {circadian.recommendation}
            </div>
          </div>
        </div>

        {/* Quick Time Simulator Buttons for Hackathon Judges */}
        <div className="mt-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            {language === 'hi' ? 'दिन के समय का अनुकरण करें (प्रदर्शन नियंत्रण):' : 'Simulate Time-of-Day (Judge Demonstration Controls):'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => handleSetSimulatedHour(9.5)}
              className={`p-3 rounded-xl border text-left font-semibold text-xs transition-all cursor-pointer ${
                circadian.simulatedHour === 9.5
                  ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-300'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-600">
                <Sun className="w-4 h-4" />
                <span>{language === 'hi' ? 'सुबह ०९:३० बजे' : '09:30 AM'}</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {language === 'hi' ? 'सुबह के खेल मोड' : 'Morning Games Mode'}
              </span>
            </button>

            <button
              onClick={() => handleSetSimulatedHour(14.0)}
              className={`p-3 rounded-xl border text-left font-semibold text-xs transition-all cursor-pointer ${
                circadian.simulatedHour === 14.0
                  ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-300'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1 text-blue-600">
                <Sun className="w-4 h-4" />
                <span>{language === 'hi' ? 'दोपहर ०२:०० बजे' : '02:00 PM'}</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {language === 'hi' ? 'हल्का रखरखाव' : 'Light Maintenance'}
              </span>
            </button>

            <button
              onClick={() => handleSetSimulatedHour(18.0)}
              className={`p-3 rounded-xl border text-left font-semibold text-xs transition-all cursor-pointer ${
                circadian.simulatedHour === 18.0
                  ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-300'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1 text-rose-600">
                <Sunset className="w-4 h-4" />
                <span>{language === 'hi' ? 'शाम ०६:०० बजे (सूर्यास्त)' : '06:00 PM (Sundown)'}</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {language === 'hi' ? 'शांत स्मृति तिजोरी' : 'Calming Memory Vault'}
              </span>
            </button>

            <button
              onClick={() => handleSetSimulatedHour(null)}
              className={`p-3 rounded-xl border text-left font-semibold text-xs transition-all cursor-pointer ${
                circadian.simulatedHour === null
                  ? 'bg-slate-100 border-slate-400 text-slate-900'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1 text-slate-700">
                <RotateCcw className="w-4 h-4" />
                <span>{language === 'hi' ? 'वास्तविक घड़ी पर रीसेट करें' : 'Reset to Real Clock'}</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {language === 'hi' ? 'डिवाइस का स्थानीय समय उपयोग करें' : 'Use Device Local Time'}
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
