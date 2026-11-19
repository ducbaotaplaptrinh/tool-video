import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Img } from 'remotion';
import { CameraMotion } from '@vietsu/shared';

interface KenBurnsSceneProps {
  visualUrl: string;
  motion: CameraMotion;
}

export const KenBurnsScene: React.FC<KenBurnsSceneProps> = ({ visualUrl, motion }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  let scale = 1.0;
  let translateX = 0;
  let translateY = 0;

  switch (motion) {
    case 'ZOOM_IN':
      scale = interpolate(frame, [0, durationInFrames], [1.0, 1.15], {
        extrapolateRight: 'clamp'
      });
      break;
    case 'ZOOM_OUT':
      scale = interpolate(frame, [0, durationInFrames], [1.15, 1.0], {
        extrapolateRight: 'clamp'
      });
      break;
    case 'PAN_LEFT':
      scale = 1.08;
      translateX = interpolate(frame, [0, durationInFrames], [30, -30], {
        extrapolateRight: 'clamp'
      });
      break;
    case 'PAN_RIGHT':
      scale = 1.08;
      translateX = interpolate(frame, [0, durationInFrames], [-30, 30], {
        extrapolateRight: 'clamp'
      });
      break;
    case 'STATIC':
    default:
      scale = 1.02;
      break;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#090604'
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          transformOrigin: 'center center',
          transition: 'transform 0.1s linear'
        }}
      >
        <Img
          src={visualUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Cinematic Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.65) 100%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};
