import { 
  ScriptDocument, 
  VisualAsset, 
  SceneAudioTrack, 
  ResearchDossier, 
  RemotionSceneProps, 
  VietSuReelProps 
} from '@vietsu/shared';

export class EditorAgent {
  execute(
    projectId: string,
    script: ScriptDocument,
    visuals: VisualAsset[],
    audios: SceneAudioTrack[],
    dossier: ResearchDossier
  ): { reelProps: VietSuReelProps; scenes: RemotionSceneProps[] } {
    const fps = 30;
    const scenes: RemotionSceneProps[] = [];

    // Map citation source text
    const defaultCitation = dossier.facts[0]?.citations[0]
      ? `${dossier.facts[0].citations[0].sourceTitle} (${dossier.facts[0].citations[0].author})`
      : 'Sử liệu Việt Nam kiểm chứng';

    for (let i = 0; i < script.scenes.length; i++) {
      const sceneDraft = script.scenes[i];
      const visual = visuals.find(v => v.sceneNumber === sceneDraft.sceneNumber) || visuals[i];
      const audio = audios.find(a => a.sceneNumber === sceneDraft.sceneNumber) || audios[i];

      const durationSec = audio?.durationSec || sceneDraft.estimatedDurationSec || 6;
      const durationInFrames = Math.max(30, Math.round(durationSec * fps));

      scenes.push({
        sceneNumber: sceneDraft.sceneNumber,
        visualUrl: visual.url,
        audioUrl: audio.audioUrl,
        durationInFrames,
        cameraMotion: visual.cameraMotion || sceneDraft.cameraMotion || 'ZOOM_IN',
        subtitles: audio.wordTimestamps || [],
        citationBadge: defaultCitation
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
      scenes
    };

    return { reelProps, scenes };
  }
}
