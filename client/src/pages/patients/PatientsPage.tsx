import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Patient } from '../../types';
import { Users, Search, Plus, Eye, Phone } from 'lucide-react';
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

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '1990-01-01',
    gender: 'MALE',
    bloodGroup: 'O+',
    contactNumber: '',
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
    medicalHistorySummary: '',
  });

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/patients?search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setPatients(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load patients', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(formData.contactNumber)) {
      toast.error('Contact phone number must be exactly 10 numeric digits');
      return;
    }
    if (formData.emergencyContactPhone && !/^\d{10}$/.test(formData.emergencyContactPhone)) {
      toast.error('Emergency contact phone must be exactly 10 numeric digits');
      return;
    }
    try {
      const res = await api.post('/patients', formData);
      if (res.data.success) {
        toast.success(`Patient registered successfully: ${formData.firstName} ${formData.lastName}`);
        setShowModal(false);
        fetchPatients();
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          dob: '1990-01-01',
          gender: 'MALE',
          bloodGroup: 'O+',
          contactNumber: '',
          email: '',
          address: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          allergies: '',
          medicalHistorySummary: '',
        });
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error registering patient');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Patient Directory
          </h1>
          <p className="text-sm text-muted-foreground">
            Search, register, and review clinical records for all hospital patients.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Register Patient
        </Button>
      </div>

      {/* Search Input Card */}
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Input
            type="text"
            placeholder="Search by patient name, phone number, or patient code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 p-0 h-auto text-sm"
          />
        </CardContent>
      </Card>

      {/* Patients Table Card */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Loading patient records...
            </div>
          ) : patients.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No patients found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Code</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Gender / DOB</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {p.patientCode}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {p.firstName} {p.lastName}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="capitalize">{p.gender.toLowerCase()}</span> •{' '}
                      {new Date(p.dob).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-semibold text-xs">
                        {p.bloodGroup || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        {p.contactNumber}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="secondary" size="sm" className="gap-1.5 h-8">
                        <Link to={`/patients/${p.id}`}>
                          <Eye className="w-3.5 h-3.5" />
                          360° Profile
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Registration Modal Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(val) => setFormData({ ...formData, gender: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Input
                  id="bloodGroup"
                  placeholder="e.g. A+, B+, O+"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactNumber">Contact Phone * (10 digits)</Label>
                <Input
                  id="contactNumber"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="10 digit phone number"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactNumber: e.target.value.replace(/\D/g, '').slice(0, 10),
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  placeholder="Contact person name"
                  value={formData.emergencyContactName}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyContactName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emergencyContactPhone">Emergency Contact Phone (10 digits)</Label>
                <Input
                  id="emergencyContactPhone"
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="10 digit phone number"
                  value={formData.emergencyContactPhone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContactPhone: e.target.value.replace(/\D/g, '').slice(0, 10),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Residential Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="allergies">Allergies (if any)</Label>
              <Input
                id="allergies"
                placeholder="e.g. Penicillin, Peanuts, Latex"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="medicalHistorySummary">Medical History Summary</Label>
              <Textarea
                id="medicalHistorySummary"
                rows={2}
                placeholder="e.g. Chronic asthma, hypertension, previous surgeries"
                value={formData.medicalHistorySummary}
                onChange={(e) => setFormData({ ...formData, medicalHistorySummary: e.target.value })}
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
                Save & Register
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
