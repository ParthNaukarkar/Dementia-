import React from 'react';
import { 
  Brain, 
  Zap, 
  Target, 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  CircleDashed,
  Activity
} from 'lucide-react';
import type { SupportedLanguage } from '../../types/prescription';
import type { PatientProfile } from '../../types/auth';
import { GAME_CATALOG } from '../../data/gameCatalog';
import { 
  DailySessionManager, 
  type DailyCompositeScoreResult 
} from '../../utils/dailySessionManager';
import { AdaptiveGameFlowEngine } from '../../engine/adaptive-game-flow';

interface MyBrainAnalyticsProps {
  language?: SupportedLanguage;
  patient: PatientProfile | null;
  lastSessionReport?: any | null;
  dailyComposite?: DailyCompositeScoreResult;
  dailySessions?: Record<string, any>;
}

export const MyBrainAnalytics: React.FC<MyBrainAnalyticsProps> = ({
  language = 'en',
  patient,
  dailyComposite,
  dailySessions = {},
}) => {
  // Use passed daily composite or compute directly from today's stored sessions
  const composite = dailyComposite || DailySessionManager.calculateDailyCompositeScore();
  const sessions = Object.keys(dailySessions).length > 0 ? dailySessions : DailySessionManager.getDailySessions();
  const playedCount = composite.gamesPlayedCount;

  // Run comprehensive clinical analysis on today's sessions
  const sessionAnalysis = AdaptiveGameFlowEngine.analyzeMultiGameSession(sessions);

  // Group domains
  const domainRecords = composite.domainBreakdown;

  const isHi = language === 'hi';

  const domainHindiMap: Record<string, string> = {
    memory: 'स्मृति (याददाश्त)',
    attention: 'एकाग्रता (ध्यान)',
    executive: 'कार्यकारी निर्णय',
    spatial: 'स्थानिक प्रज्ञान',
    language: 'भाषा एवं प्रवाह',
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn text-slate-800">
      
      {/* Top Brain Performance Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-teal-500/10 to-transparent pointer-events-none" />
        
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black uppercase tracking-widest text-teal-300 bg-teal-500/20 px-3 py-1 rounded-full border border-teal-400/30 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-300" />
              <span>{isHi ? 'वास्तविक संज्ञानात्मक टेलीमेट्री' : 'Real-World Cognitive Telemetry'}</span>
            </span>
            {playedCount > 0 ? (
              <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isHi ? `आज ${playedCount} खेल सम्मिलित` : `${playedCount} Game${playedCount > 1 ? 's' : ''} Combined Today`}</span>
              </span>
            ) : (
              <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/30">
                {isHi ? 'आधारभूत (आज कोई खेल पूर्ण नहीं)' : 'Baseline (No games completed today)'}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pt-1">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {isHi ? `मस्तिष्क विश्लेषण: ${patient?.name || 'दादू'}` : `Brain Analytics: ${patient?.name || 'Dadu'}`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium mt-1">
                {isHi 
                  ? 'आज अनुशंसित एवं वास्तव में खेले गए खेलों से परिकलित एकीकृत दैनिक स्कोर।' 
                  : 'Unified daily score calculated exclusively from games actually recommended and played today.'}
              </p>
            </div>

            {/* Combined Score Badge */}
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center shrink-0 shadow-inner">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-200 block">
                {isHi ? 'आज का संयुक्त स्कोर' : "Today's Combined Score"}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white flex items-baseline justify-center gap-1 mt-0.5">
                <span>{composite.score}</span>
                <span className="text-xs font-bold text-teal-300">/ 100</span>
              </div>
              <span className="text-[10px] text-slate-300 font-semibold block mt-0.5">
                {playedCount > 0 
                  ? (isHi ? `सक्रिय औसत सटीकता: ${composite.meanAccuracy}%` : `Active Mean Acc: ${composite.meanAccuracy}%`) 
                  : (isHi ? 'मानक आधारभूत (78)' : 'Standard Baseline (78)')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Score Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-teal-600" />
            <span>{isHi ? 'DSM-5 न्यूरोकोग्निशन डोमेन प्रदर्शन (आज)' : 'DSM-5 Neurocognitive Domain Performance (Today)'}</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            {isHi ? 'बिना खेले गए डोमेन को स्कोर गणना से बाहर रखा गया है' : 'Unplayed domains are strictly excluded from score calculation'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {domainRecords.map(dom => {
            const isPlayed = dom.isPlayedToday;
            const iconMap = {
              memory: <Brain className="w-5 h-5" />,
              attention: <Zap className="w-5 h-5" />,
              executive: <Target className="w-5 h-5" />,
              spatial: <Compass className="w-5 h-5" />,
              language: <Sparkles className="w-5 h-5" />,
            };

            const bgColors = {
              memory: 'bg-amber-100 text-amber-800',
              attention: 'bg-teal-100 text-teal-800',
              executive: 'bg-orange-100 text-orange-800',
              spatial: 'bg-emerald-100 text-emerald-800',
              language: 'bg-sky-100 text-sky-800',
            };

            return (
              <div 
                key={dom.domain}
                className={`p-6 rounded-3xl border transition-all space-y-3 ${
                  isPlayed 
                    ? 'bg-white border-slate-200 shadow-sm' 
                    : 'bg-slate-50/70 border-slate-200/60 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${bgColors[dom.domain]}`}>
                    {iconMap[dom.domain]}
                  </div>

                  {isPlayed ? (
                    <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{dom.score} {isHi ? 'अंक' : 'Score'}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 flex items-center gap-1">
                      <CircleDashed className="w-3 h-3" />
                      <span>{isHi ? 'आज नहीं खेला गया' : 'Not played today'}</span>
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-black text-base text-slate-900">
                    {isHi ? (domainHindiMap[dom.domain] || dom.label) : dom.label}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isPlayed 
                      ? (isHi 
                          ? `आज ${dom.gamesPlayed.length} खेल मूल्यांकित: ${dom.gamesPlayed.join(', ')}` 
                          : `${dom.gamesPlayed.length} game${dom.gamesPlayed.length > 1 ? 's' : ''} assessed today: ${dom.gamesPlayed.join(', ')}`)
                      : (isHi ? 'इस डोमेन में आज कोई खेल नहीं खेला गया — स्कोर बहिष्कृत' : 'No games in this domain played today — score excluded')}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs font-medium flex items-center justify-between text-slate-600">
                  <span>{isHi ? 'डोमेन सटीकता:' : 'Domain Accuracy:'}</span>
                  <strong className={isPlayed ? 'text-slate-900 font-bold' : 'text-slate-400 font-normal'}>
                    {isPlayed && dom.accuracy !== null ? `${dom.accuracy}%` : (isHi ? 'लागू नहीं (बहिष्कृत)' : 'N/A (Excluded)')}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Games Played Today Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-black text-lg text-slate-900">
              {isHi ? 'आज का सत्र ऑडिट एवं टेलीमेट्री विवरण' : "Today's Session Audit & Telemetry Breakdown"}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isHi 
                ? `${DailySessionManager.getTodayDateKey()} को खेले गए खेलों का व्यक्तिगत योगदान` 
                : `Individual contributions of games actually played on ${DailySessionManager.getTodayDateKey()}`}
            </p>
          </div>

          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            {isHi ? `10 में से ${playedCount} खेल आज सक्रिय` : `${playedCount} of 10 Games Active Today`}
          </span>
        </div>

        {playedCount > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="pb-3">{isHi ? 'खेल का नाम' : 'Game Title'}</th>
                  <th className="pb-3">{isHi ? 'डोमेन' : 'Domain'}</th>
                  <th className="pb-3">{isHi ? 'सटीकता' : 'Accuracy'}</th>
                  <th className="pb-3">{isHi ? 'औसत विलंबता' : 'Mean Latency'}</th>
                  <th className="pb-3">{isHi ? 'अन्तर्निहित क्षमता (θ)' : 'Latent Trait (θ)'}</th>
                  <th className="pb-3">{isHi ? 'स्वायत्तता' : 'Autonomy'}</th>
                  <th className="pb-3 text-right">{isHi ? 'स्कोर में शामिल' : 'Counted in Score'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.values(sessions).map((sess: any) => {
                  const catalog = GAME_CATALOG.find(g => g.id === sess.gameId);
                  const title = isHi && catalog?.title?.hi ? catalog.title.hi : (sess.gameTitle || catalog?.title?.en || sess.gameId);
                  const domKey = catalog?.domain || 'memory';
                  const domLabel = isHi ? (domainHindiMap[domKey] || domKey) : domKey;

                  return (
                    <tr key={sess.gameId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{title}</span>
                      </td>
                      <td className="py-3 capitalize text-slate-600">{domLabel}</td>
                      <td className="py-3 font-bold text-emerald-700">{sess.accuracyPercentage}%</td>
                      <td className="py-3 font-semibold text-slate-800">
                        {((sess.averageLatencyMs || 3000) / 1000).toFixed(1)}s
                      </td>
                      <td className="py-3 font-bold text-amber-700">
                        {sess.finalTheta !== undefined ? `${sess.finalTheta > 0 ? '+' : ''}${sess.finalTheta.toFixed(2)}` : '0.00'}
                      </td>
                      <td className="py-3 font-semibold text-slate-700">
                        {sess.autonomyScore ?? (sess.autoAssistedRounds ? 65 : 100)}%
                      </td>
                      <td className="py-3 text-right">
                        <span className="bg-emerald-50 text-emerald-800 font-black text-[10px] px-2 py-0.5 rounded-full border border-emerald-200">
                          {isHi ? 'सक्रिय (100%)' : 'Active (100%)'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Brain className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">
              {isHi ? 'आज अभी तक कोई संज्ञानात्मक अभ्यास पूर्ण नहीं हुआ' : 'No cognitive exercises completed today yet'}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isHi 
                ? 'लाइव डैशबोर्ड में प्रदर्शन डेटा दर्ज करने के लिए "आज" टैब से अपना निर्धारित दैनिक व्यायाम शुरू करें।' 
                : "Launch your prescribed daily workout from the 'Today' tab to record and combine performance data into the live dashboard."}
            </p>
          </div>
        )}
      </div>

      {/* Clinical Staging & OASIS-2 Longitudinal Alignment */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-black text-lg text-slate-900">
            {isHi ? 'OASIS-2 अनुदैर्ध्य स्टेजिंग संरेखण' : 'OASIS-2 Longitudinal Staging Alignment'}
          </h3>
          <span className="text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
            {isHi ? `टियर: ${sessionAnalysis.clinicalTier}` : `Tier: ${sessionAnalysis.clinicalTier}`}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          {isHi ? (
            <>
              वाशिंगटन विश्वविद्यालय OASIS-2 अनुदैर्ध्य कोहॉर्ट के विरुद्ध कैलिब्रेट की गई मल्टी-गेम सत्र टेलीमेट्री।
              अनुमानित मानकीकृत MoCA: <strong>{sessionAnalysis.estimatedMoCAScore} / 30</strong> ·
              अनुमानित MMSE: <strong>{sessionAnalysis.estimatedMMSEScore} / 30</strong> ·
              संज्ञानात्मक थकान: <strong>{sessionAnalysis.fatigueLevel === 'low' ? 'कम' : sessionAnalysis.fatigueLevel === 'moderate' ? 'मध्यम' : 'अधिक'}</strong>।
            </>
          ) : (
            <>
              Multi-game session telemetry calibrated against Washington University OASIS-2 longitudinal cohort.
              Estimated standardized MoCA: <strong>{sessionAnalysis.estimatedMoCAScore} / 30</strong> ·
              Estimated MMSE: <strong>{sessionAnalysis.estimatedMMSEScore} / 30</strong> ·
              Cognitive Fatigue: <strong className="capitalize">{sessionAnalysis.fatigueLevel}</strong>.
            </>
          )}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isHi ? 'संयुक्त बायेसियन क्षमता (θ)' : 'Combined Bayesian Ability (θ)'}
            </span>
            <strong className="text-amber-800 font-black text-base">
              {sessionAnalysis.aggregateTheta > 0 ? '+' : ''}{sessionAnalysis.aggregateTheta.toFixed(2)}
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isHi ? 'अनुमानित MoCA स्कोर' : 'Estimated MoCA Score'}
            </span>
            <strong className="text-indigo-800 font-black text-base">
              {sessionAnalysis.estimatedMoCAScore} / 30
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isHi ? 'सत्र थकान बायोमार्कर' : 'Session Fatigue Biomarker'}
            </span>
            <strong className={`font-black text-base capitalize ${
              sessionAnalysis.fatigueLevel === 'elevated' ? 'text-rose-600' : 'text-emerald-700'
            }`}>
              {sessionAnalysis.fatigueLevel === 'low' ? (isHi ? 'कम' : 'low') : sessionAnalysis.fatigueLevel === 'moderate' ? (isHi ? 'मध्यम' : 'moderate') : (isHi ? 'उच्च' : 'elevated')} ({Math.round(sessionAnalysis.fatigueScore * 100)}%)
            </strong>
          </div>
        </div>

        {/* Localized Clinical Notes */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 font-medium">
          <span className="font-black block uppercase tracking-wider text-[10px] text-amber-900 mb-1">
            {isHi ? 'चिकित्सक क्लिनिकल टिप्पणियाँ (स्थानीयकृत)' : 'Physician Clinical Notes (Localized)'}
          </span>
          <p className="leading-relaxed">
            {sessionAnalysis.clinicalNotes[language] || sessionAnalysis.clinicalNotes.en}
          </p>
        </div>
      </div>

    </div>
  );
};
