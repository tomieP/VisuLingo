import { useState } from 'react';
import { X, Sparkles, FolderPlus } from 'lucide-react';
import { createAlbum } from '@/utils/albums';

interface CreateAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (albumId: string) => void;
}

const EMOJI_OPTIONS = ['💻', '☕', '🥐', '🌿', '✈️', '🍳', '🐱', '🎒', '📚', '🎨', '🎵', '🍕'];

export function CreateAlbumModal({ isOpen, onClose, onCreated }: CreateAlbumModalProps) {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('💻');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newAlbum = await createAlbum(title, emoji, description);
    setTitle('');
    setDescription('');
    onCreated(newAlbum.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#161D2B] border border-white/15 rounded-[32px] p-6 shadow-2xl text-white space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base tracking-tight">Tạo Album mới</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Tên Album
            </label>
            <input
              type="text"
              required
              placeholder="VD: Quán Cà Phê, Bàn Làm Việc..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Emoji selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Icon đại diện ({emoji})
            </label>
            <div className="grid grid-cols-6 gap-2">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`text-lg p-2 rounded-xl transition-all border ${
                    emoji === em
                      ? 'bg-amber-400/20 border-amber-400 scale-110 shadow-sm'
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Mô tả ngắn (tùy chọn)
            </label>
            <input
              type="text"
              placeholder="Ghi chú về album này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-extrabold text-xs shadow-xl shadow-amber-400/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 pt-3"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Tạo Album ngay</span>
          </button>
        </form>
      </div>
    </div>
  );
}
