import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) => format(new Date(date), 'MMM d, yyyy');

export const formatRelativeTime = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatCount = (n = 0) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

export const truncate = (text = '', max = 140) =>
  text.length > max ? `${text.slice(0, max).trim()}…` : text;

export const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '');

export const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (!data) return error?.message || 'Something went wrong. Please try again.';

  // Our backend's error envelope is { success, message, errors: [{field, message}] }.
  // The top-level message is often a generic label like "Validation failed" —
  // when field-level detail is available, that's the part worth showing.
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((e) => e.message).join(' ');
  }
  return data.message || 'Something went wrong. Please try again.';
};
