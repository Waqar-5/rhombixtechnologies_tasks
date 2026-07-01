import { useState, useRef } from 'react';
import { Image as ImageIcon, Globe, Users, Lock, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from './Avatar';
import { postService } from '../services/endpoints';
import { useAuth } from '../context/AuthContext';
import { cx } from '../utils/helpers';

const visibilityOptions = [
  { value: 'public', label: 'Public', icon: Globe },
  { value: 'friends', label: 'Friends', icon: Users },
  { value: 'private', label: 'Only me', icon: Lock },
];

const MAX_FILES = 6;

const PostComposer = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [visibility, setVisibility] = useState('public');
  const [feeling, setFeeling] = useState('');
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    if (files.length + selected.length > MAX_FILES) {
      toast.error(`You can attach up to ${MAX_FILES} files.`);
      return;
    }
    const newFiles = [...files, ...selected];
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => ({ url: URL.createObjectURL(f), type: f.type.startsWith('video') ? 'video' : 'image' })));
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => ({ url: URL.createObjectURL(f), type: f.type.startsWith('video') ? 'video' : 'image' })));
  };

  const resetForm = () => {
    setText('');
    setFiles([]);
    setPreviews([]);
    setFeeling('');
    setVisibility('public');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) {
      toast.error('Write something or add media first.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('visibility', visibility);
      formData.append('feeling', feeling);
      files.forEach((file) => formData.append('media', file));

      const { data } = await postService.create(formData);
      toast.success('Posted!');
      resetForm();
      onPostCreated?.(data.post);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create post.');
    } finally {
      setSubmitting(false);
    }
  };

  const VisibilityIcon = visibilityOptions.find((v) => v.value === visibility)?.icon || Globe;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5"
    >
      <div className="flex gap-3">
        <Avatar src={user.avatar} name={user.name} size="md" />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`What's on your mind, ${user.name.split(' ')[0]}?`}
          rows={text ? 3 : 2}
          className="flex-1 bg-transparent resize-none outline-none text-[15px] placeholder:text-[var(--color-text-muted)]"
        />
      </div>

      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {previews.map((p, i) => (
            <div key={i} className="relative rounded-lg overflow-hidden aspect-square bg-black/30">
              {p.type === 'video' ? (
                <video src={p.url} className="w-full h-full object-cover" />
              ) : (
                <img src={p.url} alt="" className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            hidden
            onChange={handleFileSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--color-sage)] hover:bg-[var(--color-surface-raised)] transition-colors"
          >
            <ImageIcon size={18} /> Media
          </button>

          <input
            value={feeling}
            onChange={(e) => setFeeling(e.target.value)}
            placeholder="feeling..."
            className="w-24 bg-transparent text-sm px-2 py-1.5 rounded-lg placeholder:text-[var(--color-text-muted)] outline-none focus-visible:bg-[var(--color-surface-raised)]"
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVisibilityMenu((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] transition-colors"
            >
              <VisibilityIcon size={16} />
              <span className="hidden sm:inline">
                {visibilityOptions.find((v) => v.value === visibility)?.label}
              </span>
            </button>
            {showVisibilityMenu && (
              <div className="absolute left-0 top-9 z-10 w-36 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden">
                {visibilityOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setVisibility(value);
                      setShowVisibilityMenu(false);
                    }}
                    className={cx(
                      'w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-[var(--color-surface)] transition-colors',
                      visibility === value && 'text-[var(--color-coral)]'
                    )}
                  >
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || (!text.trim() && files.length === 0)}
          className="px-5 py-2 rounded-full bg-[var(--color-coral)] text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-coral-soft)] transition-colors"
        >
          {submitting ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  );
};

export default PostComposer;
