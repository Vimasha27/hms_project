import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FileBarChart,
  Banknote,
  Download,
  Calendar,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const COLORS = ['#287A74', '#38967E', '#5AB27F', '#86CC7B', '#BCE475', '#F9F871'];

export const ReportsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const canViewFinancial = hasRole(['ADMIN', 'ACCOUNTANT']);
  const canViewClinical = hasRole(['ADMIN', 'DOCTOR']);

  const [financialData, setFinancialData] = useState<any>(null);
  const [clinicalData, setClinicalData] = useState<any>(null);
  const [days, setDays] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [days]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const promises: Promise<any>[] = [];
      if (canViewFinancial) {
        promises.push(api.get(`/reports/financial?days=${days}`));
      }
      if (canViewClinical) {
        promises.push(api.get('/reports/clinical'));
      }
      const results = await Promise.all(promises);
      let idx = 0;
      if (canViewFinancial) {
        const finRes = results[idx++];
        if (finRes?.data?.success) setFinancialData(finRes.data.data);
      }
      if (canViewClinical) {
        const clinRes = results[idx++];
        if (clinRes?.data?.success) setClinicalData(clinRes.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!financialData) return;
    const rows = [
      ['Date', 'Revenue (Rs.)'],
      ...(financialData.dailyRevenue || []).map((r: any) => [r.date, r.revenue]),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hms_revenue_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Revenue report CSV downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-primary" />
            Executive Reports & Clinical Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Audit hospital revenue streams, department utilization, diagnostic turnover, and patient trends.
          </p>
        </div>
        {canViewFinancial && (
          <div className="flex items-center gap-3">
            <div className="w-36">
              <Select value={days} onValueChange={(val) => setDays(val)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleExportCSV}
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground font-medium text-sm">
          Generating analytical models...
        </div>
      ) : (
        <>
          {/* Financial Summary KPIs */}
          {canViewFinancial && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Total Invoiced Amount
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-2 font-mono">
                      Rs. {(financialData?.totalBilled || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Aggregated across all clinical charges</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Total Payments Collected
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-2 font-mono">
                      Rs. {(financialData?.totalCollected || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Cash, Card, Online & Insurance settlements</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-destructive">
                      Outstanding Balance (AR)
                    </p>
                    <p className="text-2xl font-bold text-destructive mt-2 font-mono">
                      Rs.{' '}
                      {Math.max(
                        0,
                        (financialData?.totalBilled || 0) - (financialData?.totalCollected || 0)
                      ).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Pending patient billing reconciliations</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row 1: Daily Revenue & Service Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-primary" />
                      Revenue Trajectory (Daily)
                    </CardTitle>
                    <CardDescription>Daily financial collection across time window</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {financialData?.dailyRevenue?.length === 0 ? (
                      <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                        No daily revenue transactions recorded for selected interval.
                      </div>
                    ) : (
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={financialData?.dailyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#cde3dc" />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#204A46' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#204A46' }} />
                            <Tooltip formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']} />
                            <Bar dataKey="revenue" fill="#287A74" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold">Revenue by Service Center</CardTitle>
                    <CardDescription>Departmental revenue contribution</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-64 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={financialData?.serviceBreakdown?.filter((s: any) => s.value > 0) || []}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {financialData?.serviceBreakdown?.map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Charts Row 2: Appointment & Patient Demographics */}
          {canViewClinical && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Appointment Status Distribution
                  </CardTitle>
                  <CardDescription>Current appointments categorized by lifecycle status</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {clinicalData?.appointments?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground">{item.name}</span>
                      <Badge variant="secondary" className="font-mono font-bold">
                        {item.count}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Patient Demographics (Gender)
                  </CardTitle>
                  <CardDescription>Registered patient distribution by gender</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {clinicalData?.patients?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground capitalize">{item.name}</span>
                      <Badge variant="secondary" className="font-mono font-bold">
                        {item.count}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};
