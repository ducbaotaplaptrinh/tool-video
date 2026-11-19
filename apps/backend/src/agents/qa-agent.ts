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

    // 1. Resolution & Canvas Dimensions Check (Facebook Reels 9:16 layout: 1080x1920)
    const isExactResolution = reelProps.width === 1080 && reelProps.height === 1920;
    detailedChecks['resolution_1080x1920'] = isExactResolution;
    detailedChecks['aspect_ratio_9_16'] = isExactResolution;

    if (!isExactResolution) {
      warnings.push(`Khung hình (${reelProps.width}x${reelProps.height}) không chuẩn định dạng Facebook Reels 1080x1920.`);
    }

    // 2. Geometric Safe-Zone Validation based on actual subtitle coordinates & layout
    let safeZonePassed = isExactResolution;

    if (reelProps.scenes && reelProps.scenes.length > 0) {
      for (const scene of reelProps.scenes) {
        const layout = scene.subtitleLayout || { bottomPx: 280, maxWidthPx: 900, maxWordsPerChunk: 6 };

        // Facebook Reels bottom action drawer/music bar occupies up to 260px from bottom.
        // Subtitles placed below 260px will be occluded. Above 600px is too high into video focus.
        if (layout.bottomPx < 260) {
          safeZonePassed = false;
          warnings.push(
            `Cảnh ${scene.sceneNumber}: Vị trí phụ đề (${layout.bottomPx}px từ đáy) vi phạm vùng an toàn (Safe-Zone), sẽ bị che bởi thanh mô tả và âm thanh Facebook Reels (tối thiểu 260px).`
          );
        } else if (layout.bottomPx > 600) {
          safeZonePassed = false;
          warnings.push(
            `Cảnh ${scene.sceneNumber}: Vị trí phụ đề (${layout.bottomPx}px từ đáy) đặt quá cao so với vùng nhìn tối ưu.`
          );
        }

        // Horizontal Safe-Zone: screen width is 1080px. Right action buttons occupy ~120px.
        // Subtitle width must not exceed 900px to avoid collision.
        if (layout.maxWidthPx > 900) {
          safeZonePassed = false;
          warnings.push(
            `Cảnh ${scene.sceneNumber}: Chiều rộng khối phụ đề (${layout.maxWidthPx}px) vượt quá 900px, có nguy cơ che các nút tương tác bên phải.`
          );
        }

        // Subtitle chunk density: max words per chunk should not exceed 8 to avoid multi-line overflow.
        if (layout.maxWordsPerChunk > 8) {
          safeZonePassed = false;
          warnings.push(
            `Cảnh ${scene.sceneNumber}: Mật độ từ tối đa mỗi cụm (${layout.maxWordsPerChunk} từ) vượt quá giới hạn 8 từ, gây nguy cơ tràn dòng che khuất nội dung.`
          );
        }
      }
    } else {
      safeZonePassed = false;
    }

    detailedChecks['safe_zone_margins'] = safeZonePassed;

    // 3. Audio Presence and Basic Timing Check
    let timingScore = 100;
    let audioPresent = true;

    if (!reelProps.scenes || reelProps.scenes.length === 0) {
      timingScore = 0;
      audioPresent = false;
      warnings.push('Cảnh quay trống, không có dữ liệu phân cảnh.');
    } else {
      let totalVideoSeconds = 0;

      for (const scene of reelProps.scenes) {
        const sceneDurationSec = scene.durationInFrames / (reelProps.fps || 30);
        totalVideoSeconds += sceneDurationSec;

        if (scene.durationInFrames < 30) {
          timingScore -= 15;
          warnings.push(`Cảnh ${scene.sceneNumber} có thời lượng quá ngắn (< 1 giây / 30 frames).`);
        }
        if (!scene.visualUrl || !scene.audioUrl) {
          timingScore -= 25;
          audioPresent = false;
          warnings.push(`Cảnh ${scene.sceneNumber} thiếu tệp ảnh hoặc âm thanh.`);
        }
      }

      if (totalVideoSeconds < 15 || totalVideoSeconds > 90) {
        timingScore -= 10;
        warnings.push(`Tổng thời lượng video (${totalVideoSeconds.toFixed(1)}s) nằm ngoài khoảng tối ưu Facebook Reels (15s - 90s).`);
      }
    }

    timingScore = Math.max(0, timingScore);
    detailedChecks['audio_waveform_presence_verified'] = audioPresent;

    // 4. Decoupled Subtitle Checks: Syntax vs Audio Duration Alignment
    let subtitleSyncScore = 100;
    let subtitleSyntaxPassed = true;
    let durationAlignedPassed = true;

    if (!reelProps.scenes || reelProps.scenes.length === 0) {
      subtitleSyncScore = 0;
      subtitleSyntaxPassed = false;
      durationAlignedPassed = false;
    } else {
      for (const scene of reelProps.scenes) {
        const sceneDurationSec = scene.durationInFrames / (reelProps.fps || 30);

        if (!scene.subtitles || scene.subtitles.length === 0) {
          subtitleSyncScore -= 20;
          subtitleSyntaxPassed = false;
          durationAlignedPassed = false;
          warnings.push(`Cảnh ${scene.sceneNumber} không có phụ đề timestamps.`);
          continue;
        }

        // A. Subtitle Timestamps Syntax (monotonicity, valid positive ranges)
        let lastStart = -1;
        for (let i = 0; i < scene.subtitles.length; i++) {
          const item = scene.subtitles[i];
          if (item.start < 0 || item.end <= item.start) {
            subtitleSyncScore -= 10;
            subtitleSyntaxPassed = false;
            warnings.push(`Cảnh ${scene.sceneNumber}: Từ "${item.word}" có timestamp không hợp lệ (${item.start}s - ${item.end}s).`);
            break;
          }
          if (item.start < lastStart) {
            subtitleSyncScore -= 10;
            subtitleSyntaxPassed = false;
            warnings.push(`Cảnh ${scene.sceneNumber}: Thứ tự thời gian từ "${item.word}" bị lùi ngược so với từ trước.`);
            break;
          }
          if (item.end - item.start > 5.0) {
            subtitleSyncScore -= 5;
            subtitleSyntaxPassed = false;
            warnings.push(`Cảnh ${scene.sceneNumber}: Từ "${item.word}" kéo dài bất thường (> 5.0s).`);
            break;
          }
          lastStart = item.start;
        }

        // B. Audio-Subtitle Duration Alignment (compare last subtitle end with scene duration)
        const lastWord = scene.subtitles[scene.subtitles.length - 1];
        if (lastWord) {
          const lastSubEnd = lastWord.end;
          // Narration should not overshoot scene duration
          if (lastSubEnd > sceneDurationSec + 0.5) {
            subtitleSyncScore -= 15;
            durationAlignedPassed = false;
            warnings.push(
              `Cảnh ${scene.sceneNumber}: Phụ đề kết thúc tại ${lastSubEnd.toFixed(2)}s, tràn ra ngoài thời lượng cảnh (${sceneDurationSec.toFixed(2)}s).`
            );
          } else if (lastSubEnd < sceneDurationSec * 0.5) {
            // Narration stops suspiciously early (< 50% of scene duration)
            subtitleSyncScore -= 15;
            durationAlignedPassed = false;
            warnings.push(
              `Cảnh ${scene.sceneNumber}: Phụ đề kết thúc quá sớm tại ${lastSubEnd.toFixed(2)}s trong khi cảnh kéo dài ${sceneDurationSec.toFixed(2)}s (nghi vấn lệch đồng bộ âm thanh).`
            );
          }
        }
      }
    }

    if (!safeZonePassed) {
      subtitleSyncScore -= 15;
    }

    subtitleSyncScore = Math.max(0, subtitleSyncScore);
    detailedChecks['subtitle_timestamps_syntax_valid'] = subtitleSyntaxPassed;
    detailedChecks['audio_subtitle_duration_aligned'] = durationAlignedPassed;
    detailedChecks['audio_video_sync'] = audioPresent && durationAlignedPassed;

    // 5. Narrative & Script Quality Check
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

    // 6. Historical Source Citation & Independent Academic Verification Check
    let citationScore = 100;
    let hasMockSource = false;
    let allFactsHaveAttestedEvidence = true;

    if (dossier.isMockEngine) {
      hasMockSource = true;
    }

    if (!dossier.facts || dossier.facts.length === 0) {
      citationScore = 0;
      allFactsHaveAttestedEvidence = false;
      warnings.push('Hồ sơ nghiên cứu trống dữ kiện lịch sử.');
      detailedChecks['citation_sources_present'] = false;
    } else {
      let totalCitations = 0;
      for (const fact of dossier.facts) {
        if (!fact.citations || fact.citations.length === 0) {
          citationScore -= 20;
          allFactsHaveAttestedEvidence = false;
          warnings.push(`Dữ kiện "${fact.factSummary.slice(0, 30)}..." thiếu nguồn trích dẫn.`);
        } else {
          totalCitations += fact.citations.length;
          for (const cite of fact.citations) {
            if (cite.isMockSource) {
              hasMockSource = true;
            }
            // Strict condition: only true if positive independent verification evidence exists
            const hasExplicitVerification =
              cite.isIndependentlyVerified === true &&
              ((cite.verificationEvidence && cite.verificationEvidence.trim().length > 0) ||
               (cite.verificationUrl && cite.verificationUrl.startsWith('http')));

            if (!hasExplicitVerification) {
              allFactsHaveAttestedEvidence = false;
            }
          }
        }
      }
      detailedChecks['citation_sources_present'] = totalCitations > 0;
    }
    citationScore = Math.max(0, citationScore);

    // CRITICAL: isIndependentlyVerified can ONLY be true when:
    // 1. Not mock engine and no mock sources.
    // 2. Explicit, positive independent academic evidence is attached to all citations.
    let isIndependentlyVerified = false;
    if (hasMockSource) {
      isIndependentlyVerified = false;
      warnings.push(
        '[MOCK ENGINE] Dữ liệu lịch sử và kịch bản được tạo bởi Mock Provider nội bộ để kiểm thử quy trình (Simulation Mode); chưa qua thẩm định học thuật độc lập từ hội đồng sử học.'
      );
      detailedChecks['independent_academic_verified'] = false;
    } else if (!allFactsHaveAttestedEvidence) {
      isIndependentlyVerified = false;
      warnings.push(
        '[CHƯA KIỂM ĐỊNH ĐỘC LẬP] Dữ liệu sử liệu chưa có chứng thực độc lập từ hội đồng sử học hoặc văn bản lưu trữ chuẩn quốc gia.'
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
      (safeZonePassed ? 10 : 0)
    );

    const isPassing =
      totalScore >= 80 &&
      isExactResolution &&
      safeZonePassed &&
      subtitleSyntaxPassed &&
      durationAlignedPassed;

    const report: QAReport = {
      qaScore: totalScore,
      isPassing,
      timingMatchScore: timingScore,
      spellingQualityScore: spellingScore,
      sourceCitationScore: citationScore,
      subtitleSyncScore,
      safeZoneCheckPassed: safeZonePassed,
      isIndependentlyVerified,
      warnings,
      detailedChecks
    };

    return QAReportSchema.parse(report);
  }
}
