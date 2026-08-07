import { Link } from 'react-router-dom';

const Logo = ({ className = '' }) => (
  <Link to="/" className={`inline-flex items-center gap-2 group ${className}`}>
    <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-signal text-paper-light font-display text-sm font-semibold">
      B
      <span className="absolute inset-0 rounded-full border border-dashed border-paper-light/30" />
    </span>
    <span className="font-display text-xl font-semibold tracking-tight text-ink group-hover:text-signal transition-colors">
      BlogSphere
    </span>
  </Link>
);

export default Logo;
