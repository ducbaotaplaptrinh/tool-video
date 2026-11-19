import { ScriptSceneDraft, VisualAsset } from '@vietsu/shared';
import { ProviderRegistry } from '@vietsu/ai-providers';
import { StorageService } from '../storage/storage.service.js';

export class VisualAgent {
  async execute(
    scenes: ScriptSceneDraft[], 
    topicTitle: string, 
    historicalEra: string,
    providerMode?: 'live' | 'mock'
  ): Promise<VisualAsset[]> {
    const registry = ProviderRegistry.getInstance();
    const imageProvider = registry.getImage(providerMode || 'mock');
    const storage = StorageService.getInstance();
    const assetsDir = storage.getAssetsDir();

    const assets: VisualAsset[] = [];

    for (const scene of scenes) {
      // Primary Shot
      const primaryAsset = await imageProvider.generateImage(scene.visualPrompt, {
        sceneNumber: scene.sceneNumber,
        topicTitle,
        historicalEra,
        cameraMotion: scene.cameraMotion || 'ZOOM_IN',
        outputDir: assetsDir,
        width: 1080,
        height: 1920
      });
      assets.push(primaryAsset);

      // Multi-Shot Enhancement: For longer scenes (> 7s), generate a complementary secondary shot
      if (scene.estimatedDurationSec >= 8) {
        const altMotion = scene.cameraMotion === 'ZOOM_IN' ? 'PAN_LEFT' : 'ZOOM_OUT';
        const altPrompt = `${scene.visualPrompt}, heroic close-up detail, dramatic cinematic lighting, vertical 9:16`;
        try {
          const secondaryAsset = await imageProvider.generateImage(altPrompt, {
            sceneNumber: scene.sceneNumber,
            topicTitle,
            historicalEra,
            cameraMotion: altMotion,
            outputDir: assetsDir,
            width: 1080,
            height: 1920
          });
          assets.push(secondaryAsset);
        } catch {
          // If secondary shot generation fails, primary asset remains sufficient
        }
      }
    }

    return assets;
  }
}
