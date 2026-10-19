import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Cpu, 
  Zap, 
  ShieldCheck,
  Eye,
  EyeOff,
  Gamepad2,
  FileText
} from 'lucide-react';
import { 
  AIClinicalReportingService, 
  type CloudAIConfig, 
  type AIProvider 
} from '../../services/ai-clinical-reporting';
import {
  AIGameCalibratorService,
  type GameAIConfig
} from '../../services/ai-game-calibrator';

interface CloudAIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: CloudAIConfig) => void;
  initialTab?: 'GAMES_AI' | 'REPORT_AI';
}

export const CloudAIConfigModal: React.FC<CloudAIConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTab = 'GAMES_AI',
}) => {
  const [activeTab, setActiveTab] = useState<'GAMES_AI' | 'REPORT_AI'>(initialTab);

  // Master Report Cloud Config
  const [reportConfig, setReportConfig] = useState<CloudAIConfig>(() => AIClinicalReportingService.getConfig());
  const [showReportKey, setShowReportKey] = useState(false);
  const [isTestingReport, setIsTestingReport] = useState(false);
  const [reportTestResult, setReportTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);

  // Game Level AI Config (OpenAI)
  const [gameConfig, setGameConfig] = useState<GameAIConfig>(() => AIGameCalibratorService.getConfig());
  const [showGameKey, setShowGameKey] = useState(false);
  const [isTestingGame, setIsTestingGame] = useState(false);
  const [gameTestResult, setGameTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);

  if (!isOpen) return null;

  // Handler for Master Report provider
  const handleReportProviderChange = (provider: AIProvider) => {
    let defaultModel = 'gemini-3.8-flash';
    if (provider === 'openai') defaultModel = 'gpt-4o-mini';
    if (provider === 'groq') defaultModel = 'llama-3.3-70b-versatile';

    setReportConfig(prev => ({
      ...prev,
      provider,
      model: defaultModel,
    }));
    setReportTestResult(null);
  };

  // Handler for Game AI provider
  const handleGameProviderChange = (provider: 'openai' | 'gemini') => {
    let defaultModel = 'gpt-4o-mini';
    if (provider === 'gemini') defaultModel = 'gemini-3.8-flash';

    setGameConfig(prev => ({
      ...prev,
      provider,
      model: defaultModel,
    }));
    setGameTestResult(null);
  };

  const handleTestReport = async () => {
    setIsTestingReport(true);
    setReportTestResult(null);
    const res = await AIClinicalReportingService.testConnection(reportConfig);
    setReportTestResult(res);
    setIsTestingReport(false);
  };

  const handleTestGame = async () => {
    setIsTestingGame(true);
    setGameTestResult(null);
    const res = await AIGameCalibratorService.testConnection(gameConfig);
    setGameTestResult(res);
    setIsTestingGame(false);
  };

  const handleSave = () => {
    AIClinicalReportingService.saveConfig(reportConfig);
    AIGameCalibratorService.saveConfig(gameConfig);
    if (onSave) onSave(reportConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>Cloud AI &amp; Multi-Model Engine</span>
                <span className="text-[10px] font-black uppercase bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full">
                  Dual Key Setup
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Configure OpenAI for live game level calibration &amp; Gemini for clinical reports
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dual Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('GAMES_AI')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'GAMES_AI'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span>1. Game Level Director (OpenAI)</span>
            {gameConfig.apiKey.trim() && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('REPORT_AI')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'REPORT_AI'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>2. Diagnostic Report (Gemini/Cloud)</span>
            {reportConfig.apiKey.trim() && (
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-slate-800 text-sm overflow-y-auto max-h-[72vh]">
          
          {/* ════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: GAME LEVEL DIRECTOR (OPENAI)                             */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'GAMES_AI' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Feature Explanation Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-emerald-700" />
                  <strong className="text-xs font-black uppercase text-emerald-950">
                    Live Neuro-Adaptive Game Director (OpenAI API)
                  </strong>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  Analyzes trial-by-trial accuracy, reaction latency, perseverative flips, and motor tremor to dynamically promote, maintain, or scaffold game levels on the fly. Feeds all calibrated decisions directly into the Master Diagnostic Report.
                </p>
              </div>

              {/* Active Toggle Switch */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-900 block">Enable Dynamic AI Level Decider</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {gameConfig.enabled ? 'Active — OpenAI modulates game levels' : 'Disabled — Uses deterministic 2PL IRT math'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setGameConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    gameConfig.enabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
                </button>
              </div>

              {/* Provider Selection */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Game Decider Engine Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleGameProviderChange('openai')}
                    className={`py-3 px-3 rounded-2xl border font-black text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      gameConfig.provider === 'openai'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Cpu className="w-4 h-4 text-emerald-600" />
                    <span>OpenAI (GPT-4o)</span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                      Recommended for Games
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGameProviderChange('gemini')}
                    className={`py-3 px-3 rounded-2xl border font-black text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      gameConfig.provider === 'gemini'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Google Gemini</span>
                    <span className="text-[9px] font-bold text-slate-500">
                      Flash Tier
                    </span>
                  </button>
                </div>
              </div>

              {/* Model Select */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Game Model Tier
                </label>
                <select
                  value={gameConfig.model}
                  onChange={(e) => setGameConfig(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {gameConfig.provider === 'openai' ? (
                    <>
                      <option value="gpt-4o-mini">gpt-4o-mini (Recommended: &lt;400ms rapid response, highly cost-effective)</option>
                      <option value="gpt-4o">gpt-4o (Maximum reasoning power)</option>
                    </>
                  ) : (
                    <>
                      <option value="gemini-3.8-flash">gemini-3.8-flash (Latest Generation)</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Fast)</option>
                    </>
                  )}
                </select>
              </div>

              {/* OpenAI Key Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{gameConfig.provider.toUpperCase()} API Key for Games</span>
                  </label>
                  {gameConfig.provider === 'openai' && (
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <span>OpenAI Key Dashboard</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showGameKey ? 'text' : 'password'}
                    value={gameConfig.apiKey}
                    onChange={(e) => {
                      setGameConfig(prev => ({ ...prev, apiKey: e.target.value }));
                      setGameTestResult(null);
                    }}
                    placeholder={gameConfig.provider === 'openai' ? 'sk-proj-...' : 'AIzaSy...'}
                    className="w-full pl-4 pr-12 py-3 rounded-2xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGameKey(!showGameKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showGameKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Test Status */}
              {gameTestResult && (
                <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  gameTestResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}>
                  {gameTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{gameTestResult.message}</p>
                    {gameTestResult.success && (
                      <span className="text-[10px] text-emerald-700 font-mono mt-0.5 block">
                        Ping Latency: {gameTestResult.latencyMs}ms • Ready for Real-Time Level Calibration
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleTestGame}
                disabled={isTestingGame || !gameConfig.apiKey.trim()}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs disabled:opacity-50 cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                {isTestingGame ? (
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-slate-800 border-t-transparent rounded-full" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>{isTestingGame ? 'Pinging Game AI...' : 'Test Game AI Connection'}</span>
              </button>

            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: MASTER CLINICAL DIAGNOSTIC REPORT (GEMINI / CLOUD)        */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'REPORT_AI' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Feature Explanation Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <strong className="text-xs font-black uppercase text-amber-950">
                    Master Clinical Diagnostic Synthesizer
                  </strong>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  Aggregates all 10 games, OpenAI game level transitions, caregiver uploaded lab reports, medication adherence logs, and circadian routines into a standardized ABDM neuropsychological diagnostic evaluation.
                </p>
              </div>

              {/* Provider Selection Tabs */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Clinical Report AI Provider
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleReportProviderChange('gemini')}
                    className={`py-3 px-3 rounded-2xl border font-black text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      reportConfig.provider === 'gemini'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Google Gemini</span>
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReportProviderChange('openai')}
                    className={`py-3 px-3 rounded-2xl border font-black text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      reportConfig.provider === 'openai'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Cpu className="w-4 h-4 text-emerald-600" />
                    <span>OpenAI</span>
                    <span className="text-[9px] font-bold text-slate-500">
                      GPT-4o Mini
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReportProviderChange('groq')}
                    className={`py-3 px-3 rounded-2xl border font-black text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      reportConfig.provider === 'groq'
                        ? 'bg-purple-500/10 border-purple-500 text-purple-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span>Groq Cloud</span>
                    <span className="text-[9px] font-bold text-slate-500">
                      Ultra Fast
                    </span>
                  </button>
                </div>
              </div>

              {/* Model Selection Dropdown */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Report Model
                </label>
                <select
                  value={reportConfig.model}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  {reportConfig.provider === 'gemini' && (
                    <>
                      <option value="gemini-3.8-flash">gemini-3.8-flash (Latest Gemini 3 Generation - Recommended)</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Standard Fast Tier)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Neuropsychological Reasoning)</option>
                    </>
                  )}
                  {reportConfig.provider === 'openai' && (
                    <>
                      <option value="gpt-4o-mini">gpt-4o-mini (Recommended for speed & cost)</option>
                      <option value="gpt-4o">gpt-4o (Maximum diagnostic precision)</option>
                    </>
                  )}
                  {reportConfig.provider === 'groq' && (
                    <>
                      <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (&lt;400ms generation)</option>
                      <option value="mixtral-8x7b-32768">mixtral-8x7b-32768 (High context clinical)</option>
                    </>
                  )}
                </select>
              </div>

              {/* API Key Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-600" />
                    <span>{reportConfig.provider.toUpperCase()} API Key for Reports</span>
                  </label>
                  {reportConfig.provider === 'gemini' && (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Get Free Gemini Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showReportKey ? 'text' : 'password'}
                    value={reportConfig.apiKey}
                    onChange={(e) => {
                      setReportConfig(prev => ({ ...prev, apiKey: e.target.value }));
                      setReportTestResult(null);
                    }}
                    placeholder={reportConfig.provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                    className="w-full pl-4 pr-12 py-3 rounded-2xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowReportKey(!showReportKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showReportKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Report Test Status */}
              {reportTestResult && (
                <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  reportTestResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}>
                  {reportTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{reportTestResult.message}</p>
                    {reportTestResult.success && (
                      <span className="text-[10px] text-emerald-700 font-mono mt-0.5 block">
                        Ping Latency: {reportTestResult.latencyMs}ms • Endpoint Verified
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleTestReport}
                disabled={isTestingReport || !reportConfig.apiKey.trim()}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs disabled:opacity-50 cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                {isTestingReport ? (
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-slate-800 border-t-transparent rounded-full" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>{isTestingReport ? 'Testing Report API...' : 'Test Report Connection'}</span>
              </button>

            </div>
          )}

          {/* ABDM & Privacy Notice */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            <p className="text-[11px] font-medium leading-relaxed">
              <strong>Multi-Model Clinical Pipeline:</strong> OpenAI calibrates micro-telemetry and dynamic game difficulty in real time; Google Gemini / Cloud LLM synthesizes macro diagnostics and generates the comprehensive patient report.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] font-bold text-slate-500">
            {gameConfig.apiKey.trim() ? '✓ Game AI configured' : '○ Game AI key optional'} • {reportConfig.apiKey.trim() ? '✓ Report AI configured' : '○ Report AI key needed'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-md cursor-pointer transition-all"
            >
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
