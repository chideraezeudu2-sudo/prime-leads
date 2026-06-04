import { CheckCircle, ShieldCheck, Mail, Calendar, ArrowRight, BookOpen, Clock, FileSpreadsheet, PhoneCall, ExternalLink, HelpCircle } from 'lucide-react';
import { OnboardingState } from '../types';

interface ConfirmationPageProps {
  onboardingData: OnboardingState | null;
  onBackToHome: () => void;
}

export default function ConfirmationPage({ onboardingData, onBackToHome }: ConfirmationPageProps) {
  const planName = onboardingData?.plan || 'Pro';
  const userEmail = onboardingData?.email || 'subscriber@example.com';
  const userFullName = onboardingData?.firstName 
    ? `${onboardingData.firstName} ${onboardingData.lastName || ''}`.trim() 
    : 'Valued Subscriber';
  
  // Decide the trial free leads and sheets link depending on selected plan
  let freeLeadsMessage = "";
  let sheetLinkText = "";
  let sheetLinkUrl = "";
  let sheetTargetDetails = "";

  switch (planName) {
    case 'Basic':
      freeLeadsMessage = "Your first 50 free leads are ready now inside the shared Google lead tracker sheet.";
      sheetLinkText = "Open Shared Basic Google Sheet";
      sheetLinkUrl = "https://docs.google.com/spreadsheets/d/1BasicSharedLeadsSampleSheetDemo/edit?usp=sharing";
      sheetTargetDetails = "Includes the shared community delivery workspace for Basic subscribers.";
      break;

    case 'Pro':
      freeLeadsMessage = "Your first 50 free highly-enriched leads are ready now inside your private Google Sheet.";
      sheetLinkText = "Access Private Pro Google Sheet";
      sheetLinkUrl = "https://docs.google.com/spreadsheets/d/1PrivateProLeadsMockSheetDemo/edit?usp=sharing";
      sheetTargetDetails = "Includes skip-traced telephone list numbers, custom ARV calculations, property equity estimations, and maximum margin wholesale cash offer values.";
      break;

    case 'Elite':
      freeLeadsMessage = "Your first 100 free highly-enriched leads + Hotlist are ready now inside your private Google Sheet.";
      sheetLinkText = "Access Private Elite Google Sheet (Dual Tabs)";
      sheetLinkUrl = "https://docs.google.com/spreadsheets/d/1PrivateEliteLeadsMockSheetWithDualTabsDemo/edit?usp=sharing";
      sheetTargetDetails = "Includes two active tabs: 'All Leads' (fully enriched with 1-10 motivation scores & scripts) and 'Hotlist' (the top 10 most urgent property deals in your geofence).";
      break;

    default:
      freeLeadsMessage = "Your initial signup batch leads are prepared and loaded.";
      sheetLinkText = "View My Google Sheet";
      sheetLinkUrl = "https://docs.google.com/spreadsheets";
      sheetTargetDetails = "Check your delivery email for workspace authorization options.";
  }

  return (
    <div className="bg-[#ffffff] text-[#171717] min-h-screen py-16 md:py-24 px-4 md:px-8 flex flex-col justify-center items-center font-sans" id="confirmation-page-container">
      
      <div className="max-w-xl w-full space-y-8 text-center" id="confirmation-inner">
        
        {/* Checked icon indicator */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-md animate-bounce">
            <CheckCircle className="h-8 w-8 stroke-[2.5]" id="success-check-icon" />
          </div>
        </div>

        {/* Header */}
        <div className="space-y-3">
          <p className="text-[10px] font-mono tracking-widest text-[#7e7e7e] uppercase font-bold">Subscription Successfully Created</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#171717]">
            Congratulations! You're subscribed.
          </h1>
          <p className="text-sm text-neutral-550 max-w-md mx-auto leading-relaxed">
            Welcome to the team, <strong className="text-neutral-900">{userFullName}</strong>. Your customized parameters has been mapped to our automated sourcing framework.
          </p>
        </div>

        {/* Dynamic sheet access card */}
        <div className="rounded-[24px] border border-neutral-200/80 bg-[#fafafa] p-6 text-left space-y-4 shadow-fine">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 w-full">
              <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-emerald-800">Your Lead Workspace</span>
              <p className="text-xs text-neutral-605 leading-relaxed font-sans mt-1">
                {freeLeadsMessage}
              </p>

              {/* Accessible sheet button */}
              <div className="pt-3">
                <a
                  href={sheetLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-605 bg-neutral-950 hover:bg-neutral-850 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-fine active:scale-97 cursor-pointer"
                >
                  <span>{sheetLinkText}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-[10px] text-neutral-400 mt-2 font-mono">
                {sheetTargetDetails}
              </p>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Schedulers */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-neutral-700 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed text-neutral-600">
                <strong className="text-neutral-900">Delivery Timeline:</strong> Your first full delivery arrives tomorrow. After that, leads follow your selected schedule (weekly or biweekly, every Monday).
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-neutral-700 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed text-neutral-600">
                <strong className="text-neutral-900">Confirmation email dispatched:</strong> An active link and a payment receipt details summary has been delivered to your email: <span className="font-mono font-bold text-neutral-800">{userEmail}</span>.
              </p>
            </div>
          </div>

          {/* Elite only elements: SMS confirmation alerts + Strategy Call instructions */}
          {planName === 'Elite' && (
            <div className="mt-4 p-4.5 rounded-xl bg-purple-50 border border-purple-150 space-y-3 font-sans animate-fade-in">
              <div className="flex items-start gap-2 text-xs">
                <span className="text-base text-purple-700">📱</span>
                <div>
                  <h4 className="font-bold text-purple-950">SMS Sourcing System Live</h4>
                  <p className="text-[11px] text-purple-800 mt-0.5 leading-relaxed">
                    We've sent a text notification to <strong className="font-mono text-purple-950">{onboardingData?.phone || 'your phone'}</strong>. Check your phone for confirmation alerts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs pt-1 border-t border-purple-100">
                <span className="text-base text-purple-700">🗓️</span>
                <div>
                  <h4 className="font-bold text-purple-950">1-on-1 Monthly Strategy Call</h4>
                  <p className="text-[11px] text-purple-800 mt-0.5 leading-relaxed">
                    Your exclusive Calendly private reservation key link has been included in your welcome email. Claim your complimentary initial onboarding session this month.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Basic only: Facebook group */}
          {planName === 'Basic' && (
            <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-150 text-xs text-blue-900 animate-fade-in">
              <p className="font-semibold text-blue-950">👥 Optional: Join our Exclusive Facebook Group</p>
              <p className="text-[11px] text-blue-805 mt-0.5 leading-relaxed">
                Connect, network, and exchange lead closing strategies with 2,400+ active distressed real estate investors nationwide. Link attached in welcome email!
              </p>
            </div>
          )}
        </div>

        {/* Resources / Help desk support */}
        <div className="rounded-xl border border-dashed border-gray-200 p-4 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-500 gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <HelpCircle className="h-3.5 w-3.5 text-neutral-400" />
            <span>Need Help? Contact <span className="font-bold text-neutral-750">support@realestateleadsSaaS.com</span></span>
          </div>
          <span className="hidden sm:inline text-neutral-300">|</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Active Tier: {planName} Workspace</span>
          </div>
        </div>

        {/* Button to Home reset */}
        <div className="pt-2">
          <button
            onClick={onBackToHome}
            className="cursor-pointer group rounded-full bg-neutral-950 hover:bg-neutral-850 text-white font-bold text-xs py-3.5 px-8 transition-all active:scale-95 shadow-fine inline-flex items-center gap-2"
            id="confirmation-back-to-home"
          >
            <span>Finish &amp; Back to Home</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
}
