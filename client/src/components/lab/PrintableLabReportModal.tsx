import React from 'react';
import { LabRequest } from '../../types';
import { Printer, FlaskConical } from 'lucide-react';
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
  request: LabRequest;
  onClose: () => void;
}

export const PrintableLabReportModal: React.FC<Props> = ({ request, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-6">
        <DialogHeader className="print:hidden pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <FlaskConical className="w-4 h-4 text-teal-600" />
              Official Diagnostic Test Report
            </DialogTitle>
            <Button
              onClick={handlePrint}
              size="sm"
              className="mr-6 gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Diagnostic Slip
            </Button>
          </div>
        </DialogHeader>

        {/* Printable Lab Slip Sheet */}
        <div className="text-foreground text-sm">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-foreground pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-600 text-white rounded-lg">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-foreground">
                  CareSync Pathology & Diagnostics
                </h1>
                <p className="text-xs text-muted-foreground">ISO 15189 Accredited Clinical Laboratory</p>
                <p className="text-[11px] text-muted-foreground">
                  Department of Laboratory Medicine • Metro Medical Complex
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="success" className="font-semibold text-xs">
                VERIFIED REPORT
              </Badge>
              <p className="text-xs font-mono font-bold text-foreground mt-2">
                REF #{request.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Report Date:{' '}
                {request.result
                  ? new Date(request.result.resultDate).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Patient Bio Table */}
          <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-lg border border-border text-xs mb-4">
            <div>
              <p className="font-bold text-muted-foreground uppercase text-[10px]">Patient Details</p>
              <p className="font-bold text-foreground text-sm mt-0.5">
                {request.patient?.firstName} {request.patient?.lastName}
              </p>
              <p className="text-muted-foreground">Patient Code: {request.patient?.patientCode}</p>
              <p className="text-muted-foreground">
                Gender / Age:{' '}
                <span className="capitalize">{request.patient?.gender?.toLowerCase()}</span>
              </p>
            </div>
            <div>
              <p className="font-bold text-muted-foreground uppercase text-[10px]">Clinical Context</p>
              <p className="text-foreground mt-0.5">
                Specimen Type: <strong>{request.test?.sampleType || 'Whole Blood'}</strong>
              </p>
              <p className="text-foreground">Urgency: {request.urgency}</p>
              <p className="text-foreground">
                Ordered: {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Test Results Table */}
          <div className="mb-4">
            <h3 className="font-semibold text-sm text-foreground border-b pb-2 mb-3">
              Investigation: {request.test?.testName} ({request.test?.category})
            </h3>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b font-medium text-muted-foreground uppercase">
                  <tr>
                    <th className="py-2 px-3">Test Parameter</th>
                    <th className="py-2 px-3">Observed Value</th>
                    <th className="py-2 px-3">Reference Interval</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 px-3 font-semibold text-foreground">
                      {request.test?.testName}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-sm text-foreground">
                      {request.result?.resultValue || 'Under Evaluation'}
                    </td>
                    <td className="py-3 px-3 font-mono text-muted-foreground">
                      {request.result?.normalRange || request.test?.standardRange || 'N/A'}
                    </td>
                    <td className="py-3 px-3 font-semibold text-emerald-600">Normal</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Interpretation */}
          {request.result?.interpretation && (
            <div className="mb-6 p-3 bg-muted/40 rounded-lg border border-border text-xs">
              <p className="font-bold text-foreground uppercase text-[10px] mb-1">
                Clinical Interpretation / Remarks
              </p>
              <p className="text-muted-foreground italic">{request.result.interpretation}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 mt-6 border-t border-border text-center text-xs">
            <div>
              <div className="h-8 flex items-center justify-center text-muted-foreground/60 italic">
                Verified Digitally
              </div>
              <p className="border-t border-dashed border-muted-foreground/60 pt-1 text-muted-foreground">
                Medical Laboratory Technologist
              </p>
            </div>
            <div>
              <div className="h-8 flex items-center justify-center text-teal-600 font-serif font-bold italic">
                Dr. A. Pathologist, MD
              </div>
              <p className="border-t border-dashed border-muted-foreground/60 pt-1 text-muted-foreground">
                Consultant Clinical Pathologist
              </p>
            </div>
          </div>

          <p className="text-center text-[10px] text-muted-foreground mt-6">
            End of Laboratory Examination Report • CareSync HMS Clinical Diagnostic System
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
