import { Link } from 'react-router-dom';
import { Briefcase, Twitter, Linkedin, Github } from 'lucide-react';

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/waqar-5', icon: Github },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/waqar-ali-997b962b5/', icon: Linkedin },
  { label: 'X (Twitter)', href: 'https://x.com/WaqarAli1353373', icon: Twitter }
];

const PORTFOLIO_URL = 'https://waqar-ali-ten.vercel.app/';

const footerLinks = {
  'For job seekers': [
    { label: 'Browse jobs', to: '/jobs' },
    { label: 'Companies', to: '/companies' },
    { label: 'Create account', to: '/register' }
  ],
  'For recruiters': [
    { label: 'Post a job', to: '/register' },
    { label: 'Recruiter dashboard', to: '/recruiter' },
    { label: 'How it works', to: '/#how-it-works' }
  ],
  Company: [
    { label: 'About', to: '/#about' },
    { label: 'FAQ', to: '/#faq' },
    { label: 'Contact', to: '/#contact' }
  ]
};

export default function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
                <Briefcase className="h-4.5 w-4.5 text-white" size={18} />
              </span>
              <span className="font-display text-lg font-bold">Nexus Jobs</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              A premium job board connecting ambitious talent with teams building what's next.
            </p>
            <div className="flex gap-3 mt-5">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted hover:text-primary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-display text-sm font-semibold mb-4">{heading}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Nexus Jobs. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">
            Built by{' '}
            <a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Waqar Ali
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
