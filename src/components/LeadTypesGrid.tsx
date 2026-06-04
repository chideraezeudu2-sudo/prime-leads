import { Check, ShieldAlert, Sparkles, Star } from 'lucide-react';
import { LEAD_TYPES } from '../data';

export default function LeadTypesGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2" id="lead-types-grid">
      {LEAD_TYPES.map((type, idx) => {
        const isAll = type.tier === 'All';
        const isElite = type.tier === 'Elite Only';
        const isProElite = type.tier === 'Pro and Elite';

        return (
          <div
            key={idx}
            className="flex items-start gap-4 p-5 rounded-[20px] bg-white border border-gray-100 hover:border-gray-200 transition-all shadow-compound group relative overflow-hidden"
            id={`lead-card-${idx}`}
          >
            {/* Corner Badge Accent */}
            {!isAll && (
              <div className="absolute top-0 right-0">
                <span className={`inline-flex items-center px-3 py-1 text-[10px] font-mono rounded-bl-xl border-l border-b tracking-wider uppercase font-semibold
                  ${isElite 
                    ? 'bg-amber-50 text-amber-800 border-amber-200/50' 
                    : 'bg-neutral-50 text-neutral-800 border-neutral-200/50'
                  }`}
                >
                  {isElite ? 'Elite Only' : 'Pro & Elite'}
                </span>
              </div>
            )}

            {/* Icon representation */}
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all mt-1
              ${isElite 
                ? 'bg-amber-50 border-amber-200 text-amber-600' 
                : isProElite 
                  ? 'bg-neutral-50 border-neutral-200 text-neutral-700' 
                  : 'bg-indigo-50/50 border-indigo-100/80 text-indigo-600'
              }`}
            >
              {isElite ? (
                <Star className="h-4 w-4 fill-amber-300" />
              ) : isProElite ? (
                <Sparkles className="h-4 w-4" />
              ) : (
                <Check className="h-4.5 w-4.5 stroke-[3]" />
              )}
            </div>

            {/* Description content */}
            <div className="space-y-1 pr-16 md:pr-4">
              <h3 className="text-sm font-semibold text-[#171717] tracking-tight flex items-center gap-1.5 font-sans">
                {type.name}
              </h3>
              <p className="text-xs leading-relaxed text-[#6f6f6f] font-sans">
                {type.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
