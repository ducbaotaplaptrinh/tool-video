import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { WorkflowEngine } from '../orchestrator/workflow-engine.js';

export class PipelineController {
  private static async checkActiveJob(projectId: string): Promise<boolean> {
    const runningJob = await prisma.job.findFirst({
      where: { projectId, status: 'RUNNING' }
    });
    return !!runningJob;
  }

  static async start(req: Request, res: Response) {
    const { id } = req.params;
    const engine = WorkflowEngine.getInstance();

    // Synchronous acquire before any async I/O to eliminate TOCTOU race condition
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

      if (project.status !== 'DRAFT' && project.status !== 'FAILED') {
        engine.releaseLock(id);
        return res.status(400).json({
          error: `Không thể bắt đầu nghiên cứu khi dự án đang ở trạng thái "${project.status}". Chỉ cho phép khi trạng thái là DRAFT hoặc FAILED.`
        });
      }

      if (await PipelineController.checkActiveJob(id)) {
        engine.releaseLock(id);
        return res.status(409).json({
          error: 'Dự án đang có một tác vụ đang chạy. Vui lòng chờ hoàn tất.'
        });
      }

      engine.startPipeline(id, true).catch(console.error);
      return res.json({ message: 'Tiến trình nghiên cứu đã được kích hoạt', projectId: id });
    } catch (err: any) {
      engine.releaseLock(id);
      return res.status(500).json({ error: err.message });
    }
  }

  static async approveResearch(req: Request, res: Response) {
    const { id } = req.params;
    const engine = WorkflowEngine.getInstance();

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

      if (project.status !== 'RESEARCH_PENDING_APPROVAL') {
        engine.releaseLock(id);
        return res.status(400).json({
          error: `Không thể phê duyệt nghiên cứu khi dự án đang ở trạng thái "${project.status}". Chỉ cho phép duyệt khi trạng thái là RESEARCH_PENDING_APPROVAL.`
        });
      }

      if (await PipelineController.checkActiveJob(id)) {
        engine.releaseLock(id);
        return res.status(409).json({
          error: 'Dự án đang có một tác vụ đang chạy. Vui lòng chờ hoàn tất.'
        });
      }

      engine.approveResearch(id, true).catch(console.error);
      return res.json({ message: 'Nghiên cứu sử liệu đã được phê duyệt. Đang chuyển sang viết kịch bản...', projectId: id });
    } catch (err: any) {
      engine.releaseLock(id);
      return res.status(500).json({ error: err.message });
    }
  }

  static async approveScript(req: Request, res: Response) {
    const { id } = req.params;
    const engine = WorkflowEngine.getInstance();

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

      if (project.status !== 'SCRIPT_PENDING_APPROVAL') {
        engine.releaseLock(id);
        return res.status(400).json({
          error: `Không thể phê duyệt kịch bản khi dự án đang ở trạng thái "${project.status}". Chỉ cho phép duyệt khi trạng thái là SCRIPT_PENDING_APPROVAL.`
        });
      }

      if (await PipelineController.checkActiveJob(id)) {
        engine.releaseLock(id);
        return res.status(409).json({
          error: 'Dự án đang có một tác vụ đang chạy. Vui lòng chờ hoàn tất.'
        });
      }

      engine.approveScript(id, true).catch(console.error);
      return res.json({ message: 'Kịch bản đã được phê duyệt. Đang bắt đầu sinh hình ảnh và âm thanh...', projectId: id });
    } catch (err: any) {
      engine.releaseLock(id);
      return res.status(500).json({ error: err.message });
    }
  }

  static async rerunStep(req: Request, res: Response) {
    const { id } = req.params;
    const { stepName, sceneNumber } = req.body;
    const engine = WorkflowEngine.getInstance();

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

      if (await PipelineController.checkActiveJob(id)) {
        engine.releaseLock(id);
        return res.status(409).json({
          error: 'Dự án đang có một tác vụ đang chạy. Vui lòng chờ hoàn tất.'
        });
      }

      engine.rerunStep(id, stepName, sceneNumber, true).catch(console.error);
      return res.json({ message: `Đang chạy lại bước ${stepName}`, projectId: id });
    } catch (err: any) {
      engine.releaseLock(id);
      return res.status(500).json({ error: err.message });
    }
  }

  static async retry(req: Request, res: Response) {
    const { id } = req.params;
    const engine = WorkflowEngine.getInstance();

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

      if (project.status !== 'FAILED') {
        engine.releaseLock(id);
        return res.status(400).json({
          error: `Dự án đang ở trạng thái "${project.status}", chỉ có thể thử lại khi trạng thái là FAILED.`
        });
      }

      if (await PipelineController.checkActiveJob(id)) {
        engine.releaseLock(id);
        return res.status(409).json({
          error: 'Dự án đang có một tác vụ đang chạy. Vui lòng chờ hoàn tất.'
        });
      }

      engine.retry(id, true).catch(console.error);
      return res.json({ message: 'Tiến trình đã được khởi động lại từ bước thất bại', projectId: id });
    } catch (err: any) {
      engine.releaseLock(id);
      return res.status(500).json({ error: err.message });
    }
  }
}
