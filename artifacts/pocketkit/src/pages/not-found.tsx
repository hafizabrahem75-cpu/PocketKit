import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full max-w-md rounded-2xl bg-card border border-border p-8 text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <h1 className="text-2xl font-bold">Page not found</h1>
        </div>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 active:scale-95 transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
