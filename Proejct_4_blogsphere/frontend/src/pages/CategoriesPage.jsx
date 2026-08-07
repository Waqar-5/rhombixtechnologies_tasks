import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../services/resourceServices';
import { PageLoader } from '../components/ui/Spinner';
import { getErrorMessage } from '../utils/formatters';
import toast from 'react-hot-toast';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    categoryService.getCategories({ limit: 100, sort: 'name' })
      .then((res) => setCategories(res.data.data.categories))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <span className="eyebrow">Browse</span>
      <h1 className="mt-2 font-display text-4xl font-semibold text-ink mb-10">Categories</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <Link key={cat._id} to={`/blogs?category=${cat.slug}`} className="card p-6 group">
            <h3 className="font-display text-xl font-semibold text-ink group-hover:text-signal transition-colors">
              {cat.name}
            </h3>
            {cat.description && <p className="mt-2 text-sm text-ink-400 line-clamp-2">{cat.description}</p>}
            <p className="mt-4 text-xs font-mono text-ink-300">{cat.blogsCount} posts</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
