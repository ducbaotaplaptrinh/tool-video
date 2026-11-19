import { 
  IImageProvider, 
  ImageGenerationOptions 
} from '../interfaces/index.js';
import { 
  VisualAsset, 
  CostRecord 
} from '@vietsu/shared';
import fs from 'fs';
import path from 'path';
import { MockImageProvider } from '../mock/mock-image.js';

export class PollinationsImageProvider implements IImageProvider {
  public name = 'PollinationsImageProvider (Flux 9:16 Real AI Images)';
  public isMock = false;
  private fallbackProvider = new MockImageProvider();

  public async generateImage(prompt: string, options: ImageGenerationOptions): Promise<VisualAsset> {
    const width = options.width || 1080;
    const height = options.height || 1920;
    const filename = `scene_${options.sceneNumber}_live_${Date.now()}.jpg`;
    const outputPath = path.join(options.outputDir, filename);

    // Negative prompt & positive historical styling
    const positivePrompt = `Vietnamese history, ${options.historicalEra}, ${prompt}, traditional ancient Vietnamese armor and attire, cinematic lighting, dramatic battlefield or palace atmosphere, 8k resolution, photorealistic masterpiece, 9:16 aspect ratio vertical framing`;
    const negativePrompt = 'modern clothing, western armor, chinese qing dynasty attire, deformed hands, extra limbs, low quality, watermark, blur, text';

    const encodedPrompt = encodeURIComponent(positivePrompt);
    const encodedNegative = encodeURIComponent(negativePrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&negative=${encodedNegative}`;

    try {
      // Fetch real image with 25s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const res = await fetch(imageUrl, {
        headers: { 'User-Agent': 'VietSuStudio/1.0 (Educational Video Studio)' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Pollinations HTTP error: ${res.status}`);
      }

      const buffer = Buffer.from(await res.arrayBuffer());

      if (buffer.length < 5000) {
        throw new Error('Downloaded image file too small, possible service failure');
      }

      // Ensure directory exists and write image
      if (!fs.existsSync(options.outputDir)) {
        fs.mkdirSync(options.outputDir, { recursive: true });
      }
      fs.writeFileSync(outputPath, buffer);

      const publicUrl = `/storage/assets/${filename}`;

      return {
        sceneNumber: options.sceneNumber,
        assetType: 'IMAGE',
        url: publicUrl,
        localPath: outputPath,
        prompt: positivePrompt,
        cameraMotion: options.cameraMotion || 'ZOOM_IN'
      };
    } catch (err: any) {
      console.warn(`[PollinationsImageProvider] Không thể tải ảnh trực tiếp (${err.message}). Kích hoạt cơ chế dự phòng đồ họa chuẩn.`);
      return this.fallbackProvider.generateImage(prompt, options);
    }
  }

  public estimateCost(imagesCount: number): CostRecord {
    return {
      id: `cost_img_${Date.now()}`,
      projectId: '',
      provider: 'Pollinations AI (Flux Open Model)',
      service: 'IMAGE_GENERATION',
      unitsUsed: imagesCount,
      unitType: 'IMAGES',
      estimatedCostUSD: 0,
      estimatedCostVND: 0,
      createdAt: new Date().toISOString()
    };
  }
}
