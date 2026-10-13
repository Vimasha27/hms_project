import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Users, Plus, Calendar, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
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

export const StaffPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'leaves'>('employees');
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // New Employee Form
  const [newEmp, setNewEmp] = useState({
    firstName: '',
    lastName: '',
    designation: 'Staff Nurse',
    departmentId: '',
    phone: '',
    email: '',
    salary: 45000,
  });

  // New Leave Form
  const [newLeave, setNewLeave] = useState({
    employeeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    leaveType: 'Sick',
    reason: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAttendance();
    } else if (activeTab === 'leaves') {
      fetchLeaves();
    }
  }, [activeTab, selectedDate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [empRes, deptRes] = await Promise.all([
        api.get('/staff/employees'),
        api.get('/doctors/departments'),
      ]);
      if (empRes.data.success) setEmployees(empRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await api.get(`/staff/attendance?date=${selectedDate}`);
      if (res.data.success) setAttendance(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/staff/leaves');
      if (res.data.success) setLeaves(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(newEmp.phone)) {
      toast.error('Phone number must be exactly 10 numeric digits');
      return;
    }
    try {
      const res = await api.post('/staff/employees', newEmp);
      if (res.data.success) {
        toast.success(`Employee ${newEmp.firstName} ${newEmp.lastName} registered successfully`);
        setShowEmployeeModal(false);
        fetchInitialData();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error registering employee');
    }
  };

  const handleMarkAttendance = async (employeeId: string, status: string) => {
    try {
      await api.post('/staff/attendance', {
        employeeId,
        date: selectedDate,
        status,
        checkIn: new Date().toISOString(),
      });
      toast.success(`Attendance logged as ${status}`);
      fetchAttendance();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error recording attendance');
    }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/staff/leaves', newLeave);
      if (res.data.success) {
        toast.success('Leave request submitted successfully');
        setShowLeaveModal(false);
        fetchLeaves();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error submitting leave request');
    }
  };

  const handleUpdateLeaveStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/staff/leaves/${id}/status`, { status });
      toast.success(`Leave request updated to ${status}`);
      fetchLeaves();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error updating leave');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Staff & Human Resources
          </h1>
          <p className="text-sm text-muted-foreground">
            Employee profiles, department assignments, shift attendance, and leave management.
          </p>
        </div>
        <div className="flex gap-2">
          {hasRole(['ADMIN']) && (
            <Button onClick={() => setShowEmployeeModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Register Employee
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowLeaveModal(true)} className="gap-2">
            <FileText className="w-4 h-4" />
            Apply Leave
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="grid w-full sm:w-[500px] grid-cols-3">
          <TabsTrigger value="employees" className="gap-2">
            <Users className="w-4 h-4" />
            Staff ({employees.length})
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2">
            <Clock className="w-4 h-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="leaves" className="gap-2">
            <Calendar className="w-4 h-4" />
            Leaves ({leaves.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Staff Directory */}
        <TabsContent value="employees" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-12 text-center text-muted-foreground text-sm">Loading staff members...</div>
              ) : employees.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">No employees on record.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff ID</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Salary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-mono font-bold text-xs text-primary">
                          {emp.employeeCode}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {emp.firstName} {emp.lastName}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">
                          {emp.designation}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {emp.department?.name || 'General Administration'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{emp.phone}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {emp.salary ? `Rs. ${Number(emp.salary).toLocaleString()}` : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Attendance Tracker */}
        <TabsContent value="attendance" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4 text-xs">
              <span className="font-semibold text-foreground text-xs uppercase tracking-wider">Select Date:</span>
              <div className="w-44">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status Today</TableHead>
                    <TableHead className="text-right">Quick Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => {
                    const att = attendance.find((a) => a.employeeId === emp.id);
                    return (
                      <TableRow key={emp.id}>
                        <TableCell className="font-semibold text-foreground">
                          {emp.firstName} {emp.lastName}
                          <span className="block text-xs font-normal text-muted-foreground">
                            {emp.employeeCode}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{emp.designation}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {emp.department?.name || 'General Operations'}
                        </TableCell>
                        <TableCell>
                          {att ? (
                            <Badge
                              variant={att.status === 'PRESENT' ? 'success' : 'destructive'}
                            >
                              {att.status}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">Not Logged</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            onClick={() => handleMarkAttendance(emp.id, 'PRESENT')}
                          >
                            Present
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                            onClick={() => handleMarkAttendance(emp.id, 'ABSENT')}
                          >
                            Absent
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Leave Requests */}
        <TabsContent value="leaves" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {leaves.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  No leave requests currently pending or on file.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      {hasRole(['ADMIN']) && <TableHead className="text-right">Approval Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-semibold text-foreground">
                          {l.employee.firstName} {l.employee.lastName}
                          <span className="block text-xs font-normal text-muted-foreground">
                            {l.employee.employeeCode}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-semibold">{l.leaveType}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(l.startDate).toLocaleDateString()} —{' '}
                          {new Date(l.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{l.reason || 'Personal'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              l.status === 'APPROVED'
                                ? 'success'
                                : l.status === 'REJECTED'
                                ? 'destructive'
                                : 'warning'
                            }
                          >
                            {l.status}
                          </Badge>
                        </TableCell>
                        {hasRole(['ADMIN']) && (
                          <TableCell className="text-right space-x-1.5">
                            {l.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50 gap-1"
                                  onClick={() => handleUpdateLeaveStatus(l.id, 'APPROVED')}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 gap-1"
                                  onClick={() => handleUpdateLeaveStatus(l.id, 'REJECTED')}
                                >
                                  <XCircle className="w-3 h-3" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Register Employee */}
      <Dialog open={showEmployeeModal} onOpenChange={setShowEmployeeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register Hospital Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEmployee} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="eFirst">First Name *</Label>
                <Input
                  id="eFirst"
                  required
                  value={newEmp.firstName}
                  onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="eLast">Last Name *</Label>
                <Input
                  id="eLast"
                  required
                  value={newEmp.lastName}
                  onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="eDesig">Designation *</Label>
              <Input
                id="eDesig"
                required
                placeholder="e.g. Senior Nurse, Ward Attendant, Radiologist"
                value={newEmp.designation}
                onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select
                value={newEmp.departmentId}
                onValueChange={(val) => setNewEmp({ ...newEmp, departmentId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- General Operations --" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ePhone">Phone * (10 digits)</Label>
                <Input
                  id="ePhone"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="10 digit phone number"
                  value={newEmp.phone}
                  onChange={(e) =>
                    setNewEmp({ ...newEmp, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="eSal">Salary (Rs.)</Label>
                <Input
                  id="eSal"
                  type="number"
                  value={newEmp.salary}
                  onChange={(e) => setNewEmp({ ...newEmp, salary: Number(e.target.value) })}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEmployeeModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Employee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Apply Leave */}
      <Dialog open={showLeaveModal} onOpenChange={setShowLeaveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Leave Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateLeave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Employee *</Label>
              <Select
                value={newLeave.employeeId}
                onValueChange={(val) => setNewLeave({ ...newLeave, employeeId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Choose Employee --" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Leave Type</Label>
              <Select
                value={newLeave.leaveType}
                onValueChange={(val) => setNewLeave({ ...newLeave, leaveType: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sick">Sick Leave</SelectItem>
                  <SelectItem value="Casual">Casual Leave</SelectItem>
                  <SelectItem value="Annual">Annual Paid Leave</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="lStart">Start Date</Label>
                <Input
                  id="lStart"
                  type="date"
                  required
                  value={newLeave.startDate}
                  onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lEnd">End Date</Label>
                <Input
                  id="lEnd"
                  type="date"
                  required
                  value={newLeave.endDate}
                  onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lReason">Reason</Label>
              <Textarea
                id="lReason"
                rows={2}
                value={newLeave.reason}
                onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLeaveModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
