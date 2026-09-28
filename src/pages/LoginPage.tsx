import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  ShieldCheck,
  Compass,
  CheckCircle2,
  Layers,
  Database
} from 'lucide-react';
import { SIH_PROBLEM_STATEMENT } from '@/lib/constants';
import { ROUTES } from '@/routes';
import { useRole } from '@/hooks/useRole';
import { AVAILABLE_ROLES, ROLE_CONFIGS } from '@/config/roles';
import type { UserRole } from '@/types/contract';
import { OrcaLogo } from '@/components/common/OrcaLogo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeRole, setRole } = useRole();
  const [email, setEmail] = useState('operator@incois.gov.in');
  const [password, setPassword] = useState('••••••••••••');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPath = ROLE_CONFIGS[activeRole]?.defaultPath || ROUTES.DASHBOARD;
    navigate(targetPath);
  };

  const handleRoleSelect = (role: UserRole) => {
    setRole(role);
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F9FC] text-[#102B40] flex flex-col justify-between p-4 sm:p-6 md:p-8 relative select-none">
      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between z-10 pb-4 border-b border-[#E2EDF4]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(ROUTES.HOME)}>
          <OrcaLogo size="md" showText={true} />
        </div>

        <div className="text-[11px] px-3 py-1 rounded-xl bg-white border border-[#D8E5EC] text-[#587083] hidden sm:block shadow-2xs font-telemetry">
          {SIH_PROBLEM_STATEMENT}
        </div>
      </header>

      {/* Main Split Body */}
      <main className="w-full max-w-6xl mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Column (5 Cols): ORCA Identity & Mission Principles */}
        <div className="lg:col-span-6 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F4FA] border border-[#CFE6F3] text-[#147FB3] text-xs font-bold font-label-caps self-start shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OPERATIONAL WORKSPACE ACCESS</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#123B5D] tracking-tight font-display-decision">
              From Marine Data to Mission-Ready Decisions.
            </h1>
            <p className="text-xs sm:text-sm text-[#587083] mt-2 leading-relaxed">
              Enter the authoritative marine decision intelligence platform correlating INCOIS oceanography, IMD meteorology, PostGIS deterministic safety models, and craft envelope parameters.
            </p>
          </div>

          {/* Operational Principles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-[#D8E5EC] shadow-2xs flex flex-col gap-1">
              <div className="flex items-center gap-1.5 font-bold text-[#123B5D]">
                <CheckCircle2 className="w-4 h-4 text-[#2E8B57]" />
                <span>Deterministic Safety</span>
              </div>
              <p className="text-[11px] text-[#587083]">
                Hard PostGIS geospatial boundaries &amp; vessel limit constraints.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#D8E5EC] shadow-2xs flex flex-col gap-1">
              <div className="flex items-center gap-1.5 font-bold text-[#123B5D]">
                <Database className="w-4 h-4 text-[#147FB3]" />
                <span>Evidence Traceability</span>
              </div>
              <p className="text-[11px] text-[#587083]">
                Full provenance timestamps across all 5 observation layers.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#D8E5EC] shadow-2xs flex flex-col gap-1">
              <div className="flex items-center gap-1.5 font-bold text-[#123B5D]">
                <Compass className="w-4 h-4 text-[#D99520]" />
                <span>Mission-Aware</span>
              </div>
              <p className="text-[11px] text-[#587083]">
                Customized safe windows tailored to craft hull limits.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#D8E5EC] shadow-2xs flex flex-col gap-1">
              <div className="flex items-center gap-1.5 font-bold text-[#123B5D]">
                <Layers className="w-4 h-4 text-[#123B5D]" />
                <span>Role Perspectives</span>
              </div>
              <p className="text-[11px] text-[#587083]">
                Specialized desks for Fishermen, Coast Guard, Disaster &amp; Fleet.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (6 Cols): Clean Login & Role Workspace Selector */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 border border-[#D8E5EC] shadow-sm flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-[#123B5D] font-display-decision">
                Sign In to Console
              </h2>
              <p className="text-xs text-[#587083] mt-0.5">
                Select your operational role to launch workspace
              </p>
            </div>

            {/* Role Switcher Matrix */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#587083] font-label-caps">
                <span>OPERATIONAL WORKSPACE</span>
                <span className="text-[#147FB3] font-mono">5 ROLES CONFIGURED</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {AVAILABLE_ROLES.map((roleKey) => {
                  const conf = ROLE_CONFIGS[roleKey];
                  const Icon = conf.icon;
                  const isSelected = activeRole === roleKey;
                  return (
                    <button
                      type="button"
                      key={roleKey}
                      onClick={() => handleRoleSelect(roleKey)}
                      className={`p-2.5 rounded-xl text-left text-xs transition border flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-[#E8F4FA] border-[#147FB3] text-[#123B5D] font-bold shadow-2xs ring-1 ring-[#147FB3]'
                          : 'bg-[#F5F9FC] border-[#D8E5EC] text-[#587083] hover:text-[#123B5D] hover:bg-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#147FB3]' : 'text-[#587083]'}`} />
                      <span className="truncate text-[11px]">{conf.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-3.5 pt-1">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#587083] font-label-caps mb-1">
                  OPERATOR ID / EMAIL
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="operator@incois.gov.in"
                    className="w-full bg-[#F5F9FC] border border-[#CBD5E1] focus:border-[#147FB3] focus:bg-white rounded-xl py-2.5 pl-9 pr-3 text-xs text-[#123B5D] placeholder:text-[#94A3B8] focus:outline-none transition-colors font-medium"
                  />
                  <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#587083] font-label-caps">
                    CREDENTIAL KEY
                  </label>
                  <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] text-[#147FB3] hover:underline font-medium">
                    Reset
                  </a>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-[#F5F9FC] border border-[#CBD5E1] focus:border-[#147FB3] focus:bg-white rounded-xl py-2.5 pl-9 pr-3 text-xs text-[#123B5D] placeholder:text-[#94A3B8] focus:outline-none transition-colors font-mono"
                  />
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#147FB3] text-white font-bold text-xs font-label-caps tracking-wider hover:bg-[#106A96] transition-colors flex items-center justify-center gap-2 shadow-xs mt-1 cursor-pointer"
              >
                <span>ENTER {ROLE_CONFIGS[activeRole]?.shortLabel.toUpperCase()} WORKSPACE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Access Policy Footer */}
            <div className="pt-3 border-t border-[#EDF5F8] text-[11px] text-[#587083] text-center flex flex-col gap-0.5">
              <p>Official Institutional Access • MoES / INCOIS Prototype</p>
              <p className="text-[10px] text-[#7E93A3]">Protected by deterministic role access control</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#7E93A3] z-10 pt-4 border-t border-[#E2EDF4]">
        <span>© 2026 ORCA Marine Decision Intelligence Platform</span>
        <span>SIH 2026 Prototype • Software Track</span>
      </footer>
    </div>
  );
};


