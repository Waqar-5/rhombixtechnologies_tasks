import { useEffect, useState } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiX } from 'react-icons/fi';
import { categoryService } from '../../services/resourceServices';
import { PageLoader } from '../../components/ui/Spinner';
import { getErrorMessage } from '../../utils/formatters';
import { confirmToast, promiseToast } from '../../utils/toastHelpers';
import toast from 'react-hot-toast';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const { data } = await categoryService.getCategories({ limit: 100 });
      setCategories(data.data.categories);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description);

      if (editingId) {
        await promiseToast(categoryService.updateCategory(editingId, formData), {
          loading: 'Updating category...',
          success: 'Category updated',
        });
      } else {
        await promiseToast(categoryService.createCategory(formData), {
          loading: 'Creating category...',
          success: 'Category created',
        });
      }
      resetForm();
      load();
    } catch (err) {
      // error toast already shown by promiseToast
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id, name) => {
    confirmToast(`Delete "${name}"? This is blocked if any blogs still use it.`, async () => {
      try {
        await promiseToast(categoryService.deleteCategory(id), {
          loading: 'Deleting category...',
          success: 'Category deleted',
        });
        setCategories((prev) => prev.filter((c) => c._id !== id));
      } catch {
        // error toast already shown by promiseToast
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">Categories</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary py-2 px-4 text-sm">
            <FiPlus size={14} /> New category
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 mt-6 space-y-3 max-w-md">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-ink">{editingId ? 'Edit category' : 'New category'}</h3>
            <button type="button" onClick={resetForm}><FiX size={16} className="text-ink-400" /></button>
          </div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="input" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={2} className="input" />
          <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? 'Saving...' : 'Save'}</button>
        </form>
      )}

      {isLoading ? <PageLoader /> : (
        <div className="mt-6 card divide-y divide-ink/[0.06]">
          {categories.map((c) => (
            <div key={c._id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-ink">{c.name} <span className="text-xs font-mono text-ink-300 ml-1">{c.blogsCount} posts</span></p>
                {c.description && <p className="text-xs text-ink-400 mt-0.5">{c.description}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(c)} className="p-2 text-ink-400 hover:text-signal transition-colors"><FiEdit2 size={15} /></button>
                <button onClick={() => handleDelete(c._id, c.name)} className="p-2 text-ink-400 hover:text-rose transition-colors"><FiTrash2 size={15} /></button>
              </div>
            </div>
          ))}
          {categories.length === 0 && <p className="px-5 py-10 text-center text-sm text-ink-400">No categories yet.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
