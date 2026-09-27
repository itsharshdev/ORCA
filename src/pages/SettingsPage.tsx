import React, { useState } from 'react';
import { 
  Settings, 
  Sliders, 
  Globe, 
  HardDrive, 
  Check, 
  UserCheck, 
  ShieldCheck 
} from 'lucide-react';
import { vesselsData } from '@/data';
import { useRole } from '@/hooks/useRole';
import { AVAILABLE_ROLES, ROLE_CONFIGS } from '@/config/roles';

export const SettingsPage: React.FC = () => {
  const { activeRole, setRole } = useRole();
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'mr' | 'ta' | 'te' | 'gu'>('en');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const vessel = vesselsData.profiles[0];

  const languages = [
    { id: 'en', label: 'English (Standard)', native: 'English' },
    { id: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { id: 'mr', label: 'Marathi (Coastal Maharashtra)', native: 'मराठी' },
    { id: 'ta', label: 'Tamil (Tamil Nadu)', native: 'தமிழ்' },
    { id: 'te', label: 'Telugu (Andhra Coast)', native: 'తెలుగు' },
    { id: 'gu', label: 'Gujarati (Gujarat Coast)', native: 'ગુજરાતી' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-label-caps px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              OPERATIONAL CONFIGURATION
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display-decision">
            System, Role &amp; Vessel Settings
          </h1>
          <p className="text-xs text-slate-400">
            Configure active operational workspace, vessel thresholds, and multi-lingual localization.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-label-caps transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(70,234,237,0.3)] self-start sm:self-auto"
        >
          {saved ? <Check className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
          <span>{saved ? 'SAVED TO LOCAL' : 'SAVE CHANGES'}</span>
        </button>
      </div>

      {/* Settings Sections */}
      <div className="flex flex-col gap-5">
        {/* Active Role Workspace Selection */}
        <div className="hud-glass rounded-2xl p-5 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold font-label-caps text-slate-200">
              ACTIVE OPERATIONAL PERSPECTIVE / ROLE
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Select the operational workspace perspective. All roles consume the same underlying ORCA intelligence APIs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mt-1">
            {AVAILABLE_ROLES.map((roleKey) => {
              const rConf = ROLE_CONFIGS[roleKey];
              const Icon = rConf.icon;
              const isSelected = activeRole === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => setRole(roleKey)}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_12px_rgba(70,234,237,0.15)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold">{rConf.shortLabel}</div>
                    <div className="text-[10px] text-slate-400 font-telemetry mt-0.5 leading-tight">
                      {rConf.primaryPerspective}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Language Selection */}
        <div className="hud-glass rounded-2xl p-5 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold font-label-caps text-slate-200">
              LANGUAGE &amp; COASTAL LOCALIZATION
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Select interface language for coastal advisories and speech synthesis audio broadcasts.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-1">
            {languages.map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setSelectedLanguage(lang.id as any)}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedLanguage === lang.id
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_12px_rgba(70,234,237,0.15)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">{lang.label}</div>
                <div className="text-[11px] font-telemetry text-cyan-400 mt-0.5">{lang.native}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Vessel Telemetry & Limits */}
        <div className="hud-glass rounded-2xl p-5 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold font-label-caps text-slate-200">
              VESSEL CRAFT TOLERANCE ({vessel.name})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-telemetry">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-label-caps">CRAFT TYPE</span>
              <span className="text-slate-200 font-semibold">{vessel.vesselType.toUpperCase()} (8.5m LOA)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-label-caps">MAX WAVE SWELL LIMIT</span>
              <span className="text-amber-400 font-semibold">{vessel.maxWaveToleranceMeters} METERS (Significant)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-label-caps">HOME PORT</span>
              <span className="text-cyan-400 font-semibold">{vessel.homePort.name}</span>
            </div>
          </div>
        </div>

        {/* Local Storage & Offline Shell */}
        <div className="hud-glass rounded-2xl p-5 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold font-label-caps text-slate-200">
              OFFLINE CACHE &amp; PWA PERSISTENCE
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Local service worker caching and offline fallback datasets for degraded coastal connectivity.
          </p>
          <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-telemetry gap-2">
            <span>Cache Size: ~632 KB (Service Worker Precache + App Shell)</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              PWA READY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
