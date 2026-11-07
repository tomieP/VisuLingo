import api from '@/services/api';
import { VocabTag } from './moments';

export interface Album {
  id: string;
  title: string;
  emoji: string;
  description?: string;
  createdAt: string;
  coverImageUrl?: string | null;
  imageCount?: number;
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

export function getAlbums(): Album[] {
  try {
    const raw = localStorage.getItem(ALBUMS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Đồng bộ danh sách bộ sưu tập từ CSDL PostgreSQL qua API /api/collections
 */
export async function syncCollectionsFromApi(): Promise<Album[]> {
  const token = localStorage.getItem('visulingo_token');
  if (!token) {
    return getAlbums();
  }

  try {
    const res = await api.get<{ data: any[] }>('/collections');
    if (res.data?.data) {
      const mapped: Album[] = res.data.data.map((c) => ({
        id: c.id,
        title: c.name,
        emoji: c.theme || '📁',
        description: c.description || '',
        createdAt: c.createdAt,
        coverImageUrl: c.coverImageUrl,
        imageCount: c.imageCount,
      }));

      localStorage.setItem(ALBUMS_KEY, JSON.stringify(mapped));
      window.dispatchEvent(new Event('visulingo_albums_changed'));
      return mapped;
    }
  } catch (err) {
    console.warn('Backend collections sync error, using local cache:', err);
  }

  return getAlbums();
}

export async function createAlbum(title: string, emoji: string, description?: string): Promise<Album> {
  const token = localStorage.getItem('visulingo_token');
  let createdId = `album-${Date.now()}`;

  if (token) {
    try {
      const res = await api.post<{ collection: any }>('/collections', {
        name: title.trim(),
        theme: emoji || '📁',
        description: description?.trim(),
      });
      if (res.data?.collection?.id) {
        createdId = res.data.collection.id;
      }
    } catch (err) {
      console.warn('Failed to create collection on backend:', err);
    }
  }

  const albums = getAlbums();
  const newAlbum: Album = {
    id: createdId,
    title: title.trim(),
    emoji: emoji || '📁',
    description: description?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  albums.unshift(newAlbum);
  localStorage.setItem(ALBUMS_KEY, JSON.stringify(albums));
  window.dispatchEvent(new Event('visulingo_albums_changed'));
  return newAlbum;
}

export async function deleteAlbum(albumId: string): Promise<void> {
  const token = localStorage.getItem('visulingo_token');
  if (token && !albumId.startsWith('album-')) {
    try {
      await api.delete(`/collections/${albumId}`);
    } catch (err) {
      console.warn('Failed to delete collection from backend:', err);
    }
  }

  const albums = getAlbums().filter((a) => a.id !== albumId);
  localStorage.setItem(ALBUMS_KEY, JSON.stringify(albums));

  const photos = getPhotos().filter((p) => p.albumId !== albumId);
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));

  window.dispatchEvent(new Event('visulingo_albums_changed'));
}

export function getPhotos(albumId?: string): SnapPhoto[] {
  try {
    const raw = localStorage.getItem(PHOTOS_KEY);
    const photos: SnapPhoto[] = raw ? JSON.parse(raw) : [];
    if (albumId && albumId !== 'all') {
      return photos.filter((p) => p.albumId === albumId);
    }
    return photos;
  } catch {
    return [];
  }
}

export async function savePhotoToAlbum(
  albumId: string,
  imageUrl: string,
  vocabTags: VocabTag[],
  caption?: string,
  imageId?: string,
  analysisId?: string,
): Promise<SnapPhoto> {
  const token = localStorage.getItem('visulingo_token');
  if (token && !albumId.startsWith('album-') && (imageId || analysisId)) {
    try {
      await api.post(`/collections/${albumId}/images`, {
        imageId,
        analysisId,
      });
    } catch (err) {
      console.warn('Failed to link image to collection on backend:', err);
    }
  }

  const photos = getPhotos();
  const newPhoto: SnapPhoto = {
    id: `photo-${Date.now()}`,
    albumId,
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
