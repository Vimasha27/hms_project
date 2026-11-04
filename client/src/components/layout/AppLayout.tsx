import React, { useState } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Bell, Menu, Search, Clock, CalendarDays, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const AppLayout: React.FC = () => {
  const { isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/patients?search=${encodeURIComponent(quickSearch.trim())}`);
      setQuickSearch('');
    }
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setMobileMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Shift & Operational Date indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground border-r border-border pr-4 mr-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">{currentDateStr}</span>
              <span className="text-muted-foreground/60">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Live Desk
              </span>
            </div>
          </div>

          {/* Global Patient Search Bar */}
          {hasRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'ACCOUNTANT']) && (
            <form onSubmit={handleQuickSearch} className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                <Input
                  type="search"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="Quick search patient MRN or name... (Enter)"
                  className="h-9 pl-9 text-xs bg-muted/40 border-border focus-visible:ring-primary"
                />
              </div>
            </form>
          )}

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Interactive Notification Popover */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-muted-foreground hover:text-foreground"
                aria-label="View hospital notifications"
                aria-expanded={showNotifications}
              >
                <Bell className="w-5 h-5" />
                <span className="w-2 h-2 bg-primary rounded-full absolute top-2 right-2 ring-2 ring-card" />
              </Button>

              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowNotifications(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-card rounded-xl border border-border shadow-lg p-4 z-40 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Operational Notices
                      </p>
                      <span className="text-[10px] text-muted-foreground font-medium">Live Feed</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-muted/50 border border-border flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">CareSync Core Online</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            PostgreSQL transactional billing and EMR engine connected.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
