import React from 'react';
import { 
  Sun, 
  Gamepad2, 
  LineChart, 
  Stethoscope, 
  Clock, 
  HeartHandshake, 
  Shield, 
  User
} from 'lucide-react';
import type { UserRole, PatientProfile, CaretakerUser } from '../../types/auth';

export type LumosityNavTab = 'TODAY' | 'GAMES' | 'MY_BRAIN' | 'CAREGIVER_PORTAL' | 'CIRCADIAN_TIMING';

interface LumositySidebarProps {
  activeTab: LumosityNavTab;
  onTabChange: (tab: LumosityNavTab) => void;
  currentRole: UserRole;
  onToggleRole: () => void;
  caretaker: CaretakerUser | null;
  activePatient: PatientProfile | null;
  onOpenAuthModal: () => void;
}

export const LumositySidebar: React.FC<LumositySidebarProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  onToggleRole,
  caretaker,
  activePatient,
  onOpenAuthModal,
}) => {
  const navItems = [
    {
      id: 'TODAY' as LumosityNavTab,
      label: 'Today',
      icon: Sun,
      color: 'text-amber-500',
    },
    {
      id: 'GAMES' as LumosityNavTab,
      label: 'Training Games',
      icon: Gamepad2,
      color: 'text-blue-500',
    },
    {
      id: 'MY_BRAIN' as LumosityNavTab,
      label: 'My Brain',
      icon: LineChart,
      color: 'text-emerald-500',
    },
    {
      id: 'CAREGIVER_PORTAL' as LumosityNavTab,
      label: 'Caregiver Portal',
      icon: Stethoscope,
      color: 'text-purple-500',
      badge: 'Protected',
    },
    {
      id: 'CIRCADIAN_TIMING' as LumosityNavTab,
      label: 'Circadian Timing',
      icon: Clock,
      color: 'text-indigo-500',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none hidden lg:flex">
      
      {/* Top Logo Section */}
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-sm font-black text-lg">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Smriti<span className="text-amber-600">NER</span>
                </span>
              </div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded-sm border border-amber-200">
                SIH26003 • MDoNER
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-50/90 text-amber-950 shadow-xs border border-amber-200/80'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Role Switcher */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-3">
        
        {/* Active Role Indicator */}
        <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${
              currentRole === 'caretaker' ? 'bg-purple-600' : 'bg-amber-600'
            }`}>
              {currentRole === 'caretaker' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Active View
              </p>
              <p className="text-xs font-black text-slate-800 truncate max-w-[100px]">
                {currentRole === 'caretaker' ? (caretaker?.name || 'Caretaker') : (activePatient?.name || 'Patient')}
              </p>
            </div>
          </div>

          <button
            onClick={onToggleRole}
            className="text-[11px] font-extrabold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            title="Switch between Patient and Caregiver view"
          >
            Switch
          </button>
        </div>

        {/* Patient Switch / Add Patient Link */}
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
          <span>Patient: {activePatient?.name ? activePatient.name.split(' ')[0] : 'None'}</span>
          <button
            onClick={onOpenAuthModal}
            className="text-amber-700 hover:underline cursor-pointer"
          >
            + Manage
          </button>
        </div>

      </div>

    </aside>
  );
};
