'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Hotel, Lock, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Validate password
      if (password !== 'admin123') {
        setError('Invalid password');
        setLoading(false);
        return;
      }

      // Set session/token
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('adminLoginTime', new Date().toISOString());

      // Redirect to admin dashboard
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 500);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg">
                <Hotel className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold text-white">LuxStay Admin</CardTitle>
              <CardDescription className="text-slate-400">
                Access the admin dashboard
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-6 bg-red-500/10 border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-500">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {!showPasswordFields ? (
              <div className="space-y-4">
                <p className="text-slate-300 text-sm text-center mb-6">
                  Welcome back! Enter your credentials to access the admin panel.
                </p>
                <Button
                  onClick={() => setShowPasswordFields(true)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white h-10 text-base"
                  disabled={loading}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Login to Admin Panel
                </Button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-amber-500 focus:ring-amber-500"
                    autoComplete="off"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Default password: admin123
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-amber-500 focus:ring-amber-500"
                    autoComplete="off"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white h-10"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                  onClick={() => {
                    setShowPasswordFields(false);
                    setPassword('');
                    setConfirmPassword('');
                    setError('');
                  }}
                >
                  Back
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-slate-400 text-sm text-center">
                Not an admin?{' '}
                <Link href="/" className="text-amber-500 hover:text-amber-400 font-medium">
                  Go back home
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info card */}
        <Card className="mt-4 border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardContent className="pt-4">
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Note:</strong> This is a secure admin login. Only authorized personnel should have access to the admin password.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
