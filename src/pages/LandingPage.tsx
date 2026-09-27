import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Anchor, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Fish, 
  Waves,
  CloudLightning,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { ROUTES } from '@/routes';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F9FC] text-[#102B40] flex flex-col justify-between selection:bg-[#E8F4FA]">
      {/* Top Landing Navbar */}
      <header className="h-16 border-b border-[#D8E5EC] bg-white px-4 sm:px-8 flex items-center justify-between shadow-xs sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E8F4FA] border border-[#CFE6F3] flex items-center justify-center text-[#147FB3] shadow-xs">
            <Anchor className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-display-decision font-black text-lg tracking-tight text-[#123B5D]">
              ORCA
            </span>
            <span className="text-[9px] font-semibold text-[#5A7C99] uppercase tracking-wider">
              Smart India Hackathon 2026 • PS26176
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.ABOUT}
            className="text-xs font-semibold text-[#5A7C99] hover:text-[#123B5D] px-2 py-1 transition hidden sm:inline"
          >
            About System
          </Link>
          <Link
            to={ROUTES.CONTACT}
            className="text-xs font-semibold text-[#5A7C99] hover:text-[#123B5D] px-2 py-1 transition hidden sm:inline"
          >
            Institutional Contact
          </Link>
          <Link
            to={ROUTES.LOGIN}
            className="px-4 py-2 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white font-bold text-xs tracking-wider transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>LAUNCH CONSOLE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF5FA] border border-[#BCE1F2] text-[#147FB3] text-xs font-semibold mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MARINE DECISION INTELLIGENCE PLATFORM</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#123B5D] tracking-tight leading-tight mb-4">
          From Marine Data to Mission-Ready Decisions.
        </h1>

        <p className="text-sm sm:text-base text-[#5A7C99] max-w-3xl mx-auto leading-relaxed mb-8">
          Fishermen and coastal authorities receive disconnected weather bulletins, satellite PFZ charts, and safety rules. 
          ORCA correlates official oceanography, meteorological warnings, geospatial restrictions, and vessel craft limits to produce clear, actionable, explainable decisions.
        </p>

        {/* Primary Call to Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md">
          <button
            type="button"
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white font-bold text-sm tracking-wider transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span>ENTER FISHERMAN HOME</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => navigate(ROUTES.ASK)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-[#D8E5EC] hover:border-[#147FB3] text-[#123B5D] font-bold text-sm tracking-wider transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#147FB3]" />
            <span>ASK ORCA</span>
          </button>
        </div>

        {/* 5 Input Layers to Decision Flow */}
        <div className="w-full mt-14 pt-8 border-t border-[#E2EDF4] flex flex-col items-center gap-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5A7C99]">
            How ORCA Synthesizes Marine Reality
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 w-full text-left">
            <div className="p-3.5 rounded-xl bg-white border border-[#D8E5EC] shadow-xs flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#147FB3] font-bold text-xs">
                <Waves className="w-4 h-4" />
                <span>1. Ocean</span>
              </div>
              <p className="text-[11px] text-[#5A7C99] leading-tight">
                INCOIS OSF wave swell, surface current, sea surface temperature.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#D8E5EC] shadow-xs flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#D99520] font-bold text-xs">
                <CloudLightning className="w-4 h-4" />
                <span>2. Weather</span>
              </div>
              <p className="text-[11px] text-[#5A7C99] leading-tight">
                IMD coastal weather bulletins, squall warnings, cyclone alerts.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#D8E5EC] shadow-xs flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#2E8B57] font-bold text-xs">
                <Fish className="w-4 h-4" />
                <span>3. Opportunity</span>
              </div>
              <p className="text-[11px] text-[#5A7C99] leading-tight">
                INCOIS PFZ GeoServer WFS thermal/chlorophyll front lines.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#D8E5EC] shadow-xs flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#D65B5B] font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>4. Constraints</span>
              </div>
              <p className="text-[11px] text-[#5A7C99] leading-tight">
                PostGIS spatial geofences, naval zones, marine protected areas.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#D8E5EC] shadow-xs flex flex-col gap-1 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-[#123B5D] font-bold text-xs">
                <MapPin className="w-4 h-4" />
                <span>5. Mission</span>
              </div>
              <p className="text-[11px] text-[#5A7C99] leading-tight">
                Vessel hull limits, cruising range, departure timing.
              </p>
            </div>
          </div>

          {/* Synthesis Arrow Output Card */}
          <div className="w-full p-4 rounded-2xl bg-[#EAF5FA] border border-[#BCE1F2] flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-[#147FB3] flex items-center justify-center shadow-xs shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#2E8B57]" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-[#123B5D]">
                  ORCA Multi-Agent Correlation &amp; Constraint Evaluation
                </div>
                <div className="text-[11px] text-[#5A7C99]">
                  Delivers a deterministic GO / CAUTION / AVOID verdict with full provenance and explainable rationale.
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(ROUTES.DASHBOARD)}
              className="px-4 py-2 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white text-xs font-bold whitespace-nowrap transition cursor-pointer"
            >
              Explore Live Demo &rarr;
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-[#D8E5EC] bg-white text-center text-xs text-[#5A7C99] flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-8">
        <div>
          &copy; 2026 ORCA Marine Decision Intelligence • Ministry of Earth Sciences / INCOIS Prototype
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

