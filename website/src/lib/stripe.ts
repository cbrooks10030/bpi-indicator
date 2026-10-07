import Stripe from "stripe";

let cached: Stripe | null = null;

/** Returns a Stripe client, or null if the secret key is not configured. */
export function getStripe(): Stripe | null {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  cached = new Stripe(key, { apiVersion: "2024-06-20" });
  return cached;
}
