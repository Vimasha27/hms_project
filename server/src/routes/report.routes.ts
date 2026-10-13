import { Router } from 'express';
import { getFinancialReports, getClinicalReports } from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/financial', authorize(['ADMIN', 'ACCOUNTANT']), getFinancialReports);
router.get('/clinical', authorize(['ADMIN', 'DOCTOR']), getClinicalReports);

export default router;
