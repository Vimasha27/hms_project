import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Invoice, Patient } from '../../types';
import { Receipt, Plus, Trash2, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { PrintableReceiptModal } from '../../components/billing/PrintableReceiptModal';
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

export const BillingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);

  // New Invoice Modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoicePatientId, setInvoicePatientId] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [items, setItems] = useState<any[]>([
    {
      serviceType: 'CONSULTATION',
      itemDescription: 'Cardiology Specialist Consultation Fee',
      quantity: 1,
      unitPrice: 150.0,
    },
  ]);

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'ONLINE' | 'INSURANCE'>('CASH');
  const [transactionRef, setTransactionRef] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, patRes] = await Promise.all([
        api.get('/billing/invoices'),
        api.get('/patients?limit=100'),
      ]);
      if (invRes.data.success) setInvoices(invRes.data.data);
      if (patRes.data.success) setPatients(patRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        serviceType: 'PHARMACY',
        itemDescription: 'Prescribed Medications',
        quantity: 1,
        unitPrice: 25.0,
      },
    ]);
  };

  const removeItemRow = (idx: number) => {
    setItems(items.filter((_, index) => index !== idx));
  };

  const updateItemRow = (idx: number, field: string, val: any) => {
    const updated = [...items];
    updated[idx][field] = val;
    setItems(updated);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, it) => sum + Number(it.quantity) * Number(it.unitPrice), 0);
  };

  const calculateNet = () => {
    return calculateSubtotal() - Number(discountAmount) + Number(taxAmount);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/billing/invoices', {
        patientId: invoicePatientId,
        items,
        discountAmount,
        taxAmount,
      });

      if (res.data.success) {
        toast.success(`Invoice ${res.data.data?.invoiceNumber || ''} generated`);
        setShowInvoiceModal(false);
        fetchData();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error generating invoice');
    }
  };

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    const paidSoFar = inv.payments?.reduce((s, p) => s + Number(p.amountPaid), 0) || 0;
    const remaining = Number(inv.netAmount) - paidSoFar;
    setPaymentAmount(Math.max(0, remaining));
    setTransactionRef(`TXN-${Date.now().toString().slice(-6)}`);
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      const res = await api.post('/billing/payments', {
        invoiceId: selectedInvoice.id,
        amountPaid: Number(paymentAmount),
        paymentMethod,
        transactionRef,
      });

      if (res.data.success) {
        toast.success(`Payment of Rs. ${Number(paymentAmount).toFixed(2)} recorded`);
        setShowPaymentModal(false);
        fetchData();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error processing payment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary" />
            Billing & Invoicing Ledger
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate comprehensive hospital bills, record patient payments, and track revenue reconciliation.
          </p>
        </div>
        <Button onClick={() => setShowInvoiceModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Invoice
        </Button>
      </div>

      {/* Invoices Table Card */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Loading billing ledger...</div>
          ) : invoices.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No invoices on file.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Line Items</TableHead>
                  <TableHead>Net Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono font-bold text-xs text-primary">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {inv.patient?.firstName} {inv.patient?.lastName}
                      <span className="block text-xs font-normal text-muted-foreground">
                        {inv.patient?.patientCode}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {inv.items?.length || 0} item(s)
                    </TableCell>
                    <TableCell className="font-mono font-bold text-foreground">
                      Rs. {Number(inv.netAmount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.status === 'PAID'
                            ? 'success'
                            : inv.status === 'PARTIAL'
                            ? 'warning'
                            : 'destructive'
                        }
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1.5"
                          onClick={() => setPrintingInvoice(inv)}
                          title="Print Official Invoice / Receipt Slip"
                        >
                          <Printer className="w-3.5 h-3.5 text-primary" />
                          <span>Receipt</span>
                        </Button>
                        {inv.status !== 'PAID' && (
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleOpenPayment(inv)}
                          >
                            Receive Payment
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

      {/* Invoice Modal Dialog */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Hospital Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateInvoice} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Select Patient *</Label>
              <Select
                value={invoicePatientId}
                onValueChange={(val) => setInvoicePatientId(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Choose Patient to Bill --" />
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

            {/* Items Table */}
            <div className="border rounded-lg p-3.5 bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-foreground">Services & Charges</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addItemRow}
                  className="h-7 text-xs text-primary"
                >
                  + Add Charge Item
                </Button>
              </div>

              {items.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-background p-2 rounded-md border border-border">
                  <Select
                    value={it.serviceType}
                    onValueChange={(val) => updateItemRow(idx, 'serviceType', val)}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONSULTATION">Consultation</SelectItem>
                      <SelectItem value="LAB_TEST">Lab Test</SelectItem>
                      <SelectItem value="PHARMACY">Pharmacy</SelectItem>
                      <SelectItem value="ROOM_CHARGE">Room Charge</SelectItem>
                      <SelectItem value="PROCEDURE">Procedure</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Service description"
                    value={it.itemDescription}
                    onChange={(e) => updateItemRow(idx, 'itemDescription', e.target.value)}
                    className="h-8 text-xs flex-1"
                  />

                  <Input
                    type="number"
                    placeholder="Qty"
                    value={it.quantity}
                    onChange={(e) => updateItemRow(idx, 'quantity', Number(e.target.value))}
                    className="h-8 text-xs w-16 font-mono"
                  />

                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={it.unitPrice}
                    onChange={(e) => updateItemRow(idx, 'unitPrice', Number(e.target.value))}
                    className="h-8 text-xs w-24 font-mono"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItemRow(idx)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Financial Calculation */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="discAmt">Discount (Rs.)</Label>
                <Input
                  id="discAmt"
                  type="number"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="txAmt">Tax (Rs.)</Label>
                <Input
                  id="txAmt"
                  type="number"
                  step="0.01"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(Number(e.target.value))}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg flex justify-between items-center text-sm">
              <span className="font-semibold text-foreground">Calculated Net Total:</span>
              <span className="font-mono font-bold text-xl text-foreground">
                Rs. {calculateNet().toFixed(2)}
              </span>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInvoiceModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Generate Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Modal Dialog */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Receive Payment</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground pb-2">
            Invoice #{selectedInvoice?.invoiceNumber} • Patient:{' '}
            {selectedInvoice?.patient?.firstName} {selectedInvoice?.patient?.lastName}
          </p>

          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pAmount">Payment Amount (Rs.) *</Label>
              <Input
                id="pAmount"
                type="number"
                step="0.01"
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="font-mono font-bold text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Payment Mode *</Label>
              <Select
                value={paymentMethod}
                onValueChange={(val: any) => setPaymentMethod(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Credit / Debit Card</SelectItem>
                  <SelectItem value="ONLINE">Online Transfer / UPI</SelectItem>
                  <SelectItem value="INSURANCE">Insurance Claim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="txRef">Reference / Transaction ID</Label>
              <Input
                id="txRef"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Record Payment & Issue Receipt
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {printingInvoice && (
        <PrintableReceiptModal
          invoice={printingInvoice}
          onClose={() => setPrintingInvoice(null)}
        />
      )}
    </div>
  );
};
