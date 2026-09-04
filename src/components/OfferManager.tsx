import React, { useEffect, useRef, useState } from 'react';
import { Award, Filter, Gift, Plus, Search, ShieldCheck, Star, Tag, Upload } from 'lucide-react';
import { api, OfferDto, SponsorDto } from '../api/client';
import { useReward } from '../context/RewardContext';
import { OfferWizard } from './OfferWizard';

type Category = OfferDto['category'];

const categories: Array<{ id: Category; label: string; icon: typeof Award; color: string }> = [
  { id: 'AWARD', label: 'Award', icon: Award, color: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10' },
  { id: 'REWARD', label: 'Reward', icon: Gift, color: 'text-rose-300 border-rose-500/40 bg-rose-500/10' },
  { id: 'PRIVILEGE', label: 'Privilege', icon: ShieldCheck, color: 'text-amber-300 border-amber-500/40 bg-amber-500/10' },
  { id: 'DEAL', label: 'Deal', icon: Tag, color: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10' },
];

export const OfferManager: React.FC = () => {
  const { selectedBusinessId } = useReward();
  const tenantId = Number(selectedBusinessId || 0);
  const programId = Number(localStorage.getItem('programId') || 0);
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [sponsors, setSponsors] = useState<SponsorDto[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<Category | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<OfferDto['status'] | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [wizardCategory, setWizardCategory] = useState<Category | null>(null);
  const [error, setError] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const campaignFileInput = useRef<HTMLInputElement>(null);
  const voucherFileInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!tenantId || !programId) return;
    const [nextOffers, nextSponsors] = await Promise.all([api.getOffers(tenantId, programId), api.getSponsors(tenantId, programId)]);
    setOffers(nextOffers);
    setSponsors(nextSponsors);
  };

  useEffect(() => { void load().catch((loadError: any) => setError(loadError.message || 'Unable to load campaigns.')); }, [tenantId, programId]);

  const updateStatus = async (offer: OfferDto) => {
    const nextStatus: OfferDto['status'] = offer.status === 'LAUNCHED' ? 'PAUSED' : 'LAUNCHED';
    try { await api.updateOfferStatus(offer.id, nextStatus); await load(); } catch (updateError: any) { setError(updateError.message || 'Unable to update campaign.'); }
  };

  const toggleFeatured = async (offer: OfferDto) => {
    try { await api.toggleOfferFeatured(offer.id); await load(); } catch (updateError: any) { setError(updateError.message || 'Unable to update campaign.'); }
  };

  const importFile = async (file: File, type: 'campaigns' | 'vouchers') => {
    setError('');
    setImportMessage('');
    try {
      const summary = type === 'campaigns' ? await api.importOfferCampaigns(programId, file) : await api.importOfferVouchers(file);
      await load();
      if (summary.failed) {
        setError(`Imported ${summary.imported}; ${summary.failed} rows failed: ${summary.errors.join(' | ')}`);
      } else {
        setImportMessage(`Imported ${summary.imported} ${type}.`);
      }
    } catch (importError: any) {
      setError(importError.message || 'Unable to import file.');
    }
  };

  const filteredOffers = offers.filter((offer) =>
    (categoryFilter === 'ALL' || offer.category === categoryFilter) &&
    (statusFilter === 'ALL' || offer.status === statusFilter) &&
    (offer.name.toLowerCase().includes(search.toLowerCase()) || offer.offerCode.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">Benevo campaigns</div>
          <h2 className="mt-1 text-2xl font-semibold text-white">Offers workspace</h2>
          <p className="mt-1 text-sm text-slate-400">Create every campaign through the guided flow: offer main, locations, members, KPIs, rules, then preview and launch.</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as OfferDto['status'] | 'ALL')} className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200">
            <option value="ALL">All states</option>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="LAUNCHED">Launched</option>
            <option value="PAUSED">Paused</option>
            <option value="EXPIRED">Expired</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {categories.map(({ id, label, icon: Icon, color }) => (
          <button key={id} type="button" onClick={() => { setError(''); setWizardCategory(id); }} className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-colors hover:bg-slate-800 ${color}`}>
            <Plus className="h-4 w-4" /><Icon className="h-4 w-4" />{label}
          </button>
        ))}
        <input ref={campaignFileInput} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importFile(file, 'campaigns'); event.currentTarget.value = ''; }} />
        <input ref={voucherFileInput} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importFile(file, 'vouchers'); event.currentTarget.value = ''; }} />
        <button type="button" onClick={() => campaignFileInput.current?.click()} className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"><Upload className="h-4 w-4" />Import campaigns</button>
        <button type="button" onClick={() => voucherFileInput.current?.click()} className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"><Upload className="h-4 w-4" />Import vouchers</button>
      </section>

      {importMessage && <p className="text-sm text-emerald-400">{importMessage}</p>}
      {error && <p className="text-sm text-rose-400">{error}</p>}

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {(['ALL', ...categories.map((category) => category.id)] as Array<Category | 'ALL'>).map((category) => (
            <button key={category} type="button" onClick={() => setCategoryFilter(category)} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${categoryFilter === category ? 'bg-cyan-500/15 text-cyan-200' : 'text-slate-400 hover:bg-slate-800'}`}>
              {category === 'ALL' ? 'All campaigns' : category}
            </button>
          ))}
        </div>
        <label className="relative block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or code" className="w-full rounded-md border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 sm:w-64" />
        </label>
      </section>

      <section className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="p-4">Campaign</th>
              <th className="p-4">Category</th>
              <th className="p-4">Scope</th>
              <th className="p-4">Billing</th>
              <th className="p-4">Schedule</th>
              <th className="p-4">State</th>
              <th className="p-4 text-center">Audience</th>
              <th className="p-4 text-center">Featured</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filteredOffers.map((offer) => {
              const category = categories.find((item) => item.id === offer.category) ?? categories[0];
              const Icon = category.icon;
              const billingSponsor = sponsors.find((sponsor) => sponsor.id === offer.billingSponsorId);
              return (
                <tr key={offer.id} className="border-b border-slate-800/70 last:border-0 hover:bg-slate-800/40">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className={`grid h-9 w-9 place-items-center rounded-md border ${category.color}`}><Icon className="h-4 w-4" /></span>
                      <div>
                        <div className="font-medium text-white">{offer.name}</div>
                        <div className="mt-0.5 font-mono text-xs text-slate-500">{offer.offerCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">{offer.category}</td>
                  <td className="p-4 text-slate-300">{offer.scope}</td>
                  <td className="p-4 text-xs text-slate-400">{offer.billingType === 'BIT_SPONSOR' ? 'BIT sponsor' : billingSponsor?.name ?? 'Host sponsor'}</td>
                  <td className="p-4 text-xs text-slate-400">{new Date(offer.startDate).toLocaleDateString()}<br />{new Date(offer.endDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs ${offer.status === 'LAUNCHED' ? 'text-emerald-300' : 'text-slate-400'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${offer.status === 'LAUNCHED' ? 'bg-emerald-400' : 'bg-slate-600'}`} />{offer.status}
                    </span>
                  </td>
                  <td className="p-4 text-center text-xs text-slate-300">{offer.isMto ? `${offer.targetMemberIds?.length ?? 0} targeted` : 'All members'}</td>
                  <td className="p-4 text-center">
                    <button type="button" onClick={() => void toggleFeatured(offer)} title="Toggle featured campaign" className={offer.isFeatured ? 'text-amber-300' : 'text-slate-600 hover:text-slate-300'}>
                      <Star className="h-4 w-4" fill={offer.isFeatured ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button type="button" onClick={() => void updateStatus(offer)} className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800">
                      {offer.status === 'LAUNCHED' ? 'Pause' : 'Launch'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!filteredOffers.length && (
              <tr><td colSpan={9} className="p-8 text-center text-sm text-slate-500">No campaigns yet. Start one with the guided flow above.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {wizardCategory && (
        <OfferWizard
          category={wizardCategory}
          tenantId={tenantId}
          programId={programId}
          sponsors={sponsors}
          onClose={() => setWizardCategory(null)}
          onCreated={load}
        />
      )}
    </div>
  );
};
