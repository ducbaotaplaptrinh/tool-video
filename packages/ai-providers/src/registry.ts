import { ILLMProvider, IImageProvider, ITTSProvider, IVideoProvider } from './interfaces/index.js';
import { MockLLMProvider } from './mock/mock-llm.js';
import { MockImageProvider } from './mock/mock-image.js';
import { MockTTSProvider } from './mock/mock-tts.js';
import { MockVideoProvider } from './mock/mock-video.js';
import { LiveLLMProvider } from './live/live-llm.js';
import { PollinationsImageProvider } from './live/pollinations-image.js';
import { EdgeTTSProvider } from './live/edge-tts.js';

export class ProviderRegistry {
  private static instance: ProviderRegistry;

  private llmProviders: Map<string, ILLMProvider> = new Map();
  private imageProviders: Map<string, IImageProvider> = new Map();
  private ttsProviders: Map<string, ITTSProvider> = new Map();
  private videoProviders: Map<string, IVideoProvider> = new Map();

  private defaultLLM: string = 'mock';
  private defaultImage: string = 'mock';
  private defaultTTS: string = 'mock';
  private defaultVideo: string = 'mock';

  private constructor() {
    // 1. Register Mock Providers (Phase 1 Baseline)
    this.registerLLM('mock', new MockLLMProvider());
    this.registerImage('mock', new MockImageProvider());
    this.registerTTS('mock', new MockTTSProvider());
    this.registerVideo('mock', new MockVideoProvider());

    // 2. Register Live AI Providers (Phase 2 Real AI)
    this.registerLLM('live', new LiveLLMProvider());
    this.registerLLM('wikipedia', new LiveLLMProvider());
    this.registerImage('live', new PollinationsImageProvider());
    this.registerImage('pollinations', new PollinationsImageProvider());
    this.registerTTS('live', new EdgeTTSProvider());
    this.registerTTS('edge', new EdgeTTSProvider());

    // 3. Evaluate Environment Variables for Default Routing
    const mode = (process.env.AI_PROVIDER_MODE || 'mock').toLowerCase();
    if (mode === 'live') {
      this.setMode('live');
    }

    if (process.env.LLM_PROVIDER) this.defaultLLM = process.env.LLM_PROVIDER;
    if (process.env.IMAGE_PROVIDER) this.defaultImage = process.env.IMAGE_PROVIDER;
    if (process.env.TTS_PROVIDER) this.defaultTTS = process.env.TTS_PROVIDER;
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  public setMode(mode: 'mock' | 'live') {
    if (mode === 'live') {
      this.defaultLLM = 'live';
      this.defaultImage = 'live';
      this.defaultTTS = 'live';
    } else {
      this.defaultLLM = 'mock';
      this.defaultImage = 'mock';
      this.defaultTTS = 'mock';
    }
  }

  public getMode(): 'mock' | 'live' {
    return this.defaultLLM === 'mock' ? 'mock' : 'live';
  }

  public registerLLM(key: string, provider: ILLMProvider) {
    this.llmProviders.set(key, provider);
  }

  public registerImage(key: string, provider: IImageProvider) {
    this.imageProviders.set(key, provider);
  }

  public registerTTS(key: string, provider: ITTSProvider) {
    this.ttsProviders.set(key, provider);
  }

  public registerVideo(key: string, provider: IVideoProvider) {
    this.videoProviders.set(key, provider);
  }

  public getLLM(key?: string): ILLMProvider {
    const k = key || this.defaultLLM;
    const provider = this.llmProviders.get(k) || this.llmProviders.get('mock');
    if (!provider) throw new Error(`LLM Provider '${k}' not registered.`);
    return provider;
  }

  public getImage(key?: string): IImageProvider {
    const k = key || this.defaultImage;
    const provider = this.imageProviders.get(k) || this.imageProviders.get('mock');
    if (!provider) throw new Error(`Image Provider '${k}' not registered.`);
    return provider;
  }

  public getTTS(key?: string): ITTSProvider {
    const k = key || this.defaultTTS;
    const provider = this.ttsProviders.get(k) || this.ttsProviders.get('mock');
    if (!provider) throw new Error(`TTS Provider '${k}' not registered.`);
    return provider;
  }

  public getVideo(key?: string): IVideoProvider {
    const k = key || this.defaultVideo;
    const provider = this.videoProviders.get(k) || this.videoProviders.get('mock');
    if (!provider) throw new Error(`Video Provider '${k}' not registered.`);
    return provider;
  }
}
