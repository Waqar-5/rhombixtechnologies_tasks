import { useState } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import { userService } from '../services/endpoints';
import { useAuth } from '../context/AuthContext';
import { cx } from '../utils/helpers';

const visibilityChoices = [
  { value: 'public', label: 'Public', desc: 'Anyone can see' },
  { value: 'friends', label: 'Friends only', desc: 'Only your friends' },
  { value: 'private', label: 'Only me', desc: 'Visible to just you' },
];

const messageChoices = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'friends', label: 'Friends only' },
  { value: 'nobody', label: 'Nobody' },
];

const SettingsPage = () => {
  const { user, updateUserLocal } = useAuth();
  const [tab, setTab] = useState('profile');

  const [profileForm, setProfileForm] = useState({
    name: user.name,
    bio: user.bio || '',
    location: user.location || '',
    website: user.website || '',
  });
  const [privacy, setPrivacy] = useState(user.privacy);
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userService.updateProfile(profileForm);
      updateUserLocal(data.user);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrivacySave = async () => {
    setSaving(true);
    try {
      const { data } = await userService.updatePrivacy(privacy);
      updateUserLocal({ privacy: data.user.privacy });
      toast.success('Privacy settings updated.');
    } catch (err) {
      toast.error('Could not update privacy settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout hideRightPanel>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="font-display text-2xl font-bold mb-4">Settings</h1>

        <div className="flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-1 mb-5 w-fit">
          {['profile', 'privacy'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cx(
                'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors',
                tab === t
                  ? 'bg-[var(--color-surface-raised)] text-[var(--color-coral)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <form
            onSubmit={handleProfileSave}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1.5">Name</label>
              <input
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-coral)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Bio</label>
              <textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                rows={3}
                maxLength={250}
                className="w-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 outline-none resize-none focus-visible:ring-2 focus-visible:ring-[var(--color-coral)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Location</label>
              <input
                value={profileForm.location}
                onChange={(e) => setProfileForm((p) => ({ ...p, location: e.target.value }))}
                className="w-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-coral)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Website</label>
              <input
                value={profileForm.website}
                onChange={(e) => setProfileForm((p) => ({ ...p, website: e.target.value }))}
                placeholder="https://"
                className="w-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-coral)]"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[var(--color-coral)] text-white font-semibold disabled:opacity-50 hover:bg-[var(--color-coral-soft)] transition-colors"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        )}

        {tab === 'privacy' && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Who can see your profile?</h3>
              <div className="grid grid-cols-3 gap-2">
                {visibilityChoices.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setPrivacy((p) => ({ ...p, profileVisibility: c.value }))}
                    className={cx(
                      'p-3 rounded-xl border text-left transition-colors',
                      privacy.profileVisibility === c.value
                        ? 'border-[var(--color-coral)] bg-[var(--color-surface-raised)]'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-surface-raised)]'
                    )}
                  >
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Who can see your friends list?</h3>
              <div className="grid grid-cols-3 gap-2">
                {visibilityChoices.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setPrivacy((p) => ({ ...p, friendsListVisibility: c.value }))}
                    className={cx(
                      'p-3 rounded-xl border text-left transition-colors',
                      privacy.friendsListVisibility === c.value
                        ? 'border-[var(--color-coral)] bg-[var(--color-surface-raised)]'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-surface-raised)]'
                    )}
                  >
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Who can message you?</h3>
              <div className="grid grid-cols-3 gap-2">
                {messageChoices.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setPrivacy((p) => ({ ...p, whoCanMessage: c.value }))}
                    className={cx(
                      'p-3 rounded-xl border text-sm font-medium transition-colors',
                      privacy.whoCanMessage === c.value
                        ? 'border-[var(--color-coral)] bg-[var(--color-surface-raised)]'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-surface-raised)]'
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Show online status</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Let others see when you're active</p>
              </div>
              <button
                onClick={() => setPrivacy((p) => ({ ...p, showOnlineStatus: !p.showOnlineStatus }))}
                className={cx(
                  'w-12 h-7 rounded-full transition-colors relative',
                  privacy.showOnlineStatus ? 'bg-[var(--color-coral)]' : 'bg-[var(--color-surface-raised)]'
                )}
              >
                <span
                  className={cx(
                    'absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform',
                    privacy.showOnlineStatus && 'translate-x-5'
                  )}
                />
              </button>
            </div>

            <button
              onClick={handlePrivacySave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[var(--color-coral)] text-white font-semibold disabled:opacity-50 hover:bg-[var(--color-coral-soft)] transition-colors"
            >
              {saving ? 'Saving…' : 'Save privacy settings'}
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
