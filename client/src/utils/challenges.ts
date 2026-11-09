export type ChallengeType =
  | 'snap_photos'
  | 'save_words'
  | 'maintain_streak'
  | 'listen_pronunciation';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: ChallengeType;
  targetCount: number;
  rewardXp: number;
  isActive: boolean;
  createdAt: string;
}

export interface EvaluatedChallenge extends DailyChallenge {
  currentCount: number;
  isCompleted: boolean;
  isClaimed: boolean;
  progressPercent: number;
}

const CHALLENGES_KEY = 'visulingo_daily_challenges_def';
const XP_KEY = 'visulingo_user_xp';

export const DEFAULT_CHALLENGES: DailyChallenge[] = [
  {
    id: 'ch-snap-1',
    title: 'Chụp 1 khoảnh khắc mới',
    description: 'Chụp một đồ vật bất kỳ quanh bạn để AI nhận diện',
    icon: '📸',
    type: 'snap_photos',
    targetCount: 1,
    rewardXp: 50,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ch-save-2',
    title: 'Lưu 2 từ vựng vào Sổ',
    description: 'Ghi nhớ và lưu lại 2 từ vựng thực tế hôm nay',
    icon: '📚',
    type: 'save_words',
    targetCount: 2,
    rewardXp: 60,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ch-audio-3',
    title: 'Luyện nghe phát âm chuẩn',
    description: 'Bấm nút loa nghe phát âm 3 từ vựng để chuẩn hóa phản xạ',
    icon: '🗣️',
    type: 'listen_pronunciation',
    targetCount: 3,
    rewardXp: 40,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ch-streak-4',
    title: 'Duy trì ngọn lửa Streak',
    description: 'Đăng nhập và hoạt động trong ngày để giữ chuỗi ngày học',
    icon: '🔥',
    type: 'maintain_streak',
    targetCount: 1,
    rewardXp: 100,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getChallenges(): DailyChallenge[] {
  try {
    const raw = localStorage.getItem(CHALLENGES_KEY);
    if (!raw) {
      localStorage.setItem(CHALLENGES_KEY, JSON.stringify(DEFAULT_CHALLENGES));
      return DEFAULT_CHALLENGES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CHALLENGES;
  } catch {
    return DEFAULT_CHALLENGES;
  }
}

export function saveChallenge(challenge: Omit<DailyChallenge, 'id' | 'createdAt'>): DailyChallenge {
  const challenges = getChallenges();
  const newChallenge: DailyChallenge = {
    ...challenge,
    id: `ch-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  challenges.unshift(newChallenge);
  localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
  window.dispatchEvent(new Event('visulingo_challenges_changed'));
  return newChallenge;
}

export function updateChallenge(id: string, updates: Partial<DailyChallenge>): DailyChallenge | null {
  const challenges = getChallenges();
  const idx = challenges.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  challenges[idx] = { ...challenges[idx], ...updates };
  localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
  window.dispatchEvent(new Event('visulingo_challenges_changed'));
  return challenges[idx];
}

export function deleteChallenge(id: string): void {
  const challenges = getChallenges().filter((c) => c.id !== id);
  localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
  window.dispatchEvent(new Event('visulingo_challenges_changed'));
}

export function getUserXp(): number {
  return parseInt(localStorage.getItem(XP_KEY) || '120', 10);
}

export function addXp(amount: number): number {
  const current = getUserXp();
  const updated = current + amount;
  localStorage.setItem(XP_KEY, updated.toString());
  window.dispatchEvent(new Event('visulingo_xp_changed'));
  return updated;
}

function getProgressStorageKey(): string {
  return `visulingo_ch_progress_${getTodayDateString()}`;
}

function getClaimedStorageKey(): string {
  return `visulingo_ch_claimed_${getTodayDateString()}`;
}

export function getDailyProgressMap(): Record<ChallengeType, number> {
  try {
    const raw = localStorage.getItem(getProgressStorageKey());
    const base: Record<ChallengeType, number> = {
      snap_photos: 0,
      save_words: 0,
      maintain_streak: 1, // Logging in counts as maintaining streak
      listen_pronunciation: 0,
    };
    if (!raw) return base;
    return { ...base, ...JSON.parse(raw) };
  } catch {
    return {
      snap_photos: 0,
      save_words: 0,
      maintain_streak: 1,
      listen_pronunciation: 0,
    };
  }
}

export function incrementChallengeProgress(type: ChallengeType, amount = 1): void {
  const current = getDailyProgressMap();
  current[type] = (current[type] || 0) + amount;
  localStorage.setItem(getProgressStorageKey(), JSON.stringify(current));
  window.dispatchEvent(new Event('visulingo_challenges_progress_changed'));
}

export function getClaimedChallengeIds(): string[] {
  try {
    const raw = localStorage.getItem(getClaimedStorageKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function claimChallengeReward(challengeId: string): boolean {
  const challenges = getChallenges();
  const challenge = challenges.find((c) => c.id === challengeId);
  if (!challenge) return false;

  const claimed = getClaimedChallengeIds();
  if (claimed.includes(challengeId)) return false;

  const progress = getDailyProgressMap();
  const currentCount = progress[challenge.type] || 0;
  if (currentCount < challenge.targetCount) return false;

  claimed.push(challengeId);
  localStorage.setItem(getClaimedStorageKey(), JSON.stringify(claimed));
  addXp(challenge.rewardXp);
  window.dispatchEvent(new Event('visulingo_challenges_progress_changed'));
  return true;
}

export function getEvaluatedChallenges(): EvaluatedChallenge[] {
  const challenges = getChallenges().filter((c) => c.isActive);
  const progress = getDailyProgressMap();
  const claimed = getClaimedChallengeIds();

  return challenges.map((c) => {
    const currentCount = progress[c.type] || 0;
    const isCompleted = currentCount >= c.targetCount;
    const isClaimed = claimed.includes(c.id);
    const progressPercent = Math.min(100, Math.round((currentCount / (c.targetCount || 1)) * 100));

    return {
      ...c,
      currentCount,
      isCompleted,
      isClaimed,
      progressPercent,
    };
  });
}
