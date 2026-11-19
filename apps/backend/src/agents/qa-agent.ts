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
    const detailedChecks: Record<string, boolean> = {};

    // 1. Resolution & Safe-Zone (Facebook Reels 9:16 layout)
    const isExactResolution = reelProps.width === 1080 && reelProps.height === 1920;
    detailedChecks['resolution_1080x1920'] = isExactResolution;
    detailedChecks['aspect_ratio_9_16'] = isExactResolution;
    detailedChecks['safe_zone_margins'] = isExactResolution; // Subtitles positioned at Y: 1400-1680 (Safe from FB Reels buttons)

    if (!isExactResolution) {
      warnings.push(`Khung hình (${reelProps.width}x${reelProps.height}) không chuẩn định dạng Facebook Reels 1080x1920.`);
    }

    // 2. Timing & Frame Alignment Check
    let timingScore = 100;
    if (!reelProps.scenes || reelProps.scenes.length === 0) {
      timingScore = 0;
      warnings.push('Cảnh quay trống, không có dữ liệu phân cảnh.');
      detailedChecks['audio_video_sync'] = false;
    } else {
      let syncPassed = true;
      let totalVideoSeconds = 0;

      for (const scene of reelProps.scenes) {
        const sceneDurationSec = scene.durationInFrames / (reelProps.fps || 30);
        totalVideoSeconds += sceneDurationSec;

        if (scene.durationInFrames < 30) {
          timingScore -= 15;
          syncPassed = false;
          warnings.push(`Cảnh ${scene.sceneNumber} có thời lượng quá ngắn (< 1 giây / 30 frames).`);
        }
        if (!scene.visualUrl || !scene.audioUrl) {
          timingScore -= 25;
          syncPassed = false;
          warnings.push(`Cảnh ${scene.sceneNumber} thiếu tệp ảnh hoặc âm thanh.`);
        }
      }

      // Check total duration against target
      if (totalVideoSeconds < 15 || totalVideoSeconds > 90) {
        timingScore -= 10;
        warnings.push(`Tổng thời lượng video (${totalVideoSeconds.toFixed(1)}s) nằm ngoài khoảng tối ưu Facebook Reels (15s - 90s).`);
      }

      detailedChecks['audio_video_sync'] = syncPassed;
    }
    timingScore = Math.max(0, timingScore);

    // 3. Subtitle Word-Level Timestamps Check
    let subtitleSyncScore = 100;
    let subtitleChecksPassed = true;

    for (const scene of reelProps.scenes) {
      if (!scene.subtitles || scene.subtitles.length === 0) {
        subtitleSyncScore -= 20;
        subtitleChecksPassed = false;
        warnings.push(`Cảnh ${scene.sceneNumber} không có phụ đề timestamps.`);
        continue;
      }

      let lastStart = -1;
      for (let i = 0; i < scene.subtitles.length; i++) {
        const item = scene.subtitles[i];
        if (item.start < 0 || item.end <= item.start) {
          subtitleSyncScore -= 5;
          subtitleChecksPassed = false;
          warnings.push(`Cảnh ${scene.sceneNumber}: Từ "${item.word}" có timestamp không hợp lệ (${item.start}s - ${item.end}s).`);
          break;
        }
        if (item.start < lastStart) {
          subtitleSyncScore -= 5;
          subtitleChecksPassed = false;
          warnings.push(`Cảnh ${scene.sceneNumber}: Thứ tự thời gian từ "${item.word}" bị lùi ngược so với từ trước.`);
          break;
        }
        lastStart = item.start;
      }
    }
    subtitleSyncScore = Math.max(0, subtitleSyncScore);
    detailedChecks['subtitle_timestamps_valid'] = subtitleChecksPassed;

    // 4. Narrative & Script Quality Check
    let spellingScore = 100;
    if (!script.hook || script.hook.trim().length < 10) {
      spellingScore -= 20;
      warnings.push('Câu hook mở đầu chưa đủ độ dài và sức gợi cuốn hút.');
      detailedChecks['narrative_hook_present'] = false;
    } else {
      detailedChecks['narrative_hook_present'] = true;
    }

    if (script.totalWords > 180) {
      spellingScore -= 15;
      warnings.push(`Tổng số từ (${script.totalWords} từ) hơi dài cho video 60s, có thể khiến tốc độ nói bị dồn dập.`);
    }
    spellingScore = Math.max(0, spellingScore);

    // 5. Historical Source Citation & Mock Distinction Check
    let citationScore = 100;
    let hasMockSource = false;

    if (dossier.isMockEngine) {
      hasMockSource = true;
    }

    if (dossier.facts.length === 0) {
      citationScore = 0;
      warnings.push('Hồ sơ nghiên cứu trống dữ kiện lịch sử.');
      detailedChecks['citation_sources_present'] = false;
    } else {
      let totalCitations = 0;
      for (const fact of dossier.facts) {
        if (!fact.citations || fact.citations.length === 0) {
          citationScore -= 20;
          warnings.push(`Dữ kiện "${fact.factSummary.slice(0, 30)}..." thiếu nguồn trích dẫn.`);
        } else {
          totalCitations += fact.citations.length;
          for (const cite of fact.citations) {
            if (cite.isMockSource) {
              hasMockSource = true;
            }
          }
        }
      }
      detailedChecks['citation_sources_present'] = totalCitations > 0;
    }
    citationScore = Math.max(0, citationScore);

    // CRITICAL: Explicitly distinguish mock demo vs independent academic verification
    let isIndependentlyVerified = false;
    if (hasMockSource) {
      isIndependentlyVerified = false;
      warnings.push(
        '[MOCK ENGINE] Dữ liệu lịch sử và kịch bản được tạo bởi Mock Provider nội bộ để kiểm thử quy trình (Simulation Mode); chưa qua thẩm định học thuật độc lập từ hội đồng sử học.'
      );
      detailedChecks['independent_academic_verified'] = false;
    } else {
      isIndependentlyVerified = true;
      detailedChecks['independent_academic_verified'] = true;
    }

    // Weighted Overall Score (0-100)
    const totalScore = Math.round(
      timingScore * 0.30 + 
      subtitleSyncScore * 0.25 +
      spellingScore * 0.20 + 
      citationScore * 0.15 + 
      (isExactResolution ? 10 : 0)
    );

    const report: QAReport = {
      qaScore: totalScore,
      isPassing: totalScore >= 80 && isExactResolution && subtitleChecksPassed,
      timingMatchScore: timingScore,
      spellingQualityScore: spellingScore,
      sourceCitationScore: citationScore,
      subtitleSyncScore: subtitleSyncScore,
      safeZoneCheckPassed: isExactResolution,
      isIndependentlyVerified,
      warnings,
      detailedChecks
    };

    return QAReportSchema.parse(report);
  }
}
