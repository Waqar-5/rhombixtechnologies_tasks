import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { userService } from '../../services/resourceServices';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/formatters';
import { promiseToast } from '../../utils/toastHelpers';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const newPassword = watch('newPassword');

  const onChangePassword = async (values) => {
    setIsChangingPassword(true);
    try {
      await promiseToast(
        authService.changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
        { loading: 'Updating password...', success: 'Password changed. Please log in again.' }
      );
      reset();
      await logout();
      navigate('/login');
    } catch (err) {
      // error toast already shown by promiseToast
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return toast.error('Please enter your password to confirm');
    setIsDeleting(true);
    try {
      await promiseToast(userService.deleteAccount(deletePassword), {
        loading: 'Deleting your account...',
        success: 'Your account has been deleted',
      });
      navigate('/');
      window.location.reload();
    } catch (err) {
      // error toast already shown by promiseToast
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-xl space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink mb-6">Settings</h1>

        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink mb-4">Change password</h2>
          <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-ink-600 mb-1.5 block">Current password</label>
              <input type="password" className="input" {...register('currentPassword', { required: 'Required' })} />
              {errors.currentPassword && <p className="text-xs text-rose mt-1">{errors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-ink-600 mb-1.5 block">New password</label>
              <input
                type="password"
                className="input"
                {...register('newPassword', {
                  required: 'Required',
                  minLength: { value: 8, message: 'At least 8 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                    message: 'Must include upper, lower case, and a number',
                  },
                })}
              />
              {errors.newPassword && <p className="text-xs text-rose mt-1">{errors.newPassword.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-ink-600 mb-1.5 block">Confirm new password</label>
              <input
                type="password"
                className="input"
                {...register('confirmNewPassword', {
                  validate: (v) => v === newPassword || 'Passwords do not match',
                })}
              />
              {errors.confirmNewPassword && <p className="text-xs text-rose mt-1">{errors.confirmNewPassword.message}</p>}
            </div>
            <button type="submit" disabled={isChangingPassword} className="btn-primary">
              {isChangingPassword ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>

      <div className="card p-6 border-rose/20">
        <h2 className="font-display text-lg font-semibold text-rose mb-2">Delete account</h2>
        <p className="text-sm text-ink-400 mb-4">
          This permanently deletes your account. This action cannot be undone.
        </p>
        {showDeleteConfirm ? (
          <div className="space-y-3">
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Confirm your password"
              className="input"
            />
            <div className="flex gap-2">
              <button onClick={handleDeleteAccount} disabled={isDeleting} className="btn-danger">
                {isDeleting ? 'Deleting...' : 'Confirm deletion'}
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger">Delete my account</button>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
