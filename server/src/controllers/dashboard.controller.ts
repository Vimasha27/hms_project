import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export const getDashboardMetrics = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const [
      totalPatients,
      todayAppointments,
      activeAdmissions,
      pendingLabs,
      medicines,
      recentAppointments,
      invoices,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count({
        where: {
          appointmentDate: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      }),
      prisma.admission.count({
        where: { status: 'ADMITTED' },
      }),
      prisma.labRequest.count({
        where: { status: { in: ['REQUESTED', 'SAMPLE_COLLECTED', 'IN_PROGRESS'] } },
      }),
      prisma.medicine.findMany({
        include: { batches: true },
      }),
      prisma.appointment.findMany({
        take: 5,
        orderBy: { appointmentDate: 'desc' },
        include: {
          patient: true,
          doctor: { include: { user: true, department: true } },
        },
      }),
      prisma.invoice.findMany({
        select: {
          netAmount: true,
          status: true,
        },
      }),
    ]);

    const lowStockCount = medicines.filter((m) => {
      const stock = m.batches.reduce((sum, b) => sum + b.quantityInStock, 0);
      return stock <= m.reorderLevel;
    }).length;

    const totalRevenue = invoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((sum, inv) => sum + Number(inv.netAmount), 0);

    const pendingRevenue = invoices
      .filter((inv) => inv.status === 'UNPAID' || inv.status === 'PARTIAL')
      .reduce((sum, inv) => sum + Number(inv.netAmount), 0);

    return res.json({
      success: true,
      data: {
        totalPatients,
        todayAppointments,
        activeAdmissions,
        pendingLabs,
        lowStockCount,
        totalRevenue,
        pendingRevenue,
        recentAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};
