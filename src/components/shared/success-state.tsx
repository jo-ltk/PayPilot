import { CheckCircle2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface SuccessStateProps {
  title?: string;
  message: string;
  className?: string;
}

/** Accessible success banner for completed actions. */
export function SuccessState({
  title = "Success",
  message,
  className,
}: SuccessStateProps) {
  return (
    <Alert
      className={cn(
        "max-w-xl border-success/30 bg-success/5 text-foreground",
        className,
      )}
    >
      <CheckCircle2 aria-hidden="true" className="text-success" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
