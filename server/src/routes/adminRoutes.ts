import { Router } from 'express';
import { authenticateJwt, requireRole } from '../middlewares/authMiddleware';
import { ROLES } from '../config/constants';
import {
  listUsers,
  updateUser,
  deleteUser,
  listVocabulary,
  updateVocabulary,
  listLabelMappings,
  createLabelMapping,
  updateLabelMapping,
  deleteLabelMapping,
  getSettings,
  updateSetting,
  getStats,
  listAuditLogs,
} from '../controllers/adminController';

const router = Router();

// Dành riêng cho vai trò Admin
router.use(authenticateJwt, requireRole([ROLES.ADMIN]));

// 1. Quản lý người dùng
router.get('/users', listUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// 2. Quản lý từ vựng
router.get('/vocabulary', listVocabulary);
router.patch('/vocabulary/:id', updateVocabulary);

// 3. Quản lý ánh xạ nhãn AI
router.get('/label-mappings', listLabelMappings);
router.post('/label-mappings', createLabelMapping);
router.patch('/label-mappings/:id', updateLabelMapping);
router.delete('/label-mappings/:id', deleteLabelMapping);

// 4. Cấu hình & Thống kê & Audit logs
router.get('/settings', getSettings);
router.patch('/settings', updateSetting);
router.get('/stats', getStats);
router.get('/audit-logs', listAuditLogs);

export default router;
