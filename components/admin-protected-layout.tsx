'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AdminProtectedLayoutProps {
  children: ReactNode;
}

export default function AdminProtectedLayout({ children }: AdminProtectedLayoutProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuth = localStorage.getItem('adminAuthenticated');
    const loginTime = localStorage.getItem('adminLoginTime');

    if (!adminAuth || adminAuth !== 'true') {
      // Redirect to login if not authenticated
      router.push('/admin-login');
      return;
    }

    // Optional: Check if session has expired (24 hours)
    if (loginTime) {
      const loginDate = new Date(loginTime);
      const now = new Date();
      const hoursElapsed = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);

      if (hoursElapsed > 24) {
        // Session expired, redirect to login
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminLoginTime');
        router.push('/admin-login');
        return;
      }
    }

    setIsAuthenticated(true);
  }, [router]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
