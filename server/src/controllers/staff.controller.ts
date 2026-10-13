import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';

// --------------------------------------------------------------------------
// Employees
// --------------------------------------------------------------------------

export const listEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { departmentId, search } = req.query;
    const where: any = {};

    if (departmentId) where.departmentId = departmentId as string;
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { employeeCode: { contains: q, mode: 'insensitive' } },
        { designation: { contains: q, mode: 'insensitive' } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        department: true,
        user: { select: { id: true, username: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: employees });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, designation, departmentId, phone, email, salary } = req.body;

    if (!firstName || !lastName || !designation || !phone) {
      throw new AppError('First name, last name, designation, and phone are required', 400);
    }

    const PHONE_REGEX = /^\d{10}$/;
    if (!PHONE_REGEX.test(phone)) {
      throw new AppError('Phone number must be exactly 10 numeric digits', 400);
    }

    const count = await prisma.employee.count();
    const employeeCode = `EMP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const employee = await prisma.employee.create({
      data: {
        employeeCode,
        firstName,
        lastName,
        designation,
        departmentId: departmentId || undefined,
        phone,
        email,
        salary: salary ? Number(salary) : undefined,
      },
      include: {
        department: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------------------------------
// Attendance
// --------------------------------------------------------------------------

export const listAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();
    // Normalize date without time for @db.Date matching
    const dateOnly = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()));

    const records = await prisma.attendance.findMany({
      where: { date: dateOnly },
      include: {
        employee: {
          include: { department: true },
        },
      },
      orderBy: { employee: { firstName: 'asc' } },
    });

    return res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

export const recordAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId, date, status = 'PRESENT', checkIn, checkOut } = req.body;

    if (!employeeId) {
      throw new AppError('Employee ID is required', 400);
    }

    const targetDate = date ? new Date(date) : new Date();
    const dateOnly = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()));

    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: dateOnly,
        },
      },
      update: {
        status,
        checkIn: checkIn ? new Date(checkIn) : undefined,
        checkOut: checkOut ? new Date(checkOut) : undefined,
      },
      create: {
        employeeId,
        date: dateOnly,
        status,
        checkIn: checkIn ? new Date(checkIn) : new Date(),
        checkOut: checkOut ? new Date(checkOut) : undefined,
      },
    });

    return res.json({
      success: true,
      message: 'Attendance logged successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------------------------------
// Leave Requests
// --------------------------------------------------------------------------

export const listLeaveRequests = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const leaves = await prisma.leaveRequest.findMany({
      include: {
        employee: {
          include: { department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
};

export const createLeaveRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId, startDate, endDate, leaveType, reason } = req.body;

    if (!employeeId || !startDate || !endDate || !leaveType) {
      throw new AppError('Employee ID, start date, end date, and leave type are required', 400);
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        employeeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        leaveType,
        reason,
        status: 'PENDING',
      },
      include: {
        employee: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Leave request submitted',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: { status },
      include: { employee: true },
    });

    return res.json({
      success: true,
      message: `Leave request ${status.toLowerCase()}`,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};
