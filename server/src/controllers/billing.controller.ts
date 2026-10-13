import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';

export const listInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, patientId } = req.query;
    const where: any = {};

    if (status) where.status = status as any;
    if (patientId) where.patientId = patientId as string;

    const invoices = await prisma.invoice.findMany({
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
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: true,
        items: true,
        payments: {
          include: { receivedBy: { select: { username: true } } },
        },
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    return res.json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patientId, items, discountAmount = 0, taxAmount = 0, dueDate } = req.body;

    if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('Patient ID and at least one invoice item are required', 400);
    }

    const totalAmount = items.reduce((sum: number, it: any) => {
      const lineTotal = Number(it.quantity) * Number(it.unitPrice);
      return sum + lineTotal;
    }, 0);

    const netAmount = totalAmount - Number(discountAmount) + Number(taxAmount);

    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        patientId,
        totalAmount,
        discountAmount,
        taxAmount,
        netAmount,
        status: 'UNPAID',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        items: {
          create: items.map((it: any) => ({
            serviceType: it.serviceType,
            itemDescription: it.itemDescription,
            quantity: parseInt(it.quantity, 10),
            unitPrice: it.unitPrice,
            totalPrice: Number(it.quantity) * Number(it.unitPrice),
          })),
        },
      },
      include: {
        items: true,
        patient: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { invoiceId, amountPaid, paymentMethod, transactionRef } = req.body;

    if (!invoiceId || !amountPaid || !paymentMethod) {
      throw new AppError('Invoice ID, amount paid, and payment method are required', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { payments: true },
      });

      if (!invoice) {
        throw new AppError('Invoice not found', 404);
      }

      const totalPaidSoFar = invoice.payments.reduce((s, p) => s + Number(p.amountPaid), 0);
      const newTotalPaid = totalPaidSoFar + Number(amountPaid);

      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amountPaid,
          paymentMethod,
          transactionRef,
          receivedById: req.user?.id,
        },
      });

      let updatedStatus: any = 'PARTIAL';
      if (newTotalPaid >= Number(invoice.netAmount)) {
        updatedStatus = 'PAID';
      }

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: updatedStatus },
        include: { payments: true, items: true, patient: true },
      });

      return { payment, invoice: updatedInvoice };
    });

    return res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
