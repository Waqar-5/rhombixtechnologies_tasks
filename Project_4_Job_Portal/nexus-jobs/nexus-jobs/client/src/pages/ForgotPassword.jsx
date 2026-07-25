import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MailCheck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPasswordSchema } from '@/lib/schemas';
import { authApi } from '@/api/auth';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async ({ email }) => {
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success mb-4">
          <MailCheck className="h-6 w-6" />
        </div>
        <h1 className="font-display text-xl font-bold">Check your inbox</h1>
        <p className="text-sm text-muted-foreground mt-2">
          If an account exists for that email, we've sent a link to reset your password.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link to="/login">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Forgot your password?</h1>
      <p className="text-sm text-muted-foreground mt-1.5">
        Enter your email and we'll send you a link to reset it.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Send reset link
        </Button>
      </form>

      <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to login
      </Link>
    </div>
  );
}
