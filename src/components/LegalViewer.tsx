import { X, Shield, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LegalViewerProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export default function LegalViewer({ type, onClose }: LegalViewerProps) {
  const isPrivacy = type === 'privacy';

  return (
    <AnimatePresence>
      {type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs" id="legal-modal-backdrop">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-[20px] bg-white text-[#171717] shadow-compound border border-neutral-100 z-10 flex flex-col"
            id="legal-modal-content"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
              <div className="flex items-center gap-2">
                {isPrivacy ? (
                  <Shield className="h-4.5 w-4.5 text-neutral-800" />
                ) : (
                  <FileText className="h-4.5 w-4.5 text-neutral-800" />
                )}
                <span className="text-sm font-semibold tracking-tight">
                  {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable text content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs md:text-sm text-neutral-600 leading-relaxed font-sans max-h-[60vh]">
              {isPrivacy ? (
                <>
                  <p className="font-mono text-neutral-400 text-xs uppercase tracking-wider">Effective Date: June 3, 2026</p>
                  <p>
                    At Prime Leads, we take your privacy and the confidentiality of lead intelligence seriously. This Privacy Policy describes how we collect, process, scale, and deliver distressed property market intelligence to real estate investors and brokers, and how we handle subscription billing securely.
                  </p>
                  <h4 className="font-bold text-[#171717] pt-2">1. Covered Information Sourced</h4>
                  <p>
                    All property lead records are obtained systematically from legitimate public records, court filings, county tax assessment listings, and municipal violation dockets. Skip-traced intelligence includes publicly available telephone and mailing coordinates verified via high-performance, multi-provider network checks.
                  </p>
                  <h4 className="font-bold text-[#171717] pt-2">2. Subscriber Information Collected</h4>
                  <p>
                    We collect your primary email address for lead sheet delivery and standard registration metadata (such as state and zip geography target specifications). Subscription payments are integrated strictly through Stripe; we do not store, view, or process raw credit cards on our systems.
                  </p>
                  <h4 className="font-bold text-[#171717] pt-2">3. Subscription Controls</h4>
                  <p>
                    Your subscription billing controls are managed securely through Stripe’s customer portals. Data is transmitted via secure SSL/TLS channels, keeping all subscription records protected.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-mono text-neutral-400 text-xs uppercase tracking-wider">Last Updated: June 3, 2026</p>
                  <p>
                    Welcome to Prime Leads. By subscribing to our lead delivery services, you contract with Prime Leads and agree to comply with our Terms of Service. Please analyze these protocols carefully.
                  </p>
                  <h4 className="font-bold text-[#171717] pt-2">1. Sourced Lead Licensing</h4>
                  <p>
                    Subject to continuous subscription compliance, Prime Leads grants subscribers a non-exclusive, non-transferable, revocable license to utilize our delivered weekly property lists to conduct investor outreach, property research, and private cold-calling strategies.
                  </p>
                  <h4 className="font-bold text-[#171717] pt-2">2. Permitted Use & TCPA Compliance</h4>
                  <p>
                    Subscribers represent and warrant that all communication methods launched when contacting lead records will abide strictly by local and federal laws, including TCPA regulations and "Do Not Call" registry checks. Prime Leads compiles publicly registered numbers; prior list checks are recommended.
                  </p>
                  <h4 className="font-bold text-[#171717] pt-2">3. Subscription Billing & Cancellations</h4>
                  <p>
                    Your subscription is billed monthly. Cancellations are launched easily at any time via the self-serve Stripe Customer Portal link included in your signup email.
                  </p>
                </>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex justify-end">
              <button
                onClick={onClose}
                className="cursor-pointer rounded-full bg-[#171717] px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-all"
              >
                Accept and Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
