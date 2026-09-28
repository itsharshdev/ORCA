import React, { useEffect, useState } from 'react';

interface OrcaBootSplashProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export const OrcaBootSplash: React.FC<OrcaBootSplashProps> = ({ onComplete, forceShow = false }) => {
  const [visible, setVisible] = useState(() => {
    if (forceShow) return true;
    try {
      return !sessionStorage.getItem('orca_boot_seen');
    } catch {
      return false;
    }
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!visible) {
      if (onComplete) onComplete();
      return;
    }

    // 1.1s display -> 250ms smooth fade
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1100);

    const doneTimer = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem('orca_boot_seen', 'true');
      } catch {
        // Safe fallback
      }
      if (onComplete) onComplete();
    }, 1350);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center bg-[#F5F9FC] select-none transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="ORCA System Initializing"
    >
      <div className="flex flex-col items-center gap-4 animate-scale-in max-w-xs mx-auto px-4">
        {/* Official ORCA Logo */}
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-white border border-[#CFE6F3] shadow-md p-2">
          <img
            src="/logo.png"
            alt="ORCA Official Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null;
              target.src = '/orca-logo.png';
            }}
          />
        </div>

        {/* Brand Identity */}
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="font-display-decision font-black text-2xl tracking-tight text-[#123B5D]">
            ORCA
          </div>
          <div className="text-[10px] font-bold text-[#587083] uppercase tracking-[0.25em]">
            Marine Decision Intelligence
          </div>
        </div>

        {/* Thin Ocean-Blue Telemetry Line */}
        <div className="w-48 h-1 bg-[#E2EDF4] rounded-full overflow-hidden mt-2 relative">
          <div className="h-full bg-linear-to-r from-[#147FB3] via-[#38BDF8] to-[#147FB3] rounded-full w-2/3 animate-[shimmer_1.2s_infinite_linear]" />
        </div>

        {/* Subtext */}
        <div className="text-[10px] font-telemetry text-[#7E93A3] mt-1 font-medium text-center">
          Correlating Ocean • Weather • GIS • Vessel Intelligence
        </div>
      </div>
    </div>
  );
};
