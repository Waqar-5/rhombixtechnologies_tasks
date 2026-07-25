import { Skeleton } from '@/components/ui/skeleton';

export default function JobCardSkeleton() {
  return (
    <div className="boarding-pass rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-center p-4">
        <Skeleton className="h-16 w-16 rounded-2xl" />
      </div>
      <div className="perforation" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
