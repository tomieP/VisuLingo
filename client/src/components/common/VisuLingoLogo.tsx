import React from 'react';

interface VisuLingoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showBadge?: boolean;
  className?: string;
}

export const VisuLingoLogo: React.FC<VisuLingoLogoProps> = ({
  size = 'md',
  showWordmark = true,
  showBadge = true,
  className = '',
}) => {
  // Dimensions mapping
  const iconSizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textMap = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* 
        LOGOMARK (Icon):
        The "Visual Language Lens" (Ống kính Ngôn ngữ Thị giác):
        - Squircle chassis with sunset-amber into electric violet-indigo gradient.
        - Precision camera viewfinder ticks (Visual AI recognition).
        - Social Speech Bubble contour intersecting the lens (English Conversation & Social Snaps).
        - Central stylized "V" iris with an intelligent 4-point AI Star reflection.
      */}
      <div
        className={`relative ${iconSizeMap[size]} shrink-0 flex items-center justify-center group`}
      >
        <svg
          viewBox="0 0 52 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_16px_rgba(245,158,11,0.25)] transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Primary Brand Gradient: Solar Amber to Vivid Coral & Neon Violet */}
            <linearGradient id="vl-bg-grad" x1="4" y1="4" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>

            {/* Subtle Inner Glow */}
            <linearGradient id="vl-inner-glow" x1="26" y1="4" x2="26" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* AI Star Metallic Gradient */}
            <linearGradient id="vl-star-grad" x1="28" y1="12" x2="38" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>

            {/* Lens Aperture Shadow */}
            <radialGradient id="vl-aperture-depth" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0B0F17" stopOpacity="0.95" />
              <stop offset="85%" stopColor="#161D2B" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#1E293B" stopOpacity="0.85" />
            </radialGradient>
          </defs>

          {/* Squircle Housing with Subtle Social Speech Tail Notch */}
          <path
            d="M17 5C8 5 5 8 5 17V35C5 44 8 47 17 47H31L40 50L38 43.5C44 42 47 39 47 31V17C47 8 44 5 35 5H17Z"
            fill="url(#vl-bg-grad)"
          />

          {/* Frosted Lens Rim Highlight */}
          <path
            d="M17 5.75C8.5 5.75 5.75 8.5 5.75 17V35C5.75 43.5 8.5 46.25 17 46.25H31.3L38.8 48.7L37.1 43.1C43.2 41.6 46.25 38.6 46.25 31V17C46.25 8.5 43.5 5.75 35 5.75H17Z"
            stroke="url(#vl-inner-glow)"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Center Dark Aperture Chamber (The Camera Lens) */}
          <circle
            cx="25"
            cy="24"
            r="13"
            fill="url(#vl-aperture-depth)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.2"
          />

          {/* Optical Viewfinder Corner Crosshairs (Visual AI framing everyday objects) */}
          <path
            d="M16 19V17C16 16.4 16.4 16 17 16H19"
            stroke="#FDE68A"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M31 16H33C33.6 16 34 16.4 34 17V19"
            stroke="#FDE68A"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M16 29V31C16 31.6 16.4 32 17 32H19"
            stroke="#FDE68A"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M31 32H33C33.6 32 34 31.6 34 31V29"
            stroke="#FDE68A"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Stylized Dynamic "V" (VisuLingo Signature Glyph) */}
          <path
            d="M19 20L25 29.5L31 20"
            stroke="#FBBF24"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Phonetic / Speech Sound Arc inside the Lens */}
          <path
            d="M22 23.5L25 28L28 23.5"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.85"
          />

          {/* Intelligent AI Knowledge Sparkle (Top-right focus reflector) */}
          <path
            d="M34 12C34 14.5 35.5 16 38 16C35.5 16 34 17.5 34 20C34 17.5 32.5 16 30 16C32.5 16 34 14.5 34 12Z"
            fill="url(#vl-star-grad)"
          />
        </svg>
      </div>

      {/* TYPOGRAPHY: Wordmark + Social Micro-Badge */}
      {showWordmark && (
        <div className="flex items-center gap-2">
          <div className="flex items-baseline">
            {/* "Visu" in crisp clean white */}
            <span
              className={`font-black tracking-tight text-white ${textMap[size]}`}
              style={{ letterSpacing: '-0.03em' }}
            >
              Visu
            </span>
            {/* "Lingo" with radiant warm gold gradient */}
            <span
              className={`font-black tracking-tight bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent ${textMap[size]}`}
              style={{ letterSpacing: '-0.03em' }}
            >
              Lingo
            </span>
          </div>

          {/* Intelligent Social Snaps Badge */}
          {showBadge && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400/15 to-orange-500/15 border border-amber-400/30 text-[9px] font-black uppercase tracking-wider text-amber-300 shadow-xs backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Snaps
            </span>
          )}
        </div>
      )}
    </div>
  );
};
