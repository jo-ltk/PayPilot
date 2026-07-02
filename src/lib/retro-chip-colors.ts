/** Rotating icon-chip colors shared by the sidebar nav and top bar so pages read consistently. */
export const retroChipColors = [
  "bg-[var(--retro-pink)] text-[var(--retro-chart-strong)]",
  "bg-[var(--retro-blue)] text-[var(--retro-chart-strong)]",
  "bg-[var(--retro-mint)] text-[var(--retro-chart-strong)]",
  "bg-[var(--retro-lilac)] text-[var(--retro-chart-strong)]",
  "bg-[var(--retro-yellow)] text-[var(--retro-chart-strong)]",
];

/**
 * Resolves the chip color class for a given nav index.
 * @param index - Zero-based position of the item in its list
 * @returns Tailwind class string for the chip background + icon color
 */
export function getRetroChipColor(index: number): string {
  return retroChipColors[index % retroChipColors.length];
}
