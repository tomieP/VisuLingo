import { useState, useEffect } from 'react';
import {
  X,
  Flame,
  BookOpen,
  Images,
  UserCheck,
  UserPlus,
  Volume2,
  BookmarkPlus,
  Sparkles,
  ArrowLeft,
  MessageCircle,
} from 'lucide-react';
import { FriendProfile, FriendAlbum, FriendSnapPhoto, toggleFollowFriend } from '@/utils/friends';
import { LocketSticker } from './LocketSticker';
import { speakWord } from '@/utils/speech';
import { saveWord } from '@/utils/storage';

interface FriendProfileModalProps {
  friend: FriendProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onStartChat?: (friendId: string) => void;
}

export function FriendProfileModal({
  friend,
  isOpen,
  onClose,
  onUpdated,
  onStartChat,
}: FriendProfileModalProps) {
  // Navigation states inside friend's profile:
  // 1. Viewing albums list: selectedAlbum = null, selectedPhoto = null
  // 2. Viewing photos inside an album: selectedAlbum = FriendAlbum, selectedPhoto = null
  // 3. Inspecting a single photo with word pins: selectedAlbum = FriendAlbum, selectedPhoto = FriendSnapPhoto
  const [selectedAlbum, setSelectedAlbum] = useState<FriendAlbum | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<FriendSnapPhoto | null>(null);

  useEffect(() => {
    setSelectedAlbum(null);
    setSelectedPhoto(null);
  }, [friend?.id]);

  if (!isOpen || !friend) return null;

  const albums = friend.albums || [];

  const handleFollowToggle = () => {
    toggleFollowFriend(friend.id);
    onUpdated();
  };

  const handleClose = () => {
    setSelectedAlbum(null);
    setSelectedPhoto(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#161D2B] border border-white/15 rounded-[36px] p-5 sm:p-6 shadow-2xl text-white space-y-4 max-h-[90vh] flex flex-col">
        {/* Top Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Friend Profile Header */}
        <div className="flex items-start gap-4 pb-4 border-b border-white/10 shrink-0">
          <div className="relative shrink-0">
            <img
              src={friend.avatar}
              alt={friend.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-amber-400 shadow-xl shadow-amber-400/20"
            />
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#0B0F17] border border-amber-400 text-[10px] font-black text-amber-300">
              🔥{friend.streak}
            </span>
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight truncate">
                {friend.name}
              </h3>
              {friend.badge && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {friend.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono">{friend.username}</p>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{friend.bio}</p>

            {/* Follow & Message actions */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleFollowToggle}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  friend.isFollowing
                    ? 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20'
                }`}
              >
                {friend.isFollowing ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đang theo dõi</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Theo dõi</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartChat?.(friend.id);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 hover:border-amber-400/40 transition-all"
                title="Nhắn tin với bạn bè"
              >
                <MessageCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>Nhắn tin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 bg-black/40 p-2.5 rounded-2xl border border-white/5 text-center shrink-0">
          <div>
            <div className="flex items-center justify-center gap-1 text-amber-400 font-black text-sm sm:text-base">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{friend.streak} ngày</span>
            </div>
            <span className="text-[9px] text-slate-400 uppercase font-semibold">Streak</span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 text-blue-400 font-black text-sm sm:text-base">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{friend.totalWords}</span>
            </div>
            <span className="text-[9px] text-slate-400 uppercase font-semibold">Từ vựng</span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 text-purple-400 font-black text-sm sm:text-base">
              <Images className="w-3.5 h-3.5" />
              <span>{albums.length} Albums</span>
            </div>
            <span className="text-[9px] text-slate-400 uppercase font-semibold">Bộ sưu tập</span>
          </div>
        </div>

        {/* Dynamic Content View: Level 3 (Photo Detail) -> Level 2 (Album Photos) -> Level 1 (Albums List) */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* LEVEL 3: INSPECTING A PHOTO WITH VOCAB PINS */}
          {selectedPhoto && selectedAlbum ? (
            <div className="space-y-3 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại Album "{selectedAlbum.title}"</span>
              </button>

              <div className="relative rounded-2xl overflow-hidden aspect-square bg-black border border-white/10 flex items-center justify-center">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.caption}
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
                    themeId={tag.themeId || 'classic'}
                    isFrozen={true}
                  />
                ))}
              </div>

              {selectedPhoto.caption && (
                <p className="text-xs text-slate-200 italic font-medium pl-2.5 border-l-2 border-amber-400">
                  "{selectedPhoto.caption}"
                </p>
              )}

              {/* Words list & quick save */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Từ vựng {friend.name} đã học trong ảnh này:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedPhoto.vocabTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                    >
                      <button
                        type="button"
                        onClick={() => speakWord(tag.word)}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        title="Phát âm"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="font-bold capitalize">{tag.word}:</span>
                      </button>
                      <span className="text-slate-300 text-[11px]">{tag.meaningVi}</span>
                      <button
                        type="button"
                        onClick={() => {
                          saveWord({
                            id: crypto.randomUUID(),
                            word: tag.word,
                            meaningVi: tag.meaningVi,
                            ipa: tag.ipa || '',
                            example: tag.example || '',
                            savedAt: new Date().toISOString(),
                          });
                          alert(`Đã lưu "${tag.word}" vào Snapbook của bạn!`);
                        }}
                        className="p-0.5 rounded text-slate-400 hover:text-amber-300 transition-colors ml-1"
                        title="Lưu từ này về Snapbook của bạn"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : selectedAlbum ? (
            /* LEVEL 2: PHOTOS INSIDE SELECTED ALBUM */
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedAlbum(null)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Xem tất cả Albums của {friend.name}</span>
                </button>
                <span className="text-xs text-slate-400">{selectedAlbum.photos.length} ảnh</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                <span className="text-2xl p-1.5 rounded-xl bg-black/40 border border-white/10">
                  {selectedAlbum.emoji}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-white">{selectedAlbum.title}</h4>
                  <p className="text-[11px] text-slate-400">{selectedAlbum.description}</p>
                </div>
              </div>

              {selectedAlbum.photos.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Album này chưa có ảnh nào.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {selectedAlbum.photos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo)}
                      className="group relative rounded-2xl overflow-hidden aspect-square bg-black border border-white/10 cursor-pointer hover:border-amber-400 transition-all shadow-md"
                    >
                      <img
                        src={photo.imageUrl}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white">
                        <span className="font-bold truncate">{photo.caption}</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] shrink-0">
                          {photo.vocabTags.length} từ
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* LEVEL 1: ALBUMS OF THIS FRIEND */
            <div className="space-y-2.5 animate-in fade-in duration-150">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
                Các Album Snap của {friend.name}:
              </span>

              {albums.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  {friend.name} chưa tạo Album nào.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {albums.map((album) => {
                    const cover = album.photos[0]?.imageUrl;
                    const wordCount = album.photos.reduce(
                      (acc, p) => acc + p.vocabTags.length,
                      0
                    );

                    return (
                      <div
                        key={album.id}
                        onClick={() => setSelectedAlbum(album)}
                        className="group relative bg-black/40 border border-white/10 hover:border-amber-400/80 rounded-[26px] overflow-hidden p-3.5 shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
                      >
                        {/* Cover preview */}
                        <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/60 mb-2.5 border border-white/5">
                          {cover ? (
                            <img
                              src={cover}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <Sparkles className="w-5 h-5 text-amber-400" />
                            </div>
                          )}
                          <span className="absolute top-2 left-2 text-xl p-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10">
                            {album.emoji}
                          </span>
                          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-bold text-white border border-white/15">
                            {album.photos.length} ảnh
                          </span>
                        </div>

                        {/* Title and stats */}
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                            {album.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            {album.description}
                          </p>
                        </div>

                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{wordCount} từ vựng</span>
                          <span className="text-amber-300 font-bold group-hover:underline">
                            Khám phá →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
