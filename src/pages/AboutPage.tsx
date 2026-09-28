import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Database } from 'lucide-react';
import { ROUTES } from '@/routes';
import { OrcaLogo } from '@/components/common/OrcaLogo';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F9FC] text-[#102B40] flex flex-col justify-between">
      <header className="h-16 border-b border-[#D8E5EC] bg-white px-4 sm:px-8 flex items-center justify-between shadow-xs sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5">
            <OrcaLogo size="md" showText={true} />
          </Link>
        </div>

        <Link
          to={ROUTES.DASHBOARD}
          className="px-4 py-2 rounded-xl bg-[#147FB3] hover:bg-[#0284C7] text-white font-bold text-xs font-label-caps tracking-wider transition"
        >
          OPEN CONSOLE
        </Link>
      </header>

      <main className="max-w-4xl mx-auto p-6 sm:p-12 flex flex-col gap-8">
        <div>
          <span className="text-xs font-bold font-label-caps text-[#147FB3]">SMART INDIA HACKATHON 2026 • PROBLEM PS26176</span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#123B5D] tracking-tight mt-1">
            About ORCA Architecture &amp; Methodology
          </h1>
          <p className="text-sm text-[#587083] mt-2 leading-relaxed">
            Marine EcOsystem Reasoning with Collaborative Agents (ORCA) is a specialized marine decision intelligence system engineered for coastal fishers, maritime authorities, and disaster response teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#D8E5EC] shadow-xs flex flex-col gap-2">
            <h3 className="font-bold text-base text-[#123B5D] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#147FB3]" />
              Official Data Provenance
            </h3>
            <p className="text-xs text-[#587083] leading-relaxed">
              Integrates official INCOIS GeoServer WFS endpoints (`PFZ_Automation:pfzlines`), ERDDAP hydrodynamic wave state forecasts, and PostGIS geographical databases.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#D8E5EC] shadow-xs flex flex-col gap-2">
            <h3 className="font-bold text-base text-[#123B5D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2E9B73]" />
              Deterministic Safety Engine
            </h3>
            <p className="text-xs text-[#587083] leading-relaxed">
              Enforces strict precedence: Potential Fishing Zone (PFZ) is strictly an opportunity signal; it NEVER overrides spatial boundaries, restricted naval zones, or severe squall alerts.
            </p>
          </div>
        </div>
      </main>

      <footer className="p-6 border-t border-[#D8E5EC] bg-white text-center text-xs text-[#587083]">
        &copy; 2026 ORCA Marine Decision Intelligence System
      </footer>
    </div>
  );
};
