import api from './api';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

const STORAGE_USER_KEY = 'visulingo_user';
const STORAGE_TOKEN_KEY = 'visulingo_token';
const STORAGE_USERNAME_KEY = 'visulingo_username';

export function getUserUsername(): string {
  const customTag = localStorage.getItem(STORAGE_USERNAME_KEY);
  if (customTag && customTag.trim()) return customTag.trim();
  const user = getCurrentUser();
  if (user?.username && user.username.trim()) return user.username.trim();
  if (user?.email) return user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.]/g, '');
  return 'snapper';
}

export function setUserUsername(newUsername: string): string {
  const clean = newUsername.trim().toLowerCase().replace(/^@+/, '').replace(/[^a-z0-9_.]/g, '') || 'snapper';
  localStorage.setItem(STORAGE_USERNAME_KEY, clean);
  updateCurrentUser({ username: clean });
  window.dispatchEvent(new Event('visulingo_username_changed'));
  return clean;
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<{ token: string; user: any }>('/auth/login', {
    email: data.email.trim(),
    password: data.password,
  });

  const savedTag = localStorage.getItem(STORAGE_USERNAME_KEY);
  const username = savedTag || res.data.user.username || res.data.user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.]/g, '');

  const user: User = {
    id: res.data.user.id,
    email: res.data.user.email,
    firstName: res.data.user.displayName || res.data.user.email.split('@')[0],
    lastName: '',
    username,
    role: res.data.user.role || 'user',
  };

  localStorage.setItem(STORAGE_TOKEN_KEY, res.data.token);
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  localStorage.setItem(STORAGE_USERNAME_KEY, username);
  window.dispatchEvent(new Event('visulingo_auth_changed'));

  return { token: res.data.token, user };
}

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const displayName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email.split('@')[0];
  await api.post('/auth/register', {
    email: data.email.trim(),
    password: data.password,
    displayName,
  });

  if (data.username && data.username.trim()) {
    const clean = data.username.trim().toLowerCase().replace(/^@+/, '').replace(/[^a-z0-9_.]/g, '');
    if (clean) localStorage.setItem(STORAGE_USERNAME_KEY, clean);
  }

  // Tự động đăng nhập ngay sau khi đăng ký thành công
  return await loginUser({ email: data.email, password: data.password });
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function updateCurrentUser(updatedFields: Partial<User>): User | null {
  const current = getCurrentUser();
  if (!current) return null;
  const updated = { ...current, ...updatedFields };
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('visulingo_auth_changed'));
  return updated;
}

export function logoutUser(): void {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
  window.dispatchEvent(new Event('visulingo_auth_changed'));
}
