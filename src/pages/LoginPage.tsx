import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  ShieldCheck 
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
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(ROUTES.HOME)}>
          <OrcaLogo size="md" showText={true} />
        </div>

        <div className="text-[11px] px-3 py-1 rounded-lg bg-white border border-[#D8E5EC] text-[#5A7C99] hidden sm:block shadow-xs">
          {SIH_PROBLEM_STATEMENT}
        </div>
      </header>

      {/* Login Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10 py-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D8E5EC] shadow-sm flex flex-col gap-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5FA] border border-[#BCE1F2] text-[#147FB3] text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OPERATIONAL WORKSPACE ACCESS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#123B5D] tracking-tight">
              Sign In to ORCA
            </h1>
            <p className="text-xs text-[#5A7C99] mt-1 font-sans">
              From Marine Data to Mission-Ready Decisions
            </p>
          </div>

          {/* Role Preview Switcher */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#5A7C99]">
              <span>SELECT ROLE WORKSPACE</span>
              <span className="text-[10px] text-[#147FB3] font-mono">DEV PREVIEW</span>
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
                    className={`p-2 rounded-xl text-left text-xs transition border flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#EAF5FA] border-[#147FB3] text-[#123B5D] font-bold shadow-xs'
                        : 'bg-[#F9FCFE] border-[#D8E5EC] text-[#5A7C99] hover:text-[#123B5D] hover:bg-[#F0F7FB]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 text-[#147FB3]" />
                    <span className="truncate text-[11px]">{conf.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A7C99] mb-1.5">
                ORGANIZATIONAL EMAIL / OPERATOR ID
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="operator@incois.gov.in"
                  className="w-full bg-[#F9FCFE] border border-[#D8E5EC] focus:border-[#147FB3] rounded-xl py-2.5 pl-9 pr-3 text-xs text-[#123B5D] placeholder:text-[#88A4BC] focus:outline-none transition-colors"
                />
                <Mail className="w-4 h-4 text-[#88A4BC] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#5A7C99]">
                  SECURITY KEY / PASSWORD
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] text-[#147FB3] hover:underline">
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
                  className="w-full bg-[#F9FCFE] border border-[#D8E5EC] focus:border-[#147FB3] rounded-xl py-2.5 pl-9 pr-3 text-xs text-[#123B5D] placeholder:text-[#88A4BC] focus:outline-none transition-colors font-mono"
                />
                <Lock className="w-4 h-4 text-[#88A4BC] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#147FB3] text-white font-bold text-xs tracking-wider hover:bg-[#106A96] transition-colors flex items-center justify-center gap-2 shadow-sm mt-2 cursor-pointer"
            >
              <span>ENTER {ROLE_CONFIGS[activeRole]?.shortLabel.toUpperCase()} WORKSPACE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Access Policy Footer */}
          <div className="pt-3 border-t border-[#E2EDF4] text-[11px] text-[#5A7C99] text-center flex flex-col gap-1">
            <p>
              Need access? Contact your organization administrator.
            </p>
            <p className="text-[10px] text-[#88A4BC]">
              Data and safety information are handled according to official institutional access policy.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#88A4BC] z-10">
        <span>© 2026 ORCA Platform • Indian National Marine Decision Intelligence</span>
        <span>SIH26176 Track: Software / Marine Decision Intelligence</span>
      </footer>
    </div>
  );
};

