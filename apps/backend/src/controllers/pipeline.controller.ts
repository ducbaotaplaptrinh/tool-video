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
    try {
      const { id } = req.params;
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) {
        return res.status(404).json({ error: 'Không tìm thấy dự án' });
      }

      if (project.status !== 'DRAFT' && project.status !== 'FAILED') {
        return res.status(400).json({
          error: `Không thể bắt đầu nghiên cứu khi dự án đang ở trạng thái "${project.status}". Chỉ cho phép khi trạng thái là DRAFT hoặc FAILED.`
        });
      }

      if (await PipelineController.checkActiveJob(id)) {
        return res.status(409).json({
          error: 'Dự án đang có một tác vụ đang chạy. Vui lòng chờ hoàn tất.'
        });
      }

      const engine = WorkflowEngine.getInstance();
      engine.startPipeline(id).catch(console.error);
      res.json({ message: 'Tiến trình nghiên cứu đã được kích hoạt', projectId: id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async approveResearch(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) {
        return res.status(404).json({ error: 'Không tìm thấy dự án' });
      }

      if (project.status !== 'RESEARCH_PENDING_APPROVAL') {
        return res.status(400).json({
          error: `Không thể phê duyệt nghiên cứu khi dự án đang ở trạng thái "${project.status}". Chỉ cho phép khi trạng thái là RESEARCH_PENDING_APPROVAL.`
        });
      }

      if (await PipelineController.checkActiveJob(id)) {
        return res.status(409).json({
          error: 'Dự án đang có một tác vụ đang chạy. Vui lòng chờ hoàn tất.'
        });
      }

      const engine = WorkflowEngine.getInstance();
      engine.approveResearch(id).catch(console.error);
      res.json({ message: 'Nghiên cứu sử liệu đã được phê duyệt. Đang chuyển sang viết kịch bản...', projectId: id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async approveScript(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) {
        return res.status(404).json({ error: 'Không tìm thấy dự án' });
      }

      if (project.status !== 'SCRIPT_PENDING_APPROVAL') {
        return res.status(400).json({
          error: `Không thể phê duyệt kịch bản khi dự án đang ở trạng thái "${project.status}". Chỉ cho phép khi trạng thái là SCRIPT_PENDING_APPROVAL.`
        });
      }

      if (await PipelineController.checkActiveJob(id)) {
        return res.status(409).json({
          error: 'Dự án đang có một tác vụ đang chạy. Vui lòng chờ hoàn tất.'
        });
      }

      const engine = WorkflowEngine.getInstance();
      engine.approveScript(id).catch(console.error);
      res.json({ message: 'Kịch bản đã được phê duyệt. Đang bắt đầu sinh hình ảnh và âm thanh...', projectId: id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async rerunStep(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { stepName, sceneNumber } = req.body;
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) {
        return res.status(404).json({ error: 'Không tìm thấy dự án' });
      }

      if (await PipelineController.checkActiveJob(id)) {
        return res.status(409).json({
          error: 'Dự án đang có một tác vụ đang chạy. Vui lòng chờ hoàn tất.'
        });
      }

      const engine = WorkflowEngine.getInstance();
      engine.rerunStep(id, stepName, sceneNumber).catch(console.error);
      res.json({ message: `Đang chạy lại bước ${stepName}`, projectId: id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async retry(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) {
        return res.status(404).json({ error: 'Không tìm thấy dự án' });
      }

      if (project.status !== 'FAILED') {
        return res.status(400).json({
          error: `Dự án đang ở trạng thái "${project.status}", chỉ có thể thử lại khi trạng thái là FAILED.`
        });
      }

      if (await PipelineController.checkActiveJob(id)) {
        return res.status(409).json({
          error: 'Dự án đang có một tác vụ đang chạy. Vui lòng chờ hoàn tất.'
        });
      }

      const engine = WorkflowEngine.getInstance();
      engine.retry(id).catch(console.error);
      res.json({ message: 'Tiến trình đã được khởi động lại từ bước thất bại', projectId: id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
