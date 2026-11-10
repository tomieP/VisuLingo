import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Flame, Camera, Settings as SettingsIcon, X, MessageSquare, Download, Bell, Sparkles } from 'lucide-react';
import { InstallAppModal } from '@/components/common/InstallAppModal';
import { TagSkinModal } from '@/components/locket/TagSkinModal';
import { VisuLingoLogo } from '@/components/common/VisuLingoLogo';
import { LocketBottomBar, LocketTab } from '@/components/locket/LocketBottomBar';
import { LocketFeedCard } from '@/components/locket/LocketFeedCard';
import { LocketCameraView } from '@/components/locket/LocketCameraView';
import { LocketPocketView } from '@/components/locket/LocketPocketView';
import { FriendsStoryBar } from '@/components/locket/FriendsStoryBar';
import { FriendProfileModal } from '@/components/locket/FriendProfileModal';
import { NotificationsModal } from '@/components/locket/NotificationsModal';
import { FriendLeaderboardModal } from '@/components/locket/FriendLeaderboardModal';
import { DirectChatModal } from '@/components/locket/DirectChatModal';
import { DailyChallengesModal } from '@/components/locket/DailyChallengesModal';
import { getMoments, syncCloudMoments, MomentPost } from '@/utils/moments';
import { getSavedWords, getUserStreak } from '@/utils/storage';
import { getFriends, addNewFriend, FriendProfile } from '@/utils/friends';
import { getUnreadNotificationsCount, addNotification, AppNotification } from '@/utils/notifications';
import { getTotalUnreadChatCount } from '@/utils/chat';

function HomePage() {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as LocketTab) || 'snap';
  const [activeTab, setActiveTab] = useState<LocketTab>(initialTab);
  const [friendToast, setFriendToast] = useState<string | null>(null);
  const [liveNotif, setLiveNotif] = useState<AppNotification | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as LocketTab;
    if (tabParam === 'pocket' || tabParam === 'feed' || tabParam === 'snap') {
      setActiveTab(tabParam);
    }
    if (tabParam === 'feed') {
      syncCloudMoments().then((cloudList) => {
        if (cloudList && cloudList.length > 0) setMoments(cloudList);
      });
    }

    // Tự động kết bạn khi mở link mời hoặc quét mã QR chứa ?addFriend=@username
    const addFriendParam = searchParams.get('addFriend');
    if (addFriendParam) {
      const friendName = searchParams.get('name') || addFriendParam.replace(/^@+/, '');
      const friendAvatar =
        searchParams.get('avatar') ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
      const cleanHandle = addFriendParam.startsWith('@') ? addFriendParam : `@${addFriendParam}`;

      const newFriend: FriendProfile = {
        id: `friend-${cleanHandle.toLowerCase().replace(/[^a-z0-9_.]/g, '')}`,
        name: friendName,
        username: cleanHandle,
        avatar: friendAvatar,
        bio: 'Bạn bè kết nối qua mã QR / link mời ✨',
        badge: 'Bạn mới 🤝',
        streak: 1,
        totalWords: 0,
        snapsCount: 0,
        isFollowing: true,
        albums: [],
      };

      addNewFriend(newFriend);
      setFriends(getFriends());
      setFriendToast(`🎉 Bạn đã kết bạn thành công với ${friendName} (${cleanHandle})!`);
      setTimeout(() => setFriendToast(null), 5500);

      // Lưu vào danh sách thông báo chính thức
      addNotification({
        type: 'vocab_share',
        actor: {
          name: friendName,
          avatar: friendAvatar,
          badge: 'Bạn mới 🤝',
        },
        text: 'đã kết bạn với bạn qua mã QR / link mời! Hãy chụp Snap từ vựng gửi lời chào nhé 👋',
        actionLabel: 'Chụp Snap ngay',
        actionType: 'reply_reaction',
      });

      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);
  const [moments, setMoments] = useState<MomentPost[]>(getMoments());
  const [isSyncing, setIsSyncing] = useState<boolean>(true);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [userStreak, setUserStreak] = useState<number>(getUserStreak());
  const [unreadNotifs, setUnreadNotifs] = useState<number>(0);
  const [unreadChat, setUnreadChat] = useState<number>(0);

  // Social filtering & modal states
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('all');
  const [selectedFriendProfile, setSelectedFriendProfile] = useState<FriendProfile | null>(null);
  const [isNotifsOpen, setIsNotifsOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isChallengesOpen, setIsChallengesOpen] = useState<boolean>(false);
  const [isTagSkinOpen, setIsTagSkinOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatFriendId, setChatFriendId] = useState<string | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  const loadData = () => {
    const currentMoments = getMoments();
    setMoments(currentMoments);

    // Tự động đồng bộ bạn bè từ danh sách bạn đã thêm và các thành viên đã đăng Snap trên Feed
    const cleanName = (s?: string) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const explicitFriends = getFriends();
    const friendsMap = new Map<string, FriendProfile>();
    explicitFriends.forEach((f) => friendsMap.set(f.id, f));

    currentMoments.forEach((m) => {
      const aName = (m.author?.name || '').replace(/\s+/g, ' ').trim();
      if (aName && aName !== 'Bạn (Me)' && aName.toLowerCase() !== 'bạn') {
        const friendId = `snapper-${cleanName(aName).replace(/[^a-z0-9_.]/g, '')}`;
        if (!friendsMap.has(friendId)) {
          const exists = Array.from(friendsMap.values()).some(
            (ef) => cleanName(ef.name) === cleanName(aName)
          );
          if (!exists) {
            friendsMap.set(friendId, {
              id: friendId,
              name: aName,
              username: `@${cleanName(aName).replace(/[^a-z0-9_.]/g, '')}`,
              avatar: m.author.avatar,
              bio: `Thành viên học tập tích cực trên VisuLingo ✨`,
              badge: m.author.badge || 'Snapper 🔥',
              streak: 3,
              totalWords: 15,
              snapsCount: 1,
              isFollowing: true,
              albums: [],
            });
          }
        }
      }
    });

    setFriends(Array.from(friendsMap.values()));
    setSavedCount(getSavedWords().length);
    setUserStreak(getUserStreak());
    setUnreadNotifs(getUnreadNotificationsCount());
    setUnreadChat(getTotalUnreadChatCount());

    // Tự động kéo khoảnh khắc Cloud mới nhất của mọi người từ PostgreSQL Neon
    syncCloudMoments()
      .then((fresh) => {
        setIsSyncing(false);
        if (fresh && fresh.length > 0) {
          setMoments(fresh);
          fresh.forEach((m) => {
            const aName = (m.author?.name || '').replace(/\s+/g, ' ').trim();
            if (aName && aName !== 'Bạn (Me)' && aName.toLowerCase() !== 'bạn') {
              const friendId = `snapper-${cleanName(aName).replace(/[^a-z0-9_.]/g, '')}`;
              if (!friendsMap.has(friendId)) {
                const exists = Array.from(friendsMap.values()).some(
                  (ef) => cleanName(ef.name) === cleanName(aName)
                );
                if (!exists) {
                  friendsMap.set(friendId, {
                    id: friendId,
                    name: aName,
                    username: `@${cleanName(aName).replace(/[^a-z0-9_.]/g, '')}`,
                    avatar: m.author.avatar,
                    bio: `Thành viên học tập tích cực trên VisuLingo ✨`,
                    badge: m.author.badge || 'Snapper 🔥',
                    streak: 3,
                    totalWords: 15,
                    snapsCount: 1,
                    isFollowing: true,
                    albums: [],
                  });
                }
              }
            }
          });
          setFriends(Array.from(friendsMap.values()));
        }
      })
      .catch(() => {
        setIsSyncing(false);
      });
  };

  useEffect(() => {
    loadData();

    const handleMoments = () => setMoments(getMoments());
    const handleSaved = () => setSavedCount(getSavedWords().length);
    const handleStreak = () => setUserStreak(getUserStreak());
    window.addEventListener('visulingo_streak_changed', handleStreak);
    const handleFriends = () => setFriends(getFriends());
    const handleNotifs = () => setUnreadNotifs(getUnreadNotificationsCount());
    const handleChat = () => setUnreadChat(getTotalUnreadChatCount());

    const handleNewNotifToast = (e: any) => {
      const notif = e.detail;
      if (notif) {
        setLiveNotif(notif);
        setTimeout(() => setLiveNotif(null), 5000);
      }
    };
    window.addEventListener('visulingo_new_notification_toast', handleNewNotifToast);

    window.addEventListener('visulingo_moments_changed', handleMoments);
    window.addEventListener('visulingo_saved_words_changed', handleSaved);
    window.addEventListener('visulingo_friends_changed', handleFriends);
    window.addEventListener('visulingo_notifications_changed', handleNotifs);
    window.addEventListener('visulingo_chat_changed', handleChat);

    return () => {
      window.removeEventListener('visulingo_moments_changed', handleMoments);
      window.removeEventListener('visulingo_saved_words_changed', handleSaved);
      window.removeEventListener('visulingo_streak_changed', handleStreak);
      window.removeEventListener('visulingo_friends_changed', handleFriends);
      window.removeEventListener('visulingo_notifications_changed', handleNotifs);
      window.removeEventListener('visulingo_chat_changed', handleChat);
      window.removeEventListener('visulingo_new_notification_toast', handleNewNotifToast);
    };
  }, []);

  const handleSelectFriend = (friendId: string | null) => {
    setSelectedFriendId(friendId);
    setSelectedAlbumId('all'); // Reset to all photos of that person
  };

  const selectedFriend = friends.find((f) => f.id === selectedFriendId);

  // Compute displayed posts:
  // - If viewing a specific friend: display all real snaps from that friend + album photos
  // - If in "Tất cả": display all community feed moments
  let displayPosts: MomentPost[] = [];

  if (selectedFriend) {
    // 1. Lọc tất cả bài Snap của bạn bè này trên Bảng tin Cloud Feed (chuẩn hóa khoảng trắng & hoa thường)
    const cleanStr = (s?: string) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const targetName = cleanStr(selectedFriend.name);
    const targetUsername = cleanStr(selectedFriend.username).replace(/^@+/, '');

    const friendMoments = moments.filter((m) => {
      const authorName = cleanStr(m.author?.name);
      return (
        authorName === targetName ||
        authorName.includes(targetName) ||
        targetName.includes(authorName) ||
        (targetUsername && (authorName.includes(targetUsername) || targetUsername.includes(authorName)))
      );
    });

    const friendAlbums = selectedFriend.albums || [];
    let albumPosts: MomentPost[] = [];

    if (selectedAlbumId === 'all') {
      albumPosts = friendAlbums.flatMap((album) =>
        (album.photos || []).map((photo) => ({
          id: photo.id,
          author: {
            name: selectedFriend.name,
            avatar: selectedFriend.avatar,
            badge: selectedFriend.badge,
          },
          caption: photo.caption,
          imageUrl: photo.imageUrl,
          timeAgo: photo.timeAgo,
          vocabTags: photo.vocabTags || [],
          reactions: { fire: 14, heart: 26, sparkles: 9 },
          comments: [],
        }))
      );
      // Kết hợp bài Cloud Moments thực tế với album
      const combined = [...friendMoments];
      albumPosts.forEach((ap) => {
        if (!combined.some((m) => m.imageUrl === ap.imageUrl || m.id === ap.id)) {
          combined.push(ap);
        }
      });
      displayPosts = combined;
    } else {
      const targetAlbum = friendAlbums.find((a) => a.id === selectedAlbumId);
      if (targetAlbum) {
        displayPosts = (targetAlbum.photos || []).map((photo) => ({
          id: photo.id,
          author: {
            name: selectedFriend.name,
            avatar: selectedFriend.avatar,
            badge: `${targetAlbum.emoji} ${targetAlbum.title}`,
          },
          caption: photo.caption,
          imageUrl: photo.imageUrl,
          timeAgo: photo.timeAgo,
          vocabTags: photo.vocabTags || [],
          reactions: { fire: 11, heart: 20, sparkles: 7 },
          comments: [],
        }));
      } else {
        displayPosts = friendMoments;
      }
    }
  } else {
    // Community Feed (Tất cả)
    displayPosts = moments;
  }

  return (
    <div className="min-h-[100dvh] bg-[#0B0F17] text-white flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Top Header with Safe Area Notch Protection */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0F17]/92 border-b border-white/5 px-3 sm:px-6 pt-[max(env(safe-area-inset-top),12px)] pb-2.5 transition-all">
        <div className="max-w-md mx-auto flex items-center justify-between gap-1">
          {/* Logo (Clean & compact, no bulky badge) */}
          <VisuLingoLogo size="sm" showBadge={false} />

          {/* Header Action Row: Adaptive for small phone screens */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 0. Tải App button */}
            <button
              type="button"
              onClick={() => setIsInstallModalOpen(true)}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-[11px] sm:text-xs font-bold text-amber-300 transition-all cursor-pointer group shadow-xs shrink-0"
              title="Tải ứng dụng về màn hình chính"
            >
              <Download className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="hidden xs:inline sm:inline">Tải App</span>
            </button>

            {/* 1. Streak flame badge */}
            <button
              type="button"
              onClick={() => setIsLeaderboardOpen(true)}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 text-xs font-bold text-amber-300 transition-all cursor-pointer group shrink-0"
              title="Chuỗi streak của bạn & Bảng xếp hạng"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
              <span>{userStreak}</span>
            </button>

            {/* 2. Notifications Bell button */}
            <button
              type="button"
              onClick={() => setIsNotifsOpen(true)}
              className="relative p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Thông báo tương tác (Tim, Bình luận, Bạn bè)"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[9px] font-black text-white flex items-center justify-center ring-2 ring-[#0B0F17] animate-pulse">
                  {unreadNotifs > 99 ? '99+' : unreadNotifs}
                </span>
              )}
            </button>

            {/* 3. Direct Chat (Tin nhắn) */}
            <button
              type="button"
              onClick={() => {
                setChatFriendId(null);
                setIsChatOpen(true);
              }}
              className="relative p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Tin nhắn bạn bè"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadChat > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#0B0F17]" />
              )}
            </button>

            {/* 4. Settings */}
            <Link
              to="/settings"
              className="p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors shrink-0"
              title="Cài đặt & Hồ sơ"
            >
              <SettingsIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Floating real-time Notification Toast */}
      {liveNotif && (
        <div
          onClick={() => {
            setIsNotifsOpen(true);
            setLiveNotif(null);
          }}
          className="sticky top-[max(env(safe-area-inset-top),60px)] z-50 max-w-md mx-auto w-full px-3 py-1 animate-in fade-in slide-in-from-top-3 cursor-pointer"
        >
          <div className="p-3 rounded-2xl bg-[#161D2B]/95 backdrop-blur-xl border border-amber-400/50 shadow-2xl shadow-amber-400/20 flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={liveNotif.actor.avatar}
                alt=""
                className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/50 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {liveNotif.actor.name}{' '}
                  <span className="font-normal text-slate-300">{liveNotif.text}</span>
                </p>
                <p className="text-[10px] text-amber-400 font-semibold">{liveNotif.timeAgo || 'Vừa xong'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLiveNotif(null);
              }}
              className="p-1 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Toast popup when friend added from link/QR */}
      {friendToast && (
        <div className="sticky top-[max(env(safe-area-inset-top),60px)] z-50 max-w-md mx-auto w-full px-3 py-1 animate-in fade-in slide-in-from-top-2">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs shadow-xl flex items-center justify-between gap-2 border border-amber-300">
            <span>{friendToast}</span>
            <button
              type="button"
              onClick={() => setFriendToast(null)}
              className="p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-2.5 sm:px-4 py-2 sm:py-3 flex flex-col justify-start">
        {/* Tab 1: Snap & Scan Viewfinder (Camera Center) */}
        {activeTab === 'snap' && (
          <LocketCameraView onMomentShared={() => setActiveTab('feed')} />
        )}

        {/* Tab 2: Friends Moments Feed */}
        {activeTab === 'feed' && (
          <div className="space-y-3 pb-24">
            {/* 1. Friends Story Tray */}
            <div className="px-0.5">
              <FriendsStoryBar
                friends={friends}
                selectedFriendId={selectedFriendId}
                onSelectFriend={handleSelectFriend}
                onOpenProfile={(friend) => setSelectedFriendProfile(friend)}
              />
            </div>

            {/* 2. Friend Album Filter Bar (ONLY visible when a friend is selected) */}
            {selectedFriend ? (
              <div className="pt-1 pb-0.5 space-y-1.5 border-t border-white/5 animate-fadeIn">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <span className="font-bold text-white">Album của {selectedFriend.name.split(' ').pop()}</span>
                    <span className="text-[10px] text-amber-400 font-bold">({(selectedFriend.albums || []).length} album)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectFriend(null)}
                    className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                    title="Quay lại bảng tin chung"
                  >
                    <X className="w-3 h-3" />
                    <span>Xem tất cả feed</span>
                  </button>
                </div>

                {/* Specific friend album pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedAlbumId('all')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedAlbumId === 'all'
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                        : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    Tất cả ảnh ✨
                  </button>

                  {(selectedFriend.albums || []).map((album) => (
                    <button
                      key={album.id}
                      type="button"
                      onClick={() => setSelectedAlbumId(album.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        selectedAlbumId === album.id
                          ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                          : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{album.emoji}</span>
                      <span>{album.title}</span>
                      <span className="text-[10px] opacity-75">({(album.photos || []).length})</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* 3. Snaps List */}
            {displayPosts.length === 0 ? (
              isSyncing ? (
                <div className="text-center py-12 bg-[#161D2B]/50 border border-white/10 rounded-[28px] p-6 space-y-3 text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto shadow-md">
                    <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Đang đồng bộ khoảnh khắc từ Cloud...</p>
                    <p className="text-[11px] text-slate-400">Đang kéo Snaps từ Neon PostgreSQL về máy bạn ✨</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-[#161D2B]/50 border border-white/10 rounded-[28px] p-6 space-y-3 text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto shadow-md">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Chưa có bài đăng nào trên Feed</p>
                    <p className="text-[11px] text-slate-400">Hãy chụp Snap đầu tiên để lưu lại từ vựng thực tế nhé!</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSyncing(true);
                        syncCloudMoments().finally(() => setIsSyncing(false));
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all border border-white/10 cursor-pointer active:scale-95"
                    >
                      Đồng bộ lại Cloud 🔄
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('snap')}
                      className="px-4 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer"
                    >
                      Chụp Snap ngay
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {displayPosts.map((moment) => (
                  <LocketFeedCard
                    key={moment.id}
                    moment={moment}
                    onAuthorClick={() => {
                      const friend = friends.find(
                        (f) =>
                          moment.author.name.toLowerCase().includes(f.name.toLowerCase()) ||
                          f.name.toLowerCase().includes(moment.author.name.toLowerCase())
                      );
                      if (friend) setSelectedFriendProfile(friend);
                    }}
                    onOpenChatWithFriend={(friendId) => {
                      setChatFriendId(friendId);
                      setIsChatOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: My Locket (Personal saved vocabulary & study) */}
        {activeTab === 'pocket' && <LocketPocketView />}
      </main>

      {/* Floating Bottom Navigation */}
      <LocketBottomBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'feed') {
            syncCloudMoments().then((list) => {
              if (list && list.length > 0) setMoments(list);
            });
          }
        }}
        savedCount={savedCount}
      />

      {/* Friend Profile Modal */}
      <FriendProfileModal
        friend={selectedFriendProfile}
        isOpen={!!selectedFriendProfile}
        onClose={() => setSelectedFriendProfile(null)}
        onUpdated={loadData}
        onStartChat={(fId) => {
          setChatFriendId(fId);
          setIsChatOpen(true);
        }}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotifsOpen}
        onClose={() => setIsNotifsOpen(false)}
        onOpenChatWithFriend={(friendName) => {
          const f = friends.find((fr) => fr.name.toLowerCase().includes(friendName.toLowerCase()));
          if (f) setChatFriendId(f.id);
          setIsChatOpen(true);
        }}
      />

      {/* Friend Leaderboard Modal */}
      <FriendLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      {/* Tag Skin Modal */}
      <TagSkinModal
        isOpen={isTagSkinOpen}
        onClose={() => setIsTagSkinOpen(false)}
      />

      {/* Daily Challenges Modal */}
      <DailyChallengesModal
        isOpen={isChallengesOpen}
        onClose={() => setIsChallengesOpen(false)}
      />

      {/* Direct Chat Modal */}
      <DirectChatModal
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatFriendId(null);
        }}
        initialFriendId={chatFriendId}
      />

      {/* PWA Install App Modal for iOS & Android */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}

export default HomePage;
