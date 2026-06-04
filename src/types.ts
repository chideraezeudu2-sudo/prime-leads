export type PlanType = 'Basic' | 'Pro' | 'Elite';

export interface Plan {
  id: PlanType;
  name: string;
  price: string;
  volume: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
}

export interface LeadType {
  name: string;
  description: string;
  tier: 'All' | 'Pro and Elite' | 'Elite Only';
}

export interface OnboardingState {
  plan: PlanType;
  step: number;
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail?: string;
  phone: string;
  states: string[];
  zipCodes: string;
  excludeZipCodes?: string;
  counties: string;
  selectedLeadTypes: string[];
  password?: string;
  iAgreeToDelivery?: boolean;
  deliveryFrequency?: 'Weekly' | 'Bi-weekly' | 'Monthly';
  geographyText?: string;
  customRequests?: string;
  customLeadTypeOther?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface LeadSample {
  ownerName: string;
  propertyAddress: string;
  mailingAddress: string;
  leadType: string;
  daysDelinquent: number;
  estimatedEquity: string;
  phoneNumber: string;
  motivationScore: number;
  outreachScript: string;
}
