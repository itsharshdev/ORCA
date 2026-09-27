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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2EDF4]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF5FA] text-[#147FB3] border border-[#BCE1F2] tracking-wider uppercase">
              OPERATIONAL CONFIGURATION
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#123B5D] tracking-tight">
            System, Role &amp; Vessel Settings
          </h1>
          <p className="text-xs text-[#5A7C99]">
            Configure active operational workspace, vessel thresholds, and multi-lingual localization.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          {saved ? <Check className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
          <span>{saved ? 'SAVED TO LOCAL' : 'SAVE CHANGES'}</span>
        </button>
      </div>

      {/* Settings Sections */}
      <div className="flex flex-col gap-5">
        {/* Active Role Workspace Selection */}
        <div className="bg-white rounded-2xl p-5 border border-[#D8E5EC] shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#147FB3]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
              ACTIVE OPERATIONAL PERSPECTIVE / ROLE
            </h2>
          </div>
          <p className="text-xs text-[#5A7C99]">
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
                      ? 'bg-[#EAF5FA] border-[#147FB3] text-[#123B5D] shadow-sm font-semibold'
                      : 'bg-[#F9FCFE] border-[#D8E5EC] text-[#5A7C99] hover:border-[#147FB3]/50 hover:bg-[#F0F7FB]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#147FB3] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-[#123B5D]">{rConf.shortLabel}</div>
                    <div className="text-[10px] text-[#5A7C99] mt-0.5 leading-tight">
                      {rConf.primaryPerspective}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-white rounded-2xl p-5 border border-[#D8E5EC] shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#147FB3]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
              LANGUAGE &amp; COASTAL LOCALIZATION
            </h2>
          </div>
          <p className="text-xs text-[#5A7C99]">
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
                    ? 'bg-[#EAF5FA] border-[#147FB3] text-[#123B5D] font-bold shadow-sm'
                    : 'bg-[#F9FCFE] border-[#D8E5EC] text-[#5A7C99] hover:border-[#147FB3]/50 hover:bg-[#F0F7FB]'
                }`}
              >
                <div className="text-xs font-bold text-[#123B5D]">{lang.label}</div>
                <div className="text-[11px] font-mono text-[#147FB3] mt-0.5">{lang.native}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Vessel Telemetry & Limits */}
        <div className="bg-white rounded-2xl p-5 border border-[#D8E5EC] shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#147FB3]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
              VESSEL CRAFT TOLERANCE ({vessel.name})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC]">
              <span className="text-[#5A7C99] block text-[10px] uppercase font-bold tracking-wider">CRAFT TYPE</span>
              <span className="text-[#123B5D] font-semibold">{vessel.vesselType.toUpperCase()} (8.5m LOA)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC]">
              <span className="text-[#5A7C99] block text-[10px] uppercase font-bold tracking-wider">MAX WAVE SWELL LIMIT</span>
              <span className="text-[#D99520] font-semibold">{vessel.maxWaveToleranceMeters} METERS (Significant)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC]">
              <span className="text-[#5A7C99] block text-[10px] uppercase font-bold tracking-wider">HOME PORT</span>
              <span className="text-[#147FB3] font-semibold">{vessel.homePort.name}</span>
            </div>
          </div>
        </div>

        {/* Local Storage & Offline Shell */}
        <div className="bg-white rounded-2xl p-5 border border-[#D8E5EC] shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#147FB3]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
              OFFLINE CACHE &amp; PWA PERSISTENCE
            </h2>
          </div>
          <p className="text-xs text-[#5A7C99]">
            Local service worker caching and offline fallback datasets for degraded coastal connectivity.
          </p>
          <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] text-xs gap-2">
            <span className="text-[#5A7C99]">Cache Size: ~632 KB (Service Worker Precache + App Shell)</span>
            <span className="text-[#2E8B57] font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              PWA READY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
