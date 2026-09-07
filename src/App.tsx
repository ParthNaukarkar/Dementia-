import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  User,
  Gamepad2,
  Pill,
  Sun,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Info,
  Activity,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Heart,
  Calendar,
  ArrowLeft,
  Sliders,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

// SmritiNER Cognitive Games & Engines
import { TimeEngineDemo } from './components/time-engine/TimeEngineDemo';
import { SmritiHaat, type SessionSummaryTelemetry } from './games/smriti-haat';
import { SequenceRecall } from './games/sequence-recall';
import { PatternRecall } from './games/pattern-recall';
import { OddOneOut } from './games/odd-one-out';
import { WhereAmI } from './games/where-am-i';
import { MemoryMatch } from './games/memory-match/MemoryMatch';
import { BihuTaal } from './games/bihu-taal/BihuTaal';
import { JigsawPuzzle } from './games/jigsaw-puzzle';
import { InteractiveCognitiveExercise } from './components/games/InteractiveCognitiveExercise';
import { WorkoutProgressHeader } from './components/workout/WorkoutProgressHeader';
import { WorkoutIntermissionModal } from './components/workout/WorkoutIntermissionModal';
import { WorkoutCompletedCelebrationModal } from './components/workout/WorkoutCompletedCelebrationModal';
import { GAME_CATALOG } from './data/gameCatalog';
import { PatientTodayHome } from './components/dashboard/PatientTodayHome';
import { CognitiveLibrary } from './components/hub/CognitiveLibrary';
import { MyBrainAnalytics } from './components/dashboard/MyBrainAnalytics';
import { PrescriptionSetupModal } from './components/prescription/PrescriptionSetupModal';
import { ClinicalSessionReportModal } from './components/dashboard/ClinicalSessionReportModal';
import { CognitiveClassifier } from './engine/cognitive-classifier';

// Storage & Types
import {
  getStoredCaretaker,
  getStoredPatients,
  getStoredSessionReport,
  saveStoredSessionReport
} from './utils/authStorage';
import {
  getSavedPrescription,
  savePrescription,
  getDefaultPrescription
} from './utils/prescriptionStorage';
import {
  getStoredMedications,
  saveStoredMedications,
  getStoredRoutine,
  saveStoredRoutine
} from './utils/caregiverStorage';
import type { SupportedLanguage, PatientPrescription, GameId } from './types/prescription';
import type { CaretakerUser, PatientProfile } from './types/auth';
import type { MedicationItem, DailyRoutineItem } from './types/caregiver';

// ─── Default Data Models ────────────────────────────────────────────────────────

const initialCogData = [
  { day: 'Mon', score: 76, baseline: 78 },
  { day: 'Tue', score: 82, baseline: 78 },
  { day: 'Wed', score: 79, baseline: 78 },
  { day: 'Thu', score: 74, baseline: 78 },
  { day: 'Fri', score: 77, baseline: 78 },
  { day: 'Sat', score: 80, baseline: 78 },
  { day: 'Sun', score: 82, baseline: 78 },
];

const initialActivityFeed = [
  { type: 'med' as const, time: '8:04 AM', text: 'Donepezil (10 mg) taken on schedule' },
  { type: 'routine' as const, time: '7:12 AM', text: 'Morning walk completed — 22 minutes' },
  { type: 'cognitive' as const, time: 'Yesterday · 6:30 PM', text: 'Smriti Haat Word Memory — Score 84 / 100' },
  { type: 'routine' as const, time: 'Yesterday · 12:30 PM', text: 'Lunch routine confirmed' },
  { type: 'med' as const, time: 'Yesterday · 8:10 AM', text: 'Donepezil taken on schedule' },
  { type: 'alert' as const, time: '2 days ago · 4:00 PM', text: 'Score below baseline noted — 74 on Thursday' },
];

const navLinks = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'patient', label: 'Patient', Icon: User },
  { id: 'games', label: 'Games', Icon: Gamepad2 },
  { id: 'medication', label: 'Medication', Icon: Pill },
  { id: 'routine', label: 'Routine', Icon: Sun },
  { id: 'alerts', label: 'Alerts', Icon: Bell, badge: 2 },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

type StatusType = 'taken' | 'pending' | 'missed' | 'done';
type ActivityType = 'med' | 'routine' | 'cognitive' | 'alert';
type AlertLevel = 'warn' | 'info';

const statusConfig: Record<StatusType, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  taken: { bg: '#e8f7f0', text: '#2d8a5c', border: '#b7e4cc', icon: <CheckCircle2 size={14} /> },
  done: { bg: '#e8f7f0', text: '#2d8a5c', border: '#b7e4cc', icon: <CheckCircle2 size={14} /> },
  pending: { bg: '#fff4e6', text: '#c47a1a', border: '#fcd89a', icon: <Clock size={14} /> },
  missed: { bg: '#fff1f1', text: '#c0392b', border: '#fecaca', icon: <XCircle size={14} /> },
};

const activityConfig: Record<ActivityType, { dot: string; label: string }> = {
  med: { dot: '#3b9eda', label: 'Medication' },
  routine: { dot: '#4caf82', label: 'Routine' },
  cognitive: { dot: '#8b5cf6', label: 'Cognitive' },
  alert: { dot: '#f59c3a', label: 'Alert' },
};

// ─── Custom Chart Tooltip ───────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const score = payload.find(p => p.dataKey === 'score')?.value;
  const diff = score != null ? score - 78 : 0;
  return (
    <div style={{ background: '#fff', border: '1px solid #e8edf5', borderRadius: 14, padding: '12px 16px', boxShadow: '0 8px 24px rgba(13,31,60,0.1)' }}>
      <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#0d1f3c', marginBottom: 6, fontSize: 13 }}>{label}</p>
      <p style={{ color: '#3b9eda', fontSize: 13, fontWeight: 600 }}>Score: {score}</p>
      <p style={{ color: diff >= 0 ? '#4caf82' : '#f59c3a', fontSize: 12, marginTop: 2 }}>
        {diff >= 0 ? '+' : ''}{diff} vs baseline
      </p>
    </div>
  );
}

// ─── Collapsible Sidebar ────────────────────────────────────────────────────────

function Sidebar({
  active,
  setActive,
  collapsed,
  onClose,
  caretakerName
}: {
  active: string;
  setActive: (id: string) => void;
  collapsed: boolean;
  onClose?: () => void;
  caretakerName: string;
}) {
  return (
    <div
      style={{
        width: collapsed ? 72 : 240,
        background: 'var(--navy)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'width 0.25s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Logo row */}
      <div style={{ padding: '24px 16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: 'linear-gradient(135deg, #3b9eda, #4caf82)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Heart size={18} color="#fff" fill="#fff" />
        </div>
        {!collapsed && (
          <div>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#fff', fontSize: 15, lineHeight: 1.2 }}>NeuroSaathi</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Caregiver Portal</p>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
        {!collapsed && (
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 10px 10px', fontWeight: 600 }}>Navigation</p>
        )}
        {navLinks.map(({ id, label, Icon, badge }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => { setActive(id); onClose?.(); }}
              title={collapsed ? label : undefined}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '11px 0' : '11px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 12, marginBottom: 2, border: 'none', cursor: 'pointer',
                background: isActive ? 'rgba(59,158,218,0.15)' : 'transparent',
                color: isActive ? '#3b9eda' : 'rgba(255,255,255,0.55)',
                fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 20, borderRadius: '0 3px 3px 0',
                  background: '#3b9eda',
                }} />
              )}
              <Icon size={18} />
              {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>}
              {!collapsed && badge && (
                <span style={{
                  background: '#f59c3a', color: '#fff', fontSize: 10, fontWeight: 700,
                  borderRadius: 20, padding: '1px 7px', minWidth: 18, textAlign: 'center',
                }}>{badge}</span>
              )}
              {collapsed && badge && (
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  background: '#f59c3a', width: 8, height: 8, borderRadius: '50%',
                  border: '2px solid var(--navy)',
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Caregiver Profile */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {!collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #3b9eda, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Manrope, sans-serif', flexShrink: 0 }}>
              {caretakerName.slice(0, 1).toUpperCase() || 'P'}
            </div>
            <div>
              <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'Manrope, sans-serif' }}>{caretakerName}</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Primary Caregiver</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #3b9eda, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Manrope, sans-serif' }}>
              {caretakerName.slice(0, 1).toUpperCase() || 'P'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Header ─────────────────────────────────────────────────────────────────────

function Header({
  onMenuClick,
  backendConnected,
  caretakerName,
  patientName
}: {
  onMenuClick: () => void;
  backendConnected?: boolean;
  caretakerName: string;
  patientName: string;
}) {
  return (
    <header style={{
      background: '#fff', borderBottom: '1px solid var(--border)',
      padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16,
      flexShrink: 0,
    }}>
      <button
        onClick={onMenuClick}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 6, borderRadius: 8, display: 'flex' }}
      >
        <Menu size={20} />
      </button>

      <div style={{ flex: 1 }}>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          Good Day, {caretakerName} 👋
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={12} color="var(--text-muted)" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: backendConnected ? '#e8f7f0' : '#e8f4fd',
            color: backendConnected ? '#2d8a5c' : '#1a6fa8',
            padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: backendConnected ? '#4caf82' : '#3b9eda' }} />
            {backendConnected ? 'Live Backend Connected' : 'Edge AI Engine Active'}
          </span>
        </div>
      </div>

      {/* Patient selector */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '8px 14px', cursor: 'pointer',
      }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #e8f4fd, #3b9eda)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👵</div>
        <div style={{ display: 'none' }} className="sm-flex">
          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{patientName}</span>
        </div>
        <ChevronDown size={14} color="var(--text-muted)" />
      </div>

      <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, #3b9eda, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', flexShrink: 0, cursor: 'pointer' }}>
        {caretakerName.slice(0, 1).toUpperCase() || 'P'}
      </div>
    </header>
  );
}

// ─── Patient Hero Card ──────────────────────────────────────────────────────────

function PatientCard({
  patient,
  overallStatus,
  onOpenPrescription,
  onOpenClinicalReport
}: {
  patient?: any;
  overallStatus?: any;
  onOpenPrescription: () => void;
  onOpenClinicalReport: () => void;
}) {
  const name = patient?.name || 'Dadu (Bhaben Baruah)';
  const age = patient?.age || 76;
  const caregiver = patient?.caregiver || 'Parth';
  const status = overallStatus?.status || 'Stable';

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--navy) 0%, #1e3a5f 100%)',
      borderRadius: 'var(--radius-card)', padding: 24, display: 'flex',
      alignItems: 'center', gap: 20, flexWrap: 'wrap',
      boxShadow: '0 4px 24px rgba(13,31,60,0.15)',
    }}>
      {/* Avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'linear-gradient(135deg, #c8e6fa, #3b9eda)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, border: '3px solid rgba(255,255,255,0.2)',
        }}>👵</div>
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          width: 16, height: 16, borderRadius: '50%',
          background: '#4caf82', border: '3px solid #1e3a5f',
        }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 160 }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.07em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Supervised Patient</p>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 22, color: '#fff', lineHeight: 1.2 }}>{name}</h2>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4 }}>{age} years · Caregiver: {caregiver}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(76,175,130,0.2)', color: '#7de0ac', border: '1px solid rgba(76,175,130,0.3)', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4caf82', display: 'inline-block' }} />
            {status}
          </span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '4px 12px', fontSize: 12 }}>
            Mild Cognitive Impairment (OASIS-2)
          </span>
        </div>
      </div>

      {/* Action Buttons & Strip */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end', minWidth: 200 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onOpenPrescription}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#f59c3a', color: '#fff', border: 'none',
              borderRadius: 12, padding: '8px 14px', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(245,156,58,0.3)'
            }}
          >
            <Sliders size={14} />
            <span>Prescribe Games</span>
          </button>
          <button
            onClick={onOpenClinicalReport}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12, padding: '8px 14px', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            <FileText size={14} />
            <span>Doctor PDF Report</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Physician', value: 'Dr. Priya Mehta' },
            { label: 'Last Check-in', value: 'Today' },
            { label: 'Care Since', value: 'Jan 2024' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Summary Cards ────────────────────────────────────────────────────────────

function SummaryCard({ label, value, unit, sub1, sub2, color, bg, trend, icon }: {
  label: string; value: string; unit?: string;
  sub1: string; sub2: string; color: string; bg: string;
  trend: 'up' | 'down' | 'flat'; icon: React.ReactNode;
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? '#4caf82' : trend === 'down' ? '#f59c3a' : '#8a9bb5';
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius-card)', padding: '20px 22px',
      boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', gap: 12,
      cursor: 'default', transition: 'box-shadow 0.15s ease',
    }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card-hover)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 36, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</span>
        {unit && <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>{unit}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          <span>{sub1}</span>
          <span style={{ color: 'var(--border)', margin: '0 6px' }}>·</span>
          <span>{sub2}</span>
        </div>
        <TrendIcon size={14} color={trendColor} />
      </div>
    </div>
  );
}

// ─── 7-Day Cognitive Performance Chart ────────────────────────────────────────

function CognitivePerfChart({ trendData, baseline = 78, patientName = 'Meera' }: { trendData?: any[]; baseline?: number; patientName?: string }) {
  const data = trendData && trendData.length > 0 ? trendData : initialCogData;
  const latestScore = data[data.length - 1]?.score ?? 80;

  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-card)', padding: 28, boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 17, color: 'var(--text-primary)', marginBottom: 4 }}>
            7-Day Cognitive Performance
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {patientName}'s daily engagement scores compared to personal baseline of {baseline}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 24, height: 3, borderRadius: 2, background: '#3b9eda' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Score</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 24, height: 2, borderRadius: 2, background: '#d1dae6', backgroundImage: 'repeating-linear-gradient(90deg, #d1dae6 0 6px, transparent 6px 10px)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Baseline</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b9eda" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#3b9eda" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#8a9bb5', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
          <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: '#8a9bb5', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <ReferenceLine y={baseline} stroke="#d1dae6" strokeDasharray="5 4" strokeWidth={2} label={{ value: `Baseline ${baseline}`, position: 'insideTopRight', fontSize: 11, fill: '#8a9bb5', dy: -6 }} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#3b9eda"
            strokeWidth={2.5}
            fill="url(#scoreGrad)"
            dot={(props) => {
              const { cx, cy, payload } = props as { cx: number; cy: number; payload: { score: number; baseline: number } };
              const isLow = payload.score < payload.baseline;
              return <circle key={`dot-${cx}`} cx={cx} cy={cy} r={5} fill={isLow ? '#f59c3a' : '#3b9eda'} stroke="#fff" strokeWidth={2} />;
            }}
            activeDot={{ r: 7, fill: '#3b9eda', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Annotations */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
        <div style={{ background: 'var(--sky-light)', border: '1px solid #c4e0f4', borderRadius: 12, padding: '8px 14px', fontSize: 12, color: '#1a6fa8' }}>
          <strong>Latest Session:</strong> {latestScore} — {latestScore >= baseline ? 'Above personal baseline' : 'Below personal baseline'}
        </div>
        <div style={{ background: 'var(--amber-light)', border: '1px solid #fcd8a0', borderRadius: 12, padding: '8px 14px', fontSize: 12, color: '#9a5c10' }}>
          <strong>Baseline:</strong> {baseline} target
        </div>
        <div style={{ background: 'var(--sage-light)', border: '1px solid #abe8ca', borderRadius: 12, padding: '8px 14px', fontSize: 12, color: '#1f7a4e' }}>
          <strong>Continuous DDA:</strong> Active Bayesian 2PL IRT
        </div>
      </div>
    </div>
  );
}

// ─── Medication Card ──────────────────────────────────────────────────────────

function MedicationCard({
  medList,
  onToggleMed
}: {
  medList: MedicationItem[];
  onToggleMed: (id: string) => void;
}) {
  const items = medList.map(m => ({
    id: m.id,
    name: m.name,
    dose: m.dosage,
    time: m.timing === 'morning' ? '8:00 AM' : m.timing === 'afternoon' ? '1:00 PM' : '8:00 PM',
    status: (m.takenToday ? 'taken' : 'pending') as StatusType,
  }));

  const taken = items.filter(m => m.status === 'taken').length;
  const pct = items.length > 0 ? Math.round((taken / items.length) * 100) : 100;

  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-card)', padding: 24, boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>Today's Medication</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{taken} of {items.length} confirmed</p>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--sky-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Pill size={18} color="var(--sky)" />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {items.map((med) => {
          const cfg = statusConfig[med.status] || statusConfig.pending;
          return (
            <div
              key={med.id}
              onClick={() => onToggleMed(med.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 14,
                background: 'var(--surface)', border: '1px solid var(--border)',
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.text, flexShrink: 0 }}>
                <Pill size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{med.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{med.dose} · {med.time}</p>
              </div>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
                borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700,
                textTransform: 'capitalize', whiteSpace: 'nowrap',
              }}>
                {cfg.icon}
                {med.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Daily adherence</span>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>{pct}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 6, background: '#eef2f8', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #3b9eda, #4caf82)', borderRadius: 6, transition: 'width 0.6s ease' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Routine Card ─────────────────────────────────────────────────────────────

function RoutineCard({
  routineList,
  onToggleRoutine
}: {
  routineList: DailyRoutineItem[];
  onToggleRoutine: (id: string) => void;
}) {
  const items = routineList.map(r => ({
    id: r.id,
    task: r.activity,
    icon: r.category === 'exercise' ? '🚶' : r.category === 'meal' ? '🍱' : '📖',
    time: r.time,
    status: (r.completed ? 'done' : 'pending') as StatusType,
  }));

  const done = items.filter(r => r.status === 'done').length;
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 100;

  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-card)', padding: 24, boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>Today's Routine</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{done} of {items.length} completed</p>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sun size={18} color="var(--sage)" />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {items.map((item) => {
          const cfg = statusConfig[item.status];
          return (
            <div
              key={item.id}
              onClick={() => onToggleRoutine(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 14,
                background: 'var(--surface)', border: '1px solid var(--border)',
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{item.task}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{item.time}</p>
              </div>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
                borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700,
                textTransform: 'capitalize', whiteSpace: 'nowrap',
              }}>
                {cfg.icon}
                {item.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Day completion</span>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>{pct}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 6, background: '#eef2f8', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #4caf82, #a8e6c8)', borderRadius: 6, transition: 'width 0.6s ease' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

function AlertsSection({ alerts }: { alerts: { id: number; level: AlertLevel; title: string; detail: string; time: string }[] }) {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const visible = alerts.filter(a => !dismissed.includes(a.id));

  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-card)', padding: 24, boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>Needs Your Attention</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Review and act when ready</p>
        </div>
        {visible.length > 0 && (
          <span style={{ background: 'var(--amber-light)', color: '#9a5c10', border: '1px solid #fcd8a0', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
            {visible.length} active
          </span>
        )}
      </div>

      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
          <CheckCircle2 size={32} color="#4caf82" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 14 }}>All caught up — nothing needs attention right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visible.map(alert => {
            const isWarn = alert.level === 'warn';
            return (
              <div key={alert.id} style={{
                display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 14,
                background: isWarn ? 'var(--amber-light)' : 'var(--sky-light)',
                border: `1px solid ${isWarn ? '#fcd8a0' : '#c4e0f4'}`,
              }}>
                <div style={{ flexShrink: 0, marginTop: 1 }}>
                  {isWarn
                    ? <AlertTriangle size={18} color="#c47a1a" />
                    : <Info size={18} color="#1a6fa8" />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 14, color: isWarn ? '#7a4a0a' : '#0e4a80' }}>{alert.title}</p>
                  <p style={{ fontSize: 13, color: isWarn ? '#9a6420' : '#2a6aa0', marginTop: 3, lineHeight: 1.5 }}>{alert.detail}</p>
                  <p style={{ fontSize: 11, color: isWarn ? '#c4943a' : '#5a9aca', marginTop: 6 }}>{alert.time}</p>
                </div>
                <button
                  onClick={() => setDismissed(d => [...d, alert.id])}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: isWarn ? '#c4943a' : '#5a9aca', padding: 2, alignSelf: 'flex-start', flexShrink: 0 }}
                  aria-label="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Activity Timeline ────────────────────────────────────────────────────────

function ActivityTimeline({ activityList }: { activityList: { type: ActivityType; time: string; text: string }[] }) {
  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-card)', padding: 24, boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Activity size={16} color="var(--text-muted)" />
        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>Recent Activity</h3>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 11, top: 12, bottom: 12, width: 1.5, background: 'var(--border)' }} />

        {activityList.map((item, i) => {
          const cfg = activityConfig[item.type];
          return (
            <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: i < activityList.length - 1 ? 18 : 0, position: 'relative' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', background: cfg.dot,
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1, boxShadow: '0 0 0 3px #fff',
              }}>
                {item.type === 'med' && <Pill size={11} color="#fff" />}
                {item.type === 'routine' && <Sun size={11} color="#fff" />}
                {item.type === 'cognitive' && <Sparkles size={11} color="#fff" />}
                {item.type === 'alert' && <Bell size={11} color="#fff" />}
              </div>
              <div style={{ flex: 1, paddingTop: 2 }}>
                <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{item.text}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Patient Insight Card ─────────────────────────────────────────────────────

function InsightCard({
  cognitiveScore,
  classification,
  patientName,
  lastSessionReport
}: {
  cognitiveScore: number;
  classification: any;
  patientName: string;
  lastSessionReport: SessionSummaryTelemetry | null;
}) {
  const thetaFormatted = lastSessionReport && lastSessionReport.finalTheta !== undefined ? lastSessionReport.finalTheta.toFixed(2) : '+0.45';

  return (
    <div style={{
      borderRadius: 'var(--radius-card)', overflow: 'hidden',
      boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)',
    }}>
      <div style={{ height: 4, background: 'linear-gradient(90deg, #3b9eda, #4caf82, #f59c3a)' }} />

      <div style={{ background: '#fff', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #e8f4fd, #c8e6fa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} color="#3b9eda" />
          </div>
          <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>AI Patient Insight</h3>
        </div>

        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 18 }}>
          {patientName}'s cognitive score is{' '}
          <strong style={{ color: 'var(--sky)', fontFamily: 'Manrope, sans-serif' }}>{cognitiveScore}</strong>.
          Model inference classifies current status as{' '}
          <strong style={{ color: '#2d8a5c' }}>{classification.predictedClass.split('(')[0].trim()}</strong>{' '}
          ({classification?.confidenceScore ? (classification.confidenceScore * 100).toFixed(0) : '0'}% confidence).
        </p>

        {/* Score visual */}
        <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Cognitive Score (2PL IRT)</span>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{cognitiveScore} / 100</span>
          </div>
          <div style={{ height: 8, borderRadius: 8, background: '#eef2f8', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, cognitiveScore)}%`, background: 'linear-gradient(90deg, #3b9eda, #4caf82)', borderRadius: 8 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Baseline: 78</span>
            <span style={{ fontSize: 11, color: '#4caf82', fontWeight: 600 }}>θ = {thetaFormatted} (Active DDA)</span>
          </div>
        </div>

        {/* Mini breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Delayed recall', value: lastSessionReport ? Math.min(100, lastSessionReport.accuracyPercentage) : 82, color: '#3b9eda' },
            { label: 'Orientation', value: 78, color: '#4caf82' },
            { label: 'Attention Span', value: lastSessionReport ? Math.min(100, Math.round((lastSessionReport.estimatedMoCAMemoryScore / 5) * 100)) : 75, color: '#f59c3a' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 100, flexShrink: 0 }}>{label}</span>
              <div style={{ flex: 1, height: 5, borderRadius: 5, background: '#eef2f8', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 5 }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', width: 24, textAlign: 'right' }}>{value}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 18, lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          This information is observational and computed by on-device edge ML trained on the OASIS-2 longitudinal cohort.
        </p>
      </div>
    </div>
  );
}

// ─── MAIN APP COMPONENT ────────────────────────────────────────────────────────

export function App() {
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Regional Language & Roles
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('as');
  const [caretaker] = useState<CaretakerUser>(() => {
    return getStoredCaretaker() || {
      id: 'caretaker_parth_01',
      name: 'Parth',
      age: 23,
      email: 'parth@smritiner.in',
      createdAt: new Date().toISOString(),
    };
  });
  const [activePatient] = useState<PatientProfile>(() => {
    const list = getStoredPatients();
    return list.length > 0 ? list[0] : {
      id: 'patient_dadu_01',
      caretakerId: 'caretaker_parth_01',
      name: 'Dadu (Bhaben Baruah)',
      age: 76,
      gender: 'male',
      primaryLanguage: 'as',
      diagnosisStage: 'mild_cognitive_impairment',
      emergencyContact: '+91 98765 43210',
      relationshipToCaretaker: 'Grandfather',
      notes: 'Mild delay in spatial sequencing; high compliance with regional music games.',
      createdAt: new Date().toISOString(),
    };
  });

  // Prescriptions & Session Reports
  const [prescription, setPrescription] = useState<PatientPrescription>(() => getSavedPrescription() || getDefaultPrescription());
  const [lastSessionReport, setLastSessionReport] = useState<SessionSummaryTelemetry | null>(() => getStoredSessionReport());

  // Dynamic Dashboard Stats
  const [cognitiveTrend, setCognitiveTrend] = useState(initialCogData);
  const [activityList, setActivityList] = useState(initialActivityFeed);
  const [medicationItems, setMedicationItems] = useState<MedicationItem[]>(() => getStoredMedications(activePatient.id));
  const [routineList, setRoutineList] = useState<DailyRoutineItem[]>(() => getStoredRoutine(activePatient.id));

  // Games Section State
  const [gamesSubTab, setGamesSubTab] = useState<'TODAY' | 'LIBRARY' | 'MY_BRAIN' | 'CIRCADIAN'>('TODAY');
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  const [isWorkoutMode, setIsWorkoutMode] = useState(false);
  const [workoutPlaylist, setWorkoutPlaylist] = useState<GameId[]>([]);
  const [workoutCurrentIndex, setWorkoutCurrentIndex] = useState(0);
  const [completedWorkoutGames, setCompletedWorkoutGames] = useState<GameId[]>([]);
  const [workoutSessionSummaries, setWorkoutSessionSummaries] = useState<Record<string, any>>({});
  const [isIntermissionOpen, setIsIntermissionOpen] = useState(false);
  const [isWorkoutCelebrationOpen, setIsWorkoutCelebrationOpen] = useState(false);
  const [isWorkoutCompletedToday, setIsWorkoutCompletedToday] = useState<boolean>(() => {
    try {
      const todayKey = `smriti_workout_done_${new Date().toISOString().slice(0, 10)}`;
      return localStorage.getItem(todayKey) === 'true';
    } catch {
      return false;
    }
  });
  const [dayStreak, setDayStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('smriti_day_streak_v1');
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  // Modals
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isClinicalReportModalOpen, setIsClinicalReportModalOpen] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);

  // Optional connection to local Flask backend if running
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/dashboard/1')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setBackendConnected(true);
        }
      })
      .catch(() => {
        // Backend offline, edge client runs seamlessly
      });
  }, []);

  // Compute live Cognitive Score from last game or default
  const liveCognitiveScore = useMemo(() => {
    if (!lastSessionReport) return 80;
    const accuracy = lastSessionReport.accuracyPercentage ?? 80;
    const thetaBonus = Math.max(0, Math.min(20, Math.round((lastSessionReport.finalTheta + 1) * 7)));
    return Math.max(60, Math.min(98, Math.round(accuracy * 0.8 + thetaBonus)));
  }, [lastSessionReport]);

  // Evaluate patient telemetry using OASIS-2 trained ML classifier
  const classification = useMemo(() => {
    if (!lastSessionReport) {
      return CognitiveClassifier.classify({
        meanLatencyMs: 3200,
        latencyVarianceMs: 800,
        accuracyPct: 90,
        perseverationRate: 0.05,
        hesitationRatio: 0.1,
        tremorJitterIndex: 0.15,
      });
    }
    const totalRounds = lastSessionReport.totalRounds || 5;
    return CognitiveClassifier.classify({
      meanLatencyMs: lastSessionReport.averageLatencyMs || 2400,
      latencyVarianceMs: Math.round((lastSessionReport.averageLatencyMs || 2400) * 0.25),
      accuracyPct: lastSessionReport.accuracyPercentage ?? 100,
      perseverationRate: totalRounds > 0 ? ((lastSessionReport.perseverationErrors || 0) / totalRounds) : 0,
      hesitationRatio: (lastSessionReport.averageLatencyMs || 0) > 4500 ? 0.35 : 0.05,
      tremorJitterIndex: 0.12,
    });
  }, [lastSessionReport]);

  // Toggle Medication Item
  const handleToggleMed = (medId: string) => {
    const updated = medicationItems.map(m => m.id === medId ? { ...m, takenToday: !m.takenToday } : m);
    setMedicationItems(updated);
    saveStoredMedications(activePatient.id, updated);
  };

  // Toggle Routine Item
  const handleToggleRoutine = (routId: string) => {
    const updated = routineList.map(r => r.id === routId ? { ...r, completed: !r.completed } : r);
    setRoutineList(updated);
    saveStoredRoutine(activePatient.id, updated);
  };

  // Record completed session and feed telemetry into Dashboard
  const handleRecordSessionSummary = (gameId: GameId, summary: any) => {
    setLastSessionReport(summary);
    saveStoredSessionReport(summary);

    // Calculate score
    const newScore = Math.max(60, Math.min(98, Math.round((summary.accuracyPercentage ?? 80) * 0.85 + 10)));

    // Update 7-day trend
    setCognitiveTrend(prev => {
      const copy = [...prev];
      if (copy.length > 0) {
        copy[copy.length - 1] = { ...copy[copy.length - 1], score: newScore };
      }
      return copy;
    });

    // Prepend to activity feed
    const title = summary.gameTitle || GAME_CATALOG.find(g => g.id === gameId)?.title.en || gameId;
    setActivityList(prev => [
      {
        type: 'cognitive',
        time: 'Just now',
        text: `${title} completed — Score ${newScore} / 100 (Acc: ${summary.accuracyPercentage}%)`
      },
      ...prev.slice(0, 8)
    ]);

    if (isWorkoutMode) {
      setWorkoutSessionSummaries(prev => ({ ...prev, [gameId]: summary }));
      setCompletedWorkoutGames(prev => [...prev.filter(id => id !== gameId), gameId]);
    }
  };

  // Begin Prescribed Workout
  const handleBeginWorkout = () => {
    const playlist = prescription.prescribedGameIds && prescription.prescribedGameIds.length > 0
      ? prescription.prescribedGameIds
      : (['memory-match', 'word-recall', 'sequence-recall'] as GameId[]);

    setWorkoutPlaylist(playlist);
    setWorkoutCurrentIndex(0);
    setIsWorkoutMode(true);
    setCompletedWorkoutGames([]);
    setWorkoutSessionSummaries({});
    setIsIntermissionOpen(false);
    setIsWorkoutCelebrationOpen(false);
    setActiveGameId(playlist[0]);
  };

  // Advance to next exercise in workout
  const handleAdvanceWorkout = (gameId: GameId, summary?: any) => {
    if (summary) {
      handleRecordSessionSummary(gameId, summary);
    }

    if (isWorkoutMode) {
      if (workoutCurrentIndex + 1 < workoutPlaylist.length) {
        setIsIntermissionOpen(true);
      } else {
        setIsWorkoutCelebrationOpen(true);
        setIsWorkoutCompletedToday(true);
        const nextStreak = dayStreak + 1;
        setDayStreak(nextStreak);
        try {
          const todayKey = `smriti_workout_done_${new Date().toISOString().slice(0, 10)}`;
          localStorage.setItem(todayKey, 'true');
          localStorage.setItem('smriti_day_streak_v1', nextStreak.toString());
        } catch {}
      }
    } else {
      setActiveGameId(null);
    }
  };

  // Start next exercise from intermission modal
  const handleStartNextFromIntermission = () => {
    setIsIntermissionOpen(false);
    const nextIndex = workoutCurrentIndex + 1;
    if (nextIndex < workoutPlaylist.length) {
      setWorkoutCurrentIndex(nextIndex);
      setActiveGameId(workoutPlaylist[nextIndex]);
    }
  };

  // Exit workout
  const handleExitWorkout = () => {
    setIsWorkoutMode(false);
    setActiveGameId(null);
    setIsIntermissionOpen(false);
    setIsWorkoutCelebrationOpen(false);
  };

  const handleSavePrescription = (updated: PatientPrescription) => {
    setPrescription(updated);
    savePrescription(updated);
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--surface)', overflow: 'hidden', position: 'relative' }}>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,60,0.5)', zIndex: 40, display: 'block' }}
          className="lg-hidden"
        />
      )}

      {/* Desktop sidebar */}
      <div style={{ display: 'flex' }} className="hidden-mobile">
        <div style={{ position: 'relative' }}>
          <Sidebar
            active={activeNav}
            setActive={(nav) => {
              setActiveNav(nav);
              if (nav !== 'games') setActiveGameId(null);
            }}
            collapsed={sidebarCollapsed}
            caretakerName={caretaker.name}
          />
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            style={{
              position: 'absolute', top: 80, right: -14,
              width: 28, height: 28, borderRadius: '50%',
              background: '#fff', border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 10, color: 'var(--text-muted)',
            }}
          >
            {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s cubic-bezier(.4,0,.2,1)',
      }} className="show-mobile">
        <Sidebar
          active={activeNav}
          setActive={(nav) => {
            setActiveNav(nav);
            if (nav !== 'games') setActiveGameId(null);
          }}
          collapsed={false}
          onClose={() => setSidebarOpen(false)}
          caretakerName={caretaker.name}
        />
      </div>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Header
          onMenuClick={() => setSidebarOpen(o => !o)}
          backendConnected={backendConnected}
          caretakerName={caretaker.name}
          patientName={activePatient.name}
        />

        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* TAB 1: MAIN CAREGIVER DASHBOARD */}
            {activeNav === 'dashboard' && (
              <>
                <PatientCard
                  patient={activePatient}
                  overallStatus={{ status: 'Stable' }}
                  onOpenPrescription={() => setIsPrescriptionModalOpen(true)}
                  onOpenClinicalReport={() => setIsClinicalReportModalOpen(true)}
                />

                {/* 4 KPI Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <SummaryCard
                    label="Cognitive Score"
                    value={String(liveCognitiveScore)}
                    sub1="Baseline 78"
                    sub2={liveCognitiveScore >= 78 ? 'Above baseline' : 'Under observation'}
                    color="var(--sky)" bg="var(--sky-light)" trend={liveCognitiveScore >= 78 ? 'up' : 'down'}
                    icon={<TrendingUp size={16} />}
                  />
                  <SummaryCard
                    label="Medication"
                    value={String(Math.round((medicationItems.filter(m => m.takenToday).length / (medicationItems.length || 1)) * 100))}
                    unit="%"
                    sub1={`Taken ${medicationItems.filter(m => m.takenToday).length}`}
                    sub2={`Pending ${medicationItems.filter(m => !m.takenToday).length}`}
                    color="var(--sage)" bg="var(--sage-light)" trend="flat"
                    icon={<Pill size={16} />}
                  />
                  <SummaryCard
                    label="Daily Routine"
                    value={String(Math.round((routineList.filter(r => r.completed).length / (routineList.length || 1)) * 100))}
                    unit="%"
                    sub1={`Completed ${routineList.filter(r => r.completed).length}`}
                    sub2={`Pending ${routineList.filter(r => !r.completed).length}`}
                    color="#8b5cf6" bg="#f3eeff" trend="up"
                    icon={<Sun size={16} />}
                  />
                  <SummaryCard
                    label="Active Alerts"
                    value="2"
                    sub1="1 needs action"
                    sub2="1 informational"
                    color="var(--amber)" bg="var(--amber-light)" trend="down"
                    icon={<Bell size={16} />}
                  />
                </div>

                {/* 7-Day Performance Chart */}
                <CognitivePerfChart
                  trendData={cognitiveTrend}
                  baseline={78}
                  patientName={activePatient.name.split(' ')[0]}
                />

                {/* Med + Routine Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                  <MedicationCard medList={medicationItems} onToggleMed={handleToggleMed} />
                  <RoutineCard routineList={routineList} onToggleRoutine={handleToggleRoutine} />
                </div>

                {/* Alerts + Activity + Insight 3-Column */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 20 }} className="three-col">
                  <AlertsSection alerts={[
                    { id: 1, level: 'warn', title: 'Evening medication pending', detail: 'Memantine HCl has not been confirmed yet.', time: '2 hours ago' },
                    { id: 2, level: 'info', title: 'Observed change in afternoon pattern', detail: `${activePatient.name}'s deliberation was slightly slower during today's workout.`, time: 'Earlier today' }
                  ]} />
                  <ActivityTimeline activityList={activityList} />
                  <InsightCard
                    cognitiveScore={liveCognitiveScore}
                    classification={classification}
                    patientName={activePatient.name}
                    lastSessionReport={lastSessionReport}
                  />
                </div>
              </>
            )}

            {/* TAB 2: COGNITIVE GAMES HUB */}
            {activeNav === 'games' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* When an active game is currently launched */}
                {activeGameId ? (
                  <div className="space-y-4">
                    {isWorkoutMode ? (
                      <WorkoutProgressHeader
                        currentIndex={workoutCurrentIndex}
                        totalExercises={workoutPlaylist.length}
                        currentGameTitle={GAME_CATALOG.find(g => g.id === activeGameId)?.title[selectedLanguage] || activeGameId}
                        nextGameTitle={
                          workoutCurrentIndex + 1 < workoutPlaylist.length
                            ? (GAME_CATALOG.find(g => g.id === workoutPlaylist[workoutCurrentIndex + 1])?.title[selectedLanguage] || workoutPlaylist[workoutCurrentIndex + 1])
                            : null
                        }
                        onNextExercise={() => handleAdvanceWorkout(activeGameId)}
                        onExitWorkout={handleExitWorkout}
                      />
                    ) : (
                      <div className="flex items-center justify-between bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
                        <button
                          onClick={() => setActiveGameId(null)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm transition-all cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4 text-slate-600" />
                          <span>← Back to Games</span>
                        </button>
                        <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-lg uppercase tracking-wider font-black text-xs">
                          {activeGameId}
                        </span>
                      </div>
                    )}

                    {/* Game 1: Memory Match */}
                    {activeGameId === 'memory-match' && (
                      <MemoryMatch
                        language={selectedLanguage}
                        totalPairs={4}
                        onSessionComplete={(summary) => {
                          const report = {
                            ...summary,
                            gameId: 'memory-match',
                            gameTitle: 'Memory Match (Paired Associates)',
                          };
                          handleRecordSessionSummary('memory-match', report);
                        }}
                        onExit={() => handleAdvanceWorkout('memory-match')}
                      />
                    )}

                    {/* Game 2: Smriti Haat */}
                    {(activeGameId === 'word-recall' || activeGameId === 'smriti-haat') && (
                      <SmritiHaat
                        language={selectedLanguage}
                        totalRounds={3}
                        onSessionComplete={(summary) => {
                          const report = {
                            ...summary,
                            gameId: 'smriti-haat',
                            gameTitle: 'Smriti Haat (Bazaar Word Recall)',
                          };
                          handleRecordSessionSummary('word-recall', report);
                        }}
                        onExit={() => handleAdvanceWorkout('word-recall')}
                      />
                    )}

                    {/* Game 3: Sequence Recall */}
                    {activeGameId === 'sequence-recall' && (
                      <SequenceRecall
                        language={selectedLanguage}
                        totalTrials={5}
                        onSessionComplete={(summary) => {
                          const report = {
                            ...summary,
                            gameId: 'sequence-recall',
                            gameTitle: 'Sequence Recall (Suror Sreni)',
                            totalRounds: summary.totalTrials,
                            totalCorrect: summary.correctTrials,
                            autoAssistedRounds: summary.autoAssistedTrials,
                            accuracyPercentage: summary.accuracyPercentage,
                            averageLatencyMs: summary.meanDeliberationMs,
                            medianLatencyMs: summary.meanDeliberationMs,
                            perseverationErrors: summary.perseverationErrors,
                            transpositionErrors: summary.transpositionErrors,
                            intrusionErrors: summary.intrusionErrors,
                            maxSpanAchieved: summary.maxSpanAchieved,
                            forwardSpan: summary.forwardSpan,
                            reverseSpan: summary.reverseSpan,
                            finalTheta: summary.finalTheta,
                            estimatedMoCAMemoryScore: summary.estimatedMoCAWorkingMemoryScore,
                            processingSpeedProfile: summary.processingSpeedProfile,
                            caregiverEndedEarly: summary.caregiverEndedEarly,
                            completedAt: summary.completedAt,
                            rounds: []
                          };
                          handleRecordSessionSummary('sequence-recall', report);
                        }}
                        onExit={() => handleAdvanceWorkout('sequence-recall')}
                      />
                    )}

                    {/* Game: Pattern Recall */}
                    {activeGameId === 'pattern-recall' && (
                      <PatternRecall
                        language={selectedLanguage}
                        totalTrials={5}
                        onSessionComplete={(summary) => {
                          const report = {
                            ...summary,
                            gameId: 'pattern-recall',
                            gameTitle: 'Pattern Recall (Noxar Chonda)',
                            totalRounds: summary.totalTrials,
                            totalCorrect: summary.correctTrials,
                            averageLatencyMs: summary.meanDeliberationMs,
                            finalTheta: summary.accuracyPercentage >= 85 ? 1.15 : summary.accuracyPercentage >= 70 ? 0.45 : -0.25,
                            completedAt: new Date().toISOString(),
                          };
                          handleRecordSessionSummary('pattern-recall', report);
                        }}
                        onExit={() => handleAdvanceWorkout('pattern-recall')}
                      />
                    )}

                    {/* Game: Odd One Out */}
                    {activeGameId === 'odd-one-out' && (
                      <OddOneOut
                        language={selectedLanguage}
                        totalTrials={5}
                        onSessionComplete={(summary) => {
                          const report = {
                            ...summary,
                            gameId: 'odd-one-out',
                            gameTitle: 'Odd One Out (Omilto Basoni)',
                            totalRounds: summary.totalTrials,
                            totalCorrect: summary.correctTrials,
                            averageLatencyMs: summary.meanDeliberationMs,
                            finalTheta: summary.accuracyPercentage >= 85 ? 1.15 : summary.accuracyPercentage >= 70 ? 0.45 : -0.25,
                            completedAt: new Date().toISOString(),
                          };
                          handleRecordSessionSummary('odd-one-out', report);
                        }}
                        onExit={() => handleAdvanceWorkout('odd-one-out')}
                      />
                    )}

                    {/* Game: Where Am I? */}
                    {activeGameId === 'where-am-i' && (
                      <WhereAmI
                        language={selectedLanguage}
                        totalTrials={5}
                        onSessionComplete={(summary) => {
                          const report = {
                            ...summary,
                            gameId: 'where-am-i',
                            gameTitle: 'Where Am I? (Moi Kot Aso?)',
                            totalRounds: summary.totalTrials,
                            totalCorrect: summary.correctTrials,
                            averageLatencyMs: summary.meanDeliberationMs,
                            finalTheta: summary.accuracyPercentage >= 85 ? 1.15 : summary.accuracyPercentage >= 70 ? 0.45 : -0.25,
                            completedAt: new Date().toISOString(),
                          };
                          handleRecordSessionSummary('where-am-i', report);
                        }}
                        onExit={() => handleAdvanceWorkout('where-am-i')}
                      />
                    )}

                    {/* Game 4: Bihu Taal */}
                    {activeGameId === 'bihu-taal' && (
                      <BihuTaal
                        language={selectedLanguage}
                        totalTrials={10}
                        onSessionComplete={(summary) => {
                          const report = {
                            ...summary,
                            gameId: 'bihu-taal',
                            gameTitle: 'Bihu Taal (Go/No-Go Attention)',
                            totalRounds: summary.totalTrials,
                            totalCorrect: Math.max(0, summary.totalTrials - summary.commissionErrors - summary.omissionErrors),
                            autoAssistedRounds: 0,
                            accuracyPercentage: summary.accuracyPercentage,
                            averageLatencyMs: summary.meanReactionTimeMs,
                            medianLatencyMs: summary.meanReactionTimeMs,
                            perseverationErrors: summary.commissionErrors,
                            finalTheta: summary.accuracyPercentage >= 80 ? 1.0 : 0.2,
                            estimatedMoCAMemoryScore: summary.estimatedMoCAAttentionScore,
                            processingSpeedProfile: summary.processingSpeedProfile,
                            caregiverEndedEarly: false,
                            completedAt: summary.completedAt,
                            rounds: []
                          };
                          handleRecordSessionSummary('bihu-taal', report);
                        }}
                        onExit={() => handleAdvanceWorkout('bihu-taal')}
                      />
                    )}

                    {/* Game 5: Jigsaw Puzzle */}
                    {activeGameId === 'jigsaw-puzzle' && (
                      <JigsawPuzzle
                        language={selectedLanguage}
                        totalPuzzles={3}
                        onSessionComplete={(summary) => {
                          const report = {
                            ...summary,
                            gameId: 'jigsaw-puzzle',
                            gameTitle: 'Jigsaw Puzzle (Visuoconstructional Praxis)',
                            totalRounds: summary.totalPuzzles,
                            totalCorrect: summary.solvedPuzzles,
                            autoAssistedRounds: summary.autoAssistedRounds,
                            accuracyPercentage: summary.accuracyPercentage,
                            averageLatencyMs: summary.meanSolveTimeSeconds * 1000,
                            medianLatencyMs: summary.meanSolveTimeSeconds * 1000,
                            perseverationErrors: summary.totalMisplacements,
                            finalTheta: summary.finalTheta,
                            estimatedMoCAMemoryScore: summary.spatialPraxisScore,
                            processingSpeedProfile: summary.visuomotorProfile,
                            caregiverEndedEarly: summary.caregiverEndedEarly,
                            completedAt: summary.completedAt,
                            rounds: []
                          };
                          handleRecordSessionSummary('jigsaw-puzzle', report);
                        }}
                        onExit={() => handleAdvanceWorkout('jigsaw-puzzle')}
                      />
                    )}

                    {/* Other Catalog Exercises */}
                    {activeGameId !== 'memory-match' &&
                     activeGameId !== 'word-recall' &&
                     activeGameId !== 'smriti-haat' &&
                     activeGameId !== 'sequence-recall' &&
                     activeGameId !== 'bihu-taal' &&
                     activeGameId !== 'jigsaw-puzzle' &&
                     activeGameId !== 'pattern-recall' &&
                     activeGameId !== 'odd-one-out' &&
                     activeGameId !== 'where-am-i' && (
                      <InteractiveCognitiveExercise
                        gameId={activeGameId}
                        language={selectedLanguage}
                        onSessionComplete={(summary) => handleRecordSessionSummary(activeGameId, summary)}
                        onExit={() => handleAdvanceWorkout(activeGameId)}
                      />
                    )}
                  </div>
                ) : (
                  /* Games Hub Main Browser */
                  <div className="space-y-5">
                    {/* Sub-Tabs Pill Navigation */}
                    <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex-wrap">
                      <button
                        onClick={() => setGamesSubTab('TODAY')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                          gamesSubTab === 'TODAY'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <span>🏃 Today's Workout</span>
                      </button>
                      <button
                        onClick={() => setGamesSubTab('LIBRARY')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                          gamesSubTab === 'LIBRARY'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <span>🎮 Game Library</span>
                      </button>
                      <button
                        onClick={() => setGamesSubTab('MY_BRAIN')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                          gamesSubTab === 'MY_BRAIN'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <span>🧠 My Brain Analytics</span>
                      </button>
                      <button
                        onClick={() => setGamesSubTab('CIRCADIAN')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                          gamesSubTab === 'CIRCADIAN'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <span>☀️ Circadian Timing</span>
                      </button>
                    </div>

                    {gamesSubTab === 'TODAY' && (
                      <PatientTodayHome
                        language={selectedLanguage}
                        patient={activePatient}
                        prescription={prescription}
                        currentRole="caretaker"
                        caretakerName={caretaker.name}
                        isWorkoutCompletedToday={isWorkoutCompletedToday}
                        completedGameIds={completedWorkoutGames}
                        onBeginWorkout={handleBeginWorkout}
                        onLaunchGame={(gId) => {
                          setIsWorkoutMode(false);
                          setActiveGameId(gId);
                        }}
                        onOpenPrescriptionModal={() => setIsPrescriptionModalOpen(true)}
                        dayStreak={dayStreak}
                      />
                    )}

                    {gamesSubTab === 'LIBRARY' && (
                      <CognitiveLibrary
                        language={selectedLanguage}
                        onLaunchGame={(gId) => {
                          setIsWorkoutMode(false);
                          setActiveGameId(gId);
                        }}
                      />
                    )}

                    {gamesSubTab === 'MY_BRAIN' && (
                      <MyBrainAnalytics
                        language={selectedLanguage}
                        patient={activePatient}
                        lastSessionReport={lastSessionReport}
                      />
                    )}

                    {gamesSubTab === 'CIRCADIAN' && (
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-xl font-black text-slate-900">
                          Circadian Timing & Sundowning Mitigation
                        </h3>
                        <p className="text-xs text-slate-500">
                          Aligns patient evaluation and gameplay to peak cognitive alertness windows (9:00 AM - 11:30 AM).
                        </p>
                        <TimeEngineDemo />
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: PATIENT PROFILE */}
            {activeNav === 'patient' && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-sky-200 text-sky-800 flex items-center justify-center text-3xl font-black">
                    👵
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{activePatient.name}</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Age: {activePatient.age} · Relationship: {activePatient.relationshipToCaretaker || 'Grandfather'} · Supervising Caregiver: {caretaker.name}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clinical Dementia Staging</span>
                    <p className="text-base font-black text-slate-900 capitalize">
                      {activePatient.diagnosisStage?.replace(/_/g, ' ') || 'Mild Cognitive Impairment'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Standardized MoCA Score Range: <strong>{classification.estimatedMoCARange}</strong>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Emergency Contact</span>
                    <p className="text-base font-black text-slate-900">
                      {activePatient.emergencyContact || '+91 98765 43210'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Attending Physician: <strong>Dr. Priya Mehta (GMCH Neurology)</strong>
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <span className="text-xs font-black text-amber-900 uppercase">Physician Notes & Reminiscence History</span>
                  <p className="text-xs text-amber-900/90 leading-relaxed">
                    {activePatient.notes || 'Patient demonstrates intact procedural and semantic recognition memory when presented with familiar Northeast cultural stimuli (tea gardens, Assamese bazaar items). Motor tremor debouncing active at 400ms.'}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: EXPANDED MEDICATION */}
            {activeNav === 'medication' && (
              <div className="space-y-6">
                <MedicationCard medList={medicationItems} onToggleMed={handleToggleMed} />
              </div>
            )}

            {/* TAB 5: EXPANDED ROUTINE */}
            {activeNav === 'routine' && (
              <div className="space-y-6">
                <RoutineCard routineList={routineList} onToggleRoutine={handleToggleRoutine} />
              </div>
            )}

            {/* TAB 6: ALERTS CENTER */}
            {activeNav === 'alerts' && (
              <div className="space-y-6">
                <AlertsSection alerts={[
                  { id: 1, level: 'warn', title: 'Evening medication pending', detail: 'Memantine HCl has not been confirmed yet.', time: '2 hours ago' },
                  { id: 2, level: 'info', title: 'Observed change in afternoon pattern', detail: `${activePatient.name}'s deliberation was slightly slower during today's workout.`, time: 'Earlier today' },
                  { id: 3, level: 'info', title: 'Daily Workout Adherence Alert', detail: 'Patient completed daily circuit exercises with 100% compliance yesterday.', time: 'Yesterday' }
                ]} />
              </div>
            )}

            {/* TAB 7: SETTINGS */}
            {activeNav === 'settings' && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Platform Settings & Regionalization</h3>
                  <p className="text-xs text-slate-500">Configure language, audio synthesizers, and clinical sync parameters.</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase">Primary Vernacular Interface Language</span>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { code: 'as', label: 'অসমীয়া (Assamese)' },
                      { code: 'bn', label: 'বাংলা (Bengali)' },
                      { code: 'hi', label: 'हिन्दी (Hindi)' },
                      { code: 'en', label: 'English' },
                    ].map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => setSelectedLanguage(lang.code as SupportedLanguage)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          selectedLanguage === lang.code
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Modals */}
      <PrescriptionSetupModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        currentPrescription={prescription}
        onSave={handleSavePrescription}
        language={selectedLanguage}
      />

      <ClinicalSessionReportModal
        isOpen={isClinicalReportModalOpen}
        onClose={() => setIsClinicalReportModalOpen(false)}
        report={lastSessionReport}
        patient={activePatient}
      />

      <WorkoutIntermissionModal
        isOpen={isIntermissionOpen}
        completedGameTitle={
          GAME_CATALOG.find(g => g.id === workoutPlaylist[workoutCurrentIndex])?.title[selectedLanguage] ||
          workoutPlaylist[workoutCurrentIndex]
        }
        completedIndex={workoutCurrentIndex}
        totalExercises={workoutPlaylist.length}
        nextGameTitle={
          workoutCurrentIndex + 1 < workoutPlaylist.length
            ? (GAME_CATALOG.find(g => g.id === workoutPlaylist[workoutCurrentIndex + 1])?.title[selectedLanguage] || workoutPlaylist[workoutCurrentIndex + 1])
            : ''
        }
        nextGameSubtitle={
          workoutCurrentIndex + 1 < workoutPlaylist.length
            ? (GAME_CATALOG.find(g => g.id === workoutPlaylist[workoutCurrentIndex + 1])?.subtitle[selectedLanguage])
            : undefined
        }
        nextGameDomain={
          workoutCurrentIndex + 1 < workoutPlaylist.length
            ? (GAME_CATALOG.find(g => g.id === workoutPlaylist[workoutCurrentIndex + 1])?.domainLabel[selectedLanguage])
            : undefined
        }
        nextGameEstimatedMinutes={
          workoutCurrentIndex + 1 < workoutPlaylist.length
            ? (GAME_CATALOG.find(g => g.id === workoutPlaylist[workoutCurrentIndex + 1])?.estimatedMinutes || 3)
            : 3
        }
        onStartNext={handleStartNextFromIntermission}
        onExitWorkout={handleExitWorkout}
        language={selectedLanguage}
      />

      <WorkoutCompletedCelebrationModal
        isOpen={isWorkoutCelebrationOpen}
        onReturnHome={() => {
          setIsWorkoutCelebrationOpen(false);
          setIsWorkoutMode(false);
          setActiveGameId(null);
        }}
        completedGameIds={completedWorkoutGames}
        sessionSummaries={workoutSessionSummaries}
        language={selectedLanguage}
        dayStreak={dayStreak}
        patientName={activePatient.name}
        onViewReport={() => {
          setIsWorkoutCelebrationOpen(false);
          setIsClinicalReportModalOpen(true);
        }}
      />

      <style>{`
        @media (min-width: 1024px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile { display: none !important; }
        }
        @media (max-width: 1023px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
        @media (max-width: 1200px) {
          .three-col { grid-template-columns: 1fr 1fr !important; }
          .three-col > :last-child { grid-column: 1 / -1; }
        }
        @media (max-width: 700px) {
          .three-col { grid-template-columns: 1fr !important; }
          .three-col > :last-child { grid-column: auto; }
        }
        @media (min-width: 640px) {
          .sm-flex { display: block !important; }
        }
      `}</style>
    </div>
  );
}

export default App;
