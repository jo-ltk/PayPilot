import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  paise: number;
  currency?: string;
  signed?: boolean;
  className?: string;
}

/** Formats integer paise as a localized currency string. */
export function CurrencyDisplay({
  paise,
  currency = "INR",
  signed = false,
  className,
}: CurrencyDisplayProps) {
  const formatted = formatCurrency(Math.abs(paise), currency);
  const prefix = signed && paise > 0 ? "+" : signed && paise < 0 ? "−" : "";

  return (
    <span
      className={cn(
        "tabular-nums",
        signed && paise > 0 && "text-success",
        signed && paise < 0 && "text-destructive",
        className,
      )}
    >
      {prefix}
      {formatted}
    </span>
  );
}
