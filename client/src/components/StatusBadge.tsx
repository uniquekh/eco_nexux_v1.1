import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProductStatus = 
  | "Manufactured" 
  | "Sold" 
  | "Used" 
  | "Returned"
  | "Collected"
  | "In Inventory"
  | "Sent to Recycling"
  | "Recycled"
  | "Active";

interface StatusBadgeProps {
  status: ProductStatus;
  className?: string;
}

const statusStyles: Record<ProductStatus, string> = {
  "Manufactured": "bg-muted text-muted-foreground border-muted-border",
  "Sold": "bg-status-sold/10 text-status-sold border-status-sold/20",
  "Used": "bg-status-used/10 text-status-used border-status-used/20",
  "Returned": "bg-status-returned/10 text-status-returned border-status-returned/20",
  "Collected": "bg-status-collected/10 text-status-collected border-status-collected/20",
  "In Inventory": "bg-status-inventory/10 text-status-inventory border-status-inventory/20",
  "Sent to Recycling": "bg-status-recycling/10 text-status-recycling border-status-recycling/20",
  "Recycled": "bg-status-recycled/10 text-status-recycled border-status-recycled/20",
  "Active": "bg-green-500/10 text-green-700 dark:text-green-400 border-green-300",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn(statusStyles[status], className)}
      data-testid={`badge-status-${status.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {status}
    </Badge>
  );
}
