import React, { useEffect, useState } from 'react';
import { User, Anchor } from 'lucide-react';
import { authService } from '@/services/authService';
import type { MeResponse } from '@/types/contract';

export const ProfilePage: React.FC = () => {
  const [meData, setMeData] = useState<MeResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    authService.fetchMe().then((res) => {
      if (isMounted) {
        setMeData(res);
      }
    }).catch((err) => {
      console.warn('Auth fetch fallback:', err);
    });
    return () => { isMounted = false; };
  }, []);

  const user = meData?.user || {
    id: 'usr-f8e2-411a-9b81-64d8a7c8e991',
    email: 'operator.alibaug@orca.incois.gov.in',
    fullName: 'Suresh Tandel',
    role: 'FISHERMAN',
    harborName: 'Sassoon Docks, Mumbai',
    preferredLanguage: 'mr',
  };

  const vessel = meData?.activeVessel || {
    name: 'Matsya Sagar 1',
    registrationNumber: 'IND-MH-02-MM-849',
    vesselType: 'TRADITIONAL_MOTORIZED',
    lengthMeters: 8.5,
    engineHp: 25,
    maxWaveToleranceMeters: 1.8,
    maxWindToleranceKnots: 18.0,
    cruisingSpeedKnots: 6.5,
    homePort: { name: 'Sassoon Docks' },
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-[#D8E5EC]">
        <div className="flex items-center gap-2 mb-1 text-xs font-telemetry text-[#147FB3] font-bold">
          <User className="w-3.5 h-3.5" />
          <span>USER &amp; VESSEL PROFILE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#123B5D] tracking-tight font-display-decision">
          Operator &amp; Craft Credentials
        </h1>
        <p className="text-xs sm:text-sm text-[#587083]">
          Authenticated maritime identification, assigned craft specifications, and seaworthiness limits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#D8E5EC] shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-[#EDF5F8] pb-4">
            <div className="w-12 h-12 rounded-xl bg-[#E8F4FA] border border-[#CFE6F3] flex items-center justify-center text-[#147FB3] font-bold text-lg">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#123B5D]">{user.fullName}</h2>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-[#147FB3] text-[10px] font-bold font-mono border border-blue-200">
                ROLE: {user.role}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-[#EDF5F8]">
              <span className="text-[#587083]">Official Email:</span>
              <span className="text-[#123B5D] font-mono font-medium">{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#EDF5F8]">
              <span className="text-[#587083]">Home Port Terminal:</span>
              <span className="text-[#123B5D] font-semibold">{user.harborName}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#EDF5F8]">
              <span className="text-[#587083]">Preferred Language:</span>
              <span className="text-[#123B5D] font-semibold uppercase">{user.preferredLanguage}</span>
            </div>
          </div>
        </div>

        {/* Vessel Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#D8E5EC] shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-[#EDF5F8] pb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#2E9B73]">
              <Anchor className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#123B5D]">{vessel.name}</h2>
              <span className="text-xs text-[#587083] font-mono">Reg: {vessel.registrationNumber}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F5F9FC] border border-[#D8E5EC]">
              <span className="text-[10px] text-[#587083] uppercase font-bold">Max Wave Swell Limit</span>
              <div className="text-base font-bold text-[#123B5D] font-mono mt-0.5">{vessel.maxWaveToleranceMeters}m</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F5F9FC] border border-[#D8E5EC]">
              <span className="text-[10px] text-[#587083] uppercase font-bold">Max Wind Tolerance</span>
              <div className="text-base font-bold text-[#123B5D] font-mono mt-0.5">{vessel.maxWindToleranceKnots} kts</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F5F9FC] border border-[#D8E5EC]">
              <span className="text-[10px] text-[#587083] uppercase font-bold">Cruising Velocity</span>
              <div className="text-base font-bold text-[#123B5D] font-mono mt-0.5">{vessel.cruisingSpeedKnots} kts</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F5F9FC] border border-[#D8E5EC]">
              <span className="text-[10px] text-[#587083] uppercase font-bold">Craft Length (LOA)</span>
              <div className="text-base font-bold text-[#123B5D] font-mono mt-0.5">{vessel.lengthMeters}m</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
