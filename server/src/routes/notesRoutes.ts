import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  generateNotes,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getDashboardStats
} from '../controllers/notesController';

const router = Router();

// All notes routes require authentication
router.use(requireAuth);

router.post('/generate', generateNotes);
router.get('/stats', getDashboardStats);
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.patch('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
