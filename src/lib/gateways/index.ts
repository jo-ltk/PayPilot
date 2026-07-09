/**
 * Side-effect imports register all payment gateway adapters with the registry.
 * Import this module once at application bootstrap (API routes, services).
 */
import "./adapters/easebuzz/adapter";
import "./adapters/razorpay/adapter";
import "./adapters/cashfree/adapter";

export { paymentGatewayRegistry } from "./registry";
export type { PaymentGatewayAdapter } from "./types";
