import { OnboardingState } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Stripe price IDs — set these in your .env after creating products in Stripe dashboard
const STRIPE_PRICE_IDS: Record<string, string> = {
  Basic: import.meta.env.VITE_STRIPE_PRICE_BASIC,
  Pro: import.meta.env.VITE_STRIPE_PRICE_PRO,
  Elite: import.meta.env.VITE_STRIPE_PRICE_ELITE,
};

export interface OnboardResponse {
  success: boolean;
  subscriber_id: string;
  delivery_id: string;
  plan: string;
  complimentary_leads: number;
  trial_ends_at: string;
  next_delivery_at: string;
  message: string;
}

// Step 1 — POST onboarding data to Supabase Edge Function
export async function submitOnboarding(formData: OnboardingState): Promise<OnboardResponse> {
  const payload = {
    full_name: `${formData.firstName} ${formData.lastName}`.trim(),
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    phone: formData.phone || null,
    password: formData.password || null,
    plan: formData.plan,
    delivery_frequency: formData.deliveryFrequency || 'Weekly',
    lead_types: formData.selectedLeadTypes,
    states: formData.states,
    zip_codes_include: formData.zipCodes
      ? formData.zipCodes.split(',').map((z) => z.trim()).filter(Boolean)
      : [],
    zip_codes_exclude: formData.excludeZipCodes
      ? formData.excludeZipCodes.split(',').map((z) => z.trim()).filter(Boolean)
      : [],
    counties: formData.counties
      ? formData.counties.split(',').map((c) => c.trim()).filter(Boolean)
      : [],
    geography_text: formData.geographyText || null,
    custom_requests: [formData.customRequests, formData.customLeadTypeOther]
      .filter(Boolean)
      .join(' | ') || null,
  };

  const res = await fetch(`${SUPABASE_URL}/functions/v1/onboard-subscriber`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Onboarding failed. Please try again.');
  }

  return data as OnboardResponse;
}

// Step 2 — POST to create-checkout Edge Function to get Stripe Checkout URL
export async function createStripeCheckout(
  subscriberId: string,
  email: string,
  plan: string
): Promise<{ url: string }> {
  const priceId = STRIPE_PRICE_IDS[plan];

  if (!priceId) {
    throw new Error(`No Stripe price ID configured for plan: ${plan}`);
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      subscriber_id: subscriberId,
      email,
      plan,
      price_id: priceId,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to create checkout session.');
  }

  return data;
}
