import { CostRecord } from '@vietsu/shared';
import { IVideoProvider } from '../interfaces/index.js';

export class MockVideoProvider implements IVideoProvider {
  name = 'MockVideoProvider (Ken Burns Motion Simulator)';
  isMock = true;

  async animateImage(imagePath: string, prompt: string, outputDir: string): Promise<string> {
    // In Mock mode, Ken Burns CSS animation is natively performed in Remotion, 
    // so imagePath is passed directly to the renderer!
    return imagePath;
  }

  estimateCost(videoSeconds: number): CostRecord {
    const costUsd = videoSeconds * 0.05;
    return {
      id: `cost-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      projectId: '',
      provider: this.name,
      service: 'VIDEO_MOTION',
      unitsUsed: videoSeconds,
      unitType: 'SECONDS',
      estimatedCostUSD: costUsd,
      estimatedCostVND: Math.round(costUsd * 25400),
      createdAt: new Date().toISOString()
    };
  }
}
