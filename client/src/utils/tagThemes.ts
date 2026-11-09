import { getUserXp, addXp } from './challenges';

export type TagThemeId =
  | 'classic'
  | 'cyber_cyan'
  | 'flame_orange'
  | 'emerald_green'
  | 'frost_white'
  | 'luxury_gold'
  | 'violet_nitro'
  | 'ruby_sunset'
  | 'kitty_ribbon'
  | 'halloween_bat'
  | 'manga_comic';

export type TagFrameStyle = 'standard' | 'kitty_ribbon' | 'halloween_bat' | 'manga_comic';

export interface TagThemeClasses {
  pill: string;
  dot: string;
  text: string;
  speaker: string;
  selectedRing: string;
}

export interface TagTheme {
  id: TagThemeId;
  name: string;
  description: string;
  category: 'free_milestone' | 'snapboost_vip';
  accentColor: string; // for UI swatches
  glowShadow: string;
  conditionText: string;
  frameStyle?: TagFrameStyle;
  milestoneType?: 'snaps' | 'streak' | 'words' | 'listen';
  milestoneTarget?: number;
  xpPrice?: number;
  classes: TagThemeClasses;
}

export const TAG_THEMES: TagTheme[] = [
  {
    id: 'classic',
    name: 'Cổ Điển Mặc Định',
    description: 'Kính đen mờ tối giản chuẩn Locket, viền xám khói sắc nét',
    category: 'free_milestone',
    accentColor: '#10b981',
    glowShadow: '0 0 10px rgba(0,0,0,0.5)',
    conditionText: 'Mặc định cho tất cả Snappers',
    classes: {
      pill: 'bg-black/75 hover:bg-black/90 text-white border border-white/25 shadow-black/50',
      dot: 'bg-emerald-400 shadow-[0_0_6px_#34d399]',
      text: 'text-white font-bold',
      speaker: 'text-amber-300 hover:text-white',
      selectedRing: 'ring-4 ring-white/30',
    },
  },
  {
    id: 'flame_orange',
    name: 'Lửa Rực Cháy (Crimson Flame)',
    description: 'Ánh sáng cam đỏ nhiệt huyết phát quang bập bùng',
    category: 'free_milestone',
    accentColor: '#f97316',
    glowShadow: '0 0 16px rgba(249,115,22,0.45)',
    conditionText: 'Duy trì chuỗi Streak 3 ngày',
    milestoneType: 'streak',
    milestoneTarget: 3,
    xpPrice: 150,
    classes: {
      pill: 'bg-slate-950/85 hover:bg-slate-900 text-white border border-orange-500/60 shadow-[0_0_16px_rgba(249,115,22,0.45)]',
      dot: 'bg-orange-400 shadow-[0_0_8px_#fb923c]',
      text: 'text-orange-50 font-bold',
      speaker: 'text-orange-300 hover:text-orange-100',
      selectedRing: 'ring-4 ring-orange-500/40',
    },
  },
  {
    id: 'cyber_cyan',
    name: 'Xanh Dạ Quang (Cyber Cyan)',
    description: 'Đèn Neon xanh băng huỳnh quang cực sáng trong đêm',
    category: 'free_milestone',
    accentColor: '#22d3ee',
    glowShadow: '0 0 16px rgba(34,211,238,0.45)',
    conditionText: 'Chụp 5 ảnh Snap thực tế',
    milestoneType: 'snaps',
    milestoneTarget: 5,
    xpPrice: 150,
    classes: {
      pill: 'bg-slate-950/85 hover:bg-slate-900 text-white border border-cyan-400/70 shadow-[0_0_16px_rgba(34,211,238,0.45)]',
      dot: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]',
      text: 'text-cyan-50 font-bold',
      speaker: 'text-cyan-300 hover:text-cyan-100',
      selectedRing: 'ring-4 ring-cyan-400/40',
    },
  },
  {
    id: 'emerald_green',
    name: 'Ngọc Lục Bảo (Scholar Emerald)',
    description: 'Ánh sáng lục bảo trí tuệ của bậc thầy từ vựng',
    category: 'free_milestone',
    accentColor: '#10b981',
    glowShadow: '0 0 16px rgba(16,185,129,0.45)',
    conditionText: 'Lưu 5 từ vựng vào Sổ từ',
    milestoneType: 'words',
    milestoneTarget: 5,
    xpPrice: 150,
    classes: {
      pill: 'bg-slate-950/85 hover:bg-slate-900 text-white border border-emerald-400/70 shadow-[0_0_16px_rgba(16,185,129,0.45)]',
      dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
      text: 'text-emerald-50 font-bold',
      speaker: 'text-emerald-300 hover:text-emerald-100',
      selectedRing: 'ring-4 ring-emerald-400/40',
    },
  },
  {
    id: 'frost_white',
    name: 'Kính Băng Apple (Titanium Frost)',
    description: 'Kính mờ siêu thực trong suốt tán sắc viền ngọc trai',
    category: 'free_milestone',
    accentColor: '#f8fafc',
    glowShadow: '0 0 18px rgba(255,255,255,0.25)',
    conditionText: 'Luyện nghe phát âm 10 lần',
    milestoneType: 'listen',
    milestoneTarget: 10,
    xpPrice: 150,
    classes: {
      pill: 'bg-white/15 hover:bg-white/20 text-white border border-white/50 shadow-[0_0_18px_rgba(255,255,255,0.25)] backdrop-blur-2xl',
      dot: 'bg-white shadow-[0_0_8px_#ffffff]',
      text: 'text-white font-bold',
      speaker: 'text-slate-200 hover:text-white',
      selectedRing: 'ring-4 ring-white/50',
    },
  },
  {
    id: 'luxury_gold',
    name: 'Vàng Hoàng Kim 24K (SnapBoost Gold)',
    description: 'Viền kim loại mạ vàng bóng bẩy, hào quang hổ phách ánh kim hoàng gia',
    category: 'snapboost_vip',
    accentColor: '#f59e0b',
    glowShadow: '0 0 20px rgba(251,191,36,0.55)',
    conditionText: 'Đặc quyền Gói SnapBoost VIP hoặc đổi 300 XP',
    xpPrice: 300,
    classes: {
      pill: 'bg-gradient-to-r from-amber-950/85 via-yellow-950/70 to-amber-900/85 text-white border border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.55)] backdrop-blur-xl',
      dot: 'bg-amber-300 shadow-[0_0_10px_#f59e0b]',
      text: 'text-amber-100 font-extrabold tracking-wide',
      speaker: 'text-amber-300 hover:text-amber-100',
      selectedRing: 'ring-4 ring-amber-400/50',
    },
  },
  {
    id: 'violet_nitro',
    name: 'Tím Huyền Ảo (Deep Violet Nitro)',
    description: 'Tone tím dạ quang đặc trưng Discord Nitro với vệt sáng hồng mờ huyền ảo',
    category: 'snapboost_vip',
    accentColor: '#a855f7',
    glowShadow: '0 0 20px rgba(168,85,247,0.55)',
    conditionText: 'Đặc quyền Gói SnapBoost VIP hoặc đổi 250 XP',
    xpPrice: 250,
    classes: {
      pill: 'bg-gradient-to-r from-purple-950/85 via-indigo-950/80 to-purple-900/85 text-white border border-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.55)] backdrop-blur-xl',
      dot: 'bg-fuchsia-400 shadow-[0_0_10px_#e879f9]',
      text: 'text-purple-100 font-extrabold tracking-wide',
      speaker: 'text-purple-300 hover:text-purple-100',
      selectedRing: 'ring-4 ring-purple-400/50',
    },
  },
  {
    id: 'ruby_sunset',
    name: 'Hoàng Hôn Ruby (Sunset Crimson)',
    description: 'Dải hoàng hôn hồng ngọc chuyển sắc mịn màng, ấm áp sang trọng',
    category: 'snapboost_vip',
    accentColor: '#f43f5e',
    glowShadow: '0 0 20px rgba(244,63,94,0.55)',
    conditionText: 'Đặc quyền Gói SnapBoost VIP hoặc đổi 250 XP',
    xpPrice: 250,
    classes: {
      pill: 'bg-gradient-to-r from-rose-950/85 via-pink-950/80 to-rose-900/85 text-white border border-rose-400/80 shadow-[0_0_20px_rgba(244,63,94,0.55)] backdrop-blur-xl',
      dot: 'bg-rose-400 shadow-[0_0_10px_#fb7185]',
      text: 'text-rose-100 font-extrabold tracking-wide',
      speaker: 'text-rose-300 hover:text-rose-100',
      selectedRing: 'ring-4 ring-rose-400/50',
    },
  },
  {
    id: 'kitty_ribbon',
    name: 'Hello Kitty Nơ Ruy-Băng (Vẽ Tay)',
    description: 'Khung vẽ tay: Tai mèo phác họa đáng yêu & nơ ruy-băng Coquette xinh xắn',
    category: 'snapboost_vip',
    frameStyle: 'kitty_ribbon',
    accentColor: '#f472b6',
    glowShadow: '0 0 22px rgba(244,114,182,0.65)',
    conditionText: 'Đặc quyền Gói SnapBoost VIP hoặc đổi 350 XP',
    xpPrice: 350,
    classes: {
      pill: 'bg-pink-950/85 hover:bg-pink-900/90 text-white border-2 border-pink-400/90 shadow-[0_0_20px_rgba(244,114,182,0.6)] backdrop-blur-xl',
      dot: 'bg-pink-300 shadow-[0_0_10px_#f472b6]',
      text: 'text-pink-100 font-extrabold tracking-wide',
      speaker: 'text-pink-300 hover:text-white',
      selectedRing: 'ring-4 ring-pink-400/50',
    },
  },
  {
    id: 'halloween_bat',
    name: 'Halloween Cánh Dơi Gothic (Vẽ Tay)',
    description: 'Khung vẽ tay: Cánh dơi Gothic dang rộng hai bên & mạng nhện huyền bí',
    category: 'snapboost_vip',
    frameStyle: 'halloween_bat',
    accentColor: '#f97316',
    glowShadow: '0 0 24px rgba(249,115,22,0.7)',
    conditionText: 'Đặc quyền Gói SnapBoost VIP hoặc đổi 350 XP',
    xpPrice: 350,
    classes: {
      pill: 'bg-zinc-950/90 hover:bg-black text-white border-2 border-orange-500 shadow-[0_0_22px_rgba(249,115,22,0.7)] backdrop-blur-xl',
      dot: 'bg-orange-500 shadow-[0_0_10px_#f97316]',
      text: 'text-orange-200 font-extrabold tracking-wider',
      speaker: 'text-orange-300 hover:text-white',
      selectedRing: 'ring-4 ring-orange-500/50',
    },
  },
  {
    id: 'manga_comic',
    name: 'Manga Comic Pop-Art (Vẽ Tay)',
    description: 'Khung vẽ tay: Bóng thoại truyện tranh Nhật Bản với đuôi thoại và nét cọ mực',
    category: 'free_milestone',
    milestoneType: 'snaps',
    milestoneTarget: 8,
    frameStyle: 'manga_comic',
    accentColor: '#f59e0b',
    glowShadow: '3px 3px 0px rgba(0,0,0,1)',
    conditionText: 'Chụp 8 ảnh Snap thực tế hoặc đổi 200 XP',
    xpPrice: 200,
    classes: {
      pill: 'bg-amber-100 hover:bg-amber-50 text-black border-2 border-black shadow-[3px_3px_0px_#000]',
      dot: 'bg-black shadow-[0_0_4px_#000]',
      text: 'text-black font-black tracking-tight uppercase',
      speaker: 'text-black hover:text-amber-700',
      selectedRing: 'ring-4 ring-black/40',
    },
  },
];

const ACTIVE_THEME_KEY = 'visulingo_active_tag_theme';
const SNAPBOOST_VIP_KEY = 'visulingo_snapboost_vip';
const PURCHASED_THEMES_KEY = 'visulingo_purchased_tag_themes';

export function getActiveTagThemeId(): TagThemeId {
  try {
    return (localStorage.getItem(ACTIVE_THEME_KEY) as TagThemeId) || 'classic';
  } catch {
    return 'classic';
  }
}

export function getActiveTagTheme(): TagTheme {
  const currentId = getActiveTagThemeId();
  return TAG_THEMES.find((t) => t.id === currentId) || TAG_THEMES[0];
}

export function getTagThemeById(themeId?: string | null): TagTheme {
  if (!themeId) return TAG_THEMES[0];
  return TAG_THEMES.find((t) => t.id === themeId) || TAG_THEMES[0];
}

export function setActiveTagThemeId(themeId: TagThemeId): void {
  localStorage.setItem(ACTIVE_THEME_KEY, themeId);
  window.dispatchEvent(new Event('visulingo_tag_theme_changed'));
}

export function isUserSnapBoostVip(): boolean {
  try {
    return localStorage.getItem(SNAPBOOST_VIP_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setSnapBoostVip(enabled: boolean): void {
  localStorage.setItem(SNAPBOOST_VIP_KEY, enabled ? 'true' : 'false');
  window.dispatchEvent(new Event('visulingo_snapboost_changed'));
}

export function toggleSnapBoostVip(): boolean {
  const next = !isUserSnapBoostVip();
  setSnapBoostVip(next);
  return next;
}

export function getPurchasedThemeIds(): string[] {
  try {
    const raw = localStorage.getItem(PURCHASED_THEMES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export interface UserStatsForThemes {
  snaps: number;
  streak: number;
  words: number;
  listen: number;
  xp?: number;
  isVip?: boolean;
}

export function isTagThemeUnlocked(theme: TagTheme, stats: UserStatsForThemes): boolean {
  // 1. Classic is always unlocked
  if (theme.id === 'classic') return true;

  // 2. If user is VIP, all themes are automatically unlocked!
  const isVip = stats.isVip ?? isUserSnapBoostVip();
  if (isVip) return true;

  // 3. If user purchased via XP
  const purchased = getPurchasedThemeIds();
  if (purchased.includes(theme.id)) return true;

  // 4. Milestone check
  if (theme.category === 'free_milestone' && theme.milestoneType && theme.milestoneTarget) {
    switch (theme.milestoneType) {
      case 'snaps':
        return stats.snaps >= theme.milestoneTarget;
      case 'streak':
        return stats.streak >= theme.milestoneTarget;
      case 'words':
        return stats.words >= theme.milestoneTarget;
      case 'listen':
        return stats.listen >= theme.milestoneTarget;
    }
  }

  return false;
}

export function purchaseThemeWithXp(themeId: TagThemeId): { success: boolean; message: string } {
  const theme = TAG_THEMES.find((t) => t.id === themeId);
  if (!theme || !theme.xpPrice) {
    return { success: false, message: 'Ngoại trang không hỗ trợ mua bằng XP' };
  }

  const purchased = getPurchasedThemeIds();
  if (purchased.includes(themeId)) {
    return { success: true, message: 'Bạn đã sở hữu ngoại trang này rồi!' };
  }

  const currentXp = getUserXp();
  if (currentXp < theme.xpPrice) {
    return { success: false, message: `Bạn cần ${theme.xpPrice} XP (hiện có ${currentXp} XP)` };
  }

  addXp(-theme.xpPrice);
  purchased.push(themeId);
  localStorage.setItem(PURCHASED_THEMES_KEY, JSON.stringify(purchased));
  setActiveTagThemeId(themeId);
  window.dispatchEvent(new Event('visulingo_tag_theme_changed'));

  return { success: true, message: `Đã mở khóa và trang bị thành công ${theme.name}!` };
}
