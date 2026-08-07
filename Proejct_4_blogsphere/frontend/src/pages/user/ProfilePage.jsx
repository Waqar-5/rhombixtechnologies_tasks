import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiCamera } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/resourceServices';
import { getErrorMessage } from '../../utils/formatters';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUserLocal } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      website: user?.website || '',
      github: user?.github || '',
      linkedin: user?.linkedin || '',
      twitter: user?.twitter || '',
      location: user?.location || '',
      occupation: user?.occupation || '',
      skills: (user?.skills || []).join(', '),
    },
  });

  const onSubmit = async (values) => {
    setIsSaving(true);
    try {
      const payload = {
        ...values,
        skills: values.skills.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const { data } = await userService.updateProfile(payload);
      updateUserLocal(data.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await userService.updateAvatar(formData);
      updateUserLocal(data.data.user);
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">Profile</h1>

      <div className="flex items-center gap-4 mb-8">
        <div className="relative w-20 h-20 rounded-full bg-signal-50 overflow-hidden flex items-center justify-center font-display text-2xl text-signal">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt="" className="w-full h-full object-cover" />
          ) : (
            user?.name?.[0]
          )}
          <label className="absolute inset-0 bg-ink/50 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
            <FiCamera className="text-paper-light" size={18} />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploadingAvatar} />
          </label>
        </div>
        <div>
          <p className="font-medium text-ink">{user?.name}</p>
          <p className="text-sm text-ink-400">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-ink-600 mb-1.5 block">Name</label>
          <input className="input" {...register('name')} />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-600 mb-1.5 block">Bio</label>
          <textarea rows={3} className="input" placeholder="Tell readers about yourself..." {...register('bio')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-ink-600 mb-1.5 block">Location</label>
            <input className="input" {...register('location')} />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-600 mb-1.5 block">Occupation</label>
            <input className="input" {...register('occupation')} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-ink-600 mb-1.5 block">Skills (comma separated)</label>
          <input className="input" placeholder="React, Node.js, UX Writing" {...register('skills')} />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-600 mb-1.5 block">Website</label>
          <input className="input" placeholder="https://" {...register('website')} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-ink-600 mb-1.5 block">GitHub</label>
            <input className="input" placeholder="https://" {...register('github')} />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-600 mb-1.5 block">LinkedIn</label>
            <input className="input" placeholder="https://" {...register('linkedin')} />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-600 mb-1.5 block">Twitter</label>
            <input className="input" placeholder="https://" {...register('twitter')} />
          </div>
        </div>

        <button type="submit" disabled={isSaving} className="btn-primary">
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
