import { formatDistanceToNowStrict } from 'date-fns';

/** Joins class names conditionally, skipping falsy values. */
export const cx = (...classes) => classes.filter(Boolean).join(' ');

/** Formats a date as a short relative time string, e.g. "3m", "2h", "5d". */
export const timeAgo = (date) => {
  const distance = formatDistanceToNowStrict(new Date(date));
  return distance
    .replace(' seconds', 's')
    .replace(' second', 's')
    .replace(' minutes', 'm')
    .replace(' minute', 'm')
    .replace(' hours', 'h')
    .replace(' hour', 'h')
    .replace(' days', 'd')
    .replace(' day', 'd')
    .replace(' months', 'mo')
    .replace(' month', 'mo')
    .replace(' years', 'y')
    .replace(' year', 'y');
};

/** Builds a readable "last seen" label. */
export const lastSeenLabel = (date) => {
  if (!date) return 'a while ago';
  return `${timeAgo(date)} ago`;
};

/** Returns initials from a full name, for avatar fallbacks. */
export const getInitials = (name = '') => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
};

/** Picks a deterministic accent color band from a name, for avatar fallbacks. */
export const avatarHue = (name = '') => {
  const sum = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const hues = ['#FF5A36', '#4ADE80', '#F5B942', '#5B8DEF', '#C77DFF'];
  return hues[sum % hues.length];
};
