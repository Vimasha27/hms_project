import { Router } from 'express';
import {
  listWardsAndBeds,
  admitPatient,
  dischargePatient,
} from '../controllers/inpatient.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/wards', listWardsAndBeds);
router.post('/admissions', authorize(['ADMIN', 'DOCTOR', 'NURSE']), admitPatient);
router.post('/admissions/:id/discharge', authorize(['ADMIN', 'DOCTOR']), dischargePatient);

export default router;
