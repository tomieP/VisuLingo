import React from 'react';

export type TagFrameStyle = 'standard' | 'kitty_ribbon' | 'halloween_bat' | 'manga_comic';

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

  return null;
};
