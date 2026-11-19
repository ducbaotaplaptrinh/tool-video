import fs from 'fs';
import path from 'path';

export class StorageService {
  private static instance: StorageService;
  private baseDir: string;

  private constructor() {
    // Relative to apps/backend root or custom STORAGE_DIR
    const configured = process.env.STORAGE_DIR || '../../storage';
    this.baseDir = path.resolve(process.cwd(), configured);
    this.ensureDirectories();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public ensureDirectories() {
    const dirs = ['assets', 'audio', 'videos', 'temp'];
    for (const d of dirs) {
      const fullPath = path.join(this.baseDir, d);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
  }

  public getBaseDir(): string {
    return this.baseDir;
  }

  public getAssetsDir(): string {
    return path.join(this.baseDir, 'assets');
  }

  public getAudioDir(): string {
    return path.join(this.baseDir, 'audio');
  }

  public getVideosDir(): string {
    return path.join(this.baseDir, 'videos');
  }

  public getTempDir(): string {
    return path.join(this.baseDir, 'temp');
  }

  public getPublicUrl(category: 'assets' | 'audio' | 'videos', filename: string): string {
    return `/storage/${category}/${filename}`;
  }
}
