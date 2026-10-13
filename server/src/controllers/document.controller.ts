import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../middlewares/error.middleware';

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'patients');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const registryFile = path.join(__dirname, '..', '..', 'uploads', 'documents_registry.json');
if (!fs.existsSync(registryFile)) {
  fs.writeFileSync(registryFile, JSON.stringify([]));
}

interface DocMeta {
  id: string;
  patientId: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

const getRegistry = (): DocMeta[] => {
  try {
    const raw = fs.readFileSync(registryFile, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveRegistry = (data: DocMeta[]) => {
  fs.writeFileSync(registryFile, JSON.stringify(data, null, 2));
};

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload PDF, PNG, JPG, or DOC.'));
    }
  },
});

export const uploadPatientDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patientId = req.params.patientId as string;
    if (!req.file) {
      throw new AppError('No document file was uploaded', 400);
    }

    const doc: DocMeta = {
      id: `DOC-${Date.now()}`,
      patientId,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
    };

    const registry = getRegistry();
    registry.push(doc);
    saveRegistry(registry);

    return res.status(201).json({
      success: true,
      message: 'Medical document uploaded successfully',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

export const listPatientDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patientId = req.params.patientId as string;
    const registry = getRegistry();
    const patientDocs = registry.filter((d) => d.patientId === patientId);

    return res.json({
      success: true,
      data: patientDocs,
    });
  } catch (error) {
    next(error);
  }
};
