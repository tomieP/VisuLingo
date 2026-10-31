import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { queryOne } from '../config/database';
import { env } from '../config/env';
import { Role } from '../config/constants';

const SALT_ROUNDS = 12;

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  role: Role;
}

function toUser(row: UserRow): AuthUser {
  return { id: row.id, email: row.email, firstName: row.first_name ?? undefined, lastName: row.last_name ?? undefined, role: row.role };
}

function generateToken(user: AuthUser): string {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });
}

export async function register(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthResult> {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const row = await queryOne<UserRow>(
    `INSERT INTO users (email, password_hash, first_name, last_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, password_hash, first_name, last_name, role`,
    [email.toLowerCase().trim(), passwordHash, firstName ?? null, lastName ?? null],
  );
  if (!row) throw Object.assign(new Error('Could not create user'), { statusCode: 500 });
  const user = toUser(row);
  return { token: generateToken(user), user };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const row = await queryOne<UserRow>(
    `SELECT id, email, password_hash, first_name, last_name, role
     FROM users WHERE email = $1 AND is_active = true`,
    [email.toLowerCase().trim()],
  );
  if (!row || !(await bcrypt.compare(password, row.password_hash))) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }
  const user = toUser(row);
  return { token: generateToken(user), user };
}