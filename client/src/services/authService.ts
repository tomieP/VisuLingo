import api from './api';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

const STORAGE_USER_KEY = 'visulingo_user';
const STORAGE_TOKEN_KEY = 'visulingo_token';
const STORAGE_USERNAME_KEY = 'visulingo_username';
const STORAGE_REGISTERED_ACCOUNTS_KEY = 'visulingo_registered_accounts';

export interface RegisteredAccount {
  email: string;
  username: string;
  displayName: string;
  createdAt: string;
}

export function getRegisteredAccounts(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_REGISTERED_ACCOUNTS_KEY);
    if (!raw) {
      const seed: RegisteredAccount[] = [
        {
          email: 'admin@visulingo.com',
          username: 'admin',
          displayName: 'Quản trị viên VisuLingo',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_REGISTERED_ACCOUNTS_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRegisteredAccount(account: RegisteredAccount): void {
  const accounts = getRegisteredAccounts();
  const exists = accounts.some((a) => a.email.toLowerCase() === account.email.toLowerCase());
  if (!exists) {
    accounts.push(account);
    localStorage.setItem(STORAGE_REGISTERED_ACCOUNTS_KEY, JSON.stringify(accounts));
  }
}

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
  const normEmail = data.email.trim().toLowerCase();

  try {
    const res = await api.post<{ token: string; user: any }>('/auth/login', {
      email: normEmail,
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
  } catch (err: any) {
    throw err;
  }
}

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const normEmail = data.email.trim().toLowerCase();
  const displayName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || normEmail.split('@')[0];
  const cleanUsername = data.username
    ? data.username.trim().toLowerCase().replace(/^@+/, '').replace(/[^a-z0-9_.]/g, '')
    : normEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_.]/g, '');

  // 1. Kiểm tra trùng lặp tài khoản (Duplicate Email & Duplicate Username)
  const existingAccounts = getRegisteredAccounts();
  const duplicateEmail = existingAccounts.find((a) => a.email.toLowerCase() === normEmail);
  if (duplicateEmail) {
    throw new Error('Email này đã được đăng ký tài khoản. Vui lòng đăng nhập hoặc dùng email khác.');
  }

  if (cleanUsername) {
    const duplicateUsername = existingAccounts.find((a) => a.username.toLowerCase() === cleanUsername);
    if (duplicateUsername) {
      throw new Error(`Tên người dùng @${cleanUsername} đã được sử dụng. Vui lòng chọn tên khác.`);
    }
  }

  if (cleanUsername) {
    localStorage.setItem(STORAGE_USERNAME_KEY, cleanUsername);
  }

  try {
    await api.post('/auth/register', {
      email: normEmail,
      password: data.password,
      displayName,
    });

    saveRegisteredAccount({
      email: normEmail,
      username: cleanUsername || 'snapper',
      displayName,
      createdAt: new Date().toISOString(),
    });

    return await loginUser({ email: normEmail, password: data.password });
  } catch (err: any) {
    // Nếu backend báo trùng lặp Email (409 Conflict)
    if (err?.response?.status === 409 || err?.response?.data?.code === 'EMAIL_EXISTS') {
      throw new Error('Email này đã được đăng ký tài khoản. Vui lòng đăng nhập hoặc dùng email khác.');
    }
    throw err;
  }
}

export function getCurrentUser(): User | null {
  try {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    if (!token || !raw) return null;
    return JSON.parse(raw);
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
