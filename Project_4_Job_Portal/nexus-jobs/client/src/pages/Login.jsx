import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, MailCheck, MailWarning } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema } from '@/lib/schemas';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/auth';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = Boolean(location.state?.justRegistered);
  const passwordReset = Boolean(location.state?.passwordReset);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: location.state?.email || '' }
  });

  const onSubmit = async (data) => {
    setUnverifiedEmail(null);
    setResent(false);
    try {
      const user = await login(data);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const redirectTo = location.state?.from?.pathname || (user.role === 'recruiter' ? '/recruiter' : '/seeker');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(error.email || data.email);
      } else {
        toast.error(error.message);
      }
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendVerificationPublic(unverifiedEmail);
      setResent(true);
      toast.success('Verification email sent — check your inbox');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Welcome back</h1>
      <p className="text-sm text-muted-foreground mt-1.5">Log in to continue your job search or hiring.</p>

      {justRegistered && !unverifiedEmail && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
          <MailCheck className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" size={18} />
          <p className="text-xs text-foreground/90">
            Account created! Verify your email using the link we sent you, then log in below.
          </p>
        </div>
      )}

      {passwordReset && !unverifiedEmail && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-success/20 bg-success/5 p-3.5">
          <MailCheck className="h-4.5 w-4.5 text-success shrink-0 mt-0.5" size={18} />
          <p className="text-xs text-foreground/90">Password updated! Log in with your new password below.</p>
        </div>
      )}

      {unverifiedEmail && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 p-3.5">
          <MailWarning className="h-4.5 w-4.5 text-accent-foreground shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <p className="text-xs font-medium text-foreground">Verify your email to log in</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              We sent a link to {unverifiedEmail}{resent ? ' — a new one is on its way' : ''}. Check your inbox.
            </p>
            <Button size="sm" variant="outline" className="mt-2.5 h-8" onClick={handleResend} disabled={resending}>
              {resending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {resent ? 'Resend again' : 'Resend verification email'}
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
