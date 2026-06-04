import { X, Lock, Flame, MapPin, Mail, Phone, Calendar, DollarSign, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SAMPLE_LEAD } from '../data';

interface SampleLeadPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SampleLeadPopup({ isOpen, onClose }: SampleLeadPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="sample-lead-modal">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[20px] bg-white text-neutral-900 shadow-compound border border-neutral-100 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[12px] font-mono tracking-wider uppercase text-neutral-500">Live Sample Lead</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Top Meta info */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-dashed border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Sourced: 3 hours ago</span>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-800 border border-orange-100 font-mono">
                  <Flame className="h-3 w-3" />
                  Score: {SAMPLE_LEAD.motivationScore}/10 Motivation
                </div>
              </div>

              {/* Grid properties */}
              <div className="space-y-4">
                {/* Owner details */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <span className="text-xs font-mono font-medium">OW</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Property Owner</h4>
                    <p className="text-sm font-medium text-neutral-900">{SAMPLE_LEAD.ownerName}</p>
                  </div>
                </div>

                {/* Property address */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Property Address</h4>
                    <p className="text-sm font-medium text-neutral-900">{SAMPLE_LEAD.propertyAddress}</p>
                  </div>
                </div>

                {/* Mailing address */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Mailing Address</h4>
                    <p className="text-sm font-medium text-neutral-900">{SAMPLE_LEAD.mailingAddress}</p>
                  </div>
                </div>

                {/* Details layout: Lead type, equity, delinquency */}
                <div className="grid grid-cols-2 gap-4 rounded-[14px] bg-gray-50 p-4 border border-gray-100">
                  <div>
                    <span className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Lead Type</span>
                    <span className="text-xs font-semibold text-[#171717]">{SAMPLE_LEAD.leadType}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Days Delinquent</span>
                    <span className="text-xs font-semibold text-rose-600 font-mono">{SAMPLE_LEAD.daysDelinquent} Days</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-gray-200/50 mt-2">
                    <span className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Estimated Equity</span>
                    <span className="text-xs font-semibold text-neutral-900 flex items-center gap-1 font-mono">
                      <DollarSign className="h-3 w-3 text-neutral-400" />
                      {SAMPLE_LEAD.estimatedEquity}
                    </span>
                  </div>
                </div>

                {/* Phone contact Traced (Blurred out visually or XXX style) */}
                <div className="rounded-[14px] border border-dashed border-gray-200 bg-gray-50/30 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white">
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Verified Number</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold tracking-wider text-neutral-800 filter blur-[2.5px] select-none font-mono">
                          {SAMPLE_LEAD.phoneNumber}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded-full select-none">
                          XXX-XXX-1234
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                    <Lock className="h-3 w-3" />
                    <span>Skip-Traced</span>
                  </div>
                </div>

                {/* Outreach script */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-neutral-400" />
                    Suggested Outreach Script
                  </span>
                  <div className="rounded-[14px] bg-neutral-950 p-4 border border-neutral-800">
                    <p className="text-xs leading-relaxed text-neutral-300 font-mono">
                      "{SAMPLE_LEAD.outreachScript}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action footer */}
            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex justify-end">
              <button
                onClick={onClose}
                className="cursor-pointer rounded-full bg-neutral-900 px-5 py-2 text-xs font-medium text-white transition-all hover:bg-neutral-800 active:scale-95"
              >
                Close Sample
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
