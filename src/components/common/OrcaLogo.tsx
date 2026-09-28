import React from 'react';

export interface OrcaLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  className?: string;
  showText?: boolean;
  textClassName?: string;
  variant?: 'light' | 'dark' | 'auto';
}

export const OrcaLogo: React.FC<OrcaLogoProps> = ({
  size = 'md',
  className = '',
  showText = true,
  textClassName = '',
  variant = 'auto',
}) => {
  const sizeMap = {
    xs: { img: 'w-5 h-5', text: 'text-sm' },
    sm: { img: 'w-7 h-7', text: 'text-base' },
    md: { img: 'w-8 h-8', text: 'text-lg' },
    lg: { img: 'w-10 h-10', text: 'text-xl' },
    xl: { img: 'w-14 h-14', text: 'text-2xl' },
    custom: { img: '', text: '' },
  };

  const selectedSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Logo Mark */}
      <div className={`relative flex items-center justify-center shrink-0 ${selectedSize.img}`}>
        <img
          src="/logo.png"
          alt="ORCA Logo"
          className="w-full h-full object-contain filter drop-shadow-2xs transition-transform duration-200"
          onError={(e) => {
            // Graceful fallback to svg or anchor styling if missing
            const target = e.currentTarget;
            target.onerror = null;
            target.src = '/orca-logo.png';
          }}
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-display-decision font-black tracking-tight ${
              variant === 'dark' ? 'text-white' : 'text-[#123B5D]'
            } ${selectedSize.text} ${textClassName}`}
          >
            ORCA
          </span>
          <span className="text-[9px] font-bold text-[#587083] uppercase tracking-wider">
            Marine Decision Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
