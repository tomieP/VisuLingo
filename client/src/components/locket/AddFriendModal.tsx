import { useState } from 'react';
import { X, QrCode, Search, Sparkles, UserPlus, Check, Copy, Share2 } from 'lucide-react';
import { FriendProfile, addNewFriend, getFriends } from '@/utils/friends';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFriendAdded?: () => void;
}

export function AddFriendModal({ isOpen, onClose, onFriendAdded }: AddFriendModalProps) {
  const [activeTab, setActiveTab] = useState<'qr' | 'search' | 'suggested'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentFriends = getFriends();

  const handleAdd = (person: FriendProfile) => {
    addNewFriend(person);
    onFriendAdded?.();
  };

  const handleAddByUsername = () => {
    const raw = searchQuery.trim();
    if (!raw) return;
    const cleanHandle = raw.replace(/^@+/, '');
    const formattedUsername = `@${cleanHandle}`;

    if (currentFriends.some((f) => f.username.toLowerCase() === formattedUsername.toLowerCase())) {
      alert('Tài khoản này đã có trong danh sách bạn bè của bạn rồi!');
      return;
    }

    const newPerson: FriendProfile = {
      id: `friend-${Date.now()}`,
      name: cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1),
      username: formattedUsername,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      bio: 'Người bạn đồng hành học từ vựng tiếng Anh trên VisuLingo 🌟',
      badge: 'Bạn mới 🤝',
      streak: 1,
      totalWords: 0,
      snapsCount: 0,
      isFollowing: true,
      albums: [],
    };

    handleAdd(newPerson);
    setSearchQuery('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://visulingo.app/invite/user123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#161D2B] border border-white/15 rounded-[32px] p-5 sm:p-6 shadow-2xl text-white space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Thêm bạn bè</h3>
              <p className="text-[11px] text-slate-400">Kết nối bạn bè thật để cùng học từ vựng mỗi ngày</p>
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

        {/* Tab switch */}
        <div className="flex rounded-full bg-black/40 p-1 border border-white/5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'search'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tìm username 🔍
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'qr'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mã QR 📱
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('suggested')}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'suggested'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Gợi ý ✨
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* TAB 1: TÌM USERNAME */}
          {activeTab === 'search' && (
            <div className="space-y-4 py-1">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Nhập Username của bạn bè:
                </label>
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ví dụ: alex, nam_ielts, hoa99..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddByUsername();
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 focus:border-amber-400 rounded-full pl-9 pr-24 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddByUsername}
                    disabled={!searchQuery.trim()}
                    className="absolute right-1.5 px-3 py-1.5 rounded-full bg-amber-400 disabled:opacity-40 hover:bg-amber-300 text-slate-950 font-extrabold text-[11px] transition-all cursor-pointer shadow-xs"
                  >
                    Kết bạn
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mẹo kết nối</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Nhập chính xác username của bạn bè để gửi lời mời và cùng nhau chia sẻ những bức ảnh Snap chứa nhãn từ vựng mỗi ngày!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: MÃ QR CỦA TÔI */}
          {activeTab === 'qr' && (
            <div className="text-center space-y-4 py-2">
              <div className="w-44 h-44 mx-auto rounded-3xl bg-white p-4 shadow-xl shadow-amber-400/10 flex flex-col items-center justify-center border-4 border-amber-400/40 relative">
                <QrCode className="w-32 h-32 text-slate-950" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-slate-950 p-1 shadow-md border-2 border-amber-400">
                    <Sparkles className="w-full h-full text-amber-400" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-white">Mã QR của Bạn</h4>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  {localStorage.getItem('visulingo_username') || '@visulingo_me'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Đưa mã này để bạn bè quét và kết nối ngay</p>
              </div>

              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Đã sao chép!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Sao chép link mời
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => alert('Đã chia sẻ mã kết nối Snap của bạn!')}
                  className="px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-400/20 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" /> Chia sẻ
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: GỢI Ý BẠN HỌC */}
          {activeTab === 'suggested' && (
            <div className="text-center py-10 space-y-3 px-4">
              <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Chưa có đề xuất kết bạn</h4>
                <p className="text-xs text-slate-400">
                  Hãy dùng tab "Tìm username" hoặc quét mã QR để kết nối bạn bè thật!
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('search')}
                  className="px-4 py-2 rounded-full bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-all shadow-md shadow-amber-400/20 cursor-pointer"
                >
                  Tìm bạn theo username 🔍
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
