import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Ward, Patient, Doctor } from '../../types';
import { BedDouble } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export const InpatientPage: React.FC = () => {
  const [wards, setWards] = useState<Ward[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Admission Modal
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [admitPatientId, setAdmitPatientId] = useState('');
  const [admitDoctorId, setAdmitDoctorId] = useState('');
  const [admitReason, setAdmitReason] = useState('');

  // Discharge Modal
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [activeAdmissionId, setActiveAdmissionId] = useState('');
  const [dischargeSummary, setDischargeSummary] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wardRes, patRes, docRes] = await Promise.all([
        api.get('/inpatient/wards'),
        api.get('/patients?limit=100'),
        api.get('/doctors'),
      ]);
      if (wardRes.data.success) setWards(wardRes.data.data);
      if (patRes.data.success) setPatients(patRes.data.data);
      if (docRes.data.success) setDoctors(docRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdmit = (bed: any) => {
    setSelectedBed(bed);
    setAdmitReason('Inpatient post-operative observation and monitoring');
    setShowAdmitModal(true);
  };

  const handleAdmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/inpatient/admissions', {
        patientId: admitPatientId,
        doctorId: admitDoctorId,
        bedId: selectedBed.id,
        admissionReason: admitReason,
      });

      if (res.data.success) {
        toast.success(`Patient successfully admitted to bed ${selectedBed.bedNumber}`);
        setShowAdmitModal(false);
        fetchData();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error admitting patient');
    }
  };

  const handleDischarge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post(`/inpatient/admissions/${activeAdmissionId}/discharge`, {
        dischargeSummary,
      });

      if (res.data.success) {
        toast.success('Patient discharged and bed freed for allocation');
        setShowDischargeModal(false);
        fetchData();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error discharging patient');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-primary" />
            Inpatient (IPD) & Ward Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time ward occupancy grid, bed assignments, and inpatient admission & discharge tracking.
          </p>
        </div>
      </div>

      {/* Ward Cards */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Loading ward telemetry...</div>
      ) : (
        <div className="space-y-6">
          {wards.map((w: any) => {
            const occupiedCount = w.beds.filter((b: any) => b.isOccupied).length;
            return (
              <Card key={w.id}>
                <CardHeader className="pb-4 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg font-bold">{w.name}</CardTitle>
                      <CardDescription>
                        Type: <span className="font-semibold text-foreground">{w.type}</span> • Daily
                        Rate: <span className="font-semibold text-emerald-600">Rs. {Number(w.dailyRate).toFixed(2)}</span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="self-start sm:self-center font-medium">
                      Occupancy: {occupiedCount} / {w.beds.length} Beds
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  {/* Bed Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {w.beds.map((b: any) => {
                      const activeAdm = b.admissions && b.admissions[0];
                      return (
                        <div
                          key={b.id}
                          className={`p-3.5 rounded-lg border flex flex-col justify-between min-h-[120px] transition-all ${
                            b.isOccupied
                              ? 'bg-destructive/5 border-destructive/20 text-foreground'
                              : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-foreground hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-sm">{b.bedNumber}</span>
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                b.isOccupied ? 'bg-destructive ring-2 ring-destructive/20' : 'bg-emerald-500 ring-2 ring-emerald-500/20'
                              }`}
                            />
                          </div>

                          {b.isOccupied && activeAdm ? (
                            <div className="my-2">
                              <p className="text-xs font-bold truncate">
                                {activeAdm.patient.firstName} {activeAdm.patient.lastName}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                Dr. {activeAdm.doctor.user.username}
                              </p>
                            </div>
                          ) : (
                            <p className="text-[11px] text-emerald-600 font-semibold my-2">
                              Available Bed
                            </p>
                          )}

                          <div>
                            {b.isOccupied && activeAdm ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setActiveAdmissionId(activeAdm.id);
                                  setDischargeSummary('Patient recovered satisfactorily.');
                                  setShowDischargeModal(true);
                                }}
                                className="w-full h-7 text-[11px] font-semibold"
                              >
                                Discharge
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleOpenAdmit(b)}
                                className="w-full h-7 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                Admit Patient
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Admit Modal Dialog */}
      <Dialog open={showAdmitModal} onOpenChange={setShowAdmitModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Inpatient Admission</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground pb-2">
            Assigning bed: <strong className="text-foreground">{selectedBed?.bedNumber}</strong>
          </p>

          <form onSubmit={handleAdmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Select Patient *</Label>
              <Select
                value={admitPatientId}
                onValueChange={(val) => setAdmitPatientId(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Choose Patient --" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.patientCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Attending Doctor *</Label>
              <Select
                value={admitDoctorId}
                onValueChange={(val) => setAdmitDoctorId(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Choose Doctor --" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      Dr. {d.user.username} ({d.department.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admReason">Reason for Admission *</Label>
              <Textarea
                id="admReason"
                rows={2}
                required
                value={admitReason}
                onChange={(e) => setAdmitReason(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdmitModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Confirm Admission
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Discharge Modal Dialog */}
      <Dialog open={showDischargeModal} onOpenChange={setShowDischargeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Patient Discharge Summary</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDischarge} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="disSummary">Discharge Summary Notes *</Label>
              <Textarea
                id="disSummary"
                rows={3}
                required
                value={dischargeSummary}
                onChange={(e) => setDischargeSummary(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDischargeModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Confirm Discharge & Free Bed
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
