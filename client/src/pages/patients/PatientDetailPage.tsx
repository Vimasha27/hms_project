import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Stethoscope,
  Calendar,
  FlaskConical,
  Receipt,
  ArrowLeft,
  FileText,
  Upload,
  Edit,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'emr' | 'appointments' | 'labs' | 'billing' | 'documents'>('emr');
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    contactNumber: '',
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
    medicalHistorySummary: '',
  });

  useEffect(() => {
    fetchPatient();
    fetchDocuments();
  }, [id]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/patients/${id}`);
      if (res.data.success) {
        setPatient(res.data.data);
        setEditForm({
          contactNumber: res.data.data.contactNumber || '',
          email: res.data.data.email || '',
          address: res.data.data.address || '',
          emergencyContactName: res.data.data.emergencyContactName || '',
          emergencyContactPhone: res.data.data.emergencyContactPhone || '',
          allergies: res.data.data.allergies || '',
          medicalHistorySummary: res.data.data.medicalHistorySummary || '',
        });
      }
    } catch (e) {
      console.error('Failed to load patient profile', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/documents/${id}`);
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(editForm.contactNumber)) {
      toast.error('Contact phone number must be exactly 10 numeric digits');
      return;
    }
    if (editForm.emergencyContactPhone && !/^\d{10}$/.test(editForm.emergencyContactPhone)) {
      toast.error('Emergency contact phone must be exactly 10 numeric digits');
      return;
    }
    try {
      const res = await api.put(`/patients/${id}`, editForm);
      if (res.data.success) {
        toast.success('Patient demographics updated successfully');
        setShowEditModal(false);
        fetchPatient();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error updating patient details');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingDoc(true);
      const res = await api.post(`/documents/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        toast.success('Document uploaded to repository');
        fetchDocuments();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error uploading document');
    } finally {
      setUploadingDoc(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-medium text-sm">Loading patient profile...</div>;
  }

  if (!patient) {
    return (
      <div className="p-8 text-center text-muted-foreground font-medium text-sm">
        Patient not found.{' '}
        <Link to="/patients" className="text-primary underline">
          Return to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
          <Link to="/patients">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Patient Directory
          </Link>
        </Button>
      </div>

      {/* Header Profile Card */}
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl uppercase shadow-xs">
              {patient.firstName[0]}
              {patient.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {patient.firstName} {patient.lastName}
                </h1>
                <Badge variant="outline" className="font-mono text-xs">
                  {patient.patientCode}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered on {new Date(patient.createdAt).toLocaleDateString()} •{' '}
                <span className="capitalize">{patient.gender.toLowerCase()}</span> • DOB:{' '}
                {new Date(patient.dob).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Quick Highlights & Edit button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg text-center min-w-[90px]">
              <p className="text-[10px] font-bold text-destructive uppercase tracking-wider">Blood</p>
              <p className="text-sm font-bold text-destructive mt-0.5">{patient.bloodGroup || 'N/A'}</p>
            </div>
            {patient.allergies && (
              <div className="px-3 py-2 bg-muted border border-border rounded-lg max-w-[200px]">
                <p className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Allergies
                </p>
                <p className="text-xs font-semibold text-muted-foreground truncate mt-0.5">
                  {patient.allergies}
                </p>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
              className="gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Demographics Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-5 space-y-3 text-xs">
            <h3 className="font-bold text-foreground uppercase tracking-wider text-[11px] mb-2">
              Contact Information
            </h3>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-3.5 h-3.5 text-muted-foreground/70" />
              {patient.contactNumber}
            </p>
            {patient.email && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3.5 h-3.5 text-muted-foreground/70" />
                {patient.email}
              </p>
            )}
            {patient.address && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground/70" />
                {patient.address}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3 text-xs">
            <h3 className="font-bold text-foreground uppercase tracking-wider text-[11px] mb-2">
              Emergency Contact
            </h3>
            <p className="text-foreground font-semibold">{patient.emergencyContactName || 'None listed'}</p>
            <p className="text-muted-foreground">{patient.emergencyContactPhone || 'No phone provided'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3 text-xs">
            <h3 className="font-bold text-foreground uppercase tracking-wider text-[11px] mb-2">
              Clinical Summary
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {patient.medicalHistorySummary || 'No chronic conditions recorded.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 h-auto p-1 gap-1">
          <TabsTrigger value="emr" className="gap-2 text-xs py-2">
            <Stethoscope className="w-3.5 h-3.5" />
            Medical History ({patient.medicalRecords?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2 text-xs py-2">
            <Calendar className="w-3.5 h-3.5" />
            Appointments ({patient.appointments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="labs" className="gap-2 text-xs py-2">
            <FlaskConical className="w-3.5 h-3.5" />
            Lab Requests ({patient.labRequests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2 text-xs py-2">
            <Receipt className="w-3.5 h-3.5" />
            Invoices ({patient.invoices?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2 text-xs py-2">
            <FileText className="w-3.5 h-3.5" />
            Documents ({documents.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: EMR */}
        <TabsContent value="emr" className="space-y-4 mt-4">
          {patient.medicalRecords?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                No clinical consultations recorded yet.
              </CardContent>
            </Card>
          ) : (
            patient.medicalRecords?.map((rec: any) => (
              <Card key={rec.id} className="space-y-4">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">{rec.diagnosis}</CardTitle>
                      <CardDescription>
                        Attending: Dr. {rec.doctor.user.username} •{' '}
                        {new Date(rec.visitDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {rec.vitals && Object.keys(rec.vitals).length > 0 && (
                      <div className="flex gap-2 text-xs">
                        {rec.vitals.bp && (
                          <Badge variant="secondary" className="font-mono">
                            BP: {rec.vitals.bp}
                          </Badge>
                        )}
                        {rec.vitals.pulse && (
                          <Badge variant="secondary" className="font-mono">
                            Pulse: {rec.vitals.pulse} bpm
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {rec.symptoms && (
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Symptoms:</strong> {rec.symptoms}
                    </p>
                  )}

                  {rec.treatmentPlan && (
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Treatment Plan:</strong> {rec.treatmentPlan}
                    </p>
                  )}

                  {rec.prescriptions?.length > 0 && (
                    <div className="pt-2">
                      <h5 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                        Prescribed Medications
                      </h5>
                      <div className="bg-muted/40 rounded-lg p-3 divide-y divide-border text-xs">
                        {rec.prescriptions.map((px: any) =>
                          px.items.map((item: any) => (
                            <div
                              key={item.id}
                              className="py-2 flex items-center justify-between first:pt-0 last:pb-0"
                            >
                              <div>
                                <p className="font-bold text-foreground">{item.medicine?.name}</p>
                                <p className="text-muted-foreground">
                                  {item.dosage} • {item.frequency} for {item.durationDays} days{' '}
                                  {item.instructions && `(${item.instructions})`}
                                </p>
                              </div>
                              <span className="font-mono text-muted-foreground font-semibold">
                                Qty: {item.quantityRequired}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tab 2: Appointments */}
        <TabsContent value="appointments" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.appointments?.map((apt: any) => (
                    <TableRow key={apt.id}>
                      <TableCell className="text-xs font-semibold">
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{apt.timeSlot}</TableCell>
                      <TableCell>
                        Dr. {apt.doctor.user.username} ({apt.doctor.department.name})
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{apt.reason || 'Routine'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {apt.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Labs */}
        <TabsContent value="labs" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Ordered By</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.labRequests?.map((lab: any) => (
                    <TableRow key={lab.id}>
                      <TableCell className="font-bold text-foreground">{lab.test.testName}</TableCell>
                      <TableCell className="text-xs">Dr. {lab.doctor.user.username}</TableCell>
                      <TableCell className="text-xs">{lab.urgency}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {lab.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {lab.result ? (
                          <span className="font-semibold text-foreground">
                            {lab.result.resultValue}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">Pending</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Billing */}
        <TabsContent value="billing" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Net Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.invoices?.map((inv: any) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono font-bold text-xs text-primary">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-mono">Rs. {Number(inv.totalAmount).toFixed(2)}</TableCell>
                      <TableCell className="font-mono font-bold text-foreground">
                        Rs. {Number(inv.netAmount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={inv.status === 'PAID' ? 'default' : 'outline'}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Documents & Scans */}
        <TabsContent value="documents" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">Patient File Repository</CardTitle>
                <CardDescription>
                  Upload scans, medical histories, discharge slips, and external clinical reports (PDF, JPG, PNG).
                </CardDescription>
              </div>
              <div>
                <Label htmlFor="doc-upload" className="cursor-pointer">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-xs font-semibold shadow-sm transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingDoc ? 'Uploading File...' : 'Upload Document'}
                  </div>
                  <Input
                    id="doc-upload"
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploadingDoc}
                    className="hidden"
                  />
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {documents.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  No external documents uploaded yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Title</TableHead>
                      <TableHead>Uploaded On</TableHead>
                      <TableHead>File Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-semibold text-foreground flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          {doc.originalName}
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {(doc.fileSize / 1024).toFixed(1)} KB
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="secondary" size="sm" className="gap-1.5 h-8">
                            <a
                              href={`http://localhost:5000/uploads/patients/${doc.fileName}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              View / Download
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Patient Modal Dialog */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient Demographics</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="editContact">Contact Phone * (10 digits)</Label>
                <Input
                  id="editContact"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="10 digit phone number"
                  value={editForm.contactNumber}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      contactNumber: e.target.value.replace(/\D/g, '').slice(0, 10),
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="editEmail">Email Address</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editAddress">Residential Address</Label>
              <Input
                id="editAddress"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="editEmName">Emergency Contact Name</Label>
                <Input
                  id="editEmName"
                  value={editForm.emergencyContactName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, emergencyContactName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="editEmPhone">Emergency Phone (10 digits)</Label>
                <Input
                  id="editEmPhone"
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="10 digit phone number"
                  value={editForm.emergencyContactPhone}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      emergencyContactPhone: e.target.value.replace(/\D/g, '').slice(0, 10),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editAllergies">Allergies</Label>
              <Input
                id="editAllergies"
                value={editForm.allergies}
                onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editSummary">Medical History Summary</Label>
              <Textarea
                id="editSummary"
                rows={3}
                value={editForm.medicalHistorySummary}
                onChange={(e) =>
                  setEditForm({ ...editForm, medicalHistorySummary: e.target.value })
                }
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
