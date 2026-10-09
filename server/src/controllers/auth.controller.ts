import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { config } from '../config';
import { AppError } from '../middlewares/error.middleware';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      throw new AppError('Please provide username/email and password', 400);
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: usernameOrEmail.toLowerCase() },
          { username: usernameOrEmail },
        ],
      },
      include: {
        doctor: {
          include: { department: true },
        },
        employee: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials or inactive account', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Create token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          doctor: user.doctor,
          employee: user.employee,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        doctor: {
          include: { department: true },
        },
        employee: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        doctor: user.doctor,
        employee: user.employee,
      },
    });
  } catch (error) {
    next(error);
  }
};
