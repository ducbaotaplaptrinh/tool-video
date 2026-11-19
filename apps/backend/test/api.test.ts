import assert from 'assert';
import http from 'http';
import { prisma } from '../src/db.js';
import app from '../src/index.js';
import { WorkflowEngine } from '../src/orchestrator/workflow-engine.js';
import { JobRecoveryService } from '../src/orchestrator/job-recovery.service.js';
import { ProviderRegistry } from '@vietsu/ai-providers';
import { StorageService } from '../src/storage/storage.service.js';
import { QAAgent } from '../src/agents/qa-agent.js';
import { VietSuReelProps, ScriptDocument, ResearchDossier } from '@vietsu/shared';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import util from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = util.promisify(exec);

// Sleep helper
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('====================================================');
  console.log('  VIETSU AI STUDIO - PHASE 1 VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // Spin up test server on ephemeral port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  console.log(`[Test Server] Running on ${baseUrl}\n`);

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

  let testProjectId = '';

  try {
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
    await test('Provider Registry loads Mock Providers (0đ local mode)', async () => {
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

    // 3. Historical Research & Authenticity Schema
    await test('Historical Research & Authenticity (Bạch Đằng 938)', async () => {
      const registry = ProviderRegistry.getInstance();
      const dossier = await registry.getLLM().researchHistory(
        'Chiến thắng Bạch Đằng năm 938 của Ngô Quyền',
        'Thời kỳ Tự chủ & Tiền Ngô'
      );

      assert.ok(dossier.facts.length >= 2, 'Must have at least 2 verified facts');
      assert.strictEqual(dossier.isMockEngine, true, 'Dossier must be flagged as isMockEngine');

      const firstFact = dossier.facts[0];
      assert.ok(firstFact.citations.length >= 1, 'Fact must have verified citations');
      assert.strictEqual(firstFact.citations[0].sourceTitle, 'Đại Việt Sử Ký Toàn Thư');
      assert.strictEqual(firstFact.citations[0].isMockSource, true, 'Citation must be flagged as isMockSource');
      assert.strictEqual(firstFact.category, 'CONFIRMED_FACT');

      const hypoFact = dossier.facts.find((f) => f.category === 'HISTORICAL_HYPOTHESIS');
      assert.ok(hypoFact, 'Must categorize archaeological excavations as HISTORICAL_HYPOTHESIS');
    });

    // 4. Project Creation via HTTP API
    await test('POST /api/projects creates project in DRAFT state', async () => {
      const res = await fetch(`${baseUrl}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Đại thắng Bạch Đằng 938 - Ngô Quyền xưng Vương',
          description: 'Quy trình kiểm thử Phase 1 tự động sản xuất video Reels lịch sử Việt Nam',
          historicalEra: 'Thời kỳ Tự chủ & Tiền Ngô',
          targetDurationSec: 30
        })
      });

      assert.strictEqual(res.status, 201, 'Should return HTTP 201 Created');
      const body = await res.json();
      assert.ok(body.id, 'Project ID must be returned');
      assert.strictEqual(body.status, 'DRAFT');
      testProjectId = body.id;
    });

    // 5. State Guard Validation (Rejection on Invalid Status)
    await test('Approval endpoints reject requests when project status is invalid', async () => {
      // 5.1 Try to approve research on DRAFT -> must return 400
      const res1 = await fetch(`${baseUrl}/projects/${testProjectId}/pipeline/approve-research`, {
        method: 'POST'
      });
      assert.strictEqual(res1.status, 400, 'Should reject approve-research on DRAFT project');
      const body1 = await res1.json();
      assert.ok(body1.error.includes('RESEARCH_PENDING_APPROVAL'));

      // 5.2 Try to approve script on DRAFT -> must return 400
      const res2 = await fetch(`${baseUrl}/projects/${testProjectId}/pipeline/approve-script`, {
        method: 'POST'
      });
      assert.strictEqual(res2.status, 400, 'Should reject approve-script on DRAFT project');
      const body2 = await res2.json();
      assert.ok(body2.error.includes('SCRIPT_PENDING_APPROVAL'));

      // 5.3 Try to render on DRAFT -> must return 400
      const res3 = await fetch(`${baseUrl}/projects/${testProjectId}/render`, {
        method: 'POST'
      });
      assert.strictEqual(res3.status, 400, 'Should reject render on DRAFT project');
      const body3 = await res3.json();
      assert.ok(body3.error.includes('READY_TO_RENDER'));
    });

    // 6. Pipeline Step 1: Research Execution
    await test('POST /api/projects/:id/pipeline/start triggers Research Agent', async () => {
      const res = await fetch(`${baseUrl}/projects/${testProjectId}/pipeline/start`, {
        method: 'POST'
      });
      assert.strictEqual(res.status, 200, 'Should return HTTP 200');

      // Wait for background job to finish
      let attempts = 0;
      let project: any = null;
      while (attempts < 30) {
        await sleep(1000);
        project = await prisma.project.findUnique({
          where: { id: testProjectId },
          include: { researchItems: true, jobs: true }
        });
        if (project?.status === 'RESEARCH_PENDING_APPROVAL') break;
        attempts++;
      }

      assert.strictEqual(project?.status, 'RESEARCH_PENDING_APPROVAL');
      assert.ok(project.researchItems.length >= 2, 'Research items must be persisted in DB');
      // Assert that newly created research items have isApproved = false in DB
      for (const item of project.researchItems) {
        assert.strictEqual(item.isApproved, false, 'Research item isApproved must be initially false in DB');
      }
    });

    // 7. Concurrency Lock Guard
    await test('Concurrency lock: rejects duplicate job while one is running', async () => {
      // Create a temporary running job in DB to simulate an ongoing task
      const fakeJob = await prisma.job.create({
        data: {
          projectId: testProjectId,
          step: 'SIMULATED_TASK',
          status: 'RUNNING',
          progressPercent: 50,
          logs: JSON.stringify(['[SIMULATED] Ongoing background process'])
        }
      });

      try {
        const res = await fetch(`${baseUrl}/projects/${testProjectId}/pipeline/approve-research`, {
          method: 'POST'
        });
        assert.strictEqual(res.status, 409, 'Should return 409 Conflict when job is running');
        const body = await res.json();
        assert.ok(body.error.includes('đang xử lý') || body.error.includes('đang có một tác vụ'));
      } finally {
        // Clean up fake job
        await prisma.job.delete({ where: { id: fakeJob.id } });
      }
    });

    // 8. Pipeline Step 2: Approve Research & DB isApproved Synchronization
    await test('POST /api/projects/:id/pipeline/approve-research syncs DB isApproved', async () => {
      const res = await fetch(`${baseUrl}/projects/${testProjectId}/pipeline/approve-research`, {
        method: 'POST'
      });
      assert.strictEqual(res.status, 200, 'Should approve research');

      // Wait for scripting to finish
      let attempts = 0;
      let project: any = null;
      while (attempts < 30) {
        await sleep(1000);
        project = await prisma.project.findUnique({
          where: { id: testProjectId },
          include: { researchItems: true, script: true, scenes: true }
        });
        if (project?.status === 'SCRIPT_PENDING_APPROVAL') break;
        attempts++;
      }

      assert.strictEqual(project?.status, 'SCRIPT_PENDING_APPROVAL');
      
      // Verify all research items are now isApproved = true in DB
      for (const item of project.researchItems) {
        assert.strictEqual(item.isApproved, true, 'Research item must be marked isApproved = true in DB');
      }

      // Verify script document is generated with isApproved = false
      assert.ok(project.script, 'Script must exist');
      assert.strictEqual(project.script.isApproved, false, 'Script isApproved must be initially false in DB');
      assert.ok(project.scenes.length >= 4, 'Must generate at least 4 scenes');
    });

    // 9. Pipeline Step 3: Approve Script & Asset Generation + QA
    await test('POST /api/projects/:id/pipeline/approve-script syncs DB and runs QA', async () => {
      const res = await fetch(`${baseUrl}/projects/${testProjectId}/pipeline/approve-script`, {
        method: 'POST'
      });
      assert.strictEqual(res.status, 200, 'Should approve script');

      // Wait for Asset Generation + Editing + QA to finish -> READY_TO_RENDER
      let attempts = 0;
      let project: any = null;
      while (attempts < 45) {
        await sleep(1000);
        project = await prisma.project.findUnique({
          where: { id: testProjectId },
          include: { script: true, scenes: true, assets: true }
        });
        if (project?.status === 'READY_TO_RENDER') break;
        attempts++;
      }

      assert.strictEqual(project?.status, 'READY_TO_RENDER');
      assert.strictEqual(project.script.isApproved, true, 'Script must be marked isApproved = true in DB');
      assert.ok(project.assets.length >= 8, 'Must generate both visual and audio assets');

      // Verify scenes have kinetic subtitles and valid URLs
      const firstScene = project.scenes[0];
      assert.ok(firstScene.visualUrl, 'Scene must have visualUrl');
      assert.ok(firstScene.audioUrl, 'Scene must have audioUrl');
      assert.ok(firstScene.subtitles, 'Scene must have kinetic subtitles');
    });

    // 10. QA Agent Verification: Strict Auditing & Mock Fact Alert
    await test('QA Agent: verifies durations, safe-zone, subtitles & mock flag', async () => {
      const project = await prisma.project.findUnique({ where: { id: testProjectId } });
      assert.ok(project?.qaReport, 'QA Report must be present');

      const report = JSON.parse(project.qaReport);
      assert.strictEqual(report.isPassing, true, 'QA report isPassing must be true');
      assert.ok(report.qaScore >= 80, `QA Score (${report.qaScore}) must be >= 80`);
      assert.strictEqual(report.safeZoneCheckPassed, true, 'Safe zone check must pass');
      assert.ok(report.subtitleSyncScore >= 80, `Subtitle sync score (${report.subtitleSyncScore}) must be >= 80`);
      
      // CRITICAL REQUIREMENT: Mock sources must NOT be claimed as independently verified
      assert.strictEqual(
        report.isIndependentlyVerified,
        false,
        'QA report must explicitly set isIndependentlyVerified = false when mock sources are used'
      );
      assert.ok(
        report.warnings.some((w: string) => w.toUpperCase().includes('MOCK ENGINE')),
        'QA report must contain a warning regarding Mock Engine usage'
      );
    });

    // 11. Pipeline Step 4: Render Video MP4 via Remotion + FFmpeg
    let renderedVideoPath = '';
    await test('POST /api/projects/:id/render: exports 1080x1920 MP4 video', async () => {
      const res = await fetch(`${baseUrl}/projects/${testProjectId}/render`, {
        method: 'POST'
      });
      assert.strictEqual(res.status, 200, 'Should trigger render job');

      // Wait for rendering to complete (up to 300s on slower CI virtualized CPUs)
      let attempts = 0;
      let project: any = null;
      while (attempts < 200) {
        await sleep(1500);
        project = await prisma.project.findUnique({ where: { id: testProjectId } });
        if (project?.status === 'COMPLETED' || project?.status === 'FAILED') break;
        attempts++;
      }

      assert.strictEqual(project?.status, 'COMPLETED');
      assert.ok(project.renderedVideoUrl, 'renderedVideoUrl must be populated');

      const storage = StorageService.getInstance();
      const filename = path.basename(project.renderedVideoUrl);
      renderedVideoPath = path.join(storage.getVideosDir(), filename);

      assert.ok(fs.existsSync(renderedVideoPath), `Rendered video file must exist at ${renderedVideoPath}`);
      const stats = fs.statSync(renderedVideoPath);
      assert.ok(stats.size > 50000, `Video file size must be > 50KB (actual: ${stats.size} bytes)`);
    });

    // 12. Deep MP4 Inspection: Streams, Waveform Audio, Frame Snapshots, Black Screen Check
    await test('Deep MP4 inspection: H.264/AAC, 1080x1920 30fps, non-silent audio, non-black frames', async () => {
      assert.ok(renderedVideoPath && fs.existsSync(renderedVideoPath), 'Rendered video must exist');

      // 12.1 FFprobe JSON stream inspection
      const probeCmd = `ffprobe -v quiet -print_format json -show_streams -show_format "${renderedVideoPath}"`;
      const { stdout: probeStdout } = await execAsync(probeCmd);
      const probeData = JSON.parse(probeStdout);

      const videoStream = probeData.streams.find((s: any) => s.codec_type === 'video');
      const audioStream = probeData.streams.find((s: any) => s.codec_type === 'audio');

      assert.ok(videoStream, 'MP4 must contain a video stream');
      assert.ok(audioStream, 'MP4 must contain an audio stream');

      // Specs verification
      assert.strictEqual(videoStream.width, 1080, 'Video width must be 1080');
      assert.strictEqual(videoStream.height, 1920, 'Video height must be 1920 (Facebook Reels 9:16)');
      assert.strictEqual(videoStream.codec_name, 'h264', 'Video codec must be H.264');
      assert.strictEqual(audioStream.codec_name, 'aac', 'Audio codec must be AAC');
      assert.ok(videoStream.r_frame_rate === '30/1' || videoStream.avg_frame_rate === '30/1', 'Framerate must be 30fps');

      // 12.2 Audio Volume Inspection (Ensure audio is active and non-silent)
      const volCmd = `ffmpeg -i "${renderedVideoPath}" -af "volumedetect" -f null -`;
      const { stderr: volStderr } = await execAsync(volCmd);
      const maxVolMatch = volStderr.match(/max_volume:\s*(-?[\d.]+)\s*dB/);
      assert.ok(maxVolMatch, 'Should measure max_volume from audio stream');
      const maxVolume = parseFloat(maxVolMatch[1]);
      console.log(`\n     [Audio Waveform] Detected max_volume: ${maxVolume} dB`);
      assert.ok(maxVolume > -60.0, `Audio volume (${maxVolume} dB) indicates sound is present and not silent`);

      // 12.3 Black Screen Detection (Ensure frames are rendered with visible visuals/subtitles)
      const blackCmd = `ffmpeg -i "${renderedVideoPath}" -vf "blackdetect=d=0.5:pix_th=0.10" -f null -`;
      const { stderr: blackStderr } = await execAsync(blackCmd);
      // Ensure the whole video is not detected as 100% black
      const duration = parseFloat(probeData.format.duration || '0');
      if (blackStderr.includes('black_duration:')) {
        const blackDurMatch = blackStderr.match(/black_duration:\s*([\d.]+)/);
        if (blackDurMatch) {
          const blackDuration = parseFloat(blackDurMatch[1]);
          assert.ok(blackDuration < duration * 0.8, 'Video must not be predominantly black screen');
        }
      }

      // 12.4 Frame Snapshot Extraction (visual verification of subtitle & artwork rendering)
      const storage = StorageService.getInstance();
      const snapshotPath = path.join(storage.getTempDir(), `snapshot_${Date.now()}.png`);
      const snapshotCmd = `ffmpeg -y -ss 00:00:01.000 -i "${renderedVideoPath}" -vframes 1 "${snapshotPath}"`;
      await execAsync(snapshotCmd);
      assert.ok(fs.existsSync(snapshotPath), 'Snapshot image must be generated');
      const snapStats = fs.statSync(snapshotPath);
      assert.ok(snapStats.size > 20000, `Snapshot image size (${snapStats.size} bytes) confirms rendered visual content`);
      console.log(`     [Visual Snapshot] Successfully extracted 1080x1920 PNG frame (${snapStats.size} bytes)`);
    });

    // 13. Job Recovery Service & Retry Mechanism
    await test('Job Recovery Service: heals dangling jobs after server crash & retry restarts', async () => {
      // 13.1 Simulate dangling RUNNING job
      const crashedJob = await prisma.job.create({
        data: {
          projectId: testProjectId,
          step: 'RENDERING',
          status: 'RUNNING',
          progressPercent: 40,
          logs: JSON.stringify(['[CRASH_TEST] Simulated task before server terminated']),
          startedAt: new Date(Date.now() - 60000)
        }
      });

      await prisma.project.update({
        where: { id: testProjectId },
        data: { status: 'RENDERING' }
      });

      // 13.2 Execute recovery service (as happens during backend startup)
      const recoveredCount = await JobRecoveryService.recoverDanglingJobs();
      assert.ok(recoveredCount >= 1, 'Should recover at least 1 dangling job');

      const recoveredJob = await prisma.job.findUnique({ where: { id: crashedJob.id } });
      assert.strictEqual(recoveredJob?.status, 'FAILED', 'Dangling job must be marked FAILED');
      assert.ok(recoveredJob?.error?.includes('Server restart'), 'Job error must record server restart');

      const recoveredProject = await prisma.project.findUnique({ where: { id: testProjectId } });
      assert.strictEqual(recoveredProject?.status, 'FAILED', 'Project status must be FAILED after recovery');

      // 13.3 Test Retry endpoint (POST /api/projects/:id/pipeline/retry)
      const retryRes = await fetch(`${baseUrl}/projects/${testProjectId}/pipeline/retry`, {
        method: 'POST'
      });
      assert.strictEqual(retryRes.status, 200, 'Retry endpoint must return 200 OK');

      // Wait a moment for retry to execute
      await sleep(1500);
      const retriedJob = await prisma.job.findUnique({ where: { id: crashedJob.id } });
      assert.ok((retriedJob?.retryCount || 0) >= 1, 'Job retryCount must be incremented');
    });

    // 14. Concurrency Guard: Prevents race conditions on simultaneous pipeline start requests
    await test('Concurrency Guard: exactly 1 of 5 simultaneous start requests succeeds (409 Conflict for 4)', async () => {
      const concurrentProject = await prisma.project.create({
        data: {
          title: 'Dự án Đua Lệnh Concurrency Test',
          historicalEra: 'Thời kỳ Tiền Ngô',
          status: 'DRAFT',
          targetDurationSec: 45
        }
      });

      // Fire 5 simultaneous requests to start pipeline
      const requests = Array.from({ length: 5 }, () =>
        fetch(`${baseUrl}/projects/${concurrentProject.id}/pipeline/start`, {
          method: 'POST'
        })
      );

      const responses = await Promise.all(requests);
      const statusCodes = responses.map((r) => r.status);
      const count200 = statusCodes.filter((s) => s === 200).length;
      const count409 = statusCodes.filter((s) => s === 409).length;

      assert.strictEqual(count200, 1, `Exactly one concurrent request must succeed with 200 (actual: ${count200})`);
      assert.strictEqual(count409, 4, `Exactly 4 concurrent requests must be rejected with 409 Conflict (actual: ${count409})`);

      // Allow background job to initiate and assert only 1 job was created
      await sleep(1000);
      const jobs = await prisma.job.findMany({ where: { projectId: concurrentProject.id } });
      assert.strictEqual(jobs.length, 1, 'Exactly one job must be created in the database');
    });

    // 15. JobRecoveryService Idempotency & State Consistency
    await test('JobRecoveryService: Idempotency verification (repeated recovery returns 0 dangling jobs)', async () => {
      const danglingProj = await prisma.project.create({
        data: {
          title: 'Dự án Treo Sau Crash Test',
          historicalEra: 'Thời kỳ Nhà Trần',
          status: 'SCRIPTING',
          targetDurationSec: 45
        }
      });

      const danglingJob = await prisma.job.create({
        data: {
          projectId: danglingProj.id,
          step: 'SCRIPTING',
          status: 'RUNNING',
          progressPercent: 50,
          logs: JSON.stringify(['Task running before unexpected termination']),
          startedAt: new Date()
        }
      });

      // First recovery run
      const recoveredFirst = await JobRecoveryService.recoverDanglingJobs();
      assert.ok(recoveredFirst >= 1, 'First run must recover the dangling job');

      const checkProj = await prisma.project.findUnique({ where: { id: danglingProj.id } });
      assert.strictEqual(checkProj?.status, 'FAILED', 'Project must be in FAILED status');

      const checkJob = await prisma.job.findUnique({ where: { id: danglingJob.id } });
      assert.strictEqual(checkJob?.status, 'FAILED', 'Job must be in FAILED status');

      // Second recovery run immediately after
      const recoveredSecond = await JobRecoveryService.recoverDanglingJobs();
      assert.strictEqual(recoveredSecond, 0, 'Second run must recover 0 jobs (idempotent)');
    });

    // 16. QA Agent Epistemic Rigor: isIndependentlyVerified logic
    await test('QA Agent: isIndependentlyVerified requires explicit attested evidence, not merely lack of mock flag', async () => {
      const qaAgent = new QAAgent();

      const sampleReelProps: VietSuReelProps = {
        projectId: 'test-proj',
        title: 'Bạch Đằng',
        historicalEra: 'Thời kỳ Tiền Ngô',
        fps: 30,
        width: 1080,
        height: 1920,
        bgmVolume: 0.25,
        scenes: [
          {
            sceneNumber: 1,
            visualUrl: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
            audioUrl: 'data:audio/wav;base64,UklGRg==',
            durationInFrames: 180,
            cameraMotion: 'ZOOM_IN',
            subtitles: [
              { word: 'Chiến', start: 0.2, end: 0.6 },
              { word: 'thắng', start: 0.7, end: 1.1 },
              { word: 'Bạch', start: 1.2, end: 1.6 },
              { word: 'Đằng', start: 1.7, end: 5.2 }
            ],
            subtitleLayout: { bottomPx: 280, maxWidthPx: 900, maxWordsPerChunk: 6 }
          }
        ]
      };

      const sampleScript: ScriptDocument = {
        title: 'Bạch Đằng',
        hook: 'Sông Bạch Đằng cuộn sóng ngàn thu oanh liệt hào hùng',
        context: 'Năm 938 quân Nam Hán kéo sang xâm lược nước ta',
        climax: 'Ngô Quyền đóng cọc nhọn tiêu diệt toàn bộ thủy quân giặc',
        resolutionAndCta: 'Mở ra kỷ nguyên độc lập tự chủ lâu dài cho dân tộc',
        fullNarrative: 'Sông Bạch Đằng cuộn sóng ngàn thu oanh liệt hào hùng. Năm 938 quân Nam Hán xâm lược nước ta. Ngô Quyền đóng cọc nhọn tiêu diệt toàn bộ thủy quân giặc.',
        totalWords: 35,
        estimatedTotalDurationSec: 6,
        isApproved: true,
        scenes: []
      };

      // Case A: Mock engine flagged dossier -> must be false
      const mockDossier: ResearchDossier = {
        topic: 'Bạch Đằng',
        historicalEra: 'Thời kỳ Tiền Ngô',
        summary: 'Tóm tắt chiến thắng Bạch Đằng năm 938',
        verifiedAt: new Date().toISOString(),
        isApproved: true,
        isMockEngine: true,
        facts: [
          {
            id: 'f1',
            category: 'CONFIRMED_FACT',
            factSummary: 'Chiến thắng Bạch Đằng diễn ra năm 938',
            yearOrEra: '938',
            keyFigures: ['Ngô Quyền'],
            location: 'Sông Bạch Đằng',
            citations: [
              {
                id: 'c1',
                sourceTitle: 'Đại Việt Sử Ký Toàn Thư',
                author: 'Ngô Sĩ Liên',
                volumeOrChapter: 'Quyển 5',
                quoteExcerpt: 'Ngô Quyền dùng cọc gỗ nhọn đóng dưới lòng sông',
                isMockSource: true
              }
            ]
          }
        ]
      };
      const reportMock = qaAgent.execute(sampleReelProps, sampleScript, mockDossier);
      assert.strictEqual(reportMock.isIndependentlyVerified, false, 'Mock dossier must NOT be independently verified');
      assert.ok(reportMock.warnings.some((w) => w.includes('[MOCK ENGINE]')));

      // Case B: Non-mock dossier but citation has NO verification evidence -> must be false
      const unverifiedAiDossier: ResearchDossier = {
        ...mockDossier,
        isMockEngine: false,
        facts: [
          {
            ...mockDossier.facts[0],
            citations: [
              {
                id: 'c2',
                sourceTitle: 'Tài liệu trôi nổi trên mạng',
                author: 'Khuyết danh',
                volumeOrChapter: 'Chương 1',
                quoteExcerpt: 'Dữ liệu chưa qua kiểm chứng học thuật',
                isMockSource: false,
                isIndependentlyVerified: false
              }
            ]
          }
        ]
      };
      const reportUnverified = qaAgent.execute(sampleReelProps, sampleScript, unverifiedAiDossier);
      assert.strictEqual(reportUnverified.isIndependentlyVerified, false, 'Unattested citation must NOT be independently verified');
      assert.ok(reportUnverified.warnings.some((w) => w.includes('[CHƯA KIỂM ĐỊNH ĐỘC LẬP]')));

      // Case C: Attested citation with explicit verification evidence -> must be true
      const attestedDossier: ResearchDossier = {
        ...mockDossier,
        isMockEngine: false,
        facts: [
          {
            ...mockDossier.facts[0],
            citations: [
              {
                id: 'c3',
                sourceTitle: 'Đại Việt Sử Ký Toàn Thư',
                author: 'Ngô Sĩ Liên',
                volumeOrChapter: 'Quyển 5 - Kỷ Nhà Ngô',
                quoteExcerpt: 'Ngô Quyền dùng cọc vạt nhọn bịt sắt cắm ngầm ở cửa biển',
                isMockSource: false,
                isIndependentlyVerified: true,
                verificationEvidence: 'Đối chiếu với bản khắc gỗ mộc bản Triều Nguyễn và di chỉ bãi cọc Yên Giang'
              }
            ]
          }
        ]
      };
      const reportAttested = qaAgent.execute(sampleReelProps, sampleScript, attestedDossier);
      assert.strictEqual(reportAttested.isIndependentlyVerified, true, 'Attested citation with evidence must be independently verified');
    });

    // 17. QA Agent Safe-Zone Geometric Validation
    await test('QA Agent: Safe-Zone geometry detects margin violations (< 260px from bottom, > 900px width, > 8 words/chunk)', async () => {
      const qaAgent = new QAAgent();

      const baseReelProps: VietSuReelProps = {
        projectId: 'sz-test',
        title: 'Safe Zone Test',
        historicalEra: 'Thời kỳ Tiền Ngô',
        fps: 30,
        width: 1080,
        height: 1920,
        bgmVolume: 0.25,
        scenes: []
      };

      const baseScript: ScriptDocument = {
        title: 'Safe Zone Test',
        hook: 'Khám phá trận địa cọc ngầm oanh liệt trên sông Bạch Đằng',
        context: 'Năm 938 quân giặc tiến vào cửa sông hiểm trở',
        climax: 'Đoàn thuyền giặc vỡ toác trước bãi cọc nhọn',
        resolutionAndCta: 'Chiến thắng vẻ vang ngàn năm rạng rỡ non sông',
        fullNarrative: 'Khám phá trận địa cọc ngầm oanh liệt trên sông Bạch Đằng. Năm 938 quân giặc tiến vào cửa sông hiểm trở. Đoàn thuyền giặc vỡ toác trước bãi cọc nhọn.',
        totalWords: 35,
        estimatedTotalDurationSec: 6,
        isApproved: true,
        scenes: []
      };

      const validDossier: ResearchDossier = {
        topic: 'Safe Zone Test',
        historicalEra: 'Thời kỳ Tiền Ngô',
        summary: 'Kiểm tra safe zone',
        verifiedAt: new Date().toISOString(),
        isApproved: true,
        isMockEngine: true,
        facts: [
          {
            id: 'f1',
            category: 'CONFIRMED_FACT',
            factSummary: 'Trận Bạch Đằng',
            yearOrEra: '938',
            keyFigures: ['Ngô Quyền'],
            location: 'Bạch Đằng',
            citations: [
              {
                id: 'c1',
                sourceTitle: 'Sử Ký',
                author: 'Sử gia',
                volumeOrChapter: 'Q1',
                quoteExcerpt: 'Trích dẫn',
                isMockSource: true
              }
            ]
          }
        ]
      };

      // 17.1 Violation: bottomPx = 150 (< 260px)
      const propsBottomViolation: VietSuReelProps = {
        ...baseReelProps,
        scenes: [
          {
            sceneNumber: 1,
            visualUrl: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
            audioUrl: 'data:audio/wav;base64,UklGRg==',
            durationInFrames: 180,
            cameraMotion: 'ZOOM_IN',
            subtitles: [{ word: 'Test', start: 0.2, end: 5.0 }],
            subtitleLayout: { bottomPx: 150, maxWidthPx: 900, maxWordsPerChunk: 6 }
          }
        ]
      };
      const repBottom = qaAgent.execute(propsBottomViolation, baseScript, validDossier);
      assert.strictEqual(repBottom.safeZoneCheckPassed, false, 'bottomPx < 260 must fail safe-zone');
      assert.ok(repBottom.warnings.some((w) => w.includes('vi phạm vùng an toàn')));

      // 17.2 Violation: maxWidthPx = 980 (> 900px)
      const propsWidthViolation: VietSuReelProps = {
        ...baseReelProps,
        scenes: [
          {
            ...propsBottomViolation.scenes[0],
            subtitleLayout: { bottomPx: 280, maxWidthPx: 980, maxWordsPerChunk: 6 }
          }
        ]
      };
      const repWidth = qaAgent.execute(propsWidthViolation, baseScript, validDossier);
      assert.strictEqual(repWidth.safeZoneCheckPassed, false, 'maxWidthPx > 900 must fail safe-zone');
      assert.ok(repWidth.warnings.some((w) => w.includes('vượt quá 900px')));

      // 17.3 Violation: maxWordsPerChunk = 12 (> 8 words)
      const propsChunkViolation: VietSuReelProps = {
        ...baseReelProps,
        scenes: [
          {
            ...propsBottomViolation.scenes[0],
            subtitleLayout: { bottomPx: 280, maxWidthPx: 900, maxWordsPerChunk: 12 }
          }
        ]
      };
      const repChunk = qaAgent.execute(propsChunkViolation, baseScript, validDossier);
      assert.strictEqual(repChunk.safeZoneCheckPassed, false, 'maxWordsPerChunk > 8 must fail safe-zone');
      assert.ok(repChunk.warnings.some((w) => w.includes('vượt quá giới hạn 8 từ')));

      // 17.4 Valid Layout: bottomPx = 280, maxWidthPx = 900, maxWordsPerChunk = 6
      const propsValid: VietSuReelProps = {
        ...baseReelProps,
        scenes: [
          {
            ...propsBottomViolation.scenes[0],
            subtitleLayout: { bottomPx: 280, maxWidthPx: 900, maxWordsPerChunk: 6 }
          }
        ]
      };
      const repValid = qaAgent.execute(propsValid, baseScript, validDossier);
      assert.strictEqual(repValid.safeZoneCheckPassed, true, 'Standard safe layout must pass safe-zone');
    });

    // 18. Decoupled Subtitle Checks: Syntax validity vs Audio Duration Alignment
    await test('QA Agent: Distinguishes between subtitle timestamp syntax and audio duration alignment', async () => {
      const qaAgent = new QAAgent();

      const baseReelProps: VietSuReelProps = {
        projectId: 'sync-test',
        title: 'Sync Test',
        historicalEra: 'Thời kỳ Tiền Ngô',
        fps: 30,
        width: 1080,
        height: 1920,
        bgmVolume: 0.25,
        scenes: []
      };

      const baseScript: ScriptDocument = {
        title: 'Sync Test',
        hook: 'Hào khí non sông cuộn trào muôn thuở oai hùng',
        context: 'Ngô Quyền bày trận đón giặc Nam Hán trên dòng Bạch Đằng',
        climax: 'Thủy triều rút nhanh cọc nhọn nhô lên đâm thủng thuyền giặc',
        resolutionAndCta: 'Non sông nối lại bờ cõi nghìn năm vững bền muôn đời',
        fullNarrative: 'Hào khí non sông cuộn trào muôn thuở oai hùng. Ngô Quyền bày trận đón giặc trên dòng Bạch Đằng. Thủy triều rút nhanh cọc nhọn nhô lên đâm thủng thuyền giặc.',
        totalWords: 35,
        estimatedTotalDurationSec: 6,
        isApproved: true,
        scenes: []
      };

      const baseDossier: ResearchDossier = {
        topic: 'Sync Test',
        historicalEra: 'Thời kỳ Tiền Ngô',
        summary: 'Kiểm tra sync',
        verifiedAt: new Date().toISOString(),
        isApproved: true,
        isMockEngine: true,
        facts: [
          {
            id: 'f1',
            category: 'CONFIRMED_FACT',
            factSummary: 'Chiến thắng 938',
            yearOrEra: '938',
            keyFigures: ['Ngô Quyền'],
            location: 'Bạch Đằng',
            citations: [
              {
                id: 'c1',
                sourceTitle: 'Sử Ký',
                author: 'Sử gia',
                volumeOrChapter: 'Q1',
                quoteExcerpt: 'Trích dẫn xác minh',
                isMockSource: true
              }
            ]
          }
        ]
      };

      // 18.1 Subtitles end prematurely (at 1.0s in a 6.0s / 180 frames scene)
      // Syntax is completely valid, but audio duration alignment must fail!
      const prematureProps: VietSuReelProps = {
        ...baseReelProps,
        scenes: [
          {
            sceneNumber: 1,
            visualUrl: 'data:image/svg+xml;base64,PHN2Zz4=',
            audioUrl: 'data:audio/wav;base64,UklGRg==',
            durationInFrames: 180, // 6.0 seconds
            cameraMotion: 'STATIC',
            subtitles: [
              { word: 'Chiến', start: 0.1, end: 0.5 },
              { word: 'thắng', start: 0.6, end: 1.0 } // ends at 1.0s << 6.0s
            ],
            subtitleLayout: { bottomPx: 280, maxWidthPx: 900, maxWordsPerChunk: 6 }
          }
        ]
      };
      const repPremature = qaAgent.execute(prematureProps, baseScript, baseDossier);
      assert.strictEqual(repPremature.detailedChecks['subtitle_timestamps_syntax_valid'], true, 'Timestamps are syntactically valid');
      assert.strictEqual(repPremature.detailedChecks['audio_subtitle_duration_aligned'], false, 'Premature ending must fail duration alignment');
      assert.ok(repPremature.warnings.some((w) => w.includes('Phụ đề kết thúc quá sớm')));

      // 18.2 Subtitle timestamps reversed (start goes backward: 1.0s -> 0.5s)
      // Syntax must fail!
      const syntaxErrorProps: VietSuReelProps = {
        ...baseReelProps,
        scenes: [
          {
            sceneNumber: 1,
            visualUrl: 'data:image/svg+xml;base64,PHN2Zz4=',
            audioUrl: 'data:audio/wav;base64,UklGRg==',
            durationInFrames: 180,
            cameraMotion: 'STATIC',
            subtitles: [
              { word: 'Chiến', start: 1.0, end: 1.5 },
              { word: 'thắng', start: 0.5, end: 0.9 } // backward start!
            ],
            subtitleLayout: { bottomPx: 280, maxWidthPx: 900, maxWordsPerChunk: 6 }
          }
        ]
      };
      const repSyntax = qaAgent.execute(syntaxErrorProps, baseScript, baseDossier);
      assert.strictEqual(repSyntax.detailedChecks['subtitle_timestamps_syntax_valid'], false, 'Reversed timestamps must fail syntax');
      assert.ok(repSyntax.warnings.some((w) => w.includes('bị lùi ngược')));

      // 18.3 Both syntax and alignment pass cleanly
      const wellAlignedProps: VietSuReelProps = {
        ...baseReelProps,
        scenes: [
          {
            sceneNumber: 1,
            visualUrl: 'data:image/svg+xml;base64,PHN2Zz4=',
            audioUrl: 'data:audio/wav;base64,UklGRg==',
            durationInFrames: 180, // 6.0 seconds
            cameraMotion: 'STATIC',
            subtitles: [
              { word: 'Sông', start: 0.2, end: 0.7 },
              { word: 'Bạch', start: 0.8, end: 1.3 },
              { word: 'Đằng', start: 1.4, end: 2.0 },
              { word: 'dậy', start: 2.1, end: 2.8 },
              { word: 'sóng', start: 2.9, end: 5.3 } // ends at 5.3s (~88% of 6.0s scene)
            ],
            subtitleLayout: { bottomPx: 280, maxWidthPx: 900, maxWordsPerChunk: 6 }
          }
        ]
      };
      const repAligned = qaAgent.execute(wellAlignedProps, baseScript, baseDossier);
      assert.strictEqual(repAligned.detailedChecks['subtitle_timestamps_syntax_valid'], true);
      assert.strictEqual(repAligned.detailedChecks['audio_subtitle_duration_aligned'], true);
      assert.strictEqual(repAligned.detailedChecks['audio_video_sync'], true);
    });

  } finally {
    // Teardown
    await new Promise<void>((resolve) => server.close(() => resolve()));
    console.log('[Test Server] Stopped cleanly.');
  }

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
