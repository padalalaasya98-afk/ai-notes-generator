import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or current folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initDb } from './db';
import authRoutes from './routes/authRoutes';
import sourcesRoutes from './routes/sourcesRoutes';
import notesRoutes from './routes/notesRoutes';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Request logging (sanitized, privacy-friendly)
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.path.startsWith('/api/health')) {
      console.log(`[HTTP] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'AI Notes Generator Backend',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sources', sourcesRoutes);
app.use('/api/notes', notesRoutes);

// 404 handler for API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `API route ${req.method} ${req.originalUrl} not found.`
  });
});

// Global error handling middleware (Sanitizes errors, hides secrets)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Server Error]:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected server error occurred.';

  // Never leak internal secrets or stack traces to client
  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? (process.env.NODE_ENV === 'development' ? message : 'Internal server error.') : message
  });
});

async function startServer() {
  try {
    console.log('[Startup] Initializing PostgreSQL database...');
    await initDb();
    console.log('[Startup] Database initialized successfully.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`===============================================`);
      console.log(` AI Notes Generator Backend Running `);
      console.log(` Local:   http://localhost:${PORT}`);
      console.log(` Health:  http://localhost:${PORT}/api/health`);
      console.log(` Client:  ${CLIENT_URL}`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('[Startup Fatal Error]:', error);
    process.exit(1);
  }
}

startServer();
