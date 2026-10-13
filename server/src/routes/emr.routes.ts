import { Router } from 'express';
import {
  createConsultation,
  getPatientMedicalRecords,
} from '../controllers/emr.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.post('/consultations', authorize(['ADMIN', 'DOCTOR']), createConsultation);
router.get('/patient/:patientId', getPatientMedicalRecords);

export default router;
