import React, { useEffect, useState } from 'react';
import { RewardProvider } from './context/RewardContext';
import { useReward } from './context/RewardContext';
import { api, SystemUserProfile } from './api/client';
import { EventDispatcher } from './components/EventDispatcher';
import { RuleManager } from './components/RuleManager';
import { WalletView } from './components/WalletView';
import { TransactionLedger } from './components/TransactionLedger';
import { ApiSandbox } from './components/ApiSandbox';
import { BusinessUserManager } from './components/BusinessUserManager';
import { KotlinSourceViewer } from './components/KotlinSourceViewer';
import { RepoArchitectureGuide } from './components/RepoArchitectureGuide';
import { SponsorManager } from './components/SponsorManager';
import { PartnerMembershipManager } from './components/PartnerMembershipManager';
import { ReconciliationManager } from './components/ReconciliationManager';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  ArrowRight,
  Bell,
  Building2,
  ChevronDown,
  Coins,
  Gift,
  GitBranch,
  Grid2x2,
  History,
  Layers3,
  Megaphone,
  Network,
  Radar,
  RotateCcw,
  Send,
  Settings,
  SlidersHorizontal,
  Terminal,
  UserCircle2,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';

type AppTab =
  | 'dashboard'
  | 'events'
  | 'rules'
  | 'wallet'
  | 'transactions'
  | 'api'
  | 'entities'
  | 'kotlin'
  | 'repos'
  | 'offers'
  | 'sponsors'
  | 'partnerMemberships'
  | 'bits'
  | 'reconciliation';

const SidebarItem: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: string;
  tab: AppTab;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}> = ({ icon: Icon, label, count, tab, activeTab, setActiveTab }) => {
  const isActive = activeTab === tab;
  return (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${
        isActive
          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(6,182,212,0.25)]'
          : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
      }`}
    >
      <span className="flex items-center gap-2.5">
        <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
        <span className="text-sm font-medium">{label}</span>
      </span>
      {count && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
          {count}
        </span>
      )}
    </button>
  );
};

const DashboardHome: React.FC<{ setActiveTab: (tab: AppTab) => void }> = ({ setActiveTab }) => {
  return (
    <div className="space-y-4 lg:space-y-5">
      <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-slate-100">Dashboard</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Track acquisition, engagement, branch-level reward execution, and loyalty liabilities in one view.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-800/70 border-l-4 border-cyan-400 rounded-lg px-4 py-3">
            <div className="text-xs text-slate-400">Total Members</div>
            <div className="text-2xl font-semibold text-cyan-300 mt-1">138K</div>
          </div>
          <div className="bg-slate-800/70 border-l-4 border-amber-400 rounded-lg px-4 py-3">
            <div className="text-xs text-slate-400">Total Active Offers</div>
            <div className="text-2xl font-semibold text-amber-300 mt-1">147</div>
          </div>
          <div className="bg-slate-800/70 border-l-4 border-emerald-400 rounded-lg px-4 py-3">
            <div className="text-xs text-slate-400">Total Sales</div>
            <div className="text-2xl font-semibold text-emerald-300 mt-1">USD 242M</div>
          </div>
          <div className="bg-slate-800/70 border-l-4 border-rose-400 rounded-lg px-4 py-3">
            <div className="text-xs text-slate-400">Total Liability</div>
            <div className="text-2xl font-semibold text-rose-300 mt-1">USD 941K</div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-100">Sales By Day</h3>
          <span className="text-xs text-slate-500">Heatmap preview</span>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
          <div className="grid grid-cols-12 sm:grid-cols-24 gap-1.5">
            {Array.from({ length: 192 }).map((_, idx) => {
              const tier = idx % 7;
              const color =
                tier < 3
                  ? 'bg-slate-700/70'
                  : tier < 5
                  ? 'bg-orange-500/50'
                  : 'bg-rose-500/70';
              return <span key={idx} className={`w-2.5 h-2.5 rounded-full ${color}`} />;
            })}
          </div>
          <div className="text-[11px] text-slate-500 mt-3">Sep • Oct • Nov • Dec • Jan • Feb • Mar • Apr • May • Jun • Jul • Aug</div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">Members By Enrollment Channel</h3>
          <div className="h-44 flex items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80">
            <div className="w-36 h-36 rounded-full border-[20px] border-cyan-400/80 border-r-rose-400 border-b-indigo-400 relative">
              <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-slate-950 border border-slate-700" />
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-3">Website • PMS • Synxis • iOS • Android • Opera PMS</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">Member Acquisition Trend</h3>
          <div className="h-44 rounded-lg border border-slate-800 bg-slate-950/80 px-4 py-3 flex items-end gap-1.5">
            {Array.from({ length: 36 }).map((_, idx) => {
              const tall = idx === 12 || idx === 20;
              const height = tall ? 70 : (idx % 5) + 4;
              return <span key={idx} style={{ height: `${height}%` }} className="w-2 bg-yellow-400/90 rounded-sm" />;
            })}
          </div>
          <div className="text-xs text-slate-500 mt-3">Jul 2023 to Jan 2026</div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-100">Recency Overall</h3>
          <div className="mt-3 h-32 rounded-lg border border-slate-800 bg-slate-950/80 flex items-center justify-center text-slate-500 text-sm">
            Widget loader placeholder
          </div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-100">Recency Trend</h3>
          <div className="mt-3 h-32 rounded-lg border border-slate-800 bg-slate-950/80 flex items-center justify-center text-slate-500 text-sm">
            Widget loader placeholder
          </div>
        </div>
      </section>

      <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-slate-100">Operational Shortcuts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-3">
          <button type="button" onClick={() => setActiveTab('entities')} className="text-left p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors">
            <div className="text-sm font-semibold text-cyan-200">Tenant Provisioning</div>
            <div className="text-xs text-slate-400 mt-1">Create tenant, program, branches, members</div>
          </button>
          <button type="button" onClick={() => setActiveTab('events')} className="text-left p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors">
            <div className="text-sm font-semibold text-cyan-200">Event Processing</div>
            <div className="text-xs text-slate-400 mt-1">Trigger branch-routed reward events</div>
          </button>
          <button type="button" onClick={() => setActiveTab('rules')} className="text-left p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors">
            <div className="text-sm font-semibold text-cyan-200">Rule Governance</div>
            <div className="text-xs text-slate-400 mt-1">Manage global and branch-specific rules</div>
          </button>
          <button type="button" onClick={() => setActiveTab('wallet')} className="text-left p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors">
            <div className="text-sm font-semibold text-cyan-200">Shared Wallet</div>
            <div className="text-xs text-slate-400 mt-1">Review wallet history across branches</div>
          </button>
        </div>
      </section>
    </div>
  );
};

const PlaceholderModule: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="h-28 rounded-lg border border-slate-800 bg-slate-950/80" />
        <div className="h-28 rounded-lg border border-slate-800 bg-slate-950/80" />
        <div className="h-28 rounded-lg border border-slate-800 bg-slate-950/80" />
      </div>
      <div className="mt-4 h-52 rounded-lg border border-slate-800 bg-slate-950/80 flex items-center justify-center text-slate-500 text-sm">
        UI scaffold ready. Backend integration can be plugged in here.
      </div>
    </div>
  );
};

const LoginScreen: React.FC<{ onLoggedIn: (user: SystemUserProfile) => void }> = ({ onLoggedIn }) => {
  const [mode, setMode] = useState<'signin' | 'selfServe' | 'enterprise' | 'firstLogin' | 'forgot' | 'acceptInvite'>('signin');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState('');

  const [firstLoginCurrentPassword, setFirstLoginCurrentPassword] = useState('');
  const [firstLoginNewPassword, setFirstLoginNewPassword] = useState('');
  const [firstLoginConfirmPassword, setFirstLoginConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [firstLoginError, setFirstLoginError] = useState('');

  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [programName, setProgramName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [expectedMembers, setExpectedMembers] = useState('');
  const [expectedTransactions, setExpectedTransactions] = useState('');
  const [enterpriseNotes, setEnterpriseNotes] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  const [inviteToken, setInviteToken] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [isAcceptingInvite, setIsAcceptingInvite] = useState(false);
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token') || '';
    if (window.location.pathname.includes('/invite/accept') && tokenFromUrl) {
      setMode('acceptInvite');
      setInviteToken(tokenFromUrl);
    }
  }, []);

  const toSlug = (value: string): string =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setSignInError('');
    setIsSigningIn(true);
    try {
      const response = await api.login({ identifier, password });
      if (response.mustChangePassword) {
        setMode('firstLogin');
        setFirstLoginCurrentPassword(password);
        return;
      }
      onLoggedIn(response.user);
    } catch (submitError: any) {
      setSignInError(submitError?.message || 'Unable to sign in');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleFirstLoginPasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setFirstLoginError('');
    if (firstLoginNewPassword !== firstLoginConfirmPassword) {
      setFirstLoginError('New password and confirmation do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await api.changePassword({
        currentPassword: firstLoginCurrentPassword,
        newPassword: firstLoginNewPassword,
      });
      onLoggedIn(response.user);
    } catch (submitError: any) {
      setFirstLoginError(submitError?.message || 'Unable to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setRegisterError('');
    setIsRegistering(true);
    try {
      const resolvedSlug = toSlug(slug || businessName);
      const response = await api.registerBusinessSelfServe({
        businessName,
        slug: resolvedSlug,
        adminEmail,
        adminPassword,
        programName,
        currency,
        earningRate: 10,
        redemptionRate: 1,
      });
      onLoggedIn(response.user);
    } catch (submitError: any) {
      setRegisterError(submitError?.message || 'Unable to register business');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleEnterpriseInquiry = async (event: React.FormEvent) => {
    event.preventDefault();
    setInquiryError('');
    setInquirySuccess('');
    setIsSubmittingInquiry(true);
    try {
      const response = await api.submitEnterpriseInquiry({
        companyName,
        contactName,
        contactEmail,
        companySize: companySize || undefined,
        expectedMonthlyMembers: expectedMembers ? Number(expectedMembers) : undefined,
        expectedMonthlyTransactions: expectedTransactions ? Number(expectedTransactions) : undefined,
        notes: enterpriseNotes || undefined,
      });
      setInquirySuccess(`Request submitted. Onboarding ID: ${response.onboardingRequestId}`);
      setMode('signin');
      setIdentifier(contactEmail);
    } catch (submitError: any) {
      setInquiryError(submitError?.message || 'Unable to submit enterprise inquiry');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setForgotError('');
    setForgotMessage('');
    setIsSubmittingForgot(true);
    try {
      const response = await api.forgotPassword(forgotEmail);
      setForgotMessage(response.message);
      if (response.resetToken) {
        setResetToken(response.resetToken);
      }
    } catch (submitError: any) {
      setForgotError(submitError?.message || 'Unable to generate reset token');
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setForgotError('');
    setIsSubmittingForgot(true);
    try {
      const response = await api.resetPassword({ token: resetToken, newPassword: resetPassword });
      onLoggedIn(response.user);
    } catch (submitError: any) {
      setForgotError(submitError?.message || 'Unable to reset password');
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  const handleAcceptInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    setInviteError('');
    setIsAcceptingInvite(true);
    try {
      const response = await api.acceptInvite({ token: inviteToken, password: invitePassword });
      onLoggedIn(response.user);
    } catch (submitError: any) {
      setInviteError(submitError?.message || 'Unable to accept invite');
    } finally {
      setIsAcceptingInvite(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-100 grid place-items-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl shadow-black/40">
        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Benevo Dashboard</div>
        <h1 className="text-2xl font-semibold mt-2">Access Portal</h1>
        <p className="text-sm text-slate-400 mt-1">Sign in, register as a small business, or request enterprise onboarding for larger organizations.</p>

        <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
          <button type="button" onClick={() => setMode('signin')} className={`rounded-md px-2 py-2 border ${mode === 'signin' ? 'border-cyan-500 bg-cyan-500/15 text-cyan-200' : 'border-slate-700 text-slate-300'}`}>Sign In</button>
          <button type="button" onClick={() => setMode('selfServe')} className={`rounded-md px-2 py-2 border ${mode === 'selfServe' ? 'border-cyan-500 bg-cyan-500/15 text-cyan-200' : 'border-slate-700 text-slate-300'}`}>Small Business</button>
          <button type="button" onClick={() => setMode('enterprise')} className={`rounded-md px-2 py-2 border ${mode === 'enterprise' ? 'border-cyan-500 bg-cyan-500/15 text-cyan-200' : 'border-slate-700 text-slate-300'}`}>Enterprise</button>
        </div>

        {mode === 'signin' && (
          <form className="mt-6 space-y-3" onSubmit={handleSignIn}>
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Email or username" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Password" required />
            <button type="submit" disabled={isSigningIn} className="w-full rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white px-3 py-2 text-sm font-semibold">{isSigningIn ? 'Signing In...' : 'Sign In'}</button>
            <button type="button" onClick={() => setMode('forgot')} className="w-full rounded-lg border border-slate-700 text-slate-300 px-3 py-2 text-sm">Forgot Password</button>
            {signInError && <p className="text-xs text-rose-400">{signInError}</p>}
            {inquirySuccess && <p className="text-xs text-emerald-400">{inquirySuccess}</p>}
          </form>
        )}

        {mode === 'selfServe' && (
          <form className="mt-6 space-y-3" onSubmit={handleRegister}>
            <p className="text-xs text-slate-400">For small businesses and startups that want instant self-serve setup.</p>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Business name" required />
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Subdomain slug (e.g. indianhotel)" required />
            <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} type="email" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Admin email" required />
            <input value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} type="password" minLength={8} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Set admin password (min 8 chars)" required />
            <input value={programName} onChange={(e) => setProgramName(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Program name" required />
            <input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Currency" required />
            <button type="submit" disabled={isRegistering} className="w-full rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white px-3 py-2 text-sm font-semibold">{isRegistering ? 'Registering...' : 'Create Business & Sign In'}</button>
            {registerError && <p className="text-xs text-rose-400">{registerError}</p>}
          </form>
        )}

        {mode === 'enterprise' && (
          <form className="mt-6 space-y-3" onSubmit={handleEnterpriseInquiry}>
            <p className="text-xs text-slate-400">For large businesses that need custom pricing, compliance, SSO, or managed onboarding.</p>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Company name" required />
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Primary contact name" required />
            <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Contact email" required />
            <input value={companySize} onChange={(e) => setCompanySize(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Company size (optional)" />
            <div className="grid grid-cols-2 gap-2">
              <input value={expectedMembers} onChange={(e) => setExpectedMembers(e.target.value)} type="number" min={0} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Monthly members" />
              <input value={expectedTransactions} onChange={(e) => setExpectedTransactions(e.target.value)} type="number" min={0} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Monthly txns" />
            </div>
            <textarea value={enterpriseNotes} onChange={(e) => setEnterpriseNotes(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 h-24" placeholder="Custom pricing / compliance requirements" />
            <button type="submit" disabled={isSubmittingInquiry} className="w-full rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white px-3 py-2 text-sm font-semibold">{isSubmittingInquiry ? 'Submitting...' : 'Request Enterprise Onboarding'}</button>
            {inquiryError && <p className="text-xs text-rose-400">{inquiryError}</p>}
          </form>
        )}

        {mode === 'firstLogin' && (
          <form className="mt-6 space-y-3" onSubmit={handleFirstLoginPasswordChange}>
            <p className="text-xs text-amber-300">First login detected. Change your temporary password to continue.</p>
            <input type="password" value={firstLoginCurrentPassword} onChange={(e) => setFirstLoginCurrentPassword(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Current password" required />
            <input type="password" value={firstLoginNewPassword} onChange={(e) => setFirstLoginNewPassword(e.target.value)} minLength={8} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="New password" required />
            <input type="password" value={firstLoginConfirmPassword} onChange={(e) => setFirstLoginConfirmPassword(e.target.value)} minLength={8} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Confirm new password" required />
            <button type="submit" disabled={isUpdatingPassword} className="w-full rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white px-3 py-2 text-sm font-semibold">{isUpdatingPassword ? 'Updating...' : 'Update Password'}</button>
            {firstLoginError && <p className="text-xs text-rose-400">{firstLoginError}</p>}
          </form>
        )}

        {mode === 'forgot' && (
          <div className="mt-6 space-y-4">
            <form className="space-y-3" onSubmit={handleForgotPassword}>
              <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Account email" required />
              <button type="submit" disabled={isSubmittingForgot} className="w-full rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white px-3 py-2 text-sm font-semibold">{isSubmittingForgot ? 'Generating...' : 'Generate Reset Token'}</button>
              {forgotMessage && <p className="text-xs text-emerald-400">{forgotMessage}</p>}
            </form>

            <form className="space-y-3 border-t border-slate-800 pt-3" onSubmit={handleResetPassword}>
              <input value={resetToken} onChange={(e) => setResetToken(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Reset token" required />
              <input type="password" minLength={8} value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="New password" required />
              <button type="submit" disabled={isSubmittingForgot} className="w-full rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white px-3 py-2 text-sm font-semibold">{isSubmittingForgot ? 'Resetting...' : 'Reset Password & Sign In'}</button>
              <button type="button" onClick={() => setMode('signin')} className="w-full rounded-lg border border-slate-700 text-slate-300 px-3 py-2 text-sm">Back to Sign In</button>
              {forgotError && <p className="text-xs text-rose-400">{forgotError}</p>}
            </form>
          </div>
        )}

        {mode === 'acceptInvite' && (
          <form className="mt-6 space-y-3" onSubmit={handleAcceptInvite}>
            <p className="text-xs text-cyan-300">Accept team invitation and set your password.</p>
            <input value={inviteToken} onChange={(e) => setInviteToken(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Invite token" required />
            <input type="password" minLength={8} value={invitePassword} onChange={(e) => setInvitePassword(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" placeholder="Choose password" required />
            <button type="submit" disabled={isAcceptingInvite} className="w-full rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white px-3 py-2 text-sm font-semibold">{isAcceptingInvite ? 'Activating...' : 'Accept Invite & Sign In'}</button>
            {inviteError && <p className="text-xs text-rose-400">{inviteError}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

const AppContent: React.FC<{ authUser: SystemUserProfile; onLogout: () => Promise<void> }> = ({ authUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);

  const {
    businesses,
    users,
    selectedBusinessId,
    setSelectedBusinessId,
    selectedUserId,
    setSelectedUserId,
    getWallet,
    resetToDefaults,
  } = useReward();

  const wallet = getWallet(selectedUserId, selectedBusinessId);

  const renderMainContent = () => {
    if (activeTab === 'dashboard') return <DashboardHome setActiveTab={setActiveTab} />;
    if (activeTab === 'events') return <EventDispatcher />;
    if (activeTab === 'rules') return <RuleManager />;
    if (activeTab === 'wallet') return <WalletView />;
    if (activeTab === 'transactions') return <TransactionLedger />;
    if (activeTab === 'api') return <ApiSandbox />;
    if (activeTab === 'entities') return <BusinessUserManager />;
    if (activeTab === 'kotlin') return <KotlinSourceViewer />;
    if (activeTab === 'repos') return <RepoArchitectureGuide />;
    if (activeTab === 'offers') {
      return <PlaceholderModule title="Offers" subtitle="Offer orchestration console for campaigns and dynamic rewards." />;
    }
    if (activeTab === 'sponsors') {
      return <SponsorManager />;
    }
    if (activeTab === 'partnerMemberships') {
      return <PartnerMembershipManager />;
    }
    if (activeTab === 'bits') {
      return <PlaceholderModule title="BITs" subtitle="Brand interaction trackers and engagement events." />;
    }
    if (activeTab === 'reconciliation') {
      return <ReconciliationManager />;
    }
    return <PlaceholderModule title="Batches" subtitle="Batch processing jobs and data import automation." />;
  };

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-100 flex overflow-hidden">
      <aside className="w-[250px] shrink-0 border-r border-slate-800 bg-slate-900/90 p-4 hidden lg:flex lg:flex-col">
        <div className="px-2 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 grid place-items-center text-white shadow">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-slate-500">powered by</div>
              <div className="font-semibold text-slate-100 tracking-wide">BENEVO</div>
            </div>
          </div>
        </div>

        <div className="mt-4 px-2 pb-4 border-b border-slate-800">
          <div className="w-11 h-11 rounded-full bg-slate-700 text-slate-100 grid place-items-center font-semibold">SD</div>
          <div className="text-sm font-medium text-slate-200 mt-2">{authUser.username}</div>
          <div className="text-xs text-slate-500">{authUser.email}</div>
        </div>

        <nav className="mt-4 space-y-1.5 overflow-auto">
          <SidebarItem icon={Grid2x2} label="Dashboard" tab="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem icon={Megaphone} label="Offers" tab="offers" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem icon={Network} label="Sponsors" tab="sponsors" activeTab={activeTab} setActiveTab={setActiveTab} count="85" />
          <SidebarItem icon={Users} label="Partner Memberships" tab="partnerMemberships" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem icon={Radar} label="BITs" tab="bits" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem icon={Layers3} label="Reconciliation" tab="reconciliation" activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="my-3 border-t border-slate-700/80" />

          <SidebarItem icon={Terminal} label="API Console" tab="api" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem icon={Zap} label="Kotlin Source" tab="kotlin" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem icon={GitBranch} label="2-Repos" tab="repos" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem icon={Wallet} label="Wallet" tab="wallet" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem icon={Send} label="Events" tab="events" activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="my-3 border-t border-slate-700/50" />

          <SidebarItem icon={Building2} label="Tenant Setup" tab="entities" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem icon={SlidersHorizontal} label="Rules" tab="rules" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem icon={History} label="Audit Transactions" tab="transactions" activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-3 sm:px-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-xs text-slate-500 hidden md:inline">DashBoard Home</span>
            <ChevronDown className="w-3 h-3 text-slate-600 hidden md:inline" />
            <span className="px-2 py-1 rounded bg-slate-800 text-[11px] tracking-wide text-slate-300">GRAVTY STYLE</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden xl:flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-700 bg-slate-800/80">
                <Building2 className="w-3.5 h-3.5 text-cyan-300" />
                <select
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none"
                >
                  {businesses.length === 0 && <option value="">No tenants</option>}
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-700 bg-slate-800/80">
                <Users className="w-3.5 h-3.5 text-indigo-300" />
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none"
                >
                  {users.length === 0 && <option value="">No members</option>}
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name || u.id}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded border border-slate-700 bg-slate-800/80 text-xs">
              <Coins className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-emerald-300 font-semibold">{wallet.availablePoints}</span>
              <span className="text-slate-400">points</span>
            </div>

            <button
              type="button"
              onClick={() => setQuickMenuOpen(true)}
              className="w-8 h-8 rounded-md border border-cyan-500/50 bg-cyan-500/10 text-cyan-200 grid place-items-center hover:bg-cyan-500/20"
              title="Benevo Navigator"
            >
              B
            </button>

            <button type="button" className="w-8 h-8 rounded-md border border-slate-700 bg-slate-800 text-slate-300 grid place-items-center">
              <Bell className="w-4 h-4" />
            </button>
            <button type="button" className="w-8 h-8 rounded-md border border-slate-700 bg-slate-800 text-slate-300 grid place-items-center">
              <Settings className="w-4 h-4" />
            </button>
            <button type="button" className="w-8 h-8 rounded-md border border-slate-700 bg-slate-800 text-slate-200 grid place-items-center">
              <UserCircle2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => void onLogout()}
              className="px-2 py-1 rounded border border-slate-700 bg-slate-800 text-xs text-slate-200 hover:text-white"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-3 sm:p-5 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {renderMainContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t border-slate-800 bg-slate-900/70 py-3 px-4 text-xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Benevo Reward OS • Multi-tenant loyalty operations console</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all local state and API key data?')) {
                  resetToDefaults();
                  setActiveTab('dashboard');
                }
              }}
              className="px-2 py-1 rounded border border-slate-700 bg-slate-800 text-slate-300 hover:text-slate-100"
            >
              <span className="inline-flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" />Reset</span>
            </button>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {quickMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm px-3"
            onClick={() => setQuickMenuOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[760px] mx-auto mt-20 rounded-xl overflow-hidden border border-slate-700 shadow-2xl shadow-black/50"
            >
              <div className="grid md:grid-cols-2">
                <div className="bg-slate-800 p-5">
                  <div className="text-3xl tracking-wide text-slate-100">BENEVO</div>
                  <div className="mt-4 space-y-1.5">
                    <button type="button" onClick={() => { setActiveTab('dashboard'); setQuickMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded bg-cyan-500/20 text-cyan-100 inline-flex items-center justify-between">Navigator <ArrowRight className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => { setActiveTab('dashboard'); setQuickMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-700 text-slate-200 inline-flex items-center justify-between">Home <ArrowRight className="w-3.5 h-3.5 text-slate-500" /></button>
                    <button type="button" onClick={() => { setActiveTab('entities'); setQuickMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-700 text-slate-200 inline-flex items-center justify-between">Program Setup <ArrowRight className="w-3.5 h-3.5 text-slate-500" /></button>
                    <button type="button" onClick={() => { setActiveTab('events'); setQuickMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-700 text-slate-200 inline-flex items-center justify-between">Data Config <ArrowRight className="w-3.5 h-3.5 text-slate-500" /></button>
                    <button type="button" onClick={() => { setActiveTab('rules'); setQuickMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-700 text-slate-200 inline-flex items-center justify-between">Enrollment Setup <ArrowRight className="w-3.5 h-3.5 text-slate-500" /></button>
                    <button type="button" onClick={() => { setActiveTab('wallet'); setQuickMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-700 text-slate-200 inline-flex items-center justify-between">Access Management <ArrowRight className="w-3.5 h-3.5 text-slate-500" /></button>
                    <button type="button" onClick={() => { setActiveTab('api'); setQuickMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-700 text-slate-200 inline-flex items-center justify-between">Benevo Connect <ArrowRight className="w-3.5 h-3.5 text-slate-500" /></button>
                    <button type="button" onClick={() => { setActiveTab('transactions'); setQuickMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-700 text-slate-200 inline-flex items-center justify-between">Audit History <ArrowRight className="w-3.5 h-3.5 text-slate-500" /></button>
                    <button type="button" onClick={() => { setActiveTab('kotlin'); setQuickMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-700 text-slate-200 inline-flex items-center justify-between">Admin <ArrowRight className="w-3.5 h-3.5 text-slate-500" /></button>
                  </div>
                </div>
                <div className="bg-slate-100 text-slate-900 p-6">
                  <h3 className="text-4xl font-medium">Welcome</h3>
                  <div className="mt-4 h-10 rounded-full border border-slate-300 bg-white/90 px-4 flex items-center text-slate-400 text-sm">
                    Search
                  </div>
                  <p className="mt-4 text-sm text-slate-700 leading-relaxed">
                    You can quickly access tenant provisioning, branch setup, event processing, rules,
                    wallet history, and API diagnostics from this navigator.
                  </p>
                  <div className="mt-14 text-slate-400 text-sm">Module links with active backend integration are connected.</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function App() {
  const [authUser, setAuthUser] = useState<SystemUserProfile | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        if (!api.getAccessToken()) {
          setAuthUser(null);
          return;
        }
        const me = await api.getMe();
        setAuthUser(me);
      } catch {
        api.clearAccessToken();
        setAuthUser(null);
      } finally {
        setIsCheckingSession(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setAuthUser(null);
  };

  if (isCheckingSession) {
    return <div className="min-h-screen bg-[#0a0f18]" />;
  }

  if (!authUser) {
    return <LoginScreen onLoggedIn={setAuthUser} />;
  }

  return (
    <RewardProvider>
      <AppContent authUser={authUser} onLogout={handleLogout} />
    </RewardProvider>
  );
}

export default App;
