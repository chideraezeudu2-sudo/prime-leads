import React, { useState, useEffect } from 'react';
import { PlanType, OnboardingState } from '../types';
import { PLANS } from '../data';
import { Shield, Sparkles, CreditCard, ArrowLeft, Check, Lock, Star, Terminal } from 'lucide-react';

interface StripeCheckoutMockProps {
  onboardingData: OnboardingState;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

export default function StripeCheckoutMock({ onboardingData, onPaymentSuccess, onCancel }: StripeCheckoutMockProps) {
  const currentPlan = PLANS.find((p) => p.id === onboardingData.plan) || PLANS[1];

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState(`${onboardingData.firstName} ${onboardingData.lastName}`);
  const [zipcode, setZipcode] = useState(onboardingData.zipCodes.split(',')[0]?.trim() || '30311');
  const [isProcessing, setIsProcessing] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Auto format card number input
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  // Auto format expiry date
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPayError(null);

    // Simplistic visual verification checks
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setPayError('Please enter a valid 16-digit card number.');
      return;
    }
    if (expiry.length < 5) {
      setPayError('Please enter a valid expiration MM/YY.');
      return;
    }
    if (cvc.length < 3) {
      setPayError('Please enter validation code (CVC).');
      return;
    }

    setIsProcessing(true);

    // Simulate standard card processing with a stunning loading spinner transition
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 2800);
  };

  return (
    <div className="bg-[#fcfcfc] text-[#171717] min-h-screen flex flex-col md:flex-row" id="stripe-checkout-mock">
      
      {/* Side Summary Block (Stripe style) */}
      <div className="w-full md:w-5/12 bg-neutral-900 text-white p-8 md:p-14 flex flex-col justify-between border-r border-[#171717]">
        <div className="space-y-8">
          {/* Back btn */}
          <button
            onClick={onCancel}
            className="cursor-pointer group flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Cancel &amp; Return</span>
          </button>

          {/* Logo brand and request details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#a0a0a0] bg-neutral-800 border border-neutral-700 p-1.5 rounded">
                Subscribe to Prime Leads
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xl text-neutral-400 font-sans">Subscribe to {currentPlan.name} Plan</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl md:text-4xl font-bold tracking-tight text-white font-sans">{currentPlan.price}</span>
                <span className="text-sm text-neutral-400 font-sans">/ month</span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Your subscription starts today. You can pause, cancel, or modify your subscription billing details anytime within your self-service Stripe portal.
            </p>
          </div>

          <hr className="border-neutral-800" />

          {/* Detail Line-Items */}
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between font-mono">
              <span className="text-neutral-400">Regular Subscription Price</span>
              <span>{currentPlan.price} / month</span>
            </div>
            <div className="flex justify-between font-mono pt-2 border-t border-neutral-800">
              <span className="text-neutral-300 font-semibold">Today’s Billable Charge</span>
              <span className="text-white font-bold">{currentPlan.price}</span>
            </div>
          </div>
        </div>

        {/* Lower Secure Seals */}
        <div className="space-y-3 pt-8 md:pt-0">
          <p className="text-[10px] text-neutral-500 font-mono flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-neutral-400" /> Secure 256-Bit SSL Payment
          </p>
          <p className="text-[10px] text-neutral-500 leading-relaxed font-sans">
            Prime Leads is a certified merchant. Payment operations processed via Stripe Elements encryption protocols securely. No raw card digits touch our cloud database infrastructure.
          </p>
        </div>
      </div>

      {/* Primary Payment Input Fields (Right side) */}
      <div className="w-full md:w-7/12 p-8 md:p-14 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 font-sans">
              Enter Payment Information
            </h2>
            <p className="text-xs text-neutral-500 font-sans">
              Provide card details to complete your registration securely.
            </p>
          </div>

          {/* Error messages */}
          {payError && (
            <div className="p-3 border border-orange-200 bg-orange-50 rounded-xl text-xs text-orange-900 flex items-center gap-1.5 font-sans">
              <span className="h-1 text-orange-600 rounded-full w-1" />
              <span>{payError}</span>
            </div>
          )}

          {/* Form fields */}
          <form onSubmit={handlePaySubmit} className="space-y-4">
            
            {/* Cardholder Name input */}
            <div className="space-y-1">
              <label htmlFor="card-name" className="text-xs font-semibold text-neutral-600 block">
                Cardholder Name
              </label>
              <input
                type="text"
                id="card-name"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Johnathan Vance"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-white focus:ring-1 focus:ring-neutral-800 transition-all font-medium"
                disabled={isProcessing}
                required
              />
            </div>

            {/* Credit Card layout */}
            <div className="space-y-1">
              <label htmlFor="card-number" className="text-xs font-semibold text-neutral-600 block">
                Card Details
              </label>
              <div className="border border-gray-200 rounded-xl bg-white overflow-hidden divide-y divide-gray-200 shadow-sm focus-within:ring-1 focus-within:ring-black">
                {/* Number input space */}
                <div className="relative flex items-center">
                  <CreditCard className="absolute left-3 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    id="card-number"
                    value={cardNumber}
                    onChange={handleCardChange}
                    placeholder="4242 4242 4242 4242"
                    className="w-full pl-9 pr-3 py-3 text-xs bg-transparent border-0 focus:outline-none focus:ring-0 font-mono tracking-widest text-[#171717] font-semibold"
                    disabled={isProcessing}
                    required
                  />
                  {/* Small card brand badge */}
                  <span className="absolute right-3 text-[10px] font-mono select-none text-neutral-500 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded uppercase font-bold">
                    Visa
                  </span>
                </div>

                {/* Expiry and CVC input spaces side-by-side */}
                <div className="grid grid-cols-2">
                  <input
                    type="text"
                    id="card-expiry"
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM / YY"
                    className="w-full px-3 py-3 text-xs bg-transparent border-0 focus:outline-none focus:ring-0 font-mono text-center border-r border-gray-100 placeholder:text-neutral-400 font-semibold text-neutral-800"
                    disabled={isProcessing}
                    required
                  />
                  <input
                    type="password"
                    id="card-cvc"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="CVC"
                    className="w-full px-3 py-3 text-xs bg-transparent border-0 focus:outline-none focus:ring-0 font-mono text-center placeholder:text-neutral-400 font-semibold text-neutral-800"
                    disabled={isProcessing}
                    maxLength={4}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Billing zip selection */}
            <div className="space-y-1">
              <label htmlFor="card-zip" className="text-xs font-semibold text-neutral-600 block">
                Billing ZIP Code
              </label>
              <input
                type="text"
                id="card-zip"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                placeholder="30311"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-white focus:ring-1 focus:ring-neutral-800 transition-all font-medium"
                disabled={isProcessing}
                required
              />
            </div>

            {/* Terms checklist confirmation */}
            <div className="flex items-start gap-2 pt-1 text-[11px] text-neutral-500 font-sans leading-relaxed">
              <input
                type="checkbox"
                defaultChecked
                disabled={isProcessing}
                className="rounded border-neutral-300 text-neutral-950 focus:ring-neutral-900 mt-0.5"
                required
              />
              <p>
                I authorize Prime Leads to charge my payment method automatically every month until I cancel in my Stripe portal.
              </p>
            </div>

            {/* Complete checkout button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className={`cursor-pointer w-full rounded-full bg-[#171717] hover:bg-neutral-800 text-white font-semibold text-xs py-3.5 px-6 transition-all active:scale-97 shadow-compound flex items-center justify-center gap-2
                  ${isProcessing ? 'opacity-85 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing Subscription...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span>Complete Signup &amp; Subscribe</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Secure disclaimer brand seal */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 font-mono">
            <Lock className="h-3 w-3" />
            <span>Stripe Checkout Verified Sandbox Shield</span>
          </div>

        </div>
      </div>
    </div>
  );
}
