import { Router } from 'express';
import {
  listMedicines,
  addMedicine,
  addBatch,
  listPendingPrescriptions,
  dispensePrescription,
  getPharmacyAlerts,
} from '../controllers/pharmacy.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/medicines', listMedicines);
router.post('/medicines', authorize(['ADMIN', 'PHARMACIST']), addMedicine);
router.post('/batches', authorize(['ADMIN', 'PHARMACIST']), addBatch);
router.get('/prescriptions', authorize(['ADMIN', 'PHARMACIST']), listPendingPrescriptions);
router.post('/prescriptions/:id/dispense', authorize(['ADMIN', 'PHARMACIST']), dispensePrescription);
router.get('/alerts', getPharmacyAlerts);

export default router;
