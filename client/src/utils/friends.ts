import { VocabTag } from './moments';

export interface FriendSnapPhoto {
  id: string;
  imageUrl: string;
  caption: string;
  timeAgo: string;
  vocabTags: VocabTag[];
}

export interface FriendAlbum {
  id: string;
  title: string;
  emoji: string;
  description: string;
  photos: FriendSnapPhoto[];
}

export interface FriendProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  badge: string;
  streak: number;
  totalWords: number;
  snapsCount: number;
  isFollowing: boolean;
  albums: FriendAlbum[];
}

const FRIENDS_KEY = 'visulingo_friends_data';

const BANNED_FRIEND_IDS = new Set([
  'friend-1',
  'friend-2',
  'friend-3',
  'friend-4',
  'sug-1',
  'sug-2',
  'sug-3',
]);

const BANNED_FRIEND_NAMES = new Set([
  'Minh Quân',
  'Khánh Linh',
  'Thành Nam',
  'Hương Ly',
  'Tuấn Anh',
  'Mai Chi',
]);

export function getFriends(): FriendProfile[] {
  try {
    const raw = localStorage.getItem(FRIENDS_KEY);
    if (!raw) return [];
    const parsed: FriendProfile[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const filtered = parsed.filter(
      (f) => !BANNED_FRIEND_IDS.has(f.id) && !BANNED_FRIEND_NAMES.has(f.name)
    );

    if (filtered.length !== parsed.length) {
      localStorage.setItem(FRIENDS_KEY, JSON.stringify(filtered));
    }

    return filtered;
  } catch {
    return [];
  }
}

export function toggleFollowFriend(friendId: string): FriendProfile[] {
  const friends = getFriends();
  const target = friends.find((f) => f.id === friendId);
  if (target) {
    target.isFollowing = !target.isFollowing;
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
    window.dispatchEvent(new Event('visulingo_friends_changed'));
  }
  return friends;
}

export function addNewFriend(newFriend: FriendProfile): FriendProfile[] {
  if (BANNED_FRIEND_IDS.has(newFriend.id) || BANNED_FRIEND_NAMES.has(newFriend.name)) {
    return getFriends();
  }
  const friends = getFriends();
  if (friends.some((f) => f.id === newFriend.id)) return friends;
  friends.push(newFriend);
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
  window.dispatchEvent(new Event('visulingo_friends_changed'));
  return friends;
}
