import { Router } from 'express';
import {
  listPatients,
  getPatientById,
  createPatient,
  updatePatient,
} from '../controllers/patient.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', listPatients);
router.get('/:id', getPatientById);
router.post('/', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE']), createPatient);
router.put('/:id', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE']), updatePatient);

export default router;
