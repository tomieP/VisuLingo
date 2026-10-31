import { VocabTag } from './moments';

export interface Album {
  id: string;
  title: string;
  emoji: string;
  description?: string;
  createdAt: string;
}

export interface SnapPhoto {
  id: string;
  albumId: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
  vocabTags: VocabTag[];
}

const ALBUMS_KEY = 'visulingo_user_albums';
const PHOTOS_KEY = 'visulingo_user_photos';

const INITIAL_ALBUMS: Album[] = [
  {
    id: 'album-workspace',
    title: 'Góc học tập & Làm việc',
    emoji: '💻',
    description: 'Bàn làm việc, sách vở, laptop và công nghệ',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'album-cafe',
    title: 'Quán cà phê & Chill',
    emoji: '☕',
    description: 'Ly tách, thức uống, không gian quán xá',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'album-daily',
    title: 'Đời thường & Phòng khách',
    emoji: '🌿',
    description: 'Vật dụng trong nhà và đời sống hàng ngày',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_PHOTOS: SnapPhoto[] = [
  {
    id: 'photo-1',
    albumId: 'album-workspace',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
    caption: 'Bàn làm việc sáng nay',
    createdAt: new Date().toISOString(),
    vocabTags: [
      { id: 'v1', word: 'laptop', meaningVi: 'máy tính xách tay', ipa: '/ˈlæp.tɒp/', x: 30, y: 35 },
      { id: 'v2', word: 'coffee cup', meaningVi: 'ly cà phê', ipa: '/ˈkɒf.i kʌp/', x: 67, y: 46 },
      { id: 'v3', word: 'notebook', meaningVi: 'quyển sổ tay', ipa: '/ˈnəʊt.bʊk/', x: 38, y: 75 },
    ],
  },
  {
    id: 'photo-2',
    albumId: 'album-daily',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    caption: 'Góc phòng khách ấm cúng',
    createdAt: new Date().toISOString(),
    vocabTags: [
      { id: 'v4', word: 'sofa', meaningVi: 'ghế xô-pha', ipa: '/ˈsəʊ.fə/', x: 45, y: 55 },
      { id: 'v5', word: 'houseplant', meaningVi: 'cây cảnh', ipa: '/ˈhaʊs.plɑːnt/', x: 80, y: 35 },
    ],
  },
];

export function getAlbums(): Album[] {
  try {
    const raw = localStorage.getItem(ALBUMS_KEY);
    if (!raw) {
      localStorage.setItem(ALBUMS_KEY, JSON.stringify(INITIAL_ALBUMS));
      return INITIAL_ALBUMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ALBUMS;
  }
}

export function createAlbum(title: string, emoji: string, description?: string): Album {
  const albums = getAlbums();
  const newAlbum: Album = {
    id: `album-${Date.now()}`,
    title: title.trim(),
    emoji: emoji || '📁',
    description: description?.trim() || '',
    createdAt: new Date().toISOString(),
  };
  albums.push(newAlbum);
  localStorage.setItem(ALBUMS_KEY, JSON.stringify(albums));
  window.dispatchEvent(new Event('visulingo_albums_changed'));
  return newAlbum;
}

export function deleteAlbum(albumId: string): void {
  const albums = getAlbums().filter((a) => a.id !== albumId);
  localStorage.setItem(ALBUMS_KEY, JSON.stringify(albums));

  // Also remove photos belonging to this album
  const photos = getPhotos().filter((p) => p.albumId !== albumId);
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));

  window.dispatchEvent(new Event('visulingo_albums_changed'));
}

export function getPhotos(albumId?: string): SnapPhoto[] {
  try {
    const raw = localStorage.getItem(PHOTOS_KEY);
    const photos: SnapPhoto[] = raw ? JSON.parse(raw) : INITIAL_PHOTOS;
    if (!raw) {
      localStorage.setItem(PHOTOS_KEY, JSON.stringify(INITIAL_PHOTOS));
    }
    if (albumId && albumId !== 'all') {
      return photos.filter((p) => p.albumId === albumId);
    }
    return photos;
  } catch {
    return INITIAL_PHOTOS;
  }
}

export function savePhotoToAlbum(
  albumId: string,
  imageUrl: string,
  vocabTags: VocabTag[],
  caption?: string
): SnapPhoto {
  const photos = getPhotos();
  const newPhoto: SnapPhoto = {
    id: `photo-${Date.now()}`,
    albumId: albumId || 'album-workspace',
    imageUrl,
    caption: caption || '',
    createdAt: new Date().toISOString(),
    vocabTags,
  };
  photos.unshift(newPhoto);
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
  window.dispatchEvent(new Event('visulingo_albums_changed'));
  return newPhoto;
}

export function deletePhoto(photoId: string): void {
  const photos = getPhotos().filter((p) => p.id !== photoId);
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
  window.dispatchEvent(new Event('visulingo_albums_changed'));
}
