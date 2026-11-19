import { 
  ScriptDocument, 
  VisualAsset, 
  SceneAudioTrack, 
  ResearchDossier, 
  RemotionSceneProps, 
  VietSuReelProps,
  VisualShot,
  CameraMotion
} from '@vietsu/shared';

export interface EditorOptions {
  showBranding?: boolean;
  showHistoricalBadge?: boolean;
}

export class EditorAgent {
  execute(
    projectId: string,
    script: ScriptDocument,
    visuals: VisualAsset[],
    audios: SceneAudioTrack[],
    dossier: ResearchDossier,
    options?: EditorOptions
  ): { reelProps: VietSuReelProps; scenes: RemotionSceneProps[] } {
    const fps = 30;
    const scenes: RemotionSceneProps[] = [];

    // Map citation source text
    const defaultCitation = dossier.facts[0]?.citations[0]
      ? `${dossier.facts[0].citations[0].sourceTitle} (${dossier.facts[0].citations[0].author})`
      : 'Sử liệu Việt Nam';

    for (let i = 0; i < script.scenes.length; i++) {
      const sceneDraft = script.scenes[i];
      const sceneVisuals = visuals.filter(v => v.sceneNumber === sceneDraft.sceneNumber);
      const visual = sceneVisuals[0] || visuals[i] || visuals[0];
      const audio = audios.find(a => a.sceneNumber === sceneDraft.sceneNumber) || audios[i];

      const durationSec = audio?.durationSec || sceneDraft.estimatedDurationSec || 6;
      const durationInFrames = Math.max(30, Math.round(durationSec * fps));

      // Multi-shot pacing to avoid long static scenes
      let visualShots: VisualShot[] | undefined = undefined;

      if (sceneVisuals.length >= 2) {
        const shot1Frames = Math.floor(durationInFrames / 2);
        const shot2Frames = durationInFrames - shot1Frames;
        visualShots = [
          {
            visualUrl: sceneVisuals[0].url,
            durationInFrames: shot1Frames,
            cameraMotion: sceneVisuals[0].cameraMotion || 'ZOOM_IN',
            transition: 'cut'
          },
          {
            visualUrl: sceneVisuals[1].url,
            durationInFrames: shot2Frames,
            cameraMotion: sceneVisuals[1].cameraMotion || 'PAN_LEFT',
            transition: 'crossfade'
          }
        ];
      } else if (durationInFrames >= 210) {
        // Scene longer than 7 seconds: split into dynamic multi-shot with camera reframing
        const shot1Frames = Math.floor(durationInFrames * 0.45);
        const shot2Frames = durationInFrames - shot1Frames;
        const initialMotion = visual?.cameraMotion || sceneDraft.cameraMotion || 'ZOOM_IN';
        const secondMotion: CameraMotion = initialMotion === 'ZOOM_IN' ? 'PAN_LEFT' : 'ZOOM_OUT';

        visualShots = [
          {
            visualUrl: visual.url,
            durationInFrames: shot1Frames,
            cameraMotion: initialMotion,
            transition: 'cut'
          },
          {
            visualUrl: visual.url,
            durationInFrames: shot2Frames,
            cameraMotion: secondMotion,
            transition: 'crossfade'
          }
        ];
      }

      scenes.push({
        sceneNumber: sceneDraft.sceneNumber,
        visualUrl: visual.url,
        audioUrl: audio.audioUrl,
        durationInFrames,
        cameraMotion: visual.cameraMotion || sceneDraft.cameraMotion || 'ZOOM_IN',
        subtitles: audio.wordTimestamps || [],
        citationBadge: defaultCitation,
        subtitleLayout: {
          bottomPx: 280,
          maxWordsPerChunk: 6,
          maxWidthPx: 900
        },
        visualShots
      });
    }

    const reelProps: VietSuReelProps = {
      projectId,
      title: script.title,
      historicalEra: dossier.historicalEra,
      fps,
      width: 1080,
      height: 1920,
      bgmVolume: 0.25,
      showBranding: options?.showBranding ?? false, // Default: CLEAN (No watermark)
      showHistoricalBadge: options?.showHistoricalBadge ?? false, // Default: CLEAN (No badge)
      scenes
    };

    return { reelProps, scenes };
  }
}
