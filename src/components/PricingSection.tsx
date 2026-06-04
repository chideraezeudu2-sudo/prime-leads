import { Check, Star, Shield, Cpu, RefreshCw } from 'lucide-react';
import { PLANS } from '../data';
import { PlanType } from '../types';

interface PricingSectionProps {
  onSelectPlan: (planId: PlanType) => void;
}

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  return (
    <div className="space-y-12" id="pricing-wrapper">
      <div className="grid gap-8 lg:grid-cols-3 items-stretch max-w-5xl mx-auto">
        {PLANS.map((plan) => {
          const isPro = plan.id === 'Pro';
          const isElite = plan.id === 'Elite';

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-[20px] bg-white p-7 transition-all border
                ${isPro 
                  ? 'border-[#171717] ring-1 ring-[#171717] scale-102 lg:scale-105 z-10 shadow-compound' 
                  : 'border-gray-200/80 hover:border-gray-300 shadow-fine'
                }`}
              id={`pricing-card-${plan.id.toLowerCase()}`}
            >
              {/* Most popular tag */}
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#171717] px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-white border border-neutral-700">
                  Most Popular
                </div>
              )}

              {/* Plan Title & Metadata */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono tracking-wider uppercase text-neutral-400">
                    {plan.name} Tier
                  </span>
                  {isElite && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/50">
                      <Star className="h-2.5 w-2.5 fill-amber-300" /> Executive
                    </span>
                  )}
                  {isPro && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-neutral-800 bg-neutral-100 px-2.5 py-0.5 rounded-full">
                      Growth
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold tracking-tight text-[#171717] font-sans">
                      {plan.price}
                    </span>
                    <span className="text-sm text-[#7e7e7e] font-sans">/mo</span>
                  </div>
                  <p className="text-xs font-semibold text-[#171717] font-mono bg-neutral-50 p-2 rounded-lg border border-dashed border-gray-200 inline-block">
                    {plan.volume}
                  </p>
                  
                  {plan.id === 'Basic' ? (
                    <div className="mt-2 rounded-xl bg-orange-50 border border-orange-200/60 p-2.5 flex items-center gap-2 text-[10px] text-orange-800 font-bold uppercase tracking-wider font-sans">
                      <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500 animate-pulse" />
                      <span>Shared leads with other subscribers</span>
                    </div>
                  ) : (
                    <div className="mt-2 rounded-xl bg-emerald-50/80 border border-emerald-200/60 p-2.5 flex items-center gap-2 text-[10px] text-emerald-800 font-bold uppercase tracking-wider font-sans">
                      <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Exclusive leads</span>
                    </div>
                  )}
                </div>

                <hr className="border-gray-100" />

                {/* Features List */}
                <ul className="space-y-3 pt-2 text-left">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-[#6f6f6f] leading-relaxed">
                      <Check className="h-4 w-4 text-[#171717] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="mt-8 space-y-2">
                <button
                  onClick={() => onSelectPlan(plan.id)}
                  className={`cursor-pointer w-full rounded-full py-2.5 text-xs font-semibold tracking-wide transition-all active:scale-97
                    ${isPro
                      ? 'bg-[#171717] text-white hover:bg-neutral-800'
                      : 'bg-[#f3f3f3] text-[#171717] hover:bg-neutral-200'
                    }`}
                  id={`btn-select-${plan.id.toLowerCase()}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-[#7e7e7e] flex items-center justify-center gap-2 max-w-md mx-auto">
          <Shield className="h-3.5 w-3.5 text-[#171717]" />
          <span>No contracts. Cancel anytime. Secure payments handled via Stripe.</span>
        </p>
      </div>
    </div>
  );
}
