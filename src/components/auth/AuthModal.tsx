import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Heart, 
  X, 
  Check, 
  Phone, 
  AlertCircle,
  UserCheck
} from 'lucide-react';
import type { CaretakerUser, PatientProfile, DementiaDiagnosisStage } from '../../types/auth';
import type { SupportedLanguage } from '../../types/prescription';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  caretaker: CaretakerUser | null;
  onSaveCaretaker: (caretaker: CaretakerUser) => void;
  onSavePatient: (patient: PatientProfile) => void;
  initialMode?: 'caretaker_login' | 'create_patient';
  currentLanguage: SupportedLanguage;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  caretaker,
  onSaveCaretaker,
  onSavePatient,
  initialMode = 'caretaker_login',
  currentLanguage,
}) => {
  const [modalMode, setModalMode] = useState<'caretaker_login' | 'create_patient'>(
    caretaker ? 'create_patient' : initialMode
  );

  // Caretaker form fields
  const [caretakerName, setCaretakerName] = useState(caretaker?.name || '');
  const [caretakerAge, setCaretakerAge] = useState(caretaker?.age ? String(caretaker.age) : '');
  const [caretakerEmail, setCaretakerEmail] = useState(caretaker?.email || '');

  // Patient form fields
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [patientLang, setPatientLang] = useState<SupportedLanguage>(currentLanguage);
  const [diagnosisStage, setDiagnosisStage] = useState<DementiaDiagnosisStage>('mild_cognitive_impairment');
  const [relationship, setRelationship] = useState('Grandfather');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 ');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCaretakerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caretakerName.trim() || !caretakerEmail.trim()) {
      setErrorMsg('Please enter your name and valid email.');
      return;
    }
    const ageNum = parseInt(caretakerAge, 10) || 30;
    const newCaretaker: CaretakerUser = {
      id: caretaker?.id || `caretaker_${Date.now()}`,
      name: caretakerName.trim(),
      age: ageNum,
      email: caretakerEmail.trim(),
      createdAt: caretaker?.createdAt || new Date().toISOString(),
    };
    onSaveCaretaker(newCaretaker);
    setErrorMsg('');
    // Proceed directly to creating patient profile if none exists
    setModalMode('create_patient');
  };

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setErrorMsg('Please enter patient full name.');
      return;
    }
    const ageNum = parseInt(patientAge, 10) || 72;
    const activeCaretakerId = caretaker?.id || 'caretaker_default';

    const newPatient: PatientProfile = {
      id: `patient_${Date.now()}`,
      caretakerId: activeCaretakerId,
      name: patientName.trim(),
      age: ageNum,
      gender: patientGender,
      primaryLanguage: patientLang,
      diagnosisStage,
      emergencyContact: emergencyPhone.trim(),
      relationshipToCaretaker: relationship.trim(),
      createdAt: new Date().toISOString(),
    };
    onSavePatient(newPatient);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              {modalMode === 'caretaker_login' ? <ShieldCheck className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                {modalMode === 'caretaker_login' ? 'Caretaker Portal Login' : 'Register New Patient Profile'}
              </h3>
              <p className="text-xs text-slate-300">
                {modalMode === 'caretaker_login' 
                  ? 'Manage your elderly patient care plan & clinical reports' 
                  : 'Created & managed exclusively by family caretaker'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers if caretaker already registered */}
        {caretaker && (
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3 text-xs font-black">
            <button
              onClick={() => setModalMode('create_patient')}
              className={`pb-2.5 border-b-2 transition-all cursor-pointer ${
                modalMode === 'create_patient' 
                  ? 'border-amber-600 text-amber-900 font-extrabold' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              + Add Patient Profile
            </button>
            <button
              onClick={() => setModalMode('caretaker_login')}
              className={`pb-2.5 border-b-2 transition-all cursor-pointer ${
                modalMode === 'caretaker_login' 
                  ? 'border-amber-600 text-amber-900 font-extrabold' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Caretaker Account Info
            </button>
          </div>
        )}

        {/* Body Form */}
        <div className="p-5 sm:p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {modalMode === 'caretaker_login' ? (
            /* CARETAKER FORM */
            <form onSubmit={handleCaretakerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Caretaker Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parth / Dr. Ananya Sarma"
                  value={caretakerName}
                  onChange={(e) => setCaretakerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Caretaker Age *
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    required
                    placeholder="e.g. 23"
                    value={caretakerAge}
                    onChange={(e) => setCaretakerAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Role
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-700 font-bold">
                    Family Caregiver
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. parth@smritiner.in"
                  value={caretakerEmail}
                  onChange={(e) => setCaretakerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Save Caretaker & Proceed to Patient Profile</span>
                </button>
              </div>
            </form>
          ) : (
            /* PATIENT PROFILE REGISTRATION FORM */
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bhaben Baruah / Dadu"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Patient Age *
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="110"
                    required
                    placeholder="e.g. 76"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Primary Language
                  </label>
                  <select
                    value={patientLang}
                    onChange={(e) => setPatientLang(e.target.value as SupportedLanguage)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium bg-white"
                  >
                    <option value="as">অসমীয়া (Assamese)</option>
                    <option value="bn">বাংলা (Bengali)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grandfather, Mother"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Baseline Clinical Stage
                </label>
                <select
                  value={diagnosisStage}
                  onChange={(e) => setDiagnosisStage(e.target.value as DementiaDiagnosisStage)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium bg-white"
                >
                  <option value="healthy">Healthy Aging (Preventative Cognitive Fitness)</option>
                  <option value="mild_cognitive_impairment">Mild Cognitive Impairment (MCI - Early Memory Lapses)</option>
                  <option value="mild_alzheimers">Mild Alzheimer's Dementia (Needs Structured Guidance)</option>
                  <option value="moderate_dementia">Moderate Dementia (High Auto-Assist & Caregiver Guided)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Emergency Phone Contact
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Create Patient Profile & Launch Daily Routine</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
