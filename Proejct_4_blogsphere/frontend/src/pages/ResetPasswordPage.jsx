import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import AuthLayout from '../layouts/AuthLayout';
import { getErrorMessage } from '../utils/formatters';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, values.password);
      toast.success('Password reset. Please log in with your new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password for your account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-ink-600">New password</label>
          <input
            type="password"
            className="input mt-1.5"
            placeholder="At least 8 characters"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Must be at least 8 characters' },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                message: 'Must include upper, lower case, and a number',
              },
            })}
          />
          {errors.password && <p className="text-xs text-rose mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-ink-600">Confirm new password</label>
          <input
            type="password"
            className="input mt-1.5"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && <p className="text-xs text-rose mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Resetting...' : 'Reset password'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-400">
        <Link to="/login" className="text-signal font-medium hover:underline">Back to login</Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
