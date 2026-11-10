import React from 'react';

export type TagFrameStyle = 'standard' | 'kitty_ribbon' | 'halloween_bat' | 'manga_comic' | 'noel_christmas';

interface IllustratedTagFrameProps {
  frameStyle?: TagFrameStyle;
}

export const IllustratedTagFrame: React.FC<IllustratedTagFrameProps> = ({ frameStyle }) => {
  if (!frameStyle || frameStyle === 'standard') return null;

  if (frameStyle === 'kitty_ribbon') {
    return (
      <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-visible">
        {/* Illustrated Kitty Ears (Top) */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-4 flex justify-between px-1">
          {/* Left Ear */}
          <svg
            viewBox="0 0 28 24"
            className="w-5 h-4.5 -rotate-12 filter drop-shadow-[0_2px_4px_rgba(244,114,182,0.4)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Ear with hand-drawn subtle curve */}
            <path
              d="M3 22 C2 14, 5 4, 14 2 C18 7, 24 15, 25 22 Z"
              fill="#fdf2f8"
              stroke="#f472b6"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Inner Ear pink patch */}
            <path
              d="M7 19 C7 13, 9 7, 14 5 C16 9, 20 15, 21 19 Z"
              fill="#f472b6"
              opacity="0.85"
            />
          </svg>

          {/* Right Ear */}
          <svg
            viewBox="0 0 28 24"
            className="w-5 h-4.5 rotate-12 filter drop-shadow-[0_2px_4px_rgba(244,114,182,0.4)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Ear */}
            <path
              d="M25 22 C26 14, 23 4, 14 2 C10 7, 4 15, 3 22 Z"
              fill="#fdf2f8"
              stroke="#f472b6"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Inner Ear pink patch */}
            <path
              d="M21 19 C21 13, 19 7, 14 5 C12 9, 8 15, 7 19 Z"
              fill="#f472b6"
              opacity="0.85"
            />
          </svg>
        </div>

        {/* Hand-Drawn Coquette Ribbon Bow (Anchored on top-left of the pill) */}
        <div className="absolute -left-3.5 -top-3 w-8 h-8 filter drop-shadow-[0_3px_6px_rgba(244,114,182,0.6)] -rotate-12">
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Left Bow Loop */}
            <path
              d="M18 19 C12 11, 4 13, 5 19 C6 25, 14 24, 18 21 Z"
              fill="#fb7185"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Left Bow Highlight crease */}
            <path
              d="M9 16 C11 17, 14 18, 17 20"
              stroke="#ffe4e6"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Right Bow Loop */}
            <path
              d="M22 19 C28 11, 36 13, 35 19 C34 25, 26 24, 22 21 Z"
              fill="#fb7185"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Right Bow Highlight crease */}
            <path
              d="M31 16 C29 17, 26 18, 23 20"
              stroke="#ffe4e6"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Ribbon Tails flowing down */}
            <path
              d="M17 23 C15 28, 11 34, 9 37 L14 35 L18 36 C19 32, 19 27, 19 24 Z"
              fill="#f43f5e"
              stroke="#e11d48"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path
              d="M23 23 C25 28, 29 34, 31 37 L26 35 L22 36 C21 32, 21 27, 21 24 Z"
              fill="#f43f5e"
              stroke="#e11d48"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* Center Knot */}
            <circle
              cx="20"
              cy="20"
              r="4.2"
              fill="#fda4af"
              stroke="#f43f5e"
              strokeWidth="2"
            />
            <circle cx="19" cy="18.5" r="1.2" fill="#fff" />
          </svg>
        </div>

        {/* Small sparkle star on top right */}
        <div className="absolute -right-1 -top-1.5 w-3 h-3 text-pink-300 animate-pulse">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 0 L12.5 7.5 L20 10 L12.5 12.5 L10 20 L7.5 12.5 L0 10 L7.5 7.5 Z" />
          </svg>
        </div>
      </div>
    );
  }

  if (frameStyle === 'halloween_bat') {
    return (
      <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-visible">
        {/* Left Hand-Drawn Bat Wing */}
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-7 h-7 filter drop-shadow-[0_2px_8px_rgba(249,115,22,0.6)]">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Bat Wing silhouette with Gothic scalloped edges */}
            <path
              d="M30 16 C25 12, 16 6, 8 7 C4 11, 2 16, 2 18 C5 18, 9 16, 12 18 C9 21, 6 23, 7 26 C11 24, 16 21, 18 23 C18 26, 18 28, 20 30 C24 25, 27 20, 30 16 Z"
              fill="#18181b"
              stroke="#f97316"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* Wing bone lines */}
            <path
              d="M8 7 C12 14, 15 17, 28 16"
              stroke="#ea580c"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M8 7 C8 15, 10 20, 12 18"
              stroke="#fb923c"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            {/* Top claw */}
            <circle cx="8" cy="7" r="1.3" fill="#fdba74" />
          </svg>
        </div>

        {/* Right Hand-Drawn Bat Wing (Flipped) */}
        <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-7 h-7 filter drop-shadow-[0_2px_8px_rgba(249,115,22,0.6)] scale-x-[-1]">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <path
              d="M30 16 C25 12, 16 6, 8 7 C4 11, 2 16, 2 18 C5 18, 9 16, 12 18 C9 21, 6 23, 7 26 C11 24, 16 21, 18 23 C18 26, 18 28, 20 30 C24 25, 27 20, 30 16 Z"
              fill="#18181b"
              stroke="#f97316"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M8 7 C12 14, 15 17, 28 16"
              stroke="#ea580c"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M8 7 C8 15, 10 20, 12 18"
              stroke="#fb923c"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            <circle cx="8" cy="7" r="1.3" fill="#fdba74" />
          </svg>
        </div>

        {/* Hand-Drawn Gothic Spiderweb on Top Right */}
        <div className="absolute -right-2 -top-3 w-6 h-6 opacity-85">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Web radiating lines */}
            <path d="M22 2 L2 2" stroke="#fdba74" strokeWidth="1" strokeLinecap="round" />
            <path d="M22 2 L22 22" stroke="#fdba74" strokeWidth="1" strokeLinecap="round" />
            <path d="M22 2 L6 18" stroke="#fdba74" strokeWidth="1" strokeLinecap="round" />
            {/* Concentric arcs */}
            <path d="M16 2 Q 17 9 22 10" stroke="#f97316" strokeWidth="1" fill="none" />
            <path d="M10 2 Q 12 14 22 16" stroke="#f97316" strokeWidth="1" fill="none" />
          </svg>
        </div>
      </div>
    );
  }

  if (frameStyle === 'manga_comic') {
    return (
      <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-visible">
        {/* Hand-Drawn Comic Speech Tail at Bottom */}
        <div className="absolute -bottom-2.5 left-5 w-4 h-3 filter drop-shadow-[2px_2px_0px_#000]">
          <svg
            viewBox="0 0 16 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Triangular comic pointer tail with solid black stroke and amber paper fill */}
            <polygon
              points="1,0 15,0 4,12"
              fill="#fef3c7"
              stroke="#000000"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Manga Speed Line / Burst Accent on Top Right */}
        <div className="absolute -right-2.5 -top-2 w-5 h-5 filter drop-shadow-[1px_1px_0px_#000]">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <path d="M2 10 L18 10" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
            <path d="M10 2 L10 18" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 4 L16 16" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 4 L4 16" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }

  if (frameStyle === 'noel_christmas') {
    return (
      <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-visible">
        {/* 1. Snow Cap on Top Edge (Mép tuyết phủ trắng xóa) */}
        <div className="absolute -top-1.5 left-2 right-2 h-2.5 overflow-visible">
          <svg
            viewBox="0 0 100 12"
            preserveAspectRatio="none"
            className="w-full h-full filter drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Wavy fluffy snow path */}
            <path
              d="M0 12 C5 4, 12 10, 18 5 C25 1, 32 8, 40 4 C48 0, 56 7, 65 3 C74 0, 82 8, 90 4 C95 2, 98 8, 100 12 Z"
              fill="#ffffff"
            />
            {/* Ice blue shading */}
            <path
              d="M0 12 C10 8, 25 10, 40 7 C55 4, 70 9, 85 6 C95 4, 100 12, 100 12"
              stroke="#bae6fd"
              strokeWidth="0.8"
            />
          </svg>
        </div>

        {/* 2. Hand-Drawn Santa Claus Hat (Mũ Noel đỏ trên góc trái) */}
        <div className="absolute -left-3.5 -top-4.5 w-8 h-8 filter drop-shadow-[0_3px_8px_rgba(239,68,68,0.7)] -rotate-12">
          <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Red Cone curved body */}
            <path
              d="M7 25 C10 16, 18 6, 27 8 C23 12, 18 18, 16 25 Z"
              fill="#dc2626"
              stroke="#991b1b"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Dark fold shadow */}
            <path
              d="M13 18 C16 16, 20 12, 23 10"
              stroke="#7f1d1d"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* White Fur Brim */}
            <path
              d="M4 25 C4 23, 19 23, 19 25 C19 28, 4 28, 4 25 Z"
              fill="#ffffff"
              stroke="#e2e8f0"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Fluffy Pom-pom ball on the tip */}
            <circle cx="28" cy="8" r="3.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="27" cy="7" r="1.2" fill="#f8fafc" />
          </svg>
        </div>

        {/* 3. Holly Leaves & Red Berries (Nhánh thông và chùm quả đỏ trên góc phải) */}
        <div className="absolute -right-3 -top-3 w-7 h-7 filter drop-shadow-[0_2px_6px_rgba(22,101,52,0.6)] rotate-12">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Holly Leaf 1 (Left) */}
            <path
              d="M16 16 C12 13, 8 16, 5 12 C9 10, 9 6, 8 2 C12 5, 16 6, 16 16 Z"
              fill="#15803d"
              stroke="#14532d"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Holly Leaf 2 (Right) */}
            <path
              d="M16 16 C19 13, 23 16, 26 12 C22 10, 22 6, 23 2 C19 5, 16 6, 16 16 Z"
              fill="#16a34a"
              stroke="#14532d"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Leaf veins */}
            <path d="M16 14 L9 6" stroke="#86efac" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M16 14 L22 6" stroke="#86efac" strokeWidth="0.8" strokeLinecap="round" />

            {/* 3 Red Holly Berries */}
            <circle cx="13" cy="18" r="3" fill="#ef4444" stroke="#991b1b" strokeWidth="0.8" />
            <circle cx="12.2" cy="17.2" r="0.9" fill="#ffffff" />

            <circle cx="18" cy="19" r="3" fill="#dc2626" stroke="#991b1b" strokeWidth="0.8" />
            <circle cx="17.2" cy="18.2" r="0.9" fill="#ffffff" />

            <circle cx="15" cy="22" r="2.8" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="0.8" />
            <circle cx="14.3" cy="21.3" r="0.8" fill="#ffffff" />
          </svg>
        </div>

        {/* 4. Delicate Winter Snowflake (Bông tuyết trắng lấp lánh góc dưới) */}
        <div className="absolute -left-1.5 -bottom-1.5 w-4 h-4 text-sky-200 animate-pulse filter drop-shadow-[0_0_4px_#38bdf8]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="12" y1="2" x2="12" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="5" y1="5" x2="19" y2="19" />
            <line x1="19" y1="5" x2="5" y2="19" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>
    );
  }

  return null;
};
