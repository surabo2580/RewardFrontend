import React, { useEffect, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { api, BitDetailDto, BitDto, BitTypeOption } from '../api/client';
import { useReward } from '../context/RewardContext';

type BitFilters = {
  memberId: string;
  bitType: string;
  category: string;
  sponsorId: string;
  status: string;
  from: string;
  to: string;
};

const emptyFilters: BitFilters = {
  memberId: '',
  bitType: '',
  category: '',
  sponsorId: '',
  status: '',
  from: '',
  to: '',
};

const dateLabel = (value: string) => new Date(value).toLocaleString();
const localDateToIso = (value: string) => value ? new Date(value).toISOString() : undefined;
const signedPoints = (value: number) => `${value > 0 ? '+' : ''}${value.toLocaleString()}`;

export const BitsExplorer: React.FC = () => {
  const { selectedBusinessId } = useReward();
  const [types, setTypes] = useState<BitTypeOption[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [draftFilters, setDraftFilters] = useState<BitFilters>(emptyFilters);
  const [filters, setFilters] = useState<BitFilters>(emptyFilters);
  const [bits, setBits] = useState<BitDto[]>([]);
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
      memberId: filters.memberId ? Number(filters.memberId) : undefined,
      bitType: filters.bitType || undefined,
      category: filters.category || undefined,
      sponsorId: filters.sponsorId ? Number(filters.sponsorId) : undefined,
      status: filters.status || undefined,
      from: localDateToIso(filters.from),
      to: localDateToIso(filters.to),
      page,
      size: 50,
    })
      .then((result) => {
        if (cancelled) return;
        setBits(result.items);
        setTotalPages(result.totalPages);
        setTotalItems(result.totalItems);
        setSelectedBitId((current) => result.items.some((bit) => bit.id === current) ? current : result.items[0]?.id ?? null);
      })
      .catch((loadError: any) => {
        if (!cancelled) setError(loadError.message || 'Unable to load BIT activity');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedBusinessId, filters, page]);

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

  const updateDraft = (key: keyof BitFilters, value: string) => {
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
    setPage(0);
  };

  const openBit = (bitId: number) => setSelectedBitId(bitId);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Activity Events</h2>
          <p className="mt-1 text-sm text-slate-400">{totalItems.toLocaleString()} recorded interactions</p>
        </div>
        <button
          type="button"
          onClick={() => setFilters((current) => ({ ...current }))}
          className="inline-flex items-center gap-2 rounded border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
          title="Reload BIT activity"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </header>

      {!selectedBusinessId && <p className="text-sm text-slate-400">Select a tenant to view activity.</p>}

      <form onSubmit={applyFilters} className="grid grid-cols-1 gap-3 border-b border-slate-800 pb-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs text-slate-400">Member ID
          <input value={draftFilters.memberId} onChange={(event) => updateDraft('memberId', event.target.value)} inputMode="numeric" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
        </label>
        <label className="text-xs text-slate-400">Interaction type
          <select value={draftFilters.bitType} onChange={(event) => updateDraft('bitType', event.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white">
            <option value="">All types</option>
            {types.map((type) => <option key={type.type} value={type.type}>{type.label}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-400">Category
          <select value={draftFilters.category} onChange={(event) => updateDraft('category', event.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white">
            <option value="">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{category.replaceAll('_', ' ')}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-400">Sponsor ID
          <input value={draftFilters.sponsorId} onChange={(event) => updateDraft('sponsorId', event.target.value)} inputMode="numeric" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
        </label>
        <label className="text-xs text-slate-400">Status
          <select value={draftFilters.status} onChange={(event) => updateDraft('status', event.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white">
            <option value="">All statuses</option>
            {['COMPLETED', 'PENDING', 'REVERSED', 'PARTIALLY_REVERSED', 'REJECTED'].map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-400">From
          <input type="datetime-local" value={draftFilters.from} onChange={(event) => updateDraft('from', event.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
        </label>
        <label className="text-xs text-slate-400">To
          <input type="datetime-local" value={draftFilters.to} onChange={(event) => updateDraft('to', event.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="rounded bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600">Apply</button>
          <button type="button" onClick={clearFilters} className="rounded border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Clear</button>
        </div>
      </form>

      {error && <p className="inline-flex items-center gap-2 text-sm text-rose-300"><AlertCircle className="h-4 w-4" />{error}</p>}

      <div className="grid min-h-[520px] grid-cols-1 gap-0 border-y border-slate-800 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.5fr)]">
        <section className="min-w-0 border-b border-slate-800 xl:border-b-0 xl:border-r" aria-label="BIT activity list">
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 text-xs text-slate-400">
            <span>{loading ? 'Loading activity…' : `${bits.length} on this page`}</span>
            <span>Newest first</span>
          </div>
          <div className="max-h-[620px] overflow-auto">
            {bits.map((bit) => (
              <button
                key={bit.id}
                type="button"
                onClick={() => openBit(bit.id)}
                className={`block w-full border-b border-slate-800/80 px-3 py-3 text-left hover:bg-slate-800/60 ${selectedBitId === bit.id ? 'bg-cyan-950/40' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-medium text-slate-100">{bit.bitTypeLabel}</span>
                  <span className="shrink-0 text-[11px] text-slate-400">#{bit.id}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
                  <span>{bit.bitCategory.replaceAll('_', ' ')}</span><span>·</span><span>Member {bit.memberId}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                  <span className="max-w-[70%] truncate text-slate-500">{bit.bitReference}</span>
                  <span className={bit.redemptionPointsDelta < 0 ? 'text-rose-300' : 'text-emerald-300'}>{signedPoints(bit.redemptionPointsDelta)} pts</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">{dateLabel(bit.interactionAt)} · {bit.status}</div>
              </button>
            ))}
            {!loading && bits.length === 0 && selectedBusinessId && <p className="px-3 py-8 text-center text-sm text-slate-500">No activity matches these filters.</p>}
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

        <section className="min-w-0 p-4" aria-label="BIT detail">
          {detailLoading && <p className="text-sm text-slate-400">Loading interaction details…</p>}
          {!detailLoading && detail && <BitDetail detail={detail} onOpenBit={openBit} />}
          {!detailLoading && !detail && <p className="py-10 text-center text-sm text-slate-500">Select an interaction to inspect its ledger and reversal history.</p>}
        </section>
      </div>
    </div>
  );
};

const BitDetail: React.FC<{ detail: BitDetailDto; onOpenBit: (id: number) => void }> = ({ detail, onOpenBit }) => {
  const { bit, ledger, reversals } = detail;
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