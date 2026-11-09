export type BadgeConditionType =
  | 'snaps_count'
  | 'saved_words_count'
  | 'streak_days'
  | 'friends_count'
  | 'listen_count';

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  conditionType: BadgeConditionType;
  targetValue: number;
  isActive: boolean;
  createdAt: string;
}

export interface EvaluatedBadge extends BadgeDefinition {
  isUnlocked: boolean;
  currentValue: number;
  progressText: string;
  percent: number;
}

const BADGES_KEY = 'visulingo_custom_badges';

export const DEFAULT_BADGES: BadgeDefinition[] = [
  {
    id: 'badge-camera',
    title: 'Thợ Săn Thị Giác',
    description: 'Chụp và nhận diện đồ vật thực tế qua AI Camera',
    icon: '📸',
    category: 'Khám phá',
    conditionType: 'snaps_count',
    targetValue: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'badge-streak',
    title: 'Chiến Thần Giữ Lửa',
    description: 'Duy trì chuỗi học tập Streak liên tục mỗi ngày',
    icon: '🔥',
    category: 'Streak',
    conditionType: 'streak_days',
    targetValue: 7,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'badge-master',
    title: 'Bậc Thầy Từ Vựng',
    description: 'Tích lũy từ vựng thực tế vào Snapbook cá nhân',
    icon: '👑',
    category: 'Từ vựng',
    conditionType: 'saved_words_count',
    targetValue: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'badge-audio',
    title: 'Phát Âm Bản Xứ',
    description: 'Luyện nghe phát âm chuẩn IPA các từ vựng đã chụp',
    icon: '🗣️',
    category: 'Phát âm',
    conditionType: 'listen_count',
    targetValue: 15,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'badge-buddies',
    title: 'Đôi Bạn Cùng Tiến',
    description: 'Kết nối và chia sẻ từ vựng Snap với bạn bè',
    icon: '🤝',
    category: 'Cộng đồng',
    conditionType: 'friends_count',
    targetValue: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'badge-pro-snapper',
    title: 'Nhiếp Ảnh Gia Ngôn Ngữ',
    description: 'Chinh phục 20 bức ảnh snap đồ vật tiếng Anh',
    icon: '🌟',
    category: 'Khám phá',
    conditionType: 'snaps_count',
    targetValue: 20,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export function getBadges(): BadgeDefinition[] {
  try {
    const raw = localStorage.getItem(BADGES_KEY);
    if (!raw) {
      localStorage.setItem(BADGES_KEY, JSON.stringify(DEFAULT_BADGES));
      return DEFAULT_BADGES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BADGES;
  } catch {
    return DEFAULT_BADGES;
  }
}

export function saveBadge(badge: Omit<BadgeDefinition, 'id' | 'createdAt'>): BadgeDefinition {
  const badges = getBadges();
  const newBadge: BadgeDefinition = {
    ...badge,
    id: `badge-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  badges.unshift(newBadge);
  localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
  window.dispatchEvent(new Event('visulingo_badges_changed'));
  return newBadge;
}

export function updateBadge(id: string, updates: Partial<BadgeDefinition>): BadgeDefinition | null {
  const badges = getBadges();
  const index = badges.findIndex((b) => b.id === id);
  if (index === -1) return null;
  badges[index] = { ...badges[index], ...updates };
  localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
  window.dispatchEvent(new Event('visulingo_badges_changed'));
  return badges[index];
}

export function deleteBadge(id: string): void {
  const badges = getBadges().filter((b) => b.id !== id);
  localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
  window.dispatchEvent(new Event('visulingo_badges_changed'));
}

export interface UserStatsInput {
  snapsCount: number;
  savedWordsCount: number;
  streakDays: number;
  friendsCount: number;
  listenCount?: number;
}

export function evaluateBadges(badges: BadgeDefinition[], stats: UserStatsInput): EvaluatedBadge[] {
  return badges
    .filter((b) => b.isActive)
    .map((b) => {
      let current = 0;
      let unit = '';
      switch (b.conditionType) {
        case 'snaps_count':
          current = stats.snapsCount;
          unit = 'ảnh snap';
          break;
        case 'saved_words_count':
          current = stats.savedWordsCount;
          unit = 'từ vựng';
          break;
        case 'streak_days':
          current = stats.streakDays;
          unit = 'ngày streak';
          break;
        case 'friends_count':
          current = stats.friendsCount;
          unit = 'bạn bè';
          break;
        case 'listen_count':
          current = stats.listenCount || 0;
          unit = 'lần nghe';
          break;
      }

      const isUnlocked = current >= b.targetValue;
      const percent = Math.min(100, Math.round((current / (b.targetValue || 1)) * 100));
      const progressText = isUnlocked
        ? `Đã đạt (${current}/${b.targetValue} ${unit})`
        : `${current}/${b.targetValue} ${unit} (Còn ${Math.max(0, b.targetValue - current)})`;

      return {
        ...b,
        isUnlocked,
        currentValue: current,
        progressText,
        percent,
      };
    });
}
