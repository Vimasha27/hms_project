import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
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
        user: { select: { id: true, username: true, email: true, role: true, isActive: true } },
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
    const {
      firstName,
      lastName,
      designation,
      departmentId,
      phone,
      email,
      salary,
      joiningDate,
      createAccount = true,
      role = 'RECEPTIONIST',
      username,
      password,
      specialization,
      licenseNumber,
      consultationFee,
    } = req.body;

    if (!firstName || !lastName || !designation || !phone) {
      throw new AppError('First name, last name, designation, and phone are required', 400);
    }

    const PHONE_REGEX = /^\d{10}$/;
    if (!PHONE_REGEX.test(phone)) {
      throw new AppError('Phone number must be exactly 10 numeric digits', 400);
    }

    let rawPassword = password;
    let finalUsername = username ? String(username).trim() : '';
    let finalEmail = email ? String(email).trim().toLowerCase() : '';

    if (createAccount) {
      if (!finalEmail) {
        throw new AppError('Email is required when creating a workstation user account', 400);
      }
      if (!finalUsername) {
        finalUsername = `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      }

      // Check username or email collisions
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username: finalUsername },
            { email: finalEmail },
          ],
        },
      });

      if (existingUser) {
        if (existingUser.username.toLowerCase() === finalUsername.toLowerCase()) {
          throw new AppError(`Username "${finalUsername}" is already taken. Please choose another username.`, 400);
        }
        if (existingUser.email.toLowerCase() === finalEmail.toLowerCase()) {
          throw new AppError(`Email "${finalEmail}" is already registered.`, 400);
        }
      }

      if (!rawPassword) {
        // Auto-generate strong temporary password
        const randomChars = Math.random().toString(36).slice(-6).toUpperCase();
        rawPassword = `Care@${randomChars}!`;
      } else if (rawPassword.length < 6) {
        throw new AppError('Password must be at least 6 characters long', 400);
      }

      if (role === Role.DOCTOR) {
        if (!departmentId) {
          throw new AppError('Department is required for Doctor accounts', 400);
        }
        if (!licenseNumber) {
          throw new AppError('Medical License Number is required for Doctor accounts', 400);
        }
        const existingDoc = await prisma.doctor.findUnique({
          where: { licenseNumber: String(licenseNumber).trim() },
        });
        if (existingDoc) {
          throw new AppError(`Medical license number "${licenseNumber}" is already registered.`, 400);
        }
      }
    }

    const count = await prisma.employee.count();
    const employeeCode = `EMP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const transactionResult = await prisma.$transaction(async (tx) => {
      let createdUser = null;

      if (createAccount) {
        const passwordHash = await bcrypt.hash(rawPassword, 10);
        createdUser = await tx.user.create({
          data: {
            username: finalUsername,
            email: finalEmail,
            passwordHash,
            role: role as Role,
            isActive: true,
          },
        });
      }

      const employee = await tx.employee.create({
        data: {
          employeeCode,
          firstName,
          lastName,
          designation,
          departmentId: departmentId || undefined,
          phone,
          email: finalEmail || email || undefined,
          joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
          salary: salary ? Number(salary) : undefined,
          userId: createdUser ? createdUser.id : undefined,
        },
        include: {
          department: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      let doctorRecord = null;
      if (createAccount && role === Role.DOCTOR && createdUser && departmentId) {
        doctorRecord = await tx.doctor.create({
          data: {
            userId: createdUser.id,
            departmentId,
            specialization: specialization || designation || 'General Medicine',
            licenseNumber: String(licenseNumber).trim(),
            consultationFee: consultationFee ? Number(consultationFee) : 100.0,
            isAvailable: true,
          },
        });
      }

      return { employee, createdUser, doctor: doctorRecord };
    });

    return res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      data: {
        ...transactionResult.employee,
        credentials: createAccount
          ? {
              employeeCode: transactionResult.employee.employeeCode,
              fullName: `${firstName} ${lastName}`,
              username: transactionResult.createdUser?.username,
              email: transactionResult.createdUser?.email,
              role: transactionResult.createdUser?.role,
              departmentName: transactionResult.employee.department?.name || 'General Operations',
              temporaryPassword: rawPassword,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resetEmployeePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { password, role, username } = req.body;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: true, department: true },
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    let rawPassword = password;
    if (!rawPassword) {
      const randomChars = Math.random().toString(36).slice(-6).toUpperCase();
      rawPassword = `Care@${randomChars}!`;
    } else if (rawPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    const passwordHash = await bcrypt.hash(rawPassword, 10);

    let updatedUser;
    if (employee.userId && employee.user) {
      updatedUser = await prisma.user.update({
        where: { id: employee.userId },
        data: {
          passwordHash,
          ...(role ? { role: role as Role } : {}),
          isActive: true,
        },
      });
    } else {
      const finalEmail = employee.email || `${employee.firstName.toLowerCase()}.${employee.lastName.toLowerCase()}@caresync.hms`;
      const finalUsername = username?.trim() || `${employee.firstName.toLowerCase()}_${employee.lastName.toLowerCase()}`;

      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ username: finalUsername }, { email: finalEmail }],
        },
      });
      if (existing) {
        throw new AppError(`Username or email already exists for another account: ${existing.username} / ${existing.email}`, 400);
      }

      updatedUser = await prisma.user.create({
        data: {
          username: finalUsername,
          email: finalEmail,
          passwordHash,
          role: (role as Role) || Role.RECEPTIONIST,
          isActive: true,
        },
      });

      await prisma.employee.update({
        where: { id: employee.id },
        data: {
          userId: updatedUser.id,
          email: finalEmail,
        },
      });
    }

    return res.json({
      success: true,
      message: 'Workstation credentials generated successfully',
      data: {
        credentials: {
          employeeCode: employee.employeeCode,
          fullName: `${employee.firstName} ${employee.lastName}`,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          departmentName: employee.department?.name || 'General Operations',
          temporaryPassword: rawPassword,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleEmployeeStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    if (!employee.userId || !employee.user) {
      throw new AppError('Employee does not have an associated workstation user account', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: employee.userId },
      data: {
        isActive: !employee.user.isActive,
      },
    });

    return res.json({
      success: true,
      message: `Employee user account ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        isActive: updatedUser.isActive,
      },
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
