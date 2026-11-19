import { ScriptSceneDraft, SceneAudioTrack } from '@vietsu/shared';
import { ProviderRegistry } from '@vietsu/ai-providers';
import { StorageService } from '../storage/storage.service.js';

export class VoiceAgent {
  async execute(scenes: ScriptSceneDraft[]): Promise<SceneAudioTrack[]> {
    const registry = ProviderRegistry.getInstance();
    const ttsProvider = registry.getTTS();
    const storage = StorageService.getInstance();
    const audioDir = storage.getAudioDir();

    const tracks: SceneAudioTrack[] = [];

    for (const scene of scenes) {
      const track = await ttsProvider.synthesizeSpeech(scene.narrativeText, {
        sceneNumber: scene.sceneNumber,
        outputDir: audioDir,
        voiceGender: 'MALE'
      });
      tracks.push(track);
    }

    return tracks;
  }
}
