import React, { useEffect, useRef, useState } from 'react';
import { Award, Filter, Gift, Megaphone, Plus, Search, ShieldCheck, Star, Tag, Upload } from 'lucide-react';
import { api, OfferDto, SponsorDto } from '../api/client';
import { useReward } from '../context/RewardContext';

type Category = OfferDto['category'];

const categories: Array<{ id: Category; label: string; icon: typeof Award; color: string }> = [
  { id: 'AWARD', label: 'Award', icon: Award, color: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10' },
  { id: 'REWARD', label: 'Reward', icon: Gift, color: 'text-rose-300 border-rose-500/40 bg-rose-500/10' },
  { id: 'PRIVILEGE', label: 'Privilege', icon: ShieldCheck, color: 'text-amber-300 border-amber-500/40 bg-amber-500/10' },
  { id: 'DEAL', label: 'Deal', icon: Tag, color: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10' },
];

const toLocalDateTime = (date: Date) => date.toISOString().slice(0, 16);
const offerCode = (name: string) => name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);

export const OfferManager: React.FC = () => {
  const { selectedBusinessId } = useReward();
  const tenantId = Number(selectedBusinessId || 0);
  const programId = Number(localStorage.getItem('programId') || 0);
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [sponsors, setSponsors] = useState<SponsorDto[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<Category | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<OfferDto['status'] | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [creatingCategory, setCreatingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [scope, setScope] = useState<OfferDto['scope']>('PROGRAM');
  const [sponsorId, setSponsorId] = useState(0);
  const [multiplier, setMultiplier] = useState('2');
  const [bonusPoints, setBonusPoints] = useState('0');
  const [pointsRequired, setPointsRequired] = useState('0');
  const [benefitCode, setBenefitCode] = useState('');
  const [discountValue, setDiscountValue] = useState('0');
  const [promoCode, setPromoCode] = useState('');
  const [isMto, setIsMto] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [startDate, setStartDate] = useState(toLocalDateTime(new Date()));
  const [endDate, setEndDate] = useState(toLocalDateTime(new Date(Date.now() + 30 * 86_400_000)));
  const [error, setError] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const campaignFileInput = useRef<HTMLInputElement>(null);
  const voucherFileInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!tenantId || !programId) return;
    const [nextOffers, nextSponsors] = await Promise.all([api.getOffers(tenantId, programId), api.getSponsors(tenantId, programId)]);
    setOffers(nextOffers);
    setSponsors(nextSponsors);
  };

  useEffect(() => { void load().catch((loadError: any) => setError(loadError.message || 'Unable to load campaigns.')); }, [tenantId, programId]);

  const openCreate = (category: Category) => {
    setCreatingCategory(category);
    setName('');
    setScope('PROGRAM');
    setSponsorId(0);
    setMultiplier(category === 'AWARD' ? '2' : '1');
    setBonusPoints('0');
    setPointsRequired('0');
    setBenefitCode('');
    setDiscountValue('0');
    setPromoCode('');
    setIsMto(false);
    setIsFeatured(false);
    setError('');
  };

  const createOffer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!creatingCategory || !tenantId || !programId || !name.trim()) return;
    if (scope !== 'PROGRAM' && !sponsorId) { setError('Choose a sponsor for this campaign scope.'); return; }
    const targetMemberId = isMto ? Number(window.prompt('Enter the numeric Member ID to target with this campaign.')) : 0;
    if (isMto && (!Number.isInteger(targetMemberId) || targetMemberId <= 0)) { setError('A valid numeric Member ID is required for a targeted campaign.'); return; }
    setIsSaving(true);
    setError('');
    try {
      await api.createOffer({
        tenantId, programId, offerCode: offerCode(name), name: name.trim(), description: null, category: creatingCategory,
        status: 'DRAFT', scope, sponsorId: scope === 'PROGRAM' ? null : sponsorId, sponsorIds: scope === 'PROGRAM' ? [] : [sponsorId], locationId: null,
        offerType: creatingCategory === 'AWARD' ? 'HYBRID' : 'BONUS_POINTS', multiplier: Number(multiplier), bonusPoints: Number(bonusPoints),
        minSpend: 0, minTierRank: 0, eligibleDays: null, maxUsesPerMember: null, maxTotalClaims: null,
        isMto, isFeatured, pointsRequired: Number(pointsRequired), benefitCode: benefitCode.trim() || null, targetTierId: null,
        discountType: creatingCategory === 'DEAL' ? 'FIXED_AMOUNT' : null, discountValue: creatingCategory === 'DEAL' ? Number(discountValue) : null,
        promoCode: promoCode.trim() || null, targetMemberIds: isMto ? [targetMemberId] : [], startDate: new Date(startDate).toISOString(), endDate: new Date(endDate).toISOString(), isActive: false,
      });
      setCreatingCategory(null);
      await load();
    } catch (saveError: any) { setError(saveError.message || 'Unable to create campaign.'); } finally { setIsSaving(false); }
  };

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
      const summary = type === 'campaigns'
        ? await api.importOfferCampaigns(programId, file)
        : await api.importOfferVouchers(file);
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
  const activeCategory = categories.find((category) => category.id === creatingCategory);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div><div className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">Benevo campaigns</div><h2 className="mt-1 text-2xl font-semibold text-white">Offers workspace</h2><p className="mt-1 text-sm text-slate-400">Manage earning incentives, rewards, member privileges, and checkout deals.</p></div>
        <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-slate-500" /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as OfferDto['status'] | 'ALL')} className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"><option value="ALL">All states</option><option value="DRAFT">Draft</option><option value="SCHEDULED">Scheduled</option><option value="LAUNCHED">Launched</option><option value="PAUSED">Paused</option><option value="EXPIRED">Expired</option><option value="ARCHIVED">Archived</option></select></div>
      </section>

      <section className="flex flex-wrap gap-2">
        {categories.map(({ id, label, icon: Icon, color }) => <button key={id} type="button" onClick={() => openCreate(id)} className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-colors hover:bg-slate-800 ${color}`}><Plus className="w-4 h-4" /><Icon className="w-4 h-4" />{label}</button>)}
        <input ref={campaignFileInput} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importFile(file, 'campaigns'); event.currentTarget.value = ''; }} />
        <input ref={voucherFileInput} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importFile(file, 'vouchers'); event.currentTarget.value = ''; }} />
        <button type="button" onClick={() => campaignFileInput.current?.click()} className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"><Upload className="w-4 h-4" />Import campaigns</button>
        <button type="button" onClick={() => voucherFileInput.current?.click()} className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"><Upload className="w-4 h-4" />Import vouchers</button>
      </section>

      {importMessage && <p className="text-sm text-emerald-400">{importMessage}</p>}
      {error && !creatingCategory && <p className="text-sm text-rose-400">{error}</p>}

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-1">{(['ALL', ...categories.map((category) => category.id)] as Array<Category | 'ALL'>).map((category) => <button key={category} type="button" onClick={() => setCategoryFilter(category)} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${categoryFilter === category ? 'bg-cyan-500/15 text-cyan-200' : 'text-slate-400 hover:bg-slate-800'}`}>{category === 'ALL' ? 'All campaigns' : category}</button>)}</div><label className="relative block"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or code" className="w-full rounded-md border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 sm:w-64" /></label></section>

      <section className="overflow-x-auto border border-slate-800 bg-slate-900 rounded-lg"><table className="w-full min-w-[860px] text-left text-sm"><thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-4">Campaign</th><th className="p-4">Category</th><th className="p-4">Scope</th><th className="p-4">Schedule</th><th className="p-4">State</th><th className="p-4 text-center">MTO</th><th className="p-4 text-center">Featured</th><th className="p-4"></th></tr></thead><tbody>{filteredOffers.map((offer) => { const category = categories.find((item) => item.id === offer.category)!; const Icon = category.icon; return <tr key={offer.id} className="border-b border-slate-800/70 last:border-0 hover:bg-slate-800/40"><td className="p-4"><div className="flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-md border ${category.color}`}><Icon className="w-4 h-4" /></span><div><div className="font-medium text-white">{offer.name}</div><div className="mt-0.5 font-mono text-xs text-slate-500">{offer.offerCode}</div></div></div></td><td className="p-4 text-slate-300">{offer.category}</td><td className="p-4 text-slate-300">{offer.scope}</td><td className="p-4 text-xs text-slate-400">{new Date(offer.startDate).toLocaleDateString()}<br />{new Date(offer.endDate).toLocaleDateString()}</td><td className="p-4"><span className={`inline-flex items-center gap-1.5 text-xs ${offer.status === 'LAUNCHED' ? 'text-emerald-300' : 'text-slate-400'}`}><span className={`h-1.5 w-1.5 rounded-full ${offer.status === 'LAUNCHED' ? 'bg-emerald-400' : 'bg-slate-600'}`} />{offer.status}</span></td><td className="p-4 text-center text-xs text-slate-300">{offer.isMto ? 'Targeted' : 'All members'}</td><td className="p-4 text-center"><button type="button" onClick={() => void toggleFeatured(offer)} title="Toggle featured campaign" className={offer.isFeatured ? 'text-amber-300' : 'text-slate-600 hover:text-slate-300'}><Star className={`mx-auto w-4 h-4 ${offer.isFeatured ? 'fill-current' : ''}`} /></button></td><td className="p-4 text-right"><button type="button" onClick={() => void updateStatus(offer)} className="rounded-md border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800">{offer.status === 'LAUNCHED' ? 'Pause' : 'Launch'}</button></td></tr>; })}</tbody></table>{filteredOffers.length === 0 && <p className="p-8 text-center text-sm text-slate-400">No campaigns match the current view.</p>}</section>

      {creatingCategory && activeCategory && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"><form onSubmit={createOffer} className="w-full max-w-2xl rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl"><div className="flex items-center gap-2"><activeCategory.icon className={`w-5 h-5 ${activeCategory.color.split(' ')[0]}`} /><h3 className="text-lg font-semibold text-white">Create {activeCategory.label} campaign</h3></div><div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2"><input value={name} onChange={(event) => setName(event.target.value)} className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white sm:col-span-2" placeholder="Campaign name" required /><select value={scope} onChange={(event) => setScope(event.target.value as OfferDto['scope'])} className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"><option value="PROGRAM">Program-wide</option><option value="SPONSOR">Sponsor</option></select>{scope !== 'PROGRAM' && <select value={sponsorId} onChange={(event) => setSponsorId(Number(event.target.value))} className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"><option value={0}>Choose sponsor</option>{sponsors.map((sponsor) => <option key={sponsor.id} value={sponsor.id}>{sponsor.name}</option>)}</select>}{creatingCategory === 'AWARD' && <><input value={multiplier} onChange={(event) => setMultiplier(event.target.value)} type="number" min="1" step="0.1" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" placeholder="Points multiplier" /><input value={bonusPoints} onChange={(event) => setBonusPoints(event.target.value)} type="number" min="0" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" placeholder="Bonus points" /></>}{creatingCategory === 'REWARD' && <input value={pointsRequired} onChange={(event) => setPointsRequired(event.target.value)} type="number" min="0" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" placeholder="Points required" />}{creatingCategory === 'PRIVILEGE' && <input value={benefitCode} onChange={(event) => setBenefitCode(event.target.value)} className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" placeholder="Benefit code, e.g. LOUNGE_ACCESS" />}{creatingCategory === 'DEAL' && <><input value={discountValue} onChange={(event) => setDiscountValue(event.target.value)} type="number" min="0" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" placeholder="Discount value" /><input value={promoCode} onChange={(event) => setPromoCode(event.target.value)} className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" placeholder="Promo code" /></>}<input value={startDate} onChange={(event) => setStartDate(event.target.value)} type="datetime-local" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" required /><input value={endDate} onChange={(event) => setEndDate(event.target.value)} type="datetime-local" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" required /></div><div className="mt-4 flex gap-5 text-sm text-slate-300"><label className="flex items-center gap-2"><input type="checkbox" checked={isMto} onChange={(event) => setIsMto(event.target.checked)} />Member targeted</label><label className="flex items-center gap-2"><input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} />Featured</label></div>{isMto && <p className="mt-2 text-xs text-amber-300">Member targets are configured through the campaign API in this first release.</p>}{error && <p className="mt-3 text-sm text-rose-400">{error}</p>}<div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setCreatingCategory(null)} className="rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">Cancel</button><button type="submit" disabled={isSaving} className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-60">{isSaving ? 'Creating...' : 'Save draft'}</button></div></form></div>}
    </div>
  );
};
