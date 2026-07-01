"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ShopView } from "@/types/api";

interface ShopFilterProps {
  value: string;
  onChange: (shopId: string) => void;
  shops: ShopView[];
  className?: string;
}

/** Shop selector for multi-shop standalone users. */
export function ShopFilter({
  value,
  onChange,
  shops,
  className,
}: ShopFilterProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor="shop-filter" className="sr-only">
        Shop
      </Label>
      <Select
        value={value}
        onValueChange={(next) => {
          if (next) {
            onChange(next);
          }
        }}
      >
        <SelectTrigger id="shop-filter" className="w-full sm:w-56">
          <SelectValue placeholder="Select shop" />
        </SelectTrigger>
        <SelectContent>
          {shops.map((shop) => (
            <SelectItem key={shop.id} value={shop.id}>
              {shop.shopName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
