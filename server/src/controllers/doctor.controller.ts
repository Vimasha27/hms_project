import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';

export const listDepartments = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { doctors: true },
        },
      },
    });
    return res.json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

export const listDoctors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { departmentId } = req.query;
    const where: any = { isAvailable: true };

    if (departmentId) {
      where.departmentId = departmentId as string;
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, email: true } },
        department: true,
        schedules: true,
      },
    });

    return res.json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
};

export const createDoctorSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.params.doctorId as string;
    const { dayOfWeek, startTime, endTime, slotDurationMinutes = 15 } = req.body;

    const schedule = await prisma.doctorSchedule.create({
      data: {
        doctorId,
        dayOfWeek: parseInt(dayOfWeek, 10),
        startTime,
        endTime,
        slotDurationMinutes,
      },
    });

    return res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};
