import { Award, Zap, Compass, CheckCircle } from 'lucide-react';
import { LOYALTY_TIERS } from '../data';

export default function LoyaltyProgram() {
  return (
    <div className="rounded-[20px] bg-white border border-gray-200/80 p-6 md:p-8 shadow-fine max-w-4xl mx-auto" id="loyalty-container">
      <div className="grid gap-6 md:grid-cols-3">
        {LOYALTY_TIERS.map((tier, idx) => {
          return (
            <div
              key={idx}
              className="relative p-5 rounded-[14px] bg-[#f3f3f3] border border-gray-100 hover:bg-neutral-50 hover:shadow-sm transition-all text-left flex flex-col justify-between"
              id={`loyalty-tier-${idx}`}
            >
              <div className="space-y-3">
                {/* Visual Accent */}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-800 border border-neutral-100 font-mono text-xs font-bold shadow-xs">
                  0{idx + 1}
                </div>
                <div className="space-y-1">
                  <span className="inline-block bg-[#171717] text-white text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full uppercase">
                    {tier.period}
                  </span>
                  <h4 className="text-sm font-semibold tracking-tight text-[#171717]">
                    {tier.benefit}
                  </h4>
                </div>
                <p className="text-xs text-[#6f6f6f] leading-relaxed">
                  {tier.details}
                </p>
              </div>

              {/* Verified checkpoint symbol */}
              <div className="pt-4 flex items-center gap-1.5 text-[10px] font-mono text-neutral-500">
                <CheckCircle className="h-3 w-3 text-emerald-600" />
                <span>Automatic Reward</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 text-center">
        <p className="text-xs text-[#7e7e7e] font-sans">
          Loyalty clock pauses if you cancel and resumes when you return — you never lose your progress.
        </p>
      </div>
    </div>
  );
}
