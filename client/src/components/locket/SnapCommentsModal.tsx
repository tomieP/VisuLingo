import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Sparkles } from 'lucide-react';
import { MomentPost, addCommentToMoment, formatTimeAgo, getMoments } from '@/utils/moments';

interface SnapCommentsModalProps {
  moment: MomentPost | null;
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_REPLIES = [
  'Từ này hay quá! ✨',
  'Nice snap! 🚀',
  'Góc học tập xịn ghê 💻',
  'Tuyệt vời 🔥',
  'Học chăm chỉ quá nè 👏',
];

export function SnapCommentsModal({ moment: initialMoment, isOpen, onClose }: SnapCommentsModalProps) {
  const [commentText, setCommentText] = useState('');
  const [currentMoment, setCurrentMoment] = useState<MomentPost | null>(initialMoment);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentMoment(initialMoment);
  }, [initialMoment]);

  useEffect(() => {
    if (!initialMoment || !isOpen) return;

    const handleMomentsChanged = () => {
      const fresh = getMoments().find((m) => m.id === initialMoment.id);
      if (fresh) {
        setCurrentMoment(fresh);
      }
    };

    window.addEventListener('visulingo_moments_changed', handleMomentsChanged);
    return () => window.removeEventListener('visulingo_moments_changed', handleMomentsChanged);
  }, [initialMoment, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, currentMoment?.comments?.length]);

  if (!isOpen || !currentMoment) return null;

  const comments = currentMoment.comments || [];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentText.trim()) return;

    const newCmt = addCommentToMoment(currentMoment.id, commentText);
    if (newCmt) {
      setCurrentMoment((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [...(prev.comments || []), newCmt],
        };
      });
    }
    setCommentText('');
  };

  const handleQuickReply = (text: string) => {
    const newCmt = addCommentToMoment(currentMoment.id, text);
    if (newCmt) {
      setCurrentMoment((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [...(prev.comments || []), newCmt],
        };
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#161D2B] border-t sm:border border-white/15 rounded-t-[32px] sm:rounded-[32px] p-4 sm:p-5 shadow-2xl text-white space-y-3.5 max-h-[85vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Bình luận Snap</h3>
              <p className="text-[10px] text-slate-400">
                Snap của <strong className="text-amber-300">{currentMoment.author.name}</strong> • {comments.length} phản hồi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Caption snippet */}
        {currentMoment.caption && (
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-300 italic flex items-center gap-2 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">"{currentMoment.caption}"</span>
          </div>
        )}

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 min-h-[160px] max-h-[300px]">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-1">
              <p className="text-xs font-semibold">Chưa có bình luận nào</p>
              <p className="text-[11px] text-slate-500">Hãy là người đầu tiên để lại lời khen hoặc tương tác!</p>
            </div>
          ) : (
            comments.map((cmt) => (
              <div key={cmt.id} className="flex items-start gap-2.5 group">
                <img
                  src={cmt.author.avatar}
                  alt={cmt.author.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10 mt-0.5 shrink-0"
                />
                <div className="flex-1 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-2.5 border border-white/5 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">{cmt.author.name}</span>
                    <span className="text-[9px] text-slate-500">{formatTimeAgo(cmt.createdAt || cmt.id || cmt.timeAgo)}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">{cmt.text}</p>
                </div>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Quick Reaction Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 shrink-0">
          {QUICK_REPLIES.map((reply, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickReply(reply)}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-amber-400/20 hover:text-amber-300 border border-white/10 text-[11px] text-slate-300 font-medium whitespace-nowrap transition-all shrink-0 hover:scale-105 active:scale-95"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 pt-1 border-t border-white/10 shrink-0">
          <input
            type="text"
            placeholder="Viết phản hồi cho Snap này..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 focus:border-amber-400/80 rounded-full px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden transition-all"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="p-2 rounded-full bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-bold shadow-md shadow-amber-400/20 transition-all shrink-0"
            title="Gửi bình luận"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
