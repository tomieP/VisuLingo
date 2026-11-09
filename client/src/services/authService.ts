import api from './api';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

const STORAGE_USER_KEY = 'visulingo_user';
const STORAGE_TOKEN_KEY = 'visulingo_token';
const STORAGE_USERNAME_KEY = 'visulingo_username';
const STORAGE_REGISTERED_ACCOUNTS_KEY = 'visulingo_registered_accounts';
const STORAGE_LOCAL_CREDENTIALS_KEY = 'visulingo_local_credentials';

interface LocalAccountRecord {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  username: string;
  role: 'user' | 'admin';
  createdAt: string;
}

function getLocalCredentials(): LocalAccountRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_LOCAL_CREDENTIALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCredential(record: LocalAccountRecord): void {
  const list = getLocalCredentials();
  const filtered = list.filter((a) => a.email.toLowerCase() !== record.email.toLowerCase());
  filtered.push(record);
  localStorage.setItem(STORAGE_LOCAL_CREDENTIALS_KEY, JSON.stringify(filtered));
}

function hashLocalPassword(pw: string): string {
  try {
    return btoa(unescape(encodeURIComponent(pw + '_vl_salt_2026')));
  } catch {
    return pw + '_vl_salt_2026';
  }
}

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
    // Nếu backend chưa triển khai hoặc 404 (do chỉ deploy frontend tĩnh Vercel)
    const isServerUnavailable =
      !err.response ||
      err.response.status === 404 ||
      err.response.status >= 500 ||
      err.code === 'ERR_NETWORK' ||
      typeof err.response?.data === 'string';

    if (isServerUnavailable) {
      const localUsers = getLocalCredentials();
      const userMatch = localUsers.find((u) => u.email.toLowerCase() === normEmail);
      if (userMatch) {
        if (userMatch.passwordHash === hashLocalPassword(data.password)) {
          const localToken = `visulingo_local_token_${Date.now()}_${userMatch.id}`;
          const user: User = {
            id: userMatch.id,
            email: userMatch.email,
            firstName: userMatch.displayName || userMatch.email.split('@')[0],
            lastName: '',
            username: userMatch.username,
            role: userMatch.role,
          };
          localStorage.setItem(STORAGE_TOKEN_KEY, localToken);
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
          localStorage.setItem(STORAGE_USERNAME_KEY, userMatch.username);
          window.dispatchEvent(new Event('visulingo_auth_changed'));
          return { token: localToken, user };
        } else {
          throw new Error('Mật khẩu không chính xác.');
        }
      } else {
        throw new Error('Tài khoản chưa được đăng ký trên thiết bị này. Vui lòng bấm Đăng ký trước.');
      }
    }

    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
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

    // Nếu server backend chưa bật (404 trên Vercel hoặc lỗi mạng) -> Tự động lưu tài khoản an toàn trên máy
    const isServerUnavailable =
      !err.response ||
      err.response.status === 404 ||
      err.response.status >= 500 ||
      err.code === 'ERR_NETWORK' ||
      typeof err.response?.data === 'string';

    if (isServerUnavailable) {
      const localId = `user_${Date.now()}`;
      const localRecord: LocalAccountRecord = {
        id: localId,
        email: normEmail,
        passwordHash: hashLocalPassword(data.password),
        displayName,
        username: cleanUsername || 'snapper',
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      saveLocalCredential(localRecord);

      saveRegisteredAccount({
        email: normEmail,
        username: cleanUsername || 'snapper',
        displayName,
        createdAt: new Date().toISOString(),
      });

      return await loginUser({ email: normEmail, password: data.password });
    }

    if (err?.response?.data?.message) {
      throw new Error(err.response.data.message);
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
