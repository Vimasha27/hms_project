import { Router } from 'express';
import {
  listDoctors,
  listDepartments,
  createDoctorSchedule,
} from '../controllers/doctor.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', listDoctors);
router.get('/departments', listDepartments);
router.post('/:doctorId/schedules', authorize(['ADMIN', 'DOCTOR']), createDoctorSchedule);

export default router;
