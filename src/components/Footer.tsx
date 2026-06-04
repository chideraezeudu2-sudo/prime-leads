import React from 'react';
import { ArrowUp } from 'lucide-react';

interface FooterProps {
  onShowLegal: (type: 'privacy' | 'terms') => void;
  onScrollToSection: (sectionId: string) => void;
}

export default function Footer({ onShowLegal, onScrollToSection }: FooterProps) {
  const handleScrollClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onScrollToSection('pricing');
  };

  return (
    <footer className="border-t border-gray-200 bg-white py-12" id="site-footer">
      <div className="mx-auto max-w-7xl px-6 md:px-8 space-y-12">
        {/* Upper Column Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Brand Column */}
          <div className="space-y-3 max-w-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-neutral-900 font-sans">
                Prime Leads
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed font-sans">
              Real leads. Real sellers. Every week.
            </p>
          </div>

          {/* Links Column */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onShowLegal('privacy')}
              className="cursor-pointer text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
              id="footer-privacy-btn"
            >
              Privacy Policy
            </button>
            <span className="text-neutral-300">|</span>
            <button
              onClick={() => onShowLegal('terms')}
              className="cursor-pointer text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
              id="footer-terms-btn"
            >
              Terms of Service
            </button>
          </div>

          {/* Dynamic Top Back CTA Button */}
          <div>
            <button
              onClick={handleScrollClick}
              className="cursor-pointer group inline-flex items-center gap-2 rounded-full border border-neutral-200 hover:border-neutral-900 px-5 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 transition-all active:scale-95 shadow-sm bg-white"
              id="footer-get-started"
            >
              <span>Get Started</span>
              <ArrowUp className="h-3 w-3 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Lower Divider block */}
        <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-neutral-400 font-sans">
            © 2026 Prime Leads. All rights reserved.
          </p>
          <p className="text-[10px] text-neutral-400 font-mono tracking-tight bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
            Secure skip-tracing multi-provider engine Active
          </p>
        </div>
      </div>
    </footer>
  );
}
