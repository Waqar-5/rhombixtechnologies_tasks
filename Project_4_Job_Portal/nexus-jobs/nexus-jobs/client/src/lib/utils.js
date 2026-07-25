import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatSalary(min, max, currency = 'USD') {
  if (!min && !max) return 'Salary not disclosed';
  const symbol = currency === 'USD' ? '$' : currency;
  const fmt = (n) => `${symbol}${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt(min || max);
}

export function formatRelativeDate(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals = [
    { label: 'y', secs: 31536000 },
    { label: 'mo', secs: 2592000 },
    { label: 'd', secs: 86400 },
    { label: 'h', secs: 3600 },
    { label: 'm', secs: 60 }
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.secs);
    if (count >= 1) return `${count}${i.label} ago`;
  }
  return 'just now';
}

export function initials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const jobTypeLabels = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
  freelance: 'Freelance'
};

export const workModeLabels = {
  'on-site': 'On-site',
  remote: 'Remote',
  hybrid: 'Hybrid'
};

export const experienceLabels = {
  entry: 'Entry level',
  junior: 'Junior',
  mid: 'Mid level',
  senior: 'Senior',
  lead: 'Lead'
};

export const statusColors = {
  applied: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'in-review': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  shortlisted: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  interview: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  rejected: 'bg-red-500/10 text-red-600 dark:text-red-400',
  hired: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
};
