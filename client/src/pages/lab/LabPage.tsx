import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { LabRequest } from '../../types';
import { FlaskConical, Plus, Droplet, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { PrintableLabReportModal } from '../../components/lab/PrintableLabReportModal';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export const LabPage: React.FC = () => {
  const [requests, setRequests] = useState<LabRequest[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [printingRequest, setPrintingRequest] = useState<LabRequest | null>(null);

  // Result Modal
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LabRequest | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [normalRange, setNormalRange] = useState('');
  const [interpretation, setInterpretation] = useState('');

  // Order Test Modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderPatientId, setOrderPatientId] = useState('');
  const [orderTestId, setOrderTestId] = useState('');
  const [orderUrgency, setOrderUrgency] = useState('ROUTINE');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, testRes, patRes] = await Promise.all([
        api.get('/lab/requests'),
        api.get('/lab/tests'),
        api.get('/patients?limit=100'),
      ]);
      if (reqRes.data.success) setRequests(reqRes.data.data);
      if (testRes.data.success) setTests(testRes.data.data);
      if (patRes.data.success) setPatients(patRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResultModal = (req: LabRequest) => {
    setSelectedRequest(req);
    setNormalRange(req.test?.standardRange || 'Normal');
    setResultValue('');
    setInterpretation('Within normal limits');
    setShowResultModal(true);
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      const res = await api.post(`/lab/requests/${selectedRequest.id}/results`, {
        resultValue,
        normalRange,
        interpretation,
      });

      if (res.data.success) {
        toast.success(`Diagnostic findings recorded for ${selectedRequest.test?.testName}`);
        setShowResultModal(false);
        fetchData();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error submitting test result');
    }
  };

  const handleCollectSpecimen = async (reqId: string) => {
    try {
      const res = await api.patch(`/lab/requests/${reqId}/status`, {
        status: 'SAMPLE_COLLECTED',
      });
      if (res.data.success) {
        toast.success('Specimen collected and status updated to SAMPLE COLLECTED');
        fetchData();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error updating specimen status');
    }
  };

  const handleOrderTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Find default doctor for demo
      const docRes = await api.get('/doctors');
      const doctorId = docRes.data.data[0]?.id;

      await api.post('/lab/requests', {
        patientId: orderPatientId,
        doctorId,
        testId: orderTestId,
        urgency: orderUrgency,
      });

      toast.success('Diagnostic test order submitted');
      setShowOrderModal(false);
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error ordering lab test');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-primary" />
            Laboratory Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Process diagnostic specimen requests, record lab findings, and deliver verified reports.
          </p>
        </div>
        <Button onClick={() => setShowOrderModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Order Lab Test
        </Button>
      </div>

      {/* Requests Table Card */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Loading laboratory queue...</div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No lab requests found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Sample Type</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Result Findings</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-semibold text-foreground">
                      {req.patient?.firstName} {req.patient?.lastName}
                      <span className="block text-xs font-normal text-muted-foreground">
                        {req.patient?.patientCode}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {req.test?.testName}
                      <span className="block text-xs text-muted-foreground">{req.test?.category}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{req.test?.sampleType || 'Blood'}</TableCell>
                    <TableCell>
                      <Badge variant={req.urgency === 'URGENT' ? 'destructive' : 'secondary'}>
                        {req.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          req.status === 'COMPLETED'
                            ? 'success'
                            : req.status === 'SAMPLE_COLLECTED'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {req.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {req.result ? (
                        <div>
                          <p className="font-bold text-foreground">{req.result.resultValue}</p>
                          <p className="text-muted-foreground text-[11px]">{req.result.interpretation}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">
                          {req.status === 'SAMPLE_COLLECTED' ? 'Sample in laboratory queue' : 'Awaiting specimen collection'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {req.status === 'REQUESTED' && (
                          <Button
                            size="sm"
                            className="h-7 text-xs gap-1 bg-amber-500 hover:bg-amber-600 text-white"
                            onClick={() => handleCollectSpecimen(req.id)}
                            title="Acknowledge sample collection from patient"
                          >
                            <Droplet className="w-3.5 h-3.5" />
                            <span>Collect Sample</span>
                          </Button>
                        )}
                        {req.status !== 'COMPLETED' && (
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleOpenResultModal(req)}
                          >
                            Enter Result
                          </Button>
                        )}
                        {req.status === 'COMPLETED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1.5"
                            onClick={() => setPrintingRequest(req)}
                            title="Print Official Diagnostic Lab Slip"
                          >
                            <Printer className="w-3.5 h-3.5 text-primary" />
                            <span>Print Slip</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Result Entry Modal Dialog */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Diagnostic Findings</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground pb-2">
            Test: <strong className="text-foreground">{selectedRequest?.test?.testName}</strong> for{' '}
            {selectedRequest?.patient?.firstName} {selectedRequest?.patient?.lastName}
          </p>

          <form onSubmit={handleSubmitResult} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="resVal">Result Value / Measurements *</Label>
              <Input
                id="resVal"
                required
                placeholder="e.g. 14.2 g/dL, 110 mg/dL, Negative"
                value={resultValue}
                onChange={(e) => setResultValue(e.target.value)}
                className="font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="normRange">Standard Reference Range</Label>
              <Input
                id="normRange"
                placeholder="e.g. 12.0 - 16.0 g/dL"
                value={normalRange}
                onChange={(e) => setNormalRange(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="interp">Clinical Interpretation</Label>
              <Textarea
                id="interp"
                rows={2}
                placeholder="e.g. Normal baseline hematology"
                value={interpretation}
                onChange={(e) => setInterpretation(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowResultModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Verify & Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order Test Modal Dialog */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Laboratory Test</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleOrderTest} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Select Patient *</Label>
              <Select
                value={orderPatientId}
                onValueChange={(val) => setOrderPatientId(val)}
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
              <Label>Select Lab Test *</Label>
              <Select
                value={orderTestId}
                onValueChange={(val) => setOrderTestId(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Choose Test --" />
                </SelectTrigger>
                <SelectContent>
                  {tests.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.testName} (Rs. {Number(t.cost).toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Urgency</Label>
              <Select
                value={orderUrgency}
                onValueChange={(val) => setOrderUrgency(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROUTINE">Routine</SelectItem>
                  <SelectItem value="URGENT">Urgent (STAT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOrderModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Order Test
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {printingRequest && (
        <PrintableLabReportModal
          request={printingRequest}
          onClose={() => setPrintingRequest(null)}
        />
      )}
    </div>
  );
};
