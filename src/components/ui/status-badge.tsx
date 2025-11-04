import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium lowercase",
  {
    variants: {
      variant: {
        active: "bg-green-50 text-green-700",
        onboarding: "bg-blue-50 text-blue-700",
        terminated: "bg-red-50 text-red-700",
        pending: "bg-amber-50 text-amber-700",
        draft: "bg-gray-100 text-gray-600",
      },
    },
    defaultVariants: {
      variant: "draft",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
}

export function StatusBadge({ className, variant, children, ...props }: StatusBadgeProps) {
  return (
    <div className={cn(statusBadgeVariants({ variant }), className)} {...props}>
      <div className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </div>
  );
}