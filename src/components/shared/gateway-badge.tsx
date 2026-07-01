import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type GatewayType = "easebuzz" | "shopify" | "unknown";

interface GatewayBadgeProps {
  gateway: GatewayType;
  className?: string;
}

const gatewayLabels: Record<GatewayType, string> = {
  easebuzz: "Easebuzz",
  shopify: "Shopify",
  unknown: "Unknown",
};

/** Neutral gateway identifier badge. */
export function GatewayBadge({ gateway, className }: GatewayBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium text-muted-foreground", className)}
    >
      {gatewayLabels[gateway]}
    </Badge>
  );
}
