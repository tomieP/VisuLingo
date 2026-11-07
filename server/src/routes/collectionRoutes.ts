import { Router } from 'express';
import { authenticateJwt } from '../middlewares/authMiddleware';
import {
  listCollections,
  createCollection,
  getCollection,
  updateCollection,
  deleteCollection,
  addImageToCollection,
  removeImageFromCollection,
  getCollectionVocabulary,
} from '../controllers/collectionController';

const router = Router();

// Tất cả route trong collections đều yêu cầu authenticateJwt
router.use(authenticateJwt);

router.get('/', listCollections);
router.post('/', createCollection);
router.get('/:id', getCollection);
router.patch('/:id', updateCollection);
router.delete('/:id', deleteCollection);

// Quản lý ảnh trong bộ sưu tập
router.post('/:id/images', addImageToCollection);
router.delete('/:id/images/:imageId', removeImageFromCollection);

// Từ vựng tổng hợp
router.get('/:id/vocabulary', getCollectionVocabulary);

export default router;
