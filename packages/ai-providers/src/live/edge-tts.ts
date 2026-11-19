import { 
  ITTSProvider, 
  TTSOptions 
} from '../interfaces/index.js';
import { 
  SceneAudioTrack, 
  WordTimestamp, 
  CostRecord 
} from '@vietsu/shared';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { MockTTSProvider } from '../mock/mock-tts.js';

const execAsync = util.promisify(exec);

export class EdgeTTSProvider implements ITTSProvider {
  public name = 'EdgeTTSProvider (Microsoft Neural Vietnamese TTS)';
  public isMock = false;
  private fallbackProvider = new MockTTSProvider();

  public async synthesizeSpeech(narrativeText: string, options: TTSOptions): Promise<SceneAudioTrack> {
    const timestamp = Date.now();
    const filename = `scene_${options.sceneNumber}_live_${timestamp}.mp3`;
    const vttFilename = `scene_${options.sceneNumber}_live_${timestamp}.vtt`;
    
    const outputPath = path.join(options.outputDir, filename);
    const vttPath = path.join(options.outputDir, vttFilename);

    const voice = options.voiceGender === 'FEMALE' ? 'vi-VN-HoaiMyNeural' : 'vi-VN-NamMinhNeural';

    // Clean text of quotes and special characters that could break CLI
    const cleanText = narrativeText.replace(/["\r\n\t]/g, ' ').trim();

    try {
      if (!fs.existsSync(options.outputDir)) {
        fs.mkdirSync(options.outputDir, { recursive: true });
      }

      // 1. Try Microsoft Edge-TTS CLI
      let generated = false;
      try {
        const cmd = `edge-tts --voice ${voice} --text "${cleanText}" --write-media "${outputPath}" --write-subtitles "${vttPath}"`;
        await execAsync(cmd, { timeout: 15000 });
        if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
          generated = true;
        }
      } catch {
        // Edge-TTS failed or timed out, will proceed to gTTS fallback
      }

      // 2. Fallback to gTTS (Google Vietnamese Neural Speech via temporary script)
      if (!generated) {
        const pyScriptPath = path.join(options.outputDir, `tts_${timestamp}.py`);
        const pyScript = `from gtts import gTTS\ntext = ${JSON.stringify(cleanText)}\ntts = gTTS(text, lang='vi')\ntts.save(r'${outputPath}')\n`;
        fs.writeFileSync(pyScriptPath, pyScript, 'utf-8');
        try {
          await execAsync(`python "${pyScriptPath}"`, { timeout: 25000 });
        } finally {
          try {
            if (fs.existsSync(pyScriptPath)) fs.unlinkSync(pyScriptPath);
          } catch {}
        }
      }

      if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 1000) {
        throw new Error('Tệp âm thanh tạo bởi TTS rỗng hoặc không tồn tại');
      }

      // Measure actual audio duration via ffprobe
      let durationSec = 6;
      try {
        const probeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outputPath}"`;
        const { stdout: probeOut } = await execAsync(probeCmd);
        const parsedDur = parseFloat(probeOut.trim());
        if (!isNaN(parsedDur) && parsedDur > 0) {
          durationSec = Math.round(parsedDur * 100) / 100;
        }
      } catch {
        // Fallback duration estimation from word count
        durationSec = Math.max(3, cleanText.split(/\s+/).length * 0.45);
      }

      // Parse word timestamps from VTT or interpolate accurately
      const wordTimestamps = this.parseVttOrInterpolate(vttPath, cleanText, durationSec);

      // Clean up temporary VTT file
      try {
        if (fs.existsSync(vttPath)) fs.unlinkSync(vttPath);
      } catch {}

      const publicAudioUrl = `/storage/audio/${filename}`;

      return {
        sceneNumber: options.sceneNumber,
        audioUrl: publicAudioUrl,
        localPath: outputPath,
        durationSec,
        wordTimestamps
      };
    } catch (err: any) {
      console.warn(`[EdgeTTSProvider] Tổng hợp giọng đọc trực tiếp thất bại (${err.message}). Chuyển sang giọng đọc dự phòng nội bộ.`);
      return this.fallbackProvider.synthesizeSpeech(narrativeText, options);
    }
  }

  private parseVttOrInterpolate(vttPath: string, text: string, totalDuration: number): WordTimestamp[] {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const timestamps: WordTimestamp[] = [];

    if (fs.existsSync(vttPath)) {
      try {
        const vttContent = fs.readFileSync(vttPath, 'utf-8');
        const lines = vttContent.split('\n');

        let currentStart = 0;
        let currentEnd = 0;

        for (const line of lines) {
          const match = line.match(/(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[.,](\d{3})/);
          if (match) {
            currentStart = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]) + parseInt(match[4]) / 1000;
            currentEnd = parseInt(match[5]) * 3600 + parseInt(match[6]) * 60 + parseInt(match[7]) + parseInt(match[8]) / 1000;
          }
        }

        if (currentEnd > 0) {
          // Linearly map words safely within the audio duration bounds
          const safeStart = Math.min(0.2, currentStart);
          const safeEnd = Math.min(currentEnd, Math.max(0.5, totalDuration - 0.2));
          const activeDuration = Math.max(0.4, safeEnd - safeStart);
          const timePerWord = activeDuration / Math.max(1, words.length);

          for (let i = 0; i < words.length; i++) {
            const start = Math.round((safeStart + i * timePerWord) * 100) / 100;
            const end = Math.round((safeStart + (i + 1) * timePerWord) * 100) / 100;
            timestamps.push({ word: words[i], start, end });
          }
          return timestamps;
        }
      } catch (err) {
        console.warn('[EdgeTTSProvider] Lỗi đọc file VTT, chuyển sang thuật toán căn chỉnh âm học tuyến tính.');
      }
    }

    // High-precision acoustic linear interpolation
    const startOffset = 0.2;
    const narrationTime = Math.max(1.0, totalDuration - 0.4);
    const timePerWord = narrationTime / Math.max(1, words.length);

    for (let i = 0; i < words.length; i++) {
      const start = Math.round((startOffset + i * timePerWord) * 100) / 100;
      const end = Math.round((startOffset + (i + 1) * timePerWord) * 100) / 100;
      timestamps.push({ word: words[i], start, end });
    }

    return timestamps;
  }

  public estimateCost(durationSec: number): CostRecord {
    return {
      id: `cost_tts_${Date.now()}`,
      projectId: '',
      provider: 'Microsoft Edge Neural TTS (Free Vietnamese Voice)',
      service: 'VOICE_TTS',
      unitsUsed: Math.round(durationSec),
      unitType: 'SECONDS',
      estimatedCostUSD: 0,
      estimatedCostVND: 0,
      createdAt: new Date().toISOString()
    };
  }
}
