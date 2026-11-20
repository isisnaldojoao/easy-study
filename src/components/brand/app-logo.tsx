import { cn } from "@/lib/utils";

export function AppLogo({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-sm font-bold text-teal-300 ring-1 ring-teal-400/30",
        className
      )}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.32) }}
      aria-hidden
    >
      SF
    </span>
  );
}
