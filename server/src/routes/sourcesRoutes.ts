import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { uploadPdf, uploadAudio } from '../middleware/upload';
import {
  createTextSource,
  uploadPdfSource,
  uploadAudioSource,
  getSources,
  deleteSource
} from '../controllers/sourcesController';

const router = Router();

// All source routes require authentication
router.use(requireAuth);

router.post('/text', createTextSource);
router.post('/pdf', uploadPdf.single('file'), uploadPdfSource);
router.post('/audio', uploadAudio.single('file'), uploadAudioSource);
router.get('/', getSources);
router.delete('/:id', deleteSource);

export default router;
