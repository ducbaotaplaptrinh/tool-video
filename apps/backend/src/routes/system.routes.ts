import { Router } from 'express';
import { prisma } from '../db.js';
import { exec } from 'child_process';
import util from 'util';
import { StorageService } from '../storage/storage.service.js';

const execAsync = util.promisify(exec);
const router = Router();

router.get('/health', async (req, res) => {
  let dbOk = false;
  let ffmpegVersion = 'Not installed';
  let storageOk = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (e: any) {
    dbOk = false;
  }

  try {
    const { stdout } = await execAsync('ffmpeg -version');
    ffmpegVersion = stdout.split('\n')[0] || 'Available';
  } catch (e: any) {
    ffmpegVersion = 'FFmpeg not detected';
  }

  try {
    const storage = StorageService.getInstance();
    storage.ensureDirectories();
    storageOk = true;
  } catch (e: any) {
    storageOk = false;
  }

  res.json({
    status: dbOk && storageOk ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    database: dbOk ? 'CONNECTED' : 'DISCONNECTED',
    ffmpeg: ffmpegVersion,
    storage: storageOk ? 'READY' : 'ERROR',
    version: '1.0.0'
  });
});

export default router;
