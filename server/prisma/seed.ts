import { PrismaClient, Role, Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const passwordHash = await bcrypt.hash('Admin@123', 10);

  // 1. Departments
  const deptGeneral = await prisma.department.upsert({
    where: { name: 'General Medicine' },
    update: {},
    create: {
      name: 'General Medicine',
      description: 'Comprehensive primary health care and outpatient consultations',
    },
  });

  const deptCardio = await prisma.department.upsert({
    where: { name: 'Cardiology' },
    update: {},
    create: {
      name: 'Cardiology',
      description: 'Comprehensive cardiovascular diagnosis and treatment',
    },
  });

  const deptPediatrics = await prisma.department.upsert({
    where: { name: 'Pediatrics' },
    update: {},
    create: {
      name: 'Pediatrics',
      description: 'Medical care for infants, children, and adolescents',
    },
  });

  // 2. Admin User
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@caresync.hms',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // 3. Doctor 1 (Dr. Robert Smith - Cardiology)
  const doctorUser1 = await prisma.user.upsert({
    where: { username: 'dr_smith' },
    update: {},
    create: {
      username: 'dr_smith',
      email: 'dr.smith@caresync.hms',
      passwordHash,
      role: Role.DOCTOR,
    },
  });

  const doctor1 = await prisma.doctor.upsert({
    where: { userId: doctorUser1.id },
    update: {},
    create: {
      userId: doctorUser1.id,
      departmentId: deptCardio.id,
      specialization: 'Cardiologist',
      licenseNumber: 'DOC-CARDIO-8821',
      consultationFee: 150.0,
      isAvailable: true,
      schedules: {
        create: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 20 },
          { dayOfWeek: 3, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 20 },
          { dayOfWeek: 5, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 20 },
        ],
      },
    },
  });

  // Doctor 2 (Dr. Sarah Connor - General Medicine)
  const doctorUser2 = await prisma.user.upsert({
    where: { username: 'dr_connor' },
    update: {},
    create: {
      username: 'dr_connor',
      email: 'dr.connor@caresync.hms',
      passwordHash,
      role: Role.DOCTOR,
    },
  });

  const doctor2 = await prisma.doctor.upsert({
    where: { userId: doctorUser2.id },
    update: {},
    create: {
      userId: doctorUser2.id,
      departmentId: deptGeneral.id,
      specialization: 'General Physician',
      licenseNumber: 'DOC-GEN-4491',
      consultationFee: 80.0,
      isAvailable: true,
    },
  });

  // 4. Staff Users
  const receptionistUser = await prisma.user.upsert({
    where: { username: 'reception' },
    update: {},
    create: {
      username: 'reception',
      email: 'reception@caresync.hms',
      passwordHash,
      role: Role.RECEPTIONIST,
    },
  });

  const pharmacistUser = await prisma.user.upsert({
    where: { username: 'pharmacist' },
    update: {},
    create: {
      username: 'pharmacist',
      email: 'pharma@caresync.hms',
      passwordHash,
      role: Role.PHARMACIST,
    },
  });

  const labUser = await prisma.user.upsert({
    where: { username: 'labtech' },
    update: {},
    create: {
      username: 'labtech',
      email: 'lab@caresync.hms',
      passwordHash,
      role: Role.LAB_STAFF,
    },
  });

  // 5. Medicines & Inventory
  const paracetamol = await prisma.medicine.create({
    data: {
      name: 'Paracetamol 500mg',
      genericName: 'Acetaminophen',
      category: 'Analgesic',
      unit: 'Tablets',
      unitPrice: 5.0,
      reorderLevel: 50,
      batches: {
        create: [
          {
            batchNumber: 'BATCH-PCM-01',
            expiryDate: new Date('2027-12-31'),
            quantityInStock: 200,
            purchasePrice: 2.0,
            sellingPrice: 5.0,
          },
        ],
      },
    },
  });

  const amoxicillin = await prisma.medicine.create({
    data: {
      name: 'Amoxicillin 500mg',
      genericName: 'Amoxicillin Trihydrate',
      category: 'Antibiotic',
      unit: 'Capsules',
      unitPrice: 12.0,
      reorderLevel: 30,
      batches: {
        create: [
          {
            batchNumber: 'BATCH-AMX-99',
            expiryDate: new Date('2027-06-30'),
            quantityInStock: 80,
            purchasePrice: 6.0,
            sellingPrice: 12.0,
          },
        ],
      },
    },
  });

  // 6. Lab Tests Catalog
  await prisma.labTest.createMany({
    data: [
      { testName: 'Complete Blood Count (CBC)', category: 'Hematology', cost: 35.0, sampleType: 'Blood' },
      { testName: 'Lipid Profile', category: 'Biochemistry', cost: 50.0, sampleType: 'Blood' },
      { testName: 'Fasting Blood Sugar (FBS)', category: 'Biochemistry', cost: 15.0, sampleType: 'Blood' },
      { testName: 'Urinalysis', category: 'Clinical Pathology', cost: 20.0, sampleType: 'Urine' },
    ],
    skipDuplicates: true,
  });

  // 7. Wards & Beds
  const generalWard = await prisma.ward.upsert({
    where: { name: 'Ward A - General' },
    update: {},
    create: {
      name: 'Ward A - General',
      type: 'GENERAL',
      dailyRate: 100.0,
      beds: {
        create: [
          { bedNumber: 'A-101', isOccupied: false },
          { bedNumber: 'A-102', isOccupied: false },
          { bedNumber: 'A-103', isOccupied: false },
          { bedNumber: 'A-104', isOccupied: false },
        ],
      },
    },
  });

  const icuWard = await prisma.ward.upsert({
    where: { name: 'ICU Unit 1' },
    update: {},
    create: {
      name: 'ICU Unit 1',
      type: 'ICU',
      dailyRate: 500.0,
      beds: {
        create: [
          { bedNumber: 'ICU-01', isOccupied: false },
          { bedNumber: 'ICU-02', isOccupied: false },
        ],
      },
    },
  });

  // 8. Sample Patients
  const patient1 = await prisma.patient.upsert({
    where: { patientCode: 'PAT-2026-0001' },
    update: {},
    create: {
      patientCode: 'PAT-2026-0001',
      firstName: 'John',
      lastName: 'Doe',
      dob: new Date('1988-04-12'),
      gender: Gender.MALE,
      bloodGroup: 'O+',
      contactNumber: '+1-555-019-2831',
      email: 'john.doe@example.com',
      address: '742 Evergreen Terrace, Springfield',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '+1-555-019-2832',
      allergies: 'Penicillin',
      medicalHistorySummary: 'Mild hypertension diagnosed in 2024.',
    },
  });

  const patient2 = await prisma.patient.upsert({
    where: { patientCode: 'PAT-2026-0002' },
    update: {},
    create: {
      patientCode: 'PAT-2026-0002',
      firstName: 'Emily',
      lastName: 'Watson',
      dob: new Date('1995-09-23'),
      gender: Gender.FEMALE,
      bloodGroup: 'A+',
      contactNumber: '+1-555-382-9912',
      email: 'emily.watson@example.com',
      address: '10 Downing Crescent, Springfield',
    },
  });

  // Sample Appointment
  await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      doctorId: doctor1.id,
      appointmentDate: new Date(),
      timeSlot: '10:00',
      status: 'CONFIRMED',
      reason: 'Routine cardiac checkup & blood pressure review',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('Credentials:');
  console.log('  Admin:       username: admin      / password: Admin@123');
  console.log('  Doctor:      username: dr_smith   / password: Admin@123');
  console.log('  Reception:   username: reception  / password: Admin@123');
  console.log('  Pharmacist:  username: pharmacist / password: Admin@123');
  console.log('  Lab Tech:    username: labtech    / password: Admin@123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
