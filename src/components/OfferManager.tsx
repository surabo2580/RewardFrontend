import React, { useEffect, useState } from 'react';
import { AlertCircle, Megaphone, Plus } from 'lucide-react';
import { api, OfferDto, SponsorDto, SponsorLocationDto } from '../api/client';
import { useReward } from '../context/RewardContext';

const localDateTime = (date: Date) => date.toISOString().slice(0, 16);

export const OfferManager: React.FC = () => {
  const { selectedBusinessId } = useReward();
  const tenantId = Number(selectedBusinessId || 0);
  const programId = Number(localStorage.getItem('programId') || 0);
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [sponsors, setSponsors] = useState<SponsorDto[]>([]);
  const [locations, setLocations] = useState<SponsorLocationDto[]>([]);
  const [scope, setScope] = useState<OfferDto['scope']>('PROGRAM');
  const [sponsorId, setSponsorId] = useState(0);
  const [locationId, setLocationId] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [offerType, setOfferType] = useState<OfferDto['offerType']>('MULTIPLIER');
  const [multiplier, setMultiplier] = useState('2');
  const [bonusPoints, setBonusPoints] = useState('0');
  const [minSpend, setMinSpend] = useState('0');
  const [minTierRank, setMinTierRank] = useState('0');
  const [eligibleDays, setEligibleDays] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [startDate, setStartDate] = useState(localDateTime(new Date()));
  const [endDate, setEndDate] = useState(localDateTime(new Date(Date.now() + 30 * 86_400_000)));
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadOffers = async () => {
    if (!tenantId || !programId) return;
    const [loadedOffers, loadedSponsors] = await Promise.all([api.getOffers(tenantId, programId), api.getSponsors(tenantId, programId)]);
    setOffers(loadedOffers);
    setSponsors(loadedSponsors);
  };

  useEffect(() => {
    void loadOffers().catch((loadError: any) => setError(loadError.message || 'Unable to load offers.'));
  }, [tenantId, programId]);

  useEffect(() => {
    if (!tenantId || !sponsorId) {
      setLocations([]);
      setLocationId(0);
      return;
    }
    void api.getLocations(tenantId, sponsorId).then(setLocations).catch((loadError: any) => setError(loadError.message || 'Unable to load locations.'));
  }, [tenantId, sponsorId]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!tenantId || !programId || (scope !== 'PROGRAM' && !sponsorId) || (scope === 'LOCATION' && !locationId)) {
      setError('Select the required tenant, program, sponsor, and location scope.');
      return;
    }
    setIsSaving(true);
    try {
      await api.createOffer({
        tenantId,
        programId,
        name: name.trim(),
        description: description.trim() || null,
        scope,
        sponsorId: scope === 'PROGRAM' ? null : sponsorId,
        locationId: scope === 'LOCATION' ? locationId : null,
        offerType,
        multiplier: offerType === 'BONUS_POINTS' ? 1 : Number(multiplier),
        bonusPoints: offerType === 'MULTIPLIER' ? 0 : Number(bonusPoints),
        minSpend: Number(minSpend),
        minTierRank: Number(minTierRank),
        eligibleDays: eligibleDays.trim() || null,
        maxUsesPerMember: maxUses ? Number(maxUses) : null,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isActive: true,
      });
      setName('');
      setDescription('');
      await loadOffers();
    } catch (saveError: any) {
      setError(saveError.message || 'Unable to create offer.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="border border-slate-800 bg-slate-900 rounded-lg p-5">
        <div className="flex items-center gap-2"><Megaphone className="w-5 h-5 text-cyan-300" /><h2 className="text-xl font-semibold text-white">Campaigns & Offers</h2></div>
        <p className="mt-1 text-sm text-slate-400">Campaigns apply the best eligible multiplier and all eligible bonus points to purchase rewards.</p>
      </section>

      <form onSubmit={handleCreate} className="border border-slate-800 bg-slate-900 rounded-lg p-5 space-y-3">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-white"><Plus className="w-4 h-4 text-cyan-300" />Create Campaign</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <input value={name} onChange={(event) => setName(event.target.value)} className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" placeholder="Campaign name" required />
          <select value={scope} onChange={(event) => { setScope(event.target.value as OfferDto['scope']); setSponsorId(0); }} className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"><option value="PROGRAM">Program-wide</option><option value="SPONSOR">Sponsor</option><option value="LOCATION">Location</option><option value="PARENT">Parent sponsor</option><option value="PARTNER">Partner sponsor</option></select>
          <select value={offerType} onChange={(event) => setOfferType(event.target.value as OfferDto['offerType'])} className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"><option value="MULTIPLIER">Multiplier</option><option value="BONUS_POINTS">Bonus points</option><option value="HYBRID">Multiplier + bonus</option></select>
          {scope !== 'PROGRAM' && <select value={sponsorId} onChange={(event) => setSponsorId(Number(event.target.value))} className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" required><option value={0}>Select sponsor</option>{sponsors.map((sponsor) => <option key={sponsor.id} value={sponsor.id}>{sponsor.name}</option>)}</select>}
          {scope === 'LOCATION' && <select value={locationId} onChange={(event) => setLocationId(Number(event.target.value))} className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" required><option value={0}>Select location</option>{locations.map((location) => <option key={location.id} value={location.id}>{location.locationName}</option>)}</select>}
          {offerType !== 'BONUS_POINTS' && <input value={multiplier} onChange={(event) => setMultiplier(event.target.value)} type="number" min="1" step="0.1" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" placeholder="Multiplier" required />}
          {offerType !== 'MULTIPLIER' && <input value={bonusPoints} onChange={(event) => setBonusPoints(event.target.value)} type="number" min="0" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" placeholder="Bonus points" required />}
          <input value={minSpend} onChange={(event) => setMinSpend(event.target.value)} type="number" min="0" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" placeholder="Minimum spend" />
          <input value={minTierRank} onChange={(event) => setMinTierRank(event.target.value)} type="number" min="0" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" placeholder="Minimum tier rank" />
          <input value={eligibleDays} onChange={(event) => setEligibleDays(event.target.value)} className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" placeholder="Days, e.g. FRIDAY,SATURDAY" />
          <input value={maxUses} onChange={(event) => setMaxUses(event.target.value)} type="number" min="1" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" placeholder="Max uses per member" />
          <input value={startDate} onChange={(event) => setStartDate(event.target.value)} type="datetime-local" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" required />
          <input value={endDate} onChange={(event) => setEndDate(event.target.value)} type="datetime-local" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" required />
        </div>
        <input value={description} onChange={(event) => setDescription(event.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" placeholder="Description (optional)" />
        <button type="submit" disabled={isSaving} className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-60">{isSaving ? 'Creating...' : 'Create Campaign'}</button>
        {error && <p className="inline-flex items-center gap-1.5 text-sm text-rose-400"><AlertCircle className="w-4 h-4" />{error}</p>}
      </form>

      <section className="border border-slate-800 bg-slate-900 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-white">Campaign Library</h3>
        <div className="mt-4 space-y-2">
          {offers.map((offer) => <div key={offer.id} className="rounded-md border border-slate-800 bg-slate-950 p-3"><div className="flex items-center justify-between gap-3"><span className="font-medium text-white">{offer.name}</span><span className="text-xs text-cyan-200">{offer.scope} · {offer.offerType}</span></div><div className="mt-1 text-xs text-slate-400">{offer.multiplier}x multiplier · {offer.bonusPoints} bonus pts · min spend {offer.minSpend}</div><div className="mt-1 text-xs text-slate-500">Active {new Date(offer.startDate).toLocaleDateString()} to {new Date(offer.endDate).toLocaleDateString()}</div></div>)}
          {offers.length === 0 && <p className="text-sm text-slate-400">No campaigns configured for this program.</p>}
        </div>
      </section>
    </div>
  );
};
