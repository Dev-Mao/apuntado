import { cn } from "@/lib";

interface LiveNoticeProps {
  message: string | null | undefined;
  className?: string | undefined;
}

export function LiveNotice({ message, className }: LiveNoticeProps) {
  return (
    <p aria-live="polite" className={cn("text-lg leading-snug text-coral-ink italic empty:sr-only", className)}>
      {message}
    </p>
  );
}
