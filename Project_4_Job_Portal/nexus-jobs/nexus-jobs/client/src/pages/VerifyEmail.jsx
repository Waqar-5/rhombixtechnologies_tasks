import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const { user, isAuthenticated } = useAuth();
  const dashboardPath = user?.role === 'recruiter' ? '/recruiter' : '/seeker';

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success mb-4">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="font-display text-xl font-bold">Email verified</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Your email address has been confirmed. You're all set.
        </p>
        <Button className="mt-6" asChild>
          <Link to={isAuthenticated ? dashboardPath : '/login'}>
            {isAuthenticated ? 'Go to dashboard' : 'Log in'}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h1 className="font-display text-xl font-bold">Link expired or invalid</h1>
      <p className="text-sm text-muted-foreground mt-2">
        This verification link is no longer valid. You can request a new one from your dashboard
        after logging in.
      </p>
      <Button className="mt-6" asChild>
        <Link to={isAuthenticated ? dashboardPath : '/login'}>
          {isAuthenticated ? 'Go to dashboard' : 'Log in'}
        </Link>
      </Button>
    </div>
  );
}
