import { useState } from 'react';
import { X, QrCode, Search, Sparkles, UserPlus, Check, Copy, Share2 } from 'lucide-react';
import { FriendProfile, addNewFriend, getFriends } from '@/utils/friends';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFriendAdded?: () => void;
}

const SUGGESTED_PEOPLE: FriendProfile[] = [
  {
    id: 'sug-1',
    name: 'Hương Ly',
    username: '@ly.toeic900',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    bio: 'Mục tiêu 950 TOEIC 🎯 Học từ vựng văn phòng & kinh doanh.',
    badge: 'TOEIC Pro 🌟',
    streak: 11,
    totalWords: 156,
    snapsCount: 9,
    isFollowing: false,
    albums: [
      {
        id: 'hl-album-1',
        title: 'Công sở & Hội họp',
        emoji: '💼',
        description: 'Văn phòng phẩm và thiết bị họp online',
        photos: [
          {
            id: 'hl-p1',
            imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
            caption: 'Phòng họp sáng đầu tuần 💼',
            timeAgo: '1 giờ trước',
            vocabTags: [
              { id: 'hl-t1', word: 'projector', meaningVi: 'máy chiếu', ipa: '/prəˈdʒek.tər/', x: 60, y: 30 },
              { id: 'hl-t2', word: 'whiteboard', meaningVi: 'bảng trắng', ipa: '/ˈwaɪt.bɔːd/', x: 25, y: 40 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sug-2',
    name: 'Tuấn Anh',
    username: '@tuananh.ielts',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    bio: 'Chuyên snap đồ ăn & quán xá 🍜 Học tiếng Anh giao tiếp mỗi ngày.',
    badge: 'Streak 15 🔥',
    streak: 15,
    totalWords: 210,
    snapsCount: 12,
    isFollowing: false,
    albums: [
      {
        id: 'ta-album-1',
        title: 'Phố ẩm thực',
        emoji: '🍜',
        description: 'Từ vựng các món ăn đường phố và nhà hàng',
        photos: [
          {
            id: 'ta-p1',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
            caption: 'Món ngon phố cổ Hà Nội 🍜',
            timeAgo: '3 giờ trước',
            vocabTags: [
              { id: 'ta-t1', word: 'chopsticks', meaningVi: 'đôi đũa', ipa: '/ˈtʃɒp.stɪks/', x: 40, y: 60 },
              { id: 'ta-t2', word: 'soup bowl', meaningVi: 'tô súp', ipa: '/suːp bəʊl/', x: 65, y: 45 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sug-3',
    name: 'Mai Chi',
    username: '@chi.nature',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    bio: 'Yêu cây cỏ & thiên nhiên 🌿 Snap hoa lá và động vật.',
    badge: 'Eco Snap 🌿',
    streak: 6,
    totalWords: 88,
    snapsCount: 5,
    isFollowing: false,
    albums: [
      {
        id: 'mc-album-1',
        title: 'Vườn cây nhiệt đới',
        emoji: '🌿',
        description: 'Hoa lá, chậu cây và động vật sân vườn',
        photos: [
          {
            id: 'mc-p1',
            imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
            caption: 'Góc vườn nhỏ của mình 🌿',
            timeAgo: 'Hôm qua',
            vocabTags: [
              { id: 'mc-t1', word: 'succulent', meaningVi: 'cây sen đá', ipa: '/ˈsʌk.jʊ.lənt/', x: 50, y: 50 },
            ],
          },
        ],
      },
    ],
  },
];

export function AddFriendModal({ isOpen, onClose, onFriendAdded }: AddFriendModalProps) {
  const [activeTab, setActiveTab] = useState<'qr' | 'search' | 'suggested'>('suggested');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const currentFriends = getFriends();

  const handleAdd = (person: FriendProfile) => {
    addNewFriend(person);
    setAddedIds((prev) => [...prev, person.id]);
    onFriendAdded?.();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://visulingo.app/invite/user123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Search filter
  const searchResults = SUGGESTED_PEOPLE.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h3 className="font-extrabold text-base text-white">Thêm bạn bè mới</h3>
              <p className="text-[11px] text-slate-400">Kết nối bạn bè để cùng học từ vựng mỗi ngày</p>
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
            onClick={() => setActiveTab('suggested')}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'suggested'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Gợi ý bạn học ✨
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'search'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tìm username
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
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* TAB 1: GỢI Ý BẠN HỌC */}
          {activeTab === 'suggested' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 block px-1">
                Các bạn có chung mục tiêu học tiếng Anh:
              </span>
              {SUGGESTED_PEOPLE.map((person) => {
                const isAlreadyFriend =
                  currentFriends.some((f) => f.id === person.id) || addedIds.includes(person.id);

                return (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={person.avatar}
                          alt={person.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/50"
                        />
                        <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-full bg-[#161D2B] border border-amber-400 text-[8px] font-black text-amber-300">
                          🔥{person.streak}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white">{person.name}</span>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300">
                            {person.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{person.username}</p>
                        <p className="text-[10px] text-slate-300 mt-0.5 line-clamp-1">{person.bio}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isAlreadyFriend}
                      onClick={() => handleAdd(person)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ml-2 ${
                        isAlreadyFriend
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm shadow-amber-400/20 active:scale-95'
                      }`}
                    >
                      {isAlreadyFriend ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Đã kết bạn
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <UserPlus className="w-3.5 h-3.5" /> Kết bạn
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: TÌM USERNAME */}
          {activeTab === 'search' && (
            <div className="space-y-3">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nhập @username hoặc tên bạn bè..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-amber-400 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden transition-all"
                />
              </div>

              {searchQuery ? (
                searchResults.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs italic">
                    Không tìm thấy người dùng khớp với "{searchQuery}"
                  </div>
                ) : (
                  searchResults.map((person) => {
                    const isAlreadyFriend =
                      currentFriends.some((f) => f.id === person.id) || addedIds.includes(person.id);

                    return (
                      <div
                        key={person.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={person.avatar}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-amber-400"
                          />
                          <div>
                            <span className="font-bold text-xs text-white">{person.name}</span>
                            <p className="text-[10px] text-slate-400">{person.username}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isAlreadyFriend}
                          onClick={() => handleAdd(person)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            isAlreadyFriend
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                          }`}
                        >
                          {isAlreadyFriend ? 'Đã kết bạn' : '+ Kết bạn'}
                        </button>
                      </div>
                    );
                  })
                )
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Gõ tên hoặc username (ví dụ: ly, tuananh, nature...) để tìm kiếm
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MÃ QR CỦA TÔI */}
          {activeTab === 'qr' && (
            <div className="text-center space-y-4 py-2">
              <div className="w-48 h-48 mx-auto rounded-3xl bg-white p-4 shadow-xl shadow-amber-400/10 flex flex-col items-center justify-center border-4 border-amber-400/40 relative">
                <QrCode className="w-36 h-36 text-slate-950" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-slate-950 p-1 shadow-md border-2 border-amber-400">
                    <Sparkles className="w-full h-full text-amber-400" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-white">Mã QR của Bạn</h4>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">@visulingo_me</p>
                <p className="text-[11px] text-slate-500 mt-1">Đưa mã này để bạn bè quét và kết nối ngay</p>
              </div>

              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all"
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
                  className="px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-400/20 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" /> Chia sẻ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
