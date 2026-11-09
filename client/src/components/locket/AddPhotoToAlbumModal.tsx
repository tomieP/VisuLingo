import { useState, useEffect } from 'react';
import { X, Sparkles, Check, Camera, Layers } from 'lucide-react';
import { savePhotoToAlbum, Album, getPhotos } from '@/utils/albums';
import { getMoments, MomentPost } from '@/utils/moments';

interface AddPhotoToAlbumModalProps {
  album: Album | null;
  isOpen: boolean;
  onClose: () => void;
  onPhotoAdded: () => void;
}

export function AddPhotoToAlbumModal({ album, isOpen, onClose, onPhotoAdded }: AddPhotoToAlbumModalProps) {
  const [snaps, setSnaps] = useState<MomentPost[]>([]);
  const [selectedMomentIds, setSelectedMomentIds] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && album) {
      const allMoments = getMoments();
      // Keep only valid moments that have an image
      const validSnaps = allMoments.filter((m) => m.imageUrl && !m.imageUrl.startsWith('blob:'));
      setSnaps(validSnaps);

      // Check which photos are already in this album
      const albumPhotos = getPhotos(album.id);
      const urlSet = new Set(albumPhotos.map((p) => p.imageUrl));
      setExistingImageUrls(urlSet);

      setSelectedMomentIds([]);
    }
  }, [isOpen, album]);

  if (!isOpen || !album) return null;

  const toggleSelect = (momentId: string, isAlreadyInAlbum: boolean) => {
    if (isAlreadyInAlbum) return;

    setSelectedMomentIds((prev) =>
      prev.includes(momentId) ? prev.filter((id) => id !== momentId) : [...prev, momentId]
    );
  };

  const handleConfirmAdd = async () => {
    if (selectedMomentIds.length === 0) return;

    const toAdd = snaps.filter((s) => selectedMomentIds.includes(s.id));
    for (const snap of toAdd) {
      await savePhotoToAlbum(album.id, snap.imageUrl, snap.vocabTags, snap.caption);
    }

    onPhotoAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#161D2B] border border-white/15 rounded-[32px] p-5 sm:p-6 shadow-2xl text-white space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-2xl bg-white/5 border border-white/10">
              {album.emoji}
            </span>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                Thêm Snap vào Album
              </h3>
              <p className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 mt-0.5">
                <span>Album: {album.title}</span>
                <span className="text-slate-400 font-normal">• Chọn từ ảnh bạn đã Snap</span>
              </p>
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

        {/* Content: List of user's Snaps */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[220px]">
          {snaps.length === 0 ? (
            /* Empty State when user hasn't snapped anything yet */
            <div className="py-12 px-4 text-center space-y-3 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center shadow-lg">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-white">Chưa có ảnh Snap nào</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Bạn chưa chụp ảnh nào quanh mình. Hãy ra trang chủ chụp ảnh để AI dán nhãn từ vựng trước nhé!
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Nhấp vào ảnh để chọn:</span>
                <span className="font-bold text-amber-300">
                  Đã chọn {selectedMomentIds.length} ảnh
                </span>
              </div>

              {/* Grid of Snapped Photos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {snaps.map((snap) => {
                  const isSelected = selectedMomentIds.includes(snap.id);
                  const isAlreadyIn = existingImageUrls.has(snap.imageUrl);

                  return (
                    <div
                      key={snap.id}
                      onClick={() => toggleSelect(snap.id, isAlreadyIn)}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer select-none group ${
                        isAlreadyIn
                          ? 'opacity-60 border-white/10 cursor-not-allowed'
                          : isSelected
                          ? 'border-amber-400 ring-4 ring-amber-400/30 scale-98 shadow-lg shadow-amber-400/20'
                          : 'border-white/10 hover:border-amber-400/60 hover:scale-[1.02]'
                      }`}
                    >
                      <img
                        src={snap.imageUrl}
                        alt={snap.caption || 'Snap photo'}
                        className="w-full h-full object-cover"
                      />

                      {/* Dark Vignette Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                      {/* Top Selection Status Pill */}
                      <div className="absolute top-2 right-2">
                        {isAlreadyIn ? (
                          <span className="px-1.5 py-0.5 rounded-full bg-slate-900/90 border border-white/20 text-[10px] text-slate-300 font-bold flex items-center gap-1 shadow-md">
                            <Check className="w-3 h-3 text-slate-400" />
                            <span>Đã có</span>
                          </span>
                        ) : isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg animate-in zoom-in-75">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-black/50 border border-white/40 group-hover:border-amber-300 transition-colors" />
                        )}
                      </div>

                      {/* Bottom Info: Caption & Vocab Tag Count */}
                      <div className="absolute bottom-2 inset-x-2 space-y-0.5">
                        {snap.caption && (
                          <p className="text-[11px] font-bold text-white truncate drop-shadow">
                            {snap.caption}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-300">
                          <Sparkles className="w-3 h-3" />
                          <span>{snap.vocabTags.length} từ vựng</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={handleConfirmAdd}
            disabled={selectedMomentIds.length === 0}
            className="flex-2 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-extrabold text-xs shadow-xl shadow-amber-400/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>
              {selectedMomentIds.length > 0
                ? `Thêm ${selectedMomentIds.length} Snap vào Album`
                : 'Chọn ảnh Snap để thêm'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
