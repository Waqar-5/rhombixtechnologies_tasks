import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const jobTypeOptions = [
  { value: 'all', label: 'All types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' }
];

const workModeOptions = [
  { value: 'all', label: 'All modes' },
  { value: 'on-site', label: 'On-site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' }
];

const experienceOptions = [
  { value: 'all', label: 'All levels' },
  { value: 'entry', label: 'Entry level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' }
];

const sortOptions = [
  { value: 'relevant', label: 'Most relevant' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'salary-high', label: 'Salary: high to low' },
  { value: 'salary-low', label: 'Salary: low to high' }
];

export default function JobFilters({ filters, onChange, categories = [] }) {
  const update = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  const reset = () =>
    onChange({
      jobType: 'all',
      workMode: 'all',
      experienceLevel: 'all',
      category: 'all',
      sort: 'relevant',
      page: 1,
      q: filters.q
    });

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-5 sticky top-24">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={reset} className="text-xs text-muted-foreground h-7 px-2">
          <RotateCcw className="h-3 w-3" /> Reset
        </Button>
      </div>

      <div>
        <Label>Category</Label>
        <Select value={filters.category || 'all'} onValueChange={(v) => update('category', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Job type</Label>
        <Select value={filters.jobType || 'all'} onValueChange={(v) => update('jobType', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {jobTypeOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Work mode</Label>
        <Select value={filters.workMode || 'all'} onValueChange={(v) => update('workMode', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {workModeOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Experience</Label>
        <Select value={filters.experienceLevel || 'all'} onValueChange={(v) => update('experienceLevel', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {experienceOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Sort by</Label>
        <Select value={filters.sort || 'relevant'} onValueChange={(v) => update('sort', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
