import { useEffect, useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { tagService } from '../../services/resourceServices';
import { PageLoader } from '../../components/ui/Spinner';
import { getErrorMessage } from '../../utils/formatters';
import toast from 'react-hot-toast';

const AdminTagsPage = () => {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const { data } = await tagService.getTags({ limit: 200 });
      setTags(data.data.tags);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    setIsSaving(true);
    try {
      await tagService.createTag(newTag.trim());
      setNewTag('');
      toast.success('Tag created');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tag? It will be removed from all blogs.')) return;
    try {
      await tagService.deleteTag(id);
      setTags((prev) => prev.filter((t) => t._id !== id));
      toast.success('Tag deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">Tags</h1>

      <form onSubmit={handleCreate} className="flex gap-2 mb-6 max-w-sm">
        <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="New tag name" className="input" />
        <button type="submit" disabled={isSaving} className="btn-primary shrink-0"><FiPlus size={14} /></button>
      </form>

      {isLoading ? <PageLoader /> : (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t._id} className="inline-flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-full bg-ink/[0.05] text-sm text-ink-600">
              {t.name} <span className="text-xs font-mono text-ink-300">{t.blogsCount}</span>
              <button onClick={() => handleDelete(t._id)} className="text-ink-300 hover:text-rose transition-colors">
                <FiTrash2 size={12} />
              </button>
            </span>
          ))}
          {tags.length === 0 && <p className="text-sm text-ink-400">No tags yet.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminTagsPage;
