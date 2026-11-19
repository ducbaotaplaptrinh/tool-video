import { ILLMProvider, IImageProvider, ITTSProvider, IVideoProvider } from './interfaces/index.js';
import { MockLLMProvider } from './mock/mock-llm.js';
import { MockImageProvider } from './mock/mock-image.js';
import { MockTTSProvider } from './mock/mock-tts.js';
import { MockVideoProvider } from './mock/mock-video.js';

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
    // Register Default Mock Providers
    this.registerLLM('mock', new MockLLMProvider());
    this.registerImage('mock', new MockImageProvider());
    this.registerTTS('mock', new MockTTSProvider());
    this.registerVideo('mock', new MockVideoProvider());
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
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
    const provider = this.llmProviders.get(k);
    if (!provider) throw new Error(`LLM Provider '${k}' not registered.`);
    return provider;
  }

  public getImage(key?: string): IImageProvider {
    const k = key || this.defaultImage;
    const provider = this.imageProviders.get(k);
    if (!provider) throw new Error(`Image Provider '${k}' not registered.`);
    return provider;
  }

  public getTTS(key?: string): ITTSProvider {
    const k = key || this.defaultTTS;
    const provider = this.ttsProviders.get(k);
    if (!provider) throw new Error(`TTS Provider '${k}' not registered.`);
    return provider;
  }

  public getVideo(key?: string): IVideoProvider {
    const k = key || this.defaultVideo;
    const provider = this.videoProviders.get(k);
    if (!provider) throw new Error(`Video Provider '${k}' not registered.`);
    return provider;
  }
}
