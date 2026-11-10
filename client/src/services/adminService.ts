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
  const response = await api.get<any>('/admin/stats');
  const d = response.data;
  if (d?.users) return d;
  return {
    users: {
      total: d?.totalUsers ?? 0,
      active: d?.activeUsers ?? 0,
      locked: d?.lockedUsers ?? 0,
      newThisWeek: d?.newUsersThisWeek ?? 0,
    },
    analyses: {
      total: d?.totalAnalyses ?? 0,
      failed: d?.failedAnalyses ?? 0,
      errorRatePercent: d?.errorRatePercent ?? 0,
      avgLatencyMs: d?.avgLatencyMs ?? 0,
    },
    content: {
      totalCollections: d?.totalCollections ?? 0,
      totalImages: d?.totalImages ?? 0,
      totalVocabularies: d?.totalVocabularies ?? 0,
    },
    topSavedWords: d?.topSavedWords || [],
    recentAuditLogs: d?.recentAuditLogs || [],
  };
}

export async function fetchAdminUsers(params?: {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  role?: string;
}): Promise<{ users: AdminUser[]; total: number; page: number; totalPages: number }> {
  const response = await api.get<any>('/admin/users', { params });
  const raw = response.data;
  const usersList: AdminUser[] = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.users)
    ? raw.users
    : Array.isArray(raw)
    ? raw
    : [];

  const total = raw?.pagination?.total ?? raw?.total ?? usersList.length;
  const page = raw?.pagination?.page ?? raw?.page ?? 1;
  const totalPages = raw?.pagination?.totalPages ?? raw?.totalPages ?? 1;

  return { users: usersList, total, page, totalPages };
}

export async function updateAdminUser(
  id: string,
  data: { role?: 'user' | 'admin'; status?: 'active' | 'locked' }
): Promise<AdminUser> {
  const response = await api.patch<any>(`/admin/users/${id}`, data);
  return response.data?.user || response.data;
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
  const response = await api.get<any>('/admin/vocabulary', { params });
  const raw = response.data;
  const vocabList: AdminVocab[] = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.vocabulary)
    ? raw.vocabulary
    : Array.isArray(raw)
    ? raw
    : [];

  const total = raw?.pagination?.total ?? raw?.total ?? vocabList.length;
  const page = raw?.pagination?.page ?? raw?.page ?? 1;
  const totalPages = raw?.pagination?.totalPages ?? raw?.totalPages ?? 1;

  return { vocabulary: vocabList, total, page, totalPages };
}

export async function updateAdminVocabulary(
  id: string,
  data: { meaningVi?: string; ipa?: string; exampleSentence?: string; status?: 'auto' | 'verified' | 'hidden' }
): Promise<AdminVocab> {
  const response = await api.patch<any>(`/admin/vocabulary/${id}`, data);
  return response.data?.vocabulary || response.data;
}

export async function fetchAdminSettings(): Promise<AdminSetting[]> {
  const response = await api.get<any>('/admin/settings');
  const raw = response.data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.settings)) return raw.settings;
  return [];
}

export async function updateAdminSetting(key: string, value: string): Promise<AdminSetting> {
  const response = await api.patch<any>('/admin/settings', { key, value });
  return response.data?.setting || response.data;
}
