import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
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
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/dashboard/metrics');
      if (res.data.success) {
        setMetrics(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load dashboard metrics', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground font-medium text-sm">
        Loading hospital metrics...
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Patients',
      value: metrics?.totalPatients || 0,
      icon: Users,
      bgColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
      link: '/patients',
    },
    {
      title: "Today's Appointments",
      value: metrics?.todayAppointments || 0,
      icon: Calendar,
      bgColor: 'bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400',
      link: '/appointments',
    },
    {
      title: 'Active Admissions',
      value: metrics?.activeAdmissions || 0,
      icon: BedDouble,
      bgColor: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
      link: '/inpatient',
    },
    {
      title: 'Pending Lab Tests',
      value: metrics?.pendingLabs || 0,
      icon: FlaskConical,
      bgColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
      link: '/laboratory',
    },
    {
      title: 'Low Stock Alerts',
      value: metrics?.lowStockCount || 0,
      icon: AlertTriangle,
      bgColor: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
      link: '/pharmacy',
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${(metrics?.totalRevenue || 0).toLocaleString()}`,
      icon: Banknote,
      bgColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
      link: '/billing',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <Card className="bg-slate-900 text-white border-none shadow-md overflow-hidden">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {user?.username} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              CareSync HMS is running live. Operational summary for today.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary" size="sm" className="gap-2">
              <Link to="/patients">
                <PlusCircle className="w-4 h-4" />
                Register Patient
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-2">
              <Link to="/appointments">
                <Calendar className="w-4 h-4" />
                Book Appointment
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={idx} to={card.link} className="block group">
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-2">{card.value}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className={`p-3.5 rounded-xl ${card.bgColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

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
            {metrics?.recentAppointments?.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No recent appointments found.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics?.recentAppointments?.map((apt: any) => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium">
                        {apt.patient.firstName} {apt.patient.lastName}
                        <span className="block text-xs font-normal text-muted-foreground">
                          {apt.patient.patientCode}
                        </span>
                      </TableCell>
                      <TableCell>
                        Dr. {apt.doctor.user.username}
                        <span className="block text-xs text-muted-foreground">
                          {apt.doctor.department.name}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{apt.timeSlot}</TableCell>
                      <TableCell>
                        <Badge variant="success">
                          {apt.status}
                        </Badge>
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
            <CardDescription>Common administrative & clinical desk actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <Link
              to="/emr"
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 rounded-lg">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Clinical Consultation</p>
                  <p className="text-[11px] text-muted-foreground">Record diagnosis & Rx</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            <Link
              to="/billing"
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 rounded-lg">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Billing & Invoicing</p>
                  <p className="text-[11px] text-muted-foreground">Generate bills & receipts</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            <Link
              to="/pharmacy"
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Pharmacy Dispensation</p>
                  <p className="text-[11px] text-muted-foreground">Fulfill pending prescriptions</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
