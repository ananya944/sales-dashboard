import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    type: "increase" | "decrease" | "neutral";
  };
  icon: LucideIcon;
  className?: string;
}

export function MetricCard({ title, value, change, icon: Icon, className }: MetricCardProps) {
  return (
    <Card className={cn(
      "bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-all duration-200 border-border/40 p-6",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-3">
        <CardTitle className="text-xs uppercase tracking-wide font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-xl font-bold text-foreground mb-1">{value}</div>
        {change && (
          <p className={cn(
            "text-xs flex items-center gap-1",
            change.type === "increase" && "text-success",
            change.type === "decrease" && "text-destructive",
            change.type === "neutral" && "text-muted-foreground"
          )}>
            {change.type === "increase" && "↗"}
            {change.type === "decrease" && "↘"}
            {change.type === "neutral" && "→"}
            <span className="font-medium">{change.value}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}