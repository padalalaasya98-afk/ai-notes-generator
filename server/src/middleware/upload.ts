import multer from 'multer';
import { Request } from 'express';

// Store in memory for direct buffer processing
const storage = multer.memoryStorage();

// Allowed PDF mime types
const PDF_MIME_TYPES = ['application/pdf'];

// Allowed Audio mime types
const AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'audio/webm',
  'audio/ogg',
  'audio/aac'
];

export const uploadPdf = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max
    files: 1
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const isPdfMime = PDF_MIME_TYPES.includes(file.mimetype.toLowerCase());
    const isPdfExt = file.originalname.toLowerCase().endsWith('.pdf');

    if (isPdfMime || isPdfExt) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF documents (.pdf) are allowed.'));
    }
  }
});

export const uploadAudio = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max
    files: 1
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const isAudioMime = AUDIO_MIME_TYPES.includes(file.mimetype.toLowerCase());
    const ext = file.originalname.toLowerCase().split('.').pop() || '';
    const isAudioExt = ['mp3', 'wav', 'm4a', 'webm', 'ogg', 'aac'].includes(ext);

    if (isAudioMime || isAudioExt) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio format. Supported formats: MP3, WAV, M4A, WEBM, OGG, AAC.'));
    }
  }
});
