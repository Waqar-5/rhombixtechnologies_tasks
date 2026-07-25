import { cn, initials } from '@/lib/utils';

function Avatar({ src, name, className, size = 'md' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-lg', xl: 'h-24 w-24 text-2xl' };
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={cn('rounded-full object-cover border border-border', sizes[size], className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-primary font-display font-semibold text-white',
        sizes[size],
        className
      )}
    >
      {initials(name || '?')}
    </div>
  );
}

export { Avatar };
