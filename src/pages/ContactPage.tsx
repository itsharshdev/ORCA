import React from 'react';
import { Link } from 'react-router-dom';
import { Anchor, Mail, MapPin } from 'lucide-react';
import { ROUTES } from '@/routes';

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F9FC] text-[#102B40] flex flex-col justify-between">
      <header className="h-16 border-b border-[#D8E5EC] bg-white px-4 sm:px-8 flex items-center justify-between shadow-xs sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E8F4FA] border border-[#CFE6F3] flex items-center justify-center text-[#147FB3]">
              <Anchor className="w-4 h-4" />
            </div>
            <span className="font-display-decision font-black text-lg tracking-tight text-[#123B5D]">
              ORCA
            </span>
          </Link>
        </div>

        <Link
          to={ROUTES.DASHBOARD}
          className="px-4 py-2 rounded-xl bg-[#147FB3] hover:bg-[#0284C7] text-white font-bold text-xs font-label-caps tracking-wider transition"
        >
          OPEN CONSOLE
        </Link>
      </header>

      <main className="max-w-3xl mx-auto p-6 sm:p-12 flex flex-col gap-6">
        <div>
          <span className="text-xs font-bold font-label-caps text-[#147FB3]">INSTITUTIONAL LIAISON</span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#123B5D] tracking-tight mt-1">
            Contact &amp; Governance
          </h1>
          <p className="text-sm text-[#587083] mt-2">
            Technical and institutional inquiries regarding the ORCA system deployment and API integrations.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#D8E5EC] shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[#147FB3] shrink-0" />
            <div>
              <div className="text-xs text-[#587083] font-bold uppercase font-label-caps">Nodal Agency</div>
              <div className="text-sm font-semibold text-[#123B5D]">Indian National Centre for Ocean Information Services (INCOIS) / MoES</div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-[#EDF5F8]">
            <Mail className="w-5 h-5 text-[#147FB3] shrink-0" />
            <div>
              <div className="text-xs text-[#587083] font-bold uppercase font-label-caps">Engineering Team Contact</div>
              <div className="text-sm font-semibold text-[#123B5D]">orca.support@incois.gov.in</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-6 border-t border-[#D8E5EC] bg-white text-center text-xs text-[#587083]">
        &copy; 2026 ORCA Marine Decision Intelligence System
      </footer>
    </div>
  );
};
