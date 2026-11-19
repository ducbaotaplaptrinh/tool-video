import { ScriptSceneDraft, VisualAsset } from '@vietsu/shared';
import { ProviderRegistry } from '@vietsu/ai-providers';
import { StorageService } from '../storage/storage.service.js';

export class VisualAgent {
  async execute(
    scenes: ScriptSceneDraft[], 
    topicTitle: string, 
    historicalEra: string
  ): Promise<VisualAsset[]> {
    const registry = ProviderRegistry.getInstance();
    const imageProvider = registry.getImage();
    const storage = StorageService.getInstance();
    const assetsDir = storage.getAssetsDir();

    const assets: VisualAsset[] = [];

    for (const scene of scenes) {
      const asset = await imageProvider.generateImage(scene.visualPrompt, {
        sceneNumber: scene.sceneNumber,
        topicTitle,
        historicalEra,
        cameraMotion: scene.cameraMotion,
        outputDir: assetsDir,
        width: 1080,
        height: 1920
      });
      assets.push(asset);
    }

    return assets;
  }
}
