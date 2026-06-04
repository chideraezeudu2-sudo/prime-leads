import React, { useState, useEffect, useRef } from 'react';
import { PlanType, OnboardingState } from '../types';
import { PLANS, LEAD_TYPES, STATES_LIST } from '../data';
import { ChevronRight, ArrowLeft, Check, ShieldCheck, Mail, User, Phone, MapPin, Layers, Lock, Compass, ChevronDown, CheckCircle } from 'lucide-react';

interface OnboardingPageProps {
  initialPlan: PlanType;
  onBackToPricing: () => void;
  onNext: (formData: OnboardingState) => void;
}

export default function OnboardingPage({ initialPlan, onBackToPricing, onNext }: OnboardingPageProps) {
  const selectedPlanObj = PLANS.find((p) => p.id === initialPlan) || PLANS[1];

  // We split full name input into firstName and lastName for the common state structure.
  const [fullNameInput, setFullNameInput] = useState('');
  const [confirmEmailInput, setConfirmEmailInput] = useState('');

  const [state, setState] = useState<OnboardingState>({
    plan: initialPlan,
    step: 1,
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    phone: '',
    states: [],
    zipCodes: '',
    excludeZipCodes: '',
    counties: '',
    selectedLeadTypes: [],
    password: '',
    iAgreeToDelivery: false,
    deliveryFrequency: 'Weekly',
    geographyText: '',
    customRequests: '',
    customLeadTypeOther: ''
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [searchStateQuery, setSearchStateQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close state dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStateDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync state when initialPlan changes or on initial mount
  useEffect(() => {
    // 10 Lead types checkboxes:
    // Probate, Tax Delinquent, Pre-foreclosure, Absentee Owner, High Equity (40%+), Vacant Property, Out-of-State Owner, Code Violations, Divorce, Empty Nester (15+ years owned)
    // Setup automated defaults
    let defaultSelected: string[] = [];

    if (initialPlan === 'Pro') {
      // Pre-check the ones exclusive or highly valued
      defaultSelected = [
        'Probate', 
        'Tax Delinquent', 
        'Pre-foreclosure', 
        'Absentee Owner', 
        'High Equity (40%+)', 
        'Vacant Property', 
        'Out-of-State Owner', 
        'Code Violations', 
        'Divorce'
      ];
    } else if (initialPlan === 'Elite') {
      // Pre-check basic types + the ultra premium Empty Nester
      defaultSelected = [
        'Probate', 
        'Tax Delinquent', 
        'Pre-foreclosure', 
        'Absentee Owner', 
        'High Equity (40%+)', 
        'Vacant Property', 
        'Out-of-State Owner', 
        'Code Violations', 
        'Divorce',
        'Empty Nester (15+ years owned)'
      ];
    }

    setState((prev) => ({
      ...prev,
      plan: initialPlan,
      step: 1,
      selectedLeadTypes: defaultSelected,
      deliveryFrequency: 'Weekly' // Default to Weekly as requested
    }));

    setFullNameInput('');
    setConfirmEmailInput('');
    setValidationError(null);
  }, [initialPlan]);

  const handleFullNameChange = (val: string) => {
    setFullNameInput(val);
    const parts = val.trim().split(/\s+/);
    const first = parts[0] || '';
    const last = parts.slice(1).join(' ') || '';
    setState((prev) => ({ ...prev, firstName: first, lastName: last }));
  };

  const handleBack = () => {
    setValidationError(null);
    if (state.step > 1) {
      setState((prev) => ({ ...prev, step: prev.step - 1 }));
    } else {
      onBackToPricing();
    }
  };

  // Submit step 1 (Account Setup)
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate Full Name
    if (!fullNameInput.trim()) {
      setValidationError('Full Name is required.');
      return;
    }

    // Validate Emails
    if (!state.email.trim()) {
      setValidationError('Email Address is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      setValidationError('Please enter a valid Email Address.');
      return;
    }
    if (state.email.trim().toLowerCase() !== confirmEmailInput.trim().toLowerCase()) {
      setValidationError('Email and Confirm Email must match.');
      return;
    }

    // Plan Specific validations for Step 1
    if (state.plan === 'Basic') {
      // Basic requires Weekly delivery check
      if (!state.iAgreeToDelivery) {
        setValidationError('You must agree to the weekly Google Sheet lead delivery to continue.');
        return;
      }
      // Basic has NO targeting steps, goes straight to step 2 (which is review & payment info)
      setState((prev) => ({ ...prev, step: 2 }));
    } else {
      // Pro & Elite proceed to step 2 targeting
      if (state.plan === 'Elite') {
        if (!state.phone.trim()) {
          setValidationError('Phone number for SMS alerts is required for the Elite plan.');
          return;
        }
      }
      setState((prev) => ({ ...prev, step: 2 }));
    }
  };

  // Submit step 2 (Target Parameters / Markets)
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (state.plan === 'Pro') {
      // Pro verification
      if (state.selectedLeadTypes.length === 0) {
        setValidationError('Please select at least 1 lead type.');
        return;
      }
      if (state.states.length === 0) {
        setValidationError('Please select at least one state (maximum 3 states supported).');
        return;
      }
      if (state.states.length > 3) {
        setValidationError('Pro Plan limits targeting to a maximum of 3 states.');
        return;
      }

      // Check zip codes include limit (optional, up to 5 zips)
      if (state.zipCodes.trim()) {
        const count = state.zipCodes.split(',').map(z => z.trim()).filter(Boolean).length;
        if (count > 5) {
          setValidationError('Please specify a maximum of 5 states/zip codes for Pro inclusion.');
          return;
        }
      }

      // Check zip codes exclude limit (optional, up to 5 zips)
      if (state.excludeZipCodes?.trim()) {
        const count = state.excludeZipCodes.split(',').map(z => z.trim()).filter(Boolean).length;
        if (count > 5) {
          setValidationError('Please specify a maximum of 5 zip codes for Pro exclusion.');
          return;
        }
      }
    }

    if (state.plan === 'Elite') {
      // Elite verification
      if (state.selectedLeadTypes.length === 0) {
        setValidationError('Please select at least 1 lead type.');
        return;
      }
      if (!state.geographyText?.trim()) {
        setValidationError('Geography details are required. (e.g. Fulton County, Cobb County, 30311, GA etc)');
        return;
      }
    }

    // Go to step 3 (Review)
    setState((prev) => ({ ...prev, step: 3 }));
  };

  // Handle final signup payment click on Step 3 (Review) (or Step 2 for Basic)
  const handleReviewSubmit = () => {
    onNext(state);
  };

  const toggleStateSelection = (stateName: string) => {
    setState((prev) => {
      const isSelected = prev.states.includes(stateName);
      if (isSelected) {
        return { ...prev, states: prev.states.filter((s) => s !== stateName) };
      } else {
        if (prev.plan === 'Pro' && prev.states.length >= 3) {
          setValidationError('Maximum of 3 states selected for the Pro Plan.');
          return prev;
        }
        setValidationError(null);
        return { ...prev, states: [...prev.states, stateName] };
      }
    });
  };

  const toggleLeadTypeSelection = (typeName: string) => {
    setState((prev) => {
      const isSelected = prev.selectedLeadTypes.includes(typeName);
      if (isSelected) {
        return { ...prev, selectedLeadTypes: prev.selectedLeadTypes.filter((t) => t !== typeName) };
      } else {
        return { ...prev, selectedLeadTypes: [...prev.selectedLeadTypes, typeName] };
      }
    });
  };

  const totalSteps = state.plan === 'Basic' ? 2 : 3;

  return (
    <div className="bg-neutral-50 min-h-screen py-10 md:py-16 px-4 md:px-8 flex flex-col justify-between" id="onboarding-root">
      <div className="max-w-xl mx-auto w-full">
        
        {/* UPPER SUMMARY OF SELECTED PLAN */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl bg-white border border-gray-250/50 shadow-fine mb-8 gap-4" id="onboarding-top-selected">
          <div className="space-y-0.5">
            <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Pricing Choice</p>
            <p className="text-sm font-semibold text-[#171717]">
              Selected Tier: <span className="font-bold text-neutral-900">{state.plan}</span> ({selectedPlanObj.price}/month)
            </p>
          </div>
          <button
            onClick={onBackToPricing}
            className="cursor-pointer text-xs font-semibold text-neutral-500 hover:text-neutral-900 border-b border-dashed border-neutral-300 hover:border-neutral-900 transition-colors py-0.5"
            id="onboarding-change-plan-link"
          >
            Change plan
          </button>
        </div>

        {/* STEPPER METADATA TRAILER */}
        <div className="mb-8 text-center space-y-4" id="onboarding-tracker">
          <div className="flex items-center justify-between max-w-sm mx-auto text-xs font-mono font-semibold tracking-wider uppercase text-neutral-400">
            <span className={state.step >= 1 ? 'text-[#171717]' : ''}>1. Account Setup</span>
            <ChevronRight className="h-4 w-4 text-neutral-300" />
            {state.plan !== 'Basic' ? (
              <>
                <span className={state.step >= 2 ? 'text-[#171717]' : ''}>2. Market Targeting</span>
                <ChevronRight className="h-4 w-4 text-neutral-300" />
              </>
            ) : null}
            <span className={state.step === totalSteps ? 'text-[#171717]' : ''}>
              {totalSteps === 2 ? '2. Summary & Pay' : '3. Summary & Pay'}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 text-white text-[11px] font-mono py-1 px-3">
            <span>Step {state.step} of {totalSteps}</span>
          </div>
        </div>

        {/* VALIDATION ERROR INDICATOR */}
        {validationError && (
          <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 flex items-center gap-2" id="validation-error-alert">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-600 shrink-0 animate-ping" />
            <p className="font-medium">{validationError}</p>
          </div>
        )}

        {/* INNER FORM BODY */}
        <div className="bg-white rounded-[24px] shadow-compound border border-gray-200/60 p-6 md:p-8">
          
          {/* ==================== BASIC STEP 1 ==================== */}
          {state.plan === 'Basic' && state.step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5" id="onboarding-basic-form-s1">
              <div className="space-y-1">
                <h3 className="text-base font-bold tracking-tight text-[#171717] font-sans">
                  Set Up Your Basic Subscription
                </h3>
                <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                  Basic is a national plan with no geographic limits. Fill in your payment registration details.
                </p>
              </div>

              {/* QUESTIONS */}
              <div className="space-y-4">
                {/* 1. Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Full Name <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={fullNameInput}
                      onChange={(e) => handleFullNameChange(e.target.value)}
                      placeholder="e.g. Johnathan Vance"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                {/* 2. Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Email Address <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="email"
                      value={state.email}
                      onChange={(e) => setState((p) => ({ ...p, email: e.target.value }))}
                      placeholder="e.g. john@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                {/* 3. Confirm Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Confirm Email Address <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="email"
                      value={confirmEmailInput}
                      onChange={(e) => setConfirmEmailInput(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                {/* 4. Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Password <span className="text-neutral-400 font-normal"> (optional – for future dashboard access)</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="password"
                      value={state.password}
                      onChange={(e) => setState((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Choose a password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Info Note & Weekly Agreemenet Checklist */}
                <div className="rounded-xl border border-gray-150 bg-gray-50/50 p-4 space-y-3">
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    ⚙️ <strong className="text-neutral-800">Basic Plan Delivery Parameters:</strong> Leads are delivered as a weekly fixed spreadsheet list. Sourced nationally with no custom states/zip filters. Includes free 50 leads instantly on signup.
                  </p>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-sans select-none pt-1">
                    <input
                      type="checkbox"
                      checked={state.iAgreeToDelivery}
                      onChange={(e) => setState((p) => ({ ...p, iAgreeToDelivery: e.target.checked }))}
                      className="mt-0.5 shrink-0 rounded border-gray-300 text-neutral-900 focus:ring-neutral-900 h-4 w-4 cursor-pointer"
                      required
                    />
                    <span className="text-neutral-750 font-bold uppercase tracking-wider text-[10px] sm:text-[11px]">
                      I agree to weekly sheet lead delivery <span className="text-red-500">*</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Navigation button */}
              <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleBack}
                  className="cursor-pointer text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 py-2 px-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-full bg-[#171717] hover:bg-neutral-800 text-white font-bold text-xs py-2.5 px-6 transition-all active:scale-95"
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* ==================== BASIC STEP 2 (REVIEW) ==================== */}
          {state.plan === 'Basic' && state.step === 2 && (
            <div className="space-y-6 animate-fade-in" id="onboarding-basic-review">
              <div className="space-y-1">
                <h3 className="text-base font-bold tracking-tight text-[#171717] font-sans">
                  Confirm Subscription Settings
                </h3>
                <p className="text-xs text-neutral-500 font-sans">
                  Your Basic Plan order is configured. Review details before billing setup.
                </p>
              </div>

              {/* Review Card */}
              <div className="bg-neutral-50 rounded-2xl border border-gray-200 p-4 space-y-4 text-xs font-sans">
                <div className="flex justify-between items-center pb-2 border-b border-gray-250/50">
                  <span className="text-neutral-500 lowercase tracking-wider font-mono text-[10px]">Tier</span>
                  <span className="font-bold text-neutral-900">Basic Leads Plan — $50/mo</span>
                </div>
                <div className="flex justify-between items-start pb-2 border-b border-gray-250/50 gap-3 text-right">
                  <span className="text-neutral-500 lowercase tracking-wider font-mono text-[10px] text-left shrink-0">Recipient</span>
                  <div>
                    <p className="font-bold">{fullNameInput}</p>
                    <p className="text-neutral-500 font-mono text-[10px] mt-0.5">{state.email}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-250/50">
                  <span className="text-neutral-500 lowercase tracking-wider font-mono text-[10px]">Target Markets</span>
                  <span className="font-bold text-emerald-800 uppercase tracking-widest text-[10px]">National Coverage</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-250/50">
                  <span className="text-neutral-500 lowercase tracking-wider font-mono text-[10px]">Frequency</span>
                  <span className="font-bold text-neutral-700">Weekly Flat File (Mondays)</span>
                </div>
                <div className="p-3 bg-neutral-900 text-white rounded-xl space-y-1">
                  <p className="font-semibold text-[11px] text-neutral-200">✨ Included Signing Perk:</p>
                  <p className="font-mono text-[10px] text-emerald-400">🎁 50 Free Setup Leads Ready Instantly</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-4 pt-1">
                <button
                  type="button"
                  onClick={handleReviewSubmit}
                  className="cursor-pointer w-full rounded-full bg-[#171717] hover:bg-neutral-800 text-white font-semibold text-sm py-3 px-6 transition-all active:scale-97 shadow-compound flex items-center justify-center gap-2"
                  id="onboarding-basic-signup-btn"
                >
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span>Go to Stripe Billing Setup</span>
                </button>
                <p className="text-[10px] text-center text-neutral-400 max-w-sm mx-auto leading-relaxed">
                  Redirecting to Stripe secure checkout. Unsubscribe at any time with no minimum commitments.
                </p>
              </div>

              {/* Adjust Back */}
              <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleBack}
                  className="cursor-pointer text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 py-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Adjust Details</span>
                </button>
              </div>
            </div>
          )}


          {/* ==================== PRO STEP 1 ==================== */}
          {state.plan === 'Pro' && state.step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5" id="onboarding-pro-form-s1">
              <div className="space-y-1">
                <h3 className="text-base font-bold tracking-tight text-[#171717] font-sans">
                  Register Your Pro Lead Subscription
                </h3>
                <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                  Provide your contact details. Pro includes targeted geofencing filters, private Sheets delivery, and first-day sign-on leads.
                </p>
              </div>

              <div className="space-y-4">
                {/* 1. Full name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Full Name <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={fullNameInput}
                      onChange={(e) => handleFullNameChange(e.target.value)}
                      placeholder="e.g. Johnathan Vance"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                {/* 2. Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Email Address <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="email"
                      value={state.email}
                      onChange={(e) => setState((p) => ({ ...p, email: e.target.value }))}
                      placeholder="e.g. j.vance@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                {/* 3. Confirm email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Confirm Email Address <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="email"
                      value={confirmEmailInput}
                      onChange={(e) => setConfirmEmailInput(e.target.value)}
                      placeholder="e.g. j.vance@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                {/* 4. Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Password <span className="text-neutral-400 font-normal"> (optional)</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="password"
                      value={state.password}
                      onChange={(e) => setState((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Enter a secure password if you like"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* 5. Phone number (optional - for alerts, not used now) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Phone Number <span className="text-neutral-400 font-normal"> (optional – for future SMS priority alerts)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="tel"
                      value={state.phone}
                      onChange={(e) => setState((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="e.g. 404-555-1234"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation button */}
              <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleBack}
                  className="cursor-pointer text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 py-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-full bg-[#171717] hover:bg-neutral-800 text-white font-bold text-xs py-2.5 px-6 transition-all active:scale-95"
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* ==================== PRO STEP 2 ==================== */}
          {state.plan === 'Pro' && state.step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-5" id="onboarding-pro-form-s2">
              <div className="space-y-1 border-b border-gray-100 pb-2.5">
                <h3 className="text-base font-bold tracking-tight text-[#171717] font-sans">
                  Configure Pro Target Criteria
                </h3>
                <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                  Define your exact target and delivery schedule below. At least 1 type and 1 state target are required.
                </p>
              </div>

              {/* 5. Delivery Frequency */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 block">
                  Delivery Frequency <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <select
                    value={state.deliveryFrequency}
                    onChange={(e) => setState((p) => ({ ...p, deliveryFrequency: e.target.value as any }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none font-medium appearance-none cursor-pointer"
                  >
                    <option value="Weekly">Weekly (Best - every Monday)</option>
                    <option value="Bi-weekly">Bi-weekly (Every 2nd week)</option>
                    <option value="Monthly">Monthly batch delivery</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {/* 6. Lead Types checklist (select at least 1) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 block">
                  Which Lead Types do you want? <span className="text-red-500 font-bold">*</span>
                  <span className="text-neutral-400 font-normal"> (Select at least 1)</span>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-neutral-50/50">
                  {LEAD_TYPES.map((type, idx) => {
                    const isSelected = state.selectedLeadTypes.includes(type.name);
                    const isExclusive = type.tier === 'Pro and Elite'; // Exclusive to this tier

                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all text-xs
                          ${isExclusive
                            ? 'bg-amber-50/30 border-amber-300 shadow-3xs'
                            : isSelected 
                            ? 'bg-white border-neutral-300 shadow-3xs' 
                            : 'border-transparent hover:bg-neutral-100'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleLeadTypeSelection(type.name)}
                          className="mt-0.5 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950 h-3.5 w-3.5 cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <span className="font-semibold text-neutral-850 flex items-center gap-1.5 flex-wrap">
                            {type.name}
                            {isExclusive && (
                              <span className="text-[9px] bg-[#ffc838] text-neutral-900 rounded px-1.5 py-0.5 font-mono uppercase font-bold tracking-wider scale-90">
                                Pro Premium
                              </span>
                            )}
                          </span>
                          <p className="text-[10px] text-neutral-500 font-sans leading-tight">{type.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 7. States to target (max 3 STATES - custom dropdown search) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 block">
                  Which States are you investing in? <span className="text-red-500 font-bold">*</span>
                  <span className="text-neutral-400 font-normal"> (Select up to 3 states)</span>
                </label>
                
                <div className="relative font-sans mx-auto w-full" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-neutral-900 bg-gray-50 hover:bg-neutral-100/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-850 transition-all font-medium text-left"
                  >
                    <span className="truncate">
                      {state.states.length === 0 
                        ? "Select target states..." 
                        : `Selected states (${state.states.length}): ${state.states.join(', ')}`}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${isStateDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isStateDropdownOpen && (
                    <div className="absolute left-0 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-3 space-y-2">
                      <input
                        type="text"
                        placeholder="Search states..."
                        value={searchStateQuery}
                        onChange={(e) => setSearchStateQuery(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-sans text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-850"
                      />
                      <div className="max-h-36 overflow-y-auto space-y-1">
                        {STATES_LIST.filter(st => st.toLowerCase().includes(searchStateQuery.toLowerCase())).map((st) => {
                          const isChecked = state.states.includes(st);
                          const isDisabled = !isChecked && state.states.length >= 3;
                          return (
                            <label
                              key={st}
                              className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-neutral-900 text-white font-medium'
                                  : isDisabled
                                  ? 'opacity-40 cursor-not-allowed hover:bg-transparent text-neutral-400'
                                  : 'hover:bg-neutral-50 text-neutral-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isDisabled}
                                onChange={() => {
                                  if (!isDisabled) {
                                    toggleStateSelection(st);
                                  }
                                }}
                                className="rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950 h-3.5 w-3.5 cursor-pointer"
                              />
                              <span className="truncate">{st}</span>
                            </label>
                          );
                        })}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-150 text-[10px] font-sans">
                        <span className="text-neutral-500 font-mono">
                          {state.states.length} of 3 states
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsStateDropdownOpen(false)}
                          className="text-neutral-900 font-bold hover:underline cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {state.states.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {state.states.map((st) => (
                      <span key={st} className="inline-flex items-center gap-1.5 text-[10px] bg-neutral-100 border border-neutral-200 text-neutral-800 px-2.5 py-0.5 rounded-full font-mono">
                        {st}
                        <button 
                          type="button" 
                          onClick={() => toggleStateSelection(st)} 
                          className="text-neutral-400 hover:text-neutral-900 cursor-pointer font-bold font-sans text-xs ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 8. Zip codes to include */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 block">
                  Zip Codes to Include <span className="text-neutral-400 font-normal">(optional, up to 5 zips, comma-separated)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={state.zipCodes}
                    onChange={(e) => setState((p) => ({ ...p, zipCodes: e.target.value }))}
                    placeholder="e.g. 30311, 30312, 30310"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none transition-all font-medium"
                  />
                </div>
              </div>

              {/* 9. Zip codes to exclude */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 block">
                  Zip Codes to Exclude <span className="text-neutral-400 font-normal">(optional, up to 5 zips, comma-separated)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={state.excludeZipCodes || ''}
                    onChange={(e) => setState((p) => ({ ...p, excludeZipCodes: e.target.value }))}
                    placeholder="e.g. 30188, 30189"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none transition-all font-medium"
                  />
                </div>
              </div>

              {/* Navigation button */}
              <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleBack}
                  className="cursor-pointer text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 py-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-full bg-[#171717] hover:bg-neutral-800 text-white font-bold text-xs py-2.5 px-6 transition-all active:scale-95"
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* ==================== PRO STEP 3 (REVIEW) ==================== */}
          {state.plan === 'Pro' && state.step === 3 && (
            <div className="space-y-6 animate-fade-in" id="onboarding-pro-review">
              <div className="space-y-1">
                <h3 className="text-base font-bold tracking-tight text-[#171717] font-sans">
                  Confirm Subscription Settings
                </h3>
                <p className="text-xs text-neutral-500 font-sans">
                  Please review your Pro Plan configurations prior to initiating checkout billing.
                </p>
              </div>

              {/* Review details */}
              <div className="bg-neutral-50 rounded-2xl border border-gray-200 p-4 space-y-3.5 text-xs font-sans text-[#171717]">
                <div className="flex justify-between items-center pb-2 border-b border-gray-250/50">
                  <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-wider">Tier</span>
                  <span className="font-bold text-neutral-900">Pro Subscription — $150/mo</span>
                </div>
                <div className="flex justify-between items-start pb-2 border-b border-gray-250/50 gap-3 text-right">
                  <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-wider text-left shrink-0">Recipient</span>
                  <div>
                    <p className="font-bold">{fullNameInput}</p>
                    <p className="text-neutral-500 font-mono text-[10px] mt-0.5">{state.email}</p>
                    {state.phone && <p className="text-neutral-400 text-[10px] font-mono">{state.phone}</p>}
                  </div>
                </div>
                <div className="flex justify-between items-start pb-2 border-b border-gray-250/50 gap-3 text-right">
                  <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-wider text-left shrink-0">Geotargets</span>
                  <div>
                    <p className="font-semibold text-neutral-900">States: {state.states.join(', ')}</p>
                    {state.zipCodes.trim() !== '' && (
                      <p className="text-neutral-500 font-mono text-[10px] mt-0.5">Includes: {state.zipCodes}</p>
                    )}
                    {state.excludeZipCodes?.trim() !== '' && state.excludeZipCodes && (
                      <p className="text-neutral-400 font-mono text-[10px] mt-0.5">Excludes: {state.excludeZipCodes}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-250/50">
                  <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-wider">Frequency</span>
                  <span className="font-bold text-neutral-800">{state.deliveryFrequency} Delivery</span>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-wider block">Lead Filter Categories ({state.selectedLeadTypes.length})</span>
                  <p className="text-neutral-600 leading-tight text-[11px] line-clamp-2">
                    {state.selectedLeadTypes.join(', ')}
                  </p>
                </div>

                <div className="p-3 bg-neutral-900 text-white rounded-xl space-y-1.5 mt-2 shadow-sm">
                  <p className="font-semibold text-[11px] text-neutral-200">💎 High-Quality Pro Sign-on Perk included:</p>
                  <p className="font-mono text-[10px] text-emerald-400 leading-relaxed">
                    🎁 Your private Google Lead Sheet starts with <strong>50 Free Enriched Leads</strong> (with active ARV, estimated equity %, max cash offer recommendation, skip-traced working phone numbers).
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-4 pt-1">
                <button
                  type="button"
                  onClick={handleReviewSubmit}
                  className="cursor-pointer w-full rounded-full bg-[#171717] hover:bg-neutral-800 text-white font-semibold text-sm py-3 px-6 transition-all active:scale-97 shadow-compound flex items-center justify-center gap-2"
                  id="onboarding-pro-signup-btn"
                >
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span>Go to Stripe Billing Setup</span>
                </button>
                <p className="text-[10px] text-center text-neutral-400 max-w-sm mx-auto leading-relaxed">
                  Clicking continues to secure payment validation. Cancel anytime directly in your customer dashboard workspace page.
                </p>
              </div>

              {/* Navigate Back */}
              <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleBack}
                  className="cursor-pointer text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 py-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Adjust parameters</span>
                </button>
              </div>
            </div>
          )}


          {/* ==================== ELITE STEP 1 ==================== */}
          {state.plan === 'Elite' && state.step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5" id="onboarding-elite-form-s1">
              <div className="space-y-1">
                <h3 className="text-base font-bold tracking-tight text-[#171717] font-sans">
                  Register Your Elite Lead Subscription
                </h3>
                <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                  Enter your payment and alert details. Elite includes hand-picked weekly hotlists, real-time SMS drop alerts, custom parameters, and custom comps.
                </p>
              </div>

              <div className="space-y-4">
                {/* 1. Full name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Full Name <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={fullNameInput}
                      onChange={(e) => handleFullNameChange(e.target.value)}
                      placeholder="e.g. Johnathan Vance"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                {/* 2. Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Email Address <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="email"
                      value={state.email}
                      onChange={(e) => setState((p) => ({ ...p, email: e.target.value }))}
                      placeholder="e.g. vance@estateventures.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                {/* 3. Confirm email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Confirm Email Address <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="email"
                      value={confirmEmailInput}
                      onChange={(e) => setConfirmEmailInput(e.target.value)}
                      placeholder="e.g. vance@estateventures.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                {/* 4. Phone number for SMS alerts (required) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Phone Number for SMS Alerts <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="tel"
                      value={state.phone}
                      onChange={(e) => setState((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="e.g. 404-555-1234"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none transition-all font-medium"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-amber-700 font-sans bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 flex items-start gap-1.5 leading-relaxed">
                    <span>📢</span>
                    <span><strong>Required for Elite Alerts:</strong> Real-time SMS drop messages when a top-priority Score 9 or Score 10 lead is located.</span>
                  </p>
                </div>

                {/* 5. Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Password <span className="text-neutral-400 font-normal"> (optional)</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="password"
                      value={state.password}
                      onChange={(e) => setState((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Choose an account password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation button */}
              <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleBack}
                  className="cursor-pointer text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 py-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-full bg-[#171717] hover:bg-neutral-800 text-white font-bold text-xs py-2.5 px-6 transition-all active:scale-95"
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* ==================== ELITE STEP 2 ==================== */}
          {state.plan === 'Elite' && state.step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-5" id="onboarding-elite-form-s2">
              <div className="space-y-1 border-b border-gray-100 pb-2.5">
                <h3 className="text-base font-bold tracking-tight text-[#171717] font-sans">
                  Configure Elite Custom Parameters
                </h3>
                <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                  Tailor your geofence and parameters completely. There are no restrictions on the Elite tier.
                </p>
              </div>

              {/* 6. Delivery Frequency (default Weekly) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 block">
                  Delivery Frequency <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <select
                    value={state.deliveryFrequency}
                    onChange={(e) => setState((p) => ({ ...p, deliveryFrequency: e.target.value as any }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none font-medium appearance-none cursor-pointer"
                  >
                    <option value="Weekly">Weekly (Default - highly recommended)</option>
                    <option value="Bi-weekly">Bi-weekly (Every 2nd week)</option>
                    <option value="Monthly">Monthly custom summary delivery</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {/* 7. Lead Types checkboxes (with Other text field) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 block">
                  Which Lead Types do you want? <span className="text-red-500 font-bold">*</span>
                  <span className="text-neutral-400 font-normal"> (Plus specify any custom other requests)</span>
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-neutral-50/50">
                  {LEAD_TYPES.map((type, idx) => {
                    const isSelected = state.selectedLeadTypes.includes(type.name);
                    const isExclusive = type.tier === 'Elite Only';

                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all text-xs
                          ${isExclusive
                            ? 'bg-purple-50/30 border-purple-300 shadow-3xs'
                            : isSelected 
                            ? 'bg-white border-neutral-300 shadow-3xs' 
                            : 'border-transparent hover:bg-neutral-100'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleLeadTypeSelection(type.name)}
                          className="mt-0.5 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950 h-3.5 w-3.5 cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <span className="font-semibold text-neutral-850 flex items-center gap-1.5 flex-wrap">
                            {type.name}
                            {isExclusive && (
                              <span className="text-[9px] bg-[#a855f7] text-white rounded px-1.5 py-0.5 font-mono uppercase font-bold tracking-wider scale-90">
                                Elite Exclusive
                              </span>
                            )}
                          </span>
                          <p className="text-[10px] text-neutral-500 font-sans leading-tight">{type.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Text field for the "Other" lead types */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-600 block">Other Lead Categories or Source Requests:</label>
                  <input
                    type="text"
                    value={state.customLeadTypeOther || ''}
                    onChange={(e) => setState((p) => ({ ...p, customLeadTypeOther: e.target.value }))}
                    placeholder="e.g. Delinquent HOAs, tax lien certificates, fire damage, etc."
                    className="w-full px-3 py-2 rounded-xl border border-gray-250 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* 8. Geography free text box (required) */}
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-xs font-bold text-neutral-700 block">
                  Geography Targeting Scope <span className="text-red-500 font-bold">*</span>
                </label>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Enter states, counties, zip codes, or radius. Completely unrestrained.
                </p>
                <textarea
                  value={state.geographyText || ''}
                  onChange={(e) => setState((p) => ({ ...p, geographyText: e.target.value }))}
                  placeholder="e.g. Georgia state, Gwinnett County, 20 miles around ZIP 30319, or Fulton County only."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-gray-205 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none leading-relaxed"
                  required
                />
              </div>

              {/* 9. Exclude zip codes or areas (optional text field) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 block">
                  Exclude Specific ZIPs or Areas <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={state.excludeZipCodes || ''}
                  onChange={(e) => setState((p) => ({ ...p, excludeZipCodes: e.target.value }))}
                  placeholder="e.g. Exclude 30310, commercial zones, or North Decatur area"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none font-medium text-left"
                />
              </div>

              {/* 10. Enrichment options (Preselected, read-only, checkboxes disabled) */}
              <div className="space-y-2 border-t border-gray-100 pt-3">
                <label className="text-xs font-bold text-neutral-700 block">
                  Encluded Elite Analytics &amp; Enrichment Features <span className="text-neutral-400 font-normal">(all pre-selected)</span>
                </label>
                <div className="p-3.5 rounded-xl bg-purple-50/20 border border-purple-200 space-y-2">
                  <div className="flex items-start gap-2.5 text-xs">
                    <input type="checkbox" checked disabled className="mt-0.5 pointer-events-none rounded border-purple-300 text-purple-600 bg-purple-50 h-4 w-4" />
                    <div>
                      <p className="font-semibold text-neutral-800">Complete Sourcing Properties Info</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">Full owner phone/emails, ARV estimates, equity %, maximum margin offer metrics included.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs">
                    <input type="checkbox" checked disabled className="mt-0.5 pointer-events-none rounded border-purple-300 text-purple-600 bg-purple-50 h-4 w-4" />
                    <div>
                      <p className="font-semibold text-neutral-800">Advanced Motivation Scoring (1-10)</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">Identify hot targets with our priority scores mapped to delinquent indicators.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs">
                    <input type="checkbox" checked disabled className="mt-0.5 pointer-events-none rounded border-purple-300 text-purple-600 bg-purple-50 h-4 w-4" />
                    <div>
                      <p className="font-semibold text-neutral-800">Custom Sourcing Outreach Scripts</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">A custom, pre-written script is included for each lead item matched directly to their pain point.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs">
                    <input type="checkbox" checked disabled className="mt-0.5 pointer-events-none rounded border-purple-300 text-purple-600 bg-purple-50 h-4 w-4" />
                    <div>
                      <p className="font-semibold text-neutral-800">Nearest 3 Active Closings Comps</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">Exact street addresses and actual closing sale prices of the three closest matches.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs">
                    <input type="checkbox" checked disabled className="mt-0.5 pointer-events-none rounded border-purple-300 text-purple-600 bg-purple-50 h-4 w-4" />
                    <div>
                      <p className="font-semibold text-neutral-800">Private Weekly Hotlist Tracker</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">Your Google Lead Sheet includes the "Hotlist" tab separating the 10 highest-ranked leads instantly.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 11. Custom requests (optional text field) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 block">
                  Any Other Custom Requests? <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={state.customRequests || ''}
                  onChange={(e) => setState((p) => ({ ...p, customRequests: e.target.value }))}
                  placeholder="e.g. Only homes built after 1990, single-family detached houses only, no commercial, no flood zones, etc."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-gray-205 text-xs font-sans text-neutral-900 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-neutral-850 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Navigation button */}
              <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleBack}
                  className="cursor-pointer text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 py-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-full bg-[#171717] hover:bg-neutral-800 text-white font-bold text-xs py-2.5 px-6 transition-all active:scale-95"
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* ==================== ELITE STEP 3 (REVIEW) ==================== */}
          {state.plan === 'Elite' && state.step === 3 && (
            <div className="space-y-6 animate-fade-in" id="onboarding-elite-review">
              <div className="space-y-1">
                <h3 className="text-base font-bold tracking-tight text-[#171717] font-sans">
                  Confirm Subscription Settings
                </h3>
                <p className="text-xs text-neutral-500 font-sans">
                  Please review your custom Elite Plan configurations prior to initiating checkout billing.
                </p>
              </div>

              {/* Review details */}
              <div className="bg-neutral-50 rounded-2xl border border-gray-200 p-4 space-y-3.5 text-xs font-sans text-[#171717]">
                <div className="flex justify-between items-center pb-2 border-b border-gray-250/50">
                  <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-wider">Tier</span>
                  <span className="font-bold text-purple-900">Elite Subscription — $500/mo</span>
                </div>
                <div className="flex justify-between items-start pb-2 border-b border-gray-250/50 gap-3 text-right">
                  <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-wider text-left shrink-0">Recipient</span>
                  <div>
                    <p className="font-bold">{fullNameInput}</p>
                    <p className="text-neutral-500 font-mono text-[10px] mt-0.5">{state.email}</p>
                    <p className="text-neutral-400 text-[10px] font-mono mt-0.5">📢 SMS Alerts: {state.phone}</p>
                  </div>
                </div>
                <div className="flex justify-between items-start pb-2 border-b border-gray-250/50 gap-3 text-right">
                  <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-wider text-left shrink-0">Target Geofence</span>
                  <div className="max-w-[240px]">
                    <p className="text-neutral-800 leading-relaxed font-semibold block truncate">{state.geographyText}</p>
                    {state.excludeZipCodes?.trim() !== '' && state.excludeZipCodes && (
                      <p className="text-neutral-400 font-mono text-[10px] mt-0.5">Excluding: {state.excludeZipCodes}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-250/50">
                  <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-wider">Frequency</span>
                  <span className="font-bold text-neutral-800">{state.deliveryFrequency} Delivery (Weekly Priority default)</span>
                </div>
                <div className="space-y-1 pb-2 border-b border-gray-250/50">
                  <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-wider block">Lead Filter Categories ({state.selectedLeadTypes.length})</span>
                  <p className="text-neutral-600 leading-tight text-[11px] line-clamp-2">
                    {state.selectedLeadTypes.join(', ')}
                    {state.customLeadTypeOther?.trim() && ` (+ Custom Sourcing: ${state.customLeadTypeOther})`}
                  </p>
                </div>

                {state.customRequests?.trim() && (
                  <div className="pb-2 border-b border-gray-250/50 space-y-0.5">
                    <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-wider block">Filter Restrictions</span>
                    <p className="text-neutral-600 text-[11px] italic">{state.customRequests}</p>
                  </div>
                )}

                <div className="p-3 bg-neutral-900 text-white rounded-xl space-y-1.5 mt-2 shadow-sm">
                  <p className="font-semibold text-[11px] text-purple-300">✨ Comprehensive Elite Sourcing Benefits Locked:</p>
                  <p className="font-mono text-[10px] text-emerald-400 leading-relaxed">
                    🎁 Your custom spreadsheet initializes with <strong>100 Free Highly Enriched Leads + Your Priority Hotlist</strong> immediately on startup. First SMS alerts will be transmitted when high motivation matches are detected.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-4 pt-1">
                <button
                  type="button"
                  onClick={handleReviewSubmit}
                  className="cursor-pointer w-full rounded-full bg-[#171717] hover:bg-neutral-800 text-white font-semibold text-sm py-3 px-6 transition-all active:scale-97 shadow-compound flex items-center justify-center gap-2"
                  id="onboarding-elite-signup-btn"
                >
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span>Go to Stripe Billing Setup</span>
                </button>
                <p className="text-[10px] text-center text-neutral-400 max-w-sm mx-auto leading-relaxed">
                  Clicking continues to Stripe validation. Strategy calls scheduling (via Calendly link) will follow payment success.
                </p>
              </div>

              {/* Navigate Back */}
              <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleBack}
                  className="cursor-pointer text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 py-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Adjust parameters</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
