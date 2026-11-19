import assert from 'assert';
import { prisma } from '../src/db.js';
import { WorkflowEngine } from '../src/orchestrator/workflow-engine.js';
import { ProviderRegistry } from '@vietsu/ai-providers';
import { StorageService } from '../src/storage/storage.service.js';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

async function runTests() {
  console.log('====================================================');
  console.log('  VIETSU AI STUDIO - PHASE 1 VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      process.stdout.write(`[TEST] ${name} ... `);
      await fn();
      console.log('PASSED ✓');
      passed++;
    } catch (err: any) {
      console.log('FAILED ✗');
      console.error('   -> Error:', err.message);
      failed++;
    }
  }

  // 1. Storage & Directories
  await test('Storage directories initialization', async () => {
    const storage = StorageService.getInstance();
    storage.ensureDirectories();
    assert.ok(fs.existsSync(storage.getAssetsDir()), 'assets dir must exist');
    assert.ok(fs.existsSync(storage.getAudioDir()), 'audio dir must exist');
    assert.ok(fs.existsSync(storage.getVideosDir()), 'videos dir must exist');
    assert.ok(fs.existsSync(storage.getTempDir()), 'temp dir must exist');
  });

  // 2. Provider Registry & Mock Providers
  await test('Provider Registry loads Mock Providers', async () => {
    const registry = ProviderRegistry.getInstance();
    const llm = registry.getLLM();
    const img = registry.getImage();
    const tts = registry.getTTS();
    const video = registry.getVideo();

    assert.ok(llm.isMock, 'LLM must be in mock mode');
    assert.ok(img.isMock, 'Image provider must be in mock mode');
    assert.ok(tts.isMock, 'TTS provider must be in mock mode');
    assert.ok(video.isMock, 'Video provider must be in mock mode');
  });

  // 3. Historical Integrity & Citation Check
  await test('Historical Research & Authenticity (Bạch Đằng 938)', async () => {
    const registry = ProviderRegistry.getInstance();
    const dossier = await registry.getLLM().researchHistory(
      'Chiến thắng Bạch Đằng năm 938 của Ngô Quyền',
      'Thời kỳ Tự chủ & Tiền Ngô'
    );

    assert.ok(dossier.facts.length >= 2, 'Must have at least 2 verified facts');
    
    // Check citation existence
    const firstFact = dossier.facts[0];
    assert.ok(firstFact.citations.length >= 1, 'Fact must have verified citations');
    assert.strictEqual(firstFact.citations[0].sourceTitle, 'Đại Việt Sử Ký Toàn Thư');
    assert.strictEqual(firstFact.category, 'CONFIRMED_FACT');

    // Check hypothesis classification
    const hypoFact = dossier.facts.find(f => f.category === 'HISTORICAL_HYPOTHESIS');
    assert.ok(hypoFact, 'Must categorize archaeological excavations as HISTORICAL_HYPOTHESIS');
  });

  // 4. Project Database CRUD
  let testProjectId = '';
  await test('Database Project creation and query', async () => {
    const project = await prisma.project.create({
      data: {
        title: 'Chiến thắng Bạch Đằng năm 938 (Test Run)',
        description: 'Kiểm thử quy trình sản xuất video lịch sử tự động',
        historicalEra: 'Thời kỳ Tự chủ & Tiền Ngô',
        targetDurationSec: 30,
        aspectRatio: '9:16',
        status: 'DRAFT'
      }
    });

    assert.ok(project.id, 'Project ID must be generated');
    testProjectId = project.id;

    const fetched = await prisma.project.findUnique({ where: { id: testProjectId } });
    assert.strictEqual(fetched?.title, 'Chiến thắng Bạch Đằng năm 938 (Test Run)');
    assert.strictEqual(fetched?.status, 'DRAFT');
  });

  // 5. Pipeline Step 1: Research Execution
  await test('Pipeline Step 1: Research Agent execution & DB persistence', async () => {
    const engine = WorkflowEngine.getInstance();
    await engine.startPipeline(testProjectId);

    const project = await prisma.project.findUnique({
      where: { id: testProjectId },
      include: { researchItems: true, jobs: true, costs: true }
    });

    assert.strictEqual(project?.status, 'RESEARCH_PENDING_APPROVAL');
    assert.ok(project!.researchItems.length > 0, 'Research items must be persisted in DB');
    assert.ok(project!.jobs.length > 0, 'Research job must be recorded');
    assert.ok(project!.costs.length > 0, 'Cost must be logged');
  });

  // 6. Pipeline Step 2: Approve Research & Scripting
  await test('Pipeline Step 2: Approve Research & Script Agent narrative generation', async () => {
    const engine = WorkflowEngine.getInstance();
    await engine.approveResearch(testProjectId);

    const project = await prisma.project.findUnique({
      where: { id: testProjectId },
      include: { script: true, scenes: true }
    });

    assert.strictEqual(project?.status, 'SCRIPT_PENDING_APPROVAL');
    assert.ok(project?.script, 'Script must be generated');
    assert.ok(project!.script!.hook.length > 10, 'Hook must be present');
    assert.ok(project!.scenes.length >= 4, 'Must have at least 4 scenes for 30s');
  });

  // 7. Pipeline Step 3: Approve Script & Asset Generation (Visual SVG + Audio WAV)
  await test('Pipeline Step 3: Approve Script & generate Visual + TTS assets', async () => {
    const engine = WorkflowEngine.getInstance();
    await engine.approveScript(testProjectId);

    const project = await prisma.project.findUnique({
      where: { id: testProjectId },
      include: { scenes: true, assets: true }
    });

    // Should progress through GENERATING_ASSETS -> EDITING -> QA_CHECKING -> READY_TO_RENDER
    assert.strictEqual(project?.status, 'READY_TO_RENDER');
    assert.ok(project!.assets.length >= 8, 'Must generate both visual and audio assets');

    // Verify first scene has visual and audio
    const firstScene = project!.scenes[0];
    assert.ok(firstScene.visualUrl, 'Scene must have visualUrl');
    assert.ok(firstScene.audioUrl, 'Scene must have audioUrl');
    assert.ok(firstScene.subtitles, 'Scene must have word-level subtitles');

    const subtitles = JSON.parse(firstScene.subtitles!);
    assert.ok(Array.isArray(subtitles), 'Subtitles must be an array of words');
    assert.ok(subtitles.length > 0, 'Subtitles must have word timestamps');
    assert.ok(typeof subtitles[0].start === 'number', 'Timestamp must have start time');
  });

  // 8. Pipeline Step 4: QA Quality Report Verification
  await test('Pipeline Step 4: QA Agent score & safe zone verification', async () => {
    const project = await prisma.project.findUnique({ where: { id: testProjectId } });
    assert.ok(project?.qaReport, 'QA Report must be generated');

    const report = JSON.parse(project!.qaReport!);
    assert.ok(report.qaScore >= 80, `QA score should pass (score was ${report.qaScore})`);
    assert.strictEqual(report.safeZoneCheckPassed, true, 'Safe zone check must pass');
    assert.strictEqual(report.isPassing, true, 'QA must be passing');
  });

  // 9. Remotion Render CLI Test (MP4 Export 1080x1920)
  await test('Remotion 9:16 Video Renderer: Bundle and Export MP4 file', async () => {
    const storage = StorageService.getInstance();
    const testOutputPath = path.join(storage.getVideosDir(), `verification_test_${Date.now()}.mp4`);

    const rendererScript = path.resolve(__dirname, '../../video-renderer/src/render-cli.ts');
    const cmd = `npx tsx "${rendererScript}" --output="${testOutputPath}"`;

    console.log('\n     Executing Remotion renderMedia command...');
    const { stdout, stderr } = await execAsync(cmd, {
      cwd: path.resolve(__dirname, '../../video-renderer'),
      maxBuffer: 1024 * 1024 * 20
    });

    console.log(stdout.trim().split('\n').map(l => '     ' + l).join('\n'));

    assert.ok(fs.existsSync(testOutputPath), `Rendered MP4 file must exist at ${testOutputPath}`);
    const stats = fs.statSync(testOutputPath);
    assert.ok(stats.size > 50000, `Video file size (${stats.size} bytes) must be valid (> 50KB)`);

    // Verify MP4 file stream metadata using FFprobe
    const probeCmd = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,codec_name -of default=noprint_wrappers=1 "${testOutputPath}"`;
    const { stdout: probeOut } = await execAsync(probeCmd);
    console.log('     FFprobe video metadata:\n' + probeOut.trim().split('\n').map(l => '       ' + l).join('\n'));

    assert.ok(probeOut.includes('width=1080'), 'Video width must be 1080');
    assert.ok(probeOut.includes('height=1920'), 'Video height must be 1920 (9:16 vertical)');
    assert.ok(probeOut.includes('codec_name=h264'), 'Video codec must be h264');
  });

  console.log('\n====================================================');
  console.log(`  KẾT QUẢ KIỂM THỬ: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
