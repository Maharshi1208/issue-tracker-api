// src/app.ts
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import openapi from './openapi';
import issuesRouter from './routes/issues';

const app = express();

// If running behind a proxy (Docker/ingress), trust it for real IPs (needed for rate-limit)
app.set('trust proxy', 1);

// Logging (structured JSON)
app.use(
  pinoHttp({
    autoLogging: true,
    // redact authorization headers if you later add auth
    redact: { paths: ['req.headers.authorization'], remove: true },
  })
);

// Security headers
app.use(
  helmet({
    // Swagger UI and your API are same-origin — defaults are fine
  })
);

// ---- CORS (allow multiple web UI origins) ----
// Example:
//   CLIENT_ORIGIN="https://web-a.example.com,https://web-b.example.com,http://localhost:8080"
const rawOrigins = process.env.CLIENT_ORIGIN ?? 'http://localhost:8080';
const allowedOrigins = rawOrigins
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / server-to-server / curl (no Origin header)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

// JSON body
app.use(express.json());

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Optional: redirect root to docs (must be BEFORE 404 handler)
app.get('/', (_req, res) => res.redirect('/docs'));

// Basic rate limit for all API routes (adjust to your needs)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 300,          // 300 requests per minute per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use('/api', limiter);

// Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

// API routes
app.use('/api/issues', issuesRouter);

// 404 handler (must be after routes)
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// Error handler (last)
app.use((err: any, req: Request & { log?: any }, res: Response, _next: NextFunction) => {
  // pino-http adds req.log
  if (req?.log) req.log.error({ err }, 'Unhandled error');
  const status = typeof err?.status === 'number' ? err.status : 500;
  const message = err?.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

export default app;
