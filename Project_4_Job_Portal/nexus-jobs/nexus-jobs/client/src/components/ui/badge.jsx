import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/10 text-primary',
        secondary: 'border-transparent bg-secondary/10 text-secondary',
        accent: 'border-transparent bg-accent/15 text-accent-foreground',
        outline: 'border-border text-foreground',
        success: 'border-transparent bg-success/10 text-success',
        destructive: 'border-transparent bg-destructive/10 text-destructive'
      }
    },
    defaultVariants: { variant: 'default' }
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
