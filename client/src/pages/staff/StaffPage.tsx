import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  KeyRound,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Printer,
  Sparkles,
  Lock,
  UserCheck,
  UserX,
  Stethoscope,
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Role, Employee } from '../../types';

interface CredentialSlip {
  employeeCode: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  departmentName: string;
  temporaryPassword: string;
}

const ROLE_DEFAULT_DESIGNATIONS: Record<string, string> = {
  DOCTOR: 'Consultant Physician',
  NURSE: 'Staff Nurse',
  RECEPTIONIST: 'Front Desk Officer',
  PHARMACIST: 'Clinical Pharmacist',
  LAB_STAFF: 'Medical Lab Technician',
  ACCOUNTANT: 'Billing & Accounts Officer',
  ADMIN: 'Hospital Administrator',
};

export const StaffPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'leaves'>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Credential Slip Modal State
  const [credentialSlip, setCredentialSlip] = useState<CredentialSlip | null>(null);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [revealPassword, setRevealPassword] = useState(false);
  const [copiedSlip, setCopiedSlip] = useState(false);

  // Reset Password Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedEmpForReset, setSelectedEmpForReset] = useState<Employee | null>(null);
  const [resetForm, setResetForm] = useState({
    password: '',
    role: 'RECEPTIONIST' as Role,
    username: '',
  });
  const [revealResetPassword, setRevealResetPassword] = useState(false);

  // New Employee Form
  const [newEmp, setNewEmp] = useState({
    firstName: '',
    lastName: '',
    designation: 'Staff Nurse',
    departmentId: '',
    phone: '',
    email: '',
    salary: 45000,
    createAccount: true,
    role: 'NURSE' as Role,
    username: '',
    password: '',
    specialization: '',
    licenseNumber: '',
    consultationFee: 100,
  });
  const [revealFormPassword, setRevealFormPassword] = useState(false);

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

  // Helper to generate a memorable yet secure password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const num = Math.floor(100 + Math.random() * 900);
    return `Care@${code}${num}!`;
  };

  const handleNameChange = (field: 'firstName' | 'lastName', val: string) => {
    const updatedFirst = field === 'firstName' ? val : newEmp.firstName;
    const updatedLast = field === 'lastName' ? val : newEmp.lastName;
    const cleanF = updatedFirst.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanL = updatedLast.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    setNewEmp((prev) => {
      const autoUser = cleanL ? `${cleanF}_${cleanL}` : cleanF;
      const autoEmail = cleanL ? `${cleanF}.${cleanL}@caresync.hms` : `${cleanF}@caresync.hms`;
      return {
        ...prev,
        [field]: val,
        username: !prev.username || prev.username === `${prev.firstName.toLowerCase()}_${prev.lastName.toLowerCase()}` ? autoUser : prev.username,
        email: !prev.email || prev.email.endsWith('@caresync.hms') ? autoEmail : prev.email,
      };
    });
  };

  const handleRoleChange = (role: Role) => {
    setNewEmp((prev) => ({
      ...prev,
      role,
      designation: ROLE_DEFAULT_DESIGNATIONS[role] || prev.designation,
      specialization: role === 'DOCTOR' && !prev.specialization ? 'General Medicine' : prev.specialization,
      licenseNumber: role === 'DOCTOR' && !prev.licenseNumber ? `DOC-${Math.floor(1000 + Math.random() * 9000)}` : prev.licenseNumber,
    }));
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(newEmp.phone)) {
      toast.error('Phone number must be exactly 10 numeric digits');
      return;
    }
    if (newEmp.createAccount && newEmp.role === 'DOCTOR' && !newEmp.departmentId) {
      toast.error('Please assign a department for the Doctor');
      return;
    }

    try {
      const res = await api.post('/staff/employees', newEmp);
      if (res.data.success) {
        toast.success(`Employee ${newEmp.firstName} ${newEmp.lastName} registered successfully`);
        setShowEmployeeModal(false);

        // If workstation credentials were created, show the shareable credential card
        if (res.data.data?.credentials) {
          setCredentialSlip(res.data.data.credentials);
          setShowCredentialModal(true);
        }

        // Reset form
        setNewEmp({
          firstName: '',
          lastName: '',
          designation: 'Staff Nurse',
          departmentId: '',
          phone: '',
          email: '',
          salary: 45000,
          createAccount: true,
          role: 'NURSE',
          username: '',
          password: '',
          specialization: '',
          licenseNumber: '',
          consultationFee: 100,
        });

        fetchInitialData();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error registering employee');
    }
  };

  const openResetModal = (emp: Employee) => {
    setSelectedEmpForReset(emp);
    setResetForm({
      password: generateRandomPassword(),
      role: (emp.user?.role as Role) || 'RECEPTIONIST',
      username: emp.user?.username || `${emp.firstName.toLowerCase()}_${emp.lastName.toLowerCase()}`,
    });
    setShowResetModal(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpForReset) return;

    try {
      const res = await api.post(`/staff/employees/${selectedEmpForReset.id}/reset-password`, resetForm);
      if (res.data.success) {
        toast.success('Credentials updated successfully');
        setShowResetModal(false);

        if (res.data.data?.credentials) {
          setCredentialSlip(res.data.data.credentials);
          setShowCredentialModal(true);
        }

        fetchInitialData();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update credentials');
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    try {
      const res = await api.patch(`/staff/employees/${emp.id}/status`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchInitialData();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update account status');
    }
  };

  const copyFullCredentials = () => {
    if (!credentialSlip) return;
    const loginUrl = `${window.location.origin}/login`;
    const shareText = `CareSync Hospital Management System - Workstation Credentials
------------------------------------------------------------
Employee Name:      ${credentialSlip.fullName}
Employee ID:        ${credentialSlip.employeeCode}
Assigned Role:      ${credentialSlip.role}
Department:         ${credentialSlip.departmentName}
System Login URL:   ${loginUrl}

LOGIN CREDENTIALS:
Username / User ID: ${credentialSlip.username}
Official Email:     ${credentialSlip.email}
Temporary Password: ${credentialSlip.temporaryPassword}
------------------------------------------------------------
* Please log in and keep your workstation credentials safe.`;

    navigator.clipboard.writeText(shareText);
    setCopiedSlip(true);
    toast.success('Credentials copied to clipboard! Ready to share via WhatsApp, Email, or Slack.');
    setTimeout(() => setCopiedSlip(false), 3000);
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

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'DOCTOR':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200';
      case 'NURSE':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200';
      case 'PHARMACIST':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200';
      case 'LAB_STAFF':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200';
      case 'ADMIN':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
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
            Manage hospital employees, user login credentials, department allocations, and shift records.
          </p>
        </div>
        <div className="flex gap-2">
          {hasRole(['ADMIN']) && (
            <Button
              onClick={() => {
                setNewEmp((prev) => ({
                  ...prev,
                  password: generateRandomPassword(),
                }));
                setShowEmployeeModal(true);
              }}
              className="gap-2 shadow-sm"
            >
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
            Staff Directory ({employees.length})
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
                      <TableHead>Designation & Dept</TableHead>
                      <TableHead>Workstation Account</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Salary</TableHead>
                      {hasRole(['ADMIN']) && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-mono font-bold text-xs text-primary">
                          {emp.employeeCode}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-foreground">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">{emp.email || 'No email registered'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-semibold text-foreground">{emp.designation}</div>
                          <div className="text-xs text-muted-foreground">
                            {emp.department?.name || 'General Operations'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {emp.user ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeVariant(
                                    emp.user.role
                                  )}`}
                                >
                                  {emp.user.role}
                                </span>
                                <span
                                  className={`inline-block w-2 h-2 rounded-full ${
                                    emp.user.isActive ? 'bg-emerald-500' : 'bg-destructive'
                                  }`}
                                  title={emp.user.isActive ? 'Active Account' : 'Suspended'}
                                />
                              </div>
                              <div className="font-mono text-xs text-muted-foreground">
                                @{emp.user.username}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">
                              No Account
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{emp.phone}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {emp.salary ? `Rs. ${Number(emp.salary).toLocaleString()}` : '—'}
                        </TableCell>
                        {hasRole(['ADMIN']) && (
                          <TableCell className="text-right space-x-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1 border-primary/30 hover:border-primary text-primary"
                              onClick={() => openResetModal(emp)}
                              title="Reset or Share Login Password"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              {emp.user ? 'Share Password' : 'Create Account'}
                            </Button>
                            {emp.user && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => handleToggleStatus(emp)}
                                title={emp.user.isActive ? 'Suspend User Access' : 'Reactivate User Access'}
                              >
                                {emp.user.isActive ? (
                                  <UserX className="w-3.5 h-3.5 text-destructive" />
                                ) : (
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                )}
                              </Button>
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
                            <Badge variant={att.status === 'PRESENT' ? 'default' : 'destructive'}>
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
                            className="h-7 text-xs"
                            onClick={() => handleMarkAttendance(emp.id, 'PRESENT')}
                          >
                            Present
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 text-xs"
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
                          {new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{l.reason || 'Personal'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              l.status === 'APPROVED'
                                ? 'default'
                                : l.status === 'REJECTED'
                                ? 'destructive'
                                : 'secondary'
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
                                  className="h-7 text-xs gap-1"
                                  onClick={() => handleUpdateLeaveStatus(l.id, 'APPROVED')}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-7 text-xs gap-1"
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

      {/* Modal 1: Register Employee & Provision Account */}
      <Dialog open={showEmployeeModal} onOpenChange={setShowEmployeeModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Register Hospital Employee & Workstation Account
            </DialogTitle>
            <DialogDescription>
              Create the staff employment profile and assign their login credentials to access the system.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateEmployee} className="space-y-6 pt-2">
            {/* Section A: Personal & Job Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                1. Personal & Employment Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="eFirst">First Name *</Label>
                  <Input
                    id="eFirst"
                    required
                    placeholder="e.g. Eleanor"
                    value={newEmp.firstName}
                    onChange={(e) => handleNameChange('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="eLast">Last Name *</Label>
                  <Input
                    id="eLast"
                    required
                    placeholder="e.g. Vance"
                    value={newEmp.lastName}
                    onChange={(e) => handleNameChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ePhone">Contact Phone * (10 digits)</Label>
                  <Input
                    id="ePhone"
                    required
                    maxLength={10}
                    inputMode="numeric"
                    placeholder="e.g. 9876543210"
                    value={newEmp.phone}
                    onChange={(e) =>
                      setNewEmp({ ...newEmp, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="eSal">Monthly Salary (Rs.)</Label>
                  <Input
                    id="eSal"
                    type="number"
                    value={newEmp.salary}
                    onChange={(e) => setNewEmp({ ...newEmp, salary: Number(e.target.value) })}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="space-y-1.5">
                  <Label htmlFor="eDesig">Official Designation *</Label>
                  <Input
                    id="eDesig"
                    required
                    placeholder="e.g. Senior Nurse, Front Desk Executive"
                    value={newEmp.designation}
                    onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Section B: Workstation Account & Password Setup */}
            <div className="space-y-4 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    2. Workstation Access & Login Setup
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    The employee will use these credentials to log into CareSync HMS.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={newEmp.createAccount}
                    onChange={(e) => setNewEmp({ ...newEmp, createAccount: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                  />
                  Enable Workstation Login
                </label>
              </div>

              {newEmp.createAccount && (
                <div className="p-4 rounded-xl border bg-muted/30 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Assigned Hospital Role *</Label>
                      <Select
                        value={newEmp.role}
                        onValueChange={(val: any) => handleRoleChange(val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DOCTOR">Doctor / Physician</SelectItem>
                          <SelectItem value="NURSE">Nurse</SelectItem>
                          <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                          <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
                          <SelectItem value="LAB_STAFF">Laboratory Staff</SelectItem>
                          <SelectItem value="ACCOUNTANT">Accountant / Billing</SelectItem>
                          <SelectItem value="ADMIN">System Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="eEmail">Official Email * (Login ID)</Label>
                      <Input
                        id="eEmail"
                        type="email"
                        required={newEmp.createAccount}
                        placeholder="e.g. eleanor.vance@caresync.hms"
                        value={newEmp.email}
                        onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="eUser">Username (Alternative Login ID)</Label>
                      <Input
                        id="eUser"
                        placeholder="e.g. eleanor_vance"
                        value={newEmp.username}
                        onChange={(e) => setNewEmp({ ...newEmp, username: e.target.value })}
                        className="font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ePass">Initial Password *</Label>
                        <button
                          type="button"
                          onClick={() => setNewEmp({ ...newEmp, password: generateRandomPassword() })}
                          className="text-[11px] font-semibold text-primary flex items-center gap-1 hover:underline"
                        >
                          <Sparkles className="w-3 h-3" /> Auto-generate
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="ePass"
                          type={revealFormPassword ? 'text' : 'password'}
                          required={newEmp.createAccount}
                          placeholder="Temporary Password (min 6 chars)"
                          value={newEmp.password}
                          onChange={(e) => setNewEmp({ ...newEmp, password: e.target.value })}
                          className="font-mono text-xs pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setRevealFormPassword(!revealFormPassword)}
                          className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {revealFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Clinical Section (If Doctor Role Selected) */}
                  {newEmp.role === 'DOCTOR' && (
                    <div className="mt-3 p-3.5 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                        <Stethoscope className="w-4 h-4" />
                        Clinical Practitioner Setup
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Specialization</Label>
                          <Input
                            placeholder="e.g. Cardiologist"
                            value={newEmp.specialization}
                            onChange={(e) => setNewEmp({ ...newEmp, specialization: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Medical License # *</Label>
                          <Input
                            required
                            placeholder="e.g. DOC-9921"
                            value={newEmp.licenseNumber}
                            onChange={(e) => setNewEmp({ ...newEmp, licenseNumber: e.target.value })}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Consultation Fee (Rs.)</Label>
                          <Input
                            type="number"
                            value={newEmp.consultationFee}
                            onChange={(e) => setNewEmp({ ...newEmp, consultationFee: Number(e.target.value) })}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowEmployeeModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                <Check className="w-4 h-4" />
                Register & Provision Credentials
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Credential Slip Modal (Ready to Share) */}
      <Dialog open={showCredentialModal} onOpenChange={setShowCredentialModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
              <CheckCircle2 className="w-6 h-6" />
              Workstation Credentials Created
            </div>
            <DialogDescription>
              Share this password and login information directly with the employee.
            </DialogDescription>
          </DialogHeader>

          {credentialSlip && (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl border border-primary/20 bg-muted/40 space-y-3 font-sans">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="text-xs font-bold text-primary tracking-wider uppercase">
                      CareSync HMS Station Access
                    </div>
                    <div className="text-base font-bold text-foreground">{credentialSlip.fullName}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold bg-background px-2 py-1 rounded border">
                      {credentialSlip.employeeCode}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">System Role</span>
                    <span className="font-semibold text-foreground">{credentialSlip.role}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Department</span>
                    <span className="font-semibold text-foreground">{credentialSlip.departmentName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Login Username</span>
                    <span className="font-mono font-semibold text-foreground">@{credentialSlip.username}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Registered Email</span>
                    <span className="font-mono font-semibold text-foreground">{credentialSlip.email}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-primary" />
                      Temporary Password for Handover:
                    </span>
                    <button
                      type="button"
                      onClick={() => setRevealPassword(!revealPassword)}
                      className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      {revealPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {revealPassword ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-background px-3 py-2 rounded-lg border font-mono text-sm font-bold tracking-wider text-primary select-all">
                      {revealPassword ? credentialSlip.temporaryPassword : '••••••••••••••••'}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(credentialSlip.temporaryPassword);
                        toast.success('Password copied to clipboard!');
                      }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Password
                    </Button>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 text-[11px] text-muted-foreground">
                  💡 <strong>Tip for Admin:</strong> Click &ldquo;Copy Shareable Credentials&rdquo; below to copy a pre-formatted message ready to paste into WhatsApp, Email, or SMS to send to the employee.
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.print()}
                  className="gap-1.5 text-xs w-full sm:w-auto"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Slip
                </Button>
                <Button
                  type="button"
                  onClick={copyFullCredentials}
                  className="gap-1.5 text-xs flex-1 bg-primary text-primary-foreground"
                >
                  {copiedSlip ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSlip ? 'Copied to Clipboard!' : 'Copy Shareable Credentials'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCredentialModal(false)}
                  className="text-xs"
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal 3: Reset / Generate Password for Existing Staff */}
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              {selectedEmpForReset?.user ? 'Reset & Share Password' : 'Create Workstation Account'}
            </DialogTitle>
            <DialogDescription>
              Generate or assign a new password for{' '}
              <strong className="text-foreground">
                {selectedEmpForReset?.firstName} {selectedEmpForReset?.lastName}
              </strong>{' '}
              ({selectedEmpForReset?.employeeCode}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
            {!selectedEmpForReset?.user && (
              <>
                <div className="space-y-1.5">
                  <Label>Assigned Role</Label>
                  <Select
                    value={resetForm.role}
                    onValueChange={(val: any) => setResetForm({ ...resetForm, role: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DOCTOR">Doctor</SelectItem>
                      <SelectItem value="NURSE">Nurse</SelectItem>
                      <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                      <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
                      <SelectItem value="LAB_STAFF">Laboratory Staff</SelectItem>
                      <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rUser">Username</Label>
                  <Input
                    id="rUser"
                    value={resetForm.username}
                    onChange={(e) => setResetForm({ ...resetForm, username: e.target.value })}
                    className="font-mono text-xs"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="rPass">New Password</Label>
                <button
                  type="button"
                  onClick={() => setResetForm({ ...resetForm, password: generateRandomPassword() })}
                  className="text-[11px] font-semibold text-primary flex items-center gap-1 hover:underline"
                >
                  <Sparkles className="w-3 h-3" /> Auto-generate
                </button>
              </div>
              <div className="relative">
                <Input
                  id="rPass"
                  type={revealResetPassword ? 'text' : 'password'}
                  required
                  value={resetForm.password}
                  onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })}
                  className="font-mono text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setRevealResetPassword(!revealResetPassword)}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {revealResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowResetModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                <KeyRound className="w-4 h-4" />
                Update & Share Credentials
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 4: Apply Leave */}
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
              <Button type="button" variant="outline" onClick={() => setShowLeaveModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
