import { useState, useEffect, useRef } from 'react';
import { getActiveTagTheme, getTagThemeById, TagTheme, TagThemeId } from '@/utils/tagThemes';
import { Volume2, Sparkles, Plus, Check } from 'lucide-react';
import { speakWord } from '@/utils/speech';
import { saveWord, isWordSaved } from '@/utils/storage';
import { IllustratedTagFrame } from './IllustratedTagFrame';

interface LocketStickerProps {
  word: string;
  meaningVi: string;
  ipa?: string;
  example?: string;
  x: number; // 0..100
  y: number; // 0..100
  confidence?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  themeId?: TagThemeId | string;
  isFrozen?: boolean; // When true (already posted), skin is locked and cannot be changed
  isDraggable?: boolean; // When true (in camera preview), user can drag to fine-tune placement
  onPositionChange?: (newX: number, newY: number) => void;
}

export function LocketSticker({
  word,
  meaningVi,
  ipa,
  example,
  x,
  y,
  confidence,
  isSelected,
  onSelect,
  themeId,
  isFrozen = false,
  isDraggable = false,
  onPositionChange,
}: LocketStickerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const stickerRef = useRef<HTMLDivElement>(null);
  const dragTrackerRef = useRef<{ startX: number; startY: number; moved: boolean } | null>(null);

  const [theme, setTheme] = useState<TagTheme>(() => {
    if (themeId) return getTagThemeById(themeId);
    return getActiveTagTheme();
  });
  const isSaved = isWordSaved(word);

  useEffect(() => {
    // If a specific themeId is passed, always use it
    if (themeId) {
      setTheme(getTagThemeById(themeId));
    }

    // If this sticker is frozen on an already-posted photo, it NEVER changes when global theme switches!
    if (isFrozen) {
      return;
    }

    // Only unposted / camera-preview stickers react to global theme switches
    const handleThemeChange = () => {
      if (!themeId) {
        setTheme(getActiveTagTheme());
      }
    };
    window.addEventListener('visulingo_tag_theme_changed', handleThemeChange);
    return () => {
      window.removeEventListener('visulingo_tag_theme_changed', handleThemeChange);
    };
  }, [themeId, isFrozen]);

  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    speakWord(word, () => setIsPlaying(false));
  };

  const handleSaveWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveWord({
      id: crypto.randomUUID(),
      word,
      meaningVi,
      ipa: ipa || '',
      example: example || '',
      savedAt: new Date().toISOString(),
    });
  };

  // Drag and drop handlers for manual repositioning before posting
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isDraggable) return;
    dragTrackerRef.current = { startX: e.clientX, startY: e.clientY, moved: false };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragTrackerRef.current || !isDraggable) return;
    const dx = e.clientX - dragTrackerRef.current.startX;
    const dy = e.clientY - dragTrackerRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragTrackerRef.current.moved = true;
      if (!isDragging) setIsDragging(true);
    }
    if (!dragTrackerRef.current.moved) return;

    const parent = stickerRef.current?.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const newX = Math.max(14, Math.min(86, ((e.clientX - rect.left) / rect.width) * 100));
    const newY = Math.max(10, Math.min(88, ((e.clientY - rect.top) / rect.height) * 100));
    onPositionChange?.(Math.round(newX * 10) / 10, Math.round(newY * 10) / 10);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggable) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
    }
    const hadMoved = dragTrackerRef.current?.moved;
    dragTrackerRef.current = null;
    setIsDragging(false);

    // If it was just a tap (not a drag), toggle details popup
    if (!hadMoved) {
      setShowPopup(!showPopup);
      onSelect?.();
    }
  };

  return (
    <div
      ref={stickerRef}
      className={`absolute -translate-x-1/2 -translate-y-1/2 select-none group touch-none ${
        isSelected || isDragging ? 'z-40' : 'z-20'
      }`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {/* Floating Interactive Pill with Dynamic Theme */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={() => {
          if (!isDraggable) {
            setShowPopup(!showPopup);
            onSelect?.();
          }
        }}
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 shadow-xl backdrop-blur-md ${
          isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
        } ${
          isDragging
            ? `${theme.classes.pill} scale-110 shadow-2xl ring-2 ring-amber-400/80`
            : isSelected
            ? `${theme.classes.pill} scale-110 ${theme.classes.selectedRing}`
            : `${theme.classes.pill} hover:scale-105`
        }`}
      >
        {/* Bespoke Hand-drawn Illustrated Vector Frame Decoration */}
        <IllustratedTagFrame frameStyle={theme.frameStyle} />

        {/* Pulsing indicator dot */}
        <span
          className={`w-2 h-2 rounded-full transition-all ${
            isSelected
              ? `animate-ping ${theme.classes.dot}`
              : isPlaying
              ? 'animate-pulse bg-white'
              : theme.classes.dot
          }`}
        />

        <span className={`text-xs tracking-tight capitalize select-none font-medium ${theme.classes.text}`}>{word}</span>

        {/* Pronounce quick button */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handlePronounce}
          className={`p-0.5 rounded-full hover:scale-110 transition-transform ${theme.classes.speaker}`}
          title="Nghe phát âm"
        >
          <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-bounce' : ''}`} />
        </button>
      </div>

      {/* Floating Card Popover on Tap */}
      {showPopup && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 bg-[#121722]/95 text-white backdrop-blur-xl border border-[#232B3E] rounded-2xl p-3.5 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Downward indicator triangle */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-[#232B3E]" />

          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-white/10">
            <div>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-extrabold text-base capitalize tracking-tight text-white">{word}</span>
                {ipa && (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                    {ipa}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-200 mt-1">{meaningVi}</p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Speaker sound button */}
              <button
                type="button"
                onClick={handlePronounce}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 hover:text-white transition-all active:scale-90"
                title="Nghe phát âm"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-bounce' : ''}`} />
              </button>

              {/* Bookmark button */}
              <button
                type="button"
                onClick={handleSaveWord}
                disabled={isSaved}
                className={`p-1.5 rounded-xl text-xs font-semibold flex items-center justify-center transition-all active:scale-90 ${
                  isSaved
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                }`}
                title={isSaved ? 'Đã lưu vào Sổ từ' : 'Lưu từ vào Sổ từ'}
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {example && (
            <p className="text-[11px] text-slate-300 italic mt-2.5 pl-2.5 border-l-2 border-amber-400/80 leading-relaxed font-serif">
              "{example}"
            </p>
          )}

          {confidence && (
            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-slate-400">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Nhận diện trực quan</span>
              </span>
              <span className="font-mono text-slate-300">{Math.round(confidence * 100)}%</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
