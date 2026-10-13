import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';

export const listWardsAndBeds = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const wards = await prisma.ward.findMany({
      include: {
        beds: {
          include: {
            admissions: {
              where: { status: 'ADMITTED' },
              include: {
                patient: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    patientCode: true,
                  },
                },
                doctor: {
                  include: { user: { select: { username: true } } },
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.json({ success: true, data: wards });
  } catch (error) {
    next(error);
  }
};

export const admitPatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patientId, doctorId, bedId, admissionReason } = req.body;

    if (!patientId || !doctorId || !bedId || !admissionReason) {
      throw new AppError('Patient ID, Doctor ID, Bed ID, and Admission Reason are required', 400);
    }

    const admission = await prisma.$transaction(async (tx) => {
      const bed = await tx.bed.findUnique({ where: { id: bedId } });
      if (!bed) {
        throw new AppError('Bed not found', 404);
      }
      if (bed.isOccupied) {
        throw new AppError('Selected bed is currently occupied', 409);
      }

      const newAdmission = await tx.admission.create({
        data: {
          patientId,
          doctorId,
          bedId,
          admissionReason,
          status: 'ADMITTED',
        },
      });

      await tx.bed.update({
        where: { id: bedId },
        data: { isOccupied: true },
      });

      return newAdmission;
    });

    return res.status(201).json({
      success: true,
      message: 'Patient admitted successfully',
      data: admission,
    });
  } catch (error) {
    next(error);
  }
};

export const dischargePatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { dischargeSummary } = req.body;

    const admission = await prisma.$transaction(async (tx) => {
      const current = await tx.admission.findUnique({
        where: { id },
      });

      if (!current) {
        throw new AppError('Admission record not found', 404);
      }

      if (current.status === 'DISCHARGED') {
        throw new AppError('Patient already discharged', 400);
      }

      const updated = await tx.admission.update({
        where: { id },
        data: {
          status: 'DISCHARGED',
          dischargeDate: new Date(),
          dischargeSummary,
        },
      });

      await tx.bed.update({
        where: { id: current.bedId },
        data: { isOccupied: false },
      });

      return updated;
    });

    return res.json({
      success: true,
      message: 'Patient discharged and bed freed',
      data: admission,
    });
  } catch (error) {
    next(error);
  }
};
