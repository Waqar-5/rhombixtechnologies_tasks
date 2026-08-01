import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Briefcase,
  Clock,
  Users,
  Bookmark,
  BookmarkCheck,
  Share2,
  CheckCircle2,
  Building2,
  Loader2,
  ArrowLeft,
  Gift
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import JobCard from '@/components/jobs/JobCard';
import { jobsApi } from '@/api/jobs';
import { applicationsApi } from '@/api/applications';
import { savedJobsApi } from '@/api/savedJobs';
import { useAuth } from '@/context/AuthContext';
import { formatSalary, formatRelativeDate, jobTypeLabels, workModeLabels, experienceLabels } from '@/lib/utils';

export default function JobDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isJobseeker } = useAuth();

  const [job, setJob] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await jobsApi.getBySlug(slug);
        setJob(data.job);
        setHasApplied(data.hasApplied);
        setIsSaved(data.isSaved);
        jobsApi.getSimilar(slug).then((r) => setSimilar(r.jobs)).catch(() => {});
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleToggleSave = async () => {
    if (!isAuthenticated || !isJobseeker) {
      toast.error('Log in as a job seeker to save jobs');
      return;
    }
    try {
      if (isSaved) {
        await savedJobsApi.unsave(job._id);
        setIsSaved(false);
      } else {
        await savedJobsApi.save(job._id);
        setIsSaved(true);
        toast.success('Job saved');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${job.title} at ${job.company?.name}`, url });
      } catch (error) {
        // User cancelled the share sheet — not an error worth surfacing
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch (error) {
      toast.error('Could not copy link');
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/jobs/${slug}` } } });
      return;
    }
    if (!isJobseeker) {
      toast.error('Only job seeker accounts can apply');
      return;
    }
    if (!user?.resume?.url) {
      toast.error('Upload a resume to your profile before applying');
      navigate('/seeker/profile');
      return;
    }
    setApplying(true);
    try {
      await applicationsApi.apply(job._id, { coverNote });
      setHasApplied(true);
      setDialogOpen(false);
      toast.success('Application submitted!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-10 max-w-4xl">
        <Skeleton className="h-8 w-2/3 mb-4" />
        <Skeleton className="h-4 w-1/3 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!job) return null;

  const company = job.company || {};
  const deadlinePassed = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();
  const canApply = job.status === 'open' && !deadlinePassed;

  return (
    <div className="container py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl border border-border p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <Avatar src={company.logo?.url} name={company.name} size="xl" className="rounded-2xl" />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-2xl font-bold">{job.title}</h1>
                <Link to={`/companies/${company.slug}`} className="text-primary text-sm font-medium hover:underline">
                  {company.name}
                </Link>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {jobTypeLabels[job.jobType]}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Posted {formatRelativeDate(job.createdAt)}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {job.applicationsCount} applicants</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline">{workModeLabels[job.workMode]}</Badge>
                  <Badge variant="outline">{experienceLabels[job.experienceLevel]}</Badge>
                  {job.status !== 'open' && <Badge variant="destructive">Closed</Badge>}
                </div>
              </div>
            </div>

            <div className="mt-8 prose-sm">
              <h2 className="font-display font-semibold text-lg mb-2">About this role</h2>
              <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">{job.description}</p>
            </div>

            {job.responsibilities?.length > 0 && (
              <div className="mt-6">
                <h2 className="font-display font-semibold text-lg mb-2">Responsibilities</h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground/90">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.requirements?.length > 0 && (
              <div className="mt-6">
                <h2 className="font-display font-semibold text-lg mb-2">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground/90">
                      <CheckCircle2 className="h-4 w-4 text-secondary shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.niceToHave?.length > 0 && (
              <div className="mt-6">
                <h2 className="font-display font-semibold text-lg mb-2">Nice to have</h2>
                <ul className="space-y-2">
                  {job.niceToHave.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground/90">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.benefits?.length > 0 && (
              <div className="mt-6">
                <h2 className="font-display font-semibold text-lg mb-3">Benefits</h2>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((b) => (
                    <Badge key={b} variant="success" className="gap-1">
                      <Gift className="h-3 w-3" /> {b}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {job.skills?.length > 0 && (
              <div className="mt-6">
                <h2 className="font-display font-semibold text-lg mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {similar.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-bold mb-4">Similar roles</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {similar.map((j) => (
                  <JobCard key={j._id} job={j} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky apply sidebar */}
        <div className="lg:sticky lg:top-24 h-fit space-y-5">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="font-mono text-2xl font-bold">
              {job.salary?.isPublic !== false ? formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency) : 'Not disclosed'}
            </p>
            <p className="text-xs text-muted-foreground mb-5">Estimated salary range</p>

            {hasApplied ? (
              <div className="flex items-center gap-2 rounded-xl bg-success/10 text-success px-4 py-3 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" /> Application submitted
              </div>
            ) : !canApply ? (
              <Button className="w-full" disabled>
                {deadlinePassed ? 'Deadline passed' : 'Applications closed'}
              </Button>
            ) : (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">Apply now</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Apply to {job.title}</DialogTitle>
                    <DialogDescription>
                      We'll send your saved resume{user?.resume?.originalName ? ` (${user.resume.originalName})` : ''}. Add an optional note for the hiring team.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Why are you a great fit for this role? (optional)"
                    maxLength={1500}
                  />
                  <Button className="w-full mt-4" onClick={handleApply} disabled={applying}>
                    {applying && <Loader2 className="h-4 w-4 animate-spin" />}
                    Submit application
                  </Button>
                </DialogContent>
              </Dialog>
            )}

            <div className="flex gap-2 mt-2.5">
              <Button variant="outline" className="flex-1" onClick={handleToggleSave}>
                {isSaved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                {isSaved ? 'Saved' : 'Save job'}
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare} aria-label="Share this job">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {job.applicationDeadline && (
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Applications close {new Date(job.applicationDeadline).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={company.logo?.url} name={company.name} size="md" className="rounded-xl" />
              <div>
                <p className="font-semibold text-sm">{company.name}</p>
                <p className="text-xs text-muted-foreground">{company.industry}</p>
              </div>
            </div>
            {company.tagline && <p className="text-sm text-muted-foreground mb-4">{company.tagline}</p>}
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to={`/companies/${company.slug}`}>
                <Building2 className="h-4 w-4" /> View company profile
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
