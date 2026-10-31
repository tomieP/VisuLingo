import { useState, useEffect } from 'react';
import { Volume2, Bookmark, BookmarkCheck, Eye, EyeOff, Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import { Vocabulary } from '@/types/vocabulary';
import { saveWord, removeWord, isWordSaved } from '@/utils/storage';
import { speakWord } from '@/utils/speech';

interface VocabCardProps {
  vocab: Vocabulary;
  imageId?: string;
  onSaved?: () => void;
}

export function VocabCard({ vocab, imageId, onSaved }: VocabCardProps) {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [hideMeaning, setHideMeaning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setIsSaved(isWordSaved(vocab.word));
  }, [vocab.word]);

  const handleToggleSave = () => {
    if (isSaved) {
      removeWord(vocab.word);
      setIsSaved(false);
    } else {
      const savedWord = {
        id: crypto.randomUUID(),
        word: vocab.word,
        meaningVi: vocab.meaningVi,
        ipa: vocab.ipa,
        example: vocab.example,
        imageId,
        savedAt: new Date().toISOString(),
      };
      saveWord(savedWord);
      setIsSaved(true);
      onSaved?.();
    }
  };

  const handlePronounce = () => {
    setIsPlayingAudio(true);
    speakWord(vocab.word, () => setIsPlayingAudio(false));
  };

  const handleCopyExample = () => {
    if (!vocab.example) return;
    navigator.clipboard.writeText(vocab.example);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden hover:shadow-md transition-all">
      {/* Top Banner / Actions */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-indigo-700 shadow-xs border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Thẻ từ vựng ngữ cảnh</span>
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Nguồn: {vocab.source === 'api' ? 'Từ điển tự động' : 'Hệ thống'}
          </span>
        </div>

        {/* Save to notebook button */}
        <button
          onClick={handleToggleSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
            isSaved
              ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
          }`}
          title={isSaved ? 'Nhấn để xóa khỏi sổ từ' : 'Lưu từ vào sổ tay cá nhân'}
        >
          {isSaved ? (
            <>
              <BookmarkCheck className="w-4 h-4 text-amber-600 fill-amber-600" />
              <span>Đã lưu vào sổ</span>
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4 text-slate-500" />
              <span>Lưu từ này</span>
            </>
          )}
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Main Word & Pronounce */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
                {vocab.word}
              </h2>
              {vocab.ipa && (
                <span className="font-mono text-base font-normal text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100/80">
                  {vocab.ipa.startsWith('/') ? vocab.ipa : `/${vocab.ipa}/`}
                </span>
              )}
            </div>

            {/* Quick action bar */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handlePronounce}
                disabled={isPlayingAudio}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isPlayingAudio
                    ? 'bg-blue-600 text-white animate-pulse'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60'
                }`}
              >
                <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
                <span>{isPlayingAudio ? 'Đang đọc...' : 'Nghe phát âm'}</span>
              </button>

              <button
                onClick={() => setHideMeaning(!hideMeaning)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                title="Bấm để ẩn hoặc hiện nghĩa tiếng Việt (Tự kiểm tra trí nhớ)"
              >
                {hideMeaning ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{hideMeaning ? 'Hiện nghĩa' : 'Ẩn nghĩa (Đố vui)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Vietnamese Meaning Section with Interactive Toggle */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Nghĩa tiếng Việt
            </span>
          </div>

          {hideMeaning ? (
            <div
              onClick={() => setHideMeaning(false)}
              className="py-3 px-4 bg-amber-50/80 border border-amber-200/80 rounded-lg text-amber-800 text-sm font-medium cursor-pointer text-center hover:bg-amber-100/80 transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Nghĩa đang bị ẩn. Bấm vào đây để mở đáp án!</span>
            </div>
          ) : (
            <p className="text-xl font-bold text-slate-800 leading-snug">
              {vocab.meaningVi}
            </p>
          )}
        </div>

        {/* Example Sentence Section */}
        {vocab.example && (
          <div className="relative bg-gradient-to-r from-blue-50/40 to-slate-50/60 rounded-xl p-4 border border-blue-100/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Câu ví dụ thực tế</span>
              </span>
              <button
                onClick={handleCopyExample}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
                title="Sao chép câu ví dụ"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-600 font-medium">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-slate-700 italic text-base leading-relaxed pl-3 border-l-2 border-blue-400">
              "{vocab.example}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
