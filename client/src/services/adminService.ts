import api from './api';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  status: 'active' | 'locked';
  createdAt: string;
  lastLoginAt: string | null;
  totalSavedWords: number;
  totalCollections: number;
}

export interface AdminVocab {
  id: string;
  word: string;
  meaningVi: string;
  ipa: string | null;
  exampleSentence: string | null;
  category: string;
  status: 'auto' | 'verified' | 'hidden';
  createdAt: string;
}

export interface AdminSetting {
  key: string;
  value: string;
  description: string | null;
  updatedAt: string;
}

export interface AdminStats {
  users: {
    total: number;
    active: number;
    locked: number;
    newThisWeek: number;
  };
  analyses: {
    total: number;
    failed: number;
    errorRatePercent: number;
    avgLatencyMs: number;
  };
  content: {
    totalCollections: number;
    totalImages: number;
    totalVocabularies: number;
  };
  topSavedWords: { word: string; count: number }[];
  recentAuditLogs: {
    id: string;
    adminEmail: string;
    action: string;
    entityType: string;
    entityId: string | null;
    createdAt: string;
  }[];
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const response = await api.get<AdminStats>('/admin/stats');
  return response.data;
}

export async function fetchAdminUsers(params?: {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  role?: string;
}): Promise<{ users: AdminUser[]; total: number; page: number; totalPages: number }> {
  const response = await api.get('/admin/users', { params });
  return response.data;
}

export async function updateAdminUser(
  id: string,
  data: { role?: 'user' | 'admin'; status?: 'active' | 'locked' }
): Promise<AdminUser> {
  const response = await api.patch(`/admin/users/${id}`, data);
  return response.data.user;
}

export async function deleteAdminUser(id: string): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}

export async function fetchAdminVocabulary(params?: {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
}): Promise<{ vocabulary: AdminVocab[]; total: number; page: number; totalPages: number }> {
  const response = await api.get('/admin/vocabulary', { params });
  return response.data;
}

export async function updateAdminVocabulary(
  id: string,
  data: { meaningVi?: string; ipa?: string; exampleSentence?: string; status?: 'auto' | 'verified' | 'hidden' }
): Promise<AdminVocab> {
  const response = await api.patch(`/admin/vocabulary/${id}`, data);
  return response.data.vocabulary;
}

export async function fetchAdminSettings(): Promise<AdminSetting[]> {
  const response = await api.get<{ settings: AdminSetting[] }>('/admin/settings');
  return response.data.settings;
}

export async function updateAdminSetting(key: string, value: string): Promise<AdminSetting> {
  const response = await api.patch('/admin/settings', { key, value });
  return response.data.setting;
}
