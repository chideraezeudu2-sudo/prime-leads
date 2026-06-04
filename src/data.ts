import { Plan, LeadType, FAQItem, LeadSample } from './types';

export const PLANS: Plan[] = [
  {
    id: 'Basic',
    name: 'Basic',
    price: '$50',
    volume: '500 shared leads/month',
    features: [
      '500 shared leads/month',
      'Mixed lead types (all standard types)',
      'National geography',
      'Skip-traced contact info included',
      'Weekly Google Sheet delivery',
      'Email support'
    ],
    buttonText: 'Start Basic'
  },
  {
    id: 'Pro',
    name: 'Pro',
    price: '$150',
    volume: '100 leads/month',
    isPopular: true,
    features: [
      '100 leads/month',
      'All standard + advanced lead types',
      'Up to 3 states + 5 zip codes',
      'Skip-traced + enriched (ARV, equity %, max offer)',
      'Weekly Google Sheet delivery',
      'Priority email support',
      'Loyalty perks at 3 and 6 months'
    ],
    buttonText: 'Start Pro'
  },
  {
    id: 'Elite',
    name: 'Elite',
    price: '$500',
    volume: '50 leads/month',
    features: [
      '50 leads/month',
      'All lead types including niche',
      'Unlimited geography',
      'Full enrichment + AI motivation score + custom outreach script per lead',
      'Personal hotlist (top 10 leads hand-picked weekly)',
      'SMS alert when a score-9 or score-10 lead drops',
      'Weekly Google Sheet delivery',
      'Dedicated support',
      'Loyalty perks at 3, 6, and 12 months'
    ],
    buttonText: 'Start Elite'
  }
];

export const LEAD_TYPES: LeadType[] = [
  {
    name: 'Probate',
    description: 'Properties going through estate proceedings — heirs often want a fast, clean sale.',
    tier: 'Pro and Elite'
  },
  {
    name: 'Tax Delinquent',
    description: 'Owners behind on property taxes, often motivated to sell before losing the property.',
    tier: 'All'
  },
  {
    name: 'Pre-foreclosure',
    description: "Homeowners who've received a notice of default and are running out of time.",
    tier: 'All'
  },
  {
    name: 'Absentee Owner',
    description: 'Properties owned by someone living elsewhere — often tired landlords or inherited properties.',
    tier: 'All'
  },
  {
    name: 'High Equity (40%+)',
    description: 'Owners sitting on significant equity, making a cash offer easy to structure.',
    tier: 'All'
  },
  {
    name: 'Vacant Property',
    description: 'Unoccupied homes that are costing the owner money with no return.',
    tier: 'All'
  },
  {
    name: 'Out-of-State Owner',
    description: 'Owners managing a property from another state — distance breeds motivation.',
    tier: 'Pro and Elite'
  },
  {
    name: 'Code Violations',
    description: 'Properties flagged by the city, creating pressure to sell fast.',
    tier: 'Pro and Elite'
  },
  {
    name: 'Divorce',
    description: 'Properties marital split, where court orders or quick resolution triggers motivation.',
    tier: 'Pro and Elite'
  },
  {
    name: 'Empty Nester (15+ years owned)',
    description: 'Long-term owners in homes too large for their current life.',
    tier: 'Elite Only'
  }
];

export const LOYALTY_TIERS = [
  {
    period: 'Month 3',
    benefit: 'Unlock a bonus leads top-up',
    details: '10% extra leads added to your next delivery automatically.'
  },
  {
    period: 'Month 6',
    benefit: 'Unlock a free market report',
    details: 'Comprehensive property analytics for one county of your choice.'
  },
  {
    period: 'Month 12',
    benefit: 'Unlock strategy call + Partner badge',
    details: '1-on-1 strategy call + Partner badge displayed on your account profile.'
  }
];

export const FAQS: FAQItem[] = [
  {
    question: 'How are the leads sourced?',
    answer: 'We pull from county public records, court filings, and property data platforms. Every lead is sourced from legitimate public data and verified before delivery.'
  },
  {
    question: 'What does skip-traced mean?',
    answer: "Skip tracing is the process of finding a property owner's current phone number and mailing address. Every lead we deliver has been run through our multi-provider verification system so you're calling real, working numbers."
  },
  {
    question: 'How do I receive my leads?',
    answer: 'Every Monday morning, your leads land in a Google Sheet that gets emailed directly to you. No app to log into, no dashboard to check.'
  },
  {
    question: 'Can I change my geography or lead type preferences?',
    answer: "Yes. Email us anytime and we'll update your preferences before your next delivery."
  },
  {
    question: 'What if I want to cancel?',
    answer: 'Every subscriber gets a Stripe customer portal link in their confirmation email. You can cancel, pause, or update your payment method there anytime — no need to contact us.'
  },
  {
    question: 'What\'s the difference between Basic and Pro lead volume?',
    answer: "Basic gives you 500 mixed leads because they're broader and less filtered. Pro gives you 100 leads that are more targeted, enriched with property financials, and matched to your specific geography. Fewer leads, higher quality."
  },
  {
    question: 'When do I get my first delivery?',
    answer: 'The next day after signup. After that, we follow your selected sending timeline.'
  }
];

export const SAMPLE_LEAD: LeadSample = {
  ownerName: 'Johnathan H. Vance',
  propertyAddress: '1482 Pinehurst Rd, Atlanta, GA 30311',
  mailingAddress: '402 North State St, Chicago, IL 60610',
  leadType: 'Tax Delinquent',
  daysDelinquent: 194,
  estimatedEquity: '$165,000 (84% Equity)',
  phoneNumber: '404-5XX-XX29',
  motivationScore: 8,
  outreachScript: 'Hi Johnathan, I noticed your property on Pinehurst Rd and was wondering if you’d consider a hassle-free cash offer. We specialize in fast closings and helping resolve any outstanding liens. Let’s discuss what works best for you!'
};

export const STATES_LIST = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];
