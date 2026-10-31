import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { listCollections, createCollection, getCollection, updateCollection, deleteCollection } from '../controllers/collectionController';

const router = Router();
router.use(authenticate);
router.get('/', listCollections);
router.post('/', createCollection);
router.get('/:id', getCollection);
router.patch('/:id', updateCollection);
router.delete('/:id', deleteCollection);

export default router;