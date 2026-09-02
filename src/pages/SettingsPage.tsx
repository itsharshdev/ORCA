import React, { useState } from 'react';
import { Settings, Sliders, Globe, HardDrive, Check } from 'lucide-react';
import { vesselsData } from '@/data';

export const SettingsPage: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const vessel = vesselsData.profiles[0];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-label-caps px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              OPERATIONAL CONFIGURATION
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            System & Vessel Settings
          </h1>
          <p className="text-xs text-slate-400">
            Configure vessel limits, language preferences, and connectivity thresholds.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-label-caps transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(70,234,237,0.3)]"
        >
          {saved ? <Check className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
          <span>{saved ? 'SAVED TO LOCAL' : 'SAVE CHANGES'}</span>
        </button>
      </div>

      {/* Settings Sections */}
      <div className="flex flex-col gap-5">
        {/* Language Selection */}
        <div className="hud-glass rounded-xl p-5 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold font-label-caps text-slate-200">
              LANGUAGE & SPEECH LOCALIZATION
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Select interface language and text-to-speech audio synthesis dialect.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-1">
            {[
              { id: 'en', label: 'English (Default)', native: 'English' },
              { id: 'hi', label: 'Hindi', native: 'हिन्दी' },
              { id: 'mr', label: 'Marathi (Coastal)', native: 'मराठी' },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setSelectedLanguage(lang.id as any)}
                className={`p-3 rounded-xl border text-left transition-all ${
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
        <div className="hud-glass rounded-xl p-5 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold font-label-caps text-slate-200">
              PRIMARY ASSET SPECS ({vessel.name})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-telemetry">
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-label-caps">VESSEL TYPE</span>
              <span className="text-slate-200 font-semibold">{vessel.vesselType.toUpperCase()}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-label-caps">MAX WAVE SWELL TOLERANCE</span>
              <span className="text-amber-400 font-semibold">{vessel.maxWaveToleranceMeters} METERS</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-label-caps">HOME HARBOR</span>
              <span className="text-cyan-400 font-semibold">{vessel.homePort.name}</span>
            </div>
          </div>
        </div>

        {/* Local Storage & Offline Shell */}
        <div className="hud-glass rounded-xl p-5 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold font-label-caps text-slate-200">
              OFFLINE CACHE & PWA STORAGE
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Current offline app shell and local deterministic datasets stored in browser localStorage.
          </p>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-telemetry">
            <span>Cache Size: ~218 KB (6 Datasets + App Shell)</span>
            <span className="text-emerald-400 font-semibold">PRE-CACHED READY</span>
          </div>
        </div>
      </div>
    </div>
  );
};
