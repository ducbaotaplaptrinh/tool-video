import path from 'path';
import fs from 'fs';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { defaultReelProps } from './Root';
import { VietSuReelProps } from '@vietsu/shared';

async function main() {
  console.log('[VietSu Render CLI] Khởi động trình kết xuất video Remotion 9:16...');

  // Parse arguments: --props=... --output=...
  const args = process.argv.slice(2);
  let propsPath: string | null = null;
  let outputPath: string | null = null;

  for (const arg of args) {
    if (arg.startsWith('--props=')) {
      propsPath = arg.replace('--props=', '');
    } else if (arg.startsWith('--output=')) {
      outputPath = arg.replace('--output=', '');
    }
  }

  // Load input props
  let reelProps: VietSuReelProps = defaultReelProps;
  if (propsPath && fs.existsSync(propsPath)) {
    const raw = fs.readFileSync(propsPath, 'utf-8');
    reelProps = JSON.parse(raw);
    console.log(`[VietSu Render CLI] Đã tải props từ file: ${propsPath}`);
  } else {
    console.log('[VietSu Render CLI] Sử dụng props mẫu mặc định: Bạch Đằng 938');
  }

  // Determine storage base directory
  const storageBase = path.resolve(__dirname, '../../../storage');
  if (!outputPath) {
    outputPath = path.join(storageBase, 'videos', `test_render_sample_${Date.now()}.mp4`);
  }

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  // Helper to convert storage URL to data URI for headless Chromium
  const toDataUri = (url: string | undefined): string | undefined => {
    if (!url) return url;
    let absPath = url;
    if (url.startsWith('/storage/')) {
      const rel = url.replace('/storage/', '');
      absPath = path.join(storageBase, rel);
    } else if (url.startsWith('file:///')) {
      absPath = url.replace('file:///', '');
    }

    if (fs.existsSync(absPath)) {
      const buf = fs.readFileSync(absPath);
      if (absPath.endsWith('.svg')) {
        return `data:image/svg+xml;base64,${buf.toString('base64')}`;
      } else if (absPath.endsWith('.png')) {
        return `data:image/png;base64,${buf.toString('base64')}`;
      } else if (absPath.endsWith('.jpg') || absPath.endsWith('.jpeg')) {
        return `data:image/jpeg;base64,${buf.toString('base64')}`;
      } else if (absPath.endsWith('.mp3')) {
        return `data:audio/mpeg;base64,${buf.toString('base64')}`;
      } else if (absPath.endsWith('.wav')) {
        return `data:audio/wav;base64,${buf.toString('base64')}`;
      }
    }
    return url;
  };

  // Map local /storage/... URLs to data URIs for headless Chromium
  const mappedScenes = reelProps.scenes.map(s => {
    const visualUrl = toDataUri(s.visualUrl) || s.visualUrl;
    const audioUrl = toDataUri(s.audioUrl) || s.audioUrl;

    const visualShots = s.visualShots?.map(shot => ({
      ...shot,
      visualUrl: toDataUri(shot.visualUrl) || shot.visualUrl
    }));

    return {
      ...s,
      visualUrl,
      audioUrl,
      visualShots
    };
  });

  const finalProps = {
    ...reelProps,
    scenes: mappedScenes
  } as Record<string, unknown>;

  // 1. Bundle Remotion entry
  const entryPoint = fs.existsSync(path.resolve(__dirname, 'index.ts'))
    ? path.resolve(__dirname, 'index.ts')
    : (fs.existsSync(path.resolve(__dirname, '../src/index.ts'))
      ? path.resolve(__dirname, '../src/index.ts')
      : path.resolve(__dirname, 'index.js'));
  console.log(`[VietSu Render CLI] Đang bundle Remotion từ: ${entryPoint}`);

  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => config
  });

  console.log(`[VietSu Render CLI] Bundle hoàn tất tại: ${bundleLocation}`);

  // 2. Select Composition
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'VietSuReel',
    inputProps: finalProps
  });

  console.log(`[VietSu Render CLI] Đã chọn composition 'VietSuReel':`);
  console.log(`  - Kích thước: ${composition.width}x${composition.height}`);
  console.log(`  - FPS: ${composition.fps}`);
  console.log(`  - Tổng số frames: ${composition.durationInFrames} (~${(composition.durationInFrames / composition.fps).toFixed(1)}s)`);

  // 3. Render MP4 Media
  console.log(`[VietSu Render CLI] Đang kết xuất video sang: ${outputPath}...`);
  const startTime = Date.now();

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps: finalProps,
    onProgress: ({ progress }) => {
      process.stdout.write(`\r  > Tiến độ render: ${(progress * 100).toFixed(1)}%`);
    }
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n[VietSu Render CLI] XUẤT VIDEO THÀNH CÔNG trong ${durationSec}s!`);
  console.log(`  - Tệp MP4: ${outputPath}`);

  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    console.log(`  - Kích thước tệp: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  }
}

main().catch((err) => {
  console.error('[VietSu Render CLI] Lỗi xuất video:', err);
  process.exit(1);
});
