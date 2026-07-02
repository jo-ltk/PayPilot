/** Deterministic pseudo-random number generator (mulberry32). */
export type Rng = {
  next: () => number;
  int: (min: number, max: number) => number;
  pick: <T>(items: readonly T[]) => T;
  pickWeighted: <T>(items: readonly { value: T; weight: number }[]) => T;
  bool: (probability?: number) => boolean;
};

/**
 * Creates a seeded PRNG for reproducible demo data.
 * @param seed - Numeric seed value
 * @returns RNG helpers
 */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  function next(): number {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function int(min: number, max: number): number {
    return Math.floor(next() * (max - min + 1)) + min;
  }

  function pick<T>(items: readonly T[]): T {
    return items[int(0, items.length - 1)]!;
  }

  function pickWeighted<T>(
    items: readonly { value: T; weight: number }[],
  ): T {
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let roll = next() * total;
    for (const item of items) {
      roll -= item.weight;
      if (roll <= 0) {
        return item.value;
      }
    }
    return items[items.length - 1]!.value;
  }

  function bool(probability = 0.5): boolean {
    return next() < probability;
  }

  return { next, int, pick, pickWeighted, bool };
}
