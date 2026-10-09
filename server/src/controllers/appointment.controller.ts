import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';

export const listAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctorId, patientId, date, status } = req.query;
    const where: any = {};

    if (doctorId) where.doctorId = doctorId as string;
    if (patientId) where.patientId = patientId as string;
    if (status) where.status = status as any;
    if (date) {
      const targetDate = new Date(date as string);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      where.appointmentDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            patientCode: true,
            firstName: true,
            lastName: true,
            contactNumber: true,
          },
        },
        doctor: {
          include: {
            user: { select: { username: true } },
            department: { select: { name: true } },
          },
        },
      },
      orderBy: [{ appointmentDate: 'asc' }, { timeSlot: 'asc' }],
    });

    return res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

export const bookAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patientId, doctorId, appointmentDate, timeSlot, reason } = req.body;

    if (!patientId || !doctorId || !appointmentDate || !timeSlot) {
      throw new AppError('Patient, doctor, date, and time slot are required', 400);
    }

    const dateObj = new Date(appointmentDate);
    const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

    // Conflict check
    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        timeSlot,
        status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_CONSULTATION'] },
      },
    });

    if (existing) {
      throw new AppError('The selected time slot is already booked for this doctor', 409);
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        timeSlot,
        reason,
        status: 'SCHEDULED',
      },
      include: {
        patient: true,
        doctor: { include: { user: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status, notes } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return res.json({
      success: true,
      message: 'Appointment status updated',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const rescheduleAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { appointmentDate, timeSlot } = req.body;

    if (!appointmentDate || !timeSlot) {
      throw new AppError('New appointment date and time slot are required', 400);
    }

    const current = await prisma.appointment.findUnique({ where: { id } });
    if (!current) {
      throw new AppError('Appointment not found', 404);
    }

    const dateObj = new Date(appointmentDate);
    const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

    // Conflict check
    const existing = await prisma.appointment.findFirst({
      where: {
        id: { not: id },
        doctorId: current.doctorId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        timeSlot,
        status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_CONSULTATION'] },
      },
    });

    if (existing) {
      throw new AppError('The selected time slot is already booked for this doctor', 409);
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        appointmentDate: new Date(appointmentDate),
        timeSlot,
        status: 'SCHEDULED',
      },
      include: {
        patient: true,
        doctor: { include: { user: true } },
      },
    });

    return res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
