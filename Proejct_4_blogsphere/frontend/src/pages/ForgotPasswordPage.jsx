import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import AuthLayout from '../layouts/AuthLayout';
import { getErrorMessage } from '../utils/formatters';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(values.email);
      // Backend always returns this same generic message whether or not the
      // account exists, to avoid leaking which emails are registered.
      setSent(true);
    } catch (err) {
      // A real failure here (rate limit, network, server error) — don't
      // pretend it succeeded.
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your inbox" subtitle="If an account exists for that email, a reset link is on its way.">
        <Link to="/login" className="btn-secondary w-full">Back to login</Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="We'll email you a reset link">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-ink-600">Email</label>
          <input
            type="email"
            className="input mt-1.5"
            placeholder="you@example.com"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="text-xs text-rose mt-1">{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-400">
        <Link to="/login" className="text-signal font-medium hover:underline">Back to login</Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
