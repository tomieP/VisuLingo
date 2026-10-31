import { useState, useEffect } from 'react';
import { Volume2, Heart, Flame, Sparkles, BookmarkPlus, Check, MessageCircle, Send, Share2 } from 'lucide-react';
import { MomentPost, reactToMoment, VocabTag } from '@/utils/moments';
import { LocketSticker } from './LocketSticker';
import { SnapCommentsModal } from './SnapCommentsModal';
import { ShareSnapModal } from './ShareSnapModal';
import { speakWord } from '@/utils/speech';
import { saveWord, isWordSaved } from '@/utils/storage';

interface LocketFeedCardProps {
  moment: MomentPost;
  onAuthorClick?: () => void;
  onOpenChatWithFriend?: (friendId: string) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80';

export function LocketFeedCard({ moment, onAuthorClick, onOpenChatWithFriend }: LocketFeedCardProps) {
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState(moment.imageUrl || FALLBACK_IMAGE);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    setImgSrc(moment.imageUrl || FALLBACK_IMAGE);
  }, [moment.imageUrl]);

  const handleReact = (type: 'fire' | 'heart' | 'sparkles') => {
    reactToMoment(moment.id, type);
  };

  const handleQuickSave = (tag: VocabTag) => {
    saveWord({
      id: crypto.randomUUID(),
      word: tag.word,
      meaningVi: tag.meaningVi,
      ipa: tag.ipa || '',
      example: tag.example || '',
      savedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="bg-[#161D2B]/90 border border-white/10 rounded-[30px] p-3.5 sm:p-4.5 shadow-xl backdrop-blur-xl text-white space-y-3 transition-all hover:border-white/20">
      {/* Author Header */}
      <div className="flex items-center justify-between">
        <div
          onClick={onAuthorClick}
          className={`flex items-center gap-2.5 ${onAuthorClick ? 'cursor-pointer group' : ''}`}
        >
          <img
            src={moment.author.avatar}
            alt={moment.author.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400/50 group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight group-hover:text-amber-300 transition-colors">
                {moment.author.name}
              </span>
              {moment.author.badge && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {moment.author.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">{moment.timeAgo}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Đã sao chép liên kết khoảnh khắc!');
          }}
          className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Chia sẻ khoảnh khắc"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Snap Photo with Floating Stickers */}
      <div className="relative rounded-2xl overflow-hidden bg-black/60 aspect-4/3 sm:aspect-square flex items-center justify-center border border-white/10">
        <img
          src={imgSrc}
          alt={moment.caption || 'Snap moment'}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className="w-full h-full object-cover select-none"
        />

        {/* Gradient dark vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* Floating Interactive Stickers on Photo */}
        {moment.vocabTags.map((tag) => (
          <LocketSticker
            key={tag.id}
            word={tag.word}
            meaningVi={tag.meaningVi}
            ipa={tag.ipa}
            example={tag.example}
            x={tag.x}
            y={tag.y}
            isSelected={activeWordId === tag.id}
            onSelect={() => setActiveWordId(tag.id)}
          />
        ))}

        {/* Badge in corner showing number of vocab words detected */}
        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-bold text-amber-300 flex items-center gap-1 shadow-lg">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{moment.vocabTags.length} từ vựng</span>
        </div>
      </div>

      {/* Caption */}
      {moment.caption && (
        <p className="text-xs text-slate-200 leading-relaxed font-medium px-1">
          {moment.caption}
        </p>
      )}

      {/* Vocabulary quick-pill tags below image */}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {moment.vocabTags.map((tag) => {
          const isSaved = isWordSaved(tag.word);
          return (
            <div
              key={tag.id}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-all group"
            >
              <button
                type="button"
                onClick={() => speakWord(tag.word)}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                title="Phát âm"
              >
                <Volume2 className="w-3 h-3" />
                <span className="font-bold capitalize">{tag.word}:</span>
              </button>
              <span className="text-slate-300 text-[11px]">{tag.meaningVi}</span>

              <button
                type="button"
                onClick={() => handleQuickSave(tag)}
                className={`ml-1 p-0.5 rounded hover:scale-110 transition-transform ${
                  isSaved ? 'text-emerald-400' : 'text-slate-400 hover:text-amber-300'
                }`}
                title={isSaved ? 'Đã lưu vào sổ' : 'Lưu từ này'}
              >
                {isSaved ? <Check className="w-3 h-3" /> : <BookmarkPlus className="w-3 h-3" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Action / Reaction Bar */}
      <div className="flex items-center justify-between pt-1.5 border-t border-white/10 px-0.5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Heart reaction */}
          <button
            type="button"
            onClick={() => handleReact('heart')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              moment.userReacted === 'heart'
                ? 'bg-rose-500/25 text-rose-400 border border-rose-500/40 scale-105'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${moment.userReacted === 'heart' ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{moment.reactions.heart}</span>
          </button>

          {/* Fire reaction */}
          <button
            type="button"
            onClick={() => handleReact('fire')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              moment.userReacted === 'fire'
                ? 'bg-amber-500/25 text-amber-400 border border-amber-500/40 scale-105'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${moment.userReacted === 'fire' ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{moment.reactions.fire}</span>
          </button>

          {/* Sparkles reaction */}
          <button
            type="button"
            onClick={() => handleReact('sparkles')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              moment.userReacted === 'sparkles'
                ? 'bg-indigo-500/25 text-indigo-400 border border-indigo-500/40 scale-105'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{moment.reactions.sparkles}</span>
          </button>

          {/* Comment button */}
          <button
            type="button"
            onClick={() => setIsCommentsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all bg-white/5 hover:bg-white/10 hover:border-amber-400/40 text-slate-300 border border-white/5 cursor-pointer"
            title="Xem & Viết bình luận"
          >
            <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>{(moment.comments || []).length}</span>
          </button>
        </div>

        {/* Send to chat action button */}
        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all bg-gradient-to-r from-amber-400/20 to-yellow-400/15 hover:from-amber-400/30 hover:to-yellow-400/25 text-amber-300 border border-amber-400/30 shadow-xs cursor-pointer active:scale-95"
          title="Gửi Snap này và từ vựng vào đoạn chat bạn bè"
        >
          <Send className="w-3 h-3 text-amber-400" />
          <span>Gửi vào chat</span>
        </button>
      </div>

      {/* Snap Comments Modal */}
      <SnapCommentsModal
        moment={moment}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
      />

      {/* Share Snap to Chat Modal */}
      <ShareSnapModal
        moment={moment}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onOpenChatWithFriend={onOpenChatWithFriend}
      />
    </div>
  );
}
