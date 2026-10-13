import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';

export const listLabTests = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tests = await prisma.labTest.findMany({
      orderBy: { testName: 'asc' },
    });
    return res.json({ success: true, data: tests });
  } catch (error) {
    next(error);
  }
};

export const listLabRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, patientId } = req.query;
    const where: any = {};

    if (status) where.status = status as any;
    if (patientId) where.patientId = patientId as string;

    const requests = await prisma.labRequest.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            patientCode: true,
            firstName: true,
            lastName: true,
            dob: true,
            gender: true,
          },
        },
        doctor: {
          include: { user: { select: { username: true } } },
        },
        test: true,
        result: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const createLabRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patientId, doctorId, testId, urgency = 'ROUTINE' } = req.body;

    if (!patientId || !doctorId || !testId) {
      throw new AppError('Patient ID, Doctor ID, and Test ID are required', 400);
    }

    const request = await prisma.labRequest.create({
      data: {
        patientId,
        doctorId,
        testId,
        urgency,
        status: 'REQUESTED',
      },
      include: {
        test: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Lab test ordered',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const submitLabResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestId = req.params.requestId as string;
    const { resultValue, normalRange, interpretation } = req.body;

    if (!resultValue) {
      throw new AppError('Result value is required', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const labResult = await tx.labResult.create({
        data: {
          requestId,
          resultValue,
          normalRange,
          interpretation,
          performedById: req.user?.id,
          verifiedById: req.user?.id,
        },
      });

      await tx.labRequest.update({
        where: { id: requestId },
        data: { status: 'COMPLETED' },
      });

      return labResult;
    });

    return res.status(201).json({
      success: true,
      message: 'Lab result submitted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLabStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestId = req.params.requestId as string;
    const { status } = req.body;

    const updated = await prisma.labRequest.update({
      where: { id: requestId },
      data: { status },
      include: { test: true, patient: true },
    });

    return res.json({
      success: true,
      message: `Specimen status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
