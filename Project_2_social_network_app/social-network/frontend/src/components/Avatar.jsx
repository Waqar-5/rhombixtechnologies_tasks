import { getInitials, avatarHue, cx } from '../utils/helpers';

const sizeMap = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-28 h-28 text-3xl',
};

const Avatar = ({ src, name = '', size = 'md', online, className = '', ringed = false }) => {
  const sizeClasses = sizeMap[size] || sizeMap.md;

  return (
    <div className={cx('relative inline-block shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cx(
            sizeClasses,
            'rounded-full object-cover',
            ringed && 'ring-2 ring-[var(--color-ink)]'
          )}
        />
      ) : (
        <div
          className={cx(
            sizeClasses,
            'rounded-full flex items-center justify-center font-display font-semibold text-ink',
            ringed && 'ring-2 ring-[var(--color-ink)]'
          )}
          style={{ backgroundColor: avatarHue(name), color: '#0F1115' }}
        >
          {getInitials(name) || '?'}
        </div>
      )}
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--color-sage)] ring-2 ring-[var(--color-ink)]" />
      )}
    </div>
  );
};

export default Avatar;
