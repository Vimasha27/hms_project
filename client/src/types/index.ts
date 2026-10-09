export type Role =
  | 'ADMIN'
  | 'DOCTOR'
  | 'NURSE'
  | 'RECEPTIONIST'
  | 'LAB_STAFF'
  | 'PHARMACIST'
  | 'ACCOUNTANT';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface Patient {
  id: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  contactNumber: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medicalHistorySummary?: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  userId: string;
  departmentId: string;
  specialization: string;
  licenseNumber: string;
  consultationFee: number;
  isAvailable: boolean;
  user: {
    username: string;
    email: string;
  };
  department: {
    id: string;
    name: string;
  };
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  timeSlot: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  reason?: string;
  notes?: string;
  patient: {
    firstName: string;
    lastName: string;
    patientCode: string;
    contactNumber: string;
  };
  doctor: {
    specialization: string;
    user: {
      username: string;
    };
    department: {
      name: string;
    };
  };
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  symptoms?: string;
  diagnosis: string;
  vitals?: {
    bp?: string;
    pulse?: number;
    temp?: number;
    spo2?: number;
    weight?: number;
  };
  treatmentPlan?: string;
  visitDate: string;
  prescriptions?: Prescription[];
}

export interface Prescription {
  id: string;
  medicalRecordId?: string;
  patientId: string;
  doctorId: string;
  status: 'PENDING' | 'DISPENSED' | 'PARTIAL' | 'CANCELLED';
  notes?: string;
  items: PrescriptionItem[];
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicineId: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
  quantityRequired: number;
  quantityDispensed: number;
  medicine?: Medicine;
}

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  category: string;
  unit: string;
  unitPrice: number;
  reorderLevel: number;
  batches?: InventoryBatch[];
}

export interface InventoryBatch {
  id: string;
  medicineId: string;
  batchNumber: string;
  expiryDate: string;
  quantityInStock: number;
  purchasePrice: number;
  sellingPrice: number;
}

export interface LabRequest {
  id: string;
  patientId: string;
  doctorId: string;
  testId: string;
  status: 'REQUESTED' | 'SAMPLE_COLLECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  urgency: string;
  createdAt: string;
  patient?: Patient;
  test?: {
    testName: string;
    category: string;
    cost: number;
    standardRange?: string;
    sampleType?: string;
  };
  result?: {
    resultValue: string;
    normalRange?: string;
    interpretation?: string;
    resultDate: string;
  };
}

export interface Ward {
  id: string;
  name: string;
  type: string;
  dailyRate: number;
  beds: Bed[];
}

export interface Bed {
  id: string;
  wardId: string;
  bedNumber: string;
  isOccupied: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  netAmount: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'CANCELLED';
  createdAt: string;
  patient?: Patient;
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface InvoiceItem {
  id: string;
  serviceType: 'CONSULTATION' | 'LAB_TEST' | 'PHARMACY' | 'ROOM_CHARGE' | 'PROCEDURE' | 'OTHER';
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amountPaid: number;
  paymentMethod: 'CASH' | 'CARD' | 'ONLINE' | 'INSURANCE';
  transactionRef?: string;
  paymentDate: string;
}
