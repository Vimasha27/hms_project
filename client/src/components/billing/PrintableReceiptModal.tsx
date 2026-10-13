import React from 'react';
import { Invoice } from '../../types';
import { Printer, Hospital } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Props {
  invoice: Invoice;
  onClose: () => void;
}

export const PrintableReceiptModal: React.FC<Props> = ({ invoice, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const totalPaid = invoice.payments?.reduce((s, p) => s + Number(p.amountPaid), 0) || 0;
  const balanceDue = Math.max(0, Number(invoice.netAmount) - totalPaid);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-6">
        <DialogHeader className="print:hidden pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Printer className="w-4 h-4 text-primary" />
              Official Hospital Invoice Voucher
            </DialogTitle>
            <Button
              onClick={handlePrint}
              size="sm"
              className="mr-6 gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </Button>
          </div>
        </DialogHeader>

        {/* Printable Invoice Sheet */}
        <div className="text-foreground text-sm">
          {/* Hospital Header */}
          <div className="flex justify-between items-start border-b-2 border-foreground pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary text-primary-foreground rounded-lg">
                <Hospital className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-foreground">
                  CareSync Memorial Hospital
                </h1>
                <p className="text-xs text-muted-foreground">Center for Advanced Clinical Care</p>
                <p className="text-[11px] text-muted-foreground">
                  100 Healthcare Blvd, Metro Medical District • Tel: +1 (555) 019-4820
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={invoice.status === 'PAID' ? 'success' : 'outline'} className="font-mono">
                {invoice.status}
              </Badge>
              <p className="text-xs font-mono font-bold text-foreground mt-2">
                {invoice.invoiceNumber}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Date: {new Date(invoice.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Patient Particulars */}
          <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-lg border border-border text-xs mb-4">
            <div>
              <p className="font-bold text-muted-foreground uppercase text-[10px]">Billed To</p>
              <p className="font-bold text-foreground text-sm mt-0.5">
                {invoice.patient?.firstName} {invoice.patient?.lastName}
              </p>
              <p className="text-muted-foreground">MRN / Code: {invoice.patient?.patientCode}</p>
              <p className="text-muted-foreground">Phone: {invoice.patient?.contactNumber}</p>
            </div>
            <div>
              <p className="font-bold text-muted-foreground uppercase text-[10px]">Payment Summary</p>
              <p className="text-foreground mt-0.5">
                Total Billed: <strong className="font-mono">Rs. {Number(invoice.netAmount).toFixed(2)}</strong>
              </p>
              <p className="text-foreground">
                Total Paid: <strong className="font-mono text-emerald-600">Rs. {totalPaid.toFixed(2)}</strong>
              </p>
              <p className="text-foreground">
                Balance Due: <strong className="font-mono text-rose-600">Rs. {balanceDue.toFixed(2)}</strong>
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border rounded-md overflow-hidden mb-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b font-medium text-muted-foreground uppercase">
                <tr>
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Unit Price</th>
                  <th className="p-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoice.items?.map((it) => (
                  <tr key={it.id}>
                    <td className="p-2.5 font-medium text-foreground">{it.itemDescription}</td>
                    <td className="p-2.5 text-muted-foreground">{it.serviceType}</td>
                    <td className="p-2.5 text-center font-mono">{it.quantity}</td>
                    <td className="p-2.5 text-right font-mono">Rs. {Number(it.unitPrice).toFixed(2)}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-foreground">
                      Rs. {Number(it.totalPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotals & Taxes */}
          <div className="flex justify-end pt-2 mb-4">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono">Rs. {Number(invoice.totalAmount).toFixed(2)}</span>
              </div>
              {Number(invoice.discountAmount) > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span className="font-mono">-Rs. {Number(invoice.discountAmount).toFixed(2)}</span>
                </div>
              )}
              {Number(invoice.taxAmount) > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax / Surcharge:</span>
                  <span className="font-mono">+Rs. {Number(invoice.taxAmount).toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-sm text-foreground pt-1">
                <span>Net Payable:</span>
                <span className="font-mono">Rs. {Number(invoice.netAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payments Received History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="mb-4 bg-muted/40 p-3 rounded-lg border border-border text-xs">
              <p className="font-bold text-foreground uppercase text-[10px] mb-1.5">
                Receipt / Transactions Log
              </p>
              {invoice.payments.map((p) => (
                <div key={p.id} className="flex justify-between py-1 text-muted-foreground">
                  <span>
                    {new Date(p.paymentDate).toLocaleDateString()} — {p.paymentMethod}{' '}
                    {p.transactionRef && `(${p.transactionRef})`}
                  </span>
                  <span className="font-mono font-bold text-emerald-600">
                    +Rs. {Number(p.amountPaid).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Hospital Seal & Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 mt-4 border-t border-border text-center text-xs">
            <div>
              <div className="h-8"></div>
              <p className="border-t border-dashed border-muted-foreground/60 pt-1 text-muted-foreground">
                Patient / Relative Signature
              </p>
            </div>
            <div>
              <div className="h-8"></div>
              <p className="border-t border-dashed border-muted-foreground/60 pt-1 text-muted-foreground">
                Authorized Hospital Cashier
              </p>
            </div>
          </div>

          <p className="text-center text-[10px] text-muted-foreground mt-6">
            This is a computer-generated official receipt issued by CareSync Hospital Management System.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
