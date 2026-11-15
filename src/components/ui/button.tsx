import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm hover:bg-[var(--primary)]/90",
        secondary:
          "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)]/80",
        outline:
          "border border-[var(--border)] bg-transparent shadow-sm hover:bg-[var(--accent)] hover:text-[var(--foreground)]",
        ghost: "hover:bg-[var(--accent)] hover:text-[var(--foreground)]",
        destructive:
          "bg-[var(--destructive)] text-white shadow-sm hover:bg-[var(--destructive)]/90",
        soft: "bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/15",
      },
      size: {
        sm: "h-8 rounded-lg px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-11 rounded-xl px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
