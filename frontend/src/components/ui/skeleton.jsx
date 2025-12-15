import * as React from "react";
import { cn } from "../../lib/utils";

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/50", className)}
      {...props}
    />
  );
};

export { Skeleton };
