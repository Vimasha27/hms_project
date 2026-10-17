import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Pill,
  FlaskConical,
  BedDouble,
  Receipt,
  LogOut,
  Hospital,
  UserCheck,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface NavItem {
  name: string;
  to: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    to: '/',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_STAFF', 'PHARMACIST', 'ACCOUNTANT'],
  },
  {
    name: 'Patients',
    to: '/patients',
    icon: Users,
    roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'ACCOUNTANT'],
  },
  {
    name: 'Appointments',
    to: '/appointments',
    icon: Calendar,
    roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'],
  },
  {
    name: 'Consultation & EMR',
    to: '/emr',
    icon: Stethoscope,
    roles: ['ADMIN', 'DOCTOR'],
  },
  {
    name: 'Pharmacy & Stock',
    to: '/pharmacy',
    icon: Pill,
    roles: ['ADMIN', 'PHARMACIST', 'DOCTOR'],
  },
  {
    name: 'Laboratory',
    to: '/laboratory',
    icon: FlaskConical,
    roles: ['ADMIN', 'LAB_STAFF', 'DOCTOR'],
  },
  {
    name: 'Inpatient (IPD)',
    to: '/inpatient',
    icon: BedDouble,
    roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
  },
  {
    name: 'Billing & Payments',
    to: '/billing',
    icon: Receipt,
    roles: ['ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'],
  },
  {
    name: 'Staff & HR',
    to: '/staff',
    icon: UserCheck,
    roles: ['ADMIN'],
  },
  {
    name: 'Reports & Analytics',
    to: '/reports',
    icon: BarChart3,
    roles: ['ADMIN', 'ACCOUNTANT'],
  },
];

export const Sidebar: React.FC = () => {
  const { user, logout, hasRole } = useAuth();

  return (
    <aside className="w-64 bg-card text-card-foreground border-r border-border flex flex-col min-h-screen">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary text-primary-foreground p-2.5 rounded-lg shadow-sm">
          <Hospital className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base text-foreground leading-tight tracking-wide">CareSync</h1>
          <p className="text-xs text-muted-foreground font-medium">Hospital System</p>
        </div>
      </div>

      <Separator />

      {/* User Mini Profile */}
      <div className="px-6 py-4 flex items-center gap-3 bg-muted/30">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm uppercase shadow-sm">
          {user?.username?.slice(0, 2) || 'US'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{user?.username}</p>
          <Badge variant="secondary" className="text-[10px] py-0 px-2 font-mono tracking-wider uppercase mt-0.5">
            {user?.role}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => hasRole(item.roles))
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
      </nav>

      <Separator />

      {/* Logout */}
      <div className="p-3">
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
};
