import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FiUpload, FiX } from 'react-icons/fi';
import { blogService } from '../../services/blogService';
import { categoryService } from '../../services/resourceServices';
import { PageLoader } from '../../components/ui/Spinner';
import { getErrorMessage } from '../../utils/formatters';
import toast from 'react-hot-toast';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
};

const WriteBlogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    categoryService.getCategories({ limit: 50 }).then((res) => {
      setCategories(res.data.data.categories);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEditMode) return;
    const loadBlog = async () => {
      try {
        const { data } = await blogService.getBlogById(id);
        const blog = data.data.blog;

        setTitle(blog.title);
        setExcerpt(blog.excerpt || '');
        setContent(blog.content);
        setCategory(blog.category?._id || '');
        setTagsInput((blog.tags || []).map((t) => t.name).join(', '));
        setCoverPreview(blog.coverImage?.url || '');
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate('/dashboard/my-blogs');
      } finally {
        setIsLoading(false);
      }
    };
    loadBlog();
  }, [id, isEditMode, navigate]);

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImageFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const buildFormData = (status) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('excerpt', excerpt);
    formData.append('content', content);
    formData.append('category', category);
    formData.append('status', status);

    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    formData.append('tags', JSON.stringify(tags));

    if (coverImageFile) formData.append('coverImage', coverImageFile);
    return formData;
  };

  const validate = (status) => {
    if (!title.trim()) {
      toast.error('Please give your post a title');
      return false;
    }

    // Drafts are allowed to be incomplete — only enforce the full rules
    // when the person is actually trying to publish.
    if (status !== 'published') return true;

    if (title.trim().length < 5) {
      toast.error('Title must be at least 5 characters to publish');
      return false;
    }
    if (!category) {
      toast.error('Please select a category to publish');
      return false;
    }
    const plainContent = content.replace(/<[^>]*>/g, '').trim();
    if (plainContent.length < 50) {
      toast.error('Content must be at least 50 characters to publish');
      return false;
    }
    return true;
  };

  const handleSave = useCallback(async (status) => {
    if (!validate(status)) return;
    setIsSaving(true);
    try {
      const formData = buildFormData(status);
      if (isEditMode) {
        await blogService.updateBlog(id, formData);
        toast.success(status === 'published' ? 'Published!' : 'Blog updated');
        navigate('/dashboard/my-blogs');
      } else {
        const { data } = await blogService.createBlog(formData);
        if (status === 'published') {
          // Publishing should always take you away with a clear "done"
          // signal — staying on the write page here (as this used to do)
          // looked like nothing happened, which is exactly what caused
          // people to click Publish a second time.
          toast.success('Published!');
          navigate('/dashboard/my-blogs');
        } else {
          // Saving a draft is different: keep the person in the editor
          // (now pointed at the real post ID) so they can keep writing.
          toast.success('Draft saved');
          navigate(`/dashboard/write/${data.data.blog._id}`, { replace: true });
        }
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, excerpt, content, category, tagsInput, coverImageFile, isEditMode, id, navigate]);

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">
        {isEditMode ? 'Edit post' : 'Write a new post'}
      </h1>

      <div className="space-y-5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Your story title..."
          className="w-full font-display text-2xl sm:text-3xl font-semibold text-ink placeholder:text-ink-300 border-none outline-none bg-transparent"
        />

        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A short excerpt (optional, shown in previews)..."
          rows={2}
          className="input"
        />

        <div>
          <label className="text-sm font-medium text-ink-600 mb-2 block">Cover image</label>
          {coverPreview ? (
            <div className="relative rounded-xl2 overflow-hidden">
              <img src={coverPreview} alt="Cover preview" className="w-full h-40 sm:h-56 object-cover" />
              <button
                onClick={() => { setCoverPreview(''); setCoverImageFile(null); }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-ink/70 text-paper-light flex items-center justify-center hover:bg-ink"
              >
                <FiX size={15} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-32 sm:h-40 rounded-xl2 border-2 border-dashed border-ink/15 cursor-pointer hover:border-signal transition-colors px-4 text-center">
              <FiUpload size={20} className="text-ink-300 shrink-0" />
              <span className="mt-2 text-xs sm:text-sm text-ink-400">Click to upload a cover image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-ink-600 mb-1.5 block">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
              <option value="">Select a category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-600 mb-1.5 block">Tags (comma separated)</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="react, webdev, tutorial"
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink-600 mb-1.5 block">Content</label>
          <div className="quill-editor-wrapper bg-paper-light rounded-lg overflow-hidden border border-ink/15">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={QUILL_MODULES}
              placeholder="Tell your story..."
              className="[&_.ql-editor]:min-h-[220px] sm:[&_.ql-editor]:min-h-[320px] [&_.ql-editor]:font-body [&_.ql-editor]:text-[16px] sm:[&_.ql-editor]:text-[17px] [&_.ql-toolbar]:border-ink/15 [&_.ql-container]:border-ink/15"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button onClick={() => handleSave('draft')} disabled={isSaving} className="btn-secondary w-full sm:w-auto">
            Save as draft
          </button>
          <button onClick={() => handleSave('published')} disabled={isSaving} className="btn-primary w-full sm:w-auto">
            {isSaving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WriteBlogPage;
