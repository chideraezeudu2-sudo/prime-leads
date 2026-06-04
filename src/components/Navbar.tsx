import { ChevronDown } from 'lucide-react';

interface NavbarProps {
  currentPage: 'landing' | 'onboarding' | 'confirmation' | 'stripe-checkout';
  onNavigate: (page: 'landing' | 'onboarding' | 'confirmation' | 'stripe-checkout', anchor?: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const navItems = [
    { label: 'How It Works', anchor: 'how-it-works' },
    { label: 'Lead Types', anchor: 'lead-types' },
    { label: 'Pricing', anchor: 'pricing' },
    { label: 'FAQ', anchor: 'faq' }
  ];

  const handleLinkClick = (anchor: string) => {
    if (currentPage !== 'landing') {
      onNavigate('landing', anchor);
    } else {
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[#e5e7eb] bg-white/80 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Brand */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 cursor-pointer transition-transform duration-200 active:scale-95"
            id="brand-logo"
          >
            <span className="text-lg font-bold tracking-tight text-[#171717] font-sans">
              Prime Leads
            </span>
          </button>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.anchor}
                onClick={() => handleLinkClick(item.anchor)}
                className="cursor-pointer text-sm font-medium text-[#7e7e7e] hover:text-[#171717] transition-all"
                id={`nav-${item.anchor}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Actions CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLinkClick('pricing')}
              className="cursor-pointer rounded-full bg-[#171717] px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-all active:scale-95 shadow-fine"
              id="nav-cta"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
