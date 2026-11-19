import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { WordTimestamp } from '@vietsu/shared';

interface KineticSubtitlesProps {
  subtitles: WordTimestamp[];
}

export const KineticSubtitles: React.FC<KineticSubtitlesProps> = ({ subtitles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeSec = frame / fps;

  if (!subtitles || subtitles.length === 0) return null;

  // Determine current active word index
  let activeIndex = subtitles.findIndex(
    w => currentTimeSec >= w.start && currentTimeSec <= w.end
  );

  if (activeIndex === -1) {
    // If between words or before/after, find nearest past word
    for (let i = subtitles.length - 1; i >= 0; i--) {
      if (currentTimeSec >= subtitles[i].end) {
        activeIndex = i;
        break;
      }
    }
  }

  // Group subtitles into display chunks of ~5-7 words for high readability
  const CHUNK_SIZE = 6;
  const currentChunkIndex = Math.max(0, Math.floor(Math.max(0, activeIndex) / CHUNK_SIZE));
  const chunkStart = currentChunkIndex * CHUNK_SIZE;
  const chunkWords = subtitles.slice(chunkStart, chunkStart + CHUNK_SIZE);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '240px', // Facebook Reels Safe Zone
        left: '50%',
        transform: 'translateX(-50%)',
        width: '900px',
        textAlign: 'center',
        zIndex: 50,
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px 16px',
          background: 'rgba(16, 11, 7, 0.75)',
          backdropFilter: 'blur(8px)',
          padding: '16px 28px',
          borderRadius: '24px',
          border: '2px solid rgba(232, 169, 58, 0.35)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
        }}
      >
        {chunkWords.map((item, idx) => {
          const globalIdx = chunkStart + idx;
          const isSpoken = currentTimeSec >= item.start;
          const isActive = globalIdx === activeIndex;

          return (
            <span
              key={`${item.word}-${globalIdx}`}
              style={{
                fontFamily: "'Be Vietnam Pro', 'Segoe UI', Roboto, sans-serif",
                fontSize: isActive ? '46px' : '42px',
                fontWeight: isActive ? 800 : 700,
                color: isActive ? '#ffd166' : isSpoken ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                textShadow: isActive
                  ? '0 0 20px rgba(255, 209, 102, 0.8), 0 2px 6px #000'
                  : '0 2px 6px rgba(0, 0, 0, 0.8)',
                transform: isActive ? 'scale(1.12)' : 'scale(1.0)',
                transition: 'all 0.08s ease-out',
                display: 'inline-block'
              }}
            >
              {item.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
