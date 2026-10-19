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
  EyeOff
} from 'lucide-react';
import { 
  AIClinicalReportingService, 
  type CloudAIConfig, 
  type AIProvider 
} from '../../services/ai-clinical-reporting';

interface CloudAIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: CloudAIConfig) => void;
}

export const CloudAIConfigModal: React.FC<CloudAIConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [config, setConfig] = useState<CloudAIConfig>(() => AIClinicalReportingService.getConfig());
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);

  if (!isOpen) return null;

  const handleProviderChange = (provider: AIProvider) => {
    let defaultModel = 'gemini-1.5-flash';
    if (provider === 'openai') defaultModel = 'gpt-4o-mini';
    if (provider === 'groq') defaultModel = 'llama-3.3-70b-versatile';

    setConfig(prev => ({
      ...prev,
      provider,
      model: defaultModel,
    }));
    setTestResult(null);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await AIClinicalReportingService.testConnection(config);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleSave = () => {
    AIClinicalReportingService.saveConfig(config);
    if (onSave) onSave(config);
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
                <span>Cloud AI & LLM Engine Settings</span>
                <span className="text-[10px] font-black uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  ABDM Cloud
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Connect external cloud models for automated medical report generation
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-slate-800 text-sm overflow-y-auto max-h-[75vh]">
          
          {/* Provider Selection Tabs */}
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
              Select AI Cloud Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleProviderChange('gemini')}
                className={`py-3 px-3 rounded-2xl border font-black text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  config.provider === 'gemini'
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
                onClick={() => handleProviderChange('openai')}
                className={`py-3 px-3 rounded-2xl border font-black text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  config.provider === 'openai'
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
                onClick={() => handleProviderChange('groq')}
                className={`py-3 px-3 rounded-2xl border font-black text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  config.provider === 'groq'
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
              Target Model
            </label>
            <select
              value={config.model}
              onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              {config.provider === 'gemini' && (
                <>
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Fast, Low Latency, Free Tier)</option>
                  <option value="gemini-2.0-flash">gemini-2.0-flash (Latest Generation High Speed)</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Neuropsychological Reasoning)</option>
                </>
              )}
              {config.provider === 'openai' && (
                <>
                  <option value="gpt-4o-mini">gpt-4o-mini (Recommended for speed & cost)</option>
                  <option value="gpt-4o">gpt-4o (Maximum diagnostic precision)</option>
                </>
              )}
              {config.provider === 'groq' && (
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
                <span>{config.provider.toUpperCase()} API Key</span>
              </label>
              {config.provider === 'gemini' && (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => {
                  setConfig(prev => ({ ...prev, apiKey: e.target.value }));
                  setTestResult(null);
                }}
                placeholder={config.provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                className="w-full pl-4 pr-12 py-3 rounded-2xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Your key is stored securely in local browser storage only and directly calls the AI endpoint with zero intermediary logging.
            </p>
          </div>

          {/* Connection Test Status */}
          {testResult && (
            <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{testResult.message}</p>
                {testResult.success && (
                  <span className="text-[10px] text-emerald-700 font-mono mt-0.5 block">
                    Ping Latency: {testResult.latencyMs}ms • Endpoint Verified
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ABDM & Privacy Notice */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            <p className="text-[11px] font-medium leading-relaxed">
              <strong>ABDM Clinical Privacy Protocol:</strong> Generated neuropsychological assessments are formatted with SNOMED-CT and LOINC clinical diagnostic codes for Ayushman Bharat Digital Mission interoperability.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting || !config.apiKey.trim()}
            className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs disabled:opacity-50 cursor-pointer transition-all flex items-center gap-1.5"
          >
            {isTesting ? (
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-slate-800 border-t-transparent rounded-full" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
          </button>

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
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md cursor-pointer transition-all"
            >
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
