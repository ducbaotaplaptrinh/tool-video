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
  const storageBase = path.resolve(process.cwd(), '../../storage');
  if (!outputPath) {
    outputPath = path.join(storageBase, 'videos', `test_render_sample_${Date.now()}.mp4`);
  }

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  // Map local /storage/... URLs to absolute file:// URLs for headless Chromium
  const mappedScenes = reelProps.scenes.map(s => {
    let visualUrl = s.visualUrl;
    let audioUrl = s.audioUrl;

    if (visualUrl && visualUrl.startsWith('/storage/')) {
      const rel = visualUrl.replace('/storage/', '');
      const absPath = path.join(storageBase, rel);
      if (fs.existsSync(absPath)) {
        visualUrl = `file:///${absPath.replace(/\\/g, '/')}`;
      }
    }

    if (audioUrl && audioUrl.startsWith('/storage/')) {
      const rel = audioUrl.replace('/storage/', '');
      const absPath = path.join(storageBase, rel);
      if (fs.existsSync(absPath)) {
        audioUrl = `file:///${absPath.replace(/\\/g, '/')}`;
      }
    }

    return {
      ...s,
      visualUrl,
      audioUrl
    };
  });

  const finalProps = {
    ...reelProps,
    scenes: mappedScenes
  } as Record<string, unknown>;

  // 1. Bundle Remotion entry
  const entryPoint = path.resolve(__dirname, 'index.ts');
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
