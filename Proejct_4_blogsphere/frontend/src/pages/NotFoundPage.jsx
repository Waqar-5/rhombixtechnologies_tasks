import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <span className="stamp-badge w-16 h-16 font-display text-2xl mb-6">404</span>
    <h1 className="font-display text-4xl font-semibold text-ink">Page not found</h1>
    <p className="mt-3 text-ink-400 max-w-sm">
      The page you're looking for doesn't exist, or may have been moved.
    </p>
    <Link to="/" className="btn-primary mt-8">Back to home</Link>
  </div>
);

export default NotFoundPage;
