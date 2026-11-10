import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Flame, Camera, Settings as SettingsIcon, X, MessageSquare, Download } from 'lucide-react';
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
import { getFriends, FriendProfile } from '@/utils/friends';
import { getUnreadNotificationsCount } from '@/utils/notifications';
import { getTotalUnreadChatCount } from '@/utils/chat';

function HomePage() {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as LocketTab) || 'snap';
  const [activeTab, setActiveTab] = useState<LocketTab>(initialTab);

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
  }, [searchParams]);
  const [moments, setMoments] = useState<MomentPost[]>([]);
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
    setMoments(getMoments());
    setFriends(getFriends());
    setSavedCount(getSavedWords().length);
    setUserStreak(getUserStreak());
    setUnreadNotifs(getUnreadNotificationsCount());
    setUnreadChat(getTotalUnreadChatCount());

    // Tự động kéo khoảnh khắc Cloud mới nhất của mọi người từ PostgreSQL Neon
    syncCloudMoments().then((fresh) => {
      if (fresh && fresh.length > 0) {
        setMoments(fresh);
      }
    }).catch(() => {});
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
    };
  }, []);

  const handleSelectFriend = (friendId: string | null) => {
    setSelectedFriendId(friendId);
    setSelectedAlbumId('all'); // Reset to all photos of that person
  };

  const selectedFriend = friends.find((f) => f.id === selectedFriendId);

  // Compute displayed posts:
  // - If viewing a specific friend: display photos from that friend's custom albums
  // - If in "Tất cả": display all community feed moments
  let displayPosts: MomentPost[] = [];

  if (selectedFriend) {
    const friendAlbums = selectedFriend.albums || [];

    if (selectedAlbumId === 'all') {
      // All photos from all albums of this friend
      displayPosts = friendAlbums.flatMap((album) =>
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
    } else {
      // Only photos from the selected album
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

            {/* 2. Unified Social Inbox (Tin nhắn & Hoạt động) */}
            <button
              type="button"
              onClick={() => {
                setChatFriendId(null);
                setIsChatOpen(true);
              }}
              className="relative p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Hộp thư: Tin nhắn & Hoạt động"
            >
              <MessageSquare className="w-4 h-4" />
              {(unreadChat > 0 || unreadNotifs > 0) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#0B0F17]" />
              )}
            </button>

            {/* 3. Settings */}
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
              <div className="text-center py-10 bg-[#161D2B]/50 border border-white/10 rounded-[28px] p-6 space-y-3 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto shadow-md">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">Chưa có bài đăng nào trên Feed</p>
                  <p className="text-[11px] text-slate-400">Hãy chụp Snap đầu tiên để lưu lại từ vựng thực tế nhé!</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('snap')}
                  className="px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-400/20 active:scale-95"
                >
                  Chụp Snap ngay
                </button>
              </div>
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
