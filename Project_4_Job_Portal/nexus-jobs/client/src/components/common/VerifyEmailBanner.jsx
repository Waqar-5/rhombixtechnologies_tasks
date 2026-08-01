import { useState } from 'react';
import { MailWarning, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { authApi } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmailBanner() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!user || user.isEmailVerified) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await authApi.resendVerification();
      setSent(true);
      toast.success('Verification email sent — check your inbox');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-accent/30 bg-accent/10 p-4 flex items-center gap-3 flex-wrap">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground shrink-0">
        <MailWarning className="h-4.5 w-4.5" size={18} />
      </div>
      <div className="flex-1 min-w-[200px]">
        <p className="text-sm font-medium">Please verify your email address</p>
        <p className="text-xs text-muted-foreground">
          Check {user.email} for a verification link{sent ? ' — a new one is on its way' : ''}.
        </p>
      </div>
      <Button size="sm" variant="outline" onClick={handleResend} disabled={sending}>
        {sending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {sent ? 'Resend again' : 'Resend email'}
      </Button>
    </div>
  );
}
