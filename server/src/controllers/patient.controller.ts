import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';

export const listPatients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { patientCode: { contains: q, mode: 'insensitive' } },
        { contactNumber: { contains: q } },
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.patient.count({ where }),
    ]);

    return res.json({
      success: true,
      data: patients,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            doctor: {
              include: { user: true, department: true },
            },
          },
          orderBy: { appointmentDate: 'desc' },
          take: 10,
        },
        medicalRecords: {
          include: {
            doctor: { include: { user: true } },
            prescriptions: { include: { items: { include: { medicine: true } } } },
          },
          orderBy: { visitDate: 'desc' },
        },
        labRequests: {
          include: {
            test: true,
            result: true,
            doctor: { include: { user: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        admissions: {
          include: {
            bed: { include: { ward: true } },
            doctor: { include: { user: true } },
          },
          orderBy: { admissionDate: 'desc' },
        },
        invoices: {
          include: { items: true, payments: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    return res.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const createPatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      firstName,
      lastName,
      dob,
      gender,
      bloodGroup,
      contactNumber,
      email,
      address,
      emergencyContactName,
      emergencyContactPhone,
      allergies,
      medicalHistorySummary,
    } = req.body;

    if (!firstName || !lastName || !dob || !gender || !contactNumber) {
      throw new AppError('First name, last name, date of birth, gender, and contact number are required', 400);
    }

    const PHONE_REGEX = /^\d{10}$/;
    if (!PHONE_REGEX.test(contactNumber)) {
      throw new AppError('Contact number must be exactly 10 numeric digits', 400);
    }

    if (emergencyContactPhone && !PHONE_REGEX.test(emergencyContactPhone)) {
      throw new AppError('Emergency contact phone must be exactly 10 numeric digits', 400);
    }

    // Auto generate patient code: PAT-YYYYMM-XXXX
    const count = await prisma.patient.count();
    const currentYearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const patientCode = `PAT-${currentYearMonth}-${String(count + 1).padStart(4, '0')}`;

    const newPatient = await prisma.patient.create({
      data: {
        patientCode,
        firstName,
        lastName,
        dob: new Date(dob),
        gender,
        bloodGroup,
        contactNumber,
        email,
        address,
        emergencyContactName,
        emergencyContactPhone,
        allergies,
        medicalHistorySummary,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: newPatient,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const updateData = { ...req.body };

    const PHONE_REGEX = /^\d{10}$/;
    if (updateData.contactNumber !== undefined && !PHONE_REGEX.test(updateData.contactNumber)) {
      throw new AppError('Contact number must be exactly 10 numeric digits', 400);
    }

    if (updateData.emergencyContactPhone && !PHONE_REGEX.test(updateData.emergencyContactPhone)) {
      throw new AppError('Emergency contact phone must be exactly 10 numeric digits', 400);
    }

    if (updateData.dob) {
      updateData.dob = new Date(updateData.dob);
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      success: true,
      message: 'Patient updated successfully',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};
