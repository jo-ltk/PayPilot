/**
 * Converts a decimal currency amount to integer paise (minor units).
 *
 * All monetary values are stored as integer paise to avoid floating-point
 * reconciliation errors.
 * @param amount - Amount in major units, e.g. `"1500.00"` or `1500`
 * @returns Amount in integer paise, e.g. `150000`
 * @throws {Error} When the amount is not a finite number
 */
export function toPaise(amount: string | number): number {
  const value = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid monetary amount: ${String(amount)}`);
  }
  return Math.round(value * 100);
}
