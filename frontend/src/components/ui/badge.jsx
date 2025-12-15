import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-cyan-500 to-blue-500 text-white",
        secondary:
          "border-transparent bg-slate-700 text-slate-300 hover:bg-slate-600",
        destructive:
          "border-transparent bg-red-500/20 text-red-500 border-red-500/50",
        outline: 
          "text-slate-300 border-slate-600",
        success:
          "border-transparent bg-green-500/20 text-green-500 border-green-500/50",
        warning:
          "border-transparent bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
