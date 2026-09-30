import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, Bell, ChevronLeft, ChevronRight, Clock3, Crown, Gift, MoreHorizontal, RefreshCw, SlidersHorizontal, Tag, TrendingUp, Undo2, UserPlus } from 'lucide-react';
import { api, BitDetailDto, BitDto, BitListRowDto, BitTypeOption, SponsorDto } from '../api/client';
import { useReward } from '../context/RewardContext';

type BitFilters = {
  memberId: string;
  bitType: string;
  category: string[];
  status: string[];
  source: string;
  pointsAction: string[];
  from: string;
  to: string;
};

const emptyFilters: BitFilters = {
  memberId: '',
  bitType: '',
  category: [],
  status: [],
  source: '',
  pointsAction: [],
  from: '',
  to: '',
};

const dateLabel = (value: string) => new Date(value).toLocaleString();
const localDateToIso = (value: string) => value ? new Date(value).toISOString() : undefined;
const signedPoints = (value: number) => `${value > 0 ? '+' : ''}${value.toLocaleString()}`;

const CATEGORY_MARKS: Record<string, { icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  ACCRUAL: { icon: TrendingUp, tone: 'text-sky-300 bg-sky-400/10' },
  COMMERCIAL: { icon: TrendingUp, tone: 'text-sky-300 bg-sky-400/10' },
  REDEMPTION: { icon: Gift, tone: 'text-cyan-300 bg-cyan-400/10' },
  PRIVILEGE: { icon: Crown, tone: 'text-amber-300 bg-amber-400/10' },
  DEAL: { icon: Tag, tone: 'text-emerald-300 bg-emerald-400/10' },
  ENROLLMENT: { icon: UserPlus, tone: 'text-orange-300 bg-orange-400/10' },
  LIFECYCLE: { icon: UserPlus, tone: 'text-orange-300 bg-orange-400/10' },
  PROFILE_UPDATE: { icon: UserPlus, tone: 'text-orange-300 bg-orange-400/10' },
  ENGAGEMENT: { icon: Activity, tone: 'text-lime-300 bg-lime-400/10' },
  SERVICE: { icon: Bell, tone: 'text-purple-300 bg-purple-400/10' },
  EXPIRATION: { icon: Clock3, tone: 'text-red-300 bg-red-400/10' },
  CANCELLATION: { icon: Undo2, tone: 'text-slate-300 bg-slate-400/10' },
  TIER_CHANGE: { icon: Activity, tone: 'text-lime-300 bg-lime-400/10' },
};

export const BitsExplorer: React.FC<{ memberId?: number }> = ({ memberId }) => {
  const { selectedBusinessId } = useReward();
  const [types, setTypes] = useState<BitTypeOption[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [sponsors, setSponsors] = useState<SponsorDto[]>([]);
  const [sponsorSearch, setSponsorSearch] = useState('');
  const [draftFilters, setDraftFilters] = useState<BitFilters>(emptyFilters);
  const [filters, setFilters] = useState<BitFilters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [bits, setBits] = useState<BitListRowDto[]>([]);
  const [selectedBitId, setSelectedBitId] = useState<number | null>(null);
  const [detail, setDetail] = useState<BitDetailDto | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getBitTypes(), api.getBitCategories()])
      .then(([loadedTypes, loadedCategories]) => {
        if (cancelled) return;
        setTypes(loadedTypes);
        setCategories(loadedCategories);
      })
      .catch((loadError: any) => {
        if (!cancelled) setError(loadError.message || 'Unable to load BIT filters');
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const tenantId = Number(selectedBusinessId || 0);
    const programId = Number(localStorage.getItem('programId') || 0);
    if (!tenantId || !programId) {
      setSponsors([]);
      return;
    }
    api.getSponsors(tenantId, programId)
      .then(setSponsors)
      .catch((loadError: any) => setError(loadError.message || 'Unable to load sponsors'));
  }, [selectedBusinessId]);

  useEffect(() => {
    if (!selectedBusinessId) {
      setBits([]);
      setSelectedBitId(null);
      setTotalItems(0);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    api.getBits({
      memberId: memberId ?? (filters.memberId ? Number(filters.memberId) : undefined),
      type: filters.bitType || undefined,
      category: filters.category.length ? filters.category : undefined,
      sponsorId: sponsors.find((sponsor) => `${sponsor.name} (${sponsor.sponsorCode})`.toLowerCase() === sponsorSearch.trim().toLowerCase() || sponsor.id.toString() === sponsorSearch.trim())?.id,
      status: filters.status.length ? filters.status : undefined,
      source: filters.source || undefined,
      pointsAction: filters.pointsAction.length ? filters.pointsAction : undefined,
      from: localDateToIso(filters.from),
      to: localDateToIso(filters.to),
      page,
      size: 10,
    })
      .then((result) => {
        if (cancelled) return;
        setBits(result.items);
        setTotalPages(result.totalPages);
        setTotalItems(result.totalItems);
        setSelectedBitId((current) => result.items.some((bit) => bit.bitId === current) ? current : result.items[0]?.bitId ?? null);
      })
      .catch((loadError: any) => {
        if (!cancelled) setError(loadError.message || 'Unable to load BIT activity');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedBusinessId, filters, page, memberId, sponsors, sponsorSearch]);

  useEffect(() => {
    if (!selectedBitId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    api.getBitDetail(selectedBitId)
      .then((result) => { if (!cancelled) setDetail(result); })
      .catch((loadError: any) => {
        if (!cancelled) setError(loadError.message || 'Unable to load BIT details');
      })
      .finally(() => { if (!cancelled) setDetailLoading(false); });
    return () => { cancelled = true; };
  }, [selectedBitId]);

  const updateDraft = (key: 'memberId' | 'bitType' | 'source' | 'from' | 'to', value: string) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const updateMultiDraft = (key: 'category' | 'status' | 'pointsAction', event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Array.from(event.target.selectedOptions, (option) => option.value);
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(0);
    setFilters({ ...draftFilters });
  };

  const clearFilters = () => {
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
    setSponsorSearch('');
    setPage(0);
  };

  const openBit = (bitId: number) => {
    setSelectedBitId(bitId);
    setDetailOpen(true);
  };

  const [detailOpen, setDetailOpen] = useState(false);
  const inputClass = 'mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white';

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{memberId ? 'Member Activity' : 'BIT Activity'}</h2>
          <p className="mt-1 text-sm text-slate-400">{totalItems.toLocaleString()} recorded interactions</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!memberId && <div className="relative">
            <input list="bit-sponsors" value={sponsorSearch} onChange={(event) => setSponsorSearch(event.target.value)} placeholder="Search sponsor" aria-label="Search sponsor" className="w-52 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500" />
            <datalist id="bit-sponsors">{sponsors.map((sponsor) => <option key={sponsor.id} value={`${sponsor.name} (${sponsor.sponsorCode})`} />)}</datalist>
          </div>}
          <button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} className={`inline-flex items-center gap-2 rounded border px-3 py-2 text-sm ${filtersOpen ? 'border-cyan-600 bg-cyan-950/40 text-cyan-200' : 'border-slate-700 text-slate-200 hover:bg-slate-800'}`}>
            <SlidersHorizontal className="h-4 w-4" />Filters
          </button>
          <button type="button" onClick={() => setFilters((current) => ({ ...current }))} className="inline-flex items-center gap-2 rounded border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800" title="Reload BIT activity">
            <RefreshCw className="h-4 w-4" />Refresh
          </button>
        </div>
      </header>

      {!selectedBusinessId && <p className="text-sm text-slate-400">Select a tenant to view activity.</p>}

      {filtersOpen && <form onSubmit={applyFilters} className="grid grid-cols-1 gap-3 border-b border-slate-800 pb-4 sm:grid-cols-2 xl:grid-cols-4">
        {!memberId && <label className="text-xs text-slate-400">Member ID<input value={draftFilters.memberId} onChange={(event) => updateDraft('memberId', event.target.value)} inputMode="numeric" className={inputClass} /></label>}
        <label className="text-xs text-slate-400">BIT type
          <select value={draftFilters.bitType} onChange={(event) => updateDraft('bitType', event.target.value)} className={inputClass}>
            <option value="">All types</option>{types.map((type) => <option key={type.type} value={type.type}>{type.label}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-400">BIT source
          <select value={draftFilters.source} onChange={(event) => updateDraft('source', event.target.value)} className={inputClass}>
            <option value="">All sources</option>{['POS', 'APP', 'WEB', 'API', 'BATCH_IMPORT', 'CS_CONSOLE', 'MEMBER_CLAIM', 'SCHEDULED_JOB', 'SYSTEM'].map((source) => <option key={source}>{source}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-400">Date from<input type="datetime-local" value={draftFilters.from} onChange={(event) => updateDraft('from', event.target.value)} className={inputClass} /></label>
        <label className="text-xs text-slate-400">Date to<input type="datetime-local" value={draftFilters.to} onChange={(event) => updateDraft('to', event.target.value)} className={inputClass} /></label>
        <label className="text-xs text-slate-400">BIT categories
          <select multiple value={draftFilters.category} onChange={(event) => updateMultiDraft('category', event)} className={`${inputClass} min-h-24`}>
            {categories.map((category) => <option key={category} value={category}>{category.replaceAll('_', ' ')}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-400">BIT status
          <select multiple value={draftFilters.status} onChange={(event) => updateMultiDraft('status', event)} className={`${inputClass} min-h-24`}>
            {['COMPLETED', 'PROCESSED', 'PENDING', 'FAILED', 'ON_HOLD', 'REVERSED', 'PARTIALLY_REVERSED', 'REJECTED'].map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-400">Points action
          <select multiple value={draftFilters.pointsAction} onChange={(event) => updateMultiDraft('pointsAction', event)} className={`${inputClass} min-h-24`}>
            {['rewarded', 'redeemed', 'expired'].map((action) => <option key={action} value={action}>{action[0].toUpperCase() + action.slice(1)}</option>)}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="rounded bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600">Apply filters</button>
          <button type="button" onClick={clearFilters} className="rounded border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Clear</button>
        </div>
      </form>}

      {error && <p className="inline-flex items-center gap-2 text-sm text-rose-300"><AlertCircle className="h-4 w-4" />{error}</p>}

      <section aria-label="BIT activity results" className="overflow-hidden border-y border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 text-xs text-slate-400">
          <span>{loading ? 'Loading activity…' : `${bits.length} of ${totalItems.toLocaleString()} interactions`}</span>
          <span>Newest first · 10 per page</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] table-fixed text-left text-xs">
            <thead className="bg-slate-900/70 text-[11px] uppercase text-slate-500">
              <tr>
                <th className="w-14 px-3 py-3"><span className="sr-only">Category</span></th>
                <th className="w-[22%] px-3 py-3">Date / BIT ID</th>
                <th className="w-[15%] px-3 py-3">Sponsor</th>
                <th className="w-[13%] px-3 py-3">Member</th>
                <th className="w-[14%] px-3 py-3">BIT Type</th>
                <th className="w-[15%] px-3 py-3">Offer</th>
                <th className="w-[10%] px-3 py-3">Points</th>
                <th className="w-[6%] px-3 py-3" title="Issued voucher count">Earned</th>
                <th className="w-[6%] px-3 py-3" title="No voucher-availment tracking is available yet">Availed</th>
                <th className="w-[8%] px-3 py-3">Status</th>
                <th className="w-12 px-3 py-3"><span className="sr-only">Details</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {bits.map((bit) => {
                const mark = CATEGORY_MARKS[bit.bitCategory] ?? { icon: Activity, tone: 'text-slate-300 bg-slate-400/10' };
                const MarkIcon = mark.icon;
                const failed = ['FAILED', 'VALIDATION_ERROR', 'EXECUTION_ERROR', 'REJECTED'].includes(bit.status);
                const onHold = bit.status === 'ON_HOLD';
                const statusTone = failed ? 'bg-rose-400' : onHold ? 'bg-amber-300' : 'bg-emerald-400';
                return (
                  <tr key={bit.bitId} className="bg-slate-900/30 hover:bg-slate-800/50">
                    <td className="px-3 py-2.5">
                      <span className={`grid h-8 w-8 place-items-center rounded ${mark.tone}`} title={bit.bitCategory.replaceAll('_', ' ')}>
                        <MarkIcon className="h-4 w-4" />
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-slate-100">{dateLabel(bit.interactionDate)}</div>
                      <div className="mt-0.5 truncate text-[10px] text-slate-500" title={bit.bitReference}>ID: {bit.bitReference}</div>
                    </td>
                    <td className="truncate px-3 py-2.5 text-slate-300" title={bit.sponsorName || ''}>{bit.sponsorName || '—'}</td>
                    <td className="truncate px-3 py-2.5 font-mono text-slate-300" title={bit.memberCode}>{bit.memberCode}</td>
                    <td className="truncate px-3 py-2.5 text-slate-200" title={bit.bitTypeLabel}>{bit.bitTypeLabel}</td>
                    <td className="truncate px-3 py-2.5 text-slate-300" title={bit.offerName || ''}>{bit.offerName || '—'}</td>
                    <td className="px-3 py-2.5" title={`Redemption ${signedPoints(bit.redemptionPoints)} · Recognition ${signedPoints(bit.recognitionPoints)}`}>
                      {bit.pointsDelta == null ? <span className="text-slate-500">N/A</span> : <span className={bit.pointsDelta < 0 ? 'text-rose-300' : 'text-emerald-300'}>{signedPoints(bit.pointsDelta)}</span>}
                    </td>
                    <td className="px-3 py-2.5 text-slate-300" title="Issued voucher count">{bit.rewardsEarned}</td>
                    <td className="px-3 py-2.5 text-slate-500" title="Voucher usage is not tracked yet">{bit.rewardsAvailed ?? 'N/A'}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1.5" title={[bit.errorCode, bit.errorMessage].filter(Boolean).join(': ') || bit.status}>
                        <span className={`h-2.5 w-2.5 rounded-full ${statusTone}`} />
                        <span className="text-slate-300">{bit.status}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button type="button" onClick={() => openBit(bit.bitId)} aria-label={`View BIT ${bit.bitId}`} title="View BIT details" className="grid h-8 w-8 place-items-center rounded text-slate-400 hover:bg-slate-700 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && bits.length === 0 && selectedBusinessId && <p className="px-3 py-10 text-center text-sm text-slate-500">No activity matches these filters.</p>}
        </div>
        <div className="flex items-center justify-between px-3 py-2">
          <button type="button" disabled={page <= 0 || loading} onClick={() => setPage((current) => Math.max(0, current - 1))} className="inline-flex items-center gap-1 rounded border border-slate-700 px-2 py-1.5 text-xs text-slate-300 disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" />Previous
          </button>
          <span className="text-xs text-slate-500">Page {totalPages ? page + 1 : 0} of {totalPages}</span>
          <button type="button" disabled={page + 1 >= totalPages || loading} onClick={() => setPage((current) => current + 1)} className="inline-flex items-center gap-1 rounded border border-slate-700 px-2 py-1.5 text-xs text-slate-300 disabled:opacity-40">
            Next<ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {detailOpen && <div role="presentation" className="fixed inset-0 z-50 flex justify-end bg-slate-950/70" onClick={() => setDetailOpen(false)}>
        <section role="dialog" aria-modal="true" aria-label="BIT details" className="h-full w-full max-w-2xl overflow-y-auto border-l border-slate-700 bg-slate-950 p-4 sm:p-6" onClick={(event) => event.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">BIT Details</h3>
            <button type="button" onClick={() => setDetailOpen(false)} className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">Close</button>
          </div>
          {detailLoading && <p className="text-sm text-slate-400">Loading interaction details…</p>}
          {!detailLoading && detail && <BitDetail detail={detail} onOpenBit={openBit} />}
        </section>
      </div>}
    </div>
  );
};

const BitDetail: React.FC<{ detail: BitDetailDto; onOpenBit: (id: number) => void }> = ({ detail, onOpenBit }) => {
  const { bit, ledger, reversals, offers, vouchers } = detail;
  const amount = (value: number) => `${bit.currency ? `${bit.currency} ` : ''}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-5">
      <header className="border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-slate-500">Interaction #{bit.id} · {bit.bitCategory.replaceAll('_', ' ')}</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{bit.bitTypeLabel}</h3>
            <p className="mt-1 break-all text-xs text-slate-400">{bit.bitReference}</p>
          </div>
          <span className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300">{bit.status}</span>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
        <DetailValue label="Member" value={String(bit.memberId)} />
        <DetailValue label="Channel" value={bit.channel} />
        <DetailValue label="Source" value={bit.bitSource || bit.channel} />
        <DetailValue label="Occurred" value={dateLabel(bit.interactionAt)} />
        <DetailValue label="BIT sponsor" value={bit.bitSponsorName || (bit.bitSponsorId ? String(bit.bitSponsorId) : '—')} />
        <DetailValue label="Billing sponsor" value={bit.billingSponsorName || (bit.billingSponsorId ? String(bit.billingSponsorId) : '—')} />
        <DetailValue label="Location / branch" value={[bit.locationId, bit.branchId].filter(Boolean).join(' / ') || '—'} />
      </dl>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Metric label="Gross" value={amount(bit.grossAmount)} />
        <Metric label="Discount" value={amount(bit.discountAmount)} />
        <Metric label="Net" value={amount(bit.netAmount)} />
        <Metric label="Redemption delta" value={signedPoints(bit.redemptionPointsDelta)} />
        <Metric label="Recognition delta" value={signedPoints(bit.recognitionPointsDelta)} />
        <Metric label="Offers" value={bit.appliedOfferIds.length ? bit.appliedOfferIds.join(', ') : '—'} />
      </div>

      {bit.errorCode && <div className="border-l-2 border-rose-400 pl-3">
        <p className="text-xs font-semibold text-rose-300">{bit.errorCode}</p>
        <p className="mt-1 text-sm text-slate-300">{bit.errorMessage || bit.description || 'The interaction was not processed.'}</p>
      </div>}
      {bit.description && <p className="text-sm text-slate-300">{bit.description}</p>}

      <section>
        <h4 className="mb-2 text-sm font-semibold text-slate-200">Linked ledger entries</h4>
        {ledger.length ? <div className="overflow-x-auto border-y border-slate-800">
          {ledger.map((entry) => (
            <div key={entry.transactionId} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-slate-800/70 py-2 text-xs last:border-0 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
              <span className="text-slate-200">{entry.transactionType} · #{entry.transactionId}</span>
              <span className="text-slate-300">{signedPoints(entry.points)} pts</span>
              <span className="text-slate-400">{entry.status}</span>
              <span className="text-slate-500">{dateLabel(entry.createdAt)}</span>
            </div>
          ))}
        </div> : <p className="text-xs text-slate-500">No reward ledger entry is linked to this interaction.</p>}
      </section>

      <section>
        <h4 className="mb-2 text-sm font-semibold text-slate-200">Applied offers</h4>
        {offers.length ? <div className="divide-y divide-slate-800 border-y border-slate-800">
          {offers.map((offer) => <div key={offer.id} className="flex items-center justify-between gap-3 py-2 text-xs">
            <span className="text-slate-200">{offer.name}</span><span className="text-slate-500">{offer.offerCode} · {offer.category}</span>
          </div>)}
        </div> : <p className="text-xs text-slate-500">No offer was applied to this interaction.</p>}
      </section>

      {vouchers.length > 0 && <section>
        <h4 className="mb-2 text-sm font-semibold text-slate-200">Issued vouchers</h4>
        <div className="divide-y divide-slate-800 border-y border-slate-800">
          {vouchers.map((voucher) => <div key={voucher.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs">
            <span className="font-mono text-slate-200">{voucher.voucherCode}</span><span className="text-slate-400">{voucher.status}{voucher.expiresAt ? ` · expires ${dateLabel(voucher.expiresAt)}` : ''}</span>
          </div>)}
        </div>
      </section>}

      {reversals.length > 0 && <section>
        <h4 className="mb-2 text-sm font-semibold text-slate-200">Reversal interactions</h4>
        <div className="divide-y divide-slate-800 border-y border-slate-800">
          {reversals.map((reversal) => (
            <button key={reversal.id} type="button" onClick={() => onOpenBit(reversal.id)} className="flex w-full items-center justify-between gap-3 py-2 text-left text-xs hover:bg-slate-800/50">
              <span className="text-slate-200">#{reversal.id} · {reversal.status} · {reversal.bitReference}</span>
              <span className="shrink-0 text-rose-300">{signedPoints(reversal.redemptionPointsDelta)} pts</span>
            </button>
          ))}
        </div>
      </section>}

      {bit.payload && <details className="border-t border-slate-800 pt-3">
        <summary className="cursor-pointer text-xs font-medium text-slate-400">Interaction payload</summary>
        <pre className="mt-2 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-300">{JSON.stringify(bit.payload, null, 2)}</pre>
      </details>}
    </div>
  );
};

const DetailValue: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-xs text-slate-500">{label}</dt>
    <dd className="mt-0.5 truncate text-slate-200" title={value}>{value}</dd>
  </div>
);

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="min-w-0 border-l-2 border-slate-700 pl-3">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-1 truncate text-sm font-medium text-slate-100" title={value}>{value}</p>
  </div>
);