import { useState } from 'react';
import { X, Trash2, Sparkles, Volume2, Plus, Camera } from 'lucide-react';
import { Album, SnapPhoto, deletePhoto, deleteAlbum } from '@/utils/albums';
import { LocketSticker } from './LocketSticker';
import { speakWord } from '@/utils/speech';
import { AddPhotoToAlbumModal } from './AddPhotoToAlbumModal';

interface AlbumDetailModalProps {
  album: Album | null;
  photos: SnapPhoto[];
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function AlbumDetailModal({ album, photos, isOpen, onClose, onUpdated }: AlbumDetailModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<SnapPhoto | null>(null);
  const [showAddPhoto, setShowAddPhoto] = useState(false);

  if (!isOpen || !album) return null;

  const handleDeletePhoto = (photoId: string) => {
    if (window.confirm('Xóa bức ảnh này khỏi album?')) {
      deletePhoto(photoId);
      if (selectedPhoto?.id === photoId) setSelectedPhoto(null);
      onUpdated();
    }
  };

  const handleDeleteAlbum = () => {
    if (window.confirm(`Xóa toàn bộ album "${album.title}" và các ảnh bên trong?`)) {
      deleteAlbum(album.id);
      onUpdated();
      onClose();
    }
  };

  // Calculate total vocab words in this album
  const totalWords = photos.reduce((acc, p) => acc + p.vocabTags.length, 0);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-lg bg-[#161D2B] border border-white/15 rounded-[32px] p-5 sm:p-6 shadow-2xl text-white space-y-4 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 rounded-2xl bg-white/5 border border-white/10">
                {album.emoji}
              </span>
              <div>
                <h3 className="font-extrabold text-lg tracking-tight text-white">{album.title}</h3>
                <p className="text-xs text-slate-400">
                  {photos.length} ảnh đã lưu • {totalWords} từ vựng đã học
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowAddPhoto(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-all cursor-pointer shadow-md shadow-amber-400/20"
                title="Thêm ảnh vào album này"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Thêm ảnh</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteAlbum}
                className="p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                title="Xóa album này"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Selected Photo Viewer if user clicked one */}
          {selectedPhoto ? (
            <div className="space-y-3 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="text-xs font-bold text-amber-300 hover:underline cursor-pointer"
                >
                  ← Quay lại danh sách ảnh
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(selectedPhoto.id)}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa ảnh này</span>
                </button>
              </div>

              {/* Photo View with Interactive Stickers */}
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-black border border-white/10 flex items-center justify-center">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.caption || ''}
                  className="w-full h-full object-cover"
                />
                {selectedPhoto.vocabTags.map((tag) => (
                  <LocketSticker
                    key={tag.id}
                    word={tag.word}
                    meaningVi={tag.meaningVi}
                    ipa={tag.ipa}
                    example={tag.example}
                    x={tag.x}
                    y={tag.y}
                  />
                ))}
              </div>

              {/* Words list below photo */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Từ vựng trong ảnh này:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedPhoto.vocabTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => speakWord(tag.word)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold capitalize">{tag.word}:</span>
                      <span className="text-slate-300">{tag.meaningVi}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Photos Grid inside Album */
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {photos.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-3">
                  <Sparkles className="w-8 h-8 mx-auto opacity-50 text-amber-400" />
                  <p className="text-xs font-semibold text-white">Album này chưa có ảnh nào</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Tải ảnh từ máy hoặc chụp khoảnh khắc mới để học từ vựng trực quan theo chủ đề này!
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddPhoto(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 shadow-md transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>+ Thêm ảnh đầu tiên vào Album</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo)}
                      className="group relative rounded-2xl overflow-hidden aspect-square bg-black/60 border border-white/10 cursor-pointer hover:border-amber-400 transition-all shadow-md"
                    >
                      <img
                        src={photo.imageUrl}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white">
                        <span className="font-bold truncate">{photo.caption || 'Khoảnh khắc'}</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] shrink-0">
                          {photo.vocabTags.length} từ
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Photo Modal */}
      <AddPhotoToAlbumModal
        album={album}
        isOpen={showAddPhoto}
        onClose={() => setShowAddPhoto(false)}
        onPhotoAdded={onUpdated}
      />
    </>
  );
}
