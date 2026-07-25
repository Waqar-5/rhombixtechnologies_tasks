import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[70vh] px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-6">
        <Compass className="h-9 w-9" />
      </div>
      <h1 className="font-display text-4xl font-bold">404</h1>
      <p className="text-muted-foreground mt-2 max-w-sm">
        Looks like this role — or page — has been filled. Let's get you back on track.
      </p>
      <Button className="mt-6" asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
