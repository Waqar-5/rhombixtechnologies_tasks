import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { jobSchema } from '@/lib/schemas';
import { jobsApi } from '@/api/jobs';
import { categoriesApi } from '@/api/categories';

const listToArray = (value) =>
  (value || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

export default function JobForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingJob, setLoadingJob] = useState(isEdit);
  const [extraFields, setExtraFields] = useState({
    responsibilities: '',
    requirements: '',
    niceToHave: '',
    benefits: ''
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: { vacancies: 1 }
  });

  useEffect(() => {
    categoriesApi.getAll().then((data) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    jobsApi.getMine({ limit: 100 }).then((data) => {
      const job = data.jobs.find((j) => j._id === id);
      if (job) {
        setValue('title', job.title);
        setValue('category', job.category?._id || job.category);
        setValue('description', job.description);
        setValue('jobType', job.jobType);
        setValue('workMode', job.workMode);
        setValue('experienceLevel', job.experienceLevel);
        setValue('location', job.location);
        setValue('salaryMin', job.salary?.min);
        setValue('salaryMax', job.salary?.max);
        setValue('vacancies', job.vacancies);
        setValue('skills', job.skills?.join(', '));
        setValue(
          'applicationDeadline',
          job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().slice(0, 10) : ''
        );
        setExtraFields({
          responsibilities: (job.responsibilities || []).join('\n'),
          requirements: (job.requirements || []).join('\n'),
          niceToHave: (job.niceToHave || []).join('\n'),
          benefits: (job.benefits || []).join('\n')
        });
      }
      setLoadingJob(false);
    });
  }, [id, isEdit, setValue]);

  const onSubmit = async (data, status = 'open') => {
    const payload = {
      title: data.title,
      category: data.category,
      description: data.description,
      jobType: data.jobType,
      workMode: data.workMode,
      experienceLevel: data.experienceLevel,
      location: data.location,
      salary: { min: data.salaryMin || null, max: data.salaryMax || null, currency: 'USD', isPublic: true },
      vacancies: data.vacancies || 1,
      applicationDeadline: data.applicationDeadline || null,
      skills: data.skills ? data.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      responsibilities: listToArray(extraFields.responsibilities),
      requirements: listToArray(extraFields.requirements),
      niceToHave: listToArray(extraFields.niceToHave),
      benefits: listToArray(extraFields.benefits),
      status
    };

    try {
      if (isEdit) {
        await jobsApi.update(id, payload);
        toast.success('Job updated');
      } else {
        await jobsApi.create(payload);
        toast.success(status === 'draft' ? 'Draft saved' : 'Job published');
      }
      navigate('/recruiter/jobs');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loadingJob) return <p className="text-sm text-muted-foreground">Loading job…</p>;

  return (
    <div className="max-w-3xl">
      <PageHeader title={isEdit ? 'Edit job' : 'Post a new job'} description="Jobs go live instantly once published — no approval needed." />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit((data) => onSubmit(data, 'open'))} className="space-y-5">
            <div>
              <Label htmlFor="title">Job title</Label>
              <Input id="title" placeholder="e.g. Senior Frontend Engineer" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={watch('category')} onValueChange={(v) => setValue('category', v, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="City or 'Remote'" {...register('location')} />
                {errors.location && <p className="text-xs text-destructive mt-1">{errors.location.message}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label>Job type</Label>
                <Select value={watch('jobType')} onValueChange={(v) => setValue('jobType', v, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Work mode</Label>
                <Select value={watch('workMode')} onValueChange={(v) => setValue('workMode', v, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on-site">On-site</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Experience</Label>
                <Select
                  value={watch('experienceLevel')}
                  onValueChange={(v) => setValue('experienceLevel', v, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry level</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="salaryMin">Salary min (USD)</Label>
                <Input id="salaryMin" type="number" {...register('salaryMin')} />
              </div>
              <div>
                <Label htmlFor="salaryMax">Salary max (USD)</Label>
                <Input id="salaryMax" type="number" {...register('salaryMax')} />
              </div>
              <div>
                <Label htmlFor="vacancies">Vacancies</Label>
                <Input id="vacancies" type="number" min={1} {...register('vacancies')} />
              </div>
            </div>

            <div>
              <Label htmlFor="applicationDeadline">Application deadline</Label>
              <Input id="applicationDeadline" type="date" {...register('applicationDeadline')} />
            </div>

            <div>
              <Label htmlFor="skills">Skills</Label>
              <Input id="skills" placeholder="React, Node.js, MongoDB" {...register('skills')} />
              <p className="text-xs text-muted-foreground mt-1">Separate skills with commas</p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={5} placeholder="Describe the role, team, and impact" {...register('description')} />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <Label>Responsibilities</Label>
              <Textarea
                rows={4}
                placeholder="One per line"
                value={extraFields.responsibilities}
                onChange={(e) => setExtraFields((prev) => ({ ...prev, responsibilities: e.target.value }))}
              />
            </div>

            <div>
              <Label>Requirements</Label>
              <Textarea
                rows={4}
                placeholder="One per line"
                value={extraFields.requirements}
                onChange={(e) => setExtraFields((prev) => ({ ...prev, requirements: e.target.value }))}
              />
            </div>

            <div>
              <Label>Nice to have</Label>
              <Textarea
                rows={3}
                placeholder="One per line"
                value={extraFields.niceToHave}
                onChange={(e) => setExtraFields((prev) => ({ ...prev, niceToHave: e.target.value }))}
              />
            </div>

            <div>
              <Label>Benefits</Label>
              <Textarea
                rows={3}
                placeholder="One per line — e.g. Health insurance, Unlimited PTO, Remote stipend"
                value={extraFields.benefits}
                onChange={(e) => setExtraFields((prev) => ({ ...prev, benefits: e.target.value }))}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? 'Save changes' : 'Publish job'}
              </Button>
              {!isEdit && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
                >
                  Save as draft
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
