import express from 'express';
import issuesRouter from './routes/issues';

const app = express();
app.use(express.json());

// health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// mount issues routes
app.use('/api/issues', issuesRouter);

export default app;
