import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { CreateProjectSchema } from '@vietsu/shared';
import { WorkflowEngine } from '../orchestrator/workflow-engine.js';

export class ProjectController {
  static async list(req: Request, res: Response) {
    try {
      const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          costs: true,
          jobs: { orderBy: { startedAt: 'desc' }, take: 1 }
        }
      });

      const formatted = projects.map(p => {
        const totalCostUSD = p.costs.reduce((sum, c) => sum + c.estimatedCostUSD, 0);
        const totalCostVND = p.costs.reduce((sum, c) => sum + c.estimatedCostVND, 0);
        return {
          id: p.id,
          title: p.title,
          description: p.description,
          historicalEra: p.historicalEra,
          status: p.status,
          targetDurationSec: p.targetDurationSec,
          renderedVideoUrl: p.renderedVideoUrl,
          totalCostUSD,
          totalCostVND,
          latestJob: p.jobs[0] || null,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        };
      });

      res.json(formatted);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          researchItems: true,
          script: true,
          scenes: { orderBy: { sceneNumber: 'asc' } },
          assets: true,
          costs: { orderBy: { createdAt: 'desc' } },
          jobs: { orderBy: { startedAt: 'desc' } }
        }
      });

      if (!project) {
        return res.status(404).json({ error: 'Không tìm thấy dự án' });
      }

      // Parse JSON fields
      const researchDossier = project.researchItems.length > 0 ? {
        topic: project.title,
        historicalEra: project.historicalEra,
        summary: project.description || project.title,
        verifiedAt: project.researchItems[0].createdAt.toISOString(),
        isApproved: project.status !== 'RESEARCH_PENDING_APPROVAL' && project.status !== 'RESEARCHING' && project.status !== 'DRAFT',
        facts: project.researchItems.map(item => ({
          id: item.id,
          category: item.category as any,
          factSummary: item.factSummary,
          yearOrEra: item.yearOrEra,
          keyFigures: JSON.parse(item.keyFigures || '[]'),
          location: item.location,
          citations: JSON.parse(item.citations || '[]')
        }))
      } : null;

      const scriptDocument = project.script ? {
        title: project.script.title,
        hook: project.script.hook,
        context: project.script.context,
        climax: project.script.climax,
        resolutionAndCta: project.script.resolutionAndCta,
        fullNarrative: project.script.fullNarrative,
        totalWords: project.script.totalWords,
        estimatedTotalDurationSec: project.script.estimatedTotalDurationSec,
        isApproved: project.script.isApproved,
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
      } : null;

      const scenes = project.scenes.map(s => ({
        sceneNumber: s.sceneNumber,
        visualUrl: s.visualUrl || '',
        audioUrl: s.audioUrl || '',
        durationInFrames: s.durationInFrames || 180,
        cameraMotion: (s.cameraMotion as any) || 'ZOOM_IN',
        subtitles: s.subtitles ? JSON.parse(s.subtitles) : [],
        citationBadge: `Sử liệu: ${project.title}`
      }));

      const qaReport = project.qaReport ? JSON.parse(project.qaReport) : null;

      res.json({
        id: project.id,
        title: project.title,
        description: project.description,
        historicalEra: project.historicalEra,
        aspectRatio: project.aspectRatio,
        targetDurationSec: project.targetDurationSec,
        status: project.status,
        renderedVideoUrl: project.renderedVideoUrl,
        researchDossier,
        scriptDocument,
        scenes,
        qaReport,
        costs: project.costs,
        jobs: project.jobs.map(j => ({
          id: j.id,
          step: j.step,
          status: j.status,
          progressPercent: j.progressPercent,
          logs: JSON.parse(j.logs || '[]'),
          error: j.error,
          startedAt: j.startedAt,
          completedAt: j.completedAt
        })),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const parsed = CreateProjectSchema.parse(req.body);

      const project = await prisma.project.create({
        data: {
          title: parsed.title,
          description: parsed.description,
          historicalEra: parsed.historicalEra,
          targetDurationSec: parsed.targetDurationSec,
          aspectRatio: '9:16',
          status: 'DRAFT'
        }
      });

      // Optionally auto start pipeline
      if (req.body.autoStart) {
        WorkflowEngine.getInstance().startPipeline(project.id).catch(console.error);
      }

      res.status(201).json(project);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.project.delete({ where: { id } });
      res.json({ message: 'Dự án đã được xóa thành công' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
