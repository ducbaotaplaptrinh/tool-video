import { Request, Response } from 'express';
import { WorkflowEngine } from '../orchestrator/workflow-engine.js';

export class PipelineController {
  static async start(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const engine = WorkflowEngine.getInstance();
      // Run asynchronously and return response
      engine.startPipeline(id).catch(console.error);
      res.json({ message: 'Tiến trình nghiên cứu đã được kích hoạt', projectId: id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async approveResearch(req: Request, res: Response) {
    try {
      const { id } = req.params;
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
      const engine = WorkflowEngine.getInstance();
      engine.rerunStep(id, stepName, sceneNumber).catch(console.error);
      res.json({ message: `Đang chạy lại bước ${stepName}`, projectId: id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
