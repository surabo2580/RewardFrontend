import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, X, XCircle } from 'lucide-react';
import {
  api,
  MemberDto,
  OfferCreateRequest,
  OfferDto,
  OfferKpiTarget,
  OfferSimulationResponse,
  SponsorDto,
  SponsorLocationDto,
  TierDto,
} from '../api/client';

type Category = OfferDto['category'];

interface OfferWizardProps {
  category: Category;
  tenantId: number;
  programId: number;
  sponsors: SponsorDto[];
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}

const STEPS = ['Offer Main', 'Select Locations', 'Select Members', 'Select KPIs', 'Offer Rules', 'Offer Preview'];

const KPI_CATALOG: Array<{ code: string; label: string; unit: string }> = [
  { code: 'TOTAL_SALES_INFLUENCED', label: 'Total sales influenced by the offer', unit: 'amount' },
  { code: 'TOTAL_COST_INCURRED', label: 'Total cost incurred', unit: 'amount' },
  { code: 'ACTIVATION_RATE', label: 'Activations as a percentage of targeted members', unit: '%' },
  { code: 'DECLINE_RATE', label: 'Declines as a percentage of targeted members', unit: '%' },
  { code: 'UNIQUE_MEMBER_TRANSACTIONS', label: 'Unique member transactions as a percentage of targeted members', unit: '%' },
  { code: 'TRANSACTIONS_INFLUENCED', label: 'No. of transactions influenced', unit: 'count' },
  { code: 'NEW_MEMBER_ACQUISITIONS', label: 'New member acquisitions as a percentage of target members', unit: '%' },
  { code: 'AVERAGE_RATING', label: 'Average rating for the offer', unit: 'rating' },
];

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const toLocalDateTime = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
const toOfferCode = (name: string) => name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 90);

const inputClass = 'w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none';
const labelClass = 'text-xs font-medium text-slate-300';

export const OfferWizard: React.FC<OfferWizardProps> = ({ category, tenantId, programId, sponsors, onClose, onCreated }) => {
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Step 1 - Offer main
  const [name, setName] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<OfferDto['scope']>('PROGRAM');
  const [bitSponsorIds, setBitSponsorIds] = useState<number[]>([]);
  const [billingType, setBillingType] = useState<OfferDto['billingType']>('BILLING_SPONSOR');
  const [billingSponsorId, setBillingSponsorId] = useState<number | null>(null);
  const [memberVisibility, setMemberVisibility] = useState(true);
  const [offerVisibility, setOfferVisibility] = useState<OfferDto['offerVisibility']>('ON_OFFER_LAUNCH');
  const [maxRewardLimitPoints, setMaxRewardLimitPoints] = useState('');
  const [requiresAcceptance, setRequiresAcceptance] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [startDate, setStartDate] = useState(toLocalDateTime(new Date()));
  const [endDate, setEndDate] = useState(toLocalDateTime(new Date(Date.now() + 30 * 86_400_000)));

  // Step 2 - Locations
  const [allLocations, setAllLocations] = useState(true);
  const [locations, setLocations] = useState<SponsorLocationDto[]>([]);
  const [locationIds, setLocationIds] = useState<number[]>([]);

  // Step 3 - Members
  const [members, setMembers] = useState<MemberDto[]>([]);
  const [isMto, setIsMto] = useState(false);
  const [targetMemberIds, setTargetMemberIds] = useState<number[]>([]);
  const [memberSearch, setMemberSearch] = useState('');

  // Step 4 - KPIs
  const [kpis, setKpis] = useState<OfferKpiTarget[]>([]);

  // Step 5 - Rules and actions
  const [tiers, setTiers] = useState<TierDto[]>([]);
  const [minSpend, setMinSpend] = useState('0');
  const [minTierRank, setMinTierRank] = useState('0');
  const [eligibleDays, setEligibleDays] = useState<string[]>([]);
  const [maxUsesPerMember, setMaxUsesPerMember] = useState('1');
  const [maxTotalClaims, setMaxTotalClaims] = useState('');
  const [multiplier, setMultiplier] = useState(category === 'AWARD' ? '2' : '1');
  const [bonusPoints, setBonusPoints] = useState('0');
  const [targetAccount, setTargetAccount] = useState<OfferDto['targetAccount']>('REDEMPTION');
  const [pointsRequired, setPointsRequired] = useState('0');
  const [fulfillmentType, setFulfillmentType] = useState('VOUCHER');
  const [benefitCode, setBenefitCode] = useState('');
  const [targetTierId, setTargetTierId] = useState<number | null>(null);
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('0');
  const [promoCode, setPromoCode] = useState('');

  // Step 6 - Preview
  const [sampleAmount, setSampleAmount] = useState('2000');
  const [sampleTierRank, setSampleTierRank] = useState('0');
  const [simulation, setSimulation] = useState<OfferSimulationResponse | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (!tenantId || !programId) return;
    void Promise.all([api.getMembers(tenantId), api.getTiers(tenantId, programId)])
      .then(([nextMembers, nextTiers]) => {
        setMembers(nextMembers);
        setTiers(nextTiers);
      })
      .catch(() => undefined);
  }, [tenantId, programId]);

  useEffect(() => {
    const sponsorIdsToLoad = bitSponsorIds.length ? bitSponsorIds : sponsors.map((sponsor) => sponsor.id);
    if (!tenantId || !sponsorIdsToLoad.length) {
      setLocations([]);
      return;
    }
    void Promise.all(sponsorIdsToLoad.map((sponsorId) => api.getLocations(tenantId, sponsorId).catch(() => [])))
      .then((results) => setLocations(results.flat()))
      .catch(() => undefined);
  }, [tenantId, bitSponsorIds, sponsors]);

  const hostSponsor = useMemo(() => sponsors.find((sponsor) => sponsor.sponsorType === 'HOST') ?? sponsors[0], [sponsors]);
  const effectiveBillingSponsorId = billingType === 'BILLING_SPONSOR' ? billingSponsorId ?? hostSponsor?.id ?? null : null;
  const filteredMembers = members.filter((member) =>
    `${member.externalUserId} ${member.email ?? ''}`.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const toggle = <T,>(list: T[], value: T): T[] => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  const buildPayload = (status: OfferDto['status']): OfferCreateRequest => ({
    tenantId,
    programId,
    offerCode: (offerCode || toOfferCode(name)).toUpperCase(),
    name: name.trim(),
    subtitle: subtitle.trim() || null,
    description: description.trim() || null,
    category,
    status,
    scope,
    sponsorId: scope === 'PROGRAM' ? null : bitSponsorIds[0] ?? null,
    sponsorIds: bitSponsorIds,
    bitSponsorIds,
    locationId: null,
    locationIds: allLocations ? [] : locationIds,
    allLocations,
    billingType,
    billingSponsorId: effectiveBillingSponsorId,
    memberVisibility,
    offerVisibility,
    maxRewardLimitPoints: maxRewardLimitPoints ? Number(maxRewardLimitPoints) : null,
    requiresAcceptance,
    targetAccount,
    fulfillmentType: category === 'REWARD' ? fulfillmentType : null,
    kpis,
    offerType: category === 'AWARD' ? (Number(bonusPoints) > 0 ? 'HYBRID' : 'MULTIPLIER') : 'BONUS_POINTS',
    multiplier: category === 'AWARD' ? Number(multiplier) : 1,
    bonusPoints: category === 'AWARD' ? Number(bonusPoints) : 0,
    minSpend: Number(minSpend) || 0,
    minTierRank: Number(minTierRank) || 0,
    eligibleDays: eligibleDays.length ? eligibleDays.join(',') : null,
    maxUsesPerMember: maxUsesPerMember ? Number(maxUsesPerMember) : null,
    maxTotalClaims: maxTotalClaims ? Number(maxTotalClaims) : null,
    isMto,
    isFeatured,
    targetMemberIds: isMto ? targetMemberIds : [],
    pointsRequired: category === 'REWARD' ? Number(pointsRequired) : 0,
    benefitCode: category === 'PRIVILEGE' ? benefitCode.trim() || null : null,
    targetTierId: category === 'PRIVILEGE' ? targetTierId : null,
    discountType: category === 'DEAL' ? discountType : null,
    discountValue: category === 'DEAL' ? Number(discountValue) : null,
    promoCode: promoCode.trim() || null,
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
    isActive: status === 'LAUNCHED',
  });

  const validateStep = (index: number): string => {
    if (index === 0) {
      if (!name.trim()) return 'Offer title is required.';
      if (!(offerCode || toOfferCode(name))) return 'Offer code is required.';
      if (scope !== 'PROGRAM' && !bitSponsorIds.length) return 'Select at least one BIT sponsor for this scope.';
      if (new Date(endDate) < new Date(startDate)) return 'Offer end date must not be before the start date.';
      return '';
    }
    if (index === 1) return allLocations || locationIds.length ? '' : 'Select at least one location or enable all locations.';
    if (index === 2) return isMto && !targetMemberIds.length ? 'Targeted offers need at least one member.' : '';
    if (index === 4) {
      if (category === 'AWARD' && Number(multiplier) < 1) return 'Points multiplier must be at least 1.';
      if (category === 'REWARD' && Number(pointsRequired) <= 0) return 'Points required must be greater than zero.';
      if (category === 'PRIVILEGE' && !benefitCode.trim() && !targetTierId) return 'Provide a benefit code or a target tier.';
      if (category === 'DEAL' && Number(discountValue) <= 0) return 'Discount value must be greater than zero.';
      return '';
    }
    return '';
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    setError('');
    try {
      const result = await api.simulateOffer({
        category,
        scope,
        sponsorId: bitSponsorIds[0] ?? null,
        bitSponsorIds,
        allLocations,
        locationIds: allLocations ? [] : locationIds,
        multiplier: Number(multiplier) || 1,
        bonusPoints: Number(bonusPoints) || 0,
        pointsRequired: Number(pointsRequired) || 0,
        discountType: category === 'DEAL' ? discountType : null,
        discountValue: category === 'DEAL' ? Number(discountValue) : null,
        minSpend: Number(minSpend) || 0,
        minTierRank: Number(minTierRank) || 0,
        eligibleDays: eligibleDays.length ? eligibleDays.join(',') : null,
        maxRewardLimitPoints: maxRewardLimitPoints ? Number(maxRewardLimitPoints) : null,
        isMto,
        targetMemberIds,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        sampleAmount: Number(sampleAmount) || 0,
        sampleTierRank: Number(sampleTierRank) || 0,
        sampleSponsorId: bitSponsorIds[0] ?? hostSponsor?.id ?? null,
        sampleLocationId: allLocations ? null : locationIds[0] ?? null,
        sampleMemberId: targetMemberIds[0] ?? null,
        sampleOccurredAt: new Date().toISOString(),
        basePointsPerUnit: 1,
      });
      setSimulation(result);
    } catch (simulationError: any) {
      setError(simulationError.message || 'Unable to simulate this offer.');
    } finally {
      setIsSimulating(false);
    }
  };

  const goNext = () => {
    const stepError = validateStep(step);
    if (stepError) {
      setError(stepError);
      return;
    }
    setError('');
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const submit = async (status: OfferDto['status']) => {
    for (let index = 0; index < STEPS.length; index += 1) {
      const stepError = validateStep(index);
      if (stepError) {
        setError(stepError);
        setStep(index);
        return;
      }
    }
    setIsSaving(true);
    setError('');
    try {
      await api.createOffer(buildPayload(status));
      await onCreated();
      onClose();
    } catch (saveError: any) {
      setError(saveError.message || 'Unable to save this offer.');
    } finally {
      setIsSaving(false);
    }
  };

  const summaryRow = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between gap-4 border-b border-slate-700/40 py-1.5 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="text-right text-slate-200">{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-6 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              Create {category.toLowerCase()} offer
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-300">Guided flow</span>
            </h3>
            <p className="text-xs text-slate-400">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
        </header>

        <nav className="flex gap-2 overflow-x-auto border-b border-slate-800 bg-slate-900/60 px-6 py-3">
          {STEPS.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => index < step && setStep(index)}
              className={`flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition ${
                step === index ? 'bg-cyan-600 text-white' : index < step ? 'bg-slate-800 text-emerald-300' : 'bg-slate-800/40 text-slate-500'
              }`}
            >
              {index + 1}. {label}
            </button>
          ))}
        </nav>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {step === 0 && (
            <div className="space-y-5">
              <section className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Offer title *</label>
                  <input value={name} onChange={(event) => { setName(event.target.value); if (!offerCode) setOfferCode(''); }} placeholder="e.g. Weekend 2x dining points" className={`mt-1 ${inputClass}`} />
                </div>
                <div>
                  <label className={labelClass}>Offer code *</label>
                  <input value={offerCode || toOfferCode(name)} onChange={(event) => setOfferCode(event.target.value.toUpperCase())} placeholder="WKND_2X_DINING" className={`mt-1 ${inputClass} font-mono`} />
                </div>
                <div>
                  <label className={labelClass}>Offer subtitle</label>
                  <input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} className={`mt-1 ${inputClass}`} />
                </div>
                <div>
                  <label className={labelClass}>Offer description</label>
                  <input value={description} onChange={(event) => setDescription(event.target.value)} className={`mt-1 ${inputClass}`} />
                </div>
                <div>
                  <label className={labelClass}>Offer scope</label>
                  <select value={scope} onChange={(event) => setScope(event.target.value as OfferDto['scope'])} className={`mt-1 ${inputClass}`}>
                    <option value="PROGRAM">Program-wide (all BIT sponsors)</option>
                    <option value="SPONSOR">Specific sponsor</option>
                    <option value="LOCATION">Specific location</option>
                    <option value="PARENT">Parent and child sponsors</option>
                    <option value="PARTNER">Partner co-marketing</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Offer visibility</label>
                  <select value={offerVisibility} onChange={(event) => setOfferVisibility(event.target.value as OfferDto['offerVisibility'])} className={`mt-1 ${inputClass}`}>
                    <option value="ON_OFFER_LAUNCH">On offer launch</option>
                    <option value="ON_ACTIVATION">On member activation</option>
                    <option value="HIDDEN">Hidden</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Valid from *</label>
                  <input type="datetime-local" value={startDate} onChange={(event) => setStartDate(event.target.value)} className={`mt-1 ${inputClass}`} />
                </div>
                <div>
                  <label className={labelClass}>Valid until *</label>
                  <input type="datetime-local" value={endDate} onChange={(event) => setEndDate(event.target.value)} className={`mt-1 ${inputClass}`} />
                </div>
              </section>

              <section className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
                <h4 className="text-sm font-semibold text-white">BIT sponsors</h4>
                <p className="mt-0.5 text-xs text-slate-400">Sponsors where the business interaction can happen for this offer.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sponsors.map((sponsor) => (
                    <button
                      key={sponsor.id}
                      type="button"
                      onClick={() => setBitSponsorIds((current) => toggle(current, sponsor.id))}
                      className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                        bitSponsorIds.includes(sponsor.id) ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-200' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {sponsor.name} <span className="text-slate-500">({sponsor.sponsorType})</span>
                    </button>
                  ))}
                  {!sponsors.length && <p className="text-xs text-slate-500">No sponsors configured yet.</p>}
                </div>
              </section>

              <section className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
                <h4 className="text-sm font-semibold text-white">Finance details</h4>
                <div className="mt-3 flex flex-wrap gap-4">
                  {(['BILLING_SPONSOR', 'BIT_SPONSOR'] as const).map((option) => (
                    <label key={option} className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                      <input type="radio" checked={billingType === option} onChange={() => setBillingType(option)} className="accent-cyan-500" />
                      {option === 'BILLING_SPONSOR' ? 'Billing sponsor' : 'BIT sponsor'}
                    </label>
                  ))}
                </div>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {billingType === 'BILLING_SPONSOR' && (
                    <div>
                      <label className={labelClass}>Billing sponsor (funds the points liability)</label>
                      <select value={effectiveBillingSponsorId ?? 0} onChange={(event) => setBillingSponsorId(Number(event.target.value) || null)} className={`mt-1 ${inputClass}`}>
                        <option value={0}>Default to host sponsor</option>
                        {sponsors.map((sponsor) => <option key={sponsor.id} value={sponsor.id}>{sponsor.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className={labelClass}>Maximum reward limit in points</label>
                    <input type="number" min="0" value={maxRewardLimitPoints} onChange={(event) => setMaxRewardLimitPoints(event.target.value)} placeholder="Unlimited if empty" className={`mt-1 ${inputClass}`} />
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  BIT sponsor billing makes the transacting sponsor absorb the cost; billing sponsor billing settles it against the selected funding sponsor.
                </p>
              </section>

              <section className="flex flex-wrap gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={memberVisibility} onChange={(event) => setMemberVisibility(event.target.checked)} className="accent-cyan-500" />
                  Member visibility
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} className="accent-cyan-500" />
                  Featured offer
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={requiresAcceptance} onChange={(event) => setRequiresAcceptance(event.target.checked)} className="accent-cyan-500" />
                  Offer acceptance required
                </label>
              </section>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">Select the locations where this offer is valid.</p>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
                <input type="checkbox" checked={allLocations} onChange={(event) => setAllLocations(event.target.checked)} className="accent-cyan-500" />
                Select all locations
              </label>
              {allLocations ? (
                <div className="grid place-items-center rounded-lg border border-slate-700/60 bg-slate-800/40 py-12 text-center">
                  <p className="text-sm font-semibold text-white">All locations</p>
                  <p className="mt-1 text-xs text-slate-400">Every online and offline location is included in this offer.</p>
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-700/60">
                  {locations.map((location) => (
                    <label key={location.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-800/70 px-4 py-2.5 text-sm last:border-0 hover:bg-slate-800/40">
                      <input type="checkbox" checked={locationIds.includes(location.id)} onChange={() => setLocationIds((current) => toggle(current, location.id))} className="accent-cyan-500" />
                      <span className="text-slate-200">{location.locationName}</span>
                      <span className="font-mono text-xs text-slate-500">{location.locationCode}</span>
                    </label>
                  ))}
                  {!locations.length && <p className="px-4 py-6 text-sm text-slate-500">No locations found for the selected sponsors.</p>}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">Choose who is eligible for this offer.</p>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => { setIsMto(false); setTargetMemberIds([]); }} className={`rounded-md border px-4 py-2 text-sm font-medium ${!isMto ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-200' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}>
                  All members
                </button>
                <button type="button" onClick={() => setIsMto(true)} className={`rounded-md border px-4 py-2 text-sm font-medium ${isMto ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-200' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}>
                  Member targeted offer (MTO)
                </button>
              </div>
              {isMto && (
                <>
                  <input value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} placeholder="Search member id or email" className={inputClass} />
                  <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-700/60">
                    {filteredMembers.map((member) => (
                      <label key={member.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-800/70 px-4 py-2.5 text-sm last:border-0 hover:bg-slate-800/40">
                        <input type="checkbox" checked={targetMemberIds.includes(Number(member.id))} onChange={() => setTargetMemberIds((current) => toggle(current, Number(member.id)))} className="accent-cyan-500" />
                        <span className="text-slate-200">{member.externalUserId}</span>
                        <span className="text-xs text-slate-500">{member.email}</span>
                        <span className="ml-auto text-xs text-slate-500">{member.tier}</span>
                      </label>
                    ))}
                    {!filteredMembers.length && <p className="px-4 py-6 text-sm text-slate-500">No members match this search.</p>}
                  </div>
                  <p className="text-xs text-slate-400">{targetMemberIds.length} member(s) targeted.</p>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">Select the KPIs and target values used to track this offer.</p>
              {KPI_CATALOG.map((kpi) => {
                const selected = kpis.find((item) => item.kpiCode === kpi.code);
                return (
                  <div key={kpi.code} className="flex items-center gap-3 rounded-md border border-slate-700/60 bg-slate-800/30 px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={Boolean(selected)}
                      onChange={() => setKpis((current) => (selected ? current.filter((item) => item.kpiCode !== kpi.code) : [...current, { kpiCode: kpi.code, targetValue: 0 }]))}
                      className="accent-cyan-500"
                    />
                    <span className="flex-1 text-sm text-slate-200">{kpi.label}</span>
                    <input
                      type="number"
                      disabled={!selected}
                      value={selected?.targetValue ?? ''}
                      onChange={(event) => setKpis((current) => current.map((item) => (item.kpiCode === kpi.code ? { ...item, targetValue: Number(event.target.value) } : item)))}
                      placeholder={kpi.unit}
                      className="w-32 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white disabled:opacity-40"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <section className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
                <h4 className="text-sm font-semibold text-white">Qualification conditions</h4>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Minimum transaction spend</label>
                    <input type="number" min="0" value={minSpend} onChange={(event) => setMinSpend(event.target.value)} className={`mt-1 ${inputClass}`} />
                  </div>
                  <div>
                    <label className={labelClass}>Minimum tier</label>
                    <select value={minTierRank} onChange={(event) => setMinTierRank(event.target.value)} className={`mt-1 ${inputClass}`}>
                      <option value="0">All tiers</option>
                      {tiers.map((tier) => <option key={tier.id} value={tier.rank}>{tier.name} (rank {tier.rank}+)</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className={labelClass}>Eligible days (all days when none selected)</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setEligibleDays((current) => toggle(current, day))}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium ${eligibleDays.includes(day) ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-200' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Limit per member</label>
                    <input type="number" min="1" value={maxUsesPerMember} onChange={(event) => setMaxUsesPerMember(event.target.value)} placeholder="Unlimited if empty" className={`mt-1 ${inputClass}`} />
                  </div>
                  <div>
                    <label className={labelClass}>Maximum usage limit</label>
                    <input type="number" min="1" value={maxTotalClaims} onChange={(event) => setMaxTotalClaims(event.target.value)} placeholder="Unlimited if empty" className={`mt-1 ${inputClass}`} />
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
                <h4 className="text-sm font-semibold text-white">Offer actions</h4>
                {category === 'AWARD' && (
                  <div className="mt-3 grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className={labelClass}>Points multiplier</label>
                      <input type="number" min="1" step="0.1" value={multiplier} onChange={(event) => setMultiplier(event.target.value)} className={`mt-1 ${inputClass}`} />
                    </div>
                    <div>
                      <label className={labelClass}>Bonus points</label>
                      <input type="number" min="0" value={bonusPoints} onChange={(event) => setBonusPoints(event.target.value)} className={`mt-1 ${inputClass}`} />
                    </div>
                    <div>
                      <label className={labelClass}>Target account</label>
                      <select value={targetAccount} onChange={(event) => setTargetAccount(event.target.value as OfferDto['targetAccount'])} className={`mt-1 ${inputClass}`}>
                        <option value="REDEMPTION">Redemption</option>
                        <option value="RECOGNITION">Recognition</option>
                        <option value="BOTH">Both</option>
                      </select>
                    </div>
                  </div>
                )}
                {category === 'REWARD' && (
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Spendable points required to claim *</label>
                      <input type="number" min="1" value={pointsRequired} onChange={(event) => setPointsRequired(event.target.value)} className={`mt-1 ${inputClass}`} />
                    </div>
                    <div>
                      <label className={labelClass}>Fulfilment type</label>
                      <select value={fulfillmentType} onChange={(event) => setFulfillmentType(event.target.value)} className={`mt-1 ${inputClass}`}>
                        <option value="VOUCHER">Digital voucher code</option>
                        <option value="PHYSICAL">Physical item or service</option>
                      </select>
                    </div>
                    <p className="text-xs text-slate-500 sm:col-span-2">Points are deducted with FIFO lot accounting and an unissued voucher is assigned on claim.</p>
                  </div>
                )}
                {category === 'PRIVILEGE' && (
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Benefit code</label>
                      <input value={benefitCode} onChange={(event) => setBenefitCode(event.target.value.toUpperCase())} placeholder="AIRPORT_LOUNGE_ACCESS" className={`mt-1 ${inputClass} font-mono`} />
                    </div>
                    <div>
                      <label className={labelClass}>Status match target tier</label>
                      <select value={targetTierId ?? 0} onChange={(event) => setTargetTierId(Number(event.target.value) || null)} className={`mt-1 ${inputClass}`}>
                        <option value={0}>No tier upgrade</option>
                        {tiers.map((tier) => <option key={tier.id} value={tier.id}>{tier.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                {category === 'DEAL' && (
                  <div className="mt-3 grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className={labelClass}>Discount type</label>
                      <select value={discountType} onChange={(event) => setDiscountType(event.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT')} className={`mt-1 ${inputClass}`}>
                        <option value="PERCENTAGE">Percentage off</option>
                        <option value="FIXED_AMOUNT">Fixed amount off</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Discount value</label>
                      <input type="number" min="0" value={discountValue} onChange={(event) => setDiscountValue(event.target.value)} className={`mt-1 ${inputClass}`} />
                    </div>
                    <div>
                      <label className={labelClass}>Promo code</label>
                      <input value={promoCode} onChange={(event) => setPromoCode(event.target.value.toUpperCase())} className={`mt-1 ${inputClass} font-mono`} />
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <section className="rounded-lg border border-slate-700/60 bg-slate-800/50 p-4 text-sm">
                {summaryRow('Offer', <span className="font-semibold text-white">{name} ({(offerCode || toOfferCode(name))})</span>)}
                {summaryRow('Category', <span className="text-cyan-300">{category}</span>)}
                {summaryRow('Scope', scope)}
                {summaryRow('BIT sponsors', bitSponsorIds.length ? sponsors.filter((sponsor) => bitSponsorIds.includes(sponsor.id)).map((sponsor) => sponsor.name).join(', ') : 'All program sponsors')}
                {summaryRow('Billing', billingType === 'BIT_SPONSOR' ? 'BIT sponsor absorbs cost' : sponsors.find((sponsor) => sponsor.id === effectiveBillingSponsorId)?.name ?? 'Host sponsor')}
                {summaryRow('Locations', allLocations ? 'All locations' : `${locationIds.length} selected`)}
                {summaryRow('Audience', isMto ? `${targetMemberIds.length} targeted member(s)` : 'All enrolled members')}
                {summaryRow('KPIs', kpis.length ? kpis.map((kpi) => `${kpi.kpiCode}: ${kpi.targetValue}`).join(', ') : 'None')}
                {summaryRow('Conditions', `Min spend ${minSpend}, tier rank ${minTierRank}+, ${eligibleDays.length ? eligibleDays.join('/') : 'all days'}`)}
                {summaryRow('Limits', `${maxUsesPerMember || 'unlimited'} per member, ${maxTotalClaims || 'unlimited'} total`)}
                {summaryRow('Validity', `${new Date(startDate).toLocaleString()} → ${new Date(endDate).toLocaleString()}`)}
              </section>

              <section className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className={labelClass}>Sample bill amount</label>
                    <input type="number" min="0" value={sampleAmount} onChange={(event) => setSampleAmount(event.target.value)} className={`mt-1 ${inputClass} w-40`} />
                  </div>
                  <div>
                    <label className={labelClass}>Sample tier rank</label>
                    <input type="number" min="0" value={sampleTierRank} onChange={(event) => setSampleTierRank(event.target.value)} className={`mt-1 ${inputClass} w-32`} />
                  </div>
                  <button type="button" onClick={() => void runSimulation()} disabled={isSimulating} className="inline-flex items-center gap-2 rounded-md border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-60">
                    {isSimulating && <Loader2 className="h-4 w-4 animate-spin" />} Run simulation
                  </button>
                </div>
                {simulation && (
                  <div className="mt-4 space-y-2">
                    <p className={`text-sm font-semibold ${simulation.qualifies ? 'text-emerald-300' : 'text-rose-300'}`}>{simulation.summary}</p>
                    {simulation.checks.map((check) => (
                      <div key={check.label} className="flex items-start gap-2 text-xs">
                        {check.passed ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" /> : <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />}
                        <span className="text-slate-300">{check.label}</span>
                        <span className="text-slate-500">{check.detail}</span>
                      </div>
                    ))}
                  </div>
                )}
                {!simulation && <p className="mt-3 text-xs text-slate-500">Dry-run this offer against a sample transaction. No records are written.</p>}
              </section>
            </div>
          )}

          {error && <p className="text-sm text-rose-400">{error}</p>}
        </div>

        <footer className="flex items-center justify-between border-t border-slate-800 bg-slate-950/60 px-6 py-4">
          <button
            type="button"
            onClick={() => { setError(''); setStep((current) => Math.max(current - 1, 0)); }}
            disabled={step === 0}
            className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={goNext} className="inline-flex items-center gap-1 rounded-md bg-cyan-600 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-500">
                Proceed <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button type="button" onClick={() => void submit('DRAFT')} disabled={isSaving} className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-60">
                  Save as draft
                </button>
                <button type="button" onClick={() => void submit('LAUNCHED')} disabled={isSaving} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Start offer
                </button>
              </>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
