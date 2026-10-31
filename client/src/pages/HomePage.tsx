import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Flame, Settings as SettingsIcon, X, Bell, Trophy, MessageSquare } from 'lucide-react';
import { LocketBottomBar, LocketTab } from '@/components/locket/LocketBottomBar';
import { LocketFeedCard } from '@/components/locket/LocketFeedCard';
import { LocketCameraView } from '@/components/locket/LocketCameraView';
import { LocketPocketView } from '@/components/locket/LocketPocketView';
import { FriendsStoryBar } from '@/components/locket/FriendsStoryBar';
import { FriendProfileModal } from '@/components/locket/FriendProfileModal';
import { NotificationsModal } from '@/components/locket/NotificationsModal';
import { FriendLeaderboardModal } from '@/components/locket/FriendLeaderboardModal';
import { DirectChatModal } from '@/components/locket/DirectChatModal';
import { getMoments, MomentPost } from '@/utils/moments';
import { getSavedWords } from '@/utils/storage';
import { getFriends, FriendProfile } from '@/utils/friends';
import { getUnreadNotificationsCount } from '@/utils/notifications';
import { getTotalUnreadChatCount } from '@/utils/chat';

function HomePage() {
  const [activeTab, setActiveTab] = useState<LocketTab>('snap');
  const [moments, setMoments] = useState<MomentPost[]>([]);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [unreadNotifs, setUnreadNotifs] = useState<number>(0);
  const [unreadChat, setUnreadChat] = useState<number>(0);

  // Social filtering & modal states
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('all');
  const [selectedFriendProfile, setSelectedFriendProfile] = useState<FriendProfile | null>(null);
  const [isNotifsOpen, setIsNotifsOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatFriendId, setChatFriendId] = useState<string | null>(null);

  const loadData = () => {
    setMoments(getMoments());
    setFriends(getFriends());
    setSavedCount(getSavedWords().length);
    setUnreadNotifs(getUnreadNotificationsCount());
    setUnreadChat(getTotalUnreadChatCount());
  };

  useEffect(() => {
    loadData();

    const handleMoments = () => setMoments(getMoments());
    const handleSaved = () => setSavedCount(getSavedWords().length);
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
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0F17]/85 border-b border-white/5 py-2.5 px-4 sm:px-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* Logo & Vibe */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20">
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                VisuLingo
              </span>
              <span className="ml-1.5 px-1.5 py-0.2 text-[8px] font-black uppercase rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Snaps
              </span>
            </div>
          </div>

          {/* Header Action Row */}
          <div className="flex items-center gap-2">
            {/* Friends online preview */}
            <div
              onClick={() => setActiveTab('feed')}
              className="flex items-center -space-x-1.5 cursor-pointer hover:opacity-90"
              title="Xem bạn bè đang học"
            >
              {friends.slice(0, 3).map((f) => (
                <img
                  key={f.id}
                  src={f.avatar}
                  alt={f.name}
                  className="w-6 h-6 rounded-full border-2 border-[#0B0F17] object-cover shrink-0"
                />
              ))}
            </div>

            {/* Streak flame badge (Click to open Leaderboard) */}
            <button
              type="button"
              onClick={() => setIsLeaderboardOpen(true)}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-bold text-amber-400 transition-colors cursor-pointer group"
              title="Bảng xếp hạng tuần"
            >
              <Trophy className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
              <Flame className="w-3 h-3 fill-amber-400" />
              <span>5</span>
            </button>

            {/* Direct Chat Button */}
            <button
              type="button"
              onClick={() => {
                setChatFriendId(null);
                setIsChatOpen(true);
              }}
              className="relative p-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title="Tin nhắn bạn bè"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {unreadChat > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#0B0F17]" />
              )}
            </button>

            {/* Notifications Bell */}
            <button
              type="button"
              onClick={() => setIsNotifsOpen(true)}
              className="relative p-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title="Hoạt động thông minh"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0B0F17]" />
              )}
            </button>

            {/* Settings button */}
            <Link
              to="/settings"
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title="Cài đặt & Hồ sơ"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-3.5 py-3">
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
              <div className="text-center py-10 bg-[#161D2B]/50 border border-white/10 rounded-[28px] p-6 space-y-2 text-slate-400">
                <p className="text-xs font-semibold">Chưa có bài đăng nào trong album này</p>
                {selectedFriend && (
                  <button
                    type="button"
                    onClick={() => setSelectedAlbumId('all')}
                    className="text-xs font-bold text-amber-400 hover:underline"
                  >
                    Xem tất cả ảnh của {selectedFriend.name}
                  </button>
                )}
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
        onTabChange={setActiveTab}
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

      {/* Direct Chat Modal */}
      <DirectChatModal
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatFriendId(null);
        }}
        initialFriendId={chatFriendId}
      />
    </div>
  );
}

export default HomePage;
