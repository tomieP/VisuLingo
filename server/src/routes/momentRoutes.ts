import { Router } from 'express';
import { optionalAuthenticate } from '../middlewares/authMiddleware';
import {
  getMoments,
  createMoment,
  reactToMoment,
  deleteMoment,
} from '../controllers/momentController';

const router = Router();

// 1. Lấy danh sách Bảng tin Snap Locket chung (Công khai cho toàn bộ học viên)
router.get('/', getMoments);

// 2. Đăng bài Snap lên Bảng tin đám mây
router.post('/', optionalAuthenticate, createMoment);

// 3. Tương tác thả tim / thả lửa
router.post('/:id/react', reactToMoment);

// 4. Xóa bài Snap
router.delete('/:id', optionalAuthenticate, deleteMoment);

export default router;
