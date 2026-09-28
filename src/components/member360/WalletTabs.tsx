import React, { useMemo, useState } from 'react';
import { Clock, Gift, Receipt, Tag, Wallet } from 'lucide-react';
import { api, Member360 } from '../../api/client';
import { Badge, EmptyState, ErrorText, fmtDate, fmtDateTime, fmtNum, inputClass, LoadingState, Panel, StatCard, useAsync } from './ui';

export const BalanceTab: React.FC<{ memberId: number }> = ({ memberId }) => {
  const balance = useAsync(() => api.getMemberBalance(memberId), [memberId]);
  const [showAll, setShowAll] = useState(false);

  if (balance.loading) return <LoadingState />;
  if (balance.error || !balance.data) return <ErrorText message={balance.error || 'Balance unavailable'} />;
  const { balances, lots } = balance.data;
  const visibleLots = showAll ? lots : lots.filter((l) => l.accountType === 'REDEMPTION' && l.entryType === 'CREDIT');
  // FIFO consumption order: soonest expiry first, then oldest earn.
  const fifo = lots
    .filter((l) => l.lotStatus === 'ACTIVE' && l.accountType === 'REDEMPTION')
    .sort((a, b) => (a.expiresAt ? Date.parse(a.expiresAt) : Infinity) - (b.expiresAt ? Date.parse(b.expiresAt) : Infinity) || Date.parse(a.createdAt) - Date.parse(b.createdAt));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Spendable points" value={fmtNum(balances.spendablePoints)} hint="Redemption account" tone="emerald" />
        <StatCard label="Status (recognition) points" value={fmtNum(balances.lifetimeRecognitionPoints)} hint="Drives tier qualification" tone="amber" />
        <StatCard label={`Expiring in ${balances.expiryWarningDays} days`} value={fmtNum(balances.pointsExpiringSoon)} hint={balances.nextExpiryDate ? `Next expiry ${fmtDate(balances.nextExpiryDate)}` : 'No upcoming expiry'} tone="rose" />
        <StatCard label="Lifetime earned / redeemed" value={`${fmtNum(balances.lifetimeEarnedPoints)} / ${fmtNum(balances.redeemedPoints)}`} hint={`Pending ${fmtNum(balances.pendingPoints)}`} tone="cyan" />
      </div>

      <Panel title="Next to be consumed (FIFO)" icon={Clock}>
        {!fifo.length ? <EmptyState message="No active point lots." /> : (
          <div className="flex flex-wrap gap-2">
            {fifo.slice(0, 8).map((lot, i) => (
              <div key={lot.id} className="rounded-md border border-slate-700 bg-slate-800/70 px-3 py-2 text-xs">
                <div className="text-slate-500">#{i + 1} · earned {fmtDate(lot.createdAt)}</div>
                <div className="font-semibold text-emerald-300">{fmtNum(lot.remainingPoints)} pts</div>
                <div className="text-amber-300">{lot.expiresAt ? `expires ${fmtDate(lot.expiresAt)}` : 'never expires'}</div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel
        title="Point Lots & Wallet Ledger"
        icon={Wallet}
        actions={
          <label className="flex items-center gap-1.5 text-xs text-slate-400">
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> Show debits & recognition
          </label>
        }
      >
        {!visibleLots.length ? <EmptyState message="No wallet entries yet." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr><th className="py-2">Date</th><th>Account</th><th>Type</th><th className="text-right">Points</th><th className="text-right">Remaining</th><th>Expires</th><th>Status</th><th>Description</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {visibleLots.map((lot) => (
                  <tr key={lot.id} className="text-slate-200">
                    <td className="py-2 whitespace-nowrap">{fmtDateTime(lot.createdAt)}</td>
                    <td>{lot.accountType}</td>
                    <td className={lot.entryType === 'DEBIT' ? 'text-rose-300' : 'text-emerald-300'}>{lot.entryType}</td>
                    <td className="text-right font-medium">{fmtNum(lot.points)}</td>
                    <td className="text-right">{lot.entryType === 'CREDIT' && lot.accountType === 'REDEMPTION' ? fmtNum(lot.remainingPoints) : '—'}</td>
                    <td className="whitespace-nowrap text-amber-300">{lot.entryType === 'CREDIT' ? (lot.expiresAt ? fmtDate(lot.expiresAt) : 'Never') : '—'}</td>
                    <td><Badge>{lot.lotStatus}</Badge></td>
                    <td className="max-w-xs truncate text-xs text-slate-400" title={lot.description || ''}>{lot.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};

const TX_TONE: Record<string, string> = {
  EARN: 'text-emerald-300', ADJUSTMENT_CREDIT: 'text-emerald-300', REDEEM: 'text-rose-300', REWARD_CLAIM: 'text-rose-300',
  ADJUSTMENT_DEBIT: 'text-rose-300', EXPIRE: 'text-rose-400', REVERSAL: 'text-amber-300',
};

export const TransactionsTab: React.FC<{ memberId: number; currency: string | null }> = ({ memberId, currency }) => {
  const txns = useAsync(() => api.getMemberTransactions(memberId), [memberId]);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const types = useMemo(() => Array.from(new Set((txns.data || []).map((t) => t.transactionType))).sort(), [txns.data]);
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (txns.data || []).filter((t) =>
      (typeFilter === 'ALL' || t.transactionType === typeFilter) &&
      (!q || [t.referenceId, t.eventType, t.sponsorName, t.channel, String(t.id)].some((v) => v?.toLowerCase().includes(q)))
    );
  }, [txns.data, typeFilter, search]);

  return (
    <Panel
      title="Transactions"
      icon={Receipt}
      actions={
        <div className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Reference, sponsor, channel…" className={`${inputClass} !py-1.5 !text-xs w-56`} />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-white">
            <option value="ALL">All types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      }
    >
      {txns.loading ? <LoadingState /> : txns.error ? <ErrorText message={txns.error} /> : !rows.length ? <EmptyState message="No transactions found." /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr><th className="py-2">Date</th><th>Type</th><th>Event</th><th>Sponsor</th><th className="text-right">Amount</th><th className="text-right">Points</th><th className="text-right">Status pts</th><th>Channel</th><th>Reference</th><th>Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((t) => (
                <tr key={t.id} className="text-slate-200">
                  <td className="py-2 whitespace-nowrap">{fmtDateTime(t.createdAt)}</td>
                  <td className={`font-medium ${TX_TONE[t.transactionType] || ''}`}>{t.transactionType}</td>
                  <td>{t.eventType}</td>
                  <td>{t.sponsorName || '—'}</td>
                  <td className="text-right">{t.amount ? `${currency || ''} ${fmtNum(t.amount)}` : '—'}</td>
                  <td className="text-right font-semibold">
                    {fmtNum(t.points)}
                    {t.offerBonusPoints > 0 && <div className="text-[10px] text-cyan-300">+{fmtNum(t.offerBonusPoints)} offer</div>}
                  </td>
                  <td className="text-right text-amber-300">{t.recognitionPoints ? fmtNum(t.recognitionPoints) : '—'}</td>
                  <td className="text-xs">{t.channel}</td>
                  <td className="max-w-[160px] truncate font-mono text-xs text-slate-400" title={t.referenceId || ''}>{t.referenceId || '—'}</td>
                  <td><Badge>{t.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
};

export const VouchersTab: React.FC<{ memberId: number }> = ({ memberId }) => {
  const vouchers = useAsync(() => api.getMemberVouchers(memberId), [memberId]);
  return (
    <Panel title="Vouchers" icon={Gift}>
      {vouchers.loading ? <LoadingState /> : vouchers.error ? <ErrorText message={vouchers.error} /> : !vouchers.data?.length ? (
        <EmptyState message="No vouchers issued to this member." />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {vouchers.data.map((v) => (
            <div key={v.id} className="rounded-lg border border-dashed border-slate-600 bg-slate-800/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{v.offerName || `Offer #${v.offerId}`}</span>
                <Badge>{v.status}</Badge>
              </div>
              <div className="mt-3 rounded bg-slate-950 py-2 text-center font-mono text-lg tracking-widest text-cyan-200">{v.voucherCode}</div>
              <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                <span>Issued {fmtDate(v.issuedAt)}</span>
                <span>Valid till {fmtDate(v.expiresAt)}</span>
              </div>
              {v.offerCategory && <div className="mt-1 text-[11px] text-slate-500">{v.offerCategory}</div>}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
};

export const OffersTab: React.FC<{ memberId: number; data: Member360 }> = ({ memberId, data }) => {
  const offers = useAsync(() => api.getMemberOffers(memberId), [memberId]);
  const [onlyEligible, setOnlyEligible] = useState(false);
  const rows = (offers.data || []).filter((o) => !onlyEligible || o.eligible);

  return (
    <Panel
      title={`Offers for ${data.tier.tierName} member`}
      icon={Tag}
      actions={
        <label className="flex items-center gap-1.5 text-xs text-slate-400">
          <input type="checkbox" checked={onlyEligible} onChange={(e) => setOnlyEligible(e.target.checked)} /> Eligible only
        </label>
      }
    >
      {offers.loading ? <LoadingState /> : offers.error ? <ErrorText message={offers.error} /> : !rows.length ? (
        <EmptyState message="No live offers visible to this member." />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {rows.map((o) => (
            <div key={o.id} className={`rounded-lg border p-4 ${o.eligible ? 'border-emerald-500/30 bg-slate-800/60' : 'border-slate-800 bg-slate-900/60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">{o.name}</div>
                  <div className="font-mono text-[11px] text-slate-500">{o.offerCode}</div>
                </div>
                <div className="flex flex-wrap justify-end gap-1">
                  <Badge tone="blue">{o.category}</Badge>
                  {o.isTargeted && <Badge tone="amber">Targeted (MTO)</Badge>}
                </div>
              </div>
              {o.description && <p className="mt-2 text-xs text-slate-400">{o.description}</p>}
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div><div className="text-slate-500">Benefit</div><div className="text-slate-200">{o.category === 'REWARD' ? `${fmtNum(o.pointsRequired)} pts` : o.bonusPoints ? `+${fmtNum(o.bonusPoints)} pts` : `x${Number(o.multiplier).toFixed(2)}`}</div></div>
                <div><div className="text-slate-500">Uses</div><div className="text-slate-200">{o.usesByMember}{o.maxUsesPerMember ? ` / ${o.maxUsesPerMember}` : ''}</div></div>
                <div><div className="text-slate-500">Valid</div><div className="text-slate-200">{fmtDate(o.startDate)} – {fmtDate(o.endDate)}</div></div>
              </div>
              <div className="mt-3 text-xs">
                {o.eligible ? <span className="text-emerald-300">Eligible</span> : <span className="text-rose-300">Not eligible: {o.ineligibleReason}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
};
