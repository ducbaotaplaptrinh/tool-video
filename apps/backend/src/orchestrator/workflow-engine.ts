import { prisma } from '../db.js';
import { ResearchAgent } from '../agents/research-agent.js';
import { ScriptAgent } from '../agents/script-agent.js';
import { VisualAgent } from '../agents/visual-agent.js';
import { VoiceAgent } from '../agents/voice-agent.js';
import { EditorAgent } from '../agents/editor-agent.js';
import { QAAgent } from '../agents/qa-agent.js';
import { ProviderRegistry } from '@vietsu/ai-providers';
import { ResearchDossier, ScriptDocument, RemotionSceneProps } from '@vietsu/shared';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import { StorageService } from '../storage/storage.service.js';

const execAsync = util.promisify(exec);

export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private researchAgent = new ResearchAgent();
  private scriptAgent = new ScriptAgent();
  private visualAgent = new VisualAgent();
  private voiceAgent = new VoiceAgent();
  private editorAgent = new EditorAgent();
  private qaAgent = new QAAgent();

  private constructor() {}

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  private async createJob(projectId: string, step: string) {
    return prisma.job.create({
      data: {
        projectId,
        step,
        status: 'RUNNING',
        progressPercent: 10,
        logs: JSON.stringify([`[${new Date().toISOString()}] Bắt đầu tiến trình ${step}`]),
        startedAt: new Date()
      }
    });
  }

  private async updateJobLog(jobId: string, logMsg: string, progress: number) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return;
    const logs: string[] = JSON.parse(job.logs || '[]');
    logs.push(`[${new Date().toISOString()}] ${logMsg}`);
    await prisma.job.update({
      where: { id: jobId },
      data: {
        progressPercent: progress,
        logs: JSON.stringify(logs)
      }
    });
  }

  private async completeJob(jobId: string, logMsg: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return;
    const logs: string[] = JSON.parse(job.logs || '[]');
    logs.push(`[${new Date().toISOString()}] ${logMsg}`);
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        progressPercent: 100,
        logs: JSON.stringify(logs),
        completedAt: new Date()
      }
    });
  }

  private async failJob(jobId: string, errorMsg: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return;
    const logs: string[] = JSON.parse(job.logs || '[]');
    logs.push(`[${new Date().toISOString()}] LỖI: ${errorMsg}`);
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        error: errorMsg,
        logs: JSON.stringify(logs),
        completedAt: new Date()
      }
    });
  }

  // 1. Step: Research
  public async startPipeline(projectId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error('Không tìm thấy dự án');

    const job = await this.createJob(projectId, 'RESEARCH');
    try {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'RESEARCHING' }
      });

      await this.updateJobLog(job.id, 'Đang thẩm định sử liệu với Research Agent...', 30);
      const dossier = await this.researchAgent.execute(project.title, project.historicalEra);

      await this.updateJobLog(job.id, `Trích xuất ${dossier.facts.length} dữ kiện lịch sử có nguồn chứng thực`, 60);

      // Save research items to DB
      await prisma.researchItem.deleteMany({ where: { projectId } });
      for (const fact of dossier.facts) {
        await prisma.researchItem.create({
          data: {
            projectId,
            category: fact.category,
            factSummary: fact.factSummary,
            yearOrEra: fact.yearOrEra,
            keyFigures: JSON.stringify(fact.keyFigures),
            location: fact.location,
            citations: JSON.stringify(fact.citations)
          }
        });
      }

      // Record Cost Log
      const registry = ProviderRegistry.getInstance();
      const costRecord = registry.getLLM().estimateCost(1200, 'LLM_RESEARCH');
      await prisma.costLog.create({
        data: {
          projectId,
          provider: costRecord.provider,
          service: costRecord.service,
          unitsUsed: costRecord.unitsUsed,
          unitType: costRecord.unitType,
          estimatedCostUSD: costRecord.estimatedCostUSD,
          estimatedCostVND: costRecord.estimatedCostVND
        }
      });

      // Advance to approval gate
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'RESEARCH_PENDING_APPROVAL' }
      });

      await this.completeJob(job.id, 'Hoàn thành nghiên cứu. Đang chờ phê duyệt từ người dùng.');
    } catch (err: any) {
      await this.failJob(job.id, err.message);
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'FAILED' }
      });
      throw err;
    }
  }

  // 2. Step: Approve Research & Run Scripting
  public async approveResearch(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { researchItems: true }
    });
    if (!project) throw new Error('Không tìm thấy dự án');

    const job = await this.createJob(projectId, 'SCRIPTING');
    try {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'SCRIPTING' }
      });

      await this.updateJobLog(job.id, 'Chuyển sang bước Script Agent biên kịch...', 25);

      const dossier: ResearchDossier = {
        topic: project.title,
        historicalEra: project.historicalEra,
        summary: project.description || project.title,
        verifiedAt: new Date().toISOString(),
        isApproved: true,
        facts: project.researchItems.map(item => ({
          id: item.id,
          category: item.category as any,
          factSummary: item.factSummary,
          yearOrEra: item.yearOrEra,
          keyFigures: JSON.parse(item.keyFigures),
          location: item.location,
          citations: JSON.parse(item.citations)
        }))
      };

      const scriptDoc = await this.scriptAgent.execute(dossier);

      // Save script to DB
      await prisma.script.upsert({
        where: { projectId },
        create: {
          projectId,
          title: scriptDoc.title,
          hook: scriptDoc.hook,
          context: scriptDoc.context,
          climax: scriptDoc.climax,
          resolutionAndCta: scriptDoc.resolutionAndCta,
          fullNarrative: scriptDoc.fullNarrative,
          totalWords: scriptDoc.totalWords,
          estimatedTotalDurationSec: scriptDoc.estimatedTotalDurationSec,
          isApproved: false
        },
        update: {
          title: scriptDoc.title,
          hook: scriptDoc.hook,
          context: scriptDoc.context,
          climax: scriptDoc.climax,
          resolutionAndCta: scriptDoc.resolutionAndCta,
          fullNarrative: scriptDoc.fullNarrative,
          totalWords: scriptDoc.totalWords,
          estimatedTotalDurationSec: scriptDoc.estimatedTotalDurationSec,
          isApproved: false
        }
      });

      // Save scene drafts
      await prisma.scene.deleteMany({ where: { projectId } });
      for (const scene of scriptDoc.scenes) {
        await prisma.scene.create({
          data: {
            projectId,
            sceneNumber: scene.sceneNumber,
            title: scene.title,
            narrativeText: scene.narrativeText,
            wordCount: scene.wordCount,
            estimatedDurationSec: scene.estimatedDurationSec,
            visualPrompt: scene.visualPrompt,
            cameraMotion: scene.cameraMotion
          }
        });
      }

      // Record cost
      const registry = ProviderRegistry.getInstance();
      const costRecord = registry.getLLM().estimateCost(950, 'LLM_SCRIPT');
      await prisma.costLog.create({
        data: {
          projectId,
          provider: costRecord.provider,
          service: costRecord.service,
          unitsUsed: costRecord.unitsUsed,
          unitType: costRecord.unitType,
          estimatedCostUSD: costRecord.estimatedCostUSD,
          estimatedCostVND: costRecord.estimatedCostVND
        }
      });

      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'SCRIPT_PENDING_APPROVAL' }
      });

      await this.completeJob(job.id, 'Đã hoàn tất kịch bản và phân rã các cảnh. Chờ phê duyệt.');
    } catch (err: any) {
      await this.failJob(job.id, err.message);
      throw err;
    }
  }

  // 3. Step: Approve Script & Generate Assets (Images & Audio)
  public async approveScript(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { script: true, scenes: { orderBy: { sceneNumber: 'asc' } }, researchItems: true }
    });
    if (!project || !project.script) throw new Error('Dự án chưa có kịch bản');

    const job = await this.createJob(projectId, 'ASSET_GENERATION');
    try {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'GENERATING_ASSETS' }
      });

      await this.updateJobLog(job.id, 'Đang sinh ảnh minh họa và giọng thuyết minh tiếng Việt...', 20);

      const sceneDrafts = project.scenes.map(s => ({
        sceneNumber: s.sceneNumber,
        title: s.title,
        narrativeText: s.narrativeText,
        wordCount: s.wordCount,
        estimatedDurationSec: s.estimatedDurationSec,
        visualPrompt: s.visualPrompt,
        cameraMotion: s.cameraMotion as any,
        factIds: []
      }));

      // Generate Visuals & Audio in parallel
      const [visuals, audios] = await Promise.all([
        this.visualAgent.execute(sceneDrafts, project.title, project.historicalEra),
        this.voiceAgent.execute(sceneDrafts)
      ]);

      await this.updateJobLog(job.id, `Đã tạo ${visuals.length} ảnh và ${audios.length} tệp âm thanh`, 60);

      // Save media assets and update scenes
      for (let i = 0; i < project.scenes.length; i++) {
        const sc = project.scenes[i];
        const visual = visuals.find(v => v.sceneNumber === sc.sceneNumber) || visuals[i];
        const audio = audios.find(a => a.sceneNumber === sc.sceneNumber) || audios[i];

        await prisma.mediaAsset.create({
          data: {
            projectId,
            sceneNumber: sc.sceneNumber,
            assetType: 'IMAGE',
            url: visual.url,
            localPath: visual.localPath,
            mimeType: 'image/svg+xml'
          }
        });

        await prisma.mediaAsset.create({
          data: {
            projectId,
            sceneNumber: sc.sceneNumber,
            assetType: 'AUDIO',
            url: audio.audioUrl,
            localPath: audio.localPath,
            mimeType: 'audio/wav'
          }
        });

        const durationInFrames = Math.max(30, Math.round(audio.durationSec * 30));

        await prisma.scene.update({
          where: { id: sc.id },
          data: {
            visualUrl: visual.url,
            audioUrl: audio.audioUrl,
            durationInFrames,
            subtitles: JSON.stringify(audio.wordTimestamps)
          }
        });
      }

      // Record costs
      const registry = ProviderRegistry.getInstance();
      const imgCost = registry.getImage().estimateCost(visuals.length);
      const totalAudioSec = audios.reduce((sum, a) => sum + a.durationSec, 0);
      const ttsCost = registry.getTTS().estimateCost(totalAudioSec);

      await prisma.costLog.createMany({
        data: [
          {
            projectId,
            provider: imgCost.provider,
            service: imgCost.service,
            unitsUsed: imgCost.unitsUsed,
            unitType: imgCost.unitType,
            estimatedCostUSD: imgCost.estimatedCostUSD,
            estimatedCostVND: imgCost.estimatedCostVND
          },
          {
            projectId,
            provider: ttsCost.provider,
            service: ttsCost.service,
            unitsUsed: ttsCost.unitsUsed,
            unitType: ttsCost.unitType,
            estimatedCostUSD: ttsCost.estimatedCostUSD,
            estimatedCostVND: ttsCost.estimatedCostVND
          }
        ]
      });

      await this.completeJob(job.id, 'Tài nguyên âm thanh & hình ảnh đã sẵn sàng!');

      // Run Editor & QA
      await this.runEditingAndQA(projectId, visuals, audios);
    } catch (err: any) {
      await this.failJob(job.id, err.message);
      throw err;
    }
  }

  // 4. Step: Editing & QA
  private async runEditingAndQA(projectId: string, visuals: any[], audios: any[]) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { script: true, scenes: { orderBy: { sceneNumber: 'asc' } }, researchItems: true }
    });
    if (!project || !project.script) return;

    const job = await this.createJob(projectId, 'EDITING_AND_QA');
    try {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'EDITING' }
      });

      await this.updateJobLog(job.id, 'Editor Agent đang lắp ráp Timeline và phụ đề động...', 30);

      const dossier: ResearchDossier = {
        topic: project.title,
        historicalEra: project.historicalEra,
        summary: project.description || project.title,
        verifiedAt: new Date().toISOString(),
        isApproved: true,
        facts: project.researchItems.map(item => ({
          id: item.id,
          category: item.category as any,
          factSummary: item.factSummary,
          yearOrEra: item.yearOrEra,
          keyFigures: JSON.parse(item.keyFigures),
          location: item.location,
          citations: JSON.parse(item.citations)
        }))
      };

      const scriptDoc: ScriptDocument = {
        title: project.script.title,
        hook: project.script.hook,
        context: project.script.context,
        climax: project.script.climax,
        resolutionAndCta: project.script.resolutionAndCta,
        fullNarrative: project.script.fullNarrative,
        totalWords: project.script.totalWords,
        estimatedTotalDurationSec: project.script.estimatedTotalDurationSec,
        isApproved: true,
        scenes: project.scenes.map(s => ({
          sceneNumber: s.sceneNumber,
          title: s.title,
          narrativeText: s.narrativeText,
          wordCount: s.wordCount,
          estimatedDurationSec: s.estimatedDurationSec,
          visualPrompt: s.visualPrompt,
          cameraMotion: s.cameraMotion as any,
          factIds: []
        }))
      };

      const { reelProps } = this.editorAgent.execute(
        projectId,
        scriptDoc,
        visuals,
        audios,
        dossier
      );

      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'QA_CHECKING' }
      });

      await this.updateJobLog(job.id, 'QA Agent đang kiểm định chất lượng video và độ khớp...', 70);

      const qaReport = this.qaAgent.execute(reelProps, scriptDoc, dossier);

      await prisma.project.update({
        where: { id: projectId },
        data: {
          qaReport: JSON.stringify(qaReport),
          status: qaReport.isPassing ? 'READY_TO_RENDER' : 'EDITING'
        }
      });

      await this.completeJob(
        job.id,
        `Hoàn tất dựng và kiểm định QA (Điểm số: ${qaReport.qaScore}/100, Đạt chuẩn: ${qaReport.isPassing ? 'CÓ' : 'KHÔNG'}). Sẵn sàng Render!`
      );
    } catch (err: any) {
      await this.failJob(job.id, err.message);
      throw err;
    }
  }

  // 5. Step: Render Video MP4 via Remotion CLI/Script
  public async renderVideo(projectId: string): Promise<string> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { scenes: { orderBy: { sceneNumber: 'asc' } }, script: true, researchItems: true }
    });
    if (!project) throw new Error('Không tìm thấy dự án');

    const job = await this.createJob(projectId, 'RENDERING');
    try {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'RENDERING' }
      });

      await this.updateJobLog(job.id, 'Đang chuẩn bị dữ liệu render Remotion...', 20);

      const storage = StorageService.getInstance();
      const videosDir = storage.getVideosDir();
      const outputFilename = `vietsu_${projectId}_${Date.now()}.mp4`;
      const outputPath = path.join(videosDir, outputFilename);

      // Build props file for Remotion
      const scenes: RemotionSceneProps[] = project.scenes.map(s => {
        const subtitles = s.subtitles ? JSON.parse(s.subtitles) : [];
        return {
          sceneNumber: s.sceneNumber,
          visualUrl: s.visualUrl || '',
          audioUrl: s.audioUrl || '',
          durationInFrames: s.durationInFrames || 180,
          cameraMotion: (s.cameraMotion as any) || 'ZOOM_IN',
          subtitles,
          citationBadge: project.researchItems[0] ? `Chính sử: ${project.title}` : undefined
        };
      });

      const reelProps = {
        projectId,
        title: project.title,
        historicalEra: project.historicalEra,
        fps: 30,
        width: 1080,
        height: 1920,
        bgmVolume: 0.25,
        scenes
      };

      const tempPropsPath = path.join(storage.getTempDir(), `props_${projectId}.json`);
      fs.writeFileSync(tempPropsPath, JSON.stringify(reelProps, null, 2), 'utf-8');

      await this.updateJobLog(job.id, 'Khởi động Remotion Render Engine (1080x1920 @ 30fps)...', 40);

      // Path to video-renderer render script
      const rendererScriptPath = path.resolve(process.cwd(), '../video-renderer/src/render-cli.ts');
      const cmd = `npx tsx "${rendererScriptPath}" --props="${tempPropsPath}" --output="${outputPath}"`;

      await this.updateJobLog(job.id, 'Đang xuất MP4 với H.264 và FFmpeg...', 60);

      const { stdout, stderr } = await execAsync(cmd, {
        cwd: path.resolve(process.cwd(), '../video-renderer'),
        maxBuffer: 1024 * 1024 * 10
      });

      await this.updateJobLog(job.id, 'Remotion render output:\n' + stdout.slice(-300), 90);

      const publicVideoUrl = `/storage/videos/${outputFilename}`;

      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: 'COMPLETED',
          renderedVideoUrl: publicVideoUrl
        }
      });

      await this.completeJob(job.id, `Render hoàn tất! Video MP4 đã được lưu tại: ${publicVideoUrl}`);
      return publicVideoUrl;
    } catch (err: any) {
      await this.failJob(job.id, err.message);
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'FAILED' }
      });
      throw err;
    }
  }

  // 6. Rerun a step or scene
  public async rerunStep(projectId: string, stepName: string, sceneNumber?: number) {
    if (stepName === 'RESEARCH') {
      return this.startPipeline(projectId);
    } else if (stepName === 'SCRIPTING') {
      return this.approveResearch(projectId);
    } else if (stepName === 'ASSET_GENERATION') {
      return this.approveScript(projectId);
    } else if (stepName === 'RENDER') {
      return this.renderVideo(projectId);
    }
    throw new Error(`Bước ${stepName} không hỗ trợ chạy lại`);
  }
}
