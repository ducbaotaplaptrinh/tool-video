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

const execAsync = util.promisify(exec);

export class EdgeTTSProvider implements ITTSProvider {
  public name = 'EdgeTTSProvider (Microsoft Neural Vietnamese TTS)';
  public isMock = false;

  public async synthesizeSpeech(narrativeText: string, options: TTSOptions): Promise<SceneAudioTrack> {
    const timestamp = Date.now();
    const filename = `scene_${options.sceneNumber}_live_${timestamp}.mp3`;
    const tempRawName = `scene_${options.sceneNumber}_raw_${timestamp}.mp3`;
    
    const outputPath = path.join(options.outputDir, filename);
    const tempRawPath = path.join(options.outputDir, tempRawName);

    // 1. Voice Selection (Male / Female)
    const voice = options.voiceName || (
      options.voiceGender === 'FEMALE' ? 'vi-VN-HoaiMyNeural' : 'vi-VN-NamMinhNeural'
    );

    // 2. Speech Rate calculation (Default +18% for heroic, dynamic historical narration)
    let speedRatio = 1.18;
    let rateLabel = '+18%';
    if (options.speechRate !== undefined) {
      if (typeof options.speechRate === 'number') {
        speedRatio = Math.max(0.8, Math.min(1.5, options.speechRate));
        const pct = Math.round((speedRatio - 1.0) * 100);
        rateLabel = pct >= 0 ? `+${pct}%` : `${pct}%`;
      } else if (typeof options.speechRate === 'string') {
        const match = options.speechRate.match(/([+-]?\d+)/);
        if (match) {
          const pct = parseInt(match[1]);
          speedRatio = Math.max(0.8, Math.min(1.5, 1.0 + pct / 100));
          rateLabel = options.speechRate;
        }
      }
    }

    // 3. Clean text and enhance historical narrative punctuation pauses
    const cleanText = narrativeText
      .replace(/["\r\n\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!fs.existsSync(options.outputDir)) {
      fs.mkdirSync(options.outputDir, { recursive: true });
    }

    let generated = false;
    let providerUsed = `Microsoft Neural Voice (${voice})`;
    let alignmentAccuracy: 'sentence_boundary_acoustic' | 'sentence_chunk' = 'sentence_boundary_acoustic';

    // 4. Primary Synthesis: Microsoft Edge-TTS
    try {
      // Escape for Windows PowerShell / cmd
      const escapedText = cleanText.replace(/"/g, '""');
      const edgeCmd = `edge-tts --voice ${voice} --text "${escapedText}" --write-media "${tempRawPath}"`;
      await execAsync(edgeCmd, { timeout: 20000 });

      if (fs.existsSync(tempRawPath) && fs.statSync(tempRawPath).size > 1000) {
        // Apply natural cadence acceleration via FFmpeg atempo (preserves pitch & tone)
        const tempoCmd = `ffmpeg -y -i "${tempRawPath}" -filter:a "atempo=${speedRatio.toFixed(2)}" -vn "${outputPath}"`;
        await execAsync(tempoCmd, { timeout: 15000 });
        if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
          generated = true;
        }
      }
    } catch (err: any) {
      console.warn(`[EdgeTTSProvider] Edge-TTS direct synthesis warning: ${err.message}. Đang thử fallback qua Google gTTS Neural...`);
    } finally {
      try {
        if (fs.existsSync(tempRawPath)) fs.unlinkSync(tempRawPath);
      } catch {}
    }

    // 5. Secondary Fallback: Google Neural gTTS (Never silently drop to Mock in Live Mode)
    if (!generated) {
      const pyScriptPath = path.join(options.outputDir, `tts_${timestamp}.py`);
      const pyScript = `from gtts import gTTS\ntext = ${JSON.stringify(cleanText)}\ntts = gTTS(text, lang='vi')\ntts.save(r'${tempRawPath}')\n`;
      fs.writeFileSync(pyScriptPath, pyScript, 'utf-8');

      try {
        await execAsync(`python "${pyScriptPath}"`, { timeout: 25000 });
        if (fs.existsSync(tempRawPath) && fs.statSync(tempRawPath).size > 1000) {
          const tempoCmd = `ffmpeg -y -i "${tempRawPath}" -filter:a "atempo=${speedRatio.toFixed(2)}" -vn "${outputPath}"`;
          await execAsync(tempoCmd, { timeout: 15000 });
          if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
            generated = true;
            providerUsed = 'Google gTTS Neural Voice (Fallback)';
            alignmentAccuracy = 'sentence_chunk';
          }
        }
      } catch (fallbackErr: any) {
        console.error(`[EdgeTTSProvider] Fallback gTTS failed: ${fallbackErr.message}`);
      } finally {
        try {
          if (fs.existsSync(pyScriptPath)) fs.unlinkSync(pyScriptPath);
          if (fs.existsSync(tempRawPath)) fs.unlinkSync(tempRawPath);
        } catch {}
      }
    }

    // If both failed, throw explicit error (NO silent mock fallback)
    if (!generated || !fs.existsSync(outputPath) || fs.statSync(outputPath).size < 1000) {
      throw new Error(`[EdgeTTSProvider] Không thể tổng hợp giọng đọc: Cả Edge-TTS và gTTS đều không khả dụng cho phân cảnh ${options.sceneNumber}.`);
    }

    // 6. Measure exact audio duration via ffprobe
    let durationSec = 6.0;
    try {
      const probeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outputPath}"`;
      const { stdout: probeOut } = await execAsync(probeCmd);
      const parsedDur = parseFloat(probeOut.trim());
      if (!isNaN(parsedDur) && parsedDur > 0) {
        durationSec = Math.round(parsedDur * 100) / 100;
      }
    } catch {
      durationSec = Math.max(3.0, Math.round((cleanText.split(/\s+/).length / (3.2 * speedRatio)) * 100) / 100);
    }

    // 7. Align Word Timestamps with Acoustic Sentence Boundaries
    const wordTimestamps = await this.alignSentenceAcousticBoundaries(outputPath, cleanText, durationSec);

    const publicAudioUrl = `/storage/audio/${filename}`;

    return {
      sceneNumber: options.sceneNumber,
      audioUrl: publicAudioUrl,
      localPath: outputPath,
      durationSec,
      wordTimestamps,
      providerUsed,
      voiceUsed: voice,
      speechRate: rateLabel,
      alignmentAccuracy
    };
  }

  /**
   * Căn chỉnh mốc thời gian phụ đề dựa trên câu nói và khoảng lặng thực tế qua FFmpeg silencedetect.
   * Ngăn chặn hiện tượng trôi dạt phụ đề (subtitle drift) trong các khoảng nghỉ giữa câu.
   */
  private async alignSentenceAcousticBoundaries(
    audioPath: string, 
    text: string, 
    totalDuration: number
  ): Promise<WordTimestamp[]> {
    // Tách văn bản thành các câu hoặc mệnh đề có dấu câu
    const sentences = text
      .split(/(?<=[.!?][)"']?)\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const allWords = text.split(/\s+/).filter(w => w.length > 0);
    if (allWords.length === 0) return [];

    // Nếu chỉ có 1 câu duy nhất, phân bố đều trong khung âm thanh an toàn
    if (sentences.length <= 1) {
      const startOffset = 0.15;
      const safeEnd = Math.max(startOffset + 0.3, totalDuration - 0.15);
      const duration = safeEnd - startOffset;
      const timePerWord = duration / allWords.length;

      return allWords.map((word, i) => ({
        word,
        start: Math.round((startOffset + i * timePerWord) * 100) / 100,
        end: Math.round((startOffset + (i + 1) * timePerWord) * 100) / 100
      }));
    }

    // Phát hiện khoảng lặng (silence) giữa các câu bằng FFmpeg
    let silences: Array<{ start: number; end: number }> = [];
    try {
      const silenceCmd = `ffmpeg -i "${audioPath}" -af "silencedetect=noise=-30dB:d=0.2" -f null -`;
      const { stderr } = await execAsync(silenceCmd);
      
      const startMatches = Array.from(stderr.matchAll(/silence_start:\s*([\d.]+)/g));
      const endMatches = Array.from(stderr.matchAll(/silence_end:\s*([\d.]+)/g));

      for (let i = 0; i < Math.min(startMatches.length, endMatches.length); i++) {
        const s = parseFloat(startMatches[i][1]);
        const e = parseFloat(endMatches[i][1]);
        if (!isNaN(s) && !isNaN(e) && s > 0.3 && e < totalDuration - 0.2) {
          silences.push({ start: s, end: e });
        }
      }
    } catch {
      silences = [];
    }

    // Tính toán cửa sổ phát âm (speech windows) cho từng câu
    const sentenceWindows: Array<{ start: number; end: number; words: string[] }> = [];
    const totalChars = sentences.reduce((sum, s) => sum + s.length, 0);

    if (silences.length >= sentences.length - 1 && silences.length > 0) {
      // Dùng các mốc silence thực tế làm ranh giới giữa các câu
      let lastEnd = 0.15;
      for (let i = 0; i < sentences.length; i++) {
        const words = sentences[i].split(/\s+/).filter(w => w.length > 0);
        const isLast = (i === sentences.length - 1);
        const silence = isLast ? undefined : silences[i];
        const segEnd = isLast
          ? Math.max(lastEnd + 0.5, totalDuration - 0.15)
          : (silence ? Math.min(silence.start, totalDuration - 0.15) : Math.max(lastEnd + 0.5, totalDuration - 0.15));

        sentenceWindows.push({
          start: Math.round(lastEnd * 100) / 100,
          end: Math.round(segEnd * 100) / 100,
          words
        });
        if (silence) {
          lastEnd = Math.max(segEnd + 0.05, silence.end);
        }
      }
    } else {
      // Phân bổ thời lượng theo tỉ lệ độ dài ký tự của từng câu, kèm khoảng nghỉ 0.35s giữa câu
      const pauseDuration = 0.35;
      const totalPause = pauseDuration * (sentences.length - 1);
      const activeSpokenTime = Math.max(1.0, totalDuration - 0.3 - totalPause);

      let currentStart = 0.15;
      for (let i = 0; i < sentences.length; i++) {
        const words = sentences[i].split(/\s+/).filter(w => w.length > 0);
        const sentenceRatio = sentences[i].length / totalChars;
        const sentenceDuration = activeSpokenTime * sentenceRatio;
        const isLast = (i === sentences.length - 1);
        const sentenceEnd = isLast
          ? Math.max(currentStart + 0.5, totalDuration - 0.15)
          : Math.min(currentStart + sentenceDuration, totalDuration - 0.15);

        sentenceWindows.push({
          start: Math.round(currentStart * 100) / 100,
          end: Math.round(sentenceEnd * 100) / 100,
          words
        });

        currentStart = sentenceEnd + pauseDuration;
      }
    }

    // Phân bổ mốc thời gian từng từ bên trong cửa sổ của từng câu
    const wordTimestamps: WordTimestamp[] = [];
    for (const win of sentenceWindows) {
      if (win.words.length === 0) continue;
      const winDuration = Math.max(0.3, win.end - win.start);
      const timePerWord = winDuration / win.words.length;

      for (let j = 0; j < win.words.length; j++) {
        const start = Math.round((win.start + j * timePerWord) * 100) / 100;
        const end = Math.round((win.start + (j + 1) * timePerWord) * 100) / 100;
        wordTimestamps.push({
          word: win.words[j],
          start,
          end: Math.min(end, totalDuration - 0.05)
        });
      }
    }

    // Đảm bảo từ cuối cùng kết thúc gần sát thời lượng âm thanh thực tế
    if (wordTimestamps.length > 0) {
      const last = wordTimestamps[wordTimestamps.length - 1];
      last.end = Math.max(last.end, Math.round((totalDuration - 0.15) * 100) / 100);
    }

    return wordTimestamps;
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
