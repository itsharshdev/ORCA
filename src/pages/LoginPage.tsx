import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Anchor, 
  ArrowRight, 
  Lock, 
  Mail, 
  ShieldCheck 
} from 'lucide-react';
import { APP_NAME, SIH_PROBLEM_STATEMENT } from '@/lib/constants';
import { ROUTES } from '@/routes';
import { useRole } from '@/hooks/useRole';
import { AVAILABLE_ROLES, ROLE_CONFIGS } from '@/config/roles';
import type { UserRole } from '@/types/contract';

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
    <div className="min-h-screen w-full bg-[#071424] text-[#d7e3fa] flex flex-col justify-between p-4 sm:p-6 md:p-8 relative overflow-hidden select-none">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-15">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-cyan-500/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-cyan-500/10 rounded-full border-dashed" />
      </div>

      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Anchor className="w-5 h-5" />
          </div>
          <div>
            <span className="font-display-decision text-xl font-bold tracking-wider text-white">
              {APP_NAME}
            </span>
            <span className="block text-[10px] text-slate-400 font-telemetry">
              Marine Decision Intelligence
            </span>
          </div>
        </div>

        <div className="text-[11px] font-telemetry px-3 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-400 hidden sm:block">
          {SIH_PROBLEM_STATEMENT}
        </div>
      </header>

      {/* Login Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10 py-6">
        <div className="hud-glass rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl flex flex-col gap-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-xs font-label-caps mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OPERATIONAL WORKSPACE ACCESS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display-decision">
              Sign In to ORCA
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              From Marine Data to Mission-Ready Decisions
            </p>
          </div>

          {/* Role Preview Switcher */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-label-caps text-slate-400">
              <span>SELECT ROLE WORKSPACE</span>
              <span className="text-[10px] text-cyan-400 font-mono">DEV PREVIEW</span>
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
                    className={`p-2 rounded-lg text-left text-xs transition border flex items-center gap-2 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                    <span className="truncate text-[11px]">{conf.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-label-caps text-slate-400 mb-1.5">
                ORGANIZATIONAL EMAIL / VESSEL OPERATOR ID
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="operator@incois.gov.in"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-lg py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-label-caps text-slate-400">
                  SECURITY KEY / PASSWORD
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] text-cyan-400 hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-lg py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors font-mono"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs font-label-caps tracking-wider hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(70,234,237,0.3)] mt-2"
            >
              <span>ENTER {ROLE_CONFIGS[activeRole]?.shortLabel.toUpperCase()} WORKSPACE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Access Policy Footer */}
          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 text-center flex flex-col gap-1">
            <p>
              Need access? Contact your organization administrator.
            </p>
            <p className="text-[10px] text-slate-500">
              Data and safety information are handled according to your organization's access policy.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 z-10">
        <span>© 2026 ORCA Platform • Indian Space Research Organisation (ISRO)</span>
        <span>SIH26176 Track: Software / Marine Decision Intelligence</span>
      </footer>
    </div>
  );
};
