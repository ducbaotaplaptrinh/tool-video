import React from 'react';
import { Series, Audio, AbsoluteFill } from 'remotion';
import { VietSuReelProps } from '@vietsu/shared';
import { KenBurnsScene } from './components/KenBurnsScene';
import { KineticSubtitles } from './components/KineticSubtitles';
import { HistoricalBadge } from './components/HistoricalBadge';

export const VietSuReel: React.FC<VietSuReelProps> = ({
  title,
  historicalEra,
  bgmUrl,
  bgmVolume = 0.25,
  scenes
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#090604' }}>
      {/* Background Music if available */}
      {bgmUrl && (
        <Audio
          src={bgmUrl}
          volume={bgmVolume}
          startFrom={0}
        />
      )}

      {/* Sequential Scenes */}
      <Series>
        {scenes.map((scene) => (
          <Series.Sequence
            key={`scene-${scene.sceneNumber}`}
            durationInFrames={scene.durationInFrames}
          >
            {/* 1. Visual with Ken Burns camera movement */}
            <KenBurnsScene
              visualUrl={scene.visualUrl}
              motion={scene.cameraMotion}
            />

            {/* 2. Top-left Historical Source Certification */}
            <HistoricalBadge
              sourceText={scene.citationBadge || `${title} (${historicalEra})`}
            />

            {/* 3. Top-right Studio Watermark */}
            <div
              style={{
                position: 'absolute',
                top: '80px',
                right: '60px',
                padding: '8px 20px',
                background: 'rgba(0, 0, 0, 0.6)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 209, 102, 0.4)',
                fontFamily: "'Segoe UI', Roboto, sans-serif",
                fontSize: '16px',
                fontWeight: 700,
                color: '#ffd166',
                letterSpacing: '1px',
                zIndex: 40
              }}
            >
              VIỆT SỬ STUDIO
            </div>

            {/* 4. Dynamic Kinetic Subtitles */}
            <KineticSubtitles subtitles={scene.subtitles} />

            {/* 5. Voiceover Audio */}
            {scene.audioUrl && (
              <Audio
                src={scene.audioUrl}
                volume={1.0}
              />
            )}
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
