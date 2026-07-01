"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { dialogContentVariants, reducedMotionTransition } from "@/lib/animations";
import type { ReconciliationView } from "@/schemas/payments.schema";

interface ResolveDialogProps {
  record: ReconciliationView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: (recordId: string, notes: string) => Promise<void>;
}

/** Confirmation dialog for marking a reconciliation mismatch as resolved. */
export function ResolveDialog({
  record,
  open,
  onOpenChange,
  isPending,
  onConfirm,
}: ResolveDialogProps) {
  const prefersReducedMotion = useReducedMotion();
  const [notes, setNotes] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setNotes("");
    }

    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!record) {
      return;
    }

    try {
      await onConfirm(record.id, notes);
      toast.success("Mismatch resolved");
      setNotes("");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resolve mismatch",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {record ? (
          <motion.div
            variants={dialogContentVariants}
            initial="hidden"
            animate="visible"
            transition={prefersReducedMotion ? reducedMotionTransition : undefined}
          >
            <DialogHeader>
              <DialogTitle>Resolve mismatch</DialogTitle>
              <DialogDescription>
                Mark this reconciliation record as resolved. This action updates
                the status and refreshes dashboard KPIs.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="resolve-notes">Resolution notes</Label>
                <Input
                  id="resolve-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Optional notes for your team…"
                  aria-describedby="resolve-notes-hint"
                />
                <p
                  id="resolve-notes-hint"
                  className="text-xs text-muted-foreground"
                >
                  Notes are for your records and are not sent to the API.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleConfirm} disabled={isPending}>
                {isPending ? "Resolving…" : "Confirm resolution"}
              </Button>
            </DialogFooter>
          </motion.div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
