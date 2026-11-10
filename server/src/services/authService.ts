import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, queryOne } from '../config/database';
import { env } from '../config/env';
import { Role } from '../config/constants';

const SALT_ROUNDS = 10;

export interface PublicUser {
  id: string;
  email: string;
  displayName: string | null;
  role: Role;
}

export interface AuthResult {
  token: string;
  user: PublicUser;
}

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  role: Role;
  status: 'active' | 'locked';
  created_at: Date;
  last_login_at: Date | null;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  role: Role;
  status: 'active' | 'locked';
  createdAt: string;
  lastLoginAt: string | null;
}

function applicationError(message: string, statusCode: number, code: string, retryable = false): Error {
  const err = new Error(message) as Error & { statusCode: number; code: string; retryable: boolean };
  err.statusCode = statusCode;
  err.code = code;
  err.retryable = retryable;
  return err;
}

function toPublicUser(row: Pick<UserRow, 'id' | 'email' | 'display_name' | 'role'>): PublicUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
  };
}

function toProfile(row: UserRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at).toISOString() : null,
  };
}

function generateToken(user: PublicUser): string {
  return jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  );
}

export async function register(email: string, password: string, displayName?: string): Promise<{ message: string; user: PublicUser }> {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await queryOne<{ id: string }>('SELECT id FROM users WHERE lower(email) = $1', [normalizedEmail]);
  if (existing) {
    throw applicationError('Email đã được đăng ký', 409, 'EMAIL_EXISTS');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  try {
    const row = await queryOne<Pick<UserRow, 'id' | 'email' | 'display_name' | 'role'>>(
      `INSERT INTO users (email, password_hash, display_name, role, status)
       VALUES ($1, $2, $3, 'user', 'active')
       RETURNING id, email, display_name, role`,
      [normalizedEmail, passwordHash, displayName?.trim() || null],
    );
    if (!row) {
      throw applicationError('Không thể tạo tài khoản', 500, 'INTERNAL_ERROR');
    }
    return { message: 'Đăng ký tài khoản thành công', user: toPublicUser(row) };
  } catch (error: any) {
    if (error?.code === '23505') {
      throw applicationError('Email đã được đăng ký', 409, 'EMAIL_EXISTS');
    }
    throw error;
  }
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const row = await queryOne<UserRow>(
    `SELECT id, email, password_hash, display_name, role, status, created_at, last_login_at
     FROM users WHERE lower(email) = $1`,
    [normalizedEmail],
  );

  if (!row) {
    throw applicationError('Email hoặc mật khẩu không chính xác', 401, 'INVALID_CREDENTIALS');
  }

  if (row.status === 'locked') {
    throw applicationError('Tài khoản của bạn đã bị khóa', 403, 'ACCOUNT_LOCKED');
  }

  const passwordMatches = await bcrypt.compare(password, row.password_hash);
  if (!passwordMatches) {
    throw applicationError('Email hoặc mật khẩu không chính xác', 401, 'INVALID_CREDENTIALS');
  }

  const updatedRow = await queryOne<UserRow>(
    `UPDATE users SET last_login_at = now()
     WHERE id = $1
     RETURNING id, email, password_hash, display_name, role, status, created_at, last_login_at`,
    [row.id],
  );
  const userRow = updatedRow ?? row;
  const user = toPublicUser(userRow);
  return { token: generateToken(user), user };
}

export async function getCurrentUser(userId: string): Promise<UserProfile> {
  const row = await queryOne<UserRow>(
    `SELECT id, email, password_hash, display_name, role, status, created_at, last_login_at
     FROM users WHERE id = $1`,
    [userId],
  );
  if (!row) {
    throw applicationError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn', 401, 'UNAUTHORIZED');
  }
  return toProfile(row);
}

export interface StreakResult {
  streak: number;
  isNewStreakDay?: boolean;
  lastActiveDate: string | null;
  serverDate: string;
}

export async function getUserStreak(userId: string): Promise<StreakResult> {
  const now = new Date();
  const serverDate = now.toISOString().slice(0, 10);
  try {
    const row = await queryOne<{ streak_count: number | null; last_active_date: string | null }>(
      `SELECT streak_count, to_char(last_active_date, 'YYYY-MM-DD') as last_active_date FROM users WHERE id = $1`,
      [userId]
    );
    return {
      streak: row?.streak_count || 0,
      lastActiveDate: row?.last_active_date || null,
      serverDate,
    };
  } catch (err: any) {
    if (err?.code === '42703') {
      try {
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_date DATE`);
      } catch {}
    }
    return { streak: 0, lastActiveDate: null, serverDate };
  }
}

export async function recordUserStreak(userId: string): Promise<StreakResult> {
  const now = new Date();
  const serverDate = now.toISOString().slice(0, 10);
  try {
    const row = await queryOne<{ streak_count: number | null; last_active_date: string | null }>(
      `SELECT streak_count, to_char(last_active_date, 'YYYY-MM-DD') as last_active_date FROM users WHERE id = $1`,
      [userId]
    );

    if (!row) {
      throw applicationError('Không tìm thấy tài khoản người dùng', 404, 'NOT_FOUND');
    }

    const currentStreak = row.streak_count || 0;
    const lastDate = row.last_active_date;

    // Đã tính streak hôm nay rồi (so sánh chuẩn theo ngày server UTC, chống cheat đổi ngày thiết bị)
    if (lastDate === serverDate && currentStreak > 0) {
      return {
        streak: currentStreak,
        isNewStreakDay: false,
        lastActiveDate: serverDate,
        serverDate,
      };
    }

    const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    let newStreak = 1;
    if (lastDate === yesterdayDate && currentStreak > 0) {
      // Sang ngày kế tiếp liên tiếp: Tăng streak
      newStreak = currentStreak + 1;
    }

    await query(
      `UPDATE users SET streak_count = $1, last_active_date = CURRENT_DATE WHERE id = $2`,
      [newStreak, userId]
    );

    return {
      streak: newStreak,
      isNewStreakDay: true,
      lastActiveDate: serverDate,
      serverDate,
    };
  } catch (err: any) {
    if (err?.code === '42703') {
      try {
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_date DATE`);
        return recordUserStreak(userId);
      } catch {}
    }
    throw err;
  }
}

export async function searchUsers(q: string): Promise<{ id: string; displayName: string | null; tagName: string; role: string }[]> {
  const clean = q.trim();
  if (!clean) return [];
  const term = `%${clean.replace(/^@+/, '')}%`;
  const rows = await query<{ id: string; email: string; display_name: string | null; role: Role }>(
    `SELECT id, email, display_name, role
     FROM users
     WHERE status = 'active'
       AND (LOWER(email) LIKE LOWER($1) OR LOWER(display_name) LIKE LOWER($1))
     ORDER BY created_at DESC
     LIMIT 10`,
    [term]
  );
  return rows.map((r) => {
    const handle = r.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.]/g, '');
    return {
      id: r.id,
      displayName: r.display_name || handle,
      tagName: `@${handle}`,
      role: r.role,
    };
  });
}
