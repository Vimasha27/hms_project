import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';

export const createConsultation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      patientId,
      doctorId,
      appointmentId,
      symptoms,
      diagnosis,
      vitals,
      treatmentPlan,
      prescriptionItems,
    } = req.body;

    if (!patientId || !doctorId || !diagnosis) {
      throw new AppError('Patient ID, Doctor ID, and Diagnosis are required', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Medical Record
      const medicalRecord = await tx.medicalRecord.create({
        data: {
          patientId,
          doctorId,
          appointmentId: appointmentId || undefined,
          symptoms,
          diagnosis,
          vitals: vitals || {},
          treatmentPlan,
        },
      });

      // 2. If appointment exists, mark it as COMPLETED
      if (appointmentId) {
        await tx.appointment.update({
          where: { id: appointmentId },
          data: { status: 'COMPLETED' },
        });
      }

      // 3. Create Prescription if items are provided
      let prescription = null;
      if (prescriptionItems && Array.isArray(prescriptionItems) && prescriptionItems.length > 0) {
        prescription = await tx.prescription.create({
          data: {
            medicalRecordId: medicalRecord.id,
            patientId,
            doctorId,
            status: 'PENDING',
            items: {
              create: prescriptionItems.map((item: any) => ({
                medicineId: item.medicineId,
                dosage: item.dosage,
                frequency: item.frequency,
                durationDays: parseInt(item.durationDays, 10),
                instructions: item.instructions || '',
                quantityRequired: parseInt(item.quantityRequired, 10),
              })),
            },
          },
          include: {
            items: {
              include: { medicine: true },
            },
          },
        });
      }

      return { medicalRecord, prescription };
    });

    return res.status(201).json({
      success: true,
      message: 'Consultation recorded successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientMedicalRecords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patientId = req.params.patientId as string;

    const records = await prisma.medicalRecord.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: {
            user: { select: { username: true } },
            department: { select: { name: true } },
          },
        },
        prescriptions: {
          include: {
            items: {
              include: { medicine: true },
            },
          },
        },
      },
      orderBy: { visitDate: 'desc' },
    });

    return res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};
