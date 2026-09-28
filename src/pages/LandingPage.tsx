import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Fish, 
  Waves,
  Compass,
  Sliders,
  WifiOff,
  Ship,
  Eye
} from 'lucide-react';
import { ROUTES } from '@/routes';
import { OrcaLogo } from '@/components/common/OrcaLogo';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F9FC] text-[#102B40] flex flex-col justify-between selection:bg-[#E8F4FA] select-none">
      {/* Top Landing Navbar */}
      <header className="h-16 border-b border-[#D8E5EC] bg-white px-4 sm:px-8 flex items-center justify-between shadow-xs sticky top-0 z-40">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate(ROUTES.HOME)}>
          <OrcaLogo size="md" showText={true} />
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.ABOUT}
            className="text-xs font-semibold text-[#587083] hover:text-[#123B5D] px-2 py-1 transition hidden sm:inline"
          >
            About System
          </Link>
          <Link
            to={ROUTES.CONTACT}
            className="text-xs font-semibold text-[#587083] hover:text-[#123B5D] px-2 py-1 transition hidden sm:inline"
          >
            Institutional Contact
          </Link>
          <Link
            to={ROUTES.LOGIN}
            className="px-4 py-2 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white font-bold text-xs font-label-caps tracking-wider transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>ENTER ORCA</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16 text-center max-w-5xl mx-auto w-full">
        {/* Brand Tag Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F4FA] border border-[#CFE6F3] text-[#147FB3] text-xs font-bold font-label-caps mb-4 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#147FB3]" />
          <span>MARINE DECISION INTELLIGENCE</span>
        </div>

        {/* North Star Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#123B5D] tracking-tight leading-tight mb-4 font-display-decision">
          From Marine Data to Mission-Ready Decisions.
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[#587083] max-w-3xl mx-auto leading-relaxed mb-8 font-medium">
          ORCA correlates ocean, weather, fisheries, geospatial and vessel context into explainable operational decisions for coastal fishermen and maritime authorities.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md">
          <button
            type="button"
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white font-bold text-xs font-label-caps tracking-wider transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <span>ENTER ORCA CONSOLE</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => navigate(ROUTES.ASK)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-[#CBD5E1] hover:border-[#147FB3] text-[#123B5D] font-bold text-xs font-label-caps tracking-wider transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#147FB3]" />
            <span>ASK ORCA INTELLIGENCE</span>
          </button>
        </div>

        {/* Restrained Marine Decision Visualization Component */}
        <div className="w-full max-w-4xl mt-10 p-5 rounded-2xl bg-white border border-[#D8E5EC] shadow-xs flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDF5F8]">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#147FB3]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
                Operational Decision Corridor • Maharashtra Sector (Alibaug / Mumbai)
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold font-label-caps bg-amber-50 text-amber-800 border border-amber-300">
              VERDICT: CAUTION (MIDDAY RETURN)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            {/* Vessel Context */}
            <div className="p-3 rounded-xl bg-[#F5F9FC] border border-[#E2EDF4] flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#587083] font-label-caps flex items-center gap-1">
                <Ship className="w-3.5 h-3.5 text-[#147FB3]" />
                TARGET CRAFT
              </span>
              <strong className="text-[#123B5D]">Matsya Sagar 1</strong>
              <span className="text-[11px] text-[#587083]">8.5m • 1.8m Max Wave</span>
            </div>

            {/* Ocean State */}
            <div className="p-3 rounded-xl bg-[#F5F9FC] border border-[#E2EDF4] flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#587083] font-label-caps flex items-center gap-1">
                <Waves className="w-3.5 h-3.5 text-[#147FB3]" />
                INCOIS OSF SWELL
              </span>
              <strong className="text-[#123B5D]">1.4m Morning &rarr; 2.1m Midday</strong>
              <span className="text-[11px] text-[#D99520] font-semibold">Wave envelope constraint</span>
            </div>

            {/* PFZ Opportunity */}
            <div className="p-3 rounded-xl bg-[#F5F9FC] border border-[#E2EDF4] flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#587083] font-label-caps flex items-center gap-1">
                <Fish className="w-3.5 h-3.5 text-[#2E9B73]" />
                PFZ OPPORTUNITY
              </span>
              <strong className="text-[#123B5D]">Zone Alpha (18.5 km)</strong>
              <span className="text-[11px] text-[#2E9B73] font-semibold">High Pelagic Front (Non-clearance)</span>
            </div>

            {/* Geofence Safety */}
            <div className="p-3 rounded-xl bg-[#F5F9FC] border border-[#E2EDF4] flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#587083] font-label-caps flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#147FB3]" />
                POSTGIS GEOFENCE
              </span>
              <strong className="text-[#123B5D]">4.2 km Buffer Clearance</strong>
              <span className="text-[11px] text-[#2E9B73] font-semibold">Naval boundary verified safe</span>
            </div>
          </div>
        </div>

        {/* 3-Step Process: OBSERVE -> CORRELATE -> DECIDE */}
        <div className="w-full mt-12 pt-8 border-t border-[#E2EDF4] flex flex-col items-center gap-6">
          <div className="text-xs font-bold uppercase tracking-wider text-[#587083] font-label-caps">
            The ORCA Decision Pipeline
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
            <div className="p-5 rounded-2xl bg-white border border-[#D8E5EC] shadow-xs flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#E8F4FA] text-[#147FB3] flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <span className="font-bold text-sm text-[#123B5D] uppercase tracking-wider font-label-caps">
                  OBSERVE
                </span>
              </div>
              <p className="text-xs text-[#587083] leading-relaxed">
                Ingests official multi-agency data: INCOIS ocean state forecasts, satellite PFZ WFS layers, IMD marine bulletins, and GIS restricted boundaries.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#D8E5EC] shadow-xs flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#E8F4FA] text-[#147FB3] flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <span className="font-bold text-sm text-[#123B5D] uppercase tracking-wider font-label-caps">
                  CORRELATE
                </span>
              </div>
              <p className="text-xs text-[#587083] leading-relaxed">
                Multi-agent specialists synthesize environmental parameters against deterministic vessel seaworthiness limits and spatial exclusion polygons.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#D8E5EC] shadow-xs flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#E8F4FA] text-[#147FB3] flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <span className="font-bold text-sm text-[#123B5D] uppercase tracking-wider font-label-caps">
                  DECIDE
                </span>
              </div>
              <p className="text-xs text-[#587083] leading-relaxed">
                Delivers an unambiguous GO / CAUTION / AVOID verdict with plain-language action plans, safe departure windows, and complete audit evidence.
              </p>
            </div>
          </div>
        </div>

        {/* 5 Core Product Capabilities */}
        <div className="w-full mt-10 flex flex-col items-center gap-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#587083] font-label-caps">
            Core System Capabilities
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 w-full text-left">
            <div className="p-3.5 rounded-xl bg-white border border-[#D8E5EC] shadow-2xs flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#147FB3] font-bold text-xs">
                <Compass className="w-4 h-4" />
                <span>Mission-Aware</span>
              </div>
              <p className="text-[11px] text-[#587083] leading-tight">
                Evaluates route timing, duration, and specific craft hull envelope.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#D8E5EC] shadow-2xs flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#2E9B73] font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Deterministic</span>
              </div>
              <p className="text-[11px] text-[#587083] leading-tight">
                PostGIS spatial geofence models &amp; hard safety constraints.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#D8E5EC] shadow-2xs flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#123B5D] font-bold text-xs">
                <Eye className="w-4 h-4" />
                <span>Evidence Trace</span>
              </div>
              <p className="text-[11px] text-[#587083] leading-tight">
                Full multi-agency provenance with verified observation timestamps.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#D8E5EC] shadow-2xs flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#D99520] font-bold text-xs">
                <Sliders className="w-4 h-4" />
                <span>What-If Scenarios</span>
              </div>
              <p className="text-[11px] text-[#587083] leading-tight">
                Test hypothetical departure delays, duration changes, or wave surges.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#D8E5EC] shadow-2xs flex flex-col gap-1 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-[#6F7F8F] font-bold text-xs">
                <WifiOff className="w-4 h-4" />
                <span>Offline Resilient</span>
              </div>
              <p className="text-[11px] text-[#587083] leading-tight">
                Operates gracefully on cached telemetry when at sea without cell signal.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-[#D8E5EC] bg-white text-center text-xs text-[#587083] flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-8">
        <div>
          &copy; 2026 ORCA Marine Decision Intelligence • SIH 2026 Prototype
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-[#147FB3]">
          <Link to={ROUTES.DASHBOARD} className="hover:underline">Fisherman</Link>
          <Link to={ROUTES.AUTHORITY} className="hover:underline">Authority</Link>
          <Link to={ROUTES.DISASTER} className="hover:underline">Disaster</Link>
          <Link to={ROUTES.RESEARCH} className="hover:underline">Research</Link>
          <Link to={ROUTES.OPERATOR} className="hover:underline">Operator</Link>
        </div>
      </footer>
    </div>
  );
};


