import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Medicine } from '../../types';
import { Pill, AlertTriangle, Plus, CheckCircle, Package } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export const PharmacyPage: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'prescriptions'>('inventory');
  const [loading, setLoading] = useState(true);
  const [showAddMed, setShowAddMed] = useState(false);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState('');

  // Add Med Form
  const [newMed, setNewMed] = useState({
    name: '',
    genericName: '',
    category: 'Analgesic',
    unit: 'Tablets',
    unitPrice: 5.0,
    reorderLevel: 20,
  });

  // Add Batch Form
  const [newBatch, setNewBatch] = useState({
    batchNumber: '',
    expiryDate: '2027-12-31',
    quantityInStock: 100,
    purchasePrice: 2.5,
    sellingPrice: 5.0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [medRes, rxRes, alertRes] = await Promise.all([
        api.get('/pharmacy/medicines'),
        api.get('/pharmacy/prescriptions'),
        api.get('/pharmacy/alerts'),
      ]);
      if (medRes.data.success) setMedicines(medRes.data.data);
      if (rxRes.data.success) setPrescriptions(rxRes.data.data);
      if (alertRes.data.success) setAlerts(alertRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async (rxId: string) => {
    try {
      const res = await api.post(`/pharmacy/prescriptions/${rxId}/dispense`);
      if (res.data.success) {
        toast.success('Prescription dispensed and inventory updated!');
        fetchData();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error dispensing prescription');
    }
  };

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/pharmacy/medicines', newMed);
      toast.success(`Medicine ${newMed.name} registered`);
      setShowAddMed(false);
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error adding drug');
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/pharmacy/batches', {
        ...newBatch,
        medicineId: selectedMedId,
      });
      toast.success(`Batch ${newBatch.batchNumber} added to stock`);
      setShowAddBatch(false);
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error adding batch');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Pill className="w-6 h-6 text-primary" />
            Pharmacy & Medicine Stock
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor drug batches, fulfill electronic prescriptions, and track expiry dates.
          </p>
        </div>
        <Button onClick={() => setShowAddMed(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Medicine
        </Button>
      </div>

      {/* Expiry & Low Stock Warning Banners */}
      {alerts && (alerts.lowStock?.length > 0 || alerts.expiringBatches?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.lowStock?.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Low Stock Alert ({alerts.lowStock.length} items):</strong>{' '}
                {alerts.lowStock.map((m: any) => `${m.name} (${m.totalStock} left)`).join(', ')}
              </AlertDescription>
            </Alert>
          )}

          {alerts.expiringBatches?.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Expiring Soon ({alerts.expiringBatches.length} batches within 30 days):</strong>{' '}
                {alerts.expiringBatches
                  .map((b: any) => `${b.medicine.name} [${b.batchNumber}]`)
                  .join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="grid w-full sm:w-[480px] grid-cols-2">
          <TabsTrigger value="inventory" className="gap-2">
            <Package className="w-4 h-4" />
            Catalog & Stock ({medicines.length})
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Pending Dispensation ({prescriptions.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Inventory */}
        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicines.map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-semibold text-foreground">
                        {m.name}
                        {m.genericName && (
                          <span className="block text-xs font-normal text-muted-foreground">{m.genericName}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.category}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.unit}</TableCell>
                      <TableCell className="font-mono text-xs">Rs. {Number(m.unitPrice).toFixed(2)}</TableCell>
                      <TableCell className="font-mono font-bold text-foreground text-xs">{m.totalStock}</TableCell>
                      <TableCell>
                        {m.isLowStock ? (
                          <Badge variant="destructive">
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            In Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            setSelectedMedId(m.id);
                            setShowAddBatch(true);
                          }}
                        >
                          + Add Batch
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Prescriptions */}
        <TabsContent value="prescriptions" className="space-y-4 mt-4">
          {prescriptions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground text-sm">
                No pending prescriptions to dispense.
              </CardContent>
            </Card>
          ) : (
            prescriptions.map((rx) => (
              <Card key={rx.id}>
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-foreground">
                        {rx.patient.firstName} {rx.patient.lastName}
                      </h3>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {rx.patient.patientCode}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Prescribed by Dr. {rx.doctor.user.username} •{' '}
                      {new Date(rx.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-3 space-y-1">
                      {rx.items.map((it: any) => (
                        <p key={it.id} className="text-xs text-foreground">
                          • <strong>{it.medicine.name}</strong> ({it.dosage}, {it.frequency},{' '}
                          {it.durationDays} days) — <em>Required: {it.quantityRequired}</em>
                        </p>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDispense(rx.id)}
                    className="gap-2 self-start md:self-center"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Dispense & Deduct Stock
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Modal Add Medicine */}
      <Dialog open={showAddMed} onOpenChange={setShowAddMed}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Medicine</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateMedicine} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="medName">Brand / Drug Name *</Label>
              <Input
                id="medName"
                required
                value={newMed.name}
                onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="genName">Generic Chemical Name</Label>
              <Input
                id="genName"
                value={newMed.genericName}
                onChange={(e) => setNewMed({ ...newMed, genericName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="catName">Category</Label>
                <Input
                  id="catName"
                  value={newMed.category}
                  onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unitName">Unit</Label>
                <Input
                  id="unitName"
                  value={newMed.unit}
                  onChange={(e) => setNewMed({ ...newMed, unit: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="uPrice">Unit Price (Rs.)</Label>
                <Input
                  id="uPrice"
                  type="number"
                  step="0.01"
                  value={newMed.unitPrice}
                  onChange={(e) => setNewMed({ ...newMed, unitPrice: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reorder">Reorder Level</Label>
                <Input
                  id="reorder"
                  type="number"
                  value={newMed.reorderLevel}
                  onChange={(e) =>
                    setNewMed({ ...newMed, reorderLevel: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddMed(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Medicine
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Add Batch */}
      <Dialog open={showAddBatch} onOpenChange={setShowAddBatch}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Inventory Batch</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBatch} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="batchNum">Batch Number *</Label>
              <Input
                id="batchNum"
                required
                placeholder="BATCH-2026-X"
                value={newBatch.batchNumber}
                onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expDate">Expiry Date *</Label>
              <Input
                id="expDate"
                type="date"
                required
                value={newBatch.expiryDate}
                onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bQty">Quantity</Label>
                <Input
                  id="bQty"
                  type="number"
                  value={newBatch.quantityInStock}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, quantityInStock: Number(e.target.value) })
                  }
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bCost">Cost (Rs.)</Label>
                <Input
                  id="bCost"
                  type="number"
                  step="0.01"
                  value={newBatch.purchasePrice}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, purchasePrice: Number(e.target.value) })
                  }
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bSell">Sell (Rs.)</Label>
                <Input
                  id="bSell"
                  type="number"
                  step="0.01"
                  value={newBatch.sellingPrice}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, sellingPrice: Number(e.target.value) })
                  }
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddBatch(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Add Stock Batch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
