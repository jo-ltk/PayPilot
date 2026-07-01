"use client";

import { MatchingStrategy } from "@prisma/client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MATCHING_STRATEGY_LABELS } from "@/lib/settings-labels";
import type { MatchingFormValues } from "@/lib/settings-form";

interface MatchingStrategyFieldsProps {
  values: MatchingFormValues;
  disabled?: boolean;
  onChange: (patch: Partial<MatchingFormValues>) => void;
}

const STRATEGY_OPTIONS = Object.values(MatchingStrategy);

/** Matching strategy and tolerance fields for reconciliation settings. */
export function MatchingStrategyFields({
  values,
  disabled = false,
  onChange,
}: MatchingStrategyFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="matching-strategy">Matching strategy</Label>
        <Select
          value={values.strategy}
          onValueChange={(strategy) =>
            onChange({ strategy: strategy as MatchingStrategy })
          }
          disabled={disabled}
        >
          <SelectTrigger id="matching-strategy" className="w-full">
            <SelectValue placeholder="Select strategy" />
          </SelectTrigger>
          <SelectContent>
            {STRATEGY_OPTIONS.map((strategy) => (
              <SelectItem key={strategy} value={strategy}>
                {MATCHING_STRATEGY_LABELS[strategy]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount-tolerance">Amount tolerance (paise)</Label>
        <Input
          id="amount-tolerance"
          type="number"
          min={0}
          step={1}
          disabled={disabled}
          value={values.amountTolerancePaise}
          onChange={(event) =>
            onChange({
              amountTolerancePaise: Number.parseInt(event.target.value, 10) || 0,
            })
          }
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="include-gateway-fees"
          checked={values.includeGatewayFees}
          disabled={disabled}
          onCheckedChange={(checked) =>
            onChange({ includeGatewayFees: checked === true })
          }
        />
        <Label htmlFor="include-gateway-fees" className="font-normal">
          Include gateway fees when matching amounts
        </Label>
      </div>
    </div>
  );
}
