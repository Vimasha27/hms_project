import { Router } from 'express';
import {
  listInvoices,
  getInvoiceById,
  createInvoice,
  recordPayment,
} from '../controllers/billing.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/invoices', listInvoices);
router.get('/invoices/:id', getInvoiceById);
router.post('/invoices', authorize(['ADMIN', 'ACCOUNTANT', 'RECEPTIONIST']), createInvoice);
router.post('/payments', authorize(['ADMIN', 'ACCOUNTANT', 'RECEPTIONIST']), recordPayment);

export default router;
