import { useState } from 'react';
import { Volume2, Sparkles, Plus, Check } from 'lucide-react';
import { speakWord } from '@/utils/speech';
import { saveWord, isWordSaved } from '@/utils/storage';

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
  const isSaved = isWordSaved(word);

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
      {/* Floating Interactive Pill */}
      <div
        onClick={() => {
          setShowPopup(!showPopup);
          onSelect?.();
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-300 shadow-xl backdrop-blur-md ${
          isSelected
            ? 'bg-amber-400 text-slate-950 font-bold scale-110 ring-4 ring-amber-300/40 shadow-amber-500/30'
            : 'bg-black/75 hover:bg-black/90 text-white border border-white/25 hover:scale-105 shadow-black/50'
        }`}
      >
        {/* Pulsing indicator dot */}
        <span
          className={`w-2 h-2 rounded-full ${
            isSelected
              ? 'bg-slate-950 animate-ping'
              : isPlaying
              ? 'bg-amber-400 animate-pulse'
              : 'bg-emerald-400'
          }`}
        />

        <span className="text-xs font-bold tracking-tight capitalize">{word}</span>

        {/* Pronounce quick button */}
        <button
          type="button"
          onClick={handlePronounce}
          className={`p-0.5 rounded-full hover:scale-110 transition-transform ${
            isSelected ? 'text-slate-900 hover:text-black' : 'text-amber-300 hover:text-white'
          }`}
          title="Nghe phát âm"
        >
          <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-bounce' : ''}`} />
        </button>
      </div>

      {/* Floating Card Popover on Tap */}
      {showPopup && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-slate-900/95 text-white backdrop-blur-xl border border-white/20 rounded-2xl p-3.5 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-white/10">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-extrabold text-base capitalize text-white">{word}</span>
                {ipa && <span className="text-[11px] font-mono text-amber-300">{ipa}</span>}
              </div>
              <p className="text-xs font-semibold text-emerald-400 mt-0.5">{meaningVi}</p>
            </div>

            <button
              type="button"
              onClick={handleSaveWord}
              disabled={isSaved}
              className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                isSaved
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20'
              }`}
              title={isSaved ? 'Đã lưu vào Snapbook' : 'Lưu từ vào Snapbook'}
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          </div>

          {example && (
            <p className="text-[11px] text-slate-300 italic mt-2 pl-2 border-l-2 border-amber-400/60 leading-relaxed">
              "{example}"
            </p>
          )}

          {confidence && (
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-slate-400">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>AI nhận diện</span>
              </span>
              <span>{Math.round(confidence * 100)}% khớp</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
