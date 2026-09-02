import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { APP_NAME, APP_FULL_NAME, SIH_PROBLEM_STATEMENT } from '@/lib/constants';
import { ROUTES } from '@/routes';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('operator@incois.gov.in');
  const [password, setPassword] = useState('••••••••••••');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="min-h-screen w-full bg-[#071424] text-[#d7e3fa] flex flex-col justify-between p-4 sm:p-6 md:p-8 relative overflow-hidden select-none">
      {/* Background Decorative Rings / Sonar grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-cyan-500/30 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-cyan-500/20 rounded-full border-dashed" />
      </div>

      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Anchor className="w-5 h-5" />
          </div>
          <span className="font-display-decision text-xl font-bold tracking-wider text-white">
            {APP_NAME}
          </span>
        </div>

        <div className="text-[11px] font-telemetry px-3 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-400">
          {SIH_PROBLEM_STATEMENT}
        </div>
      </header>

      {/* Login Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10 py-6">
        <div className="hud-glass rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl flex flex-col gap-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-xs font-label-caps mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>MARITIME OPERATIONS PORTAL</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Sign In to ORCA
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              {APP_FULL_NAME}
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-label-caps text-slate-400 mb-1.5">
                OPERATIONAL EMAIL / VESSEL ID
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

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <input 
                type="checkbox" 
                id="remember" 
                defaultChecked 
                className="rounded border-slate-800 text-cyan-400 focus:ring-0 bg-slate-950" 
              />
              <label htmlFor="remember" className="cursor-pointer">Keep session active on vessel terminal</label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs font-label-caps tracking-wider hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(70,234,237,0.3)] mt-2"
            >
              <span>SIGN IN TO CONSOLE</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-[10px] text-slate-500 font-label-caps">
                  OR DEMO EVALUATION
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(ROUTES.DASHBOARD)}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-semibold text-xs font-label-caps tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <span>LAUNCH COMMAND CENTER (DEMO)</span>
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-500 leading-normal">
            Prototype authentication for SIH evaluation. All live sessions use encrypted local telemetry and deterministic demo datasets.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 z-10">
        <span>© 2026 ORCA Platform • Indian Space Research Organisation (ISRO)</span>
        <span>SIH26176 Track: Software / Marine Intelligence</span>
      </footer>
    </div>
  );
};
