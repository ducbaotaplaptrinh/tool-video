import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { WorkflowEngine } from '../orchestrator/workflow-engine.js';

export class RenderController {
  static async render(req: Request, res: Response) {
    const { id } = req.params;
    const engine = WorkflowEngine.getInstance();

    // Synchronous acquire to eliminate race conditions
    if (!engine.acquireLock(id)) {
      return res.status(409).json({
        error: 'Dự án đang có tác vụ xử lý đồng thời. Vui lòng chờ hoàn tất.'
      });
    }

    try {
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) {
        engine.releaseLock(id);
        return res.status(404).json({ error: 'Không tìm thấy dự án' });
      }

      if (project.status !== 'READY_TO_RENDER' && project.status !== 'COMPLETED') {
        engine.releaseLock(id);
        return res.status(400).json({
          error: `Không thể render video khi dự án đang ở trạng thái "${project.status}". Chỉ cho phép khi trạng thái là READY_TO_RENDER hoặc COMPLETED.`
        });
      }

      const runningJob = await prisma.job.findFirst({
        where: { projectId: id, status: 'RUNNING' }
      });
      if (runningJob) {
        engine.releaseLock(id);
        return res.status(409).json({
          error: `Dự án đang có tác vụ "${runningJob.step}" đang xử lý. Vui lòng chờ hoàn tất.`
        });
      }

      engine.renderVideo(id, true).catch(console.error);
      return res.json({ message: 'Tiến trình render video MP4 đã được kích hoạt', projectId: id });
    } catch (err: any) {
      engine.releaseLock(id);
      return res.status(500).json({ error: err.message });
    }
  }
}
