import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export const getFinancialReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { days = '30' } = req.query;
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - parseInt(days as string, 10));

    const [invoices, invoiceItems, payments] = await Promise.all([
      prisma.invoice.findMany({
        where: { createdAt: { gte: pastDate } },
        select: {
          id: true,
          invoiceNumber: true,
          totalAmount: true,
          discountAmount: true,
          taxAmount: true,
          netAmount: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.invoiceItem.findMany({
        where: { invoice: { createdAt: { gte: pastDate } } },
        select: {
          serviceType: true,
          totalPrice: true,
        },
      }),
      prisma.payment.findMany({
        where: { paymentDate: { gte: pastDate } },
        select: {
          amountPaid: true,
          paymentMethod: true,
          paymentDate: true,
        },
      }),
    ]);

    // Service Breakdown
    const serviceBreakdown: Record<string, number> = {
      CONSULTATION: 0,
      LAB_TEST: 0,
      PHARMACY: 0,
      ROOM_CHARGE: 0,
      PROCEDURE: 0,
      OTHER: 0,
    };
    invoiceItems.forEach((it) => {
      serviceBreakdown[it.serviceType] =
        (serviceBreakdown[it.serviceType] || 0) + Number(it.totalPrice);
    });

    // Payment Method Breakdown
    const paymentBreakdown: Record<string, number> = {
      CASH: 0,
      CARD: 0,
      ONLINE: 0,
      INSURANCE: 0,
    };
    payments.forEach((p) => {
      paymentBreakdown[p.paymentMethod] =
        (paymentBreakdown[p.paymentMethod] || 0) + Number(p.amountPaid);
    });

    // Daily Revenue Grouping
    const dailyMap: Record<string, number> = {};
    invoices
      .filter((inv) => inv.status === 'PAID')
      .forEach((inv) => {
        const dateKey = new Date(inv.createdAt).toISOString().split('T')[0];
        dailyMap[dateKey] = (dailyMap[dateKey] || 0) + Number(inv.netAmount);
      });

    const dailyRevenue = Object.entries(dailyMap).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    const totalCollected = payments.reduce((s, p) => s + Number(p.amountPaid), 0);
    const totalBilled = invoices.reduce((s, inv) => s + Number(inv.netAmount), 0);

    return res.json({
      success: true,
      data: {
        totalBilled,
        totalCollected,
        serviceBreakdown: Object.entries(serviceBreakdown).map(([name, value]) => ({
          name,
          value,
        })),
        paymentBreakdown: Object.entries(paymentBreakdown).map(([name, value]) => ({
          name,
          value,
        })),
        dailyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getClinicalReports = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      appointmentsByStatus,
      patientsByGender,
      labOrdersByCategory,
      admissionsByWard,
      totalPrescriptions,
    ] = await Promise.all([
      prisma.appointment.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.patient.groupBy({
        by: ['gender'],
        _count: { id: true },
      }),
      prisma.labRequest.findMany({
        select: {
          test: { select: { category: true } },
          status: true,
        },
      }),
      prisma.admission.findMany({
        select: {
          status: true,
          bed: { select: { ward: { select: { name: true } } } },
        },
      }),
      prisma.prescription.count(),
    ]);

    const labCategoryCounts: Record<string, number> = {};
    labOrdersByCategory.forEach((req) => {
      const cat = req.test.category || 'General';
      labCategoryCounts[cat] = (labCategoryCounts[cat] || 0) + 1;
    });

    const wardAdmissionCounts: Record<string, number> = {};
    admissionsByWard.forEach((adm) => {
      const wardName = adm.bed.ward.name;
      wardAdmissionCounts[wardName] = (wardAdmissionCounts[wardName] || 0) + 1;
    });

    return res.json({
      success: true,
      data: {
        appointments: appointmentsByStatus.map((a) => ({ name: a.status, count: a._count.id })),
        patients: patientsByGender.map((p) => ({ name: p.gender, count: p._count.id })),
        labCategories: Object.entries(labCategoryCounts).map(([name, count]) => ({
          name,
          count,
        })),
        wardAdmissions: Object.entries(wardAdmissionCounts).map(([name, count]) => ({
          name,
          count,
        })),
        totalPrescriptions,
      },
    });
  } catch (error) {
    next(error);
  }
};
