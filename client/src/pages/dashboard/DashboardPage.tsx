import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { format } from 'date-fns';
import {
  Users,
  Calendar,
  BedDouble,
  FlaskConical,
  AlertTriangle,
  Banknote,
  PlusCircle,
  Stethoscope,
  ArrowRight,
  Clock,
  Pill,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export const DashboardPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.get('/dashboard/metrics');
      if (res.data.success) {
        setMetrics(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load dashboard metrics', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="flex items-center justify-center h-64 text-muted-foreground font-medium text-sm">
        Loading hospital metrics...
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <Card className="border-destructive/40 bg-destructive/5 p-8 text-center space-y-4 max-w-xl mx-auto my-12 shadow-sm">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Live Telemetry Synchronization Failed</h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            CareSync HMS was unable to retrieve live hospital metrics. Network connection or telemetry service is unavailable.
          </p>
        </div>
        <Button onClick={fetchMetrics} className="gap-2 font-semibold">
          <RefreshCw className="w-4 h-4" />
          Retry Telemetry Sync
        </Button>
      </Card>
    );
  }

  const lowStockCount = metrics?.lowStockCount || 0;
  const clinicalFlowMetrics = [
    {
      title: "Today's Appointments",
      detail: 'Scheduled clinic consultations',
      value: metrics?.todayAppointments || 0,
      icon: Calendar,
      link: '/appointments',
    },
    {
      title: 'Active Admissions',
      detail: 'Occupied inpatient ward beds',
      value: metrics?.activeAdmissions || 0,
      icon: BedDouble,
      link: '/inpatient',
    },
    {
      title: 'Pending Lab Tests',
      detail: 'Awaiting specimen or results',
      value: metrics?.pendingLabs || 0,
      icon: FlaskConical,
      link: '/laboratory',
    },
  ];

  const canAccessBilling = hasRole(['ADMIN', 'ACCOUNTANT', 'RECEPTIONIST']);

  const formatDoctorName = (username?: string) => {
    if (!username) return 'Specialist';
    const cleaned = username.replace(/^dr_?/i, '').replace(/_/g, ' ');
    return `Dr. ${cleaned.replace(/\b\w/g, (c) => c.toUpperCase())}`;
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <Badge variant="default" className="text-[10px] tracking-wide">
            SCHEDULED
          </Badge>
        );
      case 'CONFIRMED':
        return (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] tracking-wide">
            CONFIRMED
          </Badge>
        );
      case 'IN_CONSULTATION':
        return (
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] tracking-wide">
            IN CONSULTATION
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge variant="outline" className="text-[10px] tracking-wide">
            COMPLETED
          </Badge>
        );
      case 'CANCELLED':
      case 'NO_SHOW':
        return (
          <Badge variant="destructive" className="text-[10px] tracking-wide">
            {status}
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Unified Executive Command Deck */}
      <Card className="overflow-hidden border-border shadow-sm">
        {/* High-Conviction Command Header */}
        <div className="bg-primary text-primary-foreground px-6 py-7 sm:px-8 sm:py-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-foreground">
              Welcome back, {user?.username}
            </h1>
            <p className="text-sm text-surface">
              CareSync HMS is running live. Operational summary for today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="sm"
              className="gap-2 font-semibold bg-highlight text-foreground hover:bg-light-green shadow-xs"
            >
              <Link to="/patients?action=new">
                <PlusCircle className="w-4 h-4" />
                Register Patient
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent border-surface/40 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <Link to="/appointments?action=new">
                <Calendar className="w-4 h-4" />
                Book Appointment
              </Link>
            </Button>
          </div>
        </div>

        {/* Asymmetric Executive Telemetry Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border bg-card">
          {/* Primary Anchor: Revenue & Patient Master Census */}
          <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-border">
            {canAccessBilling ? (
              <Link
                to="/billing"
                className="group p-6 sm:p-8 flex flex-col justify-between gap-4 hover:bg-muted/40 transition-colors flex-1"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-primary" />
                    Total Revenue (Cumulative)
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold font-mono tabular-nums tracking-tight text-foreground">
                    Rs. {(metrics?.totalRevenue || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Cumulative settled billing & receipt ledger
                  </p>
                </div>
              </Link>
            ) : (
              <div className="p-6 sm:p-8 flex flex-col justify-between gap-4 flex-1">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-primary" />
                    Total Revenue (Cumulative)
                  </span>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold font-mono tabular-nums tracking-tight text-foreground">
                    Rs. {(metrics?.totalRevenue || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Cumulative settled hospital receipts
                  </p>
                </div>
              </div>
            )}

            <Link
              to="/patients"
              className="group px-6 py-5 sm:px-8 flex items-center justify-between gap-4 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-muted text-foreground">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Total Patients (Cumulative)</p>
                  <p className="text-xs text-muted-foreground">Registered master index</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold font-mono tabular-nums tracking-tight text-foreground">
                  {metrics?.totalPatients || 0}
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>

          {/* Center Column: Live Clinical Throughput Strip */}
          <div className="lg:col-span-4 divide-y divide-border flex flex-col justify-between">
            {clinicalFlowMetrics.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.link}
                  to={item.link}
                  className="group px-6 py-4 sm:px-7 flex items-center justify-between gap-4 hover:bg-muted/40 transition-colors flex-1"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2 rounded-lg bg-muted text-foreground shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-2xl font-bold font-mono tabular-nums tracking-tight text-foreground">
                      {item.value}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right Column: Pharmacy Triage & Low Stock Watch */}
          <Link
            to="/pharmacy?filter=low-stock"
            className={`lg:col-span-3 group p-6 sm:p-8 flex flex-col justify-between gap-6 transition-colors ${
              lowStockCount > 0
                ? 'bg-destructive/5 hover:bg-destructive/10'
                : 'hover:bg-muted/40'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div
                className={`p-2.5 rounded-lg ${
                  lowStockCount > 0
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-muted text-foreground'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <Badge variant={lowStockCount > 0 ? 'destructive' : 'secondary'}>
                {lowStockCount > 0 ? 'Action Needed' : 'Stock Healthy'}
              </Badge>
            </div>

            <div>
              <p
                className={`text-4xl sm:text-5xl font-bold font-mono tabular-nums tracking-tight ${
                  lowStockCount > 0 ? 'text-destructive' : 'text-foreground'
                }`}
              >
                {lowStockCount}
              </p>
              <p className="text-sm font-semibold text-foreground mt-2">Low Stock Alerts</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lowStockCount > 0
                  ? 'Batches below reorder threshold'
                  : 'All dispensary batches stocked'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <span>Inspect Inventory</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </Card>

      {/* Recent Appointments & Hospital Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Recent Appointments
              </CardTitle>
              <CardDescription>Latest consultation bookings across clinics</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/appointments" className="text-xs text-primary font-medium">
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {!metrics?.recentAppointments || metrics.recentAppointments.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm text-muted-foreground">No recent appointments scheduled.</p>
                <Button asChild size="sm" variant="outline">
                  <Link to="/appointments?action=new">Book New Appointment</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.recentAppointments.map((apt: any) => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium">
                        <Link
                          to={`/patients/${apt.patient.id}`}
                          className="hover:underline text-foreground hover:text-primary transition-colors"
                        >
                          {apt.patient.firstName} {apt.patient.lastName}
                        </Link>
                        <span className="block text-xs font-normal text-muted-foreground font-mono">
                          {apt.patient.patientCode}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground block">
                          {formatDoctorName(apt.doctor?.user?.username)}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {apt.doctor?.department?.name || 'General Clinic'}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <span className="font-medium text-foreground block">
                          {apt.appointmentDate ? format(new Date(apt.appointmentDate), 'MMM dd') : 'Today'}
                        </span>
                        <span className="text-muted-foreground">{apt.timeSlot}</span>
                      </TableCell>
                      <TableCell>
                        {renderStatusBadge(apt.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Operations panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Hospital Workflows</CardTitle>
            <CardDescription>Role-permitted clinical & desk actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {hasRole(['ADMIN', 'DOCTOR']) && (
              <Link
                to="/emr"
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted text-foreground rounded-lg">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Clinical Consultation</p>
                    <p className="text-xs text-muted-foreground">Record diagnosis & Rx</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            )}

            {canAccessBilling && (
              <Link
                to="/billing?action=new"
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted text-foreground rounded-lg">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Create Patient Invoice</p>
                    <p className="text-xs text-muted-foreground">Issue itemized bill & receipt</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            )}

            {hasRole(['ADMIN', 'PHARMACIST', 'DOCTOR']) && (
              <Link
                to="/pharmacy?filter=low-stock"
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted text-foreground rounded-lg">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Pharmacy Dispensation</p>
                    <p className="text-xs text-muted-foreground">Fulfill Rx & inspect stock</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            )}

            {hasRole(['ADMIN', 'LAB_STAFF', 'DOCTOR']) && (
              <Link
                to="/laboratory"
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted text-foreground rounded-lg">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Laboratory Workbench</p>
                    <p className="text-xs text-muted-foreground">Collect samples & log results</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
