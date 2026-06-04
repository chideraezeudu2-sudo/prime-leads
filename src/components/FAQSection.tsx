import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQS } from '../data';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4" id="faq-accordion-group">
      {FAQS.map((faq, idx) => {
        const isOpen = openIndex === idx;

        return (
          <div
            key={idx}
            className="rounded-[20px] bg-white border border-gray-200/80 transition-all hover:border-gray-300 shadow-fine overflow-hidden"
            id={`faq-item-${idx}`}
          >
            {/* Clickable Header Trigger */}
            <button
              onClick={() => toggleFAQ(idx)}
              className="cursor-pointer w-full flex items-center justify-between p-5 text-left text-neutral-900 group transition-colors focus:bg-neutral-50/50"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3.5 pr-4">
                <HelpCircle className="h-4 w-4 text-neutral-400 shrink-0 group-hover:text-neutral-900 transition-colors" />
                <span className="text-sm font-semibold tracking-tight text-[#171717]">{faq.question}</span>
              </div>
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-800 transition-transform duration-255
                ${isOpen ? 'rotate-180 bg-neutral-900 text-white' : 'group-hover:bg-neutral-200'}
              `}>
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </button>

            {/* Answer Drawer */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden
                ${isOpen ? 'max-h-60 border-t border-gray-100 opacity-100' : 'max-h-0 opacity-0'}
              `}
            >
              <div className="p-5 bg-neutral-50/40 text-xs md:text-sm text-[#6f6f6f] leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
