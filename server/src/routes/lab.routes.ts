import { Router } from 'express';
import {
  listLabTests,
  listLabRequests,
  createLabRequest,
  submitLabResult,
  updateLabStatus,
} from '../controllers/lab.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/tests', listLabTests);
router.get('/requests', listLabRequests);
router.post('/requests', authorize(['ADMIN', 'DOCTOR']), createLabRequest);
router.patch('/requests/:requestId/status', authorize(['ADMIN', 'LAB_STAFF']), updateLabStatus);
router.post('/requests/:requestId/results', authorize(['ADMIN', 'LAB_STAFF']), submitLabResult);

export default router;
