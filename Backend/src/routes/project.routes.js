import { Router } from 'express';

import {
  createProjectController,
  getAllProjectsController,
  getProjectController,
  reviewProjectController,
  updateProjectController,
  executeProjectCodeController,
} from '../controllers/project.controllers.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();
router.use(verifyToken);

router.post('/create', createProjectController);
router.get('/get-all', getAllProjectsController);

router.get('/:id', getProjectController);
router.put('/:id', updateProjectController);
router.post('/:id/execute', executeProjectCodeController);
router.post('/:id/review', reviewProjectController);

export default router;
