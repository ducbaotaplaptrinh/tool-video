import React from 'react';
import { Composition } from 'remotion';
import { VietSuReel } from './VietSuReel';
import { VietSuReelProps } from '@vietsu/shared';

// Sample default props for Bạch Đằng 938
export const defaultReelProps: VietSuReelProps = {
  projectId: 'sample-bach-dang-938',
  title: 'Chiến thắng Bạch Đằng 938',
  historicalEra: 'Thời kỳ Tự chủ & Tiền Ngô',
  fps: 30,
  width: 1080,
  height: 1920,
  bgmVolume: 0.25,
  showBranding: false,
  showHistoricalBadge: false,
  scenes: [
    {
      sceneNumber: 1,
      visualUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1080',
      audioUrl: '',
      durationInFrames: 60, // 2s for quick test
      cameraMotion: 'ZOOM_IN',
      citationBadge: 'Đại Việt Sử Ký Toàn Thư (Ngô Sĩ Liên)',
      subtitles: [
        { word: 'Bạn', start: 0.2, end: 0.5 },
        { word: 'có', start: 0.5, end: 0.8 },
        { word: 'biết:', start: 0.8, end: 1.2 },
        { word: 'Một', start: 1.3, end: 1.6 },
        { word: 'con', start: 1.6, end: 1.9 }
      ]
    },
    {
      sceneNumber: 2,
      visualUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1080',
      audioUrl: '',
      durationInFrames: 60, // 2s
      cameraMotion: 'PAN_LEFT',
      citationBadge: 'Khâm Định Việt Sử Thông Giám Cương Mục',
      subtitles: [
        { word: 'Năm', start: 0.2, end: 0.5 },
        { word: '938,', start: 0.5, end: 0.9 },
        { word: 'quân', start: 1.0, end: 1.3 },
        { word: 'Nam', start: 1.3, end: 1.6 }
      ]
    }
  ]
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition<any, any>
        id="VietSuReel"
        component={VietSuReel}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultReelProps}
        calculateMetadata={({ props }: { props: any }) => {
          const totalFrames = props.scenes && props.scenes.length > 0
            ? props.scenes.reduce((sum: number, s: any) => sum + (s.durationInFrames || 60), 0)
            : 120;
          return {
            durationInFrames: totalFrames,
            fps: props.fps || 30,
            width: props.width || 1080,
            height: props.height || 1920
          };
        }}
      />
    </>
  );
};
