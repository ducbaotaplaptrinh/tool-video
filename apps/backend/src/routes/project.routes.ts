import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { PipelineController } from '../controllers/pipeline.controller.js';
import { RenderController } from '../controllers/render.controller.js';

const router = Router();

// Projects
router.get('/', ProjectController.list);
router.post('/', ProjectController.create);
router.get('/:id', ProjectController.getById);
router.delete('/:id', ProjectController.delete);

// Pipeline steps
router.post('/:id/pipeline/start', PipelineController.start);
router.post('/:id/pipeline/approve-research', PipelineController.approveResearch);
router.post('/:id/pipeline/approve-script', PipelineController.approveScript);
router.post('/:id/pipeline/rerun-step', PipelineController.rerunStep);

// Render
router.post('/:id/render', RenderController.render);

export default router;
