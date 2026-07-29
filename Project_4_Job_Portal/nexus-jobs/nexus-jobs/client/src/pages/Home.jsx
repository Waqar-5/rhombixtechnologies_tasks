import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { ArrowRight, Star, ChevronDown, Mail, Sparkles } from 'lucide-react';
import Hero from '@/components/common/Hero';
import JobCard from '@/components/jobs/JobCard';
import JobCardSkeleton from '@/components/jobs/JobCardSkeleton';
import { Button } from '@/components/ui/button';
import { jobsApi } from '@/api/jobs';
import { categoriesApi } from '@/api/categories';
import { companiesApi } from '@/api/companies';
import { savedJobsApi } from '@/api/savedJobs';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const testimonials = [
  {
    name: 'Amara Chen',
    role: 'Senior Frontend Engineer, hired at Orbital Systems',
    quote:
      "I applied on a Tuesday and had an offer within two weeks. The one-click apply meant I could go after roles the moment I saw them instead of losing momentum on long forms.",
    rating: 5
  },
  {
    name: 'Diego Alvarez',
    role: 'Product Designer, hired at Verdant Studio',
    quote:
      'The company profiles gave me a real feel for team culture before I even applied — that context made every interview feel like a conversation, not an interrogation.',
    rating: 5
  },
  {
    name: 'Priya Nair',
    role: 'Talent Partner at Lumen Health',
    quote:
      'As a recruiter, the applicant pipeline view is the best I have used. I can move candidates through stages in seconds and the whole team stays in sync.',
    rating: 5
  }
];

const faqs = [
  {
    q: 'Is Nexus Jobs free for job seekers?',
    a: 'Yes — creating a profile, searching roles, and applying is completely free for job seekers, always.'
  },
  {
    q: 'How does one-click apply work?',
    a: 'Upload your resume once to your profile. From then on, applying to any role takes one click plus an optional short note to the hiring team.'
  },
  {
    q: 'Do recruiters need approval to post a job?',
    a: 'No — recruiter accounts come with an instant company profile, and jobs go live the moment you publish them.'
  },
  {
    q: 'Can I edit or close a job after posting?',
    a: 'Yes, from your recruiter dashboard you can edit details, pause applications, or close a role at any time.'
  }
];

const howItWorksSteps = [
  {
    step: '01',
    title: 'Create your profile',
    description: 'Sign up, add your skills and experience, and upload your resume once — it powers every application from here on.',
    icon: 'UserPlus'
  },
  {
    step: '02',
    title: 'Discover opportunities',
    description: 'Search and filter thousands of roles by title, location, work mode, and experience level to find the right fit.',
    icon: 'Search'
  },
  {
    step: '03',
    title: 'Apply easily',
    description: 'One click sends your saved resume and an optional note straight to the hiring team — no repetitive forms.',
    icon: 'MousePointerClick'
  },
  {
    step: '04',
    title: 'Track your application',
    description: 'Follow every application through the pipeline and get notified the moment a recruiter updates your status.',
    icon: 'ListChecks'
  }
];

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  const panelId = `faq-panel-${item.q.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between px-5 py-4 text-left font-medium"
      >
        {item.q}
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div id={panelId} role="region" className="px-5 pb-4 text-sm text-muted-foreground">
          {item.a}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isJobseeker } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    // Wait a tick for the page (and async content above the target) to render,
    // then scroll smoothly to the section the footer link promised.
    const id = location.hash.replace('#', '');
    const timeout = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => clearTimeout(timeout);
  }, [location.hash]);

  useEffect(() => {
    const load = async () => {
      try {
        const [jobsRes, catRes, compRes] = await Promise.all([
          jobsApi.getFeatured(),
          categoriesApi.getAll(),
          companiesApi.getAll({ limit: 6 })
        ]);
        setFeaturedJobs(jobsRes.jobs);
        setCategories(catRes.categories);
        setCompanies(compRes.companies);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleSave = async (jobId) => {
    if (!isAuthenticated || !isJobseeker) {
      toast.error('Log in as a job seeker to save jobs');
      return;
    }
    try {
      if (savedIds.has(jobId)) {
        await savedJobsApi.unsave(jobId);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await savedJobsApi.save(jobId);
        setSavedIds((prev) => new Set(prev).add(jobId));
        toast.success('Job saved');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <Hero />

      {/* About */}
      <section id="about" className="container py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-primary mb-4">
              <Sparkles className="h-3.5 w-3.5" /> About Nexus Jobs
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              We built the job board we wished existed
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Most job boards make you fill out the same form fifty times, or bury great roles
              under sponsored noise. Nexus Jobs strips that away: one profile, one resume, and a
              single click to apply anywhere. For recruiters, that means a role you post goes live
              instantly and starts collecting real applicants within minutes — no approval queue,
              no waiting.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We're a small, product-obsessed team building the hiring experience we'd want to use
              ourselves — on both sides of the table.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Open roles', value: '1,000+' },
              { label: 'Companies hiring', value: '500+' },
              { label: 'Avg. time to apply', value: '< 30s' },
              { label: 'Countries reached', value: '40+' }
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-card p-6 text-center">
                <p className="font-display text-3xl font-bold text-gradient">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Browse by category</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => {
            const Icon = Icons[cat.icon] || Icons.Briefcase;
            return (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/jobs?category=${cat._id}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-glass transition-all"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-gradient-primary group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.jobCount} open roles</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Featured jobs */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Featured opportunities</h2>
          <Button variant="ghost" asChild>
            <Link to="/jobs">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)
            : featuredJobs.map((job) => (
                <JobCard key={job._id} job={job} isSaved={savedIds.has(job._id)} onToggleSave={toggleSave} />
              ))}
        </div>
      </section>

      {/* Companies */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Companies hiring now</h2>
          <Button variant="ghost" asChild>
            <Link to="/companies">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {companies.map((c) => (
            <Link
              key={c._id}
              to={`/companies/${c.slug}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-colors text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary font-display font-bold text-white text-lg">
                {c.name?.[0]}
              </div>
              <p className="text-xs font-medium truncate w-full">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-8 text-center">
            Loved by candidates and recruiters alike
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 mb-4">"{t.quote}"</p>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">How Nexus Jobs works</h2>
          <p className="text-muted-foreground mt-2">From profile to offer, in four straightforward steps.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {howItWorksSteps.map((item, i) => {
            const Icon = Icons[item.icon] || Icons.Sparkles;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative rounded-2xl border border-border bg-card p-6"
              >
                <span className="font-mono text-xs text-muted-foreground">{item.step}</span>
                <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold mt-4">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container py-16 max-w-2xl">
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-8 text-center">Frequently asked questions</h2>
        <div className="space-y-3">
          {faqs.map((item) => (
            <FaqItem key={item.q} item={item} />
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="container py-16 max-w-2xl">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Mail className="h-5 w-5" />
          </div>
          <h2 className="font-display text-2xl font-bold">Get in touch</h2>
          <p className="text-muted-foreground mt-2">
            Questions about Nexus Jobs, partnerships, or the Growth plan? We'd love to hear from you.
          </p>
          <Button className="mt-6" asChild>
            <a href="mailto:hello@nexusjobs.example">
              <Mail className="h-4 w-4" /> hello@nexusjobs.example
            </a>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <div className="rounded-3xl bg-gradient-primary p-10 sm:p-14 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial-glow opacity-40" />
          <div className="relative">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Ready to find what's next?</h2>
            <p className="mt-3 text-white/80 max-w-md mx-auto">
              Join thousands of professionals discovering their next role on Nexus Jobs.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="accent" size="lg" asChild>
                <Link to="/register">Create your profile</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link to="/jobs">Browse jobs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
