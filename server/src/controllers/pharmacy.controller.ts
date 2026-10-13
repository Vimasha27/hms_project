import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/error.middleware';

export const listMedicines = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;
    const where: any = {};

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { genericName: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ];
    }

    const medicines = await prisma.medicine.findMany({
      where,
      include: {
        batches: {
          orderBy: { expiryDate: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    const enriched = medicines.map((med) => {
      const totalStock = med.batches.reduce((sum, b) => sum + b.quantityInStock, 0);
      return {
        ...med,
        totalStock,
        isLowStock: totalStock <= med.reorderLevel,
      };
    });

    return res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const addMedicine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, genericName, category, unit, unitPrice, reorderLevel = 20 } = req.body;

    if (!name || !category || !unit || unitPrice === undefined) {
      throw new AppError('Name, category, unit, and unit price are required', 400);
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        genericName,
        category,
        unit,
        unitPrice,
        reorderLevel: parseInt(reorderLevel, 10),
      },
    });

    return res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    next(error);
  }
};

export const addBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { medicineId, batchNumber, expiryDate, quantityInStock, purchasePrice, sellingPrice } = req.body;

    if (!medicineId || !batchNumber || !expiryDate || !quantityInStock) {
      throw new AppError('Medicine ID, batch number, expiry date, and quantity are required', 400);
    }

    const batch = await prisma.inventoryBatch.create({
      data: {
        medicineId,
        batchNumber,
        expiryDate: new Date(expiryDate),
        quantityInStock: parseInt(quantityInStock, 10),
        purchasePrice,
        sellingPrice,
      },
    });

    return res.status(201).json({ success: true, data: batch });
  } catch (error) {
    next(error);
  }
};

export const listPendingPrescriptions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { status: 'PENDING' },
      include: {
        patient: {
          select: {
            id: true,
            patientCode: true,
            firstName: true,
            lastName: true,
          },
        },
        doctor: {
          include: { user: { select: { username: true } } },
        },
        items: {
          include: { medicine: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: prescriptions });
  } catch (error) {
    next(error);
  }
};

export const dispensePrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    if (prescription.status === 'DISPENSED') {
      throw new AppError('Prescription has already been dispensed', 400);
    }

    await prisma.$transaction(async (tx) => {
      for (const item of prescription.items) {
        let remainingNeeded = item.quantityRequired;

        // Fetch batches ordered by expiry date (FIFO)
        const batches = await tx.inventoryBatch.findMany({
          where: {
            medicineId: item.medicineId,
            quantityInStock: { gt: 0 },
          },
          orderBy: { expiryDate: 'asc' },
        });

        for (const batch of batches) {
          if (remainingNeeded <= 0) break;
          const deduct = Math.min(batch.quantityInStock, remainingNeeded);
          await tx.inventoryBatch.update({
            where: { id: batch.id },
            data: { quantityInStock: batch.quantityInStock - deduct },
          });
          remainingNeeded -= deduct;
        }

        await tx.prescriptionItem.update({
          where: { id: item.id },
          data: { quantityDispensed: item.quantityRequired - remainingNeeded },
        });
      }

      await tx.prescription.update({
        where: { id },
        data: { status: 'DISPENSED' },
      });
    });

    return res.json({ success: true, message: 'Prescription dispensed successfully' });
  } catch (error) {
    next(error);
  }
};

export const getPharmacyAlerts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [expiringBatches, medicines] = await Promise.all([
      prisma.inventoryBatch.findMany({
        where: {
          expiryDate: { lte: thirtyDaysFromNow },
          quantityInStock: { gt: 0 },
        },
        include: { medicine: true },
        orderBy: { expiryDate: 'asc' },
      }),
      prisma.medicine.findMany({
        include: { batches: true },
      }),
    ]);

    const lowStock = medicines
      .map((med) => {
        const total = med.batches.reduce((sum, b) => sum + b.quantityInStock, 0);
        return {
          id: med.id,
          name: med.name,
          category: med.category,
          totalStock: total,
          reorderLevel: med.reorderLevel,
        };
      })
      .filter((m) => m.totalStock <= m.reorderLevel);

    return res.json({
      success: true,
      data: {
        expiringBatches,
        lowStock,
      },
    });
  } catch (error) {
    next(error);
  }
};
