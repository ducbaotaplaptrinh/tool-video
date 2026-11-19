import fs from 'fs';
import path from 'path';
import { VisualAsset, CostRecord } from '@vietsu/shared';
import { IImageProvider, ImageGenerationOptions } from '../interfaces/index.js';

export class MockImageProvider implements IImageProvider {
  name = 'MockImageProvider (High-Def Historical Canvas)';
  isMock = true;

  async generateImage(prompt: string, options: ImageGenerationOptions): Promise<VisualAsset> {
    const width = options.width || 1080;
    const height = options.height || 1920;
    const fileName = `scene_${options.sceneNumber}_${Date.now()}.svg`;
    const filePath = path.join(options.outputDir, fileName);

    // Color palettes for historical moods
    const palettes = [
      { bg1: '#1b130c', bg2: '#3d1e08', accent: '#e8a93a', secondary: '#9b2c2c', name: 'Hoàng Kim Hào Hùng' },
      { bg1: '#0d1821', bg2: '#1b2d48', accent: '#48cae4', secondary: '#b5179e', name: 'Đêm Thủy Chiến' },
      { bg1: '#240046', bg2: '#3c096c', accent: '#ffd166', secondary: '#e63946', name: 'Hào Khí Tây Sơn' },
      { bg1: '#14213d', bg2: '#000000', accent: '#fca311', secondary: '#e5e5e5', name: 'Bình Minh Độc Lập' }
    ];

    const palette = palettes[(options.sceneNumber - 1) % palettes.length];

    const escapeXml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const eraText = escapeXml(options.historicalEra.toUpperCase());
    const topicText = escapeXml(options.topicTitle.length > 30 ? options.topicTitle.substring(0, 30) + '...' : options.topicTitle);

    // Generate rich 9:16 Historical SVG Artwork
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${palette.bg1}" />
      <stop offset="50%" stop-color="${palette.bg2}" />
      <stop offset="100%" stop-color="#000000" />
    </linearGradient>
    <radialGradient id="sunburst" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.4" />
      <stop offset="70%" stop-color="${palette.accent}" stop-opacity="0.05" />
      <stop offset="100%" stop-color="${palette.bg1}" stop-opacity="0" />
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${palette.accent}" stroke-opacity="0.07" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
  <rect width="${width}" height="${height}" fill="url(#grid)"/>
  <circle cx="${width / 2}" cy="700" r="600" fill="url(#sunburst)"/>

  <!-- Dong Son Bronze Drum Motif Outer Ring -->
  <g transform="translate(${width / 2}, 700)" stroke="${palette.accent}" stroke-opacity="0.25" fill="none">
    <circle r="450" stroke-width="4"/>
    <circle r="420" stroke-width="2" stroke-dasharray="8,6"/>
    <circle r="360" stroke-width="3"/>
    <circle r="300" stroke-width="1.5" stroke-dasharray="4,4"/>
    <circle r="220" stroke-width="2"/>
    <!-- 14-pointed Star Sun (Trong Dong Son) -->
    <path d="M 0 -180 L 35 -60 L 160 -100 L 75 0 L 170 65 L 60 75 L 100 170 L 0 85 L -100 170 L -60 75 L -170 65 L -75 0 L -160 -100 L -35 -60 Z" 
          fill="${palette.accent}" fill-opacity="0.15" stroke="${palette.accent}" stroke-width="2"/>
  </g>

  <!-- Subject Graphic Box & Ancient Fortress/Naval Silhouette -->
  <rect x="80" y="320" width="${width - 160}" height="1200" rx="24" fill="#000000" fill-opacity="0.35" stroke="${palette.accent}" stroke-opacity="0.3" stroke-width="2"/>

  <!-- Historical Silhouette (Citadel & War Fleet) -->
  <g transform="translate(${width / 2}, 900)" fill="${palette.accent}">
    <!-- Ancient War Junk Ship / Fortress silhouette -->
    <path d="M -260 120 Q 0 240 260 120 L 200 -30 Q 0 0 -200 -30 Z" fill="${palette.accent}" fill-opacity="0.75"/>
    <path d="M -60 -30 L -60 -240 L 60 -240 L 60 -30 Z" fill="${palette.accent}" fill-opacity="0.55"/>
    <polygon points="0,-270 120,-160 0,-160" fill="${palette.secondary}" fill-opacity="0.9"/>
    <polygon points="0,-150 180,-40 0,-40" fill="${palette.secondary}" fill-opacity="0.9"/>
    <!-- Spear and Banner poles -->
    <line x1="-140" y1="60" x2="-140" y2="-120" stroke="${palette.accent}" stroke-width="4"/>
    <line x1="140" y1="60" x2="140" y2="-120" stroke="${palette.accent}" stroke-width="4"/>
    <polygon points="-140,-120 -80,-90 -140,-60" fill="${palette.secondary}" fill-opacity="0.8"/>
    <polygon points="140,-120 200,-90 140,-60" fill="${palette.secondary}" fill-opacity="0.8"/>
  </g>

  <!-- Decorative Corner Accents -->
  <path d="M 60 120 L 120 120 M 60 120 L 60 180" stroke="${palette.accent}" stroke-width="4" fill="none"/>
  <path d="M ${width - 60} 120 L ${width - 120} 120 M ${width - 60} 120 L ${width - 60} 180" stroke="${palette.accent}" stroke-width="4" fill="none"/>
  <path d="M 60 ${height - 180} L 120 ${height - 180} M 60 ${height - 180} L 60 ${height - 240}" stroke="${palette.accent}" stroke-width="4" fill="none"/>
  <path d="M ${width - 60} ${height - 180} L ${width - 120} ${height - 180} M ${width - 60} ${height - 180} L ${width - 60} ${height - 240}" stroke="${palette.accent}" stroke-width="4" fill="none"/>
</svg>`;

    fs.mkdirSync(options.outputDir, { recursive: true });
    fs.writeFileSync(filePath, svgContent, 'utf-8');

    return {
      sceneNumber: options.sceneNumber,
      assetType: 'IMAGE',
      url: `/storage/assets/${fileName}`,
      localPath: filePath,
      prompt,
      cameraMotion: options.cameraMotion
    };
  }

  estimateCost(imagesCount: number): CostRecord {
    const costUsd = imagesCount * 0.04;
    return {
      id: `cost-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      projectId: '',
      provider: this.name,
      service: 'IMAGE_GENERATION',
      unitsUsed: imagesCount,
      unitType: 'IMAGES',
      estimatedCostUSD: costUsd,
      estimatedCostVND: Math.round(costUsd * 25400),
      createdAt: new Date().toISOString()
    };
  }
}
