import { useState, useRef } from 'react';
import { X, Upload, Camera, Sparkles, Plus, Tag } from 'lucide-react';
import { savePhotoToAlbum, Album } from '@/utils/albums';
import { VocabTag } from '@/utils/moments';

interface AddPhotoToAlbumModalProps {
  album: Album | null;
  isOpen: boolean;
  onClose: () => void;
  onPhotoAdded: () => void;
}

const PRESET_SAMPLE_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
    title: 'Góc học tập',
    defaultTags: [
      { id: 't1', word: 'laptop', meaningVi: 'máy tính xách tay', ipa: '/ˈlæp.tɒp/', x: 30, y: 35 },
      { id: 't2', word: 'notebook', meaningVi: 'quyển sổ tay', ipa: '/ˈnəʊt.bʊk/', x: 45, y: 70 },
    ],
  },
  {
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    title: 'Cà phê & Bánh',
    defaultTags: [
      { id: 't3', word: 'croissant', meaningVi: 'bánh sừng bò', ipa: '/ˈkrwɑː.sɒ̃/', x: 40, y: 50 },
      { id: 't4', word: 'cappuccino', meaningVi: 'cà phê cappuccino', ipa: '/ˌkæp.əˈtʃiː.nəʊ/', x: 65, y: 40 },
    ],
  },
  {
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    title: 'Kệ sách thư viện',
    defaultTags: [
      { id: 't5', word: 'bookshelf', meaningVi: 'giá sách', ipa: '/ˈbʊk.ʃelf/', x: 50, y: 40 },
      { id: 't6', word: 'dictionary', meaningVi: 'từ điển', ipa: '/ˈdɪk.ʃən.ər.i/', x: 35, y: 65 },
    ],
  },
];

export function AddPhotoToAlbumModal({ album, isOpen, onClose, onPhotoAdded }: AddPhotoToAlbumModalProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState<VocabTag[]>([]);
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newIpa, setNewIpa] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !album) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_SAMPLE_PHOTOS[0]) => {
    setImageUrl(preset.url);
    setCaption(preset.title);
    setTags(preset.defaultTags);
  };

  const handleAddTag = () => {
    if (!newWord.trim() || !newMeaning.trim()) return;
    const tag: VocabTag = {
      id: `tag-${Date.now()}`,
      word: newWord.trim().toLowerCase(),
      meaningVi: newMeaning.trim(),
      ipa: newIpa.trim() || undefined,
      x: 50,
      y: 50,
    };
    setTags([...tags, tag]);
    setNewWord('');
    setNewMeaning('');
    setNewIpa('');
  };

  const handleRemoveTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;

    savePhotoToAlbum(album.id, imageUrl, tags, caption);
    setImageUrl('');
    setCaption('');
    setTags([]);
    onPhotoAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#161D2B] border border-white/15 rounded-[32px] p-5 sm:p-6 shadow-2xl text-white space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1.5 rounded-xl bg-white/5 border border-white/10">
              {album.emoji}
            </span>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Thêm ảnh vào Album</h3>
              <p className="text-xs text-amber-300 font-semibold">{album.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Photo Preview / Upload Box */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Ảnh khoảnh khắc
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/80 border border-amber-400/50 shadow-inner group">
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-xs font-bold text-white transition-opacity"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Đổi ảnh khác</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-white/20 hover:border-amber-400 p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-white/5 hover:bg-white/[0.08]"
              >
                <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white">Chạm để tải ảnh từ máy</span>
                <span className="text-[11px] text-slate-400">hoặc chọn ảnh mẫu nhanh bên dưới</span>
              </div>
            )}

            {/* Quick Sample Presets */}
            {!imageUrl && (
              <div className="mt-2.5 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Ảnh mẫu gợi ý:</span>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_SAMPLE_PHOTOS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className="group relative rounded-xl overflow-hidden aspect-video border border-white/10 hover:border-amber-400 text-left transition-all"
                    >
                      <img src={p.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/50 flex items-end p-1">
                        <span className="text-[9px] font-bold text-white truncate">{p.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Chú thích ảnh
            </label>
            <input
              type="text"
              placeholder="VD: Cà phê sáng chill cùng cuốn sách mới..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* Vocab Tags in Photo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Gắn nhãn từ vựng trong ảnh ({tags.length})</span>
              </label>
            </div>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold"
                >
                  <span className="capitalize">{t.word}:</span>
                  <span className="text-slate-200 font-normal">{t.meaningVi}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t.id)}
                    className="hover:text-rose-400 ml-0.5 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Add Tag Inputs */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <input
                type="text"
                placeholder="Từ tiếng Anh (VD: mug)"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
              />
              <input
                type="text"
                placeholder="Nghĩa tiếng Việt (VD: ly sứ)"
                value={newMeaning}
                onChange={(e) => setNewMeaning(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <button
              type="button"
              onClick={handleAddTag}
              disabled={!newWord.trim() || !newMeaning.trim()}
              className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-amber-300 disabled:opacity-40 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm nhãn từ này</span>
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!imageUrl}
              className="w-full py-3 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Lưu ảnh vào Album</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
