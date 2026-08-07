import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiArrowRight } from 'react-icons/fi';
import Logo from './Logo';
import toast from 'react-hot-toast';

const EXPLORE_LINKS = [
  { to: '/blogs', label: 'All blogs' },
  { to: '/categories', label: 'Categories' },
  { to: '/blogs?sort=trending', label: 'Trending' },
];

const COMPANY_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/privacy', label: 'Privacy policy' },
  { to: '/terms', label: 'Terms' },
];

const SOCIALS = [
  { href: 'https://github.com/Waqar-5', icon: FiGithub, label: 'GitHub' },
  { href: 'https://x.com/WaqarAli1353373', icon: FiTwitter, label: 'X / Twitter' },
  { href: 'https://www.linkedin.com/in/waqar-ali-997b962b5/', icon: FiLinkedin, label: 'LinkedIn' },
];

/**
 * A footer nav link with the site's signature "ink underline" hover: the
 * underline draws itself in from the left with a slight overshoot spring
 * easing, and a small arrow nudges into view — evoking a pen underlining
 * a word as you read it, rather than a generic color-fade hover.
 */
const FooterLink = ({ to, label }) => (
  <li>
    <Link to={to} className="group ink-link inline-flex items-center gap-1.5 text-ink-300 hover:text-paper-light">
      {label}
      <FiArrowRight
        size={12}
        className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out text-stamp-light"
      />
    </Link>
  </li>
);

const Footer = () => {
  const handleNewsletter = (e) => {
    e.preventDefault();
    toast.success("You're subscribed. We'll be in touch.");
    e.target.reset();
  };

  return (
    <footer className="bg-ink text-paper-dark mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Logo className="[&_span:last-child]:text-paper-light" />
            <p className="mt-4 text-sm text-ink-300 max-w-xs leading-relaxed">
              A home for writers and readers. Write. Share. Inspire.
            </p>
            <form onSubmit={handleNewsletter} className="mt-6 flex max-w-sm">
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="flex-1 rounded-l-full bg-ink-800 border border-ink-600 px-4 py-2.5 text-sm text-paper-light placeholder:text-ink-400 focus:border-stamp transition-colors"
              />
              <button
                type="submit"
                className="rounded-r-full bg-stamp text-ink-900 px-5 text-sm font-medium
                  transition-all duration-200 hover:bg-stamp-light hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div>
            <p className="eyebrow text-stamp">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {EXPLORE_LINKS.map((link) => <FooterLink key={link.to} {...link} />)}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-stamp">Company</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {COMPANY_LINKS.map((link) => <FooterLink key={link.to} {...link} />)}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-ink-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} BlogSphere. All rights reserved. · Built by{' '}
            <a
              href="https://waqar-ali-ten.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="ink-link text-stamp-light"
            >
              Waqar Ali
            </a>
          </p>
          <div className="flex items-center gap-1">
            {SOCIALS.map(({ href, icon: Icon, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="spring-icon group relative flex items-center justify-center w-9 h-9 rounded-full text-ink-300 hover:text-paper-light"
              >
                {/* Ring appears behind the icon on hover — reads as a subtle wax-seal stamp */}
                <span className="absolute inset-0 rounded-full border border-transparent bg-stamp/0 transition-colors duration-200 group-hover:bg-stamp/[0.12] group-hover:border-stamp/40" />
                <Icon size={17} className="relative" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
