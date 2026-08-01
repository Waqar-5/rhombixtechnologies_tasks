import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, User, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { registerSchema } from '@/lib/schemas';
import { useAuth } from '@/context/AuthContext';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('jobseeker');
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { role: 'jobseeker' } });

  const selectRole = (r) => {
    setRole(r);
    setValue('role', r);
  };

  const onSubmit = async (data) => {
    try {
      const user = await registerUser(data);
      toast.success(`Account created! Check ${user.email} to verify, then log in.`, { duration: 6000 });
      navigate('/login', { replace: true, state: { justRegistered: true, email: user.email } });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Create your account</h1>
      <p className="text-sm text-muted-foreground mt-1.5">Start hiring or job hunting in under a minute.</p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
        <button
          type="button"
          onClick={() => selectRole('jobseeker')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors',
            role === 'jobseeker' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'
          )}
        >
          <User className="h-4 w-4" /> Job seeker
        </button>
        <button
          type="button"
          onClick={() => selectRole('recruiter')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors',
            role === 'recruiter' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'
          )}
        >
          <Building2 className="h-4 w-4" /> Recruiter
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <input type="hidden" {...register('role')} value={role} />

        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Jane Doe" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>

        {role === 'recruiter' && (
          <div>
            <Label htmlFor="companyName">Company name</Label>
            <Input id="companyName" placeholder="Acme Inc." {...register('companyName')} />
            {errors.companyName && <p className="text-xs text-destructive mt-1">{errors.companyName.message}</p>}
          </div>
        )}

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
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

        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} {...register('confirmPassword')} />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
