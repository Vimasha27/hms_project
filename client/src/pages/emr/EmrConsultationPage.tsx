import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Patient, Medicine } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Plus, Trash2, CheckCircle2, Activity } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export const EmrConsultationPage: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [patientId, setPatientId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');

  // Vitals
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('72');
  const [temp, setTemp] = useState('98.6');
  const [spo2, setSpo2] = useState('99');
  const [weight, setWeight] = useState('70');

  // Prescriptions
  const [prescriptionItems, setPrescriptionItems] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [patRes, medRes] = await Promise.all([
        api.get('/patients?limit=100'),
        api.get('/pharmacy/medicines'),
      ]);
      if (patRes.data.success) setPatients(patRes.data.data);
      if (medRes.data.success) setMedicines(medRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addPrescriptionRow = () => {
    if (medicines.length === 0) return;
    setPrescriptionItems([
      ...prescriptionItems,
      {
        medicineId: medicines[0].id,
        dosage: '1 Tablet',
        frequency: '1-0-1',
        durationDays: 5,
        instructions: 'After meals',
        quantityRequired: 10,
      },
    ]);
  };

  const removePrescriptionRow = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, idx) => idx !== index));
  };

  const updatePrescriptionRow = (index: number, field: string, val: any) => {
    const updated = [...prescriptionItems];
    updated[index][field] = val;
    setPrescriptionItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    if (!patientId || !diagnosis) {
      toast.error('Please select a patient and enter a diagnosis.');
      return;
    }

    try {
      const doctorId = (user as any)?.doctor?.id;
      // If logged in as admin without doctor record, fetch first doctor
      let targetDoctorId = doctorId;
      if (!targetDoctorId) {
        const docRes = await api.get('/doctors');
        if (docRes.data.success && docRes.data.data.length > 0) {
          targetDoctorId = docRes.data.data[0].id;
        }
      }

      const res = await api.post('/emr/consultations', {
        patientId,
        doctorId: targetDoctorId,
        symptoms,
        diagnosis,
        treatmentPlan,
        vitals: {
          bp,
          pulse: Number(pulse),
          temp: Number(temp),
          spo2: Number(spo2),
          weight: Number(weight),
        },
        prescriptionItems,
      });

      if (res.data.success) {
        const msg = 'Consultation and prescription successfully saved to patient record!';
        setSuccessMsg(msg);
        toast.success(msg);
        // Reset form
        setSymptoms('');
        setDiagnosis('');
        setTreatmentPlan('');
        setPrescriptionItems([]);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error recording consultation');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-primary" />
          Clinical Consultation & Prescription Pad
        </h1>
        <p className="text-sm text-muted-foreground">
          Record diagnosis, vitals, patient observations, and generate digital prescriptions.
        </p>
      </div>

      {successMsg && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">1. Patient Information</CardTitle>
            <CardDescription>Select the patient being examined for this visit</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1.5">
              <Label>Select Patient *</Label>
              <Select value={patientId} onValueChange={(val) => setPatientId(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Choose Patient for Examination --" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.patientCode}) • Blood: {p.bloodGroup || 'N/A'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Vitals Recording */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              2. Patient Vitals
            </CardTitle>
            <CardDescription>Clinical vital signs measured at triage / consultation</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bp">BP (mmHg)</Label>
                <Input
                  id="bp"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  placeholder="120/80"
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pulse">Pulse (bpm)</Label>
                <Input
                  id="pulse"
                  type="number"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="temp">Temp (°F)</Label>
                <Input
                  id="temp"
                  type="text"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="spo2">SpO2 (%)</Label>
                <Input
                  id="spo2"
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Assessment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">3. Clinical Examination & Notes</CardTitle>
            <CardDescription>Primary symptoms, formal diagnosis, and advice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-1.5">
              <Label htmlFor="symptoms">Chief Symptoms & Complaints</Label>
              <Textarea
                id="symptoms"
                rows={2}
                placeholder="e.g. Persistent dry cough for 4 days, mild fatigue, low fever"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="diagnosis">Clinical Diagnosis *</Label>
              <Input
                id="diagnosis"
                required
                placeholder="e.g. Acute Bronchitis, Essential Hypertension"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="treatmentPlan">Treatment Plan & Advice</Label>
              <Textarea
                id="treatmentPlan"
                rows={2}
                placeholder="e.g. Stay hydrated, avoid cold beverages, follow-up in 7 days"
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Digital Prescription Builder */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">4. Medication & Prescription (Rx)</CardTitle>
              <CardDescription>Add prescription items to route to pharmacy fulfillment</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPrescriptionRow}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Medicine
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {prescriptionItems.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-6 text-center">
                No medications added. Click "Add Medicine" to prescribe drugs for this consultation.
              </p>
            ) : (
              <div className="space-y-3">
                {prescriptionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-border bg-muted/40 flex flex-wrap gap-3 items-end"
                  >
                    <div className="flex-1 min-w-[180px] space-y-1">
                      <Label className="text-xs">Drug</Label>
                      <Select
                        value={item.medicineId}
                        onValueChange={(val) => updatePrescriptionRow(idx, 'medicineId', val)}
                      >
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="Select Medicine" />
                        </SelectTrigger>
                        <SelectContent>
                          {medicines.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name} ({m.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-xs">Dosage</Label>
                      <Input
                        value={item.dosage}
                        onChange={(e) => updatePrescriptionRow(idx, 'dosage', e.target.value)}
                        placeholder="500mg"
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-xs">Freq</Label>
                      <Input
                        value={item.frequency}
                        onChange={(e) => updatePrescriptionRow(idx, 'frequency', e.target.value)}
                        placeholder="1-0-1"
                        className="h-8 text-xs font-mono bg-background"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <Label className="text-xs">Days</Label>
                      <Input
                        type="number"
                        value={item.durationDays}
                        onChange={(e) =>
                          updatePrescriptionRow(idx, 'durationDays', Number(e.target.value))
                        }
                        className="h-8 text-xs font-mono bg-background"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        value={item.quantityRequired}
                        onChange={(e) =>
                          updatePrescriptionRow(idx, 'quantityRequired', Number(e.target.value))
                        }
                        className="h-8 text-xs font-mono bg-background"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePrescriptionRow(idx)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" className="gap-2 shadow-md">
            <CheckCircle2 className="w-4 h-4" />
            Complete Consultation & Issue Prescription
          </Button>
        </div>
      </form>
    </div>
  );
};
