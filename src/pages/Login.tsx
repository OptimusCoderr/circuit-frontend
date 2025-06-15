import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth.store';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const loginButtonRef = useRef<HTMLButtonElement>(null);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (!email.trim() || !password.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      shakeButton(loginButtonRef);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      shakeButton(loginButtonRef);
      return;
    }

    try {
      console.log('Attempting login with:', { email, password: '***' });
      
      await login(email, password);
      
      // If we get here without throwing, login was successful
      console.log('Login successful, current auth state:', {
        isAuthenticated: useAuthStore.getState().isAuthenticated,
        user: useAuthStore.getState().user,
        token: !!useAuthStore.getState().token
      });
      
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      
      // Navigate immediately since login was successful
      navigate('/dashboard', { replace: true });
      
    } catch (error) {
      console.error('Login error details:', {
        error,
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        stack: error?.stack
      });
      
      // The auth store already shows a toast, so we don't need to show another one
      // Just shake the button to indicate the error
      shakeButton(loginButtonRef);
    }
  };

  const shakeButton = (buttonRef: React.RefObject<HTMLButtonElement>) => {
    if (buttonRef.current) {
      buttonRef.current.classList.add('animate-shake');
      setTimeout(() => {
        buttonRef.current?.classList.remove('animate-shake');
      }, 500);
    }
  };

  const handleGoogleAuth = () => {
    toast({
      title: 'Coming Soon',
      description: 'Google authentication will be implemented with Supabase.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23334155' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <Card className="w-full max-w-md bg-slate-800/90 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Zap className="h-8 w-8 text-emerald-400 mr-2" />
              <Activity className="h-4 w-4 text-blue-400 absolute -top-1 -right-1" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Energy Monitor</CardTitle>
          <CardDescription className="text-slate-400">
            Sign in to your energy control dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-400"
                placeholder="admin@energymonitor.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-400"
                placeholder="••••••••"
                required
              />
            </div>
            <Button
              type="submit"
              ref={loginButtonRef}
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
