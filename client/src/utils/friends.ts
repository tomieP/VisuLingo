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

const INITIAL_FRIENDS: FriendProfile[] = [
  {
    id: 'friend-1',
    name: 'Minh Quân',
    username: '@minhquan.ielts',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: 'Mục tiêu IELTS 7.5 🎯 Chuyên snap từ vựng góc học tập & thư viện.',
    badge: 'Streak 7 🔥',
    streak: 7,
    totalWords: 124,
    snapsCount: 8,
    isFollowing: true,
    albums: [
      {
        id: 'mq-album-1',
        title: 'Góc luyện thi IELTS',
        emoji: '📚',
        description: 'Bàn học, sách vở, laptop và tài liệu ngoại ngữ',
        photos: [
          {
            id: 'mq-p1',
            imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
            caption: 'Góc học tập sáng nay, chuẩn bị cày IELTS 🚀',
            timeAgo: '12 phút trước',
            vocabTags: [
              { id: 'mq-t1', word: 'laptop', meaningVi: 'máy tính xách tay', ipa: '/ˈlæp.tɒp/', x: 30, y: 35 },
              { id: 'mq-t2', word: 'coffee cup', meaningVi: 'ly cà phê', ipa: '/ˈkɒf.i kʌp/', x: 67, y: 46 },
              { id: 'mq-t3', word: 'notebook', meaningVi: 'quyển sổ tay', ipa: '/ˈnəʊt.bʊk/', x: 38, y: 75 },
            ],
          },
          {
            id: 'mq-p2',
            imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
            caption: 'Kệ sách từ điển & ngữ pháp',
            timeAgo: 'Hôm qua',
            vocabTags: [
              { id: 'mq-t4', word: 'bookshelf', meaningVi: 'giá sách', ipa: '/ˈbʊk.ʃelf/', x: 50, y: 35 },
              { id: 'mq-t5', word: 'dictionary', meaningVi: 'từ điển', ipa: '/ˈdɪk.ʃən.ər.i/', x: 35, y: 65 },
              { id: 'mq-t6', word: 'highlighter', meaningVi: 'bút dạ quang', ipa: '/ˈhaɪˌlaɪ.tər/', x: 72, y: 70 },
            ],
          },
        ],
      },
      {
        id: 'mq-album-2',
        title: 'Thư viện & Công nghệ',
        emoji: '🎧',
        description: 'Tai nghe chống ồn, balo và không gian tự học',
        photos: [
          {
            id: 'mq-p3',
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
            caption: 'Đồ dùng không thể thiếu khi lên thư viện 🎧',
            timeAgo: '2 ngày trước',
            vocabTags: [
              { id: 'mq-t7', word: 'headphones', meaningVi: 'tai nghe chụp tai', ipa: '/ˈhed.fəʊnz/', x: 48, y: 45 },
              { id: 'mq-t8', word: 'backpack', meaningVi: 'ba-lô', ipa: '/ˈbæk.pæk/', x: 25, y: 60 },
              { id: 'mq-t9', word: 'desk lamp', meaningVi: 'đèn bàn', ipa: '/desk læmp/', x: 78, y: 30 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'friend-2',
    name: 'Khánh Linh',
    username: '@khanhlinh.chill',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    bio: 'Yêu cây xanh & không gian tối giản 🌿 Chuyên snap góc chill & cafe.',
    badge: 'Top 1 tuần 🏆',
    streak: 12,
    totalWords: 89,
    snapsCount: 6,
    isFollowing: true,
    albums: [
      {
        id: 'kl-album-1',
        title: 'Khu vườn ban công',
        emoji: '🌿',
        description: 'Cây cảnh trong nhà, chậu hoa và ánh nắng sớm',
        photos: [
          {
            id: 'kl-p1',
            imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
            caption: 'Chill một chút sau giờ làm việc 🌿',
            timeAgo: '45 phút trước',
            vocabTags: [
              { id: 'kl-t1', word: 'sofa', meaningVi: 'ghế xô-pha', ipa: '/ˈsəʊ.fə/', x: 45, y: 55 },
              { id: 'kl-t2', word: 'houseplant', meaningVi: 'cây cảnh trong nhà', ipa: '/ˈhaʊs.plɑːnt/', x: 80, y: 35 },
              { id: 'kl-t3', word: 'cushion', meaningVi: 'gối tựa lưng', ipa: '/ˈkʊʃ.ən/', x: 32, y: 42 },
            ],
          },
          {
            id: 'kl-p2',
            imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
            caption: 'Chăm chút cho mấy bé sen đá 🪴',
            timeAgo: '2 ngày trước',
            vocabTags: [
              { id: 'kl-t4', word: 'succulent', meaningVi: 'cây sen đá', ipa: '/ˈsʌk.jə.lənt/', x: 50, y: 45 },
              { id: 'kl-t5', word: 'flowerpot', meaningVi: 'chậu hoa', ipa: '/ˈflaʊ.ə.pɒt/', x: 48, y: 65 },
              { id: 'kl-t6', word: 'watering can', meaningVi: 'bình tưới cây', ipa: '/ˈwɔː.tər.ɪŋ kæn/', x: 80, y: 55 },
            ],
          },
        ],
      },
      {
        id: 'kl-album-2',
        title: 'Cafe Hop Sài Gòn',
        emoji: '☕',
        description: 'Ghé thăm những quán cà phê có góc decor đẹp',
        photos: [
          {
            id: 'kl-p3',
            imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
            caption: 'Góc quán quen cuối tuần ☕',
            timeAgo: '3 ngày trước',
            vocabTags: [
              { id: 'kl-t7', word: 'coffee cup', meaningVi: 'tách cà phê', ipa: '/ˈkɒf.i kʌp/', x: 45, y: 55 },
              { id: 'kl-t8', word: 'table', meaningVi: 'bàn gỗ', ipa: '/ˈteɪ.bəl/', x: 50, y: 75 },
              { id: 'kl-t9', word: 'armchair', meaningVi: 'ghế bành', ipa: '/ˈɑːm.tʃeər/', x: 20, y: 45 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'friend-3',
    name: 'Thành Nam',
    username: '@thanhnam.design',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    bio: 'Product Designer 🎨 Chuyên snap đồ ăn & đồ nghề thiết kế.',
    badge: 'Level 4 🌟',
    streak: 4,
    totalWords: 65,
    snapsCount: 5,
    isFollowing: true,
    albums: [
      {
        id: 'tn-album-1',
        title: 'Bữa sáng & Bakery',
        emoji: '🥐',
        description: 'Bánh ngọt, điểm tâm sáng và món ăn ngon miệng',
        photos: [
          {
            id: 'tn-p1',
            imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80',
            caption: 'Bữa sáng nạp năng lượng! Cả nhà thấy món này gọi là gì? 🍞',
            timeAgo: '2 giờ trước',
            vocabTags: [
              { id: 'tn-t1', word: 'croissant', meaningVi: 'bánh sừng bò', ipa: '/ˈkrwɑː.sɒ̃/', x: 50, y: 45 },
              { id: 'tn-t2', word: 'coffee', meaningVi: 'cà phê', ipa: '/ˈkɒf.i/', x: 75, y: 32 },
              { id: 'tn-t3', word: 'fork', meaningVi: 'chiếc nĩa / dĩa', ipa: '/fɔːk/', x: 22, y: 65 },
            ],
          },
        ],
      },
      {
        id: 'tn-album-2',
        title: 'Góc Setup Designer',
        emoji: '🎨',
        description: 'Bàn phím cơ, màn hình đồ họa và bảng vẽ',
        photos: [
          {
            id: 'tn-p2',
            imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
            caption: 'Vũ khí chiến đấu mỗi ngày của dân vẽ UI/UX 🖥️',
            timeAgo: '4 ngày trước',
            vocabTags: [
              { id: 'tn-t4', word: 'keyboard', meaningVi: 'bàn phím máy tính', ipa: '/ˈkiː.bɔːd/', x: 50, y: 65 },
              { id: 'tn-t5', word: 'computer monitor', meaningVi: 'màn hình máy tính', ipa: '/ˈmɒn.ɪ.tər/', x: 50, y: 25 },
              { id: 'tn-t6', word: 'mouse', meaningVi: 'chuột máy tính', ipa: '/maʊs/', x: 80, y: 68 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'friend-4',
    name: 'Phương Thảo',
    username: '@thao.daily',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    bio: 'Passionate about photography & languages 📸 Thích chụp phố xá.',
    badge: 'Streak 9 🔥',
    streak: 9,
    totalWords: 95,
    snapsCount: 4,
    isFollowing: false,
    albums: [
      {
        id: 'pt-album-1',
        title: 'Dạo phố cuối tuần',
        emoji: '🚲',
        description: 'Xe đạp, hè phố và phương tiện giao thông',
        photos: [
          {
            id: 'pt-p1',
            imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
            caption: 'Dạo một vòng hồ Tây chiều mát 🚲',
            timeAgo: 'Hôm qua',
            vocabTags: [
              { id: 'pt-t1', word: 'bicycle', meaningVi: 'xe đạp', ipa: '/ˈbaɪ.sɪ.kəl/', x: 45, y: 55 },
              { id: 'pt-t2', word: 'street lamp', meaningVi: 'đèn đường', ipa: '/striːt læmp/', x: 80, y: 25 },
              { id: 'pt-t3', word: 'pavement', meaningVi: 'vỉa hè', ipa: '/ˈpeɪv.mənt/', x: 50, y: 80 },
            ],
          },
        ],
      },
    ],
  },
];

const FRIENDS_KEY = 'visulingo_friends_data';

export function getFriends(): FriendProfile[] {
  try {
    const raw = localStorage.getItem(FRIENDS_KEY);
    if (!raw) {
      localStorage.setItem(FRIENDS_KEY, JSON.stringify(INITIAL_FRIENDS));
      return INITIAL_FRIENDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FRIENDS;
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
