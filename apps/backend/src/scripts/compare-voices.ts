import { EdgeTTSProvider } from '@vietsu/ai-providers';
import path from 'path';
import fs from 'fs';

const storageBase = path.resolve(process.cwd(), 'storage');

async function main() {
  console.log('=== SO SÁNH CÁC CẤU HÌNH GIỌNG ĐỌC TIẾNG VIỆT (VOICE COMPARISON BENCHMARK) ===\n');

  const testParagraph = 'Trận Bạch Đằng năm 938 là chiến thắng vang dội của Ngô Quyền, đập tan mưu đồ xâm lược của quân Nam Hán. Chiến thắng này chấm dứt hơn một nghìn năm Bắc thuộc, mở ra kỷ nguyên độc lập tự chủ lâu dài cho dân tộc Việt Nam.';
  const wordCount = testParagraph.split(/\s+/).length;
  console.log(`Đoạn văn thử nghiệm (${wordCount} từ): "${testParagraph}"\n`);

  const outputDir = path.resolve(__dirname, '../../../../storage/audio/comparison');
  fs.mkdirSync(outputDir, { recursive: true });

  const configs = [
    {
      id: 'Config A (Baseline Male)',
      voiceName: 'vi-VN-NamMinhNeural',
      voiceGender: 'MALE' as const,
      speechRate: '+0%',
      desc: 'Giọng Nam mặc định (Tốc độ gốc, lê thê, 115-125 WPM)'
    },
    {
      id: 'Config B (Enhanced Historical Male)',
      voiceName: 'vi-VN-NamMinhNeural',
      voiceGender: 'MALE' as const,
      speechRate: '+18%',
      desc: 'Giọng Nam hào hùng cải thiện (Tốc độ +18%, ngắt nghỉ câu tự nhiên, 175-185 WPM)'
    },
    {
      id: 'Config C (Enhanced Historical Female)',
      voiceName: 'vi-VN-HoaiMyNeural',
      voiceGender: 'FEMALE' as const,
      speechRate: '+18%',
      desc: 'Giọng Nữ truyền cảm uyển chuyển (Tốc độ +18%, nhịp kể tự nhiên, 175-185 WPM)'
    }
  ];

  const provider = new EdgeTTSProvider();
  const results = [];

  for (let i = 0; i < configs.length; i++) {
    const cfg = configs[i];
    console.log(`[Đang chạy] ${cfg.id}: ${cfg.desc}...`);
    const startTime = Date.now();

    const track = await provider.synthesizeSpeech(testParagraph, {
      sceneNumber: i + 1,
      outputDir,
      voiceName: cfg.voiceName,
      voiceGender: cfg.voiceGender,
      speechRate: cfg.speechRate
    });

    const elapsedMs = Date.now() - startTime;
    const wordsPerSec = Math.round((wordCount / track.durationSec) * 100) / 100;
    const wpm = Math.round((wordCount / track.durationSec) * 60);

    const result = {
      configId: cfg.id,
      voice: cfg.voiceName,
      rate: cfg.speechRate,
      durationSec: track.durationSec,
      wordsPerSec,
      wpm,
      providerUsed: track.providerUsed,
      alignmentAccuracy: track.alignmentAccuracy,
      timestampsCount: track.wordTimestamps.length,
      fileSize: fs.existsSync(track.localPath) ? fs.statSync(track.localPath).size : 0,
      filePath: track.localPath,
      elapsedMs
    };
    results.push(result);
    console.log(`  ✓ Thời lượng: ${track.durationSec}s | Tốc độ: ${wpm} WPM (${wordsPerSec} từ/s) | Timestamps: ${track.wordTimestamps.length} từ | File: ${result.fileSize} bytes\n`);
  }

  console.log('=== BẢNG TỔNG HỢP SO SÁNH GIỌNG ĐỌC ===');
  console.table(results.map(r => ({
    'Cấu hình': r.configId,
    'Voice': r.voice,
    'Tốc độ': r.rate,
    'Thời lượng (s)': r.durationSec,
    'WPM (từ/phút)': r.wpm,
    'Độ chính xác Sub': r.alignmentAccuracy,
    'Engine thực': r.providerUsed
  })));

  const comparisonReportPath = path.join(outputDir, 'voice_benchmark_report.json');
  fs.writeFileSync(comparisonReportPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\nĐã lưu báo cáo benchmark tại: ${comparisonReportPath}`);
}

main().catch(err => {
  console.error('Lỗi khi chạy benchmark so sánh giọng đọc:', err);
  process.exit(1);
});
