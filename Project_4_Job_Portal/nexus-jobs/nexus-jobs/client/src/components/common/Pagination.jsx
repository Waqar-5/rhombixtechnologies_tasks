import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Pagination({ page, pages, onPageChange }) {
  if (!pages || pages <= 1) return null;

  const pageNumbers = [];
  const window = 1;
  for (let i = 1; i <= pages; i += 1) {
    if (i === 1 || i === pages || (i >= page - window && i <= page + window)) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== '...') {
      pageNumbers.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pageNumbers.map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'h-10 w-10 rounded-xl text-sm font-medium transition-colors',
              p === page ? 'bg-gradient-primary text-white shadow-glow' : 'hover:bg-muted text-foreground'
            )}
          >
            {p}
          </button>
        )
      )}
      <Button variant="outline" size="icon" disabled={page >= pages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
