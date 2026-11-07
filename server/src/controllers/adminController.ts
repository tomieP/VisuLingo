import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/adminService';

/* ========================================================
   1. QUẢN LÝ NGƯỜI DÙNG (/api/admin/users)
   ======================================================== */

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const q = req.query.q as string | undefined;
    const status = req.query.status as 'active' | 'locked' | undefined;
    const role = req.query.role as 'user' | 'admin' | undefined;

    const result = await adminService.listUsers(page, limit, q, status, role);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminUserId = req.user!.userId;
    const { id } = req.params as { id: string };
    const { role, status } = req.body as Record<string, unknown>;

    const updatedUser = await adminService.updateUser(
      adminUserId,
      id,
      {
        role: role === 'admin' || role === 'user' ? role : undefined,
        status: status === 'active' || status === 'locked' ? status : undefined,
      },
      req.ip,
    );

    res.status(200).json({ message: 'Cập nhật tài khoản người dùng thành công', user: updatedUser });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminUserId = req.user!.userId;
    const { id } = req.params as { id: string };

    await adminService.deleteUser(adminUserId, id, req.ip);
    res.status(200).json({ message: 'Đã xóa tài khoản người dùng thành công' });
  } catch (error) {
    next(error);
  }
}

/* ========================================================
   2. QUẢN LÝ TỪ VỰNG & ÁNH XẠ NHÃN
   ======================================================== */

export async function listVocabulary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const q = req.query.q as string | undefined;
    const status = req.query.status as 'auto' | 'verified' | 'hidden' | undefined;

    const result = await adminService.listVocabulary(page, limit, q, status);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateVocabulary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminUserId = req.user!.userId;
    const { id } = req.params as { id: string };
    const { meaningVi, ipa, exampleSentence, status } = req.body as Record<string, unknown>;

    const updated = await adminService.updateVocabulary(
      adminUserId,
      id,
      {
        meaningVi: typeof meaningVi === 'string' ? meaningVi : undefined,
        ipa: typeof ipa === 'string' ? ipa : undefined,
        exampleSentence: typeof exampleSentence === 'string' ? exampleSentence : undefined,
        status: status === 'auto' || status === 'verified' || status === 'hidden' ? status : undefined,
      },
      req.ip,
    );

    res.status(200).json({ message: 'Cập nhật từ vựng thành công', vocabulary: updated });
  } catch (error) {
    next(error);
  }
}

export async function listLabelMappings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const q = req.query.q as string | undefined;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

    const result = await adminService.listLabelMappings(page, limit, q, isActive);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function createLabelMapping(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminUserId = req.user!.userId;
    const { rawLabel, normalizedLabel, language, isActive } = req.body as Record<string, unknown>;

    if (typeof rawLabel !== 'string' || typeof normalizedLabel !== 'string') {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Yêu cầu rawLabel và normalizedLabel', retryable: false });
      return;
    }

    const mapping = await adminService.createLabelMapping(
      adminUserId,
      {
        rawLabel,
        normalizedLabel,
        language: typeof language === 'string' ? language : undefined,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
      },
      req.ip,
    );

    res.status(201).json({ message: 'Tạo ánh xạ nhãn thành công', mapping });
  } catch (error) {
    next(error);
  }
}

export async function updateLabelMapping(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminUserId = req.user!.userId;
    const { id } = req.params as { id: string };
    const { rawLabel, normalizedLabel, isActive } = req.body as Record<string, unknown>;

    const updated = await adminService.updateLabelMapping(
      adminUserId,
      id,
      {
        rawLabel: typeof rawLabel === 'string' ? rawLabel : undefined,
        normalizedLabel: typeof normalizedLabel === 'string' ? normalizedLabel : undefined,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
      },
      req.ip,
    );

    res.status(200).json({ message: 'Cập nhật ánh xạ nhãn thành công', mapping: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteLabelMapping(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminUserId = req.user!.userId;
    const { id } = req.params as { id: string };

    await adminService.deleteLabelMapping(adminUserId, id, req.ip);
    res.status(200).json({ message: 'Đã xóa ánh xạ nhãn thành công' });
  } catch (error) {
    next(error);
  }
}

/* ========================================================
   3. CẤU HÌNH & THỐNG KÊ & AUDIT LOGS
   ======================================================== */

export async function getSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await adminService.getSettings();
    res.status(200).json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function updateSetting(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminUserId = req.user!.userId;
    const { key, value } = req.body as Record<string, unknown>;

    if (typeof key !== 'string' || typeof value !== 'string') {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Yêu cầu key và value hợp lệ', retryable: false });
      return;
    }

    const updated = await adminService.updateSetting(adminUserId, key, value, req.ip);
    res.status(200).json({ message: 'Cập nhật cấu hình thành công', setting: updated });
  } catch (error) {
    next(error);
  }
}

export async function getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await adminService.getStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}

export async function listAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const action = req.query.action as string | undefined;
    const entityType = req.query.entityType as string | undefined;

    const logs = await adminService.listAuditLogs(page, limit, action, entityType);
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
}
