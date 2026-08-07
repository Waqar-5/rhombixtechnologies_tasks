import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import { getErrorMessage } from '../utils/formatters';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await registerUser({ name: values.name, email: values.email, password: values.password });
      toast.success('Account created! Check your email to verify your address, then log in.', { duration: 6000 });
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Join BlogSphere" subtitle="Create an account to start writing">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-ink-600">Full name</label>
          <input
            className="input mt-1.5"
            placeholder="Jane Doe"
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
          />
          {errors.name && <p className="text-xs text-rose mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-ink-600">Email</label>
          <input
            type="email"
            className="input mt-1.5"
            placeholder="you@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
            })}
          />
          {errors.email && <p className="text-xs text-rose mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-ink-600">Password</label>
          <div className="relative mt-1.5">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input pr-10"
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
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300">
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-rose mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-ink-600">Confirm password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            className="input mt-1.5"
            placeholder="Repeat your password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && <p className="text-xs text-rose mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-400">
        Already have an account? <Link to="/login" className="text-signal font-medium hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
