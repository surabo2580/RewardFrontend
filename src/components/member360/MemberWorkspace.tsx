import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api, Member360, TierDto } from '../../api/client';
import { displayName, MEMBER_MODULES } from './MemberSidebar';
import { BalanceTab, OffersTab, TransactionsTab, VouchersTab } from './WalletTabs';
import { BookingsTab, KpisTab, ServicesTab } from './ServiceTabs';
import { LinkedMembersTab, MemberDetailsTab, MembershipCardsTab } from './ProfileTabs';
import { BitsExplorer } from '../BitsExplorer';
import { MemberCentral } from './MemberCentral';
import { Badge, ErrorText, fmtNum, inputClass, LoadingState, MemberModule, primaryButton, secondaryButton, useAsync } from './ui';

export function useMember360(memberId: number | null) {
  return useAsync<Member360 | null>(() => (memberId ? api.getMember360(memberId) : Promise.resolve(null)), [memberId]);
}

const Dialog: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-3 backdrop-blur-sm" onClick={onClose}>
    <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
      </div>
      {children}
    </div>
  </div>
);

const ADJUSTMENT_CATEGORIES = ['GOODWILL', 'MISSING_POINTS', 'SERVICE_RECOVERY', 'CORRECTION', 'PROMOTION'];

export const PointAdjustmentDialog: React.FC<{ data: Member360; onClose: () => void; onDone: () => void }> = ({ data, onClose, onDone }) => {
  const [direction, setDirection] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [points, setPoints] = useState('');
  const [category, setCategory] = useState('GOODWILL');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(points);
    if (!Number.isInteger(value) || value <= 0) {
      setError('Enter a positive whole number of points');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.adjustMemberPoints(data.profile.id, { direction, points: value, reason: reason.trim(), category });
      onDone();
    } catch (err: any) {
      setError(err?.message || 'Adjustment failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog title="Adjust Points / Goodwill" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="text-xs text-slate-400">Current balance: <span className="font-semibold text-emerald-300">{fmtNum(data.balances.spendablePoints)} pts</span></div>
        <div className="grid grid-cols-2 gap-2">
          {(['CREDIT', 'DEBIT'] as const).map((d) => (
            <button key={d} type="button" onClick={() => setDirection(d)} className={`rounded-md border py-2 text-sm font-semibold ${direction === d ? (d === 'CREDIT' ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200' : 'border-rose-500 bg-rose-500/15 text-rose-200') : 'border-slate-700 text-slate-400'}`}>
              {d === 'CREDIT' ? '+ Credit' : '− Debit'}
            </button>
          ))}
        </div>
        <input type="number" min={1} step={1} required value={points} onChange={(e) => setPoints(e.target.value)} placeholder="Points" className={inputClass} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
          {ADJUSTMENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <textarea required value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={1000} placeholder="Reason (stored on the service ticket and audit trail)" className={inputClass} />
        <ErrorText message={error} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={secondaryButton}>Cancel</button>
          <button type="submit" disabled={busy} className={primaryButton}>{busy ? 'Posting…' : 'Post adjustment'}</button>
        </div>
      </form>
    </Dialog>
  );
};

export const TierOverrideDialog: React.FC<{ data: Member360; onClose: () => void; onDone: (updated: Member360) => void }> = ({ data, onClose, onDone }) => {
  const [tiers, setTiers] = useState<TierDto[]>([]);
  const [targetTier, setTargetTier] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data.programId) return;
    api.getTiers(data.profile.tenantId, data.programId)
      .then((list) => {
        setTiers(list);
        setTargetTier(list.find((t) => t.name !== data.tier.tierName)?.name || '');
      })
      .catch((err) => setError(err?.message || 'Unable to load tiers'));
  }, [data.profile.tenantId, data.programId, data.tier.tierName]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      onDone(await api.overrideMemberTier(data.profile.id, { targetTier, reason: reason.trim() }));
    } catch (err: any) {
      setError(err?.message || 'Tier change failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog title="Change Tier (CS override)" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="text-xs text-slate-400">Current tier: <span className="font-semibold text-amber-300">{data.tier.tierName}</span></div>
        {!data.programId ? <ErrorText message="No program configured for this tenant." /> : (
          <select required value={targetTier} onChange={(e) => setTargetTier(e.target.value)} className={inputClass}>
            {tiers.map((t) => (
              <option key={t.id ?? t.name} value={t.name} disabled={t.name === data.tier.tierName}>{t.name} (rank {t.rank})</option>
            ))}
          </select>
        )}
        <textarea required value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={1000} placeholder="Reason for override" className={inputClass} />
        <ErrorText message={error} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={secondaryButton}>Cancel</button>
          <button type="submit" disabled={busy || !targetTier} className={primaryButton}>{busy ? 'Saving…' : 'Change tier'}</button>
        </div>
      </form>
    </Dialog>
  );
};

export const MemberWorkspace: React.FC<{
  member360: ReturnType<typeof useMember360>;
  activeModule: MemberModule;
  setActiveModule: (module: MemberModule) => void;
  dialog: 'adjust' | 'tier' | null;
  setDialog: (dialog: 'adjust' | 'tier' | null) => void;
  onOpenMember: (memberId: number) => void;
}> = ({ member360, activeModule, setActiveModule, dialog, setDialog, onOpenMember }) => {
  const { data, loading, error, reload, setData } = member360;
  const [servicesRefreshKey, setServicesRefreshKey] = useState(0);

  if (loading && !data) return <LoadingState label="Loading member workspace…" />;
  if (error || !data) return <ErrorText message={error || 'Member not found'} />;

  const memberId = data.profile.id;
  const refresh = () => void reload();
  const moduleLabel = MEMBER_MODULES.find((m) => m.id === activeModule)?.label;

  const renderModule = () => {
    switch (activeModule) {
      case 'central': return <MemberCentral memberId={memberId} />;
      case 'details': return <MemberDetailsTab data={data} onUpdated={refresh} />;
      case 'linked': return <LinkedMembersTab memberId={memberId} onChanged={refresh} onOpenMember={onOpenMember} />;
      case 'cards': return <MembershipCardsTab memberId={memberId} tierName={data.tier.tierName} onChanged={refresh} />;
      case 'balance': return <BalanceTab key={data.balances.spendablePoints} memberId={memberId} />;
      case 'transactions': return <TransactionsTab key={data.counts.transactions} memberId={memberId} currency={data.currency} />;
      case 'vouchers': return <VouchersTab memberId={memberId} />;
      case 'offers': return <OffersTab key={data.tier.tierName} memberId={memberId} data={data} />;
      case 'bookings': return <BookingsTab memberId={memberId} currency={data.currency} onChanged={refresh} />;
      case 'services': return <ServicesTab memberId={memberId} onChanged={refresh} onAdjust={() => setDialog('adjust')} refreshKey={servicesRefreshKey} />;
      case 'activity': return <BitsExplorer memberId={memberId} />;
      case 'kpis': return <KpisTab key={data.counts.transactions} memberId={memberId} data={data} />;
    }
  };

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-500">Member Portal / {moduleLabel}</div>
          <h2 className="text-lg font-semibold text-white">{displayName(data.profile)}</h2>
          <div className="text-xs text-slate-400">
            Member ID <span className="font-mono text-slate-300">{data.profile.externalUserId}</span>
            {data.programName && <> · {data.programName}</>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{data.profile.status}</Badge>
          <Badge tone="amber">{data.tier.tierName}</Badge>
          <span className="text-sm font-semibold text-emerald-300">{fmtNum(data.balances.spendablePoints)} pts</span>
        </div>
        {/* Sidebar is hidden below lg, so expose module switching here. */}
        <select value={activeModule} onChange={(e) => setActiveModule(e.target.value as MemberModule)} className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white lg:hidden">
          {MEMBER_MODULES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </section>

      {renderModule()}

      {dialog === 'adjust' && (
        <PointAdjustmentDialog
          data={data}
          onClose={() => setDialog(null)}
          onDone={() => {
            setDialog(null);
            setServicesRefreshKey((k) => k + 1);
            refresh();
          }}
        />
      )}
      {dialog === 'tier' && (
        <TierOverrideDialog
          data={data}
          onClose={() => setDialog(null)}
          onDone={(updated) => {
            setDialog(null);
            setData(updated);
            setServicesRefreshKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
};
