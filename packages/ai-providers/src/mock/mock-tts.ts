import fs from 'fs';
import path from 'path';
import { SceneAudioTrack, WordTimestamp, CostRecord } from '@vietsu/shared';
import { ITTSProvider, TTSOptions } from '../interfaces/index.js';

export class MockTTSProvider implements ITTSProvider {
  name = 'MockTTSProvider (Vietnamese Speech Synthesizer)';
  isMock = true;

  async synthesizeSpeech(narrativeText: string, options: TTSOptions): Promise<SceneAudioTrack> {
    const fileName = `audio_scene_${options.sceneNumber}_${Date.now()}.wav`;
    const filePath = path.join(options.outputDir, fileName);

    // Split text into words while keeping punctuation
    const rawWords = narrativeText.trim().split(/\s+/).filter(w => w.length > 0);
    
    // Average speaking rate: ~2.4 words per second for dramatic Vietnamese narration
    const wordDurationSec = 0.42;
    const initialDelaySec = 0.25;

    const wordTimestamps: WordTimestamp[] = rawWords.map((word, index) => {
      const start = parseFloat((initialDelaySec + index * wordDurationSec).toFixed(2));
      const end = parseFloat((start + wordDurationSec * 0.9).toFixed(2));
      return { word, start, end };
    });

    const totalDurationSec = parseFloat(
      (initialDelaySec + rawWords.length * wordDurationSec + 0.6).toFixed(2)
    );

    // Generate valid 16-bit mono 44.1kHz PCM WAV file
    const sampleRate = 44100;
    const numChannels = 1;
    const bitsPerSample = 16;
    const numSamples = Math.floor(sampleRate * totalDurationSec);
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = numSamples * blockAlign;
    const buffer = Buffer.alloc(44 + dataSize);

    // 1. RIFF Chunk Descriptor
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);

    // 2. fmt Sub-chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
    buffer.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);

    // 3. data Sub-chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    // Write subtle warm cinematic tone with gentle envelope
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Gentle war drum resonance tone (~80Hz fundamental with harmonic)
      const envelope = Math.min(1.0, Math.sin((t / totalDurationSec) * Math.PI));
      const freq = 110; // A2 note
      const sample = Math.sin(2 * Math.PI * freq * t) * 0.25 * envelope;
      const intSample = Math.floor(sample * 32767);
      buffer.writeInt16LE(Math.max(-32768, Math.min(32767, intSample)), 44 + i * 2);
    }

    fs.mkdirSync(options.outputDir, { recursive: true });
    fs.writeFileSync(filePath, buffer);

    return {
      sceneNumber: options.sceneNumber,
      audioUrl: `/storage/audio/${fileName}`,
      localPath: filePath,
      durationSec: totalDurationSec,
      wordTimestamps
    };
  }

  estimateCost(durationSec: number): CostRecord {
    const costUsd = durationSec * 0.002;
    return {
      id: `cost-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      projectId: '',
      provider: this.name,
      service: 'VOICE_TTS',
      unitsUsed: durationSec,
      unitType: 'SECONDS',
      estimatedCostUSD: costUsd,
      estimatedCostVND: Math.round(costUsd * 25400),
      createdAt: new Date().toISOString()
    };
  }
}
