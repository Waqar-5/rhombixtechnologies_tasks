import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Link as LinkIcon, UserPlus, UserCheck, UserX, Clock, Camera, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import { userService, postService, friendService } from '../services/endpoints';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';

const ProfilePage = () => {
  const { username } = useParams();
  const { updateUserLocal } = useAuth();
  const { onlineUserIds } = useSocketContext();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [relationship, setRelationship] = useState('stranger');
  const [friendStatus, setFriendStatus] = useState('none');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limited, setLimited] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isSelf = relationship === 'self';

  const load = useCallback(async () => {
    setLoading(true);
    setLimited(false);
    try {
      const { data } = await userService.getProfile(username);
      setProfile(data.user);
      setRelationship(data.relationship);
      setFriendStatus(data.friendStatus);

      const postsRes = await postService.getUserPosts(data.user._id);
      setPosts(postsRes.data.posts);
    } catch (err) {
      if (err.response?.status === 403) {
        setLimited(true);
        setProfile(err.response.data.user);
      } else {
        toast.error('Could not load profile.');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [username, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const { data } = await userService.uploadAvatar(formData);
      setProfile((prev) => ({ ...prev, avatar: data.user.avatar }));
      updateUserLocal({ avatar: data.user.avatar });
      toast.success('Profile photo updated.');
    } catch (err) {
      toast.error('Could not upload photo.');
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('coverPhoto', file);
    try {
      const { data } = await userService.uploadCover(formData);
      setProfile((prev) => ({ ...prev, coverPhoto: data.user.coverPhoto }));
      toast.success('Cover photo updated.');
    } catch (err) {
      toast.error('Could not upload cover photo.');
    }
  };

  const handleFriendAction = async () => {
    setActionLoading(true);
    try {
      if (friendStatus === 'none') {
        await friendService.sendRequest(profile._id);
        setFriendStatus('request_sent');
        toast.success('Friend request sent.');
      } else if (friendStatus === 'friends') {
        if (!confirm(`Remove ${profile.name} as a friend?`)) return;
        await friendService.unfriend(profile._id);
        setFriendStatus('none');
        setRelationship('stranger');
        toast.success('Friend removed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="skeleton h-48 rounded-2xl mb-4" />
          <div className="skeleton h-6 w-48 rounded mb-2" />
          <div className="skeleton h-4 w-32 rounded" />
        </div>
      </AppLayout>
    );
  }

  if (limited) {
    return (
      <AppLayout hideRightPanel>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Avatar src={profile.avatar} name={profile.name} size="xl" className="mx-auto mb-4" />
          <h1 className="font-display text-xl font-semibold">{profile.name}</h1>
          <p className="text-[var(--color-text-muted)]">@{profile.username}</p>
          <div className="mt-6 flex items-center justify-center gap-2 text-[var(--color-text-muted)]">
            <Lock size={16} />
            <p>This profile is private.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isOnline = onlineUserIds.has(String(profile._id));

  return (
    <AppLayout hideRightPanel>
      <div className="max-w-3xl mx-auto pb-10">
        {/* Cover photo */}
        <div className="relative h-44 sm:h-60 bg-[var(--color-surface)] rounded-b-2xl overflow-hidden">
          {profile.coverPhoto && (
            <img src={profile.coverPhoto} alt="" className="w-full h-full object-cover" />
          )}
          {isSelf && (
            <label className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 text-white text-xs font-medium cursor-pointer hover:bg-black/70 transition-colors">
              <Camera size={14} /> Edit cover
              <input type="file" accept="image/*" hidden onChange={handleCoverUpload} />
            </label>
          )}
        </div>

        {/* Profile header */}
        <div className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-10 sm:-mt-12 gap-4">
            <div className="relative">
              <Avatar src={profile.avatar} name={profile.name} size="xl" ringed online={isOnline} />
              {isSelf && (
                <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[var(--color-coral)] text-white cursor-pointer hover:bg-[var(--color-coral-soft)] transition-colors">
                  <Camera size={14} />
                  <input type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
                </label>
              )}
            </div>

            {!isSelf && (
              <button
                onClick={handleFriendAction}
                disabled={actionLoading || friendStatus === 'request_received'}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-coral)] text-white text-sm font-semibold disabled:opacity-60 hover:bg-[var(--color-coral-soft)] transition-colors"
              >
                {friendStatus === 'friends' && <UserCheck size={16} />}
                {friendStatus === 'request_sent' && <Clock size={16} />}
                {friendStatus === 'request_received' && <UserX size={16} />}
                {friendStatus === 'none' && <UserPlus size={16} />}
                {friendStatus === 'friends' && 'Friends'}
                {friendStatus === 'request_sent' && 'Request sent'}
                {friendStatus === 'request_received' && 'Respond in Friends tab'}
                {friendStatus === 'none' && 'Add friend'}
              </button>
            )}
          </div>

          <div className="mt-3">
            <h1 className="font-display text-2xl font-bold">{profile.name}</h1>
            <p className="text-[var(--color-text-muted)]">@{profile.username}</p>
          </div>

          {profile.bio && <p className="mt-3 text-[15px]">{profile.bio}</p>}

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)]">
            {profile.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} /> {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[var(--color-coral)] hover:underline"
              >
                <LinkIcon size={14} /> {profile.website}
              </a>
            )}
            {!profile.friendsHidden && (
              <span>
                <strong className="text-[var(--color-text)]">{profile.friends?.length || 0}</strong> friends
              </span>
            )}
          </div>
        </div>

        {/* Posts */}
        <div className="mt-6 px-4 sm:px-6 space-y-4">
          <h2 className="font-display font-semibold text-lg">Posts</h2>
          {posts.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] py-8 text-center">No posts to show yet.</p>
          ) : (
            posts.map((post) => (
              <PostCard key={post._id} post={post} onDeleted={(id) => setPosts((p) => p.filter((x) => x._id !== id))} />
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
