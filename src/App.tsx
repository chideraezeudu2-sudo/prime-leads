import { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import LegalViewer from './components/LegalViewer';
import { PlanType, OnboardingState } from './types';
import { submitOnboarding, createStripeCheckout } from './lib/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'onboarding' | 'confirmation'>('landing');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('Pro');
  const [onboardingData, setOnboardingData] = useState<OnboardingState | null>(null);
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleScrollToSection = (sectionId: string) => {
    if (currentPage !== 'landing') {
      setCurrentPage('landing');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectPlan = (planId: PlanType) => {
    setSelectedPlan(planId);
    setSubmitError(null);
    setCurrentPage('onboarding');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOnboardingSubmit = async (formData: OnboardingState) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setOnboardingData(formData);

    try {
      // Step 1 — Save subscriber to Supabase
      const onboardResult = await submitOnboarding(formData);

      // Step 2 — Create Stripe Checkout session and redirect
      const { url } = await createStripeCheckout(
        onboardResult.subscriber_id,
        formData.email,
        formData.plan
      );

      // Redirect to Stripe hosted checkout
      window.location.href = url;

    } catch (err: any) {
      console.error('Onboarding error:', err);
      setSubmitError(err.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleBackToPricing = () => {
    setCurrentPage('landing');
    setSubmitError(null);
    setTimeout(() => handleScrollToSection('pricing'), 100);
  };

  return (
    <div className="relative min-h-screen bg-[#ffffff] selection:bg-[#171717] selection:text-white">
      {currentPage !== 'confirmation' && (
        <Navbar
          currentPage={currentPage}
          onNavigate={(page, anchor) => {
            if (page === 'landing') {
              if (anchor) {
                handleScrollToSection(anchor);
              } else {
                setCurrentPage('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            } else {
              setCurrentPage(page as any);
            }
          }}
        />
      )}

      <main className="flex-1" id="main-content-flow">
        {currentPage === 'landing' && (
          <LandingPage onSelectPlan={handleSelectPlan} />
        )}

        {currentPage === 'onboarding' && (
          <>
            {submitError && (
              <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-800 text-xs font-medium px-5 py-3 rounded-full shadow-lg max-w-sm text-center">
                {submitError}
              </div>
            )}
            {isSubmitting && (
              <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                <div className="h-10 w-10 rounded-full border-4 border-neutral-200 border-t-neutral-900 animate-spin" />
                <p className="text-sm font-semibold text-neutral-700">Setting up your account...</p>
                <p className="text-xs text-neutral-400">Redirecting to secure checkout</p>
              </div>
            )}
            <OnboardingPage
              initialPlan={selectedPlan}
              onBackToPricing={handleBackToPricing}
              onNext={handleOnboardingSubmit}
            />
          </>
        )}

        {currentPage === 'confirmation' && (
          <ConfirmationPage
            onboardingData={onboardingData}
            onBackToHome={() => {
              setOnboardingData(null);
              setCurrentPage('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {currentPage !== 'confirmation' && (
        <Footer
          onShowLegal={(type) => setLegalType(type)}
          onScrollToSection={handleScrollToSection}
        />
      )}

      <LegalViewer type={legalType} onClose={() => setLegalType(null)} />
    </div>
  );
}
