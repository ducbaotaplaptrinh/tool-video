import { 
  ResearchDossier, 
  ScriptDocument, 
  VisualAsset, 
  SceneAudioTrack, 
  CostRecord, 
  ServiceType,
  CameraMotion
} from '@vietsu/shared';

export interface ILLMProvider {
  name: string;
  isMock: boolean;
  researchHistory(topic: string, historicalEra: string): Promise<ResearchDossier>;
  generateScript(dossier: ResearchDossier, options?: { targetDurationSec?: number }): Promise<ScriptDocument>;
  estimateCost(units: number, service: ServiceType): CostRecord;
}

export interface ImageGenerationOptions {
  sceneNumber: number;
  topicTitle: string;
  historicalEra: string;
  cameraMotion: CameraMotion;
  outputDir: string;
  width?: number;
  height?: number;
}

export interface IImageProvider {
  name: string;
  isMock: boolean;
  generateImage(prompt: string, options: ImageGenerationOptions): Promise<VisualAsset>;
  estimateCost(imagesCount: number): CostRecord;
}

export interface TTSOptions {
  sceneNumber: number;
  outputDir: string;
  voiceGender?: 'MALE' | 'FEMALE';
  voiceName?: string;
  speechRate?: string | number;
  pitch?: string;
}

export interface ITTSProvider {
  name: string;
  isMock: boolean;
  synthesizeSpeech(narrativeText: string, options: TTSOptions): Promise<SceneAudioTrack>;
  estimateCost(durationSec: number): CostRecord;
}

export interface IVideoProvider {
  name: string;
  isMock: boolean;
  animateImage?(imagePath: string, prompt: string, outputDir: string): Promise<string>;
  estimateCost(videoSeconds: number): CostRecord;
}
