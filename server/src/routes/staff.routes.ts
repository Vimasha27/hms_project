import { Router } from 'express';
import {
  listEmployees,
  createEmployee,
  listAttendance,
  recordAttendance,
  listLeaveRequests,
  createLeaveRequest,
  updateLeaveStatus,
} from '../controllers/staff.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

// Employees
router.get('/employees', listEmployees);
router.post('/employees', authorize(['ADMIN']), createEmployee);

// Attendance
router.get('/attendance', listAttendance);
router.post('/attendance', authorize(['ADMIN', 'RECEPTIONIST']), recordAttendance);

// Leaves
router.get('/leaves', listLeaveRequests);
router.post('/leaves', createLeaveRequest);
router.patch('/leaves/:id/status', authorize(['ADMIN']), updateLeaveStatus);

export default router;
