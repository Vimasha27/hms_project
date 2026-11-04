import fs from 'fs';
import path from 'path';
import { prisma } from '../src/utils/prisma';

async function restore() {
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    console.error('❌ Backups directory not found.');
    process.exit(1);
  }

  // Find latest backup file or use file specified in CLI argument
  const argFile = process.argv[2];
  let targetFile: string;

  if (argFile) {
    targetFile = path.isAbsolute(argFile) ? argFile : path.join(process.cwd(), argFile);
  } else {
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json')).sort().reverse();
    if (files.length === 0) {
      console.error('❌ No backup JSON files found in server/backups/');
      process.exit(1);
    }
    targetFile = path.join(backupDir, files[0]);
  }

  console.log('🔄 Initiating CareSync HMS Database Restore...');
  console.log(`📁 Source File: ${targetFile}`);

  if (!fs.existsSync(targetFile)) {
    console.error(`❌ File not found: ${targetFile}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(targetFile, 'utf-8');
  const backup = JSON.parse(raw);
  const data = backup.data;

  if (!data) {
    console.error('❌ Invalid backup format: missing "data" key');
    process.exit(1);
  }

  console.log('⏳ Restoring entities in dependency order...');

  const restoreTable = async (name: string, items: any[], createFn: (item: any) => Promise<any>) => {
    if (!items || items.length === 0) return;
    console.log(`  Restoring ${items.length} records into ${name}...`);
    for (const item of items) {
      try {
        await createFn(item);
      } catch (err: any) {
        // Skip duplicate records gracefully
        if (!err.message?.includes('Unique constraint failed')) {
          console.warn(`    ⚠️ Warning in ${name}: ${err.message}`);
        }
      }
    }
  };

  try {
    // 1. Independent Core
    await restoreTable('departments', data.departments, (i) => prisma.department.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('users', data.users, (i) => prisma.user.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('employees', data.employees, (i) => prisma.employee.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('doctors', data.doctors, (i) => prisma.doctor.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('doctorSchedules', data.doctorSchedules, (i) => prisma.doctorSchedule.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('patients', data.patients, (i) => prisma.patient.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('medicines', data.medicines, (i) => prisma.medicine.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('inventoryBatches', data.inventoryBatches, (i) => prisma.inventoryBatch.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('wards', data.wards, (i) => prisma.ward.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('beds', data.beds, (i) => prisma.bed.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('labTests', data.labTests, (i) => prisma.labTest.upsert({ where: { id: i.id }, update: i, create: i }));

    // 2. Clinical & Records
    await restoreTable('appointments', data.appointments, (i) => prisma.appointment.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('medicalRecords', data.medicalRecords, (i) => prisma.medicalRecord.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('prescriptions', data.prescriptions, (i) => prisma.prescription.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('prescriptionItems', data.prescriptionItems, (i) => prisma.prescriptionItem.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('labRequests', data.labRequests, (i) => prisma.labRequest.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('labResults', data.labResults, (i) => prisma.labResult.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('admissions', data.admissions, (i) => prisma.admission.upsert({ where: { id: i.id }, update: i, create: i }));

    // 3. Billing & Admin
    await restoreTable('invoices', data.invoices, (i) => prisma.invoice.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('invoiceItems', data.invoiceItems, (i) => prisma.invoiceItem.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('payments', data.payments, (i) => prisma.payment.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('attendance', data.attendance, (i) => prisma.attendance.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('leaveRequests', data.leaveRequests, (i) => prisma.leaveRequest.upsert({ where: { id: i.id }, update: i, create: i }));
    await restoreTable('auditLogs', data.auditLogs, (i) => prisma.auditLog.upsert({ where: { id: i.id }, update: i, create: i }));

    console.log('✅ Database restore completed successfully!');
  } catch (err: any) {
    console.error('❌ Restore failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

restore();
