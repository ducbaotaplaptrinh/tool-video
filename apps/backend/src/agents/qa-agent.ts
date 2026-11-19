import { 
  QAReport, 
  VietSuReelProps, 
  ScriptDocument, 
  ResearchDossier, 
  QAReportSchema 
} from '@vietsu/shared';

export class QAAgent {
  execute(
    reelProps: VietSuReelProps,
    script: ScriptDocument,
    dossier: ResearchDossier
  ): QAReport {
    const warnings: string[] = [];

    // 1. Timing Match Check
    let timingScore = 100;
    if (reelProps.scenes.length === 0) {
      timingScore = 0;
      warnings.push('Cảnh quay trống, không có dữ liệu phân cảnh.');
    } else {
      for (const scene of reelProps.scenes) {
        if (scene.durationInFrames < 30) {
          timingScore -= 15;
          warnings.push(`Cảnh ${scene.sceneNumber} có thời lượng quá ngắn (< 1 giây).`);
        }
        if (!scene.visualUrl || !scene.audioUrl) {
          timingScore -= 25;
          warnings.push(`Cảnh ${scene.sceneNumber} thiếu tệp ảnh hoặc âm thanh.`);
        }
      }
    }
    timingScore = Math.max(0, timingScore);

    // 2. Spelling & Narrative Quality Check
    let spellingScore = 100;
    if (!script.hook || script.hook.length < 10) {
      spellingScore -= 20;
      warnings.push('Câu hook mở đầu chưa đủ độ dài cuốn hút.');
    }
    if (script.totalWords > 180) {
      spellingScore -= 15;
      warnings.push('Tổng số từ kịch bản hơi dài cho video 60s, có thể khiến tốc độ nói bị dồn dập.');
    }

    // 3. Historical Source & Citation Check
    let citationScore = 100;
    if (dossier.facts.length === 0) {
      citationScore = 0;
      warnings.push('Thiếu dữ kiện lịch sử thẩm định.');
    } else {
      let totalCitations = 0;
      for (const fact of dossier.facts) {
        totalCitations += fact.citations.length;
      }
      if (totalCitations === 0) {
        citationScore = 30;
        warnings.push('Các dữ kiện lịch sử chưa có nguồn trích dẫn đối chiếu.');
      }
    }

    // 4. Safe-zone check (Facebook Reels 9:16 layout)
    const safeZonePassed = reelProps.width === 1080 && reelProps.height === 1920;
    if (!safeZonePassed) {
      warnings.push('Kích thước khung hình không đúng chuẩn 1080x1920 cho Facebook Reels.');
    }

    // Weighted Overall Score
    const totalScore = Math.round(
      timingScore * 0.35 + 
      spellingScore * 0.25 + 
      citationScore * 0.25 + 
      (safeZonePassed ? 15 : 0)
    );

    const report: QAReport = {
      qaScore: totalScore,
      isPassing: totalScore >= 80,
      timingMatchScore: timingScore,
      spellingQualityScore: spellingScore,
      sourceCitationScore: citationScore,
      safeZoneCheckPassed: safeZonePassed,
      warnings
    };

    return QAReportSchema.parse(report);
  }
}
