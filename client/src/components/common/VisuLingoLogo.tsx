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
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
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
        NEW FRIENDLY "SOCIAL SNAP CAMERA" LOGOMARK:
        - Cute, unmistakable camera chassis with rounded corners & top shutter click button.
        - Speech-bubble tail extending from the camera body (A camera that speaks English & connects friends).
        - Big, friendly, glossy camera lens with glass curvature highlights.
        - Smiling "V" iris in the center for VisuLingo warmth.
        - Glowing camera flash & intelligent sparkle reflector.
      */}
      <div
        className={`relative ${iconSizeMap[size]} shrink-0 flex items-center justify-center group`}
      >
        <svg
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_20px_rgba(245,158,11,0.3)] transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Friendly Warm Amber & Golden Honey Gradient */}
            <linearGradient id="vl-cam-body" x1="8" y1="8" x2="52" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Shutter Click Button Gradient */}
            <linearGradient id="vl-shutter" x1="36" y1="4" x2="46" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* Deep Glassy Lens Depth */}
            <radialGradient id="vl-lens-depth" cx="38%" cy="38%" r="65%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="50%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Friendly Inner Lens Core */}
            <radialGradient id="vl-lens-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* Glossy Reflection Highlight */}
            <linearGradient id="vl-lens-reflection" x1="22" y1="20" x2="38" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 1. Camera Shutter Button (Nút bấm chụp ảnh bo tròn ở phía trên bên phải) */}
          <rect
            x="36"
            y="4"
            width="10"
            height="6"
            rx="3"
            fill="url(#vl-shutter)"
            className="transition-transform group-hover:-translate-y-0.5"
          />

          {/* 2. Camera Body with Integrated Social Speech Bubble Tail */}
          {/* Unmistakably a camera with friendly rounded curves & dialogue tail */}
          <path
            d="M17 9C9.5 9 6 12.5 6 20V37C6 44.5 9.5 48 17 48H19L15 54L25 48H43C50.5 48 54 44.5 54 37V20C54 12.5 50.5 9 43 9H17Z"
            fill="url(#vl-cam-body)"
          />

          {/* Frosted Edge Soft Highlight */}
          <path
            d="M17 10C10 10 7 13 7 20V37C7 44 10 47 17 47H19.2L16.2 51.5L23.8 47H43C50 47 53 44 53 37V20C53 13 50 10 43 10H17Z"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1.2"
            fill="none"
          />

          {/* 3. Camera Flash (Đèn flash tròn xoe thân thiện ở góc trên bên trái) */}
          <circle cx="16" cy="18" r="4.5" fill="#0F172A" />
          <circle cx="16" cy="18" r="3" fill="#FDE68A" />
          <circle cx="15.2" cy="17.2" r="1" fill="#FFFFFF" />

          {/* 4. Big Beautiful Camera Lens (Ống kính máy ảnh trung tâm cực kỳ rõ nét) */}
          {/* Outer Lens Outer Ring */}
          <circle
            cx="32"
            cy="28.5"
            r="14"
            fill="url(#vl-lens-depth)"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.8"
          />

          {/* Middle Lens Ridge Ring */}
          <circle
            cx="32"
            cy="28.5"
            r="11"
            fill="#0B0F17"
            stroke="rgba(251,191,36,0.3)"
            strokeWidth="1.2"
          />

          {/* Subtle Inner Optical Glow */}
          <circle cx="32" cy="28.5" r="9" fill="url(#vl-lens-core)" />

          {/* Camera Lens Glass Arc Reflection (Ánh sáng cong phản chiếu trên ống kính) */}
          <path
            d="M24 23.5C26 20.5 30 19 34 19.5"
            stroke="url(#vl-lens-reflection)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* 5. Smiling "V" (Nụ cười chữ V - Đại diện cho VisuLingo & sự thân thiện) */}
          <path
            d="M26.5 27L32 33.5L37.5 27"
            stroke="#FBBF24"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Friendly Inner Smile Glint */}
          <path
            d="M28.5 28L32 32L35.5 28"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.8"
          />

          {/* 6. Intelligent Sparkle Star (Ngôi sao phản chiếu AI thông minh ở góc ống kính) */}
          <path
            d="M44 14C44 16.5 45.5 18 48 18C45.5 18 44 19.5 44 22C44 19.5 42.5 18 40 18C42.5 18 44 16.5 44 14Z"
            fill="#FFFFFF"
            className="animate-pulse"
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
