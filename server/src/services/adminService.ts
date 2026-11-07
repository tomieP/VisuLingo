import { query, queryOne } from '../config/database';
import logger from '../utils/logger';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function applicationError(message: string, statusCode: number, code: string, retryable = false) {
  return Object.assign(new Error(message), { statusCode, code, retryable });
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminUserItem {
  id: string;
  email: string;
  displayName: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'locked';
  createdAt: string;
  lastLoginAt: string | null;
  totalSavedWords: number;
  totalCollections: number;
}

export interface AdminVocabularyItem {
  id: string;
  word: string;
  meaningVi: string;
  ipa: string | null;
  exampleSentence: string | null;
  source: string;
  status: 'auto' | 'verified' | 'hidden';
  cachedAt: string;
  updatedAt: string;
}

export interface AdminLabelMappingItem {
  id: string;
  rawLabel: string;
  normalizedLabel: string;
  language: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminSettingItem {
  key: string;
  value: string;
  description: string | null;
  updatedAt: string;
}

export interface AdminAuditLogItem {
  id: string;
  userId: string | null;
  adminEmail: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  oldValue: any;
  newValue: any;
  ipAddress: string | null;
  createdAt: string;
}

export interface AdminStatsResult {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  newUsersThisWeek: number;
  totalAnalyses: number;
  failedAnalyses: number;
  errorRatePercent: number;
  avgLatencyMs: number;
  totalCollections: number;
  totalImages: number;
  totalVocabularies: number;
  topSavedWords: Array<{ word: string; count: number }>;
}

/**
 * Ghi nhật ký kiểm toán cho thao tác của Admin
 */
export async function logAudit(
  adminUserId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  oldValue: any = null,
  newValue: any = null,
  ipAddress: string | null = null,
): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        adminUserId,
        action,
        entityType,
        entityId && UUID_REGEX.test(entityId) ? entityId : null,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        ipAddress,
      ],
    );
  } catch (err) {
    logger.error('Failed to write audit log', { error: err });
  }
}

/* ========================================================
   1. QUẢN LÝ NGƯỜI DÙNG (/api/admin/users)
   ======================================================== */

export async function listUsers(
  page = 1,
  limit = 20,
  q?: string,
  status?: 'active' | 'locked',
  role?: 'user' | 'admin',
): Promise<PaginatedResult<AdminUserItem>> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100);
  const offset = (safePage - 1) * safeLimit;

  let whereClauses: string[] = [];
  const params: any[] = [];

  if (q && q.trim()) {
    params.push(`%${q.trim().toLowerCase()}%`);
    whereClauses.push(`(lower(u.email) ILIKE $${params.length} OR lower(u.display_name) ILIKE $${params.length})`);
  }

  if (status && (status === 'active' || status === 'locked')) {
    params.push(status);
    whereClauses.push(`u.status = $${params.length}`);
  }

  if (role && (role === 'user' || role === 'admin')) {
    params.push(role);
    whereClauses.push(`u.role = $${params.length}`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countRow = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM users u ${whereSql}`,
    params,
  );
  const total = parseInt(countRow?.count ?? '0', 10);

  const dataParams = [...params, safeLimit, offset];
  const rows = await query<any>(
    `SELECT u.id, u.email, u.display_name, u.role, u.status, u.created_at, u.last_login_at,
            (SELECT COUNT(*) FROM saved_words sw WHERE sw.user_id = u.id)::int AS total_saved_words,
            (SELECT COUNT(*) FROM collections c WHERE c.user_id = u.id)::int AS total_collections
     FROM users u
     ${whereSql}
     ORDER BY u.created_at DESC
     LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams,
  );

  return {
    data: rows.map((r) => ({
      id: r.id,
      email: r.email,
      displayName: r.display_name,
      role: r.role,
      status: r.status,
      createdAt: new Date(r.created_at).toISOString(),
      lastLoginAt: r.last_login_at ? new Date(r.last_login_at).toISOString() : null,
      totalSavedWords: parseInt(r.total_saved_words, 10) || 0,
      totalCollections: parseInt(r.total_collections, 10) || 0,
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

export async function updateUser(
  adminUserId: string,
  targetUserId: string,
  data: { role?: 'user' | 'admin'; status?: 'active' | 'locked' },
  ipAddress?: string,
): Promise<AdminUserItem> {
  if (!UUID_REGEX.test(targetUserId)) {
    throw applicationError('Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
  }

  const existing = await queryOne<any>('SELECT * FROM users WHERE id = $1', [targetUserId]);
  if (!existing) {
    throw applicationError('Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
  }

  // Ràng buộc 1: Không tự khóa tài khoản hoặc tự hạ quyền chính mình
  if (adminUserId === targetUserId) {
    if (data.status === 'locked') {
      throw applicationError('Không thể tự khóa tài khoản của chính mình', 400, 'CANNOT_MODIFY_SELF');
    }
    if (data.role === 'user') {
      throw applicationError('Không thể tự hạ quyền quản trị của chính mình', 400, 'CANNOT_MODIFY_SELF');
    }
  }

  // Ràng buộc 2: Phải giữ lại ít nhất 1 Admin hoạt động
  if (
    existing.role === 'admin' &&
    (data.role === 'user' || data.status === 'locked')
  ) {
    const adminCountRow = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND status = 'active' AND id != $1`,
      [targetUserId],
    );
    const activeAdminsRemaining = parseInt(adminCountRow?.count ?? '0', 10);
    if (activeAdminsRemaining < 1) {
      throw applicationError(
        'Hệ thống phải có ít nhất 1 quản trị viên (Admin) đang hoạt động',
        400,
        'LAST_ADMIN_CONSTRAINT',
      );
    }
  }

  const updatedRole = data.role ?? existing.role;
  const updatedStatus = data.status ?? existing.status;

  const row = await queryOne<any>(
    `UPDATE users
     SET role = $1, status = $2
     WHERE id = $3
     RETURNING id, email, display_name, role, status, created_at, last_login_at`,
    [updatedRole, updatedStatus, targetUserId],
  );

  // Ghi nhật ký kiểm toán
  await logAudit(
    adminUserId,
    'UPDATE_USER',
    'users',
    targetUserId,
    { role: existing.role, status: existing.status },
    { role: updatedRole, status: updatedStatus },
    ipAddress,
  );

  const stats = await queryOne<any>(
    `SELECT
       (SELECT COUNT(*) FROM saved_words WHERE user_id = $1)::int AS total_saved_words,
       (SELECT COUNT(*) FROM collections WHERE user_id = $1)::int AS total_collections`,
    [targetUserId],
  );

  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at).toISOString() : null,
    totalSavedWords: parseInt(stats?.total_saved_words, 10) || 0,
    totalCollections: parseInt(stats?.total_collections, 10) || 0,
  };
}

export async function deleteUser(adminUserId: string, targetUserId: string, ipAddress?: string): Promise<void> {
  if (!UUID_REGEX.test(targetUserId)) {
    throw applicationError('Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
  }

  if (adminUserId === targetUserId) {
    throw applicationError('Không thể tự xóa tài khoản của chính mình', 400, 'CANNOT_DELETE_SELF');
  }

  const existing = await queryOne<any>('SELECT * FROM users WHERE id = $1', [targetUserId]);
  if (!existing) {
    throw applicationError('Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
  }

  if (existing.role === 'admin') {
    const adminCountRow = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND status = 'active' AND id != $1`,
      [targetUserId],
    );
    const activeAdminsRemaining = parseInt(adminCountRow?.count ?? '0', 10);
    if (activeAdminsRemaining < 1) {
      throw applicationError(
        'Không thể xóa quản trị viên duy nhất còn lại của hệ thống',
        400,
        'LAST_ADMIN_CONSTRAINT',
      );
    }
  }

  await query('DELETE FROM users WHERE id = $1', [targetUserId]);

  await logAudit(
    adminUserId,
    'DELETE_USER',
    'users',
    targetUserId,
    { email: existing.email, role: existing.role },
    null,
    ipAddress,
  );
}

/* ========================================================
   2. QUẢN LÝ TỪ VỰNG & ÁNH XẠ NHÃN
   ======================================================== */

export async function listVocabulary(
  page = 1,
  limit = 20,
  q?: string,
  status?: 'auto' | 'verified' | 'hidden',
): Promise<PaginatedResult<AdminVocabularyItem>> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100);
  const offset = (safePage - 1) * safeLimit;

  let whereClauses: string[] = [];
  const params: any[] = [];

  if (q && q.trim()) {
    params.push(`%${q.trim().toLowerCase()}%`);
    whereClauses.push(`(lower(word) ILIKE $${params.length} OR lower(meaning_vi) ILIKE $${params.length})`);
  }

  if (status && ['auto', 'verified', 'hidden'].includes(status)) {
    params.push(status);
    whereClauses.push(`status = $${params.length}`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countRow = await queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM vocabularies ${whereSql}`, params);
  const total = parseInt(countRow?.count ?? '0', 10);

  const dataParams = [...params, safeLimit, offset];
  const rows = await query<any>(
    `SELECT id, word, meaning_vi, ipa, example_sentence, source, status, cached_at, updated_at
     FROM vocabularies
     ${whereSql}
     ORDER BY updated_at DESC
     LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams,
  );

  return {
    data: rows.map((r) => ({
      id: r.id,
      word: r.word,
      meaningVi: r.meaning_vi,
      ipa: r.ipa,
      exampleSentence: r.example_sentence,
      source: r.source,
      status: r.status,
      cachedAt: new Date(r.cached_at).toISOString(),
      updatedAt: new Date(r.updated_at).toISOString(),
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

export async function updateVocabulary(
  adminUserId: string,
  vocabId: string,
  data: {
    meaningVi?: string;
    ipa?: string;
    exampleSentence?: string;
    status?: 'auto' | 'verified' | 'hidden';
  },
  ipAddress?: string,
): Promise<AdminVocabularyItem> {
  if (!UUID_REGEX.test(vocabId)) {
    throw applicationError('Không tìm thấy từ vựng', 404, 'VOCAB_NOT_FOUND');
  }

  const existing = await queryOne<any>('SELECT * FROM vocabularies WHERE id = $1', [vocabId]);
  if (!existing) {
    throw applicationError('Không tìm thấy từ vựng', 404, 'VOCAB_NOT_FOUND');
  }

  const updatedMeaning = data.meaningVi !== undefined ? data.meaningVi.trim() : existing.meaning_vi;
  const updatedIpa = data.ipa !== undefined ? data.ipa.trim() : existing.ipa;
  const updatedExample = data.exampleSentence !== undefined ? data.exampleSentence.trim() : existing.example_sentence;
  const updatedStatus = data.status !== undefined ? data.status : existing.status;

  const row = await queryOne<any>(
    `UPDATE vocabularies
     SET meaning_vi = $1, ipa = $2, example_sentence = $3, status = $4, updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [updatedMeaning, updatedIpa, updatedExample, updatedStatus, vocabId],
  );

  await logAudit(
    adminUserId,
    'UPDATE_VOCABULARY',
    'vocabularies',
    vocabId,
    { meaningVi: existing.meaning_vi, status: existing.status },
    { meaningVi: updatedMeaning, status: updatedStatus },
    ipAddress,
  );

  return {
    id: row.id,
    word: row.word,
    meaningVi: row.meaning_vi,
    ipa: row.ipa,
    exampleSentence: row.example_sentence,
    source: row.source,
    status: row.status,
    cachedAt: new Date(row.cached_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function listLabelMappings(
  page = 1,
  limit = 50,
  q?: string,
  isActive?: boolean,
): Promise<PaginatedResult<AdminLabelMappingItem>> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100);
  const offset = (safePage - 1) * safeLimit;

  let whereClauses: string[] = [];
  const params: any[] = [];

  if (q && q.trim()) {
    params.push(`%${q.trim().toLowerCase()}%`);
    whereClauses.push(`(lower(raw_label) ILIKE $${params.length} OR lower(normalized_label) ILIKE $${params.length})`);
  }

  if (isActive !== undefined) {
    params.push(isActive);
    whereClauses.push(`is_active = $${params.length}`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countRow = await queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM label_mappings ${whereSql}`, params);
  const total = parseInt(countRow?.count ?? '0', 10);

  const dataParams = [...params, safeLimit, offset];
  const rows = await query<any>(
    `SELECT id, raw_label, normalized_label, language, is_active, created_at
     FROM label_mappings
     ${whereSql}
     ORDER BY raw_label ASC
     LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams,
  );

  return {
    data: rows.map((r) => ({
      id: r.id,
      rawLabel: r.raw_label,
      normalizedLabel: r.normalized_label,
      language: r.language,
      isActive: !!r.is_active,
      createdAt: new Date(r.created_at).toISOString(),
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

export async function createLabelMapping(
  adminUserId: string,
  data: { rawLabel: string; normalizedLabel: string; language?: string; isActive?: boolean },
  ipAddress?: string,
): Promise<AdminLabelMappingItem> {
  const raw = data.rawLabel.trim().toLowerCase();
  const normalized = data.normalizedLabel.trim().toLowerCase();
  const lang = data.language?.trim().toLowerCase() || 'en';

  if (!raw || !normalized) {
    throw applicationError('rawLabel và normalizedLabel không được để trống', 400, 'VALIDATION_ERROR');
  }

  const dup = await queryOne<{ id: string }>(
    'SELECT id FROM label_mappings WHERE raw_label = $1 AND language = $2',
    [raw, lang],
  );
  if (dup) {
    throw applicationError('Ánh xạ cho nhãn này đã tồn tại', 409, 'DUPLICATE_LABEL_MAPPING');
  }

  const row = await queryOne<any>(
    `INSERT INTO label_mappings (raw_label, normalized_label, language, is_active, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [raw, normalized, lang, data.isActive ?? true, adminUserId],
  );

  await logAudit(adminUserId, 'CREATE_LABEL_MAPPING', 'label_mappings', row.id, null, { raw, normalized, lang }, ipAddress);

  return {
    id: row.id,
    rawLabel: row.raw_label,
    normalizedLabel: row.normalized_label,
    language: row.language,
    isActive: !!row.is_active,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function updateLabelMapping(
  adminUserId: string,
  id: string,
  data: { rawLabel?: string; normalizedLabel?: string; isActive?: boolean },
  ipAddress?: string,
): Promise<AdminLabelMappingItem> {
  if (!UUID_REGEX.test(id)) {
    throw applicationError('Không tìm thấy ánh xạ nhãn', 404, 'LABEL_MAPPING_NOT_FOUND');
  }

  const existing = await queryOne<any>('SELECT * FROM label_mappings WHERE id = $1', [id]);
  if (!existing) {
    throw applicationError('Không tìm thấy ánh xạ nhãn', 404, 'LABEL_MAPPING_NOT_FOUND');
  }

  const updatedRaw = data.rawLabel !== undefined ? data.rawLabel.trim().toLowerCase() : existing.raw_label;
  const updatedNorm = data.normalizedLabel !== undefined ? data.normalizedLabel.trim().toLowerCase() : existing.normalized_label;
  const updatedActive = data.isActive !== undefined ? data.isActive : existing.is_active;

  const row = await queryOne<any>(
    `UPDATE label_mappings
     SET raw_label = $1, normalized_label = $2, is_active = $3
     WHERE id = $4
     RETURNING *`,
    [updatedRaw, updatedNorm, updatedActive, id],
  );

  await logAudit(
    adminUserId,
    'UPDATE_LABEL_MAPPING',
    'label_mappings',
    id,
    { raw: existing.raw_label, norm: existing.normalized_label, active: existing.is_active },
    { raw: updatedRaw, norm: updatedNorm, active: updatedActive },
    ipAddress,
  );

  return {
    id: row.id,
    rawLabel: row.raw_label,
    normalizedLabel: row.normalized_label,
    language: row.language,
    isActive: !!row.is_active,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function deleteLabelMapping(adminUserId: string, id: string, ipAddress?: string): Promise<void> {
  if (!UUID_REGEX.test(id)) {
    throw applicationError('Không tìm thấy ánh xạ nhãn', 404, 'LABEL_MAPPING_NOT_FOUND');
  }

  const existing = await queryOne<any>('SELECT * FROM label_mappings WHERE id = $1', [id]);
  if (!existing) {
    throw applicationError('Không tìm thấy ánh xạ nhãn', 404, 'LABEL_MAPPING_NOT_FOUND');
  }

  await query('DELETE FROM label_mappings WHERE id = $1', [id]);
  await logAudit(adminUserId, 'DELETE_LABEL_MAPPING', 'label_mappings', id, { raw: existing.raw_label }, null, ipAddress);
}

/* ========================================================
   3. CẤU HÌNH & THỐNG KÊ & AUDIT LOGS
   ======================================================== */

export async function getSettings(): Promise<AdminSettingItem[]> {
  const rows = await query<any>('SELECT key, value, description, updated_at FROM app_settings ORDER BY key ASC');
  return rows.map((r) => ({
    key: r.key,
    value: r.value,
    description: r.description,
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}

export async function updateSetting(
  adminUserId: string,
  key: string,
  value: string,
  ipAddress?: string,
): Promise<AdminSettingItem> {
  const existing = await queryOne<any>('SELECT * FROM app_settings WHERE key = $1', [key]);
  if (!existing) {
    throw applicationError('Cấu hình không tồn tại', 404, 'SETTING_NOT_FOUND');
  }

  const row = await queryOne<any>(
    `UPDATE app_settings
     SET value = $1, updated_at = NOW(), updated_by = $2
     WHERE key = $3
     RETURNING key, value, description, updated_at`,
    [value, adminUserId, key],
  );

  await logAudit(adminUserId, 'UPDATE_SETTING', 'app_settings', null, { key, oldValue: existing.value }, { key, newValue: value }, ipAddress);

  return {
    key: row.key,
    value: row.value,
    description: row.description,
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function getStats(): Promise<AdminStatsResult> {
  const usersOverview = await queryOne<any>(
    `SELECT
       COUNT(*)::int AS total_users,
       COUNT(CASE WHEN status = 'active' THEN 1 END)::int AS active_users,
       COUNT(CASE WHEN status = 'locked' THEN 1 END)::int AS locked_users,
       COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END)::int AS new_users_week
     FROM users`,
  );

  const analysesOverview = await queryOne<any>(
    `SELECT
       COUNT(*)::int AS total_analyses,
       COUNT(CASE WHEN status = 'failed' THEN 1 END)::int AS failed_analyses,
       COALESCE(AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000), 0)::int AS avg_latency_ms
     FROM analysis_sessions`,
  );

  const totals = await queryOne<any>(
    `SELECT
       (SELECT COUNT(*) FROM collections)::int AS total_collections,
       (SELECT COUNT(*) FROM images)::int AS total_images,
       (SELECT COUNT(*) FROM vocabularies)::int AS total_vocabularies`,
  );

  const topWords = await query<any>(
    `SELECT v.word, COUNT(sw.id)::int AS count
     FROM saved_words sw
     JOIN vocabularies v ON sw.vocabulary_id = v.id
     GROUP BY v.word
     ORDER BY count DESC
     LIMIT 10`,
  );

  const totalAnalyses = parseInt(analysesOverview?.total_analyses ?? '0', 10);
  const failedAnalyses = parseInt(analysesOverview?.failed_analyses ?? '0', 10);
  const errorRatePercent = totalAnalyses > 0 ? Number(((failedAnalyses / totalAnalyses) * 100).toFixed(2)) : 0;

  return {
    totalUsers: parseInt(usersOverview?.total_users ?? '0', 10),
    activeUsers: parseInt(usersOverview?.active_users ?? '0', 10),
    lockedUsers: parseInt(usersOverview?.locked_users ?? '0', 10),
    newUsersThisWeek: parseInt(usersOverview?.new_users_week ?? '0', 10),
    totalAnalyses,
    failedAnalyses,
    errorRatePercent,
    avgLatencyMs: parseInt(analysesOverview?.avg_latency_ms ?? '0', 10),
    totalCollections: parseInt(totals?.total_collections ?? '0', 10),
    totalImages: parseInt(totals?.total_images ?? '0', 10),
    totalVocabularies: parseInt(totals?.total_vocabularies ?? '0', 10),
    topSavedWords: topWords.map((w) => ({ word: w.word, count: parseInt(w.count, 10) })),
  };
}

export async function listAuditLogs(
  page = 1,
  limit = 20,
  action?: string,
  entityType?: string,
): Promise<PaginatedResult<AdminAuditLogItem>> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100);
  const offset = (safePage - 1) * safeLimit;

  let whereClauses: string[] = [];
  const params: any[] = [];

  if (action && action.trim()) {
    params.push(action.trim());
    whereClauses.push(`a.action = $${params.length}`);
  }

  if (entityType && entityType.trim()) {
    params.push(entityType.trim());
    whereClauses.push(`a.entity_type = $${params.length}`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countRow = await queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM audit_logs a ${whereSql}`, params);
  const total = parseInt(countRow?.count ?? '0', 10);

  const dataParams = [...params, safeLimit, offset];
  const rows = await query<any>(
    `SELECT a.id, a.user_id, u.email AS admin_email, a.action, a.entity_type, a.entity_id,
            a.old_value, a.new_value, a.ip_address, a.created_at
     FROM audit_logs a
     LEFT JOIN users u ON a.user_id = u.id
     ${whereSql}
     ORDER BY a.created_at DESC
     LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams,
  );

  return {
    data: rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      adminEmail: r.admin_email,
      action: r.action,
      entityType: r.entity_type,
      entityId: r.entity_id,
      oldValue: r.old_value,
      newValue: r.new_value,
      ipAddress: r.ip_address,
      createdAt: new Date(r.created_at).toISOString(),
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}
