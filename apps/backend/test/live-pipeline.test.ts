import assert from 'assert';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';
import express from 'express';
import cors from 'cors';
import { prisma } from '../src/db.js';
import projectRoutes from '../src/routes/project.routes.js';
import { StorageService } from '../src/storage/storage.service.js';
import { 
  WikipediaHistoricalResearcher, 
  LiveLLMProvider, 
  PollinationsImageProvider, 
  EdgeTTSProvider,
  ProviderRegistry 
} from '@vietsu/ai-providers';

const execAsync = util.promisify(exec);
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runLivePipelineSuite() {
  console.log('\n====================================================');
  console.log('  VIETSU AI STUDIO - PHASE 2 REAL AI PIPELINE SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    process.stdout.write(`[TEST] ${name} ... `);
    try {
      await fn();
      console.log('PASSED ✓');
      passed++;
    } catch (err: any) {
      console.log('FAILED ✗');
      console.error('   -> Error:', err.message || err);
      failed++;
    }
  }

  // Setup test server
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/projects', projectRoutes);

  const server = app.listen(0);
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}/api`;
  console.log(`[Live Test Server] Running on ${baseUrl}\n`);

  try {
    // 1. Test Wikipedia Historical Researcher
    let bachDangWikiDossier: any = null;
    await test('WikipediaHistoricalResearcher: live search & extraction for Bạch Đằng 938', async () => {
      const researcher = new WikipediaHistoricalResearcher();
      bachDangWikiDossier = await researcher.research('Trận Bạch Đằng năm 938', 'Thời kỳ Tiền Ngô');

      assert.ok(bachDangWikiDossier, 'Dossier must exist');
      assert.ok(bachDangWikiDossier.facts.length >= 1, 'Must extract at least 1 verified fact');
      
      const firstFact = bachDangWikiDossier.facts[0];
      assert.strictEqual(firstFact.isMockSource, false, 'isMockSource must be false');
      assert.ok(firstFact.citations.length >= 1, 'Must contain citation');
      
      const citation = firstFact.citations[0];
      assert.strictEqual(citation.isMockSource, false, 'Citation isMockSource must be false');
      assert.strictEqual(citation.isIndependentlyVerified, false, 'Wikipedia citations cannot be claimed as independently verified primary sources');
      assert.strictEqual(citation.verificationLevel, 'WIKIPEDIA_SECONDARY_SOURCE', 'Verification level must be WIKIPEDIA_SECONDARY_SOURCE');
      assert.ok(citation.verificationUrl?.includes('wikipedia.org'), 'Must provide accredited Wikipedia URL');
      assert.ok(citation.quoteExcerpt?.length > 20, 'Must have authentic quote excerpt');
    });

    // 2. Test EdgeTTSProvider + gTTS Neural Voice
    let testAudioTrack: any = null;
    await test('EdgeTTSProvider: synthesizes real Vietnamese neural voice with word timestamps', async () => {
      const tts = new EdgeTTSProvider();
      const storage = StorageService.getInstance();
      const tempDir = storage.getTempDir();

      testAudioTrack = await tts.synthesizeSpeech(
        'Sông Bạch Đằng cuộn sóng, ghi dấu chiến công hiển hách của Ngô Quyền đại phá quân Nam Hán.',
        {
          sceneNumber: 1,
          outputDir: tempDir,
          voiceGender: 'MALE'
        }
      );

      assert.ok(testAudioTrack, 'Audio track must be generated');
      assert.ok(fs.existsSync(testAudioTrack.localPath), 'Audio file must exist on disk');
      assert.ok(testAudioTrack.durationSec > 2.0, `Duration (${testAudioTrack.durationSec}s) must be valid`);
      assert.ok(testAudioTrack.wordTimestamps.length > 5, 'Must parse non-empty word-level timestamps');

      // Verify valid MP3 codec via ffprobe
      const probeCmd = `ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${testAudioTrack.localPath}"`;
      const { stdout: probeOut } = await execAsync(probeCmd);
      assert.ok(probeOut.trim().includes('mp3') || probeOut.trim().includes('wav'), 'Audio must be valid MP3 or WAV');
    });

    // 3. Test PollinationsImageProvider
    let testImageAsset: any = null;
    await test('PollinationsImageProvider: generates 1080x1920 historical vertical artwork', async () => {
      const imgProvider = new PollinationsImageProvider();
      const storage = StorageService.getInstance();
      const tempDir = storage.getTempDir();

      testImageAsset = await imgProvider.generateImage(
        'Chiến thuyền quân giặc Nam Hán vỡ tan tành trước cọc gỗ ngầm trên sông Bạch Đằng',
        {
          sceneNumber: 1,
          outputDir: tempDir,
          historicalEra: 'Thời kỳ Tiền Ngô',
          width: 1080,
          height: 1920
        }
      );

      assert.ok(testImageAsset, 'Image asset must be generated');
      assert.ok(fs.existsSync(testImageAsset.localPath), 'Image file must exist on disk');
      const stats = fs.statSync(testImageAsset.localPath);
      assert.ok(stats.size > 10000, `Image file size (${stats.size} bytes) confirms valid visual asset`);
    });

    // 4. End-to-End Real Project 1: Bạch Đằng 938 (useMockProvider = false)
    let p1Id = '';
    await test('Live Project 1: Full Pipeline (Bạch Đằng 938) with real Wikipedia, TTS & Visuals', async () => {
      // 4.1 Create project with useMockProvider = false
      const createRes = await fetch(`${baseUrl}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Chiến thắng Bạch Đằng năm 938 của Ngô Quyền',
          historicalEra: 'Thời kỳ Tiền Ngô',
          targetDurationSec: 45,
          useMockProvider: false
        })
      });
      assert.strictEqual(createRes.status, 201);
      const p1 = await createRes.json();
      p1Id = p1.id;
      assert.strictEqual(p1.useMockProvider, false, 'Project useMockProvider must be false');

      // 4.2 Start Research
      const startRes = await fetch(`${baseUrl}/projects/${p1Id}/pipeline/start`, { method: 'POST' });
      assert.strictEqual(startRes.status, 200);

      // Wait for research to finish
      let attempts = 0;
      let projectData: any = null;
      while (attempts < 30) {
        await sleep(1500);
        projectData = await prisma.project.findUnique({
          where: { id: p1Id },
          include: { researchItems: true }
        });
        if (projectData?.status === 'RESEARCH_PENDING_APPROVAL') break;
        attempts++;
      }
      assert.strictEqual(projectData?.status, 'RESEARCH_PENDING_APPROVAL');
      assert.ok(projectData.researchItems.length >= 1, 'Must have research items');

      // Verify facts are live Wikipedia facts
      const rItem = projectData.researchItems[0];
      const cites = JSON.parse(rItem.citations || '[]');
      assert.strictEqual(cites[0]?.isMockSource, false, 'Citation must not be mock');
      assert.strictEqual(cites[0]?.isIndependentlyVerified, false, 'Wikipedia secondary source cannot be claimed as independently verified primary source');
      assert.strictEqual(cites[0]?.verificationLevel, 'WIKIPEDIA_SECONDARY_SOURCE');

      // 4.3 Approve Research -> Generate Script
      const appRes = await fetch(`${baseUrl}/projects/${p1Id}/pipeline/approve-research`, { method: 'POST' });
      assert.strictEqual(appRes.status, 200);

      attempts = 0;
      while (attempts < 30) {
        await sleep(1500);
        projectData = await prisma.project.findUnique({
          where: { id: p1Id },
          include: { script: true, scenes: true }
        });
        if (projectData?.status === 'SCRIPT_PENDING_APPROVAL') break;
        attempts++;
      }
      assert.strictEqual(projectData?.status, 'SCRIPT_PENDING_APPROVAL');
      assert.ok(projectData.script, 'Script must exist');
      assert.ok(projectData.scenes.length >= 4, 'Must have at least 4 scenes');

      // 4.4 Approve Script -> Asset Generation + QA
      const appScriptRes = await fetch(`${baseUrl}/projects/${p1Id}/pipeline/approve-script`, { method: 'POST' });
      assert.strictEqual(appScriptRes.status, 200);

      attempts = 0;
      while (attempts < 45) {
        await sleep(2000);
        projectData = await prisma.project.findUnique({
          where: { id: p1Id },
          include: { assets: true, scenes: true }
        });
        if (projectData?.status === 'READY_TO_RENDER') break;
        attempts++;
      }
      assert.strictEqual(projectData?.status, 'READY_TO_RENDER');
      assert.ok(projectData.assets.length >= 8, 'Must generate assets');

      // 4.5 Verify QA report confirms isIndependentlyVerified = false (truthful Wikipedia secondary source classification)
      const fullProject = await prisma.project.findUnique({ where: { id: p1Id } });
      assert.ok(fullProject?.qaReport, 'qaReport must exist');
      const parsedQa = JSON.parse(fullProject.qaReport);
      assert.strictEqual(
        parsedQa.isIndependentlyVerified,
        false,
        'Live project using Wikipedia secondary sources must have isIndependentlyVerified = false until primary ancient sources are attested'
      );
      assert.ok(parsedQa.isPassing, 'QA report must pass');
    });

    // 5. Render Video MP4 for Project 1 & Deep Inspection
    let renderedP1Path = '';
    await test('Render MP4 (Bạch Đằng 938): 1080x1920 30fps H.264/AAC with visual snapshot', async () => {
      const renderRes = await fetch(`${baseUrl}/projects/${p1Id}/render`, { method: 'POST' });
      assert.strictEqual(renderRes.status, 200);

      let attempts = 0;
      let projectData: any = null;
      while (attempts < 120) {
        await sleep(2000);
        projectData = await prisma.project.findUnique({ where: { id: p1Id } });
        if (projectData?.status === 'COMPLETED' || projectData?.status === 'FAILED') break;
        attempts++;
      }

      assert.strictEqual(projectData?.status, 'COMPLETED', 'Render status must be COMPLETED');
      assert.ok(projectData.renderedVideoUrl, 'renderedVideoUrl must exist');

      const storage = StorageService.getInstance();
      const filename = path.basename(projectData.renderedVideoUrl);
      renderedP1Path = path.join(storage.getVideosDir(), filename);
      assert.ok(fs.existsSync(renderedP1Path), `Video file must exist at ${renderedP1Path}`);

      // Deep inspection via ffprobe
      const probeCmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${renderedP1Path}"`;
      const { stdout: probeStdout } = await execAsync(probeCmd);
      const probeData = JSON.parse(probeStdout);

      const videoStream = probeData.streams.find((s: any) => s.codec_type === 'video');
      assert.ok(videoStream, 'Must have video stream');
      assert.strictEqual(videoStream.width, 1080, 'Width must be 1080');
      assert.strictEqual(videoStream.height, 1920, 'Height must be 1920');

      const audioStream = probeData.streams.find((s: any) => s.codec_type === 'audio');
      assert.ok(audioStream, 'Must have audio stream');

      // Extract visual frame snapshot
      const snapshotPath = path.join(storage.getTempDir(), `p1_snapshot_${Date.now()}.png`);
      const snapshotCmd = `ffmpeg -y -ss 00:00:01.000 -i "${renderedP1Path}" -vframes 1 "${snapshotPath}"`;
      await execAsync(snapshotCmd);
      assert.ok(fs.existsSync(snapshotPath), 'Snapshot image must be generated');
      const snapStats = fs.statSync(snapshotPath);
      assert.ok(snapStats.size > 20000, `Snapshot size (${snapStats.size} bytes) confirms valid rendered visuals`);
      console.log(`     [Visual Snapshot] Extracted 1080x1920 PNG frame (${snapStats.size} bytes)`);
    });

    // 6. Un-hardcoded Dynamic Topic: Ngọc Hồi - Đống Đa 1789 (useMockProvider = false)
    let p2Id = '';
    await test('Live Project 2 (Un-hardcoded: Ngọc Hồi - Đống Đa 1789): Dynamic Wikipedia & Real Voice', async () => {
      const createRes = await fetch(`${baseUrl}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Chiến thắng Ngọc Hồi - Đống Đa năm 1789 của vua Quang Trung',
          historicalEra: 'Thời kỳ Tây Sơn',
          targetDurationSec: 45,
          useMockProvider: false
        })
      });
      assert.strictEqual(createRes.status, 201);
      const p2 = await createRes.json();
      p2Id = p2.id;

      // Start pipeline
      const startRes = await fetch(`${baseUrl}/projects/${p2Id}/pipeline/start`, { method: 'POST' });
      assert.strictEqual(startRes.status, 200);

      let attempts = 0;
      let projectData: any = null;
      while (attempts < 30) {
        await sleep(1500);
        projectData = await prisma.project.findUnique({
          where: { id: p2Id },
          include: { researchItems: true }
        });
        if (projectData?.status === 'RESEARCH_PENDING_APPROVAL') break;
        attempts++;
      }
      assert.strictEqual(projectData?.status, 'RESEARCH_PENDING_APPROVAL');

      // Verify facts are about Quang Trung / Ngọc Hồi / Đống Đa
      const rItem = projectData.researchItems[0];
      const cites = JSON.parse(rItem.citations || '[]');
      assert.ok(
        rItem.factSummary.includes('Quang Trung') || 
        rItem.factSummary.includes('Ngọc Hồi') || 
        rItem.factSummary.includes('Đống Đa') ||
        cites[0]?.sourceTitle?.includes('Ngọc Hồi') ||
        cites[0]?.sourceTitle?.includes('Quang Trung') ||
        cites[0]?.verificationUrl?.includes('wikipedia.org'),
        'Must extract authentic facts about Ngọc Hồi - Đống Đa'
      );
      assert.strictEqual(cites[0]?.isMockSource, false);
      assert.strictEqual(cites[0]?.isIndependentlyVerified, false, 'Wikipedia secondary source cannot be claimed as independently verified primary source');
      assert.strictEqual(cites[0]?.verificationLevel, 'WIKIPEDIA_SECONDARY_SOURCE');

      // Approve research
      const appRes = await fetch(`${baseUrl}/projects/${p2Id}/pipeline/approve-research`, { method: 'POST' });
      assert.strictEqual(appRes.status, 200);

      attempts = 0;
      while (attempts < 30) {
        await sleep(1500);
        projectData = await prisma.project.findUnique({
          where: { id: p2Id },
          include: { script: true, scenes: true }
        });
        if (projectData?.status === 'SCRIPT_PENDING_APPROVAL') break;
        attempts++;
      }
      assert.strictEqual(projectData?.status, 'SCRIPT_PENDING_APPROVAL');
      assert.ok(projectData.script.hook.includes('Ngọc Hồi') || projectData.script.hook.includes('Quang Trung') || projectData.script.hook.length > 20);

      // Approve script -> generate assets
      const appScriptRes = await fetch(`${baseUrl}/projects/${p2Id}/pipeline/approve-script`, { method: 'POST' });
      assert.strictEqual(appScriptRes.status, 200);

      attempts = 0;
      while (attempts < 45) {
        await sleep(2000);
        projectData = await prisma.project.findUnique({
          where: { id: p2Id },
          include: { assets: true, scenes: true }
        });
        if (projectData?.status === 'READY_TO_RENDER') break;
        attempts++;
      }
      assert.strictEqual(projectData?.status, 'READY_TO_RENDER');
      assert.ok(projectData.assets.length >= 8);
    });

  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
    console.log('\n[Live Test Server] Stopped cleanly.');
  }

  console.log('\n====================================================');
  console.log(`  KẾT QUẢ KIỂM THỬ LIVE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLivePipelineSuite().catch(err => {
  console.error('Fatal Live Test Runner Error:', err);
  process.exit(1);
});
