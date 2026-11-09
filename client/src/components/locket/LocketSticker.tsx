import { useState, useEffect } from 'react';
import { getActiveTagTheme, TagTheme } from '@/utils/tagThemes';
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
}: LocketStickerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [theme, setTheme] = useState<TagTheme>(getActiveTagTheme());
  const isSaved = isWordSaved(word);

  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(getActiveTagTheme());
    };
    window.addEventListener('visulingo_tag_theme_changed', handleThemeChange);
    return () => {
      window.removeEventListener('visulingo_tag_theme_changed', handleThemeChange);
    };
  }, []);

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

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 select-none z-20 group"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {/* Floating Interactive Pill with Dynamic Theme */}
      <div
        onClick={() => {
          setShowPopup(!showPopup);
          onSelect?.();
        }}
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-300 shadow-xl backdrop-blur-md ${
          isSelected
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

        <span className={`text-xs tracking-tight capitalize select-none ${theme.classes.text}`}>{word}</span>

        {/* Pronounce quick button */}
        <button
          type="button"
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
