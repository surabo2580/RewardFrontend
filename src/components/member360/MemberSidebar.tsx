import React from 'react';
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CreditCard,
  Gift,
  Gauge,
  Headphones,
  Receipt,
  RefreshCw,
  Radar,
  Tag,
  UserRound,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { Member360 } from '../../api/client';
import { Badge, fmtNum, MemberModule } from './ui';

export const MEMBER_MODULES: Array<{ id: MemberModule; label: string; icon: React.ComponentType<{ className?: string }>; count?: (d: Member360) => number }> = [
  { id: 'central', label: 'Member Central', icon: Gauge },
  { id: 'details', label: 'Member Details', icon: UserRound },
  { id: 'linked', label: 'Linked Members', icon: Users, count: (d) => d.counts.linkedMembers },
  { id: 'cards', label: 'Membership Cards', icon: CreditCard, count: (d) => d.counts.activeCards },
  { id: 'balance', label: 'Balance', icon: Wallet },
  { id: 'transactions', label: 'Transactions', icon: Receipt, count: (d) => d.counts.transactions },
  { id: 'vouchers', label: 'Vouchers', icon: Gift, count: (d) => d.counts.activeVouchers },
  { id: 'offers', label: 'Offers', icon: Tag, count: (d) => d.counts.eligibleOffers },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays, count: (d) => d.counts.bookings },
  { id: 'services', label: 'Services', icon: Headphones, count: (d) => d.counts.openTickets },
  { id: 'activity', label: 'Activity', icon: Radar },
  { id: 'kpis', label: 'KPIs', icon: BarChart3 },
];

export const displayName = (profile: Member360['profile']) =>
  [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email || profile.externalUserId;

export const MemberSidebar: React.FC<{
  data: Member360 | null;
  loading: boolean;
  activeModule: MemberModule;
  onSelect: (module: MemberModule) => void;
  onExit: () => void;
  onQuickAdjust: () => void;
  onChangeTier: () => void;
}> = ({ data, loading, activeModule, onSelect, onExit, onQuickAdjust, onChangeTier }) => (
  <>
    <button
      type="button"
      onClick={onExit}
      className="mb-3 inline-flex items-center gap-1.5 px-2 text-xs text-slate-400 hover:text-white"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> Back to Member Portal
    </button>

    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
      {loading && !data ? (
        <div className="space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-800" />
        </div>
      ) : data ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <Badge>{data.profile.status}</Badge>
            <span className="font-mono text-[10px] text-slate-500">#{data.profile.id}</span>
          </div>
          <div className="mt-2 truncate text-sm font-semibold text-white" title={displayName(data.profile)}>{displayName(data.profile)}</div>
          <div className="truncate text-xs text-slate-400" title={data.profile.email || ''}>{data.profile.email || 'No email'}</div>
          <div className="mt-1 text-[11px] text-slate-500">Member ID: <span className="font-mono text-slate-300">{data.profile.externalUserId}</span></div>
          {data.profile.enrollingSponsorName && (
            <div className="text-[11px] text-slate-500">Enrolling: <span className="text-slate-300">{data.profile.enrollingSponsorName}</span></div>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
            <div className="flex items-center gap-1.5">
              <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-300">{data.tier.tierName}</span>
              <button type="button" onClick={onChangeTier} className="text-slate-500 hover:text-cyan-300" title="Change tier">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
            <span className="text-[11px] text-slate-400">x{Number(data.tier.multiplier).toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[11px] text-slate-500">Balance</span>
            <span className="text-sm font-semibold text-emerald-300">{fmtNum(data.balances.spendablePoints)} pts</span>
          </div>
        </>
      ) : (
        <div className="text-xs text-rose-400">Member could not be loaded.</div>
      )}
    </div>

    <nav className="mt-3 space-y-1 overflow-auto" aria-label="Member workspace navigation">
      {MEMBER_MODULES.map(({ id, label, icon: Icon, count }) => {
        const isActive = activeModule === id;
        const value = data && count ? count(data) : undefined;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`group flex w-full items-center justify-between rounded-md border-l-2 px-3 py-2 transition-colors ${
              isActive ? 'border-cyan-400 bg-cyan-500/10 text-cyan-100' : 'border-transparent text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="text-sm font-medium">{label}</span>
            </span>
            {value !== undefined && value > 0 && (
              <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">{value}</span>
            )}
          </button>
        );
      })}
    </nav>

    <div className="mt-auto border-t border-slate-800 pt-3">
      <button
        type="button"
        onClick={onQuickAdjust}
        disabled={!data}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50"
      >
        <Zap className="h-3.5 w-3.5 text-amber-300" /> Adjust Points / Goodwill
      </button>
    </div>
  </>
);
