'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Activity,
  CreditCard,
  Megaphone,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/super-admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/super-admin/businesses', label: 'Businesses', icon: Building2 },
  { href: '/super-admin/activity', label: 'Activity Logs', icon: Activity },
  { href: '/super-admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/super-admin/broadcast', label: 'Broadcast', icon: Megaphone },
  { href: '/super-admin/alerts', label: 'Emergency Alerts', icon: AlertTriangle },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (pathname === '/super-admin/login') return;
    const auth = localStorage.getItem('superAdminAuth');
    if (auth !== 'true') {
      router.push('/super-admin/login');
      return;
    }
    setAuthenticated(true);
  }, [router, pathname]);

  if (pathname === '/super-admin/login') {
    return <>{children}</>;
  }

  const logout = () => {
    localStorage.removeItem('superAdminAuth');
    localStorage.removeItem('superAdminToken');
    router.push('/super-admin/login');
  };

  if (!authenticated) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="lg:flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-800 bg-slate-900 transition-transform lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
            <Shield className="h-6 w-6 text-amber-400" />
            <span className="font-bold">Super Admin</span>
          </div>
          <nav className="space-y-1 p-4">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  pathname === href
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-0 w-full border-t border-slate-800 p-4">
            <Button variant="ghost" className="w-full justify-start text-slate-400" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <div className="flex-1 lg:ml-0">
          <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X /> : <Menu />}
            </Button>
            <p className="text-sm text-slate-400">Platform Control Center</p>
          </header>
          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
