import fs from 'fs';
import path from 'path';
import { prisma } from '../src/utils/prisma';

async function backup() {
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `hms_backup_${timestamp}.json`);

  console.log('🔄 Initiating CareSync HMS Database Backup...');
  console.log(`📁 Target File: ${backupFile}`);

  try {
    const [
      users,
      departments,
      employees,
      doctors,
      doctorSchedules,
      patients,
      appointments,
      medicalRecords,
      prescriptions,
      prescriptionItems,
      medicines,
      inventoryBatches,
      labTests,
      labRequests,
      labResults,
      wards,
      beds,
      admissions,
      invoices,
      invoiceItems,
      payments,
      attendance,
      leaveRequests,
      auditLogs,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.department.findMany(),
      prisma.employee.findMany(),
      prisma.doctor.findMany(),
      prisma.doctorSchedule.findMany(),
      prisma.patient.findMany(),
      prisma.appointment.findMany(),
      prisma.medicalRecord.findMany(),
      prisma.prescription.findMany(),
      prisma.prescriptionItem.findMany(),
      prisma.medicine.findMany(),
      prisma.inventoryBatch.findMany(),
      prisma.labTest.findMany(),
      prisma.labRequest.findMany(),
      prisma.labResult.findMany(),
      prisma.ward.findMany(),
      prisma.bed.findMany(),
      prisma.admission.findMany(),
      prisma.invoice.findMany(),
      prisma.invoiceItem.findMany(),
      prisma.payment.findMany(),
      prisma.attendance.findMany(),
      prisma.leaveRequest.findMany(),
      prisma.auditLog.findMany(),
    ]);

    const backupData = {
      meta: {
        timestamp: new Date().toISOString(),
        database: 'hms_db',
        totalTables: 24,
      },
      data: {
        users,
        departments,
        employees,
        doctors,
        doctorSchedules,
        patients,
        appointments,
        medicalRecords,
        prescriptions,
        prescriptionItems,
        medicines,
        inventoryBatches,
        labTests,
        labRequests,
        labResults,
        wards,
        beds,
        admissions,
        invoices,
        invoiceItems,
        payments,
        attendance,
        leaveRequests,
        auditLogs,
      },
    };

    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8');

    const stats = fs.statSync(backupFile);
    console.log(`✅ CareSync HMS Database Backup completed successfully!`);
    console.log(`📦 Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`📄 Saved to: ${backupFile}`);
  } catch (error: any) {
    console.error('❌ Backup encountered an error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backup();
