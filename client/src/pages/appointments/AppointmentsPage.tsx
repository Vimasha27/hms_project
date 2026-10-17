import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Appointment, Doctor, Patient } from '../../types';
import { Calendar, Clock, Plus, Filter, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSlot, setNewSlot] = useState('09:00');

  // Form State
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '09:00',
    reason: '',
  });

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  useEffect(() => {
    fetchDoctorsAndPatients();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDoctor, selectedDate]);

  const fetchDoctorsAndPatients = async () => {
    try {
      const [docRes, patRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/patients?limit=100'),
      ]);
      if (docRes.data.success) setDoctors(docRes.data.data);
      if (patRes.data.success) setPatients(patRes.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let query = `?date=${selectedDate}`;
      if (selectedDoctor && selectedDoctor !== 'ALL') query += `&doctorId=${selectedDoctor}`;

      const res = await api.get(`/appointments${query}`);
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/appointments', formData);
      if (res.data.success) {
        toast.success('Appointment booked successfully');
        setShowModal(false);
        fetchAppointments();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error booking appointment');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      toast.success(`Appointment status updated to ${status}`);
      fetchAppointments();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error updating appointment');
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleApt) return;
    try {
      await api.patch(`/appointments/${rescheduleApt.id}/reschedule`, {
        appointmentDate: newDate,
        timeSlot: newSlot,
      });
      toast.success(`Appointment rescheduled to ${newDate} at ${newSlot}`);
      setShowRescheduleModal(false);
      fetchAppointments();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error rescheduling appointment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Appointment Management & Scheduling
          </h1>
          <p className="text-sm text-muted-foreground">
            Schedule patient consultations, avoid slot collisions, and track daily appointment workflows.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Book Appointment
        </Button>
      </div>

      {/* Filter Bar Card */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground text-xs uppercase tracking-wider">Filters:</span>
          </div>
          <div className="w-44">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <div className="w-64">
            <Select
              value={selectedDoctor}
              onValueChange={(val) => setSelectedDoctor(val)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Doctors</SelectItem>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    Dr. {d.user.username} ({d.department.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table Card */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Loading appointment queue...
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No appointments scheduled for selected date.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Reason / Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-mono font-bold text-xs text-primary">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        {apt.timeSlot}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {apt.patient.firstName} {apt.patient.lastName}
                      <span className="block text-xs font-normal text-muted-foreground">
                        {apt.patient.patientCode} • {apt.patient.contactNumber}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-foreground">
                      Dr. {apt.doctor.user.username}
                      <span className="block font-normal text-muted-foreground">
                        {apt.doctor.department.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {apt.reason || 'General checkup'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          apt.status === 'COMPLETED'
                            ? 'default'
                            : apt.status === 'CANCELLED'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {apt.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1.5">
                      {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setRescheduleApt(apt);
                              setNewDate(new Date(apt.appointmentDate).toISOString().split('T')[0]);
                              setNewSlot(apt.timeSlot);
                              setShowRescheduleModal(true);
                            }}
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => updateStatus(apt.id, 'COMPLETED')}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Done
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => updateStatus(apt.id, 'CANCELLED')}
                          >
                            <XCircle className="w-3 h-3" />
                            Cancel
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Booking Modal Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Book New Appointment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBook} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Select Patient *</Label>
              <Select
                value={formData.patientId}
                onValueChange={(val) => setFormData({ ...formData, patientId: val })}
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
              <Label>Select Doctor *</Label>
              <Select
                value={formData.doctorId}
                onValueChange={(val) => setFormData({ ...formData, doctorId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Choose Doctor --" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      Dr. {d.user.username} - {d.specialization} ({d.department.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="aptDate">Date *</Label>
                <Input
                  id="aptDate"
                  type="date"
                  required
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Time Slot *</Label>
                <Select
                  value={formData.timeSlot}
                  onValueChange={(val) => setFormData({ ...formData, timeSlot: val })}
                >
                  <SelectTrigger className="font-mono">
                    <SelectValue placeholder="Select Slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((ts) => (
                      <SelectItem key={ts} value={ts} className="font-mono">
                        {ts}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea
                id="reason"
                rows={2}
                placeholder="e.g. Chest pain follow-up, general physical examination"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Confirm Booking
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal Dialog */}
      <Dialog open={showRescheduleModal} onOpenChange={setShowRescheduleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground pb-2">
            Patient: <strong className="text-foreground">{rescheduleApt?.patient?.firstName} {rescheduleApt?.patient?.lastName}</strong> • Dr. {rescheduleApt?.doctor?.user?.username}
          </p>
          <form onSubmit={handleReschedule} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="reschedDate">New Date *</Label>
                <Input
                  id="reschedDate"
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>New Time Slot *</Label>
                <Select
                  value={newSlot}
                  onValueChange={(val) => setNewSlot(val)}
                >
                  <SelectTrigger className="font-mono">
                    <SelectValue placeholder="Select Slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((ts) => (
                      <SelectItem key={ts} value={ts} className="font-mono">
                        {ts}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRescheduleModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Confirm Reschedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
