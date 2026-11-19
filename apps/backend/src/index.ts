import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import projectRoutes from './routes/project.routes.js';
import systemRoutes from './routes/system.routes.js';
import { StorageService } from './storage/storage.service.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize storage and serve static files
const storage = StorageService.getInstance();
app.use('/storage', express.static(storage.getBaseDir()));

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/system', systemRoutes);

// Base route
app.get('/api', (req, res) => {
  res.json({
    name: 'VietSu AI Studio Backend API',
    version: '1.0.0',
    documentation: '/docs',
    endpoints: {
      projects: '/api/projects',
      health: '/api/system/health'
    }
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`[VietSu AI Studio Backend] Server listening at http://localhost:${port}`);
    console.log(`[Storage] Assets mapped from: ${storage.getBaseDir()}`);
  });
}

export default app;
