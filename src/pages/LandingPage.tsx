import { useState } from 'react';
import { Layers, Flame, ArrowRight, ShieldCheck, Sparkles, Database, Check } from 'lucide-react';
import { PlanType } from '../types';
import PricingSection from '../components/PricingSection';
import LeadTypesGrid from '../components/LeadTypesGrid';
import LoyaltyProgram from '../components/LoyaltyProgram';
import FAQSection from '../components/FAQSection';
import SampleLeadPopup from '../components/SampleLeadPopup';

interface LandingPageProps {
  onSelectPlan: (planId: PlanType) => void;
}

export default function LandingPage({ onSelectPlan }: LandingPageProps) {
  const [isSampleOpen, setIsSampleOpen] = useState(false);

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-[#ffffff] text-[#171717] min-h-screen" id="landing-page-root">
      
      {/* SECTION 1 — HERO */}
      <section className="relative pt-12 md:pt-24 pb-16 md:pb-24 border-b border-[#e5e7eb] overflow-hidden" id="hero-section">
        {/* Subtle grid background to suggest structural blueprint format */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3f3f3_1px,transparent_1px),linear-gradient(to_bottom,#f3f3f3_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 -z-10" />

        <div className="mx-auto max-w-5xl px-6 md:px-8 text-center space-y-8">
          {/* Top subtle announcement badge */}
          <div className="inline-block px-4 py-1.5 bg-[#ffc838] text-[11px] font-bold uppercase tracking-wider rounded-full text-[#171717] font-mono animate-fade-in shadow-xs">
            New: AI Motivation Scores Now Live
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Main Headline */}
            <h1 className="text-4xl md:text-[58px] leading-[1.1] font-medium tracking-tight text-[#171717] font-sans">
              Off-Market Leads.<br />
              <span className="text-[#7e7e7e]">Skip-Traced.</span><br />
              Delivered Weekly.
            </h1>

            {/* Subheadline */}
            <p className="text-base md:text-[18px] text-[#6f6f6f] leading-relaxed max-w-md mx-auto font-sans">
              We find real estate leads, verify their contact info, and send ready-to-call leads straight to your inbox — every single week.
            </p>
          </div>

          {/* Action buttons centered */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => handleScrollTo('pricing')}
              className="cursor-pointer px-8 py-4 bg-[#171717] hover:bg-neutral-800 text-white rounded-full text-[14px] font-medium shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
              id="hero-see-plans"
            >
              <span>See Plans</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2 — SOCIAL PROOF BAR */}
      <section className="bg-[#f3f3f3] border-b border-[#e5e7eb] py-5" id="social-proof-bar">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              'Over 10,000 leads generated already',
              '3 lead tiers — Basic, Pro, Elite',
              'Skip-traced contacts included',
              'Delivered every Monday morning'
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-center gap-2 p-1.5" id={`stat-item-${i}`}>
                <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-[#171717]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#171717] font-sans">
                  {stat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — HOW IT WORKS */}
      <section className="py-16 md:py-24 border-b border-[#e5e7eb]" id="how-it-works">
        <div className="mx-auto max-w-5xl px-6 md:px-8 space-y-12">
          {/* Header block */}
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#7e7e7e]">Process workflow</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#171717] font-sans">
              How It Works
            </h2>
          </div>

          {/* 4 Steps grid list */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" id="steps-grid">
            {[
              {
                num: '1',
                title: 'Pick Your Plan',
                desc: 'Choose the tier that fits your investing volume and target market.'
              },
              {
                num: '2',
                title: 'Tell Us Your Market',
                desc: 'Set your target geography and the lead types you want to receive.'
              },
              {
                num: '3',
                title: 'We Source and Enrich',
                desc: 'Our pipeline pulls high-intent real estate records, skip-traces every owner, and scores each lead for motivation.'
              },
              {
                num: '4',
                title: 'You Get Leads Every Week',
                desc: 'Every Monday, your fresh leads land in a Google Sheet in your inbox, ready to call.'
              }
            ].map((step, idx) => (
              <div key={idx} className="space-y-4" id={`step-card-${idx}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#171717] text-white font-mono font-bold text-sm shadow-sm ring-4 ring-neutral-100">
                  {step.num}
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-semibold tracking-tight text-[#171717]">
                    {step.title}
                  </h4>
                  <p className="text-xs text-[#6f6f6f] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — LEAD TYPES */}
      <section className="py-16 md:py-24 border-b border-[#e5e7eb] bg-[#f3f3f3]/25" id="lead-types">
        <div className="mx-auto max-w-5xl px-6 md:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#7e7e7e]">Lead Intelligence Data</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#171717] font-sans">
              What Kind of Leads Do You Get?
            </h2>
            <p className="text-xs md:text-sm text-[#6f6f6f] max-w-2xl mx-auto font-sans leading-relaxed">
              We source the highest-converting real estate lead types — labeled and categorized in every delivery.
            </p>
          </div>

          <LeadTypesGrid />
        </div>
      </section>

      {/* SECTION 5 — PRICING */}
      <section className="py-16 md:py-24 border-b border-[#e5e7eb]" id="pricing">
        <div className="mx-auto max-w-5xl px-6 md:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#7e7e7e]">Flexible Subscriptions</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#171717] font-sans">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xs md:text-sm text-[#6f6f6f] max-w-xl mx-auto font-sans leading-relaxed">
              No contracts. Cancel anytime. Your first delivery arrives within 1 day of signup.
            </p>
          </div>

          <PricingSection onSelectPlan={onSelectPlan} />
        </div>
      </section>

      {/* SECTION 6 — LOYALTY PROGRAM */}
      <section className="py-16 md:py-24 border-b border-[#e5e7eb] bg-[#f3f3f3]/15" id="loyalty-program">
        <div className="mx-auto max-w-5xl px-6 md:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#7e7e7e]">Retention Bonuses</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#171717] font-sans">
              The Longer You Stay, The More You Get
            </h2>
            <p className="text-xs md:text-sm text-[#6f6f6f] max-w-xl mx-auto font-sans leading-relaxed">
              We reward subscribers who stick around. Your benefits grow automatically — no codes, no requests.
            </p>
          </div>

          <LoyaltyProgram />
        </div>
      </section>

      {/* SECTION 7 — FAQ */}
      <section className="py-16 md:py-24 scroll-mt-6" id="faq">
        <div className="mx-auto max-w-5xl px-6 md:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#7e7e7e]">Common Questions</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#171717] font-sans">
              Frequently Asked Questions
            </h2>
          </div>

          <FAQSection />
        </div>
      </section>

      {/* Popups */}
      <SampleLeadPopup isOpen={isSampleOpen} onClose={() => setIsSampleOpen(false)} />

      {/* Floating Pricing Preview Anchor */}
      <div 
        onClick={() => handleScrollTo('pricing')}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 flex items-center gap-2 bg-[#171717] hover:bg-neutral-800 text-white p-2 pl-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-40 cursor-pointer active:scale-95 transition-all duration-200"
        id="floating-pricing-preview"
      >
        <span className="text-[11px] font-bold uppercase tracking-widest mr-2 select-none">Plans Start At $50</span>
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#171717]">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
