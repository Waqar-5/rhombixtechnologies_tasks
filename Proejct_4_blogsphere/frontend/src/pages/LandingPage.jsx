import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiFeather, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { blogService } from '../services/blogService';
import { categoryService } from '../services/resourceServices';
import BlogCard, { BlogCardSkeleton } from '../components/blog/BlogCard';
import { getErrorMessage } from '../utils/formatters';

const LandingPage = () => {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [featuredRes, trendingRes, latestRes, categoriesRes] = await Promise.all([
          blogService.getBlogs({ featured: 'true', limit: 3 }),
          blogService.getBlogs({ sort: 'trending', limit: 4 }),
          blogService.getBlogs({ sort: 'latest', limit: 6 }),
          categoryService.getCategories({ limit: 6, sort: '-blogsCount' }),
        ]);
        setFeatured(featuredRes.data.data.blogs);
        setTrending(trendingRes.data.data.blogs);
        setLatest(latestRes.data.data.blogs);
        setCategories(categoriesRes.data.data.categories);
      } catch (err) {
        // Landing page degrades gracefully — sections that fail to load
        // simply render empty rather than blocking the whole page.
        console.error(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-3xl">
            <span className="eyebrow">Write. Share. Inspire.</span>
            <h1 className="mt-4 font-display text-5xl md:text-7xl font-semibold text-ink leading-[1.05] tracking-tight">
              Stories worth <span className="italic text-signal">stamping.</span>
            </h1>
            <p className="mt-6 text-lg text-ink-500 font-body max-w-xl leading-relaxed">
              BlogSphere is where writers publish with care and readers discover
              ideas worth their time — no algorithm chasing outrage, just good writing.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/register" className="btn-primary text-base px-7 py-3">
                Start writing <FiArrowRight />
              </Link>
              <Link to="/blogs" className="btn-secondary text-base px-7 py-3">
                Explore stories
              </Link>
            </div>
          </div>
        </div>
        <div className="hidden lg:block absolute top-16 right-12 stamp-badge w-16 h-16 font-display text-xl rotate-6">
          B
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="eyebrow">Featured</span>
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Stamped by our editors</h2>
          </div>
          <Link to="/blogs?featured=true" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-signal hover:gap-2.5 transition-all">
            View all <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <BlogCardSkeleton key={i} />)
            : featured.length > 0
              ? featured.map((blog) => <BlogCard key={blog._id} blog={blog} variant="featured" />)
              : (
                <div className="md:col-span-3 text-center py-12 text-ink-400 text-sm">
                  No featured stories yet — check back soon.
                </div>
              )}
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="bg-ink-800/[0.02] border-y border-ink/[0.06] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-8">
              <FiTrendingUp className="text-stamp" size={20} />
              <span className="eyebrow">Trending now</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trending.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <span className="eyebrow">Popular categories</span>
          <h2 className="mt-1 mb-8 font-display text-3xl font-semibold text-ink">Find your shelf</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/blogs?category=${cat.slug}`}
                className="px-5 py-2.5 rounded-full border border-ink/10 bg-paper-light hover:border-signal hover:text-signal text-sm font-medium text-ink-600 transition-colors"
              >
                {cat.name} <span className="text-ink-300 font-mono ml-1">{cat.blogsCount}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="eyebrow">Fresh ink</span>
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Latest articles</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)
            : latest.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
        </div>
      </section>

      {/* Why BlogSphere */}
      <section className="bg-signal text-paper-light py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: FiFeather, title: 'Write freely', desc: 'A distraction-free editor built for long-form thinking, not engagement bait.' },
            { icon: FiUsers, title: 'Real readers', desc: 'Connect with people who read your whole post, not just the headline.' },
            { icon: FiTrendingUp, title: 'Grow your voice', desc: 'Categories, tags, and discovery tools that help good writing travel.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title}>
              <Icon size={22} className="text-stamp-light" />
              <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-signal-100/80 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
