import express from 'express';
import issuesRouter from './routes/issues';

// ✅ add these two lines:
import swaggerUi from 'swagger-ui-express';
import openapi from './openapi';

const app = express();
app.use(express.json());

// health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// ✅ Swagger UI route
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

// issues routes
app.use('/api/issues', issuesRouter);

export default app;
