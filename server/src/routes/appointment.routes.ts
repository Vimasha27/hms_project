import { Router } from 'express';
import {
  listAppointments,
  bookAppointment,
  updateAppointmentStatus,
  rescheduleAppointment,
} from '../controllers/appointment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', listAppointments);
router.post('/', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR']), bookAppointment);
router.patch('/:id/status', updateAppointmentStatus);
router.patch('/:id/reschedule', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR']), rescheduleAppointment);

export default router;
