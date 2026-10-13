import { Router } from 'express';
import {
  upload,
  uploadPatientDocument,
  listPatientDocuments,
} from '../controllers/document.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/:patientId/upload', upload.single('file'), uploadPatientDocument);
router.get('/:patientId', listPatientDocuments);

export default router;
