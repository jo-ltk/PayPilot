import type { GatewayProvider } from "@prisma/client";

import { NotFoundError } from "@/lib/api/errors";

import type { PaymentGatewayAdapter } from "./types";

/**
 * Central registry for payment gateway adapters.
 * Application code must resolve providers through this registry — never switch on provider.
 */
class PaymentGatewayRegistry {
  private readonly adapters = new Map<GatewayProvider, PaymentGatewayAdapter>();

  /**
   * Registers a gateway adapter for its provider.
   * @param adapter - Adapter implementation
   */
  register(adapter: PaymentGatewayAdapter): void {
    this.adapters.set(adapter.provider, adapter);
  }

  /**
   * Returns the adapter for a provider.
   * @param provider - Gateway provider enum value
   * @returns Registered adapter
   * @throws {NotFoundError} When no adapter is registered
   */
  get(provider: GatewayProvider): PaymentGatewayAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new NotFoundError(`No gateway adapter registered for ${provider}`);
    }
    return adapter;
  }

  /**
   * Returns all registered adapters.
   * @returns Adapter list
   */
  list(): PaymentGatewayAdapter[] {
    return [...this.adapters.values()];
  }

  /**
   * Whether an adapter is registered for the provider.
   * @param provider - Gateway provider enum value
   * @returns True when registered
   */
  has(provider: GatewayProvider): boolean {
    return this.adapters.has(provider);
  }
}

/** Singleton gateway adapter registry. */
export const paymentGatewayRegistry = new PaymentGatewayRegistry();
