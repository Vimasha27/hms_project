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
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-primary-500 text-white p-2.5 rounded-xl shadow-md">
          <Hospital className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white leading-tight tracking-wide">CareSync</h1>
          <p className="text-xs text-slate-400 font-medium">Hospital System</p>
        </div>
      </div>

      {/* User Mini Profile */}
      <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-900/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center font-bold text-white text-sm uppercase">
          {user?.username?.slice(0, 2) || 'US'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-primary-300 border border-slate-700 uppercase tracking-wider">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => hasRole(item.roles))
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
