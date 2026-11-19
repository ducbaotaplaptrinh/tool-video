import { Request, Response } from 'express';
import { WorkflowEngine } from '../orchestrator/workflow-engine.js';

export class RenderController {
  static async render(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const engine = WorkflowEngine.getInstance();
      engine.renderVideo(id).catch(console.error);
      res.json({ message: 'Tiến trình render video MP4 đã được kích hoạt', projectId: id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
