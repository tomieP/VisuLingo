import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Search,
  Sparkles,
  UserPlus,
  Check,
  Copy,
  Share2,
  Download,
  Camera,
} from 'lucide-react';
import { FriendProfile, addNewFriend, getFriends } from '@/utils/friends';
import { getUserUsername, getCurrentUser } from '@/services/authService';
import api from '@/services/api';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFriendAdded?: () => void;
}

export function AddFriendModal({ isOpen, onClose, onFriendAdded }: AddFriendModalProps) {
  const [activeTab, setActiveTab] = useState<'qr' | 'search' | 'suggested'>('qr');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [serverUsers, setServerUsers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

  const myUsername = getUserUsername();
  const currentUser = getCurrentUser();
  const cleanUsername = myUsername.replace(/^@+/, '').trim() || 'snapper';
  const myDisplayName = (
    localStorage.getItem('visulingo_display_name') ||
    currentUser?.firstName ||
    cleanUsername
  ).trim();

  const publicBaseUrl =
    typeof window !== 'undefined' &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1')
      ? window.location.origin
      : 'https://visu-lingo.vercel.app';

  // Giữ link mời ngắn gọn (< 80 ký tự) để mã QR luôn tạo thành công 100% và quét cực nhạy
  const inviteUrl = `${publicBaseUrl}/?addFriend=@${encodeURIComponent(cleanUsername)}&name=${encodeURIComponent(myDisplayName)}`;

  // Link mã QR chuẩn đám mây luôn sẵn sàng ngay từ ban đầu (0s chờ đợi)
  const cloudQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=2&data=${encodeURIComponent(inviteUrl)}`;

  const [qrSvg, setQrSvg] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>(cloudQrUrl);

  // Tự động sinh mã QR nội tuyến SVG và Canvas DataURL
  useEffect(() => {
    if (!isOpen) return;

    // 1. Tạo SVG nội tuyến siêu nét trực tiếp trong DOM
    QRCode.toString(inviteUrl, {
      type: 'svg',
      margin: 2,
      color: { dark: '#0B0F17', light: '#FFFFFF' },
    })
      .then((svgStr) => {
        if (svgStr) {
          setQrSvg(svgStr);
          const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
          setQrDataUrl(svgDataUrl);
        }
      })
      .catch(() => {});

    // 2. Tạo Canvas PNG để nút Tải ảnh QR lưu được file ảnh .png
    QRCode.toDataURL(inviteUrl, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'L',
      color: { dark: '#0B0F17', light: '#FFFFFF' },
    })
      .then((pngUrl) => {
        if (pngUrl) {
          setQrDataUrl(pngUrl);
        }
      })
      .catch(() => {});
  }, [isOpen, inviteUrl]);

  // Tìm kiếm người dùng thật từ Server PostgreSQL và tự động nhận diện link mời được dán
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setServerUsers([]);
      setSearchMessage(null);
      return;
    }

    // Nếu người dùng dán link mời (có chứa addFriend)
    if (q.includes('addFriend=')) {
      try {
        const url = new URL(q);
        const friendParam = url.searchParams.get('addFriend');
        const nameParam = url.searchParams.get('name') || friendParam?.replace(/^@+/, '');
        const avatarParam =
          url.searchParams.get('avatar') ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

        if (friendParam) {
          const cleanHandle = friendParam.startsWith('@') ? friendParam : `@${friendParam}`;
          const newFriend: FriendProfile = {
            id: `friend-${cleanHandle.toLowerCase().replace(/[^a-z0-9_.]/g, '')}`,
            name: nameParam || cleanHandle,
            username: cleanHandle,
            avatar: avatarParam,
            bio: 'Bạn bè kết nối qua link mời trực tiếp 🌟',
            badge: 'Bạn mới 🤝',
            streak: 1,
            totalWords: 0,
            snapsCount: 0,
            isFollowing: true,
            albums: [],
          };
          addNewFriend(newFriend);
          onFriendAdded?.();
          setSearchMessage(`🎉 Đã thêm ${newFriend.name} (${newFriend.username}) vào bạn bè!`);
          setSearchQuery('');
          return;
        }
      } catch {}
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      api
        .get<{ users: Array<{ id: string; tagName: string; displayName: string | null }> }>('/auth/users/search', {
          params: { q },
        })
        .then((res) => {
          if (Array.isArray(res.data?.users)) {
            setServerUsers(res.data.users);
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsSearching(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  const currentFriends = getFriends();

  const handleAddPerson = (person: FriendProfile) => {
    addNewFriend(person);
    onFriendAdded?.();
    setSearchMessage(`Đã kết bạn với ${person.name}!`);
    setTimeout(() => setSearchMessage(null), 3000);
  };

  const handleAddServerUser = (u: any) => {
    const rawHandle =
      u.tagName ||
      u.username ||
      (u.email ? u.email.split('@')[0] : '') ||
      'snapper';
    const cleanHandle = rawHandle.replace(/^@+/, '').toLowerCase().trim();
    const newPerson: FriendProfile = {
      id: `friend-${u.id}`,
      name: u.displayName || cleanHandle,
      username: `@${cleanHandle}`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanHandle)}`,
      bio: 'Snapper chính thức trên VisuLingo 🌟',
      badge: 'Snapper 🎓',
      streak: 1,
      totalWords: 0,
      snapsCount: 0,
      isFollowing: true,
      albums: [],
    };
    handleAddPerson(newPerson);
  };

  const handleManualAddUsername = () => {
    const raw = searchQuery.trim();
    if (!raw) return;
    const cleanHandle = raw.replace(/^@+/, '');
    const formattedUsername = `@${cleanHandle}`;

    if (currentFriends.some((f) => f.username.toLowerCase() === formattedUsername.toLowerCase())) {
      setSearchMessage('Tài khoản này đã có trong danh sách bạn bè của bạn rồi!');
      return;
    }

    const newPerson: FriendProfile = {
      id: `friend-${Date.now()}`,
      name: cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1),
      username: formattedUsername,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanHandle)}`,
      bio: 'Người bạn học từ vựng tiếng Anh trên VisuLingo 🌟',
      badge: 'Bạn mới 🤝',
      streak: 1,
      totalWords: 0,
      snapsCount: 0,
      isFollowing: true,
      albums: [],
    };

    handleAddPerson(newPerson);
    setSearchQuery('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kết bạn trên VisuLingo',
          text: `Cùng kết bạn và học từ vựng tiếng Anh qua Snap với ${myDisplayName} (@${myUsername}) nhé!`,
          url: inviteUrl,
        });
        return;
      } catch {}
    }
    handleCopyLink();
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    try {
      const a = document.createElement('a');
      a.href = qrDataUrl;
      a.download = `visulingo-qr-${cleanUsername}.png`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setSearchMessage('Đã mở ảnh tải về mã QR!');
      setTimeout(() => setSearchMessage(null), 3000);
    } catch {
      window.open(qrDataUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#161D2B] border border-white/15 rounded-[32px] p-5 sm:p-6 shadow-2xl text-white space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Thêm bạn bè</h3>
              <p className="text-[11px] text-slate-400">Kết nối bạn bè thật để xem Snaps của nhau mỗi ngày</p>
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
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'qr'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mã QR của tôi 📱
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
            Tìm tài khoản 🔍
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
            Hướng dẫn quét 💡
          </button>
        </div>

        {/* Toast / Notification inside modal */}
        {searchMessage && (
          <div className="p-2.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>{searchMessage}</span>
            <button type="button" onClick={() => setSearchMessage(null)} className="text-amber-300 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* TAB 1: MÃ QR THẬT CỦA BẠN (SCANNABLE) */}
          {activeTab === 'qr' && (
            <div className="text-center space-y-4 py-1">
              <div className="w-52 h-52 mx-auto rounded-3xl bg-white p-3.5 shadow-2xl shadow-amber-400/15 flex flex-col items-center justify-center border-4 border-amber-400/40 relative overflow-hidden">
                {qrSvg ? (
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain select-none"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                ) : (
                  <img
                    src={qrDataUrl || cloudQrUrl}
                    alt={`Mã QR của ${myDisplayName}`}
                    className="w-full h-full object-contain rounded-xl select-none"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = cloudQrUrl;
                    }}
                  />
                )}
              </div>

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-xs text-white">{myDisplayName}</span>
                  <span className="text-xs text-amber-400 font-mono">@{myUsername.replace(/^@+/, '')}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Đưa mã QR này cho bạn bè quét bằng <strong className="text-white">Camera điện thoại</strong> hoặc{' '}
                  <strong className="text-white">Zalo</strong> để kết bạn ngay lập tức!
                </p>
                <p className="text-[10px] text-slate-500 italic mt-1">
                  (Mẹo: Bạn có thể nhấn giữ vào ảnh mã QR để lưu trực tiếp vào điện thoại)
                </p>
              </div>

              {/* Action Buttons: Copy link, Share, Download QR */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 border border-white/10 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] text-emerald-300">Đã chép link!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span className="text-[10px]">Chép link mời</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="px-2.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg shadow-amber-400/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-slate-950" />
                  <span className="text-[10px]">Chia sẻ Zalo/FB</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="px-2.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 border border-white/10 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                  title="Tải ảnh QR về máy"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px]">Tải ảnh QR</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TÌM KIẾM TÀI KHOẢN HOẶC DÁN LINK */}
          {activeTab === 'search' && (
            <div className="space-y-4 py-1">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Tìm theo tên hiển thị hoặc @tag_name bạn bè:
                </label>
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ví dụ: thanh phú, @phubap8999, @boypheda..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleManualAddUsername();
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 focus:border-amber-400 rounded-full pl-9 pr-24 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleManualAddUsername}
                    disabled={!searchQuery.trim()}
                    className="absolute right-1.5 px-3 py-1.5 rounded-full bg-amber-400 disabled:opacity-40 hover:bg-amber-300 text-slate-950 font-extrabold text-[11px] transition-all cursor-pointer shadow-xs"
                  >
                    Kết bạn
                  </button>
                </div>
              </div>

              {/* Real Server Users Results */}
              {isSearching ? (
                <div className="text-center py-4 text-xs text-slate-400 animate-pulse">
                  Đang tìm kiếm tài khoản trên hệ thống...
                </div>
              ) : serverUsers.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    Tài khoản tìm thấy trên hệ thống ({serverUsers.length}):
                  </span>
                  {serverUsers.map((u: any) => {
                    const isAlreadyFriend = currentFriends.some(
                      (f) =>
                        f.id === `friend-${u.id}` ||
                        f.name.toLowerCase() === (u.displayName || '').toLowerCase()
                    );

                    const rawHandle =
                      u.tagName ||
                      u.username ||
                      (u.email ? u.email.split('@')[0] : '') ||
                      'snapper';
                    const cleanHandle = rawHandle.replace(/^@+/, '').toLowerCase().trim();
                    const displayTag = `@${cleanHandle}`;

                    return (
                      <div
                        key={u.id}
                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanHandle)}`}
                            alt={u.displayName || displayTag}
                            className="w-9 h-9 rounded-full bg-slate-800 p-0.5 border border-amber-400/40 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {u.displayName || cleanHandle}
                            </p>
                            <p className="text-[11px] text-amber-400 font-mono font-bold truncate">
                              {displayTag}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddServerUser(u)}
                          disabled={isAlreadyFriend}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                            isAlreadyFriend
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                              : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20 cursor-pointer active:scale-95'
                          }`}
                        >
                          {isAlreadyFriend ? '✓ Đã kết bạn' : '+ Kết bạn'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : searchQuery.trim().length >= 2 ? (
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <p className="text-xs text-slate-300">
                    Không tìm thấy tài khoản máy chủ khớp với "{searchQuery}".
                  </p>
                  <button
                    type="button"
                    onClick={handleManualAddUsername}
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Thêm nhanh @{searchQuery.replace(/^@+/, '')} vào danh bạ của tôi →</span>
                  </button>
                </div>
              ) : null}

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dán link mời tiện lợi</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Nếu bạn bè gửi link mời qua tin nhắn, bạn chỉ cần sao chép và dán link vào ô tìm kiếm ở trên để hệ thống tự động kết bạn!
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: HƯỚNG DẪN QUÉT VÀ KẾT NỐI */}
          {activeTab === 'suggested' && (
            <div className="space-y-3 py-1 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/25 space-y-2">
                <h4 className="font-extrabold text-amber-300 text-sm flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Cách quét mã QR kết bạn:</span>
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-[11px] text-slate-300 leading-relaxed">
                  <li>
                    <strong className="text-white">Dùng Camera thường:</strong> Mở ứng dụng Camera trên iPhone hoặc Android, đưa vào mã QR ở tab <strong>"Mã QR của tôi"</strong> của bạn bè.
                  </li>
                  <li>
                    <strong className="text-white">Bấm vào link thông báo:</strong> Trên màn hình sẽ hiện thông báo <em className="text-amber-400">"Mở trong VisuLingo"</em>, bấm vào là bạn và người đó sẽ tự động kết bạn với nhau!
                  </li>
                  <li>
                    <strong className="text-white">Dùng Zalo:</strong> Bạn cũng có thể mở mục Quét mã QR trong Zalo để quét mã VisuLingo này.
                  </li>
                </ol>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <p className="font-bold text-white text-[11px]">Đang có {currentFriends.length} bạn bè trong danh bạ</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Khi đã kết bạn, ảnh Snap học từ mới của nhau sẽ tự động hiển thị trong thanh Story và bảng tin Locket Feed!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
